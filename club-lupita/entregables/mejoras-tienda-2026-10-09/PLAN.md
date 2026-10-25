# Plan de ejecución — Tienda

Fecha: 9 de octubre de 2026. Base: auditoría `research_tienda_2026-10-08/AUDITORIA-TIENDA.md` contrastada con el código actual. Se preservan las mejoras recientes de Inicio y Carta: sesiones con cookies, CSRF, carga diferida, títulos, medición y operaciones de pedidos.

## 1. Contrato y seguridad de compra

- T01: cotización persistida con precio, lote y condiciones; comprobación al cobrar y aceptación explícita de cambios.
- T02: recuperación durable por referencia, independiente del saldo o inventario, con consulta serializada contra el cobro.
- T04–T06: validación de respuestas, conservación del intento ante incertidumbre, saldo histórico identificado y estados de éxito/error excluyentes.
- T15 y T17: identidad de lote y cantidades reales; asignación sin interpretar bloqueos como agotamiento.

## 2. Experiencia del cliente

- T03 y T09: ficha y condiciones configurables y verificadas por el propietario; no publicar afirmaciones, fechas ni fotografías inventadas. Exigir los datos esenciales antes de habilitar preventa.
- T07, T10 y T16: carga/error propios de Tienda, oferta compacta en móvil, diálogo con operación visible y foco estable.
- T08: comprobante persistente y acceso a historial y soporte.
- T11: instrucciones de recarga dentro de Tienda y actualización sin perder contexto.
- T12: distinguir bolsa mensual disponible, retirada y membresía inactiva.
- T14 y T18: enlaces reales de WhatsApp, contexto editable de encargo, alternativa para lote agotado y texto completo. Conservar título por ruta ya corregido en Inicio.

## 3. Operación y medición

- T13: estados pagada/lista/entregada/reembolsada, comprobante con referencia exacta al libro, devolución idempotente y permisos; preservar compras históricas.
- T19: contadores agregados del recorrido y del resultado operativo, sin identificadores personales; respetar preferencias de privacidad y mantener atribución de Inicio.
- Incorporar gestión de Tienda al panel del equipo y documentación para el propietario.

## 4. Verificación y publicación

- Respaldar fuentes actuales antes de editar; migración aditiva, repetible y compatible con compras anteriores.
- Pruebas de precio cambiado, saldo exacto, última unidad, respuesta perdida, recarga, repetición, permisos, entrega y devolución; comprobaciones de interfaz, teclado, accesibilidad y tamaños móviles.
- Ejecutar tipos, compilación, guardianes y regresiones relevantes de los módulos compartidos.
- Preparar respaldo privado de ambas bases, restaurar y ensayar migración, comprobar integridad y versiones antes de publicar; verificar versión y rutas publicadas.
- Entregar evidencias, manual de operación y estado de cada hallazgo. Los datos comerciales pendientes deben quedar explícitos y no darse por confirmados.

## Criterio de cierre

Cada hallazgo debe tener implementación y evidencia, o una dependencia comercial concreta documentada. La publicación no autoriza inventar condiciones del café ni abrir ventas con información incompleta.

## Ejecución realizada

Las cuatro etapas técnicas están ejecutadas. Migración aplicada y verificada en las bases real y de demostración; versión publicada al 100%: `24031546-ee88-4ad4-b5ee-f4e9de29ff67`. La verificación posterior confirmó rutas, protección de datos, recuperación, historial y activos idénticos al build probado, sin cobrar en producción.

El [informe de entrega](ENTREGA.md) relaciona cada hallazgo con su solución y evidencia. Permanecen pendientes de confirmación del negocio los datos comerciales de T03, T09 y T15. La ficha tiene editor para el propietario y la preventa permanece pausada hasta completar los campos esenciales.
