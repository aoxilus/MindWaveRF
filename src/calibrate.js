/**
 * Estudio blink + color + lado.
 * Estímulos: formas simples + colores planos (sin gradient).
 * Fondo: ruido. Export JSON para AI (hipótesis color/lado).
 */
import {
  FLAT_COLORS,
  applyNoiseBackground,
  createMindwaveClient,
  downloadJson,
  mean,
  stamp,
} from './study-lib.js'

const TRIALS = 24
const BLINK_WINDOW_MS = 2000

const connEl = document.querySelector('#conn')
const attEl = document.querySelector('#att')
const sigEl = document.querySelector('#sig')
const blinkEl = document.querySelector('#blink')
const nEl = document.querySelector('#n')
const arena = document.querySelector('#arena')
const prompt = document.querySelector('#prompt')
const stim = document.querySelector('#stim')
const shape = document.querySelector('#shape')
const pred = document.querySelector('#pred')
const predText = document.querySelector('#pred-text')
const predDetail = document.querySelector('#pred-detail')
const startBtn = document.querySelector('#start')
const exportBtn = document.querySelector('#export')
const logEl = document.querySelector('#log')

applyNoiseBackground(document.body)
applyNoiseBackground(arena)

/** @type {object[]} */
const samples = []
let mind = { attention: null, meditation: null, poorSignal: 200, status: 'off', linked: false }
let phase = 'idle'
let current = null
let timer = 0
let blinkLocked = false
let stimulusAt = 0

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
  }
}

function hud() {
  connEl.textContent = mind.status
  attEl.textContent = mind.attention == null ? '—' : String(mind.attention)
  sigEl.textContent = mind.poorSignal === 0 ? 'buena' : String(mind.poorSignal)
}

const client = createMindwaveClient({
  onUpdate(state) {
    mind = { ...state }
    hud()
  },
  onBlink(ev) {
    if (phase !== 'show' || blinkLocked) return
    const lat = performance.now() - stimulusAt
    if (lat < 40 || lat > BLINK_WINDOW_MS) return
    blinkLocked = true
    endTrial(true, lat, ev.source, ev.peak)
  },
})

function resultFeedback(ok, detail) {
  pred.className = ok ? 'pred focus' : 'pred bad'
  predText.textContent = ok ? 'OK' : 'NO BLINK'
  predDetail.textContent = detail
}

function summarize() {
  const ok = samples.filter((s) => s.blink)
  const hitRate = samples.length ? ok.length / samples.length : 0
  const attOk = mean(ok.map((s) => s.att))
  pred.className = 'pred wait'
  predText.textContent = `Hit ${(hitRate * 100).toFixed(0)}%`
  predDetail.textContent = `blink OK ${ok.length}/${samples.length} · att@OK ${attOk?.toFixed(0) ?? '—'}`
  exportBtn.disabled = false
  log(`RESUMEN hit=${(hitRate * 100).toFixed(0)}%`)
  try {
    localStorage.setItem(
      'mindwave-blink-study',
      JSON.stringify({ samples, at: Date.now(), hitRate, attOk }),
    )
  } catch {
    // ignore
  }
}

function endTrial(blink, latencyMs, source, peak) {
  if (phase !== 'show' || !current) return
  clearTimer()
  phase = 'feedback'
  stim.classList.add('hidden')

  const row = {
    ...current,
    blink,
    latencyMs: blink ? Math.round(latencyMs) : null,
    source: blink ? source : null,
    peak: peak ?? client.blink.getPeak(),
    att: mind.attention ?? current.attAtShow,
    med: mind.meditation ?? 0,
    signal: mind.poorSignal,
    t: Date.now(),
  }
  samples.push(row)
  nEl.textContent = `${samples.length}/${TRIALS}`

  if (blink) {
    prompt.textContent = 'OK'
    resultFeedback(
      true,
      `${current.colorName} ${current.shape} · ${current.side === 'L' ? 'izq' : 'der'} · ${row.latencyMs} ms · att ${row.att}`,
    )
    log(`#${samples.length} OK ${current.colorId}/${current.side}/${current.shape} ${row.latencyMs}ms`)
  } else {
    prompt.textContent = 'NO BLINK'
    resultFeedback(
      false,
      `${current.colorName} · ${current.side} · peak ${Math.round(row.peak || 0)} · att ${row.att}`,
    )
    log(`#${samples.length} NO_BLINK ${current.colorId}/${current.side} peak=${Math.round(row.peak || 0)}`)
  }

  timer = setTimeout(() => {
    if (samples.length >= TRIALS) {
      phase = 'done'
      startBtn.disabled = false
      prompt.textContent = 'FIN'
      summarize()
      return
    }
    nextTrial()
  }, 850)
}

function fireStimulus() {
  if (phase !== 'wait') return
  const color = FLAT_COLORS[Math.floor(Math.random() * FLAT_COLORS.length)]
  const side = Math.random() < 0.5 ? 'L' : 'R'
  current = {
    colorId: color.id,
    colorName: color.name,
    shape: color.shape,
    side,
    attAtShow: mind.attention ?? 0,
  }
  stimulusAt = performance.now()
  blinkLocked = false
  client.blink.resetPeak()
  phase = 'show'
  setShape(color)
  stim.className = `goal ${side}`
  stim.classList.remove('hidden')
  prompt.textContent = ''
  timer = setTimeout(() => {
    if (phase === 'show') endTrial(false, 0, null, client.blink.getPeak())
  }, BLINK_WINDOW_MS)
}

function nextTrial() {
  clearTimer()
  stim.classList.add('hidden')
  phase = 'wait'
  blinkEl.textContent = '—'
  pred.className = 'pred wait'
  predText.textContent = 'ESPERA'
  predDetail.textContent = 'Cuando salga la forma de color → parpadea'
  prompt.textContent = 'ESPERA'
  timer = setTimeout(fireStimulus, 700 + Math.random() * 1200)
}

startBtn.addEventListener('click', () => {
  if (phase === 'wait' || phase === 'show') return
  samples.length = 0
  exportBtn.disabled = true
  startBtn.disabled = true
  logEl.textContent = ''
  nEl.textContent = `0/${TRIALS}`
  log('Estudio blink+color+forma+lado')
  nextTrial()
})

exportBtn.addEventListener('click', () => {
  if (!samples.length) return
  downloadJson(`mindwave-blink-color-${stamp()}.json`, {
    study: 'blink-color-side-shape',
    forAI: true,
    hypothesis:
      'Blink latency y Attention pueden correlacionar con color (R/G/B/Y), forma y posición L/R. Estímulos planos + fondo con ruido.',
    visual: { flatColors: true, shapes: true, noiseBackground: true, noStimulusGradient: true },
    samples,
    promptHint:
      'Analiza hit rate, latencia por color/lado/forma, Attention. Separa correlación conductual de decodificación EEG. Recomienda siguiente diseño experimental.',
  })
})

// live peak while showing
setInterval(() => {
  if (phase === 'show') blinkEl.textContent = String(Math.round(client.blink.getPeak()))
}, 100)
