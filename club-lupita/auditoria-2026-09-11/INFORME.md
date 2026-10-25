# Auditoría de Club Lupita · 11 de septiembre de 2026

**La app compila y tiene una interfaz consistente, pero no está lista para operar con clientes y dinero reales.** Se confirmaron 12 hallazgos funcionales: ocho de prioridad alta y cuatro de prioridad media. Además, siguen pendientes capacidades esenciales que la propia interfaz identifica como próximas entregas.

La auditoría corresponde al código de esta carpeta. No se desplegó, no se modificó el código funcional y no se ejecutaron escrituras contra producción. El build regeneró `dist` y los archivos de compilación; las nuevas pruebas y evidencias están en esta carpeta. No hay repositorio Git en el directorio auditado, por lo que no se dispone de un commit de referencia.

**Qué se comprobó**

| Comprobación | Resultado |
|---|---|
| `npm run build` | Correcto: guardián, iconos, TypeScript y Vite |
| Revisión de API | Lectura de las 20 rutas GET/POST, sesiones y migraciones SQL |
| Pruebas locales de API y SQL | 18 registros de evidencia, con SQL real en PGlite; ver `resultados-api.json` |
| Pantallas | Inicio, Pedir, Tienda, Club, Perfil, Reservar y Kit, a 360, 390 y 1440 px |
| Diseño adaptable | Sin desbordamiento horizontal del documento en las 21 combinaciones |
| Accesibilidad automática | Cero infracciones detectadas por axe en las siete vistas a 390 px, con reglas WCAG 2 A/AA, 2.1 AA y 2.2 AA |
| Diálogo de compra | Escape cierra y devuelve el foco al botón de apertura |
| Estados de fallo | Pérdida de respuesta de compra, salida sin conexión y respuesta 200 con HTML |
| Dependencias | Cuatro paquetes señalados por `npm audit`: tres altos en herramientas de desarrollo y uno moderado en Hono |

Las pruebas de interfaz usan el build de producción servido por un servidor local, con el Worker original y una base sintética. Un adaptador sustituye únicamente el transporte Neon por PostgreSQL en WASM. Se aplicaron las migraciones 001 y 003–007 y se intentó aplicar 009; 002 y 008 contienen datos de demostración y fueron sustituidas por datos aislados. Las pruebas son secuenciales: no prueban el aislamiento bajo carga ni el comportamiento de conexiones WebSocket en Cloudflare. El navegador bloqueó todas las solicitudes fuera de `127.0.0.1`.

**1. [P1] Las reservas nuevas válidas fallan con error 500**

[Worker, línea 1091](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:1091>)

La consulta de aforo combina `SELECT count(*)` con `FOR UPDATE`. PostgreSQL rechaza esta construcción. Una reserva local para mañana a las 15:00, terraza, dos personas y dos horas devolvió 500. La consulta aislada produjo `0A000: FOR UPDATE is not allowed with aggregate functions`.

Afecta a toda reserva nueva que alcance ese punto; las solicitudes rechazadas antes por validación o las reservas repetidas pueden devolver otro resultado. El problema está documentado también en la [referencia de SELECT de PostgreSQL](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE).

Corrección: serializar las reservas por zona mediante una fila estable de zona o un bloqueo transaccional equivalente y contar después. Limitarse a retirar `FOR UPDATE` dejaría una carrera por el último cupo; bloquear reservas existentes tampoco protege el caso en que aún no existe ninguna. Validar después dos usuarios compitiendo por el último cupo.

**2. [P1] Una respuesta perdida puede terminar en dos compras y dos cobros**

[Tienda, línea 40](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:40>) · [Club, línea 64](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:64>)

La referencia de compra vive en `useState` de la pantalla. Se conserva durante un reintento en esa instancia, pero desaparece al cambiar de pestaña o recargar la página.

