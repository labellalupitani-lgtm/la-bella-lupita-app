# Plan de corrección integral de Carta

Objetivo: resolver C01–C24 de la auditoría del 8 de octubre sobre la implementación vigente, conservar cambios de los otros chats y verificar cada requisito antes de cerrar. Inicio: 9 de octubre de 2026.

## Estado y reglas confirmadas

- La versión actual ya incorpora rutas diferidas, barrera de errores, sesiones HttpOnly y revalidación de cuenta. Se conservarán y se comprobarán dentro de Carta.
- El usuario confirmó el horario vigente: lunes a sábado 07:00–21:00 y domingo 08:00–21:00, America/Managua; empaque C$40 para llevar. La cotización mostrará este cargo por pedido antes de pagar.
- No hay Git. Se guardó el código, esquema, pruebas y configuración actuales en `respaldo`, sin secretos, y un manifiesto en `estado-inicial.json`.
- Las pruebas de cobro se harán en cuentas sintéticas. Los cambios de esquema serán aditivos y se ensayarán sobre datos aislados. No alterar historial ni precios de platos.
- No publicar garantías alimentarias, porciones, fotografías o suplementos inventados. Las opciones explícitas de la carta conservarán el precio anunciado; cualquier dato nuevo requerirá revisión de operación.

## Ejecución por dependencias

1. **Precio e intento durable — C01, C02, C03, C07, C16, C17, C19.** Contrato compartido de cantidades y opciones; cotización del servidor con vencimiento y desglose; comprobación de la cotización antes de debitar; recibo histórico independiente del catálogo actual; consulta por referencia; persistencia separada de borrador e intento. Preservar la recuperación de referencias históricas. Pruebas de precio cambiado, retiro de producto, respuesta perdida, corrupción de almacenamiento, totales y duplicados.
2. **Preparación y control operativo — C04, C05, C06, C18, C20.** Opciones obligatorias en ficha, pedido, recibo y cocina. Disponibilidad por producto/categoría, pausa, horario y capacidad configurables por personal autorizado. Información de restricciones confirmada para el pedido con acceso mínimo. Seguimiento actualizado y cancelación excepcional con motivo y devolución única. Edición responsable de información de decisión.
3. **Consulta, búsqueda y accesibilidad — C08, C09, C10, C11, C12, C13, C14, C15, C24.** Consulta independiente de cuenta; saldo actualizable y borrador conservado; búsqueda normalizada y alias; resultados cerca del campo; URL coherente; foco restaurado y visible; anuncios de estado; nombre Carta y textos transaccionales consistentes. Verificación en 320, 390, 768, 1024 y 1440 px, teclado, movimiento reducido y errores.
4. **Rendimiento, mantenimiento y medición — C21, C22, C23.** Consolidar estilos de Carta, imágenes adaptadas al tamaño y respaldo de carga, cachear solo archivos versionados; mantener diferimiento y barrera nuevos. Métricas agregadas sin texto ni datos personales, límites que no impidan reintentos y vista de excepciones para operación. Comparar mediciones reproducibles antes/después; instrumentar objetivos de campo sin inventar resultados.
5. **Verificación integral y entrega.** Pruebas específicas, suites actuales, guardianes, TypeScript, build, recorridos visuales y revisión contra los 24 criterios originales. Documentar evidencia y límites por hallazgo. Preparar migración y publicación de la versión verificada, preservar cambios concurrentes y comprobar después sin pedidos reales.

## Criterios de cierre

La matriz debe enlazar cada C01–C24 con implementación, comprobaciones y cualquier evidencia pendiente. Un test que solo termina no demuestra que el comportamiento esperado esté satisfecho. Las métricas de campo, aprobación de recetas y tecnologías de asistencia reales se distinguirán de las comprobaciones de laboratorio. No declarar terminado el objetivo mientras queden requisitos implementables o verificaciones necesarias pendientes.

## Avance

Etapas 1–5 técnicas implementadas, verificadas y publicadas en `9520a549-108a-4297-9bbe-8a6cf785498a`. Matriz: 23 hallazgos verificados; C20 conserva la dependencia de porciones, componentes y fotografías confirmadas por el negocio. Editor y trazabilidad de fichas listos. La consulta de esos datos sigue pendiente de respuesta; el objetivo permanece abierto por ese requisito. Véanse ENTREGA.md, OPERACION.md y matriz-cierre.json.
