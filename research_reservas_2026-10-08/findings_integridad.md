# Auditoría de integridad y operación de reservas

Fecha de referencia: 8 de octubre de 2026, America/Managua. Rama de investigación: backend y esquema activos en `club-lupita/src/worker` y `club-lupita/db`.

## Conclusión

El núcleo de cobro e inventario ya tiene defensas importantes: usa una transacción de PostgreSQL, bloquea al socio, serializa la disponibilidad por zona, cuenta el máximo simultáneo de reservas, valida apertura/cierre y protege el VIP con una exclusión en la base. No encontré evidencia de que actualmente se cobre dos veces una repetición exacta ni de que se ignore el límite de mesas por zona.

La debilidad principal está por encima de esas defensas: **una cuenta puede apartar gratis todas las mesas de una zona para el mismo período**, variando ligeramente el inicio. La regla de repetición también acepta como éxito una solicitud que cambia personas y duración, devolviendo silenciosamente la reserva anterior. El ciclo de atención termina demasiado pronto: se cobra el depósito VIP pero la app no permite al cliente cancelarlo ni ofrece al personal un mecanismo de modificación, liquidación o devolución específico de reservas.

Se ejecutaron siete grupos de comprobaciones locales sobre el Worker actual, compilado sin cambiarlo, con esquema real y datos sintéticos en PGlite. Todos pasaron: cuatro verifican protecciones y tres reproducen carencias concretas; un grupo adicional de VIP reúne protección contra doble cargo y limitación de cancelación. `PASS` en esta auditoría significa que se reprodujo el resultado descrito, no que todos los comportamientos sean deseables. Evidencia completa: `integridad/resultados.json`; reproducción: `integridad/repro.mjs`.

## Alcance y método

- Se leyó la habilidad `C:/Users/artur/.codex/skills/workers-best-practices/SKILL.md`, la documentación vigente de Workers, el esquema local de Wrangler y los tipos publicados `@cloudflare/workers-types@5.20261009.1`, descargados en UTC 9 de octubre / noche del 8 en Managua. No se cambió la versión del proyecto.
- Backend real: Cloudflare Worker + Hono + Neon/PostgreSQL. No es D1. La búsqueda exploratoria inicial de D1 se descartó al identificar el driver.
- Se leyeron `tests/regresion.mjs`, `tests/operacion.mjs`, `tests/auditoria.mjs`, `tests/soporte.mjs`, `tests/soporte-perfiles-equipo.mjs`, `tests/driver-local.mjs` y `tests/neon-aislado.mjs` para conocer cobertura y aislamiento antes de ejecutar nada.
- La reproducción nueva usa PGlite en memoria, reemplaza únicamente el driver en el bundle de auditoría, rechaza URLs de base distintas de `postgres://reservation-audit-local` y deshabilita `fetch` externo. No lee credenciales, no crea reservas reales, no envía correos y no altera la app.
- **No se ejecutó `tests/neon-aislado.mjs`**: carga `.staging.local`, abre una base Neon y aplica migraciones; no cumple el requisito de esta auditoría de evitar mutaciones remotas.
- Se inspeccionó exclusivamente la UI activa `src/casa/pantallas/Reservar.tsx` cuando era necesaria para seguir una respuesta del backend. No se atribuyen defectos a la pantalla histórica `src/pantallas/Reservar.tsx`.
- Cinco consultas de búsqueda web en total; fuentes técnicas usadas: documentación oficial de Cloudflare, PostgreSQL, Neon y OWASP. No se usan publicaciones de terceros para sustentar los hallazgos.

## Matriz priorizada

| ID | Prioridad | Certeza | Impacto | Esfuerzo orientativo |
|---|---|---|---|---|
| INT-01 | P1 | Reproducido localmente | Una cuenta bloquea diez mesas simultáneas sin pagar | Medio |
| INT-02 | P2 | Reproducido localmente + UI activa | Cambios de grupo/duración aparentan aceptación pero se ignoran | Medio |
| INT-03 | P2 | Reproducido localmente + inventario de rutas | VIP cobra depósito sin ciclo operativo de cambios/devoluciones | Alto, depende de política |
| INT-04 | P2 | Confirmado en esquema y rutas | Agenda carece de llegada, ausencia, salida y acciones del personal | Medio/alto |
| INT-05 | P2 | Confirmado en código + avisos vacíos en local | Confirmación depende de la pantalla y del historial; faltan avisos/reminders | Medio |
| INT-06 | P3 | Reproducido localmente | Fecha inexistente normalizada y reservada en otro día | Bajo |
| R-01 | P2 pendiente | Modelo confirmado, capacidad física desconocida | Aforo cuenta reservas; no modela tamaños de mesa ni personas por zona | Alto, requiere datos del salón |
| R-02 | P3 pendiente | Riesgo inferido de SQL | Ocupación expande el histórico antes de filtrar por día | Bajo/medio |
| R-03 | P2 verificación | Bloqueos correctos en código; ensayo concurrente pendiente | Garantía bajo carga no validada por esta ejecución secuencial | Medio |

