# Auditoría integral de Carta de La Bella Lupita

Carta tiene una identidad visual reconocible y un flujo de pedido operativo, pero aún presenta brechas importantes entre lo que el cliente ve, lo que acepta pagar y lo que cocina puede preparar. La prioridad es asegurar ese acuerdo y la recuperación del pedido; después, reducir la distancia entre buscar, comparar y elegir.

La auditoría identifica **24 hallazgos agrupados: 5 P1, 17 P2 y 2 P3**. P1 significa resolver antes de ampliar el uso de pedidos pagados; P2, corregir en la siguiente iteración relevante; P3, mejora editorial o de producto. No se identificó un incidente P0 en el alcance revisado. Las prioridades son juicio técnico según impacto y exposición, no estadísticas de incidentes.

La recomendación es evolucionar la implementación actual. Sus transacciones, controles de cuenta y lenguaje visual ofrecen una base aprovechable. Una reescritura de framework no está justificada por la evidencia.

## Alcance y comprobaciones

**Fecha:** 8 de octubre de 2026, America/Managua. **Objeto:** pestaña Carta, ruta /pedir, ficha, pedido, cobro y conexiones necesarias con perfil, cuenta, compras y preparación.

Se revisaron código activo, catálogo, estilos, API, modelo de datos, pruebas e instrucciones históricas de producto. La captura aportada ubica la pestaña, pero recorta el contenido: no demuestra una pantalla vacía. La Carta publicada se abrió y mostró productos correctamente.

El JavaScript principal y el CSS descargados de producción coinciden byte por byte con la compilación local auditada. Esto acredita el cliente revisado, no la identidad del Worker ni de todas las migraciones publicadas. Los experimentos de cobro se ejecutaron únicamente con PostgreSQL PGlite en memoria, cuentas sintéticas y el Worker local. Se simularon cambios de catálogo para estudiar pestañas desactualizadas; no se alteraron precios reales.

Se completaron **23 escenarios de navegador/verificación**, **13 comprobaciones API específicas** y las **10 suites de npm test**. TypeScript y la compilación Vite finalizaron correctamente. Se revisaron 320, 390, 768, 1024 y 1440 px; Chromium fue el motor principal y WebKit tuvo una comprobación básica de ficha y cierre. Cinco estados auditados con axe no reportaron violaciones automáticas; hubo comprobaciones de contraste incompletas en dos estados. Las pruebas de teclado sí encontraron fallos. No es una certificación WCAG.

Se validó reflujo a 320 CSS px y espaciado de texto aumentado en la ficha, sin desbordamiento horizontal en esos escenarios. Quedan fuera de esta evidencia: VoiceOver/NVDA reales, zoom de navegador al 400 %, teléfonos físicos, Core Web Vitals de campo, contención con múltiples conexiones PostgreSQL reales, reglas externas de infraestructura y observación presencial de cocina. Esas comprobaciones no se sustituyen por un test local.

No se modificó código funcional ni se desplegó la aplicación. Los entregables, builds de auditoría y evidencias están en esta carpeta; las pruebas existentes generaron también temporales bajo .test-output. No hubo pedidos, cobros, mensajes ni cambios de cuenta en producción.

## Fortalezas que conviene conservar

- 73 productos con IDs únicos y precios positivos en centavos; 33 fotos referenciadas existentes y 40 fichas que funcionan sin foto. Distribución: Café 24, Brunch 14, Bistró 27 y Dulce 8. Precios de C$60 a C$830.
- El servidor impone precio y concepto, rechaza cantidades inválidas, bloquea la cuenta y registra compra, cargo y recibo en una transacción. La devolución completa probada restituye saldo y puntos sin repetirse.
- Con catálogo estable, perder la respuesta del cobro y recargar conservó la referencia y generó exactamente un pedido. La coexistencia de sesión cliente y cookie de personal también funcionó en las pruebas.
- El borrador se separa por cuenta; respuestas de otra sesión se descartan. Cocina recibe una lista limitada de datos. Hay estados de error, reintento y resultado incierto ya implementados.
- Fotografía, tonos cálidos, tipografía editorial y filas textuales ofrecen una identidad consistente. El buscador tiene etiqueta, tolera tildes y busca globalmente; los diálogos nativos y la reducción de movimiento son buenas bases.
- No hay desbordamiento horizontal en los cinco anchos comprobados ni errores JavaScript no controlados durante los recorridos. Esto no elimina los problemas de jerarquía y teclado encontrados.

## Prioridades

| Hallazgo | Prioridad | Perspectiva | Diagnóstico |
|---|---|---|---|
| C01 | P1 | Cobro y confianza | El servidor puede cobrar un precio distinto del mostrado |
| C02 | P1 | Cobro y confianza | Cambiar la carta rompe la recuperación de un cobro anterior |
| C03 | P1 | Cobro y confianza | Un producto retirado puede bloquear el pedido pendiente |
| C04 | P1 | Catálogo y operación | Las opciones ofrecidas por los platos no llegan al pedido |
| C05 | P1 | Catálogo y operación | El cobro no consulta agotados ni horario de recepción |
| C06 | P2 | Catálogo y operación | Las alergias guardadas no forman parte de la comanda |
| C07 | P2 | Cobro y confianza | Los límites de cantidad difieren entre las superficies |
| C08 | P2 | Experiencia y conversión | Saldo insuficiente termina en una acción deshabilitada |
| C09 | P2 | Experiencia y conversión | El destacado desplaza la tarea de elegir y buscar |
| C10 | P2 | Experiencia y conversión | La búsqueda omite alias y comunica mal su alcance |
| C11 | P2 | Accesibilidad | Cerrar fichas y vaciar el carrito pierde el foco útil |
| C12 | P2 | Accesibilidad | La navegación fija cubre controles que reciben foco |
| C13 | P2 | Accesibilidad | Búsqueda y agregado carecen de confirmación accesible suficiente |
| C14 | P2 | Experiencia y conversión | La URL y la navegación no conservan el estado de Carta |
| C15 | P2 | Resiliencia y arquitectura | La lectura de Carta depende de la cuenta |
| C16 | P2 | Resiliencia y arquitectura | La recuperación visual y el contrato de éxito son incompletos |
| C17 | P2 | Cobro y confianza | El intento enviado dura lo mismo que la pestaña |
| C18 | P2 | Catálogo y operación | Seguimiento y cancelación necesitan resolver excepciones reales |
| C19 | P2 | Catálogo y operación | El empaque y el total final requieren una regla común |
| C20 | P3 | Contenido e identidad | La ficha podría ayudar más a decidir |
| C21 | P2 | Resiliencia y arquitectura | Hay oportunidades de rendimiento que deben medirse |
| C22 | P2 | Resiliencia y arquitectura | La cascada y las pruebas facilitan regresiones inadvertidas |
| C23 | P2 | Catálogo y operación | Faltan medidas específicas del recorrido y sus excepciones |
| C24 | P3 | Contenido e identidad | Nombres y redacción pueden ser más consistentes |

