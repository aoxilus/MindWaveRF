# Headset no enciende (MindWave blanco RF)

Si el **dongle USB** funciona en Windows (`COM17`, `CH340`) pero el **headset no prende**, el problema es hardware — no el juego ni el driver.

## Checklist rápido

1. **Pila AAA nueva** (alcalina, no recargable si el compartimento no lo indica).
2. **Polaridad**: el `+` va hacia la bobina del resorte (suele ser el lado opuesto al resorte).
3. **Interruptor**: desliza ON; a veces queda a medias entre OFF y ON.
4. **Contactos**: limpia óxido en el compartimento con un paño seco o alcohol isopropílico.
5. **Prueba otra pila** aunque la “nueva” sea dudosa (muchas vienen descargadas en tienda).

## Qué deberías ver

| LED | Significado |
|-----|-------------|
| **Nada / apagado** | Sin alimentación → pila, contacto o interruptor |
| **Rojo fijo o parpadeo** | Encendido pero **sin enlace RF** al dongle |
| **Azul** | Enlace RF OK — ahí corre `npm run serial` y el juego |

El software **no puede** encender el headset ni forzar el LED azul. Solo lee datos **después** del enlace RF.

## Si sigue sin prender

- Saca la pila 30 s, vuelve a ponerla y prueba ON otra vez.
- Headset a **< 1 m** del dongle con pila puesta (algunos encienden el radio solo cerca).
- Si nunca enciende con 2 pilas distintas: posible fallo del compartimento, interruptor o placa del headset.

## Cuando ya encienda (rojo o azul)

Desde la raíz del repo:

```powershell
npm run serial -- COM17
npm run dev
```

Abre http://localhost:5173/ — el HUD debe mostrar `mindwave` cuando lleguen paquetes.
