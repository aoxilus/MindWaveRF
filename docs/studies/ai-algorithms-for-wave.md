# 🤖 AI / algorithms for better wave + prediction

<p>
  <em>by <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em> · what helps a <strong>1-channel MindWave RF</strong> graph (Jul 2026).
</p>

## Reality check

| Goal | Realistic? |
|------|------------|
| Cleaner raw graph / less noise | ✅ Yes |
| Predict Attention / Meditation ~1–2 s ahead | ✅ Weak but useful |
| Better blink vs noise | ✅ Yes (best ROI) |
| Predict “thought color / L-R” from EEG | ❌ No with 1ch |

NeuroSky eSense is already a proprietary model (~1 Hz). AI on top helps **smooth, forecast, classify blinks** — it does not replace the chip.

---

## Ranked options (best → heaviest)

### 1. 🥇 Blink: derivative peak/valley (classic DSP)
- Paper: [configurable blink detector, single-channel BCI](https://pmc.ncbi.nlm.nih.gov/articles/PMC10255990/) (FPGA, beats vendor software on latency)
- Idea: differentiate raw → find max then min on same slope (blink shape), not only amplitude vs baseline
- **Fit for us:** improve `createBlinkFromRaw` in JS — no training
- GitHub-ish: [Matuteale/final-project](https://github.com/Matuteale/final-project) — **logistic regression** on a moving window of raw for wink/not

### 2. 🥈 Graph: 1-D Kalman / EWMA + short forecast line
- Papers/repos: [robust Kalman + ELM for attention](https://doi.org/10.3389/fnhum.2024.1481493) · [LowLatencyEEGFiltering](https://github.com/ivsemenkov/LowLatencyEEGFiltering) (Kalman + TCN)
- Idea: filter display series; draw **predicted next N samples** as a dashed overlay
- **Fit for us:** ~30 lines of JS on `wave.html` (Kalman scalar or Holt linear). Runs at 512 Hz avg×5

### 3. 🥉 Short-horizon Attention forecast (AR / tiny MLP)
- Input: last 10–30 Attention values (~10–30 s)
- Output: Attention in +1 s / +2 s → early “CONCENTRADO / RELAJADO”
- Models that communities use: linear AR, logistic, small NN, SVM, XGBoost on features (RMS, band powers, Hjorth)
- LabVIEW/NeuroSky NN example: [preprint](https://doi.org/10.20944/preprints202106.0016.v2) — needs **labeled sessions** (we already export JSON)

### 4. Alpha / relax features (eyes closed vs open)
- [Neural-Decoder](https://github.com/mvideet/Neural-Decoder) — alpha 8–12 Hz + BiLSTM (OpenBCI, but same idea)
- **Fit for us:** we already FFT 0–50 Hz — add **α power** feature for RELAJADO (no heavy net first)

### 5. Deep denoise (later / offline)
- [EEGdenoiseNet / Single-Channel-EEG-Denoise](https://github.com/ncclabsustech/EEGdenoiseNet) · [EKFNet](https://github.com/cathnat/EKFNet)
- Strong papers, **not** first for browser realtime without a trained ONNX model

---

## What we should try next (this repo)

| Step | Algo | Where | Predicts |
|------|------|-------|----------|
| A | Kalman display + 200 ms forecast dash | `src/wave.js` | smoother graph |
| B | Blink slope detector (diff max→min) | `study-lib` / wave | fewer false blinks |
| C | α-band power → relax score | FFT already there | better RELAJADO |
| D | AR(5) on Attention series | wave state | “va a concentrarse” |

Data we already have for training later: `docs/studies/*.json`, `study/*.json` (local).

---

## Do NOT chase

1. LSTM to decode color/shape (null result in our exam).
2. Replacing eSense with a homebrew Attention without a big labeled set.
3. Heavy denoise nets before A–C above.

---

<p align="center">🥑 <a href="https://github.com/aoxilus">aoxilus</a></p>
