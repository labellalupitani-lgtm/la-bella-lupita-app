# Auditoría Tienda — integridad técnica y operación

Fecha de referencia: 8 de octubre de 2026, America/Managua. Código revisado: carpeta actual `club-lupita`; no se usaron respaldos como prueba de comportamiento actual. No se contactó la base de producción ni se compró, entregó, publicó o notificó nada real.

## Dictamen

El núcleo de cobro tiene defensas importantes: transacción, bloqueo por cliente, precio calculado en servidor, inventario bloqueado, recibo idempotente previo a consultar saldo, historial durable y entrega única con responsable. La regresión actual de API pasa. Los riesgos principales restantes están en **lo que el cliente consiente**, **la recuperación después de una respuesta perdida** y **el ciclo operativo de una preventa**.

Dos problemas requieren prioridad alta: se puede cobrar un precio superior al mostrado sin nueva confirmación; una compra confirmada en el servidor puede quedar sin recuperación accesible desde Tienda tras recargar si el saldo resultante es insuficiente o era la última bolsa. No se ha demostrado un doble cobro con una misma referencia, saldo negativo por compras concurrentes, exposición de compras ajenas ni entrega por un cliente normal.

## Alcance y método

- Lectura de `src/casa/pantallas/Tienda.tsx`, transporte y estado compartido, idempotencia local, MisCompras, Worker y migraciones de inventario, compras, saldo y operación.
- `node tests/regresion.mjs`: **12 grupos aprobados** sobre código actual y base PGlite aislada.
- `node tests/operacion.mjs`: **aprobado**; incluye separación de roles, entrega única, recibo persistente, atención y privacidad.
- `integridad-pruebas.mjs`: **8 escenarios documentados**, ejecutando el Worker actual con fixture local en memoria. Salida: `integridad-resultados.json`.
- `integridad-contrato.mjs`: compila el cliente actual en memoria y sustituye solamente `fetch`; confirma dos respuestas incompletas aceptadas. Salida: `integridad-contrato-resultados.json`.
- Prueba UI del coordinador, sin duplicar ejecución: `ui-pruebas.mjs` y `evidencia-ui/resultados.json` confirman pérdida de respuesta con saldo exacto, catálogo parcial con C$NaN y compra parcial con «bolsa undefined».
- Concurrencia real entre conexiones PostgreSQL: **no ejecutada**. El fixture PGlite y los tests heredados no bastan para afirmar haber validado todas las carreras de Neon. Las observaciones sobre `SKIP LOCKED` se distinguen como análisis estático respaldado por PostgreSQL.
- Estado de producción, mezcla efectiva de precios, fecha real de cosecha y políticas comerciales: **no verificados**. Los fallos de precio fueron provocados en datos sintéticos para demostrar que el contrato los permite.

Prioridades: P1 alta — corregir antes de depender del flujo comercial; P2 media — fiabilidad u operación que requiere corrección; P3 mejora — no demuestra un perjuicio actual. Confianza alta significa evidencia directa de código o ejecución, no que ya haya ocurrido a clientes.

## INT-01 — El importe confirmado no vincula el importe cobrado

**P1 · Confianza alta · Reproducido en API actual.**

La pantalla y el diálogo muestran `bolsa.precio`, pero el POST sólo contiene la referencia. El catálogo usa el precio mínimo de todas las filas, incluso bolsas vendidas. El cobro selecciona la primera libre y usa su precio individual. Además, una subida entre consulta y confirmación es aceptada sin pedir nuevo consentimiento. Que el servidor imponga su precio evita abaratar desde el navegador, pero no garantiza que sea el precio que aceptó el comprador.

Evidencia:

- `src/casa/pantallas/Tienda.tsx:58`, `:269`: compra y precio del diálogo.
- `src/casa/datos.tsx:242`: el cuerpo transmite `{ref}`.
- `src/worker/index.ts:410`: catálogo con `min(precio)` sin filtrar disponibilidad.
- `src/worker/index.ts:875`: selección de primera bolsa libre; `:882`: precio que se cobra.
- `db/001_schema.sql:152`: cada número tiene su propio precio, sin restricción de uniformidad por lote.

