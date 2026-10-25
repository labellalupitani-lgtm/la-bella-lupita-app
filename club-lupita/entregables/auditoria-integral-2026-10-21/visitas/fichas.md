# Cuenta, fidelización y visitas — auditoría nueva

Fecha: 21 de octubre de 2026, Managua. Base congelada: `entregables/experiencia-cuenta-2026-10-21/compilacion`; fuente inspeccionada: `src/casa`. Fixture propia en 5303 con Worker real y PGlite en memoria, `--experiencia --equipo`. No se usó producción ni se modificó la app.

Se ejecutaron Playwright/Edge propios. Todas las observaciones parten de nuevas capturas, lecturas y recorridos; los tests históricos solo sirvieron para localizar contratos y estados. La cuenta sintética tiene membresía activa por otros 20 días y contrato anterior. El rol «cliente» sin membresía se obtuvo interceptando `/api/yo` y `/api/club`, sin fabricar compras. Las escrituras reales del recorrido solo afectaron la fixture local.

## V-01 — El cambio puede estar guardado y el panel no ofrece cómo comprobarlo

- **Tipo / prioridad:** defecto funcional, P2. Es el problema seleccionado para el prototipo.
- **Dónde:** `/reservas`, miembro, diálogo «Cambiar tu visita»; `src/casa/pantallas/MisReservas.tsx`, función `guardar`, y render del diálogo.
- **Reproducción:** crear una reserva a las 12:00; abrir «Cambiar visita», elegir 13:00 y confirmar; dejar que el POST sea procesado por el Worker (200, revisión 2), abortar únicamente su respuesta al navegador. El panel conserva 12:00 como original y el campo elegido en 13:00. «Confirmar cambio» sigue siendo la única continuación principal. Al pulsarlo, el servidor rechaza la versión anterior y dice «La reserva cambió. Actualizá su comprobante antes de continuar».
- **Impacto:** el cliente no puede distinguir un cambio fallido de uno ya aplicado. El botón «Actualizar horarios» no actualiza el comprobante. Debe inferir que hay que cerrar el diálogo y usar «Actualizar reservas» fuera; entonces aparece 13:00. No se observó doble cambio ni doble cobro: la protección de versión funciona, pero la recuperación de interfaz queda incompleta.
- **Frecuencia:** contingencia de red, sin telemetría real para cuantificarla; la gestión de visitas es un recorrido repetible. Se prioriza por certeza del defecto y consecuencia de acudir a una hora equivocada.
- **Recomendación:** estado específico de resultado incierto, referencia conservada, comparación original/cambio y acción «Consultar resultado» que lea el comprobante antes de ofrecer otro envío.
- **Evidencia:** `capturas/modificar-respuesta-perdida.png`, `capturas/modificar-reintento-conflicto.png`, `capturas/modificar-recuperacion-manual.png`; `recorridos.json` contiene el POST 200 y las lecturas. Las tres capturas se abrieron con `view_image`.

## V-02 — La fecha y los horarios llegan tarde en la preparación móvil

- **Tipo / prioridad:** juicio de diseño, P2; no es un fallo de funcionamiento.
- **Dónde:** `/reservar`, visitante y cuenta, 390 px.
- **Reproducción:** abrir el recorrido, elegir zona, continuar a fecha/grupo. A la hora del ensayo (aprox. 20:00 Managua) la fecha inicial «hoy» no tenía franjas para las 2 horas predeterminadas; fue necesario elegir otra fecha. Con disponibilidad, la fecha comenzó en y=610 px y la primera franja en y=1047 px. El flujo tiene tres pantallas: Lugar → Fecha y grupo → Revisión.
- **Impacto:** la persona decide el lugar antes de ver cuándo puede visitarlo. Las utilidades, borrador, mensaje técnico de disponibilidad y cabecera anteceden a la decisión. La ausencia inicial de horas se explica y puede corregirse; no es un callejón sin salida.
- **Recomendación:** reunir fecha/grupo/duración y zona con horarios, mantener revisión separada; proponer una fecha alternativa ante un resultado vacío. No omitir el anticipo VIP para compactar.
- **Evidencia:** `capturas/sondeo-reservar.png`, `capturas/reserva-sin-horario.png`, `capturas/reserva-fecha-grupo.png`, `prototipo-bordes.json` (mediciones nuevas de ambos recorridos). Capturas revisadas visualmente.

