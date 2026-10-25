# Backend del release aislado de correcciones

Preparado en `.test-output/release-perfiles`; **10 suites existentes, 10/10 grupos de correcciones y 11/11 grupos de matriz API aprobados** el 7 de octubre de 2026. La matriz conserva 132 lecturas y 60 escrituras denegadas. Las pruebas usaron exclusivamente bases PGlite locales y datos sintéticos. El coordinador registra por separado los resultados de Workers, Neon, UI y publicación.

## Contrato efectivo

Se conserva autenticación publicada previa a 020. Los nuevos empleados reciben una clave aleatoria temporal de 24 horas y deben cambiarla por API antes de operar. El alta devuelve `{id, usuario, clave, vence}`. `/api/personal/yo` conserva para el propietario `id='propietario'` y `permiso='encargado'`. No se cambia la clave ni el estado de empleados existentes.

El release incluye B01-B04, O03 y O05: cupos y ambos resúmenes administrativos coherentes sin cargos al leer; calendario/bigint/nombres validados; mantenimiento real/demo independiente con rechazo de alias de la misma base; campos mínimos para Cocina en ambas bandejas. Conserva cabeceras de seguridad.

El árbol principal contiene el trabajo de autenticación de otro chat. No se modificó para esta separación. `acceso-equipo.ts` y `equipo-sesion.ts` quedaron fuera de `src` **solo en el release**, bajo `.excluded/worker`. La migración 020 no se ejecutó en estas pruebas ni forma parte de los cambios requeridos para este release. Los resultados anteriores con cookies/MFA/invitaciones se conservan como históricos, con evidencia independiente.

## Construcción y alcance de archivos

`scripts/preparar-release-perfiles-backend.mjs` exige el destino exacto `.test-output/release-perfiles`, previamente creado. Verifica rutas reales y ancestros antes de cada escritura/movimiento; restaura siete módulos desde el respaldo y reaplica las correcciones en esa copia. No ejecuta SQL ni despliega. Comprueba huellas del árbol principal al terminar.

Restaurados del respaldo: `index.ts`, `credenciales.ts`, `sesion.ts`, `clientes.ts`, `mostrador.ts`, `personal.ts`, `seguridad-personal.ts`. En `index.ts` se reponen cabeceras, disponibilidad efectiva de `/api/cupos` y `/api/panel`, calendario de ocupación y scheduled actual. En `personal.ts` se reponen B04/O04.

Conservados de la corrección actual: `cabeceras.ts`, `membresias.ts`, `validacion.ts`, `pedido-publico.ts`, `operacion.ts` y `panel.ts`. Los dos últimos no importan la autenticación 020. `panel.ts` mantiene compatibilidad del propietario anterior y añade la disponibilidad coherente a `/api/operacion/resumen`.

Inventario de diferencias original/actual y hashes de preparación: `evidencia/release-backend-manifest.json`. El inventario se generó antes de modificar la copia, no por inferencia. **La huella de `index.ts` de ese manifiesto precede al tratamiento de contención añadido por el coordinador.** El manifiesto global final del coordinador es la referencia de integridad del artefacto publicado; no usar este manifiesto intermedio como firma del release definitivo.

## Adaptación explícita de pruebas

`completarAlta` ejecuta login temporal, verifica bloqueo operativo, cambia la clave, comprueba revocación y vuelve a autenticar. Se utilizó en operación, panel, clientes/equipo y seguridad. Las versiones esperadas aumentaron por ese primer cambio real; no se fabricaron tokens de empleados ni se ocultó el cambio dentro de `request`.

La prueba larga de seguridad agotó inicialmente la cuota de login debido al paso adicional de preparación. Se inició explícitamente una ventana nueva después de completar las altas en la base sintética. El escenario de límite mantiene ocho intentos rechazados y el noveno HTTP 429. Ningún límite del servidor se modificó. La ejecución final completa pasó.

`correcciones-servidor.mjs` del release contiene diez grupos. Los dos exclusivos de MFA/cookies de la autenticación pausada no corresponden a este contrato; fueron sustituidos por la preparación anterior. Se comprueba expresamente una cuenta histórica con hash HMAC y sin cambio registrado: crear otra alta temporal no altera su fila ni impide operar. También se verifica el resumen `/api/panel` heredado, además de `/api/operacion/resumen`.

Los fixtures adaptados se conservan en `release-tests-backend/` para reproducir el release sin depender del contenido futuro del árbol compartido. El fixture `soporte.mjs` del coordinador usa namespace por PID y exporta `firmar`/`huella`, evitando imports a bundles compartidos. `soporte-correcciones-servidor.mjs` agrega bases separadas y preparación explícita del alta.

## Evidencia final

- `logs/release-npm-test-final.txt`: npm test completo, exit 0; diez suites existentes.
- `logs/release-correcciones-servidor.txt` y `evidencia/release-correcciones-servidor.json`: diez grupos aprobados, cero fallos/omitidos.
- `logs/release-perfiles-api.txt` y `evidencia/release-perfiles-api.json`: once grupos aprobados; 132 lecturas y 60 denegaciones.
- `logs/release-npm-test.txt`: conserva el primer fallo de preparación por límite de login. `release-seguridad-personal.txt` documenta el retest específico; la ejecución completa final confirma el cierre.

No hay defecto de backend abierto en este alcance local. Las observaciones de la autenticación 020 permanecen documentadas en `COORDINACION-ACCESO-EQUIPO.md` para la tarea pausada; no se afirman corregidas ni publicadas aquí.

## Contención comprobada en Neon y cambio posterior

Después de las pruebas PGlite anteriores, el coordinador reprodujo contención concurrente en su rama Neon aislada: el límite de sentencia de ocho segundos devolvía PostgreSQL `57014`, presentado como HTTP 500. Conservó el límite y añadió en `enTransaccion` una respuesta recuperable **503 con `Retry-After: 2`** para `57014` y `55P03`, indicando repetir con la misma referencia.

El coordinador informa `tests/contencion-pagos.mjs` del release aprobado (2/2) y el tercer ciclo Neon aprobado (4 grupos), con respuestas 503 registradas y reintentos con la misma referencia que producen un solo cargo y saldo final cero. Los dos primeros ciclos Neon se conservan como evidencia del fallo inicial. Esas pruebas de contención e integración posteriores complementan las diez suites y matrices locales; no se presenta una repetición inexistente de todas las suites tras este último ajuste.

El cambio vive en el `index.ts` del release aislado. Cuando se retome la autenticación del otro chat, integrar de forma selectiva este tratamiento de contención en el árbol compartido, conservando las correcciones B01-B04/O03/O05 y las cabeceras. No recrear el release final ejecutando únicamente el script inicial de preparación: ese script y su manifiesto corresponden al estado anterior al ajuste del coordinador.
