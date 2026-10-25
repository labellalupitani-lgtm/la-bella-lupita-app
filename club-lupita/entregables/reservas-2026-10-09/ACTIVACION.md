# Activación de reservas

Las migraciones 027 y 028 y la publicación se ejecutaron el 10 de octubre (hora de Managua). Consultá el [estado actualizado](../reservas-2026-10-10/ESTADO.md) y su evidencia. Este procedimiento queda como referencia operativa. Usar las credenciales ya gestionadas por el proyecto sin pegarlas en documentación, consola compartida ni capturas.

## Preparar y publicar

1. Conservar una copia recuperable de la base y la versión desplegada. Revalidar cualquier cambio simultáneo de otros chats antes de publicar. El respaldo de fuentes de esta tarea está en `respaldo/`; no es una copia de la base.
2. Revisar `db/027_reservas.sql`. Requiere las migraciones anteriores hasta 026. Es repetible; no asigna capacidades ficticias, no mueve dinero histórico y no inventa asistencia. Si existen reservas VIP históricas solapadas, resolverlas explícitamente antes de crear su restricción; no borrar registros para forzar la migración.
3. Seleccionar explícitamente la base de destino y aplicar `node scripts/db.mjs db/027_reservas.sql db/028_reservas_reembolso.sql`. El script usa `DATABASE_URL` del proceso o, por defecto, `.dev.vars`: comprobar el entorno antes de ejecutarlo. Repetir para la base separada de capacitación, sin copiar datos reales ni configuración sintética a producción. No ejecutar las semillas 002/008/019 como parte de esta activación.
4. Ejecutar `npm test`, `npm run build`, `node tests/reservas-rendimiento.mjs` y `npx wrangler deploy --dry-run`. La prueba real de concurrencia (`node tests/reservas-concurrencia.mjs`) exige que `.demo.local` apunte a una base distinta; crea y elimina solo su esquema de prueba.
5. Publicar el Worker y los assets juntos con el procedimiento habitual. La configuración inicial vacía impide confirmaciones nuevas hasta registrar mesas; coordinar la activación con el equipo para evitar presentar ese estado como disponibilidad completa.
6. En Personal → Agenda → Configurar mesas y condiciones, cargar identificadores y plazas comprobadas, combinaciones autorizadas, horario, excepciones y cierres por zona. Cargar solo texto público y sin datos de clientes en descripción, accesibilidad y motivo de cierre. VIP mantiene exclusividad de un grupo; la política aprobada devuelve todo el anticipo pendiente al cancelar o registrar la inasistencia. Confirmar que el cliente las ve antes del cargo.
7. Verificar en el dominio real: `/reservar` entrega la entrada específica y sus metadatos, consulta sin sesión, acceso al confirmar, comprobante, disponibilidad tras cambio/cancelación y permisos de caja/administración. Cualquier reserva de prueba real debe quedar identificada y resolverse con el equipo; no enviar mensajes ni cargar cuentas de clientes como ensayo.

## Correo de reservas

La función solo envía con `RESERVAS_CORREO="true"`; el canal quedó activado en esta publicación. Requiere `RESEND_API_KEY` y `EMAIL_FROM` con remitente válido en el transporte utilizado. La activación de acceso por correo (`ACCESO_CORREO`) es otra función y no activa esta cola.

El comprobante y el aviso interno se guardan en la misma transacción que la visita. Un fallo de correo no cancela la mesa. Los envíos inmediatos usan ejecución en segundo plano; el cron existente procesa pendientes y recordatorios. El cron configurado es cada hora, por lo que un recordatorio previsto 24 horas antes puede salir después de ese instante. No se promete entrega exacta al minuto.

Antes de activar, revisar la antigüedad de pendientes para no enviar avisos obsoletos de la etapa de preparación. El procesador descarta versiones superadas y recordatorios de visitas ya iniciadas. El volumen máximo del lote horario es 20 y cada acción de reserva procesa hasta tres; observar la cola antes de aumentar tráfico.

La clave de idempotencia de envío es estable por fila de la cola y el contenido queda congelado durante sus reintentos. Se hacen hasta cinco intentos y se deja de reintentar automáticamente después de 23 horas desde el primero, dentro de la ventana de 24 horas documentada por [Resend](https://resend.com/docs/dashboard/emails/idempotency-keys). Los casos `requiere_revision` necesitan conciliación del proveedor: comprobar si el correo fue aceptado antes de autorizar otro envío. No borrar filas ni regenerar referencias para «destrabar» correos cuyo resultado es incierto.

La agenda muestra pendientes y si está habilitado el canal. Consultas operativas sin datos personales:

```sql
SELECT error, count(*) AS pendientes
FROM reserva_correo
WHERE enviado IS NULL AND descartado IS NULL
GROUP BY error;

SELECT estado, count(*) AS visitas,
       sum(deposito-anticipo_aplicado-anticipo_devuelto) AS anticipo_pendiente_centavos
FROM operativo_reserva GROUP BY estado;
```

## Operación y reversión

- Caja verifica serie/referencia única y autorización antes de cobrar consumo VIP. Si el consumo ya tiene un pedido pagado, elegir ese modo; no registrarlo otra vez como consumo de caja.
- Cancelar devuelve automáticamente el anticipo pendiente y libera disponibilidad en la misma transacción. Registrar la inasistencia, después de terminada la visita prevista, también lo devuelve. Los reintentos no duplican el reintegro. Si ya se aplicó consumo, solo se devuelve el remanente. No se impone penalización ni plazo mínimo de cancelación.
- Una visita histórica sin asignación bloquea conservadoramente su zona. Revisarla con el equipo y reprogramarla con asignación cuando corresponda; no rellenar mesas arbitrarias mediante SQL.
- Si una respuesta financiera es incierta, actualizar agenda y revisar estado/libro antes de repetir. La revisión y la referencia evitan duplicados; no inventar otra referencia para el mismo cobro.
- Para detener confirmaciones, usar cierres de la agenda sin invalidar visitas activas; coordinar primero las afectadas. Para detener solo correo, desactivar `RESERVAS_CORREO`.
- Conservar la migración y los movimientos del libro al revertir código. La versión anterior no conoce mesas, remanentes ni estados nuevos: volver a ella sin bloquear antes las escrituras de reservas puede volver a ofrecer disponibilidad incorrecta. Preparar una reversión que mantenga el contrato de reservas o publicar una corrección hacia adelante.
- Después de publicar, medir errores 409/5xx, cola, contención y p95 real. Verificar lectura con NVDA/Edge y VoiceOver/Safari, zoom nativo y texto ampliado. Estas verificaciones no se sustituyen por los presupuestos locales ni el árbol accesible.
