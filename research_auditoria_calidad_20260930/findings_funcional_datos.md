# Investigación: funcionalidad, servidor y datos

Fecha de corte: 30 de septiembre de 2026. Se hicieron cinco consultas de búsqueda y se consultaron páginas oficiales. Este documento propone una auditoría futura; no se ejecutó la aplicación ni sus pruebas, no se instalaron herramientas ni se modificó código.

## Encaje con Club Lupita

Contexto local comunicado por el investigador principal: React 18, TypeScript, Vite, Hono, Cloudflare Workers y Neon PostgreSQL. Ya existen scripts Node de regresión, cuenta de cliente, operación y UI; dependencias declaradas `playwright`, `axe-core` y PGlite. El soporte de pruebas empaqueta el Worker para Node y sustituye Neon por PGlite; la suite UI usa Edge Chromium y una cola de peticiones. También existe `tests/neon-aislado.mjs` con solicitudes simultáneas para conflicto de reserva VIP y compra repetida. Esto es inventario, no evidencia de pruebas aprobadas ni de cobertura completa.

La recomendación es **conservar lo útil y cerrar diferencias entre el entorno probado y el real**. Una dependencia instalada no demuestra qué comportamientos están cubiertos. Tampoco corresponde afirmar que faltan por completo pruebas de concurrencia: ya hay casos escritos sobre Neon que deben inventariarse y verificarse en una auditoría posterior.

## Herramientas concretas

| Herramienta | Para qué serviría aquí | Límite que debe constar en el informe |
|---|---|---|
| Playwright Test (`@playwright/test`) | Recorridos completos por rol; formularios, navegación, recuperación de errores; API y UI en una suite con reportes y evidencia | La biblioteca `playwright` actual permite automatizar, pero no implica tener configurados el ejecutor, proyectos, fixtures, reportes ni aserciones del paquete Test |
| Vitest + React Testing Library | Reglas pequeñas, formularios, estados cargando/vacío/error y controles por permisos | Un DOM simulado no demuestra renderizado correcto ni integración del sistema completo |
| Integración oficial de pruebas de Workers | Probar código y bindings en el runtime de Workers y validar la construcción final del servidor | Node + sustituciones no basta para certificar compatibilidad con Workers; la ejecución local tampoco certifica servicios externos reales |
| PGlite existente | Pruebas rápidas y reproducibles de consultas, migraciones y restricciones con datos nuevos | Su conexión única no reproduce todos los conflictos entre transacciones concurrentes de PostgreSQL remoto |
| Rama aislada de Neon | Verificar driver real, esquema, transacciones y carreras con el motor utilizado por el producto | El aislamiento de una rama protege entornos; no prueba autorización entre clientes de la aplicación |

### Playwright Test: UI, API y evidencia