Reproducciones locales:

1. GET catálogo devuelve **C$890**. Se modifica el precio sintético a **C$990**. POST con una referencia nueva: HTTP200 y cobro **C$990**.
2. Bolsa1 ya vendida a **C$890**; bolsa2 y siguientes libres a **C$990**. GET anuncia **C$890**, POST asigna bolsa2 y cobra **C$990**.

Aceptación: el servidor genera una oferta identificada por lote, versión, importe y moneda; la confirmación envía esa identidad. Dentro de la transacción se comprueba vigencia y coincidencia. Un cambio relevante devuelve un conflicto recuperable sin asignar ni cobrar y presenta el nuevo precio para confirmarlo. El importe cliente nunca sustituye al precio de servidor. Si todo el lote debe tener un precio, modelarlo como propiedad del lote, no como un mínimo sobre unidades independientes.

Contraste: OWASP recomienda que los datos significativos de una transacción puedan verificarse y queden protegidos frente a cambios durante autorización. La aplicación pertinente aquí es vincular importe y producto al consentimiento; no se recomienda añadir OTP a cada bolsa por defecto. [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html).

## INT-02 — Saldo e inventario bloquean la recuperación de una compra incierta

**P1 · Confianza alta · Reproducido en API y UI actuales.**

El servidor puede recuperar un recibo aunque el saldo ya sea cero: lo busca antes de leer el saldo o tomar inventario. Sin embargo, Tienda sólo ofrece el botón normal de compra cuando hay unidades y saldo para una compra nueva. Tras perderse una respuesta y recargar, deja de ofrecer el camino que reenviaría la referencia persistida si el cargo ya consumió el saldo o agotó el lote. La llave permanece guardada, pero el módulo no la usa para conciliar automáticamente ni presenta «Comprobar mi compra».

Evidencia:

- `src/casa/compras.ts:4`: referencia persistente por socio y operación.
- `src/casa/pantallas/Tienda.tsx:47`: disponibilidad por saldo; `:141`: rama agotada; `:151`: botón deshabilitado; `:53`: llave sólo se lee al comprar.
- `src/casa/pantallas/Tienda.tsx:60`: el resultado incierto sólo se transforma en texto de error.
- `src/worker/index.ts:158`: recibo consultado antes de `saldo_de` en `:171`.
- `tests/ui.mjs:41`: el test heredado de respuesta perdida usa saldo/stock holgados; no cubre los extremos anteriores.

Pasos: saldo inicial de C$890 a C$1,779, precio C$890; dejar que el POST haga COMMIT, interrumpir únicamente su respuesta, recargar Tienda. Alternativa derivada del código: misma secuencia con la última unidad. Ahora el saldo o inventario resultante bloquea Apartar. El comprobante sí existe en Mis compras, pero no se proporciona enlace de recuperación desde el error ni se cierra la referencia pendiente por consultar ese historial.

La prueba UI del coordinador confirmó con saldo exacto C$890: una compra persistida, referencia pendiente conservada, recarga mostrando «Te faltan C$890», CTA deshabilitado y ausencia de reconciliación contextual (`evidencia-ui/resultados.json`).

Aceptación: estado de intento pendiente visible y persistido, independiente del CTA para nueva compra; consulta autenticada por referencia o repetición segura explícita que permita recuperar aun con saldo cero/agotado. El resultado conduce a un comprobante permanente, cierra sólo el intento confirmado y nunca crea una nueva referencia para resolver incertidumbre. Cubrir recarga, salida y entrada, última unidad y saldo justo.

## INT-03 — Un reintento muestra el saldo histórico como saldo actual

**P2 · Confianza alta · Reproducido.**

El recibo idempotente incluye el saldo que quedó al hacer la compra original. Después de otros movimientos, su reenvío conserva esa cifra. Tienda la presenta como «te quedan …». El refresco posterior cambia el saldo compartido, pero no el texto de `hecho`, calculado antes.

