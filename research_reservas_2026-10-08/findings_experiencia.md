# Experiencia y operación de «Reserva una mesa»

Auditoría de código y documentación primaria. Fecha de referencia: 8 de octubre de 2026, America/Managua. Este documento no describe una prueba de una reserva real ni una validación presencial del restaurante.

## Conclusión

La interfaz tiene una base útil: tres pasos comprensibles, precio de depósito visible desde la elección de zona, revisión antes del cargo, disponibilidad consultada al servidor, devolución de una reserva ya existente para evitar duplicados y cancelación autónoma para reservas futuras sin depósito. Su principal debilidad es que trata la reserva como un formulario de alta, cuando necesita cubrir la visita completa: decisión, confirmación recuperable, comunicación, modificaciones, llegada, salida y conciliación del depósito.

Los mayores riesgos de experiencia son la promesa incompleta del depósito, el callejón operativo para modificar una reserva, y la ausencia de un comprobante de éxito con una acción clara. Los principales límites comerciales son exigir acceso antes de mostrar disponibilidad y pedir saldo previamente recargado de forma presencial para el VIP. No existen datos observados suficientes para atribuirles una tasa de abandono ni calcular ventas perdidas.

## Alcance y calidad de evidencia

- **Confirmado en código**: aplicación activa en `club-lupita/src/casa`, endpoints en `club-lupita/src/worker` y esquema de base de datos en `club-lupita/db`. Las referencias de línea siguientes son relativas a `club-lupita/`.
- **Inferencia de experiencia**: posible confusión, fricción o pérdida de confianza derivada del flujo. Debe contrastarse con usuarios y métricas; no se presenta como abandono medido.
- **Pendiente de negocio**: capacidad física de cada mesa, horarios excepcionales, política de depósito, canales atendidos, tardanzas, grupos y accesibilidad del local. Ninguno se da por establecido.
- **Fuentes externas**: cinco consultas de búsqueda, más aperturas de fuentes oficiales. OpenTable y Resy devolvieron texto útil en el índice; algunas aperturas directas devolvieron contenedor vacío o error CSS. SevenRooms y Google se consultaron como referencias de producto/proceso, no como prueba de resultados comerciales de La Bella Lupita.

## Recorrido actual reconstruido

1. Inicio, Club y cabecera enlazan a `/reservar`; Perfil enlaza a «Mis compras y reservas». El usuario sin sesión llega a `Umbral` incluso si abre directamente `/reservar` (`src/casa/App.tsx:113`).
2. Lugar: cinco zonas. El catálogo declara terraza 10, ventanal 6, barra 8, bistró 12 y VIP 1, etiquetadas como mesas; únicamente VIP cobra C$500 (`src/worker/index.ts:967`). Estos son valores configurados, no inventario físico verificado.
3. Fecha y grupo: 14 días desde hoy, 1–12 personas, 1–6 horas, duración inicial de 2 horas, inicios en horas enteras. El servidor admite hasta 90 días y exige 30 minutos de antelación (`src/casa/pantallas/Reservar.tsx:253`, `:293`, `:311`; `src/worker/index.ts:993`).
4. Revisión: zona, fecha/hora, personas/duración, depósito y cargo a Cuenta de Casa. Saldo insuficiente bloquea confirmar y enlaza a Inicio (`Reservar.tsx:374`, `:434`).
5. Éxito: aviso flotante, hora borrada y vuelta al primer paso. No se muestra allí el identificador devuelto, ni un enlace a «Ver mi reserva» (`Reservar.tsx:152`).
6. Gestión posterior: `/compras` mezcla pedidos, reservas, bolsas y experiencias. La reserva muestra fecha, fin, grupo, depósito, comprobante y «Registrada»/«Cancelada». Solo la futura sin depósito dispone de cancelar (`src/casa/pantallas/MisCompras.tsx:26`).
7. Ayuda: un formulario genérico requiere que el cliente escriba el comprobante; la respuesta aparece en la misma pantalla. La solicitud no cambia la reserva (`src/casa/componentes/Atencion.tsx:15`).
8. Equipo: Agenda consulta registros; etiqueta una reserva como «finalizada» cuando pasó su hora de fin. Atención responde y cierra solicitudes, expresamente sin modificar reserva ni dinero (`src/casa/equipo/Lecturas.tsx:25`, `:41`).