## Diagnóstico detallado

### C01 El servidor puede cobrar un precio distinto del mostrado

**P1 · Cobro y confianza · Reproducido en API local.**

El carrito calcula con la carta incluida en la aplicación. El envío contiene producto, cantidad y referencia, sin una cotización o total aceptado. Una pestaña abierta puede conservar C$95 para un Latte mientras el servidor actualizado cobra C$105. La simulación devolvió 200 y un cargo de C$105; no se afirma que haya ocurrido a un cliente real.

**Impacto.** El cliente descubre la diferencia después del cargo. El control de saldo del navegador también se calcula sobre una cifra potencialmente antigua.

**Mejora.** Solicitar una cotización autoritativa con líneas, opciones, cargos, total, versión y vencimiento. Confirmarla antes de cobrar. Un total esperado puede funcionar como precondición, nunca como precio confiado al navegador.

**Criterio de aceptación.** Si cambia el precio antes de enviar, no hay cargo hasta que el cliente acepte el nuevo total. El recibo conserva el importe aceptado. Una cotización vencida se renueva de forma explícita.

**Código.** [src/casa/datos.tsx:213](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:213>) · [src/casa/pedido.tsx:129](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:129>) · [src/worker/index.ts:754](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:754>)

**Evidencia.** [integridad-local-resultados.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/integridad-local-resultados.json>)

Criterio de referencia: [OWASP sobre autorización de transacciones](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html).

### C02 Cambiar la carta rompe la recuperación de un cobro anterior

**P1 · Cobro y confianza · Reproducido en API local.**

Tras cobrar una referencia, repetirla con catálogo estable recupera el mismo pedido. Cambiar el precio o solamente el nombre devuelve 409; retirar el producto devuelve 422. La huella del intento se reconstruye con datos actuales antes de recuperar su resultado histórico.

**Impacto.** Un envío que perdió su respuesta puede quedar sin reconciliar. Los ensayos conservaron un solo cargo: no se observó duplicación automática. El riesgo posterior es que el usuario abandone ese intento y cree otro creyendo que el anterior falló.

**Mejora.** Resolver primero el intento original por cuenta y referencia. Comparar la intención canónica enviada y devolver el recibo inmutable, sin revalorarlo. Separar consulta de estado y creación de un nuevo pedido; un conflicto no debe interpretarse automáticamente como ausencia de cobro.

**Criterio de aceptación.** Perder respuesta, publicar precio/nombre nuevos o retirar el artículo y reintentar devuelve el recibo original. Cambiar realmente las cantidades con la misma referencia mantiene el conflicto, sin un segundo asiento.

**Código.** [src/worker/index.ts:159](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:159>) · [src/worker/index.ts:747](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:747>) · [src/worker/index.ts:782](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:782>) · [src/casa/pantallas/Pedir.tsx:113](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:113>)

**Evidencia.** [integridad-local-resultados.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/integridad-local-resultados.json>)

