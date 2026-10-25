# Auditoría de la dirección premium de La Bella Lupita

## Dictamen sobre el diseño publicado

El diseño publicado no alcanza todavía una dirección premium excepcional. Tiene mejoras funcionales y una identidad cromática coherente, pero la composición, la cobertura fotográfica y el movimiento no sostienen esa ambición a lo largo del recorrido. Esta conclusión sustituye la valoración anterior que dio por completado el objetivo visual.

La diferencia entre una implementación correcta y una experiencia memorable es visible en la Carta: el café aparece después de cuatro filas, la pantalla grande conserva una columna de teléfono y los productos sin fotografía reciben prácticamente el mismo peso. En Club y Perfil, la estructura propia de las pantallas apenas cambió. La novedad de un radio de tarjeta o una animación de entrada no resuelve esas decisiones.

El [informe de producción](../reauditoria-diseno-2026-09-13/AUDITORIA-NUEVO-DISENO.md) documenta catorce hallazgos y su evidencia. Incluye errores de interacción y representación de datos: el pase se recorta, «capuchino» no encuentra Cappuccino, el nivel máximo muestra cero puntos en una etiqueta y la flecha superior de Reserva abandona el flujo. Esos defectos impiden considerar terminado el trabajo aunque el aspecto mejore.

La valoración es una crítica experta, no una medición de conversión ni una prueba con clientes. «Grandioso» no es una propiedad que una biblioteca o una puntuación automática puedan certificar. Puede exigirse una dirección más distintiva, contrastarla con referencias concretas y verificar tareas observables; la respuesta real de los clientes requiere investigación con personas.

## Referencias comparables

### WatchHouse: café, lugar y compra en el mismo lenguaje

