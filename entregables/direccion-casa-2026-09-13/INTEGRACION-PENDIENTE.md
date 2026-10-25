# Correspondencia con la auditoría de producción

Una propuesta visual no modifica la versión publicada. Esta tabla evita confundir un comportamiento explorado en el prototipo con una corrección incorporada a la aplicación.

| Hallazgo | Qué se explora en la propuesta | Qué falta en la aplicación |
|---|---|---|
| N01. Escritorio estrecho | Composición amplia de Carta | Integrar breakpoints y revisar todas las vistas |
| N02. Barra repetitiva | Producto protagonista y carta agrupada | Integrar catálogo completo con sus estados de servicio |
| N03. Foto seleccionada demasiado pequeña | Imagen nítida en la composición | Corregir `sizes` por variante y verificar `currentSrc`/DPR |
| N04. Pase recortado | Controles flexibles en el nuevo sistema | Corregir el componente real y probar textos largos a 320 px |
| N05. «capuchino» sin resultados | Búsqueda con alias | Incorporar normalización y pruebas del catálogo real |
| N06. Cero puntos en nivel máximo | Separación de estado y progreso | Corregir representación en Perfil con datos del socio |
| N07. Flecha abandona Reserva | Retroceso interno que conserva selección | Integrar navegación y conservación del borrador |
| N08. Tienda sin fotografía de mercancía | No se inventa una representación del empaque | Fotografía auténtica del café en grano y diseño de Tienda |
| N09. Movimiento poco visible | Selección, detalle y pedido coordinados | Implementar en componentes reales y probar estados asíncronos |
| N10. Selección de reserva densa | Controles compactos y revisión | Integrar disponibilidad, duración, depósito y errores reales |
| N11. Foto de terraza al elegir VIP | Terraza conserva su foto; VIP retira el retrato incorrecto y usa composición tipográfica | Obtener fotografía real del salón; el propietario confirmó que las imágenes del sitio oficial son de referencia |
| N12. Carnet como superficie genérica | Superficies distintas para carta, pase y espacio | Extender el sistema a Inicio, Tienda, Club y Perfil |
| N13. Texto sobre futuras entregas | Texto orientado a la tarea en las vistas exploradas | Retirar mensajes internos en todas las vistas restantes |
| N14. Cantidades inconsistentes | Un patrón para cantidades y total | Unificar controles y nombres accesibles en la navegación real |

## Revisión antes de publicar la integración

Comprobar los recorridos de pedido y reserva con datos aislados, incluyendo respuesta perdida, saldo insuficiente, cupo ocupado y cambio de cuenta. Mantener precios, beneficios y claves de idempotencia. Revisar visualmente 320, 390 y 1440 px, teclado y movimiento reducido. Verificar los activos efectivamente publicados después del despliegue.

La revisión de percepción debe incluir personas que compran café para retirar y socios que consultan beneficios. Observar primero si completan las tareas y después preguntar qué entienden y qué perciben; no presentar el nuevo diseño como superior antes de que lo vean.