Reproducción real contra la base local: confirmar una bolsa de C$ 890, permitir que el servidor la cobre y cortar la respuesta; ir a Inicio, volver a Tienda y repetir. La segunda solicitud usa otra referencia. El resultado final fueron dos cargos nuevos de C$ 890 y dos bolsas, para un total de C$ 1,780. En la última ejecución quedaron registradas las bolsas 005 y 006; las anteriores provienen de repeticiones de la propia prueba.

Corrección: persistir el intento pendiente por cuenta, conservar su referencia hasta reconciliar el resultado y devolver el resultado original en los reintentos. Aplicar lo mismo a experiencias; en esa pantalla se observó el mismo patrón de estado, aunque la reproducción monetaria se realizó sobre bolsas.

**3. [P1] Al completar la tanda desaparece el progreso y no hay acceso al canje en la app nueva**

[Lectura de sellos, línea 440](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:440>) · [Cierre de tanda, línea 536](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:536>) · [Tarjeta de sellos](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Datos.tsx:99>)

El noveno sello marca `cerrada`, pero `/api/yo` solo devuelve sellos de tandas con `cerrada IS NULL`. La prueba devolvió primero nueve sellos y `cerrada: true`; la lectura siguiente entregó cero sellos, cero tandas canjeadas y ningún vale. La app nueva tampoco tiene una llamada ni un botón para `/api/tanda/canjear`; el canje solo está integrado en la versión antigua.

Corrección: devolver explícitamente las tandas cerradas pendientes, mantener visible la recompensa y ofrecer su canje desde la interfaz actual. La tanda siguiente y la recompensa pendiente deben poder coexistir.

**4. [P1] El vale vence a los 90 segundos y se pierde la recompensa sin haberla consumido**

[Emisión del vale, línea 581](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:581>)

Emitir el código marca inmediatamente la tanda como `canjeada`. Al vencer el vale sin que el barista lo use, no existe reemisión ni devolución de la tanda. Se emitió un vale local, se adelantó su vencimiento en los datos sintéticos y la petición de reemisión devolvió 409: «Todavía no hay tanda cerrada».

Corrección: separar la vigencia del código de presentación del derecho a la recompensa. Consumir el derecho al quemar el vale o permitir renovar el código de un vale no usado, invalidando el anterior. Mantener la exclusión de doble consumo.

**5. [P1] La caja no puede cobrar de la cuenta de un socio**

[Identidad de caja, línea 338](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:338>) · [Cobro, línea 710](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:710>)

El token de caja contiene `tel: ''`. El endpoint de cobro usa siempre `sesion.tel`; su contrato no acepta el teléfono del cliente, a diferencia de sellado y recarga. Con una sesión de caja y un socio existente, el cobro por monto devuelve 404 incluso enviando `telefono` en el cuerpo.

Corrección: para el rol caja, aceptar y validar el cliente objetivo; para el socio, seguir tomando su identidad exclusivamente del token. Registrar también qué empleado realizó el cobro.

**6. [P1] Una membresía vencida sigue concediendo beneficios**

[Validación de beneficio, línea 827](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:827>) · [Lectura de membresía, línea 445](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:445>)

Las consultas comprueban `estado`, pero no `hasta`. No se encontró un proceso de renovación o vencimiento en el código ni un cron en la configuración. Una membresía con `hasta` en el día anterior y estado `activa` obtuvo el beneficio con respuesta 200.

Corrección: definir y aplicar renovación, vencimiento y gracia en servidor. La autorización debe considerar fechas aunque un proceso periódico se retrase. Si existe un proceso externo no incluido en esta carpeta, debe verificarse por separado. Revisar también el reciclaje de plazas: la unicidad permanente de `numero` y la búsqueda que considera todas las membresías impiden reutilizar números de membresías vencidas.

**7. [P1] Cerrar sesión sin conexión deja visibles los datos privados**

[Salida de Perfil, línea 77](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Perfil.tsx:77>) · [Conservación de sesión, línea 418](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:418>)

