# Mi Club: integridad técnica y operativa

Fecha de evaluación: 8 de octubre de 2026, America/Managua. Código local de `club-lupita`; no se consultaron credenciales ni se modificó producción. Los resultados describen la versión local, no certifican que toda ella esté desplegada.

La base tiene controles importantes ya implementados: dinero en centavos, libro mayor inmutable, bloqueo por cliente, recibos de compra idempotentes, entrega de beneficios restringida al personal, topes mediante índices únicos y fechas de Managua. La prioridad es unificar el contrato de beneficios y la transición de estados entre interfaz, API y operación. No encontré en estas pruebas un doble débito de la misma referencia ni entrega duplicada del mismo beneficio vigente.

## Evidencia y límites

- [Script reproducible](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_mi_club_2026-10-08/audit_tecnica.mjs>): 14 escenarios sobre PGlite en memoria, con datos sintéticos, Worker compilado desde el código actual y migraciones. Se utiliza el soporte existente `tests/soporte-perfiles-equipo.mjs`, sin archivos de secretos ni acceso a bases remotas. Compilaciones auxiliares en `.test-output/perfiles-equipo/<pid>`.
- [Resultados completos](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_mi_club_2026-10-08/evidencia_tecnica.json>): 14/14 escenarios verificados. Los códigos, UUID, nombres y saldos son sintéticos.
- Ejecutados también `node tests/operacion.mjs` y `node tests/regresion.mjs`: ambos finalizaron con código 0; el segundo registra 12 grupos correctos.
- PGlite se usó secuencialmente. No prueba concurrencia PostgreSQL con varias conexiones, latencia Neon, configuración de producción, fallos del cron real ni rendimientos bajo carga. Esas limitaciones se indican donde afectan la conclusión.
- No se cambió código productivo, no se publicaron cambios y no se ocuparon puertos.

Prioridades: P1 afecta el contrato principal de un beneficio pagado; P2 afecta fiabilidad, claridad operativa o soporte; P3 requiere una decisión comercial o una mejora de mantenimiento. No se asigna P0: no se confirmó una pérdida financiera crítica ni acceso no autorizado en el alcance probado.

## Hallazgos priorizados

### MC-T01 · P1 · Los límites del beneficio no significan lo mismo en /yo y en la entrega

**Confirmado por T03.** Una persona puede usar su bolsa, terminar su período y contratar una nueva membresía en el mismo mes. `/yo` agrega usos de **todas** sus membresías y devuelve `bolsaDelMes`, por lo que Mi Club deshabilita la acción. `/beneficios/solicitar` y la restricción de la base miran **la membresía vigente**, así que una llamada válida produce otro código y caja entrega otra bolsa. Se reprodujeron dos usos en `2026-10-01` y, simultáneamente, una interfaz alimentada por un estado de «ya retirada».

Evidencia: [index.ts:478](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:478>), [operacion.ts:97](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:97>), [003_correcciones.sql:60](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/db/003_correcciones.sql:60>), [Club.tsx:316](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:316>).

No se debe llamar a la segunda bolsa «fraude» sin resolver la regla comercial: la nueva membresía también se pagó. El fallo confirmado es la contradicción, que oculta un derecho o permite una entrega que la UI niega. Ocurre igualmente con el límite diario si el cambio de período y el reingreso caen en el mismo día.

**Mejora:** definir si la unidad es socio/mes calendario, membresía/mes calendario o período pagado. Crear una sola consulta de derechos que devuelva identificador del período, disponible, usado, siguiente disponibilidad y motivo; usarla en /yo, solicitud, caja e índices.

**Aceptación:** usar beneficio → vencer → reingresar en el mismo día/mes devuelve una misma decisión en todos los canales; ninguna caja puede exceder esa decisión. Cubrir también cambio de mes dentro de un período de 30 días.

### MC-T02 · P1 de producto · La ventaja de 48 horas no está representada en el sistema de experiencias

**Confirmado por T05 y revisión de esquema.** Una experiencia recién insertada con fecha futura aparece inmediatamente en el catálogo público y una cuenta sin membresía la compra. El esquema solo tiene fecha de realización, cupos y precio; no tiene publicación, apertura exclusiva ni apertura general. El endpoint comprueba fecha futura y saldo, sin membresía ni ventana exclusiva.

Evidencia: promesa en [Club.tsx:41](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:41>), catálogo [index.ts:399](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:399>), compra [index.ts:914](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:914>), esquema [001_schema.sql:169](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/db/001_schema.sql:169>).

