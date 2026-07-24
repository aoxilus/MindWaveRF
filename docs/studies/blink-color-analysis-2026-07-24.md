# Análisis: blink + color + lado (2026-07-24)

Sesión MindWave RF · detector `source=raw` · protocolo ESPERA → bola coloreada (L/R) → parpadeo.

## 1. Veredicto ejecutivo

**Datos relevantes y usables** para validar el pipeline de detección de blink y medir latencia de reacción.

- n=24, hit rate **100%** (24/24), `signal=0` en todos los trials, sin misses.
- Contacto y detector estables; sesión corta (~61 s entre primer y último trial).
- **No** sirve para decodificar color/lado desde EEG ni para contrastar atención hit vs miss (no hay misses).

Predicción UI: `Hit 100%` · `blink OK 24/24` · `att@OK 49` · `att@miss —` · `L 13/13 R 11/11`.

## 2. Estadísticos descriptivos

| Métrica | Valor |
|--------|------:|
| n trials | 24 |
| Hits (blink=true) | 24 (100%) |
| Misses | 0 |
| Latencia media | 308.9 ms |
| Latencia mediana | 290.5 ms |
| Latencia SD (muestral) | 106.8 ms |
| Latencia min / max | 193 / 666 ms |
| attAtShow media | 49.6 (mediana 48; SD 15.1; rango 27–90) |
| att (al blink) media | 49.3 |
| med media | 50.3 |
| Duración aproximada | 61.2 s |

Notas: dos outliers de latencia (543 ms, 666 ms) elevan media y SD; la mediana (~291 ms) describe mejor el centro. Todos los detections con `source=raw`.

## 3. Por lado (L vs R)

| Lado | n | Hit | Latencia media (ms) | attAtShow media | att media |
|------|--:|----:|--------------------:|----------------:|----------:|
| L | 13 | 13/13 | 325.5 | 43.2 | 42.2 |
| R | 11 | 11/11 | 289.2 | 57.1 | 57.6 |

L ligeramente más lento (~36 ms) y con atención más baja; n pequeño y lados no balanceados por color → no interpretar como efecto lateral real.

## 4. Por color

| Color | n | L/R | Latencia media (ms) | attAtShow media |
|-------|--:|----:|--------------------:|----------------:|
| Roja (R) | 4 | 3/1 | 285.5 | 56.8 |
| Verde (G) | 5 | 4/1 | 337.8 | 50.6 |
| Azul (B) | 8 | 5/3 | 263.3 | 39.3 |
| Amarilla (Y) | 7 | 1/6 | 353.7 | 56.6 |

Conteos desiguales y confusión color×lado (p. ej. Y casi solo en R). Diferencias de latencia/atención **no** permiten concluir efecto de color.

## 5. Atención vs latencia

Pearson `attAtShow` × `latencyMs`: **r = 0.197** (n=24).  
Pearson `att` × `latencyMs`: **r = 0.214**.

Correlación débil/positiva, compatible con ruido. Con n=24 y sin misses, **no** hay evidencia de que mayor atención acelere (ni ralentice) el blink. No usar eSense Attention como predictor de RT en este diseño.

## 6. Qué SÍ se puede concluir

1. **Pipeline de blink usable**: 100% hits con pico raw EEG (sin depender de `blinkStrength`).
2. **Contacto bueno**: `signal=0` en todos los trials.
3. **Timing de reacción**: centro ~290–310 ms post-aparición; rango típico ~200–400 ms salvo 2 outliers.
4. **Lados ambos detectables**: L 13/13, R 11/11.
5. **eSense Attention/Meditation** se registraron de forma coherente (~1 Hz, 0–100); útiles como covariables de sesión, no como decodificación de estímulo.

## 7. Qué NO se puede concluir

1. **No se puede decodificar color (ni lado) desde EEG** con este protocolo: el sujeto parpadea a un estímulo visual; no hay clasificación ML ni ERP.
2. **Sin contraste att@OK vs att@miss**: 0 misses → `attMiss=null`; no hay umbral de atención asociado a fallo.
3. **No hay efecto color/lado interpretable**: n bajo, desbalance y confusión color×lado.
4. Attention/Meditation de NeuroSky **no** son lectura de “pensó el color”.

## 8. Recomendaciones para el siguiente estudio

1. **Catch / no-go**: trials sin bola o “no parpadear” para medir falsos positivos y rate de misses.
2. **Balance factorial**: igual n por color×lado (p. ej. 8–12 por celda).
3. **ISI más largo y variable** (p. ej. 1.5–3.5 s) para reducir anticipación y serial correlation.
4. **Timeout explícito** si no hay blink → registrar miss + `attAtShow` para contraste hit/miss.
5. **Export CSV** además del JSON (columnas: trial, color, side, attAtShow, blink, latencyMs, att, med, signal, t).
6. **Marcar outliers** o winsorizar latencias >500–600 ms en reportes de RT.
7. Si el objetivo es BCI de color: diseño distinto (ERP/SSVEP, sin blink como respuesta), no este go-blink.

---

*Fuente: export de sesión `study.samples` (n=24, hitRate=1, attOk≈49.25). Análisis 2026-07-24.*
