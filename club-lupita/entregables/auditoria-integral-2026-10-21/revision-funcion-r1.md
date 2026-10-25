# Revisión funcional independiente · ronda 1

21 de octubre de 2026, Managua. Evaluación desde navegador Playwright/Chromium propio contra `http://127.0.0.1:5310`, con solicitudes externas bloqueadas. No leí la implementación de los prototipos ni modifiqué sus archivos. Leí las fichas, matrices e informes como evidencia y recorrí la interfaz. Los archivos de esta revisión están en `revision-funcion/`.

## Veredicto de los prototipos

| Prototipo | Resultado final de esta ronda | Alcance observado |
|---|---|---|
| Compra | **PASS** | Catálogo de 73 artículos; búsqueda; opciones obligatorias; cantidad; revisión y confirmación de importe; rechazo antes del cargo; reintento; respuesta perdida; consulta sin segundo cargo; seguimiento hasta listo; teclado/foco y resultado a 320 px. |
| Visitas | **PASS después de corrección** | Crear, revisar, cambiar y cancelar; comparación con visita original; consulta explícita en pérdida de respuesta; error/sin horas; reintento; anticipo VIP; teclado, validación y resultados a 320 px. La contradicción del resumen se corrigió y se volvió a comprobar. |
| Equipo | **PASS después de corrección** | Orden por antigüedad; permisos visibles de caja/cocina; restricción antes de preparar; aceptación, entrega y cancelación; motivo obligatorio; error/reintento y consulta de incertidumbre sin duplicación; historial a 320 px. Se corrigió y volvió a probar el foco de recuperación. |

PASS significa que estos recorridos y estados de la demo local satisfacen los criterios comprobados. No acredita backend, cobros, concurrencia real, entrega física, lector de pantalla humano, todos los productos individualmente ni toda combinación posible. No hubo operaciones reales.

## Pruebas y evidencia

**Compra.** «Todo» muestra 73 artículos. Buscar Risotto permite elegir preparación del huevo; Agregar permanece deshabilitado sin esa opción. Dos unidades de C$280 producen C$560 de productos + C$40 de empaque = C$600, idéntico en revisión y confirmación. La respuesta perdida conserva referencia LUP-1042 y ofrece Consultar resultado, sin botón de nuevo pago. La consulta produce un cargo simulado, saldo C$9300 y el pedido recibido. El resultado se lee completo a 320 px, sin desborde de documento. En recorrido independiente, Latte C$95 + empaque C$40 falla antes del cargo con contador 0; Reintentar registra 1, conserva total C$135/saldo C$9765 y permite consultar hasta Listo para retirar. No se inventa hora de preparación.

El detalle recibe foco en Cerrar; Shift+Tab vuelve al último control habilitado y Tab retorna al cierre. Escape devuelve el foco a Elegir opciones del producto. Al avanzar se enfoca el título del paso. Evidencias: `compra-opciones.png`, `compra-revision.png`, `compra-confirmacion.png`, `compra-pago-perdido.png`, `compra-confirmada-320.png`, `compra-rechazo.png`, `compra-reintento-completo.png` y sus instantáneas de accesibilidad.

**Visitas.** Revisar sin elegir hora produce alerta específica. Reserva de Terraza a las 12:00: creación con respuesta perdida → Consultar resultado → comprobante confirmado. Cambio a las 13:00: revisión muestra Antes/Después y conserva el original; ante pérdida muestra Última visita confirmada 12:00 y Cambio enviado 13:00, con consulta de resultado. Cancelación exige confirmación, puede conservarse la visita y, ante pérdida de respuesta, recupera la cancelación con la misma referencia. El resultado cancela sin cargo la reserva sin anticipo. Error de horarios conserva fecha/grupo y Reintentar devuelve 8 horas; sin disponibilidad ofrece día siguiente. La revisión VIP a 320 px expresa anticipo C$500, saldo C$9900→9400, aplicación al consumo y condiciones sintéticas. La fotografía se identifica como Terraza aun en VIP; no atribuye otras condiciones físicas a las zonas.

Los pasos enfocan el título y las acciones se pueden activar por Enter. No evalué un modal en visitas: es navegación entre pasos, por lo que Escape no se exigió como cierre. Evidencias: `visitas-revision.png`, `visitas-crear-perdida.png`, `visitas-compara-cambio.png`, `visitas-cambio-perdido-320.png`, `visitas-cancelar-320.png`, `visitas-cancelacion-perdida.png`, `visitas-cancelada-corregida-320.png`, `visitas-horarios-error-320.png`, `visitas-vip-320.png`.

