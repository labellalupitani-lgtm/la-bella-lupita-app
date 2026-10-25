# Revisión independiente de composición y acabado

**PASS** para la composición de Inicio según la barra de esta revisión. La nueva distribución da a la comida un protagonismo perceptiblemente mayor, conserva el acceso inicial a cuenta, saldo y pase, y reduce la competencia de sellos y beneficios.

Se inspeccionaron ambos renders en Chromium mediante Playwright: nuevo `http://127.0.0.1:5190/__preview/entrar` y anterior `http://127.0.0.1:5192/__preview/entrar`, en 390 × 844, 320 × 568 y 1440 × 900. Se leyeron únicamente la barra, las dos referencias fotográficas suministradas y el render/DOM. No se leyó código ni narrativa de implementación. Ambos previews mostraban la cuenta sintética con C$ 9,900, 8/9 sellos, un aviso y beneficio de bolsa disponible; las horas de consulta y fecha de la experiencia sintética varían entre previews, sin cambiar la composición evaluada.

| Tamaño | Foto anterior: inicio Y | Foto nueva: inicio Y | Lectura de la composición |
| --- | ---: | ---: | --- |
| 390 × 844 | 1395 px | 674 px | Se adelanta 51,7 %, superando el 30 % requerido. El pase ocupa Y 402–450 y la foto ya asoma antes de la navegación inferior. |
| 320 × 568 | 1407 px | 723 px | Saldo y pase son visibles al abrir; el pase ocupa Y 358–419, por encima de la navegación que empieza en Y 496. La foto exige desplazamiento, pero precede a sellos y beneficios. |
| 1440 × 900 | 1124 px | 409 px | Cuenta e invitación comparten el bloque principal. Desaparece la sucesión de barras de utilidad entre la cuenta y la foto. |

Las referencias ponen el producto como foco inmediato y dan al texto y a los controles una función de apoyo. La versión nueva se acerca a ese principio: en escritorio, el ancho de la invitación y la fotografía equilibran la masa oscura de la cuenta; en móvil, el orden cuenta → aviso → comida → accesos → sellos hace legible la prioridad. La foto sigue reconocible, no lleva texto superpuesto y conserva el contraste de la invitación en su panel rosado.

La tipografía de títulos, los textos de apoyo, la paleta y la firma mantienen continuidad con el render anterior. Los sellos permanecen completos y reconocibles, pero pierden el lugar dominante junto a la cuenta. El aviso se mantiene cerca de ella. Los accesos de carta, reserva y tienda conservan una agrupación clara; el pase conserva más peso que la recarga. A 320 px, los saltos de línea de recarga y de algunos accesos caben en sus controles y no producen desbordamiento horizontal de la página.

Los controles de producto visibles en el DOM medido tienen al menos 44 px de alto; los controles principales también superan 44 px de ancho. La comprobación de tabulación a 320 px muestra foco visible en reserva, perfil, actualización, pase y recarga. La barra técnica del preview se excluye de esta valoración de controles. No se atribuye a esta revisión visual una verificación completa de texto ampliado, movimiento reducido ni de flujos o estados no ejercitados.

## Única mayor brecha

**El recorte de escritorio es demasiado panorámico para mostrar el plato con la soltura de las referencias.** En 1440 px, la foto ocupa aproximadamente 685 × 250 px: el extremo superior del sándwich y la parte inferior del plato quedan cortados. El alimento sigue siendo inequívoco y apetecible, por lo que no bloquea esta barra, pero es el punto de acabado que más limita el nuevo protagonismo gastronómico. Una revisión posterior del encuadre puede conservar algo más de aire alrededor del sándwich manteniendo esta relación con la cuenta.

Evidencias propias: `criterio-acabado-nuevo-390.png`, `criterio-acabado-anterior-390.png`, `criterio-acabado-nuevo-320.png`, `criterio-acabado-anterior-320.png`, `criterio-acabado-nuevo-1440.png`, `criterio-acabado-anterior-1440.png`; primeras pantallas en `criterio-acabado-nuevo-viewport-390.png`, `criterio-acabado-nuevo-viewport-320.png` y `criterio-acabado-nuevo-viewport-1440.png`; foco en `criterio-acabado-nuevo-foco-320.png`.

Este PASS permite presentar la composición al usuario. La aprobación visual del usuario sigue pendiente; no autoriza extender la dirección a otras páginas ni publicar.
