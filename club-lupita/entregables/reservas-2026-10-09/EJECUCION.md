> Registro de la etapa local del 9 de octubre. La política de devolución fue confirmada y la solución fue publicada el 10 de octubre (hora de Managua). Consultá el [estado actualizado](../reservas-2026-10-10/ESTADO.md); los pendientes de política, migración y publicación descritos abajo corresponden a esa etapa anterior.

# Reserva una mesa — ejecución y verificación

9 de octubre de 2026. Implementación local sobre la aplicación que ya contenía los cambios de otros chats en acceso, perfil, carta, tienda y Club. Se conservan su sesión por cookies, CSRF, permisos y pantallas diferidas. No se ha publicado esta versión ni aplicado la migración a las tablas operativas de producción.

El [plan](PLAN.md) se ejecutó en seis fases. Los 23 hallazgos tienen tratamiento y evidencia abajo. «Implementado» describe código local comprobado; no implica que estén definidas las condiciones comerciales, activado el correo o certificada la accesibilidad de todos los navegadores.

## Decisiones confirmadas y límites de activación

- **VIP: C$500 aplicables al consumo.** El cliente revisa las condiciones antes del cargo. Quedan registradas con su versión en el comprobante.
- **Capacidad todavía no definida.** La configuración inicial contiene cero mesas. Administración puede registrar identificadores, plazas y combinaciones verificadas; las zonas pendientes no confirman reservas en línea. Los números de las pruebas y capturas son exclusivamente sintéticos.
- **Cancelación e inasistencia sin condiciones comunicadas todavía.** No se inventó multa, caducidad ni devolución automática. Se pueden cancelar mesas y tramitar una devolución explícita del remanente, autorizada por administración. La cancelación no devuelve dinero por sí misma. VIP exige completar los dos textos reales antes de aceptar nuevas confirmaciones.
- Las devoluciones implementadas acreditan **Cuenta de Casa** conservando el reparto pagado/bono del libro. No ejecutan transferencias bancarias ni entregas de efectivo.

## Resultado funcional

La disponibilidad se puede consultar sin ingresar. El acceso se pide al confirmar y conserva el borrador de la visita. El servidor devuelve un comprobante verificable con inicio, fin, grupo, zona, anticipo, estado y revisión; una respuesta incompleta no anuncia éxito. Ante incertidumbre, la aplicación conserva la misma referencia para consultar o reintentar sin crear otro cargo.

Mis reservas permite consultar, descargar calendario, reprogramar y cancelar. Un cambio fallido conserva la visita original. La asignación considera plazas de cada mesa y uniones expresamente permitidas. El salón VIP mantiene exclusividad para un grupo. Las reservas históricas sin mesa asignada bloquean prudentemente su zona durante el intervalo correspondiente.

La agenda del personal incorpora reservas manuales para cuentas existentes, llegada, mesa ocupada, salida, inasistencia, cambio, cancelación y resolución del anticipo. Las revisiones evitan pisar cambios de otro empleado. Caja puede registrar consumo; las devoluciones, excepciones de grupo y configuración corresponden a administración. Un alta manual VIP exige verificar la autorización del titular y la configuración vigente.

Administración puede configurar horarios semanales, fechas excepcionales, cierres por zona e intervalo, anticipación, duración y límites de reservas activas. Un cambio de inventario u horario que invalide una visita activa se rechaza y pide reprogramarla primero. Se mantienen los límites del flujo de 1–12 personas y hasta 6 horas; grupos fuera de ese rango se coordinan con la casa.

### Aplicación del anticipo

Se admiten dos operaciones explícitas:

1. **Registrar y cobrar un consumo de caja:** el importe usa el anticipo y, si hace falta, saldo adicional de la cuenta, de forma atómica. La serie/referencia de caja evita registrar el mismo cobro dos veces.
2. **Aplicar a un pedido ya pagado:** se valida el titular, la visita, el cargo real del pedido y el consumo aún no aplicado; se acredita la parte correspondiente porque ese pedido ya fue pagado.

Ejemplo probado: anticipo C$500, saldo disponible C$0 y consumo C$300 → aplicado C$300, pendiente C$200 y saldo disponible C$0. Si administración devuelve después el remanente, se acreditan C$200 una sola vez. El remanente no se pierde ni se devuelve automáticamente. Las correcciones de puntos evitan premiar dos veces el mismo consumo; un anticipo histórico ya puntuado se compensa al resolverlo.

El libro conserva movimientos inmutables. Para aplicar una parte se revierte íntegramente el tramo pendiente y se aparta nuevamente el remanente dentro de la misma transacción. Esto respeta la función existente de saldo cronológico y su regla de devolución completa, sin convertir bonos en saldo pagado.

