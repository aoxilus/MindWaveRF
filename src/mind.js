/**
 * MindWave input:
 * - slider / keyboard simulation
 * - optional WebSocket bridge to ThinkGear Connector (npm run bridge)
 */

const DEFAULT_WS = 'ws://127.0.0.1:13855'

export function createMindInput({ onAttention, onJump, onStatus }) {
  let attention = 50
  let source = 'teclado'
  let lastAttention = 50
  let jumpCooldown = 0
  let ws = null

  function emitAttention(value, nextSource = source) {
    attention = Math.max(0, Math.min(100, value))
    source = nextSource
    onAttention?.(attention)
    onStatus?.(source)
  }

  function tryJumpFromSpike(value) {
    const now = performance.now()
    if (now < jumpCooldown) {
      lastAttention = value
      return
    }
    // Pico brusco de atención = brincar (útil con MindWave)
    if (value - lastAttention >= 28 && value >= 55) {
      jumpCooldown = now + 700
      onJump?.()
    }
    lastAttention = value
  }

  function connectBridge() {
    try {
      ws = new WebSocket(DEFAULT_WS)
    } catch {
      onStatus?.('teclado')
      return
    }

    ws.onopen = () => onStatus?.('mindwave')
    ws.onclose = () => {
      onStatus?.('teclado')
      setTimeout(connectBridge, 2500)
    }
    ws.onerror = () => ws?.close()
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (typeof data.attention === 'number') {
          tryJumpFromSpike(data.attention)
          emitAttention(data.attention, 'mindwave')
        }
        if (data.blink || data.jump) onJump?.()
      } catch {
        // ignore bad packets
      }
    }
  }

  connectBridge()

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault()
      onJump?.()
    }
    // Simular atención con teclas
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      emitAttention(15, 'teclado')
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      emitAttention(85, 'teclado')
    }
  })

  return {
    setSimulatedAttention(value) {
      emitAttention(Number(value), source === 'mindwave' ? 'mindwave+sim' : 'teclado')
    },
    getAttention: () => attention,
  }
}
