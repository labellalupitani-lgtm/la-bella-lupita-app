# Carta: rendimiento, resiliencia, arquitectura y catálogo

Fecha de auditoría: 8 de octubre de 2026, Managua. Alcance: fuente actual de `club-lupita`, recursos locales y `dist` existente; investigación en fuentes primarias. No se ejecutaron servidores, navegador, compras ni pruebas que contacten producción. No se modificó la aplicación. Los pesos de `dist` no prueban qué build está publicado ni su compresión HTTP. Severidad: P1 = corregir antes de ampliar pedidos; P2 = mejora importante; P3 = oportunidad. Confianza alta significa evidencia directa de código/archivo, no necesariamente fallo reproducido en navegador.

## Resumen verificable

- La entrada activa es `index.html:16` → `src/casa/main.tsx`, no `src/main.tsx` ni la Carta heredada.
- `src/data/menu.ts:56-130` contiene 73 productos: 24 barra, 27 bistró, 14 brunch y 8 sobremesa. Comprobación programática: IDs únicos, todos los precios enteros y positivos; 33 fotos existentes, 40 productos sin foto. Las 33 imágenes tienen variantes nominales 240 y 480.
- Las 33 imágenes nominales 960 suman 2.227.648 bytes. **No es la carga de entrada de Carta**: `Pedir.tsx:177-180` renderiza una lista textual, y solo destacado/detalle cargan imágenes.
- El `dist` existente contiene `principal-Cfxl5pt5.js`: 415.080 B sin comprimir / 129.267 B gzip local; `principal-C3oGQIwt.css`: 73.931 / 15.308 B; `Personal-DT6NVYxY.js`: 67.427 / 18.876 B. Compresión calculada con `node:zlib`, metadatos de imágenes con `sharp`, catálogo evaluado tras transpilar TypeScript en memoria.
- A favor: WebP y fuentes autoalojadas; foto con caja CSS estable; no hay 73 fotos descargándose al abrir; catálogo pequeño que no necesita virtualización; cálculo monetario en centavos; producto y precio se comparten con servidor (`src/worker/index.ts:37,754-760`); borrador y referencia de reintento persisten juntos (`pedido.tsx:38,58-69,80-83`); límites y validación de cobro corresponden a la investigación operativa.

## Hallazgos y mejoras

### R1. Opciones prometidas por el catálogo no se pueden especificar — P1, alta

Evidencia: `src/data/menu.ts:99` ofrece Ensalada Lupita con camarón, pollo o res; `:108,111` promete huevo al gusto; `:79` indica agua fría o al tiempo y pide decir cómo se quiere. Sin embargo `PlatoCarta` (`:6-23`) no modela grupos de opciones, `DetalleCarta.tsx:61-66` solo presenta descripción/perfil/cantidad, y `pedido.tsx:27` admite únicamente `{id, cuanto}`. El flujo puede cobrar una configuración culinaria ambigua. No se afirma qué interpretación aplica cocina: es una decisión comercial pendiente.

