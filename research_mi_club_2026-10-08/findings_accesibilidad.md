# Mi Club: accesibilidad y experiencia inclusiva

Investigación: 8 de octubre de 2026, America/Managua. Alcance: fuentes actuales de `club-lupita/src/casa`, estilos compartidos, API de interfaz y referencias oficiales W3C. No se modificó la aplicación, no se contrataron productos reales y no se lanzó otro servidor. Se integraron las reproducciones actuales de la investigación principal en Edge 154.0.4258.62, con datos sintéticos, guardadas en `evidencia-ui/resultados-edge.json`. Este documento distingue hechos del código, reproducciones y riesgos todavía pendientes de prueba visual o con tecnología asistiva.

## Diagnóstico

Mi Club tiene una base accesible considerable: HTML semántico, botones nativos, diálogo modal nativo, foco tras cambiar de ruta, enlace de salto, mensajes de error con `role="alert"`, una región viva de confirmación que permanece montada, soporte para reducir movimiento, contraste holgado en los colores principales y controles con altura mínima amplia. No corresponde describir el módulo como inaccesible en su totalidad ni repetir defectos que ya están resueltos.

La debilidad principal está en el recorrido completo: entender la diferencia entre Club gratuito y Mesa Fundadora; descubrir cómo obtener sellos y recuperar un saldo insuficiente; conocer el resultado de una operación; y volver a encontrar ese resultado. La accesibilidad de los componentes por separado no resuelve esas lagunas. También conviene validar de manera dirigida el pase de altura fija al aumentar el texto y el foco al cerrar anticipadamente la confirmación.

## Hallazgos confirmados por código o reproducción

### A01 · P1 · La confirmación de compra desaparece antes de conocerse el resultado

