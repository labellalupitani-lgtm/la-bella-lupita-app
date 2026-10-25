# Pedidos del turno · comparación y revisión propia

Prototipo integrado en `http://127.0.0.1:5310/equipo`, archivos `prototipo.tsx` y `prototipo.css`. Todos los pedidos y cambios son sintéticos. La cabecera global de la demo se incluye en las medidas; la referencia original incluye su propio aviso de fixture.

| Ancho | Primera acción antes, y | Primera acción después, y | Pedidos visibles antes/después |
|---|---:|---:|---:|
|320|1431|792|0 / 1|
|390|1359|684|0 / 2|
|768|1042|642|1 / 3|
|913 con gutter estable|943|629|1 / 6|
|1440|898|660|2 / 6|

Medidas iniciales verificadas con el shell. La última revisión preservó también importes por línea; `verificacion-prototipo.json` y las capturas nuevas son la fuente vigente si cambia ligeramente la geometría. Esta comparación mide posición y visibilidad, no productividad real de personal.

La bandeja muestra los 26 pedidos, ordenados por antigüedad. Historial, búsqueda y orden alternativo están accesibles. Las acciones avanzan estados; la entrega y la cancelación requieren confirmación. La restricción alimentaria bloquea la preparación hasta una confirmación explícita. Cocina oculta importes y acciones de aceptación/cancelación/entrega; caja conserva sus tareas. El rol Encargado permite cancelación por incidencia durante preparación.

Se ejercitaron: restricción; error antes de guardar y reintento; respuesta perdida después de guardar y Comprobar estado (contador de transacciones aumenta solo una vez); diálogo de entrega con teclado; motivo inválido y válido de cancelación; historial con motivo; búsqueda vacía. No hubo errores JS. Axe informó0 violaciones. Se capturaron320/390/768/913/1440 y texto200. La revisión visual detectó números partidos en las pestañas con texto200 y se corrigió con mínimo de contenido y conteos sin salto; también se explicitó Montserrat para los números de pedido frente a la regla global de títulos.

Los colores calculados están documentados en `accesibilidad.json`. Los pares principales tienen texto oscuro sobre marfil y blanco sobre borgoña; el barrido automático incluyó contraste. En movimiento reducido no quedan transiciones activas. El título de pedido, el estado y el tiempo son texto; ninguna decisión depende solo del color.

Pendiente de crítica independiente: percepción de densidad y orden por personal real; preferencia entre estado agrupado y orden cronológico; múltiples operaciones inciertas simultáneas; sesión persistente y concurrencia real. Esta demo no acredita esos comportamientos del backend.