Recomendación: definir variantes/modificadores estructurados, cardinalidad requerida, suplementos y disponibilidad; hacer obligatoria la elección cuando la receta lo requiera y conservarla en carrito, cobro y comanda. No basta un campo libre que el servidor no valide. Aceptación: dos ensaladas con proteínas distintas siguen siendo líneas distintas, precio mostrado = aceptado, y no es posible pagar sin las elecciones requeridas. `MenuItem` admite ofertas y complementos como referencia conceptual, aunque no sustituye el contrato transaccional [Schema.org](https://schema.org/MenuItem).

### R2. El catálogo no expresa disponibilidad ni frescura operativa — P1 si se reciben pedidos reales, alta en la carencia / media en el impacto

Evidencia: catálogo compilado y documentado como extracción de agosto de 2026 (`menu.ts:1`); modelo sin disponible/agotado, horario, fecha de revisión ni versión (`:6-23`); cliente importa `CARTA` (`Pedir.tsx:28`) y servidor valida existencia en esa misma lista (`src/worker/index.ts:754-760`). Esto es mejor que aceptar precios del navegador, pero no permite retirar un plato agotado desde operación. Las estimaciones provienen de un número fijo por momento (`menu.ts:25-53`, `Pedir.tsx:95-99`), no de carga de cocina.

Recomendación: dueño editorial explícito, catálogo versionado con publicación revisada, disponibilidad y horario por producto, validación de vigencia antes de cobrar y aviso de cualquier diferencia. Mantener el cálculo de precios en servidor. Aceptación: marcar un producto agotado lo inhabilita en catálogo y en una cesta antigua; el usuario conoce un cambio antes de confirmar. Las estimaciones deben identificarse como orientativas y validarse con operación.

### R3. Imágenes adaptativas existentes no se usan — P2, alta

Evidencia: `Pedir.tsx:162` y `DetalleCarta.tsx:59,69` cargan únicamente `foto` sin `srcSet/sizes` ni alternativa de error. Ejemplos físicos:

| Imagen | Archivo nominal 960 | Variante nominal 480 | Dimensión real de 960 |
|---|---:|---:|---|
| Latte | 34.730 B | 12.996 B | 960×960 |
| Pizza Churrasco | 103.652 B | 33.814 B | 960×640 |
| Risotto de Gallo Pinto | 44.426 B | 16.708 B | 567×960 |
| Delicias de la Abuela | 39.664 B | 15.730 B | 640×960 |

No se debe copiar ciegamente el helper anterior `componentes/Datos.tsx:199-204`: etiqueta todo `-960.webp` como `960w`, pero varias fotos son retratos de ancho real 567/640. Usar metadatos reales en un manifiesto de imagen y `sizes` basado en la composición actual, `decoding="async"`, respaldo cuando falle, y prioridad alta solo para el candidato LCP medido. Conservar la reserva de espacio CSS (`Carta.css:12-16,39-44,55`). No aplicar lazy loading al destacado si es LCP. Aceptación: en móvil de densidad 1 se elige variante apropiada, en densidad alta no se degrada nitidez, y 404 mantiene una ficha legible. [Imágenes adaptativas](https://web.dev/learn/images/responsive-images), [Optimización de LCP](https://web.dev/articles/optimize-lcp).

### R4. La entrada incluye todas las pantallas cliente y animaciones — P2, alta como arquitectura / pendiente medir impacto

Evidencia: `App.tsx:18-27` importa estáticamente Inicio, Kit, Umbral, Pedir, Perfil, MisCompras, Tienda, Club y Reservar; solo Personal usa `lazy`. `Pedir.tsx:13` y `DetalleCarta.tsx:2` importan `motion/react`. El comentario de `vite.config.ts:39-50` promete carga diferida con LazyMotion, pero Carta no usa esa estrategia. Los pesos de arriba confirman un solo JS principal de 129 KB gzip local; ese tamaño, por sí solo, no demuestra lentitud.

Recomendación: medir parseo/ejecución en teléfono modesto antes de dividir; diferir Kit y pantallas no visitadas, y revisar si el transporte visual requiere todas las features de Motion. Conservar chunks con manejo de error. Aceptación: comparar misma build/máquina/red fría antes y después y documentar JS inicial, LCP e interacción al filtrar/abrir. No justificar una migración de framework con estos datos.

### R5. La animación principal exige layout continuo — P2, alta en técnica / media en impacto

Evidencia: `DetalleCarta.tsx:69-70` anima `left`, `top`, `width`, `height`, `fontSize` y `lineHeight` durante 420 ms; se leen rectángulos y estilos (`:10-12,35-36,43-52`). Son propiedades geométricas que pueden requerir trabajo de layout/pintura. Existen `useReducedMotion` y duración cero para algunas transiciones, por lo que no corresponde afirmar ausencia de reducción de movimiento.

Recomendación: medir frames y tareas largas al abrir/cerrar con foto y sin foto; preferir transformaciones de posición/escala y opacidad con dimensiones estables donde mantengan legibilidad. El objetivo es respuesta inmediata del control y estabilidad del diálogo, no reducir indiscriminadamente todos los efectos. Aceptación: prueba repetida a CPU limitada sin saltos ni foco perdido; cerrar funciona aunque falle la imagen o cambie orientación. La severidad sube únicamente si una prueba demuestra bloqueo perceptible.

### R6. URL y estado de Carta no se mantienen sincronizados — P2, alta

Evidencia: `Pedir.tsx:49-53` lee `?plato=` solo como estado inicial; `abrir` (`:83-90`) no modifica URL y cerrar (`:208`) tampoco. Filtro y búsqueda solo viven en `useState` (`:50-51,153`). El router escucha `pathname`, no query (`App.tsx:35,42,68-72`). Resultado esperable: abrir una ficha desde la lista no produce un enlace compartible; recargar pierde búsqueda/filtro; cerrar una ficha abierta por URL no limpia su parámetro y refrescar puede reabrirla. Confirmar historial Atrás/Adelante en navegador antes de presentarlo como fallo reproducido.

Recomendación: estado explícito en URL para plato, categoría y consulta; navegación Atrás cierra ficha antes de abandonar Carta; compartir/copiar enlace; restauración razonable de búsqueda y desplazamiento. Aceptación: URL de una ficha abre el mismo producto; cerrar la sincroniza; Atrás/Adelante y recarga reproducen el estado esperado sin duplicar entradas de historial.

### R7. Consultar una carta estática depende de que la cuenta cargue — P2, alta; decisión comercial

Evidencia: `App.tsx:104-120` muestra espera/error/Umbral antes de elegir la ruta `/pedir`; `datos.tsx:389-390,410-412,424,444` mantiene la cuenta únicamente en memoria y deriva `dentro` de ella. El catálogo local ya está disponible, pero en una carga nueva no puede mostrarse si la API de cuenta falla. No se detectó registro de service worker en `src`, `public` o `index.html`. Esto no demuestra que la caché HTTP esté desactivada: los encabezados del despliegue quedan pendientes de medir. `_headers:1-6` configura seguridad, no una política específica de caché.

Recomendación: decidir si Carta debe ser consultable antes de iniciar sesión (habitualmente útil para QR, enlaces y clientes nuevos). Separar lectura de catálogo de las acciones de cuenta; ofrecer consulta degradada cuando falla la cuenta. Si se necesita uso sin conexión, versionar caché pública y mostrar última actualización; saldo y cobros requieren confirmación online. No encolar automáticamente pagos como consecuencia de adoptar PWA. Aceptación: API de cuenta caída no inutiliza la lectura del menú; el estado pendiente nunca se presenta como pedido confirmado. [Operación offline, MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation).

### R8. Recuperación de errores existe en el cliente heredado, no en la entrada activa — P2, alta

Evidencia: `src/main.tsx:17-27` maneja fallos de chunks, pero `index.html:16` usa `src/casa/main.tsx:15-19`, que solo renderiza StrictMode/App. La búsqueda de `componentDidCatch` encuentra `src/app/Barrera.tsx`, fuera del árbol Casa; no hay barrera visible en `src/casa/App.tsx:160-172`. Un error de render deja sin recuperación a la rama afectada. No se provocó ese fallo durante esta investigación.

Recomendación: barrera de error del cliente actual con mensaje recuperable y conservación del borrador; manejo acotado de fallo de módulos después de un despliegue; registro de errores sin datos de cliente. Aceptación: error de render inyectado muestra recuperación; una recarga no entra en bucle y no duplica el cobro pendiente.

### R9. Búsqueda desaprovecha alias existentes y la información está fragmentada — P2, alta

Evidencia: `Pedir.tsx:68-76` busca solo nombre/descripción y normaliza tres variantes de cappuccino. El producto `limonada-maracuya` tiene nombre «Limonada de Calala», descripción «Calala…» y `fruta: "Maracuyá"` (`menu.ts:77`): buscar «maracuyá» devuelve cero según el predicado actual. Etiquetas, categorías, perfil y fruta no participan. `menu.ts:137-139` documenta una familia de limonadas con selector, pero la Carta actual usa filas independientes.

Recomendación: alias validados, índice normalizado compartido, tokenización de consultas cortas y búsqueda por términos del catálogo; conservar la búsqueda global entre momentos, que ya es acertada. No hace falta motor remoto para 73 productos. Aceptación: maracuyá/calala, café/cafe, capuchino/cappuccino y términos de ingredientes aprobados tienen resultados previsibles; medir consultas sin resultados. Separar corrección ortográfica de promesas dietéticas.

### R10. Información decisiva de producto insuficiente — P2, alta en modelo / validación editorial pendiente

Evidencia: `PlatoCarta` (`menu.ts:6-23`) carece de tamaño/porción, ingredientes estructurados, alérgenos, restricciones verificadas y opciones; la pizza Cuatro Estaciones (`:92`) dice cuatro sabores sin enumerarlos; 40/73 productos no tienen foto. La ficha con foto ausente sigue siendo funcional, por lo que «sin foto» es oportunidad editorial, no imagen rota. `casa/carta.ts:5-7` elimina todos los puntos finales/intermedios de las descripciones, convirtiendo varias frases del café en una secuencia sin puntuación.

Recomendación: ficha editorial de cada plato aprobada por cocina, porciones y opciones de pedido; fotografías auténticas prioritarias por demanda/margen; no inferir «sin gluten», «vegano» o ausencia de alérgenos desde ingredientes parciales. Restituir puntuación lingüística sin tocar precios ni IDs. `MenuItem` permite modelar nutrición y adecuación dietética, pero esas propiedades requieren datos comprobados [Schema.org](https://schema.org/MenuItem).

### R11. Observabilidad y controles de Carta no constituyen una garantía de regresión actual — P2, alta

Evidencia: no aparecen `web-vitals`, `onLCP`, `PerformanceObserver`, analítica de eventos ni reporter de errores en el código cliente actual (búsqueda en `src`; esto no excluye Cloudflare configurado fuera del repo). Hay medición local histórica en `tests/entrega-identidad.mjs:8-9,23`, expresamente sin simulación móvil; no es RUM de Carta. `tests/recorrido-publico.mjs:30-45` busca botones Barra/Sobremesa y elementos `article`, mientras `Pedir.tsx:154,177-181` muestra Café/Dulce y usa `li`; además ese script apunta a producción y cobra en `:4,48`: no se ejecutó. `package.json:8` no incluye `test:ui` (`:11`) en el comando general. Sí existen tests recientes de cliente y accesibilidad: no se afirma ausencia total de pruebas.

Recomendación: ruta de pruebas aislada con catálogo fijo, filtros, consulta sin resultado, todos los detalles, variantes, teclado, historial, imagen fallida, error de cuenta y pedido pendiente. Agregar presupuesto de recursos y laboratorio reproducible; para campo, p75 de LCP ≤2,5 s, INP ≤200 ms y CLS ≤0,1, segmentado por dispositivo. Registrar vista, búsqueda sin resultado, apertura, agregado, revisión y resultado del pedido sin texto libre personal. Los objetivos y distinción campo/laboratorio están documentados en [Web Vitals](https://web.dev/articles/vitals).

### R12. Descubribilidad y mantenimiento requieren una decisión de producto — P3, alta

Evidencia: `index.html:7-16` tiene título/descripción global del club y raíz vacía; no metadata por plato, Open Graph, canonical, manifiesto ni JSON-LD en las rutas inspeccionadas. La puerta de cuenta de R7 refuerza que hoy es una herramienta de socios, no una carta pública indexable. No se debe etiquetar «SEO roto» sin confirmar ese objetivo. Si se quiere captación/QR, ofrecer páginas públicas prerenderizadas por categoría/plato, metadata de compartir y `Restaurant`→`Menu`→`MenuItem`, preservando el flujo autenticado de pago.

Mantenimiento: `Carta.css:1-62` define la pantalla y `estilos/casa.css:163-181,223-224,311-327` vuelve a definir sus mismos selectores y breakpoints; `main.tsx:3,11-13` fija una cascada implícita. Los comentarios de `Pedir.tsx:4-5` todavía hablan de rejilla de dos columnas y los de Vite de LazyMotion. Consolidar los estilos de Carta y actualizar documentación reduce errores de cambios futuros; no se recomienda reescribir la aplicación.

## Fuentes y límites

Investigación: cuatro consultas web en total, limitada a resultados primarios; páginas abiertas y verificadas: web.dev (imágenes, LCP, Web Vitals), MDN (offline) y Schema.org (MenuItem). No se usan cifras externas de conversión ni se atribuyen ganancias de negocio sin experimentos. El diagnóstico no declara CWV aprobados/reprobados, no estima ahorro de red total y no confirma encabezados de producción.

Secuencia propuesta: (1) resolver variantes y disponibilidad con operación; (2) medir y reproducir URL, búsquedas y fallos; (3) corregir fuentes de imagen/resiliencia y proteger con pruebas aisladas; (4) acordar carta pública e instrumentación; (5) optimizar JS/animaciones solo con mediciones comparables. La arquitectura actual puede evolucionar de forma incremental.

