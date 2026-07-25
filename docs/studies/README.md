# 🧪 BCI Studies · Estudios BCI

<p>
  <strong>EN</strong> — Data-collection tools (separate from Monkey Run). Export JSON for another AI.<br/>
  <strong>ES</strong> — Herramientas para agarrar datos (aparte de Monkey Run). Exporta JSON para otra AI.
</p>

🎨 **Stimuli:** simple shapes + **flat colors** (no gradient on the figure).  
🌫️ **Backgrounds:** noise / film grain so the stimulus stays readable.

---

## 📄 Pages · Páginas

| URL | 🇺🇸 English | 🇪🇸 Español |
|-----|-------------|------------|
| `/attention.html` | 🎯 Personal Attention threshold | Umbral Attention personal |
| `/calibrate.html` | 👁️ Blink + color + shape + L/R | Blink + color + forma + izq/der |
| `/portal.html` | ⚽ Attention arms · blink shoots · catch | Portería + catch no-go |
| `/wave.html` | 📈 Continuous monitor | Monitor continuo |

---

## ▶️ Run · Correr

```powershell
npm run serial -- COM18 115200
npm run attention   # or: calibrate / portal / waves
```

| Script | Opens |
|--------|--------|
| `npm run attention` | 🎯 Attention cal |
| `npm run calibrate` | 👁️ Blink study |
| `npm run portal` | ⚽ Portería |
| `npm run waves` | 📈 Monitor |

---

## 📤 Export to an AI · Exportar a una AI

Each study has **Export JSON (AI)**.

The file includes:

- `study`, `hypothesis`, `promptHint`
- trials with `colorId`, `side`, `shape`, `att`, `med`, `signal`, `blink`, `latencyMs`, `outcome`

Paste the JSON into another AI using `promptHint`.

---

## 🧭 Recommended order · Orden

1. 🎯 `attention.html` → saves threshold to `localStorage`  
2. ⚽ `portal.html` → uses that threshold  
3. 👁️ `calibrate.html` → more color / side / shape data  
4. 📤 Export all three JSONs → analyze together  

---

## 🔬 Open hypothesis · Hipótesis abierta

We **keep** color + L/R labels on purpose.

With a 1-channel MindWave you **cannot prove** perceptual decoding from EEG alone — but you **can** hunt for correlations (Attention / latency × stimulus). Ask the AI to separate those clearly.

📚 Also see: [`github-neurosky-landscape.md`](github-neurosky-landscape.md) · [`../function-vectors.md`](../function-vectors.md) · [`../tasks.md`](../tasks.md)

---

## 📦 Saved sessions · Sesiones

| File | Notes |
|------|--------|
| `study/mindwave-exam-*.json` (local) | Full waveLog — gitignored (too large) |
| [`mindwave-exam-20260724-1803.stats.json`](mindwave-exam-20260724-1803.stats.json) | Stats for math AI |
| [`mindwave-exam-analysis-2026-07-24.md`](mindwave-exam-analysis-2026-07-24.md) | Deducción: att lectura≫figuras; color/lado/forma no explican RT |
| [`blink-color-session-2026-07-24.json`](blink-color-session-2026-07-24.json) | Blink+color n=24 |
| [`blink-color-analysis-2026-07-24.md`](blink-color-analysis-2026-07-24.md) | Análisis blink+color |

<p align="center">🥑 <a href="https://github.com/aoxilus">aoxilus</a></p>
