/**
 * Cliente compartido MindWave (WebSocket bridge) + blink por raw + export AI.
 */
export const WS_URL = 'ws://127.0.0.1:13855'

/** Colores planos, alto contraste (sin gradient en el estímulo). */
export const FLAT_COLORS = [
  { id: 'R', name: 'roja', css: '#E10600', shape: 'circle' },
  { id: 'G', name: 'verde', css: '#00A651', shape: 'square' },
  { id: 'B', name: 'azul', css: '#0057B8', shape: 'triangle' },
  { id: 'Y', name: 'amarilla', css: '#FFD100', shape: 'diamond' },
]

export function createBlinkFromRaw({ peakMin = 380, deltaMin = 280, cooldownMs = 320 } = {}) {
  let prev = 0
  let baseline = 0
  let ready = false
  let lastAt = 0
  let peak = 0

  return {
    feed(raw, now = performance.now()) {
      if (typeof raw !== 'number') return null
      if (!ready) {
        prev = raw
        baseline = raw
        ready = true
        peak = 0
        return null
      }
      const delta = Math.abs(raw - prev)
      const p = Math.abs(raw - baseline)
      prev = raw
      if (p > peak) peak = p
      if (p < peakMin * 0.45) baseline = baseline * 0.98 + raw * 0.02
      if (now - lastAt < cooldownMs) return null
      if (p < peakMin && delta < deltaMin) return null
      lastAt = now
      const strength = Math.min(100, Math.max(p, delta) / 12)
      return { source: 'raw', strength, peak: p, delta, t: now }
    },
    resetPeak() {
      peak = 0
    },
    getPeak: () => peak,
    reset() {
      ready = false
      peak = 0
    },
  }
}

export function createMindwaveClient({ onUpdate, onBlink } = {}) {
  const blink = createBlinkFromRaw()
  let ws = null
  const state = {
    linked: false,
    attention: null,
    meditation: null,
    poorSignal: 200,
    status: 'off',
  }

  function connect() {
    try {
      ws = new WebSocket(WS_URL)
    } catch {
      state.status = 'sin bridge'
      onUpdate?.(state)
      setTimeout(connect, 2000)
      return
    }
    ws.onopen = () => {
      state.status = 'bridge ok'
      onUpdate?.(state)
    }
    ws.onclose = () => {
      state.linked = false
      state.status = 'desconectado'
      onUpdate?.(state)
      setTimeout(connect, 2000)
    }
    ws.onerror = () => ws?.close()
    ws.onmessage = (ev) => {
      let data
      try {
        data = JSON.parse(ev.data)
      } catch {
        return
      }
      const now = performance.now()
      if (data.dongle?.state === 'connected') {
        state.linked = true
        state.status = `conectado ${data.dongle.headsetId || ''}`
      }
      if (typeof data.poorSignal === 'number') state.poorSignal = data.poorSignal
      if (typeof data.attention === 'number') {
        state.attention = data.attention
        state.linked = true
      }
      if (typeof data.meditation === 'number') state.meditation = data.meditation

      if (typeof data.blinkStrength === 'number' && data.blinkStrength >= 20) {
        onBlink?.({ source: 'headset', strength: data.blinkStrength, t: now })
      }
      if (data.blink || data.jump) onBlink?.({ source: 'headset', strength: 60, t: now })

      if (typeof data.raw === 'number') {
        const hit = blink.feed(data.raw, now)
        if (hit) onBlink?.(hit)
      }
      onUpdate?.(state)
    }
  }

  connect()
  return {
    state,
    blink,
    reconnect: connect,
  }
}

/** Fondo con ruido (film grain). El estímulo debe quedarse plano. */
export function applyNoiseBackground(el, { opacity = 0.12 } = {}) {
  if (!el) return
  const size = 128
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  el.style.backgroundImage = `url(${c.toDataURL('image/png')})`
  el.style.backgroundSize = '128px 128px'
  el.dataset.noiseOpacity = String(opacity)
}

export function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function mean(arr) {
  if (!arr.length) return null
  return arr.reduce((s, x) => s + x, 0) / arr.length
}

export function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}
