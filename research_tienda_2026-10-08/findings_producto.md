# Auditoría de Tienda: producto, compra, contenido y posventa

Fecha: 8 de octubre de 2026, Nicaragua. Revisión del código actual bajo `club-lupita/src`, cinco consultas web y lectura de fuentes primarias. No se modificó la aplicación, no se compró ni se enviaron mensajes. Las líneas citadas corresponden al estado local inspeccionado.

## Diagnóstico

La Tienda actual funciona como una página de preventa de una sola bolsa, un acceso a un beneficio de membresía y dos canales de cotización. Esa combinación puede ser válida para el negocio. Su mayor debilidad comercial es que pide pagar una reserva antes de explicar con precisión qué café llegará, cuándo se podrá retirar y qué ocurrirá si hay un problema. La prioridad es completar y conectar ese recorrido, sin inventar un catálogo, precios o capacidades de entrega.

La captura aportada muestra la pestaña Tienda seleccionada y un recorte de la navegación. No permite evaluar la ficha, el precio, los estados ni el checkout. Los hallazgos de este documento son **verificados estáticamente**, no pruebas de comportamiento en producción ni observaciones de clientes reales. La pérdida de conversión es una hipótesis de impacto; no hay cifras propias que la cuantifiquen.

Severidad: P1 = información crítica para comprometer dinero o cumplir la compra; P2 = fricción o comprensión material; P3 = mejora menor. La confianza se refiere a la evidencia del defecto, no al tamaño comercial del efecto.

## Hallazgos priorizados

### PROD-01 · P1 · Alta confianza: se cobra ahora sin fecha o ventana de retiro

