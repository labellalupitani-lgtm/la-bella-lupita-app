# Implementación operativa — 13 de septiembre de 2026

Estado: publicada en https://club-lupita.el-molino.workers.dev el 13 de septiembre de 2026 (hora de Managua). Versión `eb1b7aa5-93fe-4879-b59b-c6920ebff778`. Migración 012 aplicada en las bases real y demo, preservando saldos y libro mayor. Se conserva el diseño Casa.

## Entregado

- Cuentas personales: alta y recuperación mediante código, teléfono normalizado, caducidad, límite de intentos y uso único. Desactivadas hasta configurar proveedor. La demostración sigue separada.
- Personal: `/personal`, accesos individuales de encargado, caja y cocina; revocación inmediata; entorno identificado en pantalla y registro del responsable de las operaciones.
- Beneficios: código temporal consultable por caja. Mostrarlo no consume el beneficio; confirmar entrega lo consume una sola vez. También hay consulta y entrega del vale de la décima.
- Pedidos: número y detalle persistentes, bandeja del equipo, estados recibido → aceptado → preparando → listo → entregado. El cliente consulta el estado en `/compras`.
- Cancelación de pedidos: caja puede cancelar antes de preparar, con motivo. El cobro actual se realiza al enviar; cancelar devuelve exactamente saldo y puntos una sola vez. No se cambió a reserva de fondos porque esa política sigue sin confirmarse.
- Compras y reservas: comprobantes de pedidos, bolsas, mesas y experiencias. Las bolsas mantienen su comprobante aunque cambie el inventario de la siguiente cosecha. Caja registra entregas y asistencia.
- Reservas: el cliente puede cancelar una mesa futura sin depósito. Las que tienen depósito requieren atención del restaurante; no se inventó una política de devolución.
- Atención: solicitudes del cliente, respuesta del equipo y avisos dentro de la app. Responder una solicitud no modifica dinero ni reservas.
- Mostrador: búsqueda exacta de cliente, registro manual de sellos con ticket y recargas tras recibir el pago. Cocina no puede consultar ni modificar estas operaciones.
- Medición: panel para encargado con pedidos, entregados, cancelados, clientes e importe de los últimos 30 días. No pretende ser contabilidad de todas las ventas del restaurante.

## Verificación realizada

`npm test`: 12 grupos de regresión existentes, suite de cuenta cliente y 5 grupos de operación, todos correctos. Incluyen privacidad, repetición de solicitudes, permisos, códigos, devolución de saldo pagado y bono, reversión de puntos, cancelación de reservas, atención, entregas y comprobantes persistentes, trazabilidad del vale y repetición segura de la migración 012.

`npm run build`: TypeScript, Vite, verificación de iconos y guardián de diseño correctos.

Navegador integrado, exclusivamente en servidor local con datos sintéticos:

1. Cliente compra un espresso y llega al comprobante.
2. Personal acepta, prepara, marca listo y entrega; el cliente consulta el estado entregado.
3. Cliente envía una solicitud; el equipo responde; la respuesta aparece en la cuenta correcta.
4. Cliente solicita beneficio, caja identifica al titular y confirma la entrega; el cliente ve “Ya lo tomaste hoy”.
5. Perfil → Mis compras y reservas en marco móvil de 390 px: contenido sin desbordamiento horizontal (375 px útiles tras barra de desplazamiento).
6. Panel del personal muestra el entorno Demostración y las cifras operativas.

Las pruebas de API usan PostgreSQL local con PGlite. No sustituyen una prueba de carga o de concurrencia entre conexiones en Neon ni un piloto con empleados y clientes reales. Los estados se actualizan al pulsar Actualizar; no hay avisos push ni promesa de actualización en tiempo real.

## Integraciones y activación

El usuario indicó que todavía no ha elegido sistema de caja ni proveedor de WhatsApp, SMS o correo. La conexión de códigos está preparada mediante `OTP_SERVICE`; los contratos y pasos están en `INTEGRACIONES_OPERATIVAS.md`. No se creó una cuenta externa, no se envió ningún mensaje real ni se configuraron credenciales.

La sincronización automática con caja necesita el adaptador del sistema elegido. Las operaciones internas que utilizará están implementadas, con referencias para evitar duplicados. Mientras tanto el personal registra tickets y pagos desde el mostrador.

Cumpleaños, recompensas por referidos y campañas externas quedan pendientes de definir reglas, consentimiento y proveedor. No se anunciaron regalos ni envíos inexistentes.

## Publicación y piloto

1. Respaldar las bases real y demo y verificar su identidad sin imprimir credenciales.
2. Probar `db/012_operacion.sql` sobre una rama de ensayo con esquema real; cotejar saldos antes/después. Es aditiva, conserva el libro mayor y sustituye funciones de saldo y códigos. Confirmar que las migraciones anteriores, incluida 011, estén aplicadas.
3. Aplicar 012 a las bases real y demo antes de desplegar el Worker. Mantener `ACCESO_PERSONAL` desactivado y sin servicio externo hasta elegirlo.
4. Ejecutar pruebas y build; desplegar preservando bindings y secretos. Verificar la demo, `/personal`, capacidades y aislamiento en el despliegue.
5. Crear los accesos del equipo real y entregar las claves por canal privado. Ensayar con caja y cocina aceptación, faltantes, cancelación, entrega y cierre de turno.
6. Hacer un piloto limitado antes de abrir las cuentas personales al público; revisar tiempos, pedidos sin atender, canjes rechazados y cuadre de saldo.

Ante un problema, detener nuevas operaciones y preservar el libro mayor. No borrar asientos ni eliminar la migración. Un rollback al Worker anterior no incluye bandeja de pedidos; hay que resolver los pedidos pendientes y reconciliar los movimientos antes de volver a admitir cobros. Desactivar acceso personal corta nuevas altas/códigos, no revoca por sí solo sesiones de clientes ya emitidas.

Vista local de prueba: `http://127.0.0.1:5213/`; personal: `/personal`. Es efímera y no mueve dinero real. Se inicia con `node tests/preview-operacion.mjs` después del build. El respaldo previo del código está en `../respaldo-operacion-20260913-175725`.

## Verificación del despliegue

Respaldos previos conservados de ambas bases. Ensayo de migración sobre copia real correcto; rama temporal eliminada después de verificar producción. Pruebas, build y dry-run correctos. API de propietario comprobada tanto en real como en demo; lecturas del cliente, permisos y archivos publicados verificados. Navegador integrado: Club → Perfil → Mis compras y reservas muestra los comprobantes migrados. `ACCESO_PERSONAL=false`; sin servicio OTP configurado. No se realizaron compras ni envíos reales durante la verificación. Registro técnico: `PUBLICACION_OPERATIVA_20260913.json`.
