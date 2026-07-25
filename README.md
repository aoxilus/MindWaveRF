# 🧠 MindWaveRF

<p align="center">
  <strong>NeuroSky MindWave RF toolkit</strong> — drivers, ThinkGear bridge, live EEG + FFT, and BCI studies<br/>
  <em>by <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em>
</p>

<p align="center">
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="https://github.com/aoxilus/MindWaveRF">GitHub</a>
</p>

<p align="center">
  <img alt="topic" src="https://img.shields.io/badge/topic-neurosky--mindwave-blue?style=flat-square" />
  <img alt="platform" src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Node%20%2B%20Vite%20%2B%20Three.js-yellow?style=flat-square" />
</p>

---

## ✨ What’s inside

| 🌐 App | What it does |
|--------|----------------|
| [`wave.html`](wave.html) | 📈 Live EEG · Attention / Meditation · raw · **FFT spectrogram** · NeuroSky bands · blink |
| [`attention.html`](attention.html) | 🎯 Personal Attention threshold |
| [`calibrate.html`](calibrate.html) | 👁️ Reading + blink · shape · side · color study (JSON for AI) |
| [`portal.html`](portal.html) | ⚽ Mental goal — Attention = power, blink = shoot |
| [`index.html`](index.html) | 🕹️ Monkey Run mind game |
| [`Drivers/`](Drivers/) | 🔌 USB dongle driver (CH340) |
| [`server/`](server/) | 🌉 Serial / TGC → WebSocket `:13855` |

---

## 🚀 Quick start

📘 Full guide: [`docs/connect.md`](docs/connect.md)

```powershell
npm install
npm run serial -- COM18 115200   # 🔌 change COM if needed
npm run waves                    # 📈 http://localhost:5173/wave.html
```

### ✅ Checklist

1. 🔌 Plug the **RF USB dongle** (COM in Device Manager)
2. 🎧 Headset ON → **blue LED**, forehead sensor + ear clip
3. 🌉 Run the bridge + open `wave.html`

🔴 Red LED = powered but not linked — move closer.  
🔋 Won’t power on? → [`docs/headset-no-power.md`](docs/headset-no-power.md)

> ⚠️ With signed **USB-SERIAL CH340**, stable ThinkGear was **115200** (not 57600) on our test PC.

---

## 🧪 BCI studies

| Command | Opens |
|---------|--------|
| `npm run attention` | 🎯 Attention calibration |
| `npm run calibrate` | 👁️ Blink / reading / figure study |
| `npm run portal` | ⚽ Mental goal |
| `npm run waves` | 📈 EEG + FFT monitor |

📤 Each study has **Export JSON (AI)** — paste into another AI for math analysis.

More: [`docs/studies/README.md`](docs/studies/README.md)

### 🧭 Community lessons (what we ship)

Aligned with public `neurosky-mindwave` repos (see [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md)):

| Pattern | Here |
|---------|------|
| 👁️ Blink = discrete command | Calibrate / portal / wave detector (`peak≥380`) |
| 🎯 Attention = continuous control | Portal power bar · focus classifier |
| 📈 Raw + bands visualization | `wave.html` + FFT 0–50 Hz |
| 🚫 Don’t “decode color” from 1ch | Labels kept for correlation only |

---

## 📁 Layout

| Path | Role |
|------|------|
| [`Drivers/`](Drivers/) | Dongle USB driver |
| [`server/`](server/) | ThinkGear bridges + parser |
| [`src/`](src/) | Game + studies + wave FFT |
| [`study/`](study/) | Local session exports (large JSON gitignored) |
| [`docs/`](docs/) | Guides, vectors, tasks, findings |
| [`sandbox/`](sandbox/) | RF probe / analysis scripts |

---

## 🧰 Scripts

| Command | Action |
|---------|--------|
| `npm run serial -- COMx 115200` | 🌉 Dongle → `ws://127.0.0.1:13855` |
| `npm run waves` | 📈 Open wave.html |
| `npm run attention` | 🎯 Attention cal |
| `npm run calibrate` | 👁️ Blink study |
| `npm run portal` | ⚽ Portería |
| `npm run dev` | 🕹️ Vite (all apps) |
| `npm run bridge` | 🔗 Official TGC → WebSocket |

> ⛔ Don’t run **ThinkGear Connector** and `npm run serial` on the same COM at once.

---

## 📚 Docs

| Doc | Topic |
|-----|--------|
| [`docs/connect.md`](docs/connect.md) | 🔌 How to connect |
| [`docs/function-vectors.md`](docs/function-vectors.md) | 🧬 Condensed function map |
| [`docs/tasks.md`](docs/tasks.md) | ✅ Closed / open tasks |
| [`docs/studies/README.md`](docs/studies/README.md) | 🧪 Studies + AI export |
| [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md) | 🌍 GitHub landscape |
| [`docs/findings.md`](docs/findings.md) | 📝 Local findings |
| [`docs/thinkgear-connector.md`](docs/thinkgear-connector.md) | 🔗 TGC |
| [`docs/windows-11-secure-boot.md`](docs/windows-11-secure-boot.md) | 🛡️ Secure Boot / Code 52 |
| [`docs/rf-pairing-and-testing.md`](docs/rf-pairing-and-testing.md) | 📡 RF pairing |

---

## 📀 Driver

| | |
|--|--|
| **Name** | MindWave USB Adapter |
| **Version** | 3.11.2015.08 (2015-08-03) |
| **USB ID** | `VID_1A86` / `PID_7523` (CH340) |
| **Files** | [`Drivers/`](Drivers/) |

Source: [sieuwe1/ArduMind Drivers](https://github.com/sieuwe1/ArduMind/tree/master/Drivers). Official NeuroSky downloads are often offline.

---

## 🏷️ Topics

`neurosky-mindwave` · `bci` · `eeg` · `thinkgear` · `mindwave` · `fft`

---

## ⚖️ License / disclaimer

Driver binaries and NeuroSky protocol **as-is** for personal/educational use. No warranty.  
You are responsible for Windows driver-signing policy on your PC.

> Hardware/firmware © NeuroSky / WCH.

---

<p align="center">
  Made with 🥑 by <a href="https://github.com/aoxilus">aoxilus</a>
</p>
