# MindWaveRF

Driver, bridge ThinkGear y apps web para el **NeuroSky MindWave** (headset blanco RF + dongle USB).

- **wave.html** — monitor EEG (Attention, Meditation, raw, bandas, blink / concentrado)
- **calibrate.html** — estudio blink + color + lado de pantalla
- **index.html** — Monkey Run (juego mental)
- **Drivers/** — driver USB del dongle
- **server/** — bridge serial / TGC → WebSocket `13855`

## Conectar (resumen)

Guía completa: [`docs/connect.md`](docs/connect.md)

```powershell
npm install
npm run serial -- COM18 115200   # cambia COM si hace falta
npm run waves                    # http://localhost:5173/wave.html
```

1. Dongle USB enchufado (COM visible en Device Manager).
2. Headset ON, LED **azul**, sensor + clip.
3. Bridge + `wave.html` → datos en vivo.

Si el LED está rojo, acerca el headset al dongle. Si no enciende: [`docs/headset-no-power.md`](docs/headset-no-power.md).

### Instalador oficial NeuroSky (~400 MB)

En la pantalla *“Please insert the MindWave Wireless USB Adapter”*: quita la tapa del dongle, enchúfalo, espera a que Windows lo detecte y se active **Next**.  
Ese software puede instalar su propio driver; el COM puede cambiar. No uses TGC y `npm run serial` a la vez sobre el mismo puerto.

## Project layout

| Path | Purpose |
|------|---------|
| [`Drivers/`](Drivers/) | NeuroSky MindWave USB adapter driver (CH340) |
| [`server/`](server/) | Serial / ThinkGear WebSocket bridges |
| [`src/`](src/) | Game, wave viewer, calibrator |
| [`sandbox/`](sandbox/) | RF probe scripts |
| [`docs/`](docs/) | Pairing, Secure Boot, connect guide |

## Baud note (importante)

Con driver **USB-SERIAL CH340** firmado, en esta máquina el stream ThinkGear estable fue a **115200**, no 57600. El bridge acepta:

```text
npm run serial -- COMx 115200
```

## Driver

| Item | Value |
|------|--------|
| Device name | MindWave USB Adapter |
| Version | 3.11.2015.08 (2015-08-03) |
| USB ID | `VID_1A86` / `PID_7523` (CH340) |
| Files | [`Drivers/`](Drivers/) |

Source: community mirror [sieuwe1/ArduMind](https://github.com/sieuwe1/ArduMind/tree/master/Drivers). Official NeuroSky downloads are often offline.

> Hardware/firmware © NeuroSky / WCH. Redistributed for personal/educational use with legacy RF dongles.

## Docs

- [`docs/connect.md`](docs/connect.md) — **cómo conectar** (empezar aquí)
- [`docs/headset-no-power.md`](docs/headset-no-power.md) — headset no enciende
- [`docs/findings.md`](docs/findings.md) — hallazgos locales (blue LED, COM, baud)
- [`docs/thinkgear-connector.md`](docs/thinkgear-connector.md) — TGC
- [`docs/windows-11-secure-boot.md`](docs/windows-11-secure-boot.md) — Code 52 / Secure Boot
- [`docs/rf-pairing-and-testing.md`](docs/rf-pairing-and-testing.md) — RF checklist

## Scripts

| Command | Action |
|---------|--------|
| `npm run serial -- COMx 115200` | Bridge dongle → `ws://127.0.0.1:13855` |
| `npm run waves` | Abre wave.html |
| `npm run calibrate` | Abre estudio blink |
| `npm run dev` | Vite (juego + todo) |
| `npm run bridge` | TGC TCP → WebSocket (si usas software oficial) |

## License / disclaimer

Driver binaries and NeuroSky protocol as-is for personal/educational use. No warranty. You are responsible for Windows driver-signing policy on your PC.
