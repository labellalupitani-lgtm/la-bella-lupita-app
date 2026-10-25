# Revisión independiente del panel Equipo · 21 de octubre de 2026

**Primera ronda: requiere corregir H1 y H2 y revalidar.** No encontré un fallo crítico en las comprobaciones realizadas. No participé en la implementación ni modifiqué producto o compilaciones.

## Entorno y método

- Vista congelada: `http://127.0.0.1:5273/__preview`, build `antes/dist`, entrada `principal-Bhouru2Z.js`, CSS `principal-BzyWdM0B.css`. SHA256 de index.html: `DF1AF1C67892A9FECE5F7930C017D4B1F54D32C4C1325098F58983D27B985996`.
- Sesión propia, cuentas sintéticas propietario/encargado/caja/cocina; sin secretos ni producción. El navegador automatizado bloqueó solicitudes ajenas al origen local. Los cambios de sesión y el bloqueo ocurrieron solo en esta instancia de prueba.
- Los 12 módulos se recorrieron a 390 y 1440 px y a 320 px con texto al 200%. Se abrieron subpaneles. Muestreo adicional a 768 px en configuración de Agenda y nueve combinaciones de rol/módulo.
- Navegación real con Chrome DevTools y Playwright/Edge; inspección visual de capturas, árbol accesible, geometría DOM, teclado y código pertinente. No se aceptaron resultados PASS históricos como prueba de esta ronda.
- 76 ejecuciones de axe WCAG 2 A/AA y 2.1 AA: cero infracciones detectadas; cero desbordamientos globales en esos estados y cero errores JavaScript registrados. **Esto no detectó H1:** el solapamiento local exige inspección visual/geometría.
- La ampliación fue `html { font-size: 200% }`, no zoom del navegador. Teclado y lector del árbol accesible se muestrearon; no se efectuó una auditoría exhaustiva con lector de pantalla.

Evidencias y scripts: `evidencia/arbitro-equipo/`, `evidencia/arbitro-equipo-flujos/`, sus carpetas `-complemento`, `-teclado`, `-detalles`, `-hallazgos`; `auditar-equipo.mjs` y `auditar-equipo-flujos.mjs`. Los JSON conservan texto, foco, resultados y límites de cada ejecución.

## Hallazgos reproducibles

### H1 · P2 · Texto de actualización solapado con su botón

**Dónde:** componente compartido `Sincronizacion`; reproducido en Agenda y visible en otros módulos con ese componente.

**Reproducir:** ingresar como propietario, abrir `/personal?seccion=agenda`, ancho 320 px, `document.documentElement.style.fontSize='200%'`, bajar al bloque «Actualizado…». El texto «Actualización automática cada 30 s» invade el área del botón «Actualizar».

**Evidencia:** `evidencia/arbitro-equipo/agenda-320-200.png`; captura enfocada `evidencia/arbitro-equipo-flujos-hallazgos/agenda-sync-320-200-viewport.png`; medición en su `resultado.json`. En la medición inicial el texto ocupa x=16–163.75 y el botón x=128.91–304 con intersección vertical en dos líneas. `scrollWidth <= innerWidth` y axe siguen pasando.

**Impacto:** leer el estado y distinguir la acción se dificulta al ampliar texto; incumple el criterio de ausencia de solapamientos. **Corregir:** permitir que el bloque apile texto y acción cuando no quepan, con ancho mínimo útil para el texto y sin recortar palabras. Revalidar todos los usos compartidos, especialmente listas y ficha de Cliente.

### H2 · P2 · Limpiar filtros deja el foco en BODY

**Dónde:** `Lista` compartida de Pedidos, Entregas, Atención y registro de Informes. El mismo patrón existe en filtros del directorio Clientes; allí el defecto se identificó en código, pendiente de reproducción específica tras la corrección.

**Reproducir:** Atención → escribir «sin resultado» en Buscar → Buscar → enfocar «Limpiar filtros» con teclado → Enter. El botón desaparece y `document.activeElement.tagName` queda `BODY`.

