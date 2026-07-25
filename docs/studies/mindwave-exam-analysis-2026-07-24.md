# Análisis matemático: lectura → figura (posición/forma/color)

Sesión: `study/mindwave-exam-20260724-1803.json`  
Estudio: `reading-waves-then-shape-position-color` · 2026-07-25T00:03:51Z  
Stats machine-readable: [`mindwave-exam-20260724-1803.stats.json`](mindwave-exam-20260724-1803.stats.json)

## 1. Veredicto ejecutivo

**Datos útiles** para: (a) validar blink-on-zero factorial 3×3×3×2, (b) contrastar Attention lectura vs figuras, (c) medir RT de blink.

| Hecho | Valor |
|-------|------:|
| Trials | 54/54 planned |
| Blink hit | **100%** (54/54), `source=raw` |
| Señal | `signal=0` en 53/54; trial 34 tuvo `signal=25` |
| Duración aprox. | **242 s** (~4 min) |
| Lectura → figuras | Attention media **68.4 → 47.1** (Δ **−21.3**) |

**No** se puede concluir decodificación de color / forma / lado desde EEG de 1 canal. η² de latencia por factor es ≈0 (ruido).

## 2. Diseño

- Factores: lado `{L,C,R}` × forma `{circle,square,triangle}` × color `{R,G,B}` × 2 reps → **54** celdas con n=2.
- Fase lectura con countdown 5→1; fin de lectura = **3 blinks** (`endBlinkOk=true`).
- Por figura: countdown 4→0; latencia = ms desde `zeroAt` hasta blink raw.
- `waveLog`: 125 715 filas (muchas duplicadas al rate del bridge); **~243** updates útiles de att/med (~1 Hz).

## 3. Descriptivos — latencia blink @ 0

| Métrica | ms |
|--------|---:|
| Media | 502.8 |
| Mediana | 482 |
| SD | 175.6 |
| Min / Max | 66 / 1266 |
| ~P10 / ~P90 | 356 / 650 |

Outliers claros: trial 29 = **1266 ms** (L·circle·R), trial 36 = **999 ms** (L·circle·G). Centro real ≈ **450–500 ms**.

Picos raw de blink: media **398**, rango **380–438** (cerca del umbral detector ~380 → detecciones “al borde”, no spikes enormes).

## 4. Attention / Meditation

### Lectura vs figuras (lo más interesante)

| Fase | n updates att | Att media | Att mediana | Att SD | Med media |
|------|-------------:|----------:|------------:|-------:|----------:|
| Lectura | 4 | **67.0** | 68.5 | 10.6 | 33.3 |
| End-blink | 2 | 75.5 | 75.5 | 2.1 | 56.5 |
| Figuras | 237 | **47.3** | 47.0 | 18.4 | 49.3 |

Serie corta de lectura (`attDuringRead`): `[77, 54, 63, 74, 74]` → mean **68.4**.  
En figuras: `attMeanOnFig` mean **47.1**, `attAtZero` **45.9**, `med` **49.1**.

**Deducción razonable:** durante lectura silenciosa la Attention eSense estuvo ~20 puntos más alta que en la tarea go-blink de figuras. Eso es un contraste de **fase/tarea**, no de estímulo visual. Meditation subió en figuras (~33 → ~49).

### Correlaciones (n=54 trials)

| Par | Pearson r |
|-----|----------:|
| `attMeanOnFig` × `latencyMs` | 0.165 |
| `attAtZero` × `latencyMs` | 0.061 |
| `med` × `latencyMs` | 0.178 |
| `peak` × `latencyMs` | −0.085 |
| `attMeanOnFig` × `peak` | 0.073 |

Todas |r| < 0.2 → **sin evidencia** de que Attention/Meditation predigan RT de blink en este diseño.

## 5. Efectos de estímulo sobre latencia

η² (fracción de varianza de latencia explicada por el factor):

| Factor | η² |
|--------|---:|
| Lado (L/C/R) | **0.012** |
| Forma | **0.017** |
| Color | **0.033** |

≈ 1–3% → efectos **despreciables** frente a la SD (176 ms).

### Medias por grupo (todas n=18, 18/18 hits)

| Grupo | Lat media | Lat mediana | Att fig |
|-------|----------:|------------:|--------:|
| L | 512 | 447 | 50.5 |
| C | 520 | 526 | 42.3 |
| R | 476 | 482 | 48.4 |
| circle | 534 | 496 | 47.3 |
| square | 487 | 482 | 48.6 |
| triangle | 487 | 465 | 45.3 |
| G | 540 | 522 | 48.8 |
| B | 462 | 455 | 40.5 |
| R | 506 | 509 | 51.9 |

Diferencias color (B más rápido ~80 ms vs G) **no** se interpretan como efecto perceptual: n=2 por celda, confusión con outliers, y η²≈0.03.

## 6. Qué SÍ puede deducir una AI matemática

1. **Pipeline blink usable** a escala factorial (54/54, raw peak ≥380).
2. **Contacto bueno** casi toda la sesión (un trial con poorSignal=25).
3. **Contraste de tarea**: Attention lectura ≫ Attention figuras (Δ≈21); Med figuras > Med lectura.
4. **RT blink @0**: centro ~480 ms; cola larga hasta ~1.3 s.
5. **Factores visuales no explican RT** (η²≈0); Attention tampoco predice RT (|r|<0.2).
6. **Diseño balanceado** (18 por nivel de cada factor) sirve como baseline de “null effect” para color/lado/forma.

## 7. Qué NO se puede deducir

1. **No** “leyó color/forma/lado con el cerebro” — respuesta es blink voluntario a countdown.
2. **No** clasificador ML de estímulo: no hay raw EEG por trial en el export (solo att/med/signal en `waveLog`).
3. **No** ERP / SSVEP: sampling de métricas ~1 Hz.
4. **No** umbral Attention hit/miss: 0 misses.
5. Ventana de lectura muy corta (~3.2 s de timestamps `startedAt→endedAt`) → pocos puntos att en lectura; el contraste Δ21 es real pero con n_updates lectura bajo.

## 8. Prompt sugerido para otra AI

```
Archivo: study/mindwave-exam-20260724-1803.json
(stats: docs/studies/mindwave-exam-20260724-1803.stats.json)

Hipótesis a testear (sin asumir decodificación 1-canal):
1) ¿Attention durante reading > durante figuras? (ya: +21)
2) ¿Latencia blink depende de side/shape/color? (η²≈0 → no)
3) ¿att/med predicen latencyMs? (r≈0 → no)
4) Reporta outliers, IC si aplica, y qué diseño haría falta para ERP/color.
```

## 9. Siguiente estudio (si quieres más señal matemática)

1. Lectura más larga (30–60 s) con att cada 1 s → serie temporal usable.
2. Incluir **miss/timeout** y catch no-go.
3. Winsorizar latencias >900 ms o marcar anticipaciones <150 ms.
4. Exportar raw segmentado ±500 ms alrededor de `zeroAt` si el objetivo es spike shape, no eSense.
5. CSV de trials (54 filas) además del JSON de 13 MB.

---

*Fuente: `study/mindwave-exam-20260724-1803.json` (13.3 MB, waveLog 125715). Análisis 2026-07-24.*
