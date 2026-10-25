# Carta: investigación UX y accesibilidad

Fecha de revisión: 8 de octubre de 2026 (America/Managua). Subinvestigación para la auditoría integral. Este subagente solo leyó código y fuentes públicas; no envió pedidos ni modificó código funcional. Se realizaron cuatro búsquedas web y se abrieron fuentes primarias W3C y NN/g. Actualizado con las mediciones del agente principal registradas en `evidencia/runtime.json`: fixture local PGlite, build actual, sin escrituras remotas.

## Alcance y niveles de evidencia

Se revisaron `club-lupita/src/casa/pantallas/Pedir.tsx`, `DetalleCarta.tsx`, `Carta.css`, componentes `Datos.tsx`, `Superficies.tsx`, `Base.tsx`, `EstadoDatos.tsx`, `Estados.tsx`, `pedido.tsx`, `carta.ts`, `data/menu.ts`, estilos y el contrato de cantidades del servidor. Las rutas que siguen son relativas a la raíz del proyecto compartido.

**Confirmado estático** significa que el comportamiento se deriva directamente del código leído, no que se haya usado un lector de pantalla o probado la versión publicada. **Confirmado runtime** indica reproducción documentada por el agente principal. **Hipótesis de UX** necesita pruebas con personas u otras verificaciones señaladas. P1: puede producir una compra ambigua o equivocada; P2: impide o dificulta tareas de parte del público; P3: mejora editorial o de eficiencia. No se declara conformidad WCAG de toda la aplicación a partir de esta revisión.

## Hallazgos priorizados

### UX-01 — P1 — Las elecciones prometidas por los platos no forman parte del pedido

**Confirmado estático, confianza alta.** `src/data/menu.ts:99` ofrece Ensalada Lupita con camarón, pollo o res. `:108` y `:111` ofrecen huevo al gusto; `:79` pide decir si el agua se quiere fría o al tiempo. Sin embargo, `src/casa/pantallas/DetalleCarta.tsx:61–66` solo presenta descripción, perfil, cantidad y agregar. `src/casa/pedido.tsx:27` define una línea exclusivamente como `{id, cuanto}` y `src/casa/datos.tsx:213–216` envía ese contrato.

**Impacto:** no hay forma de comunicar esas elecciones mediante Carta; cocina recibe un pedido incompleto según la propia descripción. No se afirma que haya ocurrido un error real en cocina: podría existir una conversación presencial posterior, pero ese requisito no queda integrado en el pedido.

**Corroboración runtime:** `detail-and-focus` en `evidencia/runtime.json` registra la descripción con las tres proteínas y cero campos de selección en la ficha de Ensalada Lupita.

**Recomendación:** validar con cocina qué opciones son obligatorias, sus valores por defecto y posibles recargos. Incorporar modificadores estructurados a ficha, resumen y contrato de servidor. El botón de agregar rápido debe abrir las opciones cuando falte una selección obligatoria. Evitar que dos configuraciones del mismo plato se fusionen en una sola línea.

**Aceptación:** dos Ensaladas Lupita con proteínas distintas aparecen como líneas distinguibles, conservan su elección al reabrir el pedido y llegan completas a operación; no es posible confirmar un plato sin una opción exigida por cocina. Si el negocio decide resolver opciones en barra, comunicarlo expresamente antes de cobrar. Esta recomendación aplica la correspondencia entre interfaz y tarea real y la prevención de errores descritas por [NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/).

### UX-02 — P2 — Los límites aparecen después de preparar el pedido

**Confirmado estático, confianza alta.** `DetalleCarta.tsx:65` aumenta sin máximo; `pedido.tsx:99–110` tampoco limita. El servidor rechaza más de 20 unidades por línea (`src/worker/index.ts:757–758`) y más de 40 líneas (`:749`). El mensaje del primer caso es «La cantidad de [plato] no nos cuadra», sin indicar el máximo.

**Impacto:** se puede ver y aceptar visualmente un precio para 21 unidades que el servidor nunca admitirá. El fallo llega después del esfuerzo de selección.