Evidencia: `src/worker/index.ts:168` devuelve la respuesta almacenada; `:203` construye el recibo con saldo; `src/casa/pantallas/Tienda.tsx:66` construye el mensaje y `:71` refresca después.

Prueba: primera compra deja **C$8,910**; segunda compra deja **C$7,920**; repetir la referencia primera devuelve **C$8,910**, `repetido:true`, misma bolsa. Tras otro consumo sintético que deja saldo cero, el mismo reintento sigue devolviendo **C$8,910**.

Aceptación: separar datos históricos inmutables del recibo de la lectura actual de cuenta. El texto puede decir «Saldo después de esta compra: …» o usar una lectura actual confirmada y fechada. La UI debe distinguir recuperación de recibo de una nueva compra. La respuesta debe incluir identificador permanente y generación/lote para abrir el comprobante correcto.

## INT-04 — Validación parcial acepta catálogo y recibo sin sus campos esenciales

**P2 · Confianza alta · Reproducido en cliente compilado y UI con transporte simulado.**

`respuestaValida` sólo exige objetos `bolsa`/`membresia` y arrays de catálogo. Para apartar, comprueba saldo e importe, pero no número de bolsa, unidades restantes, total ni identificador. Un HTTP200 con `{saldo:{pagado:1000,bono:0,total:1000},cobrado:89000}` es declarado éxito. Tienda renderiza `bolsa undefined` y elimina la referencia, por lo que un siguiente intento con nueva llave puede transformarse en otra compra si la respuesta incompleta sucedió después de un cobro real.

Evidencia: `src/casa/datos.tsx:156`, `:159`, `:170`; `src/casa/pantallas/Tienda.tsx:67`, `:70`.

La prueba UI del coordinador confirmó catálogo parcial con C$NaN y mensaje de éxito «bolsa undefined» (`evidencia-ui/resultados.json`).

Aceptación: esquema de respuesta por operación y catálogo, no sólo por sufijo `/apartar`; enteros monetarios seguros, rango de número, inventario coherente, lote/ID y campos obligatorios. Cualquier escritura con respuesta incompleta conserva `resultadoIncierto` y la misma referencia. Probar 200 incompleto, tipos erróneos, números negativos y `null`. No se observó que el Worker actual omita campos en su funcionamiento normal; es una falta de resistencia ante fallos o cambios de contrato.

## INT-05 — La preventa no tiene un ciclo completo de entrega y resolución económica

**P2 · Confianza alta en implementación; política comercial pendiente.**

Se cobra al apartar, pero la entrega queda definida como «cuando entre la temporada». La compra tiene sólo fecha de compra y fecha de entrega. No existe lote con fecha/ventana de disponibilidad, aviso de lista para retiro, vencimiento, demora, cancelación o reembolso de bolsa. Atención puede responder y cerrar una solicitud; no cambia compras ni mueve dinero. La devolución existente corresponde a pedidos de la carta, no a Reserva de Cosecha.

Evidencia:

- `src/casa/pantallas/Tienda.tsx:125`, `:268`: promesa de entrega indeterminada.
- `db/012_operacion.sql:65`: campos de `compra_bolsa`.
- `src/casa/pantallas/MisCompras.tsx:32`: sólo pendiente o entregada.
- `src/worker/mostrador.ts:43`: transición directa a entregada, con actor y auditoría.
- `src/worker/atencion.ts:48`: resolver Atención sólo guarda respuesta/aviso/auditoría.
- `src/casa/equipo/Lecturas.tsx:41`: el texto operativo advierte que responder no mueve dinero.
- `src/worker/operacion.ts:77`: devolución exacta implementada exclusivamente para pedido.

