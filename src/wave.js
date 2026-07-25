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

/** Escala Y raw MindWave (mismo bound que el scope). */
const RAW_Y = 2048
/** Puntos en pantalla + decimate → ~8 s @ 512 Hz. */
const RAW_N = 320
const RAW_DECIMATE = 12
const BAND_N = 60

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
const hzEl = document.querySelector('#hz')
const fftMetaEl = document.querySelector('#fft-meta')
const canvas = document.querySelector('#raw')
const ctx = canvas.getContext('2d')
const fftSpecCanvas = document.querySelector('#fft-spec')
const fftSpecCtx = fftSpecCanvas.getContext('2d')
const fftLineCanvas = document.querySelector('#fft-line')
const fftLineCtx = fftLineCanvas.getContext('2d')
const bandGrid = document.querySelector('#band-grid')

const rawBuf = new Float32Array(RAW_N)
let rawWrite = 0
let rawSkip = 0
let bandMax = 1

/** FFT del raw a 512 Hz (no decimado). */
const FS = 512
const FFT_N = 256
const FFT_HOP = 64
const FMAX = 50
const BIN_HZ = FS / FFT_N
const FBIN_N = Math.floor(FMAX / BIN_HZ) + 1
const fftRing = new Float32Array(FFT_N)
let fftRingWrite = 0
let fftRingFill = 0
let fftSinceHop = 0
const fftRe = new Float32Array(FFT_N)
const fftIm = new Float32Array(FFT_N)
const fftMag = new Float32Array(FBIN_N)
const hann = new Float32Array(FFT_N)
for (let i = 0; i < FFT_N; i++) hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_N - 1)))
let fftMagMax = 1
let lastPeakHz = 0

const bandHist = Object.fromEntries(BANDS.map(([k]) => [k, new Float32Array(BAND_N)]))
const bandWrite = Object.fromEntries(BANDS.map(([k]) => [k, 0]))
const bandCtx = {}

/** Entero / k / M, sin decimales largos. */
function fmtNum(v) {
  if (v == null || Number.isNaN(v)) return '—'
  const n = Math.round(Number(v))
  const a = Math.abs(n)
  if (a >= 1_000_000) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`
  if (a >= 1000) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

/** FFT radix-2 in-place (Cooley–Tukey). */
function fftRadix2(re, im) {
  const n = re.length
  let j = 0
  for (let i = 0; i < n; i++) {
    if (i < j) {
      let t = re[i]
      re[i] = re[j]
      re[j] = t
      t = im[i]
      im[i] = im[j]
      im[j] = t
    }
    let m = n >> 1
    while (m >= 1 && j >= m) {
      j -= m
      m >>= 1
    }
    j += m
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    const ang = (-2 * Math.PI) / len
    const wR = Math.cos(ang)
    const wI = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let uR = 1
      let uI = 0
      for (let k = 0; k < half; k++) {
        const p = i + k
        const q = p + half
        const tR = uR * re[q] - uI * im[q]
        const tI = uR * im[q] + uI * re[q]
        re[q] = re[p] - tR
        im[q] = im[p] - tI
        re[p] += tR
        im[p] += tI
        const nUR = uR * wR - uI * wI
        uI = uR * wI + uI * wR
        uR = nUR
      }
    }
  }
}

function magToColor(t) {
  const x = Math.max(0, Math.min(1, t))
  if (x < 0.33) {
    const u = x / 0.33
    return `rgb(${Math.round(8 + 20 * u)},${Math.round(18 + 60 * u)},${Math.round(22 + 40 * u)})`
  }
  if (x < 0.66) {
    const u = (x - 0.33) / 0.33
    return `rgb(${Math.round(28 + 50 * u)},${Math.round(78 + 100 * u)},${Math.round(62 + 60 * u)})`
  }
  const u = (x - 0.66) / 0.34
  return `rgb(${Math.round(78 + 140 * u)},${Math.round(178 + 50 * u)},${Math.round(106 - 40 * u)})`
}

function runFftFrame() {
  if (fftRingFill < FFT_N) return false
  for (let i = 0; i < FFT_N; i++) {
    const v = fftRing[(fftRingWrite + i) % FFT_N]
    fftRe[i] = v * hann[i]
    fftIm[i] = 0
  }
  fftRadix2(fftRe, fftIm)
  let peak = 0
  let peakBin = 1
  for (let k = 0; k < FBIN_N; k++) {
    const mag = Math.hypot(fftRe[k], fftIm[k]) / (FFT_N / 2)
    fftMag[k] = mag
    if (k > 0 && mag > peak) {
      peak = mag
      peakBin = k
    }
  }
  fftMagMax = Math.max(fftMagMax * 0.995, peak, 1e-3)
  lastPeakHz = peakBin * BIN_HZ
  return true
}

function pushFftSample(raw) {
  fftRing[fftRingWrite % FFT_N] = raw
  fftRingWrite++
  if (fftRingFill < FFT_N) fftRingFill++
  fftSinceHop++
  if (fftSinceHop < FFT_HOP || fftRingFill < FFT_N) return
  fftSinceHop = 0
  if (!runFftFrame()) return
  paintSpectrogramColumn()
  if (fftMetaEl) {
    fftMetaEl.textContent = `pico ~${Math.round(lastPeakHz)} Hz · 0–${FMAX} Hz · N=${FFT_N}`
  }
}

function paintSpectrogramColumn() {
  const w = fftSpecCanvas.width
  const h = fftSpecCanvas.height
  fftSpecCtx.drawImage(fftSpecCanvas, -2, 0)
  const colW = 2
  const x0 = w - colW
  for (let k = 0; k < FBIN_N; k++) {
    const t = Math.log10(1 + (9 * fftMag[k]) / fftMagMax)
    const y1 = h - ((k + 1) / FBIN_N) * h
    const y0 = h - (k / FBIN_N) * h
    fftSpecCtx.fillStyle = magToColor(t)
    fftSpecCtx.fillRect(x0, y1, colW, Math.max(1, y0 - y1))
  }
}

function drawFftLine() {
  const w = fftLineCanvas.width
  const h = fftLineCanvas.height
  fftLineCtx.fillStyle = 'rgba(5, 12, 10, 0.5)'
  fftLineCtx.fillRect(0, 0, w, h)

  const marks = [4, 8, 13, 30]
  fftLineCtx.strokeStyle = 'rgba(255,255,255,0.08)'
  fftLineCtx.fillStyle = 'rgba(160,180,170,0.45)'
  fftLineCtx.font = '11px IBM Plex Mono, monospace'
  for (const hz of marks) {
    const x = (hz / FMAX) * w
    fftLineCtx.beginPath()
    fftLineCtx.moveTo(x, 0)
    fftLineCtx.lineTo(x, h)
    fftLineCtx.stroke()
    fftLineCtx.fillText(`${hz}`, x + 3, 12)
  }

  fftLineCtx.strokeStyle = '#7dce6a'
  fftLineCtx.lineWidth = 1.5
  fftLineCtx.beginPath()
  for (let k = 0; k < FBIN_N; k++) {
    const x = (k / (FBIN_N - 1)) * w
    const y = h - 4 - (Math.min(1, fftMag[k] / fftMagMax) * (h - 10))
    if (k === 0) fftLineCtx.moveTo(x, y)
    else fftLineCtx.lineTo(x, y)
  }
  fftLineCtx.stroke()
}

for (const [key, label] of BANDS) {
  const el = document.createElement('div')
  el.className = 'band'
  el.innerHTML = `<div class="band-head"><label>${label}</label><b id="b-${key}">—</b></div><canvas id="bc-${key}" width="280" height="56"></canvas>`
  bandGrid.appendChild(el)
  const c = el.querySelector(`#bc-${key}`)
  bandCtx[key] = c.getContext('2d')
}

