const WS_URL = 'ws://127.0.0.1:13855'

const BANDS = [
  ['delta', 'Delta'],
  ['theta', 'Theta'],
  ['lowAlpha', 'Low α'],
  ['highAlpha', 'High α'],
  ['lowBeta', 'Low β'],
  ['highBeta', 'High β'],
  ['lowGamma', 'Low γ'],
  ['midGamma', 'Mid γ'],
]

const connEl = document.querySelector('#conn')
const stateEl = document.querySelector('#state')
const stateLabel = document.querySelector('#state-label')
const stateHint = document.querySelector('#state-hint')
const attEl = document.querySelector('#att')
const medEl = document.querySelector('#med')
const sigEl = document.querySelector('#sig')
const blinkEl = document.querySelector('#blink')
const attBar = document.querySelector('#att-bar')
const medBar = document.querySelector('#med-bar')
const sigBar = document.querySelector('#sig-bar')
const blinkBar = document.querySelector('#blink-bar')
const hintEl = document.querySelector('#hint')
const metaEl = document.querySelector('#meta')
const canvas = document.querySelector('#raw')
const ctx = canvas.getContext('2d')
const bandGrid = document.querySelector('#band-grid')

const RAW_N = 512
const rawBuf = new Float32Array(RAW_N)
let rawWrite = 0
let bandMax = 1

for (const [key, label] of BANDS) {
  const el = document.createElement('div')
  el.className = 'band'
  el.innerHTML = `<label>${label}</label><b id="b-${key}">—</b><div class="bar"><i id="bi-${key}"></i></div>`
  bandGrid.appendChild(el)
}

function ema(prev, next, alpha) {
  if (prev == null || Number.isNaN(prev)) return next
  return prev * (1 - alpha) + next * alpha
}

/** Mediana + EMA: limpia picos del MindWave sin apagar el movimiento. */
function createSmoothMetric(alpha = 0.45, win = 5) {
  const vals = []
  let smooth = null
  return {
    push(v) {
      if (typeof v !== 'number') return smooth
      vals.push(v)
      if (vals.length > win) vals.shift()
      const sorted = [...vals].sort((a, b) => a - b)
      const mid = sorted[Math.floor(sorted.length / 2)]
      smooth = ema(smooth, mid, alpha)
      return smooth
    },
    value: () => smooth,
    reset() {
      vals.length = 0
      smooth = null
    },
  }
}

/**
 * Concentrado / no concentrado con histéresis suave.
 * Umbrales más bajos para MindWave real (suele oscilar 30–90).
 */
function createFocusClassifier({ enter = 52, exit = 38, holdMs = 280 } = {}) {
  let focused = false
  let pending = null
  let pendingAt = 0
  return {
    update(attention, now) {
      if (attention == null) return focused
      const want = focused ? attention >= exit : attention >= enter
      if (want === focused) {
        pending = null
        return focused
      }
      if (pending !== want) {
        pending = want
        pendingAt = now
        return focused
      }
      if (now - pendingAt >= holdMs) {
        focused = want
        pending = null
      }
      return focused
    },
    isFocused: () => focused,
    reset() {
      focused = false
      pending = null
    },
  }
}

/**
 * Blink: blinkStrength (si viene) + pico en raw EEG (lo que ves en la gráfica).
 * MindWave RF a menudo NO manda 0x16 blink; el spike raw es la fuente real.
 */
function createBlinkDetector() {
  let count = 0
  let lastAt = 0
  let flashUntil = 0
  let strengthFlash = 0
  let prevRaw = 0
  let baseline = 0
  let ready = false
  const PEAK_MIN = 380
  const DELTA_MIN = 280

  function fire(now, strength = 70) {
    if (now - lastAt < 320) return false
    lastAt = now
    count++
    flashUntil = now + 550
    strengthFlash = Math.min(100, strength)
    return true
  }

  return {
    fromStrength(s, now) {
      if (typeof s !== 'number' || s < 20) return false
      return fire(now, Math.min(100, s))
    },
    fromFlag(now) {
      return fire(now, 80)
    },
    fromRaw(raw, _signalOk, now) {
      if (typeof raw !== 'number') return false
      if (!ready) {
        prevRaw = raw
        baseline = raw
        ready = true
        return false
      }
      // Baseline lenta en reposo; no se actualiza fuerte durante un spike
      const delta = Math.abs(raw - prevRaw)
      const peak = Math.abs(raw - baseline)
      prevRaw = raw
      if (peak < PEAK_MIN * 0.45) {
        baseline = baseline * 0.98 + raw * 0.02
      }
      if (peak < PEAK_MIN && delta < DELTA_MIN) return false
      return fire(now, Math.min(100, Math.max(peak, delta) / 12))
    },
    tick(now) {
      return now < flashUntil
    },
    flashStrength(now) {
      if (now >= flashUntil) return 0
      const t = (flashUntil - now) / 550
      return Math.round(strengthFlash * t)
    },
    count: () => count,
  }
}

const attSmooth = createSmoothMetric(0.5, 4)
const medSmooth = createSmoothMetric(0.4, 4)
const focus = createFocusClassifier()
const blinks = createBlinkDetector()

let signalOk = false
let linked = false
let lastPoor = 200
let lastAttRaw = null
let lastMedRaw = null

let lastPort = null

function setConn(text, cls) {
  connEl.textContent = lastPort ? `${text} · ${lastPort}` : text
  connEl.className = `pill ${cls}`
}

function rememberPort(data) {
  if (!data.port) return
  lastPort = data.port
  metaEl.textContent = `Puerto ${data.port}${data.bytes != null ? ` · bytes ${data.bytes}` : ''}`
}

