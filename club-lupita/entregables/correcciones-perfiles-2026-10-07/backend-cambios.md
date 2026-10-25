# Correcciones de servidor y verificación

**Actualización de release:** la publicación se preparó en `.test-output/release-perfiles` con la autenticación vigente anterior a 020, para conservar el trabajo pausado del otro chat. Sus resultados son **10 suites de npm test, 10/10 grupos de correcciones y 11/11 grupos API (132 lecturas/60 denegaciones)**. El contrato efectivo de alta es clave temporal de 24 h y cambio obligatorio; no se publica aquí invitación, MFA ni migración 020. Ver `RELEASE-BACKEND.md` y evidencia con prefijo `release-`.

## Histórico de integración del árbol de trabajo concurrente

Resultado local del 7 de octubre de 2026 (03:07 UTC del día 8): **12 de 12 grupos pasan** con el Worker actual, PGlite, migración 020 y sesiones reales de la API nueva. Evidencia: `evidencia/correcciones-servidor.json`. Las observaciones de transición se documentan separadamente; este resultado no certifica despliegue ni conservación de credenciales durante una migración remota.

| Tarea | Implementación | Verificación preparada | Estado |
|---|---|---|---|
| B01 / T09 | `membresias.ts` proyecta las plazas que conservará el mantenimiento: vigentes/gracia vigente o renovación consentida con saldo y socio activo. `/api/cupos` y `/api/operacion/resumen` comparten la proyección. No modifica membresías ni dinero al leer. | Diez combinaciones de vigencia, gracia, consentimiento, insuficiencia de saldo y baja; snapshot de asientos/puntos/membresías antes/después; consistencia tras mantenimiento. | Pasa. |
| B02 / T10 | `validacion.ts` comprueba calendario real y año >= 1. Ocupación devuelve 422 antes de SQL; fecha predeterminada usa Managua. Filtros de listas reutilizan regla. | Nueve fechas inválidas; bisiestos, años 0001/9999, formato y día local. | Pasa. |
| B03 / T11 | Avisos aceptan solo representación decimal positiva canónica dentro de bigint PostgreSQL. | Cero/signo/decimales/letras/overflow; límite máximo; propio/ajeno. | Pasa. |
| B04 / T12 | Validador de nombre cuenta puntos de código Unicode y rechaza C0/C1, NUL, surrogates aislados y controles de dirección/salto de línea. El coordinador lo integró en el **activo** `acceso-equipo.ts`. | Nueve nombres inválidos rechazados sin insertarse; acentos, ideogramas, emoji y 80 caracteres no BMP conservados; Cliente no puede crear Personal. Bootstrap también funciona. | Pasa. |
| O03 | Scheduled mantiene real y demo mediante `Promise.allSettled`, objetos env separados y logs estructurados sin URL ni mensaje SQL. Un fallo no evita el otro trabajo. Falta de demo configurada produce fallo explícito. | Ambas bases, idempotencia, fallos de cada una, base ausente, immutabilidad env y sanitización de logs. | Pasa. |
| O03 aislamiento | Compara host sin sufijo `-pooler`, puerto y pathname; ignora credenciales/parámetros. Rechaza demo que apunte a real, tras mantener real una vez. | Alias pooler y distinto usuario/query: una llamada SQL, éxito real/error demo y fallo global. | Pasa. |
| O04 | La autenticación concurrente adoptó **invitación de 24 h y contraseña elegida por el empleado**; propietario no recibe contraseña inicial. | Invitación no autentica como contraseña; uso único/caducidad, activación por API, revocación, MFA real obligatorio para Encargado, auditoría sin secretos. Alta nueva no modifica empleados ya activados. | Pasa para altas nuevas/cuentas ya activadas. Transición 020 pendiente de resolución explícita. |
| O05 | `pedido-publico.ts` aplica lista positiva de campos de preparación; ambas bandejas Cocina omiten total/precio/contacto/motivo libre. Otros perfiles conservan payload. | Ambas rutas, campos extra persistidos, conservación de precios para resto, estados y permisos. | Pasa. |
| Coexistencia | Cookie personal se selecciona con `x-equipo-solicitud: 1`. | Bearer de Cliente con cookie Personal y sin cabecera conserva Cliente; con cabecera obtiene Personal. | Pasa; no hay defecto demostrado en ese contrato. |

## Pruebas y coordinación

`node tests/correcciones-servidor.mjs` dio exit 0 y **12/12**. Guarda JSON en `evidencia/correcciones-servidor.json`. `SERVER_CASE_FILTER` permite ejecutar únicamente grupos seleccionados y registra los otros como `OMITIDA`, sin presentarlos aprobados.

`tests/soporte-perfiles-equipo.mjs` compila el Worker actual una vez por proceso en `.test-output/perfiles-equipo/<pid>`. Cada `preparar` crea una base PGlite independiente y aplica hasta 020. No usa rutas retiradas, bypass ni datos reales. `request(path,body,auth,opciones)` interpreta string como Bearer de Cliente, `{cookie,csrf}` como Personal y `null` como Invitado. Devuelve la autenticación emitida sin modificar el objeto anterior. `crearPropietario` realiza bootstrap y TOTP real; `crearEmpleado` realiza invitación, activación y TOTP cuando corresponde. `antesMigracionEquipo` permite ensayar registros anteriores a 020. El socio sintético usa teléfono normal `50587442006`.

El helper histórico `tests/personal-fixture.mjs` corresponde a la API anterior y no se utiliza en estas pruebas. Los cambios anteriores en `personal.ts` tampoco constituyen la implementación efectiva: ese módulo dejó de registrarse cuando el otro chat introdujo `acceso-equipo.ts`. No se revirtieron los cambios concurrentes.

## Observaciones de integración pendientes

Se ejecutó `node tests/perfiles-equipo-integracion.mjs`, que registra observaciones en `evidencia/equipo-integracion.json`. Su exit 0 significa que el diagnóstico terminó, no que entradas HTTP 500 cumplan la aceptación. Detalle para la tarea concurrente: `COORDINACION-ACCESO-EQUIPO.md`.

1. `db/020_acceso_equipo.sql:6` cambia `requiere_cambio` de false a true para cuentas previas con `clave_cambiada IS NULL`. El login pasa a fase `clave`. La invariante 6 y O04 prometen conservar claves vigentes; falta resolver ese cambio con la tarea concurrente antes de publicar. Cuentas previas con cambio registrado conservan fase completa.
2. Hashes históricos dependen de `SESION_SECRETO`. Si `PERSONAL_CREDENCIAL_SECRETO` difiere, una contraseña histórica válida devuelve 401; conservar el valor histórico permite 200. Es una condición de transición reproducida localmente, no evidencia de pérdida de accesos remotos.
3. Login correcto con `dispositivo` numérico, objeto o string NUL devuelve 500. Debe validarse antes de crear la sesión. No se registraron parámetros de sesión en evidencia.

El coordinador gestiona configuración de cron, runtime Workers, matriz de permisos, Neon aislado y publicación. Este documento no atribuye a las pruebas locales resultados externos no ejecutados.
