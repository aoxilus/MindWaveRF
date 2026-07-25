# ✅ Tasks · Tareas

<p>
  <em>by <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em> · closed from GitHub landscape + local sessions (Jul 2026).
</p>

## ✅ Closed · Cerradas

| ID | Task EN | Tarea ES | Evidence |
|----|---------|----------|----------|
| T01 | CH340 driver + COM docs | Driver CH340 + docs COM | `Drivers/`, `docs/connect.md` |
| T02 | Serial bridge @ 115200 → WS 13855 | Bridge serial → WebSocket | `server/serial-bridge.js` |
| T03 | Live wave monitor (att/med/raw/bands) | Monitor EEG en vivo | `wave.html` |
| T04 | Blink from raw peak (not only 0x16) | Blink por pico raw | `createBlinkFromRaw`, wave detector |
| T05 | Attention personal calibration | Calibración Attention | `attention.html` |
| T06 | Blink + color + side study + AI JSON | Estudio blink + export AI | `calibrate.html`, `docs/studies/` |
| T07 | Portal: Attention = power, blink = shoot | Portería mental | `portal.html` |
| T08 | Catch / no-go in portal | Catch no-go | `portal.js` |
| T09 | Landscape of public neurosky repos | Landscape GitHub | `docs/studies/github-neurosky-landscape.md` |
| T10 | Reading → figure factorial exam + math AI report | Examen lectura→figuras + informe | `study/…1803.json`, `docs/studies/mindwave-exam-analysis-*.md` |
| T11 | Show COM on connection pill | Puerto en pill de conexión | `src/wave.js` |
| T12 | Signal as 0–100 bar (not “buena”) | Señal en barra 0–100 | `src/wave.js` |
| T13 | Slower raw scope + band sparklines + compact nums | Scope lento + gráficas de bandas | `wave.html` / `wave.js` |
| T14 | Live FFT spectrogram 0–50 Hz on raw | Espectrograma FFT en vivo | `wave.js` `fftRadix2` |
| T15 | Bilingual emoji READMEs + function vectors | READMEs EN/ES + vectores | `README.md`, `README.es.md`, `docs/function-vectors.md` |
| T16 | Confirm: color/side/shape do **not** explain blink RT | Confirmar: estímulos no explican RT | η²≈0 in exam analysis |

### Deductions locked (do not reopen as “decode”)

- ❌ 1-channel MindWave **cannot** decode color / “thought left”.
- ✅ Blink = best voluntary discrete control.
- ✅ Attention = slow continuous axis (~1 Hz).
- ✅ Reading phase Attention ≫ figure phase (task contrast, not stimulus decode).

---

## 🔓 Open · Abiertas (nice-to-have)

| ID | Task EN | Tarea ES | Priority |
|----|---------|----------|----------|
| O01 | Attention → Monkey Run speed (runner pattern) | Attention → velocidad Monkey Run | Medium |
| O02 | Double-blink / long-blink = 2–3 commands | Doble/largo blink = más comandos | Low |
| O03 | Longer reading window (30–60 s) for time series | Lectura más larga para series | Medium |
| O04 | Export CSV of trials + optional raw ±500 ms @ zero | CSV + raw opcional alrededor del 0 | Low |
| O05 | Winsorize / flag RT outliers in UI | Marcar outliers de RT en UI | Low |
| O06 | GitHub About topics: `neurosky-mindwave` `bci` `eeg` `fft` | Topics en GitHub About | Easy |

---

## 📌 Session notes

- Baud that worked here: **115200** with signed CH340.
- Never TGC + `npm run serial` on same COM.
- Large `study/*.json` (waveLog) stay local / gitignored; keep `.stats.json` + analysis `.md` in `docs/studies/`.

---

<p align="center">🥑 <a href="https://github.com/aoxilus">aoxilus</a> · updated 2026-07-24</p>
