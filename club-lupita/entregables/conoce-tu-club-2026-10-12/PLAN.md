# Conocé tu club — plan de ejecución

Fecha: 12 de octubre de 2026. Base: código actual y auditoría de 18 hallazgos del 8 de octubre. Se conservan los cambios posteriores de Inicio, Carta, Tienda, Mi Club, Perfil y Reservas. Sin repositorio Git: respaldo de archivos afectados y manifiesto antes de editar.

**Estado al cierre:** ejecución técnica publicada y verificada. Cinco reglas aprobadas por el propietario; activación dejada preparada por su instrucción expresa. El plan siguiente conserva la secuencia de trabajo; el [resultado por hallazgo](RESULTADO.md) registra el estado final y la evidencia.

## 1. Revalidar y proteger las compras (H01)

- La membresía ya exige versión de contrato y configuración; conservar y volver a probar.
- Pendiente confirmado: experiencias aún admiten cargos con condiciones distintas del catálogo leído. Vincular confirmación a una huella de precio, fecha, contenido y condiciones, validada dentro de la transacción. Mantener idempotencia y recuperación de recibos. Congelar la oferta del diálogo; los refrescos no deben cambiar silenciosamente lo aceptado.
- Probar cambio de oferta, omisión/manipulación, ausencia de cargo, reintento y agotamiento.

## 2. Dar a Conocé tu club una función propia (H02, H05, H06, H08, H15)

- Crear /conoce-tu-club pública, compartible y con título/metadatos propios.
- Explicar cuenta gratuita, sellos, Cuenta de Casa, cinco beneficios opcionales de Mesa Fundadora, cuota y período, renovación, cancelación y atención.
- Mostrar primero qué es y cuánto cuesta; ofrecer acceso a Mi Club sin iniciar ninguna compra.
- Accesos visibles desde navegación, entrada y Mi Club en móvil y escritorio. Enlaces nativos y foco de ruta.
- Consumir condiciones actuales del servidor y publicar únicamente configuración comercial segura. No exponer cuentas, historial, contactos o costos internos.

## 3. Completar claridad y coherencia (H03, H04, H07, H09–H13, H16, H17)

- Conservar contrato aprobado: C$950 / 30 días, café diario, bolsa de 250 g por período pagado; respetar contratos antiguos.
- Revalidar mecanismos recientes: descuento en Carta/caja, 48 horas, lista de espera consentida, cesión, reposiciones, recarga contextual, códigos con vencimiento, foco y resultado recuperable, refresco al volver y sesión con cookie HttpOnly.
- Distinguir las reglas confirmadas de detalles operativos aún sin definición. Se verificó la ausencia de definición y el dueño aprobó las cinco propuestas documentadas. Los controles ya están implementados y probados; su activación espera evidencia real, según su decisión posterior.
- Evitar promesas de disponibilidad, ahorro o calendario de eventos sin datos reales.

## 4. Verificar accesibilidad, rendimiento y mantenimiento (H14, H18)

- Pruebas de navegación anónima/autenticada, error/reintento, teclado, nombres, foco, axe, 320–1440 px, ampliación de texto y motores de navegador disponibles.
- Carga diferida y recursos compartidos; ninguna imagen grande nueva. Metadatos para enlace directo y conservar los de Reservas.
- Reutilizar configuración/versiones; documentar medición existente y brechas sin inventar conversiones. Revisión de no seguimiento y datos personales.
- Ejecutar compilación, guardianes, suites pertinentes y regresión general; guardar resultados y capturas actuales.

## 5. Entregar y delimitar lo que necesita evidencia real

- Informe final con cada hallazgo: estado, cambios/evidencia y pendientes externos.
- Preparar paquete verificable de publicación y comprobar estado integrado antes de publicar; preservar cambios concurrentes.
- Las pruebas con participantes, lectores de pantalla físicos, dos turnos de caja y rentabilidad requieren personas/costos reales. Conservar protocolos del trabajo de Mi Club, no declarar completadas esas validaciones por pasar pruebas automáticas.

## Criterio de cierre

No basta una pantalla nueva: ruta propia visible, información segura y consistente, protección de aceptación de precio, regresiones aprobadas y limitaciones documentadas. Definiciones comerciales y validación en campo se cerrarán solo con evidencia real.