## Hallazgos priorizados y criterios de aceptación

Esfuerzo relativo: **S** = cambio acotado de interfaz o contenido; **M** = varios componentes y contratos de datos; **L** = flujo de negocio, persistencia, permisos e integración. No son estimaciones en días. P1 = resolver antes de promover/ampliar reservas con dinero o compromisos operativos; P2 = siguiente iteración; P3 = optimización posterior.

### EX-01 · P1 · Depósito sin desenlace contractual ni operativo explícito

**Evidencia.** `Reservar.tsx:392` explica el cargo al apartar y remite a «escribinos». No comunica si se aplica al consumo, si se devuelve, condiciones/plazo, tratamiento de cancelación, tardanza, cierre del local o no presentación. En el éxito se dice «se retuvo» (`:159`), mientras la revisión dice «se carga». El comentario histórico no es prueba; sí lo son el cargo y la ausencia de campos de política en el flujo examinado. `MisCompras.tsx:31` impide cancelar automáticamente con depósito y `src/worker/atencion.ts:14` lo rechaza.

**Impacto inferido.** El cliente conoce cuánto paga, pero no lo que ocurre después con ese dinero. La palabra retención sugiere una reversibilidad que no está explicada. El personal tampoco dispone aquí de resolución explícita.

**Recomendación.** Definir una política real con el negocio; publicarla antes de confirmar y conservar su versión junto a la reserva. Separar importe, momento del cargo, destino del depósito, condiciones de cambio/cancelación y canal de asistencia. Mostrar saldo anterior y posterior. Usar «cobrado», «retenido» o «pendiente» conforme al movimiento real. No inventar horas de tolerancia ni reembolso.

**Aceptación.** Una reserva con dinero conserva importe, versión de política aceptada y resultado financiero. Su detalle muestra qué pasó con el depósito. Las operaciones autorizadas de devolución/aplicación quedan auditadas y son repetibles sin doble movimiento. **Esfuerzo L; dependencia: decisión de negocio.**

### EX-02 · P1 · Solicitar un cambio no produce una operación de reserva

**Evidencia.** Agenda es de lectura (`Lecturas.tsx:25–29`); Atención declara que cerrar la solicitud «no cambia reservas ni mueve dinero» (`:41`). El cliente debe copiar manualmente el comprobante a un mensaje genérico (`Atencion.tsx:16`). No aparece un flujo de reprogramación en las pantallas revisadas.

**Impacto inferido.** El equipo puede responder «resuelto» sin que inventario, fecha o dinero hayan cambiado. La gestión queda dependiente de un procedimiento externo que no se verificó. Cancelar y crear de nuevo tampoco garantiza conservar la nueva mesa.

**Recomendación.** Enlazar la solicitud a una reserva y a una acción concreta. Habilitar al personal autorizado cambio de fecha/grupo/zona, cancelación y resolución del depósito; registrar resultado, autor y motivo. Para el cliente, ofrecer autoservicio cuando la política lo permita. La reprogramación debe validar la nueva capacidad antes de liberar la anterior y confirmar ambas partes de una sola operación.

**Aceptación.** El equipo puede resolver una solicitud de cambio y cliente/agenda muestran el mismo resultado; una reserva fallida conserva su turno original; un conflicto de disponibilidad propone alternativas; responder un mensaje nunca se presenta como modificación ejecutada. **Esfuerzo L.**

### EX-03 · P1 · Disponibilidad de «una mesa» desconectada del tamaño real del grupo

**Evidencia.** La elección de personas llega a 12 (`Reservar.tsx:293`) pero la consulta de ocupación se hace por día (`:93`). El cálculo del servidor suma reservas simultáneas contra un aforo, sin usar personas ni capacidad de mesas (`index.ts:1060–1076`). «La barra» también admite cualquier grupo del rango configurado. No se ha verificado cuántas plazas físicas representa cada unidad.