Aceptación: definir y comunicar una ventana de retiro real antes del cobro, con responsable de actualizarla. Estados de preventa coherentes (pagada, lista para retirar, entregada, cancelada/reembolsada) con transiciones permitidas. Si la casa autoriza devolución por cancelación o imposibilidad de entrega, ejecutarla en una operación idempotente que restituya la composición original de saldo y puntos, registre actor/motivo, actualice compra y gestione si corresponde liberar inventario. No confundir responder Atención con resolver la obligación económica. Una prueba de entrega actual sí pasó: cliente403, empleado autorizado200, repetición409, una auditoría con responsable individual.

Hay una dependencia de datos: `compra_bolsa` no guarda relación explícita con el asiento o la solicitud que la pagó; el recibo POST no incluye `compra_bolsa.id`. Unirlos con claves durables simplifica comprobantes y devoluciones verificables. Hoy hay que reconstruir relaciones indirectas de número/generación, fecha, cliente e importe; no es apropiado basar el reembolso en coincidencias aproximadas.

## INT-06 — Una fila bloqueada puede anunciar agotamiento que aún no existe

**P2 · Confianza alta por semántica SQL; no reproducido con múltiples conexiones en esta revisión.**

Se usa `FOR UPDATE SKIP LOCKED`. Si sólo queda una bolsa y otra transacción la retiene temporalmente, el selector no devuelve filas. El endpoint responde «Las ciento cincuenta están apartadas… noviembre». La transacción que retiene la bolsa aún puede fallar por saldo insuficiente o revertir; en ese caso la bolsa nunca llegó a venderse. Tienda tampoco refresca inventario al recibir ese409.

Evidencia: `src/worker/index.ts:875–883`; `src/casa/pantallas/Tienda.tsx:60–63`.

Aceptación: distinguir falta de stock confirmada de contención transitoria. Bajo contención, respuesta recuperable/Retry-After y misma referencia; bajo agotamiento real, estado actualizado. Prueba con dos conexiones reales: A bloquea última bolsa y revierte; B no debe recibir un mensaje definitivo de agotamiento o de apertura futura inventada. La fecha noviembre debe salir de datos operativos, o desaparecer si aún no está confirmada.

PostgreSQL documenta que `SKIP LOCKED` omite filas bloqueadas y produce una vista inconsistente, adecuada para colas. Sirve para asignar unidades sin choque, pero la ausencia de filas no prueba que no queden unidades a futuro inmediato. [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html).

## INT-07 — Identidad de cosecha y denominador de escasez no son un contrato completo

**P2 para identificación entre cosechas; P3 para denominador fijo · Confianza alta.**

La base conserva generación/número e historial durable, lo cual está bien. Sin embargo, la respuesta inmediata no lleva generación ni ID permanente; el cliente muestra sólo número; la lista operativa tampoco presenta generación. Dos compras del mismo número en cosechas distintas se distinguen por fecha/UUID, pero no por nombre del lote. La afirmación «No hay dos iguales» queda insuficientemente acotada al lote.

El catálogo toma `max(generacion)` de filas y anuncia siempre total150. No hay entidad de lote activo ni garantía que todas las filas pertenezcan a una sola generación. El script sintético confirma que con dos filas reales el catálogo sigue diciendo total150. Esto no demuestra un inventario de producción incompleto; demuestra que el denominador no se verifica contra una configuración explícita del lote.

Evidencia: `db/005_generacion.sql:7`, `db/012_operacion.sql:68–74`; `src/worker/index.ts:410–429`, `:899`; `src/worker/operacion.ts:39` sí entrega generación al historial; `src/casa/pantallas/MisCompras.tsx:27` no la muestra; `src/worker/panel.ts:44` genera detalle sólo con número; `src/casa/pantallas/Tienda.tsx:113–114`.

Aceptación: lote activo con identidad comercial, precio, cupo, apertura/cierre y ventana de entrega; el número es único dentro de lote. Catálogo, recibo, Mis compras y caja muestran la misma identidad. El denominador deriva de capacidad del lote validada; un catálogo sin inventario/configuración válida muestra no disponible, no C$0 como si fuera precio. Mantener el historial de cosechas anteriores y probar compra/entrega de dos bolsas con el mismo número en generaciones distintas.

