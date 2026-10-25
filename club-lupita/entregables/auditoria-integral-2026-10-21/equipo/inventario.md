# Inventario de operación

Las doce rutas usan `/personal?seccion=...`. Propietario y encargado acceden a todas; Caja accede a pedidos,caja,tienda,entregas,agenda,atencion,seguridad; Cocina a pedidos,seguridad. La administración interna depende además del rol. `roles-dom.json` registra cada ruta solicitada y su destino real; `ampliacion.json` incluye denegación por API.

| Sección | Módulos y formularios | Diálogos / comprobantes / exportación | Ensayo nuevo |
|---|---|---|---|
| Resumen | Indicadores, importe del día, accesos a operaciones | No modifica datos |Cinco anchos, texto200, error/retry, carga retenida y cifras cero |
| Pedidos | Bandeja, búsqueda/estado/fecha, paginación; disponibilidad/recepción de Carta; fichas verificadas con cocina; métricas/incidencias | Cancelación con importe/motivo; número, productos, opciones, restricción, estado | Restricción, preparación, aceptación con respuesta perdida, recuperación, cancelación y devolución, página2, vacío |
| Caja | Cliente/recargas/sellos; beneficio de membresía; premio por sellos; descuento de repostería; consulta registros | Confirmar recarga; confirmar/anular descuento; referencias de ticket; historial últimos10 | Consulta, límite199/200, recarga; beneficio, sello, premio, descuento con respuesta perdida y anulación completos |
| Mi Club | Condiciones/costos, reglas aprobadas, espera, experiencias, correcciones de beneficios, medición | Publicar experiencia; cancelar y devolver entradas; autorizar reposición | Condiciones/costos, activación de reglas, reposición, espera VIP, publicación/cancelación de experiencia, respuesta perdida recuperada |
| Tienda | Lote/precio/disponibilidad, ficha verificada, bolsas/estados, seguimiento | Condiciones conservadas de compra, UUID comprobante, confirmar lista/entrega/reembolso | Ficha guardada, marcar lista, entrega y reembolso con motivo; respuesta perdida e idempotencia |
| Entregas | Bolsas/asistencias pendientes/completadas, búsqueda/fecha | Confirmar entrega/asistencia con titular y comprobante | Bolsa preparada y entregada; vacío posterior |
| Agenda | Fecha, reservas, configuración de mesas, límites/horario/excepciones/cierres, métricas | Manual; llegada/inasistencia/cambio/cancelación/mesa/salida; anticipo/aplicar/devolver | Configuración guardada, manual VIP, llegada/mesa/salida; C$300 aplicados+C$200 devueltos, respuesta perdida recuperada |
| Atención | Solicitudes, búsqueda/estado/paginación | Responder con texto mínimo y resolver |26 solicitudes; validación y respuesta sintética local exitosa |
| Informes | Período1/7/30/90d, cifras, métricas Inicio, auditoría y detalle JSON | Exportar cifras CSV | Descarga real local en cifras-prueba.csv; errores de consultas separadas |
| Clientes | Directorio/archivo, búsqueda/estado/origen/fechas; ficha contacto/cuenta; historial por tipo | URL con cliente; saldo, membresía, actividades |28 clientes, nombre largo, sin correo/bebida/puntos, ficha e historial |
| Equipo | Accesos, búsqueda, permisos por rol | Invitar; cambio de rol/desactivar/reactivar/renovar invitación; enlace individual | Invitar/activar/MFA, cambiar rol, renovar invitación, desactivar/reactivar; pérdida de respuesta recuperada con usuario único |
| Seguridad | Identidad, contraseña, recuperación, sesiones, eventos | Confirmar identidad; renovar/códigos nuevos; revocar sesión/todas | Contraseña actualizada, confirmación inválida rechazada, códigos rotados, bloqueo/MFA, cierre de sesiones y recuperación |

Los detalles exactos de campos y botones extraídos del DOM están en `inventario-dom.json`. Un botón presente en el DOM de un diálogo cerrado no se considera disponible en pantalla. Las capturas y ensayos distinguen visibilidad real de inventario estático.

El prototipo es deliberadamente un solo recorrido (Pedidos del turno), no reemplaza las once secciones restantes. No hay backend, autenticación, cronómetro real ni actualización remota en él. Las simulaciones son controles explícitos dentro de Escenarios de prueba.

El cierre completo de los 59 pendientes está trazado en `pendientes-resueltos.json` y `.md`. El inventario conserva el resto de variantes inspeccionadas y las fuentes de cada resultado; no hereda aprobaciones de ejecuciones anteriores. Los estados de lectura añadidos se ensayaron a390 px sobre los doce módulos, además de la matriz base en cinco anchos y texto200.
