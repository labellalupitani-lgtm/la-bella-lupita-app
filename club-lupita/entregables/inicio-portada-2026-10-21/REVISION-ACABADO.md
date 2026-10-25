# Revisión independiente de acabado visual

**Veredicto: PASS para la composición A, servida en 5190.** Es la que responde mejor a «una portada más visual, con menos texto y cabecera». No encontré un defecto visual bloqueante en su composición normal. La composición B, servida en 5194, no alcanza esa dirección: conserva la acumulación de cabecera, saludo, antetítulo, párrafo y llamadas redundantes a Carta.

## Alcance y evidencia

Leí únicamente `bar.md` y observé las dos referencias originales, las capturas suministradas y el render de ambos previews. No leí código de la app ni notas del builder. Capturas propias con Edge headless en 320×568, 390×844 y 1440×1000; evidencia en `evidencia/acabado/`. Esta revisión juzga acabado y composición; no sustituye la revisión funcional de teclado, estados de error ni datos.

El mecanismo compartido por las referencias es un producto que captura primero la mirada, espacio claro alrededor de su detalle principal y una relación corta entre producto, titular y acción. No requiere copiar colores, logotipo ni la forma exacta de esas interfaces.

## Comparación observada

| Aspecto | A: café entre las manos | B: sándwich en plato |
|---|---|---|
| Inicio de foto en 320 / 390 / 1440 | y=188 / 188 / 230,5 | y=231,5 / 250 / 383,6 |
| Foto móvil a 390 | 358,8 px de alto; alrededor del 74% del hero | 227,1 px de alto; alrededor del 50% del hero |
| Foto escritorio | 68% del ancho del hero | 60% del ancho del hero |
| Texto promocional | «Una pausa rica» y una acción | Antetítulo, titular y párrafo; llamadas adicionales a Carta después |
| Logo escritorio | 176×83 px, completo y proporcionado | 280×132 px; domina una cabecera de mayor altura |
| Primeras fotos de destacados a 390 | y=745 | y=861,7 |

La mejora no depende solo del cambio de comida a café. A cede superficie al producto, reduce la cabecera y elimina peldaños de lectura. En escritorio el café se distingue antes que el titular. En 390 la mirada baja de la taza a una línea de título y a una sola acción roja, sin texto encima de la fotografía. La firma dentro de la espuma permanece reconocible. «Mostrá tu pase» sigue visible al inicio en 320 y 390.

## Encuadre y continuación

La taza conserva borde, café y cuerpo reconocibles, sin deformación ni controles sobre el detalle. El recorte de manos y plato en escritorio no confunde qué se ofrece. Los tres destacados siguen inmediatamente después del hero. En escritorio se ven como una fila de comida; en móvil el borde de la tarjeta siguiente comunica continuidad horizontal. Sus nombres y precios aparecen al recorrer esa fila.

El risotto conserva el remate de flores, las capas de huevo/aguacate/arroz y la base del plato en la tarjeta móvil y escritorio. No está cortado por la mitad. Véanse `A-390-productos.png` y `A-1440-productos.png`.

**La mayor distancia restante frente a las referencias es el encuadre de la foto en escritorio:** las referencias aíslan la silueta completa de la bebida y le dejan aire; A usa un acercamiento de consumo, con manos y plato al borde. Es una diferencia concreta de dirección fotográfica, no un bloqueo: el centro del producto sigue libre, la marca se entiende y el encuadre permite que una foto real domine. No recomendaría añadir texto, adornos ni otro bloque para compensarla.

En 320×568 el título y la acción promocional quedan por debajo del primer viewport. El pase sí queda a la vista, y la primera pantalla ya tiene una foto de 320 px de alto. Es coherente con el mínimo fotográfico y el criterio de visibilidad del pase definidos en `bar.md`; no es una falla de ese criterio.

## Texto ampliado

Inspeccioné 200% de tamaño de texto en los tres anchos, duplicando los tamaños calculados de los elementos que contienen texto visible. Es una prueba de ampliación de texto, no una simulación de zoom completo del navegador. No apareció desbordamiento horizontal del documento en 320, 390 o 1440.

En 390 y escritorio el titular y «Explorar la carta» se reacomodan sin perder texto ni superponerse. A 320 las etiquetas de reserva, actualización y navegación se parten en más líneas; es menos compacto, pero siguen disponibles al desplazarse. No traslado los umbrales de altura del estado normal a este caso. Véanse `A-320-texto200-inicio.png`, `A-390-texto200-accion.png` y `A-1440-texto200-viewport.png`.

No se detectó un defecto de acabado que justifique otra ronda visual antes de mostrar A al usuario. La aprobación de dirección sigue siendo del usuario.

## Revalidación después del ajuste de foco

**PASS confirmado.** Revisé la nueva compilación de 5190 en 320×568, 390×844 y 1440×1000. La apariencia normal conserva la misma cabecera, proporción, encuadre y jerarquía. Entré a los productos mediante Tab y recorrí Pizza → Risotto → Dulce → Risotto → Pizza con Tab/Shift+Tab. La tarjeta enfocada queda completa dentro del carrusel en ambos móviles: foto, nombre y precio visibles, sin composición recortada ni desbordamiento del documento. En escritorio la fila mantiene las tres tarjetas completas. Evidencia nueva: `evidencia/acabado/revalidacion-*-inicio.png`, `revalidacion-*-tab-*.png`, `revalidacion-*-retroceso-*.png` y `revalidacion-render.json`. Sin lectura de código ni ampliación del alcance.
