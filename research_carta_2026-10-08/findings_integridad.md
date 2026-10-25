# Carta: integridad, seguridad y operación

Auditoría realizada el 8 de octubre de 2026. Base de las rutas de código: `C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/`.

## Alcance y evidencia

Revisión del catálogo, carrito, transporte HTTP, envío, recibos idempotentes, permisos, preparación, cancelación y devolución. Se revisaron código y migraciones locales; no se verificó que este código y estas migraciones sean exactamente los desplegados. No se leyeron archivos de secretos ni se enviaron pedidos reales.

El experimento [integridad-local.mjs](./integridad-local.mjs) utiliza `tests/soporte-perfiles-equipo.mjs`, PostgreSQL PGlite en memoria y un bundle temporal con el mismo Worker. El driver sustituye Neon por la base en memoria; `fetch` externo está bloqueado. Los cambios de catálogo se aplican exclusivamente al array del bundle temporal en memoria para simular una publicación mientras un cliente conserva una versión anterior. El código de aplicación no se modificó. Resultado completo: [integridad-local-resultados.json](./integridad-local-resultados.json). Ejecución: `node research_carta_2026-10-08/integridad-local.mjs` desde la raíz del proyecto; terminó con código 0.

Se hicieron tres búsquedas web y se consultaron fuentes primarias. La documentación externa respalda criterios; los fallos concretos se sustentan en el repositorio y el experimento local. P1 significa resolver antes de ampliar la operación real; P2, siguiente iteración. La severidad comercial depende de frecuencia y políticas aún no confirmadas.

## Fallos reproducidos mediante API local

### I01 — P1: un cambio de carta rompe la recuperación de un cobro ya efectuado

**Confianza alta.** Primero se envió Latte × 1 con referencia estable y se confirmó un cobro. Con catálogo estable, repetir devolvió 200, `repetido:true` y el mismo pedido. Cambiar el precio de Latte en la copia del servidor hizo que la misma solicitud devolviera 409, «Esa referencia pertenece a otra operación». Cambiar solo el nombre produjo también 409. Retirar Latte devolvió 422 antes de consultar el recibo. Se verificó que siguiera existiendo exactamente un pedido y un asiento: este fallo no duplica automáticamente el cargo, pero impide resolver con certeza un envío que perdió su respuesta.

**Causa:** `src/worker/index.ts:754–767` valida y recalcula con el catálogo vigente antes de entrar en la transacción. En `:782` la huella incorpora el precio calculado y el concepto derivado del nombre. `:159–168` compara esa nueva huella con la original y rechaza el recibo existente. El cliente, `src/casa/pantallas/Pedir.tsx:113–115`, considera esos 4xx definitivos y libera la edición, aunque el cobro original ya puede existir. No hay una consulta de pedido por referencia en el flujo de Carta; la recuperación consiste en volver a enviar el POST.

**Impacto:** basta una corrección normal del catálogo entre envío y reintento. La promesa visible «el mismo pedido no se cobra dos veces» se apoya en una recuperación que deja de funcionar al cambiar datos del servidor. El cliente puede vaciar y comenzar otra referencia sin haber reconciliado la primera.

**Mejora:** vincular la idempotencia a la identidad autenticada y a una representación canónica de la intención original; resolver un recibo existente antes de revalorar contra un catálogo nuevo. Guardar el pedido enviado como documento inmutable y ofrecer consulta explícita de su resultado por referencia. Un conflicto de referencia debe conducir a conciliación, sin equipararse automáticamente a un pedido no cobrado.

**Aceptación:** perder la respuesta, cambiar precio/nombre/disponibilidad y reintentar devuelve el recibo original; un cambio real en las cantidades con la misma referencia devuelve conflicto; en ambos casos queda un solo asiento. La consulta de estado nunca inicia un cobro.

### I02 — P1: el total confirmado por el cliente no está vinculado al que cobra el servidor

**Confianza alta; escenario simulado de cliente desactualizado.** El cliente original tenía Latte a 9.500 centavos (C$95). Al cambiar solo la copia del servidor a 10.500 centavos, el POST de las mismas líneas con una referencia nueva cobró C$105 y devolvió 200 sin solicitar una nueva confirmación. No es manipulación del precio por el cliente: el servidor correctamente impone su precio, pero falta el acuerdo previo sobre ese importe.

