# Contratos de integración — Club Lupita

Los servicios externos permanecen desconectados. Este documento distingue los puntos implementados de los adaptadores que dependen del proveedor elegido.

## Códigos de acceso: punto de conexión implementado

El Worker requiere simultáneamente `ACCESO_PERSONAL="true"` y un binding de servicio privado `OTP_SERVICE`. Si falta cualquiera, `/api/capacidades` informa `accesoPersonal:false` y los intentos de acceso personal reciben 503. No se devuelve el código real al navegador.

El binding recibe `POST https://otp.internal/enviar` con `Content-Type: application/json`, cabecera `idempotency-key: acceso:<id>` y este cuerpo:

```json
{"telefono":"50588887777","codigo":"123456","venceEnMinutos":10}
```

Respuesta esperada: HTTP 2xx con `{"enviado":true}` únicamente cuando el proveedor acepta el envío. No significa confirmación de lectura o entrega al dispositivo. Cualquier error, cuerpo distinto o espera superior a ocho segundos invalida el código y devuelve un error al cliente. Un reintento del cliente genera un código nuevo y deja inválido el anterior.

El adaptador del proveedor debe:

- Validar método, destino y formato; deduplicar la clave de idempotencia.
- Usar credenciales guardadas como secretos de su Worker y mantener desactivada una URL pública del adaptador. El acceso se realiza por service binding.
- Traducir teléfono, código y vigencia a la plantilla autorizada del proveedor.
- No registrar códigos ni credenciales. Registrar solo identificador de operación, resultado y referencia no sensible del proveedor.
- Dar respuesta positiva solo después de aceptación del proveedor y manejar sus rechazos, límites y tiempos de espera.

Configuración que se añadirá después de desplegar el adaptador real:

```jsonc
{
  "services": [{ "binding": "OTP_SERVICE", "service": "nombre-del-adaptador-elegido" }],
  "vars": { "ACCESO_PERSONAL": "true", "CANAL_OTP": "WhatsApp" }
}
```

Este ejemplo no debe reemplazar los bindings o variables existentes. No se añadió a Wrangler para impedir activación accidental. `CANAL_OTP` debe describir el canal realmente contratado. La autenticación actual identifica por teléfono: usar correo como identificador requerirá ampliar el modelo y la pantalla; no basta con cambiar el nombre del canal.

Pruebas antes de activar: envío a un número propio autorizado, rechazo del proveedor, expiración, código equivocado, quinto intento, reintento, cuenta existente y recuperación desde otro dispositivo. Las pruebas locales usan un doble de servicio, sin envío externo.

## Sistema de caja: operaciones internas disponibles

No hay proveedor seleccionado ni webhook público de POS habilitado. El futuro adaptador deberá verificar la firma y el estado de pago del proveedor antes de traducir un ticket. No se reutiliza la clave del propietario ni se entrega esa clave al POS.

Operaciones internas actualmente disponibles para personal de caja autenticado:

| Operación | Ruta | Datos esenciales |
|---|---|---|
| Consultar cliente | POST `/api/operacion/cliente` | `telefono` |
| Registrar sello de compra | POST `/api/tanda/sellar` | `telefono`, `ticket`, `motivo` |
| Registrar recarga pagada | POST `/api/cuenta/recargar` | `telefono`, `monto` en centavos, `ref` |
| Ver pedidos | GET `/api/operacion/pedidos` | sesión de personal |
| Actualizar preparación/entrega | POST `/api/operacion/pedidos/:id/estado` | `estado`, `motivo` si cancela |

El adaptador pendiente debe mapear un identificador estable de sucursal + ticket del proveedor a la referencia interna (8–64 caracteres), conservarlo en reintentos y almacenar la relación de identificadores. Recibir dos veces un evento no debe duplicar un sello ni una recarga. Un ticket cancelado o una devolución requiere una política y un evento explícitos; no debe tratarse como compra nueva.

La sesión de caja sirve al mostrador humano. Para automatizar de forma permanente se debe incorporar una identidad técnica con permisos específicos y rotación de credenciales, conforme al proveedor elegido. No se dejó una credencial técnica activa sin destinatario.

El flujo de pedidos de la app ya descuenta la Cuenta de Casa. Importar ese mismo pedido del POS como nuevo cobro duplicaría el cargo: la integración futura deberá correlacionar su número y registrar únicamente la confirmación externa correspondiente.

## Avisos y campañas

Los avisos del pedido y las respuestas de atención ya quedan guardados dentro de la app. No existen envíos externos ni una suscripción push activa. La conexión del proveedor de códigos no habilita por sí misma campañas de marketing.

Para campañas hacen falta consentimiento por canal, preferencias y baja, reglas de cumpleaños y referidos, límites de frecuencia, cola con reintentos y registro de entrega. Estos elementos deberán implementarse al definir el programa; no se simulan como campañas funcionando.