## Controles correctos que deben preservarse

| Control | Evidencia actual | Validación de esta revisión |
|---|---|---|
| Precio no decidido por el cliente | `src/worker/index.ts:882` | El API cobra DB, no parámetros extra |
| Cobro, inventario, recibo y auditoría en una transacción | `src/worker/index.ts:144–210` | Compra sin saldo revierte sin crear compra |
| Serialización de compras por socio | `src/worker/index.ts:152` | Lectura estática; no benchmark multiconexión |
| Repetir referencia devuelve misma compra antes de comprobar saldo | `src/worker/index.ts:158–168` | Mismo número, un cargo, funciona con saldo cero |
| Referencia usada por otra operación es rechazada | `src/worker/index.ts:165` | HTTP409 |
| Historial conserva propiedad y generación | `src/worker/operacion.ts:36–41` | Otra cuenta no ve las bolsas; tests de reciclaje pasan |
| Entrega sólo personal y una sola vez | `src/worker/mostrador.ts:38–45` | 403/200/409, una auditoría, actor individual |
| Timeouts y escritura incierta | `src/casa/http.ts:3–45` | Lectura de implementación; limitación de20s y errores específicos |
| Descarte de respuestas de cuenta anterior | `src/casa/http.ts:23–27`, `src/casa/datos.tsx:409` | Código y cobertura existente; no se reabrió sesión ajena |
| Historial monetario sólo por agregación y ajustes firmados | `db/003_correcciones.sql:70–93` | Regresión de inmutabilidad pasó |

## Mejoras operativas y de observabilidad posteriores

1. Métricas propias de Tienda: vendidos/disponibles por lote, importe cobrado/reembolsado, bolsas pendientes/listas/entregadas, antigüedad de pendientes y tasa de resolución de intentos inciertos. `src/worker/mostrador.ts:52` resume pedidos; su etiqueta no debe interpretarse como ventas completas de Tienda.
2. Trazabilidad técnica: devolver un ID de correlación opaco en fallos y vincular solicitud→compra→asiento→entrega. `src/worker/index.ts:109–113` genera un ID sólo en el log; el cliente no lo recibe. No añadir teléfono o detalles sensibles a logs por comodidad.
3. Limitar compras por persona/lote sólo si lo exige la política comercial; no asumir que varias bolsas pagadas son abuso. Si la edición busca distribución equitativa, la regla debe ejecutarse en servidor y probarse contra automatización. OWASP menciona compra automatizada de inventario limitado como un riesgo que depende del negocio. [OWASP API6:2023](https://api-security.owasp.org/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/).
4. Registrar versión de condiciones de preventa aceptada cuando se agreguen fechas/política; mantener copy del diálogo consistente con contrato y recibo.

## Paquete mínimo de regresión recomendado

- Cambio de precio mientras el diálogo está abierto: no cobra hasta nueva confirmación.
- Precio heterogéneo entre vendidas/libres: anuncio y cargo coinciden.
- Última bolsa + respuesta perdida + recarga: recuperar sin comprar otra.
- Saldo justo + respuesta perdida + recarga: recuperar aunque saldo actual sea0.
- Respuesta200 incompleta: no muestra éxito ni pierde referencia.
- Reintento después de otros movimientos: recibo histórico claramente etiquetado; saldo actual correcto.
- Dos clientes concurrentes sobre última unidad, con COMMIT y ROLLBACK: máximo una venta y comunicación correcta de contención.
- Dos referencias simultáneas de un socio con saldo para una sola: saldo no negativo, una compra.
- Misma referencia concurrente: un recibo/cargo/bolsa; mismo resultado.
- Devolución y entrega concurrentes, si se agrega devolución: sólo una transición final permitida; ajuste único y trazable.
- Cambio de lote: históricos íntegros, números inequívocos y ninguna promesa de lote mezclado.

Los escenarios multiconexión requieren PostgreSQL local o entorno de prueba autorizado y aislado; no deben ejecutarse sobre clientes o inventario reales.
