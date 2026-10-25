# Tienda: accesibilidad, resiliencia y señales de rendimiento

Fecha de investigación: 8 de octubre de 2026, America/Managua. Alcance: revisión estática de `club-lupita/src/casa/pantallas/Tienda.tsx`, componentes compartidos, proveedor de datos, transporte, estilos activos, entrada y pruebas. No se modificó la app ni se hizo compra, despliegue o prueba sobre cuentas reales. Las capturas históricas y comentarios del código no se consideran prueba del comportamiento actual. Las reproducciones del agente principal deben incorporarse antes de convertir los riesgos indicados en defectos observados.

## Dictamen

La base técnica tiene decisiones correctas: diálogo nativo, confirmación explícita del importe, controles nativos, foco de navegación, regiones vivas, idempotencia persistente y límite de red. Los problemas estáticos más claros están en representar estados de datos y transacciones: una carga de catálogo parece un fallo de cuenta; un éxito anterior no se borra al empezar otra operación; el contrato de respuesta no valida los campos específicos que Tienda muestra. No hay base para afirmar que toda la pantalla incumple accesibilidad o que rinde mal.

Prioridades: **P1** bloqueo grave de una operación frecuente; **P2** perjuicio relevante o riesgo concreto; **P3** mejora de calidad. La confianza distingue evidencia del código de comportamiento verificado en navegador. No identifico un P1 confirmado dentro de este alcance estático.

## Hallazgos respaldados por código

### A01 — La ausencia de catálogo se describe como imposibilidad de abrir la cuenta

**P2 · Confianza alta en lógica; frecuencia pendiente de observación.**

