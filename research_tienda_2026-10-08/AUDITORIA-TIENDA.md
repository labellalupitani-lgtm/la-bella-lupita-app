# Auditoría integral de Tienda · La Bella Lupita

**8 de octubre de 2026 · America/Managua**  
Evaluación de producto, experiencia, diseño, contenido, accesibilidad, integridad transaccional, seguridad, operación y evolución. Diagnóstico sobre el código actual y pruebas locales aisladas; revisión pública sin sesión ni transacciones reales.

**Dictamen:** Tienda tiene una base visual coherente y controles de cobro valiosos, pero el recorrido comercial todavía deja incertidumbres importantes entre lo que se ofrece, lo que se confirma y lo que ocurre después de pagar. Corregir esas discontinuidades tiene más valor inmediato que añadir productos, filtros o un carrito.

Actualmente es una **preventa de una bolsa de cosecha**, acompañada por un acceso al café mensual de la membresía y dos solicitudes de cotización. Ese alcance puede ser adecuado para una aplicación de fidelidad. Debe hacerse evidente desde el primer vistazo.

## Qué debe resolverse primero

1. **Vincular el precio confirmado con el cobrado.** Reproduje una confirmación de C$890 que terminó cobrando C$990 después de cambiar el precio del inventario sintético. La API sólo recibe la referencia del intento; no comprueba que siga vigente la oferta que el cliente aceptó.
2. **Recuperar compras de resultado incierto.** Con saldo exacto de C$890, dejé que se registrara la compra e interrumpí su respuesta. Al recargar, la Tienda pedía recargar C$890 y deshabilitaba la compra, aunque la bolsa ya estaba pagada. El historial la conserva; falta un camino claro para recuperarla desde Tienda.
3. **Completar el compromiso de preventa.** Se cobra hoy, pero la entrega se describe como «cuando entre la temporada». Faltan ventana de retiro, lugar/horario inequívoco, aviso de disponibilidad y condiciones de cambios, demoras y eventual devolución antes del pago.

Los dos primeros son defectos reproducidos en el entorno local. **No se constató que clientes reales hayan sufrido sobrecargos o pérdida de compras.** El tercero es un vacío verificable de producto y operación; no constituye por sí solo una conclusión legal.

## Alcance y trazabilidad de la evidencia

La imagen proporcionada identifica la pestaña seleccionada; su recorte no permite evaluar el contenido del módulo. Se inspeccionó `https://app.labellalupita.com/tienda`: una sesión nueva encuentra la pantalla de acceso por correo. No se ingresó a cuentas reales.

Se descargaron el HTML, los dos recursos principales y el catálogo público mediante lecturas. En esa consulta el catálogo informó **C$890, 150 disponibles de 150 y generación interna 6**. Es una instantánea, no una garantía permanente ni una verificación de inventario físico.

Los SHA-256 de JavaScript y CSS publicados coinciden con `dist` y con una nueva compilación local del código actual. Esto vincula las pruebas de interfaz a los mismos recursos publicados. **No demuestra que el Worker desplegado sea idéntico al Worker local**, ni replica configuración, datos o latencia de producción. Evidencia: [huellas de versión][huellas], [catálogo público][catalogo], [cabeceras HTTP][headers].

Se hicieron tres revisiones independientes: [producto y contenido][producto], [integridad y operación][integridad], [accesibilidad y rendimiento][accesibilidad]. La síntesis siguiente prevalece sobre las hipótesis iniciales de esos anexos cuando existe reproducción posterior.

| Verificación | Resultado y límite |
|---|---|
| Compilación Vite y comprobación TypeScript | Completadas sin error. Build independiente en `.test-output/tienda-auditoria-dist`. |
| Interfaz actual con Worker y base sintética | 19 escenarios de observación terminados. Algunos reproducen defectos deliberadamente: **no son 19 aprobaciones del producto**. |
| Adaptación visual | 320, 390, 768, 1024 y 1440 px, altura 844; sin desbordamiento horizontal en estados base. |
| Axe | 0 infracciones automáticas detectadas en cinco estados base y el diálogo. Revisión de contraste incompleta en los tres anchos menores. No equivale a conformidad WCAG. |
| Navegadores | Recorrido amplio en Edge; apertura/cierre del diálogo en Firefox 155 y WebKit 26.6. No equivale a probar iPhone físico ni todos los flujos en tres motores. |
| API local | 8 escenarios específicos: precios, reintentos, privacidad, rollback, entrega y contrato. |
| Contrato cliente | 2 respuestas JSON incompletas aceptadas indebidamente, confirmadas también en UI. |
| Regresión existente | 12 grupos de `tests/regresion.mjs` y suite `tests/operacion.mjs` aprobados por la revisión técnica. |
| Producción | Lecturas públicas únicamente; sin compras, recargas, entregas ni mensajes reales. |