**Equipo.** La bandeja poblada ordena #26 (27 min) hasta #1 (2 min). Cocina no muestra precios ni acciones de aceptar, cancelar o entregar; sí Comenzar preparación/Marcar listo. El pedido #22 con restricción mantiene preparación deshabilitada hasta marcar la confirmación. Tras preparar, la restricción sigue visible. Caja permite aceptación, entrega y cancelación. Aceptar #25 con respuesta perdida conserva su estado conocido y bloquea una segunda acción; consultar pasa a Aceptado sin aumentar el contador. Entregar #24 con error antes de guardar deja contador sin incremento; Reintentar registra una sola entrega. Cancelar #25 requiere al menos cinco caracteres y enfoca el motivo inválido; al completar muestra Cancelado, motivo y devolución simulada C$480. Historial contiene ambas operaciones finales. Documento de 320 px mide 320 px, con importes y acciones legibles.

El diálogo abre en Cerrar, Escape devuelve foco al disparador; el paso transitorio por BODY del navegador con Shift+Tab no se interpretó como fuga a controles del fondo. La incertidumbre de un pedido profundo se corrigió según RF-02 y se probó con teclado. Evidencias: `equipo-restriccion.png`, `equipo-respuesta-perdida.png`, `equipo-cancelacion-320.png`, `equipo-historial-320.png`, `equipo-perdida-corregido.png`, `equipo-error-corregido.png`, `reevaluacion.json`.

## Hallazgos de la ronda y resolución

### RF-01 · P2 · Resumen de visita incompatible con el estado final — corregido

**Ubicación:** resumen inferior/lateral de `/visitas`, estado incierto de cambio y cancelada.

**Reproducir en versión inicial:** crear Terraza 12:00, cambiar a 13:00 con respuesta perdida, consultar, cancelar con respuesta perdida y consultar. La pantalla principal decía Cancelada y «La mesa quedó libre», mientras el resumen aún decía «TU PRÓXIMA PAUSA» con esa misma visita. En cambio incierto también presentaba la hora propuesta bajo ese título.

**Impacto:** contradice el resultado y puede hacer dudar si la reserva sigue vigente. La operación y el comprobante principal sí terminaban correctamente.

**Corrección requerida:** resumir la última visita confirmada durante incertidumbre y rotular la reserva cancelada junto con el resultado del anticipo. **Verificado:** la versión corregida muestra ÚLTIMA VISITA CONFIRMADA 12:00 / Cambio por verificar; al cancelar, VISITA CANCELADA / Sin cargos por la reserva cancelada. Evidencia antes: `visitas-cancelada.png`. Después: `visitas-incierta-corregida-320.png`, `visitas-cancelada-corregida-320.png`; capturas abiertas con `view_image`.

### RF-02 · P2 · Recuperación de un pedido profundo fuera de pantalla y sin foco — corregido

**Ubicación:** `/equipo`, escenario error/pérdida de respuesta de una acción de pedido.

**Reproducir en versión inicial:** 390×844, elegir Respuesta perdida después de guardar, enfocar Aceptar pedido #1 y Enter. Al aparecer Comprobar estado, `activeElement=BODY`, scrollY=7775 y el botón de recuperación estaba en y=−7090.125. Tab llevaba a Actualizar bandeja y scrollY=9527. El pedido no se duplicaba; Actualizar bandeja también recuperaba el resultado, así que no era un bloqueo absoluto.

**Impacto:** pierde orientación y oculta la continuación específica precisamente durante la incertidumbre. **Corrección requerida:** enfocar y mostrar Comprobar/Reintentar; al resolver, devolver orientación al pedido afectado.

**Verificado tras corrección:** pérdida y error enfocan su botón a y=399.875 dentro del viewport. Enter recupera #1 Aceptado y enfoca su H2 a y=409.906. Contador de pérdida 1→1; error 0→1. Evidencia: `equipo-error-profundo-foco.png`, `equipo-error-profundo.txt`, `reevaluar.cjs`, `reevaluacion.json`, `equipo-perdida-corregido.png`, `equipo-error-corregido.png`. Capturas abiertas con `view_image`. La medición espera el efecto de foco; no toma el render intermedio como estado final.

