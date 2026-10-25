# Resultado de la ejecución de Perfil

9 de octubre de 2026 · La Bella Lupita

La implementación técnica prevista de Perfil está realizada y publicada. Versión final: `90fdd96e-4cee-465d-b93a-8059e07ef24e`, al 100 %. La pantalla permite editar sin depender del catálogo, protege los datos frente a borradores antiguos, muestra identidad y preferencias reales y ofrece ayuda de cuenta restringida por rol. Se preservaron los cambios posteriores de Inicio, Carta, Tienda y Mi Club.

**El objetivo integral está bloqueado por dependencias externas y no está completado:** faltan las validaciones con personas y las decisiones operativas indicadas más abajo. No se considera que pasar pruebas automáticas certifique accesibilidad completa ni un proceso alimentario o de privacidad.

## Cambios efectivos

- Lectura propia `GET /api/perfil`, respuesta canónica al guardar y versión protegida también frente a modificaciones del directorio. Un conflicto devuelve 409; una aplicación antigua sin versión recibe 428. Los conflictos se concilian campo a campo, sin sustituir cambios ajenos silenciosamente.
- El editor conserva el borrador al cerrar el panel. Una operación pendiente sigue visible al reabrir; una respuesta perdida se consulta antes de repetir. Una lectura iniciada antes del guardado no restaura el nombre anterior. El borrador vive en memoria mientras se permanece en Perfil; no se guarda información sensible en almacenamiento persistente.
- Edición antes de promociones, nombres completos que refluyen, correo/estado de verificación/teléfono, cumpleaños con día y mes, preferencia real de promociones por correo, propósito de campos y visibilidad para el equipo. Quitar cumpleaños elimina también el año anterior; la migración inicial conserva la fecha histórica para no destruir datos silenciosamente.
- Solicitudes con categoría, seguimiento y respuesta. Acceso, cuenta y privacidad son de propietario/encargado; caja no recibe su contenido. Estas solicitudes no cambian por sí solas identidad, saldos o membresías.
- Se conservó la transmisión de restricciones por pedido ya incorporada en Carta. Se añadió un reconocimiento obligatorio antes de preparar y un registro del responsable sin copiar el texto de la alergia al log. Editar Perfil no modifica la instantánea de un pedido anterior.
- Se conservó la cookie protegida de Inicio. El cliente puede cerrar este dispositivo o todos; el cierre total invalida también credenciales firmadas anteriores. Sin red se ocultan los datos localmente, se conserva un indicador sin credencial y se confirma la revocación al reconectar. Si el navegador no permite guardar ese bloqueo, se informa que no se pudo completar la salida.
- Saldo, movimientos, puntos y membresía se distinguen; las condiciones enlazan a Mi Club. Las fechas comerciales se muestran en Managua.
- Validación compartida de Unicode, campos y cumpleaños; recuperación de respuestas corruptas; estados estables y errores asociados. Auditoría solo de campos cambiados, versión y correlación; reenvíos sin cambios no crean una edición sustantiva. Logs de lectura/guardado/recuperación, código de estado y duración, sin valores personales.
- Medición del cliente desde que inicia guardar/recuperar hasta que el resultado está aplicado al DOM y transcurre un ciclo adicional de render. Distingue confirmación, conflicto, incertidumbre, revisión y error. Envía solo resultado, duración y clase de dispositivo; respeta DNT/GPC, excluye pestañas ocultas y duraciones fuera de rango. El servidor valida una lista cerrada, limita frecuencia y escribe eventos estructurados sin contenido del formulario. El envío auxiliar no bloquea el guardado. Es una aproximación técnica a la confirmación visible, no una medida de percepción humana.
- Ocho lecturas comerciales de `/yo` se agrupan en una transacción HTTP de solo lectura; Perfil conserva su consulta independiente. En el fixture con bearer se instrumentaron 3 sentencias para Perfil frente a 11 para la cuenta completa. Son sentencias SQL, no una medición de latencia ni P95 de producción.
- Compatibilidad del Worker actualizada a 2026-10-01, soportada por el workerd instalado; tipos regenerados y utilizados por TypeScript.

## Comprobación

| Comprobación | Resultado y límite |
|---|---|
| Suite general | 16 suites de servidor aprobadas, incluida Perfil; conserva contabilidad, membresías, tienda, carta y permisos |
| Perfil, servidor | 9 grupos: versiones, no-op, Unicode, contrato, privacidad, restricciones y revocación |
| Concurrencia PostgreSQL real | Cuatro conexiones guardan la misma versión: un éxito y tres conflictos; modificación del equipo bajo bloqueo preservada |
| Navegadores | 10 recorridos en cada uno de Edge, Firefox y WebKit; sin errores de render. Los informes individuales contienen los casos exactos |
| Fecha comercial | Tres instantes, incluido el caso original y ambos lados de medianoche, en Madrid/Managua/Honolulu: resumen e historial conservan el mismo día de Managua |
| Medición de confirmación | Contrato, permisos, DNT/GPC y frecuencia verificados en servidor; navegador verifica demora controlada, conflicto, recuperación, ausencia de datos del formulario y que un 503 de telemetría no afecte el guardado |
| Accesibilidad automática | Axe sin violaciones en el editor comprobado; reflujo a 320/390/768/1440 y aumento efectivo del texto al 200 % |
| Integración de interfaz | Inicio y operación de Carta aprobados después de los cambios compartidos |
| Runtime | Worker ejecutado en workerd, SQL en base sintética por puente HTTP: cookies, CSRF, edición, conflicto, cuenta agrupada, salida y CSP |
| Build | TypeScript, guardianes visuales y build correctos; despliegue en seco correcto |
| Migración | 026 aditiva, repetible; respaldos privados de ambas bases restaurados exactamente antes de aplicar; integridad anterior verificada en la transacción remota |
| Publicación | Versión al 100 %, HTML y los 18 activos JS/CSS cotejados por SHA-256; endpoints privados sin sesión devuelven 401 y no permiten caché |

