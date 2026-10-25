# Revisión independiente de acabado

Fecha: 21 de octubre de 2026. Criterio: [bar.md](bar.md), sexta composición de Inicio aprobada y referencias ya investigadas. Revisión por renders reales de Chromium/Playwright y lectura visual mediante `view_image`; no se leyó TSX ni CSS para juzgar intenciones.

**Dictamen final: PASS en los cuatro conjuntos.** Se cerraron dos fallos localizados de Kit mediante revisión de los renders de cada corrección. No quedan hallazgos materiales de acabado abiertos dentro del alcance observado.

## Estado

| Conjunto | Primera revisión | Revisión de corrección | Brecha que decide |
|---|---|---|---|
| Sistema, acceso y Kit | **FAIL** | **PASS · R4** | Corregidas la columna de producto de 42 px y la confirmación. Producto, mensaje y cierre son legibles a 320 px y con texto al 200 %. |
| Comercio y reservas | **PASS** | Sin cambio de alcance | No se encontró una brecha material de acabado en las vistas y detalles examinados. |
| Cuenta y Club | **PASS** | Sin cambio de alcance | No se encontró una brecha material de acabado en las vistas y detalles examinados. |
| Las doce secciones de Equipo | **PASS** | Sin cambio de alcance | No se encontró una brecha material de acabado en las vistas y roles examinados. |

## Método y alcance visual

Se capturaron 130 renders de las dos compilaciones: 390 × 844 y 1440 × 1000 en once rutas del cliente/herramientas, acceso, doce módulos del equipo y entradas de encargado, caja y cocina. Propietario se usó para las doce secciones. Se añadieron 320 px en Carta, Tienda, Club, Reservar, Perfil, Kit, acceso, Pedidos, Agenda, Equipo y Seguridad. Hay seis renders adicionales de las tres rutas públicas con sesión de visitante y pares específicos de Kit.

Los pares `par-*` no contienen rótulos de versión. En los pares de comparación inicial, izquierda corresponde a la compilación anterior de 5197; derecha, a la extensión. Se compararon la misma tarea y estado de cuenta. Inicio se contrastó con Inicio; las bienvenidas de las referencias solo informaron el uso de la fotografía.

La primera captura contra 5198 encontró datos modificados por el recorrido de uso concurrente. Se descartó como base comparativa y se volvió a capturar con servidor propio en **5203**, `--dist dist --equipo`, con PGlite en memoria y conexiones externas bloqueadas. No se reconfiguró la fixture ni se compró, reservó o modificó una cuenta real. El servidor queda disponible para revisión; los navegadores de captura se cierran al terminar cada script.

La captura principal corresponde a `principal-4KPpZegJ.js`. El primer ajuste de Kit se revisó después en `principal-y2OYufuF.js`; R3 en `principal-DRrjk9bX.js` y el cierre de R4 en `principal-Ctm5IHgB.js`. Las cifras, horarios y actividad sintéticos no se usan para decidir superioridad visual. Las revisiones posteriores se limitaron a las piezas corregidas de Kit.

Evidencia y scripts reproducibles: [carpeta del crítico](evidencia/critico-acabado/). Inventario de dimensiones, texto visible, URLs y ancho del documento: [datos.json](evidencia/critico-acabado/datos.json). No hubo desbordamiento horizontal del documento en las 130 capturas. Los registros de imágenes con `naturalWidth=0` en capturas completas incluyen recursos con carga diferida y el ejemplo deliberado «Con la foto rota»; no se trataron por sí solos como fallos.

## Comparación por conjunto

### Sistema, acceso y Kit

En acceso, gana la **derecha**: el formulario, el correo y el paso actual aparecen antes; la foto conserva su sujeto y no lleva una etiqueta sobre la taza. El estado de registro no disponible se lee junto al control y conserva la acción de volver a comprobar. La ruta desconocida mantiene regreso claro y una sola acción principal. [Acceso 390](evidencia/critico-acabado/par-acceso-390.png), [ruta desconocida](evidencia/critico-acabado/par-nohay-390.png).

Kit presenta botones y estados compatibles con el nuevo lenguaje, pero el par de la tarjeta «Lo de siempre» a 320 px lo gana la **izquierda** en R1: la nueva envoltura resta tanto ancho que la etiqueta y el producto se convierten en una columna de fragmentos. Esa regresión decide el FAIL del conjunto, aunque no se observa en Inicio aprobado. [Par localizado](evidencia/critico-acabado/par-kit-tarjeta-320.png).

