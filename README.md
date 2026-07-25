# 🧠 MindWaveRF

<p align="center">
  <strong>Turn a vintage NeuroSky MindWave RF headset into an open BCI lab in the browser.</strong><br/>
  Live EEG · blink games · Attention / Meditation studies · JSON for AI<br/>
  <em>by <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em>
</p>

<p align="center">
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="https://github.com/aoxilus/MindWaveRF">Repo</a> ·
  <a href="#-contribute--we-want-your-help">Contribute</a>
</p>

<p align="center">
  <img alt="topic" src="https://img.shields.io/badge/topic-neurosky--mindwave-blue?style=flat-square" />
  <img alt="bci" src="https://img.shields.io/badge/BCI-1--channel%20EEG-brightgreen?style=flat-square" />
  <img alt="platform" src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Node%20%2B%20Vite%20%2B%20Three.js-yellow?style=flat-square" />
  <img alt="license" src="https://img.shields.io/badge/use-education%20%2F%20research-lightgrey?style=flat-square" />
</p>

---

## 💡 What is this?

**MindWaveRF** is an open toolkit so students, makers, and researchers can **actually use** the white **NeuroSky MindWave (RF + USB dongle)** — the old wireless headset that often dies behind Code 52 drivers, dead downloads, and ThinkGear Connector drama.

We bridge the dongle → WebSocket → browser apps: see your brainwaves, train Attention/Meditation, fire actions with **blinks**, and export sessions for math / AI analysis.

> Not magic mind-reading. Honest 1-channel BCI: **blink = best voluntary command**, **Attention = slow continuous control**, raw EEG for science & viz.

---

## 🎧 What hardware?

| Piece | Notes |
|-------|--------|
| 🧠 **NeuroSky MindWave** (white, AAA) | Forehead sensor + ear clip |
| 📡 **MindWave Wireless USB Adapter** | RF dongle (`VID_1A86` / `PID_7523`, often shows as CH340) |
| 💻 **Windows 10/11 PC** | Signed CH340 / MindWave driver (we ship [`Drivers/`](Drivers/)) |

Also works with the ThinkGear protocol ideas used across the [`neurosky-mindwave`](https://github.com/topics/neurosky-mindwave) community — but we optimize for **RF dongle**, not only Mobile Bluetooth.

---

## 🎯 Who does it help?

| You are… | You get… |
|----------|----------|
| 🎓 Student / lab | Cheap BCI demos without $2k caps |
| 🕹️ Game / UX maker | Blink shoot · Attention power bar patterns |
| 🔬 Researcher | Session JSON + FFT + band logs for analysis |
| 🛠️ Driver survivor | Docs for Secure Boot, COM, baud **115200** |
| 🤖 AI tinkerer | Exports ready to paste into another model |

**What we’re not claiming:** decoding color, “thought left/right”, or secret thoughts from one forehead electrode. We keep stimulus labels so you can **test** correlations — and we publish null results when they’re null.

---

## 🔍 What we’re looking for (mission)

1. **Reliable RF link** on modern Windows (pair fast, stay blue).
2. **Honest metrics** — Attention / Meditation / blink / raw / FFT you can trust on-screen.
3. **Study protocols** that teach what 1-channel BCI *can* and *cannot* do.
4. **Open algorithms** (Kalman, blink slope detectors, short Attention forecast) that improve the live graph without snake oil.
5. **Contributors** who document hardware quirks so the next person doesn’t lose a weekend.

Community lessons we follow: [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md) · AI ideas: [`docs/studies/ai-algorithms-for-wave.md`](docs/studies/ai-algorithms-for-wave.md)

---

## ✨ What’s inside

| 🌐 App | What it does |
|--------|----------------|
| [`wave.html`](wave.html) | 📈 Live EEG · Attention / Meditation · raw (avg×5) · **FFT** · bands · blink · concentrado / relajado |
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

## 🤝 Contribute — we want your help

Stars, issues, and PRs are welcome. Especially:

| 🙋 Help with… | Examples |
|---------------|----------|
| 📡 RF pairing reliability | Faster `0xC2` strategies, COM race fixes |
| 📈 Signal algorithms | Kalman / forecast line, blink slope detector, α-power relax |
| 🧪 Study designs | Catch trials, longer reading windows, CSV exports |
| 🪟 Windows drivers | Secure Boot / Code 52 war stories & INF tips |
| 🌍 Docs / i18n | Clearer guides, more languages |
| 🕹️ Games | Attention → Monkey Run speed (community runner pattern) |

**How to start**

1. Fork → branch → PR against `main`
2. Keep changes small; link an issue if you can
3. Don’t commit huge `study/*.json` waveLogs (gitignored) — commit analysis under `docs/studies/`
4. Be honest in docs: say what failed

Open tasks: [`docs/tasks.md`](docs/tasks.md) · Function map: [`docs/function-vectors.md`](docs/function-vectors.md)

```text
Good first issues ideas:
- Attention → speed in Monkey Run
- Dashed Kalman forecast on wave.html
- Double-blink as second command
- Repo description / screenshots / GIF of blue LED → streaming
```

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
| [`docs/studies/ai-algorithms-for-wave.md`](docs/studies/ai-algorithms-for-wave.md) | 🤖 Algorithms to try |
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

## ⚖️ License / disclaimer

Driver binaries and NeuroSky protocol **as-is** for personal/educational use. No warranty.  
You are responsible for Windows driver-signing policy on your PC.

> Hardware/firmware © NeuroSky / WCH.

---

<p align="center">
  Made with 🥑 by <a href="https://github.com/aoxilus">aoxilus</a><br/>
  <sub>If this saved you a weekend of COM ports — star the repo and open an issue with your headset + Windows build.</sub>
</p>
