# Revisión independiente de composición

## Estado vigente — ronda 2

Fecha: 22 de octubre de 2026. **PASS en las tres piezas para los bloqueos de composición revisados.** Se inspeccionaron los nuevos renders de `pruebas-r2` con `view_image`; no se consultó la fuente ni se modificó la app. La aprobación se fundamenta en las imágenes, no en el resultado comunicado del build o de las pruebas automáticas.

| Pieza | Juicio R2 | Evidencia de corrección |
|---|---|---|
| Primera pantalla / beneficios | **PASS** | `activo-1440-texto200-bolsa.png` mantiene «250 g» completo en una línea dentro de la banda rosa. Nombre, disponibilidad y acción siguen completos. |
| Pase / sellos / estados | **PASS** | `activo-768-texto200-sellos.png` separa claramente las tazas y los números 1–4. El conjunto se redistribuye en dos filas. En 320 px al 200 %, la página completa confirma dos columnas y los nueve sellos, con iconos y números separados. |
| Experiencias / gestión | **PASS** | `activo-320-texto200-saldo.png` conserva «C$ 9,900» como una unidad legible, sin partir los dígitos. El bloque mantiene recarga y movimientos. |

La comprobación de regresión en las vistas normales de 390 y 1440 px, tanto iniciales como completas, mantiene café, estado y acción en primer plano, el pase secundario, los cinco beneficios, el progreso de sellos y la gestión agrupada. No se encontró una nueva brecha bloqueante de composición en esas capturas.

Permanece un detalle editorial no bloqueante: en `activo-320-texto200-completo.png`, «Experiencia» aún puede dividirse como «Experienci / a». En 390 px al 200 % ya se conserva la palabra completa. No falta texto y la observación sigue siendo secundaria al importe fragmentado que bloqueaba la ronda 1; conviene pulir ese salto en una iteración posterior.

La captura aislada de sellos de 320 px incluye elementos fijos que tapan sus extremos. No se usa para afirmar que todos los sellos están recortados: el juicio se apoya además en `activo-320-texto200-completo.png`, donde se ve la pieza completa. El PASS de esta revisión se limita a composición; se mantienen los límites sobre datos sintéticos, fotografía de ambiente, verificación del movimiento y estados no representados indicados en R1.

Evidencia R2 abierta: `activo-1440-texto200-bolsa.png`, `activo-320-texto200-saldo.png`, `activo-320-texto200-sellos.png`, `activo-768-texto200-sellos.png`, `activo-390-inicial-viewport.png`, `activo-1440-viewport.png`, `activo-320-texto200-completo.png`, `activo-390-texto200-completo.png`, `activo-390-completo.png` y `activo-1440-completo.png`.

## Revisión original — ronda 1 (preservada)

Fecha: 22 de octubre de 2026. Revisión exclusivamente del render de `pruebas-r1`, contrastado con `bar.md`, las capturas anteriores y la lámina de referencias. No se leyó ni modificó la implementación. Todas las capturas citadas se abrieron con `view_image`.

La dirección visual a tamaño normal cumple la intención autorizada: café primero, pase secundario, cinco beneficios distinguibles, sellos como pieza gráfica, experiencia con jerarquía editorial y gestión reunida. El resultado estricto de esta ronda es **FAIL en las tres piezas**, porque la ampliación al 200 % deteriora información concreta de cada una. No son objeciones de gusto ni una exigencia de copiar las referencias.

| Pieza | Juicio | Mayor brecha concreta |
|---|---|---|
| Primera pantalla / beneficios | **FAIL** | En `activo-1440-texto200-completo.png`, el dato visual de la bolsa se parte en «25» y «0g». Se pierde la lectura unitaria de 250 g. |
| Pase / sellos / estados | **FAIL** | En `activo-768-texto200-completo.png`, las tazas de los sellos marcados invaden los números 1–4. Número e icono dejan de tener espacios propios. |
| Experiencias / gestión | **FAIL** | En `activo-320-texto200-completo.png`, el saldo se presenta como «C$ / 9,90 / 0». Un importe no debe requerir reconstruir sus dígitos entre líneas. |

## Primera pantalla y beneficios

En `activo-390-inicial-viewport.png` el nombre «Café filtrado del día», «Disponible hoy» y el botón «Mostrar código del café» están completos por encima de la navegación inferior. La foto tiene presencia y encuadre reconocible; el pie la identifica como fotografía de ambiente. La foto no prueba cómo es el filtrado entregado, y la revisión no lo presupone.

Frente a `antes/club-390-viewport.png`, la bienvenida grande, el saldo y la credencial ya no ocupan la prioridad del café. La captura anterior incluye además una franja de vista previa ausente en la nueva: la comparación de altura no se atribuye exclusivamente al rediseño. El cambio sustantivo es la nueva jerarquía. En 1440 px, foto y acción forman una pareja clara; el pase queda debajo.