**Confirmado runtime:** `quantity-21` registra 21 Latte, total C$ 1,995 y respuesta «La cantidad de Latte no nos cuadra.» en la fixture local. El borrador conserva las 21 unidades después del rechazo.

**Recomendación:** compartir límites entre cliente y servidor; considerar cantidad ya presente al agregar desde ficha; mostrar un límite comprensible y una salida comercial para pedidos grandes. Mantener la validación del servidor.

**Aceptación:** al llevar 20 unidades, todas las superficies impiden añadir la 21.ª y explican el límite; abrir la ficha de un plato con 19 unidades permite sumar como máximo una. El error del servidor identifica cómo resolverlo. Probar la preparación local sin ejecutar el cobro.

### UX-03 — P2 — El resultado de la búsqueda no se anuncia

**Confirmado estático, confianza alta.** El texto «N resultados en toda la carta» de `Pedir.tsx:175` es un párrafo sin `role="status"` ni región viva. Cambia mientras el foco permanece en el buscador. La lista resultante puede leerse manualmente, pero su mensaje de estado no tiene semántica de anuncio.

**Impacto:** alguien que usa lector de pantalla puede escribir y desconocer si encontró cero o varios platos. WCAG 2.2, [4.1.3 Mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), cita expresamente los conteos de búsqueda como mensajes que deben ser determinables programáticamente cuando no reciben foco.

**Recomendación:** una región `role="status"` estable con anuncios breves, sin mover el foco y con una pausa corta para evitar anunciar cada pulsación. Anunciar también cero resultados y la recuperación al limpiar.

**Aceptación:** con NVDA o VoiceOver se anuncia el conteo una vez al terminar de escribir; el foco continúa en el campo y no se recita toda la lista. La revisión de DOM verifica la semántica; una prueba real verifica el anuncio.

### UX-04 — P2 — Agregar cambia un «+» por un número sin comunicar bien el nuevo estado

**Confirmado estático; confusión visual probable.** En `Pedir.tsx:179` el botón muestra primero `+` y luego la cantidad, pero el nombre accesible permanece «Agregar [plato] al pedido». El número queda sustituido en el nombre accesible por ese `aria-label`; ni él ni la barra de pedido son regiones vivas. En el carrito, cantidad, subtotal y total (`:242–265`) tampoco anuncian sus cambios. La ficha sí utiliza `<output aria-live="polite">` (`DetalleCarta.tsx:65`).

**Impacto:** falta confirmación audible de agregado y de cuánto se lleva. Visualmente, pulsar «2» sigue sumando; podría interpretarse como un selector de cantidad. Este último efecto requiere prueba de usabilidad. [WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) sustenta la comunicación de resultados de acciones; no exige volver viva toda la pantalla.

**Recomendación:** conservar una señal de acción, por ejemplo `2 +`, o utilizar un control explícito `− 2 +`; nombrarlo con acción, producto y cantidad actual. Anunciar una frase corta de confirmación con producto, cantidad y total. En carrito, dar contexto al resultado sin mensajes duplicados.

**Aceptación:** luego de tres pulsaciones se puede identificar visual y auditivamente qué se añadió, cuántas unidades hay y cuál es el total. Verificar que el texto visible relevante esté incluido en el nombre accesible conforme a [2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html); el análisis estático por sí solo no califica esta última relación como incumplimiento.

### UX-05 — P2 — La búsqueda no aprovecha sinónimos ya presentes en el catálogo

**Confirmado estático, confianza alta.** `Pedir.tsx:69–75` busca una cadena completa solo en nombre y descripción; ignora `etiquetas`, `fruta`, categoría e identificador. `src/data/menu.ts:77` tiene Limonada de Calala con `fruta: "Maracuyá"`, pero ni nombre ni descripción contienen «maracuyá». Esa consulta no encuentra el producto existente. La normalización de capuchino es una excepción codificada individualmente.

**Confirmado runtime:** `search-behaviour` registra cero resultados para «maracuyá» y uno para «calala». El agente principal corroboró además la primera consulta en la interfaz publicada mediante CUA.