- Evidencia: `Tienda.tsx:36` solo consume `yo`, `catalogo`, `refrescar`; `Tienda.tsx:99` deriva el vacío únicamente de `!bolsa`; `Tienda.tsx:101` monta `VACIOS.sinConexion`. El texto de ese vacío es «No pudimos abrir tu cuenta» en `componentes/Estados.tsx:143`. `componentes/EstadoDatos.tsx:23` muestra simultáneamente «Actualizando el catálogo…» si está cargando. El proveedor obtiene cuenta y catálogo por separado (`datos.tsx:424`, `datos.tsx:428`), por lo que la cuenta puede estar abierta antes de llegar el catálogo.
- Consecuencia: el cliente puede recibir un falso diagnóstico de su cuenta mientras solo espera el producto; ante fallo del catálogo, el mensaje sigue refiriéndose al recurso equivocado.
- Corrección: estados separados de carga inicial, error sin catálogo, catálogo disponible y catálogo anterior con actualización fallida. Usar un texto específico del catálogo y un esqueleto o estado de carga, manteniendo recuperaciones explícitas.
- Aceptación: cuenta OK + catálogo demorado no muestra palabras de fallo; catálogo 500 muestra mensaje de catálogo y reintento; éxito posterior sustituye ese estado sin alterar el foco. Referencia: [manejo de errores de Fetch, web.dev](https://web.dev/articles/fetch-api-error-handling).

### A02 — El mensaje de éxito anterior sobrevive al siguiente intento y a su posible fallo

**P2 · Confianza alta en transición de estado; superposición visual pendiente de medición.**

- Evidencia: `Tienda.tsx:42` inicializa `hecho`; `Tienda.tsx:51` inicia la compra y solo limpia `fallo` en la línea 57; `setHecho` aparece al terminar con éxito en la línea 66, nunca se pone a `null` al iniciar otro intento. `Tienda.tsx:276` deja visible `AvisoFlotante` mientras haya ese mensaje. `componentes/Estados.tsx:296` lo posiciona fijo y `:311` no incorpora cierre por defecto.
- Consecuencia determinista del modelo de estado: tras un éxito y un segundo intento fallido, el mensaje previo de propiedad/saldo permanece junto al nuevo error. Puede parecer confirmación del intento actual. La persistencia del mensaje no es por sí misma un incumplimiento; el problema es su contexto ambiguo.
- Corrección: representar cada intento con identificador y estado, retirar el éxito anterior al iniciar otro y conservar un recibo consultable con número, importe y siguiente paso. El recibo debe poder cerrarse o quedar en el flujo de la página; no resolverlo únicamente con un temporizador que borre información útil.
- Aceptación: éxito A → intento B → error B muestra resultado inequívoco de B y el recibo A solo donde corresponda; los anuncios accesibles no mezclan resultados.

### A03 — Validación incompleta de datos económicos y número de bolsa

**P2 · Confianza alta en contrato; no se observó una respuesta defectuosa real.**

- Evidencia: `datos.tsx:156` acepta `bolsa` si es objeto, sin validar `precio`, `quedan` o `total`. `datos.tsx:159` valida saldo y cobrado de rutas `/apartar`, sin exigir `numero`. Tienda consume esos valores en `Tienda.tsx:47`, `:48`, `:67`, `:119` y `:136`. `src/lib/format.ts:4` da formato numérico sin rechazar valores no finitos.
- Consecuencia bajo una respuesta parcial, incompatible o malformada: precios/faltantes `NaN`, inventario vacío o confirmación «bolsa undefined». El tipo TypeScript no valida JSON en ejecución.
- Corrección: esquema específico del catálogo y de `reserva-cosecha/apartar`: enteros monetarios no negativos, inventario entero con límites coherentes y número de bolsa válido. Una escritura con respuesta inválida conserva la misma referencia de idempotencia y conduce a reconciliación; no declarar automáticamente que no se cobró.
- Aceptación: inyectar campos ausentes, null, strings, negativos y desbordes; no mostrar importes o confirmaciones fabricadas; mantener salida recuperable. Referencia: [respuestas inesperadas y errores de red](https://web.dev/articles/fetch-api-error-handling).

### A04 — El resultado incierto tiene explicación textual, pero carece de acción local para comprobarlo

**P2 · Confianza alta en interfaz; impacto depende de la ruta real de recuperación.**

- Evidencia: `http.ts:40` y `http.ts:44` distinguen una escritura cuyo resultado no puede confirmarse; `datos.tsx:132` preserva `resultadoIncierto`. Tienda en `:60` solo convierte `r.error` en texto y en `:169` lo presenta como alerta. No utiliza ese indicador para ofrecer «Comprobar mi compra» o consultar la operación desde el estado pendiente. La app sí tiene `/compras` (`App.tsx:130`), pero Tienda no lleva allí desde ese aviso.
- Corrección: acciones distintas para rechazo confirmado y resultado incierto; permitir comprobar el resultado con la misma referencia, informar del número si se encuentra y reintentar solo cuando proceda. Conservar la idempotencia existente.
- Aceptación: respuesta perdida tras cargo → usuario comprueba el resultado desde Tienda → una bolsa y un cargo, sin obligarlo a interpretar un error de transporte.

### A05 — Los encargos son botones que abren navegación externa

**P3 · Confianza alta.**

- Evidencia: `Tienda.tsx:220` y `:233` usan `Fila` con `window.open` a WhatsApp; `componentes/Superficies.tsx:157` convierte las filas con acción en `<button>`. Son operables por teclado, pero no exponen destino como enlace ni ofrecen de forma nativa copiar dirección/abrir en otra pestaña. El texto común avisa de WhatsApp después de ambas filas, no en el nombre del control.
- Corrección: variante semántica `<a href>` con URL y nombre claro como «Cotizar caja de regalo por WhatsApp», aviso de apertura externa si se conserva `_blank`, y `rel="noopener"`. No afirmar que existe una infracción WCAG solo por usar botón; es una mejora de expectativas, resiliencia y capacidades del navegador.
- Aceptación: se reconoce como enlace, funciona con Enter y menú contextual, el destino WhatsApp es evidente antes de activarlo y no se envía mensaje automáticamente.

### A06 — La pestaña del navegador conserva un título genérico durante la navegación

**P3 · Confianza alta.**

- Evidencia: `index.html:7` declara «Club Lupita — La Bella Lupita» y `App.tsx:35`–`:73` cambia ruta/foco pero no `document.title`.
- Corrección: título «Tienda de la finca — La Bella Lupita» al entrar y títulos específicos en rutas. Mejora historial, pestañas y orientación asistida. El título genérico ya identifica la aplicación; no lo presento automáticamente como incumplimiento de WCAG 2.4.2.

### A07 — La puntuación insuficiente dificulta separar instrucciones, promesas y resultados

**P3 · Confianza alta.**

- Evidencia: `Tienda.tsx:86` une «No compramos grano de nadie Lo que…»; `:124` une «cuando entre la temporada El número…»; `:156` une saldo e instrucción de recarga; `:64` concatena número, cargo y saldo sin oración separadora. Afecta tanto lectura visual como prosodia de voz.
- Corrección: oraciones breves con puntos; separar información de retiro, importe y siguiente acción. Revisar 12 px de captions (`tailwind.config.js`, `fontSize.pie`) con usuarios reales; el tamaño no implica por sí mismo una infracción de WCAG.
- Aceptación: lectura en voz alta/NVDA distingue importe, saldo y retiro sin inferir dónde acaba cada idea.

## Riesgos que requieren reproducción y no se deben informar como defectos confirmados

| Riesgo | Evidencia estática | Prueba necesaria | Criterio de mejora |
|---|---|---|---|
| Foco al confirmar y esperar compra | `Tienda.tsx:55` cierra diálogo antes de esperar; `:53` deshabilita el botón iniciador mediante `Base.tsx:158`. Hoja depende del retorno nativo. | Confirmar por teclado con respuesta 3–10 s; registrar elemento activo al cierre, al fallo y al éxito; repetir si se agota última bolsa. | Foco visible en destino lógico, estado de espera anunciado y recuperación operable. Mantener diálogo pendiente o enfocar un estado estable explícito. |
| Aviso flotante tapa contenido o foco | `Estados.tsx:296`: fixed bottom-24, z-50; mensaje largo y sin cierre en Tienda. | Después de éxito, 320×568, 390×844, 200 % texto y zoom 400 %; recorrer controles con Tab y hacer capturas. | Nada esencial oculto, foco no totalmente cubierto; recibo en flujo o aviso descartable. |
| El estado de catálogo desplaza la composición desktop | `Tienda.tsx:79` introduce un hijo condicional antes del header; `casa.css:143` define grid; `:146` fija producto en filas 1–3. | Mismos viewport y scroll antes/durante/después de actualización; comparar posiciones y lectura visual. | Estado en área grid explícita de ancho completo; orden consistente y espacio reservado donde convenga. |
| Cabecera truncada en zoom/320 px | `Navegacion.tsx:206` usa truncate; `casa.css:302` fija 23 px. | Medir ancho real y mostrar título con 200 % de texto y 320 px; comprobar lectura íntegra. | Permitir varias líneas cuando se necesiten. |
| Anuncio de espera al cerrar diálogo | Cargando usa aria-busy en botón, sin texto «Procesando compra» propio (`Base.tsx:157`, `Tienda.tsx:150`). | NVDA+Edge y VoiceOver+Safari, confirmar y demorar respuesta. | Un anuncio corto de espera, luego un único resultado; no depender solo del spinner. |

La [guía de diálogos de WAI](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) requiere un recorrido de teclado contenido, salida con Escape y retorno a un punto lógico. La [explicación de estados de WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) ayuda a evaluar anuncios sin traslado de foco. [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) se verifica a un ancho equivalente de 320 CSS px para contenido vertical; [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) exige que el control enfocado no quede completamente oculto por contenido del autor. No son certificaciones basadas en el código.

## Fortalezas verificadas estáticamente y falsos positivos descartados

- **Cuenta desactualizada sí tiene aviso global.** `App.tsx:141` monta `EstadoCuenta` antes de la vista; `EstadoDatos.tsx:12` explica que saldo/datos son la última consulta disponible y ofrece reintento en `:15`. Se descarta el candidato inicial «Tienda nunca advierte un saldo viejo».
- **Diálogo real.** `Superficies.tsx:219` usa `showModal()`, tiene título enlazado, cierre visible, Escape y bloqueo de scroll. No denunciar falta de `role=dialog`, `aria-modal` o trampa manual como si `<dialog>.showModal()` fuese un div genérico.
- **Estructura y controles.** `main#contenido` es enfocables por código, encabezados h1/h2/h3/h4 y secciones etiquetadas; `App.tsx:65` mueve foco tras navegación y `:136` ofrece salto al contenido. Botones y filas nativos, iconos decorativos `aria-hidden`.
- **Anuncios.** Error de compra usa `role=alert`; confirmación usa región viva persistente (`Estados.tsx:308`) y `aria-atomic`. Es un buen patrón, pendiente de comprobación con lectores concretos.
- **Objetivos táctiles.** Botón base declara mínimo 44 px y capa activa lo sube a 48 (`Base.tsx:160`, `casa.css:42`); navegación móvil 72 px. [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) tiene mínimo AA de 24×24 con excepciones; 44×44 corresponde al criterio mejorado. No confundir niveles ni afirmar dimensiones finales sin medir.
- **Foco y alto contraste.** `base.css:79` dice `outline-none`, pero Tailwind compiló `outline:2px solid transparent;outline-offset:2px`, además del ring. No equivale a CSS `outline:none`; evita un falso hallazgo de alto contraste. Es consistente con la técnica [C40 de WAI](https://www.w3.org/WAI/WCAG21/Techniques/css/C40). Comprobar Windows Contrast Themes sigue siendo recomendable.
- **Movimiento reducido.** `base.css:228` reduce animación; `casa.css:365` anula movimiento de hoja/botones; el toast además usa motion-safe.
- **Resiliencia de transporte.** `http.ts:3` limita la petición completa a 20 s; controla HTTP, JSON, red, cambios de cuenta y resultado incierto. `compras.ts:4` persiste referencia por cuenta y operación; se borra solo tras éxito. `tests/ui.mjs:40`–`:45` contiene caso de respuesta perdida y recarga con una sola compra; no se ejecutó aquí, por tanto se reporta cobertura existente, no resultado nuevo.

## Contraste: medición de tokens, no auditoría del renderizado

Se calcularon luminancias sRGB sobre los colores actuales de `tailwind.config.js`. Los comentarios de componentes aún hablan de un sistema verde anterior; no se usaron sus ratios antiguos.

| Par | Ratio calculado | Lectura |
|---|---:|---|
| tinta/banda #53291E sobre papel #FBF6EE | 11.46:1 | Texto principal y botón invertido con margen amplio. |
| tinta-media #76574B sobre papel | 6.03:1 | Texto secundario supera 4.5:1. |
| achiote #942F32 sobre velo #F7E6E0 | 6.40:1 | Error con margen amplio. |
| foco #B60032 sobre papel | 6.43:1 | Anillo de foco con margen amplio. |
| contorno #957569 sobre papel | 3.88:1 | Contorno supera 3:1. |
| filete #D7C1A5 sobre papel | 1.62:1 | No usar como única señal esencial. Separadores decorativos y botón deshabilitado no implican por sí solos fallo. |

Se requiere revisar color computado, transparencia, hover, disabled y superposiciones. No se halló un fallo de contraste textual demostrado solo por estos tokens.

## Rendimiento y mantenibilidad

**Señal, no fallo medido:** `App.tsx:18`–`:27` importa estáticamente todas las vistas de cliente, mientras Personal usa lazy. El artefacto local `dist/assets/principal-Cfxl5pt5.js` mide **415,080 bytes sin compresión** y `principal-C3oGQIwt.css` **73,931 bytes**; no equivalen a bytes transferidos con gzip/brotli. Tienda no agrega fotos de producto; fuentes autoalojadas (`main.tsx:6`–`:10`), logo con dimensiones explícitas y un módulo sencillo favorecen carga estable.

Recomiendo medir navegación fría directamente a `/tienda`, navegación caliente desde Inicio, catálogo lento y actualización postcompra en móvil económico. Registrar LCP, cambios de layout y tiempo hasta precio/compra utilizable. Separar módulos de vistas solo si análisis de cobertura y trazas demuestra ahorro; no introducir carga diferida por reflejo. El proveedor refresca cuenta, catálogo y cupos después de compra (`datos.tsx:428`); es razonable invalidar esos datos, pero conviene medir si consultas no necesarias dominan latencia. No se encontró instrumentación `web-vitals`/`PerformanceObserver` en `src/casa` o `index.html`; esto es una carencia de evidencia operativa, no prueba de lentitud.

Los objetivos de referencia son LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1 al percentil 75 por tipo de dispositivo. [web.dev: Core Web Vitals](https://web.dev/articles/vitals). Datos de laboratorio son diagnóstico; no sustituyen datos de usuarios reales. Evitar declarar «pasa Core Web Vitals» con una ejecución rápida en localhost.

## Cobertura de pruebas que falta demostrar

`tests/ui.mjs:90` ejecuta axe con tags `wcag2a`, `wcag2aa`, `wcag21aa`, sin `wcag22aa`; las capturas/análisis automatizados son de estados base. `:95` compara scrollWidth a 320/390/1440, pero no prueba aumento de texto, toast postcompra, contraste forzado o foco tras confirmar compra. Los casos existentes son valiosos; incorporar estados dinámicos es una mejora de cobertura **P2**, no un defecto del usuario final por sí mismo.

Matriz mínima: carga/error/recuperación de catálogo; saldo insuficiente; agotado; diálogo abierto/cancelado con Tab, Shift+Tab y Escape; compra pendiente; rechazo confirmado; timeout con resultado incierto; respuesta perdida; éxito y segundo intento; 320 px/zoom/texto ampliado; movimiento reducido y colores forzados; anuncios con NVDA y VoiceOver. Todos los cargos de prueba deben ejecutarse contra API o datos aislados.

## Fuentes y método

Se usaron cinco consultas de búsqueda, más apertura directa de documentación W3C/WAI y web.dev. Los enlaces junto a criterios apuntan a fuentes primarias. La evidencia local está anclada al árbol activo, no a respaldos. No se ejecutó Lighthouse ni se produjeron cifras de Core Web Vitals; tampoco se ejecutó lector de pantalla. Las hipótesis visuales y de foco se enviaron al agente principal para reproducción aislada.
