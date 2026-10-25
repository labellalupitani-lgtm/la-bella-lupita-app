# La casa, puesta en escena

## Propósito

Una app de cafetería y membresía en Managua. Permite explorar la carta, preparar un pedido para retirar en Plaza La Fe, consultar el pase y planear una visita. La apariencia debe expresar hospitalidad y cuidado por el café. El prototipo explora tres piezas del sistema; las compras y reservas son simuladas y se identifican como tales fuera de los recorridos del producto.

## Identidad y contenido

Usar la marca real `public/brand/logo-lockup-hero.webp`, sin alterar ni redibujar. Fotografías reales: latte con logo, terraza, salón VIP y productos del catálogo. No emplear la bolsa de espresso líquido para vender café en grano. No inventar premios, testimonios, existencias, ingredientes, precios ni atributos de espacios. Los productos/precios proceden de `src/data/menu.ts`; nombres y descripciones pueden abreviarse sin cambiar su significado. Datos de socio y reserva identificados como ejemplos.

## Paleta

Verde casa #1D4632, verde profundo #163526, papel #F8F3E7, avena #E9DFC9, tinta #16120F y oro claro #E7C37A. Verde y papel son los planos dominantes. Oro sólo en identidad del socio o detalle de marca. Achiote #AF3C1C puede servir a un estado que lo necesite, no como confeti decorativo. Texto auxiliar #5C5347 sobre papel. Texto claro sobre verde.

## Tipografía

Libre Caslon Text para títulos con personalidad y Work Sans para navegación, descripciones y cifras. No añadir una tercera familia. Titulares pueden crecer hasta 80 px en escritorio y 46 px en móvil. Texto de lectura de 15–17 px, información secundaria nunca inferior a 12 px. Sólo un gran gesto tipográfico por pantalla. Evitar etiquetas mayúsculas espaciadas y numeraciones de adorno repetidas.

## Composición

El catálogo combina una apertura fotográfica con una carta legible, agrupada por categoría. Ancho máximo aproximado de 1240 px con márgenes variables. Precio, descripción breve y acción juntos. El espacio sin fotografía es una carta tipográfica deliberada; nunca un marcador vacío. No rodear cada fila de un rectángulo. El carrito puede usar un panel lateral en escritorio y abrirse desde una acción compacta en móvil. Las superficies corresponden a funciones: papel para carta, verde para marca/pase, fotografía para producto/lugar.

Botones de al menos 44 px de alto; los textos se acomodan al ancho. Controles de cantidad consistentes en listado, detalle y pedido. Las acciones principales dicen lo que ocurre y, cuando se añade un producto, su precio. Radios pequeños en controles y medios en paneles, sin convertir todos los contenidos en tarjetas. El carnet puede sentirse como un objeto físico, pero la decoración no tapa identificación ni beneficio.

## Movimiento

Una entrada coordinada breve como máximo. Transiciones de selección de 200–300 ms; detalle y cambio de vista de 350–450 ms; respuesta de cantidades de 160–220 ms. Las acciones actualizan el estado sin esperar una animación. Apertura y cierre deben tener salida visible. No partículas, fondos animados en bucle, cursor personalizado ni scroll secuestrado. Movimiento reducido suprime desplazamientos y giros conservando estado, foco y legibilidad.

## Criterios funcionales del prototipo

Buscar «capuchino» encuentra Cappuccino. Cambiar de categoría no borra el pedido. Sumar/restar actualiza total y permite vaciarlo. Detalles con cierre visible y Escape; foco vuelve al activador. Ninguna operación llama al backend. Club separa premio disponible del siguiente objetivo, nueve visitas por premio. Terraza/VIP muestran su propia foto. El retroceso dentro de reserva conserva fecha y grupo. Sin botones decorativos que aparenten ejecutar una función no disponible.

Esta dirección revisa la composición anterior de forma deliberada. No cambia el sistema de producción ni sus reglas de negocio hasta su integración y verificación.

## Restricción de contenido confirmada tras la ronda 1

El propietario confirmó que las imágenes de mesas y sillones del Salón VIP en el sitio oficial son de referencia. El retrato local de café tampoco documenta la distribución del salón. Se retira esa representación de la propuesta y se admite una composición tipográfica provisional con información acreditada, sin inventar equipamiento ni capacidad. El criterio de mostrar una foto auténtica por zona se mantiene pendiente para el resultado final: no puede darse por satisfecho con una imagen referencial ni con esta alternativa sin foto.
