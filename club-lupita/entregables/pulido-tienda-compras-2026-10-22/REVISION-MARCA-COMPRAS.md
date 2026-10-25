# Revisión independiente de marca — Mis compras

**Dictamen final: PASS — brecha de legibilidad resuelta.**

Fecha: 22 de octubre de 2026. Evaluación exclusivamente visual contra `design-system.md`, sin leer ni modificar código. Build final indicado para el cierre: `principal-CUBKWecD.js` en puerto 5310 (referencias proporcionadas; no se inspeccionó el archivo ni el servidor). La revisión inicial correspondía al build indicado `principal-Bp7QHhfg.js`.

## Hallazgo anterior — resuelto

**Valor del motivo truncado a 320 px y texto al 200 %.** En `pruebas-compras-final/ayuda-foco-320-texto200-viewport.png`, el selector de «Motivo» muestra «Compra o res…». El valor completo que se observa a tamaño normal en `ayuda-respondida-390-viewport.png` es «Compra o reserva».

Ese estado motivó el FAIL inicial: el sistema aprobado incluye reflujo y legibilidad dentro de la calidad visual.

**Cierre visual:** `pruebas-compras-cierre/motivo-completo-320-texto200-viewport.png` muestra «Motivo elegido: Solicitar copia o revisión de mis datos» completo, distribuido en tres líneas, dentro del ancho disponible. La captura `motivo-completo-320-texto200-completo.png` sitúa esa lectura debajo del selector, por lo que el motivo elegido puede conocerse sin abrirlo, aunque la representación nativa del selector siga abreviada. Se comprobó así un motivo más largo que el que originó el hallazgo.

`pruebas-compras-cierre/ayuda-foco-320-texto200-viewport.png` conserva el contorno borgoña visible del campo y una separación clara entre motivo y mensaje. La línea añadida usa la misma tipografía, color y alineación de los textos secundarios del formulario. No hay truncamiento ni desbordamiento horizontal observable de ese motivo en el encuadre real. El hallazgo queda resuelto y no queda una brecha de marca pendiente en el alcance revisado.

`pruebas-compras-cierre/comprobantes-390-viewport.png` conserva título, filtros, sección de comprobantes, nombre del pedido y estado legibles con la identidad aprobada.

## Criterios que cumplen

| Criterio | Evidencia concreta | Resultado |
| --- | --- | --- |
| Identidad tipográfica | Título de página, títulos de comprobantes y estado vacío usan la serif editorial compatible visualmente con Playfair Display. Lectura, metadatos y controles usan la sans compatible con Montserrat. | PASS |
| Paleta y controles | Cacao sobre papel/crema; rosa para estados y panel vacío; borgoña para acciones, categorías y selección. Bordes selectivos y controles redondeados consistentes con Tienda. | PASS |
| Estado vacío | `vacio-390-viewport.png` distingue título, ausencia de compras/reservas y acción «Preparar una visita». El estado se reconoce por texto y no depende únicamente del color. | PASS |
| Jerarquía de comprobantes | `comprobantes-1440-completo.png` separa categoría, nombre, estado, importe/anticipo y detalles. El folio y el registro quedan en un nivel secundario. Pedido, café, mesa y experiencia conservan una estructura reconocible. | PASS |
| Reflujo de comprobantes | `comprobantes-390-completo.png` apila los detalles. En `comprobantes-768-texto200-completo.png`, nombres largos, estados y folios se distribuyen en varias líneas, sin desbordamiento horizontal observable. Importes y anticipos siguen distinguiéndose. | PASS |
| Mensajes de ayuda | `ayuda-respondida-390-viewport.png` separa aviso respondido, acción de marcar leído y solicitud de ayuda. La explicación de los efectos de la solicitud permanece visible antes del botón. | PASS |
| Foco | `ayuda-foco-320-texto200-viewport.png` muestra un contorno borgoña claro, separado del borde del campo de texto. | PASS |

## Evidencia y límites

La revisión inicial comprendió los seis renders de `pruebas-compras-final` citados arriba. El cierre focal comprendió únicamente los cuatro renders de `pruebas-compras-cierre` citados en la resolución; no se repitió la auditoría completa. No se interpreta la navegación fija incrustada en las capturas de página completa como prueba de contenido inaccesible. Tanto el hallazgo inicial como su resolución se sustentan en encuadres reales del formulario.

Este dictamen cubre identidad, jerarquía de estados/comprobantes y legibilidad aparente. No evalúa funcionalidad, premios, exactitud de los datos sintéticos, archivos de fuentes, valores CSS exactos, tabulación numérica, recorrido de teclado ni movimiento reducido. Tienda queda fuera de esta revisión y conserva su dictamen previo.
