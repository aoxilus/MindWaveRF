# 🧠 MindWaveRF

<p align="center">
  <strong>EN</strong> · NeuroSky MindWave RF toolkit — drivers, ThinkGear bridge, EEG monitor & BCI studies<br/>
  <strong>ES</strong> · Kit MindWave RF — drivers, bridge ThinkGear, monitor EEG y estudios BCI
</p>

<p align="center">
  <a href="https://github.com/topics/neurosky-mindwave"><img alt="topic" src="https://img.shields.io/badge/topic-neurosky--mindwave-blue?style=flat-square" /></a>
  <img alt="platform" src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Node%20%2B%20Vite%20%2B%20Three.js-yellow?style=flat-square" />
</p>

---

## ✨ What’s inside · Qué incluye

| 🌐 App | 🇺🇸 English | 🇪🇸 Español |
|--------|-------------|------------|
| [`wave.html`](wave.html) | Live EEG monitor (Attention, Meditation, raw, bands, blink) | Monitor EEG en vivo |
| [`attention.html`](attention.html) | Personal Attention threshold calibration | Calibrar umbral de Attention |
| [`calibrate.html`](calibrate.html) | Blink + color + shape + L/R study | Estudio blink + color + forma + izq/der |
| [`portal.html`](portal.html) | Mental goal: Attention arms, blink shoots | Portería mental |
| [`index.html`](index.html) | Monkey Run mind game | Juego Monkey Run |
| [`Drivers/`](Drivers/) | USB dongle driver (CH340) | Driver del dongle USB |
| [`server/`](server/) | Serial / TGC → WebSocket `:13855` | Bridge serial / TGC |

---

## 🚀 Quick start · Inicio rápido

📘 Full guide: [`docs/connect.md`](docs/connect.md)

```powershell
npm install
npm run serial -- COM18 115200   # 🔌 change COM if needed · cambia el COM
npm run waves                    # 📈 http://localhost:5173/wave.html
```

### Checklist

1. 🔌 Plug the **RF USB dongle** (COM visible in Device Manager)  
   · Enchufa el dongle RF
2. 🎧 Headset ON → **blue LED**, forehead sensor + ear clip  
   · Headset encendido → LED **azul**, sensor + clip
3. 🌉 Run the bridge + open `wave.html`  
   · Bridge + `wave.html` → datos en vivo

🔴 Red LED = powered but not linked — move closer to the dongle.  
🔋 Won’t power on? → [`docs/headset-no-power.md`](docs/headset-no-power.md)

> ⚠️ **Baud tip:** with signed **USB-SERIAL CH340**, stable ThinkGear was at **115200** (not 57600) on our test PC.

---

## 🧪 BCI studies · Estudios

| Command | Opens |
|---------|--------|
| `npm run attention` | 🎯 Attention calibration |
| `npm run calibrate` | 👁️ Blink + color + side |
| `npm run portal` | ⚽ Mental goal / portería |
| `npm run waves` | 📈 EEG monitor |

📤 Each study has **Export JSON (AI)** — download and paste into another AI for analysis.  
· Cada estudio exporta JSON listo para otra AI.

More: [`docs/studies/README.md`](docs/studies/README.md)

---

## 📁 Project layout · Estructura

| Path | EN | ES |
|------|----|----|
| [`Drivers/`](Drivers/) | Dongle USB driver | Driver del adaptador |
| [`server/`](server/) | ThinkGear bridges | Bridges ThinkGear |
| [`src/`](src/) | Game + studies UI | Juego + estudios |
| [`sandbox/`](sandbox/) | RF probe scripts | Pruebas RF |
| [`docs/`](docs/) | Guides & findings | Guías y hallazgos |

---

## 🧰 Scripts

| Command | Action · Acción |
|---------|-----------------|
| `npm run serial -- COMx 115200` | 🌉 Dongle → `ws://127.0.0.1:13855` |
| `npm run waves` | 📈 Open wave.html |
| `npm run attention` | 🎯 Attention cal |
| `npm run calibrate` | 👁️ Blink study |
| `npm run portal` | ⚽ Portería |
| `npm run dev` | 🕹️ Vite (all apps) |
| `npm run bridge` | 🔗 Official TGC → WebSocket |

> ⛔ Don’t run **ThinkGear Connector** and `npm run serial` on the same COM at once.  
> · No uses TGC y el bridge serial a la vez en el mismo puerto.

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

## 📚 Docs

| Doc | EN / ES |
|-----|---------|
| [`docs/connect.md`](docs/connect.md) | 🔌 How to connect · Cómo conectar |
| [`docs/studies/README.md`](docs/studies/README.md) | 🧪 Studies + AI export |
| [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md) | 🌍 GitHub landscape |
| [`docs/headset-no-power.md`](docs/headset-no-power.md) | 🔋 Headset won’t power |
| [`docs/findings.md`](docs/findings.md) | 📝 Local findings |
| [`docs/thinkgear-connector.md`](docs/thinkgear-connector.md) | 🔗 TGC |
| [`docs/windows-11-secure-boot.md`](docs/windows-11-secure-boot.md) | 🛡️ Secure Boot / Code 52 |
| [`docs/rf-pairing-and-testing.md`](docs/rf-pairing-and-testing.md) | 📡 RF pairing |

---

## 🏷️ Topics

Suggested GitHub topics: `neurosky-mindwave` · `bci` · `eeg` · `thinkgear` · `mindwave`

---

## ⚖️ License / disclaimer

Driver binaries and NeuroSky protocol **as-is** for personal/educational use. No warranty.  
Binarios y protocolo **tal cual** para uso personal/educativo. Sin garantía.

You are responsible for Windows driver-signing policy on your PC.  
Tú eres responsable de la política de firma de drivers en tu PC.

> Hardware/firmware © NeuroSky / WCH.