Después de las correcciones gana la **extensión actual**: la tarjeta da una fila al botón cuando hace falta, conserva el nombre legible y la confirmación reúne el mensaje completo y su cierre. Inicio conserva la composición aprobada en los pares [390](evidencia/critico-acabado/par-inicio-390.png) y [1440](evidencia/critico-acabado/par-inicio-1440.png); no se encontró una razón concreta para rediseñarlo de nuevo.

### Comercio y reservas

Gana la **derecha**. Carta reúne foto, nombre, precio y elección en una misma pieza; la selección de categoría tiene una superficie y peso reconocibles. El detalle conserva la misma foto y nombre, y la cantidad y el importe quedan junto a Agregar. En 320 px el contenido puede desplazarse sin reducir la letra para encajarlo. [Carta 320](evidencia/critico-acabado/par-carta-320.png), [detalle Latte](evidencia/critico-acabado/detalle-latte-390.png), [Carta pública](evidencia/critico-acabado/par-publico-carta-390.png).

Reservar muestra antes lugar, progreso y elección de zona; la fotografía se desplaza a una posición secundaria en móvil. La barra fija pertenece a esa tarea y no compite con otra barra de pestañas. En escritorio, la foto acompaña al formulario. Tienda diferencia lote/precio, condiciones de retiro, beneficio de membresía y encargo. La fixture no confirma presentación ni retiro, y la interfaz muestra esa falta de datos; no se juzga como ausencia ornamental de fotografía. [Reservar](evidencia/critico-acabado/par-reservar-390.png), [Tienda](evidencia/critico-acabado/par-tienda-390.png), [Mis reservas](evidencia/critico-acabado/par-reservas-390.png).

### Cuenta y Club

Gana la **derecha**. El pase tiene una acción visible; beneficios, sellos, saldo y experiencias quedan diferenciados por encabezados y superficies. Los accesos internos permiten llegar a los bloques de una pantalla extensa. Perfil distingue datos editables, preferencias, comunicaciones, cuenta y ayuda, sin repetir un marco completo por cada fila de preferencias. La portada pública de Club ofrece primero su explicación y acción; la foto conserva relación visual con Inicio. [Mi Club](evidencia/critico-acabado/par-club-390.png), [pase abierto](evidencia/critico-acabado/detalle-pase-390.png), [Perfil](evidencia/critico-acabado/par-perfil-390.png), [Club público](evidencia/critico-acabado/par-publico-conoce-390.png).

Las compras y reservas vacías incluyen una salida concreta y conservan la ayuda después del estado vacío. Su mayor altura no oculta la siguiente acción; no es por sí misma un defecto. [Compras](evidencia/critico-acabado/par-compras-390.png).

### Doce módulos de Equipo

Gana la **derecha**. El shell móvil sustituye varias filas de navegación por un selector reconocible y deja antes a la vista título, filtros y formulario. La selección de escritorio usa texto, superficie y marcador. Los filtros se agrupan, los campos estrechos vuelven a una columna, y los indicadores se leen como cifras operativas. Las herramientas secundarias de Carta conservan un bloque identificable después del listado. No se trasladó una gran fotografía a los paneles de trabajo.

Se vieron Resumen, Pedidos, Caja, Mi Club, Tienda, Entregas, Agenda, Atención, Informes, Clientes, Equipo y permisos, y Cuenta y seguridad. Se revisaron también las entradas de los cuatro roles y la apertura de Fichas verificadas con cocina. En los paneles largos se inspeccionaron los segmentos inferiores, además del primer viewport. [Doce vistas de escritorio, primera mitad](evidencia/critico-acabado/equipo-escritorio-0.png), [segunda mitad](evidencia/critico-acabado/equipo-escritorio-1.png), [Pedidos](evidencia/critico-acabado/par-equipo-pedidos-390.png), [Agenda 320](evidencia/critico-acabado/par-equipo-agenda-320.png), [Seguridad 320](evidencia/critico-acabado/par-equipo-seguridad-320.png), [rol Cocina](evidencia/critico-acabado/par-rol-cocina-390.png).

Las tablas amplias conservan su área de desplazamiento; una captura del borde visible de una tabla no se interpretó como pérdida de columnas. La revisión funcional de ese desplazamiento corresponde al crítico de uso.

## Hallazgos y revalidación

### AC-01 · Tarjeta de ejemplo ilegible a 320 px — corregido en R2