Criterio de referencia: [Referencia de idempotencia de Stripe](https://docs.stripe.com/api/idempotent_requests).

### C03 Un producto retirado puede bloquear el pedido pendiente

**P1 · Cobro y confianza · Reproducido en navegador local.**

Al restaurar un envío pendiente, el proveedor elimina los productos que ya no están en CARTA. Si desaparecen todas sus líneas, la hoja dice que el pedido está vacío, pero conserva pendiente=true. Agregar sigue deshabilitado y no existen botones de reintentar o vaciar.

**Impacto.** El cliente queda atrapado en esa pestaña/cuenta sin una salida visible, precisamente cuando puede existir un cargo por confirmar.

**Mejora.** Mantener el documento enviado separado del borrador. No filtrar ni recalcular un envío pendiente con el catálogo actual. Consultar su referencia y mostrar su descripción histórica; ofrecer una ruta de atención cuando no pueda determinarse el resultado.

**Criterio de aceptación.** Un pendiente con uno o todos sus productos retirados conserva su comprobante y se puede consultar. No requiere borrar almacenamiento ni repetir la compra para salir del bloqueo.

**Código.** [src/casa/pedido.tsx:58](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:58>) · [src/casa/pedido.tsx:86](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:86>) · [src/casa/pantallas/Pedir.tsx:217](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:217>)

**Evidencia.** [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>) · [evidencia/pedido-pendiente-vacio.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/pedido-pendiente-vacio.png>)

### C04 Las opciones ofrecidas por los platos no llegan al pedido

**P1 · Catálogo y operación · Reproducido en navegador y confirmado en contrato.**

Ensalada Lupita ofrece camarón, pollo o res; dos desayunos ofrecen huevo al gusto; Agua permite fría o al tiempo. La ficha solo recoge cantidad. El payload y la comanda solo admiten producto y unidades. Abrir Ensalada Lupita no muestra ningún selector de proteína.

**Impacto.** La descripción ofrece una elección que cocina no recibe. Resolverla después de cobrar exige una conversación adicional y puede producir una preparación distinta a la esperada.

**Mejora.** Definir con cocina grupos de opciones, obligatoriedad, valores por defecto comunicados y suplementos. Validarlos en servidor y conservarlos en resumen, recibo y comanda. El agregado rápido debe abrir la ficha cuando falte una elección obligatoria.

**Criterio de aceptación.** Dos ensaladas con proteínas diferentes permanecen distinguibles. No se confirma una selección obligatoria incompleta; los suplementos aparecen antes del pago y llegan idénticos a cocina.

**Código.** [src/data/menu.ts:79](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:79>) · [src/data/menu.ts:99](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:99>) · [src/data/menu.ts:108](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:108>) · [src/casa/pantallas/DetalleCarta.tsx:61](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/DetalleCarta.tsx:61>) · [src/worker/index.ts:786](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:786>)

**Evidencia.** [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>) · [evidencia/detalle-eleccion-ausente.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/detalle-eleccion-ausente.png>)

### C05 El cobro no consulta agotados ni horario de recepción

**P1 · Catálogo y operación · Carencia confirmada en código; impacto operativo por validar.**

La carta compilada no modela disponibilidad, pausa de cocina, horario de venta ni capacidad. El servidor verifica existencia y saldo. Los tiempos orientativos son constantes por grupo: 6, 15, 22 y 5 minutos; el pedido toma el máximo, aunque cambien unidades y carga de trabajo.

**Impacto.** El sistema permite aceptar un pedido que la operación podría no poder preparar. No se observó un incidente real ni se ha validado con cocina su procedimiento manual actual.

**Mejora.** Introducir disponibilidad manual por producto/categoría y una pausa global, con responsable y vigencia. Validar el horario digital y la disponibilidad antes de debitar. Acordar cómo estimar preparación y distinguir estimación de hora confirmada.

**Criterio de aceptación.** Un agotado o una pausa impiden un nuevo cargo aun desde una pestaña vieja. El cliente ve qué cambió y puede revisar el pedido. La estimación se contrasta con datos reales de preparación.

**Código.** [src/data/menu.ts:6](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:6>) · [src/data/menu.ts:25](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:25>) · [src/casa/pantallas/Pedir.tsx:95](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:95>) · [src/worker/index.ts:747](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:747>)

**Evidencia.** [findings_integridad.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_integridad.md>) · [findings_rendimiento.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)

### C06 Las alergias guardadas no forman parte de la comanda

**P2 · Catálogo y operación · Confirmado en código; expectativa por validar.**

El perfil permite guardar alergias, pero la consulta de pedidos y la lista de datos que recibe cocina no las incluyen. Carta tampoco confirma si esa información se considera al preparar una compra.

**Impacto.** Una preferencia guardada puede crear una expectativa de atención que este flujo no respalda. No se puede inferir la seguridad alimentaria de un plato a partir de su descripción.

**Mejora.** Acordar un procedimiento con operación y explicarlo al cliente. Si una restricción se confirma para un pedido, transmitir solo la información pertinente a quienes preparan, dejando constancia de esa confirmación. No ampliar indiscriminadamente acceso al perfil.

**Criterio de aceptación.** El cliente entiende qué debe confirmar con la casa y cocina recibe la información confirmada necesaria para esa preparación. Ninguna etiqueta dietética se publica sin validación responsable.

**Código.** [src/worker/cuenta-cliente.ts:15](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/cuenta-cliente.ts:15>) · [src/worker/operacion.ts:58](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:58>) · [src/worker/pedido-publico.ts:2](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/pedido-publico.ts:2>)

**Evidencia.** [findings_integridad.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_integridad.md>)

### C07 Los límites de cantidad difieren entre las superficies

**P2 · Cobro y confianza · Reproducido en navegador y API local.**

Ficha, lista y carrito permiten superar 20 unidades. Se prepararon 21 Lattes por C$1,995 y solo al pagar apareció «La cantidad de Latte no nos cuadra». La API, a su vez, acepta 40 líneas Agua×20: 800 unidades por C$48,000 con saldo sintético suficiente.

**Impacto.** La interfaz admite pedidos que el servidor rechaza. El límite por línea tampoco equivale a un límite por producto o por pedido; la importancia de este segundo caso depende de la política de capacidad.

**Mejora.** Definir y compartir límites por configuración de producto y por pedido. Acumular duplicados antes de validar, considerar lo ya añadido y explicar el máximo con una salida para pedidos grandes.

**Criterio de aceptación.** Con 19 unidades ya añadidas, la ficha solo admite una más si el tope es 20. Dividir el mismo producto entre líneas no permite evitar ese tope. Probar límites 20/21 y 40/41.

**Código.** [src/casa/pedido.tsx:99](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:99>) · [src/casa/pantallas/DetalleCarta.tsx:65](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/DetalleCarta.tsx:65>) · [src/worker/index.ts:749](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:749>)

**Evidencia.** [evidencia/pedido-21-error.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/pedido-21-error.png>) · [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>) · [integridad-local-resultados.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/integridad-local-resultados.json>)

### C08 Saldo insuficiente termina en una acción deshabilitada

**P2 · Experiencia y conversión · Reproducido en navegador local.**

Con C$0 y un Latte de C$95, la pantalla propone recargar o pagar la diferencia en caja, pero solo ofrece un botón de pago deshabilitado y vaciar. No existe en esa hoja un flujo para pagar la diferencia, conservar el pedido para caja o actualizar el saldo después de recargar.

**Impacto.** El cliente puede invertir tiempo en preparar el pedido y descubrir tarde que no puede completarlo digitalmente. El texto no distingue con claridad lo disponible en la app de lo que debe resolver presencialmente.

**Mejora.** Explicar el medio de pago y saldo disponible antes de confirmar. Incorporar una salida concreta compatible con el negocio: instrucciones de recarga, actualización explícita y borrador conservado; pago en caja solo si operación puede atender ese flujo.

**Criterio de aceptación.** Después de recargar en caja, el usuario puede actualizar el saldo y retomar el mismo borrador. Ningún texto promete una modalidad que la interfaz y operación no puedan ejecutar.

**Código.** [src/casa/pantallas/Pedir.tsx:92](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:92>) · [src/casa/pantallas/Pedir.tsx:275](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:275>) · [src/casa/componentes/Estados.tsx:229](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Estados.tsx:229>)

**Evidencia.** [evidencia/saldo-insuficiente.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/saldo-insuficiente.png>) · [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>)

### C09 El destacado desplaza la tarea de elegir y buscar

**P2 · Experiencia y conversión · Reproducido en cinco anchos.**

A 390×844 el buscador está en Y255, pero el primer producto de la lista en Y954. Al buscar bagel permanece la foto de Latte y el bloque de resultados comienza en Y840. A 768 px el primer producto cae en Y1271. Entre 900 y 1120 px cambia la composición: a 1024 el buscador aparece en Y920, detrás de una foto muy grande.

**Impacto.** El resultado de escribir no se percibe en la primera pantalla y se dificulta comparar opciones. Estas medidas demuestran distancia y jerarquía; no cuantifican pérdida de ventas.

**Mejora.** Mantener título, búsqueda y categorías al inicio en todos los anchos. Al buscar, ocultar o compactar el destacado y acercar resultados al campo. Limitar la altura de la foto en tablet y revisar el orden real de DOM y CSS.

**Criterio de aceptación.** En 320, 390, 768, 1024 y 1440 px, una búsqueda presenta su estado y al menos el inicio de resultados sin atravesar una promoción ajena. La exploración mantiene una fotografía proporcionada.

**Código.** [src/casa/pantallas/Pedir.tsx:158](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:158>) · [src/casa/estilos/casa.css:216](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/casa.css:216>) · [src/casa/estilos/casa.css:311](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/casa.css:311>)

**Evidencia.** [evidencia/carta-1024.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/carta-1024.png>) · [evidencia/buscar-bagel-movil.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/buscar-bagel-movil.png>) · [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>) · [evidencia/bordes.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/bordes.json>)

### C10 La búsqueda omite alias y comunica mal su alcance

**P2 · Experiencia y conversión · Reproducido en producción y entorno local.**

Maracuyá no encuentra Limonada de Calala aunque fruta contiene ese alias. La búsqueda ignora categoría, etiquetas y perfil. Solo espacios muestra «24 resultados en toda la carta» aunque conserva Café. «Ver toda la carta» limpia el campo, pero sigue mostrando únicamente el grupo seleccionado. Buscar café también puede encontrar frases negativas como «no toma café».

**Impacto.** El sistema puede parecer que no vende algo que sí existe y no siempre cumple la salida que ofrece. La relevancia depende demasiado de frases editoriales.

**Mejora.** Construir un índice local pequeño con nombre, alias aprobados, categoría e ingredientes verificados. Unificar la consulta normalizada y distinguir búsqueda global de filtro. Renombrar la salida a «Limpiar búsqueda» o mostrar efectivamente todos los productos.

**Criterio de aceptación.** Maracuya/maracuyá/calala encuentran la misma bebida; los espacios equivalen a campo vacío; el contador y las categorías coinciden; café prioriza productos cafeteros sobre menciones incidentales. No hace falta un motor remoto para 73 productos.

**Código.** [src/casa/pantallas/Pedir.tsx:68](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:68>) · [src/casa/pantallas/Pedir.tsx:175](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:175>) · [src/data/menu.ts:77](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:77>)

**Evidencia.** [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>) · [evidencia/contraste-publico.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/contraste-publico.md>)

### C11 Cerrar fichas y vaciar el carrito pierde el foco útil

**P2 · Accesibilidad · Reproducido con teclado en Chromium.**

Abriendo Espresso mediante Enter y cerrando con Escape, el foco termina en BODY; el siguiente Tab salta a Refrescos. También sucede al abrir el destacado Latte. Tras vaciar y cerrar el pedido, el elemento activo queda en el botón Cerrar de un diálogo oculto; el siguiente Tab pasa a Inicio.

**Impacto.** Quien navega con teclado pierde el lugar desde donde estaba comparando o editando. Esperar a que el diálogo estuviera oculto confirmó que no era solo una lectura prematura de la animación.

**Mejora.** Cerrar la superficie nativa y restaurar el foco cuando el fondo ya sea interactuable. Si desapareció el disparador, elegir un destino estable: acción de estado vacío, búsqueda o producto vecino. Gestionar también eliminación de filas.

**Criterio de aceptación.** Abrir/cerrar desde foto o lista devuelve al disparador; vaciar/eliminar mantiene un foco visible y lógico. Verificar Tab, Shift+Tab, Escape y movimiento reducido en los motores objetivo.

**Código.** [src/casa/pantallas/DetalleCarta.tsx:30](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/DetalleCarta.tsx:30>) · [src/casa/componentes/Superficies.tsx:216](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Superficies.tsx:216>) · [src/casa/pantallas/Pedir.tsx:217](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:217>)

**Evidencia.** [evidencia/bordes.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/bordes.json>)

Criterio de referencia: [Patrón de diálogo modal de W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

### C12 La navegación fija cubre controles que reciben foco

**P2 · Accesibilidad · Reproducido y medido en navegador.**

En 390×844, al recorrer la lista con teclado, Sobre hielo recibe foco en Y774.5–843.7. La barra fija de navegación cubre Y771–844 y todo su ancho: el control queda enteramente oculto. Otros productos también quedan parcialmente bajo las barras.

**Impacto.** Se puede estar operando un control sin verlo. Este caso concreto no satisface el criterio de foco no oculto de WCAG 2.2 AA; el resultado de axe no lo detectó.

**Mejora.** Reservar el espacio de ambas barras para el desplazamiento al foco mediante scroll-padding/scroll-margin y comportamiento de foco probado. Revisar alturas variables, teclado virtual y áreas seguras del teléfono.

**Criterio de aceptación.** Cada control enfocado permanece visible al recorrer toda la carta con y sin pedido. Probar las categorías plegables y las últimas filas, no solo el ancho total del documento.

**Código.** [src/casa/pantallas/Pedir.tsx:190](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:190>) · [src/casa/componentes/Navegacion.tsx:79](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Navegacion.tsx:79>) · [src/casa/estilos/casa.css:325](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/casa.css:325>)

**Evidencia.** [evidencia/foco-resumen.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/foco-resumen.json>) · [evidencia/foco-summary-totalmente-cubierto.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/foco-summary-totalmente-cubierto.png>)

Criterio de referencia: [WCAG 2.2 sobre foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

### C13 Búsqueda y agregado carecen de confirmación accesible suficiente

**P2 · Accesibilidad · Confirmado en DOM y código; anuncio hablado pendiente.**

El conteo de resultados es un párrafo sin región de estado. El botón de agregar se convierte visualmente en un número, pero su nombre accesible sigue siendo «Agregar X al pedido» y no comunica cuántos hay. Carrito y total cambian sin un anuncio específico. La ficha sí anuncia su cantidad mediante output.

**Impacto.** Un lector de pantalla no dispone de un mensaje programático claro sobre el resultado de buscar o agregar. El número que sigue sumando también puede resultar ambiguo visualmente.

**Mejora.** Usar una región estable de estado con anuncios breves tras búsqueda/agregado y nombres que incluyan acción y cantidad actual. Mantener el foco y evitar múltiples anuncios por pulsación. Hacer visible que el número sigue siendo una acción de agregar.

**Criterio de aceptación.** NVDA o VoiceOver anuncian resultados, cero resultados y cantidad/total tras agregar, sin recitar toda la lista. Esta prueba hablada aún debe realizarse con tecnologías de asistencia reales.

**Código.** [src/casa/pantallas/Pedir.tsx:175](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:175>) · [src/casa/pantallas/Pedir.tsx:179](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:179>) · [src/casa/pantallas/Pedir.tsx:242](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:242>)

**Evidencia.** [findings_ux.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_ux.md>)

Criterio de referencia: [WCAG 2.2 sobre mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### C14 La URL y la navegación no conservan el estado de Carta

**P2 · Experiencia y conversión · Reproducido en navegador local.**

Abrir /pedir?plato=latte presenta la ficha. Cerrarla no elimina el parámetro y recargar vuelve a abrirla. Abrir desde la lista no actualiza la URL. Búsqueda y categoría son estado local que se pierde al salir de la pantalla.

**Impacto.** Compartir, recargar y volver no representan con fidelidad lo que se está viendo. Se interrumpe la comparación entre Carta y otras secciones.

**Mejora.** Sincronizar producto, categoría y búsqueda con una política explícita de URL/historial. Definir cuándo Atrás cierra ficha y cuándo sale de Carta; restaurar de forma razonable selección y desplazamiento.

**Criterio de aceptación.** Un enlace abre el producto esperado; cerrar limpia ese estado; recargar y Atrás/Adelante son previsibles. Volver a Carta no obliga a repetir una búsqueda pendiente.

**Código.** [src/casa/pantallas/Pedir.tsx:49](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:49>) · [src/casa/pantallas/Pedir.tsx:83](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:83>) · [src/casa/App.tsx:35](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/App.tsx:35>)

**Evidencia.** [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>)

### C15 La lectura de Carta depende de la cuenta

**P2 · Resiliencia y arquitectura · Reproducido; apertura pública es decisión de producto.**

Sin sesión, /pedir muestra la entrada por correo. Con una sesión local y /api/yo fallando, tampoco se puede leer la carta estática ya incluida en el cliente. La marca sí tiene un menú público en su sitio principal.

**Impacto.** Clientes nuevos, enlaces compartidos o una caída de cuenta pueden quedar sin acceso al menú de la app. Si Carta debe ser exclusiva para socios, esa restricción puede ser deliberada; la dependencia de lectura y cobro debe evaluarse por separado.

**Mejora.** Decidir una estrategia de consulta pública o enlazar claramente al menú público existente. Permitir lectura degradada del catálogo cuando falla la cuenta; mantener pago y saldo sujetos a confirmación de sesión y servidor.

**Criterio de aceptación.** Una falla de cuenta tiene una salida útil para consultar el menú. Si se autoriza carta pública, un visitante ve productos sin entregar datos y se autentica al realizar la acción que lo requiere.

**Código.** [src/casa/App.tsx:104](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/App.tsx:104>) · [src/casa/App.tsx:120](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/App.tsx:120>)

**Evidencia.** [evidencia/carta-invitado.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/carta-invitado.png>) · [evidencia/fallo-cuenta-oculta-carta.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/fallo-cuenta-oculta-carta.png>) · [evidencia/contraste-publico.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/contraste-publico.md>)

### C16 La recuperación visual y el contrato de éxito son incompletos

**P2 · Resiliencia y arquitectura · Imagen fallida reproducida; otras rutas confirmadas en código.**

Una foto fallida deja una imagen rota sin sustitución, aunque descripción y Agregar siguen funcionando. La entrada actual Casa no monta la barrera de errores que existe en el cliente heredado. La validación de /cuenta/cobrar solo exige saldo y monto, no un pedido válido.

**Impacto.** Un fallo de render carece de una recuperación de interfaz preparada. Una respuesta 200 parcial puede vaciar el borrador sin cumplir el contrato completo del pedido. Estos dos últimos escenarios son riesgos de código, no fallos de producción observados.

**Mejora.** Ofrecer respaldo de imagen; incorporar una barrera de error en la entrada activa conservando el intento; validar identificador, número, estado y total del pedido en la respuesta. Tratar una confirmación incompleta como resultado por reconciliar.

**Criterio de aceptación.** Foto 404 conserva ficha legible; error de render muestra recuperación; un 200 sin pedido no declara compra completada ni habilita un nuevo cobro sin consultar el intento.

**Código.** [src/casa/pantallas/DetalleCarta.tsx:59](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/DetalleCarta.tsx:59>) · [src/casa/main.tsx:15](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/main.tsx:15>) · [src/casa/datos.tsx:159](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:159>)

**Evidencia.** [evidencia/imagen-fallida.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/imagen-fallida.png>) · [evidencia/bordes.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/bordes.json>) · [findings_rendimiento.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)

### C17 El intento enviado dura lo mismo que la pestaña

**P2 · Cobro y confianza · Confirmado en código.**

Borrador, referencia y pendiente se guardan en sessionStorage; si falla, continúan solo en memoria. Cerrar la pestaña puede perder la referencia que permite reconciliar un envío. La restauración valida el producto y positividad, pero no todo el esquema de cantidades y referencia.

**Impacto.** La persistencia diseñada para un borrador también gobierna una operación que podría haber cobrado. El historial ayuda a consultar compras, pero no sustituye la conciliación explícita del intento perdido.

**Mejora.** Separar la vida del borrador de la del intento enviado. Conservar pendientes duraderamente por cuenta o en servidor, con versionado y validación de esquema. Explicar si no puede guardarse el intento.

**Criterio de aceptación.** Cerrar tras un commit sin respuesta permite recuperar el resultado al volver. Almacenamiento denegado o datos antiguos/corruptos conducen a una salida explícita y nunca a un cobro repetido involuntario.

**Código.** [src/casa/pedido.tsx:58](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:58>) · [src/casa/pedido.tsx:80](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:80>) · [src/casa/http.ts:23](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/http.ts:23>)

**Evidencia.** [findings_integridad.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_integridad.md>)

### C18 Seguimiento y cancelación necesitan resolver excepciones reales

**P2 · Catálogo y operación · Confirmado en código y regresión operativa.**

Mis compras actualiza al abrir o pulsar Actualizar, sin actualización automática de pedidos activos ni hora visible de última lectura. El cliente dispone de atención genérica. El equipo puede cancelar recibido/aceptado, pero preparando solo pasa a listo; no hay un camino normal para abortar por una incidencia detectada después.

**Impacto.** El cliente debe consultar manualmente. Una rotura, un error parcial o una imposibilidad de entrega durante preparación requieren un procedimiento fuera del flujo actual.

**Mejora.** Mostrar la última consulta y actualizar al recuperar foco, con sondeo moderado cuando haya pedidos activos. Definir cancelación operativa excepcional, responsables, motivo y devolución total/parcial, preservando auditoría. Comunicar la política antes de pagar.

**Criterio de aceptación.** Una incidencia durante preparación tiene una salida autorizada y trazable. No hay devoluciones duplicadas. El seguimiento indica cuándo se actualizó y diferencia error de conexión de ausencia de cambios.

**Código.** [src/casa/pantallas/MisCompras.tsx:13](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/MisCompras.tsx:13>) · [src/worker/operacion.ts:74](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/operacion.ts:74>) · [src/casa/componentes/Atencion.tsx:20](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Atencion.tsx:20>)

**Evidencia.** [evidencia/regresion-backend.txt](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/regresion-backend.txt>) · [findings_integridad.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_integridad.md>)

### C19 El empaque y el total final requieren una regla común

**P2 · Catálogo y operación · Diferencia documental y de canales confirmada; política vigente pendiente.**

El menú público muestra Empaque C$40. PLAN.md afirma que se cobra al pedir para llevar, mientras Carta se presenta como «Pedí para llevar» y suma únicamente los productos seleccionados. No existe una línea de empaque en el desglose auditado. La existencia de esos textos no demuestra que hoy deba cobrarse siempre.

**Impacto.** Si hay un cargo al retirar, el total digital podría crear una expectativa incorrecta. Si el empaque está incluido o es cortesía, la documentación histórica sigue induciendo a error.

**Mejora.** Confirmar la política vigente por canal y tipo de producto. Si corresponde un cargo, incluirlo en la cotización y el desglose antes del pago; si está incluido, comunicarlo y actualizar documentación. Aclarar igualmente qué otros conceptos incluye el precio, sin inventar tasas.

**Criterio de aceptación.** El total confirmado coincide con lo exigible al retirar. App, caja y menú público expresan la misma regla. No añadir automáticamente C$40 por esta auditoría.

**Código.** [PLAN.md:255](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/PLAN.md:255>) · [src/casa/pedido.tsx:137](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pedido.tsx:137>) · [src/casa/pantallas/Pedir.tsx:141](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:141>)

**Evidencia.** [evidencia/contraste-publico.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/contraste-publico.md>)

Criterio de referencia: [Menú público de La Bella Lupita](https://labellalupita.com/menu).

### C20 La ficha podría ayudar más a decidir

**P3 · Contenido e identidad · Inventario y revisión editorial.**

Hay 73 productos, 33 con foto y 40 sin foto; todas las fotos referenciadas existen. Faltan campos estructurados de tamaño/porción y datos que permitan filtros dietéticos fiables. Algunas descripciones son vagas, como los cuatro sabores de Pizza Cuatro Estaciones. La ausencia de foto no rompe una ficha.

**Impacto.** Comparar valor, tamaño y composición depende de conocimientos previos o de preguntar en barra. No todos los artículos necesitan una imagen grande para que la carta sea útil.

**Mejora.** Priorizar datos de decisión por familia y fotografías auténticas de los platos más demandados. Mantener una ficha textual cuidada para el resto. Aprobar recetas, porciones y cualquier atributo alimentario con cocina antes de publicarlo.

**Criterio de aceptación.** Los productos prioritarios indican porción, componentes y opciones que cambian la elección. Cada dato tiene responsable y revisión; no se deducen garantías dietéticas de una lista incompleta.

**Código.** [src/data/menu.ts:6](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:6>) · [src/data/menu.ts:92](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:92>) · [src/casa/pantallas/DetalleCarta.tsx:61](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/DetalleCarta.tsx:61>)

**Evidencia.** [evidencia/catalogo.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/catalogo.json>) · [findings_rendimiento.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)

### C21 Hay oportunidades de rendimiento que deben medirse

**P2 · Resiliencia y arquitectura · Recursos y cabeceras medidos; velocidad de campo no medida.**

El JS principal pesa 415,080 bytes sin comprimir, aproximadamente 129 KB gzip local, y el CSS 73,931 bytes, aproximadamente 15.3 KB gzip. Producción entrega Brotli; esas cifras gzip no son transferencia real. Se importan estáticamente todas las pantallas cliente. Las fotos disponen de variantes pequeñas que el destacado y detalle no usan. Los assets con hash devuelven max-age=0 y must-revalidate.

**Impacto.** Existe trabajo evitable de descarga/validación y ejecución, pero estos tamaños no demuestran lentitud. La lista textual evita descargar 73 fotos. No hay evidencia para afirmar que Carta aprueba o falla Core Web Vitals.

**Mejora.** Medir primero en dispositivos modestos y red fría. Usar tamaños de imagen basados en sus dimensiones reales, diferir pantallas no visitadas y revisar caché inmutable solo para assets versionados. Medir animaciones geométricas antes de sustituirlas. Mantener precios y API fuera de una caché obsoleta.

**Criterio de aceptación.** Comparación reproducible antes/después con recursos, LCP, CLS e interacción. Medición de campo por dispositivo; objetivos p75: LCP≤2.5s, INP≤200ms, CLS≤0.1. Cualquier optimización mantiene imagen nítida y recuperación tras despliegue.

**Código.** [src/casa/App.tsx:18](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/App.tsx:18>) · [src/casa/pantallas/Pedir.tsx:162](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:162>) · [src/casa/pantallas/DetalleCarta.tsx:69](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/DetalleCarta.tsx:69>) · [vite.config.ts:39](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/vite.config.ts:39>)

**Evidencia.** [evidencia/runtime.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>) · [findings_rendimiento.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)

Criterio de referencia: [Web Vitals](https://web.dev/articles/vitals).

### C22 La cascada y las pruebas facilitan regresiones inadvertidas

**P2 · Resiliencia y arquitectura · Confirmado en repositorio y compilación.**

Carta.css y casa.css redefinen los mismos componentes y breakpoints. Leer solo el primero lleva a diagnosticar mal el orden móvil. Conviven entrada y pantallas heredadas; varios comentarios describen otra interfaz. npm test ejecuta diez suites pero no test:ui. Un recorrido público histórico usa selectores obsoletos y contiene un cobro remoto.

**Impacto.** Una modificación aparentemente local puede alterar otros anchos o probar el cliente equivocado. Ejecutar sin revisar un script histórico puede tener efectos fuera del entorno de prueba.

**Mejora.** Consolidar la responsabilidad de estilos de Carta, documentar la entrada activa y actualizar comentarios. Incorporar escenarios relevantes aislados a la validación de cambios; separar claramente scripts de producción y bloquear cobros remotos accidentales.

**Criterio de aceptación.** Existe una matriz de regresión de Carta con anchos intermedios, teclado, catálogo cambiado y respuesta incierta. Los scripts de auditoría y pruebas se ejecutan contra datos sintéticos por defecto.

**Código.** [src/casa/estilos/casa.css:163](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/casa.css:163>) · [src/casa/pantallas/Carta.css:1](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Carta.css:1>) · [package.json:8](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/package.json:8>) · [tests/recorrido-publico.mjs:30](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/tests/recorrido-publico.mjs:30>)

**Evidencia.** [evidencia/regresion-backend.txt](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/regresion-backend.txt>) · [findings_rendimiento.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)

### C23 Faltan medidas específicas del recorrido y sus excepciones

**P2 · Catálogo y operación · Ausencia en esta capa; infraestructura externa no inspeccionada.**

El código cliente no instrumenta búsqueda, apertura, agregado y abandono de Carta ni Web Vitals. La API sí audita cobros, pero no se encontró un límite de frecuencia específico del endpoint; las reglas externas de Cloudflare no se inspeccionaron. Los errores no exponen al cliente una referencia de soporte correlacionable.

**Impacto.** Es difícil saber qué corrección mejora el resultado y detectar acumulación de pendientes, búsquedas fallidas o pedidos que cocina no acepta a tiempo. No se afirma ausencia total de monitorización de infraestructura.

**Mejora.** Medir eventos mínimos sin texto sensible, correlacionar intentos y errores con identificadores opacos y alertar por retrasos/cancelaciones. Definir límites por cuenta y capacidad que distingan una compra nueva de un reintento legítimo.

**Criterio de aceptación.** Un pedido fallido puede rastrearse de cliente a operación sin registrar secretos. Hay métricas de conversión y recuperación; los límites protegen capacidad sin bloquear la consulta de un intento ya enviado.

**Código.** [src/worker/index.ts:109](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:109>) · [src/worker/index.ts:197](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:197>) · [src/worker/index.ts:727](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:727>) · [wrangler.jsonc:18](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/wrangler.jsonc:18>)

**Evidencia.** [findings_integridad.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_integridad.md>) · [findings_rendimiento.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)

### C24 Nombres y redacción pueden ser más consistentes

**P3 · Contenido e identidad · Confirmado en interfaz y código.**

Escritorio llama Carta a la sección; móvil la llama Pedir; el encabezado dice Pedí para llevar y luego La carta. Las descripciones eliminan puntos entre oraciones. Se muestra «1 resultados» y el botón de pago no incorpora el importe, aunque el total aparece encima. Precios y descripciones de lista tienen 12 px: no infringe por sí solo WCAG, pero exige revisar comodidad de lectura.

**Impacto.** La marca mantiene coherencia visual, pero la tarea cambia de nombre y el texto transaccional exige más interpretación de la necesaria.

**Mejora.** Acordar un nombre estable para la sección y diferenciar consultar de pedir en las acciones. Conservar puntuación interna y singular/plural. Probar «Pagar C$ X con mi Cuenta de Casa», precio unitario claro y tamaño de texto según uso real.

**Criterio de aceptación.** Móvil y escritorio nombran el mismo destino de forma consistente. Los textos aclaran cobro, retiro y siguiente paso; la lectura y ampliación conservan información. Validar mejoras de legibilidad con usuarios, sin atribuir cifras de conversión sin medir.

**Código.** [src/casa/componentes/Navegacion.tsx:18](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Navegacion.tsx:18>) · [src/casa/componentes/Navegacion.tsx:107](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Navegacion.tsx:107>) · [src/casa/carta.ts:5](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/carta.ts:5>) · [src/casa/pantallas/Pedir.tsx:288](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Pedir.tsx:288>) · [src/casa/estilos/casa.css:174](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/casa.css:174>)

**Evidencia.** [evidencia/carta-390.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/carta-390.png>) · [evidencia/carta-1440.png](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/carta-1440.png>) · [findings_ux.md](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_ux.md>)

## Composición observada

Medidas verticales en píxeles CSS desde la parte superior del viewport, al abrir Carta sin desplazamiento. El campo precede a la foto en móvil; la distancia hasta la lista es el problema. A 1024 px la cascada cambia el orden y coloca primero el destacado.

| Viewport | Buscador Y | Primer producto Y |
|---|---:|---:|
| 320 × 844 | 309 | 972 |
| 390 × 844 | 255 | 954 |
| 768 × 844 | 267 | 1,271 |
| 1024 × 844 | 920 | 1,079 |
| 1440 × 844 | 194 | 353 |

[Captura móvil buscando bagel](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/buscar-bagel-movil.png>) · [Captura a 1024 px](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/carta-1024.png>) · [Captura a 1440 px](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/carta-1440.png>)

## Secuencia de mejora

Orden propuesto por dependencias y riesgo. Las responsabilidades son funciones recomendadas, no asignaciones a personas. Las fases pueden solaparse; su duración depende de las decisiones de operación y del equipo disponible.

| Fase | Resultado | Hallazgos | Responsabilidad sugerida | Puerta de salida |
|---|---|---|---|---|
| 1 | Acordar el pedido y proteger el cobro | C01–C07, C17, contrato de C16 | Producto, backend y operación | Cotización aceptada, intento inmutable, consulta por referencia, opciones y límites coherentes; cambios de catálogo no rompen recuperación. |
| 2 | Hacer visible la tarea y accesible el recorrido | C08–C14, C24 | Frontend, diseño y accesibilidad | Buscar muestra resultados próximos; teclado conserva foco y visibilidad; información de saldo y acciones son claras en todos los anchos. |
| 3 | Conectar la carta con el turno real | C05–C06, C18–C19, C23 | Operación, producto y backend | Agotados y pausas operables; reglas de empaque y excepciones acordadas; seguimiento y alertas con responsables. |
| 4 | Consolidar catálogo, resiliencia y calidad | C15–C16, C20–C23 | Frontend, contenido y calidad | Consulta degradada definida, datos revisados, regresión aislada y mediciones de rendimiento antes/después. |

## Decisiones de negocio pendientes

Estas decisiones no impidieron completar el diagnóstico. Deben resolverse al especificar la implementación.

- ¿Carta será una herramienta exclusiva del socio o también la entrada desde QR/enlaces? El sitio principal ya ofrece menú público; conviene una experiencia coherente entre ambos canales.
- ¿Qué opciones exige cada receta, cuáles tienen recargo y cuáles se resuelven en barra? La ficha y la comanda deben describir el mismo producto.
- ¿Quién pausa pedidos y marca agotados durante cada turno? ¿Qué ventana de recepción y retiro puede prometer la casa?
- ¿El empaque está incluido, depende del producto o se cobra aparte? ¿Qué puede pagar el cliente en caja cuando el saldo es insuficiente?
- ¿Cómo se confirma una restricción alimentaria y quién puede consultarla? Guardarla en perfil no debe implicar una garantía automática.
- ¿Quién puede cancelar durante preparación y cómo se atienden incidencias parciales? La política necesita reflejo en las acciones autorizadas y sus comprobantes.

## Medición del resultado

| Objetivo | Indicadores | Uso |
|---|---|---|
| Descubrimiento | Búsquedas sin resultado, tiempo hasta primer agregado y abandono después de buscar | Detectar alias faltantes y fricción de composición. |
| Selección | Ficha → agregado, edición de cantidad y consultas por opciones incompletas | Evaluar si la información permite decidir. |
| Compra | Pedido revisado → cotización confirmada → cobro confirmado | Distinguir saldo insuficiente, rechazo de validación y fallo técnico. |
| Recuperación | Pendientes reconciliados, antigüedad del pendiente y conflictos de referencia | Comprobar que una caída de red no se convierte en una segunda compra. |
| Operación | Tiempo hasta aceptación/listo, cancelaciones por agotado y diferencia entre estimación y preparación | Ajustar disponibilidad y promesas al turno real. |
| Calidad | Errores por versión, foco visible, resultado de regresiones y Web Vitals por dispositivo | Detectar regresiones antes de ampliar uso. |

Los objetivos iniciales de corrección pueden ser deterministas: cero cargos sin aceptar un cambio de total; cero pendientes sin salida; cero platos con opciones obligatorias omitidas; cero controles totalmente cubiertos al recibir foco en la matriz de regresión. Las metas de conversión deben definirse después de una línea base, evitando prometer mejoras porcentuales sin datos.

La instrumentación debe usar identificadores opacos y eventos mínimos. No registrar alergias, correo, contenido de solicitudes ni consultas de búsqueda libres como telemetría por defecto. Para rendimiento, los objetivos de referencia p75 son LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1, segmentados por dispositivo; no son resultados medidos de esta auditoría.

No conviene empezar por recomendaciones automáticas, una galería más pesada o una migración de framework. Primero debe quedar completo y recuperable el pedido. Después pueden ensayarse favoritos, repetir pedidos históricos con nueva cotización, combinaciones útiles y recomendaciones editoriales basadas en disponibilidad real.

## Evidencia y reproducción

- [Resultados de navegador](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/runtime.json>)
- [Estados límite y foco](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/bordes.json>)
- [Prueba del foco enteramente cubierto](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/foco-resumen.json>)
- [Integridad de cobro y catálogo](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/integridad-local-resultados.json>)
- [Registro de las diez suites](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/regresion-backend.txt>)
- [Inventario de catálogo](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/catalogo.json>)
- [Huella del código revisado](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/source-manifest.json>)
- [Observación del sitio publicado](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/evidencia/contraste-publico.md>)
- [Investigación de experiencia y accesibilidad](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_ux.md>)
- [Investigación de integridad y operación](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_integridad.md>)
- [Investigación de rendimiento y arquitectura](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/findings_rendimiento.md>)
- [Script de navegador](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/audit-runtime.mjs>)
- [Script de integridad](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_carta_2026-10-08/integridad-local.mjs>)

La síntesis de este informe incorpora las verificaciones posteriores a los memorandos de investigación; prevalece sobre hipótesis que esos anexos todavía marquen como pendientes. El test final de foco esperó a que el diálogo estuviera oculto; la medición adicional de Sobre hielo probó cobertura total por la barra fija.

Los scripts se ejecutan desde esta carpeta con las dependencias ya instaladas de club-lupita. audit-runtime.mjs utiliza build local; solo la comprobación public-build-match hace GET de assets públicos. Todos los envíos de pedido se limitan a 127.0.0.1 y PGlite. integridad-local.mjs bloquea fetch externo. No ejecutar el recorrido-publico histórico como si fuera una prueba aislada.

```powershell
# Desde club-lupita: comprobación y compilación aparte
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
node node_modules/vite/bin/vite.js build --outDir ../research_carta_2026-10-08/build

# Desde research_carta_2026-10-08
node audit-runtime.mjs
node integridad-local.mjs
```

Una ejecución completa del script actual incluye los 23 escenarios; runtime.json conserva los 16 iniciales y bordes.json/foco-resumen.json las comprobaciones posteriores. “Completed” significa que el experimento terminó y dejó evidencia: no significa que el comportamiento auditado sea correcto.
