# Revisión independiente de acabado

**Resultado: PASS.** La composición inmersiva satisface visualmente «una portada más inmersiva, con la foto a todo el ancho». No encuentro un defecto concreto que justifique otra ronda de cosmética.

Revisión realizada el 21 de octubre de 2026 a partir de `bar.md`, las dos referencias de WhatsApp, las capturas proporcionadas de 320/390/768/1024/1440 px y las páginas locales. No se consultó código fuente ni notas del builder; no se modificó la aplicación.

## Comparación por mecanismo

La comprobación local identifica **A (`5190`) como la composición inmersiva** y **B (`5195`) como la composición encajada**. Las capturas propias A-390/A-1440 reproducen las capturas suministradas de la composición inmersiva. El juicio se basa en lo que muestran, no en los nombres de archivo ni en la antigüedad asignada.

En A la imagen llega a ambos bordes y continúa por detrás del titular y de la acción. El tratamiento marrón reúne fotografía y texto en una sola superficie. En B la fotografía termina ante un panel claro: debajo en móvil y a la derecha en escritorio. A reproduce mejor el mecanismo de la primera referencia —producto dominante, fondo continuo y una acción— y responde directamente a la elección del usuario. La ausencia de radios en la portada es una decisión explícita y coherente con este objetivo.

## Comprobaciones de acabado

| Aspecto | Juicio y evidencia |
| --- | --- |
| Borde a borde | PASS. En las cinco anchuras suministradas no aparece marco lateral ni panel vacío. En la comprobación DOM propia, A mide x=0/ancho=390 y x=0/ancho=1440; el ancho del documento coincide con el viewport en ambos casos. |
| Inicio de la foto | PASS. Empieza en y=188 a 390 px y y=230,55 a 1440 px, dentro del umbral establecido. Cabecera y pase siguen antes de la portada. |
| Producto y marca | PASS. La taza se reconoce por el aro dorado, la espuma, el cuerpo blanco acanalado y las manos. La marca queda visible y libre de texto en los cinco tamaños inspeccionados. No se aprecia deformación. |
| Texto y acción a 390 px | PASS. Titular y botón se sitúan en la zona inferior oscurecida: h1 desde y=558 y CTA desde y=611. Se conservan la marca y el centro de la bebida por encima. CTA de 48 px de altura. |
| Texto y acción a 1440 px | PASS. Texto abajo a la izquierda, con margen de 112 px; marca y centro de la taza permanecen despejados. El recorte del cuerpo no impide reconocer el producto. CTA de 48 px de altura. |
| Texto al 200% | PASS de composición. Se duplicaron tamaños de fuente computados y alturas de línea en el navegador, sin editar archivos de la app. En móvil el titular crece de 32 a 64 px y la portada de 499 a 557 px; en escritorio, de 56 a 112 px y de 691 a 780 px. Titular y CTA no se pisan ni quedan recortados; el CTA se alcanza al desplazar la página. No hay desbordamiento horizontal en 390 o 1440 px. |
| Transición a productos | PASS. «Para acompañar» sigue inmediatamente al final de la foto, con unos 20 px de separación en móvil y 28 px en escritorio. Las tres fotografías posteriores mantienen una escala clara en escritorio; en móvil el fragmento de la siguiente tarjeta comunica continuidad horizontal. |

En el viewport corto de 320 px la acción queda por debajo del primer pliegue; no se confunde con contenido eliminado y no contradice el bar, que permite desplazamiento. Con texto ampliado ocurre lo mismo: la navegación fija puede ocupar parte de la vista inicial, pero el desplazamiento permite ver y accionar el CTA completo.

## Mayor diferencia respecto a las referencias

Las referencias dejan más aire alrededor de la silueta de cada bebida; en escritorio A ofrece un acercamiento mucho mayor y corta parte baja de taza y plato. Es la diferencia concreta más grande. **No es un fallo de aceptación:** el producto mantiene identidad inequívoca, el centro y la marca siguen libres, y la escala produce la inmersión solicitada. Exigir el cuerpo entero cambiaría la dirección elegida sin resolver un problema observado.

## Evidencia y alcance

- `evidencia/acabado/A-390.png` y `A-1440.png`: capturas propias de A con Playwright y Edge, viewport normal.
- `evidencia/acabado/B-390.png` y `B-1440.png`: comparación visual propia con B.
- `evidencia/acabado/A-390-texto200-top.png` y `A-390-texto200-cta.png`: ampliación real de las fuentes computadas al doble, vista inicial y acción tras desplazar.
- `evidencia/acabado/A-1440-texto200-top.png` y `A-1440-texto200-cta.png`: misma comprobación en escritorio y transición a los tres productos.
- `evidencia/acabado/observaciones-A-dom.json`: posiciones y tamaños medidos; `captura.cjs` permite reproducir las capturas de A.

Este PASS cubre acabado y composición. La legibilidad se inspeccionó visualmente; ratios numéricos de contraste, foco, teclado, orden DOM, rendimiento y estabilidad requieren la revisión técnica correspondiente. No se atribuye a las capturas una verificación de esos aspectos.
