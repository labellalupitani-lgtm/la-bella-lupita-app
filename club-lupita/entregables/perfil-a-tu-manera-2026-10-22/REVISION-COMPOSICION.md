# Revisión independiente de composición — Perfil «A tu manera»

**Veredicto vigente: R3 — PASS en las tres piezas visuales.** La revisión R1 queda conservada a continuación como registro de los defectos y la revalidación final se documenta al final.

## Ronda 1 — FAIL

Revisión del 22 de octubre de 2026. Se leyeron los criterios de `bar.md` y se abrieron las imágenes con `view_image` en detalle original. No se leyó la implementación ni se usaron resultados de pruebas para juzgar estética. Los PNG permiten evaluar composición y estados visibles; no demuestran movimiento, teclado, persistencia ni respuesta del servidor.

| Pieza | Veredicto R1 | Evidencia principal |
| --- | --- | --- |
| Identidad y preferencias | **FAIL** | En normal 390/1440 la dirección funciona; el reflujo al 200 % fragmenta palabras y pierde jerarquía. |
| Edición y movimiento, solo aspecto visible | **PASS** | El editor focal de bebida muestra un campo, cierre, estado y acceso al editor general; el foco visible se distingue. Movimiento no evaluable mediante PNG. La captura disponible está ya guardada: falta contraste de la acción activa antes de guardar. |
| Cuenta, datos y ayuda | **FAIL** | Saldo y movimientos conservan números íntegros, pero el título de comunicaciones se fragmenta al 200 % y seguimiento/nueva consulta tienen una separación visual insuficiente. |

### Qué cumple la dirección

En `pruebas-r1/gusto-390-inicial-viewport.png`, el nombre, las tres pestañas, la bebida y su acción están completos en la primera pantalla. La terraza pasó a un apoyo pequeño. Frente a `antes/perfil-390-completo.png`, la bebida ya no queda cortada bajo un bloque de bienvenida predominante. En 1440 el contraste de la tarjeta marrón conduce la mirada a la preferencia, y cumpleaños y alergias conservan un rango secundario claro.

La taza neutra identifica la categoría sin intentar representar una receta específica. De las referencias de `../investigacion-diseno-2026-10-21/evidencia/comparacion-referencias.png`, se aprovecha la agrupación entre bebida, texto y decisión; no se pretende que las fotografías de productos concretos sean apropiadas para un campo libre. El contraste se refiere a composición visible, sin atribuciones de premios ni afirmaciones sobre animaciones de las referencias.

En Cuenta, el fondo rosa distingue saldo de dinero y el bloque «Tu Club» queda separado. A 320 y 390 con texto al 200 %, `C$ 9,900`, `−C$ 100` y `+C$ 10,000` mantienen sus cifras enteras. En escritorio saldo y últimos movimientos se comparan sin buscar información en una columna larga. Los enlaces a compras y actividad completa tienen destinos visualmente reconocibles.

### Cambios necesarios antes de aprobar

1. **Recomponer identidad y pestañas según el ancho útil.** En `gusto-390-texto200-completo.png`, avatar y terraza estrechan el nombre: se ve «Fernand / a» y «Gonzále / z». En `gusto-320-texto200-completo.png`, «Tu cuenta» se divide en «Tu / cuent / a». El texto debe conservar palabras completas mediante distribución, ancho y jerarquía apropiados; los adornos pueden ceder espacio.

2. **Evitar una columna de texto de bebida excesivamente estrecha.** A 320 al 200 % aparecen «Chocolat / e» y «almendra / s». A 1440 al 200 %, la ilustración conserva una columna a la derecha y «Chocolate» vuelve a partirse, mientras la tarjeta ocupa varias pantallas y cumpleaños queda aislado en un gran vacío lateral. La evidencia está en `gusto-320-texto200-completo.png` y `gusto-1440-texto200-completo.png`. Hace falta reflujo de ilustración/columnas y una escala de títulos que admita preferencias largas sin perder las palabras. A 768 la misma composición en dos columnas prolonga innecesariamente el recorrido.

3. **Resolver títulos largos de Datos y reforzar el corte entre consultar y crear.** «Comunicaciones» se rompe dentro de la palabra en `datos-320-texto200-completo.png`, `datos-390-texto200-completo.png` y `datos-768-texto200-completo.png`. Además, el estado vacío o el cuerpo de una solicitud acaba prácticamente pegado a «Una nueva consulta». Una separación consistente de espacio y/o línea permitiría distinguir el seguimiento del inicio de una petición.

### Límites y observaciones de evidencia

