# Auditoría de accesibilidad y resiliencia de «Reserva una mesa»

Fecha de referencia: 8 de octubre de 2026, America/Managua. Inspección estática de la ruta activa `club-lupita/src/casa/pantallas/Reservar.tsx` y sus dependencias, incorporando dos reproducciones locales documentadas por el agente principal. Este subagente no abrió navegador, ejecutó suites ni modificó la aplicación. Se distingue evidencia de código de reproducción local; ninguna prueba mutó producción. P1 = corregir antes de confiar en el flujo transaccional; P2 = siguiente ciclo; P3 = mejora de experiencia/aseguramiento.

## Conclusión

La base tiene decisiones correctas: tres pasos, revisión antes del cargo, botones nativos, selección anunciada con `aria-pressed`, paso actual con `aria-current=step`, controles con nombre, foco explícito entre pasos, anuncios del contador y del éxito, errores de envío con `role=alert`, prevención de respuestas antiguas al cambiar de fecha y transporte con tiempo límite. No corresponde calificarla como «inaccesible» ni afirmar conformidad completa. Los riesgos principales son la confirmación sin validar el contrato recibido, la recuperación incompleta frente a indisponibilidad y la pérdida de selección al abandonar el flujo para recargar.

## Hallazgos priorizados

### A01 · P1 · Una respuesta 200 incompleta puede anunciar una mesa que no consta confirmada

- **Evidencia confirmada en código:** `src/casa/datos.tsx:140–160` valida varios contratos, pero `/reserva` y `/ocupacion?...` alcanzan `return true`. `src/casa/http.ts:30–33` solo exige un objeto. `Reservar.tsx:146–164` no verifica `r.datos.reserva` y construye el éxito a partir de la selección local. Un cuerpo `{}` se considera éxito; `cobrado` undefined no añade depósito y `yaEstaba` undefined toma la rama «Mesa apartada».
- **Reproducido en local por el agente principal:** la fixture devolvió POST `/api/reserva` 200 `{}` sin ejecutar la creación en Worker. La base conservó **0 reservas** y la UI mostró «Mesa apartada para sábado, 10 de octubre a 12 p. m.». Véanse [estado del servidor](respuesta-invalida-servidor.json), [árbol accesible](falso-exito-ax.txt) y [captura](falso-exito.jpg). El principal verificó SHA256 idéntico de JS/CSS públicos y locales. Esto no demuestra que producción esté emitiendo respuestas malformadas; demuestra la falsa confirmación ante ese fallo.
- **Impacto:** el cliente puede presentarse esperando una reserva inexistente si un proxy/backend/versionado entrega JSON incorrecto.
- **Solución:** validar un esquema específico de reserva (id, zona, fechas ISO válidas y ordenadas, personas, depósito, cobrado, saldo y `yaEstaba`); mostrar datos canónicos de la respuesta validada. Si el resultado es incierto, conservar el intento y ofrecer consultar mis reservas antes de repetir.
- **Aceptación:** inyectar 200 `{}`, `{reserva:null}`, id vacío, fechas inválidas y tipos incorrectos; ninguno anuncia éxito ni elimina la selección. La respuesta real válida muestra id y datos coincidentes con el servidor. Reintento exacto conserva una única reserva y cargo.
- **Esfuerzo:** medio. Dependencia: contrato acordado cliente/servidor.

### A02 · P2 · Disponibilidad inválida, obsoleta o rechazada no tiene una recuperación coherente

- **Evidencia:** falta de esquema en `datos.tsx:140–160`; `Reservar.tsx:95` guarda `r.datos.ocupacion` sin comprobarlo. Con `{}`, queda undefined: `ocupacion !== null` en 342 permite dibujar slots y `ocupacion?.[zona]?.[tramo] ?? 0` en 118 los toma como libres, pero `listo` en 132 sigue falso. El usuario ve horas seleccionables y un avance apagado. El resultado no incluye comprobación de que `r.datos.dia` sea el día solicitado.
- **Evidencia adicional:** solo se vuelve a pedir ocupación al cambiar de día o tras éxito (99–102, 163), y mediante el reintento cuando hay error (340). Tras un 409 por aforo, 148–150 únicamente fija el texto; conserva la selección y el snapshot que marcaban la hora libre. No hay recarga al volver a la pestaña ni actualización manual de un snapshot exitoso.
- **Solución:** esquema explícito (día, zonas, horas y proporciones finitas dentro de rango), estados diferenciados carga/error/disponible/vacío/desactualizado; ante conflicto volver a consultar y llevar a elegir otra hora conservando grupo y fecha; definir caducidad razonable y recargar al recuperar visibilidad.
- **Aceptación:** respuesta malformada nunca dibuja oferta libre; respuesta vieja de otro día nunca se aplica; 409 actualiza opciones y proporciona una acción concreta; preservar la protección `turnoOcupacion` contra respuestas fuera de orden.
- **Esfuerzo:** medio. Dependencia: política de vigencia de disponibilidad, sin prometer retención de cupo si no existe.

