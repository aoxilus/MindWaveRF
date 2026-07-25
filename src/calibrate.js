/**
 * Estudio lectura + forma (UI mínima).
 *
 * 1) Empezar → texto de lectura + cuenta 5…1 midiendo ondas
 * 2) Al acabar lectura → “parpadea 1|2|3 veces” (marca fin de lectura)
 * 3) Figura (L/C/R × círculo/cuadro/triángulo × color), cada combo ×2
 *    Timer SOBRE la figura: 4 3 2 1 0 → blink en 0
 * 4) JSON para AI se guarda backstage (localStorage + download silencioso)
 */
import {
  applyNoiseBackground,
  buildBalancedTrialPlan,
  createMindwaveClient,
  mean,
  saveStudyBackstage,
  stamp,
} from './study-lib.js'

const COUNT_STEP_MS = 800
const BLINK_AFTER_ZERO_MS = 2200
const INTER_TRIAL_MS = 700
const REPS = 2

const READING_TEXT =
  'Lee en silencio. El estudio mide tus ondas mientras lees. ' +
  'Cuando termine la cuenta, parpadea las veces que te indiquen. ' +
  'Después verás figuras: posición, forma y color. ' +
  'El número baja sobre la figura; en el 0, un parpadeo.'

const gate = document.querySelector('#gate')
const stage = document.querySelector('#stage')
const startBtn = document.querySelector('#start')
const stopBtn = document.querySelector('#stop')
const readEl = document.querySelector('#read')
const cueEl = document.querySelector('#cue')
const stim = document.querySelector('#stim')
const shape = document.querySelector('#shape')
const onfig = document.querySelector('#onfig')
const connEl = document.querySelector('#conn')

applyNoiseBackground(document.body, { tint: '#14141c' })

/** @type {'idle'|'reading'|'endblink'|'trial'|'done'} */
let phase = 'idle'
let mind = { attention: null, meditation: null, poorSignal: 200, status: 'off' }
let timer = 0
let plan = []
let trialIndex = 0
/** @type {object[]} */
const trials = []
/** @type {object[]} */
const waveLog = []
let readingMeta = null
let endBlinkNeed = 1
let endBlinkGot = 0
let blinkLocked = false
let zeroAt = 0
let current = null
let sessionStart = 0

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = 0
  }
}

function showGate(on) {
  gate.classList.toggle('hidden', !on)
  stage.classList.toggle('hidden', on)
  startBtn.hidden = !on
  stopBtn.hidden = !on
}

function setShape(trial) {
  shape.className = `shape ${trial.shape}`
  if (trial.shape === 'triangle') {
    shape.style.borderBottomColor = trial.colorCss
    shape.style.background = 'transparent'
  } else {
    shape.style.background = trial.colorCss
    shape.style.borderBottomColor = ''
  }
}

function pushWave(tag) {
  waveLog.push({
    tag,
    t: Date.now() - sessionStart,
    att: mind.attention,
    med: mind.meditation,
    signal: mind.poorSignal,
  })
}

const client = createMindwaveClient({
  onUpdate(state) {
    mind = { ...state }
    if (connEl && state.status) {
      // status oculto: solo para debug si se desoculta
      connEl.textContent = state.status
    }
    if (phase === 'reading' || phase === 'trial' || phase === 'endblink') {
      pushWave(phase)
    }
  },
  onBlink(ev) {
    if (phase === 'endblink') {
      endBlinkGot += 1
      cueEl.textContent = `Parpadea ${endBlinkNeed} ${endBlinkNeed === 1 ? 'vez' : 'veces'}  (${endBlinkGot}/${endBlinkNeed})`
      if (endBlinkGot >= endBlinkNeed) {
        readingMeta.endBlinkOk = true
        readingMeta.endBlinkAt = Date.now() - sessionStart
        readingMeta.endBlinkSource = ev.source
        clearTimer()
        cueEl.textContent = ''
        startTrials()
      }
      return
    }
    if (phase !== 'trial' || blinkLocked || !current?.awaitBlink) return
    const lat = performance.now() - zeroAt
    if (lat < 30 || lat > BLINK_AFTER_ZERO_MS) return
    blinkLocked = true
    finishTrial(true, lat, ev.source, ev.peak)
  },
})

function runCount(from, onTick, onDone, { stopAt = 0 } = {}) {
  let n = from
  const step = () => {
    onTick(n)
    if (n <= stopAt) {
      onDone()
      return
    }
    n -= 1
    timer = setTimeout(step, COUNT_STEP_MS)
  }
  step()
}

function beginReading() {
  clearTimer()
  phase = 'reading'
  sessionStart = Date.now()
  waveLog.length = 0
  trials.length = 0
  trialIndex = 0
  plan = buildBalancedTrialPlan({ reps: REPS })
  readingMeta = {
    text: READING_TEXT,
    countdownFrom: 5,
    startedAt: 0,
    endedAt: null,
    endBlinkNeed: 0,
    endBlinkOk: false,
    attDuringRead: [],
  }
  showGate(false)
  stim.classList.add('hidden')
  readEl.classList.remove('hidden')
  readEl.textContent = READING_TEXT
  cueEl.textContent = ''
  readingMeta.startedAt = Date.now() - sessionStart

  runCount(
    5,
    (n) => {
      cueEl.textContent = String(n)
      if (typeof mind.attention === 'number') readingMeta.attDuringRead.push(mind.attention)
      pushWave(`read-count-${n}`)
    },
    () => {
      readingMeta.endedAt = Date.now() - sessionStart
      readingMeta.attMean = mean(readingMeta.attDuringRead)
      finishReadingSignal()
    },
    { stopAt: 1 },
  )
}

