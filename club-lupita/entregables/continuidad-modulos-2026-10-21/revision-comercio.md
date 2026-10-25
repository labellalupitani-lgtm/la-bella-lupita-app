# Revisión independiente — comercio y visitas

Fecha: 21 de octubre de 2026. Árbitro: revision_comercio. Primera ronda, previa a las correcciones del ciclo de continuidad.

Se conserva la dirección visual aprobada. Esta revisión identifica problemas observables de tarea y legibilidad; no propone sustituir la composición, colores ni identidad aprobados. El árbitro no modificó código de producto ni ejecutó compilaciones.

## Entorno y método

- Preview diagnóstica congelada: http://127.0.0.1:5271/__preview. PGlite en memoria, cuentas sintéticas y red externa bloqueada. No se enviaron mensajes, pagos o reservas al negocio.
- Chromium/Edge: pestaña DevTools propia y contextos independientes de Playwright. Compra complementaria: suite existente con PGlite independiente, también Firefox y WebKit.
- Matriz de Tienda, Mis compras, Mis reservas y Reservar: 320×700, 390×844, 768×1024 y 1440×900; además 320×700 con fuente raíz a 32px (200%). Carta pública: revisión manual y captura del detalle a390. Los distintos tamaños emulan viewport; no constituyen prueba en dispositivos físicos.
- Estados de error/latencia/vacío inyectados exclusivamente en el navegador contra endpoints de la preview. Alta/cambio/cancelación de una reserva ejecutados contra la base sintética.
- Datos y capturas: [auditoría general](evidencia/arbitro-comercio/auditoria.json), [bordes de Reservar](evidencia/arbitro-comercio/reservar-bordes.json), [estados](evidencia/arbitro-comercio/estados.json), [suite Tienda](evidencia/arbitro-comercio/tienda-suite/ui.json).
- La suite Tienda usó la compilación existente, sin reconstruir. SHA256 de dist/index.html registrado al final: F070B453A9D13BB7AD32C353564C4EB7B57DEB97924B6CDA90E860EEF90A5BC8. El análisis de defectos se refiere a5271, no al código que el implementador comenzó a corregir después.

## Hallazgos que requieren corrección y revalidación

### C1 — El detalle de Carta pública presenta falta de sesión como indisponibilidad

Prioridad media. En una visita pública, abrir Carta y pulsar la foto/“Ver Latte”. El plato está disponible, pero el diálogo muestra cantidad y una acción deshabilitada “No disponible para agregar”. No explica que falta ingresar ni ofrece el acceso desde ese detalle. La acción de agregar de la lista sí inicia acceso, por lo que el camino por la fotografía llega a un callejón sin salida.

Impacto: se puede interpretar que el plato está agotado y abandonar la selección.

Corrección: distinguir sesión ausente, producto agotado e intento pendiente. Ofrecer ingreso desde el detalle y conservar la búsqueda/plato para volver al mismo contexto.

Evidencia: [carta-publica-detalle-390.png](evidencia/arbitro-comercio/carta-publica-detalle-390.png), caso publico-detalle de auditoria.json. Comunicado y reconocido por el implementador.

### C2 — Cambiar visita mezcla fallo de consulta con agenda vacía y conserva errores ya resueltos

Prioridad media. Crear una reserva sintética; abrir Mis reservas → Cambiar visita. Simular503 en GET /api/reservas/:id/disponibilidad. El diálogo afirma “No hay horarios disponibles. Probá otra fecha o duración” junto al error de conexión, aunque no conoce la disponibilidad. Restaurar el endpoint y cambiar Personas de2 a3: aparecen horarios, “Disponibilidad actualizada para tu grupo” y Confirmar cambio habilitado, pero permanece el alert anterior.

Impacto: induce a cambiar una fecha por un fallo de red y deja dos mensajes contradictorios justo antes de modificar una reserva.

Corrección: estados separados de consulta, vacío y fallo; reintento explícito; retirar el error al iniciar/resolver correctamente una nueva consulta. No descartar la reserva original.