**Evidencia:** el cliente calcula con `CARTA` empaquetada, `src/casa/pedido.tsx:129–137`; la pantalla muestra ese total y decide si alcanza el saldo, `src/casa/pantallas/Pedir.tsx:92–93,262–289`; `src/casa/datos.tsx:213–217` envía solo líneas y referencia. El servidor recalcula en `src/worker/index.ts:754–763` sin verificar una cotización/versionado aceptado. El comentario `Pedir.tsx:118–120` reconoce diferencias, pero la información llega después de cobrar y normalmente navega a Compras en `:127`.

**Mejora:** cotización del servidor con desglose, versión y vencimiento, confirmada antes de efectuar el cargo. Puede utilizarse también un total esperado como precondición de concurrencia, siempre recalculando el precio autoritativo en servidor y rechazando diferencias; no debe convertirse en precio confiado al cliente.

**Aceptación:** cambiar precios con una pestaña abierta muestra la diferencia antes del cargo y exige confirmación; saldo y total visibles corresponden a esa cotización; nunca se carga un total mayor al confirmado. Un reintento de una compra ya confirmada sigue devolviendo su precio histórico.

### I03 — P2: el límite de cantidad se elude repitiendo el ID en varias líneas

**Confianza alta.** Una línea Latte × 21 fue rechazada con 400. En cambio, 40 líneas idénticas Agua × 20 se aceptaron con 200, generaron 800 unidades del mismo producto y un cargo sintético de 4.800.000 centavos (C$48.000). La cuenta del fixture se dotó de saldo sintético suficiente. No hay cobro incorrecto aritméticamente: el problema es la falta de un límite de negocio por producto/pedido, si el máximo de 20 pretende proteger capacidad operativa.

**Causa:** `src/worker/index.ts:749` limita el número de líneas a 40; `:752–760` limita cada línea a 20 sin detectar duplicados ni agregar por producto.

**Mejora:** declarar si el máximo corresponde a producto, línea o pedido; normalizar por combinación de producto y modificadores, rechazar duplicados ambiguos y aplicar límites agregados de unidades/importe/capacidad. La interfaz debe compartir el contrato.

**Aceptación:** repartir 21 unidades de un mismo SKU entre varias líneas no permite sortear un tope de 20. Probar también 0, negativas, decimales, cadenas, duplicados y 40/41 líneas. Las cantidades inválidas ya se rechazan correctamente en el servidor.

## Fallos inferidos directamente del código; reproducción de navegador a cargo de la auditoría principal

### I04 — P1: retirar un producto puede dejar un pedido pendiente imposible de resolver

**Confianza alta en la ruta de código, pendiente de prueba UI.** `src/casa/pedido.tsx:66–69` elimina al restaurar las líneas cuyos IDs ya no existen en `CARTA`, incluso si `pendiente:true`, y conserva ese estado y referencia. Si todas las líneas desaparecen, `src/casa/pantallas/Pedir.tsx:217–219` muestra solo el estado vacío. El botón de pago/reintento y el de vaciar están en la rama no vacía; las adiciones están deshabilitadas por `pedido.pendiente` (`:179,208`) y el proveedor rechaza cambios (`pedido.tsx:86,122`). Así una actualización normal puede bloquear toda nueva compra en esa pestaña/cuenta.

**Mejora:** separar borrador editable y solicitud enviada inmutable. Una solicitud pendiente no se filtra ni reinterpreta con la carta actual; se consulta por referencia y se muestra con su snapshot histórico. Incluir una salida asistida si el servidor no puede determinar el resultado.

**Aceptación:** restaurar un pendiente con uno o todos los productos retirados conserva el comprobante y permite consultar su resultado. Nunca aparece un callejón sin salida que requiera borrar manualmente el almacenamiento del navegador.

### I05 — P2: la interfaz permite pedidos que su servidor rechaza por cantidad