function updateState(now) {
  const att = attSmooth.value()
  const blinking = blinks.tick(now)
  const focused = focus.update(att, now)

  if (!linked) {
    stateEl.className = 'state wait'
    stateLabel.textContent = 'ESPERANDO'
    stateHint.textContent = 'Sin enlace RF'
    return
  }
  if (!signalOk) {
    stateEl.className = 'state bad'
    stateLabel.textContent = 'SIN SEÑAL'
    stateHint.textContent = 'Mejora contacto frente / oreja'
    return
  }
  if (blinking) {
    stateEl.className = 'state blink'
    stateLabel.textContent = 'BLINK'
    stateHint.textContent = `Parpadeo #${blinks.count()}`
    return
  }
  if (focused) {
    stateEl.className = 'state focus'
    stateLabel.textContent = 'CONCENTRADO'
    stateHint.textContent = `att ${Math.round(att ?? 0)} ≥ 52`
    return
  }
  stateEl.className = 'state loose'
  stateLabel.textContent = 'NO CONCENTRADO'
  stateHint.textContent = `att ${Math.round(att ?? 0)} · enfoca para subir`
}

function handle(data) {
  const now = performance.now()

  rememberPort(data)

  if (data.status) {
    if (data.status === 'streaming') setConn('streaming', 'on')
    else if (data.status === 'waiting' || data.status === 'opening') setConn(data.status, 'wait')
    else if (data.status === 'error' || data.status === 'no_port') {
      if (data.status === 'no_port') lastPort = null
      setConn(data.status, 'off')
    }
    if (data.hint) hintEl.textContent = data.hint
  }

  if (data.dongle) {
    const dongleBits = [`Dongle: ${data.dongle.state}`]
    if (data.dongle.headsetId) dongleBits.push(`ID ${data.dongle.headsetId}`)
    if (lastPort) dongleBits.push(lastPort)
    metaEl.textContent = dongleBits.join(' · ')
    if (data.dongle.state === 'connected') {
      linked = true
      setConn('conectado', 'on')
    } else if (data.dongle.state === 'searching' || data.dongle.state === 'disconnected') {
      linked = false
    }
  }

  if (typeof data.poorSignal === 'number') {
    lastPoor = data.poorSignal
    // Más permisivo: MindWave a menudo manda 0–50 con datos útiles
    signalOk = data.poorSignal <= 50
    const quality = Math.max(0, Math.min(100, 100 - data.poorSignal))
    sigEl.textContent = String(Math.round(quality))
    sigBar.style.width = `${quality}%`
    if (!signalOk) {
      attSmooth.reset()
      medSmooth.reset()
      focus.reset()
    }
  }

  if (typeof data.attention === 'number') {
    linked = true
    lastAttRaw = data.attention
    setConn('eeg', 'on')
    // Siempre muestra raw; el estado usa el suavizado
    attEl.textContent = String(data.attention)
    attBar.style.width = `${data.attention}%`
    if (signalOk || data.poorSignal == null) {
      attSmooth.push(data.attention)
      if (data.poorSignal == null) signalOk = true
    }
  }

  if (typeof data.meditation === 'number') {
    lastMedRaw = data.meditation
    medEl.textContent = String(data.meditation)
    medBar.style.width = `${data.meditation}%`
    if (signalOk) medSmooth.push(data.meditation)
  }

  if (typeof data.blinkStrength === 'number') {
    blinks.fromStrength(data.blinkStrength, now)
  }
  if (data.blink || data.jump) {
    blinks.fromFlag(now)
  }

  if (typeof data.raw === 'number') {
    rawBuf[rawWrite % RAW_N] = data.raw
    rawWrite++
    // Detectar blink aunque poorSignal suba un instante (el blink ensucia la señal)
    blinks.fromRaw(data.raw, true, now)
  }

  if (data.bands) {
    for (const [key] of BANDS) {
      const v = data.bands[key] ?? 0
      bandMax = Math.max(bandMax * 0.995, v, 1)
      const el = document.querySelector(`#b-${key}`)
      const bar = document.querySelector(`#bi-${key}`)
      if (el) el.textContent = String(v)
      if (bar) bar.style.width = `${Math.min(100, (v / bandMax) * 100)}%`
    }
  }

  blinkEl.textContent = String(blinks.count())
  blinkBar.style.width = `${blinks.flashStrength(now)}%`
  updateState(now)
}

function draw() {
  const now = performance.now()
  updateState(now)
  blinkBar.style.width = `${blinks.flashStrength(now)}%`

  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = 'rgba(5, 12, 10, 0.35)'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(125, 206, 106, 0.12)'
  ctx.beginPath()
  ctx.moveTo(0, h / 2)
  ctx.lineTo(w, h / 2)
  ctx.stroke()

  ctx.strokeStyle = '#7dce6a'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const start = rawWrite
  for (let i = 0; i < RAW_N; i++) {
    const v = rawBuf[(start + i) % RAW_N]
    const x = (i / (RAW_N - 1)) * w
    const y = h / 2 - (v / 2048) * (h * 0.45)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  requestAnimationFrame(draw)
}

function connect() {
  let ws
  try {
    ws = new WebSocket(WS_URL)
  } catch {
    setConn('sin bridge', 'off')
    setTimeout(connect, 2000)
    return
  }

  ws.onopen = () => setConn('bridge ok', 'wait')
  ws.onclose = () => {
    linked = false
    lastPort = null
    setConn('desconectado', 'off')
    setTimeout(connect, 2000)
  }
  ws.onerror = () => ws.close()
  ws.onmessage = (ev) => {
    try {
      handle(JSON.parse(ev.data))
    } catch {
      // ignore
    }
  }
}

connect()
draw()
