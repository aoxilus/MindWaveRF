/**
 * Estudio: ESPERA → bola RGB (izq/der) → sujeto parpadea.
 * Grabamos: color, lado, Attention, Meditation, poorSignal, blink sí/no, latencia blink.
 *
 * Útil: validar detección de blink + correlación Attention con estímulo.
 * No útil: "leer" el color desde el EEG (1 canal MindWave no alcanza).
 */
const WS_URL = 'ws://127.0.0.1:13855'
const TRIALS = 24
const BLINK_WINDOW_MS = 2000
/** Pico absoluto típico de blink en raw MindWave (~±400–2000). */
const RAW_PEAK_MIN = 380
/** Salto muestra-a-muestra (por si el pico sube de golpe). */
const RAW_DELTA_MIN = 280

const COLORS = [
  { id: 'R', name: 'roja', css: '#ff3b4a' },
  { id: 'G', name: 'verde', css: '#1db954' },
  { id: 'B', name: 'azul', css: '#3b82ff' },
  { id: 'Y', name: 'amarilla', css: '#ffd400' },
]

const connEl = document.querySelector('#conn')
const attEl = document.querySelector('#att')
const sigEl = document.querySelector('#sig')
const blinkEl = document.querySelector('#blink')
const nEl = document.querySelector('#n')
const arena = document.querySelector('#arena')
const prompt = document.querySelector('#prompt')
const ball = document.querySelector('#ball')
const pred = document.querySelector('#pred')
const predText = document.querySelector('#pred-text')
const predDetail = document.querySelector('#pred-detail')
const startBtn = document.querySelector('#start')
const logEl = document.querySelector('#log')

let attention = null
let meditation = null
let poorSignal = 200
let lastBlinkStrength = 0

/** @type {object[]} */
const samples = []

let phase = 'idle' // idle | wait | show | feedback | done
let trial = 0
let stimulusAt = 0
let current = null
let timer = 0
let blinkLocked = false
let rawPrev = 0
let rawReady = false
/** Baseline corta antes/durante estímulo para medir pico de blink. */
let rawBaseline = 0
let rawPeak = 0
let maxDelta = 0

function mean(arr) {
  if (!arr.length) return null
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = 0
  }
}

function logLine(s) {
  logEl.textContent = `${s}\n${logEl.textContent}`.slice(0, 6000)
}

function setArena(cls, text) {
  arena.className = `arena ${cls}`
  prompt.textContent = text ?? prompt.textContent
}

function hideBall() {
  ball.classList.add('hidden')
}

function showBall(side, color) {
  const y = arena.clientHeight * (0.35 + Math.random() * 0.3)
  const x =
    side === 'L'
      ? arena.clientWidth * (0.18 + Math.random() * 0.12)
      : arena.clientWidth * (0.7 + Math.random() * 0.12)
  ball.style.left = `${x}px`
  ball.style.top = `${y}px`
  ball.style.background = `radial-gradient(circle at 30% 30%, #fff, ${color.css} 52%, #222)`
  ball.classList.remove('hidden')
}

function updateHud() {
  attEl.textContent = attention == null ? '—' : String(attention)
  sigEl.textContent = poorSignal === 0 ? 'buena' : String(poorSignal)
  nEl.textContent = `${samples.length}/${TRIALS}`
  if (phase === 'show') {
    blinkEl.textContent = `peak ${Math.round(rawPeak)}`
  }
}

function resultFeedback(ok, detail) {
  pred.className = ok ? 'pred focus' : 'pred bad'
  predText.textContent = ok ? 'OK' : 'NO BLINK'
  predDetail.textContent = detail
  blinkEl.textContent = ok ? 'sí' : 'no'
}

function summarize() {
  const ok = samples.filter((s) => s.blink)
  const miss = samples.filter((s) => !s.blink)
  const bySide = { L: samples.filter((s) => s.side === 'L'), R: samples.filter((s) => s.side === 'R') }
  const attOk = mean(ok.map((s) => s.att))
  const attMiss = mean(miss.map((s) => s.att))
  const hitRate = samples.length ? ok.length / samples.length : 0

  pred.className = 'pred wait'
  predText.textContent = `Hit ${(hitRate * 100).toFixed(0)}%`
  predDetail.textContent = `blink OK ${ok.length}/${samples.length} · att@OK ${attOk?.toFixed(0) ?? '—'} · att@miss ${attMiss?.toFixed(0) ?? '—'} · L ${bySide.L.filter((s) => s.blink).length}/${bySide.L.length} R ${bySide.R.filter((s) => s.blink).length}/${bySide.R.length}`

  logLine(
    `RESUMEN hit=${(hitRate * 100).toFixed(0)}% attOK=${attOk?.toFixed(1)} attMiss=${attMiss?.toFixed(1)}`,
  )

  try {
    localStorage.setItem(
      'mindwave-blink-study',
      JSON.stringify({ samples, at: Date.now(), hitRate, attOk, attMiss }),
    )
  } catch {
    // ignore
  }
}

