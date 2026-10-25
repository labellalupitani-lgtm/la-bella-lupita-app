# Auditoría de ejecución visual — propuesta v2

Fecha: 29 de septiembre de 2026. Inspección directa de `resumen-v2.png` (1440 × 1218), `direccion-v2.png` (1440 × 850) y `pantalla-inicio.png` (390 × 844), contrastada con `pantallas.css`. Investigación: tres búsquedas, tres fuentes primarias consultadas. No se ha editado la app ni el diseño.

## Diagnóstico

La ejecución no fracasa por falta de limpieza. Fracasa porque confunde limpieza con dirección artística: organiza bloques correctos, pero no construye un mundo visual memorable. La página de presentación promete sofisticación con una serifa grande mientras las pantallas vuelven al patrón de logo, título, foto, botón y fila. Hay un salto entre la retórica de marca y la evidencia gráfica.

Cambiar el fondo, cambiar la serifa o añadir unas ondas no resolverá la crítica del usuario. La siguiente versión debe cambiar las relaciones de escala, la composición, la dirección de fotografía y la expresión gráfica propia; esas decisiones tienen que sobrevivir en una pantalla de 390 px.

## Defectos visibles y corrección priorizada

### P0 — Composición sin autoría

- **Evidencia:** en `resumen-v2.png`, los tres teléfonos arrancan con el mismo logo grande, avatar circular, filete y título. Todo usa el mismo fondo plano, sin una secuencia de masas que jerarquice café, comida y pertenencia. La cabecera de cada teléfono consume aproximadamente 102 px de 844 px, más del 12% de su altura.
- **Juicio:** se percibe como tres variantes del mismo wireframe estilizado. Se ha confundido consistencia con repetición.
- **Cambio:** header compacto de 64–76 px como objetivo de diseño, una composición de inicio genuinamente editorial y una tarjeta del club tratada como objeto de pertenencia. Cambiar la composición entre pantallas manteniendo constantes la tipografía, el espaciado y el lenguaje de imagen. Un gran panel fotográfico y una pieza de membresía elaborada deben contrastar con controles deliberadamente sencillos.

### P0 — Fotografía recortada sin dirección

- **Evidencia:** en `pantalla-inicio.png`, la imagen mide 342 × 212 px, de x=24 a 366 y aproximadamente y=249 a 461. La mano domina el cuadro, la taza queda cortada arriba y la máscara arqueada reduce aún más el contexto. En la portada de dirección, el plato ocupa casi todo el panel derecho y la comida está rodeada de un fondo gris; el borde y las sombras del plato pesan tanto como el alimento.
- **Juicio:** el recurso parece una imagen disponible encajada en un contenedor, no una fotografía escogida para esa composición. La mano y el arco empujan hacia cosmética/lifestyle y debilitan el apetito gastronómico.
- **Cambio:** escoger primero el encuadre y después el layout. Probar una escena real de mesa con aire para el titular, un detalle apetitoso y una toma de ambiente. Usar proporciones que conserven el sujeto; retirar el arco gratuito. Una foto mediocre ampliada ocupa más pantalla sin producir más calidad. No generar un plato inventado como si fuera parte de la carta real.

### P0 — Señal gráfica propietaria insuficiente

- **Evidencia:** unas líneas onduladas casi paralelas ocupan una esquina de la portada y de la tarjeta. No aparecen en la pantalla de inicio, ni afectan a la composición, ni producen una familia reconocible. Si se elimina el logo, las pantallas pueden pertenecer a cualquier cafetería beige.
- **Juicio:** las ondas se parecen a un adorno de plantilla y no al trazo denso, irregular, ilustrado del cabello del logo. La vinculación conceptual declarada no está visualmente conseguida.
- **Cambio:** desarrollar un solo gesto propio con peso real: grabado/filigrana derivado del dibujo original, marco editorial inspirado en su rectángulo, o sello construido con elementos autorizados de la marca. Debe funcionar a una tinta, tanto aislado como en recorte, y repetirse en al menos tres usos distintos. No sumar ondas + arcos + flores + brillos + sellos: la acumulación tampoco es dirección.

### P1 — Jerarquía tipográfica débil en el producto

- **Evidencia:** el h1 móvil usa Caslon 36 px, peso 400 y tracking -0.04em; el subtítulo de producto usa la misma familia. El logo de 156 px y el título están separados por una línea pero compiten como dos cabeceras. En la lámina, gran titular y abundantes microetiquetas conviven, pero las propias pantallas no heredan la contundencia de escala de la presentación.
- **Juicio:** la Caslon no es el problema. El tamaño moderado, los pesos finos y el uso uniforme sobre crema la hacen parecer una serif por defecto. Un tracking de -0.04em debe juzgarse en el render real, especialmente con el contraste fino de esta tipografía, no aplicarse como receta de lujo.
- **Cambio:** definir 3 roles principales por composición (display, lectura, utilidad), con contraste perceptible. Reservar un gesto tipográfico expresivo para el título de entrada y mantener acciones nítidas en sans. Ajustar tracking y saltos por título; preservar contadores, acentos y serifas a 100%. No usar cursiva como señal automática de sofisticación.

### P1 — Contraste de superficies insuficiente

- **Evidencia:** el fondo de la página, el fondo interior de los teléfonos y buena parte de sus espacios negativos tienen valores muy cercanos. En inicio, casi todos los elementos son café sobre crema; el rosa desaparece. La tarjeta Club es el único bloque de color con masa.
- **Juicio:** se ha transformado la paleta en una restricción monocorde. Pasar contraste WCAG solo comprueba legibilidad, no calidad compositiva.
- **Cambio:** equilibrar bloques de tinta café, papel claro y fotografía, usando el rosa como superficie reconocible y no como confeti. Revisar primero el render en escala de grises: si todo pesa igual, el color no salvará la jerarquía. Evitar oscurecer fotos con capas uniformes que apaguen la comida.