La portada inspeccionada combina fotografías amplias de sus locales con una navegación contenida. En el catálogo, los perfiles de café, las notas de sabor y las opciones de compra hacen que la fotografía conviva con información útil. La identidad se mantiene entre producto y hospitalidad. [Sitio de WatchHouse](https://watchhouse.com/).

Su agencia describe un trabajo conjunto de tipografía, fotografía, espacio y animación. Reporta mejoras de conversión, pero esas cifras proceden de un caso comercial del proveedor: no prueban que el movimiento por sí solo cause el resultado ni predicen un aumento equivalente para Lupita. [Caso de blubolt](https://blubolt.com/case-study/watchhouse/).

**Aplicación a Lupita:** usar la foto del latte como parte de la elección y mostrar descripción, precio y acción a su lado. Al elegir otra categoría, cambiar el contexto visual y la carta juntos. En escritorio, diseñar las relaciones entre columnas; en móvil, priorizar la decisión inmediata. La foto de un espacio debe ayudar a reconocerlo y elegirlo.

**Límite de la comparación:** WatchHouse incluye comercio de bolsas y equipamiento, mientras Lupita también atiende pedidos de consumo inmediato y membresía. Copiar una portada extensa antes de permitir pedir café añadiría fricción.

### Onyx: una identidad que se reconoce antes de leer

La portada observada utiliza imagen de origen a gran escala y una firma de marca dominante. La expresividad pertenece al universo de la empresa; no proviene de un conjunto intercambiable de tarjetas. Es una referencia de dirección de arte y presencia, no una plantilla para reproducir. [Onyx Coffee Lab](https://onyxcoffeelab.com/).

El caso de Spline explica que Onyx parte de representaciones del producto y guiones de movimiento, y que algunas escenas reaccionan a la selección de variantes. En Circadian, la escena ayuda a diferenciar opciones. El contenido importante mantiene prioridad sobre la escena. [Caso de Onyx y Spline](https://blog.spline.design/how-onyx-coffee-lab-crafts-interactive-3d-for-ecommerce).

**Aplicación a Lupita:** la taza con su marca, el dibujo del logotipo y los espacios reales son activos distintivos. El gesto memorable debe surgir de ellos. Un pase puede sentirse como un objeto propio; una escena de producto puede responder a una elección. La animación necesita un guion visible de inicio, cambio y resolución.

**Límite:** no hay un modelo 3D auténtico del producto ni fotografía suficiente del empaque de café en grano. Una taza genérica en WebGL no solucionaría esa carencia. Antes de una escena tridimensional comercial se necesita definir el producto, su representación y qué decisión ayuda a tomar.

### Mesh: coreografía de un objeto

La ficha de Pioneer, seleccionada en Mesh, describe una narración del desarrollo de semillas mediante objetos tridimensionales y animación. Su valor como referencia para este proyecto está en la continuidad: un objeto conserva protagonismo mientras la información cambia alrededor. La galería pudo inspeccionarse en navegador; el extractor web no recuperó la ficha. [Pioneer en Mesh](https://mesh3d.gallery/website/pioneer-corn-revolutionized).

**Aplicación a Lupita:** conservar el café como referencia espacial entre selección y detalle. La transición debe hacer evidente que se está viendo el mismo producto. Un catálogo cotidiano necesita entradas directas y control del usuario; la narración prolongada corresponde mejor a una campaña o a una historia de origen opcional.

### 21st: estudiar comportamientos concretos

La colección de Motion Primitives permite examinar categorías como Animated Tabs, Sliding Number, Morphing Dialog y Transition Panel. El ejemplo de Morphing Dialog describe continuidad desde una tarjeta a una vista enfocada y cierre con Escape. Es material útil para estudiar comportamiento, no evidencia de que cualquier componente sea adecuado para la marca. [Colección](https://21st.dev/@ibelick/library/motion-primitives), [ejemplo de detalle](https://21st.dev/@ibelick/components/morphing-dialog).

**Aplicación a Lupita:** indicador de categoría que se desplaza, detalle conectado con el origen, contador y total que cambian coordinadamente y salida de panel tan cuidada como su entrada. No es necesario importar toda una biblioteca ni reproducir su estilo visual.

La demostración de Morphing Dialog también se abrió directamente desde su marco embebido y se inspeccionó en el navegador. El contenido de ejemplo mostraba caracteres mal codificados. Esa observación refuerza una precaución de calidad: una referencia útil de movimiento no certifica todo el código, el contenido o la accesibilidad de un componente copiado.

## Skills y repositorios seleccionados

La selección responde a su utilidad en este proyecto, no a un ranking universal. Se distingue lectura de una guía, uso de una herramienta y dependencia instalada. La popularidad sirve para descubrir candidatos; no garantiza que generen buen diseño.

| Recurso | Aporte concreto | Uso y decisión |
|---|---|---|
| [Design Loop](C:/Users/artur/.codex/skills/design-loop/SKILL.md) | Separar construcción de crítica del brief, del sistema y del acabado | Aplicado como método local de revisión con críticos independientes. El encargo y los archivos ya estaban definidos; no se repite entrevista. |
| [Frontend Design, Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Elegir una dirección propia del producto y revisar patrones genéricos | Leído íntegramente en su fuente actual. Usado para cuestionar la propuesta visual; no se instala software. |
| [Interface Design](https://github.com/dammyjay93/interface-design) | Jerarquía, estados y memoria de decisiones en interfaces de producto | Descubierto también con `skills find`; README y skill leídos. Relevante para Carta, pedido y cuenta. No se ejecuta instalador global. |
| [Impeccable](https://github.com/pbakaus/impeccable) | Vocabulario de crítica, adaptación, movimiento y endurecimiento | README actual revisado. Su distinción entre crítica visual y auditoría técnica es útil; no se afirma haber ejecutado sus detectores o instalado sus hooks. |
| [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) | Foco, formularios, semántica, texto largo, imágenes y movimiento reducido | Guía revisada como controles técnicos complementarios. No determina la dirección artística. |
| [Motion](https://github.com/motiondivision/motion) | Continuidad de elementos y transiciones de entrada/salida | Ya existe en la app. Es la primera opción para integrar la propuesta en React; no hace falta reemplazar el sistema. |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | Ejemplos pequeños de comportamientos de interfaz | Referencia selectiva a través de 21st y el repositorio. Revisar cada componente y sus dependencias antes de incorporarlo. |
| [Spline](https://docs.spline.design/) | Construir y controlar escenas de producto | Opción para una pieza de marca posterior, condicionada a activos adecuados y validación en dispositivos. No se incorpora a la carta principal en esta exploración. |
| [Playwright](https://playwright.dev/) y [axe-core](https://github.com/dequelabs/axe-core) | Verificar interacciones y accesibilidad automatizable | Ya presentes en el proyecto. Sus comprobaciones anteriores se conservan como evidencia funcional, no como aprobación estética. |

La guía actual de Frontend Design señala expresamente que incluso crema, serif y un acento cálido pueden convertirse en otra fórmula repetida. En Lupita, verde y papel están justificados por la marca; lo que debe cambiar es la forma de componerlos con producto, lugar y tarea. [Skill original](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md).

Interface Design aporta una advertencia especialmente pertinente: una intención visual expresada en palabras puede terminar convertida en estructuras genéricas al implementarse. Por eso se documentan decisiones y se revisa su manifestación real, con estados y anchuras diferentes. [Skill original](https://raw.githubusercontent.com/dammyjay93/interface-design/main/.claude/skills/interface-design/SKILL.md).

No hay una razón demostrada para migrar todo a shadcn, añadir un segundo motor de animación o cargar varias bibliotecas de efectos. La app dispone de React, Motion, fuentes propias y controles existentes. El trabajo pendiente está en dirección, composición y atención al detalle.

## Dirección propuesta: la casa puesta en escena

### Carta

La apertura muestra el café y la elección en una misma composición. La fotografía recibe espacio suficiente para apreciar la taza; nombre, descripción y precio permiten actuar sin explorar cuatro fichas. El resto del catálogo adopta el ritmo de una carta: categorías comprensibles, descripciones útiles, cifras alineadas y controles consistentes.

El catálogo sin foto no necesita imitar uno con fotografía. En Barra, donde sólo un producto tiene imagen, una composición tipográfica puede resolver la comparación. Brunch y Bistró pueden aprovechar más sus activos existentes. La fotografía faltante sigue siendo una tarea de contenido, no un problema que se deba esconder con imágenes de otros productos.

### Detalle y pedido

Abrir un producto conserva el contexto visual. Nombre, cantidad y total se actualizan sin bloquear el uso mientras termina la transición. Cerrar regresa al origen y al control que abrió el detalle. El pedido presenta una sola convención de cantidades, permite corregir y hace explícito el lugar de retiro.

La documentación de Motion muestra cómo conectar elementos mediante `layoutId` y conservar una salida con `AnimatePresence`. Es una vía de integración viable; debe utilizarse lo compatible con la versión del proyecto. La documentación actual contiene también funciones más nuevas, por lo que no conviene copiar ejemplos completos sin comprobar la versión. [Animaciones de layout](https://motion.dev/docs/react-layout-animations).

### Club y reserva

El carnet recupera un papel singular: identificación y pertenencia. El saldo no usa el mismo objeto decorativo. La recompensa disponible aparece separada del progreso hacia la siguiente, evitando que ambos mensajes parezcan contradecirse.

Reservar empieza por reconocer el lugar. Terraza conserva su fotografía. La primera versión de la propuesta usó para VIP un retrato de café junto a una ventana, que los críticos rechazaron porque no permitía entender el espacio. Se revisó después la página oficial del Salón VIP; el propietario confirmó que sus imágenes de mesas y sillones son de referencia. La segunda versión retira el retrato y usa composición tipográfica para VIP. Sigue pendiente una fotografía auténtica del salón: la ausencia de una imagen incorrecta no satisface ese requisito. Fecha y grupo se resumen juntos; el retroceso conserva lo elegido. El prototipo permite explorar esa relación sin consultar cupos ni crear una reserva real. [Página oficial del salón](https://labellalupita.com/salon-vip).

### Inicio, Tienda y Perfil

Inicio debe llevar a una tarea principal y presentar el estado del socio de forma compacta. Tienda necesita fotografía auténtica del empaque, junto a peso, precio y retiro. Perfil debe expresar correctamente puntos y nivel, organizar datos y ayuda, y retirar textos sobre futuras entregas del desarrollo.

Estas vistas forman parte de la auditoría completa de producción, pero no se consideran rediseñadas por haber mostrado tres recorridos del prototipo. Su integración requiere aplicar el sistema y revisar cada una.

## Guion de movimiento

| Acción | Respuesta perceptible | Condición de aceptación |
|---|---|---|
| Elegir categoría | El indicador acompaña la selección y cambia la composición del producto | La selección se entiende de inmediato y no borra el pedido |
| Abrir detalle | Producto y contexto mantienen continuidad | Foto y texto legibles durante y después del cambio |
| Cerrar detalle | Salida breve hacia el contexto de origen | Cierre visible, Escape y foco de retorno |
| Añadir o quitar | Cantidad y total responden juntos | Ningún retraso artificial antes de actualizar el estado |
| Cambiar espacio | La imagen acompaña la elección de Terraza o VIP | No se muestra una fotografía de otro espacio |
| Volver en reserva | Regresa al paso correspondiente | Fecha, grupo y espacio permanecen seleccionados |

El movimiento reducido mantiene información, controles y respuesta al estado, suprimiendo desplazamientos y giros. La recomendación coincide con las opciones de accesibilidad de Motion. [Guía de movimiento accesible](https://motion.dev/docs/react-accessibility).

## Prioridad de integración

1. Corregir en la app los fallos funcionales ya reproducidos: recorte del pase, búsqueda, puntos, retroceso y selección de tamaños de imagen. Reproducir cada caso antes y después.
2. Aceptar la composición de Carta en móvil y escritorio, incluida una categoría fotográfica y otra sin fotos. Integrar la dirección sin alterar precios, cuentas ni idempotencia de compra.
3. Implementar detalle y pedido con estados completos: vacío, cantidades, carga, error, saldo insuficiente y cierre. Validar teclado y movimiento reducido.
4. Extender el sistema a Inicio, Club, Tienda, Reserva y Perfil. Revisar la jerarquía de cada pantalla y fotografiar el empaque pendiente.
5. Hacer una revisión de tareas con clientes representativos antes de calificar el resultado como excepcional. Contrastar facilidad para pedir, reconocer beneficios y revisar una reserva, además de la preferencia visual.

La verificación técnica debe comprobar límites internos de componentes, no sólo la ausencia de scroll horizontal. Una tarjeta puede recortar su botón aunque la página entera mida correctamente. También debe comprobarse la imagen que eligió el navegador, no sólo que exista un archivo de alta resolución. [Guía técnica de interfaces](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

La integración debe además aspirar a los umbrales de buena experiencia de Core Web Vitals: LCP de hasta 2,5 segundos, INP de hasta 200 ms y CLS de hasta 0,1, evaluados en el percentil 75 y separando móvil de escritorio. Son objetivos de aceptación, no resultados medidos de este prototipo. Una prueba local o Lighthouse no sustituye la experiencia real, y Lighthouse sin interacciones no mide INP. [Web Vitals](https://web.dev/articles/vitals).

Si se incorpora una escena WebGL, se requiere comprobar memoria, resolución de render y compatibilidad de los dispositivos objetivo. El coste debe presupuestarse y medirse con la escena real; no puede deducirse sólo de que la librería permita insertar 3D. [Buenas prácticas de WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

## Alcance y trazabilidad

Las referencias se consultaron el 13 de septiembre de 2026. La investigación incluye fuentes de marcas, autores y proveedores; los casos comerciales no son estudios independientes. No se realiza una promesa de mejora de conversión ni una clasificación universal de herramientas.

El prototipo y sus veredictos se conservan junto al [sistema visual](design-system.md), la [barra de calidad](bar.md) y el [registro de revisión](progreso.md). Son una propuesta interactiva con datos de ejemplo. El estado publicado continúa descrito por la auditoría de producción hasta integrar y desplegar los cambios correspondientes.

## Resultado de la autocrítica

La primera ronda del nuevo prototipo no obtuvo aprobación global. El crítico de uso aprobó las tres piezas; los críticos de sistema y acabado las rechazaron. Detectaron titulares que perdían espacios en móvil, un recorte que ocultaba el Risotto, una transición que duplicaba la taza y una imagen que no documentaba el Salón VIP. El prototipo se devolvió a construcción con esas brechas concretas.

Los críticos tuvieron contexto separado y revisaron renders e interacciones, sin leer la implementación. La comparación con referencias no fue completamente ciega porque sus marcas eran visibles. Sus veredictos son una revisión experta de esas piezas, no una encuesta de clientes ni una certificación universal de calidad.

La ausencia de una fotografía real del Salón VIP quedó confirmada como limitación de los activos disponibles: las imágenes del sitio oficial son referenciales según el propietario. Se mantiene pendiente ese criterio y se evita dar un aprobado ficticio por sustituir una fotografía inadecuada por otra más atractiva. La fotografía real del empaque de café en grano también sigue pendiente para Tienda.

En la segunda ronda, Carta y detalle/pedido obtuvieron PASS de uso, sistema y acabado. Se verificaron búsqueda con alias, mantenimiento del pedido, cantidades, totales, cierre, foco, anchos 320/390 y una variante sin movimiento. El acabado se contrastó de nuevo con las referencias. Club/reserva obtuvo PASS de uso y FAIL de sistema/acabado por la fotografía real del VIP: el requisito no se rebajó para cerrar la revisión.

También se corrigió un botón de pie de 30 px a 44 px, comprobado por el crítico, y se identificaron explícitamente los datos de socio y reserva como ejemplos. La versión final pesa aproximadamente 650 KB e incluye cuatro fotografías de productos elegidos, la terraza, la marca y la captura original para comparar. Usa los 73 registros del catálogo como contenido de exploración y no ejecuta compras ni reservas. No se instaló un nuevo motor de animación en la aplicación ni se desplegaron estos cambios.

El resultado muestra una dirección más clara y una mejora concreta en dos piezas. No permite afirmar que toda la app sea excepcional: siguen pendientes la fotografía, la integración de los catorce hallazgos publicados, la extensión a las demás vistas y la revisión con clientes.