**Confianza alta.** `src/casa/pedido.tsx:99–109` incrementa sin tope. Lo mismo ocurre en ficha `src/casa/pantallas/DetalleCarta.tsx:65` y carrito `src/casa/pantallas/Pedir.tsx:245–253`; la ficha suma la cantidad nueva a la ya existente en `:208`. El servidor rechaza más de 20 por línea (`src/worker/index.ts:757–758`) y más de 40 líneas (`:749`), sin aviso preventivo en la UI.

**Mejora y aceptación:** límite visible y compartido entre ficha, lista y carrito; suma acumulada nunca excede el máximo; al llegar al tope se explica cómo solicitar un pedido mayor. Probar incrementar desde 19, abrir ficha con 19 ya añadidos y restaurar un carrito antiguo que exceda límites.

## Riesgos operativos y vacíos de producto; requieren decidir políticas

### I06 — P1: faltan disponibilidad, cierre de cocina y control de capacidad antes del cargo

**Hecho de código:** `PlatoCarta` (`src/data/menu.ts:6–23`) no tiene disponibilidad, horario, cupo ni versión. El endpoint de cobro consulta únicamente el array estático y el saldo (`src/worker/index.ts:747–793`). Una categoría llamada Brunch es organización editorial, no una restricción de venta. `MOMENTOS` tiene estimaciones fijas de 6/15/22/5 minutos (`menu.ts:25–53`) y Carta toma el máximo por categoría, sin cantidad ni cola (`Pedir.tsx:95–99,143–146`). La preparación se confirma después de debitar (`:294–296`).

**Riesgo:** pedidos pagados cuando no hay ingredientes, el local está cerrado o la cocina no puede cumplir la estimación. No se afirmó que esto esté ocurriendo hoy: falta contrastar el procedimiento operativo real.

**Mejora:** catálogo operativo consultable, productos agotados, pausas globales/categoría, horario de recepción y ventana de retiro; revisar esas condiciones dentro de la misma decisión que crea el pedido. Si no hay inventario por unidad, al menos disponibilidad manual con responsable y vencimiento. Diferenciar tiempo orientativo de promesa confirmada.

**Aceptación:** marcar agotado impide un nuevo cargo aunque la pestaña sea antigua; fuera del horario no se cobra; un cambio de disponibilidad concurrente se resuelve sin sobreventa; estado y próxima apertura tienen mensajes explícitos. Medir cancelaciones por agotado y diferencia entre tiempo anunciado y real.

### I07 — P1/P2: el pedido no transmite elecciones necesarias para preparar varios productos

**Evidencia:** Ensalada Lupita ofrece camarón, pollo o res (`src/data/menu.ts:99`); Risotto y La Bella Lupita ofrecen huevo al gusto (`:108,111`); Agua dice fría o al tiempo (`:79`). La ficha admite únicamente cantidad (`src/casa/pantallas/DetalleCarta.tsx:65–66`), la línea enviada es `{id,cuanto}` (`src/casa/pedido.tsx:27`) y el Worker conserva `{id,nombre,precio,cuanto}` (`index.ts:786`). Por tanto esas elecciones no forman parte del comprobante ni llegan a cocina.

El perfil permite guardar alergias (`src/worker/cuenta-cliente.ts:15–25,37`), pero la consulta de pedidos y su lista positiva para cocina no las incluyen (`src/worker/operacion.ts:58`; `src/worker/pedido-publico.ts:2–14`; también `src/worker/panel.ts:35`). Esto es un riesgo de expectativas: no se debe asumir que una alergia guardada se aplica al pedido. La minimización de datos de cocina es una protección valiosa, no debe eliminarse indiscriminadamente.

**Mejora:** variantes y modificadores estructurados, obligatorios donde corresponde, validados y tarifados por servidor; resumen explícito antes de pagar. Para observaciones y alergias, definir con la casa un procedimiento de confirmación y transmitir únicamente la información pertinente y confirmada para esa preparación. No prometer garantías dietéticas a partir de etiquetas informales.

**Aceptación:** no se puede pedir Ensalada Lupita sin elegir proteína si no existe una opción predeterminada comunicada; cocina y comprobante reciben la misma selección. Si el perfil tiene una restricción, la aplicación aclara su uso y obtiene la confirmación operativa correspondiente. Las opciones no pueden añadir cargos no aceptados.

