# Error al abrir la cuenta — 22 de octubre de 2026

## Causa confirmada

Neon devuelve HTTP 402 al ejecutar incluso `SELECT 1` en las bases real y de demostración: `Your account or project has exceeded the quota. Upgrade your plan to increase limits.` El fallo ocurre antes de consultar los datos de la cuenta.

La API de gestión confirma el proyecto `club-lupita` (`polished-waterfall-53015854`) y el plan gratuito (`free` / `free_v3`). El contador aproximado del proyecto registra 397807 segundos de cómputo, unos 110,5 CU-horas. El límite publicado del plan Free es 100 CU-horas por proyecto/mes. El error de cuota y el exceso de cómputo son consistentes; el proveedor no identifica una métrica concreta dentro de su mensaje HTTP 402.

Los dos endpoints figuran suspendidos desde el 22 de octubre a las 16:22:46 y 16:26:31, hora de Managua. El período informado finaliza el 1 de noviembre a las 00:00 UTC, equivalente al **31 de octubre a las 18:00 en Managua**.

## Evidencia y alcance

- Se reprodujo el mensaje en la pestaña de Chrome del usuario mediante «Volver a intentar».
- Los registros remotos muestran HTTP 500 en `/api/yo`, `/api/perfil`, `/api/inicio/contexto`, `/api/cupos`, `/api/catalogo` y `/api/carta`.
- `/api/health` sigue devolviendo 200 porque sólo comprueba el Worker; no verifica la conexión a Neon. No debe usarse por sí solo como indicador de disponibilidad de la aplicación.
- La prueba directa de ambas conexiones devuelve HTTP 402 por cuota agotada. [Evidencia de base y endpoints](base.json).
- [Plan confirmado](plan.json) y [registro de errores sanitizado](servidor.jsonl). No se guardaron cookies, cabeceras de autenticación ni credenciales.
- La publicación previa pasó las comprobaciones a las 13:58; los endpoints registran la suspensión varias horas después. En esta revisión no se cambió código de producción ni configuración remota.

## Recuperación

Para recuperar el acceso antes del siguiente período, el titular debe ampliar el plan en la consola de Neon, revisando el cobro por consumo. No se contrató un plan ni se aumentaron límites de gasto durante esta revisión.

Si se conserva el plan gratuito, la renovación informada es el 31 de octubre a las 18:00 de Managua; la recuperación debe verificarse después, no darse por garantizada de antemano.

Después de restaurar la capacidad, conviene revisar tamaño de cómputo, suspensión por inactividad y uso de la demostración. Los endpoints reportan mínimo 1 CU y máximo 2 CU, por lo que hay margen para evaluar una configuración menor según la carga real. Optimizarlo no repone el consumo ya agotado.

También queda como mejora separar indisponibilidad de base de datos del error genérico de cuenta y disponer de una comprobación de disponibilidad que incluya la base. Ningún cambio de texto por sí solo restablecería el servicio.

Fuentes oficiales: [Planes de Neon](https://neon.com/docs/introduction/plans), [cuotas y suspensión](https://neon.com/docs/guides/consumption-limits).