**Recomendación:** un índice pequeño con términos equivalentes aprobados (calala/maracuyá, variedades de escritura y nombres comerciales), etiquetas y variantes; coincidencia por tokens y orden de relevancia sencillo. No hacen falta búsquedas remotas ni IA para 73 artículos. Evaluar las consultas reales antes de introducir tolerancia amplia a errores.

**Aceptación:** `calala`, `maracuya` y `maracuyá` encuentran la misma limonada; se preservan búsquedas sin tildes y las variantes existentes de cappuccino. Medir búsquedas sin resultado y selección posterior sin registrar texto personal innecesario.

### UX-06 — P3 — La búsqueda y su salida de recuperación informan un alcance falso

**Confirmado estático, confianza alta.** `Pedir.tsx:69–73` usa `busca.trim()` para decidir si buscar globalmente, pero `:175` y `:181` usan la cadena original. Con espacios, la lista sigue limitada al momento seleccionado, mientras el contador dice «resultados en toda la carta» y cambia el tratamiento de categorías.

**Confirmado runtime:** `search-behaviour` registra «24 resultados en toda la carta» con tres espacios y los 24 productos de Café. El botón «Ver toda la carta» tras cero resultados también devuelve solo el momento Café: su manejador (`Pedir.tsx:176`) limpia la búsqueda, pero no selecciona un estado global.

**Recomendación y aceptación:** derivar un único estado `hayConsulta` de la consulta normalizada y reutilizarlo para búsqueda, texto, categorías y selección visible. `""`, `" "` y `"   "` producen el mismo estado de exploración. Hacer que «Ver toda la carta» muestre todos los productos o renombrar la acción para describir el resultado real, por ejemplo «Limpiar búsqueda».

### UX-07 — P2 por verificar — Quitar productos puede dejar el foco sin destino lógico

**Riesgo del código, confianza media; requiere navegador.** Quitar la última unidad desmonta su fila (`pedido.tsx:114–117`; `Pedir.tsx:233–258`). Vaciar desmonta los botones de operación y la barra que abrió el diálogo (`Pedir.tsx:190`, `:217–219`, `:290`). `Hoja` usa el retorno de foco nativo pero no define un destino alternativo cuando el disparador desaparece (`Superficies.tsx:216–221`).

**Prueba necesaria:** abrir con teclado, eliminar una fila intermedia, eliminar la última, vaciar y cerrar. Registrar `document.activeElement` y el siguiente Tab. La pérdida del elemento no basta por sí misma para afirmar un fallo WCAG; importa el flujo resultante.

**Evidencia parcial:** `detail-and-focus` registra `BODY` al comprobar el retorno de foco tras una ficha. El agente principal indicó que hace falta estabilizar la prueba para separar un defecto del retorno de foco de un problema del procedimiento. Se mantiene como pendiente; no se presenta como incumplimiento confirmado.

**Recomendación:** al quitar una fila, enfocar el siguiente control lógico; con pedido vacío, enfocar el encabezado/acción de estado vacío; al cerrar y faltar el disparador, volver a un destino estable de Carta. El patrón [APG de diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) recomienda retornar al invocador o a un elemento coherente cuando ya no existe.

### UX-08 — P2 — El destacado separa búsqueda y resultados; el orden cambia en tamaños intermedios

**Confirmado runtime; efecto sobre usuarios por medir.** `src/casa/estilos/casa.css:311–318` sobrescribe las reglas de `Carta.css`: en móvil el orden efectivo es título, buscador, categorías, destacado y resultados. Por tanto, el buscador móvil sí está antes del destacado. Sin embargo, la fotografía y su pie interrumpen la relación espacial entre campo y resultados. En el intervalo 900–1120 px, `casa.css:215–224` convierte la composición a una columna y elimina las posiciones de rejilla; a 1024 px el destacado queda antes del título/buscador.

Mediciones de `evidencia/runtime.json` (coordenadas Y en CSS px, tomadas en exploración inicial):

