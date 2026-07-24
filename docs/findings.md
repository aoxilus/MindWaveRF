# Findings (local test, Jul 2026)

Short status: **PC ↔ dongle works. RF link is intermittent (needs blue LED). Software maps COM after link.**

## What contributed when LED went blue

Software did **not** create the blue link. When the headset was already blue, this sequence read ThinkGear:

1. Find live dongle (`VID_1A86`/`PID_7523`) — port moved **COM17 → COM18** after replug/driver churn.
2. Kill any old `serial-bridge` / probe holding the COM.
3. Open COM @ **57600**.
4. Pulse **DTR/RTS** (off → on). Needed with signed CH340 (NeuroSky INF used to assert lines).
5. Send **`0xC1`** (disconnect), wait ~400 ms, send **`0xC2`** (auto-connect).
6. Success signal: bridge logs `Sync ThinkGear (0xAA)` / packets starting `AA AA`.

Commands used:

```text
npm run serial -- COM18
```

(`server/serial-bridge.js` — WebSocket `ws://127.0.0.1:13855`)

Sandbox probe (multi-case): `sandbox/rf-probe.mjs` / `sandbox/rf-probe.ps1`.

## Driver path

| Step | Result |
|------|--------|
| Original MindWave `3.11.2015.08` | **Code 52** under Secure Boot |
| `bcdedit testsigning` | Blocked by Secure Boot |
| Signed WCH CH340 `3.9.2024.9` | COM OK; name stays `USB-SERIAL CH340` |

## Mapping notes (serial)

| Observation | Detail |
|-------------|--------|
| Blue LED claimed + bridge | Often `streaming` + many bytes, but **0× `AA AA` pairs** → noise, GUI empty |
| Real ThinkGear | Need consecutive **`AA AA`**, then attention/meditation/raw parse |
| False "sync" bug | Bridge used to treat any single `0xAA` as sync; fixed to require `AA AA` |
| Not linked / bad RF UART | Hex noise like `08 09 …`; wave.html shows dashes |
| Doc-only `0xC2` without blue | Does not force RF pair |

## Separation of concerns

- **Hardware** = RF pair (blue).
- **Software** = open COM, DTR/RTS, optional `0xC1`/`0xC2`, parse ThinkGear.
- GUI does not pair; it only displays after link + valid packets.

## Retest checklist when blue

1. Confirm live COM (Device Manager / PnP `1A86:7523`).
2. `npm run serial -- COMx` **or** TGC on that COM (not both).
3. Expect sync `AA AA`; wear sensor + ear clip for attention/meditation.
4. If blue drops: stop expecting EEG until blue returns.

Note: `0xC2` / TGC Retry do not force the LED blue — that is RF hardware.