function finishReadingSignal() {
  phase = 'endblink'
  readEl.classList.add('hidden')
  endBlinkNeed = 1 + Math.floor(Math.random() * 3) // 1..3
  endBlinkGot = 0
  readingMeta.endBlinkNeed = endBlinkNeed
  cueEl.textContent = `Parpadea ${endBlinkNeed} ${endBlinkNeed === 1 ? 'vez' : 'veces'}`
  // timeout si no completa blinks
  timer = setTimeout(() => {
    if (phase !== 'endblink') return
    readingMeta.endBlinkOk = false
    cueEl.textContent = ''
    startTrials()
  }, 8000 + endBlinkNeed * 1200)
}

function startTrials() {
  clearTimer()
  phase = 'trial'
  cueEl.textContent = ''
  readEl.classList.add('hidden')
  nextTrial()
}

function nextTrial() {
  clearTimer()
  if (trialIndex >= plan.length) {
    finishSession()
    return
  }
  current = {
    ...plan[trialIndex],
    i: trialIndex + 1,
    n: plan.length,
    awaitBlink: false,
    shownAt: Date.now() - sessionStart,
  }
  blinkLocked = false
  client.blink.resetPeak()
  setShape(current)
  stim.className = `exam-stim ${current.side}`
  stim.classList.remove('hidden')
  onfig.textContent = ''
  cueEl.textContent = ''

  runCount(
    4,
    (n) => {
      onfig.textContent = String(n)
      pushWave(`fig-${current.side}-${current.shape}-${current.colorId}-${n}`)
      if (typeof mind.attention === 'number') {
        current.attSamples = current.attSamples || []
        current.attSamples.push(mind.attention)
      }
    },
    () => {
      onfig.textContent = '0'
      current.awaitBlink = true
      zeroAt = performance.now()
      current.zeroAt = Date.now() - sessionStart
      current.attAtZero = mind.attention
      timer = setTimeout(() => {
        if (phase === 'trial' && current?.awaitBlink && !blinkLocked) {
          finishTrial(false, 0, null, client.blink.getPeak())
        }
      }, BLINK_AFTER_ZERO_MS)
    },
  )
}

function finishTrial(blink, latencyMs, source, peak) {
  if (!current) return
  current.awaitBlink = false
  clearTimer()
  stim.classList.add('hidden')
  onfig.textContent = ''

  trials.push({
    i: current.i,
    side: current.side,
    shape: current.shape,
    colorId: current.colorId,
    colorName: current.colorName,
    rep: current.rep,
    reps: current.reps,
    shownAt: current.shownAt,
    zeroAt: current.zeroAt,
    blink,
    latencyMs: blink ? Math.round(latencyMs) : null,
    source: blink ? source : null,
    peak: peak ?? client.blink.getPeak(),
    attMeanOnFig: mean(current.attSamples || []),
    attAtZero: current.attAtZero ?? mind.attention,
    med: mind.meditation,
    signal: mind.poorSignal,
  })

  trialIndex += 1
  timer = setTimeout(nextTrial, INTER_TRIAL_MS)
}

function finishSession() {
  phase = 'done'
  clearTimer()
  stim.classList.add('hidden')
  readEl.classList.add('hidden')
  cueEl.textContent = 'Listo'
  const payload = {
    study: 'reading-waves-then-shape-position-color',
    forAI: true,
    savedBackstage: true,
    at: new Date().toISOString(),
    design: {
      sides: ['L', 'C', 'R'],
      shapes: ['circle', 'square', 'triangle'],
      colors: ['R', 'G', 'B'],
      reps: REPS,
      trialsPlanned: plan.length,
      figureCountdown: [4, 3, 2, 1, 0],
      readingCountdown: [5, 4, 3, 2, 1],
      endReadingSignal: 'blink 1-3 times',
    },
    reading: readingMeta,
    trials,
    waveLog,
    summary: {
      blinkHit: trials.filter((t) => t.blink).length,
      trialCount: trials.length,
      attReadMean: readingMeta?.attMean ?? null,
    },
    promptHint:
      'Analiza ondas (waveLog + att) DURANTE lectura vs figuras. Posición L/C/R, forma, color con repeticiones. Latencia blink en 0. El blink 1-3 marca fin de lectura. No asumas decodificación de color desde 1 canal.',
  }
  saveStudyBackstage(`mindwave-exam-${stamp()}.json`, payload)
  timer = setTimeout(() => {
    cueEl.textContent = ''
    phase = 'idle'
    showGate(true)
  }, 1600)
}

startBtn.addEventListener('click', () => {
  if (phase !== 'idle' && phase !== 'done') return
  beginReading()
})

stopBtn.addEventListener('click', () => {
  clearTimer()
  phase = 'idle'
  cueEl.textContent = ''
  readEl.classList.add('hidden')
  stim.classList.add('hidden')
  showGate(true)
})

showGate(true)
