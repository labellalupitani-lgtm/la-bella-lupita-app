# Recorrido de la aplicación publicada

Fecha: 13 de septiembre de 2026. URL: https://club-lupita.el-molino.workers.dev

**Resultado: los flujos principales de la cuenta de muestra funcionan, pero la aplicación todavía no está completa para operar con clientes reales.**

Se recorrieron las seis pantallas de cliente: Inicio, Pedir, Tienda, Club, Reservar y Perfil, además de la entrada. Las pruebas utilizaron Microsoft Edge, móvil de 390 píxeles y navegación de escritorio de 1440 píxeles. Se efectuaron 530 clics registrados en los recorridos principales, más los del ensayo de límites y escritorio. No se enviaron mensajes a terceros.

## Qué se probó

| Área | Cobertura y resultado |
| --- | --- |
| Entrada | Campo de teléfono: elimina letras y limita a ocho dígitos. Acceso demo correcto. Alta real deshabilitada. |
| Inicio | Recarga informativa, pase, premio pendiente, renovación de código, tarjetas y accesos rápidos. La campana lleva al Perfil; no existe una bandeja de notificaciones. |
| Navegación | Cinco pestañas, accesos rápidos, tarjetas y botones de volver. Reservar vuelve al Club. Navegación de escritorio sin desbordamiento horizontal. |
| Carta | Los 73 productos: 24 de Barra, 14 de Brunch, 27 de Bistró y 8 de Sobremesa. Se abrió cada detalle, se agregó desde el detalle y se utilizó su botón directo de agregar. |
| Búsqueda | Texto con mayúsculas y tildes, resultado vacío y recuperación de toda la carta. |
| Carrito | Aumentar y reducir cada una de las 73 líneas, vaciar, añadir un Espresso y pagarlo. El consumo aparece en los movimientos. |
| Tienda | Abrir y cancelar confirmación; comprar una bolsa. Los dos botones de cotización generan destinos WhatsApp. Se interceptó la apertura: no se comprobó atención humana ni se enviaron mensajes. |
| Membresía | Alta, anotar bolsa mensual, canjear bebida, cancelar y reactivar renovación y volver a cancelarla. La demo quedó sin renovación automática. |
| Experiencias | Compra de una butaca en cada una de las dos experiencias disponibles. |
| Reservas | Selección de cinco zonas, las 14 fechas, cantidades de 1 a 12 personas, duraciones de 1 a 6 horas y 14 horas disponibles de una fecha. Confirmación de una reserva por zona, incluido depósito del Salón VIP. |
| Perfil | Copiar código al portapapeles, volver a Inicio, movimientos y cierre de sesión sin conexión. |

No se produjeron errores JavaScript en los recorridos registrados. Se probaron las opciones individuales, no el producto cartesiano de todas sus combinaciones ni todos los dispositivos. `/kit` se identificó como una galería de componentes, con botones de ejemplo; no se contabilizó como flujo funcional. El panel legado del personal y las entregas físicas no forman parte de este recorrido de cliente.

## Fallo encontrado y corregido durante el recorrido

El alta de membresía devolvió 500 al procesar un historial con muchas membresías vencidas. El Worker realizaba una consulta HTTP por cada socio y agotaba su presupuesto de subpeticiones. La operación se cambió a una consulta que ejecuta el mantenimiento ordenado dentro de PostgreSQL.

Se añadió una regresión con 80 membresías vencidas. Pasaron los 12 grupos de API/SQL y TypeScript; se publicó la versión `27488075-99b3-4d24-b3a2-8c36e220c6e2`. Después pasaron el alta, los dos beneficios y los cambios de renovación en la URL pública.

Dos fallos iniciales fueron del guion de prueba: esperaba volver a Inicio desde Reservar, aunque ese botón vuelve al Club, y esperaba que el nombre accesible de Agregar no cambiara después de añadir un producto. Se corrigieron las expectativas y se repitieron navegación, carta y carrito completos. La repetición pasó.

## Pendiente o incompleto

1. **Alta real por WhatsApp:** el botón está deshabilitado. El texto invita a dejar un número, pero el campo no lo registra para una lista de espera.
2. **Pedidos operativos:** el cobro y el movimiento funcionan, pero no hay cola automática para que el barista reciba y gestione el pedido. La app incluso muestra una estimación de preparación sin estar conectada a esa operación.
3. **Límite de cantidades:** al seleccionar 21 Espressos, la interfaz permite intentar pagar, pero la API responde 400: «La cantidad de Espresso no nos cuadra». El máximo de 20 unidades debe reflejarse antes del pago. No se cobró ese pedido rechazado. La API también limita a 40 líneas distintas; el carrito no refleja ese límite.
4. **Avisos, perfil, retos y regalos:** la campana abre Perfil. No hay edición de perfil, retos operativos ni reglas verificadas de regalos de cumpleaños o referidos; compartir sólo copia el código.
5. **Recarga y renovación:** la recarga desde Inicio es informativa y requiere caja. La renovación se valida al usar los flujos de cuenta; no hay temporizador autónomo configurado debido al límite del plan de Cloudflare.

La prueba acredita los resultados indicados; no justifica afirmar que toda la aplicación está terminada ni que se verificó la operación completa de un negocio.

## Datos y evidencias

Se añadió saldo **ficticio** de C$30,000 y un premio de prueba sólo en la rama demo. Las compras y reservas consumieron únicamente esos datos aislados. No se acreditó dinero real ni se alteró inventario de la base principal. La demo conserva los movimientos de estas pruebas para inspección.

- `resultados.json`: recorrido inicial.
- `resultados-repeticion.json`: navegación, los 73 productos, las 73 líneas del carrito y membresía verificados después de la corrección.
- `bordes.json`: escritorio y rechazo de 21 unidades.
- `limite-cantidad.png`: evidencia visual del límite no indicado en el carrito.
- `inventario.json`: controles y contenido observados; también incluye controles ocultos de diálogos, por lo que no representa un conteo de botones visibles.
