# Revisión independiente de marca y legibilidad

## Dictamen vigente — R2

Dictamen general: **PASS**. La revalidación visual focal confirma que las dos brechas bloqueantes de R1 están resueltas. Se conserva debajo el historial completo de R1.

| Pieza | Dictamen R2 | Resultado de la revalidación |
| --- | --- | --- |
| Primera pantalla y beneficios | **PASS** | Las vistas normales de 390 y 1440 px conservan la jerarquía, la fotografía de ambiente identificada y la identidad aprobada. La bolsa en 1440 px/200 % contiene «250 g», disponibilidad, título y acción sin colisiones. |
| Pase, sellos y estados | **PASS** | En 320 px/200 %, los nueve sellos se distribuyen en dos columnas y los números 1–4 quedan separados de las tazas. En 768 px/200 % también se distinguen las nueve posiciones y la separación icono/número. Se mantiene la evaluación favorable de los estados ya revisados en R1. |
| Agenda y gestión | **PASS** | El saldo a 320 px/200 % se lee íntegro como «C$ 9,900» en una línea, con margen interior y sin cortar las cifras. Se mantiene la evaluación de agenda y estado agotado realizada en R1. |

Las nuevas imágenes se abrieron con `view_image`: `pruebas-r2/activo-320-texto200-saldo.png`, `activo-320-texto200-sellos.png`, `activo-768-texto200-sellos.png`, `activo-1440-texto200-bolsa.png`, `activo-390-viewport.png`, `activo-1440-viewport.png` y `activo-320-texto200-completo.png`.

El recorte de elemento de sellos a 320 px incluía fragmentos de la navegación y no mostraba completas las primeras y últimas posiciones. Para cerrar esa limitación de evidencia se inspeccionó además un recorte sin escala de la captura completa: `revision-marca-cortes/r2-activo-320-texto200-sellos-completos.png`, desde y=4900. Allí se ven los nueve sellos completos, separados y legibles. No se confunde ese artefacto de captura con un nuevo fallo de la aplicación.

Se consultaron los nueve grupos aprobados de `pruebas-r2/resultados.json` como apoyo; el PASS anterior procede de la inspección visual. No se leyó ni modificó fuente de la aplicación. No se volvió a ejecutar una auditoría completa de estados ni se infirió movimiento o comportamiento de lector de pantalla.

Las oportunidades no bloqueantes de R1 —compactar la primera pantalla al 200 % y el encabezado del pase ampliado— permanecen como observaciones, sin cambiar este PASS focal. No quedan bloqueantes de marca o legibilidad en el alcance revalidado.

## Historial preservado — R1

Dictamen general: **FAIL**. La identidad aprobada está presente, pero dos defectos de legibilidad al 200 % impiden aprobar las tres piezas.

Revisión realizada a partir de `design-system.md` y capturas renderizadas, abiertas con `view_image`. No se leyó ni modificó el código de la aplicación. Los recortes de `revision-marca-cortes/` conservan píxeles y sirven para inspeccionar imágenes largas sin reducción. Los resultados JSON se consultaron como contexto; sus aprobaciones automáticas no sustituyen el dictamen visual. No se evaluó lector de pantalla ni se dedujo movimiento de una imagen fija.

| Pieza | Dictamen R1 | Mayor brecha concreta |
| --- | --- | --- |
| Primera pantalla y beneficios | **PASS** | Al 200 % y 320 px, cabecera, navegación inferior y fotografía posponen bastante la acción principal. Es una oportunidad de compactación; el café, su disponibilidad y el botón siguen siendo legibles al llegar a ellos. |
| Pase, sellos y estados | **FAIL** | En 320 px/200 %, los números 1–4 de los sellos se superponen con la base de las tazas. Se pierde la separación entre símbolo y posición. |
| Agenda y gestión | **FAIL** | En 320 px/200 %, el saldo C$ 9,900 se rompe como «C$» / «9,90» / «0». El importe deja de leerse como una unidad financiera. |

## Primera pantalla y beneficios

