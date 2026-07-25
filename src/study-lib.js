/**
 * Cliente compartido MindWave (WebSocket bridge) + blink por raw + export AI.
 */
export const WS_URL = 'ws://127.0.0.1:13855'

/** Colores planos vivos para el ojo (sin gradient en el estímulo). */
export const FLAT_COLORS = [
  { id: 'R', name: 'roja', css: '#FF1A1A', shape: 'circle' },
  { id: 'G', name: 'verde', css: '#00E676', shape: 'square' },
  { id: 'B', name: 'azul', css: '#2979FF', shape: 'triangle' },
  { id: 'Y', name: 'amarilla', css: '#FFEA00', shape: 'diamond' },
  { id: 'O', name: 'naranja', css: '#FF6D00', shape: 'circle' },
  { id: 'M', name: 'magenta', css: '#FF00AA', shape: 'square' },
  { id: 'C', name: 'cian', css: '#00E5FF', shape: 'diamond' },
  { id: 'L', name: 'lima', css: '#C6FF00', shape: 'triangle' },
]

/** Estudio posición × forma × color (independientes). */
export const STUDY_SIDES = ['L', 'C', 'R']
export const STUDY_SHAPES = ['circle', 'square', 'triangle']
export const STUDY_COLORS = [
  { id: 'R', name: 'roja', css: '#FF1A1A' },
  { id: 'G', name: 'verde', css: '#00E676' },
  { id: 'B', name: 'azul', css: '#2979FF' },
]

/** Plan balanceado: cada combo se repite `reps` veces (para AI). */
export function buildBalancedTrialPlan({
  sides = STUDY_SIDES,
  shapes = STUDY_SHAPES,
  colors = STUDY_COLORS,
  reps = 2,
} = {}) {
  const plan = []
  for (const side of sides) {
    for (const shape of shapes) {
      for (const color of colors) {
        for (let r = 0; r < reps; r += 1) {
          plan.push({
            side,
            shape,
            colorId: color.id,
            colorName: color.name,
            colorCss: color.css,
            rep: r + 1,
            reps,
          })
        }
      }
    }
  }
  // Fisher–Yates
  for (let i = plan.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[plan[i], plan[j]] = [plan[j], plan[i]]
  }
  return plan
}

/** Guarda JSON en localStorage + descarga silenciosa (sin UI). */
export function saveStudyBackstage(filename, payload) {
  try {
    localStorage.setItem('mindwave-study-latest', JSON.stringify(payload))
    localStorage.setItem('mindwave-study-latest-name', filename)
  } catch {
    // ignore quota
  }
  downloadJson(filename, payload)
}

export function createBlinkFromRaw({ peakMin = 520, deltaMin = 320, cooldownMs = 520 } = {}) {
  let prev = 0
  let baseline = 0
  let ready = false
  let lastAt = 0
  let peak = 0
  const peakHard = Math.max(900, peakMin * 1.7)

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
      if (p < peakMin * 0.4) baseline = baseline * 0.97 + raw * 0.03
      if (now - lastAt < cooldownMs) return null
      const ok = (p >= peakMin && delta >= deltaMin) || p >= peakHard
      if (!ok) return null
      lastAt = now
      const strength = Math.min(100, Math.max(p, delta) / 14)
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

      if (typeof data.blinkStrength === 'number' && data.blinkStrength >= 45) {
        onBlink?.({ source: 'headset', strength: data.blinkStrength, t: now })
      }
      if (data.blink || data.jump) onBlink?.({ source: 'headset', strength: 60, t: now })

      if (typeof data.raw === 'number' && state.poorSignal <= 25) {
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

/**
 * Fondo con ruido de COLOR (no blanco/negro).
 * El estímulo se queda plano encima.
 */
export function applyNoiseBackground(el, { opacity = 0.22, tint = null } = {}) {
  if (!el) return
  const size = 128
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    // RGB saturado aleatorio (no grayscale)
    img.data[i] = (40 + Math.random() * 215) | 0
    img.data[i + 1] = (40 + Math.random() * 215) | 0
    img.data[i + 2] = (40 + Math.random() * 215) | 0
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const base = tint || '#1a1a22'
  el.style.backgroundColor = base
  el.style.backgroundImage = `url(${c.toDataURL('image/png')})`
  el.style.backgroundSize = '96px 96px'
  el.style.backgroundBlendMode = 'overlay'
  el.dataset.noiseOpacity = String(opacity)
  el.dataset.noiseTint = base
}

/** Tintes de fondo para variar el noise por ensayo. */
export const NOISE_TINTS = [
  { id: 'warm', css: '#3a2218' },
  { id: 'cool', css: '#182838' },
  { id: 'green', css: '#1a2e1a' },
  { id: 'violet', css: '#2a1838' },
  { id: 'neutral', css: '#222228' },
]

/** Efecto máquina de escribir. Devuelve Promise al terminar. */
export function typewriter(el, text, { msPerChar = 28, onTick } = {}) {
  return new Promise((resolve) => {
    if (!el) {
      resolve()
      return
    }
    el.textContent = ''
    let i = 0
    const tick = () => {
      if (i >= text.length) {
        resolve()
        return
      }
      el.textContent += text[i]
      i += 1
      onTick?.(i, text.length)
      setTimeout(tick, msPerChar)
    }
    tick()
  })
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
