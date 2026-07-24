import {
  applyNoiseBackground,
  createMindwaveClient,
  downloadJson,
  mean,
  stamp,
} from './study-lib.js'

const PHASES = [
  {
    id: 'baseline',
    title: 'BASELINE',
    seconds: 30,
    hint: 'Mira el punto. Relaja. No fuerces foco.',
  },
  {
    id: 'focus',
    title: 'FOCO',
    seconds: 30,
    hint: 'Concéntrate en el punto. Cuenta mental 1…100.',
  },
  {
    id: 'distract',
    title: 'DISTRACCIÓN',
    seconds: 30,
    hint: 'Deja la mente suelta. Mira alrededor sin fijarte.',
  },
]

const connEl = document.querySelector('#conn')
const attEl = document.querySelector('#att')
const medEl = document.querySelector('#med')
const sigEl = document.querySelector('#sig')
const phaseEl = document.querySelector('#phase')
const prompt = document.querySelector('#prompt')
const dot = document.querySelector('#dot')
const predText = document.querySelector('#pred-text')
const predDetail = document.querySelector('#pred-detail')
const startBtn = document.querySelector('#start')
const exportBtn = document.querySelector('#export')
const logEl = document.querySelector('#log')
const arena = document.querySelector('#arena')

applyNoiseBackground(document.body)
arena.classList.add('noise')
applyNoiseBackground(arena)

/** @type {{phase:string, t:number, att:number, med:number|null, signal:number}[]} */
const series = []
let mind = { attention: null, meditation: null, poorSignal: 200, status: 'off' }
let result = null
let running = false
let phaseIdx = -1
let phaseEnds = 0
let tickTimer = 0

function log(s) {
  logEl.textContent = `${s}\n${logEl.textContent}`.slice(0, 5000)
}

function hud() {
  connEl.textContent = mind.status
  attEl.textContent = mind.attention == null ? '—' : String(mind.attention)
  medEl.textContent = mind.meditation == null ? '—' : String(mind.meditation)
  sigEl.textContent = mind.poorSignal === 0 ? 'buena' : String(mind.poorSignal)
}

createMindwaveClient({
  onUpdate(state) {
    mind = { ...state }
    hud()
  },
})

function finish() {
  running = false
  clearInterval(tickTimer)
  startBtn.disabled = false
  exportBtn.disabled = false
  dot.classList.remove('on')
  phaseEl.textContent = 'fin'

  const by = Object.fromEntries(PHASES.map((p) => [p.id, series.filter((r) => r.phase === p.id)]))
  const mBase = mean(by.baseline.map((r) => r.att).filter((x) => x > 0))
  const mFocus = mean(by.focus.map((r) => r.att).filter((x) => x > 0))
  const mDist = mean(by.distract.map((r) => r.att).filter((x) => x > 0))
  const enter = mFocus != null && mDist != null ? (mFocus + mDist) / 2 : 60
  const exit = enter - 12

  result = {
    study: 'attention-threshold',
    at: Date.now(),
    means: { baseline: mBase, focus: mFocus, distract: mDist },
    threshold: { enter, exit },
    series,
    note: 'Umbral personal Attention. Exportar a AI para revisar separación foco vs distracción.',
  }

  try {
    localStorage.setItem('mindwave-attention-cal', JSON.stringify(result))
  } catch {
    // ignore
  }

  prompt.textContent = 'LISTO'
  predText.textContent = `Umbral ${enter.toFixed(0)}`
  predDetail.textContent = `baseline ${mBase?.toFixed(0) ?? '—'} · foco ${mFocus?.toFixed(0) ?? '—'} · dist ${mDist?.toFixed(0) ?? '—'} · exit ${exit.toFixed(0)}`
  log(
    `RESULT enter=${enter.toFixed(1)} exit=${exit.toFixed(1)} base=${mBase?.toFixed(1)} focus=${mFocus?.toFixed(1)} dist=${mDist?.toFixed(1)}`,
  )
}

function runPhase(i) {
  phaseIdx = i
  if (i >= PHASES.length) {
    finish()
    return
  }
  const p = PHASES[i]
  phaseEl.textContent = p.id
  prompt.textContent = `${p.title}\n${p.seconds}s`
  predText.textContent = p.title
  predDetail.textContent = p.hint
  dot.classList.toggle('on', p.id !== 'distract')
  phaseEnds = performance.now() + p.seconds * 1000
  log(`FASE ${p.id}`)
}

function onTick() {
  if (!running || phaseIdx < 0 || phaseIdx >= PHASES.length) return
  const p = PHASES[phaseIdx]
  const left = Math.max(0, Math.ceil((phaseEnds - performance.now()) / 1000))
  prompt.textContent = `${p.title}\n${left}s`

  if (typeof mind.attention === 'number' && mind.attention > 0) {
    series.push({
      phase: p.id,
      t: Date.now(),
      att: mind.attention,
      med: mind.meditation,
      signal: mind.poorSignal,
    })
  }

  if (performance.now() >= phaseEnds) runPhase(phaseIdx + 1)
}

startBtn.addEventListener('click', () => {
  if (running) return
  series.length = 0
  result = null
  exportBtn.disabled = true
  running = true
  startBtn.disabled = true
  logEl.textContent = ''
  log('Inicio calibración Attention')
  clearInterval(tickTimer)
  runPhase(0)
  tickTimer = setInterval(onTick, 500)
})

exportBtn.addEventListener('click', () => {
  if (!result) return
  downloadJson(`mindwave-attention-${stamp()}.json`, {
    ...result,
    forAI: true,
    colorsNote: 'Este test no usa color; solo Attention eSense.',
    promptHint:
      'Analiza separación baseline/foco/distracción. Valida umbral enter/exit. Comenta calidad de señal.',
  })
})
