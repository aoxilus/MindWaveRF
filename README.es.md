# 🧠 MindWaveRF

<p align="center">
  <strong>Convierte un MindWave RF clásico de NeuroSky en un laboratorio BCI abierto en el navegador.</strong><br/>
  EEG en vivo · juegos con blink · estudios Attention / Meditation · JSON para AI<br/>
  <em>por <a href="https://github.com/aoxilus">aoxilus</a> 🥑</em>
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="https://github.com/aoxilus/MindWaveRF">Repo</a> ·
  <a href="#-contribuye--te-necesitamos">Contribuir</a>
</p>

<p align="center">
  <img alt="topic" src="https://img.shields.io/badge/topic-neurosky--mindwave-blue?style=flat-square" />
  <img alt="bci" src="https://img.shields.io/badge/BCI-EEG%201%20canal-brightgreen?style=flat-square" />
  <img alt="platform" src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" />
  <img alt="stack" src="https://img.shields.io/badge/stack-Node%20%2B%20Vite%20%2B%20Three.js-yellow?style=flat-square" />
  <img alt="license" src="https://img.shields.io/badge/uso-educaci%C3%B3n%20%2F%20investigaci%C3%B3n-lightgrey?style=flat-square" />
</p>

---

## 💡 ¿Qué es esto?

**MindWaveRF** es un kit abierto para que estudiantes, makers e investigadores **puedan usar de verdad** el **NeuroSky MindWave blanco (RF + dongle USB)** — ese headset inalámbrico que suele morir detrás de drivers Code 52, descargas caídas y pelea con ThinkGear Connector.

Puenteamos dongle → WebSocket → apps en el navegador: ver ondas, entrenar Attention/Meditation, disparar con **parpadeo**, y exportar sesiones para análisis matemático / AI.

> No es leer la mente. BCI honesto de 1 canal: **blink = mejor comando voluntario**, **Attention = control continuo lento**, raw EEG para ciencia y visualización.

---

## 🎧 ¿Qué aparato?

| Pieza | Notas |
|-------|--------|
| 🧠 **NeuroSky MindWave** (blanco, AAA) | Sensor frente + clip oreja |
| 📡 **MindWave Wireless USB Adapter** | Dongle RF (`VID_1A86` / `PID_7523`, a menudo sale como CH340) |
| 💻 **PC Windows 10/11** | Driver CH340 / MindWave firmado (va en [`Drivers/`](Drivers/)) |

