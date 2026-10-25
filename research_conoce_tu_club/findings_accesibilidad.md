# Accesibilidad, navegación y comprensión — Conocé tu club

Fecha de referencia: 8 de octubre de 2026, America/Managua. Revisión estática del código vigente, investigación de fuentes primarias W3C/WAI y criterios de prueba. No se usó navegador, lector de pantalla, axe ni se realizaron transacciones en esta subauditoría. Los hallazgos visuales y de interacción requieren las pruebas de la auditoría principal.

## Alcance y rigor

La entrada vigente es `club-lupita/index.html:16` → `src/casa/main.tsx`, que carga `src/casa/App.tsx` y las hojas de `src/casa/estilos`. No se deben atribuir al producto actual comportamientos de `src/app/App.tsx`, `src/styles` o los respaldos históricos.

La invitación no abre una sección informativa independiente: `src/casa/componentes/Navegacion.tsx:47` navega a `/club`, igual que la entrada «Mi Club» de la navegación de escritorio (`:39–41`). `src/casa/App.tsx:127` monta `Club`. Esto define el recorrido que debe evaluarse.

WCAG es el estándar; sus documentos Understanding explican cómo interpretarlo; APG aporta patrones recomendados. Una diferencia con un patrón APG no es, por sí sola, prueba de incumplimiento WCAG. Los comentarios del código que afirman contrastes o cumplimiento tampoco son mediciones vigentes.

## Conclusiones verificables del código

### A1. La misma invitación pierde significado al entrar al Club — prioridad P2

**Evidencia.** «Conocé tu club» siempre ejecuta `alNavegar('/club')` (`Navegacion.tsx:47`). `App.tsx:69` termina inmediatamente si el destino coincide con `window.location.pathname`. La invitación continúa siendo parte de la cabecera de `/club` (`App.tsx:140`), sin una variante que explique el programa ni un ancla a condiciones.

**Diagnóstico.** Es una acción sin efecto en su propio destino. También mezcla dos intenciones: descubrir cómo funciona el programa y administrar beneficios personales. El usuario que busca explicación puede llegar a un panel de sellos, carnet, oferta y experiencias sin una respuesta organizada a «cómo funciona».

**Clasificación normativa.** Defecto funcional/editorial inferido de manera determinista del código; no se declara un incumplimiento WCAG específico por el solo hecho de repetir un destino.

**Recomendación.** Dar a la invitación un destino informativo real, por ejemplo una sección «Cómo funciona el Club», y conservar «Mi Club» como acceso al panel personal. Si se mantiene un solo destino, cambiar el texto por una acción que describa ese destino y retirar la invitación redundante dentro de `/club`.

**Aceptación.** Desde inicio y desde `/club`, la invitación produce una transición perceptible hacia contenido que explica incorporación, sellos, premios y diferencia entre Club gratuito y Mesa Fundadora. Atrás vuelve a una ubicación coherente; el título visible describe el destino.

### A2. Rutas implementadas como botones — prioridad P2

**Evidencia.** Logo, navegación, reserva, invitación y perfil usan `<button>` con `onClick` para cambiar URL (`Navegacion.tsx:34,39,45,47,48,75–78`). Reservar desde Club también usa botones (`Club.tsx:192,465`). No contienen `href`.

**Impacto.** Los destinos no se exponen como enlaces a las listas de enlaces del lector de pantalla y no ofrecen el comportamiento nativo de copiar destino, menú contextual de enlace o apertura en otra pestaña. Los botones nativos sí son operables por teclado; no corresponde afirmar que la navegación es inaccesible al teclado.

