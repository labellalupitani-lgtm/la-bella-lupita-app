# Revisión independiente de composición

Fecha: 2026-10-22
Resultado actual R2: **PASS de composición y escala visual**, dentro del alcance de las capturas revisadas.
Composición «Producto protagonista»: **PASS**
Escala accesible demostrada en los renders R2: **PASS**. El historial R1 siguiente conserva la observación inicial, resuelta con evidencia de viewport real.

Revisión limitada a `bar.md` y a las imágenes `captura-usuario.png`, `antes-390.png`, `pruebas/incompleta-390.png`, `pruebas/incompleta-913.png`, `pruebas/incompleta-1440.png` y `pruebas/texto200-320.png`. No se leyó código de producto. El criterio es la composición elegida y sus requisitos, no la mera mejora respecto del estado anterior.

## Lo que cumple

- En 913 y 1440 px, la fotografía ocupa aproximadamente el 55% del bloque principal. Nombre, frase breve, peso, precio, modalidad, aviso y CTA forman una sola columna contigua. Hay una acción visual dominante y el resto de superficies permanece subordinado.
- En 390 px la imagen se acorta, el nombre sigue siendo legible y la consulta se alcanza dentro del bloque principal sin atravesar fichas o condiciones. El aviso reúne los pendientes en dos líneas; desaparecen las filas repetidas de datos sin confirmar y la escasez basada en stock de prueba.
- La membresía pasa a una fila secundaria y las tres áreas complementarias aparecen plegadas. El resultado cumple este punto por su jerarquía efectiva, no solo porque la página tenga menos altura que `antes-390.png`.
- La fotografía muestra café servido, no una bolsa. La etiqueta «Café servido en la casa · imagen de ambiente» hace explícito ese límite. La ausencia de fotografía del empaque fue aceptada como restricción y no causa el fallo.
- Se conserva el contraste visual entre tipografía editorial, texto sans, marfil, cacao y una acción borgoña. No se observan desbordes horizontales en los renders revisados.

## Historial R1: diferencia observada en la captura larga

**La navegación fija tapa el nombre del producto con texto al 200% en 320 px.** En `pruebas/texto200-320.png`, la barra se convierte en dos filas y ocupa aproximadamente 202 px de alto, entre y=498 y y=700. Esa superficie blanca se superpone a casi todo «Reserva de Cosecha», precisamente el elemento que debe encabezar el bloque comercial. La etiqueta de tienda queda arriba y la descripción reaparece debajo de la barra: la continuidad nombre/precio/CTA deja de estar demostrada en esta escala.

El render normal de 390 px también muestra la barra superpuesta a parte de la fila de membresía; en ese caso el bloque principal permanece entero. La ampliación hace el problema mucho más severo. No se afirma que el contenido sea permanentemente inaccesible al desplazar la página: esa interacción no puede deducirse de capturas estáticas. Sí existe una ocultación visible que impide aprobar el criterio 7 tal como está redactado en `bar.md`.

## Historial R1: condición solicitada para aprobar

Adaptar la navegación cuando aumenta el texto de forma que no cubra nombre ni controles, conservando etiquetas y tamaños legibles. Repetir la evidencia de 320 px al 200% en el inicio y durante el recorrido hasta la acción principal, y verificar que foco/scroll no dejen controles bajo la navegación. No hace falta alterar la composición de 913/1440 px, que ya cumple.

Las capturas no acreditan por sí solas teclado, movimiento reducido, prioridad real de datos API ni los flujos de compra/recuperación. Esas verificaciones pertenecen a otra revisión y no se presumen aprobadas aquí.

## Revisión R2: evidencia de ventana real

**Dictamen actual: PASS.** Revisadas las imágenes `pruebas-r2/viewport-390.png`, `pruebas-r2/texto200-viewport-inicial.png`, `pruebas-r2/texto200-viewport-titulo.png` y `pruebas-r2/texto200-viewport-accion.png`. Esta revisión sigue limitada a renders; no se abrió código ni se modificó la aplicación.

La captura inicial de 320 px al 200% muestra que el título todavía está debajo de la zona visible. La captura del título, tras desplazar, lo muestra completo en tres líneas por encima de la navegación, aproximadamente entre y=160 y y=340. La captura de la acción muestra «Consultar este lote» entero, con indicador de foco visible, aproximadamente entre y=125 y y=246. No hay obstrucción del elemento enfocado en esa evidencia.

La navegación conserva dos filas y unos 202 px de altura: exige desplazamiento, pero la nueva secuencia demuestra que el título y la acción pueden entrar completos en la zona útil. La captura larga R1 dibujaba la navegación fija sobre una porción del documento que no estaba visible en la ventana inicial. Ese artefacto no basta para declarar el contenido inaccesible. Se retira por tanto el FAIL R1; no hace falta cambiar la composición para resolver esa observación.

En 390 px, el viewport real contiene foto, nombre, frase, peso, precio, modalidad, aviso y CTA completos por encima de la navegación. Los renders de 913/1440 px ya cumplían el esquema elegido. La aprobación se sostiene en esos criterios concretos y en la evidencia R2 de escala, no solo en la comparación con la versión anterior.

No se reprodujo una circunstancia de foco obstruido o título imposible de exponer. Esta es una comprobación visual de los estados entregados, no una certificación adicional de todos los recorridos de teclado, movimiento reducido o transacciones.

## Revisión final focal

**Se mantiene PASS.** Se revisaron únicamente `pruebas-final/texto200-encargo-320.png` y `pruebas-final/incompleta-1440.png`, entregadas como evidencia de la compilación final `principal-CxOhDyaZ.js`. No se reabrió código ni se repitieron pruebas de compra.

En el resumen de encargos a 320 px con texto al 200%, cada etiqueta aparece encima de su valor: «Cantidad / 12 bolsas», «Cuándo / Por definir» y «Dónde / Matagalpa». Los tres pares son legibles, tienen separación vertical y no se invaden entre sí. El texto de la acción posterior también se ajusta dentro de su superficie. El render largo conserva el comportamiento de captura de la barra fija ya aclarado en R2; no se utiliza esa superposición de documento para inferir una nueva obstrucción permanente.

La portada final de 1440 px mantiene el reparto visual, el bloque comercial contiguo, el aviso breve, el CTA dominante y la jerarquía secundaria de membresía y detalles ya aprobados. No se observa regresión de composición derivada del ajuste focal.