Evidencia: [cambiar-falla.png](evidencia/arbitro-comercio/cambiar-falla.png), [cambiar-recupera-error.png](evidencia/arbitro-comercio/cambiar-recupera-error.png), casos correspondientes de auditoria.json. En la base revisada, el efecto de MisReservas.tsx convierte el catch en horarios=[] y no limpia error al volver a tener éxito.

### C3 — Fallo de consulta inicial en Tienda anuncia una referencia inexistente

Prioridad media por tratarse de una compra. En sesión sin intento local, simular503 en GET /api/tienda/recuperacion y abrir Tienda. Después de terminar la petición permanecen “Comprobando si tenés un intento pendiente…” y “Conservamos tu referencia. Consultá el resultado antes de iniciar otra compra”, aunque no se creó compra ni existe referencia. “Reintentar consulta de compras” recupera correctamente.

Impacto: una persona puede creer que tiene un cobro en curso o una compra incierta cuando solo falló la consulta inicial.

Corrección: separar error de consulta de intentos y resultado incierto de un intento conocido. Mensaje de carga solo mientras hay petición; no afirmar una referencia conservada cuando no se dispone de ella. Mantener el bloqueo seguro y el reintento.

Evidencia: [tienda-recuperacion-falla.png](evidencia/arbitro-comercio/tienda-recuperacion-falla.png), caso tienda-recuperacion-falla de auditoria.json.

### C4 — Texto recortado en la foto de Reservar con texto200%

Prioridad baja. Abrir Reservar a320×700, fuente raíz32px y bajar a la foto de la terraza. “Tu próxima visita” sobresale del pie en fila y queda recortado por la tarjeta. Ancho cliente288px, contenido297px.

Impacto: pérdida visible de texto a un tamaño de lectura admitido.

Corrección: permitir que los textos del pie se distribuyan en varias líneas/filas cuando no caben; conservar el tamaño de texto.

Evidencia: [reservar-hero-200-detalle.png](evidencia/arbitro-comercio/reservar-hero-200-detalle.png), caso hero-200 de reservar-bordes.json. Fuente relevante: reglas móviles .reserva-lugar-pie en redisenio-comercio.css.

### C5 — La acción de confirmar ocupa gran parte de la pantalla al ampliar texto

Prioridad media. Reservar a320×700 con fuente raíz32px; elegir Terraza, fecha24/10/2026,12:00, avanzar a revisión. El pie fijo mide428px y empieza en y271: ocupa61% del viewport. “Confirmar mi mesa” tiene154×258px, con palabras divididas en aproximadamente seis líneas porque comparte fila con Volver.

Impacto: CTA difícil de leer y área muy reducida para comprobar los datos antes de confirmar.

Corrección: distribuir las acciones de revisión con ancho suficiente en espacios estrechos, por ejemplo apilándolas; mantener la ampliación y el acceso a todos los datos.

Evidencia: [reserva-revision-200-viewport.png](evidencia/arbitro-comercio/reserva-revision-200-viewport.png), caso revision-footer-200 de reservar-bordes.json. La medición se hizo en viewport; no es un artefacto de la captura de página completa.

## Registro por página

