# Sexta composición de Inicio · implementación

La entrada se organizó alrededor de la exploración: marca, pase y actualización comparten cabecera; una franja de fotografía natural abre el contenido y deja sitio para productos completos. No se alteraron otras pantallas, datos, reglas de negocio ni dependencias.

- Móvil: café propio a todo el ancho, 280 px de alto. Título y acción sobre superficie clara fuera de la fotografía. Dos tarjetas completas y un adelanto de la tercera en 390 × 844.
- Escritorio: díptico continuo de café y desayuno propios, sin marcos ni separación, 390 px de alto. La combinación evita forzar una fotografía cuadrada a un panorama que oculte el sujeto. Los tres nombres y precios quedan visibles en 1440 × 1000.
- La firma conserva archivo/proporción: 120 px móvil y 144 px escritorio, con reserva H/4. Son tamaños de interfaz comprobados, distintos de los mínimos propuestos para otros usos en el manual.
- Tarjetas editoriales: foto, nombre Playfair, precio Montserrat y flecha. Sin cajas anidadas. La lista móvil se desplaza con gesto o teclado; el foco trae la tarjeta completa por encima de la barra inferior.
- El pase y la actualización mantienen sus controles y estados mediante un portal resuelto antes del pintado. Las alertas y el seguimiento de pedido/reserva continúan antes de la fotografía.
- Al abrir un plato se conserva cuenta, producto, desplazamiento de lista y de página. Al regresar desde Carta se restaura y consume ese contexto. Un pedido/reserva/error prioritario impide restaurar el desplazamiento antiguo. Otro perfil o cuenta no reutiliza ese foco.

## Verificación del constructor

`npm run check` y `node scripts/guardian-tokens.mjs` pasan. Capturas y medidas: `inicio-390.png`, `inicio-1440.png`, `inicio-320.png`, `medidas.json`. La tarjeta móvil completa termina en y759, antes de la navegación; las tres de escritorio terminan en y985. Incluyen el aviso local.

`comprobar.mjs` verificó retorno por historial a320 y390: producto enfocado, scroll de página y lista idénticos. `retorno.mjs` verificó cerrar la ficha y navegar a Inicio con el mismo resultado, una única herramienta de pase en la cabecera y ninguna franja de respaldo. Las capturas `texto200-*.png` documentan ampliación: sin overflow horizontal de página; se admite desplazamiento.

Esto es evidencia del constructor. No sustituye la revisión independiente ni la aprobación visual del usuario.


## Ronda 2 · correcciones de la revisión de marca

- El foco de la firma conserva el contorno externo a 18 px en escritorio y 15 px en móvil, y elimina la sombra interior heredada. El espacio entre filas de la cabecera pasa a18 px cuando los controles envuelven, manteniendo H/4 también en320.
- La navegación de Inicio reparte los cinco destinos en una fila normal y en dos filas de3+2 cuando el texto necesita más ancho. Las etiquetas conservan palabras completas; no se reduce el tamaño de texto.
- Un ResizeObserver limitado a Inicio mide la altura de la barra. La reserva final y el margen de desplazamiento usan esa medida; el foco de controles se mantiene por encima de la barra. El observador y la variable se limpian al salir de Inicio.
- El srcset del Risotto declara sus anchos reales240/283/567w. En escritorio se descarga el archivo960 de567×960 en lugar de ampliar el archivo480 de283×480. No se modificaron las fotografías ni la ficha de Carta.

Verificación: `ronda2.mjs` reproduce la ampliación del crítico duplicando el font-size calculado de cada nodo, sin cambiar viewport ni font-size raíz. En320 y390 las cinco etiquetas tienen24 px y una sola línea cada una. La barra crece a202,59 px y la reserva final a238,59 px. El último control de contenido enfocado queda36 px por encima de la barra. Sin desbordamiento horizontal.

En normal390 permanecen dos productos completos hasta y765,39, antes de la barra en y771; en1440 los tres terminan en y990,81. `ronda2-medidas.json` y capturas `ronda2-*.png` conservan la evidencia. Los retornos por historial y cerrar→Inicio siguen conservando producto, foco y ambos desplazamientos. `npm run check` y guardián de tokens pasan nuevamente. Fuentes congeladas para la recompilación y revisión independientes.

## Ronda 3 · retorno con seguimiento prioritario

Descartar el contexto de la tarjeta no cancelaba la restauración de scroll nativa del historial. Ahora la restauración espera que termine la revalidación inicial de Inicio y que el contexto actual deje de cargar. Si aparece pedido, reserva o error prioritario, después de dos fotogramas se desplaza al seguimiento y se enfoca su acción. La selección de producto se consume después de completar ese cambio.

`prioritario.mjs` reproduce scroll450→Pizza→nuevo pedido→browserBack con respuesta inmediata y demora800 ms. En ambos casos la acción «Seguir mi pedido» queda enfocada en y49–93, con scroll137, por encima de la barra. Evidencia en `retorno-prioritario.json` y `retorno-prioritario-0.png`/`retorno-prioritario-800.png`. No se cambió la composición.

Los retornos normales por historial320/390 y cerrar ficha→Inicio mantienen exactamente foco, scroll de página y scroll de lista. TypeScript y guardián de tokens pasan. La regresión independiente de pedido/reserva la coordina el agente principal.