La pantalla explica que esta ventaja la aplica el personal. Eso puede sostener una preventa manual externa, pero no existe evidencia en el repositorio de ese procedimiento ni un bloqueo digital que lo haga cumplir. No se afirma que la operación externa incumpla: se afirma que la app no garantiza lo prometido.

**Mejora:** definir `abre_miembros`, `abre_general`, estado publicado/cancelado y un derecho de acceso validado en servidor; o describir claramente una invitación manual con responsable y canal. No basta ocultar un botón.

**Aceptación:** a 47 horas de la apertura general, el no miembro recibe un estado de próxima apertura sin compra habilitada; el miembro compra. En la apertura general ambos acceden. El acceso directo al endpoint conserva la misma regla.

### MC-T03 · P2 · El beneficio depende de haber visitado /yo después del vencimiento

**Confirmado por T02.** Membresía que acaba de vencer, renovación autorizada y saldo suficiente: solicitar café devuelve 403 «No tenés una membresía vigente». Tras un GET /yo, la membresía renueva y el mismo beneficio devuelve 200. El cron es horario (`17 * * * *`), por lo que existe un intervalo entre vencimiento y mantenimiento.

Evidencia: [operacion.ts:90](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:90>), [index.ts:446](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:446>), [wrangler.jsonc:10](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/wrangler.jsonc:10>).

El flujo habitual al iniciar la app llama /yo, lo que reduce la frecuencia. No elimina el problema si la pantalla estaba abierta al vencer: el proveedor de datos no refresca por tiempo, foco o visibilidad.

**Mejora:** decidir y resolver la renovación dentro de una operación explícita, coherente y transaccional antes de evaluar el beneficio; o programar la renovación de forma que el derecho nunca dependa del orden de navegación. Devolver estados diferenciados: renovación en curso, saldo insuficiente, cancelada o vencida.

**Aceptación:** pedir beneficio justo antes/después del vencimiento y antes/después del cron tiene la misma respuesta contractual, independientemente de visitar Inicio o /yo. Una renovación solo debita una vez.

### MC-T04 · P2 · La consulta de cuenta cobra y el alta de otra persona ejecuta renovaciones globales

**Confirmado por T01 y T12.** GET /yo redujo un saldo sintético de 1.000.000 a 905.000 centavos; la segunda lectura no volvió a cobrar. Contratar la membresía de A también debitó 95.000 a B porque el alta ejecuta `mantenerMembresias` sobre todas las vencidas antes de su propia transacción.

Evidencia: [index.ts:446](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:446>), [index.ts:803](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:803>), [index.ts:1170](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:1170>).

Los débitos reproducidos **tenían consentimiento previo**: no son prueba de cobro no autorizado. El riesgo es de arquitectura y recuperación: una consulta mezcla lectura con dinero; el alta depende de que termine el lote de otros socios; y un fallo de un miembro puede afectar la sentencia global. La magnitud real del bloqueo no se midió. El límite de 8 segundos de `enTransaccion` no engloba el mantenimiento HTTP ejecutado antes.

**Mejora:** /yo debe devolver una proyección sin mutaciones. Ejecutar renovación explícita o por proceso con idempotencia, lote acotado y resultados por socio; separar la reclamación de plaza de cobrar a terceros. Mantener el índice único y el bloqueo por cliente.

**Aceptación:** repetir GET /yo no cambia membresías, libro, puntos ni auditoría. El error artificial en la renovación de B no impide que A consulte o compre. Un recibo identifica cada renovación y cada fallo.

El carácter de lectura de GET permite automatización, precarga y recuperación sin cambios de negocio esperados; véase [RFC 9110 §9.2.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.1). La recomendación es separar cobro del acceso al recurso; no se deriva de la RFC que todo efecto secundario técnico esté prohibido.

### MC-T05 · P2 · Vigencia del código comunicada de forma incorrecta y sin estado de expiración

**Confirmado por T09.** Al solicitar otra vez un código que aún vive, la API devuelve el mismo código y su vencimiento original. Se simuló un código con 30 segundos restantes: fue devuelto así, mientras la hoja muestra siempre «Vence en diez minutos». Además, la membresía o la ventana diaria/mensual pueden terminar antes del TTL nominal. El código de premio por sellos dura 90 segundos, pero la hoja solo conserva la cadena y descarta `vence`.

Evidencia: reutilización [operacion.ts:104](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:104>), validación de vencimiento [operacion.ts:117](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:117>), premio [index.ts:611](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:611>), hojas [Club.tsx:474](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:474>).