Las pruebas de escrituras usaron clientes sintéticos en PGlite o un esquema exclusivo de capacitación en PostgreSQL, eliminado al terminar. No se crearon clientes, pedidos ni compras de prueba en producción. Los respaldos contienen información privada y permanecen fuera del informe, en archivos `.local`.

## Matriz de cierre

| ID | Estado | Resolución / condición restante |
|---|---|---|
| F01 | Técnico verificado | Versionado, conciliación, prueba concurrente real y respuestas demoradas/perdidas |
| F02 | Técnico verificado | Sesión actual/todas, bearer anterior revocado, salida local pendiente y reconexión |
| F03 | Pendiente validación presencial | Instantánea y acuse implementados; caja/cocina deben ensayar el procedimiento |
| F04 | Técnico verificado | Nombre válido de 80 caracteres sin desplazamiento horizontal |
| F05 | Técnico verificado | Perfil abre/guarda con cuenta, catálogo y cupos fallidos; aplica respuesta confirmada |
| F06 | Técnico verificado | Borrador conservado al cerrar; foco restaurado; aviso de alcance y navegación externa |
| F07 | Técnico verificado | Editar antes de nivel e invitación; comprobación móvil |
| F08 | Pendiente cierre operativo | Identidad visible y solicitud privada real; acordar verificación y gestión del cambio de contacto |
| F09 | Técnico verificado | Preferencia real revocable; acceso separado de publicidad. No se inspeccionaron campañas externas |
| F10 | Pendiente política operativa | Transparencia, minimización de captura y solicitudes de datos/baja; falta responsable nominal, entrega privada y conservación aprobadas |
| F11 | Pendiente validación con clientes | Saldo, nivel y membresía separados; enlaces a reglas actuales; falta comprobar comprensión con personas |
| F12 | Técnico verificado | Ayuda directa, categorías, permisos y seguimiento |
| F13 | Técnico verificado | Resumen y actividad usan Managua; nueve combinaciones de instante/zona confirman el día comercial |
| F14 | Pendiente lector/dispositivo real | Teclado, errores, Axe, texto 200 % y reflujo aprobados; falta NVDA/VoiceOver y teclado virtual físico |
| F15 | Técnico verificado | Contrato de Perfil completo y validación de los campos personales consumidos por `/yo`; última lectura válida conservada |
| F16 | Técnico verificado | Lectura independiente y viajes HTTP agrupados; no se afirma P95 de clientes reales |
| F17 | Técnico verificado | Diferencias, versión y correlación; logs sin contenido personal, no-op sin edición duplicada y medición de confirmación/recuperación en cliente |
| F18 | Técnico verificado | Copy, Unicode compartido, fecha comercial, total no fijo, comentarios y compatibilidad |

13 asuntos cerrados técnicamente y 5 con implementación entregada pero validación o definición externa pendiente. Se solicitó al usuario quién puede participar en caja/cocina y con lector de pantalla, y quién gestiona identidad/privacidad con qué procedimiento. No se recibió todavía esa información. No hay un rechazo de permisos ni un bloqueo automático de publicación.

La revisión por requisito detectó y completó la medición del cliente que faltaba en F17. Su caso sintético registró 280 ms con una demora impuesta de 250 ms; este dato demuestra que el intervalo incluye la espera de red y no estima latencia de producción ni P95. Las 16 suites generales, los tres navegadores, workerd y el despliegue en seco se comprobaron después de ese cambio. La nueva publicación no requirió otra migración.

## Evidencia y continuidad

- [Plan ejecutado](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/PLAN.md>).
- [Pruebas de servidor](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/backend.json>), [concurrencia real](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/postgres.json>), [runtime](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/runtime.json>).
- [Edge](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/edge/ui.json>), [Firefox](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/firefox/ui.json>), [WebKit](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/webkit/ui.json>).
- [Fecha comercial en tres zonas](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/fechas.json>), [medición en servidor](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/medicion-servidor.json>), [medición en navegador](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/medicion-navegador.json>).
- [Respaldo y restauración](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/respaldos.json>), [versión publicada](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/publicacion.json>), [verificación pública](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/evidencias/publicacion-verificada.json>).
- [Procedimientos y acta de validación pendiente](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/mejoras-perfil-2026-10-09/VALIDACION-PRESENCIAL.md>).

No revertir las migraciones ni restaurar una base antigua como forma de deshacer esta interfaz: se conservaron fuentes previas y respaldos para recuperación controlada. Un retorno a código anterior al cierre total perdería la comprobación de las credenciales revocadas; preferir una corrección hacia adelante y verificar revocación antes de cualquier recuperación.
