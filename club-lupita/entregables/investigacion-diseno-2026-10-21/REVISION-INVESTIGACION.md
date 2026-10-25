# Revisión independiente de la investigación

21 de octubre de 2026. Revisión acotada de la síntesis y su trazabilidad. Se leyó `LEEME.md`, el contenido de `panel-referencias.html`, los cuatro informes de apoyo y la evidencia pertinente. Solo se escribe este informe; no se modifica la aplicación, sus pruebas ni sus despliegues.

## Dictamen

La investigación aporta un diagnóstico fundamentado y una dirección utilizable: conservar la fotografía a todo el ancho y mejorar su relación con la elección de productos. No encontré una atribución falsa de autor, una cifra material contradictoria ni una declaración de que exista ya una nueva interfaz. El alcance integral permanece documentado.

Las dos precisiones documentales detectadas quedaron corregidas y se releyeron: el papel del borgoña figura como decisión propuesta de interfaz y la secuencia de trabajo conserva Inicio primero. **No quedan hallazgos materiales abiertos dentro del alcance de esta revisión.**

Este dictamen evalúa la investigación. **No aprueba una sexta portada, no certifica el rediseño de la aplicación y no sustituye la validación visual del usuario.**

## Hallazgos corregidos y revalidados

### R1 · Origen de la función asignada al borgoña — P2 documental, cerrado

**Ubicación:** `panel-referencias.html`, línea 29, sección «La marca aporta la dirección».

La frase inicial «el borgoña señala acciones» aparecía junto a reglas expresas de tipografía, fotografía e integridad del logo. Esa presentación permitía leer el papel de color como otra obligación del manual. La página 16 solo identifica borgoña, coral y rosa como acentos; no prescribe que los botones o las acciones deban ser borgoña. `MARCA.md`, sección 5, separa correctamente los roles del manual de su traducción propuesta. `REFERENCIAS-PINTEREST.md` también sitúa esa asignación en una adaptación razonada.

**Corrección verificada:** el panel ahora dice «Como decisión de interfaz, proponemos reservar el borgoña para acciones o énfasis concretos, con contraste comprobado». Separa el origen de esa decisión sin cambiar la paleta ni la aplicación. Hallazgo cerrado tras releer la línea 29.

### R2 · Secuencia posterior a la investigación — cerrado

La primera lectura de `INTERACCIONES.md`, en «Decisión recomendada antes de continuar», proponía preparar Carta y Pedidos sin situarlos expresamente después de Inicio. Esto dejaba una secuencia ambigua respecto al cierre de `LEEME.md`, el panel y `PLAN-100.md`.

La versión releída ya dice: «Primero resolver y validar visualmente Inicio» y después aplicar la dirección a Carta y Pedidos, sin reducir el alcance a esos dos módulos. La corrección resuelve la ambigüedad y conserva la validación humana. No exige otra ronda de preguntas para producir la propuesta.

## Comprobaciones sustantivas

| Punto auditado | Resultado y evidencia |
| --- | --- |
| Autoría y número de referencias | La síntesis mantiene cuatro diseños para cinco entradas: el segundo pin y Bacancy corresponden a la misma propuesta; W1 y W2 siguen sin autor confirmado. El registro de acceso distingue republicación, autor y límites del extractor. No se atribuyen los JPEGs a los autores de los pines. |
| Observación frente a inferencia | Los informes distinguen controles dibujados de gestos, animaciones o compra funcional. La lectura visual de P1 y Bacancy sostiene la diferencia entre bienvenida, catálogo y detalle; no demuestra esos recorridos en ejecución. La jerarquía recomendada para Lupita está presentada como conclusión de diseño. |
| Manual real | La inspección de p.11 confirma los mínimos propuestos y el nombre próximo al símbolo; p.16 confirma los cinco HEX y los roles base/acento; p.28 confirma luz suave, color real, textura, vajilla y aire. La síntesis reconoce marfil como decisión del proyecto y no convierte 280/320 px en un intervalo obligatorio. La precisión de atribución R1 quedó resuelta. |
| Cifras del diagnóstico | En el registro de la quinta composición, la foto móvil empieza en y=188 y mide 499,1875 px; el aviso mide 47 px, por lo que quedan 141 px previos. En escritorio termina en y=921,734375. Las capturas coinciden con la descripción: los nombres/precios móviles no entran en la primera vista y en escritorio apenas aparece el siguiente título. |
| Contraste | El CSV conservado da cacao/coral = 4,486:1. `LEEME.md` y `MARCA.md` lo tratan como inferior a 4,5:1; no redondean el resultado para aprobarlo. |
| Interacciones | El registro conserva preferencia reducida activada y muestras intermedias en tabs, producto y acordeón; el toast registra transición de 0 s. El clic de producto no abre diálogo ni cambia URL; la acción del toast tampoco navega. La síntesis respeta esos límites y no promete que Lupita ya tenga esos comportamientos. |
| Fotografía y funciones | La dirección conserva expresamente la foto a todo el ancho. La menor altura y el producto completo antes de la barra se etiquetan como objetivos nuevos, aplicables al estado normal y con excepciones por texto ampliado/pantallas cortas. Se mantienen pase, actualización, precio, disponibilidad, carrito y respuesta real. No se atribuye al manual permiso para eliminar funciones. |
| Alcance y aprobación | `COBERTURA.json` contiene 77 entradas, 11 rutas y 12 secciones del equipo. Son superficies y familias, no un porcentaje de avance. La síntesis preserva el 100 % como alcance pendiente, Inicio como siguiente implementación y la aprobación humana; los PASS previos no se extienden a toda la app. |
| Estado de entrega | El panel declara que es investigación y que la portada vigente sigue sin aprobación visual. La carpeta de preservación contiene `dist`, las fuentes de Inicio/navegación/CSS y su registro. No se presenta la dirección futura como una UI implementada. |

## Evidencia visual inspeccionada en esta revisión

- [P1 exacto de UIDesignz](evidencia/pinterest/1060034831036382763-image-browser.png): la misma taza conecta catálogo y detalle, con solape de superficies y nombre/precio próximos.
- [Composición de Bacancy](evidencia/dribbble/composicion.png): bienvenida distinta de exploración; el vaso que rebasa el teléfono pertenece a la presentación del concepto.
- Manual: [p.11, versiones de firma](evidencia/marca/pagina-11.png), [p.16, paleta](evidencia/marca/pagina-16.png) y [p.28, fotografía](evidencia/marca/pagina-28.png).
- Quinta composición: [390 × 844](../inicio-inmersivo-2026-10-21/evidencia/despues-390-viewport.png) y [1440 × 1000](../inicio-inmersivo-2026-10-21/evidencia/despues-1440-viewport.png).

No se añadieron fuentes nuevas ni se repitió una auditoría funcional de la aplicación. Las interacciones se contrastaron con el registro conservado, sin volver a ejecutar las demos. La calidad de una futura composición y su integración en todas las superficies solo podrán juzgarse sobre esa implementación y sus estados reales.