**Mejora:** responder `ahora_servidor`, `vence` efectivo y `estado`; mostrar hora de vencimiento y estado «Venció, generá otro» con acción. El vencimiento efectivo debe ser el menor entre TTL, fin de membresía y fin de ventana. Confirmar la entrega mediante refresco acotado mientras la hoja esté abierta.

**Aceptación:** abrir, cerrar y reabrir a los 9:30 muestra aproximadamente 30 segundos, nunca diez minutos nuevos. Al expirar se habilita regenerar; al entregar aparece entregado. El premio no desaparece si caduca su código.

### MC-T06 · P2 · La fecha cambia y el derecho cambia, pero la pantalla puede conservar el estado anterior

**Observación directa de código, sin prueba visual automatizada en esta subinvestigación.** `DatosProvider` refresca al montar, al cambiar sesión o cuando se lo piden acciones. No registra foco, reconexión, visibilidad ni cambio de día. Club interpreta `yo.bebidaDelDia` y `yo.bolsaDelMes` como booleanos. Una pantalla abierta después de un canje conserva «ya lo tomaste» al día siguiente hasta otro refresco; el estado de sellos tampoco refleja automáticamente lo que acaba de registrar caja.

Evidencia: [datos.tsx:403](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:403>), [datos.tsx:432](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:432>), [Club.tsx:335](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:335>).

**Mejora:** invalidar derechos en límites temporales indicados por servidor; refrescar al retomar foco/reconexión y tras entrega/canje; exponer actualización manual discreta y fecha de datos. Evitar un sondeo permanente de toda la cuenta si basta refrescar el derecho activo.

**Aceptación:** mantener Club abierto al cruzar 00:00 Managua y al cambiar de mes actualiza disponibilidad sin cerrar sesión. Tras registrar un sello en caja, retomar la app muestra el nuevo progreso. Simular desconexión no debe habilitar un derecho basándose solo en reloj local.

### MC-T07 · P2 · Los cambios de renovación pierden la trazabilidad de consentimiento y cancelación

**Confirmado por T07.** Cancelar y reactivar respondieron 200 y cambiaron la fila; se registraron cero eventos de auditoría y cero avisos al cliente. `renovacion_consentida` conserva un único timestamp que se sobrescribe al reactivar. La UI sí explica renovación, importe y falta de saldo; no falta toda comunicación ni todo consentimiento, falta historial duradero del cambio.

Evidencia: [index.ts:846](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:846>), [Club.tsx:487](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:487>), [Club.tsx:519](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:519>).

**Mejora:** registrar eventos append-only de activación/cancelación, fecha efectiva, importe, regla y versión de condiciones aceptadas, actor y referencia; crear comprobante/aviso. La auditoría debe estar en la misma transacción del cambio.

**Aceptación:** activar → cancelar → activar deja tres eventos ordenados; reintentar una solicitud no duplica ni reescribe la historia. El cliente puede consultar el último cambio y la fecha hasta la que conserva acceso.

### MC-T08 · P2 · Una entrada cedida no tiene comprobante visible para quien la recibe

**Confirmado por T06 sobre cesión sintética.** `asiento_experiencia.cedido_a` existe y caja determina el asistente con `COALESCE(cedido_a,socio_id)`. Pero `/compras` filtra por el comprador original; al destinatario no le devuelve la entrada. El comprador conserva un indicador de cedida. No se encontró endpoint operativo que registre la cesión: la promesa termina en «decinos a quién».

Evidencia: [operacion.ts:40](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:40>), [mostrador.ts:34](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/mostrador.ts:34>), [Club.tsx:505](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:505>).

No se afirmó que exista una cesión autoservicio: la reproducción cargó el campo de base para probar el estado que el propio modelo admite.

**Mejora:** separar comprador, titular actual y asistente; registro de transferencia por personal con auditoría; aviso y comprobante del receptor; invalidación del acceso anterior sin eliminar su recibo financiero.

**Aceptación:** A compra y cede a B: A ve el recibo marcado cedido; B ve entrada activa y su butaca; caja ve B; una tercera cuenta no ve datos; transferir después de asistencia devuelve conflicto.

### MC-T09 · P2 · Los espacios permiten acreditar dos sellos para un mismo ticket

**Confirmado por T10.** El API valida la longitud de `ticket.trim()` pero persiste `String(ticket)` sin normalizar. `auditoria-ticket-001` y ` auditoria-ticket-001 ` acreditaron sellos 1 y 2 al mismo socio. La interfaz envía el valor tal cual. La unicidad protege igualdad de bytes, no identidad del comprobante.

Evidencia: [index.ts:531](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:531>), [index.ts:545](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:545>), [CajaCliente.tsx:14](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/CajaCliente.tsx:14>).

