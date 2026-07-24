# ThinkGear Connector (from Windows Developer Tools 3.2)

Source zip: `Downloads\Windows-Developer-Tools-3.2.zip`  
Extracted under: `tools/Windows-Developer-Tools-3.2/`

## Run TGC

```text
tools\Windows-Developer-Tools-3.2\Windows Developer Tools 3.2\ThinkGear_Connector\ThinkGear_Connector\ThinkGear Connector.exe
```

- Needs **.NET Framework 4.0+**
- Listens on TCP **`127.0.0.1:13854`**
- Opens the MindWave COM port itself (close `npm run serial` first so COM is free)

## With this repo (game + waves GUI)

1. Start **ThinkGear Connector.exe**
2. Headset ON, blue / linked; pick the right COM inside TGC if asked
3. In repo root: `npm run bridge` (TGC → WebSocket `13855`)
4. Open `http://localhost:5173/wave.html`

Do **not** run `npm run serial` and TGC at the same time (both fight for the COM).

## Docs in the package

- `ThinkGearConnectorUserGuide.pdf`
- `ThinkGearConnectorDevelopmentGuide.pdf`
- `ThinkGearSocketProtocol.pdf`
