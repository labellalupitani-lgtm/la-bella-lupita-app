# Mi Club · segunda etapa

Publicado y verificado el 9 de octubre de 2026. Versión `de6cc501-d670-4b16-a5b9-9f7deed64a86` al 100% en app.labellalupita.com.

## Descuento asistido en caja

Personal → Caja → Descuento de repostería permite revisar una compra a precios de Carta y registrar el descuento del comprobante físico. Solo usa productos seleccionados por el propietario; no se asignó esa clasificación sin confirmación de la casa. Verifica miembro vigente y vuelve a comprobar precios/configuración antes de confirmar. No crea cargos ni modifica el saldo del cliente.

La referencia del comprobante es única y se normaliza. Repetir la confirmación recupera el mismo registro, incluso si la membresía venció después. Administración puede anular con motivo; original y anulación son inmutables. El cliente puede consultar ambos en Mi Club. El panel excluye anulaciones al sumar descuentos de caja.

Los casos con precios diferentes, extras u otras promociones requieren revisión de administración; el flujo no inventa acumulación de beneficios.

## Medición de operaciones

Se registra el tiempo de respuesta de consulta, obtención de código y recuperación de compra, también al entrar desde otra sección. Se separan resultado, tipo de entrada y dispositivo; el panel muestra muestra y p75. El conjunto no contiene teléfono, cliente, ticket, código ni sesión. Respeta No rastrear/GPC y tiene retención de 90 días.

No mide la fila física de caja ni convierte estos tiempos en Core Web Vitals. La evaluación con tráfico real sigue pendiente.

## Evidencia

- Suite completa de servidor: correcta; 27 casos específicos de Mi Club entre ambas etapas.
- Ocho recorridos en Edge, Firefox y WebKit: 24 comprobaciones; incluye pérdida de respuesta, navegación interna, ausencia de telemetría con No rastrear, texto 200% y espaciado ampliado.
- Seis comprobaciones de panel y caja, con accesibilidad automática sin infracciones AA en las superficies probadas.
- PostgreSQL real: cuatro grupos de concurrencia; incluye cuatro confirmaciones simultáneas de descuento → un registro, sin movimiento financiero. Se mantuvo el ensayo de doce butacas/cargos y agotado sin cargo para la solicitud adicional. Un timeout temporal de compra se recuperó con su misma referencia.
- Respaldo completo de ambas bases restaurado exactamente. Migración 025 aplicada dos veces en ensayo y después en ambas bases con huellas intactas de los datos anteriores, incluidos contratos y configuración.
- HTML/assets públicos iguales al build; Mi Club autenticado y medición nueva funcionando en demostración; libro financiero sin cambios durante la comprobación.
- 554 archivos del manifiesto siguen idénticos después de publicar.

[Publicación](publicacion.json) · [Manifiesto](manifest.json) · [Pruebas de API](evidencia/servidor.json) · [Caja](evidencia/caja-ui.json) · [Concurrencia](evidencia/concurrencia.json) · [Verificación pública](evidencia/publica.json).

La revisión de transición encontró cero membresías operativas en la base real. Se verificó la conservación de contratos anteriores con pruebas sintéticas y las huellas de la migración; esto no reconstruye condiciones históricas que no estuvieran documentadas. [Recuento sin datos personales](evidencia/membresias-reales.json).

## Pendientes reales

La prioridad VIP necesita una regla del propietario antes de implementarse. También falta confirmar tamaño/extras del café, productos de repostería, compras elegibles para sellos, bebida de premio, alternativa por agotados, datos de experiencias históricas y costos reales. No se cerraron pruebas con clientes/dispositivos físicos, comparación de turnos, rentabilidad incremental ni rendimiento de campo. El objetivo continúa abierto.
