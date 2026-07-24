# Cómo conectar MindWave + wave.html

Guía corta para ver Attention / Meditation / raw / blink en el navegador.

## 1. Hardware

1. Inserta el **MindWave Wireless USB Adapter** (quita la tapa, USB del PC).
2. Enciende el headset (pila AAA), sensor en frente, clip en oreja.
3. Acerca el headset al dongle (~20–50 cm) hasta LED **azul** (enlace RF).  
   Rojo = encendido pero sin enlace.

## 2. Puerto COM

En Administrador de dispositivos → Puertos (COM y LPT):

- Ideal: `MindWave USB Adapter (COMx)`
- También sirve: `USB-SERIAL CH340 (COMx)` (mismo dongle, driver WCH firmado)

Anota el número (**COM17**, **COM18**, etc.). Puede cambiar al desconectar/reconectar.

## 3. Software de este repo

```powershell
cd MindWaveRF
npm install

# Bridge serial → WebSocket (usa TU COM y baud 115200)
npm run serial -- COM18 115200

# En otra terminal: UI
npm run waves
```

Abre:

| URL | Qué es |
|-----|--------|
| http://localhost:5173/wave.html | Monitor EEG + concentrado / blink |
| http://localhost:5173/calibrate.html | Estudio blink + color + lado |
| http://localhost:5173/ | Monkey Run (juego) |

El bridge escucha en `ws://127.0.0.1:13855`. La web se conecta sola.

### Si no hay paquetes

1. LED azul en el headset.
2. COM correcto en el comando `npm run serial`.
3. Baud **115200** (en pruebas locales 57600 a veces no sincroniza con CH340 firmado).
4. No abras el mismo COM a la vez con ThinkGear Connector y `npm run serial`.

## 4. Paquete oficial NeuroSky (~400 MB)

El instalador “Setup - NeuroSky MindWave” pide insertar el adaptador USB.  
**Next** se habilita cuando Windows detecta el dongle.

- Quita la tapa del dongle → enchúfalo → espera 2–5 s → **Next**.
- Si ya estaba enchufado: desconecta, espera, vuelve a conectar.
- Ese paquete instala apps / drivers oficiales. Puede renombrar el dispositivo o cambiar el COM.

**Convivencia:**

- Si usas **ThinkGear Connector** del paquete oficial: cierra `npm run serial` y usa `npm run bridge` (TGC → WebSocket).
- Si usas **solo este repo**: `npm run serial -- COMx 115200` + `npm run waves`.

## 5. Qué ver en wave.html

- **Attention / Meditation** ~1 Hz (eSense del chip ThinkGear).
- **Raw EEG** ~512 Hz (la curva; blinks = picos grandes).
- Estado **CONCENTRADO / NO CONCENTRADO / BLINK** (umbrales + detección por pico raw).

Señal mala (`poorSignal` alto): mejora contacto frente + oreja.
