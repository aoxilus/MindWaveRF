# RF Pairing and Testing

This document is for the original white NeuroSky MindWave headset that uses the USB RF dongle.

## Expected hardware state

- Headset powered with a good AAA battery
- Forehead sensor touching skin
- Ear clip attached
- Dongle plugged in and near the headset (about 1 meter or less)

## COM settings

- Baud rate: `57600`
- Dongle commands:
  - disconnect: `0xC1`
  - auto-connect: `0xC2`

Typical flow:

1. Open the COM port.
2. Toggle `DTR/RTS` if your software supports it.
3. Send `0xC1`.
4. Wait a short moment.
5. Send `0xC2`.
6. Wait up to about 10 seconds for pairing.

## What success looks like

Once paired, expect ThinkGear packets that begin with:

- `AA AA`

The RF dongle can also report status packets inside the ThinkGear stream, including:

- `0xD0`: headset found and connected
- `0xD1`: headset not found
- `0xD2`: headset disconnected
- `0xD3`: request denied
- `0xD4`: standby / searching

## LED / behavior notes

- **Blue** ≈ RF linked (software can then stream).
- **Red / idle** ≈ powered, not linked.
- **Blinking** ≈ searching; may never lock.
- Pairing is **headset ↔ dongle**, not the GUI. The app only reads the COM stream after link.
- Local status: one blue/`AA AA` session succeeded; later cycles often stay red/blinking with no packets. See [`findings.md`](findings.md).

## If nothing happens

Check these in order:

1. Make sure the headset is actually the RF model, not `MindWave Mobile`.
2. Replace the AAA battery.
3. Move the headset closer to the dongle.
4. Confirm the correct COM port.
5. Confirm the port is opened at `57600`.
6. Try sending `0xC1` before `0xC2`.
7. If using a signed CH340 driver, make sure your software pulses `DTR/RTS`.

## Driver interpretation

Two Windows device names are common for the same hardware:

- `MindWave USB Adapter (COMx)` - original NeuroSky-labeled driver
- `USB-SERIAL CH340 (COMx)` - generic/signed WCH driver

Historically, NeuroSky documentation preferred the first one. On current Windows 11 systems, the second one can still work if your software handles the serial port correctly.