### I08 — P2: la política de cancelación y el seguimiento dejan excepciones sin resolver

**Hechos:** la máquina de estados solo permite cancelar `recibido` o `aceptado`; `preparando` solo pasa a `listo` (`src/worker/operacion.ts:74–75`). La devolución completa restituye cargo y puntos dentro de una transacción (`:77–86`). El cliente no cancela pedidos; en Mis compras solo puede cancelar ciertas reservas (`src/casa/pantallas/MisCompras.tsx:29–31`) y tiene atención genérica. El estado se consulta al montar o mediante Actualizar (`:13–23`), sin actualización automática de pedidos activos ni marca visible de cuándo se obtuvo ese estado.

**Riesgo:** una rotura/agotamiento detectados durante preparación, errores parciales o una imposibilidad de entrega requieren un procedimiento fuera de esta máquina. No necesariamente se debe permitir que cualquier usuario cancele; la política debe ser explícita y auditable. Pedir al cliente que consulte continuamente reduce la utilidad del seguimiento.

**Mejora y aceptación:** definir quién puede abortar por causa operativa, qué compensación corresponde y cómo registrar cambios parciales, sin saltarse auditoría ni duplicar devoluciones. Mostrar condiciones antes de pagar. Actualizar estados activos al recuperar foco y con sondeo moderado; indicar última consulta y estado sin conexión. Medir tiempo hasta aceptación y pedidos abandonados en cada estado.

### I09 — P2: persistencia limitada y validación débil del contrato de confirmación

`src/casa/pedido.tsx:80–95` continúa solo en memoria si `sessionStorage` falla; cerrar la pestaña normalmente elimina también la referencia de intento. Recuperar luego el historial permite ver compras, pero no ofrece reconciliación directa por intención pendiente. Además `src/casa/datos.tsx:159` valida para `/cuenta/cobrar` únicamente saldo y monto: una respuesta 200 sin un `pedido` válido puede vaciar el carrito y mostrar la confirmación alternativa (`Pedir.tsx:121–134`), aunque el contrato de una compra de Carta debería exigir su comprobante.

**Mejora y aceptación:** distinguir duración del borrador de retención del intento enviado; almacenar/reconciliar intentos pendientes duraderamente por cuenta. Validar `pedido.id`, número, estado y total en la respuesta de este flujo. JSON parcial, almacenamiento no disponible y cierre tras un commit deben conducir a conciliación sin permitir un cargo accidental por recreación del intento.

### I10 — P2: prevención de abuso y observabilidad de pedidos incompletas en esta capa

La API tiene límite de cuerpo de 16 KiB y validación JSON (`src/worker/index.ts:70–81`), autenticación y bloqueo por cuenta, pero no se encontró un límite de frecuencia específico en `/api/cuenta/cobrar` (`:727–794`). Los errores internos registran solo código e identificador aleatorio (`:109–113`) y devuelven mensaje genérico; el identificador no se entrega al cliente ni se enlaza a referencia/ruta en ese registro. Los cobros sí generan auditoría con referencia (`:197–199`). No se inspeccionaron reglas de Cloudflare ni monitorización externa: no debe afirmarse que no existan límites o alertas fuera del código.

**Mejora y aceptación:** medir tasa de envíos/reintentos, conflictos idempotentes, tiempos de aceptación y fallos por producto, con identificador correlacionable y mínima información personal. Límites por cuenta/fuente deben preservar reintentos de una misma referencia y distinguirlos de compras nuevas. Alertar sobre acumulación de pedidos sin aceptar y cancelaciones reiteradas.

## Controles sólidos que conviene preservar