**Impacto inferido.** El control evita exceso de unidades lógicas, pero no demuestra que un grupo quepa. Doce reservas para doce personas y doce para una consumen la misma cuota lógica en bistró. No se afirma que tal desajuste ya haya sucedido en el local.

**Recomendación.** Validar inventario con operaciones: mesas/plazas, capacidades mínimas y máximas, combinaciones, accesibilidad y zonas. Calcular disponibilidad con fecha, personas y duración; conservar margen para llegadas sin reserva si es política real. Si el producto mantiene cupos simplificados, publicar y aplicar máximos de grupo por zona verificados.

**Aceptación.** No se ofrece una combinación zona/grupo imposible; dos grupos simultáneos solo se aceptan si el inventario los admite; un grupo mayor al máximo obtiene asistencia concreta. **Esfuerzo L; dependencia: plano e inventario verificado.**

### EX-04 · P1 · El acceso al VIP exige un paso presencial y abandona el borrador

**Evidencia.** «Ver mi cuenta y recargar» navega a `/` (`Reservar.tsx:434`), pero la recarga se realiza en mostrador con efectivo o tarjeta (`Inicio.tsx:206–210`). Los datos del wizard son estado local (`Reservar.tsx:66–71`) y no se guardan como borrador. VIP usa C$500 (`index.ts:975`).

**Impacto inferido.** Un visitante remoto nuevo sin saldo no tiene un camino digital completo hasta confirmar VIP. Tras consultar saldo o recarga debe reconstruir su elección. La etiqueta de acción no anticipa la recarga presencial.

**Recomendación.** Mostrar el requisito de saldo al elegir VIP; conservar borrador por cuenta y revalidar disponibilidad al volver. Según decisión del negocio, implementar un pago remoto real o una solicitud asistida con estado inequívoco «pendiente». Mientras solo exista mostrador, el texto debe decirlo antes del último paso.

**Aceptación.** Salir a saldo y regresar conserva la intención sin prometer capacidad; el cliente conoce el canal de pago; una solicitud pendiente no se presenta como reserva confirmada. **Esfuerzo M para claridad/borrador; L para pago remoto.**

### EX-05 · P1 · Confirmación insuficiente y recuperación poco visible

**Evidencia.** El éxito vuelve al paso Lugar con un `AvisoFlotante` (`Reservar.tsx:152–164`, `:438`). No existe aquí pantalla de comprobante ni CTA a `/compras`. El aviso se mantiene mientras el componente está montado: no debe describirse como un toast temporizado. El API devuelve `reserva.id`, `termina`, `personas`, pero el mensaje utiliza fecha/hora local y cobro. MisCompras permite recuperar el registro, pasando por Perfil.

**Recomendación.** Mostrar una confirmación estable con referencia, nombre, zona, fecha y hora de Nicaragua, fin/duración, grupo, depósito, dirección verificada y acciones «Ver/gestionar reserva», calendario y ayuda. Diferenciar alta nueva de reserva ya existente. En el segundo caso mostrar exactamente los datos devueltos por el servidor.

**Aceptación.** Tras éxito el cliente identifica sin ambigüedad qué mesa tiene y puede recuperar/gestionar el comprobante en un toque; refrescar o volver conserva el registro. **Esfuerzo M.**

### EX-06 · P1 · Cambiar el grupo y repetir puede recuperar silenciosamente la reserva anterior

**Evidencia.** El servidor considera repetida una reserva por socio, zona e inicio (`index.ts:1033–1041`), sin comparar personas ni fin. El cliente dice que esa mesa ya era suya sin revelar los datos originales (`Reservar.tsx:154–159`). No se reprodujo con escritura en producción.

**Recomendación.** Si existe una reserva, mostrar su fecha, grupo y duración reales y ofrecer gestionarla. Si los parámetros difieren, informar que el intento no modificó el registro. Separar evitar doble envío de editar una reserva.

**Aceptación.** Reservar para 2 y después intentar 8 en la misma zona/hora nunca confirma implícitamente 8 si conserva 2; no hay cargo repetido. **Esfuerzo M.**

### EX-07 · P2 · Inicio obligatorio de sesión antes de ver valor o disponibilidad

