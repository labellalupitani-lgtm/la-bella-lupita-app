# Auditoría de descubrimiento y compra

Fecha: 21 de octubre de 2026. Auditoría de la compilación congelada `experiencia-cuenta-2026-10-21/compilacion`, servida en 5302 con Worker y PGlite sintéticos. La inspección y las operaciones descritas no alteraron la aplicación ni datos reales. `src/casa` y las regresiones vigentes se leyeron como contexto; cada resultado indicado se ejecutó de nuevo.

## Hallazgo C1 — La carta retrasa la primera selección

**Tipo:** juicio de diseño respaldado por geometría. **Prioridad:** P1 de diseño, no fallo de cobro.

**Reproducir:** entrar como cliente, abrir `/pedir`, categoría Café sin búsqueda, scroll inicial cero. En 390×844 la primera acción de agregar empieza en y=888 y termina en y=932. El producto Espresso comienza en y=845. Antes están el encabezado, buscador, categorías, recepción y una tarjeta destacada Latte (y=535–700). Latte se repite en la lista a y=1371. En 1440×900 el primer botón de agregar empieza en y=842; el destacado ocupa 240 px.

**Impacto:** para una tarea frecuente —comparar y pedir un café— el primer viewport móvil presenta navegación, estado e inspiración, pero no una acción de agregar. La repetición consume espacio sin aportar una segunda decisión. Frecuencia es una inferencia del recorrido principal, no una métrica de tráfico.

**Recomendación:** convertir la fotografía en parte de un producto comprable; mantener búsqueda global, categorías, precios, empaque y recepción junto a la elección. Reservar el espacio de escritorio para el pedido en curso. No eliminar condiciones ni recuperación del pago.

**Evidencia:** `capturas/cliente-pedir-390.png`, `capturas/cliente-pedir-1440.png`, `metricas.json`. Capturas vistas por el auditor.

## Hallazgo C2 — La confirmación conduce a un historial general que demora el estado

**Tipo:** oportunidad. **Prioridad:** P1 de diseño.

**Reproducir:** buscar Latte, agregar, abrir pedido, revisar total, pagar. La recuperación de una respuesta perdida también acaba en `/compras`. La vista móvil comienza con “Mis compras y reservas”, un segundo título, explicación de actualización cada 30 segundos, dos acciones de exploración, última consulta, actualizar y filtros. El comprobante aparece después; el estado recibido queda debajo del primer viewport en la captura.

**Impacto:** tras pagar, la pregunta decisiva es si el pedido fue recibido y dónde retirarlo. El historial agrupa bien varias clases de compra, pero obliga a localizar el resultado de la acción que acaba de completarse. Con 20 comprobantes sintéticos de nombres largos la página alcanza 11.661 px a 390 px. Los filtros son explícitamente de los comprobantes cargados y la paginación funciona; no se presenta eso como un fallo funcional.

**Recomendación:** una confirmación inmediata con número, importe, estado y retiro; después el detalle y el historial. Mantener el lenguaje “el equipo confirma preparación” y no inventar una hora.

**Evidencia:** `capturas/pedido-confirmado-historial-390.png`, `capturas/compras-largas-390.png`, `capturas/compras-40-final.png`, `revision-final.json` (páginas 0 y 1, 40 comprobantes).

## Hallazgo C3 — La recuperación financiera está bien resuelta y debe preservarse

**Tipo:** observación positiva / restricción de diseño. **Prioridad:** P0 de conservación.

Se ejecutaron de nuevo las regresiones de Carta (14 casos) y Tienda (9 casos). Carta conserva la referencia cuando se pierde la respuesta, recupera exactamente un pedido y un asiento; bloquea un cobro si no puede conservar la referencia y no acepta un HTTP 200 incompleto como éxito. Tienda conserva el intento, recupera una compra con saldo exacto, distingue precio modificado, contrato incompleto, beneficio mensual, recarga y catálogo fallido. Incluye render de Tienda en Firefox/WebKit.

Además se ejecutaron pérdidas de respuesta mediante `route.fetch()` seguido de `route.abort()` sobre la fixture 5302. Se recuperó la confirmación desde la interfaz. Una verificación posterior encontró exactamente un comprobante con el ID del recibo de pedido capturado. El servidor sintético contiene más de un pedido porque se ejecutaron recorridos independientes: no se confunden esos pedidos intencionales con duplicación de una referencia.

**Recomendación:** la propuesta no debe convertir un resultado incierto en “pago fallido” ni ofrecer un nuevo cobro antes de consultar. Debe seguir distinguiendo selección, revisión de importe y pago.

