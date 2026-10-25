# Auditoría de API y autorización de los cinco perfiles

Fecha local del encargo: 7 de octubre de 2026 (America/Managua).

## Alcance y evidencia

Se leyeron completos los 14 módulos `src/worker/*.ts`, los tests locales relevantes de autenticación, seguridad, permisos, clientes, operación, panel, regresión, cuenta y auditoría, las migraciones de seguridad y el driver PGlite. Se contrastó el contrato de perfiles con `src/casa/equipo/Equipo.tsx`. No se consultaron secretos, bases remotas ni producción, y no se desplegó nada.

La ejecución de `npm test` fue realizada por el agente coordinador y terminó con código 0 en sus 10 suites. El coordinador también ejecutó `tests/perfiles-api-audit.mjs`: **11 grupos, 7 satisfactorios y 4 fallos nuevos reproducidos**, con salida 1. Las **132 lecturas y 60 denegaciones** de la matriz pasaron. Usa dos PostgreSQL PGlite en memoria y las rutas Hono reales compiladas; no envía correos ni usa credenciales reales. Debe ejecutarse en serie porque `tests/soporte.mjs` comparte los bundles de `.test-output`.

**Estado de este documento:** revisión estática y primer ciclo dinámico completados. Los cuatro casos siguientes están confirmados en local. Evidencia: `logs/perfiles-api-ciclo1.txt` y `evidencia/perfiles-api-ciclo1.json`. No se modificó código de aplicación durante esta revisión.

## Matriz de permisos observada

Sí significa que el perfil puede ejecutar la operación, con las validaciones de negocio pertinentes. Las consultas de un cliente se restringen a su identidad firmada.

| Capacidad | Propietario | Encargado | Caja | Cocina | Cliente |
|---|---|---|---|---|---|
| Cuenta, perfil, actividad, compras y avisos propios de cliente | No | No | No | No | Sí |
| Consultar pedidos de operación | Sí | Sí | Sí | Sí | No |
| Aceptar, cancelar o entregar pedidos | Sí | Sí | Sí | No | No |
| Marcar preparando/listo, respetando el orden | Sí | Sí | Sí | Sí | No |
| Consultar cliente por teléfono y últimos movimientos | Sí | Sí | Sí | No | No |
| Recargar, cobrar como caja, sellar, validar/entregar vales y beneficios | Sí | Sí | Sí | No | No |
| Agenda, entregas y atención | Sí | Sí | Sí | No | No |
| Directorio, ficha e historial completos | Sí | Sí | No | No | No |
| Resumen, métricas y auditoría | Sí | Sí | No | No | No |
| Consultar equipo | Sí | Sí | No | No | No |
| Crear, cambiar rol, desactivar/reactivar o restablecer accesos | Sí | No | No | No | No |
| Consultar muestras archivadas | Sí | No | No | No | No |
| Cambiar clave personal de empleado/propietario | Sí, en real | Sí | Sí | Sí | No: acceso por código |

Sin autenticación solo se permiten capacidades, salud, catálogo, cupos, ocupación e inicio de sesión. `/api/panel` permanece como acceso legado y exige la clave vigente del propietario por `x-casa`; no constituye un acceso público a sus datos.

Referencias principales: `index.ts:265-312` (identidad, base, revocación y perímetro cocina); `personal.ts:26-46` (equipo y propietario); `clientes.ts:6` (directorio); `operacion.ts:58-77` (estados); `panel.ts:8-13` (listas).

## Defectos reproducidos en el primer ciclo

### B-01 · P2 · Cupos públicos obsoletos tras el vencimiento

- Código: `src/worker/index.ts:373-374` cuenta `activa/en_gracia` sin comprobar `hasta`; el panel legado repite el criterio en `index.ts:1126`.
- Reproducción local confirmada: membresía con `estado='activa'`, `hasta` de ayer y `autorenueva=false`; consultar `/api/cupos` antes de ejecutar mantenimiento. Con cero membresías vigentes se esperan 100 plazas libres: **HTTP 200, 99 plazas**.
- Impacto: cliente ve una plaza ocupada por una membresía vencida; propietario puede consultar un conteo desactualizado. La compra sí ejecuta mantenimiento y no se ha demostrado pérdida de dinero.
- Reserva efectiva frente al anuncio: la plaza sigue retenida en el índice `membresia_numero_vivo` mientras el estado no cambie. Sin embargo, `/api/membresia/apartar` ejecuta `mantenerMembresias` antes de elegir número y esa membresía sin autorrenovación pasa a `vencida`; la plaza resulta comprable. Por tanto, este caso demuestra que la **disponibilidad anunciada es menor que la obtenida por el camino de compra**, no que se venda un número duplicado. No se generaliza este resultado a renovaciones consentidas todavía pendientes de procesar.
- Cierre: coherencia de indicadores con la disponibilidad que determinará el alta; comprobar mantenimiento programado y ambos entornos, además del camino de compra.

