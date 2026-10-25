# Revisión independiente de marca

Fecha: 22 de octubre de 2026. Alcance: inspección visual de `pruebas/incompleta-390.png`, `pruebas/incompleta-913.png`, `pruebas/incompleta-1440.png` y `pruebas/texto200-320.png`, contrastadas únicamente con `design-system.md`. No se leyó implementación.

**Dictamen: FAIL de la evidencia visual a 200 %.** La composición de escritorio y móvil normal respeta la dirección «Producto protagonista». Falta resolver o aclarar el solapamiento visible en la captura de texto ampliado.

| Criterio | Dictamen | Evidencia concreta |
| --- | --- | --- |
| Identidad y jerarquía de marca | PASS | Las cuatro capturas conservan el logotipo, la combinación editorial de serif y sans, el papel cálido, el cacao y la acción borgoña. No aparecen sellos, premios ni una identidad ajena. La identificación exacta de las fuentes y tokens requiere comprobación técnica fuera de este alcance. |
| Producto protagonista, anchos 390/913/1440 | PASS | La imagen abre la ficha; nombre, presentación, precio y acción forman un único bloque. El botón borgoña es el control de mayor peso. La membresía aparece después, con enlace de texto y aclaración de que es aparte de la compra. |
| Fotografía contextual | PASS | La taza lleva el rótulo visible «Café servido en la casa · imagen de ambiente». No se presenta un empaque ficticio ni se llama a esa escena foto del lote. En 200 % el rótulo se divide en líneas y continúa legible. La prioridad de una fotografía real recibida por API no puede verificarse con estas imágenes. |
| Detalles y estado incierto | PASS | «Sobre el café» y «Retiro y condiciones» aparecen plegados. La preventa y el aviso de que se están confirmando la presentación y las condiciones de retiro permanecen visibles antes de «Consultar este lote». |
| Legibilidad visual y contraste | PASS visual, sin certificación numérica | Nombre y precio se distinguen del fondo claro; el texto blanco de la acción principal resulta legible. Los textos secundarios tienen menor peso, sin competir con el producto. Las capturas no permiten certificar ratios de contraste ni peso real de las fuentes. |
| Jerarquía con texto a 200 % | **FAIL** | En `texto200-320.png`, la navegación móvil ocupa dos filas y aparece sobre el nombre del producto, que queda prácticamente oculto. La evidencia entregada pierde el vínculo visual nombre/precio/acción. En `incompleta-390.png` la misma barra aparece cortando el encabezado de membresía. |
| Foco de teclado | No verificable | Ninguna de las cuatro capturas muestra un control con foco. No se declara aprobado el foco visible a partir de estados de reposo. |

El FAIL corresponde al render presentado: una captura de página completa puede colocar una barra fija sobre contenido que sí resulta accesible al desplazarse. Estas imágenes no permiten concluir que exista una obstrucción permanente en la interfaz. Para cerrar el hallazgo, aportar una captura de viewport a 320 px con texto al 200 %, en una posición de desplazamiento donde se lean el nombre completo y la acción sin quedar tapados, y otra del foco visible. Si el solapamiento también ocurre en uso real, ajustar el comportamiento o el espacio reservado de la navegación antes de repetir la evidencia.
