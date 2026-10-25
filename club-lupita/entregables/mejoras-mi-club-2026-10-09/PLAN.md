# Plan de ejecución · Mi Club

9 de octubre de 2026. Base: versión actual de Inicio, Carta y Tienda; respaldo sin secretos en `respaldo/`, huellas en `base.json`. Alcance: los 28 hallazgos de la auditoría, incluida operación en caja, integridad, accesibilidad, experiencia comercial y medición.

## Decisión comercial confirmada

Para nuevas contrataciones: C$950 cada 30 días, un café filtrado al día y una bolsa de 250 g por período pagado. Los contratos existentes conservan su versión durante la transición. No se modifica retroactivamente un beneficio ni se cobra una diferencia. La renovación exige consentimiento y saldo suficiente.

## Orden de trabajo y criterios de cierre

1. **Contrato y derechos (MC01–03, MC06–07, MC16–17, MC24).** Versionar las condiciones; compartir la ventana de beneficio entre consulta, código y entrega; registrar períodos, consentimiento, motivos de vencimiento y avisos. Las lecturas no deben cobrar ni el alta de una persona renovar a otras. Validar transición, renovación, baja, saldo insuficiente, cambios de día/mes y reintentos.
2. **Operación e integridad (MC04, MC18–23, MC26).** Exigir apertura anticipada de 48 horas para nuevos eventos; serializar butacas; normalizar tickets; permitir cesión y cancelación auditadas; habilitar configuración operativa, ayuda y lista de espera con consentimiento; identificar el pase sin publicar el teléfono. Comprobar permisos, concurrencia PostgreSQL, trazabilidad y recibos.
3. **Mi Club y accesibilidad (MC05, MC08–15, MC22, MC26, MC28).** Priorizar beneficios y premio; mostrar la oferta completa antes del pago; recarga con retorno; códigos con tiempo real y recuperación; confirmaciones con estados de envío, resultado incierto y reintento seguro; mensajes descartables; pase de altura natural; foco y nombres accesibles. Conservar enlaces desde Inicio y Tienda.
4. **Medición y documentación (MC24–27).** Contrato único, pruebas permanentes, métricas agregadas de conversión y operación, entradas de costos verificables y lectura de rentabilidad. Reutilizar la medición de rendimiento incorporada en Inicio. Diferenciar datos reales, ensayos y pendientes de observación; no inventar costos ni afirmar métricas de campo sin muestra.
5. **Validación y publicación.** Ejecutar suites existentes y nuevas, revisar móvil/escritorio, texto ampliado y teclado en navegadores, probar conflictos y reintentos. Migrar con comprobación previa, publicar conservando variables y verificar la versión pública. Guardar matriz de los 28 hallazgos con evidencia y pendientes explícitos.

## Salvaguardas de implementación

- Preservar los cambios de los otros chats y comprobar huellas antes de publicar.
- Mantener el libro financiero y el historial; corregir mediante eventos y contrapartidas.
- Configurar los datos que debe confirmar la casa (tamaño, extras, horarios, condiciones de experiencias y costos), sin inventarlos.
- No considerar terminados estudios con clientes, costos reales o rendimiento de campo por el solo hecho de crear herramientas para medirlos. Esos resultados requieren evidencia posterior.

## Evidencia

La matriz se alimenta del archivo `research_mi_club_2026-10-08/backlog-mi-club.json`. Cada cierre debe enlazar código, prueba o comprobación. La ausencia de reproducción en un solo navegador no basta para cerrar un fallo de integridad.

## Estado de ejecución

La migración y la publicación están ejecutadas. La versión pública, las pruebas y los límites de cierre se documentan en [RESULTADO.md](RESULTADO.md). La matriz distingue 19 validaciones técnicas, 5 hallazgos parcialmente resueltos y 4 pendientes de campo. El objetivo queda bloqueado hasta recibir las reglas operativas o evidencia externa que permita continuar; ver [VALIDACION-PENDIENTE.md](VALIDACION-PENDIENTE.md). La política VIP elegida aún requiere implementación y ensayo: este estado no declara terminado todo el desarrollo.
