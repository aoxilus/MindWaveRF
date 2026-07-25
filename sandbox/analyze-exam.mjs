import fs from 'node:fs'

const j = JSON.parse(fs.readFileSync('study/mindwave-exam-20260724-1803.json', 'utf8'))
const trials = j.trials

function mean(a) {
  const x = a.filter((v) => typeof v === 'number' && !Number.isNaN(v))
  if (!x.length) return null
  return x.reduce((s, v) => s + v, 0) / x.length
}
function median(a) {
  const x = a.filter((v) => typeof v === 'number' && !Number.isNaN(v)).sort((p, q) => p - q)
  if (!x.length) return null
  const m = Math.floor(x.length / 2)
  return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2
}
function sd(a) {
  const x = a.filter((v) => typeof v === 'number' && !Number.isNaN(v))
  if (x.length < 2) return null
  const m = mean(x)
  return Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / (x.length - 1))
}
function pearson(xs, ys) {
  const pairs = xs
    .map((x, i) => [x, ys[i]])
    .filter(([x, y]) => typeof x === 'number' && typeof y === 'number')
  const n = pairs.length
  if (n < 3) return null
  const mx = mean(pairs.map((p) => p[0]))
  const my = mean(pairs.map((p) => p[1]))
  let num = 0
  let dx = 0
  let dy = 0
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my)
    dx += (x - mx) ** 2
    dy += (y - my) ** 2
  }
  if (dx === 0 || dy === 0) return null
  return num / Math.sqrt(dx * dy)
}
function groupBy(arr, key) {
  const m = {}
  for (const t of arr) {
    const k = t[key]
    ;(m[k] ||= []).push(t)
  }
  return m
}
const r2 = (a) => (a == null ? null : Math.round(a * 1000) / 1000)
const r1 = (a) => (a == null ? null : Math.round(a * 10) / 10)

const lat = trials.map((t) => t.latencyMs)
const attFig = trials.map((t) => t.attMeanOnFig)
const attZ = trials.map((t) => t.attAtZero)
const med = trials.map((t) => t.med)
const peak = trials.map((t) => t.peak)
const hits = trials.filter((t) => t.blink).length

const bySide = groupBy(trials, 'side')
const byShape = groupBy(trials, 'shape')
const byColor = groupBy(trials, 'colorId')

function summarize(groups) {
  const out = {}
  for (const [k, arr] of Object.entries(groups)) {
    out[k] = {
      n: arr.length,
      hit: arr.filter((t) => t.blink).length,
      latMean: r1(mean(arr.map((t) => t.latencyMs))),
      latMed: r1(median(arr.map((t) => t.latencyMs))),
      attFig: r1(mean(arr.map((t) => t.attMeanOnFig))),
      attZero: r1(mean(arr.map((t) => t.attAtZero))),
      med: r1(mean(arr.map((t) => t.med))),
      peak: r1(mean(arr.map((t) => t.peak))),
    }
  }
  return out
}

function etaSq(groups) {
  const all = Object.values(groups).flat()
  const y = all.map((t) => t.latencyMs)
  const gm = mean(y)
  let ssB = 0
  let ssT = 0
  for (const v of y) ssT += (v - gm) ** 2
  for (const arr of Object.values(groups)) {
    const m = mean(arr.map((t) => t.latencyMs))
    ssB += arr.length * (m - gm) ** 2
  }
  return ssT ? ssB / ssT : null
}

const phases = { reading: [], endblink: [], figure: [], other: [] }
let lastAtt = null
let lastMed = null
for (const w of j.waveLog) {
  if (w.att === lastAtt && w.med === lastMed) continue
  lastAtt = w.att
  lastMed = w.med
  const row = { t: w.t, att: w.att, med: w.med, signal: w.signal, tag: w.tag }
  if (w.tag === 'reading' || String(w.tag).startsWith('read-count')) phases.reading.push(row)
  else if (w.tag === 'endblink') phases.endblink.push(row)
  else if (w.tag === 'trial' || String(w.tag).startsWith('fig-')) phases.figure.push(row)
  else phases.other.push(row)
}