## V-03 — El error de un código mantiene un estado de «preparación»

- **Tipo / prioridad:** defecto de comunicación de estado, P3.
- **Dónde:** `/club`, «Mostrar código del café»; `src/casa/componentes/CodigoBeneficio.tsx`.
- **Reproducción:** responder 503 a `/api/beneficios/solicitar`. El diálogo muestra a la vez «Preparando tu código…», el error y «Reintentar código». En una denegación 403 ocurre el mismo patrón. `vale === null` provoca el texto de preparación aunque `ocupado` ya sea falso.
- **Impacto:** el mensaje de estado anuncia una tarea activa que ya terminó con error; existe reintento y este sí recupera un código válido. No se consumió el beneficio al mostrarlo.
- **Recomendación:** distinguir preparando, error y no disponible. Mantener el contexto «mostrar no consume» y el reintento cuando proceda.
- **Evidencia:** `capturas/beneficio-error.png`, `capturas/beneficio-restricted.png`, `capturas/beneficio-retry.png`; `recorridos.json`, `accesibilidad.json`.

## V-04 — La ayuda domina el historial vacío

- **Tipo / prioridad:** juicio de diseño, P3.
- **Dónde:** `/reservas`, estado vacío, 390 px.
- **Reproducción:** cuenta sin reservas. Se muestran título, explicación de refresco cada 30 segundos e inasistencia, «Preparar una visita», «Actualizar reservas», otro título vacío y «Consultar mesas disponibles», seguidos de avisos y formulario completo de ayuda. El documento alcanza 1627 px aun sin reservas.
- **Impacto:** dos llamadas equivalentes compiten y la consulta de soporte ocupa gran parte de la página. La acción útil existe y se reconoce; no es inaccesible.
- **Recomendación:** una llamada principal para preparar visita, ayuda plegable y detalle de actualización solo cuando explique incertidumbre relevante.
- **Evidencia:** `capturas/reservas-empty.png`, `capturas/base-miembro-reservas-390.png`, `baseline.json`.

## V-05 — Las zonas necesitan información verificada para compararse

- **Tipo / prioridad:** oportunidad de contenido, P3; limitada a esta fixture.
- **Dónde:** `/reservar`, selector de zona.
- **Observación:** la fixture tiene descripciones y accesibilidad vacías. La interfaz presenta nombres y anticipo; solo la terraza tiene foto. No se puede inferir la capacidad ni las condiciones físicas reales de Ventanal, Barra, Bistró o VIP a partir de esta evidencia.
- **Recomendación:** completar descripciones verificadas y condiciones de acceso en el inventario real antes de prometerlas. La propuesta conserva «detalles por confirmar» y etiqueta la foto como terraza.
- **Evidencia:** `sondeo.json` → `/api/reservas/configuracion`, `capturas/base-miembro-reservar-913.png` y fuente `Reservar.tsx`.

## Comportamientos que sí se comprobaron