La salida borra el token, pero depende de un nuevo `/api/yo` para limpiar `yo` y `dentro`. Cuando la red falla, `refrescar` conserva la cuenta anterior. Se reprodujo con el botón «Cerrar sesión»: el token desaparece, pero Inicio continúa mostrando nombre y saldo, y la navegación sigue disponible. Esto afecta a la privacidad de la interfaz; no se comprobó que permita nuevas operaciones autorizadas sin token.

Corrección: limpiar de inmediato los datos y el estado de autenticación, sin esperar a la red; descartar también respuestas de solicitudes anteriores e invalidar el carrito asociado a esa cuenta.

**8. [P1] La migración de puntos no se puede aplicar**

[Tipo de origen, línea 25](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/db/009_puntos.sql:25>) · [Carga retroactiva, línea 150](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/db/009_puntos.sql:150>)

`punto.origen_id` es UUID, mientras que `asiento.id` es `bigserial`. La carga retroactiva inserta ese bigint en un UUID y aborta la transacción con `42804`. El trigger de consumo repite la misma incompatibilidad. La ejecución local de 009 confirmó el fallo. Esta migración aparece como pendiente en el código; no se verificó su estado en producción.

Corrección: usar una representación compatible para las distintas clases de origen o referencias separadas con integridad definida. Probar la migración con historial y un consumo posterior. Además, `/api/yo` no consulta ni devuelve `puntaje`: aplicar SQL por sí solo tampoco habilitará los niveles en la interfaz.

**9. [P2] La cancelación de membresía existe en API, pero no es accesible ni visible en la app nueva**

[Cliente API, línea 272](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:272>) · [Club](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Club.tsx:186>) · [Endpoint, línea 898](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:898>)

Ninguna pantalla nueva llama a `cancelarMembresia`; no hay control para cancelar. Incluso cancelando directamente por API, `/api/yo` omite `autorenueva`, por lo que Club sigue indicando «Se renueva el». La prueba local confirmó la respuesta de cancelación y la ausencia de ese estado en la lectura posterior.

Corrección: conectar el control de cancelación, devolver `autorenueva` y distinguir «vigente hasta» de «se renueva el», conservando el período pagado.

**10. [P2] Reutilizar una referencia de recarga puede acreditar un bono sin su recarga correspondiente**

[Inserciones de recarga y bono, línea 670](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:670>)

Las dos inserciones usan `ON CONFLICT DO NOTHING` de forma independiente. Prueba con rol caja: recarga de C$ 200 sin bono y, después, misma referencia con importe C$ 2,000. La segunda recarga no se inserta, pero sí aparece un bono de C$ 240. La respuesta anuncia C$ 2,000 aunque el libro contiene únicamente C$ 200 más el bono.

Corrección: enlazar el bono a la inserción efectiva de la recarga y rechazar una referencia reutilizada con parámetros distintos. Devolver el resultado original para reintentos idénticos. Este fallo requiere permisos de caja; no permite que cualquier visitante se acredite saldo.

**11. [P2] Una respuesta 200 con JSON inválido deja Inicio vacío**

[Cliente de datos, línea 170](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:170>)

Un error al parsear JSON se convierte en `null`, pero si HTTP indica éxito se devuelve `ok: true`. El proveedor marca al usuario como dentro con `yo: null`. Al simular un 200 con HTML, Inicio perdió el contenido principal y solo dejó la navegación. Es relevante ante respuestas inesperadas de un proxy o una configuración de rutas incorrecta.

Corrección: validar el contrato mínimo de cada respuesta y tratar un JSON inválido como fallo recuperable. No cambiar a un estado autenticado sin datos de cuenta válidos.

**12. [P2] El cumpleaños aparece un día antes en Managua**

[Formato de cumpleaños, línea 27](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Perfil.tsx:27>)

