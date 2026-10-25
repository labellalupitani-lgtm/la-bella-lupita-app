# Rendimiento, compatibilidad y operación: investigación para Club Lupita

Fecha de corte: 30 de septiembre de 2026 (America/Managua). Solo investigación documental; no se ejecutaron pruebas, no se instalaron herramientas ni se modificó la aplicación. La arquitectura React/Vite + Hono/Cloudflare Workers + Neon/PostgreSQL y los dominios pedidos/reservas/membresías provienen del contexto de la investigación. Las propuestas siguientes no son hallazgos de defectos de la aplicación.

## Selección práctica de herramientas

| Herramienta | Para qué sirve aquí | Cuándo usarla / límite relevante |
|---|---|---|
| Lighthouse dentro de Chrome DevTools | Diagnóstico repetible de carga de páginas; informes guardables. DevTools permite páginas locales y autenticadas. | Primera revisión de portada, menú, formularios y paneles. Un puntaje alto no demuestra reservas correctas, datos íntegros ni buen rendimiento de todos los usuarios. [Documentación oficial](https://developer.chrome.com/docs/lighthouse/overview). |
| Performance de Chrome DevTools | Grabar interacciones, tareas de JavaScript, renderizado y bloqueos durante uso. | Investigar calendario, filtros, carrito o panel administrativo lentos. Registrar condiciones de CPU/red; la simulación depende de la máquina y no es un teléfono físico. [Guía oficial](https://developer.chrome.com/docs/devtools/performance). |
| Core Web Vitals / datos de usuarios reales | Medir carga, respuesta a interacción y estabilidad visual en visitas reales. | Complemento del laboratorio una vez haya datos. Objetivos publicados: LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1 en p75, separando móvil/escritorio; no son SLO propios del negocio. [Web Vitals](https://web.dev/articles/vitals). |
| Grafana k6 | Carga HTTP de API, escenarios concurrentes, percentiles, errores y verificaciones de respuestas. | Después de fijar flujos, datos de prueba y volumen representativo. `checks` solos no hacen fallar la ejecución; deben acompañarse de `thresholds`. [Checks](https://grafana.com/docs/k6/latest/using-k6/checks/), [Thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/). |
| Playwright con emulación + teléfonos disponibles | Matriz inicial repetible de tamaños, entradas táctiles, idioma y zona horaria. | Base económica y rápida. La emulación configura propiedades del navegador; no equivale a validar Safari/iOS físico, teclado del sistema ni rendimiento del dispositivo. [Emulación oficial](https://playwright.dev/docs/emulation). |
| BrowserStack Automate | Ejecutar casos en combinaciones de navegadores y dispositivos reales; ofrece integración con Playwright y registros de ejecución. | Opcional si faltan iPhone/Android físicos, hay fallos específicos o se requiere una matriz extensa. La documentación actual ya contempla Playwright en iOS real; no asumir que se limita a emulación. [Integración](https://www.browserstack.com/docs/automate/playwright), [iOS real con Node.js](https://www.browserstack.com/docs/automate/playwright/playwright-ios/nodejs). |
| Workers Observability | Métricas de solicitudes, errores, CPU y tiempo total; logs y trazas para localizar demoras y fallos del backend. | Primera opción para el backend existente, antes de añadir otro proveedor. No prueba que una operación de negocio haya quedado correcta en PostgreSQL. [Observabilidad oficial](https://developers.cloudflare.com/workers/observability/). |

No hace falta contratar todas estas herramientas. Recomendación de investigación: comenzar con herramientas locales, dispositivos disponibles y observabilidad nativa; considerar BrowserStack al identificar una carencia concreta de cobertura. No se verificaron contratos ni precios de BrowserStack y no se recomienda contratarlo todavía.

## Laboratorio y experiencia real deben presentarse separados

Un laboratorio controla dispositivo, red y ubicación para reproducir problemas. Los datos reales incluyen diversidad de equipos, conexiones y comportamiento; CrUX agrega una ventana de 28 días. TBT ayuda a diagnosticar bloqueo de JavaScript, pero no sustituye INP. Tampoco una captura de CLS durante la carga cubre los movimientos visuales posteriores al usar la página. [Diferencias entre laboratorio y datos reales](https://web.dev/articles/lab-and-field-data-differences).

Propuesta para Club Lupita: evaluar portada/menú, selección de reserva, pedido y paneles con sesión; medir primera visita y regreso; recorrer los formularios, no solo cargar la URL. Guardar perfil, navegador, red, dispositivo, fecha, versión de aplicación y resultados por ruta. Si no hay datos reales suficientes, el informe debe decir «rendimiento de laboratorio verificado; experiencia real pendiente de medición», sin inventar un resultado de producción.

## Carga y concurrencia: cómo evitar conclusiones engañosas

k6 permite modelos por usuarios virtuales y por tasa de llegada. Un modelo cerrado puede reducir la llegada de solicitudes cuando el sistema se vuelve lento; un modelo abierto ayuda a conservar la presión prevista. `constant-arrival-rate` programa iteraciones, no necesariamente una solicitud por segundo, y distribuye sus comienzos: no garantiza que todas empiecen exactamente al mismo instante. [Modelos abiertos y cerrados](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/), [Constant arrival rate](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-arrival-rate/).

Por ello, combinar una prueba de capacidad con pruebas específicamente diseñadas para colisiones sobre el mismo recurso. Medir `dropped_iterations`: pueden revelar que el generador no logró aplicar la carga pretendida; no adjudicar automáticamente esa pérdida a la aplicación. [Métricas incorporadas](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/).

Propuesta de escenarios y evidencia, pendiente de confirmar las reglas de negocio:

| Escenario | Señal que se debe medir | Criterio funcional propuesto |
|---|---|---|
| Dos o más clientes intentan reservar el último cupo de un horario | Respuestas aceptadas/rechazadas, reservas persistidas, cupos consumidos y estado visible en cada sesión | La suma confirmada respeta la capacidad configurada; todo rechazo informa correctamente; no quedan reservas fantasma. Si hay revisión manual, evaluar contra esa regla en vez de asumir confirmación inmediata. |
| Doble clic y reenvío de una misma operación tras timeout | Número de operaciones lógicas, filas resultantes y efectos secundarios | Una misma intención no genera duplicados donde la regla de negocio exija idempotencia; respuesta y estado persistido concuerdan. |
| Modificación/cancelación concurrente de reserva o pedido | Secuencia de estados, versión final, cupos restituidos y mensajes | Solo transiciones permitidas; ningún cambio se pierde silenciosamente; capacidad y estado quedan reconciliados. |
| Pedido con variación concurrente de disponibilidad o precio | Total calculado por servidor, detalle almacenado, rechazo/aceptación y detalle mostrado | Los valores finales siguen la política vigente; no se acepta silenciosamente un total incoherente. Validar existencias solo si forman parte del modelo de negocio. |
| Ráfaga de consulta de menú y creación de operaciones | Latencia p50/p95/p99 por ruta y por flujo, tasa de errores inesperados, solicitudes completadas, CPU/tiempo del Worker y tiempo de base de datos | Capacidad y latencia se aprueban únicamente contra volumen, duración y objetivos acordados, sustentados en tráfico real o previsión explícita. |
| Dependencia lenta o indisponible | Timeouts, reintentos, duplicados, mensajes mostrados y recuperación | Error comprensible, estado íntegro y recuperación verificable conforme a reglas acordadas. |

Estos son diseños de prueba de ingeniería, no exigencias extraídas de una herramienta. No asignar de antemano «500 usuarios», «200 ms», «99.9 %» u otro SLO de negocio sin datos y acuerdo. Cero sobreventa o duplicación indebida es un invariante funcional propuesto, diferente de un objetivo de latencia.

La ejecución futura de carga debería realizarse en un entorno controlado con datos aislados y servicios externos de prueba; esto forma parte de la preparación de una auditoría, no se ha ejecutado en esta investigación.

## Compatibilidad móvil y navegadores

Propuesta: elegir la matriz a partir de tráfico/dispositivos reales de los clientes. Si aún no hay datos, documentar una matriz inicial de Chrome/Android, Safari/iPhone y navegadores de escritorio relevantes como una hipótesis, revisable. Comprobar teclado, autocompletado, campos de fecha, modales con scroll, orientación, zoom, formularios largos, volver/recargar, sesión persistente, red lenta y pérdida de conexión durante envío. Para reservas, incluir la zona horaria del negocio y otra del dispositivo; el formato visible y el instante guardado deben conservar su significado.

Límite concreto de BrowserStack iOS: su referencia actual admite un solo contexto y una sola página por sesión. También documenta diferencias en restauración de `storageState` —las cookies no se restauran por ese mecanismo— y eventos de solicitudes de subrecursos. Esto afecta autenticación, flujos con pestañas y pruebas que esperan observar `fetch`; conviene adaptar y validar la suite antes de asumir paridad con escritorio. [Comandos y limitaciones de Playwright en iOS](https://www.browserstack.com/docs/automate/playwright/references/supported-ios-commands).

Criterio propuesto: completar todos los flujos críticos de la matriz acordada, sin bloqueo, pérdida de datos ni controles inaccesibles; conservar evidencia del resultado y distinguir errores de producto de limitaciones del proveedor de pruebas.

## Operación y evidencia posterior a la entrega

Workers Logs puede recoger invocaciones, logs personalizados, errores y excepciones. La documentación actual indica retención de 3 días en Free y 7 en Paid, máximo de 256 KB por log, y muestreo configurable. Implicación: un log ausente o caducado no demuestra que el fallo no ocurrió. Para conservar evidencia de auditoría, prever exportación o archivo oportuno y registrar la política de muestreo. [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).

Las trazas requieren activación específica en `observability.traces.enabled`; `observability.enabled` por sí solo no las habilita durante la beta documentada. La instrumentación automática observa llamadas fetch, bindings y handlers; hay spans personalizados para lógica propia. No asumir que eso produce automáticamente un desglose de todas las consultas PostgreSQL. La documentación anuncia un cambio de facturación a partir del 1 de octubre de 2026: volver a revisar esa condición al implementar, sin tratar la beta como gratuidad permanente. [Workers Traces](https://developers.cloudflare.com/workers/observability/traces/).

Propuesta mínima de telemetría: correlación de petición/operación y versión de despliegue, ruta, resultado de negocio, duración, error tipificado y dependencia involucrada; evitar registrar credenciales y datos personales innecesarios. Asociar resultados de pruebas con filas/estados esperados y con telemetría del intervalo. La información nativa cubre el backend; errores de React o fallos solo visibles en el navegador requieren también evidencia del cliente. Valorar una plataforma adicional únicamente si hace falta retención, correlación o seguimiento del frontend que esta base no resuelva.

El informe final de una auditoría debería distinguir: flujo ejecutado y aprobado, flujo fallido con reproducción, y flujo no verificado con motivo. La disponibilidad de una herramienta no equivale a haber probado la aplicación.