| Página/superficie | Comprobado | Resultado y límites |
|---|---|---|
| Carta pública / detalle | Lista y destacado Latte; detalle con fotografía, precio, cantidad, información de porción, empaque y alergias; salida por cierre. | C1. No se repite aquí toda la suite de Carta del ciclo anterior ni el checkout de platos, revisado por el coordinador. |
| Tienda, oferta no habilitada | Presentación/condiciones por confirmar; enlace de consulta; beneficio mensual distinguido de preventa; encargos grandes con campos etiquetados. Matriz de tamaños y200%. | Sin desbordamiento horizontal de documento. Contenido “por confirmar” proviene de la fixture y no se consideró información real del negocio ni defecto estético. C3 en fallo inicial. |
| Tienda, compra habilitada | Suite independiente: oferta, cotización, aceptación, cambio de precio, recarga, respuesta perdida, contrato incompleto, recibo, beneficio y contexto WhatsApp. |9 grupos pasaron, incluyendo Firefox/WebKit. Compra sintética única y saldo exacto al recuperar respuesta perdida. Enlaces se inspeccionaron; ningún WhatsApp se envió. |
| Mis compras y reservas | Vacío inicial y simulado; carga con petición retenida; error y actualización; comprobante de mesa; filtros y vuelta desde filtro vacío; acceso a Mis reservas. Matriz y200%. | Sin hallazgo nuevo en estos recorridos. La suite Tienda verificó comprobante de bolsa, estado “Pagada · en espera de preparación” y condiciones de retiro. No se recrearon en esta ronda todos los estados de cocina, experiencias ni paginación larga. |
| Mis reservas | Vacío; carga/error/recuperación; confirmada; Cambiar visita con fecha real modificada a23/10/2026,12:00; cambio exitoso, revisión2; cancelación, revisión3 y desaparición de acciones. Matriz y200%. | C2. El cambio y la cancelación reales solo afectaron PGlite. Calendario visible; no se importó un archivo a calendario externo. No se ensayaron todas las carreras concurrentes ni la devolución de anticipo VIP. |
| Reservar / Lugar | Cinco zonas con estado seleccionable, anticipo VIP indicado, características no confirmadas claramente descritas; navegación de pasos; enlace de consulta; matriz y200%. | C4. Diez focos por Tab sobre las cinco zonas a320+200% quedaron enteros sobre el pie fijo; no se detectó regresión de la corrección de foco previa. |
| Reservar / Fecha y grupo | Fecha nativa, personas, duración, horarios; consulta en curso; fallo de disponibilidad y reintento; paso de revisión con fecha y hora seleccionadas. | Fecha por Playwright actualizó el estado y llegó correctamente al comprobante/revisión. Un intento inicial con fill de DevTools no actualizó React y se descartó como evidencia de producto. |
| Reservar / Revisión y éxito | Resumen de zona/fecha/grupo/anticipo, cambio de fecha, confirmación sintética y comprobante con foco; acceso a Mis reservas. Visita pública llega a “Ingresar para confirmar”. | C5. Alta autenticada confirmada. El ingreso público no se completó con un acceso real. Texto200% probado en fecha y revisión, sin aprobación global mientras siga C5. |

## Resultado de comprobaciones

- 20 combinaciones ruta/tamaño sin desbordamiento horizontal del documento. Esto no descarta recorte interno: C4 fue detectado visualmente y por geometría.
- axe (WCAG2A/AA,2.1AA,2.2AA) sin infracciones reportadas en Tienda, Mis compras, Mis reservas y Reservar a320+200%. No equivale a auditoría completa de accesibilidad ni lector de pantalla.
- Ningún pageerror registrado en la auditoría general.
- 9 grupos de Tienda pasaron: compra, recuperación, recarga, beneficio, errores y tres motores. No se modificaron pruebas existentes; se seleccionó un directorio de evidencia nuevo.
- Alta, modificación y cancelación de reserva completadas en la preview. Foco de pasos observado; cierre Escape de Cambiar visita verificado.
- Carga/vacío/error de listas y recuperación de disponibilidad ejercitados mediante respuestas sintéticas. Mis compras limpia error al reintentar; el extracto “recupera” de estados.json fue tomado durante carga, y la lectura posterior confirmó el comprobante y filtros.

## Dictamen de ronda1

La base conserva la dirección aprobada y los flujos principales de comercio/visitas. No corresponde aprobar el alcance todavía: C1–C5 requieren corrección y revalidación. El implementador recibió los hallazgos con reproducciones y está corrigiéndolos. La aprobación técnica posterior no sustituye la aprobación visual del usuario ni autoriza producción.

Pendientes de esta revisión: volver a recorrer los cinco hallazgos sobre la compilación corregida; verificar que la compra segura y la gestión de reservas siguen funcionando. Pruebas de lector de pantalla, dispositivos físicos, carga concurrida y entrega real de mensajes permanecen fuera de esta evidencia.

