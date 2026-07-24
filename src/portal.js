import {
  FLAT_COLORS,
  applyNoiseBackground,
  createMindwaveClient,
  downloadJson,
  stamp,
} from './study-lib.js'

const SHOTS = 30
const CATCH_RATE = 0.25
const WINDOW_MS = 2500

const connEl = document.querySelector('#conn')
const attEl = document.querySelector('#att')
const thrEl = document.querySelector('#thr')
const sigEl = document.querySelector('#sig')
const nEl = document.querySelector('#n')
const arena = document.querySelector('#arena')
const goal = document.querySelector('#goal')
const shape = document.querySelector('#shape')
const power = document.querySelector('#power')
const prompt = document.querySelector('#prompt')
const pred = document.querySelector('#pred')
const predText = document.querySelector('#pred-text')
const predDetail = document.querySelector('#pred-detail')
const startBtn = document.querySelector('#start')
const exportBtn = document.querySelector('#export')
const logEl = document.querySelector('#log')

applyNoiseBackground(document.body)
arena.classList.add('noise')
applyNoiseBackground(arena)

/** @type {object[]} */
const trials = []
let mind = { attention: null, meditation: null, poorSignal: 200, status: 'off' }
let threshold = 60
let phase = 'idle' // idle | wait | aim | done
let current = null
let timer = 0
let armed = false
let shotLock = false

try {
  const cal = JSON.parse(localStorage.getItem('mindwave-attention-cal') || 'null')
  if (cal?.threshold?.enter) {
    threshold = cal.threshold.enter
    thrEl.textContent = String(Math.round(threshold))
  }
} catch {
  // ignore
}

function log(s) {
  logEl.textContent = `${s}\n${logEl.textContent}`.slice(0, 6000)
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = 0
  }
}

function setShape(color) {
  shape.className = `shape ${color.shape}`
  if (color.shape === 'triangle') {
    shape.style.borderBottomColor = color.css
    shape.style.background = 'transparent'
  } else {
    shape.style.background = color.css
    shape.style.borderBottomColor = ''
  }
}

function hud() {
  connEl.textContent = mind.status
  attEl.textContent = mind.attention == null ? '—' : String(mind.attention)
  sigEl.textContent = mind.poorSignal === 0 ? 'buena' : String(mind.poorSignal)
  const att = mind.attention ?? 0
  power.style.width = `${Math.max(0, Math.min(100, att))}%`
  power.style.background = att >= threshold ? '#00a651' : '#111'
  if (phase === 'aim' && current && !current.catchTrial) {
    armed = att >= threshold
    goal.classList.toggle('armed', armed)
  }
}

createMindwaveClient({
  onUpdate(state) {
    mind = { ...state }
    hud()
  },
  onBlink(ev) {
    if (phase !== 'aim' || shotLock || !current) return
    const lat = performance.now() - current.shownAt
    if (lat < 80 || lat > WINDOW_MS) return
    resolveShot(true, lat, ev.source)
  },
})

function resolveShot(blinked, latencyMs, source) {
  if (phase !== 'aim' || !current || shotLock) return
  shotLock = true
  clearTimer()

  const att = mind.attention ?? current.attAtShow
  const powered = att >= threshold
  let outcome = 'miss'
  if (current.catchTrial) {
    outcome = blinked ? 'false_positive' : 'correct_reject'
  } else if (blinked && powered) {
    outcome = 'hit'
  } else if (blinked && !powered) {
    outcome = 'early_blink'
  } else {
    outcome = 'timeout'
  }

  const row = {
    ...current,
    blinked,
    latencyMs: blinked ? Math.round(latencyMs) : null,
    source: blinked ? source : null,
    att,
    med: mind.meditation,
    signal: mind.poorSignal,
    powered,
    threshold,
    outcome,
    t: Date.now(),
  }
  trials.push(row)
  nEl.textContent = `${trials.length}/${SHOTS}`

  const ok = outcome === 'hit' || outcome === 'correct_reject'
  pred.className = ok ? 'pred focus' : 'pred bad'
  predText.textContent = outcome.toUpperCase()
  predDetail.textContent = `${current.colorName} · ${current.side} · att ${att} · thr ${threshold.toFixed(0)}${
    blinked ? ` · ${Math.round(latencyMs)}ms` : ''
  }`
  log(
    `#${trials.length} ${outcome} ${current.colorId}/${current.side}${current.catchTrial ? ' CATCH' : ''} att=${att}`,
  )

  goal.classList.add('hidden')
  prompt.textContent = outcome.toUpperCase()
  phase = 'wait'
  timer = setTimeout(() => {
    if (trials.length >= SHOTS) endSession()
    else nextTrial()
  }, 850)
}