Una fecha SQL sin hora, `2000-09-14`, pasa a `new Date(iso)` como medianoche UTC y se formatea en la zona local. En Managua, la pantalla mostró «13 de septiembre». El error es de presentación; no se encontró una implementación del regalo de cumpleaños que permita comprobar su entrega.

Corrección: tratar el cumpleaños como fecha de calendario y evitar convertirlo en un instante UTC sujeto a desfase.

**Observaciones adicionales de código, sin prueba de carga o reproducción completa**

- **Disponibilidad incompleta:** [Reservar, línea 105](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Reservar.tsx:105>) consulta ocupación solo para la hora de inicio. Si el VIP está ocupado a las 16:00, todavía ofrece las 15:00 para dos horas. Hay que comprobar todo el intervalo. Las respuestas de ocupación tampoco se descartan cuando pertenecen a un día seleccionado anteriormente. No se reprodujeron estas carreras en navegador.
- **Pruebas conectadas a datos reales:** [pruebas.mjs, línea 46](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/scripts/pruebas.mjs:46>) borra todas las reservas VIP de la base configurada en `.dev.vars`; no se limita a fixtures ni revierte toda la prueba. Además, [Vite, línea 66](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/vite.config.ts:66>) envía `/api` a producción por defecto. Debe existir un entorno de prueba aislado y explícito. No se ejecutó ese script ni se leyó su secreto de conexión.
- **Acceso de caja sin limitador en aplicación:** `/api/auth/casa` y `/api/panel` comparan un secreto compartido sin un límite de intentos visible en código. Verificar si Cloudflare aporta protección externa; no se consultó su configuración ni se realizaron intentos masivos. El OTP también separa lectura, comprobación y consumo en solicitudes SQL distintas: su exclusión bajo concurrencia necesita una prueba específica.
- **Errores SQL silenciados:** los `catch` transaccionales responden 500 sin registrar la excepción. Esto escondió el error de reservas detrás de un mensaje genérico. Registrar errores estructurados con un identificador de solicitud, sin tokens ni datos sensibles.

**Capacidades pendientes que condicionan el lanzamiento**

Estas carencias se distinguen de los fallos anteriores: varias ya están reconocidas por la interfaz o por SPEC.

| Flujo | Estado observado | Implicación |
|---|---|---|
| Alta y acceso por WhatsApp | Botón de alta deshabilitado; el endpoint guarda el OTP pero no lo envía; solo la demo es utilizable desde la interfaz | Los clientes no pueden abrir sus propias cuentas por la app. «Dejá tu número» tampoco guarda el número introducido |
| Pedidos para llevar | Se registra un cargo y un concepto, sin pedido estructurado, líneas persistidas, estados o cola de barra | No existe un flujo completo de preparación y entrega; pese a ello se muestran minutos de recogida calculados desde constantes |
| Panel operativo | La app nueva no incluye rutas de caja; el Mostrador antiguo es principalmente analítico | Falta una interfaz completa para el personal, con usuarios, roles y trazabilidad individual |
| Referidos y cumpleaños | Código de referido formado en cliente; promesas de recompensa sin tablas/endpoints de aplicación | Esas promesas no tienen un mecanismo verificable en el código revisado |
| Perfil y retos | Edición de perfil y retos sin conectar | Se presentan explícitamente como próximas entregas |
| Cuota de membresía | SPEC conserva C$ 400; el catálogo y el cobro usan C$ 950 | Discrepancia de negocio ya declarada en SPEC §11; requiere cerrar una cifra canónica |

La cuenta de muestra es compartida y sus endpoints pueden consumir saldo e inventario de la misma base que atiende la API. El código no establece aislamiento de inventario por modo demo. Antes de permitir uso público, la demo necesita datos propios o un modo de solo lectura. No se comprobó si la base desplegada contiene inventario comercial real.

**Dependencias**