## Trazabilidad de los 23 hallazgos

| Hallazgo | Tratamiento ejecutado | Evidencia y límite |
|---|---|---|
| R01 · Falso éxito | Validación del contrato completo; comprobante del servidor y recuperación de incertidumbre. | Contratos inválidos en `tests/reservas.mjs`; captura `respuesta-incompleta-320.jpg`. |
| R02 · Acaparamiento por cuenta | Bloqueo del titular, prohibición de solapes, máximo activo configurable, límite de diez altas por hora y excepciones administrativas auditadas. | Integración y concurrencia real. No sustituye la protección de red/WAF. |
| R03 · Ciclo VIP incompleto | Anticipo versionado, consumo directo o pedido pagado, aplicación parcial, remanente, devolución autorizada y ajuste de puntos. | Pruebas de saldo cero, bono/pagado, permisos, duplicados y carreras. Condiciones comerciales pendientes. |
| R04 · Deduplicación incompleta | Referencia estable e intención completa; cambios de intención con la misma referencia dan conflicto; reintentos devuelven el registro vigente, incluso cancelado. | Integración y cuatro reintentos VIP simultáneos. |
| R05 · Éxito efímero | Comprobante persistente y acceso a Mis reservas; no vuelve a solicitar la hora después del éxito. | Recarga de página y `gestion-verificada.jpg`. |
| R06 · Disponibilidad frágil | Contrato, fecha solicitada y revisión validados; respuestas antiguas descartadas, consulta periódica y al recuperar foco/conexión, conflictos y fallos con reintento. | `disponibilidad-fallida.txt`, integración y recuperación de 503 en navegador. |
| R07 · Borrador perdido | Borrador de 24 h por cuenta en la pestaña; traspaso explícito desde invitado durante acceso; conservación al ir a saldo. | `borrador-recuperado.txt`, `acceso-conserva-borrador.txt`, `vip-sin-saldo-320.jpg`. Depende de almacenamiento de sesión disponible. |
| R08 · Foco móvil oculto | Foco y desplazamiento al encabezado del paso, imagen oculta en pasos móviles, espacio adaptable para pie fijo y controles apilados a 320 px. | 320×568 y 568×320 verificados; foco tras reprogramar. Zoom nativo/texto ampliado pendiente de evaluación manual. |
| R09 · Estados no anunciados | Estado de carga, alertas de error, resultado y explicación del botón bloqueado; error de red separado de falta de capacidad. | Árbol accesible y navegador. La lectura real con NVDA/Edge y VoiceOver/Safari no se ha verificado. |
| R10 · Volver discordante | Rótulo visible y nombre accesible coinciden. | Inspección del árbol accesible en el flujo final. |
| R11 · Grupo sin asignación | Mesas con plazas, combinaciones explícitas, exclusividad VIP y asignación sin duplicados. | Pruebas de grupos y dos mesas concurrentes. Falta inventario físico del negocio. |
| R12 · Agenda de solo lectura | Ciclo operativo, reprogramación atómica, alta manual, control de revisión y cierres por zona. | Integración, permisos, carreras y `configuracion-guardada.txt`. |
| R13 · Sin seguimiento enviado | Avisos internos transaccionales, calendario UTC, cola persistente de correo para confirmaciones/cambios/cancelaciones y recordatorio. | Transporte externo simulado, claves de idempotencia y descarte de versiones obsoletas. Envío real aún deshabilitado. |
| R14 · Acceso demasiado temprano | Consulta pública; autenticación al confirmar conserva intención. | Flujo completo de acceso con correo y código sintéticos; `revision-publica.txt`. |
| R15 · Reglas duplicadas | Contrato compartido para horario, excepciones, antelación, ventana hasta 90 días y duración. | Validaciones de frontend/API; fecha libre dentro del rango y cierres por zona. |
| R16 · Pruebas incompletas | Suite específica, regresión existente, simulación de fallos, navegador y ensayo multiconexión real. | Fuentes de prueba, logs y resultados de esta carpeta. No se afirma certificación WCAG. |
| R17 · Sin diagnóstico operativo | Eventos agregados de pasos, revisión, recuperación, saldo, conflicto e incertidumbre; confirmaciones únicas del servidor; estados y tiempo llegada–mesa. | Sin teléfono, nombre ni contenido del formulario en métricas. Pasos solo de sesiones autenticadas que permiten medición; no son conversión de visitantes anónimos. |
| R18 · Zonas poco verificables | Descripción y accesibilidad editables; fotografía identificada como terraza y presentación tipográfica para otras zonas. | Inventario sin atributos supuestos. Faltan datos físicos y fotos comprobadas del negocio. |
| R19 · Texto impreciso | Anticipo aplicable al consumo, cantidades aplicadas/devueltas/pendientes, plurales, nombres de zonas/estados, causa del bloqueo y acción siguiente. | Revisión visual, fallo 503 y aplicación parcial desde la agenda. |
| R20 · Fechas imposibles | Validación de calendario real y precisión de hora, con reglas de Managua compartidas. | Fechas imposibles, segundos y horas fuera de rango rechazados sin cargo. |
| R21 · Carga amplia | Se conserva la división en pantallas que ya incorporaron otros chats; imagen adaptable y presupuestos de bytes comprimidos comprobados. | `rendimiento.json`. Falta observar LCP/INP/CLS reales tras publicar; no se prometen tiempos de red con estas cifras. |
| R22 · Expansión del historial | Filtrado materializado del día antes de expandir horas, índice de fin para visitas activas y conteo de mesas combinadas. | 30.000 reservas históricas más ocho del día; plan usa `reserva_fin_activa`. Medición local, no p95 de producción. |
| R23 · Ruta genérica | Entrada estática `/reservar` con título, descripción, URL canónica y Open Graph; título por navegación interna. | `scripts/reservas-metadata.mjs` y `dist/reservar.html`. Resolución en dominio público por verificar después del despliegue. |