- El cliente no dicta ni precio ni concepto del cargo; cantidades negativas, cero, fraccionarias, cadenas y 21 por línea fueron rechazadas en el experimento. `src/worker/index.ts:747–770`.
- Cada compra bloquea la cuenta con `FOR UPDATE`, comprueba saldo, crea pedido, registra cargo y guarda recibo dentro de una transacción; la respuesta se envía tras COMMIT. `src/worker/index.ts:144–211,783–793`. Esto está alineado con la protección de filas que documenta PostgreSQL, aunque PGlite no sustituye pruebas reales de contención/concurrencia.
- Recibos y pedidos tienen claves únicas por socio/referencia: `db/010_integridad.sql:5–13`; `db/012_operacion.sql:27–38`. El cliente conserva referencia y bloquea edición durante resultado incierto, `src/casa/pedido.tsx:80–89,121–126`; los timeouts/errores de red y 5xx de escritura son inciertos, `src/casa/http.ts:23–45`.
- Separación por cuenta mediante key de React y sessionStorage, `src/casa/App.tsx:169–172`, más descarte de respuestas de otra sesión, `src/casa/http.ts:21–27`. La sospecha de interferencia por cookie de personal quedó **descartada**: `src/worker/equipo-sesion.ts:24` exige `x-equipo-solicitud:1`; cliente Bearer + cookie de personal devuelve `/yo` y cobro 200 para el socio correcto en prueba local.
- Solo el equipo modifica preparación; cocina solo puede marcar preparando/listo. Permisos en `src/worker/operacion.ts:62–75`. Los datos enviados a cocina se reducen mediante lista positiva, `pedido-publico.ts:2–14`.
- Cancelación y devolución completa son atómicas, verifican el cargo original y revierten sus puntos; índice único evita devolver el mismo asiento dos veces, `operacion.ts:77–86`, `db/012_operacion.sql:102–103`. `db/015_saldo_cronologico.sql:20–43` conserva el reparto original bono/pagado.
- Respuestas privadas sin caché, límite de cuerpo, consultas SQL parametrizadas y cabeceras de seguridad: `src/worker/index.ts:61–81`, `src/worker/cabeceras.ts:5–17`.

## Cobertura existente y casos que faltan

`tests/operacion.mjs:31–53` cubre persistencia, repetición, transiciones y devolución. `tests/correcciones-cliente-ui.mjs:89–109` prueba respuesta perdida más recarga de página con catálogo estable. `tests/correcciones-cliente.mjs:168–206` cubre resultados inciertos; `tests/correcciones-servidor.mjs:144–164` comprueba minimización para cocina. Es una base útil, pero no cubre las combinaciones de cambio de catálogo con intento pendiente ni cotización anterior. La auditoría principal ejecuta las suites pertinentes; aquí no se atribuye éxito a pruebas no ejecutadas.

Casos prioritarios nuevos: precio/nombre/retirada tras commit sin respuesta; precio cambiado antes del primer commit; 20/21 acumulados desde ficha/lista/carrito; duplicados por ID; pendiente sin productos visibles; almacenamiento fallido; falta de `pedido` en 200; cocina pausada/agotados; selección obligatoria; cambio de cuenta durante envío. Las pruebas concurrentes deben ejecutarse después en una base aislada con conexiones PostgreSQL reales: PGlite en memoria no acredita la contención de producción.

## Fuentes primarias consultadas

1. [OWASP — Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html): la información significativa que el usuario confirma debe corresponder a lo que se ejecuta, y la verificación corresponde al servidor. Se aplica a I02 como principio de diseño; no implica exigir MFA para cada café.
2. [OWASP — Business Logic Security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html): valores autoritativos en servidor, estados explícitos, idempotencia vinculada al solicitante y solicitud original, controles de concurrencia y límites por función. Sustenta I01, I03, I06 e I10; la propuesta concreta de arquitectura es inferencia de esta auditoría.
3. [Stripe — Idempotent requests](https://docs.stripe.com/api/idempotent_requests): referencia primaria de recuperación mediante clave y resultado almacenado, con rechazo de parámetros realmente distintos. Es un patrón comparable; la app no utiliza Stripe para su Cuenta de Casa y no se propone incorporar Stripe por este motivo.
4. [PostgreSQL — Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html): `FOR UPDATE` mantiene la exclusión sobre la fila hasta terminar la transacción. Respalda la valoración positiva del bloqueo de cuenta; no demuestra por sí solo que todos los caminos futuros respeten el mismo bloqueo.

