# Corrección de Tienda tras crítica independiente

Se revisó revision-oficio-r1.md (compilación C1ep5tM_). La taza contextual se retiró de la composición principal: cuando falta fotografía del lote, la ficha visual usa peso, presentación y número de lote de la API, junto a un dibujo abstracto de granos. No representa un empaque ni una fotografía del artículo. Si existe foto publicada, se sigue mostrando; si falla, se vuelve a la ficha del lote.

El círculo decorativo fue eliminado, resolviendo su colisión a tamaño de texto aumentado. La ficha usa flujo natural y crece con el texto.

Los campos del encargo usan columnas minmax(0,1fr), mínimos de ancho explícitos y una sola columna en móvil. El texto no se recorta para resolver el desborde.

## Evidencia propia (no sustituye revisión independiente)

Preview Vite aislada 5290, datos sintéticos, sin operación de pago ni envío a WhatsApp. Script `../tienda-construccion.mjs`.

- 320/390/700/913/1440 normales con gutter estable: sin desborde horizontal.
- 320/390/913 con tamaño raíz 32px: sin desborde. En390 título68px, scrollWidth375 para viewport390; el caso fallido antes era518px.
- 320 con tamaños computados de todo main duplicados: sin desborde ni composición circular que pueda solaparse.
- Ficha café/retiro por teclado, resumen de encargo, consentimiento previo, movimiento reducido y fallback de imagen404: correctos.
- axe: ninguna violación. TypeScript y guardian: correctos.

Se conservan capturas de construcción anterior en `../tienda-construccion/`. Estas nuevas capturas son `../tienda-correccion-r2/`; deben revisarse antes del cierre.
