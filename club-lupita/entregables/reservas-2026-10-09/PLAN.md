> Registro de la etapa local del 9 de octubre. La política de devolución fue confirmada y la solución fue publicada el 10 de octubre (hora de Managua). Consultá el [estado actualizado](../reservas-2026-10-10/ESTADO.md); los pendientes de política, migración y publicación descritos abajo corresponden a esa etapa anterior.

# Plan de corrección de reservas — 9 de octubre de 2026

Objetivo: resolver los 23 hallazgos de la auditoría del 8 de octubre, incorporando los cambios posteriores de sesión, perfil, carta, tienda y Club. No sustituir esas mejoras ni sus pruebas.

## Decisiones del negocio recibidas

- El depósito VIP de C$500 es un anticipo aplicable al consumo.
- El inventario de mesas, capacidades y combinaciones todavía no está definido. Se implementará una configuración editable y se distinguirá disponibilidad por confirmar de una mesa confirmada. No se inventarán capacidades.
- Las condiciones de devolución y de inasistencia no se han definido. No se aplicará una penalización automática. Las decisiones de devolución requerirán una operación explícita y auditable del personal autorizado.

## Secuencia y criterios de aceptación

1. **Contrato y protección transaccional (R01, R02, R04, R20, R22).** Respuestas verificadas y comprobante canónico; referencia estable por intento y recuperación; fechas estrictas en Managua; límites y solapes por titular bajo bloqueo; consulta de ocupación limitada por rango antes de expandir las horas. Pruebas de cuerpos inválidos, reintentos, conflictos y abuso.
2. **Configuración e inventario (R11, R15, R18).** Horarios y excepciones centralizados; mesas con capacidad y combinaciones verificadas, descripciones opcionales; revisión de configuración para evitar sobreescrituras. No confirmar grupos contra una capacidad no registrada.
3. **Ciclo de vida y anticipo (R03, R12).** Agenda operativa con llegada, mesa ocupada, salida, cancelación e inasistencia explícita; cambios con control de versión y reserva atómica de disponibilidad; alta por personal; anticipo versionado, aplicación y devolución idempotentes con auditoría y ajuste exacto de puntos.
4. **Experiencia del cliente (R05–R10, R14, R19, R23).** Consulta pública, acceso al confirmar, borrador aislado por cuenta, recuperación tras recarga, confirmación persistente, gestión y calendario. Foco visible en móvil, regiones de estado y nombres accesibles; mensajes específicos y concordancia. Disponibilidad con caducidad y actualización tras conflictos.
5. **Avisos y medición (R13, R17).** Aviso interno transaccional; bandeja de correo con deduplicación y fallos visibles; recordatorios sin inferir asistencia. Medición agregada sin datos personales ni confundir visitas con reservas.
6. **Verificación y entrega (R16, R21).** Pruebas transaccionales y de integración, regresión existente, compilación y guardianes; navegación y accesibilidad en móvil/escritorio; medir carga diferida. Migración y procedimiento de despliegue reproducibles, con evidencia y pendientes reales documentados.

## Revalidación inicial

- Las pantallas ya se cargan de forma diferida y tienen títulos por ruta. Se conservará y medirá esta mejora (R21/R23 parcialmente atendidos por otros chats).
- La sesión por cookie y CSRF ya reemplazó el esquema anterior. Los nuevos endpoints y el borrador respetarán esa arquitectura.
- Persisten el falso éxito ante respuesta vacía, la deduplicación incompleta y los solapes por titular.
- Las migraciones actuales llegan a 026; las nuevas comienzan en 027. Hay una copia local de fuentes, migraciones y pruebas previa a este trabajo en `respaldo/`.

## Registro de ejecución

Las seis fases de implementación local están ejecutadas y verificadas. El [informe de ejecución](EJECUCION.md) relaciona los 23 hallazgos con cambios y evidencia; la [guía de activación](ACTIVACION.md) separa migración, publicación, inventario, políticas y correo todavía pendientes en producción.

La aplicación parcial del anticipo se amplió durante la verificación: permite cobrar consumo de caja aun con saldo disponible cero y conserva el remanente. Se añadieron pruebas concurrentes de aplicación/devolución y de composición pagado/bono. También se incorporaron cierres por zona y una corrección del mensaje de error de disponibilidad detectado en navegador.
