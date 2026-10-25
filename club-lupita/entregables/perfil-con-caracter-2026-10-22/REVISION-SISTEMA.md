# Revisión Sistema — ronda 1

Revisión independiente del 22 de octubre de 2026. Criterio: `design-system.md`. Evidencia: capturas de `pruebas-r1/` y resultados de pruebas suministrados en esa carpeta. No se ha leído la implementación ni se han ejecutado operaciones en la aplicación.

| Pieza | Veredicto |
|---|---|
| Preferencias y celebración | **PASS** |
| Identidad y movimiento, aspecto visual | **PASS** |
| Cuenta, datos y ayuda | **FAIL** |

## Preferencias y celebración — PASS

- En `gusto-390-normal-completo.png` y `gusto-1440-normal-completo.png`, la banda cacao, las superficies crema y rosa, el acento borgoña y la combinación visual de títulos serif con controles sans conservan la identidad indicada. Los bordes son selectivos y los controles permanecen redondeados.
- Las capturas `gusto-{320,390,768,1440}-texto200-completo.png` conservan el texto largo de la bebida, el día y mes y la advertencia de alergias. El crecimiento vertical y la recolocación de la fotografía evitan recortar esos contenidos.
- `cumple-sin-fecha-390-completo.png` muestra «Añadí tu fecha · opcional»; `cumple-febrero-390-completo.png` muestra «29 de febrero». Ambos conservan la misma jerarquía. La ilustración de cumpleaños no va acompañada de precio, premio, regalo, entrega o afirmación comercial. «Guardado» es una etiqueta visible de estado; esta revisión no certifica la acción que la produjo.
- La fotografía de bebida lleva «Un momento en la casa», sin presentarse como ficha con atributos o precio. La advertencia de confirmar alergias antes de pedir permanece visible. No se detecta una promesa de recompensa en las capturas examinadas.

No se identifica una infracción visual suficiente para devolver esta pieza al constructor.

## Identidad y movimiento, aspecto visual — PASS

- En las tres pestañas a 390 y 1440 px, la identidad conserva el mismo monograma, nombre editorial, fecha de pertenencia, enlace de edición y navegación segmentada. El nombre largo permanece íntegro al 200 % en las cuatro anchuras examinadas.
- La pestaña activa se distingue por relleno cacao y texto claro; las otras dos mantienen texto legible sobre crema. En `editar-foco-320-texto200-viewport.png`, «Editar mi perfil» tiene un contorno borgoña claramente visible y no queda tapado por la navegación inferior.
- `editor-bebida-390-borrador-viewport.png` conserva foco visible, jerarquía de edición y la explicación de conservación del borrador.
- Como evidencia indirecta, `resultados.json` registra el desplazamiento del indicador y, con movimiento reducido, transición y animación `0s` y cero animaciones activas. Los PNG por sí solos no permiten juzgar el movimiento ni certificar teclado o devolución de foco.

No se identifica una infracción visual suficiente para devolver esta pieza al constructor.

## Cuenta, datos y ayuda — FAIL

**Único mayor problema: la instrucción del selector «Motivo» se recorta con el texto al 200 %.**

En `datos-320-texto200-completo.png`, `datos-390-texto200-completo.png` y `datos-768-texto200-completo.png`, el control de «Una nueva consulta» no muestra completa la frase «Elegí el motivo de tu consulta». La captura `datos-1440-texto200-completo.png` sí muestra la frase íntegra. Es una pérdida visible de texto en un control justo al iniciar una consulta, incompatible con el requisito de reflujo y legibilidad del sistema. No atribuyo a ese recorte un fallo de interacción ni de lector de pantalla.

**Corrección que debe poder comprobarse:** hacer que la instrucción inicial sea íntegramente visible en el control o inmediatamente junto a él a 320, 390 y 768 px con texto al 200 %, sin reducir el tamaño de texto. Repetir esas tres capturas. El texto complementario de «Motivo elegido» que aparece tras seleccionar una opción en `datos-390-confirmada-completo.png` no resuelve el estado inicial señalado.

El saldo y los movimientos monetarios permanecen legibles en las capturas examinadas, incluido `cuenta-390-texto200-saldo.png`; dinero y puntos tienen bloques y unidades distintos. La restricción de verificar identidad para cambiar datos de acceso, el estado de verificación y la preferencia de comunicaciones permanecen visibles. Esos elementos no añaden otro motivo de fallo.

## Alcance y límites de la evidencia