- Evidencia: `club-lupita/src/casa/pantallas/Tienda.tsx:125` y `:268` sólo prometen retiro «cuando entre la temporada». El catálogo sólo contiene precio, restantes, total y generación (`club-lupita/src/casa/datos.tsx:122`; `club-lupita/src/worker/index.ts:425`). El historial sólo distingue pendiente/entregada (`club-lupita/src/casa/pantallas/MisCompras.tsx:32`).
- Impacto: el usuario no puede decidir si la preventa sirve para un regalo, una visita o su consumo próximo; el comercio tampoco expone un compromiso verificable de preparación.
- Mejora: modelar lote comercial, ventana estimada de tueste/retiro, lugar, horario, cómo se avisará y responsable de mantener esos datos. Mostrar el rango y su carácter estimado junto al precio y repetirlo al confirmar. Si no hay previsión operativa aprobada, presentar «Fecha por confirmar» y un mecanismo de consulta/lista de interés, o una condición comercial explícita acordada por el negocio. No rellenar la fecha con la del prototipo.
- Aceptación: antes de pagar, una persona debe poder responder dónde y en qué intervalo retirará la bolsa, cómo sabrá que está lista y cómo consultar un retraso.
- Fundamento: la investigación de Baymard señala que una fecha estimada comprensible evita que el cliente tenga que deducir cuándo recibirá su compra. Su estudio trata envíos; la aplicación al retiro de una preventa es una inferencia razonada. [Baymard: Delivery Date](https://baymard.com/research-articles/shipping-speed-vs-delivery-date).

### PROD-02 · P1 · Alta confianza: falta la política comercial de esta preventa antes del cobro

- Evidencia: la ficha y confirmación (`Tienda.tsx:124`, `:157`, `:268`) explican cobro y número asignado, pero no cambio/cancelación, retrasos, sustitución de lote, límite para retirar ni devolución. `ConfirmarCompra` muestra precio, saldo y remanente (`club-lupita/src/casa/componentes/Superficies.tsx:329`). Existe ayuda después de la compra (`MisCompras.tsx:39`; `club-lupita/src/casa/componentes/Atencion.tsx:15`), que aclara que una solicitud no cancela ni devuelve automáticamente.
- Impacto: incertidumbre antes de pagar y riesgo de expectativas divergentes después. No se diagnostica aquí incumplimiento legal; es un vacío de definición y comunicación comercial.
- Mejora: acordar condiciones breves y accesibles específicas para la Reserva; explicar procedimiento, canal, plazo de respuesta y destino de un eventual reembolso, distinguiendo saldo pagado de bonos si corresponde. Resumir lo decisivo en la confirmación y enlazar el detalle; conservar una versión de las condiciones asociada a cada compra.
- Aceptación: el cliente puede conocer las condiciones antes de confirmar y recuperarlas desde el comprobante. Evitar añadir una casilla ceremonial si no existe contenido real detrás.
- Fundamento: Baymard incluye entrega, devoluciones y disponibilidad entre la información que reduce incertidumbre en la decisión de compra. [Baymard: Ecommerce UX Audit](https://baymard.com/blog/ecommerce-ux-audit).

### PROD-03 · P2 · Alta confianza: el café se vende con una historia y gramaje, pero sin ficha para elegirlo

- Evidencia: `Tienda.tsx:81–126` aporta procedencia general, 250 g, numeración y precio. No informa presentación en grano/molido, opciones y momento de molienda, perfil de tueste, notas, proceso, lote comercial o método de preparación. El esquema actual tampoco transporta esa información (`datos.tsx:122`). No hay imágenes de producto en el componente.
- Impacto: un comprador no sabe si podrá preparar el café con su equipo ni qué esperar del sabor; «No hay dos iguales» puede entenderse como diferencias entre productos cuando el rasgo único parece ser el número.
- Mejora: ficha compacta con foto real del envase, gramaje, presentación, molienda admitida, tueste/perfil, notas verificadas y origen trazable. Separar atributos estables del lote de atributos que aún se confirmarán tras cosechar/tostar. Si sólo cambia la numeración, decir «Cada bolsa tiene un número único». Hacer que la imagen real y su etiqueta aclaren qué se recibe; no usar una bolsa generada como prueba del producto real.
- Aceptación: elegir sin consultar al personal es posible para los escenarios de grano/molido soportados. Si la molienda se decide al retirar, debe decirlo expresamente.
- Fundamento: las descripciones insuficientes inducen dudas o suposiciones; las imágenes en contexto ayudan a entender la dimensión física. [Baymard: Product Descriptions](https://baymard.com/research-articles/product-descriptions), [Baymard: In Scale Images](https://baymard.com/research-articles/in-scale-product-images).

### PROD-04 · P2 · Alta confianza: la confirmación no conecta con el seguimiento que ya existe

- Evidencia: éxito en `Tienda.tsx:66–71` y `:276`: aviso con número, cobro y saldo. El mensaje no incluye comprobante, fecha/lugar de retiro ni acción. `AvisoFlotante` admite acción (`Estados.tsx:288`), pero Tienda no la proporciona. `/compras` sí existe y muestra número, fecha de registro, entrega, importe y comprobante (`MisCompras.tsx:27–35`); su acceso está en Perfil (`Perfil.tsx:242`).
- Impacto: tras pagar, el cliente puede desconocer dónde recuperar la compra. El botón de comprar sigue representando otra compra; falta una señal persistente dentro de la Tienda de lo ya reservado.
- Mejora: confirmación visible con «Reserva confirmada», número/identificador, monto, estado y siguiente paso; botón «Ver mi reserva». Mostrar en la Tienda las reservas pendientes relevantes y hacer explícita la acción «Reservar otra bolsa» cuando proceda. No afirmar que el sistema carece de historial: el problema es su conexión y completitud.
- Aceptación: después de confirmar o volver más tarde, el cliente encuentra el comprobante desde Tienda sin adivinar que está en Perfil. Distinguir reservada, lista para retirar y entregada cuando la operación realmente pueda registrar esos estados.
- Fundamento: la confirmación puede aportar instrucciones y datos de entrega relevantes para dar seguridad sobre lo que sigue. [Baymard: Order Confirmation](https://baymard.com/research-articles/order-confirmation-page).

### PROD-05 · P2 · Alta confianza: la recuperación por saldo insuficiente rompe el contexto

- Evidencia: «Ver mi cuenta y recargar» navega a `/` (`Tienda.tsx:156`), donde el cliente debe localizar «Recargá» (`Inicio.tsx:145`). La hoja informa que la recarga se hace presencialmente en el mostrador y requiere actualizar el saldo (`Inicio.tsx:206–222`).
- Impacto: una persona fuera del local no puede completar la compra y otra que ya recargó debe reconstruir el recorrido. No es un fallo técnico que el negocio use prepago: el problema es presentar la recuperación con una expectativa de acción digital que no resuelve por sí sola.
- Mejora inmediata: «Cómo recargar en el mostrador», abierto en contexto, con saldo, faltante, pase, actualización y regreso a la bolsa. Si el negocio desea vender a distancia, investigar pagos remotos como un proyecto de operación y cobro separado; no añadir un botón sin respaldo.
- Aceptación: persona con saldo insuficiente comprende dónde puede recargar; después de actualizar puede retomar la misma oferta y revisar precio/disponibilidad vigentes.

### PROD-06 · P2 · Alta confianza: la bolsa mensual no refleja el estado real del beneficio

- Evidencia: Tienda decide sólo por existencia de membresía (`Tienda.tsx:49`, `:191–207`) y lleva al inicio de `/club`. Club sí conoce si ya se retiró y ofrece código (`Club.tsx:314–327`). El horario «de 7 a 9» en Club carece de indicación de mañana/noche (`:316`). Inicio anuncia la bolsa «lista» si no hay canje (`Inicio.tsx:153`), estado que no necesariamente prueba preparación física.
- Impacto: Tienda no responde a la intención frecuente del socio «¿puedo retirar mi bolsa de este mes?». Puede prometer disponibilidad física a partir de la mera ausencia de canje.
- Mejora: tarjeta contextual «Disponible este mes / Retirada el… / Membresía no activa», con enlace directo al beneficio o código existente. Definir con la operación qué significa «lista», informar el horario completo confirmado y distinguir derecho de canje de inventario preparado.
- Aceptación: la tarjeta y Club muestran el mismo mes, estado y reglas; los usuarios no vuelven a buscar el beneficio al llegar.

### PROD-07 · P2 · Alta confianza: las cotizaciones transfieren casi todo el trabajo al chat

- Evidencia: regalos y oficina sólo explican brevemente qué son (`Tienda.tsx:220–250`); abren WhatsApp con un mensaje genérico. «Grano molido o en bolsa» mezcla estado del café con empaque (`:236`). La entrega en Managua se afirma sin zonas, costo o plazo. «Es más lento que un botón y sale mejor» no ayuda a planificar.
- Impacto: el usuario no sabe si encaja su presupuesto/cantidad/fecha y el equipo debe pedir los mismos datos repetidamente. El cambio a WhatsApp sólo se avisa en un párrafo posterior.
- Mejora: «Cotizar por WhatsApp» en cada fila; ejemplo real de contenido de caja, rango o mínimo sólo si el negocio lo valida, fecha requerida, cantidad aproximada, área de entrega y plazo de respuesta real. Preparar un borrador con esos datos sin enviarlo automáticamente. Ofrecer un canal alternativo visible si WhatsApp no abre. Escribir «En grano o molido» si ambas opciones existen.
- Aceptación: el usuario sabe que saldrá a WhatsApp y qué datos necesitará. Medir aperturas como intención, nunca como pedidos cerrados; cualquier seguimiento de cotización debe corresponder a la operación real.

### PROD-08 · P2 · Alta confianza: agotado termina en una instrucción sin acción y con dos versiones del calendario

- Evidencia: UI: «Consultá en la casa cuándo estará disponible el siguiente» sin enlace (`Tienda.tsx:141–144`). API: «El corte que viene se abre en noviembre» está fijo en un error (`worker/index.ts:880`).
- Impacto: interesados sin salida directa y promesa de apertura que puede quedar desactualizada o diferir de la interfaz.
- Mejora: fecha de siguiente apertura sólo desde una fuente operativa mantenida. Acción contextual «Consultar próximo lote». Una lista de aviso es mejora posible únicamente con consentimiento, persistencia y operación reales; no prometer avisos automáticos inexistentes.
- Aceptación: estado agotado tiene una salida funcional y no contiene fechas fijas no verificadas.

### PROD-09 · P2 · Alta confianza: se explican restricciones internas en lugar de orientar rápidamente la compra

- Evidencia: encabezado largo (`Tienda.tsx:81–87`); «la casa no vende suscripción de café por su cuenta» (`:196`); explicación de que sólo se enseña lo que se puede cobrar (`:257–259`). La puntuación omitida une frases independientes (`:86`, `:125`, `:159`, `:248`).
- Impacto: tres modelos comerciales exigen lectura: preventa, beneficio y cotización. La explicación del sistema ocupa espacio antes de resolver decisiones concretas.
- Mejora: mantener voz local y voseo, usar frases completas y títulos orientados a intención: «Reservá una bolsa de cosecha», «Tu café mensual del Club», «Regalos y café para oficina». Identificar «Preventa · retiro en la casa», «Incluido en membresía» y «Cotización por WhatsApp». Explicar compra en mostrador en una nota útil con acceso a ubicación/horarios, no como defensa de limitaciones del backend.
- Aceptación: en una prueba breve, personas nuevas distinguen qué pagan ahora, qué ya está incluido y qué requiere cotización. No convertir la Tienda de un solo producto en un gran catálogo con filtros innecesarios.
- Fundamento: escritura concisa, escaneable y objetiva facilita encontrar información. La evidencia de NN/g es antigua y general; no se extrapolan sus porcentajes de mejora a esta app. [NN/g: Concise, Scannable and Objective](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/).

### PROD-10 · P2 · Confianza media sobre el riesgo: afirmaciones comerciales sin vínculo a evidencia mantenida

- Evidencia: desde 1971, misma ladera/mismo año y no compra de grano ajeno (`Tienda.tsx:81–87`) son textos fijos. No puede concluirse que sean falsos; no se aportó documentación operativa que los verifique.
- Mejora: validar esas afirmaciones con el negocio y mantener origen/cosecha a nivel de lote. Reemplazar absolutos sólo cuando no se puedan sostener. Un dato verificable de finca/lote y una fotografía real fortalecen la confianza más que añadir medallas o reseñas sin respaldo.
- Aceptación: cada afirmación sobre el café vendido tiene fuente responsable y vigencia identificables.

## Lo que conviene conservar

- Precio/saldo y stock proceden del servidor; no rescatar cifras o productos del prototipo. La posible divergencia entre `min(precio)` del catálogo y la primera bolsa libre de la compra fue remitida a la auditoría técnica; no se verificaron datos heterogéneos en producción.
- La confirmación previa al débito muestra coste, saldo y remanente, con monto en el botón (`Superficies.tsx:332–365`).
- La Tienda ya diferencia membresía de suscripción de café independiente y explica que la reserva se cobra hoy. Hay una base de honestidad comercial que debe hacerse más fácil de comprender.
- Existen historial, entrega marcada y ayuda dentro de la app. El trabajo es integrarlos al recorrido de la Tienda.
- `EstadoCuenta` se monta globalmente en `club-lupita/src/casa/App.tsx:141`. No afirmar que Tienda omite todos los avisos de saldo desactualizado por no importarlo directamente.

## Hipótesis que requieren validación, no defectos demostrados

1. La aplicación exige sesión para Tienda (`App.tsx:113`); podría convenir una vista de oferta sin sesión para referidos, manteniendo autenticación al comprar. Es decisión de adquisición frente a app privada de fidelidad, no bug automático.
2. Ampliar catálogo, compra de varias unidades, entrega remota o suscripción independiente sólo tiene sentido con demanda, márgenes e inventario demostrados. El PRD histórico (`PRD.txt:23`, `:42–44`) contemplaba más capacidades, pero no prueba que sigan siendo requerimientos vigentes.
3. No se halló instrumentación comercial por los nombres habituales en `src` durante la búsqueda. No demuestra ausencia de analítica externa. Antes de estimar impacto, revisar datos existentes y definir un embudo mínimo.

## Secuencia de mejora y medición

**Primero:** acordar ficha real, calendario, retiro y condiciones; incorporarlos al catálogo y compra como una misma oferta versionada. **Después:** comprobante enlazado, regreso tras recarga, estado de bolsa mensual y salidas de agotado/cotización. **Luego:** fotografía, copy y prueba de comprensión. Dejar expansión de pagos y catálogo para una decisión comercial informada.

Eventos propuestos, sin texto libre ni datos personales: vista de Tienda, oferta visible, saldo insuficiente, apertura de confirmación, cancelación de confirmación, éxito confirmado por servidor, error por categoría, vista de comprobante, apertura de cotización por canal y consulta de próximo lote. Segmentar por membresía y suficiencia de saldo sin guardar identidad innecesaria. Un clic a WhatsApp no equivale a una venta.

Medir: conversión de reserva entre usuarios con saldo suficiente; abandono tras saldo insuficiente; porcentaje que encuentra comprobante; consultas por fecha/retiro; tiempo entre reserva, listo y entrega; cotizaciones respondidas/cerradas. Fijar objetivos tras una línea base propia, no aplicar porcentajes de Baymard como pronóstico.

Prueba moderada propuesta: cinco participantes representativos como primera ronda cualitativa, incluyendo socio y no socio, saldo suficiente/insuficiente y encargo. Tareas: entender qué se recibe y cuándo; encontrar condiciones; retomar compra tras recarga simulada; recuperar comprobante; distinguir beneficio mensual y preventa; preparar cotización sin enviar. Registrar errores de interpretación y puntos de abandono, no sólo opiniones estéticas. Esta prueba aún no se hizo.

## Límites y datos necesarios

Sin transacciones, entrevistas, analítica, pruebas de atención real ni verificación de producto físico. Hace falta confirmar con el negocio: lote vigente, existencia real de 250 g y presentaciones, fecha/rango de retiro, significado de «temporada», horario inequívoco, condiciones de cambio/devolución, reglas del beneficio mensual, zona/costo de entregas y tiempo de respuesta a cotizaciones. Las recomendaciones de investigación internacional orientan hipótesis; el comportamiento local debe comprobarse.

Fuentes consultadas el 8 de octubre de 2026: enlaces primarios incluidos junto al hallazgo. No se usaron reseñas de terceros ni resultados de redes sociales como evidencia. No se reproducen datos personales de la captura ni de cuentas.