## Pruebas y evidencia

- **Regresión:** `npm test`, las 17 suites encadenadas del proyecto, incluyendo reservas; salida íntegra en `regresion.log`.
- **Compilación:** TypeScript, Vite y guardianes de iconos, tokens y dependencias; `build.log`.
- **Empaquetado de Worker:** `wrangler deploy --dry-run`; `worker-validacion.log`. La opción usada no publica.
- **Integración:** configuración vacía, políticas y revisiones, fechas, contratos, capacidad, solapes, propiedad, cambios, cancelación, finanzas, permisos, correo simulado, métricas y migración repetida. `pruebas-reservas.json` y `tests/reservas.mjs` contienen detalle.
- **PostgreSQL real:** cinco grupos concurrentes. Dos mesas no aceptan cuatro titulares; reintentos VIP cobran una vez; un titular no confirma visitas superpuestas; cancelar libera una sola vez; aplicar y devolver concurrentemente produce un solo movimiento de cada clase. `concurrencia.json`. Se usó un esquema exclusivo en la base separada de capacitación y se eliminó al terminar.
- **Rendimiento local:** diez muestras por ruta después de calentamiento, con 30.000 filas históricas y ocho reservas del día. Presupuesto p95 local: 250 ms. Paquete principal: hasta 95.000 bytes gzip; Reservar: 7.000; Mis reservas: 5.000. Valores y plan exactos en `rendimiento.json`; son presupuestos de laboratorio, no de latencia de usuarios.
- **Navegador:** consulta pública, acceso conservando intención, error 200 con cuerpo incompleto, recuperación, saldo insuficiente, comprobante, calendario descargado, reprogramación, foco, aplicación parcial de caja, configuración guardada y recuperación de 503. Tamaños comprobados: 320×568, 568×320 y escritorio. El archivo `.ics` descargado tiene fechas UTC sin fracción decimal.

Las capturas contienen cuentas, mesas y políticas ficticias del entorno local. No se enviaron mensajes reales ni se operó dinero real.

La revisión de foco usa como referencia [WCAG 2.2, foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html); la prueba de posición del encabezado no equivale a una evaluación completa con tecnologías de asistencia. La entrada `reservar.html` se preparó para el [manejo de rutas HTML de Workers](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), cuyo resultado debe comprobarse en el dominio al publicar. Las fuentes y el diagnóstico original permanecen en `research_reservas_2026-10-08/`, en la raíz del proyecto.

## Qué falta para operar en producción

Registrar el inventario y características reales, definir las dos condiciones comerciales VIP, aplicar la migración en los entornos correspondientes, publicar la versión y verificar la ruta pública. El correo requiere configurar y activar el transporte y comprobar una entrega autorizada. Las pruebas manuales de lectores de pantalla y la medición de uso real continúan después de esa activación. El procedimiento está en [ACTIVACION.md](ACTIVACION.md).

La asignación usa un bloqueo transaccional global de inventario: prioriza consistencia y simplicidad para este restaurante. Si el tráfico creciera sustancialmente, medir contención antes de dividir los bloqueos por zona; no eliminar el bloqueo ni el del titular para ganar velocidad sin otra garantía equivalente.