### B-02 · P3 · Fecha imposible de ocupación alcanza PostgreSQL

- Código: `src/worker/index.ts:1170-1171` solo comprueba el formato y `index.ts:1197` convierte a `date`.
- Reproducción local confirmada: GET `/api/ocupacion?dia=2026-02-31` sin autenticación devolvió **HTTP 500, SQLSTATE 22008**. El grupo se detuvo en esa primera aserción; las otras entradas (`2026-13-01`, `0000-01-01`) están programadas pero no se afirman ejecutadas en este ciclo. La fecha imposible debe rechazarse con 4xx antes de SQL.
- Impacto: un error de entrada se trata como fallo interno, contaminando monitoreo y dando un mensaje de recuperación incorrecto al cliente. No implica lectura de datos ajenos.
- Cierre: validación calendario y año mínimo coherente con `/api/perfil` y filtros operativos; conservar las fechas válidas, incluidos años bisiestos.

### B-03 · P3 · Identificador de aviso sin límite numérico

- Código: `src/worker/operacion.ts:48-50` acepta cualquier secuencia de dígitos y luego convierte a `bigint`.
- Reproducción local confirmada: cliente activo solicita POST `/api/avisos/99999999999999999999999999999999999999/leido` con `{}`: **HTTP 500, SQLSTATE 22003**.
- Impacto: 500 por desbordamiento en vez de 404/422; el filtro `socio_id` conserva la propiedad del aviso. No se ha identificado IDOR.
- Cierre: restringir identificadores al rango positivo de bigint y rechazar los no válidos antes del cast.

### B-04 · P3 · Nombre de empleado admite NUL hasta la base

- Código: `src/worker/personal.ts:34-38` comprueba longitud pero no caracteres de control.
- Reproducción local confirmada: propietario crea acceso con nombre `Nombre\u0000inválido`, usuario sintético válido y permiso `caja`: **HTTP 500, SQLSTATE 22021**. Se comprobó que no se creó el empleado.
- Impacto: entrada administrativa inválida tratada como error interno. Debe devolver 422 sin crear empleado. No permite crear accesos desde otros perfiles.
- Cierre: aplicar validación de caracteres consistente con el perfil cliente antes de calcular el hash o ejecutar SQL.

## Controles satisfactorios y alcance de las pruebas

- El rol efectivo del empleado se consulta en la base en cada petición, no se acepta un permiso enviado por el cliente. Desactivar, cambiar rol o clave incrementa la versión y revoca sesiones antiguas.
- Cambios de clave propios verifican clave actual y versión; restablecimientos son exclusivos del propietario, requieren su clave vigente y crean credenciales de 24 horas con cambio obligatorio. La renovación compara versión/hash para evitar pisar un cambio concurrente.
- El socio activo se comprueba antes de las rutas protegidas. Las transacciones de caja también revalidan al titular; una cuenta dada de baja no queda operable mediante caja.
- La identidad del cobro del cliente proviene del token, no de `telefono` enviado. Cancelar reservas ajenas filtra por identidad. Marcar aviso ajeno devuelve una respuesta idempotente sin modificarlo, y no revela su existencia.
- Las transiciones de pedido están controladas en el servidor. Cocina no acepta, cancela ni entrega; solo prepara y marca listo cuando corresponde. Cancelar un pedido reintegra el asiento/puntos vinculados al cargo original.
- Las consultas parametrizan datos y escapan comodines de búsqueda. El directorio y las listas tienen páginas acotadas; el historial usa cursor compuesto con microsegundos.
- El entorno demo se escoge desde sesión firmada, copiando el objeto de bindings por petición. Con aislamiento habilitado y sin base demo se cierra el acceso con 503. La identidad del propietario es central, mientras sus escrituras operativas y empleados pertenecen al entorno elegido.
- Los códigos OTP tienen caducidad, límites de intentos y uso único; los mensajes fallidos invalidan la emisión. La verificación por correo no recupera una cuenta anterior a partir de un teléfono declarado.