**Base.** WAI recomienda enlaces HTML con `href` para referencias a recursos locales o externos, y diferencia las acciones de botones de la navegación. [APG: enlaces](https://www.w3.org/WAI/ARIA/apg/patterns/link/), [APG: botones](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

**Recomendación.** Usar enlaces reales para rutas, manteniendo la mejora SPA sólo para clics primarios sin modificadores. Conservar botones para abrir paneles, mostrar códigos, confirmar, cancelar y girar el pase. Esto no requiere incorporar una librería de routing.

**Aceptación.** El destino es visible al enfocar o inspeccionar el enlace; Enter navega; Ctrl/Cmd+clic y menú contextual conservan funcionamiento nativo; `aria-current="page"` sigue identificando el destino actual. No agregar roles de pestaña a una navegación entre páginas.

### A3. La invitación desaparece según tamaño de ventana — prioridad P2 de descubrimiento

**Evidencia.** `estilos/casa.css:235` oculta `.casa-nav-final` a ≤899 px de ancho; `:371` oculta `.casa-nav-invitacion` a ≥900 px de ancho y ≤820 px de alto. Esta última regla cubre muchas ventanas de portátil. La ruta Club sigue presente en la navegación móvil (`Navegacion.tsx:20–25,69–104`).

**Impacto.** El texto de descubrimiento «Conocé tu club» no tiene una alternativa equivalente explícita en dispositivos pequeños, aunque se conserve el acceso funcional a Club. Una campaña o instrucción que pida pulsar ese texto no funcionará para toda la audiencia.

**Clasificación.** Disparidad editorial y de descubrimiento confirmada en CSS, no pérdida probada de funcionalidad ni incumplimiento automático de reflow. Ocultar una entrada duplicada puede ser correcto si la misma información y acción siguen disponibles.

**Aceptación.** La explicación del programa se encuentra desde móvil y portátil sin depender del panel lateral. Validar 320, 390, 768, 900, 1024 y 1440 px de ancho y alturas 650, 800 y 900 px, así como zoom 200/400%. La condición de diseño debe basarse en utilidad y espacio, no en que la explicación desaparezca por completo.

### A4. Existe gestión de foco; falta una señal más específica de destino — prioridad P2

**Evidencia positiva.** `App.tsx:60–66` enfoca `#contenido` después de cada cambio de ruta. `Club.tsx:168` ofrece `main` con `tabIndex={-1}`. `App.tsx:136–138` incluye «Ir al contenido». Es incorrecto afirmar que la SPA nunca mueve foco.

**Limitación.** El `h1` «Club» está en la cabecera anterior al `main` (`Club.tsx:166`; `Navegacion.tsx:206–208`) y no etiqueta el destino de foco. El primer encabezado dentro del contenido es «El gusto de volver» (`Club.tsx:173`), descriptivo de tono pero poco específico de tarea. Además, el único `<title>` encontrado es «Club Lupita — La Bella Lupita» (`index.html:7`), sin actualización por ruta en `src`.

**Base.** WCAG 2.4.3 requiere una secuencia que conserve significado y operación, no un único destino obligatorio de foco. La orientación SPA mejora al actualizar títulos. El nombre de la aplicación puede describir su propósito; no se declara aquí un fallo automático 2.4.2 porque el título existente es válido en términos generales. [WCAG: orden de foco](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [WCAG: título de página](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html).

**Recomendación.** Definir títulos por ruta; por ejemplo «Mi Club | La Bella Lupita» y «Cómo funciona el Club | La Bella Lupita». Hacer que el encabezado principal de la vista o el main etiquetado sea el destino lógico tras la navegación. Mantener el foco del primer montaje sin movimientos innecesarios.

**Aceptación.** Con teclado y NVDA/VoiceOver se anuncia el contexto nuevo una sola vez y Tab continúa desde el comienzo útil de la vista. Probar ida, atrás, adelante, carga directa y sesión recuperada tras carga. No usar `aria-live` indiscriminadamente en toda la página para compensar la navegación.

### A5. El pase combina un toggle con etiquetas cambiantes — prioridad P3

**Evidencia.** `PaseSocio.tsx:24` alterna el nombre «Ver cómo usarlo»/«Ver identificación» y simultáneamente usa `aria-pressed={reverso}`. Las caras sí se ocultan correctamente del árbol accesible con `aria-hidden` (`:11,17`); no tienen descendientes interactivos ocultos.

**Diagnóstico.** APG recomienda mantener estable el nombre de un toggle con `aria-pressed`. Si el nombre describe una acción opuesta en cada estado, suele ser más claro un botón de acción normal. No equivale a declarar por sí solo fallo de nombre/rol/valor. [APG: botón](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

**Recomendación.** Preferir instrucciones visibles «Cómo usar tu pase» o un disclosure simple. Si es disclosure, usar botón con `aria-expanded` y un contenido asociado; `aria-controls` puede añadirse. Si se conserva la tarjeta reversible, elegir semántica consistente entre nombre estable de toggle o nombre de acción cambiante sin `aria-pressed`. [APG: disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

**Aceptación.** Enter/Espacio muestran y ocultan la explicación, el estado anunciado coincide con lo visible, el foco permanece en un lugar predecible y sólo una cara aporta texto al lector. La explicación debería indicar qué presenta la persona, qué registra el personal y cómo se confirma el resultado; hoy el reverso indica principalmente volver al frente (`PaseSocio.tsx:18–20`).

### A6. Contenido de altura variable dentro de caras absolutas — riesgo P2, pendiente de prueba

**Evidencia.** `.pase-cara` usa `position:absolute; inset:0` y `.pase-cuerpo` una altura mínima (`base.css:297–300`). El pase de Club fija mínimos de 380 y 400 px (`identidad.css:21,45`). El contenido incluye nombre, identificación, rótulos, retrato y sellos; las caras absolutas no aumentan por sí mismas la altura del contenedor.

**Riesgo.** Texto aumentado, nombre largo, cambios de interlineado o traducción pueden desbordar el pase o superponerse con «Ver cómo usarlo». El uso de dos columnas cambia a una en móvil, lo cual es favorable (`ClubReserva.css:49–54`). No se confirma desbordamiento sin medidas reales.

**Base y aceptación.** Probar texto a 200%, reflow de 320 CSS px y espaciado personalizado sin pérdida de información o controles. Para contenido vertical, WCAG 1.4.10 utiliza 320 CSS px como referencia y permite excepciones específicas, no generales para tarjetas. Usar altura intrínseca o un esquema de superposición cuya altura responda a la cara visible. [WCAG: reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

### A7. Nombres de controles y razones de bloqueo requieren contexto — prioridad P3

**Evidencia.** Los beneficios de bolsa y bebida usan el mismo texto de acción «Mostrar código» (`Club.tsx:327,345`). Las compras de experiencias repiten «Apartar butaca» (`:423`). Los botones de compra se deshabilitan por saldo y la explicación aparece en un párrafo próximo (`:278,283–287,420,425–428`) sin asociación mediante `aria-describedby`.

**Impacto.** Navegar sólo la lista de botones puede perder la referencia del beneficio o evento, y el botón nativamente deshabilitado sale de la secuencia Tab. El texto contextual visible sí existe; no afirmar ausencia total de explicación o fallo WCAG automático.

**Recomendación.** Nombres que incluyan destino/objeto («Mostrar código de mi bolsa», «Mostrar código de mi bebida», «Apartar butaca para…») y razón de indisponibilidad asociada. Mantener el texto visible dentro del nombre accesible. Añadir un camino claro hacia cómo conseguir saldo si la compra es la tarea buscada.

**Aceptación.** Cada control se distingue fuera de contexto visual; el lector anuncia el beneficio o evento y su disponibilidad; hay una explicación accesible junto al estado bloqueado. No habilitar controles que permitan una operación inválida sólo para hacerlos tabulables.

### A8. Modal transaccional con buenas bases; revisar salida y persistencia del resultado — prioridad P2 de validación

**Evidencia positiva.** `Hoja` usa `<dialog>` y `showModal()` (`Superficies.tsx:216–221,235`), se etiqueta con el título (`:237,282`), ofrece cerrar (`:277`) y responde a Escape vía `onCancel` (`:239–243`). La confirmación presenta precio, saldo y resultado (`:332–355`) y un botón con el importe (`:365`). Esto favorece prevención de errores en transacciones. [WCAG: prevención de errores financieros](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html).

**Riesgo de foco.** `Club.tsx:110–118` cierra la confirmación antes de esperar la respuesta; el botón originador puede quedar deshabilitado durante la operación o desaparecer tras la incorporación. La restauración nativa de foco puede necesitar una alternativa explícita cuando desaparece el activador. La apertura inicial del diálogo apunta de forma nativa al primer control, que es cerrar; esto no es incorrecto y puede ser prudente para una compra. Para contenido extenso, evaluar foco en título o comienzo. [APG: diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**Riesgo de superposición.** El éxito establece `hecho` sin restablecerlo en `Club.tsx`, y `AvisoFlotante` permanece fijo mientras exista (`Club.tsx:117,527`; `Estados.tsx:296,311`). No hay aquí botón para descartarlo. Puede tapar contenido al avanzar con teclado; falta reproducción. La región viva permanece montada (`Estados.tsx:308–309`), una buena base para anunciar resultados. [WCAG: mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

**Aceptación.** Abrir y cancelar no generan compra. Tab y Shift+Tab quedan dentro del modal y Escape funciona. Al cerrar, el foco vuelve al control de origen o a la confirmación/beneficios si cambió la vista. Probar error, demora y éxito en entorno controlado. Ningún control enfocado queda totalmente oculto por avisos o navegación fija; conservar el resultado en un lugar consultable y ofrecer descartar el aviso. [WCAG: foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

## Aspectos que deben conservarse y verificarse

- Idioma `es-NI` en `index.html:2`; controles nativos; iconos decorativos ocultos al lector (`Base.tsx:52–54`).
- Sellos con equivalente textual («x de 9») y cifras decorativas ocultas (`Club.tsx:186–190`); el avance no depende solamente del color.
- Alertas de fallos con `role="alert"` (`Club.tsx:183,296`) y resultado en región viva persistente.
- Objetivos táctiles explícitos: invitación min-height 44 px (`casa.css:27`), navegación de escritorio 49 px (`:15`), navegación móvil 56 px (`Navegacion.tsx:81`), botón base 44 px (`Base.tsx:160`) y regla visual 48 px (`casa.css:42`). El mínimo de WCAG 2.5.8 AA es 24×24 CSS px con excepciones; 44×44 es un objetivo más amplio, no el mínimo AA. Medir el ancho y área efectiva antes de afirmar cumplimiento. [WCAG: tamaño mínimo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Foco visible con anillo de dos tonos (`base.css:78–80`) y movimiento reducido (`:228–236,301–304`; `casa.css:365–368`). Verificar contraste de los colores computados y que el anillo no quede recortado; `outline:none` acompañado de un indicador equivalente no es un fallo por sí solo.
- Contraste: medir cada par computado, incluidas opacidades y estados. WCAG 1.4.3 exige 4.5:1 para texto normal y 3:1 para texto grande; logos e interfaz inactiva tienen excepciones. No declarar que texto de 12 px incumple sólo por su tamaño, ni que toda línea divisoria necesita 3:1. [WCAG: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Propuesta de explicación accesible

Un bloque breve y visible con encabezado claro: «Así funciona tu Club», seguido de «Tu cuenta gratuita», «Cómo ganás sellos», «Cómo usás un premio» y «Qué incluye la Mesa Fundadora». Las reglas esenciales deben estar visibles antes de incorporarse o pagar. Un disclosure sirve para detalles adicionales y preguntas frecuentes, no para esconder el precio, la renovación o restricciones centrales.

La explicación debe usar frases cortas y puntuación completa. Ejemplos vigentes como «El Club es gratis y ya lo tenés Esto es lo otro» (`Club.tsx:248`) o «Se cobra el primer mes de tu Cuenta de Casa Se corta cuando querás» (`:285`) confunden las fronteras de las oraciones en lectura visual y por voz. Es un problema editorial observado, no una conclusión automática de conformidad WCAG.

## Matriz mínima de aceptación de la auditoría principal

| Escenario | Resultado esperado | Evidencia necesaria |
|---|---|---|
| Invitación desde inicio y desde Club | Destino informativo reconocible, sin acción vacía | URL, título, foco y captura antes/después |
| Navegación sólo con teclado | Orden lógico y foco visible | Tab/Shift+Tab/Enter/Espacio/atrás |
| Lector de pantalla | Título y destino identificables, controles distinguibles | NVDA + navegador compatible; VoiceOver en móvil si disponible |
| 320 CSS px / 400% zoom | Información y funciones sin desplazamiento bidimensional innecesario | Medidas de desbordamiento y capturas |
| Texto 200% y nombres largos | Pase y acciones sin superposición | Casos de nombre largo, interlineado y espaciado |
| Ventana de 800 px de alto | Acceso claro a la explicación aunque se oculte la tarjeta | Comparación 900/800/650 px |
| Dialog de afiliación | Revisión y cancelación antes del cobro | No confirmar operaciones reales |
| Éxito/error simulado | Estado anunciado, foco útil y contenido no tapado | Prueba con fixtures o entorno controlado |
| Movimiento reducido | Sin giro animado innecesario, cara correcta legible | Preferencia del SO/navegador |
| Contraste y objetivos | Razones medidas, excepciones justificadas | Estilos computados y cajas reales |

Esta subauditoría identifica problemas confirmados de arquitectura/semántica, riesgos y criterios verificables. No certifica conformidad WCAG ni documenta un incumplimiento visual que no haya sido medido.
