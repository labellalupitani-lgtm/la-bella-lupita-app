# Por qué se agotó la cuota de Neon

La Bella Lupita · diagnóstico del 22 de octubre de 2026, hora de Managua. Investigación de lectura: sin cambios de configuración, contratación de planes, nuevas bases, migraciones ni consultas SQL a datos de clientes.

## Conclusión

La principal causa es la combinación de **mantenimiento automático cada hora sobre dos bases** y **mínimo de 1 unidad de cómputo por base**. Cada ejecución despierta producción y demostración, aunque no haya clientes ni trabajo pendiente. Las consultas terminan en segundos, pero los servidores permanecen encendidos varios minutos. Ese tiempo también consume cuota.

El patrón es anterior al rediseño publicado el 22 de octubre. La revisión del 7 de octubre incorporó el cron para resolver mantenimiento de membresías. La documentación de aquel cambio confirma que previamente no había cron remoto. Faltó evaluar su costo recurrente dentro de la cuota gratuita y evitar mantener la demostración con la misma cadencia que producción.

Ampliar el plan puede restablecer disponibilidad, pero la recomendación anterior de hacerlo era incompleta: existe consumo evitable que conviene corregir.

## 1. Consumo por entorno: contadores de Neon

| Entorno | CU-horas aproximadas | Parte del total |
|---|---:|---:|
| Producción, rama `main` | 60,52 | 54,77 % |
| `demostracion-aislada` | 49,21 | 44,54 % |
| Resto del proyecto / ramas temporales | 0,77 | 0,69 % |
| **Proyecto** | **110,50** | **100 %** |

La diferencia de 0,77 horas corresponde al total del proyecto menos los contadores de las ramas conservadas; la reconstrucción de siete sesiones temporales da también aproximadamente 0,77 horas. Las ramas de respaldo conservadas registran cero cómputo en el período y no tienen servidores propios activos.

Los contadores son aproximados, no una factura. Neon señala expresamente que `compute_time_seconds` y `active_time_seconds` no son datos de facturación. La API de historial de consumo v2 devolvió 403 porque requiere un plan de pago; no se amplió el plan para acceder a ella.

