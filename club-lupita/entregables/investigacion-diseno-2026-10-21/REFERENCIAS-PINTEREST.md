# La Bella Lupita · lectura visual de los pines y las imágenes compartidas

Investigación del 21 de octubre de 2026. Se inspeccionaron las imágenes exactas de ambos pines, sus fuentes de autor verificables y los dos JPEGs de Downloads. No se modificó la aplicación ni se produjeron nuevos diseños.

## Resultado que cambia la lectura de las referencias

Los dos enlaces de Pinterest y los dos JPEGs representan **cuatro propuestas visuales distintas**. Ninguno de los JPEGs corresponde a las imágenes principales de esos pines. Además, el pin Starbucks es una republicación de la propuesta de Bacancy en Dribbble: consultar ambos enlaces refuerza la procedencia, pero no suma un quinto caso independiente.

Lo más transferible no es un color de café ni la presencia de tarjetas redondeadas. Es una relación entre **tarea, escala del producto y densidad de controles**: la bienvenida seduce, la exploración permite comparar y el detalle concentra una decisión. La profundidad se construye mediante el recorte, el solape y las sombras de contacto. Una portada con fotografía grande puede compartir un recurso superficial y todavía no compartir esa lógica.

## Qué se verificó y cómo

El extractor web devolvió `not accessible` para los dos pines. Chrome DevTools sí abrió los enlaces solicitados y permitió inspeccionar la imagen principal, el título, `og:image` y los metadatos de procedencia. La pantalla pública presentó un modal de acceso. Se abrió la URL pública de cada imagen, descubierta en el propio DOM, y se capturó su representación en navegador. No se inició sesión ni se descargaron medios para eludir una restricción de visualización.

Las capturas limpias se conservaron mediante Playwright/Edge. Se compararon visualmente con las publicaciones originales en Dribbble. Los JPEGs locales se copiaron sin alterarlos y se comprobó su SHA-256. Registro completo: [acceso y procedencia](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/investigacion-diseno-2026-10-21/evidencia/pinterest/ACCESO-Y-PROCEDENCIA.md>).

