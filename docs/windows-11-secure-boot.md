# Windows 10/11, Code 52, and Secure Boot

This repo contains the original `MindWave USB Adapter` driver package (`3.11.2015.08`). On modern Windows, that driver often installs but fails to load with:

> Windows cannot verify the digital signature for the drivers required for this device. (Code 52)

## Path A: Original MindWave driver

Use this if you want the dongle to appear exactly as:

- `MindWave USB Adapter (COMx)`

Install steps:

1. Plug in the RF dongle.
2. Run `Drivers/SETUP.EXE` as Administrator.
3. Choose `Uninstall`, then `Install`.
4. Replug the dongle.
5. Confirm Device Manager shows `MindWave USB Adapter (COMx)`.

### If Code 52 appears

Try one of these:

1. Advanced Startup -> Startup Settings -> `7) Disable driver signature enforcement` for one boot.
2. `bcdedit /set testsigning on` and reboot.

Notes:

- `testsigning` may be blocked by Secure Boot policy.
- If Secure Boot blocks `testsigning`, Windows can still refuse the 2015 driver.

## Path B: Keep Secure Boot on

If you do not want to disable Secure Boot, use a newer signed WCH CH340/CH341 driver for the same USB IDs.

Expected result:

- Device Manager shows `USB-SERIAL CH340 (COMx)`.
- The port opens normally.
- The dongle is still the same RF hardware; only the Windows driver binding changed.

This path is useful when:

- the original MindWave driver fails with Code 52
- `testsigning` is blocked by Secure Boot
- your software can toggle `DTR/RTS` and send RF auto-connect `0xC2`

## What was verified locally

With Secure Boot left enabled:

1. Signed CH340 restored `COM17` (no Code 52).
2. Port opens at `57600`; DTR/RTS + `0xC2` work from software.
3. When the headset briefly linked (blue LED), ThinkGear sync (`AA AA`) was seen.

Caveat: RF pairing later became intermittent / failed to relink. Driver path is OK; remaining issue is headset↔dongle RF. Details: [`findings.md`](findings.md).

## Choosing between the two

Choose the original MindWave driver if:

- you need the exact historical NeuroSky install path
- you are on an older Windows setup that accepts the 2015 package

Choose the signed CH340 driver if:

- you want to keep Secure Boot enabled
- Windows 11 blocks the 2015 package
- you are using your own bridge, script, or app that can control the COM port directly