function phaseStats(rows) {
  const atts = rows.map((r) => r.att).filter((v) => typeof v === 'number')
  const meds = rows.map((r) => r.med).filter((v) => typeof v === 'number')
  const sigs = rows.map((r) => r.signal)
  return {
    nUpdates: rows.length,
    attMean: r1(mean(atts)),
    attMed: r1(median(atts)),
    attSd: r1(sd(atts)),
    attMin: atts.length ? Math.min(...atts) : null,
    attMax: atts.length ? Math.max(...atts) : null,
    medMean: r1(mean(meds)),
    medMed: r1(median(meds)),
    signalMean: r1(mean(sigs)),
    signalMax: sigs.length ? Math.max(...sigs) : null,
  }
}

const durMs = trials[trials.length - 1].zeroAt - (j.reading.startedAt || 0)
const cells = {}
for (const t of trials) {
  const k = `${t.side}|${t.shape}|${t.colorId}`
  ;(cells[k] ||= []).push(t.latencyMs)
}
const cellSummary = {}
for (const [k, arr] of Object.entries(cells)) {
  cellSummary[k] = { n: arr.length, latMean: r1(mean(arr)), latMed: r1(median(arr)) }
}

const out = {
  file: 'study/mindwave-exam-20260724-1803.json',
  at: j.at,
  study: j.study,
  promptHint: j.promptHint,
  n: trials.length,
  hits,
  hitRate: hits / trials.length,
  signalOk: trials.every((t) => t.signal === 0),
  sources: [...new Set(trials.map((t) => t.source))],
  durationApproxSec: r1(durMs / 1000),
  reading: {
    attMean: j.reading.attMean,
    attDuringRead: j.reading.attDuringRead,
    endBlinkOk: j.reading.endBlinkOk,
    endBlinkNeed: j.reading.endBlinkNeed,
    endBlinkSource: j.reading.endBlinkSource,
    readWindowMs: j.reading.endedAt - j.reading.startedAt,
  },
  latency: {
    mean: r1(mean(lat)),
    median: r1(median(lat)),
    sd: r1(sd(lat)),
    min: Math.min(...lat),
    max: Math.max(...lat),
  },
  att: {
    figMean: r1(mean(attFig)),
    figMed: r1(median(attFig)),
    figSd: r1(sd(attFig)),
    zeroMean: r1(mean(attZ)),
    medMean: r1(mean(med)),
    peakMean: r1(mean(peak)),
    peakMin: r1(Math.min(...peak)),
    peakMax: r1(Math.max(...peak)),
  },
  corr: {
    attFig_vs_lat: r2(pearson(attFig, lat)),
    attZero_vs_lat: r2(pearson(attZ, lat)),
    med_vs_lat: r2(pearson(med, lat)),
    peak_vs_lat: r2(pearson(peak, lat)),
    attFig_vs_peak: r2(pearson(attFig, peak)),
    attReadMean_minus_attFigMean: r1(j.reading.attMean - mean(attFig)),
  },
  etaSq_latency: {
    side: r2(etaSq(bySide)),
    shape: r2(etaSq(byShape)),
    color: r2(etaSq(byColor)),
  },
  bySide: summarize(bySide),
  byShape: summarize(byShape),
  byColor: summarize(byColor),
  phases: {
    reading: phaseStats(phases.reading),
    endblink: phaseStats(phases.endblink),
    figure: phaseStats(phases.figure),
  },
  waveLog: {
    rows: j.waveLog.length,
    uniqueAttUpdates:
      phases.reading.length + phases.endblink.length + phases.figure.length + phases.other.length,
  },
  cells: cellSummary,
}

fs.mkdirSync('docs/studies', { recursive: true })
fs.writeFileSync('docs/studies/mindwave-exam-20260724-1803.stats.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
