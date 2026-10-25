# Activación preparada — decisión del propietario

El 12/10/2026 el propietario aprobó las cinco propuestas y después indicó **«Dejar activación preparada»**. La publicación técnica no activa las condiciones en producción ni en capacitación. La versión de operación es `operacion-2026-10-12`; `reglas_version` permanece nula hasta una activación explícita desde Personal → Mi Club.

## Para quien valida la operación

1. **Barra:** comprobar que hay vaso/taza de 8 oz y anotar presentación regular real de cada una de las siete bebidas del premio. Probar un extra y una opción agotada. El café diario no se acumula; un premio ganado permanece pendiente hasta su entrega.
2. **Propietario:** registrar costos reales por café, bolsa y período. Revisar además el margen de los ocho postres. Una revisión de costos no demuestra rentabilidad incremental: separar frecuencia real, consumo de beneficios, descuento, empaque, personal y posibles ventas desplazadas. No usar las cifras sintéticas de las pruebas.
3. **Reservas:** registrar inventario real del VIP, capacidad y condiciones vigentes. La app no inventa mesas. La lista de espera pide fecha, hora, duración y personas; no cobra ni confirma una reserva.
4. **Encargado/caja:** ensayar dos solicitudes concurrentes para un mismo horario y grupo, una de miembro y otra de cuenta gratuita. Comprobar prioridad, oferta pendiente, desistimiento y cambio de vigencia. Una oferta pendiente debe resolverse antes de pasar a otra persona; no desplazar reservas confirmadas.
5. **Dos turnos de caja:** aplicar la misma regla a ticket de C$99.99, C$100, ticket mixto, recarga sin consumo, bebida gratuita, ticket duplicado y premio anterior. El personal declara el neto elegible según el comprobante; la app no está conectada al sistema externo de facturación y no puede verificar su contenido automáticamente.
6. **Activación:** registrar fecha, responsable y resultados en Personal → Mi Club → Reglas aprobadas. El servidor exige propietario, versión vigente, costos cargados, inventario VIP y evidencia. Publica las reglas y la lista de postres en una operación; el historial conserva las condiciones anteriores.

## Lo ya comprobado técnicamente

- Activación rechazada sin evidencia suficiente, costos o inventario; reintento sin segunda activación.
- Un sello por ticket y cuenta; mínimo C$100 netos y confirmación de elegibilidad cuando la versión está activa. Auditoría del importe declarado.
- Tandas previas conservan sus condiciones; las nuevas registran versión. La entrega de un premio nuevo requiere bebida de la lista aprobada.
- Espera propia visible/cancelable; administración ordena y ofrece según vigencia y orden de solicitud. Ofertas simultáneas verificadas en PostgreSQL real dentro de un esquema sintético eliminado al terminar.
- No se crea una reserva, se registra un pago ni se envían mensajes externos al anotar una espera o gestión.
- Los campos operativos activos no se pueden reescribir con texto que contradiga sus controles; cambiar la regla requiere otra versión. Los costos pueden actualizarse.

## Validación de experiencia pendiente

Usar el protocolo existente de [Mi Club](../mejoras-mi-club-2026-10-09/VALIDACION-PENDIENTE.md): 5–8 participantes voluntarios con datos ficticios, lectores de pantalla en dispositivos físicos y comparación entre turnos. Estas actividades no se realizaron en esta ejecución. Los ensayos con motores de navegador y axe no las sustituyen.

Para el nuevo recorrido, pedir a cada participante explicar qué es gratis, cuánto cuesta la membresía, qué se paga aparte, cómo sumar/canjear un sello y cómo desactivar renovación. Registrar comprensión, errores y tiempo, sin introducir pagos reales. La carga real a p75 necesita una ventana de datos de campo; los tamaños del build no equivalen a Core Web Vitals.