| ID usado aquí | Entrada exacta | Contenido comprobado | Autoría y alcance |
|---|---|---|---|
| P1 | [Pin 1060034831036382763](https://www.pinterest.com/pin/1060034831036382763/) | Cappuccino; dos pantallas marrón/blanco; catálogo y detalle | Coincide visualmente con [Coffee App Design-UIdesignz](https://dribbble.com/shots/21908991-Coffee-App-Design-UIdesignz), de UIDesignz. HK Creative Tech es el perfil del pin observado. |
| P2 | [Pin 919297342739063250](https://www.pinterest.com/pin/919297342739063250/) | Starbucks; bienvenida verde y catálogo con producto destacado | Misma propuesta que [Starbucks Coffee App Design](https://dribbble.com/shots/20371794-Starbucks-Coffee-App-Design), de Bacancy. Pinterest reacomoda las pantallas en un lienzo vertical. |
| W1 | `WhatsApp Image 2026-10-13 at 9.49.55 AM.jpeg` | Tres pantallas: bienvenida con salpicadura, catálogo de dos columnas y detalle blanco | Archivo local 738×420. No se verificó una publicación original ni autor. |
| W2 | `WhatsApp Image 2026-10-13 at 9.49.55 AM (1).jpeg` | Concepto iOS; lista y fichas de latte/cappuccino/long black; fondos pastel | Archivo local 738×543. No se verificó una publicación original ni autor. |

Las proporciones siguientes son lecturas aproximadas de los mockups, medidas respecto a la pantalla dibujada, no especificaciones extraídas de un producto implementado. No se conocen tipografías exactas ni dimensiones táctiles reales a partir de estos rasterizados.

## P1 · catálogo y detalle de UIDesignz

![Pin exacto 1060034831036382763, inspeccionado como imagen pública en navegador](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/investigacion-diseno-2026-10-21/evidencia/pinterest/1060034831036382763-image-browser.png>)

**Composición.** El lienzo es cuadrado, 736×736. Hay dos superficies móviles verticales de ancho parecido, con la derecha ligeramente más baja. El campo marrón exterior y los dibujos tenues de granos pertenecen a la presentación; no son el fondo de todas las pantallas de la app. Cada pantalla tiene una proporción aproximada de 1:2,15. Ambas usan grandes márgenes blancos, pero distribuyen el foco de manera distinta.

**Catálogo.** La parte superior organiza ubicación/perfil, búsqueda y categorías. Esa estructura ocupa aproximadamente el primer tercio. Debajo aparece una tarjeta central marrón, con fragmentos de tarjetas vecinas a ambos lados. La tarjeta central mide cerca de dos tercios del ancho de la pantalla. La taza vista desde arriba, con plato, mide algo más de la mitad del ancho de pantalla y sobresale del borde superior de la tarjeta. El solape hace que la fotografía una la zona blanca de exploración con la superficie de información del producto.

La jerarquía es taza → nombre → valoración/volumen → precio y botón de agregar. El botón circular blanco contrasta por superficie y posición, mientras el nombre mantiene mayor peso tipográfico. Hay tres iconos inferiores, con la casa destacada en el tono cálido. Las categorías se presentan como opciones compactas: el tono caramelo distingue una activa; las otras son grises. La búsqueda ofrece una acción circular contrastante al extremo derecho.

**Detalle.** El producto aumenta aproximadamente de 55–60% a 65–70% del ancho de pantalla. El panel marrón superior ocupa alrededor del 30% de su altura y la taza cruza la frontera hacia el blanco. El producto mantiene el ángulo cenital y la identidad fotográfica del catálogo: cambia la escala, no el objeto. Esta continuidad hace reconocible la selección entre estados.

Debajo, la información cambia de función: valoración, nombre con precio secundario a su derecha, tamaño, explicación, volumen, cantidad y compra. El nombre es la mayor pieza textual; la descripción es una zona breve de lectura, no otro titular. Los tamaños tienen estado seleccionado visible. La cantidad está separada de los tamaños y alineada junto al volumen. La compra termina el eje vertical; una bolsa secundaria ocupa un círculo a su izquierda. Atrás y favorito están en las esquinas superiores, sin competir con el nombre.

**Paleta y planos.** Blanco, marrón profundo, caramelo y gris producen una distribución semántica sencilla. El marrón identifica la escena del producto; el caramelo identifica selección y acción; el blanco sostiene lectura. El plato claro conserva un borde legible tanto sobre marrón como sobre blanco. Las sombras debajo del plato y la tarjeta sugieren distancia entre planos. No se necesita una tarjeta adicional alrededor de la fotografía: es precisamente el cruce de una frontera lo que crea volumen.

**Qué se puede inferir y qué no.** Las tarjetas cortadas sugieren un carrusel horizontal; no prueban que exista un gesto de arrastre. El mockup dibuja un detalle de producto compatible con la tarjeta; no prueba una transición compartida ni una animación de expansión. Los iconos no acreditan nombres accesibles, áreas táctiles ni rutas completas.

**Transferencia a Lupita.** La relación producto → ficha sirve para Carta y Tienda: conservar fotografía, nombre y precio entre exploración y detalle; ampliar imagen y explicación solamente cuando la persona decide. Una bebida recortada puede cruzar una única superficie de cacao o rosa de marca si el archivo real soporta ese recorte. La continuidad se puede lograr también con una fotografía rectangular consistente; no exige fabricar un recorte malo.

**Lo que no conviene copiar.** El carrusel que deja un solo producto dominante dificulta comparar una carta extensa. El precio de detalle, diminuto frente al nombre, pierde fuerza para una decisión de compra. La navegación de iconos sin etiquetas es ambigua. No hay evidencia de disponibilidad, errores, variantes agotadas, agregados o confirmación. Copiar estrellas, volúmenes o tamaños del dibujo sería inventar información. El patrón gráfico puede orientar la ficha, pero no reemplaza esas decisiones funcionales.

## P2 · bienvenida y exploración de Bacancy

![Pin exacto 919297342739063250, inspeccionado como imagen pública en navegador](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/investigacion-diseno-2026-10-21/evidencia/pinterest/919297342739063250-image-browser.png>)

**Composición y procedencia.** Pinterest muestra un lienzo natural de 736×1104, con la bienvenida arriba a la izquierda y la pantalla de compra más baja a la derecha. El original de Bacancy las coloca casi a la misma altura en un lienzo horizontal. Es una diferencia de montaje; los elementos internos de las pantallas corresponden a la misma propuesta. No se interpreta el espacio vacío del tablero como espacio necesario dentro de la app.

**Bienvenida.** El verde cubre la pantalla. Arriba hay un símbolo de marca pequeño; en la zona media, dos vasos recortados con inclinaciones y tamaños distintos. Uno adelanta al otro; los hielos y las hojas completan el conjunto. Un plano verde más claro y girado detrás de los vasos separa el producto del fondo sin encerrarlo en una fotografía rectangular. La zona visual ocupa aproximadamente la mitad central de la pantalla, mientras el mensaje y el CTA ocupan el tercio inferior. Los pequeños indicadores bajo la imagen sugieren una secuencia de introducción. No prueban desplazamiento, temporizador ni duración.

El texto grande es corto, centrado y blanco. El botón negro se distingue al final por contraste. Aquí el producto comunica categoría y apetito; todavía no se está comparando tamaño, precio o configuración. El onboarding reduce deliberadamente la cantidad de decisiones.

**Exploración.** La pantalla derecha conserva verde arriba y abajo, y abre un campo blanco central. Un borde ondulado separa la cabecera de la búsqueda y el catálogo. El avatar y los iconos ocupan la cabecera; debajo están búsqueda, título de grupo, enlace para ver más y productos. El producto de cada tarjeta se separa sobre un fondo verde muy pálido. El nombre es pequeño, el precio gana contraste y el botón negro con “+” queda próximo al producto correspondiente.

La zona inferior cambia de densidad: un arco verde amplio sostiene un producto destacado grande, miniaturas de otras bebidas, nombre/precio, cantidad y CTA. Por eso la propuesta no es un catálogo uniforme. Alterna una franja para comparar y una escena para destacar una elección. El producto destacado mide aproximadamente entre un tercio y dos quintos del ancho de esa pantalla, según se cuente el vaso o todo su recorte.

**Profundidad real y profundidad de presentación.** Hay solapes entre vasos, hielo, fondos inclinados y curvas. La fotografía tiene luz y sombra propias; el fondo de presentación añade una sombra amplia detrás de los teléfonos. En el original, el vaso destacado de la derecha sale del marco del teléfono: ese rebalse pertenece al montaje promocional. Una interfaz móvil real puede cruzar límites de componentes dentro del viewport, pero no salirse físicamente del viewport del dispositivo. Tomarlo literalmente produciría recorte o desbordamiento.

**Transferencia a Lupita.** Tiene valor la economía de la bienvenida —marca, producto, mensaje, acción— y el contraste entre explorar y destacar. El equivalente de marca puede construirse con marfil, cacao y borgoña; no depende del verde. La curva puede ser una transición entre dos zonas de contenido, pero debe aparecer donde ordena la composición. El recorte de un producto propio con buena iluminación es más importante que replicar los contornos exactos.

**Lo que no conviene copiar.** Vasos con logo Starbucks, verde corporativo, mensaje de onboarding genérico y CTAs negros no definen a Lupita. El fragmento de la tarjeta derecha oculta parte del nombre y precio; no es una solución suficiente para comparar. El módulo destacado combina miniaturas, selección, cantidad y compra en poco espacio, y puede competir con la exploración superior. Tampoco muestra un detalle completo, un checkout ni navegación inferior persistente. No fundamenta por sí mismo un sistema para Club, reservas o el equipo interno.

## W1 · Coffee Shop App: tres etapas explícitas

![JPEG local original Coffee Shop App, tres pantallas](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/investigacion-diseno-2026-10-21/evidencia/pinterest/whatsapp-coffee-shop.jpeg>)

**Presentación frente a interfaz.** El fondo lavanda grisáceo, el rótulo lateral de UI/UX y las sombras de los teléfonos son parte de la lámina. Dentro de la app predomina marrón en bienvenida y blanco en exploración/detalle. La marca visual del servicio no es el lavanda. Las tres pantallas tienen aproximadamente 158×346 px dentro de la imagen: suficiente para leer estructura, insuficiente para certificar microtipografía o tamaños de botones.

**Bienvenida.** La imagen de café en vaso de vidrio, salpicadura, cubos y reflejo ocupa alrededor del 60% superior. Es una escena fotográfica con dirección vertical: los fragmentos suspendidos llevan el ojo hacia la taza, y el reflejo la asienta en una base. El texto empieza debajo, sobre marrón oscuro, y el CTA naranja forma una banda ancha cerca del borde inferior. La fotografía y el texto no compiten por la misma zona. Los puntos pequeños sugieren paginación, sin demostrar su funcionamiento.

**Catálogo.** Cambia a una retícula de dos columnas, con fotos aproximadamente cuadradas de taza y contexto, no vasos aislados. La fotografía queda dentro de cada producto; el nombre y el precio están debajo. La cabecera oscura concentra ubicación, perfil y búsqueda, y la fila de categorías crea una segunda escala de navegación. Abajo hay una barra con cuatro iconos. La retícula permite comparar varias opciones simultáneamente y reduce el protagonismo individual de cada taza. Ese cambio responde a la tarea, no a una falta de consistencia.

**Detalle.** El plato cenital ocupa casi todo el ancho y alrededor del 40–45% superior. El fondo blanco reduce la frontera entre foto y pantalla; la forma circular de la taza organiza la composición. Atrás y favorito quedan en los extremos superiores. Luego aparecen título, valoración, descripción, tamaños y una fila final con precio/compra. En esta imagen hay una discrepancia visible entre el título de espresso y la explicación de cappuccino; la pieza sirve como referencia de jerarquía, no como contenido gastronómico confiable.

**Relación con Lupita.** Este caso muestra mejor que los otros la diferencia entre abrir apetito, comparar y decidir. Para la carta real, una fotografía contextual repetida con proporciones consistentes puede ser más sostenible que recortar todos los platos. En el detalle se puede ampliar la imagen del mismo producto sin convertir la grilla entera en un conjunto de portadas. La luz, temperatura y ángulo coherentes darían unidad aunque los alimentos cambien.

**Límites.** La salpicadura es espectacular, pero no demuestra elaboración, local ni producto propio. Si el recurso exige una escena ajena o una foto que no corresponde a la oferta, se pierde credibilidad. Las descripciones y controles son demasiado pequeños en esta exportación para evaluar accesibilidad; tampoco se observa retorno, agregado al carrito ni estado de compra.

## W2 · concepto iOS: producto, color y configuración

![JPEG local original iOS App Concept, fichas de cafés](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/investigacion-diseno-2026-10-21/evidencia/pinterest/whatsapp-ios-coffee.jpeg>)

**Composición.** El lienzo tiene fondo terracota y cuatro pantallas en una línea. Las de los extremos están cortadas por la propia captura. Las dos centrales visibles tienen unos 166×295 px, una proporción cercana a 1:1,8, más ancha que los mockups de los otros casos. Esto limita trasladar literalmente el reparto vertical a un móvil actual estrecho.

**Lista.** El fragmento izquierdo presenta productos apilados en bandas de color: azul para long black, ciruela para latte, ocre para cappuccino. Cada bebida ocupa el centro de su banda y el nombre queda debajo. El encabezado dice pedido de café y muestra un importe. Se percibe una organización por producto, pero el recorte no permite reconstruir un catálogo completo ni su navegación.

**Fichas.** El vaso o taza aparece centrado en el tercio superior. A continuación está el nombre en una serif blanca de alto contraste entre trazos; después, una explicación muy pequeña y centrada. El color cubre toda la ficha y se asocia al producto. El eje es estable: producto → nombre → descripción → pregunta/opciones → acción o paso. La taza blanca sobre ocre y la taza oscura sobre azul conservan siluetas claras. Sombras blandas bajo las tazas sugieren suspensión, sin necesidad de capas de tarjetas adicionales.

La ficha de latte muestra opciones de leche grandes en tres bloques; la de cappuccino muestra una acción ancha; el long black muestra opciones de azúcar. Hay una “X” superior y puntos pequeños abajo. Son indicios de un flujo de configuración o de fichas sucesivas. No se puede concluir el orden real, si el precio cambia, si las opciones son excluyentes ni si la “X” vuelve al listado o cancela el pedido.

**Lo particular.** Aquí la inmersión nace del fondo completo y la escala del producto, no de una foto de ambiente. No hay un panel blanco general para todo el contenido. La tipografía de los nombres crea personalidad mientras los controles usan una letra más neutral. La consistencia está en la alineación y en el ritmo vertical; el color cambia por bebida.

**Transferencia a Lupita.** Resulta útil para un detalle con pocas variantes reales: una pregunta por grupo, opciones distinguibles y una acción final. Las opciones grandes pueden funcionar mejor que muchas píldoras minúsculas. Puede inspirar contraste entre un espacio de producto y un espacio de lectura, pero el color por producto debe tener un sistema controlado y no competir con el significado de éxito, error o selección.

**Lo que no conviene copiar.** Cambiar toda la pantalla a azul, ciruela u ocre para cada SKU diluiría el sistema de Lupita y aumentaría las combinaciones de contraste. Los textos blancos pequeños sobre fondos claros pierden legibilidad en la imagen. La serif decorativa en títulos no justifica usarla en controles. Las cruces y puntos no explican por sí solos dónde está la persona. Tampoco hay evidencia suficiente para afirmar que todas las fichas representan pasos consecutivos de una misma compra.

## Comparación entre etapas

| Etapa | Papel de la fotografía | Densidad y lectura | Controles observados | Lo que se conserva al transferir |
|---|---|---|---|---|
| Bienvenida — P2 y W1 | Escena dominante; dos bebidas recortadas o salpicadura; producto antes que datos | Pocas palabras; un foco principal; texto separado del área más compleja | CTA único e indicadores pequeños | Una promesa concreta de marca y una siguiente acción clara. La escala generosa no obliga a un carrusel de introducción. |
| Listado — P1 | Una taza dominante sobre tarjeta con vecinas parcialmente visibles | Baja densidad; énfasis individual | Búsqueda, categorías, agregar, barra inferior | Continuidad de producto y estados de selección. Para una carta larga hace falta más capacidad de comparar. |
| Listado — W1 | Fotos contenidas en grilla de dos columnas | Varias opciones simultáneas; nombres/precios próximos | Búsqueda, categorías, agregar, navegación inferior | Proporción fotográfica consistente y lectura de nombre/precio sin abrir cada ficha. |
| Exploración + destacado — P2 | Productos pequeños arriba y escena grande abajo | Alterna comparación y promoción | Ver todo, favoritos, agregar, cantidad/CTA en destacado | Ritmo entre catálogo y un énfasis editorial. Evitar dos zonas de compra que compitan o estados sin relación clara. |
| Detalle — P1 y W1 | Una imagen grande de la misma taza | Nombre dominante; atributos agrupados; compra final | Atrás, favorito, tamaño, cantidad en P1, precio y compra | Una decisión completa sobre un producto identificable; precio, disponibilidad y variantes reales. |
| Configuración — W2 | Taza aislada sobre color pleno | Eje centrado; una pregunta visible por ficha | Leche/azúcar, cierre, puntos y acción | Agrupar variantes reales y hacer visible qué está seleccionado. Añadir orientación explícita si hay varios pasos. |

## Mecanismos transferibles y límites para La Bella Lupita

El código actual declara marfil `#FBF6EE`, cacao `#53291E`, rosa `#F9AFA4` y borgoña de Inicio `#B60032`, entre otros valores. Esa constatación describe la base existente; no equivale a validar su aplicación visual actual. Fuente: [configuración de tokens](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/tailwind.config.js>).

| Mecanismo | Por qué funciona en las referencias | Adaptación razonada | Condición para aceptarlo |
|---|---|---|---|
| Escala según tarea | El producto se reconoce sin leer en bienvenida/detalle y cede espacio al comparar | Fotos grandes en momentos de presentación; grilla o lista eficiente en Carta; ampliación en detalle | El nombre, precio y siguiente acción deben seguir siendo fáciles de encontrar. |
| Solape de una imagen y una superficie | Une dos zonas y aporta profundidad sin añadir contenedores | Un producto propio puede cruzar un panel de color de marca | Silueta íntegra, sin halo de recorte; sin tapar texto ni controles; sin salir del viewport. |
| Fotografía coherente entre estados | La taza que se eligió sigue reconocible al entrar en detalle | Reutilizar el mismo activo/encuadre base con una escala adecuada | Evitar cambiar a una foto genérica en el detalle o presentar una bebida distinta. |
| Pocas familias de planos | Fondo, contenido y producto se distinguen claramente | Marfil para lectura, un plano de marca y una imagen protagonista donde corresponda | Cada panel debe agrupar información o dirigir la mirada; no decorar cada bloque por igual. |
| Color con función | Activo, producto y CTA se distinguen | Reservar borgoña para acciones/énfasis; cacao para texto y profundidad; rosa como soporte controlado | Selección visible también sin depender solo del color; lectura clara sobre todas las superficies. |
| Jerarquía por tamaño y espacio | Nombre y producto ganan por escala, no por varios bordes y adornos | Titular breve, metadatos próximos, descripción subordinada | No sacrificar precio/disponibilidad para hacer dominante un eslogan. |
| Variantes agrupadas | El detalle deja de vender una idea y permite elegir | Tamaño, cantidad u opciones solo si existen en el catálogo real | Estado activo inequívoco, total correcto y respuesta posterior al agregar. |
| Navegación que cambia con la tarea | El detalle usa atrás; el listado ofrece exploración | Conservar destinos globales comprensibles y retorno al contexto de selección | No copiar barras de iconos ambiguos ni cruces cuyo efecto no se explique. |
| Ritmo entre zonas | Alternan superficies simples y un punto visual fuerte | Un énfasis de producto puede coexistir con módulos de club o reservas | El énfasis no puede convertir cada módulo operativo en otra portada. |

Estos referentes **no acreditan** que una interfaz sea rápida, usable, accesible o coherente en sus flujos completos. Su valor es compositivo. Para evaluar una adaptación hay que observar la misma identidad en Inicio, Carta, ficha, compra, Club y reservas, con contenido y estados reales. Una captura atractiva de Inicio no permite aprobar las demás pantallas.

## Qué sigue siendo desconocido

No se verificaron animaciones, velocidades, easing, parallax, gestos, transiciones entre pantallas, persistencia de selección, confirmaciones de compra ni comportamiento responsive. Las sombras dibujadas no son evidencia de movimiento. Los puntos no prueban un onboarding automático. Los productos recortados no prueban una transición compartida. Cualquier propuesta de movimiento para Lupita tendría que justificarse por orientación o respuesta al usuario y comprobarse por separado.

No se confirmó la fuente original de W1 y W2. La búsqueda de títulos y fragmentos visibles no produjo una correspondencia verificable; se mantiene la atribución como desconocida. Los pines contienen canonical/`og:url` de otras republicaciones, por lo que sus nombres de perfil no se trataron como autores. P2 enlaza además a un sitio ajeno; la procedencia del diseño se verificó en la publicación de Bacancy, no en ese enlace saliente.

## Evidencia conservada

Todos los archivos están en [evidencia/pinterest](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/entregables/investigacion-diseno-2026-10-21/evidencia/pinterest>).

- `1060034831036382763-image-browser.png` y `919297342739063250-image-browser.png`: imágenes exactas de los pines, vistas y capturadas en navegador.
- `pin-1060034831036382763-browser-login.png` y `pin-919297342739063250-browser-login.png`: contexto de las páginas públicas, con modal de acceso.
- `uidesignz-original-image-browser.png` y `bacancy-original-image-browser.png`: fuentes originales inspeccionadas para verificar correspondencia.
- `*-metadata.json`: URL pedida/final, título, metadatos y URL de imagen descubierta. Las fechas son del acceso de esta investigación, no fechas de creación de los diseños.
- `whatsapp-coffee-shop.jpeg` y `whatsapp-ios-coffee.jpeg`: copias sin modificación de los dos originales locales.
- `archivos-locales-sha256.json`: identidad entre originales y copias.
- `capturar-referencias.cjs`: procedimiento de captura reproducible; `ACCESO-Y-PROCEDENCIA.md`: limitaciones y relación entre fuentes.
