# 🔌 Connect MindWave · Conectar MindWave

<p>
  <strong>EN</strong> — See Attention / Meditation / raw / blink in the browser.<br/>
  <strong>ES</strong> — Ver Attention / Meditation / raw / blink en el navegador.
</p>

---

## 1️⃣ Hardware

| Step | 🇺🇸 English | 🇪🇸 Español |
|------|-------------|------------|
| 1 | Plug the **MindWave Wireless USB Adapter** (remove the cap) | Inserta el **adaptador USB** (quita la tapa) |
| 2 | Power headset (AAA), forehead sensor + ear clip | Enciende headset (AAA), sensor frente + clip oreja |
| 3 | Hold near dongle (~20–50 cm) until **blue LED** | Acerca al dongle hasta LED **azul** |

💡 **LED guide · Guía LED**

| Color | Meaning · Significado |
|-------|------------------------|
| 🔵 Blue | RF linked · Enlace RF OK |
| 🔴 Red | On, not linked · Encendido sin enlace |
| ⚫ Off | No power · Sin pila / no enciende → [`headset-no-power.md`](headset-no-power.md) |

---

## 2️⃣ COM port · Puerto COM

**Device Manager → Ports (COM & LPT)** · Administrador de dispositivos → Puertos

- ✅ Ideal: `MindWave USB Adapter (COMx)`
- ✅ Also OK: `USB-SERIAL CH340 (COMx)` (same dongle)

📝 Write down the number (`COM17`, `COM18`…). It can change after unplug/replug.  
· Anota el COM; puede cambiar al desconectar.

---

## 3️⃣ This repo · Este repo

```powershell
cd MindWaveRF
npm install

# 🌉 Bridge (use YOUR COM + baud 115200)
npm run serial -- COM18 115200

# 🖥️ UI (other terminal)
npm run waves
```

| URL | 🇺🇸 | 🇪🇸 |
|-----|----|----|
| http://localhost:5173/wave.html | EEG monitor | Monitor EEG |
| http://localhost:5173/attention.html | Attention calibration | Calibrar Attention |
| http://localhost:5173/calibrate.html | Blink + color + side | Blink + color + lado |
| http://localhost:5173/portal.html | Mental goal game | Portería mental |
| http://localhost:5173/ | Monkey Run | Monkey Run |

WebSocket: `ws://127.0.0.1:13855` (auto-connect from the pages).

### ❓ No packets · Sin paquetes

1. 🔵 Blue LED on headset  
2. ✅ Correct COM in `npm run serial`  
3. ⚡ Baud **115200** (57600 often fails with signed CH340)  
4. ⛔ Don’t open the same COM with TGC **and** `npm run serial`

---

## 4️⃣ Official NeuroSky installer (~400 MB)

On *“Please insert the MindWave Wireless USB Adapter”*:

1. 🧢 Remove dongle cap  
2. 🔌 Plug into USB  
3. ⏳ Wait 2–5 s until **Next** enables  

If already plugged: unplug → wait → replug.

**Coexistence · Convivencia**

| Mode | Do this |
|------|---------|
| 📦 Official TGC | Close `npm run serial` → `npm run bridge` |
| 🧪 This repo only | `npm run serial -- COMx 115200` + `npm run waves` |

---

## 5️⃣ What you’ll see in wave.html · Qué verás

| Signal | Rate | Notes |
|--------|------|-------|
| 🎯 Attention / Meditation | ~1 Hz | eSense (ThinkGear chip) |
| 📈 Raw EEG | ~512 Hz | Curve; blinks = big spikes |
| 🏷️ Status | live | CONCENTRADO / NO / BLINK |

Poor contact (`poorSignal` high) → fix forehead + ear clip.  
· Señal mala → mejora contacto frente / oreja.
