# Interacciones comprobadas y criterio de aplicación

21 de octubre de 2026. Investigación de cuatro patrones seleccionados previamente en `REFERENCIAS-21ST.md` y `PLAN-100.md`. **No es una validación del rediseño de Lupita ni una aprobación para implementarlo.** No se modificaron aplicación, pruebas, dependencias ni despliegues.

La aportación útil de 21st es concreta: señalar qué se seleccionó, reconocer qué producto se abrió, explicar información secundaria y confirmar el resultado de una acción. Esos mecanismos deben formar recorridos completos de cliente y equipo. Las demos no justifican por sí solas un estilo visual, un flujo de compra ni un sistema accesible listo para copiar.

## Qué se revisó realmente

Se abrieron las cuatro fichas en navegador y se identificaron sus demos embebidas; después se recorrieron esas mismas URLs públicas con Chromium y Playwright local. Se ejecutaron clics, hover y teclado, se capturaron estados a 1280 × 900 y 390 × 844 y se repitieron las acciones con `prefers-reduced-motion: reduce`. La evidencia conserva URLs exactas, versión de Chromium, estados accesibles y muestras de geometría/estilos durante la interacción. [Observaciones completas](evidencia/interacciones/observaciones.json) · [Script reproducible](evidencia/interacciones/inspeccionar-demos.mjs).

Las capturas prueban estados; no prueban la trayectoria del movimiento. Las afirmaciones sobre animación que siguen se apoyan en muestreo `requestAnimationFrame` de la demo en ejecución, no solo en lectura de código. Se comprobó el cambio de preferencia en el navegador; no se hizo una auditoría con lector de pantalla, dispositivo táctil físico, Safari ni API real. Tampoco se midió rendimiento de Lupita.

Se miraron las capturas actuales de Inicio a 390 y 1440 px y se leyó `DetalleCarta`, `Hoja` y el manifiesto local para entender el encaje. La fotografía inmersiva ya comunica ambiente; estas capturas no muestran el recorrido posterior a «Explorar la carta» ni acreditan los módulos del equipo. La identidad visual y la composición de páginas completas deben resolverse con las referencias originales de la marca, no deducirse de estas cuatro demos.

## 1. Categorías y vistas: selección que conserva el contexto