- **100 observaciones de base:** cinco rutas × visitante/cliente/miembro × 320/390/768/913/1440, más texto efectivo 200% de miembro en las cinco rutas y cinco anchos. No se detectó desborde horizontal. Esto no acredita automáticamente la calidad de cada detalle visual.
- **15 análisis axe nuevos:** cinco rutas × tres roles a 390 px; sin infracciones WCAG A/AA detectadas. Se inspeccionaron visualmente capturas y estilos de foco; no se declara conformidad universal.
- **913 con gutter:** gutter estable de 15 px; las cinco rutas conservaron su reflujo. `accesibilidad.json` registra ancho de contenido 898 sobre viewport 913.
- **Teclado:** abrir FAQ con Enter, pestañas de perfil con flechas, Escape y retorno al pase, foco del error de nombre, y captura del siguiente control de cada ruta.
- **Movimiento reducido:** sin animaciones ni transiciones computadas activas en las cinco rutas bajo `prefers-reduced-motion: reduce`.
- **Reserva:** lista vacía, carga/error/reintento, consulta sin horas, revisión, creación con respuesta perdida y recuperación, cambio con respuesta perdida, recuperación manual y cancelación. Visitante conserva su revisión al entrar al acceso y volver.
- **Club:** pase, carga de código, código vigente, error/reintento, código vencido y regeneración, denegación 403, revisión de renovación. En una segunda fixture se completaron contratación, renovación vencida, entrega por caja, reposición y premio del noveno sello, con escrituras reales del Worker local. El vencimiento del código se simuló en la respuesta; no hubo entrega física real.
- **Perfil:** validación enlazada y foco, borrador al cerrar, escritura con respuesta perdida recuperada por lectura, tabs, actividad, ayuda sintética registrada y carga/error/reintento independiente. Una segunda fixture permitió ejecutar conflicto concurrente y conciliación, expiración de sesión y cierre de todos los dispositivos, verificando cero sesiones sin revocar.
- **Cierre de cobertura:** se ensayaron saldo VIP insuficiente y disponibilidad con timestamp vencido 121 segundos. El aviso y el bloqueo de confirmación fueron observables. La matriz final tiene 186 filas: 183 revisadas, 3 no aplicables por ser una página informativa sin escritura y cero pendientes definidos.

## Inventario de superficies y límites

| Ruta | Superficies encontradas en fuente | Cobertura / límite |
|---|---|---|
| `/conoce-tu-club` | Información gratuita/pagada, cinco beneficios, FAQ, enlace de acceso y reservas, carga/error/reintento de condiciones | UI base por roles/ancho, estados y FAQ con teclado revisados. No hay transacción propia. |
| `/club` | Pase, café, bolsa, premio, reposición, recarga, contratación, experiencia, renovación/cancelación, historial, espera VIP condicional, sellos y ayuda | Pase/códigos/renovación revisados. Segunda fixture completa contratación, premio, reposición, entrega y renovación vencida. Las ramas condicionadas a reglas de operación se identifican en fuente; no se atribuye a la fixture su disponibilidad pública real. |
| `/reservar` | Lugar, fecha/grupo/duración, horarios, revisión, acceso visitante, comprobante, resultado incierto, ayuda | Recorrido nuevo completo y recuperación, saldo VIP insuficiente y respuesta de disponibilidad temporalmente vencida. |
| `/reservas` | Lista, vacío/error, comprobante, calendario, cambiar, cancelar, ayuda | Crear→cambiar→cancelar ejecutado; cambio perdido reproducido. Calendario original descargado desde su botón: UID, fecha/hora UTC equivalente a Managua y duración comprobados. Evidencia: [resultado](../base/calendario-original.json), [archivo ICS](../base/calendario-reserva.ics) y [captura](../base/calendario-reserva-390.png). La propuesta también descarga un ICS explícitamente de prueba. |
| `/perfil` | A tu gusto / Tu cuenta / Datos y ayuda, editor, actividad, conciliación, soporte, comunicaciones, sesiones | Validación, recuperación por lectura, soporte, conflicto entre escritores, revocación de todos los dispositivos y acceso expirado ejecutados. |

Las diez filas inicialmente pendientes se cerraron con `cerrar-cobertura.mjs`, nueva fixture del mismo soporte y compilación, y `cierre-cobertura.json`. No se sustituyeron por resultados de tests anteriores. Las rutas privadas del visitante se probaron como acceso restringido, no como contenido autenticado. La descarga de calendario de la app original se verificó posteriormente en una fixture nueva mediante calendario-original.mjs; figura como fila adicional del grupo base en la matriz consolidada. No se importó en un calendario externo. No se reclama cobertura del cartesiano de todos los estados, roles y tamaños, sino resultado y evidencia para cada fila definida.

## Multimedia y procedencia

La terraza procede del activo ya presente `public/images/terraza-atardecer-960.webp`. Se usa para mostrar ese espacio. La foto pequeña del Club (`salon-vip-cafe-ventana-480.webp`) aporta ambiente; no verifica disponibilidad ni una prestación. La auditoría visual no certifica autoría/licencia externa de estos activos. No se inventaron fotografías, dimensiones físicas o características accesibles de las otras zonas. La propuesta identifica sus fechas, horarios, cuenta, comprobantes y resultados como simulaciones locales.