### A03 · P2 · La salida para recargar elimina el borrador de la reserva

- **Evidencia:** zona, día, hora, personas, horas y paso viven solo en `useState` (`Reservar.tsx:66–71`). El CTA «Ver mi cuenta y recargar» navega a `/` (434); `App.tsx:123–130` desmonta Reservar. No existe persistencia ni ruta de retorno. El navegador Atrás cambia rutas con `popstate` (`App.tsx:41–44`); los pasos no están en el historial (`Reservar.tsx:135–138`).
- **Impacto:** el propio remedio al saldo insuficiente obliga a elegir de nuevo. Atrás del navegador desde revisión abandona el módulo en vez de volver al paso anterior. Recarga, expiración de sesión o cierre también pierden el trabajo.
- **Solución:** borrador limitado a la cuenta/sesión, con caducidad, versión y fecha; retorno al paso adecuado después de recarga/autenticación; revalidación de disponibilidad y precio antes de continuar. Valorar estado de historial por paso y distinguir «Volver al paso» de «Salir».
- **Aceptación:** elegir zona, fecha, grupo y duración → ir a recargar → volver conserva selecciones, anuncia recuperación y revalida hora; cambiar de cuenta nunca muestra el borrador ajeno; Atrás/Adelante tienen comportamiento documentado y probado.
- **Esfuerzo:** medio. Dependencia: modalidad real de recarga y política de privacidad del borrador.

### A04 · P2 · Carga, disponibilidad y fallo de consulta no se anuncian como estados