**Evidencia.** Todas las rutas salvo `/kit` llevan a `Umbral` si no existe sesión (`App.tsx:113–120`). La ocupación está en lista pública de API (`index.ts:268`), pero el flujo no la presenta antes de acceder.

**Recomendación.** Permitir consultar disponibilidad, condiciones y zonas de forma pública. Pedir identificación al confirmar; conservar la selección durante verificación. Evaluar reserva de invitado si encaja con la operación, sin obligar a comprar membresía. No se ha encontrado evidencia de que hoy se exija membresía pagada para reservar: sesión y membresía son cosas distintas.

**Aceptación.** Un visitante sin cuenta puede saber si hay mesa antes de registrarse; el retorno tras autenticar conserva intención y revalida disponibilidad. Comparar finalización y errores por cohortes sin inventar metas de conversión. **Esfuerzo M/L según modelo de identidad.**

### EX-08 · P2 · Elección de zona prematura y datos insuficientes para elegirla

**Evidencia.** El primer paso obliga a elegir zona antes de fecha/grupo (`Reservar.tsx:185–245`). La tarjeta contiene nombre e importe o cantidad de mesas; la fotografía real solo se usa para terraza (`:173–181`). No hay descripción operativa de sombra, interior/exterior, ruido, escaleras o acomodo de sillas de ruedas.

**Recomendación.** Priorizar fecha, personas y hora, con «Cualquier zona» como opción si el negocio puede asignar. Mantener una selección de lugar voluntaria y rica en información útil verificada. Si se conserva el orden actual, mostrar inmediatamente horarios alternativos en otras zonas y máximo de grupo.

**Aceptación.** El cliente encuentra la primera combinación compatible sin recorrer zonas a ciegas; cada atributo publicado está confirmado por el local. Solicitudes de accesibilidad o acomodo se diferencian de garantías. **Esfuerzo M.**

### EX-09 · P2 · Horizonte, franjas y duración poco explicados

**Evidencia.** UI de 14 días frente a 90 en servidor. El usuario elige 1–6 horas y solo inicios enteros; al agotarse opciones el texto sugiere otro día o menos horas (`Reservar.tsx:337`). No se ofrece calendario extendido, contacto para más de 12 personas, ni distinción visible entre día completo y horas ya pasadas. La etiqueta «Ya pasó» también se usa para una hora futura a menos de 30 minutos (`:353`).

**Recomendación.** Publicar la ventana real que el negocio decida y usarla en ambos lados. Ofrecer calendario accesible para otras fechas, botón de siguiente disponibilidad y canal concreto para grupos mayores. Justificar la duración y mostrar fin de visita; si 1–6 horas no refleja servicio real, sustituirla por duración de turno configurable. Definir si 15/30 minutos de inicio sirven a la operación antes de añadir franjas.

**Aceptación.** El día 15 y el límite definido son seleccionables cuando corresponda; los estados distinguen cerrado, completo, antelación insuficiente y error; no se muestra «pasó» para una hora futura. **Esfuerzo M; política de turnos pendiente.**

### EX-10 · P2 · Sin ciclo de llegada, no presentación ni cierre real de visita

**Evidencia.** Agenda etiqueta «finalizada» según el reloj (`Lecturas.tsx:29`); la reserva examinada guarda cancelación pero no llegada, sentada, salida o no presentación (`db/001_schema.sql:186`, migraciones revisadas). La asistencia de experiencias es un dominio distinto y no resuelve mesas.

**Recomendación.** Separar vencimiento temporal de visita atendida. Introducir estados y acciones del anfitrión: confirmada, llegada, sentada, completada, cancelada, no presentada; registrar hora y autor. Definir tolerancia, quién libera una mesa y protocolo para cierres/lluvia/grupos tardíos. No automatizar sanciones sin política aprobada y corrección de errores.

**Aceptación.** Un turno pasado sin interacción no cuenta como atendido; el personal puede corregir un estado con auditoría; cancelación por el restaurante libera inventario y genera aviso. **Esfuerzo L.**

### EX-11 · P2 · Comunicación transaccional insuficiente para acompañar la visita