Referencia: [Animated Tabs de Julien Thibeaut](https://21st.dev/@ibelick/components/animated-tabs), variante **Segmented Control**.

**Comprobado.** Antes, Day aparece seleccionado. Al pulsar Month, el fondo blanco se desplaza y la selección permanece en Month. El muestreo registró posiciones intermedias. No se cambia ningún panel de contenido. ArrowRight sobre Month conserva foco y selección; el DOM no tiene `tablist` ni `tabpanel`. A 390 px Year cae a una segunda línea; no hay desbordamiento horizontal. Con movimiento reducido persiste el desplazamiento. La ficha declara MIT, `framer-motion` y `lucide-react`. [Antes](evidencia/interacciones/tabs-antes.png) · [Después](evidencia/interacciones/tabs-despues.png) · [390 px](evidencia/interacciones/tabs-390.png).

**Criterio para Lupita.** Usar la continuidad del indicador en categorías de Carta, vistas cortas de Mi Club y períodos de Informes. El estado elegido debe verse incluso sin animación. No adoptar el tamaño de 24 px de alto medido en el indicador como tamaño del control: diseñar objetivos de interacción de al menos 44 px y comprobar etiquetas españolas largas.

El recorrido completo de Carta debe ser: categoría legible → selección inmediata → resultados coherentes con esa selección → apertura del producto → retorno a la misma categoría, búsqueda y posición. Si la actualización necesita servidor, mantener la categoría elegida y mostrar carga local; un fallo debe permitir reintentar sin presentar el catálogo viejo como si fuera el nuevo. La selección visual sola no resuelve esto.

Elegir la semántica según la tarea. La navegación principal usa enlaces a páginas. Un filtro de catálogo puede usar botones con estado pulsado. Un conjunto que intercambia paneles requiere pestañas y su interacción de teclado; el nombre comercial de la demo no aporta esa semántica. La guía primaria define pestañas como controles asociados a paneles y describe navegación con flechas. [WAI-ARIA APG: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

En móvil, prever desplazamiento horizontal accesible o una disposición deliberada, con la selección visible; no aceptar que una opción quede aislada accidentalmente en otra fila. Los doce módulos del equipo necesitan una navegación reconocible y escalable; este control cabe dentro de un módulo para dos a cinco vistas relacionadas.

## 2. Producto y detalle: reconocer antes de decidir

Referencia: [Product Card de Ravi Katiyar](https://21st.dev/@ravikatiyar162/components/product-card-2).

**Comprobado.** La demo muestra foto, nombre, descripción breve y precio en cuatro columnas; en 390 px pasa a una. Al señalar la primera imagen, su escala progresa hasta 1,05. Al pulsarla, URL y texto permanecen iguales: no hay botones/enlaces ni diálogo. Por tanto, **no demuestra una transición tarjeta → detalle ni agregado al pedido**. Con movimiento reducido se mantiene el acercamiento de 0,3 s. La ficha declara `framer-motion`; no presenta licencia visible. [Reposo](evidencia/interacciones/producto-antes.png) · [Hover](evidencia/interacciones/producto-hover.png) · [390 px](evidencia/interacciones/producto-390.png).

**Criterio para Lupita.** La relación foto–nombre–precio resulta aprovechable, pero la fotografía gastronómica necesita su propio encuadre y proporción. Los objetos de la demo flotan sobre blanco; trasladar ese espacio y densidad literalmente haría el catálogo de comida innecesariamente largo. La toma inmersiva de Inicio puede invitar a explorar; Carta debe permitir comparar platos, disponibilidad y precio con menos desplazamiento.

El recorrido propuesto es: una tarjeta con foto reservada y acción identificable abre un detalle que conserva la misma foto y nombre; dentro se revisan porción, componentes, opciones, cantidad y total; al agregar, el resumen confirma producto y cantidad y el cliente vuelve al contexto de catálogo. La foto no debe contener la única acción ni esconder datos al hacer hover. El zoom es opcional; el reconocimiento depende de foto, título y estructura estable.

La lectura local muestra que `DetalleCarta` ya utiliza `dialog`, `showModal()`, nombre accesible, cierre y restauración de foco; también contiene opciones obligatorias, cantidad, información de empaque y restricciones. `Hoja` resuelve además estados bloqueados y retorno del foco. Esto es evidencia de código, **no una prueba dinámica nueva de Lupita**. Conviene mejorar esas superficies existentes, conservando sus reglas, antes de incorporar otra primitiva. La continuidad foto–detalle sigue siendo una hipótesis que se debe diseñar y verificar, no una función heredada de esta referencia.

En el equipo, compartir foto/nombre/disponibilidad con la ficha de catálogo ayuda a reconocer el mismo producto. No trasladar la cuadrícula comercial a Caja, Pedidos o Entregas: allí pesan más cantidad, referencia, estado, hora y acción operativa. Mantener representación compacta y detalles accesibles, sin efectos que desplacen el registro mientras se trabaja.

## 3. Confirmación: resultado visible y recuperable

Referencia: [Order Confirmation Toast de Bundui.io](https://21st.dev/@bundui/components/toast6).

**Comprobado.** Place Order genera un aviso superior con confirmación y acción; el foco permanece en el botón. La región usa `aria-live="polite"`. La entrada presenta desplazamiento y transiciones de 0,4 s; con movimiento reducido la transición computada es 0 s. View Order produce otro aviso sobre una redirección, pero la URL no cambia. El aviso desaparece después; no hay historial operativo verificable. La ficha declara Sonner y MIT. [Confirmación](evidencia/interacciones/toast-despues.png) · [Acción de la demo](evidencia/interacciones/toast-accion.png) · [390 px](evidencia/interacciones/toast-390.png).

**Criterio para Lupita.** Separar dos resultados. Agregar un plato confirma un cambio local del pedido; enviar la compra, reservar, canjear o registrar una operación solo puede anunciar éxito después de la respuesta real del servidor. La secuencia visual debe distinguir reposo, ocupado, resultado y eventual recuperación. Un fallo conserva datos y una acción pertinente; no se transforma en éxito por terminar una animación.

Para un pedido recibido, combinar confirmación cerca del resumen con acceso real al comprobante o historial. Para perfil guardado, basta un mensaje breve próximo al formulario. Para caja, canjes, devolución o cambios de permisos, mantener en pantalla importe, referencia y estado que permitan revisar la operación después de desaparecer el aviso. Un mensaje efímero no reemplaza el comprobante ni la actualización del registro.

El aviso no debe cubrir navegación inferior, total ni botón de confirmar en móvil. Evitar mostrar varios avisos por el mismo gesto. Una respuesta debe poder anunciarse sin robar el foco; verificar el resultado con tecnología de asistencia, no darlo por resuelto porque exista un atributo. [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

La propuesta puede usar los mensajes y regiones de estado existentes de Lupita; la referencia no obliga a instalar Sonner. La acción relacionada debe llevar al resultado real; el segundo aviso de la demo no constituye ese recorrido.

## 4. Desplegables: detalles que se abren sin perder lo importante

Referencia: [FAQ Accordion Reveal de Hirael](https://21st.dev/@mohammadshehadeh/components/faq-06).

**Comprobado.** Las preguntas comienzan cerradas; un clic expande respuesta y cambia el fondo. Dos pueden quedar abiertas. Enter cierra la primera, conserva allí el foco y deja abierta la segunda. El DOM comunica expansión y relaciona las regiones con sus títulos. La altura cambia durante una animación computada de 0,2 s, que persiste con movimiento reducido. El contenedor centrado de la demo también se redistribuye al crecer. La ficha declara Motion y MIT. [Cerrado](evidencia/interacciones/acordeon-cerrado.png) · [Dos abiertos](evidencia/interacciones/acordeon-dos-abiertos.png) · [390 px](evidencia/interacciones/acordeon-390.png).

**Criterio para Lupita.** Adecuado para preguntas del club, explicaciones de beneficios, condiciones ampliadas y ayuda sobre permisos. En una página completa, el título, el resumen y la acción principal deben permanecer anclados a la estructura; la expansión empuja el contenido posterior. No copiar el centrado vertical de la demo ni reanimar todo el bloque de preguntas cada vez que se visita.

Antes de abrir, la etiqueta debe explicar qué se encontrará. Durante la apertura, el control conserva foco y muestra su estado. Después, la respuesta queda legible y seleccionable, con enlaces y acciones accesibles si corresponden. Permitir varias abiertas cuando ayude a comparar condiciones; conservarlas al regresar si la navegación lo permite. Cerrar no debe provocar un salto inesperado de contexto.

Precio, disponibilidad, anticipo, vencimiento, condiciones determinantes y errores de validación deben aparecer en el resumen visible de su tarea. El acordeón amplía la explicación. En equipo, puede recoger historial o ayuda secundaria; una acción urgente y el estado actual del pedido no deben requerir abrirlo.

La estructura propuesta debe incluir encabezados con botones, relación con el panel y estado expandido; Enter/Espacio deben operar el control. [WAI-ARIA APG: Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/). La comprobación puntual de dos preguntas no certifica todos los estados de accesibilidad.

## Compatibilidad: adaptar el mecanismo, comprobar la versión

El manifiesto local declara React 18, Vite 6, Tailwind 3 y Motion 11; el paquete instalado de Motion es 11.18.2 y exporta `motion/react`. El rastreo de `src/casa` no encontró importaciones de Motion. Que exista esa dependencia no significa que las pantallas ya tengan el sistema propuesto.

| Patrón | Encaje previsto | Límite concreto |
| --- | --- | --- |
| Selección de categorías | CSS o adaptación puntual con Motion existente; iconos locales | El control mostrado carece de los paneles/teclado necesarios para ser una pestaña completa. Corregir movimiento reducido y disposición móvil. |
| Producto | Estructura propia sobre componentes y fotos de Lupita | Sin licencia visible en la ficha: referencia visual; no copiar código. El detalle debe diseñarse sobre las primitivas locales. |
| Confirmación | Avisos y estado persistente actuales | Sonner no está declarado directamente. Su adopción no resuelve el resultado de servidor ni el historial. |
| Acordeón | Expansión breve sobre una primitiva revisada | La fuente de origen actual no es idéntica al bundle observado; revisar dependencias recursivas antes de cualquier adopción. |

**Diferencia verificada de Hirael:** la [fuente actual de faq-06](https://hirael.com/r/faq-06.json) declara `dependencies: []` y referencias a `accordion.json` y `badge`; su contenido importa primitivas locales y utilidades. La [fuente de accordion](https://hirael.com/r/accordion.json) declara `radix-ui` y `lucide-react`. La ficha de 21st declara Motion y su demo incluye efectos de entrada. Por tanto, el inventario de dependencias de la ficha no basta para presupuestar la versión actual ni garantiza que se instale el comportamiento visto. [Metadatos conservados](evidencia/interacciones/fuente-hirael.json).

MIT es la licencia declarada por las fichas de tabs, acordeón y toast, no una auditoría de todos los archivos y activos derivados. Si se reutiliza código, registrar la versión concreta y conservar los avisos que correspondan. Las fotografías, textos comerciales y datos de las demos no pasan al catálogo de Lupita.

## Movimiento reducido y escala de pantalla

| Demo medida | Movimiento normal observado por muestreo | Al activar movimiento reducido |
| --- | --- | --- |
| Tabs segmentadas | Posiciones intermedias del indicador | Sigue desplazándose; requiere adaptación. |
| Producto | Escala progresiva de 1 a 1,05, transición de 0,3 s | Sigue aumentando de escala; requiere adaptación. |
| Acordeón | Altura intermedia del panel, animación de 0,2 s | Conserva la animación de altura; requiere adaptación. |
| Toast | Entrada desde arriba, transición de 0,4 s | Transición de 0 s; el mensaje permanece visible. |

Son resultados de estas demos/versiones. No generalizan a toda la biblioteca ni prueban la futura integración. Para Lupita, conservar texto, selección y confirmaciones con cambios inmediatos bajo movimiento reducido. Los 120–200 ms para controles y 200–320 ms para superficies del plan siguen siendo propuestas a evaluar; no son mediciones de Lupita ni tiempos obligatorios derivados de las demos.

Las cuatro demos no desbordaron horizontalmente a 390 px, pero eso no equivale a una adaptación móvil satisfactoria: tabs partió su control en dos filas y producto creó una lista muy alta. Hace falta comprobar densidad, acción alcanzable, textos reales y navegación inferior dentro de la página completa.

## Cómo componen pantallas completas

Esta matriz explica el papel de los patrones, sin sustituir el inventario de cobertura existente.

| Superficies de Lupita | Secuencia de uso que debe diseñarse y revisarse |
| --- | --- |
| Inicio, Carta y detalle | Invitación fotográfica → categorías/búsqueda → comparación → detalle/opciones → agregado → resumen. Retornar conserva el contexto del catálogo. |
| Pedido, Tienda y Mis compras | Selección → disponibilidad/condiciones → total y revisión → estado de envío → comprobante/historial. El aviso resume el resultado que también queda registrado. |
| Mi Club y Conocé tu club | Entender beneficio y restricciones visibles → ampliar explicación → seleccionar/canjear → nuevo estado y registro. |
| Reservar y Mis reservas | Elegir visita → consultar disponibilidad → revisar importe/condiciones → confirmar → recuperar o modificar la reserva existente. Los desplegables no ocultan condiciones decisivas. |
| Acceso, Perfil y Cuenta y seguridad | Identificar la acción → campos y validación → envío → estado concreto. Los patrones no crean pasos artificiales ni sustituyen MFA o recuperación. |
| Equipo: Resumen, Pedidos, Caja y Entregas | Detectar pendientes → filtrar sin perder registro → abrir detalle → revisar la acción → resultado del servidor → estado actualizado estable. Sin movimiento de filas durante operación. |
| Equipo: Mi Club, Tienda, Agenda y Atención | Localizar solicitud/artículo/reserva → detalle relevante → modificación permitida → confirmación e historial; mismas etiquetas de estado que ve el cliente cuando corresponda. |
| Equipo: Informes, Clientes, Equipo y permisos | Período/directorio → tabla o ficha → inspección y acción autorizada → resultado verificable. Ayuda secundaria desplegable; datos y permisos actuales visibles. |
| Kit, vacíos, errores, carga y rutas desconocidas | Enseñar también selección sin resultados, ausencia de foto, producto agotado, error recuperable, envío pendiente y confirmación persistente. Ninguna demo cubre este sistema completo. |

## Decisión recomendada antes de continuar

Primero resolver y validar visualmente Inicio, como exige el encargo vigente. Después de esa aprobación, aplicar la dirección a Carta completa y a una superficie operativa de Pedidos que compartan tipografía, color, espaciado y estados de marca, y revisar sus recorridos hasta el resultado. Esas superficies permitirán comprobar fotografía/elección y densidad/operación, sin convertir Inicio en prueba del resto de la app ni reducir el alcance integral a dos módulos.

Al implementarse, cada patrón debe comprobarse con datos sintéticos, teclado/foco, textos reales, viewport móvil/escritorio, movimiento reducido, carga/error/vacío y retorno al contexto. Para operaciones: comprobar también respuesta real, doble activación, fallo y estado persistente. Son criterios futuros de aceptación; este informe solo entrega investigación y evidencia de las referencias.