Requiere personal autorizado; no es un ataque disponible al socio. El ticket repetido exacto en otro socio devuelve 200 con `nuevo:null`; la UI sí avisa que ya estaba registrado, aunque no diferencia cliente distinto, tanda completa ni reintento propio.

**Mejora:** normalizar y acotar la referencia antes de comparar/guardar, acordar mayúsculas y espacio con el POS y dar conflictos semánticos. Vincular al ticket comercial cuando exista integración.

**Aceptación:** la misma referencia con espacios externos produce un solo sello; intento con otro cliente devuelve conflicto verificable sin divulgar datos innecesarios. Reintentar en el mismo cliente devuelve el recibo original.

### MC-T10 · P2 condicionado · Colisiones de butaca pueden responder «se llenó» con otras libres

**Deducido del SQL y semántica PostgreSQL, no reproducido con conexiones concurrentes.** Dos compradores distintos bloquean sus respectivas filas de socio; ambos pueden elegir la misma primera butaca libre con `NOT EXISTS ... ORDER BY n LIMIT 1`. Uno inserta y el otro hace `ON CONFLICT DO NOTHING`; la segunda petición devuelve lleno sin intentar la siguiente. No hay bloqueo de la experiencia ni reintento. El índice único evita sobreventa, pero no garantiza aprovechar las otras butacas.