`npm audit` señaló Hono 4.13.3 con avisos moderados y la cadena de desarrollo Wrangler 4.125.0 → Miniflare 5.20260820.0-alpha → Sharp 0.35.2 con un aviso alto en Sharp. Los tres paquetes altos reflejan una misma cadena transitiva, no tres vulnerabilidades independientes de la app desplegada. El resultado completo está en `dependencias.json`.

Los avisos de Hono cubren [SSG](https://github.com/advisories/GHSA-gqvv-2mrq-wpjv), [parseo de formularios](https://github.com/advisories/GHSA-g6gw-c38x-mqfc) y [parseo de consultas](https://github.com/advisories/GHSA-crvj-82cr-hjcx). No se encontraron llamadas a `toSSG` o `parseBody` en la app. Para Sharp, consultar el [aviso de libheif](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c). No se demostró explotación de estos avisos en el proyecto. Actualizar las dependencias compatibles, regenerar el lockfile y repetir las comprobaciones pertinentes.

**Valoración de interfaz y accesibilidad**

Las capturas revisadas muestran una identidad visual consistente, navegación clara y controles de compra con precio y saldo. Los cuadros modales usan `dialog` y el recorrido probado con Escape funciona. No hubo errores JavaScript en los estados normales examinados.

La pantalla Pedir abre en una categoría con muchas fichas sin fotografía, lo que produce una lista visualmente repetitiva. Los módulos que anuncian futuras entregas ocupan espacio relevante en Inicio y Perfil. Son oportunidades de producto, no defectos de accesibilidad demostrados.

No se certifica WCAG a partir de axe: faltan un recorrido completo con lector de pantalla, pruebas manuales de zoom y teclado, todas las combinaciones de estados y dispositivos reales. Tampoco se ejecutaron Lighthouse, mediciones de red móvil, pruebas de carga o comparación de píxeles con el prototipo. La [guía de accesibilidad de Playwright](https://playwright.dev/docs/accessibility-testing) también distingue las verificaciones automáticas de la revisión manual.

**Orden recomendado de corrección**

1. Corregir reservas, doble cobro tras reintentos, cobro de caja y salida de sesión.
2. Completar el ciclo de recompensa y el ciclo de vida de membresía; corregir recargas e incorporar cancelación.
3. Reparar y probar la migración de puntos, su contrato de API y los estados de error.
4. Aislar demostración y pruebas; cerrar alta real, pedidos y operación del personal antes de lanzar esos flujos.
5. Actualizar dependencias y ejecutar pruebas de regresión de los casos reproducidos, además de concurrencia sobre saldos y cupos.

**Evidencias y reproducción**

- [Resultados de API y SQL](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/resultados-api.json>)
- [Resultados de navegador y axe](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/resultados-ui.json>)
- [Dependencias](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/dependencias.json>)
- [Captura de Inicio](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/capturas/inicio-390.png>)
- [Captura de Perfil y cumpleaños](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/capturas/perfil-390.png>)
- [Captura tras cerrar sesión sin red](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/capturas/logout-offline-390.png>)
- [Captura de respuesta inválida](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/auditoria-2026-09-11/capturas/json-invalido-390.png>)

Las utilidades usan Node y las dependencias de auditoría instaladas fuera del proyecto, en `$env:TEMP\club-lupita-audit-20260911`. Requieren `@electric-sql/pglite`, `playwright` y `axe-core`, además del `esbuild` existente en la app y Microsoft Edge instalado. No requieren ni leen credenciales.

Desde la raíz del proyecto, ejecutar `node auditoria-2026-09-11/auditar-api.mjs --serve` y, en otra terminal, `node auditoria-2026-09-11/auditar-ui.mjs`. El primer proceso crea una base nueva en memoria y sirve en `127.0.0.1:5199`; el segundo ejercita esa base. Las compras y el saldo de las capturas son exclusivamente sintéticos. Los scripts conservan evidencia del comportamiento actual; no son aún una suite de regresión que falle ante cada defecto de negocio. El puerto debe estar libre y el build debe existir.