Los [resultados de interfaz][ui-resultados] conservan estado, texto y capturas. Los [resultados API][api-resultados] y [contratos][contrato-resultados] registran los valores usados. Los datos de cuentas y compras de esas pruebas son sintéticos.

## Evaluación por perspectiva

| Perspectiva | Diagnóstico | Dirección recomendada |
|---|---|---|
| Negocio y alcance | Tres modelos comerciales bajo una pestaña; no es un catálogo general. | Hacer explícitos preventa, beneficio y cotización; confirmar el objetivo comercial antes de expandir. |
| Confianza y conversión | Falta información decisiva sobre producto y retiro; la recarga requiere visita al mostrador. | Resolver incertidumbre y conservar contexto. No prometer pagos o entregas que aún no existen. |
| Diseño y marca | Paleta, serif, logo y espaciado consistentes; exceso de protagonismo del manifiesto en móvil. | Conservar identidad y dar prioridad al producto, precio, retiro y acción. |
| Accesibilidad | Buena estructura, controles nativos, diálogo y avisos; recuperación de foco mejorable al pagar. | Probar estados dinámicos y lectores reales, además del estado inicial. |
| Integridad de cobro | Servidor calcula precio, usa transacciones y referencias; falta vínculo con oferta consentida. | Versionar oferta y conciliar intentos. |
| Operación y posventa | Historial y entrega auditada existen; ciclo de preventa incompleto. | Unir reserva, preparación, entrega y resolución económica. |
| Seguridad y privacidad | Controles locales de propiedad y roles pasan. No se observó fuga entre las dos cuentas de prueba. | Preservar controles y agregar correlación sin datos personales innecesarios. |
| Rendimiento | No hay evidencia suficiente de lentitud real; paquete cliente compartido relativamente amplio. | Medir carga y respuesta en dispositivos/redes reales antes de dividir módulos. |
| Mantenimiento | Reglas dispersas entre catálogo, unidades, UI y operación; comentarios históricos pueden inducir errores. | Contratos por operación y entidad de lote; revisar comentarios contra código vigente. |
| Analítica y crecimiento | No se identificó embudo comercial específico en el código revisado. | Instrumentar decisiones y compras confirmadas; comprobar analítica externa existente. |

## Hallazgos priorizados

**P1:** compromete consentimiento, certeza de pago o condiciones esenciales; resolver primero. **P2:** afecta materialmente comprensión, recuperación u operación. **P3:** mejora de calidad o de una restricción todavía no problemática. La prioridad es juicio de ingeniería/producto; no una puntuación estadística de riesgo.

### T01 · P1 · La confirmación no fija el precio autorizado

**Evidencia: reproducción API y UI.** El diálogo dice «Sí, cobrá C$890». Se actualiza a C$990 el precio de las bolsas libres en la base sintética antes de pulsarlo. El resultado dice «Se fueron C$990» sin una segunda confirmación. Además, el catálogo calcula `min(precio)` sobre todas las bolsas, mientras la compra cobra el precio de la primera libre: una bolsa vendida barata puede mantener bajo el precio anunciado.

Código: [catálogo][src-catalogo], [asignación y cobro][src-compra], [petición con sólo ref][src-api-compra], [precio del diálogo][src-dialogo-tienda]. [Captura del resultado][img-precio].

**Mejora:** generar una oferta de servidor con lote, versión, moneda e importe; verificarla dentro de la transacción. Si cambió, devolver conflicto sin cobrar ni asignar, mostrar el precio actualizado y pedir confirmación. El importe aportado por el cliente debe servir para detectar discrepancias, nunca para decidir cuánto cobrar.