Fuente: [inventario de proyecto, endpoints y ramas](inventario.json), [respuesta del historial](historial-consumo.json), [esquema oficial consultado](https://neon.com/api_spec/release/v2.json).

## 2. El gasto fijo que produce el cron

La configuración `17 * * * *` ejecuta mantenimiento cada hora al minuto 17. `mantenerEntornos()` incluye producción y también demostración cuando existe su conexión. Ambas viven en el mismo proyecto y comparten la cuota.

En cada entorno se invoca mantenimiento de membresías y se limpian sesiones y métricas; en producción se procesa además la cola de correos de reservas. La versión actual genera aproximadamente 25 subpeticiones por ejecución normal. La comprobación de si hay trabajo sucede dentro de PostgreSQL, por lo que la base ya fue despertada aunque no haya nada que actualizar.

La cuota mide **capacidad reservada × tiempo encendido**, no cantidad de clientes ni duración exclusiva del SQL. Con ambas bases dormidas entre ejecuciones, incluso un cálculo ideal de cinco minutos por despertar produce:

`2 bases × 24 despertares/día × 5/60 horas × 1 CU = 4 CU-horas/día`

Eso equivale a **120 CU-horas en 30 días**, antes de añadir uso interactivo. Ya supera las 100 CU-horas del plan gratuito. En los registros reales muchas ventanas duran entre cinco y diez minutos, así que el consumo observado en días tranquilos es mayor: alrededor de seis a siete horas acumuladas entre ambas bases.

Referencias de código:

- [Cadencia del cron](../../wrangler.jsonc), campo `triggers.crons`.
- [Mantenimiento de ambos entornos](../../src/worker/index.ts), `mantenerEntornos`, líneas 1055–1094.
- [Procesador de correos](../../src/worker/reservas-correo.ts), que evita enviar correo desde demostración.
- [Registro del cambio del 7 de octubre](../correcciones-perfiles-2026-10-07/COORDINACION.md), punto 5.
- [Publicación original](../correcciones-perfiles-2026-10-07/CIERRE.md), 7 de octubre a las 21:26 de Managua.

## 3. Comprobación histórica, no sólo una hipótesis de código

Se descargaron 1.837 registros de operaciones de Neon y se reconstruyeron 802 intervalos completos de encendido/suspensión dentro del período. Se cruzaron con las métricas por hora y minuto del Worker `club-lupita` en Cloudflare.

- **693 encendidos** ocurrieron en el minuto 17 después de publicarse el cron.
- Esas ventanas acumulan aproximadamente **91,12 horas**, alrededor del **80 % del tiempo encendido reconstruido**.
- Un subconjunto especialmente claro acumula **78,23 horas**: ventanas iniciadas en el minuto 17 en horas donde Cloudflare registró una sola invocación del Worker.
- Las primeras ejecuciones regulares aparecen el **7 de octubre a las 22:17 de Managua**, con la versión `144530db-b68b-4f0a-b3a3-b45ce04ca034`, publicada una hora antes.
- El patrón se mantiene durante los días siguientes y atraviesa varias publicaciones. No comenzó con la publicación visual del 22 de octubre.

Ejemplos por día, en **hora de Managua**:

| Día de octubre | Invocaciones totales del Worker | Compatibles con cron¹ | Horas encendidas de ambas bases² |
|---|---:|---:|---:|
| 11 | 26 | 24 | 6,71 |
| 16 | 31 | 24 | 6,08 |
| 17 | 23 | 23 | 6,59 |
| 18 | 32 | 24 | 6,25 |
| 19 | 26 | 23 | 6,65 |
| 20 | 25 | 23 | 6,53 |

¹ Agregados al minuto 17, sin duración HTTP, con el cron configurado y su patrón de subpeticiones. La API analítica consultada no devuelve un campo de tipo de evento; la atribución se sustenta en ese cruce con el código, horarios, versión y encendidos. El muestreo/agregación y las coincidencias con otras peticiones pueden omitir o mezclar ejecuciones; 23 no prueba que el cron esté configurado para sólo 23 horas.

² Intervalos entre operaciones de arranque terminado y suspensión iniciada; no son CU-horas facturadas. El total reconstruido es 113,38 horas frente a las 110,51 horas activas del contador de Neon: diferencia aproximada del 2,6 %. No se equipara la reconstrucción con el contador ni se atribuye una factura exacta al cron. Tampoco puede excluirse una conexión SQL directa durante alguna de esas ventanas. La repetición horaria y los días casi exclusivamente automáticos respaldan con alta confianza que el cron domina el consumo.

Fuentes: [operaciones](operaciones.json), [Cloudflare por hora](cloudflare-horas.json), [Cloudflare por minuto](cloudflare-minutos.json), [análisis reproducible](analisis.json). Los datos de Cloudflare corresponden a invocaciones del Worker, no a visitantes únicos ni a todas las descargas de imágenes y archivos estáticos.

## 4. Capacidad mínima alta y suspensión que sí funciona

Los dos servidores y la configuración predeterminada del proyecto tienen:

- mínimo **1 CU**;
- máximo **2 CU**;
- `suspend_timeout_seconds: 0`.

El cero **significa usar el valor predeterminado**, actualmente cinco minutos; no significa desactivar la suspensión. Desactivarla se expresa con `-1`. Los registros muestran centenares de suspensiones, por lo que no hay evidencia de que las bases hayan quedado permanentemente encendidas.

La relación entre cómputo y tiempo activo es prácticamente 1:1. Es consistente con consumir casi siempre el mínimo de 1 CU, no con escalar continuamente a 2 CU. No es una medición de utilización de CPU.

Con la misma duración encendida, operar a 0,25 CU en lugar de 1 CU equivaldría aritméticamente a unos **27,63 CU-horas**, una reducción del 75 %. Es un escenario, no una garantía: antes de aplicarlo hay que comprobar latencia y concurrencia, y conservar escalado suficiente si hace falta. Reducir capacidad ahora tampoco devuelve la cuota ya gastada.

## 5. Otros factores revisados

**Actualización periódica de pantallas.** Hay consumo secundario evitable mientras una pestaña está visible:

| Pantalla | Actualización | Efecto |
|---|---|---|
| Inicio | Cada 60 segundos | Vuelve a solicitar cinco recursos de cuenta/catálogo/contexto. |
| Mi Club | Cada 30 segundos | Solicita los cinco recursos globales y el estado del club. |
| Carta | Cada 60 segundos | Vuelve a pedir catálogo/disponibilidad de la carta. |
| Panel del equipo | Cada 30 segundos por lectura montada | Mantiene sincronizadas las listas. |
| Código de beneficio | Cada 10 segundos mientras está abierto | Comprueba cuenta/estado para seguir un canje. |

Las lecturas periódicas comprueban visibilidad, por lo que las pestañas ocultas no siguen consultando por esos intervalos. Una pestaña visible puede mantener despierta su base durante horas, aunque nadie pulse nada. Mi Club puede efectuar aproximadamente 720 solicitudes por hora sólo por el intervalo principal; eso es potencial del código, no tráfico medido durante una hora concreta. Las respuestas API usan `no-store` y se deben distinguir datos privados/transaccionales de datos públicos antes de plantear caché.

**Pruebas y vistas previas.** Las previews del rediseño y las suites principales usan PGlite en memoria; no leen credenciales ni hacen proxy remoto a Neon. Las pruebas y verificaciones remotas sí pueden consumir cuota y están incluidas en las ventanas observadas, pero las siete sesiones temporales reconstruidas suman sólo unos 46 minutos. No puede separarse exactamente todo el trabajo de pruebas efectuado dentro de producción/demostración usando estos agregados.

**Volumen de datos y tráfico.** Producción contiene aproximadamente 37,65 MB lógicos y demostración 37,97 MB; la transferencia registrada del proyecto es aproximadamente 14,46 MB. Cloudflare muestra unas 3.200 invocaciones del Worker en el período consultado, con actividad fuertemente periódica. No aparece un volumen masivo que explique el gasto; no se hizo una auditoría de seguridad de todas las conexiones directas, por lo que esto no certifica ausencia de abuso.

**Conexiones abiertas.** Los caminos transaccionales inspeccionados cierran sus clientes en `finally`. Los numerosos ciclos de suspensión contradicen una fuga permanente de conexiones. No se pudieron inspeccionar `pg_stat_activity`, utilización de CPU, SQL lento ni `pg_stat_statements` porque la cuota ya bloquea la base.

**Comprobación de salud insuficiente.** `/api/health` responde aunque Neon esté bloqueado. Las pruebas de publicación sí consultaron catálogo y recursos, pero no revisaron presupuesto restante ni proyección de consumo. Falta una alerta de capacidad y una comprobación diferenciada de disponibilidad de datos.

## 6. Plan de corrección recomendado, sin ejecutar

1. **Separar el mantenimiento de demostración.** Retirar su despertar horario automático y ejecutarlo al usar o preparar una demostración, o con una cadencia mucho menor explícita. Las pruebas de renovaciones seguirían cubiertas en el entorno local. No mezclar datos reales y de prueba.
2. **Revisar capacidad.** Probar 0,25 CU como mínimo, primero con cargas sintéticas representativas, y ajustar también los valores predeterminados del proyecto para futuras ramas. Mantener suspensión por inactividad.
3. **Separar tareas según su urgencia.** Limpieza de sesiones y métricas puede agruparse diariamente. Renovaciones deben conservar sus reglas y ventanas; los correos y recordatorios de reservas necesitan ejecución puntual/reintentos y no deben retrasarse indiscriminadamente. La comprobación de pendientes debe evitar despertar PostgreSQL sólo para descubrir que no hay trabajo: disparar desde eventos y programar reintentos cuando exista una tarea real.
4. **Reducir consultas periódicas.** Actualizar sólo el recurso visible y sólo mientras tenga sentido seguir un pedido/canje; evitar recargar cinco recursos globales cada 30 segundos en Mi Club. Aplicar caché breve únicamente a información pública segura, manteniendo comprobación de precio, disponibilidad, identidad y saldo al ejecutar una operación.
5. **Añadir control de consumo.** Presupuesto por entorno, proyección mensual y alertas al 60/80/90 %, con verificación posterior de horas activas. No hay una automatización nueva creada por este diagnóstico.

La corrección debe validarse con el consumo real posterior. Restaurar disponibilidad hoy requiere además resolver la cuota con el proveedor; optimizar no repone lo ya consumido. No se ha contratado ni sugerido como inevitable un plan concreto.

## Fuentes y método

- [Planes y unidades de cómputo de Neon](https://neon.com/docs/introduction/plans).
- [Contadores de consumo y sus límites](https://neon.com/docs/guides/consumption-limits).
- [Esquema oficial de Neon](https://neon.com/api_spec/release/v2.json), definiciones `Branch` y `SuspendTimeoutSeconds`.
- [Disponibilidad de la API de historial](https://api-docs.neon.tech/reference/getconsumptionhistoryperprojectv2).
- [Métricas de Workers con GraphQL](https://developers.cloudflare.com/analytics/graphql-api/tutorials/querying-workers-metrics/).

Reproducción: `scripts/auditar-cuota-neon.mjs` consulta sólo APIs de gestión y analítica, sin SQL; `scripts/analizar-cuota-neon.mjs` analiza los archivos descargados, deduplica operaciones y empareja arranque/suspensión. Credenciales leídas desde los archivos existentes exclusivamente para sus servicios; no incluidas en la entrega. Las fechas originales de las APIs se conservan en UTC y los ejemplos del informe se convierten a Managua.