function endTrial(blink, latencyMs, source) {
  if (phase !== 'show' || !current) return
  clearTimer()
  phase = 'feedback'
  hideBall()

  const row = {
    ...current,
    blink,
    latencyMs: blink ? Math.round(latencyMs) : null,
    source: blink ? source : null,
    att: attention ?? current.attAtShow,
    med: meditation ?? 0,
    signal: poorSignal,
    t: Date.now(),
  }
  samples.push(row)
  updateHud()

  if (blink) {
    setArena('go', 'OK')
    resultFeedback(
      true,
      `${current.colorName} · ${current.side === 'L' ? 'izquierda' : 'derecha'} · ${row.latencyMs} ms · att ${row.att} · via ${source}`,
    )
    logLine(
      `#${samples.length} OK ${current.colorId}/${current.side} lat=${row.latencyMs}ms att=${row.att} src=${source}`,
    )
  } else {
    setArena('miss', 'NO BLINK')
    resultFeedback(
      false,
      `${current.colorName} · ${current.side === 'L' ? 'izquierda' : 'derecha'} · att ${row.att} · no se detectó parpadeo`,
    )
    logLine(`#${samples.length} NO_BLINK ${current.colorId}/${current.side} att=${row.att}`)
  }

  timer = setTimeout(() => {
    if (samples.length >= TRIALS) {
      phase = 'done'
      startBtn.disabled = false
      setArena('wait', 'FIN')
      summarize()
      return
    }
    nextTrial()
  }, 900)
}

function onBlink(source, strength = 70) {
  if (phase !== 'show' || blinkLocked) return
  const lat = performance.now() - stimulusAt
  // Ventana útil: desde ~40 ms (evita el flash) hasta fin de ensayo
  if (lat < 40) return
  if (lat > BLINK_WINDOW_MS) return
  blinkLocked = true
  lastBlinkStrength = strength
  endTrial(true, lat, source)
}

function fireStimulus() {
  if (phase !== 'wait') return
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const side = Math.random() < 0.5 ? 'L' : 'R'
  current = {
    colorId: color.id,
    colorName: color.name,
    side,
    attAtShow: attention ?? 0,
  }
  stimulusAt = performance.now()
  blinkLocked = false
  rawReady = false
  rawPeak = 0
  maxDelta = 0
  rawBaseline = rawPrev
  phase = 'show'
  prompt.textContent = ''
  setArena('flash', '')
  showBall(side, color)
  setTimeout(() => {
    if (phase === 'show') setArena('go', '')
  }, 80)

  timer = setTimeout(() => {
    if (phase === 'show') {
      logLine(`miss peak=${Math.round(rawPeak)} Δ=${Math.round(maxDelta)} (umbrales ${RAW_PEAK_MIN}/${RAW_DELTA_MIN})`)
      endTrial(false, 0, null)
    }
  }, BLINK_WINDOW_MS)
}

function nextTrial() {
  clearTimer()
  hideBall()
  trial += 1
  phase = 'wait'
  blinkEl.textContent = '—'
  pred.className = 'pred wait'
  predText.textContent = 'ESPERA'
  predDetail.textContent = 'Cuando salga la bola de color → parpadea'
  setArena('ready', 'ESPERA')
  const delay = 700 + Math.random() * 1400
  timer = setTimeout(fireStimulus, delay)
}

function startStudy() {
  samples.length = 0
  trial = 0
  startBtn.disabled = true
  logEl.textContent = ''
  logLine('Estudio blink+color+lado — parpadea al ver la bola')
  nextTrial()
}

startBtn.addEventListener('click', () => {
  if (phase === 'wait' || phase === 'show') return
  startStudy()
})

/** Blink desde MindWave (blinkStrength / flag) — a veces el RF no lo manda. */
function handleMindBlink(strength) {
  onBlink('headset', strength)
}

/**
 * Blink por raw (lo que ves subir en wave.html).
 * Usa pico vs baseline + delta entre muestras.
 */
function handleRaw(raw) {
  if (typeof raw !== 'number') return

  if (phase === 'wait' || phase === 'idle' || phase === 'feedback' || phase === 'done') {
    // Actualiza baseline en reposo
    rawBaseline = rawBaseline === 0 ? raw : rawBaseline * 0.95 + raw * 0.05
    rawPrev = raw
    rawReady = true
    return
  }

  if (phase !== 'show') {
    rawPrev = raw
    return
  }

  if (!rawReady) {
    rawPrev = raw
    rawBaseline = raw
    rawReady = true
    return
  }

  const delta = Math.abs(raw - rawPrev)
  const peak = Math.abs(raw - rawBaseline)
  rawPrev = raw
  if (delta > maxDelta) maxDelta = delta
  if (peak > rawPeak) rawPeak = peak
  updateHud()

  if (peak >= RAW_PEAK_MIN || delta >= RAW_DELTA_MIN) {
    onBlink('raw', Math.min(100, Math.max(peak, delta) / 12))
  }
}

function connect() {
  let ws
  try {
    ws = new WebSocket(WS_URL)
  } catch {
    connEl.textContent = 'sin bridge'
    setTimeout(connect, 2000)
    return
  }
  ws.onopen = () => {
    connEl.textContent = 'bridge ok'
  }
  ws.onclose = () => {
    connEl.textContent = 'desconectado'
    setTimeout(connect, 2000)
  }
  ws.onerror = () => ws.close()
  ws.onmessage = (ev) => {
    let data
    try {
      data = JSON.parse(ev.data)
    } catch {
      return
    }
    if (data.dongle?.state === 'connected') {
      connEl.textContent = `conectado ${data.dongle.headsetId || ''}`
    }
    if (typeof data.poorSignal === 'number') poorSignal = data.poorSignal
    if (typeof data.attention === 'number') attention = data.attention
    if (typeof data.meditation === 'number') meditation = data.meditation
    if (typeof data.blinkStrength === 'number' && data.blinkStrength >= 20) {
      handleMindBlink(data.blinkStrength)
    }
    if (data.blink || data.jump) handleMindBlink(60)
    if (typeof data.raw === 'number') handleRaw(data.raw)
    updateHud()
  }
}

connect()
updateHud()
setArena('wait', 'ESPERA')
predText.textContent = 'Listo'