La nueva suite combina 132 lecturas de la matriz, 60 denegaciones de escritura por perfil, sesión adulterada/vencida, IDOR, transiciones, privacidad de cocina, aislamiento de dos bases y revocación. Todos esos controles pasaron en el primer ciclo. Las suites existentes completan reembolsos, canjes, archivo de muestras, recuperación de clave, paginación e idempotencia.

## Reejecución focalizada y conservación de evidencia

La suite guarda un resumen JSON sin tokens, claves ni datos reales en `evidencia/perfiles-api.json`. `AUDIT_CYCLE=ciclo2` cambia el nombre a `perfiles-api-ciclo2.json`; solo admite letras, dígitos, guion y guion bajo. `AUDIT_CASE_FILTER` permite seleccionar grupos por expresión regular sin eliminar la preparación de identidades/bases. Los grupos no seleccionados se registran como `OMITIDA`, no como aprobados.

Para repetir únicamente los cuatro defectos, desde la carpeta `club-lupita` en PowerShell:

```powershell
$env:AUDIT_CASE_FILTER = 'bigint|NUL|Fechas imposibles|Cupos públicos'
$env:AUDIT_CYCLE = 'ciclo2'
node tests/perfiles-api-audit.mjs
Remove-Item Env:AUDIT_CASE_FILTER
Remove-Item Env:AUDIT_CYCLE
```

El filtro mantiene la preparación de los cinco perfiles y las dos bases. El segundo ciclo debe conservar el primer resultado; si no se modifica la aplicación, un nuevo fallo consistente confirma reproducibilidad y no se presenta como una corrección.

## Recomendaciones separadas de defectos

1. **Minimización en cocina.** Ambas bandejas incluyen totales y precios por línea (`operacion.ts:56`, `panel.ts:32`), y la UI los presenta explícitamente (`Pedidos.tsx:24-25`). No envían teléfonos, correo, saldo, hashes ni perfil completo. Reducir los importes y el historial disponible sería una decisión de producto/privacidad; el contrato actual no declara esos importes prohibidos.
2. **Credencial inicial del equipo.** Crear acceso usa una clave aleatoria robusta y bcrypt/HMAC, pero no fija `requiere_cambio` ni caducidad; el esquema deja `false/null`. Restablecer sí exige cambio y 24 horas. Homogeneizar el alta mejoraría el control de entrega, pero no se presenta como incumplimiento funcional de la UI actual.
3. **Cron y demo.** Existe un `scheduled` que llama a `mantenerMembresias(env)` (`index.ts:1244`), pero `wrangler.jsonc` omite `triggers.crons`. Omitirlo conserva los cron ya desplegados; declararlo como `crons: []` los elimina al desplegar, según la [documentación de Cloudflare](https://developers.cloudflare.com/workers/configuration/cron-triggers/#remove-a-cron-trigger). Por tanto, **ausente en el archivo no equivale a vacío ni a deshabilitado en producción**. No se inspeccionó Cloudflare remoto. Si no hay cron efectivo, quedan como disparadores el acceso `/api/yo` de cada socio y el alta `/api/membresia/apartar`; la disponibilidad pública puede quedar desactualizada entre esas ejecuciones. El handler mostrado usa `DATABASE_URL`, sin recorrer `DEMO_DATABASE_URL`. Documentar y verificar el cron real y el mantenimiento demo en una fase de operación autorizada.
4. **Pruebas de plataforma.** PGlite comprueba SQL y rutas, pero su driver no reproduce el transporte Neon HTTP/WebSocket, concurrencia de múltiples conexiones ni las garantías exactas de Cloudflare Workers. Las carreras financieras requieren una base PostgreSQL de staging y sesiones independientes; no usar scripts históricos `neon-aislado.mjs`/`aislamiento-demo.mjs` sin revisar su acceso a archivos privados y a bases remotas.

## Referencias técnicas verificadas

Se aplicó la skill `workers-best-practices` y se verificaron las firmas de `ExportedHandler`, `ScheduledController` y `SendEmail` de la versión publicada `@cloudflare/workers-types@5.20261008.1`, leídas sin instalar ni modificar dependencias. Se consultó el esquema Wrangler instalado para `triggers.crons` y observabilidad. La fecha local del encargo sigue siendo 2026-10-07; la versión publicada de tipos usa su propia fecha.

- [Cloudflare: Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare: Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

No se atribuye a un cambio de configuración o de dependencias la condición de defecto de permisos sin evidencia funcional.