Compatible con ideas del ecosistema [`neurosky-mindwave`](https://github.com/topics/neurosky-mindwave), optimizado para **dongle RF**, no solo Mobile Bluetooth.

---

## 🎯 ¿A quién ayuda?

| Eres… | Obtienes… |
|-------|-----------|
| 🎓 Estudiante / lab | Demos BCI baratas sin cascos de miles de dólares |
| 🕹️ Maker de juegos / UX | Patrones blink = disparo · Attention = barra de potencia |
| 🔬 Investigador | JSON de sesión + FFT + bandas para analizar |
| 🛠️ Superviviente de drivers | Docs Secure Boot, COM, baud **115200** |
| 🤖 Curioso de AI | Exports listos para pegar en otro modelo |

**Lo que no prometemos:** decodificar color, “pensó izquierda/derecha” ni secretos con un solo electrodo. Guardamos etiquetas de estímulo para **probar** correlaciones — y publicamos nulos cuando son nulos.

---

## 🔍 Qué buscamos (misión)

1. **Enlace RF fiable** en Windows moderno (pareo rápido, LED azul estable).
2. **Métricas honestas** — Attention / Meditation / blink / raw / FFT creíbles en pantalla.
3. **Protocolos de estudio** que enseñen qué sí y qué no puede un BCI de 1 canal.
4. **Algoritmos abiertos** (Kalman, detector de blink por pendiente, forecast corto de Attention) que mejoren la gráfica sin humo.
5. **Contribuidores** que documenten rarezas de hardware para que el siguiente no pierda un fin de semana.

Lecciones de la comunidad: [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md) · Ideas AI: [`docs/studies/ai-algorithms-for-wave.md`](docs/studies/ai-algorithms-for-wave.md)

---

## ✨ Qué incluye

| 🌐 App | Qué hace |
|--------|----------|
| [`wave.html`](wave.html) | 📈 EEG en vivo · Attention / Meditation · raw (avg×5) · **FFT** · bandas · blink · concentrado / relajado |
| [`attention.html`](attention.html) | 🎯 Umbral personal de Attention |
| [`calibrate.html`](calibrate.html) | 👁️ Lectura + blink · forma · lado · color (JSON para AI) |
| [`portal.html`](portal.html) | ⚽ Portería mental — Attention = potencia, blink = tiro |
| [`index.html`](index.html) | 🕹️ Juego Monkey Run |
| [`Drivers/`](Drivers/) | 🔌 Driver del dongle USB (CH340) |
| [`server/`](server/) | 🌉 Serial / TGC → WebSocket `:13855` |

---

## 🚀 Inicio rápido

📘 Guía: [`docs/connect.md`](docs/connect.md)

```powershell
npm install
npm run serial -- COM18 115200   # 🔌 cambia el COM si hace falta
npm run waves                    # 📈 http://localhost:5173/wave.html
```

### ✅ Checklist

1. 🔌 Enchufa el **dongle RF USB** (COM en Administrador de dispositivos)
2. 🎧 Headset ON → LED **azul**, sensor de frente + clip de oreja
3. 🌉 Corre el bridge y abre `wave.html`

🔴 LED rojo = tiene corriente pero no enlace — acércalo.  
🔋 ¿No enciende? → [`docs/headset-no-power.md`](docs/headset-no-power.md)

> ⚠️ Con **USB-SERIAL CH340** firmado, ThinkGear estable fue a **115200** (no 57600) en nuestra PC de prueba.

---

## 🤝 Contribuye — te necesitamos

Stars, issues y PRs bienvenidos. Sobre todo:

| 🙋 Ayuda con… | Ejemplos |
|---------------|----------|
| 📡 Fiabilidad del pareo RF | Estrategias `0xC2` más rápidas, carreras de COM |
| 📈 Algoritmos de señal | Kalman / línea de predicción, blink por pendiente, α-power |
| 🧪 Diseños de estudio | Catch trials, lecturas largas, export CSV |
| 🪟 Drivers Windows | Secure Boot / Code 52 y tips de INF |
| 🌍 Docs / i18n | Guías más claras, más idiomas |
| 🕹️ Juegos | Attention → velocidad en Monkey Run |

**Cómo empezar**

1. Fork → branch → PR a `main`
2. Cambios chicos; enlaza un issue si puedes
3. No subas `study/*.json` enormes (gitignore) — análisis en `docs/studies/`
4. Sé honesto en docs: di qué falló

Tareas: [`docs/tasks.md`](docs/tasks.md) · Mapa de funciones: [`docs/function-vectors.md`](docs/function-vectors.md)

```text
Buenas primeras issues:
- Attention → velocidad en Monkey Run
- Forecast Kalman punteado en wave.html
- Doble blink como segundo comando
- GIF: LED azul → streaming en el README
```

---

## 🧪 Estudios BCI

| Comando | Abre |
|---------|------|
| `npm run attention` | 🎯 Calibración Attention |
| `npm run calibrate` | 👁️ Estudio blink / lectura / figuras |
| `npm run portal` | ⚽ Portería mental |
| `npm run waves` | 📈 Monitor EEG + FFT |

📤 Cada estudio tiene **Exportar JSON (AI)**.  
Más: [`docs/studies/README.md`](docs/studies/README.md)

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
| [`docs/function-vectors.md`](docs/function-vectors.md) | 🧬 Mapa de funciones |
| [`docs/tasks.md`](docs/tasks.md) | ✅ Tareas |
| [`docs/studies/README.md`](docs/studies/README.md) | 🧪 Estudios + AI |
| [`docs/studies/github-neurosky-landscape.md`](docs/studies/github-neurosky-landscape.md) | 🌍 Landscape GitHub |
| [`docs/studies/ai-algorithms-for-wave.md`](docs/studies/ai-algorithms-for-wave.md) | 🤖 Algoritmos a probar |
| [`docs/findings.md`](docs/findings.md) | 📝 Hallazgos |
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

Fuente: [sieuwe1/ArduMind Drivers](https://github.com/sieuwe1/ArduMind/tree/master/Drivers).

---

## ⚖️ Licencia / aviso

Binarios y protocolo NeuroSky **tal cual** para uso personal/educativo. Sin garantía.  
Tú eres responsable de la política de firma de drivers en Windows.

> Hardware/firmware © NeuroSky / WCH.

---

<p align="center">
  Hecho con 🥑 por <a href="https://github.com/aoxilus">aoxilus</a><br/>
  <sub>Si esto te salvó un fin de semana de COMs — dale estrella y abre un issue con tu headset + build de Windows.</sub>
</p>