**Evidencia:** `carta-ui.log`, `tienda-ui.log`, `regresion-carta/interfaz-carta.json`, `regresion-tienda/ui.json`, `pedido-recuperacion.json`, `tienda-recuperacion.json`, `revision-final.json`, capturas `pedido-respuesta-perdida` y `tienda-respuesta-perdida`.

## Hallazgo C4 — Historial vacío sugiere una mesa aunque el origen sea una compra

**Tipo:** juicio. **Prioridad:** P2.

**Reproducir:** abrir `/compras` sin comprobantes. El estado vacío propone “Preparar una visita” (reserva de mesa); “Explorar la carta” vive en el encabezado general. La acción es válida, pero no favorece el contexto de comprar café o pedir comida.

**Impacto:** el siguiente paso es menos claro para quien llegó desde Tienda o Carta. No impide comprar.

**Recomendación:** un estado vacío con acción contextual y enlaces secundarios a las demás actividades; sin duplicar instrucciones de la cabecera.

**Evidencia:** `capturas/cliente-compras-390.png`.

## Hallazgo C5 — Desbordamiento de documento al ampliar texto en Tienda

**Tipo:** observación técnica por resolver, sin atribución a un elemento. **Prioridad:** P2.

Con 200% de texto calculado, el documento de Tienda a 768 px mide 788 px de ancho en dos ejecuciones. No apareció un descendiente de `main` con rectángulo fuera del viewport; puede corresponder a un contenedor exterior o pseudo-elemento. A 320 px una primera ejecución con estado recuperado midió 329 px; una segunda dio 320 px. No se generaliza a todos los estados.

**Recomendación:** aislar el origen con el mismo estado y revisar el ancho del documento completo a texto200; no corregir con `overflow-x:hidden` sin comprobar pérdida de contenido.

**Evidencia:** `recorridos-metricas.json`, `bordes-finales.json`, `capturas/tienda-texto200-verificada-768.png`. El dato de 768 es reproducible; el de 320 se conserva como variación, no defecto confirmado.

## Alcance, accesibilidad y límites

- 40 capturas base: `/`, `/pedir`, `/tienda`, `/compras` × cliente/visitante × 320/390/768/913/1440. Tienda y Compras sin cuenta muestran la entrada pública: es barrera de acceso, no catálogo o historial público. No se fabricó una sesión.
- Veinte capturas texto200 de cliente; búsqueda, borrador, cotización, confirmación de bolsa y recibo recuperado en los cinco anchos; errores, búsquedas vacías, agotado, catálogo guardado, compra histórica incompleta, historial largo y filtros. La matriz registra también lo no aplicable y lo pendiente.
- Axe ejecutado en ocho combinaciones base a 390: cero violaciones WCAG A/AA reportadas. Esto no acredita por sí solo legibilidad, jerarquía o navegación correcta.
- El foco de ficha vuelve al disparador con Escape. La captura de traza inicial usaba solo `[role=dialog]`; los diálogos nativos no coinciden con ese selector. Los `inside:false` no prueban fuga de foco. Las regresiones de teclado de Carta/Tienda sí completaron sus aserciones.
- Movimiento reducido activo: no se necesita animación para identificar la selección o el estado. Se revisaron las transiciones y el foco visible en la propuesta integrada.
- No se envió la consulta a WhatsApp ni la solicitud de atención. La fixture bloquea salida y cada navegador de auditoría bloquea orígenes externos. Esas acciones de comunicación real están fuera de esta auditoría.
- Las fotografías ya existen en el proyecto y corresponden a los IDs de los platos de la carta. Se preserva en la ficha “Imagen de referencia” cuando no hay verificación; no se asume que fueron verificadas por el negocio. La ficha gráfica de Tienda se identifica como sustituto de fotografía. No se generó multimedia nueva ni se infirió que un video faltante fuese un defecto.

## Notas de ejecución que evitan falsos PASS

`recorridos-resultados.json` conserva tres interrupciones de la segunda ejecución del arnés: dos selectores estrictos encontraron varios pedidos legítimos y el tercero falló al final de la comprobación del historial por la misma razón. No son errores de aplicación. La primera ejecución completó ambos cobros; el acceso auxiliar sin cabecera de cliente no pudo leer sus comprobantes. `revision-final.json` usa la lectura autenticada correcta, verifica el recibo y la paginación. No se reemplazaron silenciosamente los logs originales ni se heredaron PASS previos.

Prototipo elegido: C1+C2 como un único problema de recorrido —seleccionar y confirmar un pedido con menos búsqueda visual—, aprobado por el agente coordinador. La propuesta está separada en `prototipo.tsx`, `prototipo.css`, `catalogo.ts`; requiere la crítica independiente prevista antes de aceptación final.