Los cinco beneficios se encuentran a simple recorrido de la página: café, bolsa, descuento, prioridad y anticipación. Los dos primeros tienen acción destacada; los otros explican su alcance sin simular un canje. La pieza de 250 g evita inventar un envase no verificado. A 320 px normal el botón del café queda después del primer viewport, pero el criterio de primera vista se fija en 390 × 844 y allí se cumple.

La brecha que bloquea el PASS está en el dato «250 g» al 200 % de 1440 px. La cifra se corta en medio dentro de una columna estrecha. El título adyacente todavía informa el peso, pero no corrige la lectura defectuosa de la pieza gráfica. Para pasar, el dato debe conservarse completo con espacio suficiente o una reorganización de ese bloque, sin desbordar.

## Pase, sellos y estados

La credencial conserva nombre, tipo, número y acceso al pase. El nombre largo se distribuye sin truncarse en las capturas normales; el bloque permanece por debajo del beneficio protagonista. El aumento de altura con texto al 200 % no es por sí mismo un fallo: es preferible a ocultar el nombre.

Los nueve sellos se leen como progreso: marcados con taza y número, pendientes con contorno discontinuo y destino final diferenciado. El doble anillo da carácter al conjunto sin introducir ilustraciones que compitan con la tarea. La cuenta gratuita muestra los sellos antes de la oferta; la renovación pendiente muestra aviso y solución antes del pase. «Café de hoy entregado», «Bolsa entregada», «Sin butacas» y el premio pendiente están expresados en texto, además de sus diferencias visuales.

El FAIL viene de las colisiones al ampliar: en 768 px al 200 %, los números inferiores de los sellos marcados se superponen con el dibujo de la taza. La misma zona se comprime en 320 px al 200 %. Para pasar, icono y número deben permanecer separados y reconocibles; el progreso textual 4/9 no sustituye esa lectura individual.

Las capturas no prueban que el toque, teclado o estampado funcionen, ni que el movimiento reducido esté implementado. No se deduce movimiento a partir del nombre de un archivo o de una imagen estática. No se encontró evidencia visual suficiente del estado de venta aún cerrada dentro de las capturas inspeccionadas.

## Experiencias y gestión

La tarjeta de experiencia tiene una fecha dominante y reúne título, lugar, precio, disponibilidad, condiciones y acción. Frente a la fila anterior, la agrupación y el contraste de tamaños mejoran el recorrido. El estado agotado conserva la información y cambia a «Sin butacas». Las capturas muestran una única experiencia, por lo que no permiten comparar la jerarquía de la primera frente a varias posteriores.

«Tu cuenta, a mano» reúne saldo, recarga, movimientos, enlaces de visita, historial y ayuda. Esa agrupación cumple la intención y evita que el saldo dispute la portada al café. A 1440 px normal el bloque de experiencia deja espacio a su derecha; con un único elemento sintético no se considera un defecto bloqueante.

El saldo de 320 px al 200 % sí bloquea el PASS: separar el último cero en otra línea perjudica una lectura esencial. Además, «Experiencia» se rompe como «Experie / ncia» en 320 px y como «Experienci / a» en 390 px al 200 %. Esta segunda observación es editorial; la cifra fragmentada es el problema principal. Para pasar, el importe debe conservar sus dígitos como una unidad y el título necesita un ancho o una escala que evite esos cortes arbitrarios.

## Relación con las referencias y límites de la evidencia

La lámina `../investigacion-diseno-2026-10-21/evidencia/comparacion-referencias.png` muestra producto dominante, controles próximos a la decisión y jerarquías diferentes según la tarea. La nueva página aplica la proximidad entre beneficio y acción y una mayor presencia visual. Utiliza una foto ambiental autorizada, por lo que no equivale a la exhibición de producto aislado de algunas referencias. Tampoco las referencias estáticas prueban animaciones.

Los nombres, fechas, precios, número de miembro y disponibilidad de estas pruebas son sintéticos. Esta revisión juzga su presentación y no verifica oferta comercial real, identidad del envase ni datos de producción. No se infiere un recorte persistente del contenido a partir de la navegación fija que aparece atravesando las capturas de página completa. La captura `cafe-foco-320-texto200-viewport.png` sí muestra el botón de café y su foco visibles en ese estado.

Evidencia inspeccionada: vistas iniciales y completas de activo a 320/390/768/1440 px; versiones con texto al 200 % de esos cuatro anchos; cuenta gratuita, renovación pendiente, entregado, experiencia agotada y premio en 390 px; captura de foco del café; captura denominada `sellos-reduced-motion-390-viewport.png`; vistas anteriores de 390 y 1440 px y página completa anterior de 390 px; lámina de referencias. No se asignan puntuaciones ni se garantiza ningún reconocimiento externo.