if (hzEl) hzEl.textContent = `~${Math.round(512 / RAW_DECIMATE)} Hz · ${((RAW_N * RAW_DECIMATE) / 512).toFixed(0)} s`

// fondo inicial espectrograma
fftSpecCtx.fillStyle = '#050c0a'
fftSpecCtx.fillRect(0, 0, fftSpecCanvas.width, fftSpecCanvas.height)

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
    pushFftSample(data.raw)
    rawSkip++
    if (rawSkip >= RAW_DECIMATE) {
      rawSkip = 0
      rawBuf[rawWrite % RAW_N] = data.raw
      rawWrite++
    }
    // Detectar blink aunque poorSignal suba un instante (el blink ensucia la señal)
    blinks.fromRaw(data.raw, true, now)
  }

  if (data.bands) {
    for (const [key] of BANDS) {
      const v = data.bands[key] ?? 0
      bandMax = Math.max(bandMax * 0.992, v, 1)
      const hist = bandHist[key]
      hist[bandWrite[key] % BAND_N] = v
      bandWrite[key]++
      const el = document.querySelector(`#b-${key}`)
      if (el) el.textContent = fmtNum(v)
    }
  }

  blinkEl.textContent = String(blinks.count())
  blinkBar.style.width = `${blinks.flashStrength(now)}%`
  updateState(now)
}

function drawBand(key) {
  const c = bandCtx[key]
  if (!c) return
  const canvasEl = c.canvas
  const w = canvasEl.width
  const h = canvasEl.height
  const hist = bandHist[key]
  const start = bandWrite[key]
  const maxY = Math.max(bandMax, 1)

  c.fillStyle = 'rgba(0, 0, 0, 0.35)'
  c.fillRect(0, 0, w, h)

  c.strokeStyle = 'rgba(125, 206, 106, 0.15)'
  c.beginPath()
  c.moveTo(0, h - 1)
  c.lineTo(w, h - 1)
  c.stroke()

  c.strokeStyle = '#5ec8b8'
  c.lineWidth = 1.5
  c.beginPath()
  for (let i = 0; i < BAND_N; i++) {
    const v = hist[(start + i) % BAND_N]
    const x = (i / (BAND_N - 1)) * w
    const y = h - 2 - (Math.min(v, maxY) / maxY) * (h - 6)
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.stroke()
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
    const y = h / 2 - (v / RAW_Y) * (h * 0.45)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  drawFftLine()
  for (const [key] of BANDS) drawBand(key)
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