**Evidencia.** El endpoint de reserva devuelve datos pero no crea una notificación de confirmación como sí hace pedidos (`index.ts:789` frente a `:1092`). El correo implementado envía códigos de acceso (`src/worker/correo.ts:4`); no se encontró envío de confirmación ni recordatorio de mesa en los caminos examinados. Cancelar sin depósito sí crea un aviso dentro de la app (`atencion.ts:17`). Esto no descarta una operación manual externa no documentada.

**Recomendación.** Enviar comprobante y cambios/cancelaciones por el canal transaccional verificado disponible; añadir recordatorio con enlace seguro a gestionar. Separar estado de reserva del estado de entrega del mensaje: si el mensaje falla, la mesa puede seguir confirmada. Configurar reintentos y visibilidad de fallos para el equipo, sin enviar promociones por defecto.

**Aceptación.** Cada evento produce un mensaje trazable y deduplicado; fecha/hora usan Managua; reintentar un envío no crea otra reserva; el cliente conserva acceso al comprobante aunque el proveedor falle. **Esfuerzo L.**

### EX-12 · P2 · Falta un embudo medible y resultados de servicio

**Evidencia.** No se encontró instrumentación del embudo en `Reservar.tsx`; los informes del equipo cubren pedidos, entregas, cancelaciones de pedidos e importe (`Lecturas.tsx:54–60`), y el resumen solo cuenta reservas no canceladas del día (`:49`). No hay base verificada para tasas de conversión, no-show o ocupación física.

**Recomendación.** Medir vistas, consulta, disponibilidad mostrada/vacía/error, selección, inicio/fin de autenticación, revisión, insuficiencia de saldo, intento, éxito y conflicto. Separar evento de clic de confirmación del servidor. Segmentar dispositivo, origen, zona, grupo, antelación y con/sin depósito; excluir demo y personal. No incluir nombres, teléfono, correo ni texto libre en analítica.

**Aceptación.** Cada confirmación tiene un único resultado del servidor; se puede distinguir abandono de fallo, no disponibilidad o pago pendiente; indicadores de asistencia solo se publican cuando exista registro confiable. **Esfuerzo M para embudo; depende de EX-10 para resultados de servicio.**

## Métricas propuestas, sin valores inventados

| Pregunta | Definición inicial | Cautela |
|---|---|---|
| ¿Cuánto del interés se confirma? | Reservas confirmadas únicas / sesiones que iniciaron una consulta elegible | Separar visitantes y clientes recurrentes; una sesión puede consultar varias opciones |
| ¿Dónde se interrumpe? | Abandono por transición de paso y causa de bloqueo | No equiparar ausencia de siguiente evento a fallo técnico |
| ¿La app promete disponibilidad que luego rechaza? | Conflictos de capacidad / intentos de confirmación con disponibilidad mostrada | Medir antigüedad de la consulta |
| ¿El depósito bloquea? | Sesiones con saldo insuficiente, retorno y confirmación posterior | No llamar venta perdida a toda salida |
| ¿Se atienden solicitudes? | Tiempo hasta primera respuesta y hasta operación efectiva, mediana y percentiles | Respuesta y resolución de reserva son eventos distintos |
| ¿Cuántas visitas no se presentan? | Reservas marcadas no presentadas / reservas que debían asistir, excluidas cancelaciones según política | No inferir no-show de que haya pasado la hora |
| ¿Se usa bien la capacidad? | Mesa-horas ocupadas / mesa-horas ofrecidas, con inventario real | Añadir personas atendidas; no confundir reserva con plaza |
| ¿Funcionan los avisos? | Entregados, fallidos y gestionados por canal y evento | Confirmación y entrega del mensaje se mantienen independientes |

## Referencias primarias y aplicación prudente