| Ancho | Buscador Y | Primer producto Y | Separación entre comienzos |
|---|---:|---:|---:|
| 320 | 309 | 972 | 663 |
| 390 | 255 | 954 | 699 |
| 768 | 267 | 1,271 | 1,003 |
| 1024 | 920 | 1,079 | 159 |
| 1440 | 194 | 353 | 159 |

La separación incluye los elementos intermedios y sus espacios; no representa únicamente el alto de la fotografía. En 1024 px el problema ocurre antes del campo, cuyo comienzo está a Y≈920. `Pedir.tsx:158–175` conserva el destacado aun al buscar, aunque su plato no coincida con la consulta. Las categorías posteriores a la primera se cierran por defecto (`:181`).

**Impacto probable:** buscar y reconocer la respuesta requiere más desplazamiento en móvil/tablet; en tamaños intermedios cuesta llegar incluso al campo. No constituye por sí mismo una infracción WCAG ni demuestra pérdida de conversión.

**Recomendación:** conservar título/búsqueda al principio en todos los anchos; usar un destacado compacto o situarlo fuera de la secuencia campo-resultados, especialmente con consulta activa. Revisar la cascada de estilos y los puntos de corte como un único sistema. Mantener identidad visual y medir si la selección editorial aumenta descubrimiento real.

**Aceptación:** los resultados comienzan inmediatamente después de sus controles/filtros durante búsqueda; título y campo preceden al destacado en 320, 390, 768 y 1024 px; escritorio conserva su lectura clara. Medir tiempo hasta primer producto, éxito de búsqueda y descubrimiento de categorías plegadas. [NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/) sustenta la visibilidad de opciones y la reducción de información que compite con la tarea, pero no prescribe este diseño concreto.

### UX-09 — P3 — El tratamiento editorial elimina pausas entre oraciones

**Confirmado estático, impacto editorial.** `src/casa/carta.ts:5–7` elimina todo punto seguido de espacio o fin de texto. Por ejemplo, varias descripciones originales tienen dos oraciones que se convierten en una secuencia sin separación. El pie de cobro de `Pedir.tsx:294–296` también junta tres ideas sin puntuación.

**Recomendación:** si se desea una estética sin punto final, eliminar solo el último; conservar pausas internas o separar las ideas en frases/bloques. Reescribir la confirmación con importe, momento del cobro y siguiente paso inequívocos. No se afirma que la falta de puntuación viole automáticamente WCAG.

**Aceptación:** textos con varias oraciones conservan separación legible; la lectura en voz alta deja claras las condiciones de cobro y seguimiento. Si la ausencia de puntuación es una decisión de marca, validar su comprensión antes de extenderla al texto transaccional.

### UX-10 — P3 — Oportunidades de claridad del precio y elección informada

**Hechos:** la ficha solo muestra el importe multiplicado dentro de Agregar (`DetalleCarta.tsx:66`); el precio unitario reaparece en carrito (`Pedir.tsx:228–229`). El botón final no incluye el importe (`:288`), aunque el total sí está antes (`:262–269`). El tipo de plato no contiene disponibilidad, tamaño/porción, modificadores ni alérgenos estructurados (`src/data/menu.ts:6–22`).

**Mejoras propuestas:** precio unitario y subtotal diferenciados en ficha; «Pagar C$ X con la Cuenta de Casa» y saldo resultante si simplifica comprensión; confirmar con el negocio qué incluye cada precio y si existen recargos. Incorporar porción y opciones útiles donde sean determinantes. Si se ofrece información alimentaria, debe proceder de cocina y tener responsable de actualización; no inferir ausencia de alérgenos a partir de la descripción.

Estas son propuestas de producto, no requisitos legales diagnosticados. No recomendar filtros alimentarios hasta que los datos puedan sostener su significado.

## Verificaciones de accesibilidad pendientes en navegador

