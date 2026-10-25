# Optimización de consumo: ejecutada y publicada

22 de octubre de 2026, 20:59 de Managua. Versión `78f403bb-85b6-46c2-b918-a9fcad8d2d49`, al 100 % en https://app.labellalupita.com. Build `principal-BEnDMr2V.js`.

## Qué causó el agotamiento

La evidencia principal está en [el diagnóstico completo](../auditoria-cuota-2026-10-22/INFORME.md). Los contadores aproximados del proyecto suman 110,50 CU-h: 60,52 en producción, 49,21 en demostración y 0,77 en otras ramas. El cron añadido el 7 de octubre despertaba las dos bases cada hora, cada una con mínimo 1 CU. Incluso usando sólo cinco minutos por despertar, ese patrón exige 120 CU-h en 30 días antes de contar clientes; el plan Free incluye 100. El rediseño visual publicado el 22 de octubre no inició ese patrón.

La reconstrucción encontró 693 encendidos coincidentes con el cron; sus ventanas representan aproximadamente el 80 % del tiempo reconstruido. No es atribución exacta de facturación. No se detectó evidencia de tráfico masivo ni de conexiones permanentemente abiertas. Las previews recientes usan PGlite local.

## Cambios aplicados

- **Capacidad:** producción, demostración y nuevos endpoints tienen mínimo 0,25 CU, máximo 2 CU y suspensión predeterminada. Cambios verificados mediante API de Neon sin encender las bases. No se modificaron datos, planes ni facturación.
- **Mantenimiento:** una instancia durable por entorno conserva la siguiente fecha de trabajo fuera de PostgreSQL. El cron conserva su hora y revisa únicamente producción. Si no hay trabajo, no consulta Neon. La reconciliación y limpieza se agrupan diariamente. Demostración se mantiene sólo al utilizarla.
- **Integridad:** antes de cada mutación relevante se guarda una intención durable. Si el proceso termina después de confirmar SQL y antes de avisar al programador, la intención pendiente permite recuperar la revisión. Una escritura concurrente no se pierde. Las renovaciones conservan su cadencia horaria; los correos conservan envío inmediato tras reservar y reintentos. Un fallo de membresía ya no impide intentar procesar correos. Los fallos de cuota aplican espera creciente de 1 a 6 horas.
- **Navegador:** Mi Club pasa de seis recursos cada 30 segundos a cuenta y club cada dos minutos mientras se usa. Inicio actualiza cuenta/contexto cada minuto; Carta cada dos. Las relecturas de navegación se suspenden tras dos minutos sin interacción y al ocultar la pestaña; se reanudan al volver. Se conservan actualizaciones manuales y posteriores a operaciones. El seguimiento de códigos de canje y las pantallas operativas del equipo mantienen su cadencia, porque responden a operaciones activas.
- **Control:** consulta al plano de gestión de Neon cada seis horas desde el cron, sin SQL; presupuesto total 100 CU-h, referencia interna 80 producción/10 demo/10 reserva, umbrales 60/80/90/100 y proyección aritmética del período. Los avisos quedan en los logs de Cloudflare (`alerta_cuota`), no son correos ni notificaciones externas. La consulta privada del propietario es `/api/personal/sistema/consumo`.
- **Disponibilidad:** `/api/health` sigue indicando salud del Worker; `/api/health/datos` informa el resultado guardado de la última comprobación de datos, con fecha, sin despertar la base. Un rechazo de cuota en una petición marca los datos como inaccesibles. El error genérico 500 pasa a 503 con mensaje de indisponibilidad y `Retry-After`.

## Validación

- 139 comprobaciones funcionales de la batería completa, incluidas compras, cuenta, membresías, reservas, correos, permisos e idempotencia.
- Pruebas específicas de 24 revisiones horarias: un acceso diario, 23 revisiones sin SQL; fecha de vencimiento, escritura concurrente, recuperación de intención interrumpida, reintento y umbrales.
- SQL de selección de pendientes y limpieza probado contra PostgreSQL en PGlite.
- Runtime Workers local real con SQLite durable y RPC: persistencia, señales, ausencia de SQL innecesario y acceso restringido.
- Navegador Edge: sólo `/api/yo` y `/api/club` durante la actualización activa; pausa/reanudación, Inicio/Carta/Perfil y ausencia de errores JavaScript. Captura `club-validado.png` con datos sintéticos.
- Compilación y ensayo de despliegue correctos. En producción: ocho rutas, hashes de 25 archivos JavaScript, cinco comprobaciones API, binding nuevo y secretos anteriores conservados. Entrega congelada de 505 archivos con manifiesto.

## Limitaciones vigentes

**La base no está restablecida.** A las 21:01 de Managua, `/api/catalogo` responde 503 por la cuota agotada y `/api/health/datos` declara `no_disponibles`. El contador sigue en 110,50 CU-h. Las optimizaciones no devuelven cuota. La fecha de cierre del período informada por Neon es el 31 de octubre a las 18:00 de Managua; habrá que verificar la disponibilidad entonces, o resolver capacidad con el proveedor antes. No se contrató un plan.

El mínimo 0,25 CU está confirmado en configuración, pero no se puede medir todavía su latencia y concurrencia reales: Neon bloquea SQL. Se mantiene máximo 2 CU para permitir escalado. Tampoco se presenta el ahorro aritmético como ahorro real ya medido. En ausencia de tareas, el piso ideal del mantenimiento pasa de dos bases cada hora a una base una vez al día: aproximadamente 0,63 CU-h en 30 días a 0,25 CU y cinco minutos, sin incluir usuarios, correos, renovaciones ni demostraciones activas.

La credencial de organización existente no puede emitir una clave de proyecto: Neon exige una clave personal para esa operación y respondió 404 explícito. El monitor reutiliza la credencial existente como secreto de Cloudflare y su código sólo realiza GET contra este proyecto fijo. No se amplían permisos. Se documenta este alcance; no se la presenta como credencial de sólo lectura o restringida al proyecto. El cálculo contra la API real está verificado; la primera ejecución periódica del monitor en esta nueva versión corresponde al siguiente cron.

## Reversión y seguimiento técnico

`base.json` conserva la configuración previa. `antes/` conserva las fuentes previas; `release/` la entrega actual. Los datos de clientes no tuvieron migraciones. La migración `mantenimiento-v1` crea únicamente almacenamiento de coordinación en Cloudflare. No borrar ese namespace para revertir una interfaz; las versiones sin la clase durable pueden requerir redesplegar una entrega compatible en vez de un rollback directo.

Para revertir capacidad, actualizar los dos endpoints y los valores predeterminados a los números de `base.json` (antes: 1–2 CU, suspensión 0). Para un problema visual, reconstruir la interfaz anterior conservando el servidor y el binding actuales. Para un problema del programador, preparar una entrega compatible que restaure temporalmente el mantenimiento horario sólo de producción; conservar la clase exportada y el namespace para evitar pérdida de estado. Ensayar y verificar antes de publicar.

Cuando se recupere SQL: comprobar carga representativa con 0,25 CU, latencia y escalado; comparar deltas de CU-segundos/tiempo activo por rama durante un intervalo conocido, sin mezclar consumo anterior. No se creó un seguimiento automático en Codex ni se promete una notificación futura fuera del monitor de la aplicación.

Evidencia: `capacidad-aplicada.json`, `cuota-verificada.json`, `regresion.log`, `consumo.log`, `runtime.log`, `navegador.json`, `MANIFIESTO.json`, `publicacion.json` y `verificacion.json`.
