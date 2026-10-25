# Revisión independiente del sistema visual — R1

Fecha: 21 de octubre de 2026. Entorno: Chromium de Playwright propio, `http://127.0.0.1:5310`. Revisión del render y del sistema de diseño; no se leyó implementación ni el razonamiento de los constructores.

## Veredicto final

| Superficie | Veredicto | Resultado |
|---|---|---|
| Shell y portada `/` | **PASS** | Firma íntegra, jerarquía Playfair/Montserrat, paleta principal aprobada, foco y navegación legibles, reflujo comprobado. |
| Carta y pedido `/compra` | **PASS** | Catálogo, detalle, carrito, revisión y comprobante mantienen el sistema. Los controles y el seguimiento ampliado quedaron corregidos. |
| Visitas `/visitas` | **PASS** | Formulario, revisión, confirmación y cancelación mantienen la dirección. Resumen y foto refluyen correctamente, incluido texto al 200%. |
| Equipo `/equipo` | **PASS** | Bandeja, estados y diálogos conservan la identidad; cierre, foco, tamaños y reflujo corregidos y comprobados. |

**No quedan hallazgos materiales abiertos de esta revisión.** Los PASS corresponden al render final tras verificar las correcciones, no al primer render observado.

## Criterio y cobertura

Fuente normativa única: [sistema de diseño](../redisenio-2026-10-20/design-system.md). Se considera la extensión ya aprobada de la dirección a la aplicación; el límite histórico a Inicio del documento no se usa como objeción.

- Anchos CSS: 320, 390, 768, 913 y 1440 px. En 913 se reservó un gutter de 15 px mediante `scrollbar-gutter: stable`. No se observó desbordamiento horizontal del documento en las rutas base ni en los comprobantes/confirmaciones muestreados.
- Texto al 200%: duplicación de tamaños y alturas de línea calculados, manteniendo viewport de 390 px, después de estabilizar el render. Es una prueba de ampliación de texto; no una captura aumentada. Se inspeccionaron visualmente los resultados con `view_image`.
- Movimiento reducido: emulación `prefers-reduced-motion: reduce`; en las superficies base inspeccionadas no quedaron animaciones, transiciones ni scroll suave activos.
- Foco: navegación con Tab y radio de horario mediante flechas. Indicadores visibles de 3 px; el radio presenta el anillo en su etiqueta completa. Los formularios, botones de confirmación y cierres conservan etiquetas y área de interacción.
- Tamaños: los controles operativos inspeccionados alcanzan 44 px en ambas dimensiones. Para radios y casillas se mide la etiqueta clicable asociada, no solamente el glifo. Se revisaron también variante de producto, cantidades, carrito, alergias, revisión VIP y diálogos de Equipo.
- Contraste: medición de texto y fondo calculados en el render, con revisión visual complementaria. Sin texto normal bajo 4.5:1 en las combinaciones sólidas muestreadas. Referencias: cacao sobre marfil 11.46:1; borgoña sobre marfil 6.43:1; borgoña sobre crema 6.81:1. El texto de fotografía se revisó visualmente sobre su sombreado; no se trató la imagen como un fondo plano.
- Identidad: Playfair Display y Montserrat aparecen cargadas; firma completa sin reconstrucción ni deformación visible, con aire suficiente. Su escala compacta se acepta como la adaptación prevista en el documento, no se interpreta la propuesta de 280–320 px como un mínimo obligatorio para el encabezado móvil. Los colores principales finales son cacao `#53291E`, marfil `#FBF6EE` y borgoña `#B60032`; se admiten secundarios funcionales y colores semánticos legibles.

Estados efectivamente recorridos: catálogo y detalle con preparación del huevo; agregado de Latte, carrito, restricciones, revisión del total, pago simulado y comprobante; reserva Terraza y revisión VIP, confirmación y revisión de cancelación; bandeja de Equipo, formulario de cancelación/devolución y confirmación de entrega. No hubo cobros ni operaciones externas. Este informe evalúa sistema visual y accesibilidad visual de dichos estados, sin heredar el criterio funcional de otras revisiones.

## Hallazgos detectados y cerrados

| ID | Ubicación y reproducción | Impacto observado | Corrección verificada |
|---|---|---|---|
| S1 | `/compra`, títulos clicables de productos a 390 px. Inicialmente 40 px de alto. | Incumplían el objetivo de 44 px del sistema. | Altura mínima 44 px; revisión posterior sin controles operativos pequeños. |
| S2 | Shell, enfocar «Saltar a la propuesta». Inicialmente 43 px de alto. | Desviación menor de 1 px respecto del mínimo. | Mínimo 44 px confirmado. No se trató aisladamente como bloqueo material. |
| S3 | `/visitas` y `/equipo`, CTAs y superficies principales. | Variantes de cacao/marfil/borgoña no documentadas; debilitaban la consistencia entre propuestas. | Tokens principales alineados a los HEX aprobados. Contraste sigue pasando. |
| S4 | `/equipo` → Cancelar primer pedido → diálogo, 390 px; más visible al 200%. | «Cerrar» se partía en «Cerra/r» y luego en múltiples líneas. | Cierre sin encogimiento ni corte de palabra, 73.95×44 px al tamaño normal. Al 200% pasa a su propia fila y sigue legible. |
| S5 | `/compra` → Agregar Latte → Revisar pedido → Revisar total → Pagar C$ 135; ampliar texto al 200% a 390 px. | Las tres columnas del seguimiento superponían «Recibido», «En preparación» y «Listo para retirar». | Seguimiento en columna en móvil, sin superposiciones en el comprobante ampliado. |
| S6 | `/visitas`, resumen y fotografía inferiores a 390 px con texto al 200%. | La doble columna estrechaba las palabras; una primera corrección produjo una figura de ancho 0 y un gran vacío. | Colocación móvil en una columna. Reverificación limpia: figura 354×480 px al 200%, imagen cargada, leyenda completa, `scrollWidth=390`. También pasa a 320/768/913/1440 px. |

## Evidencias

Las capturas iniciales se conservan para trazar los hallazgos; las que contienen `final`, `corregido` o las indicadas expresamente debajo representan las comprobaciones finales.

- [Métricas finales de contraste, controles, foco, fuentes y movimiento](revision-sistema/metrics.json).
- [Matriz de anchos y estados de comprobantes/diálogos](revision-sistema/final-states.json).
- [Matriz final de Visitas tras corregir el reflujo](revision-sistema/visitas-final-widths.json).
- [Comprobante de Compra con texto al 200% — final](revision-sistema/compra-comprobante-text200-390.png).
- [Visitas a 320 px — final](revision-sistema/visitas-final-320.png), [913 px con gutter — final](revision-sistema/visitas-final-913.png).
- [Visitas al 200% — final](revision-sistema/visitas-text200-390.png), [detalle de foto y leyenda — final](revision-sistema/visitas-text200-resumen-foto-390.png).
- [Foco visible del horario](revision-sistema/visitas-radio-foco-390.png).
- [Cierre de Equipo corregido](revision-sistema/equipo-cancelar-corregido-390.png), [diálogo al 200% — final](revision-sistema/equipo-cancelar-text200-390.png).
- [Revisión del pago](revision-sistema/compra-pago-390.png), [formulario de variante](revision-sistema/compra-variantes-390.png), [confirmación de entrega](revision-sistema/equipo-entrega-390.png).

Los scripts de reproducción y los datos adicionales están dentro de `revision-sistema/`. No se modificaron las propuestas desde esta revisión.
