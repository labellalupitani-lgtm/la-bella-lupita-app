# Revisión independiente de correcciones · Carta

21 de octubre de 2026. Árbitro que no implementó los cambios. Contexto de navegador propio, preview compilada local `http://127.0.0.1:5262/`, datos sintéticos. Primera revalidación sobre `principal-DUlGg3xA.js`.

## Ronda 2

- **R1, búsqueda comprimida: corregido.** Consulta `pizza` a 390 px: resultados y grid de 350 px, sin columnas implícitas ni overflow. A 320 px y texto 200 %, resultados de 288 px. Tablet 768 px con consulta vacía: 728 px útiles. Escritorio 1440 px con `maracuya`: 1208 px útiles, un resultado correcto a través del alias sin tilde.
- **R2, foco fuera de pantalla al cerrar ficha recargada: corregido.** A 320 × 700 se repitió Mollete del Huerto después de recorrer Brunch. Apertura normal devuelve el foco al botón original, top 264 px y scrollY 3643. Tras recargar la ficha y tras abrir URL directa, Escape devuelve foco al input visible, top 285 px y scrollY 90. La categoría permanece en la URL.
- **Borrado de consulta:** desde Brunch, buscar pizza y activar Borrar mediante Tab/Enter a 320 px/texto200 deja el buscador enfocado y visible, limpia `q` y conserva Brunch. Etiqueta visible y nombre accesible comprobados.
- **Sin resultados:** mensaje comprensible y acción Ver toda la carta operativa en tablet. Observación menor: esa acción eliminaba su botón y dejaba foco en BODY; el Tab siguiente continuaba al primer destacado, sin atraparlo. Se comunicó como mejora opcional de continuidad.
- **Error:** se simuló red Offline después de cargar la Carta y se activó el evento de actualización. Aparecen «Disponibilidad sin confirmar» y «Actualizar carta»; no permanece una falsa carga. Se restableció la red y la navegación volvió a cargar datos.
- **Consola/red:** después del recorrido recuperado, consola sin errores/avisos y nueve solicitudes API locales respondieron 200. Los errores de transporte del escenario Offline son intencionales y no se presentan como errores del producto.

### R3 · Moderado · El último filtro queda recortado al navegar con teclado

- **Dónde:** fila de categorías, 320 × 700, texto al 200 %.
- **Cómo:** desde buscador vacío, Tab cinco veces hasta Dulce. El botón enfocado acaba en x=213,95, ancho101,78, borde derecho315,73; su contenedor termina en304. `scrollLeft=222`, máximo239. Shift+Tab y Tab mantienen el recorte.
- **Impacto:** parte del texto y del anillo de foco del último filtro queda fuera del área visible. La categoría sigue siendo activable, pero la navegación por teclado no muestra completo el destino.
- **Corrección solicitada:** garantizar margen horizontal para el foco y desplazar la fila hasta mostrar completo el filtro, incluidos sus extremos; probar ida y vuelta con texto normal y ampliado.
- **Estado al cerrar esta ronda:** se solicitó corrección; revalidación resuelta en la ronda 3 siguiente.

## Ronda 3 · PASS

Nueva compilación `principal-Bhouru2Z.js` en la misma preview compilada. Recarga real, sin caché.

- **R3 corregido y revalidado:** a 320 × 700 y texto al 200 %, Tab desde el buscador recorre los cinco filtros. Dulce queda completamente visible: x197,91, borde derecho297,97, contenedor entre16 y304, `scrollLeft=241` igual al máximo. Se ven el texto y el anillo completo. Cuatro Shift+Tab devuelven a Todo, x22, con margen izquierdo de6 px. No hay desbordamiento del documento.
- **Salida del vacío mejorada:** con texto200, Enter en Ver toda la carta devuelve el foco al buscador visible (top231,75, bottom305,75; navegación empieza en541,41). Consulta vaciada y categoría Todo conservada.
- **Comprobación focal de búsqueda:** `pizza` continúa usando288 px de resultados y288 px de grid a320, con nueve resultados, sin overflow ni columna implícita.

**Dictamen técnico del alcance:** PASS. Los dos hallazgos iniciales y el hallazgo adicional de teclado están corregidos y fueron revalidados en navegador. No quedan fallos críticos o importantes reproducidos sin corregir en búsqueda, filtros y continuidad lista/detalle dentro de esta revisión. La ronda3 añade cambios acotados a foco horizontal y salida del vacío; la revisión de escritorio/tablet y el resto de R1/R2 se realizó en la compilación de la ronda2.

## Evidencia complementaria inspeccionada

Se revisaron `evidencia/exploracion-build/resultados.json` (siete grupos PASS), `evidencia/regresion-carta/interfaz-carta.json` (catorce grupos PASS), el log de regresión y `axe-390.json` sin violaciones. Son pruebas del constructor inspeccionadas por el árbitro, no ejecuciones independientes del árbitro.

La inyección independiente de axe mediante `sourcePath` no fue posible por el alcance de rutas configurado en Chrome DevTools; no se afirma una segunda ejecución independiente de axe. La revisión manual sí comprobó roles, nombres, foco visible, reflujo y operación de teclado en los recorridos descritos.

## Límites

No se probaron dispositivos físicos, lector de pantalla, pagos reales ni servicios externos. La cobertura de compras/opciones/cotización se apoya en la regresión aislada del constructor; esta revisión independiente se concentró en exploración y continuidad. Una aprobación técnica no autoriza publicación ni sustituye validación visual del usuario.
