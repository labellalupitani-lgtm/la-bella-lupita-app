# Revisión independiente final — comercio y visitas

21 de octubre de 2026. Árbitro revision_comercio, sin participación en implementación.

**Dictamen: C1–C5 corregidos y revalidados. No quedan fallos críticos o importantes detectados en el alcance de esta revisión.** La aprobación técnica corresponde a los recorridos y límites documentados; no sustituye la aprobación visual del usuario ni autoriza publicar.

## Versión y aislamiento

Preview final exclusiva: http://127.0.0.1:5274/__preview. Se comprobó en el documento servido el módulo **principal-D7uKApT5.js**. La compilación local usada por las suites complementarias contiene el mismo módulo; SHA256 de dist/index.html: E4021571CA3F93A3864D9882F4EFD96DC65F64B9BFE3B403E6862F93C0532A2B.

Se usaron contextos propios de Chromium/Edge, PGlite sintético y bloqueo de solicitudes ajenas al origen local. Las suites de compra y acceso abrieron bases sintéticas independientes. No se hizo build, no se modificó producto y no se enviaron mensajes ni operaciones al negocio.

## Revalidación de los hallazgos

| Hallazgo | Resultado observado | Evidencia comparable |
|---|---|---|
| C1, detalle público sin salida | **Pasa.** Latte muestra “Ingresar para pedir” habilitado y explicación de acceso, sin contador de cantidad inútil. Al entrar y volver conserva plato=latte, q=latte y momento=brunch. La suite de alta con correo simulado vuelve a la ficha con Agregar habilitado y cero pedidos creados automáticamente; agotado se presenta con su propio mensaje. | [Antes](evidencia/arbitro-comercio/carta-publica-detalle-390.png) · [Después](evidencia/arbitro-comercio/final/carta-publica-detalle-390.png) |
| C2, errores de disponibilidad contradictorios | **Pasa.** Un503 en disponibilidad de cambio muestra error de consulta y conserva la visita; no anuncia agenda vacía. Confirmar queda deshabilitado. “Actualizar horarios” recupera disponibilidad y retira el alert. También se repitió el error y se recuperó cambiando Personas: sin error residual. | [Antes](evidencia/arbitro-comercio/cambiar-recupera-error.png) · [Después](evidencia/arbitro-comercio/final/cambiar-recupera-error.png) · [Fallo final](evidencia/arbitro-comercio/final/cambiar-falla.png) |
| C3, carga/referencia falsa de Tienda | **Pasa.** Un503 inicial sin intento termina la carga y muestra “No pudimos consultar tus compras pendientes”, con reintento. No aparece “Comprobando…” ni “Conservamos tu referencia”. El reintento exitoso retira el error. | [Antes](evidencia/arbitro-comercio/tienda-recuperacion-falla.png) · [Después](evidencia/arbitro-comercio/final/tienda-recuperacion-falla.png) |
| C4, recorte en pie de foto | **Pasa.** A320×700 y fuente raíz32px, el pie distribuye ambos textos en filas y “Tu próxima visita” queda completo. Anchos cliente/contenido pasan de288/297 a288/288px. | [Antes](evidencia/arbitro-comercio/reservar-hero-200-detalle.png) · [Después](evidencia/arbitro-comercio/final/reservar-hero-200-detalle.png) |
| C5, CTA de revisión fragmentada | **Pasa.** A320×700 y texto200%, las acciones se distribuyen con espacio suficiente. “Confirmar mi mesa” ocupa dos líneas completas:256×132px, frente154×258px. El pie pasa de428 a362px. Los datos siguen siendo desplazables y Tab deja “Cambiar fecha o grupo” entero por encima del pie. | [Antes](evidencia/arbitro-comercio/reserva-revision-200-viewport.png) · [Después](evidencia/arbitro-comercio/final/reserva-revision-200-viewport.png) · [Foco visible](evidencia/arbitro-comercio/final/reserva-revision-200-foco.png) |

La región desplazable del detalle también se revisó a320+200%: Tab desde Cerrar llega a “Detalles del producto”, con foco visible. End permite llegar al final de su contenido (scrollTop1653, alto visible360, contenido2015px), manteniendo la acción de acceso disponible. [Captura](evidencia/arbitro-comercio/final/detalle-teclado-200.png) y [medición](evidencia/arbitro-comercio/final/detalle-teclado.json).