1. **Reflow:** runtime registra `scrollWidth` igual al viewport en 320, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal global en esas vistas. Completar zoom 400 % desde 1280 px, texto al 200 %, nombres largos y acciones del carrito/ficha. [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) exige conservar información y funciones sin desplazamiento en dos dimensiones para el contenido al que aplica.
2. **Foco cubierto:** navegar por toda la lista con pedido presente. La barra es fija (`Pedir.tsx:191`, `Carta.css:50`) y el margen inferior global no demuestra que cada elemento enfocado quede visible. [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) exige que el componente enfocado no esté totalmente tapado por contenido creado por el autor.
3. **Diálogos:** Tab/Shift+Tab, Escape, cierre por botón y clic fuera; apertura desde destacado y lista; cierre durante animación, reducción de movimiento y pedido vacío. El uso de `<dialog>.showModal()` ofrece una base adecuada, pero debe comprobarse en navegadores objetivo. [APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
4. **Secuencia:** el DOM empieza con categorías y destacado antes del h1; escritorio los redistribuye en columnas (`Pedir.tsx:152–175`, `Carta.css:2–11`). Revisar el recorrido de teclado y lectura sin afirmar que dos órdenes diferentes sean automáticamente un fallo. [WCAG 1.3.2](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html).
5. **Contraste:** cálculo sobre tokens sólidos de `tailwind.config.js`: tinta/papel 11.46:1, tinta-media/papel 6.03:1, foco/papel 6.43:1, contorno/papel 3.88:1 y filete/papel 1.62:1. `casa.css:172` aplica contorno al borde inferior del buscador, por lo que no corresponde atribuirle el contraste bajo de filete a partir del componente base. Verificar estilos computados de los restantes controles. No toda línea necesita 3:1: hay que determinar si es indispensable para reconocer el control. No marcar todos los separadores como fallos de [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
6. **Tamaño de objetivo:** los botones de añadir y cantidad declaran 44×44 px (`Carta.css:27`, `:47`); `casa.css:169` aplica a categorías un mínimo de 48 px de alto. Son bases favorables; medir tamaño efectivo y separación. El mínimo AA de [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) es 24×24 CSS px con excepciones; 44×44 no es el mínimo AA.

**Resultados automáticos disponibles:** axe registró cero violaciones en Carta a 390/1440 px, ficha y carrito. Hubo una comprobación incompleta de contraste en Carta a 390 px y en carrito; requiere revisión manual. Cero violaciones automáticas no resuelve anuncios de lector de pantalla, retorno de foco, secuencia de tareas ni conformidad integral.

## Fortalezas que conviene preservar

- Buscador nativo `type="search"` con `<label>` asociado (`Datos.tsx:152–179`).
- Normalización de mayúsculas y acentos y búsqueda global que evita ocultar platos de otro momento (`Pedir.tsx:37–42`, `:68–77`).
- Categorías con estado `aria-pressed` y grupos nativos `<details>/<summary>` (`Pedir.tsx:153`, `:181`); no convertirlos en pestañas ARIA sin implementar el patrón completo.
- Diálogos nativos nombrados; bloqueo del fondo y restauración explícita del foco en ficha (`DetalleCarta.tsx:30–37`, `:53`; `Superficies.tsx:216–243`).
- Reducción de movimiento contemplada en Motion y CSS (`Carta.css:60`; `DetalleCarta.tsx:24`, `:42`).
- Precio unitario, cantidad, subtotal y total explícitos en el pedido; mensaje de error enfocable; explicación de reintento pendiente; ubicación de retiro visible (`Pedir.tsx:215–296`).

## Propuesta de medición

Instrumentar eventos de exploración, búsqueda con/sin resultados, abrir ficha, agregar/quitar, revisar pedido y fallo de validación, con contexto mínimo y sin texto libre sensible. Seguir tiempo hasta primer agregado, consultas sin resultado, correcciones antes del pago, rechazos por cantidad y solicitudes a barra para completar opciones. Añadir pruebas con usuarios habituales y nuevos, incluyendo teclado y lector de pantalla. Ninguna mejora de conversión se puede cuantificar con esta revisión estática.