**Evidencia:** `evidencia/arbitro-equipo-flujos-complemento/resultado.json`, caso `limpiar-foco`; `atencion-limpiar.png`. Fuente de la versión observada: `comun.tsx`, acción Limpiar filtros, sin destino de foco; `Clientes.tsx` repite eliminación del control sin restitución.

**Impacto:** se pierde el indicador de foco y la posición contextual de quien opera con teclado. **Corregir:** devolver foco al campo Buscar u otro control estable del mismo formulario después de limpiar; mantener el anuncio de resultados. Revalidar el componente común y Clientes.

### H3 · P3 · Todas las secciones conservan el título del Club

**Dónde:** documento de las 12 secciones del Equipo.

**Reproducir:** navegar entre Resumen, Caja, Clientes y Cuenta y seguridad; `document.title` sigue siendo «Club Lupita — La Bella Lupita».

**Impacto:** pestañas e historial no permiten distinguir módulo ni área del equipo. **Corregir:** título contextual, por ejemplo «Caja · Equipo · La Bella Lupita», y título propio para acceso/bloqueo cuando corresponda. Evidencia: campo `title` de todos los registros de la primera matriz.

## Cobertura por módulo

Los tamaños 390/1440/320 con texto200% aplican a todas las filas. «Sin defecto específico» no equivale a validar operaciones que no se ejecutaron.

| Módulo | Alcance observado | Resultado y límites |
|---|---|---|
| Resumen | Jerarquía de cuatro contadores, ingresos, acceso a caja/informes, navegación de menú y foco al contenido. | Sin defecto específico de contenido. H1/H3 compartidos. Datos sintéticos sin pedidos; no se validaron cifras de una jornada real. |
| Pedidos | Filtros, vacío, paginación, carga forzada; Disponibilidad y recepción, fichas verificadas y medición/incidencias abiertos; diferencias de herramientas por rol. | H1/H2/H3. No había pedidos activos en esta fixture: transiciones aceptar/preparar/listo/entregar y cancelación con devolución no se ejecutaron en esta revisión. |
| Caja | Cuatro tareas: consulta de cliente con cuenta y movimientos; beneficio de 12 caracteres con código inexistente y error; vale de 8 caracteres con error; descuento y ausencia de productos confirmados. | Formularios etiquetados; acciones y errores legibles. Sin defecto específico confirmado. No se registraron recargas, sellos, entregas ni descuentos; validación de cotización/canje exitoso queda a suites transaccionales. |
| Mi Club | Condiciones/costos, reglas aprobadas, esperas vacías, experiencias, formulario de nueva experiencia, búsqueda de entregas para reposición, métricas; diálogo de cancelar experiencia a320/texto200%. | H1/H3. Sin defecto adicional en controles abiertos. No se activaron reglas, publicaron experiencias, cancelaron entradas ni autorizaron reposiciones. No se confirmó información operativa real. |
| Tienda | Ficha/condiciones de lote, filtro de bolsas, vacío, paginación y seguimiento; comparación propietario/encargado/caja. | H1/H3. Sin defecto específico en la ficha abierta. No había bolsas para validar entrega, rechazo ni devolución; no se guardaron condiciones. |
| Entregas | Lista, filtros, vacío y paginación; desconexión forzada con aviso y recuperación al actualizar. | H1/H2/H3. Error y recuperación visibles; no se marcaron bolsas/asistencias por falta de pendientes. |
| Agenda | Filtro de fecha, vacío, métricas; diálogo de reserva manual, foco y Escape; configuración, inventario Terraza, agregar campos de fecha excepcional y cierre sin guardar; tablet768. | H1/H3. Caja puede registrar reserva y no ve configurar; administración sí. No se creó/resolvió reserva ni se ejecutaron anticipos/devoluciones. |
| Atención | Filtros y búsqueda vacía; limpieza con teclado. | H1/H2/H3. No había solicitudes; no se ejecutó resolución de solicitud. |
| Informes | Selector de período, cifras, métricas de Inicio, registro de actividad y apertura de detalles. | H1/H2/H3. Los registros sintéticos son legibles; no se verificó contenido del CSV descargado ni cálculo con ventas pobladas. |
| Clientes | Directorio de dos cuentas sintéticas, filtros, ficha, contacto/membresía/saldo e historial; navegación enfoca encabezado de ficha; ficha a320/texto200%. | H1/H3 y patrón de H2 pendiente de reproducción particular. No se archivaron/restauraron muestras ni editaron cuentas. |
| Equipo y permisos | Desglose de roles, directorio, invitación y cambio de rol abiertos; cambio sin modificación queda deshabilitado; Escape devuelve foco. Encargado solo consulta. | H3. Sin defecto específico confirmado. No se emitió invitación ni se modificó/desactivó un acceso. |
| Cuenta y seguridad y acceso | Datos de cuenta, contraseña, sesiones y actividad; confirmar identidad y renovar códigos abiertos; diálogo con desplazamiento propio a320/texto200%; bloqueo real oculta operación; salir lleva a acceso y se abre recuperación. | H3. Foco retenido en diálogo y devuelto al activador con Escape. No se ingresaron contraseñas/MFA ni se renovaron códigos; activación, TOTP y recuperación completa requieren suite aislada de seguridad. |