P1: corregir antes de ampliar uso público. P2: siguiente bloque de trabajo del módulo. P3: robustez y mantenimiento. Ningún ID declara daño observado en producción.

## INT-01 · Una cuenta puede acaparar todas las mesas sin coste

**Evidencia:** `src/worker/index.ts:980` inicia el endpoint; `1033–1041` limita únicamente el duplicado exacto socio/zona/inicio; `1057–1089` protege el aforo global, sin límite por cuenta, día o solape. La función `limitar_acceso` existe para acceso y atención, pero no se invoca en reservas. La autenticación protege la identidad, no el uso excesivo del flujo.

**Reproducción:** cuenta sintética sin saldo; diez `POST /api/reserva` a terraza, 15 de noviembre, inicios de `10:00:00` a `10:00:09`, 12 personas y 6 horas. Los diez responden 200. La base contiene 10 reservas / 120 personas para esa cuenta. Otra cuenta que pide las 11:00 recibe 409 «No nos quedan mesas». No se requiere una carrera concurrente: ocurre secuencialmente.

El número de 120 personas aquí es evidencia de los datos aceptados, no prueba de que el aforo físico real sea 120 o se haya sobrepasado. El fallo es que un cliente controla todos los recursos reservables de la zona durante horas, con varias reservas simultáneas.

**Propuesta:** definir máximo de reservas activas/futuras por cliente y prohibición de solapes del mismo titular, salvo una operación explícita de reserva de grupo autorizada por personal. Aplicar ambas reglas dentro de la transacción que bloquea al socio; añadir límites por ritmo y señales de abuso como defensa adicional. Decidir cuánto inventario se ofrece online y qué parte queda para atención presencial. Normalizar inicios a las franjas comerciales es útil, pero por sí solo no resuelve el problema.

**Aceptación:** el escenario anterior debe rechazarse antes de ocupar toda la zona; el segundo cliente conserva disponibilidad; reintentar una reserva legítima no consume límite adicional; cancelarla libera el límite. Las excepciones de grupos deben quedar justificadas y auditadas.