- **Evidencia:** `src/casa/pantallas/Club.tsx:110–118`: `hacer()` ejecuta `setConfirmando(null)` antes de esperar la operación, y `setOcupado(null)` antes de refrescar. Las hojas de compra/renovación reciben `cargando` (`Club.tsx:486–526`), pero se cierran al iniciar. El botón de renovación en la tarjeta (`:237`) no recibe estado ocupado. El fallo se presenta en un único párrafo, después de la tarjeta de membresía (`:294–301`), aunque la operación fallida proceda de una experiencia situada en otra columna o más abajo.
- **Impacto:** el usuario pierde la cantidad y el contexto de lo que confirmó durante la espera; una operación de renovación no conserva un indicador visible en su punto de origen. En una pantalla larga el error puede aparecer lejos de la acción. Una respuesta lenta hace más difícil distinguir «está procesándose», «falló» y «se completó, pero no se pudo actualizar». Afecta especialmente a baja visión, atención, memoria de trabajo y conexiones lentas.
- **Estado de evidencia:** el cierre anticipado, la posición del error y el indicador ausente en renovación están confirmados. La pérdida o restauración incorrecta de foco **de la compra todavía no está reproducida**; el navegador dispone de restauración nativa, pero el disparador puede quedar deshabilitado durante la compra o desaparecer tras convertirse en socio. No se afirma incumplimiento de foco de ese recorrido sin observarlo.
- **Reproducción Edge añadida:** «Compra experiencia durante respuesta pendiente» registra cero diálogos abiertos durante la espera, `aria-busy` en «Apartar butaca» y en el botón de confirmación ya oculto, y solo el anuncio de la cancelación anterior; no hay mensaje de procesamiento en la región viva. La prueba de error de beneficio sí dejó el fallo a la vista (top 313 / bottom 391 dentro de 844 px), por lo que **no se afirma que ese error probado quedó fuera del viewport**. La restauración de foco de la hoja de beneficio se aborda en A08; queda por probar el foco específico de la compra.
- **Mejora:** mantener la hoja con el importe y un estado explícito mientras llega el resultado; escribir errores dentro de la misma hoja; distinguir resultado incierto de rechazo confirmado. Tras éxito, sustituir por confirmación persistente y mover/restaurar el foco a un destino que exista y sea útil. Si se permite cerrar durante espera, conservar una tarjeta de operación pendiente en el módulo y evitar que cerrar signifique cancelar una petición ya enviada.
- **Aceptación:** con API sintética lenta (3–5 s), rechazo e incertidumbre, siempre puede responderse qué se está procesando y qué hacer ahora; NVDA/VoiceOver reciben el estado sin buscarlo; no se anuncia éxito hasta confirmación; la siguiente tabulación parte de un control o encabezado pertinente; nunca del documento sin contexto. Las operaciones no pueden dispararse otra vez accidentalmente mientras están pendientes.
- **Referencia:** [APG: diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) describe entrada, confinamiento y retorno del foco. [WCAG 4.1.3: mensajes de estado](https://w3c.github.io/wcag/understanding/status-messages) requiere que estados comunicados visualmente puedan determinarse programáticamente sin recibir foco. Mantener la hoja abierta es una solución propuesta, no una obligación literal de WCAG.

### A02 · P2 · El éxito anterior permanece como una capa sin cierre

- **Evidencia:** `Club.tsx:65,117,528` mantiene `hecho`; no hay una llamada a `setHecho(null)`, ni al iniciar otra operación ni después. `componentes/Estados.tsx:296–337` dibuja `AvisoFlotante` fijo a `bottom-24`, con una caja `pointer-events-auto`; Club no proporciona `accion` ni cierre.
- **Impacto:** el mensaje anterior persiste hasta abandonar la pantalla o reemplazarlo por otro éxito. Puede coexistir con el fallo de una operación posterior, creando una respuesta contradictoria. En móvil/zoom puede ocupar espacio destinado a leer o actuar. Repetir exactamente el mismo texto no cambia el contenido de la región viva, por lo que no garantiza un nuevo anuncio.
- **Estado de evidencia:** persistencia y ausencia de cierre confirmadas; la obstrucción de un control/foco concreto requiere reproducción. No basta con la existencia de una capa fija para declarar fallo WCAG.
- **Reproducción Edge añadida:** «Cancelación y feedback persistente» registra el cambio de renovación, el mensaje persistente y cero controles para cerrar el aviso. La siguiente compra conserva ese anuncio durante la espera. La caja aún no se ha demostrado obstruyendo un control específico.
- **Mejora:** confirmación junto a la operación con recibo o registro consultable; si se conserva el aviso flotante, permitir descartarlo y limpiar su estado al comenzar otra operación. Separar el identificador de cada resultado del texto para anunciar repeticiones legítimas. No reemplazarlo por un mensaje que desaparezca demasiado pronto para leerlo.
- **Aceptación:** éxito → nueva operación → error no deja simultáneamente el éxito viejo como resultado vigente; todos los controles son visibles y activables al tabular a 320 px; el usuario puede volver a consultar importe, fecha y beneficio/experiencia. Dos éxitos legítimos con idéntico texto producen dos anuncios.
- **Referencias:** [WCAG 4.1.3](https://w3c.github.io/wcag/understanding/status-messages), [WCAG 1.4.10: reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

### A03 · P2 · El saldo insuficiente informa la carencia pero deja sin siguiente paso

- **Evidencia:** `Club.tsx:274–289` deshabilita «Tomar una plaza» e informa cuánto falta; `:415–431` repite el patrón para experiencias. No ofrece saldo actual ni una acción local para conocer cómo recargar. `Superficies.tsx:327–368` sí presenta coste, saldo y remanente dentro de la confirmación, pero el usuario con saldo insuficiente no puede abrirla desde Club.
- **Impacto:** quien todavía desconoce «Cuenta de Casa» puede interpretar la compra como no disponible y debe buscar otra sección. Los botones `disabled` salen del orden de tabulación; un usuario que recorre solo controles no encuentra una alternativa en este punto.
- **Mejora:** panel breve «Saldo disponible C$ X / te faltan C$ Y», con enlace activo «Cómo recargar» o «Ir a mi cuenta». Comunicar si requiere caja física y qué ocurre al volver. Mantener el estado no disponible textual junto al producto.
- **Aceptación:** con saldo cero y parcial, el usuario llega desde Club a instrucciones concretas sin inferir dónde recargar; al volver conserva el contexto de membresía/experiencia; el coste y el déficit se leen con teclado y lector. No habilitar compra sin saldo como falsa solución.
- **Nota normativa:** es una fricción de comprensión y recuperación confirmada, no un fallo WCAG automático por usar `disabled`. El bajo contraste de controles inactivos está exceptuado en [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### A04 · P2 · Las acciones repetidas no llevan el beneficio o experiencia en su nombre

- **Evidencia:** `Club.tsx:321–328` y `:339–346` usan exactamente «Mostrar código». Todas las experiencias usan «Apartar butaca» (`:416–423`). `Fila` imprime título y detalle como hermanos del botón (`Superficies.tsx:156–177`), sin relación `aria-labelledby`/`aria-describedby`.
- **Impacto:** al tabular o usar la lista de botones de un lector, aparecen acciones indistinguibles. El contexto existe en lectura secuencial, pero obliga a retroceder. El problema aumenta con varias experiencias o con control por voz.
- **Mejora:** texto visible específico cuando quepa («Código de mi café», «Código de mi bolsa»); para las experiencias, preservar «Apartar butaca» y añadir el nombre mediante texto oculto o una relación de etiquetado que incluya la etiqueta visible. Asociar también la descripción operativa pertinente.
- **Aceptación:** la lista de controles permite distinguir inequívocamente qué se obtiene y en qué experiencia se reserva; el nombre accesible conserva el texto visible para control por voz; no depende de posición visual.
- **Referencia:** [WCAG 2.4.6: encabezados y etiquetas](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html). Se reporta como mejora de orientación; no se concluye incumplimiento aislado sin evaluar el contexto accesible completo.

### A05 · P2 · Información operativa crítica se expresa de forma vaga o contradictoria

- **Evidencia:** `Club.tsx:247–249` promete «un café por visita», `:335–337` combina ese título con «Ya lo tomaste hoy»/«Disponible hoy». `:314` dice «se retira de 7 a 9», sin mañana/noche. `:221–225` usa «unos días más» en gracia y oculta la fecha en ese estado. `:493` habla de treinta días y las etiquetas de precio dicen `/mes`. La información básica de sellos dice nueve sellos → bebida (`:171–191`), pero no define qué compra/visita genera un sello ni restricciones de la bebida. Los mensajes encadenan oraciones sin puntuación (`:129–131`, `:160–161`, `:246–249`, `:481`, `:518–520`).
- **Impacto:** el usuario necesita conocimientos previos o explicaciones del personal para comprender un beneficio, su frecuencia o vigencia. La falta de puntuación dificulta la lectura rápida y la prosodia de lectores de pantalla. La jerga «tanda», «plaza», «Cuenta de Casa» puede mantenerse como voz de marca, pero requiere una explicación concreta.
- **Mejora:** una regla de negocio explícita por beneficio, sin ambigüedad de visita/día; horarios con a. m./p. m.; fecha exacta de gracia y acción para ponerse al día; periodicidad contractual consistente. Agregar «Cómo gano sellos» y «Qué bebida puedo pedir» sin obligar a salir de la pantalla. Puntuar las frases y separar condición, consecuencia y siguiente paso.
- **Aceptación:** un usuario nuevo puede contestar cuándo gana un sello, cuándo puede tomar su café, qué bebida incluye el premio, dónde/cuándo retira la bolsa, qué se cobra y cuándo termina o se renueva. Las respuestas coinciden con backend y operación de caja. En lectura hablada hay pausas naturales; no hace falta eliminar el voseo.
- **Clasificación:** defecto de claridad y consistencia confirmado en el contenido; las reglas correctas se deben validar con investigación técnica/comercial. No toda redacción ambigua es, por sí sola, un incumplimiento WCAG AA.

### A06 · P3 · El pase combina un botón conmutador con una etiqueta de acción cambiante

- **Evidencia:** `PaseSocio.tsx:24` aplica `aria-pressed={reverso}` y alterna «Ver cómo usarlo»/«Ver identificación». Las caras sí emplean `aria-hidden` correctamente (`:10,17`) y no contienen controles que queden enfocados bajo `aria-hidden`.
- **Impacto:** el nombre anuncia la próxima acción mientras el estado «pulsado» se refiere a la cara actual: «Ver identificación, pulsado» resulta difícil de interpretar. No invalida el uso del pase con teclado, pero añade semántica innecesaria.
- **Mejora:** mantener la etiqueta de acción cambiante y retirar `aria-pressed`, o usar una etiqueta estable y estado consistente. Una alternativa más simple es mostrar siempre la identificación y desplegar instrucciones con `aria-expanded` y `aria-controls`.
- **Aceptación:** lector de pantalla anuncia una sola interpretación de la acción y el estado. Las instrucciones son fáciles de encontrar al activar y la identificación permanece accesible.
- **Referencia:** [APG: patrón de botón](https://www.w3.org/WAI/ARIA/apg/patterns/button/) distingue la etiqueta estable de un toggle de la etiqueta de acción cambiante de un botón ordinario.

### A07 · P3 · El módulo usa distintos nombres según el punto de entrada y navegación de botones

- **Evidencia:** navegación amplia «Mi Club» (`Navegacion.tsx:41`), navegación móvil «Club» (`:23,78–97`), cabecera «Club» (`Club.tsx:167`) y rama sin cuenta «El Club» (`:81`). `index.html:7` mantiene el título general «Club Lupita — La Bella Lupita»; `App.tsx:33–74` cambia historial/ruta/foco sin actualizar título. Navegación de secciones y reserva usan `button` en lugar de enlaces (`Navegacion.tsx:39–45,75–97`).
- **Impacto:** nombres parecidos pero distintos hacen menos predecible localizar la sección; el título del navegador no diferencia esta vista de otras. Los botones de navegación impiden prestaciones convencionales de enlaces, como abrir el destino en otra pestaña o copiarlo.
- **Mejora:** usar «Mi Club» de forma consistente y título «Mi Club · La Bella Lupita»; representar destinos con enlaces reales, conservando navegación cliente, `aria-current` y restauración de foco.
- **Aceptación:** nombre visible, título de página y navegación identifican el mismo destino; un enlace puede abrirse por el menú contextual; navegación atrás/adelante conserva un destino de foco útil.
- **Clasificación:** mejora de predictibilidad, no fallo de teclado confirmado: los botones actuales son nativos y operables.

### A08 · P1 · Cerrar el código de beneficio pierde el punto de foco

- **Reproducción actual:** el recorrido «Generar código no consume beneficio y hay foco modal» de `evidencia-ui/resultados-edge.json` abre el diálogo con foco en «Cerrar», lo cierra con Escape y espera su cierre. La investigación principal comprobó que `document.activeElement` termina en `BODY`; `focusReturn` registra el texto de toda la página en vez del control generador. El beneficio permanece sin consumir, como corresponde.
- **Código relacionado:** `Club.tsx:133–139` solicita el beneficio bajo `hacer()`, que marca el botón ocupado; `Base.tsx:158` lo deshabilita. `Hoja` abre con `showModal()` (`Superficies.tsx:219`) y no conserva una referencia explícita al disparador ni un destino alternativo al cerrar. La secuencia de deshabilitación antes de mostrar la hoja es una explicación probable, todavía no una causa aislada mediante instrumentación.
- **Impacto:** un usuario de teclado o lector pierde su lugar en una página larga y debe localizar otra vez los beneficios. No se puede dar por resuelto el retorno de foco solo por haber adoptado `dialog` nativo.
- **Mejora:** capturar el disparador al activar, antes de deshabilitarlo; después del cierre restaurarlo cuando siga disponible o enfocar el encabezado/estado del beneficio si el control dejó de existir. Separar apertura del código de confirmación de consumo.
- **Aceptación:** abrir/cerrar con Escape y con los botones de la hoja devuelve el foco a «Código de mi bolsa»/«Código de mi café»; tras consumo, devuelve a un encabezado/estado pertinente. Validar NVDA + Edge y VoiceOver + Safari; el registro debe incluir `tagName`, id/nombre y siguiente tabulación.
- **Referencias:** [APG: retorno del foco en diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WCAG 2.4.3: orden del foco](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

### A09 · P2 · Los beneficios utilizables quedan después de una portada extensa

- **Reproducción actual:** con membresía activa, el encabezado «Lo tuyo de este mes» comienza a 1,863 px en 390×844 y a 1,116 px en 1440×960. A 320 px de ancho comienza a 1,922 px; a 1024 px, a 1,696 px. Valores guardados en `evidencia-ui/resultados-edge.json`.
- **Código relacionado:** `Club.tsx:169–193` antepone título editorial, pase de 380/400 px, instrucciones de giro, primer progreso dentro del pase, texto explicativo, sección de premio, segundo progreso y reserva. Los beneficios aparecen desde `:305`.
- **Impacto:** un socio que llega a caja a usar una bebida/bolsa necesita recorrer bastante contenido antes de su acción frecuente. La repetición de sellos añade lectura a quien navega por contenido; no significa fallo WCAG, pero sí un coste de uso comprobable por posición.
- **Mejora:** abrir con estado de membresía y acciones disponibles hoy, seguido de próximo premio; compactar identificación en un pase desplegable o secundario y mostrar una sola representación del progreso. Mantener la oferta de Mesa Fundadora contextual para quien todavía no es socio. La reserva puede quedar como acceso secundario.
- **Aceptación:** en 390×844, un miembro con café/bolsa disponibles encuentra al menos la acción prioritaria sin atravesar la portada completa; teclado y orden DOM siguen la misma prioridad; no se pierde la identidad visual, se reduce su ocupación antes de tareas.

## Riesgos que requieren reproducción

### R01 · Potencial P1/P2 · Reflujo y espaciado en el pase

`base.css:297–303` posiciona ambas caras con `position:absolute; inset:0`; el alto del padre depende de mínimos fijos. `identidad.css:21,45` fija mínimos de 380/400 px. El texto real de las caras no aporta altura natural al padre. Aunque hay `overflow-wrap:anywhere` y el nombre puede partirse, textos amplios, nombre largo, 200% de texto o mayor espaciado pueden invadir el botón siguiente. No se declara fallo hasta documentar el solapamiento.

Validar 320 CSS px, nombre extenso, texto al 200% y, por separado, line-height 1.5, paragraph spacing 2em, letter spacing .12em y word spacing .16em. Deben seguir visibles identificación, sellos, instrucciones y control; no debe haber scroll horizontal de la página. Para remediar un fallo, preferir caras en la misma celda de grid que conserven dimensión natural, o identificación estática con instrucciones expandibles. [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) y [1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing).

La prueba inicial de la investigación principal al 200% de tamaño raíz y 390 px no produjo desborde horizontal. Esta comprobación no escala los numerosos tamaños declarados en px: no basta para dar por aprobado el redimensionamiento real del texto ni el espaciado.

### R02 · Verificación pendiente, sin defecto identificado · Foco con colores forzados

`base.css:78–80` combina `outline-none` y ring de Tailwind. La implementación instalada de Tailwind (`node_modules/tailwindcss/src/corePlugins.js:2460–2463`) traduce `outline-none` a un contorno de 2 px sólido transparente, **no a `outline: none`**; ese fallback puede preservar el foco en colores forzados. No corresponde denunciar pérdida del foco solo porque la presentación normal usa box-shadow. Verificar enlace de salto, navegación, pase, botones y hojas con contraste de Windows activado y registrar el contorno resultante. La [documentación de MDN sobre colores forzados](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors) confirma que se suprimen las sombras y se ajusta el color del outline al sistema.

### R03 · Potencial P2 · Lectura y foco en las hojas de códigos

`Hoja` usa un nombre accesible por título y el primer foco interactivo es «Cerrar panel». Es una opción razonable para mantener el inicio visible; no es automáticamente un defecto. Sin embargo, las hojas de premio/beneficio (`Club.tsx:474–483`) no tienen una descripción breve asociada y el código es texto normal. Validar con NVDA y VoiceOver que al abrir se entiende para qué es el código, su caducidad y la confirmación por personal, y que se puede volver al control que lo generó. Facilitar copiar el código o mostrar su vencimiento real sería una mejora de operación, no un requisito de QR.

## Fortalezas que deben preservarse

| Evidencia actual | Valor y límite |
| --- | --- |
| `index.html:2,5` usa `lang="es-NI"` y viewport sin impedir zoom | Idioma declarado y zoom permitido. |
| `App.tsx:65,136–138` y `Club.tsx:169` | Enlace de salto y foco del contenido tras navegación. Falta probar los casos de compra donde cambia el disparador. |
| `Hoja`, `Superficies.tsx:215–277` | `dialog.showModal()`, nombre por título, Escape, botón de cerrar, fondo inerte nativo y bloqueo de scroll. No sustituir por un div sin gestión modal. |
| `Club.tsx:183,294–301`; `Estados.tsx:308–309` | Errores con alerta y región viva persistente para éxitos. Mejorar alcance/vida del mensaje, no añadir alertas duplicadas. |
| `App.tsx:141`, `EstadoDatos.tsx:8–17` | El estado de cuenta se muestra en el armazón global. Sería incorrecto reportar que Club carece de aviso de cuenta desactualizada porque no lo importa directamente. |
| `EstadoDatos.tsx:19–42` | Catálogo y cupos fallidos tienen mensajes y reintento. |
| `Base.tsx:154–176`; `casa.css:42` | Botones conservan etiqueta al cargar, usan `aria-busy`, se deshabilitan y miden al menos 48 px de alto por CSS final. El mínimo AA WCAG 2.5.8 es 24×24 CSS px sujeto a excepciones; 44×44 pertenece al criterio mejorado, no al mínimo AA. [W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). |
| `Club.tsx:187–191`; `PaseSocio.tsx:14` | Sellos con descripción numérica y estado legible, no solo diferenciación cromática. Hay duplicación del mismo progreso, que puede simplificarse. |
| `base.css:228–239,301–303`; `casa.css:365–366` | Reduce movimiento y evita giro 3D cuando el usuario lo solicita. |
| `ConfirmarCompra`, `Superficies.tsx:327–367` | Revisión explícita antes del cobro y tres cifras: coste, saldo, remanente. Preservar esta prevención de errores al reorganizar. |

## Contraste: medición estática actual

Se calculó luminancia relativa sRGB sobre valores de `tailwind.config.js`; no son mediciones de píxeles renderizados. Los comentarios históricos de componentes hablan de una banda verde y ratios de otro sistema: no deben usarse como evidencia de esta versión.

| Texto / fondo nominal | Ratio |
| --- | ---: |
| `tinta`/`papel` (#53291E / #FBF6EE) | 11.46:1 |
| `tinta-media`/`papel` (#76574B / #FBF6EE) | 6.03:1 |
| `achiote`/`papel` (#942F32 / #FBF6EE) | 7.20:1 |
| `rosa`/`banda` (#F9AFA4 / #53291E) | 6.86:1 |
| `foco`/`papel` (#B60032 / #FBF6EE) | 6.43:1 |
| `contorno`/`papel` | 3.88:1 |
| `filete`/`papel` | 1.62:1 |

Los tres colores principales de texto y el texto rosa sobre banda superan 4.5:1. Un filete decorativo no tiene que llegar a 3:1; sí hay que revisar un borde cuando es el único medio de identificar un control o una parte gráfica necesaria. No se diagnostica fallo general por el ratio del filete. Botón inactivo con texto `tinta-media` sobre `banda`: aproximadamente 1.90:1; es una preocupación de descubrimiento visual, pero está exceptuado de contraste por inactividad. [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Matriz mínima de validación y aceptación

| Escenario sintético | Qué comprobar |
| --- | --- |
| Club gratuito, 0/8 sellos, saldo cero | Qué es gratuito, cómo ganar el siguiente sello, botón/instrucción útil ante saldo insuficiente. |
| Premio disponible / varios premios | Identificar qué se canjea, anuncio al abrir, código legible, volver sin perder premio y error recuperable. |
| Mesa activa con beneficios disponibles/usados | Acciones con nombres específicos, regla por día/mes, diferencias no dependientes de color. |
| Mesa en gracia / renovación cancelada | Fecha exacta, causa y siguiente paso, ninguna afirmación contradictoria. |
| Compra lenta, rechazada, incierta, exitosa | Feedback en contexto, foco estable, nuevo resultado sin éxito viejo, protección contra activación repetida. |
| Catálogo/cuenta/cupos no disponibles o desactualizados | Indicar qué dato falló y qué puede hacerse; reintento accesible y sin salto inexplicable. |
| 320, 360, 768, 1280 CSS px; zoom 400% desde 1280 | Reflujo sin pérdida ni scroll en dos ejes; diálogo y navegación no ocultan el foco. |
| Texto 200%, espaciado WCAG y nombre largo | Pase, títulos, importes y CTA íntegros; no superposición de caras ni salida del botón. |
| Solo teclado, NVDA + Edge/Firefox, VoiceOver + Safari/iOS | Orden coherente, nombres, estados, Escape, confinamiento y retorno de foco; lectura de condiciones. |
| Movimiento reducido y colores forzados | No giro; estado de cara correcto; indicador de foco visible. |

Las suites existentes ya incluyen recorridos de `/club` y axe (`tests/ui.mjs:38–46,87–91`, `tests/perfiles-ui-audit.mjs:115`). Esto acredita intención de cobertura, no un resultado actual de esas suites: aquí no se ejecutaron ni se dieron por aprobadas. La investigación principal sí ejecutó una auditoría actual de Edge sin violaciones axe en los cinco anchos 320, 390, 768, 1024 y 1440 px. Axe no sustituye las comprobaciones de claridad, espaciado, contexto de error o lector real; A08 demuestra por qué no debe traducirse cero violaciones automáticas a «todo accesible».

## Orden recomendado

1. Hacer visibles y recuperables los estados de transacción y el foco (A01–A02, A08), junto con la validación técnica del resultado incierto.
2. Resolver saldo insuficiente, reglas/copy y nombres contextuales (A03–A05); acercar las tareas «usar beneficio / ver premio / administrar membresía» al inicio (A09).
3. Corregir semántica del pase y consistencia de navegación (A06–A07); reducir la duplicación del progreso y los accesos de reserva.
4. Ejecutar la matriz de accesibilidad antes de publicar, resolver R01–R03 si se reproducen y conservar evidencias separadas por navegador/estado.

Se realizaron cinco consultas de búsqueda agrupadas y se abrieron páginas oficiales pertinentes. Las recomendaciones WCAG son criterios de calidad técnica para la auditoría; no constituyen una declaración de conformidad integral ni un dictamen legal.