**Reproducción:** entrar al cliente sintético, abrir `/kit`, ancho 320, bajar a «Piezas del Inicio». El producto «Capuchino con leche de almendra» tenía una columna central de **41,734 px** frente a **86,391 px** en la versión anterior. La etiqueta ocupaba cuatro líneas y el nombre siete; «Capuchino» y «almendra» se cortaban dentro de la palabra. El botón seguía a la derecha aunque el texto ya no cabía.

**Impacto:** lectura fragmentada, precio y tiempo muy separados, y una tarjeta desproporcionadamente alta. Incumple mecanismos 1, 3 y 6 de `bar.md`: jerarquía de producto, evitar envolturas que consumen espacio y uso a 320 px.

**Corrección solicitada:** reflujo de la pieza en ancho estrecho, reservando ancho legible al producto y moviendo Pedir a otra fila cuando no quepa. No es una solicitud de rediseñar Inicio.

**Resultado R2:** el nombre dispone de **200 px** a 320 y **198 px** a 390; ocupa dos líneas a tamaño normal. Se amplió el texto mediante tamaño raíz, comprobando el nombre de **16 a 32 px**: conserva 200 px de ancho, no fragmenta palabras y el documento permanece en 320 px. Pedir pasa a estado ocupado y recupera su tamaño antes de mostrar la confirmación de ejemplo. [R1/R2](evidencia/critico-acabado/par-kit-r1-r2-320.png), [texto al 200 %](evidencia/critico-acabado/r2-kit-320-200.png), [medidas y acción](evidencia/critico-acabado/revision-kit-r2.json).

### AC-02 · Reflujo de la confirmación — corregido en R4

**Reproducción:** en la misma tarjeta a 320 px, pulsar Pedir y esperar la confirmación. El aviso muestra «Ejemplo de confirmación. No se realizó un pedido ni se descontó saldo». Su botón Cerrar se estrecha hasta partirse casi letra por letra en una columna vertical.

**Impacto:** la acción secundaria deja de ser una palabra legible y la fila de feedback se deforma. Es visible en una interacción normal, aunque no provoca desbordamiento global. Afecta mecanismos 5 y 6 de `bar.md`.

**Corrección solicitada:** impedir la compresión del control o darle una fila propia, conservando mensaje, cierre y tamaño táctil dentro del viewport. [Confirmación a 320](evidencia/critico-acabado/r2-kit-pedir-resultado-320.png).

**Resultado R3, `principal-DRrjk9bX.js`:** Cerrar queda en su propia fila, mide 44 px de alto, conserva la palabra completa y se activa tanto con clic como con Enter después de recibir foco. Al duplicar el tamaño raíz, sin embargo, la columna del mensaje queda en 134 px y «confirmación» sobrepasa su borde derecho; es necesario permitir el reflujo de esa palabra o ampliar la columna. [Normal](evidencia/critico-acabado/r3-toast-320-100.png), [texto al 200 %](evidencia/critico-acabado/r3-toast-320-200.png), [medidas y cierres](evidencia/critico-acabado/revision-toast-r3.json).

**Resultado final R4, `principal-Ctm5IHgB.js`: PASS.** Se comprobó 320 × 700 y 320 × 568, a tamaño normal y texto de 16 a 32 px. El mensaje conserva **226 px** de ancho; todas sus líneas quedan dentro del mensaje y del viewport, incluida «confirmación». Cerrar conserva **44 px** de alto. El aviso se cierra con clic y con Enter tras navegación de teclado; el foco es visible. El ancho del documento permanece en 320 px en los cuatro casos. [700, normal](evidencia/critico-acabado/r4-toast-320x700-100.png), [700, texto 200 %](evidencia/critico-acabado/r4-toast-320x700-200.png), [568, normal](evidencia/critico-acabado/r4-toast-320x568-100.png), [568, texto 200 % y foco](evidencia/critico-acabado/r4-toast-cierre-320x568-200.png), [medidas y cierres](evidencia/critico-acabado/revision-toast-r4.json).

## Límites de esta aprobación visual

Se comprobaron detalles de Latte y pase, apertura de fichas de cocina y la interacción Pedir de Kit; no se pretende sustituir todos los recorridos transaccionales del crítico de uso. Los renders `ampliado-*-1440-200` son ampliaciones visuales mediante `zoom` CSS en escritorio y no se presentan como prueba de zoom nativo del navegador. La revalidación de Kit sí verifica el aumento real del texto de 16 a 32 px a ancho 320.

Estos veredictos son de acabado sobre las superficies revisadas. No autorizan publicación ni sustituyen la decisión visual del usuario, la revisión de identidad o las pruebas funcionales.
