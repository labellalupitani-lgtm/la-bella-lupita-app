# Comercio, compras y visitas

Implementación sobre la dirección de Inicio aprobada el 21 de octubre de 2026. No se modificaron reglas del Worker, permisos, importes, cotizaciones ni persistencia de intentos. La revisión independiente del conjunto la coordina el agente principal; este documento describe implementación y pruebas, no sustituye su dictamen.

## Cambios

- **Carta:** una sola cabecera editorial, búsqueda, categorías con selección explícita y galería horizontal de fotos reales en móvil (tres en escritorio). Los productos sin fotografía conservan una ficha tipográfica: no se inventaron imágenes. La lista incorpora miniaturas donde existe el activo, precio consistente y agregado directo conservando opciones, límites y disponibilidad.
- **Detalle:** misma foto y nombre que en el catálogo, precio junto a la descripción, información confirmada y opciones visibles. Se conserva el diálogo nativo, Escape y retorno al disparador.
- **Tienda:** oferta principal, compra, condiciones y beneficio de membresía diferenciados. La fotografía solo aparece cuando la ficha real la aporta; una oferta incompleta conserva su impedimento de compra. Precio y saldo usan cifras estables.
- **Compras:** comprobantes con tipo, referencia, importe y estado visibles. Filtros de los comprobantes ya cargados; el texto no promete filtrar un historial remoto completo. Estado vacío con salida hacia Carta o reserva; paginación conservada.
- **Reservar:** pasos numerados con selección, zonas con estado visible, horario y revisión ordenados. En móvil la elección de zona precede a la foto del lugar. El borrador, consulta, anticipo, recuperación y comprobante mantienen su flujo.
- **Mis reservas:** comprobantes legibles con fecha, grupo, duración, estado y conciliación del anticipo, manteniendo cambio, cancelación y calendario.
- **Imágenes:** se midieron los anchos reales de las variantes locales. Siete originales verticales no tenían el ancho nominal del nombre; `FotoCarta` ahora declara sus anchos reales. El risotto se encuadra hacia el plato, conservando color natural.
- **Movimiento:** selección por fondo/color y texto, aparición breve de resultados, zoom leve de foto solo con hover y pulsación del agregado. Se desactivan con movimiento reducido. No se animan saldos ni resultados financieros.

## Archivos

Aplicación: `src/casa/pantallas/{Pedir,DetalleCarta,Tienda,MisCompras,Reservar,MisReservas}.tsx`, `src/casa/componentes/{FotoCarta,CondicionesTienda}.tsx`, `src/casa/estilos/redisenio-comercio.css`.

Pruebas adaptadas: `tests/carta-ui.mjs`, `tests/tienda-ui.mjs`, `tests/carta-operacion-ui.mjs`, `tests/tienda-operacion-ui.mjs`. Las salidas se trasladaron a esta entrega. Las expectativas de sidebar de 224 px, una sola imagen de Latte y CTA obligatoria en primera pantalla de 320 × 568 se actualizaron para la composición aprobada. Se mantienen los contratos de pagos/recuperación y, en pantalla corta, se exige que la CTA sea enfocable y visible al desplazar. La CTA sigue exigida dentro de la primera pantalla normal de 390 × 844.

## Evidencias

- Comparativas con igual cuenta sintética y aviso local: `evidencia/comercio/antes-aprobado-{ruta}-{390|1440}.png` (compilación preservada, puerto 5197) y `despues-{ruta}-{390|1440}.png` (fuente vigente, puerto 5191). Las primeras capturas `antes-*` y `ronda1-*` se conservan como historia, no se confunden con la base congelada.
- Carta: `evidencia/carta-ui/interfaz-carta.json`, 14 grupos PASS sobre `principal-DImVgW3Q.js`, con búsqueda a cinco anchos, opciones obligatorias, límites, cotización antes del cargo, cobro único tras respuesta perdida, almacenamiento bloqueado, múltiples pestañas, cuenta caída, retorno/foco y foto fallida. `axe-carta.json`: cero infracciones tras corregir contraste.
- Tienda: `evidencia/tienda-ui/ui.json`, 9 grupos PASS. Precio cambiado exige nueva revisión; respuesta perdida recupera un solo cobro; contrato inválido conserva referencia; catálogo/error/recarga/beneficio y comprobaciones en Chromium, Firefox y WebKit. Se ejecutó en la compilación integrada previa a los ajustes aislados de foco de Reservar y encuadre/contraste de Carta; esos cambios no alteran Tienda.
- Operación Carta: `evidencia/carta-operacion/operacion-ui.json`, 3 grupos PASS: reglas, publicación de ficha revisada y cocina sin permisos de precio/horario/capacidad.
- Operación Tienda: `evidencia/tienda-operacion/operacion-ui.json`, 3 grupos PASS: ficha del propietario, preparación/devolución con motivo y permisos de caja.
- Recorridos de reservas/compras: `evidencia/comercio/recorridos.mjs`, con Worker real, PGlite en memoria y red externa bloqueada. `evidencia/comercio/recorridos/resultados.json`: 9 grupos PASS, sin errores, sobre una copia congelada de `principal-4KPpZegJ.js`. Incluye 20 vistas (cinco páginas en cuatro anchos), reserva real, cambio/calendario/cancelación, anticipo VIP y devolución exacta, filtros de compras, recuperación de una sola visita tras respuesta perdida, reintento de disponibilidad sin borrar grupo, texto al 200 % y cero infracciones axe en las cinco páginas. Las capturas del recorrido no llevan aviso de vista previa; las comparativas anteriores sí lo comparten.
- Foco de reserva: `evidencia/comercio/foco-reserva.json`, 20 focos reales por Tab a texto 100 % y 200 %. El harness no desplaza la página ni enfoca cada control. Solo usa Tab y mide su posición respecto del cierre.

## Hallazgos corregidos

1. Respaldo de fotografía sobre arena tenía contraste 3,72:1. Se cambió su texto a cacao (7,08:1 sobre arena); Carta volvió a pasar axe.
2. El encuadre central del risotto vertical cortaba el cuerpo del plato en la galería. Se ajustaron proporción y posición; no se alteró la foto.
3. El árbitro de uso encontró un P2 en reservas: Tab dejaba zonas debajo del cierre fijo. Se reemplazó la medida aproximada del pie por su altura completa observada y se verifica el foco después de la restauración nativa de scroll. La prueba con Tab a 100 %/200 % pasa; el árbitro debe cerrar su revalidación independiente.

No se presenta este conjunto como aprobado por el usuario por segunda vez, ni como publicación. La aprobación de la base permite continuar el alcance integral; la revisión técnica sigue siendo independiente.

## Cierre integrado

Uso, marca y acabado terminaron en PASS. El árbitro de uso revalidó el P2 de foco en Reserva sobre4KPpZegJ y documentó coordenadas antes/después. Los cambios posteriores de compilación solo afectan ejemplos de Kit. [Dictamen de uso](REVISION-USO.md), [entrega final](LEEME.md).