**Aceptación:** cambio de precio con diálogo abierto y precios heterogéneos no pueden producir un cargo diferente al aceptado. El principio de vincular los datos significativos al consentimiento se apoya en [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html); no implica añadir códigos de autenticación a cada compra.

### T02 · P1 · La compra pagada puede quedar presentada como saldo insuficiente

**Evidencia: reproducción UI con cobro real únicamente local.** Saldo inicial C$890; POST hace commit; se interrumpe la respuesta; al recargar hay una bolsa comprada, saldo cero y una referencia pendiente en almacenamiento. La pantalla muestra «Te faltan C$890» y bloquea Apartar. El servidor sí recupera el recibo con la misma referencia incluso sin saldo. La interfaz no ofrece esa recuperación. El caso de última unidad se deriva del mismo código; no se ejecutó una carrera real sobre ella.

Código: [intento y error][src-tienda-intento], [bloqueo por saldo][src-tienda-saldo], [persistencia][src-referencia]. [Antes de recargar][img-perdida-antes] y [después de recargar][img-perdida-despues].

**Mejora:** mostrar «Estamos comprobando tu reserva» y una acción de conciliación independiente de saldo/stock, vinculada a la referencia original. Recuperar el comprobante y cerrar ese intento; habilitar otra compra sólo como una intención nueva y explícita.

**Aceptación:** saldo justo, última unidad, recarga de página y regreso a la sesión recuperan una sola compra y un solo cargo. No pedir una recarga para consultar algo ya pagado. Se conserva el historial existente: el defecto es la recuperación y su comunicación, no la desaparición de la compra.

### T03 · P1 · Se cobra una preventa sin un compromiso de retiro suficientemente definido

**Evidencia: revisión estática y pantalla actual.** «Cuando entre la temporada» es la única referencia temporal en ficha y confirmación. No se muestran las condiciones de esa reserva antes del cargo. No hay ventana de entrega en el contrato de catálogo.

Código: [promesa en ficha][src-entrega-copy], [confirmación][src-dialogo-tienda].

**Mejora:** acordar y publicar ventana estimada de tueste/retiro, lugar, horario completo, forma de aviso, procedimiento por demora/cancelación y destino de una devolución cuando corresponda. Registrar la versión de condiciones asociada a la compra. Si aún no se conoce una fecha, declararlo y definir con el negocio qué se puede ofrecer responsablemente.