La documentación recomienda Playwright Test para pruebas extremo a extremo en Node. Aporta contextos aislados, aserciones que esperan condiciones, matriz de proyectos, paralelización, reportes, reintentos y trazas. Su encaje es especialmente bueno porque el proyecto ya usa la biblioteca: se pueden evaluar mejoras incrementales de los scripts existentes sin una reescritura obligatoria. [Comparación oficial entre biblioteca y Test](https://playwright.dev/docs/library).

Las pruebas API permiten preparar datos y comprobar resultados del servidor después de una acción de interfaz. Se pueden crear contextos con cookies independientes para cliente A, cliente B, caja, cocina y encargado. Un contexto asociado al navegador comparte cookies con él; uno creado aparte puede mantenerlas aisladas. [API testing](https://playwright.dev/docs/api-testing).

Las trazas configuradas mediante Playwright Test incluyen aserciones; las obtenidas con `context.tracing` solo registran operaciones del navegador y actividad de red. Para un defecto conviene guardar pasos, resultado esperado/real, solicitud/respuesta pertinente y traza. [Tracing](https://playwright.dev/docs/api/class-tracing).

Las comparaciones de capturas detectan cambios de presentación. La referencia debe revisarse y capturarse en un entorno estable: sistema, navegador, fuentes y otros factores cambian el resultado. Una captura idéntica no verifica saldos ni permisos. [Comparaciones visuales](https://playwright.dev/docs/test-snapshots).

Propuesta de matriz posterior: escritorio y móvil emulado, Chromium/Edge, Firefox y WebKit según usuarios reales. **WebKit no equivale a Safari real ni a un iPhone físico**; Playwright declara que no controla el Safari de marca. Los flujos móviles importantes necesitan una comprobación adicional en dispositivo/Safari real. [Navegadores soportados y límites](https://playwright.dev/docs/browsers).

### Componentes y reglas

Vitest es una opción natural para un proyecto Vite. La versión a seleccionar depende de las versiones de Node, Vite y las integraciones del repositorio; no se recomienda instalar `latest` indiscriminadamente. [Guía oficial de Vitest](https://vitest.dev/guide/).

React Testing Library permite consultar elementos como los encuentra una persona: rol, etiqueta y texto. Sirve para comprobar que un error se muestra, un formulario no acepta un valor inválido y un estado pendiente impide envíos accidentales. La librería no es un ejecutor de pruebas; su documentación incluye configuración con Vitest. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [configuración con Vitest](https://testing-library.com/docs/react-testing-library/setup/).

`jsdom` y `happy-dom` simulan APIs del navegador. No sustituyen las pruebas de integración visual con un navegador. Para empezar, concentrar esta capa en componentes y reglas difíciles de cubrir exhaustivamente con recorridos largos. [Entornos de Vitest](https://vitest.dev/guide/environment.html).

### Hono y Cloudflare: actualización relevante de 2026

Hono ofrece `app.request()` para hacer peticiones y comprobar respuestas sin levantar un servidor externo; también permite aportar un entorno de prueba. Es útil para rutas, validaciones y autorización. [Pruebas de Hono](https://hono.dev/docs/guides/testing).

La documentación de Cloudflare actualizada el 20 de agosto de 2026 presenta **`@cloudflare/vitest-plugin`**, con Vitest 4.1 o posterior, para ejecutar pruebas dentro del runtime de Workers. Admite pruebas unitarias e integración, bindings y almacenamiento aislado por archivo. No debe recomendarse automáticamente el antiguo `@cloudflare/vitest-pool-workers`: incluso algunas guías de Hono aún lo mencionan. [Integración oficial](https://developers.cloudflare.com/workers/testing/vitest-integration/), [requisitos](https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/).

Para integración del Worker completo, Cloudflare recomienda `createTestHarness()`: ejercita la construcción de producción y rutas HTTP, y funciona con ejecutores Node y Playwright. Esto permitiría complementar el soporte Node/PGlite actual con una comprobación cercana al despliegue. [Estrategia oficial de pruebas](https://developers.cloudflare.com/workers/testing/), [integration test harness](https://developers.cloudflare.com/workers/testing/test-harness/).

El aislamiento local del plugin no aísla automáticamente una base Neon externa. Deben definirse datos y recursos por ejecución; tampoco conviene mezclar el proyecto de componentes DOM con el runtime de Workers, cuya configuración no admite entornos ni ejecutores personalizados. [Configuración](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/).

### PostgreSQL y datos

PGlite ejecuta PostgreSQL compilado a WebAssembly, permite bases efímeras en memoria y resulta útil para pruebas unitarias con una base nueva por prueba. [PGlite](https://pglite.dev/docs/about). Sin embargo, la propia documentación explica que PGlite es de conexión única; su servidor de sockets puede multiplexar clientes, algo distinto de PostgreSQL normal y que no cubre todos los casos. Por tanto, no es evidencia suficiente para certificar contención, bloqueos o carreras reales. [Limitaciones de PGlite Socket](https://pglite.dev/docs/pglite-socket).

Neon ofrece ramas aisladas por entorno o ejecución. Para esta app, la rama de pruebas existente es una buena base; habría que confirmar a futuro el destino efectivo, inicialización, limpieza y separación entre ejecuciones. Preferir datos sintéticos y un esquema equivalente al desplegado. [Ramas de Neon](https://neon.com/branching).

## Casos de mayor valor para la auditoría futura

Estas son propuestas de diseño derivadas del contexto del proyecto, no defectos detectados:

1. **Reintentos de negocio:** repetir exactamente la misma compra/operación tras doble clic, recarga y pérdida de respuesta después de que el servidor haya guardado. Verificar una sola consecuencia empresarial: registro, saldo, cupo, puntos y notificación, según corresponda. Después enviar dos operaciones legítimas distintas y comprobar que ambas se procesan. Repetir un test fallido en el ejecutor no equivale a comprobar idempotencia del negocio.
2. **Concurrencia:** partir de los casos Neon existentes; sincronizar dos solicitudes antes de que compitan por el último cupo VIP o el mismo recurso. Comprobar resultados de ambas respuestas y estado final de PostgreSQL: sin sobreventa, doble débito ni pérdida de actualización. Usar conexiones/solicitudes efectivamente concurrentes; una cola Promise que serializa solicitudes no demuestra esta propiedad.
3. **Aislamiento entre cuentas:** sesión A y sesión B con datos distintos; A intenta consultar, editar, descargar o cancelar identificadores de B por API directa y por URL. Comprobar que la respuesta no filtra información y la base no cambia. Repetir después de cerrar sesión y entrar con otra cuenta para detectar caché o datos persistidos indebidamente.
4. **Permisos por rol:** matriz explícita de cliente, caja, cocina y encargado. Verificar tanto acciones permitidas como prohibidas directamente en API; ocultar un botón no constituye una prueba de autorización.
5. **Consistencia:** después de cada operación clave, comparar lo visible con el registro persistido y las reglas acordadas. Incluir validaciones negativas, cancelaciones, reversión de errores y expiración de sesión.
6. **Integraciones pendientes:** OTP real, POS y campañas deben marcarse como pendientes/no evaluadas donde corresponda. Un simulador demuestra el comportamiento de la app frente a una respuesta diseñada, no entrega real ni compatibilidad con el proveedor.

## Recomendación pequeña

Primero elaborar una matriz de funcionalidad × rol × escenario × prueba existente × evidencia. Luego escoger tres recorridos críticos y reunir, para cada uno, una prueba de interfaz, una de API y una consulta de consistencia sobre Neon aislado. Evaluar Playwright Test para centralizar evidencia y matriz de navegador; conservar PGlite para velocidad; añadir la comprobación en runtime de Workers cuando el inventario confirme esa diferencia. Vitest/Testing Library se incorporaría de forma selectiva para reglas o componentes cuya cobertura actual sea insuficiente.

No hace falta comprar una plataforma ni instalar todas las herramientas para iniciar una auditoría defendible. El entregable útil es una lista de funcionalidades comprobadas, no comprobadas y fallidas, cada una con entorno, resultado esperado, resultado real y evidencia reproducible. No se ha comprobado aquí el funcionamiento de la aplicación.
