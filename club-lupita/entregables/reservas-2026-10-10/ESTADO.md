# Reservas: implementación publicada y verificaciones pendientes

Actualizado el 12 de octubre de 2026, hora de Managua. Versión publicada al 100%: `a1f530ec-9ca5-49d7-8c30-bb6996163287`. Añade imagen AVIF, separación de Inicio/Acceso y corrección del título y foco al entrar a Acceso desde Reservar. Entrada: [Reservá una mesa](https://app.labellalupita.com/reservar). [Informe de esta continuación](../reservas-2026-10-12/INFORME.md).

El plan de corrección de los 23 hallazgos ya tiene implementación publicada. Esto **no equivale a verificar completamente todos sus criterios de aceptación**: continúan pendientes los datos físicos del local, las pruebas con tecnologías de asistencia, el ensayo real desde la cola de correo y la mejora adicional de carga móvil. La entrega local del 9 de octubre no era el cierre de la activación; este documento la actualiza.

## Política incorporada

- El anticipo VIP es **C$500 aplicables al consumo**.
- Cancelar devuelve íntegramente el **anticipo pendiente** a Cuenta de Casa y libera la mesa, dentro de la misma transacción. No se impone plazo mínimo ni penalización de cancelación.
- Si el cliente no llega, el personal registra la inasistencia después del final previsto de la visita. Ese registro devuelve el anticipo pendiente. El reloj por sí solo no declara una inasistencia.
- Si ya se aplicaron C$300 al consumo, se devuelven los C$200 restantes. Los C$300 consumidos se conservan. Una respuesta repetida no duplica el reintegro.
- Se mantiene la composición de dinero pagado y bono. El saldo visible se vuelve a consultar inmediatamente tras el cargo o la devolución.
- Los anticipos nuevos no generan puntos canjeables antes de consumir. Los puntos corresponden al consumo real. Al resolver un anticipo histórico que sí generó puntos, se compensa su acreditación original.
- La configuración conserva mesas y capacidades vacías: el negocio todavía no las ha definido. La interfaz de administración permite registrar inventario, combinaciones y características comprobadas. Los valores de los ensayos son sintéticos.

## Qué se publicó y verificó

Se aplicaron `027_reservas.sql` y `028_reservas_reembolso.sql` en producción y en la base separada de capacitación. Antes se exportó cada base a un respaldo privado `.local`, se restauró en memoria, se compararon todas sus tablas y se ensayaron ambas migraciones dos veces. Durante la aplicación real se verificó que los datos históricos no cambiaran. Los respaldos no forman parte de los entregables públicos.

Se verificó la versión activa del Worker, la coincidencia exacta del HTML y del JavaScript público con la compilación local, las respuestas de configuración y disponibilidad sin sesión, la validación de fechas/grupos, la protección de cuenta y agenda y las rutas existentes. La consulta de integridad posterior encontró una reserva futura conservada, cero anticipos pendientes y cero mensajes en cola. No se operaron reservas ni dinero real como ensayo.

El canal de correo quedó habilitado con los bindings existentes del proyecto. Las pruebas de la cola cubren fallos, espera, claves y contenido estables, cambios de destinatario y vencimiento de reintentos. La configuración incompleta no consume intentos. Tras la autorización del usuario se envió **una única prueba a hey@creativemk.net** desde el panel de Resend: estado **Delivered**, 10 de octubre, 21:26 de Managua. Se usó el remitente `acceso@labellalupita.com`, del dominio verificado. Esta prueba acredita entrega al servidor del destinatario; no identifica la carpeta de destino y no recorre la cola del Worker. [Evidencia](correo-entrega-real.json).

## Seguimiento de los 23 hallazgos

“Verificado” abajo describe el alcance indicado, no una certificación general.

| Hallazgo | Resultado y evidencia | Pendiente o alcance |
|---|---|---|
| R01 · Falso éxito | Contrato completo, comprobante canónico y recuperación; integración y prueba de respuesta incompleta de la etapa anterior. | Verificado en entorno aislado. |
| R02 · Acaparamiento | Bloqueo del titular, solapes y cuotas, excepciones auditadas; concurrencia PostgreSQL. | Inventario real aún sin registrar. |
| R03 · Ciclo VIP | Consumo, devolución automática, remanente, puntos y saldo visible; siete escenarios financieros y carreras. | No se realizaron movimientos financieros reales como ensayo. |
| R04 · Intenciones duplicadas | Referencia estable, comparación de intención y recuperación del comprobante vigente. Se conserva la revisión aceptada al repetir un intento incierto. | Verificado en integración y concurrencia. |
| R05 · Éxito efímero | Comprobante persistente, gestión y recuperación al regresar. | Verificado en navegador local. |
| R06 · Disponibilidad | Validación, descarte de respuestas antiguas, recarga y caducidad; invalidación programada al vencer la anticipación y comprobación adicional al confirmar. | Fallos/reintentos comprobados; prueba auditiva de invalidación pendiente. |
| R07 · Borrador | Separado por cuenta, 24 horas, acceso y visita a saldo conservan la intención. | Depende del almacenamiento de sesión disponible. |
| R08 · Foco móvil | Encabezado y controles visibles; sin desborde a 320×568. Se corrigió y verificó en producción el foco en Acceso al ir a Mis reservas sin sesión; Tab alcanza el correo. | Zoom nativo y texto ampliado pendientes; el navegador disponible no cambió su escala con el atajo. |
| R09 · Avisos accesibles | Regiones de estado, alertas, causa de bloqueo y anuncio de hora invalidada. | Falta escuchar y operar el flujo con NVDA/Edge y VoiceOver/Safari. |
| R10 · Nombre del control | Texto visible y nombre accesible coinciden. | Árbol accesible revisado; no se ensayó control por voz real. |
| R11 · Capacidad por grupo | Mesas y combinaciones explícitas, asignación atómica y exclusividad VIP. | Falta cargar el inventario físico, conforme a la decisión del negocio. |
| R12 · Operación | Llegada, mesa, salida, inasistencia, cambios, cierres y control de revisión. | Integración, roles, configuración y concurrencia verificados. |
| R13 · Seguimiento | Avisos internos, calendario, cola y recordatorios; configuración publicada, fallos simulados y prueba real desde Resend con estado Delivered. | La prueba desde el panel no valida de extremo a extremo la cola del Worker. |
| R14 · Consulta pública | `/reservar` y disponibilidad accesibles sin autenticarse; acceso al confirmar. | Publicación verificada. No hay aún datos de conversión por cohortes. |
| R15 · Reglas compartidas | Horario, anticipación, duración, horizonte y excepciones centralizados. | Validaciones y calendario extendido comprobados. |
| R16 · Cobertura | 19 suites, compilación, pruebas financieras, concurrencia real y comprobación pública. | Pruebas manuales de asistencia y voz pendientes. |
| R17 · Diagnóstico | Eventos agregados, confirmaciones únicas, conflictos y tiempos de servicio por estados registrados. | Datos del recorrido solo para sesiones autenticadas que permiten medición; no representa todo el tráfico anónimo. |
| R18 · Zonas | Fotografía identificada como terraza; otras zonas con descripción y accesibilidad configurables. | Faltan atributos físicos y fotos verificadas del negocio. |
| R19 · Contenido | Anticipo, aplicado/devuelto/pendiente, nombres legibles, plurales y pasos siguientes. | La política de devolución ya está confirmada y publicada. |
| R20 · Fechas | Calendario y precisión estrictos; fechas imposibles se rechazan sin cargo. | Integración y 422 público verificados. |
| R21 · Rendimiento | Chrome DevTools MCP nativo operativo. AVIF reduce 46,4% la imagen grande; paquete principal de 82,32 a 73,09 KB gzip. Precarga sin duplicación y carga diferida verificadas. | Mediana móvil intermedia 2,748 s; última serie 3,258 s, con TTFB 527–920 ms; CLS 0. Mejora de LCP no estable. Faltan teléfono físico y visitantes. [Perfilado del 12 de octubre](../reservas-2026-10-12/INFORME.md). |
| R22 · Historial | Rango del día antes de expansión e índice de reservas activas. | Laboratorio de 30.000 registros; no equivale al p95 de producción. |
| R23 · Entrada específica | Título, descripción, canónica y entrada HTML de reservas. Al pedir acceso desde Mis reservas, el título pasa a Acceso al montar la pantalla. | Coincidencia de HTML y navegación pública verificada. |

## Evidencia reproducible

Revalidación del 12 de octubre: los **627 archivos** del manifiesto final coinciden con el código, assets, migraciones y configuración locales; se registró también la huella de `vite.config.ts`. El 10 de octubre se midieron además 20 solicitudes públicas secuenciales por ruta: configuración p50 115,1 ms y p95 288 ms; disponibilidad p50 451,8 ms y p95 531,9 ms; las 40 respuestas fueron HTTP 200. Son tiempos históricos desde el equipo de trabajo, con transporte y lectura JSON, sin simular una red móvil y sin prueba de carga. No prueban Core Web Vitals. Detalle en [latencia pública](latencia-publica.json).

- [Publicación y migraciones](publicacion.json), [verificación pública](verificacion-publica.json), [integridad posterior](estado-datos-publicados.json) y [configuración del correo](canal-publicado.json).
- [Respaldos restaurados](respaldos.json), [manifiesto publicado](manifest.json) y [comprobación actual de 627 archivos](verificacion-version.json).
- [Continuación del 12 de octubre](../reservas-2026-10-12/INFORME.md), [métricas de todas las etapas](../reservas-2026-10-12/perfilado.json), [compilación final](../reservas-2026-10-12/build-final.log) y [título/foco verificados](../reservas-2026-10-12/resumenes-version-final.json).
- [Perfilado y mejora de carga](PERFILADO.md), [compilación posterior](build-perfilado.log), [prueba de correo entregada](correo-entrega-real.json) y [captura de Resend](resend-entregado.png).
- [Regresión completa](regresion.log), [compilación](build.log), [empaquetado sin publicar](worker-validacion.log).
- [Reservas](pruebas-reservas.json), [devoluciones y puntos](reembolsos.json), [correo simulado](correo.json), [concurrencia PostgreSQL](concurrencia.json) y [rendimiento local](rendimiento.json).
- [Comprobante de devolución sintético](cancelacion-verificada.png), [saldo actualizado sin recargar](saldo-reintegrado.txt) y [vista móvil publicada](publicada-movil.png).

Las 19 suites pasaron el 10 de octubre. La continuación del día 12 verificó compilación, presupuestos de rendimiento, regresión de Inicio, transiciones en navegador y cinco grupos públicos; no se presenta la regresión completa como una ejecución nueva. El mensaje `error_api` dentro de las pruebas de reembolso corresponde al caso deliberado de un anticipo sin cargo verificable: se comprueba que toda la operación revierte y no inventa saldo. No es un error observado en producción.

## Pendientes concretos

1. El negocio registra mesas, plazas, combinaciones y características reales en **Personal → Agenda → Configurar mesas y condiciones**. Mientras tanto, la confirmación en línea permanece bloqueada y se ofrece coordinación con la casa.
2. QA ejecuta el [guion manual](VERIFICACION_MANUAL.md) con NVDA/Edge, VoiceOver/Safari, ampliación nativa y voz. El control disponible en esta sesión no permite certificar esas experiencias.
3. Completar la verificación de correo desde la cola del Worker en un entorno autorizado, sin inventar una reserva real. El envío desde Resend ya está comprobado; confirmar recepción en bandeja requiere al destinatario.
4. Reducir la dependencia de JavaScript para mostrar el contenido inicial y contrastar la variación de respuesta en un teléfono y una conexión representativos. La imagen y el paquete inicial ya pesan menos, pero el LCP móvil no mejora de forma estable ni alcanza 2,5 segundos en estas series. Al disponer de tráfico, revisar errores, cola, contención y tiempos de atención.

Chrome DevTools está [habilitado y probado](HABILITAR_PERFILADO.md). El [correo preparado](prueba-correo-propuesta.json) se envió una sola vez al destinatario corregido y autorizado por el usuario; [captura de entrega](resend-entregado.png). El borrador de plantilla de Resend permanece sin publicar.

La implementación descrita está publicada. El objetivo integral permanece pendiente de estas verificaciones, la mejora adicional de carga móvil y los datos operativos; no se declara que los 23 criterios estén completamente cerrados.
