/**
 * Bridge: MindWave serial (RF dongle / BT SPP) → WebSocket :13855
 *
 * Uso:
 *   npm run serial              # auto-detecta COM
 *   npm run serial -- COM18           # fuerza puerto
 *   npm run serial -- COM18 115200    # puerto + baud (CH340 a veces necesita 115200)
 *   set MINDWAVE_PORT=COM18 && npm run serial
 *
 * MindWave RF (blanco): dongle USB → COM. Si sale como CH340, el driver
 * NeuroSky suele estar mal; igual intentamos 0xC2 (auto-connect).
 */
import { SerialPort } from 'serialport'
import { WebSocketServer } from 'ws'
import { createThinkGearParser, RF } from './thinkgear.js'

const WS_PORT = 13855
const preferred = process.argv[2] || process.env.MINDWAVE_PORT || null
const BAUD = Number(process.argv[3] || process.env.MINDWAVE_BAUD || 115200)

const wss = new WebSocketServer({ host: '127.0.0.1', port: WS_PORT })
console.log(`[serial] WebSocket ws://127.0.0.1:${WS_PORT}`)

function broadcast(obj) {
  const msg = JSON.stringify(obj)
  for (const c of wss.clients) {
    if (c.readyState === 1) c.send(msg)
  }
}

async function listPorts() {
  const ports = await SerialPort.list()
  console.log('[serial] Puertos:')
  for (const p of ports) {
    console.log(`  ${p.path}  ${p.friendlyName || p.manufacturer || ''}  ${p.vendorId || ''}:${p.productId || ''}`)
  }
  return ports
}

function pickPort(ports) {
  if (preferred) return preferred
  // Prefer MindWave / NeuroSky name, then CH340 (dongle mal identificado), then cualquier USB serial
  const scored = ports.map((p) => {
    const n = `${p.friendlyName || ''} ${p.manufacturer || ''} ${p.path}`.toLowerCase()
    let score = 0
    if (/mindwave|neurosky|thinkgear/.test(n)) score += 100
    if (/ch340|1a86/.test(n) || p.vendorId === '1A86') score += 50
    if (/usb.?serial|cp210|ftdi/.test(n)) score += 20
    if (/bluetooth/.test(n)) score += 5
    return { path: p.path, score, name: p.friendlyName }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.path || null
}

function pulseDtrRts(port) {
  return new Promise((resolve) => {
    port.set({ dtr: false, rts: false }, () => {
      setTimeout(() => port.set({ dtr: true, rts: true }, () => setTimeout(resolve, 300)), 200)
    })
  })
}

async function openSerial(path) {
  const port = await new Promise((resolve, reject) => {
    const p = new SerialPort({ path, baudRate: BAUD, autoOpen: false })
    p.open((err) => (err ? reject(err) : resolve(p)))
  })
  // MindWave RF dongle: el driver NeuroSky activa DTR/RTS al abrir el puerto.
  // Con CH340 firmado lo hacemos en software antes del auto-connect.
  await pulseDtrRts(port)
  await new Promise((r) => setTimeout(r, 500))
  return port
}

async function main() {
  const ports = await listPorts()
  const path = pickPort(ports)
  if (!path) {
    console.error('[serial] No hay puerto COM. Conecta el dongle USB.')
    broadcast({ status: 'no_port', error: 'Sin COM disponible' })
    return
  }

  console.log(`[serial] Abriendo ${path} @ ${BAUD}…`)
  broadcast({ status: 'opening', port: path })

  let port
  try {
    port = await openSerial(path)
  } catch (err) {
    console.error('[serial] No se pudo abrir:', err.message)
    broadcast({ status: 'error', port: path, error: err.message })
    setTimeout(main, 4000)
    return
  }

  let bytes = 0
  let syncHint = false
  let prev = 0
  let rfConnected = false
  let lastRfRetry = 0

  const parser = createThinkGearParser((pkt) => {
    const out = { source: 'serial', port: path }
    if (pkt.attention != null) out.attention = pkt.attention
    if (pkt.meditation != null) out.meditation = pkt.meditation
    if (pkt.poorSignal != null) out.poorSignal = pkt.poorSignal
    if (pkt.blink != null) {
      out.blinkStrength = pkt.blink
      if (pkt.blink > 40) {
        out.blink = true
        out.jump = true
      }
    }
    if (pkt.raw != null) out.raw = pkt.raw
    if (pkt.bands) out.bands = pkt.bands
    if (pkt.dongle) {
      out.dongle = pkt.dongle
      const st = pkt.dongle.state
      rfConnected = st === 'connected'
      if (st === 'disconnected' || st === 'denied' || st === 'standby') rfConnected = false
    }
    broadcast(out)
    if (pkt.dongle) console.log('[dongle]', pkt.dongle)
    if (pkt.attention != null) {
      process.stdout.write(
        `\r[eeg] att=${pkt.attention} med=${pkt.meditation ?? '-'} sig=${pkt.poorSignal ?? '-'}   `,
      )
    }
  })

  port.on('data', (chunk) => {
    bytes += chunk.length
    for (let i = 0; i < chunk.length; i++) {
      const b = chunk[i]
      if (!syncHint && prev === 0xaa && b === 0xaa) {
        syncHint = true
        console.log('\n[serial] Sync ThinkGear (AA AA) detectado — protocolo OK')
      }
      prev = b
    }
    parser.feed(chunk)
  })

  port.on('error', (err) => {
    console.error('\n[serial] error:', err.message)
    broadcast({ status: 'error', error: err.message })
  })

  port.on('close', () => {
    console.log('\n[serial] puerto cerrado, reintento…')
    broadcast({ status: 'closed' })
    setTimeout(main, 3000)
  })

  // MindWave RF: auto-connect (~10s scan). Reintentar mientras NO esté linked,
  // aunque ya haya AA AA (el dongle manda status sin headset azul).
  function kickRf(reason) {
    const now = Date.now()
    if (now - lastRfRetry < 4500) return
    lastRfRetry = now
    console.log(`\n[serial] RF kick (${reason}) — 0xC1 → 0xC2`)
    port.write(RF.DISCONNECT)
    setTimeout(() => port.write(RF.AUTO_CONNECT), 350)
  }

  console.log('[serial] Enviando RF AUTO_CONNECT (0xC2)…')
  console.log('         Enciende el headset (LED), sensor en frente + clip en oreja.')
  kickRf('start')

  const retry = setInterval(() => {
    if (rfConnected) return
    kickRf(syncHint ? 'searching-with-sync' : 'no-link')
  }, 5000)

  setInterval(() => {
    broadcast({
      status: rfConnected ? 'streaming' : 'waiting',
      port: path,
      bytes,
      hint: rfConnected
        ? 'ok'
        : syncHint
          ? 'Dongle OK · buscando headset (LED azul). Acerca + pila AAA.'
          : 'Sin AA AA. ¿COM correcto? ¿Driver CH340/MindWave?',
    })
  }, 2000)

  port.on('close', () => clearInterval(retry))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
