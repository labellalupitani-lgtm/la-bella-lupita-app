# Operación de Tienda

## Abrir la preventa

El propietario entra en **Personal → Tienda → Ficha y condiciones del lote**. Completa nombre comercial, presentación, origen, contenido, fechas estimadas, lugar, horario y condiciones ante demoras o cancelaciones. Registra quién confirmó la información, revisa la vista previa de la ficha en Tienda y habilita nuevas preventas. El formulario exige confirmación y rechaza ediciones basadas en una revisión antigua.

La fuente de verificación queda en administración y en la auditoría; no se publica en el catálogo ni en los comprobantes del cliente. La ficha debe describir un producto real. Presentación debe indicar grano/molienda y cuándo se elige; perfil puede incluir tueste, notas y preparación recomendada solo cuando estén confirmados. Si aún no se conocen, hay que decirlo expresamente.

La foto es opcional y debe ser una fotografía real del producto. Primero se incorpora al conjunto de archivos publicados de la aplicación; después se indica su ruta y descripción. El servidor comprueba que la ruta sirve una imagen. No se han publicado fotografías generadas ni atributos supuestos.

Las fechas se interpretan en Managua. Vencida la ventana de retiro, o con ficha incompleta, la venta se detiene. El precio y la capacidad siguen saliendo del inventario; esta entrega no modifica sus importes ni crea unidades. Un cambio de generación requiere ficha propia. La numeración se interpreta siempre junto al lote.

**Datos comerciales todavía pendientes:** nombre comercial definitivo si difiere de Reserva de Cosecha, presentación/molienda, origen específico verificable, ventana de retiro, lugar y horario, política de demoras/cancelaciones y fuente de confirmación. También foto, perfil/tueste/preparación cuando se conozcan. Para encargos, confirmar con cada cliente cantidades, fecha, zona, transporte/costo y plazo de respuesta antes de cerrar la cotización.

## Preparar y entregar

1. Caja, encargado o propietario abre **Personal → Tienda** y revisa el comprobante, cliente, número y lote.
2. Marca **Lista para retiro** solo cuando la bolsa está físicamente preparada. Se registra actor/estado y un aviso en la cuenta del cliente. No se envía WhatsApp ni correo automáticamente.
3. Al entregarla al titular, confirma **Registrar entrega**. Repetir esa confirmación no duplica la entrega.
4. El cliente ve precio, condiciones aceptadas y estado actual en **Mis compras y reservas**. Los cambios futuros de ficha no reescriben su acuerdo.

La sección general Entregas usa el mismo control; no permite entregar una bolsa aún no preparada o ya reembolsada.

## Cancelar y devolver

Propietario o encargado puede cancelar una bolsa pagada/lista, consignando el motivo y confirmando el importe. La devolución se abona a la **Cuenta de Casa**, no es una devolución bancaria. Revierte el cargo original con sus componentes de saldo y los puntos correspondientes, conserva el libro mayor y registra auditoría y aviso al cliente. No vuelve a ofertarse ese número. Una bolsa entregada queda fuera de este flujo y requiere revisión administrativa.

La migración enlaza compras antiguas solo si encuentra una coincidencia inequívoca de cuenta, número, importe y timestamp transaccional, junto al asiento original. Cuando falta esa evidencia, la devolución automática queda bloqueada. Administración debe conciliar los documentos originales; no se asigna un asiento por cercanía de fecha o importe. No se han inventado políticas retroactivas para esas compras.

## Ayudar ante una respuesta perdida

Pedir al cliente que abra Tienda y use **Consultar resultado**. La consulta funciona aunque no quede saldo o stock. Una respuesta incierta conserva la referencia. Consultar espera a cualquier transacción de compra que esté en curso. Descartar un intento sin cobro lo cierra de forma permanente para impedir que una petición retrasada lo cobre después.

Si el resultado estaba confirmado, se recupera el mismo comprobante. El saldo del comprobante es el de aquel momento; el saldo actual se consulta de nuevo. El acceso a comprobantes siempre se limita a la cuenta propietaria. Ante una compra antigua hecha en otro dispositivo sin intento durable, consultar Mis compras y reservas.

## Seguimiento diario

Administración revisa **Seguimiento de Tienda**: bolsas por estado, obligaciones con retiro vencido, tiempo medio hasta entrega y acciones de los últimos 30 días. Las acciones cuentan interacciones, no personas únicas. Recuperar un comprobante puede contarse varias veces; no equivale a una nueva venta. WhatsApp mide apertura de consulta, no pedido vendido. Las ventas y entregas se obtienen de comprobantes del servidor.

Los eventos distinguen red, respuesta inválida, servidor y rechazo de compra. No admiten teléfonos, correos, mensajes ni referencias de cliente. Respetan DNT/GPC. Los logs del cobro usan una huella de la referencia y el estado HTTP para investigar incidencias; requieren acceso operativo restringido.

Establecer objetivos después de reunir una base propia. Revisar manualmente las consultas de atención sobre café/retiro sin exportar su contenido a métricas. Las pruebas locales no son mediciones de velocidad o conversión de clientes reales.

## Publicación y recuperación técnica

La migración `db/023_tienda.sql` es aditiva y repetible. Los respaldos completos son privados, con terminación `.local`, fuera del directorio público. Se ensayó su restauración y la migración dos veces antes de aplicar cambios remotos. `scripts/publicar-tienda.mjs` verifica integridad, huellas de archivos y versión remota para evitar pisar otra publicación.

Para una incidencia comercial, pausar nuevas preventas desde la ficha sin borrar compras. Para una incidencia técnica, conservar los asientos y comprobantes nuevos y publicar una corrección verificada. No restaurar una base completa sobre transacciones posteriores ni volver sin revisión a la versión anterior, que no exige la nueva cotización. El respaldo de fuentes sirve de referencia para una recuperación controlada.