En 390, 768 y 1440 px, el título del café, la disponibilidad y la acción borgoña forman una jerarquía clara. La combinación visible de serif editorial y sans de lectura, los fondos papel/crema, el cacao y el rosa mantienen el sistema aprobado. El pase oscuro ofrece una segunda referencia reconocible de pertenencia.

La fotografía se identifica expresamente como «Un momento en la casa · fotografía de ambiente». Esta leyenda evita presentarla como una entrega específica. La bolsa se representa con tipografía «250 g», sin un envase inventado. Las condiciones de descuento, prioridad y acceso anticipado tienen entradas visibles. La autenticidad material de la fotografía no puede certificarse solo a partir del render; su tratamiento contextual sí es claro.

Evidencia: `pruebas-r1/activo-390-viewport.png`, `activo-1440-viewport.png`, `activo-768-viewport.png`, sus capturas completas, y `activo-320-texto200-viewport.png`/`completo.png`.

## Pase, sellos y estados

La cuenta gratuita conserva su denominación y lleva directamente a sellos; la renovación pendiente tiene título explícito, explicación y acción propia. El premio pendiente se reconoce por texto y botón. Los estados no dependen únicamente del color.

**Brecha bloqueante:** en `pruebas-r1/activo-320-texto200-completo.png`, aproximadamente desde y=5300, los números de los sellos marcados chocan con el icono. El recorte `revision-marca-cortes/activo-320-texto200-completo-05000.png` permite verlo a escala real. Para aprobar, los nueve sellos deben conservar posición, icono y número legibles con separación suficiente a 320 px y texto al 200 %.

El código de bolsa en `pruebas-r1/bolsa-codigo-390-viewport.png` es grande y legible, con caducidad y explicación de que mostrarlo no consume el beneficio. La salida del diálogo se identifica claramente.

En los pases al 200 % de Edge, Firefox y WebKit, la primera ventana visible está ocupada por el título y una marca «La / Bella / Lupita» muy grande; la información de identificación queda más abajo. Conviene compactar esa cabecera. Esta observación no demuestra que el pase sea inaccesible ni contradice las pruebas de desplazamiento: una captura fija no permite resolverlo. WebKit también muestra algunos trazos visiblemente más finos en el cierre.

Evidencia adicional: `gratis-390-viewport.png`/`completo.png`, `renovacion-390-viewport.png`/`completo.png`, `premio-390-viewport.png`/`completo.png`, `transacciones/pase-texto-200-edge.png`, `pase-texto-200-firefox.png`, `pase-texto-200-webkit.png` y `mi-club-edge.png`.

## Agenda y gestión

A tamaño normal, la fecha, el título, el precio y la disponibilidad de la experiencia se distinguen bien. «Sin butacas» reemplaza la llamada a revisar entrada en el estado agotado. La gestión de saldo y los enlaces secundarios mantienen una jerarquía tranquila y coherente con la marca.

**Brecha bloqueante:** `pruebas-r1/activo-320-texto200-completo.png` divide las cifras de C$ 9,900 entre líneas. Se ve sin reducción en los recortes `revision-marca-cortes/activo-320-texto200-completo-07000.png` y `activo-320-texto200-completo-08000.png`. Se debe conservar la secuencia «9,900» íntegra y legible; no basta con que la caja no desborde horizontalmente. En esa misma anchura, «Experiencia» también se parte dentro de la palabra, lo que debilita la lectura del título, aunque el problema financiero es prioritario.

Evidencia adicional: `pruebas-r1/experiencia-agotada-390-viewport.png`/`completo.png` y los recortes `revision-marca-cortes/activo-390-completo-02000.png`/`03000.png`.

## Revalidación focal pendiente

Conservar este dictamen R1. Tras corregir, inspeccionar un nuevo render de sellos y saldo a 320 px con texto al 200 %. Aprobar únicamente si desaparece el solape de sellos y el importe se lee completo sin fragmentar sus cifras. No hace falta repetir las vistas normales ya revisadas si no cambian.