1. [OpenTable — How do I make a reservation?](https://help.opentable.com/s/article/How-do-I-make-a-reservation-1505260085031?language=en_US). Documenta consulta por fecha/hora/grupo, algunas reservas sin cuenta, confirmación con detalle, correo de confirmación, gestión posterior y calendario. Orienta EX-05 y EX-07; no implica que La Bella Lupita deba copiar el producto ni sus políticas.
2. [OpenTable — Cancellation, no-show and deposit policies](https://help.opentable.com/s/article/What-are-cancellation-no-show-and-deposit-policies?language=en_US). Expone que las condiciones aparecen al reservar y en la confirmación; el destino y devolución dependen de la política del restaurante. Respalda comunicar el desenlace del depósito (EX-01), no un plazo de devolución específico para esta app.
3. [Resy — Automated Reservation Emails](https://helpdesk.resy.com/en_us/standard-resy-automated-email-content-HyaaWvXId). Documenta correos automáticos al reservar, cambiar o cancelar. Referencia para la cobertura de eventos de EX-11; no se propone contratar Resy ni se presupone disponibilidad local.
4. [Resy — Guest Communications: Emails](https://helpdesk.resy.com/en_us/guest-communications-emails-HyZVfvmId). Sus mensajes usan datos dinámicos de la reserva y la zona horaria del restaurante. Referencia para comprobantes consistentes para personas que consultan desde otro país.
5. [SevenRooms — How to Turn Cancellations and No-Shows Into Regulars](https://sevenrooms.com/blog/how-to-turn-cancellations-and-no-shows-into-regulars/). Describe cambios autónomos de fecha, hora y grupo sin cancelar/recrear, políticas visibles, recordatorios y lista de espera. Se adopta el patrón de gestión (EX-02/11); se excluyen sus cifras comerciales y las de terceros del diagnóstico de La Bella Lupita.
6. [SevenRooms — Reservations & Waitlist](https://sevenrooms.com/platform/reservations-waitlist/). Ilustra consulta directa, preferencias de visita, recordatorios y recuperación de cancelaciones mediante avisos. Lista de espera sería una fase posterior, una vez confiables inventario, comunicación y gestión; no un requisito para el primer arreglo.
7. [Google — Manage your local business links](https://support.google.com/business/answer/6218037?hl=en-11) y [Business links policies & guidelines](https://support.google.com/business/answer/13769188?hl=en). Google permite enlaces de reserva y selección de preferencia, con elegibilidad variable por categoría/región. Una ruta pública estable podría ser destino de descubrimiento; verificar elegibilidad de la ficha nicaragüense antes de prometer botones o integración. No se editó ninguna ficha.

## Decisiones pendientes que deben resolver negocio y operación

1. ¿Se confirma una mesa específica, un cupo de zona o una solicitud sujeta a aceptación? El texto y el motor deben prometer lo mismo.
2. ¿Cuántas plazas y combinaciones tiene cada zona? ¿Cómo se acomodan grupos, menores, silla infantil, silla de ruedas y acompañantes?
3. ¿Las zonas están garantizadas? ¿Qué ocurre con terraza ante lluvia, calor o cierre parcial?
4. ¿Qué turnos y duraciones se ofrecen realmente? ¿Son 14 o 90 días? ¿Qué horarios excepcionales se manejan?
5. ¿Qué representa C$500 de VIP, cuándo se aplica/devuelve y quién autoriza excepciones? ¿Hay un canal remoto real de pago?
6. ¿Qué cambios/cancelaciones hace el cliente y cuáles el equipo? ¿Qué antelación y tolerancia se aplican?
7. ¿Quién atiende una solicitud próxima y por qué canal? El tiempo de respuesta debe ser alcanzable por el personal.
8. ¿Se desea reservar públicamente o solo desde cuentas? ¿Hay demanda turística que justifique otro idioma y teléfonos internacionales?
9. ¿Qué confirmación, recordatorio y aviso de cierre se pueden entregar de forma comprobable? No prometer WhatsApp, correo o SMS hasta que estén implementados y atendidos.

## Orden recomendado

Primero resolver la política y gestión del depósito, la capacidad por grupo y la operación de cambios. En paralelo, corregir confirmación, navegación a la reserva y pérdida del borrador, que no requieren rehacer toda la interfaz. Después abrir la consulta pública, mejorar calendario/alternativas, implementar mensajes y registrar el ciclo de visita. Medir desde el inicio; reservar lista de espera, personalización e integraciones comerciales para cuando el servicio base sea verificable.