**Aceptación:** antes del pago se puede responder qué se recibe, dónde y aproximadamente cuándo, cómo se avisa y cómo se resuelve una incidencia. Baymard documenta la utilidad de fechas comprensibles en entregas; aplicarlo a retiro de preventa es una inferencia, no una medición de esta aplicación. [Investigación sobre fechas de entrega](https://baymard.com/research-articles/shipping-speed-vs-delivery-date).

### T04 · P2 · Respuestas incompletas producen importes y éxitos inválidos

**Evidencia: fallos inyectados al cliente actual.** Un catálogo con `bolsa:{}` muestra `C$NaN`. Un HTTP200 de compra con saldo e importe, pero sin número, muestra «Es tuya la bolsa undefined» y elimina la referencia pendiente. No se observó al Worker emitir esos datos en su operación normal.

Código: [validación JSON][src-validacion]. [Catálogo inválido][img-nan], [éxito inválido][img-undefined].

**Mejora y aceptación:** validar campos específicos por operación, enteros seguros, importes no negativos, inventario coherente, número e identidad de compra/lote. Ante respuesta parcial después de escribir, conservar referencia y estado incierto; nunca declarar éxito ni iniciar otro intento automáticamente.

### T05 · P2 · El reintento puede presentar saldo histórico como actual

**Evidencia: API local.** Un recibo original conserva C$8,910; después de otra compra el saldo real es C$7,920, pero repetir la referencia devuelve C$8,910. Tienda construye «te quedan» con ese recibo y el refresco posterior no corrige el aviso.

**Mejora:** separar recibo histórico de cuenta actual. Etiquetar «Saldo después de esta compra» o mostrar saldo actual con consulta confirmada. Distinguir compra nueva de recibo recuperado. **Aceptación:** reintento después de otros movimientos no anuncia como disponible un saldo antiguo. Detalle y líneas en [INT-03][integridad].

### T06 · P2 · Un éxito anterior sigue visible cuando la compra siguiente falla

**Evidencia: reproducción UI.** Compra A correcta, intento B rechazado: quedan simultáneamente el éxito A y el error B. `hecho` no se limpia al empezar otro intento; el aviso flotante no tiene cierre ni caducidad contextual.

Código: [estado e inicio de compra][src-tienda-intento], [aviso flotante][src-toast]. [Captura][img-exito-error].

**Mejora:** estados por intento; reemplazar mensajes del intento actual y conservar recibos anteriores en un área identificable. Preferir confirmación dentro del flujo con «Ver mi reserva», y aviso breve descartable. **Aceptación:** no coexisten mensajes que parezcan éxito y fallo de la misma operación. En 320 px el aviso largo ocupa una parte importante del contenido; debe comprobarse también con foco y zoom reales.

### T07 · P2 · La carga del catálogo se anuncia como fallo de cuenta

**Evidencia: reproducción con catálogo demorado y cuenta cargada.** Aparecen «Actualizando el catálogo…» y «No pudimos abrir tu cuenta» simultáneamente. El mismo vacío se usa para una carga y para un fallo de lectura. El reintento de catálogo existente sí recuperó la interfaz.

Código: [estado vacío de Tienda][src-vacio], [texto reutilizado][src-vacio-copy]. [Captura][img-cargando].

**Mejora y aceptación:** estados diferenciados para carga, error sin datos, información anterior y agotado. Una lectura pendiente no produce un diagnóstico de fallo; un error de catálogo habla del catálogo y conserva una acción de reintento.

### T08 · P2 · La confirmación no conduce al comprobante existente

**Evidencia: compra local y navegación posterior.** Tienda sólo muestra número, monto y saldo en un aviso. No ofrece una acción para abrir su reserva; el camino está en Perfil → Mis compras y reservas. Allí sí constan importe, identificador, fecha y entrega pendiente.

Código: [mensaje de éxito][src-exito], [historial de bolsas][src-historial]. [Historial comprobado][img-historial].

**Mejora y aceptación:** confirmación con número/ID, estado y siguiente paso; acción «Ver mi reserva». Al volver a Tienda, mostrar las reservas relevantes y distinguir «Reservar otra bolsa». Devolver ID durable en la respuesta evita buscar por número aproximado.

### T09 · P2 · Falta una ficha de café que permita decidir la compra

**Evidencia: pantalla y contrato.** Sólo se conoce gramaje, origen general, numeración y precio. No hay foto de producto, presentación inequívoca, tueste, notas verificadas, molienda o método recomendado. «No hay dos iguales» parece referirse al número, pero podría interpretarse como productos distintos.

**Mejora:** foto real del envase y café, 250 g confirmado, grano/molido y momento de elección, perfil, origen y lote. Separar datos conocidos de características aún pendientes de cosecha/tueste. Decir «Cada bolsa tiene un número único dentro del lote» si ése es el compromiso real. **Aceptación:** el cliente sabe si puede preparar ese café con su equipo. No inventar atributos, certificaciones, reseñas ni existencias. [Baymard sobre descripciones](https://baymard.com/research-articles/product-descriptions).

### T10 · P2 · La jerarquía móvil posterga la decisión comercial

**Evidencia medida:** en una ventana de 390×844, el comienzo del botón principal está aproximadamente a **890 px** desde el inicio del documento; a 320×844, a **1,012 px**. Queda fuera del primer viewport. La introducción y el título de 37 px preceden a la ficha. No hay desbordamiento horizontal; esto es jerarquía, no una interfaz rota.

[Vista de 390 px][img-390] y [escritorio][img-1440]. Las capturas de página completa representan la barra fija en una posición del scroll; no significan que ésta forme parte del documento en ese punto.

**Mejora:** encabezado breve, nombre comercial, foto, precio y condición «Preventa · retiro en la casa» al inicio. Historia de la finca después de los datos de decisión o desplegable. Si se ensaya un CTA persistente, ubicarlo respetando navegación y área segura, y someterlo a pruebas de lectura/foco. **Aceptación:** una prueba de comprensión encuentra sin exploración extensa qué se vende, cuánto cuesta y cuándo se retira; no exigir que todo quepa artificialmente sin scroll.

### T11 · P2 · La recarga rompe el contexto de la reserva

**Evidencia UI:** «Ver mi cuenta y recargar» conduce a Inicio; no abre la recarga. Hace falta localizar «Recargá» y comprender que se realiza en mostrador. La compra remota sigue dependiendo de saldo previo.

**Mejora y aceptación:** explicar «Cómo recargar en el mostrador» dentro del contexto, mostrar faltante y permitir actualizar saldo/regresar a la misma oferta vigente. Si se desea venta remota, evaluar pagos como una capacidad de negocio con conciliación, costos y soporte; no resolverla con un botón aparente.

### T12 · P2 · La bolsa mensual no responde al estado del beneficio

**Evidencia estática:** Tienda sólo distingue si existe membresía. Club sí dispone de estado de canje/código. La tarjeta no informa si este mes ya se retiró ni lleva directamente al beneficio.

**Mejora y aceptación:** presentar estado del mes y acceso directo al beneficio, con reglas consistentes. Separar «tenés derecho al canje» de «la bolsa está físicamente lista». No prometer preparación a partir de ausencia de canje. Ver [PROD-06][producto].

### T13 · P2 · Falta completar el ciclo operativo de la preventa

**Evidencia de código y API:** existe compra durable y entrega única auditada; sólo se representa pendiente/entregada. Atención registra respuestas, pero responder no cancela ni devuelve dinero. El mecanismo de devolución de pedidos de Carta no equivale a devolución de Reserva de Cosecha. La compra de bolsa no enlaza explícitamente su asiento/solicitud de pago.

**Mejora:** estados pagada → lista para retirar → entregada; resolución de cancelación/reembolso conforme a política acordada; vínculo compra → movimiento → entrega. Si se incorpora devolución, debe ser idempotente, restaurar correctamente componentes del saldo y puntos, registrar motivo/actor y controlar inventario. **Aceptación:** atención al cliente y caja pueden saber qué obligación está pendiente y demostrar cómo se resolvió. Ver [INT-05][integridad].

### T14 · P2 · Cotización y agotado ofrecen poca orientación accionable

**Evidencia:** regalos y oficina abren un mensaje genérico en WhatsApp. No se conocen cantidades, fecha requerida, zona, plazo de respuesta ni condiciones de entrega. «Grano molido o en bolsa» mezcla presentación y empaque. Agotado dice consultar en la casa, sin acción específica. La API contiene una próxima apertura fija en noviembre.

**Mejora:** enlaces «Cotizar por WhatsApp», datos mínimos de cantidad/fecha/entrega y expectativas confirmadas por la operación. Puede prepararse un borrador; el usuario decide enviarlo. Mostrar alternativa de contacto. Agotado necesita una consulta contextual y fecha sólo cuando sea real. **Aceptación:** el destino externo se conoce antes del clic y la casa recibe la información necesaria sin promesas no mantenidas.

### T15 · P2 · El lote no tiene identidad comercial completa

**Evidencia:** se conserva generación interna en la base, pero el recibo inmediato sólo muestra número. El historial y caja no lo presentan como una cosecha identificable. El catálogo utiliza máximo de generación y total fijo 150. La prueba con dos filas sigue anunciando 150; no demuestra inventario físico incorrecto en producción.

**Mejora:** entidad de lote con identidad pública, capacidad verificada, precio, apertura/cierre y ventana de retiro; usarla en catálogo, recibo, historial y caja. **Aceptación:** dos bolsas número 1 de distintas cosechas nunca se confunden. El denominador fijo, si 150 es una regla garantizada, es una mejora P3; pasa a problema si puede diferir del cupo real.

### T16 · P2 · El cierre inmediato del diálogo dificulta seguir una compra pendiente

**Evidencia UI:** al confirmar, el diálogo se cierra antes de la respuesta y se deshabilita el iniciador. Tras el rechazo sintético, el foco quedó en `body` en Edge. En cancelación normal sí volvió al botón de origen en Edge y Firefox; WebKit terminó en `main`, por lo que no se presume comportamiento idéntico entre motores.

**Mejora y aceptación:** mantener una superficie estable de espera/resultado, con foco lógico, aviso de procesamiento y error accionable. Definir qué ocurre al cerrar durante una solicitud sin asumir que eso deshace un cargo. Verificar teclado, NVDA/Edge y VoiceOver/Safari. La [guía de diálogos WAI](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) sirve de referencia; esta observación no sustituye una evaluación completa con lectores.

### T17 · P2 condicional · Contención temporal puede anunciar agotamiento definitivo

**Evidencia estática, pendiente de prueba multiconexión.** `FOR UPDATE SKIP LOCKED` omite bolsas bloqueadas. Si otra compra retiene la última unidad y luego revierte, una solicitud intermedia puede no encontrar filas y anunciar que todas están apartadas. No significa que se venda dos veces.

**Mejora y aceptación:** distinguir contención transitoria de stock agotado y permitir recuperación con la misma referencia. Probar dos conexiones PostgreSQL reales, incluyendo rollback del primer comprador. El alcance de `SKIP LOCKED` está documentado por [PostgreSQL](https://www.postgresql.org/docs/current/sql-select.html). No se presenta esta carrera como observada en producción.

### T18 · P3 · Copy, semántica y orientación pueden ser más claros

Varias frases carecen de puntos, incluido el recibo; el título del navegador es siempre «Club Lupita — La Bella Lupita»; las cotizaciones usan botones con `window.open` en vez de enlaces. Los controles funcionan por teclado, por lo que no se afirma una infracción sólo por esa elección.

**Mejora:** frases completas con voseo, título específico de ruta y enlaces con destino reconocible. Cambiar explicaciones de limitaciones internas por instrucciones útiles. Conservar calidez sin comprometer precisión. Las afirmaciones «desde 1971», «misma ladera/mismo año» y «no compramos grano de nadie» requieren respaldo del negocio; no hay evidencia de que sean falsas.

### T19 · P2 de evolución · Falta evidencia para gestionar el embudo y la calidad operativa

No se identificaron eventos específicos de Tienda en el código. El HTML público sí incluye Cloudflare Insights; no se inspeccionó su panel y no se concluye ausencia total de analítica.

**Mejora:** instrumentar vistas, oferta mostrada, saldo insuficiente, confirmación, resultado confirmado, error por categoría, conciliación resuelta, comprobante consultado y apertura de cotización. Vender/entregar se mide con datos del servidor; abrir WhatsApp no equivale a vender.

**Aceptación:** responder cuántas reservas se confirman, cuántas quedan inciertas, cuánto tardan en entregarse y qué dudas generan, sin registrar mensajes, teléfonos, tokens o correo en eventos de producto. Fijar objetivos después de medir una línea base propia.

## Qué conservar y qué no concluir

Los controles existentes son una base útil: precio tomado de base de datos; débito, reserva y recibo en transacción; referencia idempotente; saldo insuficiente con rollback; compra visible sólo a su titular; entrega restringida al equipo, única y auditada. En las pruebas no se obtuvo un segundo cargo con la misma referencia ni acceso a compras ajenas. El libro mayor rechaza modificaciones directas y exige ajustes, protección que también se encontró al preparar el fixture.

La interfaz ya tiene un diálogo nativo con confirmación de importe, encabezados, salto al contenido, botones táctiles amplios, movimiento reducido, errores anunciables y región viva de éxito. `EstadoCuenta` se monta globalmente: **sí hay aviso cuando falla una actualización de cuenta**. El historial y la ayuda también existen. No conviene rediseñar basándose en que faltan esos mecanismos.

La paleta actual ofrece buenos contrastes calculados entre tokens principales: aproximadamente 11.46:1 para tinta/papel y 6.03:1 para texto secundario/papel. Son cálculos de colores, no certificación de todos los estados renderizados. No se detectó overflow base a 320 px; la referencia de [reflujo W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) también exige conservar información y funcionalidad, algo que debe comprobarse con ampliación y estados dinámicos.

No hay base suficiente para afirmar «la Tienda es insegura», «es lenta», «no tiene historial», «se cobra dos veces normalmente» o «incumple WCAG en toda la pantalla». Tampoco hay evidencia propia para atribuir un porcentaje de abandono o pronosticar incremento de ventas.

## Propuesta de experiencia, sin inventar capacidades

| Zona | Contenido y acción |
|---|---|
| Encabezado | «Café de nuestra finca» y explicación breve de lo que puede hacerse. |
| Reserva de cosecha | Foto real, nombre/lote, 250 g verificados, presentación, precio, ventana de retiro y disponibilidad. Acción «Revisar reserva». |
| Confirmación | Producto/lote, importe vigente, saldo, retiro y condiciones decisivas. Acción «Confirmar por C$…». |
| Resultado | Reserva confirmada, número/ID, monto, estado, próximo paso. «Ver mi reserva». |
| Intento incierto | «Estamos comprobando tu reserva» y «Comprobar resultado», independiente del botón para otra compra. |
| Mi café mensual | Estado del mes y acceso al beneficio o información de membresía. |
| Regalos y oficina | Qué se puede cotizar y «Cotizar por WhatsApp», con expectativas reales. |
| Mis reservas | Acceso contextual a pendientes y comprobantes, sin obligar a buscar en Perfil. |

No se justifica todavía un buscador, filtros, comparador o carrito multiproducto para una sola oferta. Una vista pública previa al acceso puede favorecer captación; su conveniencia depende de si Tienda busca vender a nuevos clientes o servir sólo al club. El PRD histórico contemplaba más capacidades, pero no demuestra demanda actual ni inventario disponible.

## Orden de ejecución recomendado

Los tamaños son orientativos: **S** = cambio localizado; **M** = varios componentes/contratos y regresión; **L** = datos, operación y flujos nuevos. No son promesas de duración.

| Etapa | Entrega concreta | Hallazgos | Tamaño / dependencia |
|---|---|---|---|
| 1. Proteger la compra | Oferta verificada en servidor, recuperación por referencia y contrato estricto de respuesta. | T01, T02, T04, T05 | M; decisiones de contrato frontend/backend. |
| 2. Definir la preventa | Ficha real, ventana, retiro, condiciones y responsable de actualizarlas. | T03, T09, T15 | M; información y aprobación comercial de la casa. |
| 3. Cerrar la experiencia | Recibo enlazado, estados de intento, foco/errores, recarga contextual y jerarquía móvil. | T06–T08, T10–T11, T16, T18 | M; utilizar oferta/recibo de etapa 1. |
| 4. Completar operación | Preparación/retiro, resolución económica trazable, estados mensuales y cotización clara. | T12–T15 | M–L; política operativa y datos. |
| 5. Medir y robustecer | Embudo, métricas operativas, prueba de concurrencia y rendimiento real. | T17, T19 | M; entorno PostgreSQL aislado y observabilidad. |

No hace falta esperar a toda la evolución operativa para corregir el precio y la conciliación. Copy, carga inicial y enlace al historial son mejoras pequeñas que pueden acompañar esa primera entrega.

## Rendimiento, datos y sostenibilidad

La compilación actual genera **415.08 kB de JavaScript principal, aproximadamente 129.27 kB gzip**, y **73.93 kB de CSS, aproximadamente 15.31 kB gzip**. Es tamaño de artefactos del build, no una medición de transferencia o velocidad de producción. Personal se carga de forma diferida; muchas vistas del cliente comparten el paquete inicial. Las fuentes son autoalojadas y Tienda no descarga fotografías de producto porque todavía no las tiene.

Antes de optimizar: medir entrada fría a Tienda, navegación desde Inicio y compra en dispositivo económico/red lenta; registrar tiempo hasta precio utilizable, errores, LCP, INP y CLS. Como referencia de campo, web.dev usa LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1 en percentil 75; no se midieron estos indicadores con usuarios reales en esta auditoría. [Web Vitals](https://web.dev/articles/vitals).

Al incorporar foto, servir tamaños adecuados con dimensiones reservadas y formatos modernos; no convertir una ficha sencilla en una carga visual costosa. Dividir rutas sólo cuando cobertura y trazas justifiquen el beneficio. Medir llamadas de cuenta/catálogo/cupos, sin eliminar refrescos necesarios para consistencia.

Para mantenimiento, conviene una oferta de lote como fuente común del precio, capacidad, fechas y descripción; un esquema de respuesta por operación; y una relación durable entre referencia, compra, asiento y entrega. Corregir comentarios históricos que hablan de prototipos, colores y capacidades previas ayudará a que futuras revisiones se basen en contratos vigentes.

## Verificación necesaria al implementar

| Grupo | Criterio de salida |
|---|---|
| Dinero | Precio cambiado exige nueva confirmación; doble clic/reintento no duplica; saldo exacto se recupera tras respuesta perdida. |
| Contratos | JSON parcial no muestra NaN/undefined ni pierde la referencia; oferta y recibo conservan lote/ID. |
| Concurrencia | Dos compradores sobre última unidad, con commit/rollback; dos intentos de misma cuenta con saldo para uno; misma referencia simultánea. |
| Interfaz | Carga sin falso error, recuperación clara, éxito anterior no confundido con intento nuevo, comprobante accesible desde Tienda. |
| Accesibilidad | Teclado completo; foco tras éxito/rechazo; NVDA y VoiceOver; texto 200 %, zoom 400 %, colores forzados y avisos sin ocultar foco. |
| Operación | Estado listo verificable; entrega única; cancelación/devolución según política; cosechas anteriores inequívocas. |
| Comprensión | Primera ronda cualitativa con personas representativas: oferta, retiro, saldo insuficiente, beneficio mensual y comprobante. |

Se propone comenzar con cinco participantes diversos para detectar problemas cualitativos, no para estimar tasas poblacionales. Las tareas deben simular dinero y mensajes; medir comprensión y resolución, no sólo preferencias estéticas.

## Límites y decisiones que corresponden al negocio

No se realizaron entrevistas, consulta de analítica privada, inventario físico, carga de estrés, pentest exhaustivo, auditoría legal, pruebas con lector real ni carreras multiconexión. Las lecturas públicas no verifican la versión del Worker desplegado. La comparación de recursos sí verifica la versión visual servida.

La implementación comercial necesita que la casa defina: lote y presentaciones reales; ventana/horario de retiro; responsable y canal de aviso; condiciones de retrasos/cancelación/reembolso; reglas de bolsa mensual; zonas/costos de entrega de encargos; y plazo real de respuesta. Las recomendaciones dejan esos datos explícitamente pendientes, sin inventarlos.

La revisión y sus scripts están contenidos en esta carpeta; no se modificó código funcional ni se publicó una nueva versión. [Guía para reproducir][reproducir].

## Referencias de implementación y evidencia

Las fuentes externas se enlazan junto a cada recomendación; los tres anexos amplían fuentes y líneas. Las capturas muestran datos sintéticos. Este informe prioriza evidencia actual y evita heredar como defectos hallazgos ya corregidos de auditorías anteriores.

[huellas]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/huellas-version.json>
[catalogo]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/catalogo-publico.json>
[headers]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/produccion-headers.json>
[producto]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/findings_producto.md>
[integridad]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/findings_integridad.md>
[accesibilidad]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/findings_accesibilidad.md>
[ui-resultados]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/resultados.json>
[api-resultados]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/integridad-resultados.json>
[contrato-resultados]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/integridad-contrato-resultados.json>
[img-precio]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/precio-en-pantalla-vs-cobrado.png>
[img-perdida-antes]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/respuesta-perdida-antes-recarga.png>
[img-perdida-despues]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/respuesta-perdida-despues-recarga.png>
[img-nan]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/catalogo-malformado.png>
[img-undefined]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/compra-exito-malformado.png>
[img-exito-error]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/exito-anterior-error-nuevo.png>
[img-cargando]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/catalogo-cargando.png>
[img-historial]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/historial-bolsa.png>
[img-390]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/base-390.png>
[img-1440]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/evidencia-ui/base-1440.png>
[reproducir]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_tienda_2026-10-08/REPRODUCIR.md>
[src-catalogo]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:410>
[src-compra]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:869>
[src-api-compra]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:241>
[src-dialogo-tienda]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:264>
[src-tienda-intento]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:51>
[src-tienda-saldo]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:146>
[src-referencia]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/compras.ts:4>
[src-entrega-copy]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:124>
[src-validacion]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:141>
[src-toast]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Estados.tsx:284>
[src-vacio]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:99>
[src-vacio-copy]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Estados.tsx:143>
[src-exito]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:66>
[src-historial]: </C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/MisCompras.tsx:27>

