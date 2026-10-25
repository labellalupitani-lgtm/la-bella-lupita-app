# Revisión de uso · Tienda «Producto protagonista»

**Dictamen: FAIL — 1 defecto reproducible de lectura al ampliar texto.**

Revisión independiente de UI/render realizada el 22 de octubre de 2026 con Edge/Playwright en modo headless. Entrada por `http://127.0.0.1:5300/__preview/entrar`, que redirige a `/` (Inicio); después `/tienda`, con `h1` **Reserva de Cosecha** verificado. Backend de prueba PGlite; navegador configurado para bloquear solicitudes externas. Ningún enlace de WhatsApp fue abierto ni se enviaron mensajes. No se modificó código de la aplicación.

## Defecto

**P2 — Las etiquetas invaden los valores del resumen de encargos con texto al 200% a 390 px.**

Pasos:

1. Entrar en la vista local y abrir `/tienda` a 390 × 844.
2. Ampliar al doble el tamaño de texto y su interlineado, conservando el ancho del viewport.
3. Abrir con teclado «Regalos y café para oficina».
4. Leer las filas «Cantidad», «Cuándo» y «Dónde» en la tarjeta de resumen.

Resultado: «Cantidad» y «Cuándo» se superponen con «Por definir». La columna de etiquetas conserva 70 px: el texto «Cantidad» ocupa 110 px y «Cuándo», 94 px. El valor empieza a 86 px del comienzo de la etiqueta, por lo que ambas invaden su espacio. «Dónde» queda demasiado próximo, aunque no se superpone. No es un desborde de página: `scrollWidth` continúa en 390 px, por lo que una comprobación de ancho global no lo detecta.

Esperado: las etiquetas y valores deben conservar una separación legible al 200%; por ejemplo, permitiendo adaptar el ancho de columna o apilando las filas cuando sea necesario.

Evidencia: [resumen ampliado](pruebas/uso-texto200-resumen-390.png), [acción y resumen ampliados](pruebas/uso-texto200-encargo-390.png). Medidas: `texto200.filas` en [resultados JSON](pruebas/revision-uso-resultados.json).

## Comprobaciones que pasan

| Comprobación | Resultado observado |
| --- | --- |
| Acceso y página | Ruta `/tienda` y único título esperado «Reserva de Cosecha». |
| Oferta incompleta | Peso, precio, preventa y aviso consolidado próximos a «Consultar este lote». No aparece una acción para pagar esta oferta incompleta. |
| Imagen | Rótulo explícito «Café servido en la casa · imagen de ambiente». No se presenta como empaque real. |
| Sobre el café | Accesible por Tab; Enter abre y Espacio cierra; foco visible. Contenido reconoce que origen y proceso aún no están publicados. |
| Retiro y condiciones | Mismo comportamiento de teclado. Contenido reconoce las condiciones pendientes. |
| Regalos y café para oficina | Mismo comportamiento de teclado. Campos etiquetados y controles accesibles sin entrar en el contenido cuando el panel está cerrado. |
| WhatsApp del lote | `href` incluye consulta de disponibilidad y condiciones del lote 1 de Reserva de Cosecha. `target="_blank"` y `rel="noopener noreferrer"`. Solo inspección del enlace. |
| WhatsApp de encargos | Al escribir «20 bolsas» y «Managua», ambos valores llegan al mensaje preparado. Se indica que se revisa antes de enviar y que no es una reserva ni una compra. Solo inspección del enlace. |
| Beneficio disponible | Acción de membresía navega a `/club?beneficio=bolsa`; foco termina en «Tus beneficios disponibles». |
| Foco y navegación inferior | Recorrido por Tab a 390 × 844; las acciones, desplegables y beneficio enfocados quedan visibles y reciben interacción en su centro. Comprobación adicional de los controles principales a 320 × 568 sin superposición con la barra inferior. |
| Texto al 200% / 390 | Los controles enfocados, incluida la consulta de encargos, permanecen por encima de la navegación inferior. Sin desborde global; excepción de lectura detallada arriba. |
| Anchos normales | Sin desborde global a 320, 390, 913 y 1440 px. |
| Ejecución | Sin errores JavaScript de página registrados. |

## Método y límites

La ampliación de texto se simula duplicando una sola vez los tamaños calculados de fuente y los interlineados calculados en píxeles; no se duplica el ancho del viewport. Es una prueba de texto ampliado, no una afirmación de haber usado el zoom nativo de la interfaz del navegador. Las capturas de página completa conservan la barra inferior fija en la posición del viewport; la comprobación de obstrucción se hizo sobre los controles enfocados en el viewport, no por su posición en esa captura larga.

Esta revisión cubre la oferta incompleta servida por 5300, desplegables, preparación de consultas y acceso al beneficio disponible. No cubre cobros, recargas, recuperación de resultado incierto, agotamiento, canje ni estados transaccionales. Tampoco constituye una revisión con lector de pantalla o una certificación WCAG completa.

Reproducción: `node entregables/tienda-producto-2026-10-22/revision-uso.mjs`, con la vista previa aislada activa en 5300. El script solo modifica su contexto local de navegador y genera evidencia dentro de esta entrega.