## Documentación — PASS final de coherencia y evidencia

Se leyeron INFORME.md, PLAN.md y las fichas/matrices de compra, visitas y equipo. Los archivos referenciados por las tres matrices existían al comprobarlos. Se abrieron las capturas base citadas para: retraso de primera acción en Carta, conflicto después del cambio de visita y precio recortado a texto200 en Pedidos. Respaldan esas recomendaciones; no se observó que una imagen contradijera el defecto alegado. Los textos distinguen juicio de diseño de defecto, frecuencia inferida de tráfico medido y fixture de producción. INFORME limita explícitamente dispositivos físicos, teclado virtual, lector humano, proveedor real de correo y derechos editoriales.

La comprobación final, a las 02:44 UTC del 22 de octubre (20:44 del 21 de octubre en Managua), da **PASS documental para el alcance de laboratorio definido**, sin presentar la cobertura física como realizada. `documentacion-verificada.json` registra 696 filas consolidadas: 667 revisadas, 27 no aplicables y dos pendientes exclusivamente de campo. No quedan filas de laboratorio pendientes. La distribución comprobada es base 30 revisadas; Compra 125 revisadas/11 N/A; Visitas 183/3; Equipo 329/13. Todas las filas de las tres matrices de grupo tienen evidencia y sus referencias resuelven. Los 1.042 enlaces Markdown de INFORME, PLAN, COBERTURA, REVISION y las tres fichas resuelven después de corregir tres enlaces de fuente de ConoceClub. Son enlaces comprobados, no 1.042 archivos distintos ni capturas inspeccionadas una a una.

Equipo cerró las 59 filas antes pendientes mediante 57 ensayos con nuevos registros y dos N/A contractuales: vacío total de una pantalla autenticada de Seguridad y ausencia de campos obligatorios de su identidad. Las razones explican por qué esos estados no pertenecen al contrato; no son un cambio a N/A por falta de tiempo. `pendientes-resueltos.json` y `.md` conservan la transición de cada ID, evidencia y límites. Las fichas finales ya reflejan el ciclo de Agenda y los otros formularios; no conservan las anteriores afirmaciones de pendientes. Los resultados de ciclos preservan el rechazo inicial de llegada anticipada y el ensayo posterior exitoso, explicado como ajuste del horario solo en PGlite. La captura final muestra anticipo C$500, aplicado C$300, devuelto C$200 y pendiente C$0, coherente con la ficha. Se inspeccionaron también las nuevas capturas de carga y búsqueda vacía de Equipo: respaldan EQ-07/EQ-08; el hecho de haberse revisado no elimina esos defectos.

El calendario original ya se ensayó y figura en la base consolidada. Se contrastaron `base/calendario-original.json`, `base/calendario-reserva.ics` y su captura de 390 px, abierta con `view_image`. El UID coincide con el comprobante; `DTSTART:20261025T180000Z` y `DTEND:20261025T200000Z` equivalen a 12:00–14:00 de Managua, concordantes con la reserva visible. La documentación limita la prueba a descarga local, sin atribuir importación en un calendario externo.

Los dos pendientes de campo permanecen explícitos y **no** se convierten en N/A: dispositivos físicos/teclado virtual/lector humano, y Gmail/Outlook reales. INFORME, la matriz y las fichas distinguen laboratorio de campo y el transporte interceptado de un envío real. Este PASS acepta la trazabilidad, coherencia y acotación del informe; no sustituye ensayos físicos ni acredita por inferencia todas las combinaciones de la aplicación.

## Reproducibilidad y límites de esta revisión

`observar.cjs` captura los estados iniciales, `driver.cjs` ejecuta acciones observables de UI y `acciones.js` conserva las instrucciones enviadas. Hubo dos esperas por selectores inicialmente incorrectos (nombre de Cambiar mi visita y búsqueda de Comprobar dentro de la tarjeta cuando estaba en la bandeja); se resolvieron leyendo la UI y no se contaron como fallos del producto. `reevaluar.cjs` repite los dos hallazgos corregidos desde carga limpia y guarda resultados estructurados. Las capturas seleccionadas se inspeccionaron mediante `view_image`; no se atribuye inspección humana a toda la matriz original.

No se probaron enlaces externos, pagos/correos reales, carga real, persistencia tras recargar ni la autorización del backend de estas demos. Sus contadores prueban el comportamiento observable del mock, no idempotencia real. Los documentos reconocen esa separación.
