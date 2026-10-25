# Revisión independiente de acabado — Inicio

**Dictamen: PASS de acabado visual.** No equivale a aprobación del usuario ni certifica por sí solo la revisión funcional, de accesibilidad o de rendimiento.

Revisión del 21 de octubre de 2026 sobre `http://127.0.0.1:5190/__preview/entrar`, datos sintéticos locales, Playwright con Microsoft Edge. Se leyó únicamente `bar.md` como criterio de diseño, se observaron los cuatro referentes originales indicados y se inspeccionó la interfaz renderizada. No se leyó TSX/CSS, informes del constructor ni dictámenes de otros críticos. No se modificó la aplicación.

## Elección visual y comparación de la misma tarea

Para un **Inicio de cliente recurrente**, elegiría la composición actual de La Bella Lupita frente a las pantallas de catálogo suministradas. La identidad está presente sin competir con el pase; la taza tiene contexto humano y marca visible; inmediatamente después aparecen platos distinguibles y precios claros. A 390 px hay dos elecciones completas antes de la navegación inferior. La relación entre marca, foto y elección resulta coherente para un bistró con café y comida, y no depende de estrellas, beneficios o variantes inventados.

La pantalla central de `coffee-shop.jpeg` sigue siendo el referente más fuerte para explorar muchas opciones rápidamente: reúne búsqueda, categorías y cuatro productos en poco espacio. La pantalla izquierda de Pinterest concentra muy bien la atención en un producto y usa un solape convincente, aunque ofrece menos elección simultánea. El catálogo derecho de Dribbble logra una silueta de producto más protagonista y mayor separación respecto al fondo; su composición secundaria es más compleja que la fila de platos de Lupita. En `ios-coffee.jpeg`, el recorte limpio hace muy reconocible cada bebida, pero las vistas individuales no son una comparación equivalente al Inicio completo. Las pantallas de bienvenida se usaron únicamente para observar dirección fotográfica.

**Mayor brecha concreta:** la fotografía introductoria de Lupita demora la exploración respecto al catálogo central de coffee-shop. En 320 × 568, la cabecera se divide en dos filas y la primera pantalla queda casi enteramente ocupada por identidad y taza; el titular y la carta requieren desplazamiento. Es una concesión visible, no un incumplimiento del criterio, que permite desplazamiento en ese tamaño. Si se busca una siguiente mejora, probar primero una altura menor de franja para pantallas cortas conservando la taza completa, y comparar cuánto adelanta el titular y el primer producto. No reducir texto ni encoger el pase para obtenerlo.

## Evidencia observada

- **390 × 844:** foto de borde a borde, sujeto reconocible y color natural. “Una pausa rica”, “De nuestra cocina” y los nombres/precios forman niveles distinguibles. Pizza y risotto muestran foto, nombre y precio completos; sus tarjetas terminan en y=765, antes de la navegación inferior. El pase mide 44 px de alto y está disponible sin desplazar. El tercer producto parcialmente visible comunica continuidad horizontal.
- **1440 × 1000:** el díptico ocupa todo el ancho. Taza y plato conservan forma y contexto; ningún texto tapa la comida. Los tres productos aparecen con imagen, nombre y precio dentro del primer encuadre, hasta y=991. El encabezado de la sección mantiene su rango frente al titular. La comida conserva color propio sobre la superficie clara.
- **768 × 1024:** la taza ocupa más superficie, pero sigue siendo inequívoca y su marca se lee. Los tres platos completos con nombre y precio aparecen antes de la navegación. No hay cajas anidadas en el catálogo.
- **320 × 568:** el pase sigue accesible al inicio. Tras desplazar, producto y acciones se leen sin comprimir letra. Al enfocar Dulce Tentación, el carrusel desplaza la tarjeta completa a la vista. No hay overflow horizontal de página en ninguno de los cuatro tamaños medidos.
- **Selección:** cada producto comparte la misma anatomía y proporción. La flecha y la tarjeta completa permiten reconocer la acción; no depende del hover. El foco dibuja el perímetro de la tarjeta y conserva su información. Al abrir Pizza Churrasco aparecen su nombre, la misma fotografía y C$ 670 en el flujo existente. En la comprobación local de regreso, la sección de productos permaneció en contexto. Esto no sustituye la revisión de estados concurrentes por el crítico funcional.
- **Profundidad:** fotografía, banda de titular y carta se separan por superficie, escala y espacio. No se necesita un recorte artificial ni sombras equivalentes en cada bloque. Más abajo hay tarjetas para cuenta, sellos y avisos que corresponden a tareas diferentes; no duplican la presentación del catálogo.

No observo un defecto de acabado que obligue a otra ronda antes de la revisión humana. La oportunidad sobre altura del hero en pantallas cortas queda como refinamiento concreto, sin convertirla en una condición añadida al `bar.md`.

## Capturas propias

- [390 × 844, primer encuadre](evidencia/acabado/390x844-viewport.png)
- [320 × 568, primer encuadre](evidencia/acabado/320x568-viewport.png)
- [320 × 568, carta tras desplazar](evidencia/acabado/320-productos-scroll.png)
- [1440 × 1000, primer encuadre](evidencia/acabado/1440x1000-viewport.png)
- [768 × 1024, primer encuadre](evidencia/acabado/768x1024-viewport.png)
- [Foco visible de producto](evidencia/acabado/390-foco-producto.png)
- [Tercer producto alcanzable por foco a 320](evidencia/acabado/320-tercer-producto-foco.png)
- [Producto abierto, transición terminada](evidencia/acabado/390-producto-abierto.png)
- [Regreso al contexto de productos](evidencia/acabado/390-regreso.png)
- [Mediciones de geometría](evidencia/acabado/mediciones.json)

Las capturas de comparación se observaron sin rótulos superpuestos de preferencia o de calidad. Los originales usados fueron `1060034831036382763-image-browser.png`, `composicion.png`, `coffee-shop.jpeg` e `ios-coffee.jpeg` de la carpeta de investigación.
