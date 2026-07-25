# Landscape GitHub: `neurosky-mindwave`

Fuente: [github.com/topics/neurosky-mindwave](https://github.com/topics/neurosky-mindwave?o=desc&s=updated) (revisión Jul 2026).

## Qué hace la gente (patrón real)

Casi nadie intenta **decodificar color o “pensó izquierda”** con MindWave de 1 canal.

Lo que sí usan:

| Señal | Uso típico | Fiabilidad reportada |
|-------|------------|----------------------|
| **Blink** | click / disparo / stop / comando discreto | **Alta** (mejor control voluntario) |
| **Attention** | velocidad, potencia, “empuje” continuo | Media (lento ~1 Hz, variable) |
| **Meditation** | calma / color LED / modo relax | Media |
| Raw / bandas | visualización, ML experimental | Variable; hace falta dataset y tareas motor imagery |

Paper útil ([bciBasedWheelchair](https://github.com/pktparticle/bciBasedWheelchair), IEEE): en 3 algoritmos comparados, **máxima accuracy ~86% con blink strength**; Attention/Meditation “not easily controlled”.

## Repos que nos sirven

### 1. Control continuo Attention → velocidad
- [giuliatondin/unity-mindwave-runner](https://github.com/giuliatondin/unity-mindwave-runner) — endless runner; **Attention controla velocidad**.
- [Ruaneri-Portela/Hira-Runner](https://github.com/Ruaneri-Portela/Hira-Runner) — fork limpio, mismo enfoque ADHD/focus.

**Idea para nosotros:** en Monkey Run / Portería, mapear Attention → velocidad o altura de barra (ya empezamos en `portal.html`).

### 2. Blink como comando principal
- [pktparticle/bciBasedWheelchair](https://github.com/pktparticle/bciBasedWheelchair) — start / left / right / stop con Attention+Meditation+**Blink**.
- Blink/zone (NeuroSky store Unity) — referencia de UI de blink.

**Idea:** L/R no se “leen” del cerebro: se eligen con **Attention umbral + blink**, o dos umbrales (bajo/alto Attention = lado).

### 3. Template drivers / TGC
- [sieuwe1/ArduMind](https://github.com/sieuwe1/ArduMind) — Drivers CH340 MindWave + TGC + HelloEEG; documenta conflicto Arduino/CH340 (ya lo vivimos).

**Idea:** seguir documentando COM + baud; no pelear TGC y `npm run serial` a la vez.

### 4. Visualización de stream
- [JackeyLea/MindViewer](https://github.com/JackeyLea/MindViewer) — GUI TGAM (Qwt/Qt). Buen checklist de métricas a mostrar (ya cubrimos en `wave.html`).

### 5. ML / datasets (opcional, más adelante)
- [AnilOsmanTur/Brain-Computer-Interface-with-Neurosky](https://github.com/AnilOsmanTur/Brain-Computer-Interface-with-Neurosky) — ML + blinks para UI (Mobile 2).
- [Zhyiar/Univsul-Dataset](https://github.com/Zhyiar/Univsul-Dataset) — dataset brainwave (referencia de formato).
- [PrinceEGY/pymindwave2](https://github.com/PrinceEGY/pymindwave2) — API Python Mobile 2 (Bluetooth; distinto a nuestro RF).

**Idea:** nuestros JSON de `attention` / `calibrate` / `portal` son el camino correcto hacia ML propio; no copiar Mobile 2 BLE tal cual.

## Qué NO copiar a ciegas

1. Asumir que Attention discrimina **color** → la comunidad no lo usa así.
2. Controles que requieren cambiar Attention en &lt;300 ms → el meter es ~1 Hz.
3. Mezclar apps oficiales TGC + bridge serial en el mismo COM.

## Mapa a nuestro repo

| Ellos | Nosotros |
|-------|----------|
| Runner: Attention = speed | `portal.html` power bar; mejorar Monkey Run igual |
| Wheelchair: blink = comando | estudios blink + catch trials |
| ArduMind drivers | `Drivers/` + `docs/connect.md` |
| MindViewer plots | `wave.html` |
| Dataset/ML | `docs/studies/*.json` + export AI |

## Próximos experimentos útiles (alineados a la comunidad)

Estado → ver checklist canónica en [`docs/tasks.md`](../tasks.md).

1. ✅ **Blink como comando** + estudios con export AI — hecho (`calibrate` / `portal`).
2. ✅ **Attention continuo** en portería — hecho (`portal.html` power bar).
3. ✅ **Visualización raw + FFT** — hecho (`wave.html`).
4. ✅ **Null result color/lado/forma vs RT** — documentado (exam 2026-07-24).
5. 🔓 **Attention → velocidad Monkey Run** — abierto (O01).
6. 🔓 **Doble blink / blink largo** — abierto (O02).

## Tag del repo

En GitHub → About → Topics: añadir `neurosky-mindwave`, `bci`, `eeg`, `thinkgear`, `fft`.

---

🥑 [aoxilus](https://github.com/aoxilus)
