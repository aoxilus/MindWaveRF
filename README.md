# MindWaveRF

Windows USB driver for the **NeuroSky MindWave** (original white RF headset) wireless USB dongle.

If Device Manager shows `USB-SERIAL CH340` instead of **MindWave USB Adapter**, Windows installed the wrong generic driver and the headset will not pair correctly over RF.

## Driver

| Item | Value |
|------|--------|
| Device name | MindWave USB Adapter |
| Version | 3.11.2015.08 (2015-08-03) |
| USB ID | `VID_1A86` / `PID_7523` (CH340) |
| Files | [`Drivers/`](Drivers/) |

Source of these files: community mirror from [sieuwe1/ArduMind](https://github.com/sieuwe1/ArduMind/tree/master/Drivers) (same INF / version NeuroSky documented). Official NeuroSky downloads are often offline (HTTP 522).

> Hardware/firmware © NeuroSky / WCH. Redistributed here so people with the legacy RF dongle can still install the adapter on modern PCs.

## Install (Windows)

1. Plug in the **RF USB dongle**.
2. Run [`Drivers/SETUP.EXE`](Drivers/SETUP.EXE) **as Administrator**.
3. Choose **Uninstall**, then **Install**.
4. Unplug and replug the dongle.
5. In Device Manager → Ports (COM & LPT) you should see:
   - `MindWave USB Adapter (COMx)`

### Manual install

1. Device Manager → right-click the CH340 / unknown COM device → **Update driver**.
2. **Browse my computer** → select the `Drivers` folder in this repo.
3. Confirm it binds to `CH341SER_MW.INF`.

## Windows 10/11: Code 52 (unsigned driver)

This 2015 driver is often blocked with:

> Windows cannot verify the digital signature… (Code 52)

Temporary workaround (Admin PowerShell):

```powershell
bcdedit /set testsigning on
```

Reboot. After you are done testing:

```powershell
bcdedit /set testsigning off
```

Reboot again.

**Secure Boot** systems may still refuse unsigned drivers; you may need Advanced Startup → Disable driver signature enforcement for one boot, or a machine where test signing is allowed.

## After the driver works

1. Turn on the headset (AAA battery), forehead sensor + ear clip.
2. Keep headset near the dongle (~1 m).
3. Open the COM port at **57600** baud and send RF **auto-connect** `0xC2` (or use ThinkGear Connector / MindWave Manager if you have it).
4. Expect ThinkGear packets starting with `AA AA`.

Protocol notes: [MindWave RF dongle communication](https://developer.neurosky.com/docs/lib/exe/fetch.php?media=app_notes%3Amindwave_rf_external.pdf).

## Not for

- **MindWave Mobile / Mobile 2** (Bluetooth / BLE) — no RF dongle; use Bluetooth SPP/BLE instead.
- Replacing the RF radio with a DIY BLE module — different hardware mod; this repo is only the USB dongle driver.

## License / disclaimer

Driver binaries are provided as-is for personal/educational use with legacy NeuroSky hardware. No warranty. You are responsible for Windows driver-signing policy on your PC.
