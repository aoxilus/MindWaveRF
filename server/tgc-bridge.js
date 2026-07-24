/**
 * Bridge: ThinkGear Connector (TCP 13854) → WebSocket (13855)
 *
 * 1) Instala/abre ThinkGear Connector (NeuroSky)
 * 2) Pon el MindWave y espera señal buena
 * 3) npm run bridge
 * 4) npm run dev  → el juego se conecta solo
 */
import net from 'node:net'
import { WebSocketServer } from 'ws'

const TGC_HOST = '127.0.0.1'
const TGC_PORT = 13854
const WS_PORT = 13855

const wss = new WebSocketServer({ host: '127.0.0.1', port: WS_PORT })
console.log(`[bridge] WebSocket en ws://127.0.0.1:${WS_PORT}`)

function broadcast(obj) {
  const msg = JSON.stringify(obj)
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg)
  }
}

function connectTgc() {
  const socket = net.connect(TGC_PORT, TGC_HOST)
  let buffer = ''

  socket.on('connect', () => {
    console.log('[bridge] Conectado a ThinkGear Connector')
    socket.write(JSON.stringify({ enableRawOutput: false, format: 'Json' }))
  })

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8')
    const parts = buffer.split('\r')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('{')) continue
      try {
        const packet = JSON.parse(line)
        const eSense = packet.eSense || {}
        const poor = packet.poorSignalLevel
        const out = {}
        if (typeof eSense.attention === 'number') out.attention = eSense.attention
        if (typeof eSense.meditation === 'number') out.meditation = eSense.meditation
        if (typeof poor === 'number') out.poorSignal = poor
        // Blink packets sometimes appear as blinkStrength
        if (typeof packet.blinkStrength === 'number' && packet.blinkStrength > 40) {
          out.blink = true
          out.jump = true
        }
        if (Object.keys(out).length) broadcast(out)
      } catch {
        // ignore
      }
    }
  })

  socket.on('error', (err) => {
    console.warn('[bridge] TGC no disponible:', err.message)
    console.warn('         Abre ThinkGear Connector y reintenta…')
  })

  socket.on('close', () => {
    console.log('[bridge] TGC cerrado, reintento en 3s…')
    setTimeout(connectTgc, 3000)
  })
}

connectTgc()

// Paquete demo si no hay headset (para probar el bridge)
setInterval(() => {
  // no-op keep process alive messaging only when no clients needed
}, 60000)
