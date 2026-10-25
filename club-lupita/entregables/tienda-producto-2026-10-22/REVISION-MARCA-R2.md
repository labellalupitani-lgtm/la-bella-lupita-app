# Revisión independiente de marca · R2

Fecha: 22 de octubre de 2026. Revisión visual basada en `design-system.md`, las cuatro capturas de R1 y las capturas adicionales `pruebas-r2/viewport-390.png`, `texto200-viewport-inicial.png`, `texto200-viewport-titulo.png` y `texto200-viewport-accion.png`. No se leyó ni modificó implementación. La revisión anterior se conserva íntegra en `REVISION-MARCA-R1.md`.

**Dictamen: PASS visual.** La evidencia de viewport resuelve la incertidumbre que motivó el FAIL de evidencia de R1. No se observa una obstrucción permanente del nombre ni del botón enfocado.

| Criterio | Dictamen | Evidencia concreta |
| --- | --- | --- |
| Identidad de marca | PASS | Logotipo, títulos serif, lectura sans, papel cálido, cacao y borgoña mantienen el sistema visual. No aparecen premios, sellos ni empaques inventados. La identificación exacta de fuentes y tokens queda fuera de una revisión de capturas. |
| Producto protagonista | PASS | En 390, 913 y 1440 px, fotografía, nombre, presentación, precio y acción forman el bloque principal. «Consultar este lote» concentra el mayor peso de interacción. Los detalles aparecen plegados y la membresía permanece debajo, diferenciada como beneficio aparte de la compra. |
| Rótulo de fotografía contextual | PASS | «Café servido en la casa · imagen de ambiente» es visible sobre una superficie clara. A 200 % se adapta a tres líneas sin perder texto. No se atribuye esa taza a la presentación del lote. La sustitución por una fotografía real de API no es verificable mediante estas capturas. |
| Información previa a la acción | PASS | El estado de preventa y el aviso de confirmación de presentación y retiro permanecen en la ficha antes del botón. No se ocultan en los detalles plegados. |
| Texto a 200 % y navegación fija | PASS | `texto200-viewport-titulo.png` muestra «Reserva de Cosecha» completo en tres líneas por encima de la navegación. `texto200-viewport-accion.png` muestra el botón completo y su foco por encima de ella. La captura inicial tiene el nombre por debajo del área disponible, pero las posiciones posteriores demuestran que puede presentarse sin quedar tapado. |
| Foco de la acción principal | PASS para el estado observado | La acción tiene un contorno visible alrededor de toda la cápsula en `texto200-viewport-accion.png`, con separación clara del fondo. No queda detrás de la navegación. No se extiende este resultado a controles no mostrados con foco. |
| Contraste y legibilidad visual | PASS visual | Nombre, precio y acción se distinguen claramente del fondo. El rótulo de ambiente permanece legible en ambos tamaños. No se certifican ratios numéricos de contraste a partir de las capturas. |

R1 señaló un solapamiento visible en capturas de página completa y dejó expresamente abierta la posibilidad de que fuera un artefacto de composición. Las capturas nuevas muestran el nombre y la acción sin obstrucción en posiciones de viewport distintas. Se cierra ese hallazgo de evidencia; no hay base visual para solicitar un cambio del producto por él.

La aprobación se limita a marca, jerarquía y estados visuales observados. No verifica comportamiento de API, datos reales, todos los recorridos de teclado ni contraste calculado.

## Comprobación visual final

Se inspeccionaron únicamente `pruebas-final/texto200-encargo-320.png` y `pruebas-final/incompleta-1440.png`, correspondientes al build principal-CxOhDyaZ.js según la identificación proporcionada. **PASS visual.** En el resumen de encargos con texto al 200 %, «Cantidad / 12 bolsas», «Cuándo / Por definir» y «Dónde / Matagalpa» aparecen apilados y separados: no se observa colisión entre etiquetas y valores. La acción y su aclaración permanecen legibles. La portada de 1440 px conserva la jerarquía, la paleta, la apariencia tipográfica, el protagonismo del producto y el rótulo de imagen de ambiente observados en R2. La barra fija vuelve a aparecer dentro de la captura de página completa; se mantiene la distinción ya comprobada en R2 entre esa composición y los estados de viewport. No se leyó código ni se repitieron pruebas funcionales.
