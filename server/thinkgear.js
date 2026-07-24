/**
 * NeuroSky ThinkGear binary stream parser (+ MindWave RF dongle status).
 * Packet: AA AA | plen | payload[plen] | checksum
 */

const CODE = {
  POOR_SIGNAL: 0x02,
  ATTENTION: 0x04,
  MEDITATION: 0x05,
  BLINK: 0x16,
  RAW_WAVE: 0x80,
  ASIC_EEG: 0x83,
  // RF dongle status
  HS_CONNECTED: 0xd0,
  HS_NOT_FOUND: 0xd1,
  HS_DISCONNECTED: 0xd2,
  REQ_DENIED: 0xd3,
  STANDBY_SCAN: 0xd4,
}

export function createThinkGearParser(onPacket) {
  let buf = Buffer.alloc(0)

  function feed(chunk) {
    buf = Buffer.concat([buf, Buffer.from(chunk)])
    while (buf.length >= 4) {
      const i = buf.indexOf(0xaa)
      if (i < 0) {
        buf = Buffer.alloc(0)
        return
      }
      if (i > 0) buf = buf.subarray(i)
      if (buf.length < 2) return
      if (buf[1] !== 0xaa) {
        buf = buf.subarray(1)
        continue
      }
      if (buf.length < 3) return
      const plen = buf[2]
      if (plen > 169) {
        buf = buf.subarray(2)
        continue
      }
      if (buf.length < 3 + plen + 1) return
      const payload = buf.subarray(3, 3 + plen)
      const checksum = buf[3 + plen]
      buf = buf.subarray(3 + plen + 1)

      let sum = 0
      for (const b of payload) sum = (sum + b) & 0xff
      if ((~sum & 0xff) !== checksum) continue

      const parsed = parsePayload(payload)
      if (parsed) onPacket(parsed)
    }
  }

  return { feed }
}

function parsePayload(payload) {
  const out = {
    attention: null,
    meditation: null,
    poorSignal: null,
    blink: null,
    raw: null,
    bands: null,
    dongle: null,
  }

  let i = 0
  while (i < payload.length) {
    const code = payload[i++]
    if (code === CODE.POOR_SIGNAL && i < payload.length) {
      out.poorSignal = payload[i++]
    } else if (code === CODE.ATTENTION && i < payload.length) {
      out.attention = payload[i++]
    } else if (code === CODE.MEDITATION && i < payload.length) {
      out.meditation = payload[i++]
    } else if (code === CODE.BLINK && i < payload.length) {
      out.blink = payload[i++]
    } else if (code === CODE.RAW_WAVE && i + 2 < payload.length) {
      const len = payload[i++]
      if (len === 2 && i + 1 < payload.length) {
        let raw = (payload[i] << 8) | payload[i + 1]
        if (raw > 32767) raw -= 65536
        out.raw = raw
        i += 2
      } else {
        i += len
      }
    } else if (code === CODE.ASIC_EEG && i < payload.length) {
      const len = payload[i++]
      if (len === 24 && i + 24 <= payload.length) {
        const names = [
          'delta',
          'theta',
          'lowAlpha',
          'highAlpha',
          'lowBeta',
          'highBeta',
          'lowGamma',
          'midGamma',
        ]
        out.bands = {}
        for (let b = 0; b < 8; b++) {
          const o = i + b * 3
          out.bands[names[b]] = (payload[o] << 16) | (payload[o + 1] << 8) | payload[o + 2]
        }
        i += 24
      } else {
        i += len
      }
    } else if (code === CODE.HS_CONNECTED && i < payload.length) {
      const len = payload[i++]
      const id =
        len >= 2 && i + 1 < payload.length
          ? ((payload[i] << 8) | payload[i + 1]).toString(16).padStart(4, '0')
          : '?'
      out.dongle = { state: 'connected', headsetId: id }
      i += len
    } else if (code === CODE.HS_NOT_FOUND && i < payload.length) {
      const len = payload[i++]
      out.dongle = { state: 'not_found' }
      i += len
    } else if (code === CODE.HS_DISCONNECTED && i < payload.length) {
      const len = payload[i++]
      out.dongle = { state: 'disconnected' }
      i += len
    } else if (code === CODE.REQ_DENIED && i < payload.length) {
      const len = payload[i++]
      out.dongle = { state: 'denied' }
      i += len
    } else if (code === CODE.STANDBY_SCAN && i < payload.length) {
      const len = payload[i++]
      const mode = len >= 1 && i < payload.length ? payload[i] : 0
      out.dongle = { state: mode === 1 ? 'searching' : 'standby' }
      i += len
    } else if (code >= 0x80 && i < payload.length) {
      // multi-byte unknown
      const len = payload[i++]
      i += len
    } else {
      // single-byte unknown — skip value if present
      if (i < payload.length) i++
    }
  }

  return out
}

/** MindWave RF USB dongle command bytes */
export const RF = {
  CONNECT: (idHi, idLo) => Buffer.from([0xc0, idHi, idLo]),
  DISCONNECT: Buffer.from([0xc1]),
  AUTO_CONNECT: Buffer.from([0xc2]),
}
