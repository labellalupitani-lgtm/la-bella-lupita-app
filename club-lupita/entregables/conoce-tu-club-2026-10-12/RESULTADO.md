# Conocé tu club — resultado de la ejecución

12 de octubre de 2026, Managua. La mejora está publicada en [Conocé tu club](https://app.labellalupita.com/conoce-tu-club). La página explica la cuenta gratuita y los cinco beneficios de Mesa Fundadora antes de ingresar, conserva las condiciones vigentes de C$950 cada 30 días y enlaza con Mi Club y Reservas.

La implementación técnica está terminada y verificada. **Las cinco reglas comerciales aprobadas quedaron preparadas, sin activar**, por instrucción expresa del propietario. La comprobación posterior a la publicación confirma `reglas_version = null` tanto en producción como en capacitación. Aprobar la propuesta y activar la operación son decisiones distintas; no se cargaron costos, inventario ni comprobaciones físicas ficticias.

## Qué cambió

- **Explicación propia y pública:** `/conoce-tu-club`, enlaces visibles desde la entrada y Mi Club, metadatos para compartir, acciones al principio y preguntas frecuentes. La información comercial se consulta al servidor; errores y reintentos tienen mensaje propio.
- **Compras con condiciones aceptadas:** la oferta de una experiencia queda fijada al abrir la confirmación. El servidor contrasta precio, fecha, lugar, duración, contenido, condiciones y ventanas de acceso dentro de la transacción. Si algo cambió, rechaza la compra sin cargo y exige revisar de nuevo. Los reintentos recuperan el comprobante original. La membresía también conserva la configuración que la persona revisó.
- **Reglas listas para operar:** importe elegible por ticket, selección de bebida al entregar un premio nuevo, versión de reglas por tanda, ocho postres y exclusión de extras, lista de espera VIP con consentimiento, cancelación, prioridad y control de ofertas simultáneas. La activación desde Personal → Mi Club exige propietario, evidencia, costos e inventario VIP.
- **Accesibilidad y mantenimiento:** enlaces nativos, títulos y foco de ruta, lectura con texto ampliado, carga diferida y condiciones compartidas. Los eventos específicos del recorrido requieren sesión y respetan la preferencia de no seguimiento de la app.

Se revisó el código actual antes de editar. Varias correcciones de Mi Club, Inicio, Carta, Perfil y Reservas ya procedían de trabajos posteriores a la auditoría original: se conservaron e incluyeron en las regresiones. No se atribuyen aquí como desarrollo nuevo.

## Estado de los 18 hallazgos

Base: [auditoría original del 8 de octubre](../../../research_conoce_tu_club/INFORME-AUDITORIA-CONOCE-TU-CLUB.md). «Verificado» se refiere a la evidencia técnica descrita abajo; no sustituye validación presencial.

| Hallazgo | Resolución y estado final | Evidencia principal |
|---|---|---|
| H01 · Se podía cobrar un precio distinto al confirmado | **Corregido.** Huella de oferta validada dentro de la transacción; diálogo conserva lo aceptado. Membresía conserva versión de condiciones; recuperación idempotente. | API: 12 grupos; interfaz de compra en 3 motores; concurrencia PostgreSQL. |
| H02 · Oferta incompleta antes de comprar | **Corregido técnicamente.** Cuenta gratuita, cuota, cinco beneficios, renovación, cancelación y pagos separados se explican sin iniciar sesión. Los detalles todavía inactivos se identifican como pendientes. | Ruta pública local y publicada; cinco beneficios comprobados. |
| H03 · Café diario/por visita y bolsa mensual/por período | **Contrato principal coherente y verificado.** Café diario de Managua y bolsa de 250 g por período pagado en nuevos contratos. Condiciones anteriores conservadas. Tamaño/extras aprobados y preparados para activación. | Contrato compartido, pruebas Mi Club, propuesta y activación preparada. |
| H04 · Prioridad y anticipación sin ejecución diferenciada | **Controles implementados.** Ventana de experiencias y descuento conservados; prioridad VIP lista con orden, vigencia y bloqueo de ofertas en competencia. **Activación y ensayo presencial VIP pendientes por decisión del propietario.** | Reglas API/UI, concurrencia y regresión de descuentos. |
| H05 · Conocé tu club duplicaba Mi Club | **Corregido.** Destino explicativo propio; Mi Club mantiene la función operativa. | Navegación y foco en 3 motores y producción. |
| H06 · Invitación oculta en móvil y pantallas bajas | **Corregido.** Enlace en entrada y Mi Club móvil, navegación de escritorio y acceso compacto en escritorios bajos. | 390 px y 1366×768; regresión Inicio a 320 px. |
| H07 · Sellos y premio ambiguos | **Definido, implementado y probado; activación preparada.** Un sello por ticket elegible de C$100 netos; selección de bebida regular. Tandas y premios anteriores conservan sus condiciones. La verificación del contenido real del ticket corresponde a caja. | Seis grupos de reglas, interfaz de caja/premio y propuesta aprobada. |
| H08 · Jerarquía extensa antes de acciones útiles | **Reorganizado.** Acceso a cuenta y Mesa Fundadora al principio; comparación de opciones, pasos y preguntas desplegables. Mi Club conserva el orden por tareas de su mejora reciente. La comprensión real requiere participantes. | Capturas 390/1440 px, regresión Mi Club. |
| H09 · Sin recuperación contextual ante saldo insuficiente | **Solución reciente conservada y verificada.** Recarga contextual y condiciones de revisión; explicación pública de Cuenta de Casa. | Suite Mi Club y contenido público. |
| H10 · Códigos sin vigencia visible | **Solución reciente conservada y verificada.** Cuenta regresiva, vencimiento del servidor y regeneración sin consumir el premio antes de la entrega. | Suite Mi Club y caja. |
| H11 · Error de catálogo presentado como fallo de cuenta | **Corregido/conservado.** Fallos específicos por recurso; consulta pública con reintento, tiempo límite y rechazo de respuesta incompleta. Calendario vacío indica que no hay experiencias publicadas. | Error 503 y respuesta incompleta en 3 motores; API y regresión. |
| H12 · Foco perdido y aviso persistente tras compra | **Solución reciente conservada y verificada.** Resultado recuperable, foco y cierre del panel. La confirmación de oferta sigue accesible durante refrescos. | Mi Club y escenarios de compra en 3 motores. |
| H13 · Espera, cesión y estados temporales incompletos | **Flujos actuales verificados.** Consentimiento, salida de espera, fechas, cesión y reposiciones conservados. Nueva espera VIP no cobra ni confirma reserva; activación preparada. | Mi Club, reglas cliente/administración y concurrencia. |
| H14 · Semántica y pase con texto ampliado | **Verificado automáticamente.** Enlaces, títulos, foco, teclado y ausencia de desbordamiento de la nueva página a 320–1440 px y texto al 200%; pase cubierto por regresión. No se realizó ensayo con lector de pantalla físico. | 21 grupos de interfaz, axe y regresión Mi Club/Inicio. |
| H15 · Faltaba explicación pública compartible | **Corregido y publicado.** Ruta sin sesión, URL canónica y metadatos propios; se conservaron los de Reservas. | HTML publicado y 12 recursos coinciden por SHA-256 con el build. |
| H16 · Datos obsoletos al volver a la app | **Verificado.** Mi Club conserva sus refrescos; la explicación recarga al volver, recuperar conexión o visibilidad. Un refresco no reemplaza silenciosamente la oferta aceptada. | Interfaz de precios/condiciones en 3 motores. |
| H17 · Exposición de sesión y datos del pase | **Endurecimiento previo conservado.** Cookie HttpOnly, CSRF y código público de pase sin teléfono; información pública usa una lista explícita sin costos, personas ni historial. Esto no constituye una prueba de penetración integral. | Regresión general, API pública y acceso sin sesión rechazado. |
| H18 · Medición, rendimiento y mantenimiento | **Instrumentación y optimización implementadas.** Eventos específicos, carga diferida, configuración compartida y pruebas repetibles. La conversión, comprensión, rentabilidad y Core Web Vitals reales requieren datos de campo; no se declaran mejoras numéricas sin ellos. | Build, pruebas de no seguimiento y protocolo pendiente. |

## Reglas comerciales aprobadas

1. Café filtrado diario de 8 oz; extras aparte.
2. Un sello por ticket con C$100 netos de alimentos/bebidas elegibles, con las exclusiones documentadas.
3. Premio entre siete bebidas de carta, en presentación regular y sin extras.
4. 15% en los ocho postres aprobados, porciones individuales, sin extras ni acumulación de promociones.
5. Preferencia de miembros vigentes en la espera VIP para solicitudes equivalentes; sin desplazar reservas confirmadas ni garantizar mesa.

La [propuesta aprobada](PROPUESTA-REGLAS.md) conserva la lista completa y sus límites. El [procedimiento de activación](ACTIVACION-PREPARADA.md) indica responsables y casos de ensayo. Antes de habilitarlas faltan los vasos y presentaciones reales, costos por café/bolsa/período, revisión del margen de postres, inventario VIP y ensayo con el personal. No hay que volver a aprobar las cinco decisiones ya tomadas.

La cola VIP registra y ordena solicitudes; no envía mensajes externos, no cobra y no crea reservas automáticamente. La app registra el neto declarado por caja; no inspecciona un sistema externo de facturación. Esas responsabilidades están descritas en el procedimiento para evitar confundir un control digital con una comprobación física.

## Pruebas y límites de la evidencia

| Verificación | Resultado y archivo |
|---|---|
| Compilación, TypeScript y guardianes del proyecto | Correctos: [build.log](build.log). |
| Regresión general del proyecto | `npm test`, salida 0: [regresion.log](regresion.log). |
| Mi Club, operación y caja | `npm run test:mi-club`, salida 0: [regresion-mi-club.log](regresion-mi-club.log). |
| Carta e Inicio | 21 escenarios específicos de Carta y suite de interfaz Inicio correctos: [Carta](regresion-carta.log), [Inicio](regresion-inicio-ui.log). |
| API pública y aceptación de oferta | 12 grupos correctos; repetidos tras el último ajuste de texto: [API](evidencia/api.json), [log](pruebas-api.log). |
| Reglas operativas | 6 grupos correctos: [reglas](evidencia/reglas.json). Activación ensayada exclusivamente en fixtures sintéticos. |
| Interfaz Conocé tu club | 7 grupos por motor × Edge, Firefox y WebKit = 21: [interfaz](evidencia/interfaz.json). Incluye errores, teclado, foco, anchos, texto ampliado y no seguimiento. |
| Interfaz de reglas | 4 recorridos completos, cliente/caja/propietario y comprobación axe: [reglas-interfaz](evidencia/reglas-interfaz.json). |
| Concurrencia | 5 grupos sobre PostgreSQL real en esquema sintético exclusivo, eliminado al finalizar: [concurrencia](evidencia/concurrencia.json). Incluye compradores simultáneos, reintentos, renovaciones, caja y competencia VIP. No es una prueba de carga de producción. |
| Reservas preservadas | Navegación pública, título y foco locales: [reservar](evidencia/reservar.json). También recorrido público real tras publicar. |
| Publicación real | 4 grupos correctos: HTML y recursos, API segura, reglas inactivas en ambas bases, navegación pública 390/1440 px sin errores JavaScript ni escrituras en la API del negocio: [producción](evidencia/produccion.json). |

El conjunto `npm run test:conoce-club` pasó antes del ajuste final de dos textos. Tras esos textos se repitieron build y pruebas API, y se comprobó la interfaz publicada. No se presenta esa secuencia como una repetición completa de todas las suites sobre cada cambio de texto.

El JavaScript principal quedó en 73,23 kB gzip. La nueva pantalla se carga por separado y no incorpora imágenes grandes. Estos tamaños describen el build; no son mediciones de LCP, INP o CLS en dispositivos reales. Las pruebas de axe no encontraron infracciones en los escenarios ensayados; no equivalen a certificación de accesibilidad.

Los eventos comerciales nuevos solo cuentan sesiones identificadas y respetan DNT/GPC; por tanto no miden el total de visitantes anónimos. En producción se observó además telemetría del CDN hacia `/cdn-cgi/rum`, separada de estos eventos. No se afirma que la navegación pública esté libre de toda telemetría ni que la configuración global del CDN haya sido auditada por las pruebas de DNT de la app.

Quedan como trabajo de campo el protocolo de 5–8 participantes, lectores de pantalla en dispositivos físicos, dos turnos de caja y análisis de margen/consumo real. Están documentados, no simulados como resultados obtenidos.

## Publicación y recuperación

- Versión activa al 100%: `c19fcdb1-1b39-401e-87fb-0db2a40dfc9b`, confirmada el 12/10/2026 a las 17:59, Managua. [Registro de publicación](publicacion.json).
- Versión anterior: `a1f530ec-9ca5-49d7-8c30-bb6996163287`. El proceso comprobó que ninguna otra publicación la hubiera sustituido antes de desplegar y que el código coincidiera con el [manifiesto](manifest.json).
- Migración 029 aditiva aplicada a producción y capacitación, con comprobación de integridad de los datos históricos. Las reglas comerciales permanecieron inactivas.
- Respaldos privados completos de ambas bases; cada copia se restauró en memoria y la migración se ensayó dos veces sin alterar datos históricos. Los últimos respaldos contienen 61 tablas, 1.259 filas reales y 890 de capacitación. [Metadatos sin datos personales](respaldos.json). No se incluyen aquí los contenidos privados de las copias.
- Ante una regresión de código, la versión anterior del Worker está identificada; la migración aditiva permite conservar el esquema. Cualquier recuperación de datos requiere revisar las escrituras posteriores: no se debe restaurar una copia antigua indiscriminadamente.

Capturas de la página publicada: [móvil](evidencia/produccion-390.png) y [escritorio](evidencia/produccion-1440.png). La comprobación pública no creó compras, membresías, reservas ni activaciones.