function endSession() {
  phase = 'done'
  startBtn.disabled = false
  exportBtn.disabled = false
  clearTimer()
  goal.classList.add('hidden')
  const hits = trials.filter((t) => t.outcome === 'hit').length
  const fp = trials.filter((t) => t.outcome === 'false_positive').length
  const cr = trials.filter((t) => t.outcome === 'correct_reject').length
  prompt.textContent = 'FIN'
  pred.className = 'pred wait'
  predText.textContent = `Hits ${hits}`
  predDetail.textContent = `false+ ${fp} · correct reject ${cr} · exporta JSON para la AI`
  log(`RESUMEN hits=${hits} fp=${fp} cr=${cr}`)
  try {
    localStorage.setItem(
      'mindwave-portal',
      JSON.stringify({ trials, threshold, at: Date.now() }),
    )
  } catch {
    // ignore
  }
}

function nextTrial() {
  clearTimer()
  shotLock = false
  armed = false
  phase = 'wait'
  goal.classList.add('hidden')
  goal.classList.remove('armed', 'catch')
  prompt.textContent = 'ESPERA'
  pred.className = 'pred wait'
  predText.textContent = 'ESPERA'
  predDetail.textContent = 'Cuando veas la forma: sube Attention y parpadea'

  const delay = 600 + Math.random() * 1200
  timer = setTimeout(() => {
    const color = FLAT_COLORS[Math.floor(Math.random() * FLAT_COLORS.length)]
    const side = Math.random() < 0.5 ? 'L' : 'R'
    const catchTrial = Math.random() < CATCH_RATE
    current = {
      colorId: color.id,
      colorName: color.name,
      shape: color.shape,
      side,
      catchTrial,
      attAtShow: mind.attention ?? 0,
      shownAt: performance.now(),
    }
    setShape(color)
    goal.className = `goal ${side}${catchTrial ? ' catch' : ''}`
    goal.classList.remove('hidden')
    prompt.textContent = catchTrial ? 'NO DISPARES' : ''
    phase = 'aim'
    hud()
    timer = setTimeout(() => {
      if (phase === 'aim') resolveShot(false, 0, null)
    }, WINDOW_MS)
  }, delay)
}

startBtn.addEventListener('click', () => {
  if (phase === 'wait' || phase === 'aim') return
  trials.length = 0
  exportBtn.disabled = true
  startBtn.disabled = true
  logEl.textContent = ''
  nEl.textContent = `0/${SHOTS}`
  log(`Inicio portería thr=${threshold}`)
  nextTrial()
})

exportBtn.addEventListener('click', () => {
  if (!trials.length) return
  downloadJson(`mindwave-portal-${stamp()}.json`, {
    study: 'portal-mental',
    forAI: true,
    hypothesis:
      'Se puede correlacionar Attention + blink con color (R/G/B/Y), forma y lado (L/R). Incluye catch trials.',
    threshold,
    trials,
    promptHint:
      'Analiza hit rate, false positives en catch, latencia blink, Attention al disparo, diferencias por color y lado L/R. Sé explícito sobre límites de decodificación EEG 1 canal vs correlación conductual.',
  })
})