- Se examinaron capturas normales a 390 y 1440 px; capturas con texto al 200 % a 320, 390, 768 y 1440 px de las tres pestañas; cumpleaños vacío y febrero; foco, editor focal, confirmación de ayuda e historial.
- Los nueve archivos `axe-*.json` contienen listas vacías de incidencias. `resultados.json` registra diez comprobaciones aprobadas, cero errores y cero conexiones externas. Esto es evidencia indirecta suministrada, no una ejecución independiente de esta revisión.
- No se observa un problema de contraste de texto en lo revisado. Axe sin incidencias no convierte esta revisión en una certificación completa de accesibilidad.
- Las capturas permiten juzgar apariencia, contenido visible y recortes. No demuestran el alojamiento local de las fuentes, el uso de `theme()`, la procedencia documental de las imágenes, todas las reglas de negocio ni la persistencia de datos. Los PASS se limitan a la evidencia renderizada y a los resultados indirectos citados.

---

# Revisión Sistema — ronda 2

La revisión de ronda 1 se conserva arriba. Esta revisión usa exclusivamente las nuevas capturas y resultados de `pruebas-r2/`, con el mismo `design-system.md`; no se leyó implementación ni se operó la aplicación.

| Pieza | Ronda 1 | Ronda 2 |
|---|---|---|
| Preferencias y celebración | PASS | **PASS** |
| Identidad y movimiento, aspecto visual | PASS | **PASS** |
| Cuenta, datos y ayuda | FAIL | **PASS** |

## Preferencias y celebración — PASS

En `gusto-390-normal-completo.png` y `gusto-1440-normal-completo.png`, la bebida larga dispone de todo el ancho del bloque de texto y la fotografía queda debajo. La escala mantiene la jerarquía editorial y el texto no se recorta. Las cuatro capturas `gusto-{320,390,768,1440}-texto200-completo.png` conservan el contenido largo, la fecha, las acciones y la advertencia de alergias. Persisten la paleta cacao/crema/rosa/borgoña, los títulos serif y los controles sans redondeados.

Se reexaminaron `cumple-sin-fecha-390-completo.png` y `cumple-febrero-390-completo.png`: el primer estado sigue indicando que añadir la fecha es opcional y el segundo muestra «29 de febrero». No se añade ninguna promesa visible de recompensa, producto o entrega. La fotografía sigue descrita como «Un momento en la casa». No hay un nuevo incumplimiento visual del sistema.

## Identidad y movimiento, aspecto visual — PASS

La cabecera ya no incluye la fotografía pequeña de ambiente. Nombre, monograma, antigüedad y acción de edición mantienen una jerarquía consistente entre las tres pestañas. Las capturas normales a 390 y 1440 px y las de texto al 200 % en las cuatro anchuras conservan los nombres largos mediante reflujo.

`editar-foco-320-texto200-viewport.png` vuelve a mostrar el enlace de edición con contorno borgoña visible, separado de la navegación inferior. `editor-bebida-390-borrador-viewport.png` conserva el foco y la explicación de protección del borrador. El registro de movimiento reducido en `resultados.json` vuelve a indicar transición y animación `0s`, con cero animaciones activas. Es evidencia indirecta; no se atribuye movimiento ni comportamiento de teclado a los PNG.

## Cuenta, datos y ayuda — PASS

**El único fallo de ronda 1 queda resuelto.** En `datos-320-texto200-completo.png`, `datos-390-texto200-completo.png`, `datos-768-texto200-completo.png` y `datos-1440-texto200-completo.png`, el selector inicial muestra íntegramente «Elegí…», con la etiqueta «Motivo» inmediatamente encima. El texto breve funciona como instrucción completa en ese contexto; la elipsis forma parte del texto elegido y no es un recorte accidental. La medida suministrada para 320 px registra 100,58 px de texto frente a 204 px disponibles.

Los paneles de datos y ayuda se apilan cuando aumenta el texto; en 320 y 390 px, el teléfono se ve íntegro bajo su etiqueta. Los estados «Sin correo vinculado» y «Sin verificación registrada», la restricción de comprobar identidad y la preferencia de promociones siguen presentes. La captura confirmada conserva la explicación de qué hace y qué no hace la solicitud antes del botón de envío.

Las cuatro capturas `cuenta-{320,390,768,1440}-texto200-completo.png` conservan el saldo completo, los signos y unidades de los movimientos, los enlaces y la distinción visual entre dinero y puntos. No se identifica un nuevo fallo de contraste o recorte que deba devolver esta pieza al constructor.

## Evidencia indirecta y límites de ronda 2

`resultados.json` contiene diez comprobaciones aprobadas, la matriz de 24 combinaciones de pestaña/anchura/tamaño de texto con ancho del documento igual al del viewport, cero errores y cero conexiones externas. Los nueve archivos `axe-*.json` contienen cero incidencias. Estos resultados apoyan la inspección visual, pero no sustituyen una ejecución independiente. Se mantienen los límites de certificación declarados para ronda 1, incluida la procedencia de imágenes, las fuentes locales y el comportamiento interactivo.

**Veredicto vigente del crítico Sistema: las tres piezas pasan en ronda 2.**