La amenaza corresponde expresamente al caso de reservas que agotan franjas descrito por [OWASP API6:2023](https://api-security.owasp.org/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/). No se verificaron reglas externas de WAF; un límite de tráfico externo no sustituye una regla transaccional de reservas por titular.

## INT-02 · La deduplicación confunde repetición con cambio de reserva

**Evidencia:** `src/worker/index.ts:1033–1041` busca por socio/zona/inicio; no compara `personas` ni `termina`. `src/casa/pantallas/Reservar.tsx:145–159` construye el mensaje con el formulario y la bandera `yaEstaba`, sin mostrar las personas/duración devueltas por el servidor. El resumen previo sí dice las nuevas personas y horas (`376–379`).

**Reproducción:** primero ventanal, 10:00, dos personas, una hora. Después misma zona/hora con doce personas, seis horas. El segundo envío devuelve 200, `yaEstaba:true`, pero conserva dos personas y una hora. El comportamiento evita duplicar la mesa, pero no informa con suficiente precisión que el cambio no se hizo.

**Propuesta:** llave de idempotencia del intento con huella completa de zona/inicio/personas/duración; misma llave y otro contenido => 409 claro. Una nueva llave que coincide con una reserva activa debe ofrecer «Ver o modificar tu reserva» con datos reales. Crear modificación transaccional con nueva comprobación de cupo. Mostrar siempre el comprobante devuelto por el servidor.

**Aceptación:** reintento exacto produce el mismo ID y cero cargos adicionales; petición con otros parámetros no responde como si esos parámetros hubieran sido confirmados; el comprobante presenta personas, inicio y fin persistidos. Considerar asimismo reintentos tardíos tras cancelación: hoy una repetición del POST puede volver a crear la reserva porque la búsqueda excluye canceladas.

## INT-03 · Depósito VIP sin ciclo operativo completo

**Evidencia:** `src/worker/index.ts:975` fija C$500; `1043` exige saldo; `1086–1096` crea la reserva y prepara el cargo. El ejecutor registra cualquier monto positivo como `tipo='consumo'` (`192–199`). `src/worker/atencion.ts:7–19` sólo permite cancelar al socio y rechaza todo depósito positivo (`14`). Las rutas de personal listan reservas pero no tienen acción de cancelar, mover, liquidar o devolver. El código de devolución existente pertenece a pedidos (`src/worker/operacion.ts:77–82`). La UI activa reconoce esta carencia en su propio comentario (`Reservar.tsx:385–394`).

**Reproducción:** saldo sintético C$500; reserva VIP responde 200 y deja saldo cero; reintento exacto devuelve la misma reserva sin segundo cargo; cancelación responde 409 y pide ayuda. El cargo queda como «Depósito del Salón VIP», tipo `consumo`.

**Impacto:** el contacto con la casa puede resolver el caso fuera de la app, pero no hay una acción del sistema que asegure devolución única, libere el espacio y deje comprobante coherente. Tampoco se puede comprobar aplicación al consumo o estado del depósito. Esto no prueba apropiación indebida ni incumplimiento normativo: demuestra una función de producto incompleta.

**Propuesta:** decidir con la casa si es anticipo aplicable, garantía o tarifa por uso, en qué casos se devuelve y quién autoriza excepciones. Guardar versión de política aceptada, estado del depósito y relación con el asiento original. Implementar cancelación/modificación por personal y devolución/aplicación idempotentes, en la misma transacción que libera/modifica inventario. Los puntos asociados al cargo como consumo requieren una decisión explícita y reversión coherente cuando corresponda (`db/009_puntos.sql:99–107`).

**Aceptación:** una devolución autorizada ejecutada dos veces genera un solo abono; el inventario se libera una vez; queda responsable/motivo/importe, composición de saldo y comprobante del cliente. No prometer reglas en la interfaz antes de acordarlas e implementarlas.

## INT-04 · El equipo tiene una lista de reservas, no un ciclo de servicio

**Evidencia:** `db/001_schema.sql:186–199` y migraciones agregan inicio/fin y archivo, pero no mesa física, estado de llegada, ausencia, salida, responsable o versión del cambio. `src/worker/panel.ts:23` sólo distingue próximas/todas/canceladas; `54–63` consulta la agenda. `src/worker/mostrador.ts:35` lista reservas; la mutación de entregas `37–45` sólo admite bolsa/experiencia. No hay acción de personal que cree una reserva para quien llama, cambie una mesa, marque asistencia o cierre una mesa anticipadamente.

**Impacto:** la disponibilidad supone que toda reserva no cancelada ocupa todo su intervalo, aun cuando el cliente no llegue o se retire temprano. Sin estados no se puede medir no-show ni distinguir servicio realizado de simple tiempo transcurrido. Los procesos telefónicos/presenciales y los cierres especiales quedan fuera del inventario digital.

**Propuesta:** definir estados y transiciones mínimas: confirmada → llegó/sentada → finalizada; cancelada y no se presentó; cambios con auditoría y control de versión. Registrar reservas manuales y bloqueos del salón con permisos, motivo y reglas comunes de capacidad. Valorar margen de tolerancia y tiempo de preparación según operación real.

**Aceptación:** cliente y personal ven la misma reserva/version; dos empleados no pisan cambios; una cancelación o salida liberan según política; los bloqueos impiden ofrecer disponibilidad; las métricas distinguen reservas/personas/asistencias/ausencias.

## INT-05 · Falta confirmación duradera en el canal de avisos y seguimiento

**Evidencia:** crear la reserva retorna JSON pero no inserta `aviso_cliente` ni dispara notificación (`src/worker/index.ts:1085–1098` y `192–211`). Cancelarla sí inserta aviso (`src/worker/atencion.ts:17`). En la prueba VIP, `/api/avisos` devuelve lista vacía después de la confirmación. El historial `/api/compras` sí conserva la reserva (`src/worker/operacion.ts:31–43`), por lo que **no se afirma que falte todo comprobante persistente**. La UI resetea el formulario tras el éxito (`Reservar.tsx:152–164`) y muestra texto sin ID/personas/fin en el mensaje principal.

**Propuesta:** página o tarjeta de comprobante persistente con identificador, zona, día, inicio/fin, personas, depósito y política, accesible desde la confirmación. Crear aviso interno al confirmar y al cambiar/cancelar. Si se añade correo recordatorio, usar una cola o outbox con referencia única para no duplicar envíos y hacer observable el fallo. Añadir evento de calendario con zona horaria explícita. No enviar mensajes sin preferencias de canal y política definidas.

**Aceptación:** perder la respuesta HTTP no pierde acceso al comprobante; una retransmisión genera un solo aviso; la confirmación coincide con los datos de la base; cada cambio produce nueva versión visible; se mide entrega/fallo del recordatorio sin datos sensibles en logs.

## INT-06 · Se aceptan fechas que no existen

**Evidencia:** `src/worker/index.ts:991–992` usa `new Date(cuando)` y sólo rechaza `NaN`; no valida igualdad con los componentes originales. `src/worker/validacion.ts:2–6` ya tiene una comprobación estricta para fechas de calendario, pero no se usa en el POST de reservas.

**Reproducción:** `2026-11-31T10:00:00-06:00` produce 200 y persiste `2026-12-01T16:00:00.000Z`. Esta entrada requiere API directa o una integración defectuosa; el selector activo de días no genera ese día inexistente.

**Propuesta:** contrato ISO 8601/RFC 3339 explícito y validador de componentes de calendario antes de crear `Date`; exigir zona/offset y decidir precisión admitida para franjas. No confiar en que el parser de JavaScript rechace todas las fechas inválidas.

**Aceptación:** 31 de noviembre, 30 de febrero, zonas ausentes y precisiones no permitidas responden 422 sin reservar ni cobrar; fechas válidas equivalentes con distinto offset se normalizan correctamente.

## Riesgos que requieren evidencia adicional

### R-01 · Aforo físico y tamaño de grupos

`ZONAS.aforo` cuenta mesas/reservas, no personas (`index.ts:971–975`, `1065–1076`); `personas` permite 1–12 para cualquier zona (`1013–1014`). El esquema no asigna una mesa con capacidad determinada. La UI llama a esos números «mesas», por lo que no corresponde interpretar 10 automáticamente como diez sillas ni afirmar un bug aritmético.

Se necesita inventario real: mesas y sillas por zona, combinaciones permitidas, zonas de pie/barra, accesibilidad y capacidad del VIP. Sólo entonces se puede decidir si «12 personas = una reserva» es válido. La aceptación debe incluir que cada grupo confirmado sea acomodable simultáneamente con los demás. Es prioridad operativa P2, con posibilidad de elevarla si el local confirma que el modelo ofrece grupos que no puede sentar.

### R-02 · Coste creciente de ocupación

`index.ts:1126–1148` expande `generate_series` para reservas no canceladas y filtra el día sobre `h`, sin un predicado previo `r.cuando < fin_dia AND r.termina > inicio_dia`. Como las reservas atendidas no adquieren un estado final, el conjunto histórico permanece elegible para esa expansión. Existe índice parcial sobre `cuando` (`db/001_schema.sql:199`), pero esta forma no expresa directamente el rango que lo aprovecharía.

Es un riesgo de eficiencia confirmado por forma del SQL, no una latencia medidamente mala en producción. Antes de optimizar, comparar `EXPLAIN (ANALYZE, BUFFERS)` sobre volumen sintético representativo y medir p95/p99. Acotar por fecha antes de expandir, revisar índice por zona/rango y probar que se conservan intervalos adyacentes y minutos.

### R-03 · Concurrencia real pendiente de ensayo aislado

La implementación tiene el patrón adecuado: fila del socio bloqueada (`index.ts:152`), advisory lock transaccional por zona (`1057`) y cálculo posterior a adquirirlo; VIP añade exclusión GiST (`db/018_clientes_equipo.sql:24–26`). PostgreSQL documenta la duración transaccional de esos bloqueos y que Read Committed toma snapshots por sentencia, lo que respalda el diseño. [Bloqueos de PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html), [aislamiento de transacciones](https://www.postgresql.org/docs/current/transaction-iso.html).

PGlite con una conexión y peticiones secuenciales no verifica carreras entre conexiones ni el runtime Cloudflare. La prueba existente `tests/neon-aislado.mjs:24–25` sólo intenta dos VIP sobre una base remota y usa un fixture anterior; no se ejecutó. Aún hay que probar N clientes sobre último cupo de una zona común, dos cobros simultáneos del mismo saldo, cancelación contra creación, conexión interrumpida antes/después de COMMIT, timeout de lock y reintento tras respuesta perdida. Usar PostgreSQL local multicontenedor o rama de staging nueva autorizada y exclusivamente sintética. Comprobar también el aislamiento configurado en el servidor real.

## Fortalezas verificadas que conviene conservar

1. **Dinero y recurso son una transacción.** La reserva y el cargo se confirman juntos; un rechazo deshace el trabajo (`index.ts:144–210`). El bloqueo del socio protege saldo; `statement_timeout` local es de ocho segundos.
2. **Reintento exacto VIP no recobra.** Lo comprueba la prueba propia con saldo exacto de C$500; también existe regresión en `tests/auditoria.mjs:55–70`.
3. **Inventario por pico simultáneo.** No suma erróneamente todas las reservas que apenas tocan la ventana; agrupa entradas/salidas por instante y permite adyacencia (`1058–1073`). Tests existentes cubren pico intermedio, fronteras y cancelaciones (`tests/auditoria.mjs:73–93`).
4. **Autorización por identidad de sesión.** El cliente no aporta el socio que se cobra: sale del token y se revalida activo (`index.ts:320–324`, `152`). Sin token, la prueba responde 401. Cancelar otra reserva devuelve 404; cancelar la propia gratis es idempotente y permite volver a reservar.
5. **Controles de entrada y horario.** Objetos JSON, límite de cuerpo de 16 KiB, tipos, personas enteras 1–12, duración 1–6, anticipación 30 minutos, horizonte 90 días, domingo desde las 8 y cierre 21. La prueba propia verifica domingo temprano/cierre y las suites existentes tienen casos adicionales.
6. **SQL parametrizado y errores sin datos del cliente.** Parámetros enlazados; mensaje genérico al usuario; log estructurado con código e ID, sin mensaje SQL (`index.ts:109–113`). Cache-Control no-store para API.
7. **Separación del equipo.** La agenda requiere sesión de personal; cocina sólo accede a preparación de pedidos (`index.ts:304–316`, `panel.ts:12–14`). MFA obligatorio para propietario/encargado y CSRF para mutaciones del equipo son controles presentes, aunque no se reauditaron exhaustivamente aquí.
8. **Cierre de conexiones y observabilidad.** El cliente de Neon nace por solicitud y se cierra por `waitUntil` en el ejecutor (`index.ts:141`, `223`); la otra utilidad lo cierra en `finally` (`operacion.ts:7–13`). Neon exige respetar el ciclo de solicitud en Workers; la documentación oficial respalda uso de `Client` para transacciones. [Repositorio oficial del driver Neon](https://github.com/neondatabase/serverless). Configuración declara `nodejs_compat` y observabilidad; no se considera por sí sola la antigüedad de `compatibility_date` un defecto funcional. [Prácticas de Cloudflare Workers](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).

## Cobertura y siguiente validación

Ejecutado desde la raíz del workspace:

```powershell
node research_reservas_2026-10-08/integridad/repro.mjs
```

Resultado: siete grupos correctos, registrados el `2026-10-09T03:19:46.471Z` (8 de octubre, 21:19 en Managua). Las fechas sintéticas de noviembre están dentro del horizonte en la fecha de auditoría; al reutilizar el script más adelante deben actualizarse junto con el caso de calendario imposible.

No ejecuté nuevamente toda la batería general ni pruebas de navegador: esta rama se concentró en reproducciones nuevas y lectura de cobertura existente. No se validó el esquema desplegado, volumen real, reglas WAF, entrega de correo, aforo del local ni procedimientos manuales. La conclusión aplica al código activo presente en el workspace; confirmar paridad de despliegue corresponde a la síntesis principal.

Orden recomendado: (1) reglas contra acaparamiento y comprobante real; (2) cambios/cancelación/depósito con política acordada; (3) agenda operativa y capacidad física; (4) recordatorios, métricas y eficiencia bajo carga. Evitar reescribir las transacciones y el cálculo de intervalos que ya corrigen fallos anteriores; extenderlos con pruebas de regresión dirigidas.
