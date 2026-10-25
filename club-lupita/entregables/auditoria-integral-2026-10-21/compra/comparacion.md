# Carta: antes y propuesta

La propuesta integrada vive en `http://127.0.0.1:5310/compra`. Todos los pagos, saldos, estados y referencias de ese prototipo son sintéticos. El catálogo es una copia de los 73 platos de la fuente auditada; no se conecta al backend. Reiniciar restablece el recorrido. Cerrar o recargar la pestaña reinicia el estado: la persistencia real de cobros queda fuera de este prototipo.

## Problema y decisión

Antes, una selección fotográfica separada desplaza los productos comprables y repite Latte. Después, cada fotografía identifica un plato que puede agregarse o personalizarse desde la misma tarjeta. Búsqueda en toda la carta y categorías permanecen disponibles. Una selección inicial de seis platos permite explorar comida y café; “Todo” conserva el catálogo completo. El resumen de escritorio muestra la selección durante la exploración. En móvil aparece una barra solo cuando hay artículos.

Después de pagar se muestra el pedido específico con su estado y retiro, antes del detalle. La revisión de total y las condiciones no se eliminan. El recorrido con respuesta perdida consulta el mismo intento y mantiene un único cargo simulado.

## Medición de la posición de la primera acción

Píxeles CSS desde la parte superior del documento, scroll cero. Ambas mediciones incluyen sus avisos y cabeceras de prueba, que son diferentes. Base: primer “+” de la lista Café. Propuesta: Agregar Latte en la selección inicial. Mide facilidad de encontrar la primera acción, no un experimento causal de conversión.

| Ancho | Antes: y del primer agregar | Propuesta: y del primer agregar | Diferencia |
|---|---:|---:|---:|
| 320 | 956 | 732 | 224 px antes |
| 390 | 888 | 647 | 241 px antes |
| 768 | 819 | 680 | 139 px antes |
| 913 | 807 | 641 | 166 px antes |
| 1440 | 842 | 735 | 107 px antes |

En 390×844 la acción completa termina en y=691, dentro del primer viewport. Antes terminaba en y=932 y la navegación móvil empezaba antes. En 320×568 la propuesta aún requiere desplazamiento. No se presenta como un problema totalmente resuelto en pantallas cortas.

**Capturas antes:** `capturas/cliente-pedir-390.png`, `capturas/cliente-pedir-1440.png`. **Después:** `prototipo-capturas/carta-390.png`, `prototipo-capturas/carta-1440.png`. Las cinco anchuras de propuesta fueron vistas por el auditor. Fuente: `metricas.json`, `revision-final.json`.

## Pasos, palabras y desplazamiento

Un Latte sin opciones requiere cuatro activaciones desde la carta en ambos diseños: agregar → revisar pedido → revisar total → pagar. Buscar o abrir la ficha es opcional. No se afirma reducción de pasos; se adelanta la elección y se hace explícito el resultado.

Desde Inicio en la aplicación se añade “Explorar la carta”. El prototipo comienza directamente en Carta por su alcance; no se descuenta ese paso como una mejora medida.

La base Café tiene 259 palabras visibles y 2.429 px de documento a 390. La propuesta inicial tiene 181 palabras y 2.080 px, pero muestra seis platos de varias categorías frente a la categoría Café de la base. Esa comparación no prueba que se haya simplificado la misma cantidad de contenido. Todo el catálogo y las descripciones se mantienen accesibles. El historial sintético de 20 pedidos llegó a 11.661 px; la propuesta muestra el pedido recién confirmado y no pretende resolver la gestión de un historial completo.

El total de palabras de los modales en `recorridos-metricas.json` no es una medición fiable del diálogo nativo: el selector del arnés buscaba `[role=dialog]` y cayó en `main`. No se usa para afirmar una mejora.

## Recorrido y pruebas de la propuesta

Ejecutado en el host integrado: Risotto con huevo revuelto + Latte, carrito, revisión, pago, confirmación y actualización de preparación. También error antes del cargo con reintento y pérdida de respuesta después del cargo con consulta: un cargo simulado en ambos recorridos. `prototipo-verificacion.json` conserva resultados. No hubo errores de página.

Tras ajustar la composición se repitió la geometría de los cinco anchos. Después se verificó texto200 con un nombre largo en los cinco: sin desbordamiento horizontal de documento o de `main`. A 913 se aplicó gutter estable de 15 px como aproximación de scrollbar Windows. El viewport CSS fue 913 y el contenido 898; no se afirma haber reproducido cada configuración del sistema operativo.

Axe final no reportó violaciones. Foco visible de 3 px, Escape restaura el disparador y movimiento reducido elimina transiciones. Las capturas de estados de compra en `prototipo-capturas` se tomaron antes del ajuste que retiró la barra duplicada y compactó el encabezado; el recorrido funcional no cambió. La matriz final de portada/texto200 sí corresponde a la composición actual.

## Condiciones para aceptar

La propuesta conserva los límites de 20 por producto y 40 artículos por pedido, opciones obligatorias de proteína/temperatura/huevo, empaque C$40, revisión del importe, saldo insuficiente, restricción confirmada con el equipo, pausa, agotado, datos largos, error y recuperación sin repetir el cargo. Los estados sintéticos se seleccionan dentro de “Escenarios de prueba”; no aparecen como controles del flujo real.

Falta la crítica independiente solicitada por el coordinador. La auditoría propone y mide; no se autoacredita una aprobación final ni una mejora de conversión, rendimiento comercial o satisfacción sin usuarios reales.
