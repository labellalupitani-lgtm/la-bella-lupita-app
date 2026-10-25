# Implementación de la dirección Casa

Publicado el 13 de septiembre de 2026 en https://club-lupita.el-molino.workers.dev/.
Versión Cloudflare: `688d0f1c-2b72-41f7-9c69-c5a6dee4135c`.

## Cambios entregados

- Navegación y composición adaptadas a escritorio y móvil; ancho editorial de hasta 1280 px. Esta decisión sustituye el límite histórico de 448 px para las pantallas principales.
- Carta con fotografía destacada de mayor resolución, lista abierta con descripciones y precios, búsqueda que reconoce «capuchino» y panel de detalle. Fotografía y nombre viajan al detalle y regresan a su origen. Movimiento reducido, foco y protección contra doble agregado.
- Inicio con fotografía protagonista y saldo legible; los botones se ajustan al ancho disponible.
- Club con pase reversible y premio disponible separado del progreso de la próxima tanda. Se conservan los datos y operaciones reales.
- Reserva con composición por pasos, fechas compactas, selector de personas y retroceso que conserva la selección.
- Tienda y Perfil con jerarquía propia, sin repetir el formato de carnet. Perfil muestra los puntos acumulados al alcanzar el nivel máximo.
- Tipografía auxiliar mínima de 12 px, texto de cuerpo de 15 px; se conservan las dos familias y la paleta del sistema.

## Verificación

Compilación TypeScript/Vite y guardián de diseño correctos. Pasaron las 12 suites de regresión del servicio y las 16 comprobaciones de interfaz: pedido, reservas, reintentos de compra, pase reversible, foco, cierre de sesión, errores recuperables y ausencia de errores JavaScript. Axe no detectó infracciones WCAG A/AA en Inicio, Carta, Tienda, Reserva, Club y Perfil; esta prueba automática no sustituye una evaluación manual completa. Comprobado el desbordamiento a 320, 390 y 1440 px.

Las pruebas transaccionales utilizaron una base aislada. No se realizaron compras ni reservas de prueba en producción. La publicación no incorpora migraciones ni cambios en las reglas del servicio.

## Material fotográfico pendiente

Las imágenes de referencia del Salón VIP no representan el espacio real y no se usan como tal. El salón tiene una presentación tipográfica con sus atributos. También falta una fotografía auténtica del empaque de café. Estos dos materiales permitirán completar la dirección fotográfica; no se han sustituido por imágenes inventadas.

Respaldo previo de las pantallas: `club-lupita/respaldo-propuesta-casa-20260913/`. Evidencia de pruebas: `club-lupita/verificacion-2026-09-13/`.
