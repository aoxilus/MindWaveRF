# 🧬 Function vectors · Vectores de funciones

<p>
  <em>by <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em> · condensed map of what each module does (EN + ES).
</p>

Pipeline mental:

```text
Dongle COM ──► serial-bridge / TGC ──► WS :13855 ──► browser apps
                     │
                     └─ thinkgear.js parser (AA AA packets)
```

---

## 🌉 Server · Bridge

| Vector | File | Role EN | Rol ES |
|--------|------|---------|--------|
| `createThinkGearParser` | `server/thinkgear.js` | Parse binary TG stream → attention, meditation, raw, bands, RF status | Parsea stream TG → métricas + estado RF |
| `RF.*` | `server/thinkgear.js` | Dongle cmds (`AUTO_CONNECT`, `DISCONNECT`, …) | Comandos del dongle |
| `broadcast` / `main` | `server/serial-bridge.js` | Open COM @ 115200, pulse DTR/RTS, WS fan-out | Abre COM, pulso DTR/RTS, reparte por WS |
| `connectTgc` | `server/tgc-bridge.js` | Official TGC TCP `13854` → WS `13855` | TGC oficial → WebSocket |

---

## 📡 Client shared · Cliente compartido

| Vector | File | Role EN | Rol ES |
|--------|------|---------|--------|
| `createMindwaveClient` | `src/study-lib.js` | WS client + reconnect | Cliente WS + reintento |
| `createBlinkFromRaw` | `src/study-lib.js` | Blink from raw peak/delta (≥380 / ≥280) | Blink por pico/delta raw |
| `buildBalancedTrialPlan` | `src/study-lib.js` | Factorial L/C/R × shape × color | Plan factorial balanceado |
| `saveStudyBackstage` / `downloadJson` | `src/study-lib.js` | Persist / export session JSON for AI | Guardar / exportar JSON para AI |
| `applyNoiseBackground` | `src/study-lib.js` | Colored noise backdrop (stimulus stays flat) | Fondo con ruido de color |
| `createMindInput` | `src/mind.js` | Game bridge: attention + jump/blink | Puente juego: attention + salto |

---

## 📈 Wave monitor · Monitor

| Vector | File | Role EN | Rol ES |
|--------|------|---------|--------|
| `createSmoothMetric` | `src/wave.js` | Median + EMA smoother | Suavizado mediana + EMA |
| `createFocusClassifier` | `src/wave.js` | Focus hysteresis (enter 52 / exit 38) | Concentrado con histéresis |
| `createBlinkDetector` | `src/wave.js` | BlinkStrength + raw spike | Blink oficial + pico raw |
| `fftRadix2` / `pushFftSample` | `src/wave.js` | Live FFT N=256 @ 512 Hz, 0–50 Hz | FFT en vivo del raw |
| `paintSpectrogramColumn` | `src/wave.js` | Scrolling spectrogram | Espectrograma que avanza |
| `draw` / `drawBand` | `src/wave.js` | Raw scope + NeuroSky band sparklines | Scope + sparklines de bandas |

**Signal rates (chip reality):**

| Signal | ~Hz |
|--------|----:|
| Raw EEG | 512 |
| Attention / Meditation / bands | ~1 |
| Blink event | sparse |

---

## 🧪 Studies · Estudios

| App | Key vectors | Deduction target |
|-----|-------------|------------------|
| `attention.js` | phases baseline→focus→distract | Personal Attention threshold |
| `calibrate.js` | reading countdown → fig countdown → blink@0 | RT + att reading vs figures · **not** color decode |
| `portal.js` | Attention → power bar · blink → shot · catch no-go | Continuous + discrete control (community pattern) |
| `game.js` / `main.js` | `createGame` + mind input | Monkey Run |

---

## 🧮 Math we actually use

| Tool | Where | Why not Laplace |
|------|-------|-----------------|
| EMA / median | wave focus meters | Denoise 1 Hz eSense |
| Pearson / η² | `docs/studies/*.stats.json` | Session analysis |
| FFT (Fourier) | `wave.js` spectrogram | Sinusoid stack of raw EEG |
| Laplace | — | Better for LTI system models; not for live EEG display |

---

## 🌍 Community → our vectors

From [`github-neurosky-landscape.md`](studies/github-neurosky-landscape.md):

| Community | Our function |
|-----------|--------------|
| Runner: Attention = speed | Portal power · (Monkey Run next) |
| Wheelchair: blink = command | `createBlinkFromRaw` / portal shot |
| MindViewer plots | `wave.html` + FFT |
| ArduMind drivers | `Drivers/` + `serial-bridge` |
| Datasets / ML later | `study/*.json` + AI export |

---

<p align="center">🥑 <a href="https://github.com/aoxilus">aoxilus</a></p>