### P1 — Detalles de interfaz mecánicos

- **Evidencia:** la línea activa de la navegación inferior queda encima del icono de casa y puede leerse como un segundo tejado; todos los accesos usan flecha derecha, incluidos el botón, la reserva y el círculo del club. El avatar es una letra M sola dentro de un círculo de 44 px. Los nueve sellos aparecen como una batería de círculos de formulario.
- **Juicio:** funciona como convención, pero no añade carácter. La tarjeta de fidelidad merece más cuidado que un progreso de formulario.
- **Cambio:** navegación activa con fondo suave o icono relleno consistente, sin interferencia con el dibujo. Reservar la flecha para enlaces de avance; el botón principal necesita texto claro, no obligatoriedad decorativa. Dar a los sellos una forma o tratamiento coherente con la marca y mantener exactamente la lógica real de nueve. No introducir una mecánica nueva para lograr una captura bonita.

### P2 — Ritmo vertical correcto pero plano

- **Evidencia:** casi todo se alinea a x=24 en móvil. Esto es coherente, pero título, imagen, producto, CTA, reserva y club se apilan sin grupos de mayor y menor intensidad. El espacio bajo Club de la tercera pantalla es grande y no se compensa con la masa superior.
- **Juicio:** no falta alineación; falta composición dentro de esa alineación.
- **Cambio:** retícula de 4/8 px como disciplina, con separaciones cortas dentro de grupos y más amplias entre grupos. El espacio vacío debe enmarcar un elemento dominante, no ser simplemente el sobrante de un flex column.

## Fuentes y qué sostienen realmente

1. [Nielsen Norman Group — Good Visual Design, Explained, 14 noviembre 2025](https://www.nngroup.com/articles/good-visual-design/). Fuente primaria de recomendaciones de diseño. Describe retículas, jerarquía mediante tamaño, paleta estratégica e imágenes con propósito. Respalda evaluar alineación, orden de lectura y utilidad de imagen. Su regla de tres tamaños es una guía, no una prohibición técnica. No demuestra que una fuente o paleta concreta sea superior para Lupita.
2. [Google Material Design — Understanding layout](https://m2.material.io/design/layout/understanding-layout.html). Documentación primaria, de una versión histórica. Propone medidas sobre 8 dp y ajustes de 4 dp para iconos y tipografía como mecanismo de ritmo consistente. Se usa aquí como disciplina medible de espaciado, no como receta estética ni declaración de que toda interfaz deba parecer Material.
3. [Pentagram — Parla](https://www.pentagram.com/work/parla). Caso primario de una identidad de restaurante y café. Muestra tipografía expresiva, símbolos derivados del nombre y producto, patrones y aplicaciones físicas; el carácter se sostiene en un sistema de elementos relacionados. Es un precedente de método, no evidencia causal ni licencia para copiar su estética. La lección útil para Lupita es construir extensiones propias del logo y del lugar real, en vez de un ornamento intercambiable.

Las decisiones exactas de proporción, gusto fotográfico y sofisticación de esta auditoría son juicios de diseño. Deben comprobarse con renders comparativos y, finalmente, con el usuario. Ninguna fuente convierte la propuesta en “perfecta”.

## Rúbrica para criticar los próximos renders

Puntuar 0–5 por criterio; 0 ausente, 3 competente, 5 distintivo y ejecutado con precisión. Para considerar una v3 lista para enseñar: 32/40 como mínimo, ningún criterio debajo de 3 y todos los defectos P0 anteriores resueltos.

| Criterio | Prueba visual concreta |
|---|---|
| Reconocimiento | Ocultar el logo: ¿quedan al menos dos señales coherentes que permitan reconocer esta propuesta frente a un café genérico? |
| Composición | Reducir la captura al 25%: ¿se reconoce un foco y una secuencia de masas, sin leer el texto? |
| Fotografía | A 100%, ¿el sujeto está entero o cortado con intención, resulta apetitoso y conserva luz, textura y nitidez? |
| Tipografía | Revisar títulos a 100% y 200%: ¿saltos, espaciado, acentos y pesos parecen resueltos, sin choques ni uniones accidentales? |
| Espaciado | Superponer guías: ¿márgenes y ejes coinciden, el ritmo distingue grupos y no hay separaciones accidentales de 1–3 px? |
| Color y superficies | Ver en escala de grises: ¿jerarquía y estados sobreviven? Volver al color: ¿la marca se siente presente? |
| Detalle de componentes | Revisar iconos, filetes, flechas, sellos, radios, estados activos y recortes a 200%; ¿pertenecen al mismo sistema? |
| Viabilidad móvil | Ver a 390 y 360 px, y texto aumentado: ¿el resultado conserva intención, controles legibles y producto real sin depender de miniaturas? |

### Rechazos automáticos

- Se ve prácticamente igual que v2 al observar ambas capturas pequeñas.
- Se hace una nueva portada espectacular, pero las pantallas de aplicación siguen sin personalidad.
- Se inventan imágenes de menú, precios, recompensas o promesas para embellecer la composición.
- La decoración dificulta lectura o tapa el sujeto.
- El avance se defiende con un párrafo explicativo que no puede verse en la imagen.

### Orden de revisión

Primero composición y dirección de imagen al 25–50%; después tipografía y espaciado al 100%; por último rasterización, líneas, iconos y bordes al 200%. Mirar “píxel a píxel” antes de resolver composición solo pule una solución débil.
