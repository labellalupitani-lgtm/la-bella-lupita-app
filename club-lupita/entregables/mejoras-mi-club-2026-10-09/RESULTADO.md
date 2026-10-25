# Mi Club · ejecución y estado de cierre

9 de octubre de 2026. Publicado en [La Bella Lupita](https://app.labellalupita.com/club). Versión `de6cc501-d670-4b16-a5b9-9f7deed64a86`, confirmada al 100% y verificada en el dominio público.

El plan se ejecutó sobre la versión que ya contenía los cambios de Inicio, Carta y Tienda. La regla aprobada es **C$950 cada 30 días, un café filtrado diario y una bolsa de 250 g por período pagado** para nuevas contrataciones. Las cuotas y ventanas de los contratos anteriores se preservaron.

## Resultado

- 19 hallazgos cuentan con corrección y validación técnica. Las notas precisan los límites de cada comprobación.
- 5 quedan parcialmente resueltos por reglas operativas, información de experiencias y medición comercial pendientes.
- 4 requieren validación con personas, dispositivos físicos o muestra real de rendimiento.

**El objetivo integral queda bloqueado por decisiones operativas y validación externa pendientes.** Publicar herramientas y pasar pruebas automatizadas no cierra comprensión, rentabilidad, operación entre turnos ni rendimiento de campo. La regla principal aprobada ya está implementada; no requiere otra aprobación.

La revisión del 9 de octubre a las 17:09 UTC confirmó la misma versión pública al 100% y ningún cambio en los 554 archivos del manifiesto vigente. En la base real siguen vacíos los detalles de café, sellos, premio y prioridad VIP; no hay productos seleccionados para repostería ni costos registrados. Tampoco hay muestras reales de rendimiento o tiempos. No hay experiencias futuras, por lo que la revisión de fichas históricas es una condición previa a promover nuevas ventas, no una venta futura incompleta detectada. Ver [comprobación de dependencias](evidencia/dependencias-cierre.json).

## Cambios disponibles

1. Ventanas de beneficios consistentes entre pantalla, código y caja. La bolsa nueva sigue el período pagado y no se reinicia por cambio de mes. Un café ya entregado hoy no se repite por una recontratación.
2. Abrir o actualizar Mi Club no cobra. La renovación se registra con consentimiento, versión, cuota y recibo; el cron aísla errores por cuenta. La solicitud explícita de beneficio puede completar una renovación consentida pendiente.
3. Compra con aceptación explícita y referencia persistente. Una respuesta perdida se recupera sin repetir el cargo; la recarga conserva el contexto.
4. Pase sin teléfono público, altura natural, foco al cerrar diálogos, controles distinguibles, beneficios al inicio y actualización manual.
5. Nuevas experiencias con apertura anticipada de 48 horas, cesión de entrada y cancelación con devoluciones idempotentes. El comprador conserva su recibo y el destinatario recibe el derecho.
6. Personal → Mi Club: configuración del propietario, costos internos, productos para descuento, lista de espera, nuevas experiencias, métricas y reposiciones auditadas. El descuento en Carta se comprueba de nuevo antes de cobrar.
7. Historial inmutable de contratos, condiciones aceptadas y consentimiento; motivos de fin y avisos en la cuenta.

## Validación

- Compilación de TypeScript/Vite, guardianes y validación Wrangler: correctas.
- Suite completa `npm test`: correcta, incluyendo las regresiones existentes y Mi Club.
- 27 casos de servidor (22 iniciales y 5 de operación/medición); 8 flujos de interfaz en Edge, Firefox y WebKit; 6 comprobaciones de panel y caja.
- PostgreSQL real, conexiones independientes y esquema de ensayo exclusivo: 4 grupos de concurrencia. Doce compradores obtuvieron doce butacas y cargos únicos; el decimotercero no pagó. Una espera agotó temporalmente el tiempo del servidor y se recuperó con la misma referencia. Cuatro confirmaciones simultáneas de un comprobante de caja produjeron un solo registro de descuento y ningún movimiento financiero. Esto acredita integridad bajo el ensayo, no capacidad productiva ilimitada.
- Pruebas de Inicio, Carta, operación de Carta y Tienda: correctas tras alinear el pase y la ventana de la bolsa.
- Comprobación pública: HTML y assets iguales al build validado, autenticación exigida, contrato correcto y actualización de Mi Club en demostración sin variar el libro de movimientos.
- Accesibilidad automática sin infracciones AA en las superficies ensayadas. Texto al 200% y anchuras 320–1440 px sin desbordamiento observado. Falta prueba con lectores/dispositivos reales.

## Publicación e integridad

Se exportaron respaldos privados completos de ambas bases y se verificó su restauración exacta. La migración se ensayó dos veces. Al aplicarla en producción y demostración, las huellas verificaron que no cambiaron el libro financiero, los campos anteriores de socios y membresías, equipo, pedidos, vales, bolsas, beneficios entregados, entradas ni los campos anteriores de experiencias.

Los respaldos con datos y credenciales permanecen en archivos `.local` privados, fuera de este informe. El [manifiesto vigente](segunda-etapa/manifest.json) identifica los archivos publicados. [publicación vigente](segunda-etapa/publicacion.json), [respaldos verificados](evidencia/respaldos.json) y [verificación pública](evidencia/publica.json) contienen evidencia sin secretos.

La migración es aditiva y conserva el valor por defecto `anterior` durante el despliegue. Tras nuevas contrataciones versionadas, no debe revertirse ciegamente a un Worker que interprete todas las bolsas por mes calendario. Una corrección posterior debe mantener derechos y movimientos; restaurar datos no es un mecanismo para deshacer cobros legítimos.

## Pendientes para cerrar el objetivo

La casa debe confirmar tamaño y extras del café, compras elegibles para sellos, bebida del premio, productos de repostería y la prioridad VIP. Los campos siguen vacíos donde no hay respuesta. No se activó ninguna clasificación supuesta de productos.

Falta implementar y ensayar el procedimiento definitivo de prioridad VIP cuando se confirme la regla; definir la alternativa por faltantes; completar las fichas de experiencias históricas; ingresar costos verificables y validar la medición de incrementalidad. El panel distingue desactivación de renovación, fin por saldo insuficiente y renovaciones cobradas, e informa descuentos de Carta y caja. El panel de costos ofrece una contribución parcial, no rentabilidad neta.

El [protocolo de validación](VALIDACION-PENDIENTE.md) convierte las pruebas de campo en tareas verificables. No se atribuyen resultados a participantes que no han intervenido.

## Segunda etapa publicada

Se agregó el descuento asistido en caja: cálculo con precios de Carta, verificación de miembro, referencia única del comprobante, confirmación explícita, recuperación y anulación con motivo. No cobra ni modifica el saldo. Los productos habilitados siguen dependiendo de la selección del propietario; no se activaron productos supuestos.

La medición recoge tiempos de consulta, código y recuperación también al navegar desde otra sección. Rechaza datos personales y separa errores. Las pruebas verificaron que No rastrear impide la emisión. La migración 025 se ensayó con restauración de ambas bases, manteniendo intactos sus datos anteriores.

[Detalle de la segunda etapa](segunda-etapa/RESULTADO.md).

## Matriz de los 28 hallazgos

| ID | Estado | Corrección / límite restante |
|---|---|---|
| MC01 | validado técnicamente | Ventana canónica compartida por cuenta, código y caja; nueva bolsa por período y café diario también al recontratar. |
| MC02 | parcial | Regla diaria aprobada y consistente en contrato, oferta, código y caja. **Pendiente o límite:** Confirmar tamaño y extras del café; entrenar al personal con la misma regla. |
| MC03 | validado técnicamente | Versiones de contrato preservadas; bolsa nueva por período pagado y anterior por mes calendario. Límites de febrero bisiesto y meses de 30/31 días. |
| MC04 | validado técnicamente | Aperturas para socios y público exigidas por servidor; nuevas experiencias requieren separación exacta de 48 horas. **Pendiente o límite:** Los eventos preexistentes conservan su apertura histórica. |
| MC05 | validado técnicamente | Reconsulta visible cada 30 s, al regresar o recuperar conexión y con botón manual; entrega confirmada actualiza el estado. **Pendiente o límite:** Cambio de día/mes comprobado en SQL; falta observarlo en uso real prolongado. |
| MC06 | validado técnicamente | Solicitud explícita del beneficio reconcilia únicamente la renovación propia consentida; un solo cargo. |
| MC07 | validado técnicamente | Lecturas sin cargos, alta sin renovar a terceros y cron con subbloques que aíslan cuentas defectuosas. |
| MC08 | validado técnicamente | Temporizador usa vencimiento real del servidor y reloj monótono; un código vencido puede regenerarse. Respuesta incompleta permite reintento. |
| MC09 | validado técnicamente | Diálogo devuelve foco al control de origen; comprobado en Edge, Firefox y WebKit, incluido Escape. **Pendiente o límite:** La revisión con lector de pantalla de dispositivo queda en el protocolo de campo. |
| MC10 | pendiente de campo | Pase de altura natural sin teléfono público; sin desbordamiento a 200%, espaciado ampliado de texto y anchuras 320–1440 px. **Pendiente o límite:** Confirmar zoom/espaciado y lector de pantalla en dispositivos físicos; los navegadores automatizados no sustituyen esa prueba. |
| MC11 | pendiente de campo | Beneficios al inicio, pase bajo demanda y jerarquía compacta comprobada en capturas móviles. **Pendiente o límite:** Medir tiempo y errores de localizar café, bolsa y premio con personas representativas. |
| MC12 | pendiente de campo | Los cinco beneficios y la renovación se muestran antes de confirmar; aceptación explícita obligatoria. **Pendiente o límite:** Validar comprensión de cuota, café diario, bolsa por período, cancelación y saldo con usuarios nuevos. |
| MC13 | validado técnicamente | Recarga conserva Mi Club, actualiza saldo y permite volver; no contrata automáticamente. |
| MC14 | validado técnicamente | Referencia persistente por intento; pérdida de respuesta tras cargo recupera resultado con misma referencia y un cargo. |
| MC15 | validado técnicamente | Mensaje de éxito descartable; abrir otra acción elimina mensajes anteriores sin borrar recibos ni historial. |
| MC16 | validado técnicamente | Consentimiento, cancelación y reactivación generan eventos inmutables; el reintento conserva fecha y no duplica evento. |
| MC17 | validado técnicamente | Motivo de fin persistido; renovación pendiente tiene revisión explícita y nueva contratación requiere aceptación. |
| MC18 | validado técnicamente | Cesión única al código de otra cuenta; comprador conserva recibo, destinatario recibe derecho, caja respeta titular y cancelación. |
| MC19 | parcial | Compra ofrece enlace al comprobante; nueva experiencia exige lugar, duración, contenido, políticas y fechas. **Pendiente o límite:** Completar con la casa la información de experiencias históricas antes de promover nuevas ventas; no se inventaron detalles. |
| MC20 | validado técnicamente | Ticket normalizado en Unicode, espacios y mayúsculas, bloqueado por referencia; no puede acreditarse a otra cuenta. |
| MC21 | parcial | Lista de espera consentida; descuento 15% en Carta y cálculo asistido en caja sobre productos aprobados. Registro único por comprobante, recuperación, anulación administrativa con motivo, consulta del cliente y reposiciones auditadas. **Pendiente o límite:** Confirmar productos elegibles y política VIP; implementar la regla VIP elegida y ensayar el procedimiento entre dos turnos. Definir la alternativa por faltantes. |
| MC22 | parcial | Nueve sellos, premio con código recuperable, horario/fechas de Managua; campos operativos editables. **Pendiente o límite:** Confirmar qué compras suman sello y cuál bebida se entrega; validar comprensión y guion en caja. |
| MC23 | validado técnicamente | PostgreSQL real: doce compradores, doce cargos/butacas, decimotercero sin cargo, reintentos y renovaciones concurrentes seguros. Cuatro confirmaciones concurrentes de un comprobante externo generan un solo registro de descuento sin movimiento financiero. **Pendiente o límite:** Hubo un timeout temporal en el último ensayo; el reintento conservó referencia. No es un ensayo de capacidad de producción. |
| MC24 | validado técnicamente | Contrato canónico versionado, snapshot por aceptación/evento, cuota anterior preservada; referencias de Inicio/Tienda y SPEC alineadas. **Pendiente o límite:** Los datos operativos aún pendientes no se consideran reglas confirmadas. |
| MC25 | parcial | Eventos agregados, cohortes por contrato, renovaciones/motivos de fin, descuentos de Carta y caja, entregas incluidas reposiciones y simulación de contribución con costos explícitos. **Pendiente o límite:** Ingresar costos reales; validar atribución e incrementalidad. La contribución parcial no equivale a margen neto ni demuestra rentabilidad. |
| MC26 | validado técnicamente | Pase con código, contrato aceptado recuperable por movimiento, ayuda y avisos, roles comprobados; se conserva sesión HttpOnly/CSRF. **Pendiente o límite:** Los contratos históricos sin snapshot no se reconstruyeron como si existiera una aceptación documentada. |
| MC27 | pendiente de campo | Carga diferida; p75 LCP/INP/CLS en entradas directas; tiempos de consulta, código y recuperación también en navegación interna, separados por resultado y dispositivo, sin identificadores y con No rastrear/GPC. **Pendiente o límite:** Recoger muestra real suficiente, evaluar objetivos y observar atención física en caja. Los ensayos sintéticos no acreditan rendimiento de campo. |
| MC28 | validado técnicamente | Mi Club consistente, acciones distinguibles, enlaces de destino y ayuda del pase con aria-expanded estable. |

[Plan](PLAN.md) · [Matriz estructurada](matriz-cierre.json) · [Pruebas API](evidencia/servidor.json) · [Interfaz](evidencia/interfaz.json) · [Concurrencia](evidencia/concurrencia.json).
