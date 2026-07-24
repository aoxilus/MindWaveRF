/**
 * MindWave RF dongle probe sandbox
 * Usage:
 *   node sandbox/rf-probe.mjs [COMx]
 * Resolves serialport from repo root package.json.
 */
import { createRequire } from 'module'
import { createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const rootPkg = join(__dir, '..', 'package.json')
const require = createRequire(rootPkg)
const { SerialPort } = require('serialport')

const logPath = join(__dir, 'last-probe.log')
const log = createWriteStream(logPath, { flags: 'w' })
const out = (s) => {
  console.log(s)
  log.write(s + '\n')
}

const RF = {
  DISCONNECT: Buffer.from([0xc1]),
  AUTO_CONNECT: Buffer.from([0xc2]),
  // connect to headset id 0x0000 / broadcast-ish attempts
  CONNECT_0000: Buffer.from([0xc0, 0x00, 0x00]),
  CONNECT_FFFF: Buffer.from([0xc0, 0xff, 0xff]),
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function setLines(port, dtr, rts) {
  return new Promise((resolve) => port.set({ dtr, rts }, () => resolve()))
}

async function pulse(port) {
  await setLines(port, false, false)
  await sleep(200)
  await setLines(port, true, true)
  await sleep(300)
}

async function open(path, baud) {
  const port = new SerialPort({ path, baudRate: baud, autoOpen: false })
  await new Promise((resolve, reject) => {
    port.open((err) => (err ? reject(err) : resolve()))
  })
  return port
}

function summarize(buf) {
  const aa = [...buf].filter((b) => b === 0xaa).length
  const sync = buf.includes(0xaa) && buf.includes(0xaa)
  let thinkgearSync = false
  for (let i = 0; i < buf.length - 1; i++) {
    if (buf[i] === 0xaa && buf[i + 1] === 0xaa) {
      thinkgearSync = true
      break
    }
  }
  return {
    bytes: buf.length,
    aa,
    thinkgearSync,
    headHex: buf.subarray(0, Math.min(48, buf.length)).toString('hex'),
  }
}

async function runCase(path, baud, label, sequence) {
  out(`\n=== ${label} @ ${path} ${baud} ===`)
  let port
  try {
    port = await open(path, baud)
  } catch (e) {
    out(`OPEN FAIL: ${e.message}`)
    return { label, ok: false, err: e.message }
  }

  const chunks = []
  port.on('data', (c) => chunks.push(Buffer.from(c)))

  try {
    await sequence(port)
    await sleep(12000)
  } finally {
    await new Promise((r) => port.close(() => r()))
  }

  const all = Buffer.concat(chunks)
  const sum = summarize(all)
  out(JSON.stringify(sum))
  return { label, ok: true, ...sum }
}

async function pickPort(preferred) {
  const ports = await SerialPort.list()
  out('PORTS:')
  for (const p of ports) {
    out(`  ${p.path}  ${p.friendlyName || ''}  ${p.vendorId || ''}:${p.productId || ''}`)
  }
  if (preferred) return preferred
  const hit =
    ports.find((p) => p.vendorId === '1A86' && p.productId === '7523') ||
    ports.find((p) => /ch340|mindwave/i.test(p.friendlyName || ''))
  return hit?.path || null
}

async function main() {
  const preferred = process.argv[2] || null
  const path = await pickPort(preferred)
  if (!path) {
    out('NO DONGLE PORT')
    process.exit(2)
  }
  out(`TARGET ${path}`)
  out(`LOG ${logPath}`)

  const results = []

  results.push(
    await runCase(path, 57600, 'A: pulse + C1 + C2', async (port) => {
      await pulse(port)
      port.write(RF.DISCONNECT)
      await sleep(400)
      port.write(RF.AUTO_CONNECT)
    }),
  )

  results.push(
    await runCase(path, 57600, 'B: DTR/RTS on + C2 only', async (port) => {
      await setLines(port, true, true)
      await sleep(200)
      port.write(RF.AUTO_CONNECT)
    }),
  )

  results.push(
    await runCase(path, 57600, 'C: pulse + C0 FFFF + C2', async (port) => {
      await pulse(port)
      port.write(RF.DISCONNECT)
      await sleep(300)
      port.write(RF.CONNECT_FFFF)
      await sleep(300)
      port.write(RF.AUTO_CONNECT)
    }),
  )

  results.push(
    await runCase(path, 115200, 'D: 115200 pulse + C2', async (port) => {
      await pulse(port)
      port.write(RF.DISCONNECT)
      await sleep(400)
      port.write(RF.AUTO_CONNECT)
    }),
  )

  results.push(
    await runCase(path, 57600, 'E: repeated C2 x5', async (port) => {
      await pulse(port)
      for (let i = 0; i < 5; i++) {
        port.write(RF.DISCONNECT)
        await sleep(200)
        port.write(RF.AUTO_CONNECT)
        await sleep(1500)
      }
    }),
  )

  out('\n=== SUMMARY ===')
  let anySync = false
  for (const r of results) {
    if (!r.ok) {
      out(`${r.label}: FAIL ${r.err}`)
      continue
    }
    out(`${r.label}: bytes=${r.bytes} aa=${r.aa} sync=${r.thinkgearSync}`)
    if (r.thinkgearSync) anySync = true
  }
  out(anySync ? 'RESULT: ThinkGear sync YES' : 'RESULT: ThinkGear sync NO')
  log.end()
  process.exit(anySync ? 0 : 1)
}

main().catch((e) => {
  out(String(e))
  process.exit(1)
})
