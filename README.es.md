# 🧠 MindWaveRF

<p align="center">
  <strong>Kit NeuroSky MindWave RF</strong> — drivers, bridge ThinkGear, EEG en vivo + FFT y estudios BCI<br/>
  <em>por <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em>
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="https://github.com/aoxilus/MindWaveRF">GitHub</a>
</p>

<p align="center">
  <img alt="topic" src="https://img.shields.io/badge/topic-neurosky--mindwave-blue?style=flat-square" />
  <img alt="platform" src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Node%20%2B%20Vite%20%2B%20Three.js-yellow?style=flat-square" />
</p>

---

## ✨ Qué incluye

| 🌐 App | Qué hace |
|--------|----------|
| [`wave.html`](wave.html) | 📈 EEG en vivo · Attention / Meditation · raw · **espectrograma FFT** · bandas · blink |
| [`attention.html`](attention.html) | 🎯 Umbral personal de Attention |
| [`calibrate.html`](calibrate.html) | 👁️ Lectura + blink · forma · lado · color (JSON para AI) |
| [`portal.html`](portal.html) | ⚽ Portería mental — Attention = potencia, blink = tiro |
| [`index.html`](index.html) | 🕹️ Juego Monkey Run |
| [`Drivers/`](Drivers/) | 🔌 Driver del dongle USB (CH340) |
| [`server/`](server/) | 🌉 Serial / TGC → WebSocket `:13855` |

---

## 🚀 Inicio rápido

📘 Guía completa: [`docs/connect.md`](docs/connect.md)

```powershell
npm install
npm run serial -- COM18 115200   # 🔌 cambia el COM si hace falta
npm run waves                    # 📈 http://localhost:5173/wave.html
```

### ✅ Checklist

1. 🔌 Enchufa el **dongle RF USB** (COM en Administrador de dispositivos)
2. 🎧 Headset ON → LED **azul**, sensor de frente + clip de oreja
3. 🌉 Corre el bridge y abre `wave.html`

🔴 LED rojo = tiene corriente pero no enlace — acércalo al dongle.  
🔋 ¿No enciende? → [`docs/headset-no-power.md`](docs/headset-no-power.md)

> ⚠️ Con **USB-SERIAL CH340** firmado, ThinkGear estable fue a **115200** (no 57600) en nuestra PC de prueba.

---

## 🧪 Estudios BCI

| Comando | Abre |
|---------|------|
| `npm run attention` | 🎯 Calibración Attention |
| `npm run calibrate` | 👁️ Estudio blink / lectura / figuras |
| `npm run portal` | ⚽ Portería mental |
| `npm run waves` | 📈 Monitor EEG + FFT |

📤 Cada estudio tiene **Exportar JSON (AI)** — pégalo en otra AI para análisis matemático.

Más: [`docs/studies/README.md`](docs/studies/README.md)

### 🧭 Lecciones de la comunidad

Alineado a repos públicos `neurosky-mindwave` ([landscape](docs/studies/github-neurosky-landscape.md)):

| Patrón | Aquí |
|--------|------|
| 👁️ Blink = comando discreto | Calibrate / portal / detector en wave (`peak≥380`) |
| 🎯 Attention = control continuo | Barra de potencia en portal · clasificador de foco |
| 📈 Raw + bandas | `wave.html` + FFT 0–50 Hz |
| 🚫 No “decodificar color” con 1 canal | Etiquetas solo para correlaciones |

---

## 📁 Estructura

| Ruta | Rol |
|------|-----|
| [`Drivers/`](Drivers/) | Driver del adaptador |
| [`server/`](server/) | Bridges ThinkGear + parser |
| [`src/`](src/) | Juego + estudios + FFT |
| [`study/`](study/) | Exports locales (JSON grandes no van a git) |
| [`docs/`](docs/) | Guías, vectores, tareas, hallazgos |
| [`sandbox/`](sandbox/) | Scripts de prueba RF / análisis |

---

## 🧰 Scripts

| Comando | Acción |
|---------|--------|
| `npm run serial -- COMx 115200` | 🌉 Dongle → `ws://127.0.0.1:13855` |
| `npm run waves` | 📈 Abrir wave.html |
| `npm run attention` | 🎯 Cal Attention |
| `npm run calibrate` | 👁️ Estudio blink |
| `npm run portal` | ⚽ Portería |
| `npm run dev` | 🕹️ Vite (todas las apps) |
| `npm run bridge` | 🔗 TGC oficial → WebSocket |

> ⛔ No uses **ThinkGear Connector** y `npm run serial` en el mismo COM a la vez.

---

## 📚 Docs

| Doc | Tema |
|-----|------|
| [`docs/connect.md`](docs/connect.md) | 🔌 Cómo conectar |
| [`docs/function-vectors.md`](docs/function-vectors.md) | 🧬 Mapa condensado de funciones |
| [`docs/tasks.md`](docs/tasks.md) | ✅ Tareas cerradas / abiertas |
| [`docs/studies/README.md`](docs/studies/README.md) | 🧪 Estudios + export AI |
| [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md) | 🌍 Landscape GitHub |
| [`docs/findings.md`](docs/findings.md) | 📝 Hallazgos locales |
| [`docs/thinkgear-connector.md`](docs/thinkgear-connector.md) | 🔗 TGC |
| [`docs/windows-11-secure-boot.md`](docs/windows-11-secure-boot.md) | 🛡️ Secure Boot / Code 52 |
| [`docs/rf-pairing-and-testing.md`](docs/rf-pairing-and-testing.md) | 📡 Emparejado RF |

---

## 📀 Driver

| | |
|--|--|
| **Nombre** | MindWave USB Adapter |
| **Versión** | 3.11.2015.08 (2015-08-03) |
| **USB ID** | `VID_1A86` / `PID_7523` (CH340) |
| **Archivos** | [`Drivers/`](Drivers/) |

Fuente: [sieuwe1/ArduMind Drivers](https://github.com/sieuwe1/ArduMind/tree/master/Drivers). Los downloads oficiales de NeuroSky suelen estar caídos.

---

## 🏷️ Topics

`neurosky-mindwave` · `bci` · `eeg` · `thinkgear` · `mindwave` · `fft`

---

## ⚖️ Licencia / aviso

Binarios del driver y protocolo NeuroSky **tal cual** para uso personal/educativo. Sin garantía.  
Tú eres responsable de la política de firma de drivers en Windows.

> Hardware/firmware © NeuroSky / WCH.

---

<p align="center">
  Hecho con 🥑 por <a href="https://github.com/aoxilus">aoxilus</a>
</p>