## Roles

| Perfil sintético | Navegación / diferencias comprobadas |
|---|---|
| Propietario | 12 secciones. Puede abrir administración de accesos y condiciones. |
| Encargado | 12 secciones. Equipo es de consulta y no muestra Invitar/cambiar roles; se muestrearon Mi Club y Tienda. |
| Caja | Pedidos, Caja, Entregas, Agenda, Atención, Tienda, Cuenta y seguridad. Agenda sin configurar; Pedidos sin herramientas administrativas de Carta. |
| Cocina | Pedidos y Cuenta y seguridad. Pedidos muestra disponibilidad/fichas pero no medición administrativa. Intentar URL de Clientes vuelve a sección permitida. |

Esta comprobación describe la interfaz y la redirección cliente; no sustituye pruebas de autorización del servidor.

## Interacción y estados

- Menú móvil: Enter abre; Tab entra a sus enlaces; Escape desde la navegación cierra y devuelve el foco; Enter en Caja enfoca el contenido del módulo. Evidencia final `arbitro-equipo-flujos-teclado/resultado.json`.
- Diálogos de Agenda, invitación e identidad: entrada de foco, contención muestreada con Shift+Tab y retorno al activador con Escape. Confirmar cambio de rol deshabilitado hasta elegir otro rol.
- Estados: vacíos en las listas, errores de código en Caja, datos de cliente cargados, espera de actualización forzada de Pedidos, desconexión/actualización fallida y posterior recuperación en Entregas. No se presenta un éxito de operación económica no ejecutada como comprobado.
- Los primeros intentos automatizados de navegación y ficha usaron selectores incorrectos; no son defectos del producto. Se corrigieron y repitieron de forma independiente en carpetas `-complemento` y `-teclado`. La captura final de carga usa la ruta observada `/api/operacion/listas/pedidos`.

## Continuidad

Pendiente de segunda ronda sobre una nueva vista congelada: H1 compartido a320/390 con texto200%, H2 en Lista y Clientes con teclado, H3 al navegar y volver al acceso. Mantener cacao/marfil/rosa/borgoña y la dirección aprobada; no hace falta cambiarla para resolver estos defectos.

Las pruebas transaccionales no ejecutadas están declaradas por módulo. El cierre técnico debe combinar esta revisión visual con suites actuales de operaciones y seguridad; no debe basarse en PASS de entregas anteriores. La validación visual del usuario sigue pendiente y esta revisión no autoriza producción.