El pie de confirmación sigue ocupando362 de700px con texto al200%; es el tamaño real medido, no una afirmación de pantalla compacta. La fragmentación de palabras se resolvió y los controles/datos observados siguen alcanzables. No se redujo la ampliación para obtener el resultado.

## Regresión y recorridos

- **Matriz repetida:** Tienda, Mis compras, Mis reservas y Reservar a320×700,390×844,768×1024 y1440×900, más320×700/texto200%. Veinte combinaciones sin desbordamiento horizontal de documento.
- **Accesibilidad automática:** axe WCAG2A/AA,2.1AA y2.2AA sin infracciones en las cuatro rutas a320+200%. Foco por Tab en las cinco zonas de Reservar conserva cada control por encima del pie; foco de Cambiar fecha o grupo visible entre y236,8 y320,8, con pie desde337.
- **Reservas:** alta sintética confirmada para24/10/2026,12:00; fallo/recuperación de disponibilidad de cambio; cambio de fecha a25/10; cancelación exitosa. Comprobantes y mensajes de resultado verificados. No hubo pageerror en la auditoría final.
- **Tienda:** los nueve grupos de la suite existente volvieron a pasar: oferta/cotización/teclado, cambio de precio, respuesta perdida sin cargo duplicado, contrato incompleto, recarga, encargos WhatsApp sin envío, beneficio mensual, errores de catálogo y render/diálogo en Firefox y WebKit además de Chromium.
- **Acceso:** los cinco grupos de continuidad-acceso pasaron en base aislada: detalle público, ida/vuelta conservando contexto, alta con correo simulado, agotado distinguido e ingreso desde la lista con foco/reflujo/axe. Se guardó una copia de ejecución con directorio de evidencia propio, sin modificar el test original.
- Se conservaron las capturas finales de las cuatro rutas en los mismos tamaños que en la ronda inicial.

## Evidencia y límites

Resultados: [revalidacion.json](evidencia/arbitro-comercio/final/revalidacion.json), [reservar-bordes.json](evidencia/arbitro-comercio/final/reservar-bordes.json), [Tienda](evidencia/arbitro-comercio/final/tienda-suite/ui.json), [Acceso](evidencia/arbitro-comercio/final/acceso-suite/resultados.json). Scripts reproducibles y capturas en evidencia/arbitro-comercio/final/.

Se mantienen los límites de [la revisión inicial](revision-comercio.md): no se ensayaron lectores de pantalla, dispositivos físicos, importación externa de calendario, entrega real de correos/WhatsApp, todas las carreras de reserva, devolución VIP, todas las transiciones de cocina/experiencias ni paginación extensa. La prueba de texto200% usa fuente raíz32px; no equivale a todos los modos de zoom de sistema. La cobertura final de Chromium es más amplia que la de Firefox/WebKit, limitada a la suite de compra y diálogo. No se detectó regresión dentro de los recorridos ejecutados.

## Adenda C3 — respuesta HTTP200 malformada

La última compilación servida por5274 es **principal-BdaynFmx.js**, comprobada en el documento del navegador. SHA256 actual de dist/index.html: **415068f9ab568a77882f29c19e4c91eea87654e8f549ccd7b1cd4a3711d6251a**. Esta adenda cubre el cambio de mensaje del error de contrato; la matriz integral anterior corresponde a D7uKApT5 y no se repitió por este cambio de cadena.

- **Sin referencia local + HTTP200{} en recuperación: pasa.** El error informa que no se pudo verificar la respuesta de la Tienda y pide volver a consultar. No afirma conservar una referencia ni deja el estado de carga activo.
- **Con referencia local sintética previa + HTTP200{}: pasa.** La referencia se conserva exactamente en almacenamiento y se muestra con Consultar resultado. El estado de intento conocido explica que se conserva; el error de contrato usa el mensaje nuevo. La referencia de esta prueba fue creada solo como dato de estado local en la preview, no representa un cargo del servidor.
- **Reintento posterior válido: pasa.** Se consulta la misma referencia, se retiran error y carga al completar, y se muestra el resultado sin cobro sin borrar la referencia. La recuperación y la consulta del resultado se simularon exclusivamente en el navegador. Ningún pageerror.

El dictamen se mantiene. [Resultados y hash](evidencia/arbitro-comercio/final/c3-adenda.json), [sin referencia](evidencia/arbitro-comercio/final/c3-sin-ref-200-invalida.png), [con referencia local](evidencia/arbitro-comercio/final/c3-con-ref-200-invalida.png).