Evidencia: [index.ts:923](</C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:923>). PostgreSQL documenta que `ON CONFLICT DO NOTHING` puede omitir una inserción por una transacción cuyo resultado no era visible en el snapshot: [aislamiento de transacciones](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-READ-COMMITTED). Los bloqueos de filas afectan a las filas elegidas, no a toda la entidad de negocio: [bloqueos explícitos](https://www.postgresql.org/docs/current/explicit-locking.html).

**Mejora:** bloquear por experiencia con orden estable antes de asignar; o precrear butacas y reservar con `FOR UPDATE SKIP LOCKED`; o reintentar colisiones dentro de límites. Conservar idempotencia y cargo atómico.

**Aceptación pendiente en PostgreSQL real aislado:** 12 compradores con saldo y 12 butacas, 12 confirmaciones distintas y 12 cargos; comprador 13 recibe lleno. Incluir última butaca, fallo de red, cancelación de la transacción y repetición de referencia. No ejecutar este ensayo en producción.

## Decisiones comerciales y operativas que necesitan contrato explícito

1. **Una bolsa por mes calendario frente a cada 30 días pagados.** El cargo renueva por 30 días; la bolsa abre el día 1 de cada mes en Managua. Es una regla posible, pero puede conceder dos bolsas dentro de un solo período que cruce el mes. Documentarla o cambiar a períodos pagados. No se etiqueta como fallo financiero por sí sola.
2. **«Café por visita» frente a uno por día.** El código limita por día de Managua y la UI también dice «ya lo tomaste hoy». Aclarar una visita elegible por día, bebida y extras incluidos, horario y agotados. Una segunda visita legítima el mismo día no se distingue técnicamente.
3. **+500 puntos por volver a contratar.** T04 obtuvo 1.000 puntos de activación tras dos filas pagadas de membresía. El trigger premia por UUID de membresía; renovación continua del mismo registro no vuelve a dar 500. Definir si es bono una sola vez por persona o por reingreso. No supone dinero gratis porque cada nueva membresía se cobró.
4. **Falta de saldo.** T08 dejó la membresía vencida, sin aviso, y una recarga posterior no la reactivó. Esto coincide con el copy explícito de vencimiento sin deuda. Se recomienda recordatorio previo con saldo faltante, motivo de vencimiento, acceso sencillo a recarga y reingreso; no introducir gracia ni deuda sin decisión comercial.
5. **Beneficios manuales.** El 15 % y prioridad VIP dependen del personal. El cobro por líneas de `/cuenta/cobrar` no calcula el 15 % por membresía. Definir si aplica a compras en app, a caja o a ambas, y cómo se registra para medir margen y evitar cobros distintos.
6. **Lista de espera y liberación de experiencia.** La pantalla promete aviso en orden cuando alguien suelte lugar; no se encontró una entidad de lista de espera ni un estado de cancelación/reembolso en experiencia. No prometer una cola digital si se sostiene únicamente con anotaciones fuera de la app.
7. **Cantidad de entradas por cuenta.** No existe tope por comprador: quien tenga saldo puede comprar todas las butacas con referencias distintas. Puede ser correcto para grupos; si son eventos exclusivos, definir el límite antes de añadir controles. [OWASP API6](https://api-security.owasp.org/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/) recomienda evaluar conjuntamente el modelo de negocio y los límites del flujo; no implica que toda compra múltiple sea abuso.
8. **Entrega de bolsas y asistencia.** Las operaciones actuales son de marcar una vez; no ofrecen corrección operativa con motivo. Decidir devolución, corrección de una entrega mal marcada y cancelación por la casa, conservando historia.

## Controles correctos que deben conservarse

- **Autorización:** T11 devuelve 401 sin sesión y 403 si un socio intenta entregar beneficios. Middleware verifica cuenta activa; cocina está restringida a preparación. Los tests existentes cubren separación caja/cocina y revocación.
- **Dinero:** enteros en centavos; saldo derivado de asientos; trigger impide UPDATE/DELETE del libro; reintentos usan referencia de cliente y respuesta persistida dentro de la misma transacción. T11 conserva la misma butaca; T14 no debita saldo insuficiente.
- **Exclusividad:** índices únicos de membresía por número y socio; límite 1–100; índice único de beneficio por membresía/clase/ventana; butaca única. Son controles de integridad, aunque necesitan alinearse con la regla comercial.
- **Canje real:** solicitar un código no consume el derecho. Solo caja entrega. T11 admite primera entrega y rechaza segunda con 409. En sellos, el premio se consume al quemar el vale, no al mostrarlo; la regresión confirma que el noveno sello conserva el premio y que puede regenerarse.
- **Fechas:** T13 comprueba que `2026-10-09T01:00Z` sigue siendo 8 de octubre local y que `2026-11-01T01:00Z` sigue perteneciendo a octubre. Las ventanas se generan en la base con `America/Managua`.
- **Renovación:** consentimiento previo y saldo suficiente; sin saldo no hay deuda; no se cobran retrospectivamente períodos atrasados; referencia por período evita duplicar. T01 confirma que dos lecturas no generan dos renovaciones.
- **Aislamiento:** soporte y Worker separan demostración de base real; consultas y operación filtran muestras archivadas mediante vistas operativas. No se probó aquí la configuración remota efectiva.
- **Privacidad y soporte:** historial se filtra por sesión; solicitudes de atención tienen referencia idempotente y límite de frecuencia; las respuestas del personal quedan auditadas. `tests/operacion.mjs` pasa sus verificaciones.

## Matriz mínima de estados recomendada

| Dominio | Estados que la API debería distinguir | Acción principal |
|---|---|---|
| Membresía | sin membresía, activa con renovación, activa sin renovación, renovación pendiente, vencida por saldo, vencida por cancelación | Contratar, usar, cancelar, recargar o reingresar según caso |
| Beneficio | no elegible, disponible, código vigente, código vencido, entregado, próxima ventana | Una acción coherente y motivo verificable |
| Tanda | acumulando, premio disponible, código vigente, código vencido, premio entregado | Mostrar/generar código sin perder premio |
| Experiencia | próxima apertura, exclusiva para miembros, venta general, agotada, comprada, cedida, asistida, cancelada | Compra/transferencia/comprobante/atención |
| Entrega | pendiente, confirmada, corregida con motivo | El personal confirma el hecho; ajustes auditables |

Los derechos deben incorporar hora del servidor, límite efectivo y revisión/versión de estado. La interfaz los presenta; no debería reconstruir reglas distintas con booleanos históricos.

## Verificación posterior prioritaria

1. Resolver MC-T01 y MC-T02 antes de ampliar la venta del plan: cerrar el contrato comercial y hacerlo idéntico en cliente/caja/API.
2. Cubrir límites de tiempo: vencimiento a medianoche, mes nuevo, pérdida de conexión, regreso a foco y códigos próximos a expirar.
3. Separar lecturas y renovación; probar fallo por socio, recibos y cancelación coincidente con el cron.
4. Probar en PostgreSQL aislado concurrencia real de butacas, plazas, entrega y gasto. Los tests secuenciales no la certifican.
5. Instrumentar solicitudes/entregas por beneficio, códigos vencidos, rechazos por motivo, renovación exitosa/fallida y abandono entre mostrar código y entrega. Registrar tiempos del servidor; no incluir códigos activos ni datos personales innecesarios en logs.
6. Añadir estos bordes a una suite `mi-club`; no confiar solo en las regresiones existentes, que pasan aunque las discrepancias aquí descritas existan.

Fuentes primarias consultadas el 8 de octubre de 2026: RFC 9110, PostgreSQL 18 (aislamiento y bloqueos), OWASP API Security Top 10 2023 API6. Tres búsquedas temáticas y dos aperturas directas; ninguna recomendación depende de un blog comercial.