- **Evidencia:** `Reservar.tsx:329–339` contiene texto reactivo «Viendo qué hay libre…», número de horas, vacío o error dentro de un `p` sin `role=status`, `aria-live` ni foco. El botón de reintento aparece tras el error en 340. El pie 412–422 cambia motivo del bloqueo sin asociación `aria-describedby` con el CTA 425–432. Los fallos de envío sí usan `role=alert` (398–404), por lo que no es un defecto general de todos los errores.
- **Impacto:** al seleccionar una fecha con lector de pantalla, es posible no recibir la finalización de consulta ni saber por qué desaparecen horas o se bloquea el avance.
- **Solución:** región de estado estable, breve y `polite` para carga/conteo/selección invalidada; alerta de fallo con acción accesible; descripción vinculada al CTA. Evitar anunciar toda la rejilla cada vez.
- **Aceptación:** NVDA/Edge y VoiceOver/Safari anuncian una sola vez la carga y resultado; el 503 anuncia recuperación; si cambia duración y se elimina hora, se anuncia el motivo. Verificar manualmente, no inferirlo solo de axe.
- **Referencia:** [W3C, mensajes de estado 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
- **Esfuerzo:** pequeño/medio. Sin dependencia operativa.

### A05 · P2 · El nombre accesible contradice el rótulo «Volver»

- **Evidencia directa:** `Reservar.tsx:424` muestra «Volver» y establece `aria-label="Paso anterior"`. El nombre no contiene el texto visible. El botón de cabecera sí tiene «Volver» y es un icono, sin esta contradicción.
- **Caso secundario:** el día actual muestra «hoy» (272), pero su `aria-label` solo contiene fecha larga (261). Otros días usan abreviación y fecha completa; revisar activación por voz para garantizar una etiqueta consistente.
- **Solución:** «Volver al paso anterior» o mantener el nombre visible y añadir descripción; «Hoy, jueves 8 de octubre» para el día actual. Mantener nombres únicos y comprensibles.
- **Aceptación:** el nombre accesible de cada control textual contiene el rótulo visible; ejecutar comandos por voz con «Volver» y «Hoy» selecciona el control esperado.
- **Referencia:** [W3C, etiqueta en el nombre 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name).
- **Esfuerzo:** pequeño. Sin dependencia operativa.

### A06 · P2 · La confirmación persiste como superposición, pero no es un comprobante recuperable

- **Evidencia:** `Reservar.tsx:153–164` fija `hecho`, borra la hora y vuelve al paso 0. `hecho` no se limpia después ni antes de un segundo intento. `Estados.tsx:284–343` no tiene temporizador: el aviso dura mientras el componente esté montado. Es incorrecto afirmar que desaparece automáticamente a los pocos segundos. Está fijo a `bottom-24`, `z-50` y tiene un bloque con `pointer-events-auto` sin cerrar (296–338); la barra de acciones está fija abajo en `Reservar.tsx:410` con z-30.
- **Impacto confirmado por diseño:** se pierde al navegar/recargar y no ofrece ir a la reserva creada; puede coexistir con una reserva nueva y hasta un error posterior. El posible bloqueo visual/de clics debe verificarse en dimensiones concretas, no se afirma aquí reproducido.
- **Solución:** estado final dedicado con zona, día/hora de inicio y fin, personas, depósito realmente cargado, identificador y enlace «Ver mi reserva»/«Crear otra». El segundo intento limpia los mensajes previos. Si se mantiene toast, cierre accesible y colocación fuera de acciones.
- **Aceptación:** éxito es visible y recuperable en Mis reservas; iniciar otra reserva no conserva confirmación anterior; todas las acciones son alcanzables por teclado y clic a 320px y con zoom; recarga muestra estado desde el servidor, sin inventar confirmación local.
- **Esfuerzo:** medio. Dependencia: destino de detalle y política de comprobante.

### A07 · P2 · El vencimiento de una hora se comprueba solo cuando React vuelve a renderizar

- **Evidencia:** `Reservar.tsx:114` calcula Date.now() durante render, sin reloj ni listener de visibilidad. El efecto que elimina la hora (126–130) depende de día/duración/zona/ocupación, no del tiempo. `apartar` (141–146) solo comprueba zona y hora, no revalida la ventana de 30 minutos en el instante de enviar.
- **Impacto:** alguien que permanece en revisión o regresa de una pestaña en segundo plano puede enviar una hora que ya no cumple anticipación. El servidor debe rechazarla; esto es fricción recuperable, no evidencia de aceptación de una reserva inválida. Al cambiar fecha o duración, el mensaje de error anterior tampoco se limpia (solo lo hace un nuevo envío en 144).
- **Solución:** reloj con la granularidad necesaria y refresco al recuperar visibilidad; última validación local antes del envío; explicar el vencimiento y volver al paso de horario conservando resto. Mantener servidor como autoridad.
- **Aceptación:** simular paso de 31 a 29 minutos antes de la hora, pestaña inactiva y medianoche de Managua: la UI invalida y anuncia el cambio antes de POST; no persiste un error corregido por cambios del usuario.
- **Esfuerzo:** pequeño/medio. Dependencia: política compartida de anticipación.

### A08 · P2 reproducido en local · El foco del siguiente paso queda fuera del viewport en móvil pequeño

- **Evidencia:** `cambiarPaso` fuerza scroll a 0 y luego enfoca h2 con `preventScroll:true` (135–138). La foto/aside precede al formulario (173–190). La cascada final de `casa.css:333` deja la imagen móvil en **220px**, más pie y margen; la ficha sin foto tiene min-height 300px (334). No hay `scroll-margin` de `#res-paso`; solo de `#contenido` en `base.css:283`.
- **Reproducido por el agente principal:** con viewport **320×568 aplicado antes de cambiar del primer al segundo paso**, activeElement fue `res-paso`, scrollY=0, rectángulo de foco top **643.69**, bottom **704.16**: enteramente fuera de la pantalla. La barra ocupaba desde y=**456.61** hasta 568. Evidencia: [mediciones](foco-paso2-320.json), [captura](foco-paso2-320.jpg). Una exploración separada de revisión VIP también situó el título fuera de pantalla al reducir tamaño; el caso del cambio de paso es la reproducción concluyente.
- **Reflujo — precisión sobre cascada:** `casa.css:201` deja grupo en una columna de escritorio; 339 usa dos en móvil y 356 vuelve a **una columna a ≤380px**. Por tanto no se sostiene atribuir un overflow a dos columnas a 320px: **el principal no observó desbordamiento horizontal documental a 320px**. Queda ampliar la matriz de zoom nativo/text spacing y alturas, porque la barra de contenido variable convive con un main de espacio inferior fijo `pb-40`, especialmente con el CTA adicional por saldo insuficiente.
- **Solución:** enfocar y desplazar el encabezado del paso a un área visible con margen de barras; reducir o contraer el hero tras paso 1; una columna cuando grupo/contador lo necesiten; espacio inferior acorde a la altura real de acciones. No ocultar funcionalidad para pasar métricas.
- **Aceptación:** recorrido completo a 320 CSS px, 640×450 y móvil horizontal; 200% de texto y 400% zoom nativo; ningún foco totalmente oculto ni contenido esencial inaccesible. Registrar rectángulos/solapamientos, no solo scrollWidth.
- **Referencias:** [W3C, reflujo 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [foco no oculto 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
- **Esfuerzo:** medio. Sin dependencia operativa. La evaluación normativa exacta debe distinguir foco fuera del viewport de un control totalmente tapado por contenido fijo; aquí se confirma el defecto de gestión del foco y orientación, sin atribuir automáticamente todos los supuestos de 2.4.11 al mismo rectángulo.

### A09 · P3 · Orientación del paso y disponibilidad pueden ser más claras

- **Evidencia:** pasos llevan números y `aria-current`, pero h1 sigue «Apartá tu mesa» y h2 no dice «paso 2 de 3» (`Reservar.tsx:169,185–190`). `index.html:7` tiene título único «Club Lupita — La Bella Lupita» y no hay actualizador de document.title en `src/casa`. Las horas no disponibles solo tienen texto tachado y title «Ya pasó»/«Sin mesas» (351–361); el title no es ayuda confiable en táctil o para un botón disabled fuera del orden Tab. «Ya pasó» también se usa cuando la hora aún es futura pero falta menos de media hora.
- **Solución:** nombre del paso y total en encabezado/título; conservar revisión de pasos previos y datos. Separar «sin mesas» de «demasiado pronto para reservar» mediante texto/resumen visible; ofrecer una alternativa disponible. Evitar agregar 14 explicaciones verbosas a la vez.
- **Aceptación:** al entrar y cambiar paso se entiende progreso sin explorar toda la página; el motivo de indisponibilidad no depende de hover; lista de horas conserva nombres simples y selección anunciada.
- **Referencia:** [WAI, formularios de varias páginas](https://www.w3.org/WAI/tutorials/forms/multi-page/). Sus ejemplos orientan la implementación; no toda recomendación es un requisito normativo.
- **Esfuerzo:** pequeño.

### A10 · P2 · La cobertura automatizada no protege los estados que concentran el riesgo

- **Cobertura existente (lectura, no ejecución en esta auditoría):** `tests/ui.mjs:78–86` recorre selección, vuelve atrás dentro del wizard y confirma. `tests/auditoria-ui.mjs:23–46` simula respuesta VIP perdida tras éxito real local, reintenta y comprueba una reserva/un cargo. `tests/auditoria.mjs:55–93` verifica idempotencia y solapamientos de capacidad. Esto es evidencia de intención/código de pruebas, no certificado de que hoy pasen.
- **Cobertura parcial:** `tests/ui.mjs:88–95` ejecuta axe y anchos entrando de nuevo a la ruta, por tanto analiza sobre todo paso 1. `tests/accesibilidad-cliente-perfiles.mjs:187–196` cubre reserva a 640×450 en el paso de zona, sin completar los siguientes. Sus casos de texto 200% (198–220) abarcan modales de saldo/perfil/compra, no reservas. El script reconoce que viewport/deviceScaleFactor no equivale a zoom nativo ni a lector de pantalla (9–21).
- **Integración:** `package.json:scripts.test` no incluye las suites UI; `test:ui` y `test:auditoria:ui` son comandos separados. No se determinó en este trabajo si existe CI externa que los ejecute.
- **Plan mínimo:** flujo completo por teclado; nombre visible/accesible; live regions con NVDA/VoiceOver; JSON malformado de ocupación y POST; 503 y recuperación; respuesta vieja fuera de orden; 409 con snapshot antiguo; ventana de 30 minutos; cambio de zona/duración que invalida hora; borrador al recargar/salir/autenticar; depósito sin saldo; éxito seguido de otro intento; pantalla baja/zoom/text spacing; perdida de respuesta después del commit; cambio de cuenta durante solicitud.
- **Aceptación:** suite transaccional y accesible con fixture local aislado, integración continua documentada y matriz manual con navegador/lector/versiones. axe es una capa complementaria y no certifica conformidad WCAG completa.
- **Esfuerzo:** medio; manual especializado para lectores y dispositivos.

## Contraste y tamaño: datos, no suposiciones

Ratios calculados con fórmula de luminancia sRGB de WCAG sobre los tokens de `tailwind.config.js` actuales. Los comentarios históricos de Base.tsx hablan de verde y ratios que no corresponden a la identidad V3; los colores actuales de banda y tinta son el mismo marrón. No usar esos comentarios como medida.

| Par | Hex | Ratio |
|---|---|---:|
| tinta/banda sobre papel | #53291E / #FBF6EE | 11.457:1 |
| tinta-media sobre papel | #76574B / #FBF6EE | 6.033:1 |
| tinta-media sobre banda-velo | #76574B / #F7E6E0 | 5.363:1 |
| achiote sobre papel | #942F32 / #FBF6EE | 7.198:1 |
| foco sobre papel | #B60032 / #FBF6EE | 6.431:1 |
| rosa sobre banda | #F9AFA4 / #53291E | 6.865:1 |
| contorno sobre papel | #957569 / #FBF6EE | 3.883:1 |
| filete sobre papel | #D7C1A5 / #FBF6EE | 1.618:1 |

Los textos habituales tienen contraste amplio. Filete es débil para contornos significativos; reservar contorno para los límites necesarios mejora identificación. En el select, `base.css:47–51` ya declara `border-color:contorno` mediante `select:not([hidden])`, de mayor especificidad que `.reserva-personas` (que declara filete): verificar estilo computado antes de atribuirle el borde débil. No corresponde declarar automáticamente infracción 1.4.11 en todo botón con filete: W3C admite controles identificados mediante texto/iconos contrastantes sin que su borde delimite obligatoriamente la zona de clic. Los estados disabled tienen excepciones de contraste. [W3C, contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Los botones principales resultan min-height 48px por `casa.css:42`; horas 44px y botones del contador 44×44. A 320px las fechas se reparten en siete columnas y pueden quedar por debajo de 44px de ancho. Esto no demuestra fallo AA: WCAG 2.2 2.5.8 exige 24×24 CSS px o satisfacer sus excepciones; 44×44 pertenece a 2.5.5 AAA. Revisar dimensiones reales y separación, además de comodidad táctil. [W3C, tamaño mínimo del objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Aspectos que conviene preservar

- `lang=es-NI`, sin bloqueo de ampliación en meta viewport.
- Botones HTML, label asociado al select, iconos decorativos aria-hidden, alt contextual y dimensiones de foto.
- Revisión previa al cargo, mantenimiento del estado al usar los botones internos de retroceso.
- Foco deliberado al cambiar de ruta y de paso; mejorarlo visualmente, no eliminarlo.
- Región viva del éxito siempre montada y separada del icono; contador con aria-live/atomic.
- `turnoOcupacion` evita aplicar respuestas de una fecha vieja y contempla desmontaje.
- Transporte compartido con abort de 20 segundos y clasificación `resultadoIncierto`; ya existe una base para mejorar recuperación sin rehacer todo.
- Fuentes autoalojadas, srcset y dimensiones de imagen, preferencia de movimiento reducido.

## Fuentes consultadas

Tres consultas de búsqueda, más apertura de documentos primarios W3C. Las referencias WCAG Understanding son explicaciones informativas de los criterios, no certificaciones de la app ni reemplazo de evaluación humana.

- [WCAG 2.2, norma](https://www.w3.org/TR/WCAG22/)
- [WAI, formularios con pasos](https://www.w3.org/WAI/tutorials/forms/multi-page/)
- [WAI, notificaciones de formularios](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [WCAG 4.1.3, mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.5.3, etiqueta en el nombre](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name)
- [WCAG 1.4.10, reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.4.11, foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [WCAG 1.4.11, contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [WCAG 2.5.8, tamaño mínimo de objetivos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