- El editor de `editor-bebida-390-viewport.png` está en estado guardado con botón deshabilitado. Su estructura visual pasa, pero no se infiere de él cómo se presenta la acción activa ni cuándo se confirmó el guardado. Se solicita captura con un cambio pendiente para la siguiente ronda.
- El concepto «Historial de puntos» aparece dentro de movimientos de dinero en la evidencia R1. El responsable confirmó que es un dato sintético de la prueba y lo corregirá en la evidencia representativa; no se atribuye a mezcla de saldos en la lógica de la aplicación.
- La barra inferior aparece sobre una zona intermedia en los PNG de página completa porque estos incluyen una navegación fija. Ese hecho aislado no demuestra contenido inaccesible: no se registra como defecto de desplazamiento a partir de estas imágenes.
- El texto al 200 % puede requerir desplazamiento vertical. El fallo señalado es la fragmentación evitable de palabras y la distribución del ancho, no la mera longitud de la página.

**Estado:** ronda 1 cerrada con FAIL. Pendiente revalidación focal de la ronda 2.

## Ronda 3 — PASS

Revalidación final del 22 de octubre de 2026 sobre las capturas de `pruebas-r3`, abiertas con `view_image` en detalle original. Esta conclusión procede de inspección visual independiente: no se leyó la implementación y los resultados geométricos o de accesibilidad comunicados por el equipo no sustituyen este juicio. No se realizaron acciones reales en la aplicación.

| Pieza | Veredicto R3 | Razón visible |
| --- | --- | --- |
| Identidad y preferencias | **PASS** | La primera pantalla normal conserva nombre, pestañas y bebida con acción. Al 200 %, las pestañas y las palabras visibles del nombre ya no presentan los cortes de R1; la ilustración y las columnas ceden espacio a la preferencia larga. |
| Edición y movimiento, solo aspecto visible | **PASS** | El nuevo editor con borrador presenta el campo focal, foco distinguible, guardado activo dominante, cierre y editor general secundario. No se infiere movimiento de una imagen estática. |
| Cuenta, datos y ayuda | **PASS** | Saldo y movimientos mantienen cifras enteras; «Tus datos y mensajes» conserva palabras completas y la nueva consulta tiene una separación clara respecto al seguimiento o estado vacío. |

### Cierre de los defectos de R1

1. **Nombre y pestañas.** En `gusto-390-texto200-completo.png`, «María Fernanda», «González» y «Rodríguez» aprovechan el ancho del contenido, mientras la terraza pasa a otro renglón. Las tres pestañas de `gusto-320-texto200-completo.png` conservan palabras enteras: «Tu cuenta» ya no se fragmenta. Se mantiene la limitación de que la navegación fija cubre una franja del PNG completo; no se interpreta ese montaje como ausencia de contenido ni se afirma haber inspeccionado los caracteres que quedan bajo la barra.

2. **Preferencia larga.** Se revisaron `gusto-320-texto200-completo.png`, `gusto-390-texto200-completo.png`, `gusto-768-texto200-completo.png` y `gusto-1440-texto200-completo.png`. «Chocolate» y «almendras» permanecen completas. A 768 y 1440 el bloque usa el ancho disponible y cumpleaños/alergias siguen debajo, con lo que desaparece el vacío lateral prolongado que tenía R1. La preferencia larga al 200 % todavía exige recorrido vertical en móvil, compatible con conservar el contenido y las palabras.

3. **Datos y ayuda.** En `datos-320-texto200-completo.png` y `datos-768-texto200-completo.png`, «Tus datos y mensajes» resuelve el título que antes partía «Comunicaciones». El espacio antes de «Una nueva consulta» separa creación y seguimiento. El estado vacío normal también está separado de la nueva consulta en `datos-390-inicial-completo.png` y `datos-1440-inicial-completo.png`. El selector queda como primer paso y no aparece un formulario extenso de entrada.

4. **Edición activa y cuenta.** `editor-bebida-390-borrador-viewport.png` cubre la evidencia que faltaba: «Guardar cambios» está activo en rojo, el enlace al editor general queda por debajo y el campo conserva el foco visible. `cuenta-320-texto200-saldo.png` y `cuenta-320-texto200-completo.png` muestran saldo y movimientos íntegros. `cuenta-1440-inicial-completo.png` ya usa el concepto sintético «Consumo en la casa · prueba», eliminando la ambigüedad de la evidencia monetaria anterior.

`gusto-390-inicial-viewport.png` confirma que los cambios para el 200 % preservan la composición normal aprobada: cabecera contenida, terraza secundaria, tarjeta de bebida protagonista e ilustración neutral. La relación entre texto, categoría y acción continúa alineada con los principios compositivos observados en las referencias.

**Estado final:** PASS visual de las tres piezas, sin defectos bloqueantes de composición observados en la evidencia R3 revisada. La verificación de animaciones, reducción de movimiento, teclado, persistencia y confirmación real pertenece a la evaluación funcional, no a este dictamen de PNG.
