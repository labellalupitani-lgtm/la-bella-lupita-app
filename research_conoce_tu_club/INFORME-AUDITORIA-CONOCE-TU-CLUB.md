# Auditoría integral de Conocé tu club

**La Bella Lupita · 8 de octubre de 2026 · Diagnóstico y propuesta de mejora**

«Conocé tu club» tiene una identidad visual reconocible, pero hoy funciona como un acceso repetido al panel de beneficios. La invitación no conduce a una explicación del programa y, dentro de `/club`, no produce ningún cambio. El principal trabajo pendiente consiste en separar **comprender el Club, evaluar la Mesa Fundadora y utilizar lo que ya se tiene**, haciendo coincidir las promesas con las reglas que ejecuta el sistema.

Hay además un defecto transaccional prioritario: **una experiencia puede cobrarse a un precio superior al que la persona acaba de confirmar si el catálogo cambia entre ambos pasos**. Se reprodujo exclusivamente con datos sintéticos y una base local: oferta de C$850, actualización a C$900 y cargo de C$900. El reintento de esa misma operación sí evitó un segundo cargo.

La recomendación es corregir primero ese contrato de compra y las discrepancias comerciales, después reorganizar la experiencia y, finalmente, optimizar rendimiento y medición. Una renovación gráfica por sí sola dejaría intactos los problemas principales.

## Alcance y calidad de la evidencia

Se auditó la tarjeta señalada en la captura, su navegación, la página `/club`, el pase, sellos, premios, Mesa Fundadora, beneficios, experiencias y conexiones con saldo y reservas. La revisión incluyó producto, conversión, contenidos, marca, diseño adaptable, accesibilidad, funcionamiento, datos, operación en caja, seguridad focal, privacidad, rendimiento, mantenimiento y medición.

La entrada vigente es `index.html → src/casa/main.tsx → src/casa/App.tsx`. Se distinguió esta implementación de los prototipos y respaldos que también existen en el proyecto.

| Comprobación | Resultado y alcance |
|---|---|
| Captura proporcionada | Señala una tarjeta del menú lateral; no acredita por sí sola una pantalla completa en blanco. |
| Producción anónima | Se abrió `/club` en 1440 y 390 px. Muestra la bienvenida y acceso por correo. Solo se permitieron GET/HEAD; no se iniciaron sesiones ni enviaron formularios. |
| Correspondencia de versión | El archivo público `principal-Cfxl5pt5.js` y la compilación local tienen el mismo SHA-256. Confirma equivalencia del cliente principal; no prueba identidad de la base de datos ni del Worker desplegado. |
| Navegador local | 17 capturas auditadas con Edge: anchos 320, 390, 768, 899, 900, 1366 y 1440 px; membresía, gratuidad, saldo cero, cupos agotados, gracia, premio, vacío, confirmación y ampliación. |
| Segundo motor | Firefox 155, 390 y 1440 px, con premio disponible. |
| Accesibilidad automática | 21 exploraciones axe: 17 locales Edge, 2 públicas Edge y 2 locales Firefox. Cero violaciones detectadas con etiquetas WCAG A/AA seleccionadas. No equivale a certificación de accesibilidad. |
| Reflujo | Sin desbordamiento horizontal del documento en los escenarios medidos, incluido viewport equivalente a 320 × 225 CSS px. Se probaron ampliación de raíz y una prueba adicional de esfuerzo de texto; ninguna sustituye zoom nativo y lectura con ayudas técnicas. |
| Errores | Se simularon fallos de cuenta, catálogo, cupos y canje. Se documentaron mensajes y recuperación. |
| Operaciones locales | Alta, cancelación de renovación, generación de premio, cambio de precio y reintento sobre Worker actual y PGlite efímero. Red externa bloqueada. |
| Investigación | Fuentes oficiales W3C/WAI, OWASP, web.dev, OCDE y programas de cafeterías, incluidos referentes nicaragüenses. |

**Límites materiales:** no se entrevistó a clientes ni al personal; no se verificó la ejecución real del 15 %, prioridad VIP o aviso anticipado; no se midieron métricas de campo, rentabilidad ni conversión; no se hizo un pentest, un dictamen jurídico o una prueba con NVDA/VoiceOver y dispositivos físicos. La funcionalidad autenticada se verificó localmente. No se modificó ni publicó la aplicación.

Los precios públicos consultados fueron **C$950 de cuota** y **100 plazas totales**. El catálogo público devolvió **cero experiencias futuras** en el momento de consulta. Son una fotografía de esa consulta, no valores que convenga copiar como constantes al cliente.

## Lo que funciona y conviene conservar

- La combinación de colores cálidos, retrato, tipografía editorial y voseo da continuidad con La Bella Lupita. El problema central no exige reemplazar su identidad.
- El Club gratuito y la Mesa de pago están diferenciados en el código, aunque esa distinción llegue tarde en el recorrido.
- La cuota se obtiene del servidor. El precio histórico de C$400 que aparece en un comentario no es el precio de la oferta actual.
- La confirmación presenta cuánto cuesta, cuánto hay y cuánto queda, y permite desistir. Debe conservarse al corregir la validación de precio.
- Cancelar renovación está disponible en la propia pantalla. En el entorno local, la cancelación conservó el período pagado.
- Generar un código no consume por sí mismo el derecho. La entrega corresponde al personal y el servidor comprueba su uso.
- Hay controles nativos, salto al contenido, manejo del foco entre rutas, diálogo modal, alertas y región viva. Los sellos tienen una alternativa textual; no dependen exclusivamente del color.
- Se informa cuando no se puede actualizar cuenta, catálogo o cupos. El código diferencia resultados inciertos de una respuesta confirmada.

## Prioridades de intervención

P1 significa resolver antes de ampliar la promoción o venta de la membresía. P2 corresponde a la siguiente iteración de experiencia y operación. P3 son mejoras posteriores con impacto más acotado. La prioridad expresa impacto potencial, no que haya ocurrido un incidente real.

| ID | Prioridad | Hallazgo | Evidencia | Primera medida |
|---|---|---|---|---|
| H01 | P1 | El precio cobrado puede superar el confirmado | Reproducción local con Worker y SQL | Validar oferta aceptada en servidor |
| H02 | P1 | La compra se evalúa sin todos sus beneficios y límites | Código y pantallas de cuenta gratuita | Ficha completa antes de pagar |
| H03 | P1 | Café por visita frente a límite diario; cuota de 30 días frente a bolsa mensual | UI, servidor y migraciones | Acordar y publicar las ventanas reales |
| H04 | P1 | Ventajas de prioridad y anticipación no tienen ejecución digital diferenciada | Código; operación presencial pendiente | Definir mecanismo y responsabilidad |
| H05 | P2 | Conocé tu club duplica Mi Club y no hace nada en `/club` | Clic reproducido | Destino explicativo reconocible |
| H06 | P2 | La invitación desaparece en móvil y portátiles bajos | CSS y navegador | Acceso equivalente a Cómo funciona |
| H07 | P2 | Falta explicar cómo se obtiene un sello y qué incluye el premio | Código, texto y pase | Reglas de uso junto al progreso |
| H08 | P2 | Jerarquía extensa y repetitiva antes de acciones útiles | Capturas y geometría | Ordenar por estado y tarea |
| H09 | P2 | Saldo insuficiente no ofrece recuperación contextual | Caso saldo cero | Cómo recargar y conservar la oferta |
| H10 | P2 | Códigos sin vigencia real visible | UI y API | Mostrar vencimiento y regenerar |
| H11 | P2 | Error de catálogo se presenta también como fallo de cuenta | Fallo controlado | Mensajes específicos por recurso |
| H12 | P2 | Foco perdido tras alta y aviso persistente | Alta/cancelación local | Enfocar resultado y permitir descartar |
| H13 | P2 | Espera, cesión y estados temporales incompletos | UI, código y estados simulados | Canal, acuse y fechas precisas |
| H14 | P2 | Semántica mejorable y pase frágil al ampliar texto | DOM, código y prueba de esfuerzo | Enlaces, acciones claras y altura adaptable |
| H15 | P2 | Acceso antes de comprensión y falta de explicación compartible | Producción anónima | Explicación pública o previa al acceso |
| H16 | P2 | Actualización externa de beneficios depende de nuevas consultas | Revisión de ciclo de datos | Actualizar al volver y tras entrega |
| H17 | P2 transversal | Sesión y datos del pase requieren endurecimiento | Arquitectura; sin explotación demostrada | Minimizar exposición y revisar sesión |
| H18 | P2/P3 | Falta medición específica y oportunidades de rendimiento/mantenimiento | Código y recursos reales | Medir recorrido; optimizar con evidencia |

## Hallazgos detallados

### H01 El servidor no contrasta el importe aceptado

La confirmación de experiencia usa `e.precio` guardado en el cliente. El POST envía la referencia de compra, pero no una versión de la oferta aceptada. El servidor relee y cobra el precio actual. En la reproducción local, la oferta leída era C$850; tras cambiar el precio sintético a C$900, el POST devolvió 200 y cobró C$900. No se observó un incidente equivalente en producción.

La fuente de verdad debe seguir siendo el servidor. La solución es incorporar un presupuesto o versión de oferta verificable y comparar el importe/ciclo aceptados antes de escribir el cargo. Si cambian, devolver un estado de precio actualizado y pedir una nueva confirmación. Refrescar el catálogo al abrir el diálogo ayuda, pero deja abierta la carrera entre refresco y cargo.

**Aceptación:** cambiar el precio después de mostrar la confirmación no produce cargo; la pantalla enseña el cambio y exige aceptarlo. Repetir una operación ya completada devuelve su cargo original y no cobra otra vez. Extender el contrato a la membresía, que también manda un cuerpo sin versión de precio; su cambio entre despliegues es un riesgo estático, no el caso reproducido.

**Trazabilidad:** `Club.tsx:499`, `datos.tsx:249`, `worker/index.ts:905`; [reproducción y resultado](repro_precio_club_resultado.json).

### H02 La oferta no permite evaluar todo lo que se compra

La cuenta gratuita ve bolsa, café y una preferencia genérica. Los detalles de bolsa de 250 g, café filtrado, 15 % en repostería, prioridad VIP y 48 horas de anticipación solo se renderizan cuando ya existe membresía. El importe actual merece una explicación completa antes de pedir saldo.

Mostrar una ficha única para ambos estados: beneficios y restricciones siempre visibles; disponibilidad y acciones de canje solo cuando correspondan. Separar **incluido en la cuota**, **acceso preferente** y **compra adicional**. La entrada a una experiencia tiene precio propio; no debe parecer incluida por estar dentro del Club.

**Aceptación:** sin membresía y sin saldo se pueden consultar todos los beneficios, cantidades, límites, renovación, medio de pago, cancelación y condiciones manuales. La descripción no cambia de significado después del alta. `Club.tsx:243,306`.

### H03 Las ventanas comerciales no coinciden

| Concepto | Promesa visible | Implementación | Corrección propuesta si se conserva la regla actual |
|---|---|---|---|
| Café de la Mesa | Un café por visita | Un uso por día en Managua | Un café filtrado al día, durante tu visita |
| Cuota | C$950/mes | Cada 30 días | Cuota dinámica cada 30 días y próxima fecha |
| Bolsa | Una bolsa cada mes | Mes calendario de Managua | Indicar período, fecha límite y siguiente disponibilidad |

Un alta a fin de mes puede abarcar dos ventanas de bolsa dentro de un período pagado. Es una consecuencia del diseño actual y necesita evaluación de negocio; no es una conducta indebida del cliente. Tampoco debe inferirse que un beneficio no retirado se acumula.

La palabra «visita» no es intercambiable con «día», y un mes calendario no equivale siempre a treinta días. Ajustar solo el título de un botón dejaría discrepancias en oferta, confirmación, beneficio y caja.

**Aceptación:** casos de dos visitas el mismo día, cambio de día en Managua, alta el 30/31, febrero y renovación cancelada producen respuestas previsibles. Negocio decide la regla; la aplicación la expone y la implementa de forma consistente. `Club.tsx:248,314,334,492`; `worker/operacion.ts:99,117`; `db/018_clientes_equipo.sql:62`.

### H04 Las ventajas manuales necesitan un servicio comprobable

La página aclara que tres beneficios los aplica el personal. Sin embargo, el catálogo ofrece todas las experiencias futuras y la compra no diferencia miembro/no miembro ni ventanas de lanzamiento. La reserva de VIP tampoco incorpora prioridad de membresía en ese flujo. Esto acredita ausencia de automatización en esas rutas; no demuestra incumplimiento del personal.

Para cada ventaja, definir responsable, canal, elegibilidad, horario, inventario reservado, forma de acreditación y resolución de problemas. Si el acceso anticipado ocurre presencialmente, explicar cómo y cuándo se usa. Si se quiere ofrecer en la app, implementar ventanas de apertura o inventario diferenciado antes de prometerlo.

«Una silla que siempre está» puede interpretarse como asiento garantizado. Conservar una frase afectiva, acompañada del alcance literal. La prioridad no garantiza por sí sola disponibilidad.

**Aceptación:** un cliente y un cajero explican el mismo procedimiento; se puede completar un caso de prioridad y otro de anticipación sin improvisar una excepción. El descuento debe concordar también con compras digitales si se anuncia «en toda la repostería». `Club.tsx:38,354`; `worker/index.ts:399,905,1018`.

### H05 La invitación carece de un destino explicativo

«Mi Club» y «Conocé tu club» llevan a `/club`. En esa ruta, el enrutador retorna sin actuar. El clic probado mantuvo URL, no abrió diálogo y dejó el foco en el botón. Desde Inicio sí navega y enfoca el contenido, por lo que no es un fallo general del enrutador.

Dar a la invitación un destino como «Cómo funciona el Club», mientras «Mi Club» mantiene la función de panel. Puede ser una sección enlazable o una ruta dentro de la navegación existente; no hace falta sumar una sexta pestaña. El contenido largo debe poder consultarse sin depender de una tarjeta lateral.

**Aceptación:** desde Inicio y desde Club, la acción muestra información pertinente y reconocible. Recarga, enlace directo, atrás y adelante conservan un resultado coherente. `Navegacion.tsx:47`; `App.tsx:68`.

### H06 El descubrimiento no es equivalente entre dispositivos

La tarjeta se oculta por debajo de 900 px de ancho y, en escritorio, hasta 820 px de alto. Se reprodujo su ausencia en 390, 768, 899 y 1366 × 768. En 1440 × 960 sí aparece. El acceso a Club permanece en la navegación; no se perdió toda la funcionalidad.

La explicación debe estar disponible dentro del propio Club y en la bienvenida. En escritorio, la tarjeta puede ser un acceso adicional. En móvil, un enlace claro junto al título o progreso cumple la misma función sin sobrecargar la navegación fija.

**Aceptación:** una instrucción como «abrí Cómo funciona» sirve en móvil y escritorio. Ocultar una promoción por espacio no elimina información esencial. `casa.css:235,371`.

### H07 El contador explica la meta, pero no cómo avanzar

«Cada visita cuenta», «tanda» y nueve sellos comunican una recompensa, pero no la elegibilidad. El servidor exige una operación de caja y una referencia de ticket; eso evita duplicados, pero no define comercialmente si cuenta una visita, una compra, un producto o un mínimo.

El reverso del pase indica mostrar la identificación y volver al frente. Falta explicar quién registra el sello, cuándo aparece y cómo resolver una omisión. Se requiere una regla validada, no completar el texto con una equivalencia inventada.

**Aceptación:** un cliente nuevo puede explicar qué suma un sello, qué bebida obtiene, si hay vigencia y dónde reclama un faltante. El cajero responde igual a compra grupal, dos tickets en un día y visita sin compra. `Club.tsx:175`; `PaseSocio.tsx:18`; `worker/index.ts:518`.

### H08 El orden da demasiado espacio a la presentación antes de la tarea

En el escenario gratuito de 390 × 844, la página mide aproximadamente 2780 CSS px y el botón de la Mesa comienza cerca de y=1920. En el de miembro, el contenido llega a unos 3222 px. El progreso aparece en el pase y en otra fila de nueve sellos; la reserva se ofrece en cabecera, dentro del bloque de progreso y al final.

La longitud no es un defecto en sí misma. Aquí la combinación de repetición, bloque inicial voluminoso y orden fijo pospone información distinta según la intención: comprender la oferta, mostrar un premio o usar el café incluido.

Propuesta: primer bloque con estado y próxima acción; progreso compacto; explicación breve; beneficios y administración de la Mesa según estado; experiencias y reserva en un nivel secundario. Conservar el pase como identificación, sin exigir atravesar una presentación extensa para usar un beneficio.

**Aceptación propuesta de diseño:** en móvil, el primer bloque identifica si la persona está en el Club gratuito o en la Mesa y ofrece su siguiente acción relevante. Se valida con tareas, no con una obligación artificial de meter toda la página en un solo pantallazo. `Club.tsx:169`; `ClubReserva.css:5`; `identidad.css:21`.

### H09 Saldo insuficiente deja una instrucción incompleta

El botón queda desactivado y se informa cuánto falta, pero no cómo resolverlo. La recarga presencial con efectivo o tarjeta se explica en Perfil. Además, la persona sin saldo no puede abrir desde ese botón la confirmación donde aparecen condiciones adicionales.

Mantener disponible «Ver beneficios y condiciones» y ofrecer «Cómo recargar mi Cuenta de Casa», con explicación de la vía real. No usar «Recargar ahora» si solo existe recarga en caja. Conservar la oferta elegida al volver y distinguir saldo prepago de pertenencia gratuita.

**Aceptación:** desde saldo cero, comprender y decidir siguen siendo posibles; el siguiente paso está a una acción y no promete un pago digital inexistente. `Club.tsx:278,420`; `Perfil.tsx:189`.

### H10 Los códigos no comunican cuánto tiempo útil queda

El premio gratuito vence a los 90 segundos en el servidor. La pantalla conserva el código, pero descarta el dato de vencimiento y solo dice que puede generarse otro. Para beneficios de la Mesa, el texto asegura diez minutos incluso si se recupera un código existente al que le queda menos tiempo.

Mostrar expiración proporcionada por el servidor, estado vencido y «Generar otro código» en el mismo panel. Aclarar que el vencimiento del código no elimina el derecho al premio. Evitar que un lector anuncie una cuenta regresiva cada segundo. Los códigos de recompensa y los de beneficio no comparten necesariamente la misma duración.

**Aceptación:** un código recuperado con treinta segundos no anuncia diez minutos; una espera larga o reloj local incorrecto no ofrece un código como válido cuando ya venció. `Club.tsx:97,474,479`; `worker/index.ts:600`; `worker/operacion.ts:103`.

### H11 Algunos mensajes describen un problema distinto del ocurrido

Al fallar solo el catálogo, la cuenta y sus beneficios seguían visibles, pero el bloque de experiencias mostraba «No pudimos abrir tu cuenta». Se reutiliza un estado vacío pensado para otra situación. Puede hacer creer que se perdieron sesión o saldo.

El vacío de experiencias también merece precisión: «Este mes no abrimos ninguna» afirma más que un catálogo sin próximas experiencias. El texto promete anuncios con dos semanas y acceso anticipado, condiciones que requieren respaldo operativo. La salida «Avisame de la próxima» existe en la definición, pero la pantalla no le conecta una acción.

**Aceptación:** error de cuenta, catálogo no disponible, agenda sin fechas y cupo agotado tienen mensajes y recuperación propios. Usar «Todavía no hay próximas experiencias publicadas» si eso es todo lo que se sabe. `Club.tsx:370,376`; `Estados.tsx:111,142`.

### H12 El resultado de la compra necesita continuidad accesible

Tras el alta local, desaparece el botón que abrió la confirmación y el foco termina en `BODY`. Es distinto del cambio entre rutas, que sí enfoca `MAIN`. El resultado se anuncia mediante una región viva, una fortaleza que debe conservarse.

El aviso de éxito queda fijo sin botón para descartarlo. La captura de cancelación muestra que se superpone a la zona inferior de «Tu mesa». No se probó que ocultara completamente un control enfocado, por lo que no se declara ese incumplimiento concreto.

Enfocar una confirmación o encabezado útil cuando desaparece el activador; ofrecer descartar el aviso y conservar el resultado en un lugar consultable. El éxito de cancelar renovación debe seguir visible en fecha y estado aunque el aviso se cierre.

**Aceptación:** después de comprar, Tab no reinicia el recorrido desde el documento; el foco tiene un destino lógico. Los mensajes no bloquean tareas posteriores, y cerrar un aviso no borra comprobantes. `Club.tsx:110,117,527`; `Estados.tsx:296`; evidencia `alta-cancelacion-local.json`.

### H13 Espera, cesión y gracia necesitan acciones y fechas verificables

La Mesa agotada pide dejar el número en barra: es un canal explícito, aunque manual. Las experiencias agotadas dicen que escribirán por orden sin permitir solicitar ese aviso. La cesión dice «decinos a quién», pero no hay un recorrido del cliente que confirme quién recibe la entrada. No debe parecer que mirar una experiencia agotada ya inscribe a la persona.

El estado de gracia muestra «unos días más» sin fecha. Se probó como variante simulada; no se afirma que siga ocurriendo en la política vigente, cuyo mantenimiento puede vencer membresías sin saldo. El sistema y los mensajes deben acordar si ese estado sigue existiendo.

**Aceptación:** solicitud de aviso con acuse explícito o instrucción clara de acudir a caja; cesión con responsable, confirmación y control de entrada; vencimientos con fecha real de Managua. `Club.tsx:220,266,409,505`.

### H14 Mejorar la semántica y la resistencia al texto ampliado

Las rutas usan botones sin `href`: funcionan con teclado, pero no ofrecen abrir en otra pestaña, copiar destino ni aparecer como enlaces. Para navegación, usar enlaces reales conservando la mejora SPA. Las acciones de canje y confirmación deben seguir siendo botones. Esta distinción está descrita por [WAI para enlaces](https://www.w3.org/WAI/ARIA/apg/patterns/link/) y [botones](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

Los dos «Mostrar código» necesitan un objeto distinguible, por ejemplo «Mostrar código de mi bolsa» y «Mostrar código de mi café». El pase cambia etiqueta y usa a la vez `aria-pressed`; elegir una semántica coherente o usar un disclosure con `aria-expanded`. Mejorar títulos por ruta y el contexto que se anuncia al enfocar el contenido.

Una prueba de esfuerzo adicional duplicó los tamaños computados del texto dentro del contenido a 320 px. Tras esperar la composición, el pase de altura 400 px tuvo 602 px de contenido desplazable frente a 394 px de área interna; sellos e identificación quedaron fuera de su caja. Su altura no crece con las caras absolutas. Es un fallo reproducido bajo ampliación instrumentada; necesita confirmación con zoom de texto nativo antes de declararlo incumplimiento WCAG. La ausencia de desbordamiento horizontal del documento no detecta este recorte interno. Usar altura intrínseca o un patrón de pase que crezca con su contenido. Evidencia: `texto-esfuerzo-geometria.json`.

La puntuación requiere una revisión sistemática: «El Club es gratis y ya lo tenés Esto es lo otro» y «Se fueron C$950» pueden sustituirse por frases completas y una confirmación precisa del cargo. El voseo puede mantenerse sin sacrificar exactitud.

**Aceptación:** cada control se entiende en una lista de acciones; Enter y apertura modificada conservan sus comportamientos; el destino tiene título específico; lectura visual y por voz delimitan bien las oraciones. No se declara un incumplimiento solo por usar texto de 12 px o por desviarse de una recomendación APG.

### H15 Antes de identificarse falta una explicación suficiente y compartible

En producción, abrir `/club` sin sesión lleva a la bienvenida. Hay un resumen de sellos, cuenta y carta, pero no una explicación completa ni comparación con la Mesa. El enlace no sirve como referencia pública de condiciones.

Propuesta: una explicación disponible antes del acceso y también dentro de la cuenta. Puede compartir componentes y reglas con la oferta, evitando dos versiones del programa. La persona que solo quiere informarse no debería tener que entregar correo para conocer el ciclo de pago y los beneficios.

Desde descubrimiento y buscadores, la mejora útil es una URL pública con título, descripción y contenido propios. No indexar datos personales ni convertir el panel autenticado en una página pública. El SEO de la explicación no implica agregar optimización de búsquedas al monedero.

**Aceptación:** una persona sin cuenta comprende gratis/pago y puede compartir las condiciones; después de identificarse conserva el destino que buscaba. `App.tsx:110`; `index.html:7`; capturas públicas.

### H16 El estado de caja puede quedar desactualizado en la pantalla

El proveedor consulta al montar, cuando cambia la sesión y en refrescos explícitos. No se encontró una actualización al recuperar visibilidad o al volver de segundo plano. Si el personal entrega un beneficio desde otra sesión, el cliente puede seguir viendo su estado anterior hasta que se haga otra consulta. El panel de beneficios sí ofrece «Actualizar mis beneficios», una salida que conviene mantener.

Añadir actualización controlada al volver a primer plano y después de cerrar el flujo de entrega; considerar una consulta breve mientras se muestra un código, con límites claros. Conservar fecha de última consulta y distinguir datos anteriores de datos confirmados. No ofrecer canjes fuera de línea: el servidor debe seguir decidiendo si el derecho está disponible.

**Aceptación:** entrega en caja y reapertura de la app producen el estado actualizado sin una recarga completa; una conexión interrumpida no se interpreta como éxito ni duplica operación. Es un riesgo de ciclo de datos observado en código, no una medición de incidencias reales. `datos.tsx:424`; `Club.tsx:479`.

### H17 Seguridad y privacidad como dependencias del módulo

Se comprobaron cabeceras públicas CSP, HSTS y protección frente a incrustación. La cuenta se consulta a partir de la sesión y los canjes se validan en servidor. No se detectó en esta auditoría una exposición pública de la cuenta.

El token de cliente se guarda en `localStorage`, accesible para JavaScript del mismo origen. Es una dependencia transversal: un XSS tendría impacto sobre saldo y beneficios. No se encontró ni explotó un XSS. Evaluar sesión con cookie `HttpOnly`, `Secure` y política `SameSite` adecuada, incluyendo defensa CSRF y transición de cierre de sesión; no basta cambiar el almacén. [OWASP sobre almacenamiento de identificadores de sesión](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html).

El pase gratuito enseña los últimos ocho dígitos del teléfono. En un número de Nicaragua eso suele ser el número local completo, útil en caja pero también visible en una captura. Considerar identificador específico de socio y limitar los datos mostrados al mínimo necesario. Un QR solo sería una mejora si caja puede leerlo, validarlo y operar sin tratarlo como autorización ilimitada.

**Aceptación:** la explicación de privacidad está al alcance antes del registro; el personal identifica al cliente con los datos necesarios; códigos y tokens no entran en analítica ni registros de interfaz. `sesion-cliente.ts:11,15`; `Club.tsx:174`.

### H18 Medición, rendimiento y mantenimiento

La búsqueda en código no encontró eventos explícitos del recorrido «Conocé tu club». En producción sí se carga un beacon de Cloudflare; por eso no corresponde afirmar que no existe analítica de ningún tipo. Tampoco hay acceso aquí a sus métricas o configuración.

En la carga pública observada, el JavaScript principal tuvo 415080 bytes decodificados y aproximadamente 134 kB transferidos. El logo PNG tiene 147557 bytes de recurso, aun cuando se presenta pequeño. Las fuentes están autoalojadas y los iconos ya usan un subconjunto, puntos favorables.

Priorizar una variante optimizada del logo, carga de la explicación con los recursos necesarios y análisis del paquete compartido antes de dividir rutas. El tamaño del paquete no demuestra lentitud perceptible. Medir LCP, INP y CLS reales por móvil/escritorio; los umbrales de referencia son 2.5 s, 200 ms y 0.1 al percentil 75. [Web Vitals](https://web.dev/articles/vitals).

En mantenimiento, hay comentarios históricos sobre banda verde, prototipos y cuotas antiguas. No son fallos del producto por sí mismos, pero dificultan identificar el contrato vigente. Extraer beneficios, restricciones y versiones a una definición mantenible; evitar que marketing, confirmación y caja se redacten por separado. Definir responsables de contenido y de agenda: hoy el catálogo público no tiene experiencias futuras, por lo que el estado vacío es parte principal del producto, no un caso marginal.

La diferencia entre `/api/cupos` y `/api/catalogo` respecto de experiencias pasadas se reprodujo: cupos puede conservarlas y catálogo las filtra. No afecta el listado actual del Club, que usa catálogo; documentar los contratos para que una futura pantalla no reutilice el inventario como agenda.

## Experiencia propuesta

### Dos destinos claros dentro del mismo sistema

**Conocé el Club / Cómo funciona** responde qué es gratis, cómo se gana y canjea, qué ofrece la Mesa y cuáles son sus condiciones. Debe poder abrirse desde bienvenida, menú y panel, también sin sesión.

**Mi Club** responde qué tengo hoy y qué puedo hacer: identificación, progreso, premio listo, beneficio disponible, fecha de renovación e historial. El acceso a explicar las reglas permanece visible. No se necesitan más pestañas principales para expresar ambas intenciones.

| Estado de la persona | Primer contenido | Acción principal | Información secundaria |
|---|---|---|---|
| Sin cuenta | Club gratuito y funcionamiento | Crear mi cuenta gratis | Comparar Mesa y condiciones |
| Cuenta nueva | Cómo ganar el primer sello | Ver cómo usar mi pase | Oferta opcional de la Mesa |
| Tanda en curso | Sellos y siguiente recompensa | Ver reglas o mostrar pase | Historial y Mesa |
| Premio disponible | Bebida lista y condiciones | Mostrar mi premio | Progreso de la tanda siguiente |
| Miembro activo | Beneficios utilizables hoy | Mostrar el beneficio elegido | Próxima cuota y administración |
| Beneficio entregado | Confirmación y próxima disponibilidad | Consultar mi actividad | Otros beneficios |
| Sin saldo | Qué falta y cómo recargar | Ver instrucciones de recarga | Conservar oferta y condiciones |
| Sin plazas | Disponibilidad real | Solicitar aviso por canal existente | Club gratuito y alternativa |
| Sin conexión | Última información y estado de conexión | Reintentar | Ninguna afirmación de entrega o cobro no confirmado |

### Contenido inicial propuesto

Los siguientes textos son propuestas editoriales; los campos entre corchetes requieren datos o decisiones reales.

**Tarjeta de descubrimiento**

> Tu próxima visita tiene premio. Conocé cómo funcionan tus sellos y qué incluye el Club gratuito.
>
> **Cómo funciona el Club →**

**Explicación gratuita**

> Club Lupita es gratis. Seguí tus sellos y consultá tus premios. Al completar nueve sellos, tenés una bebida de cortesía.
>
> Identificate en caja → [regla comercial de acreditación] → mostrá tu código cuando tengas un premio disponible.

**Mesa Fundadora, si se mantienen las reglas actuales**

> Una membresía opcional para disfrutar más de la casa.
>
> **[Cuota del servidor] cada 30 días**, con cargo a tu Cuenta de Casa. Se renueva automáticamente; podés cancelar la renovación y conservar el período ya pagado.
>
> [Beneficios completos y límites validados, visibles antes del botón.]

**Saldo insuficiente**

> Te faltan [importe] para tomar una plaza. Podés recargar tu Cuenta de Casa en caja, con efectivo o tarjeta.
>
> **Cómo recargar** · **Ver beneficios y condiciones**

**Confirmación posterior**

> Ya sos parte de la Mesa Fundadora. Cobramos [importe] de tu Cuenta de Casa. Tu período termina el [fecha] y la próxima renovación es el [fecha, si está activa].

No añadir testimonios, ahorros, garantías de asiento, urgencia ni cifras de uso que no estén verificados. Preservar C$, voseo y fechas de Managua. «Gratis» describe pertenencia al Club; no significa que todas las compras o experiencias sean gratuitas.

## Referentes y aplicación local

Los referentes sirven para resolver cómo explicar, no para importar cuotas, puntos o restricciones.

| Referente oficial | Patrón que aporta | Aplicación concreta |
|---|---|---|
| [Café Las Flores, Nicaragua](https://cafelasflores.com/faq/) | FAQ de registro, identificación, acreditación, historial, canje y soporte | Explicar un sello faltante y la operación en caja |
| [Casa del Café, ficha oficial](https://apps.apple.com/ni/app/casa-del-caf%C3%A9/id1536908037) | Voseo y relación compra → puntos → café | Conservar voz local con una regla comprensible |
| [Costa Club](https://www.costa.co.uk/costa-club) | Alta, acumulación y canje en una secuencia visible | Dar una secuencia corta junto al progreso |
| [Starbucks Rewards](https://www.starbucks.com/terms/rewards/) | Distingue pertenencia gratuita y saldo | Separar Club, Cuenta de Casa y suscripción |
| [Panera, términos de suscripción](https://www.panerabread.com/en-us/mypanera/subscription/terms-and-conditions.html) | Programa gratuito y suscripción con alcance y salida | Explicar la Mesa como opción adicional |

No se usan afirmaciones antiguas de «consumo ilimitado» para Panera: las condiciones consultadas en esta investigación incluyen un límite de 30 canjes por período. Ninguno de estos casos prueba una mejora de conversión para Lupita.

La recomendación de transparencia de recurrencia y salida coincide con el análisis de modelos de suscripción de la [OCDE](https://www.oecd.org/en/publications/unpacking-e-commerce_23561431-en/full-report/component-7.html). Es una referencia de diseño; no se presenta como legislación nicaragüense.

## Viabilidad del programa y operación de la casa

Antes de ajustar beneficios o precio, calcular el margen del ciclo con datos propios: cuota cobrada menos costo de cafés entregados, bolsa, descuentos efectivamente usados, atención, cobros y compensaciones. Revisar por separado el efecto de cruzar dos meses calendario dentro de treinta días. No confundir saldo recargado con ingreso definitivo ni beneficios no usados con valor percibido.

Para evaluar valor para el cliente, usar solamente consumos que hubiera querido comprar, precios vigentes y límites reales. Una calculadora de ahorro solo tiene sentido con esos datos y una metodología visible; no se recomienda publicar «se paga sola» sin comprobación.

La operación necesita una guía corta de caja: identificar al cliente, validar el derecho, entregar, confirmar y resolver discrepancias. Debe cubrir código vencido, cuenta equivocada, beneficio entregado, sello omitido y conexión caída. El personal no debe tener que explicar después del cobro una restricción ausente en la oferta.

| Decisión necesaria | Responsable natural | Resultado que necesita la app |
|---|---|---|
| Qué acredita un sello y qué bebida corresponde | Negocio y caja | Regla y excepciones publicables |
| Café diario o por visita | Negocio y operación | Una unidad de elegibilidad |
| Bolsa mensual o por ciclo | Negocio y finanzas | Ventana, acumulación y costo |
| Prioridad VIP y 48 horas | Reservas y agenda | Canal, inventario y fechas |
| Retiro de 7 a 9 | Operación | Días, a. m./p. m. y lugar |
| Vigencia/gracia y renovación | Negocio y desarrollo | Estados y fechas consistentes |
| Espera, cesión y devoluciones | Atención y negocio | Procedimiento y confirmación |
| Condiciones y privacidad | Responsable de negocio con revisión pertinente | Texto vigente, versión y contacto |

## Plan de ejecución y aceptación

Las magnitudes siguientes son relativas: S es un cambio acotado; M afecta varios componentes o un flujo; L cruza frontend, API, datos y operación. No son plazos comprometidos.

| Etapa | Entrega | Magnitud | Dependencia | Criterio de salida |
|---|---|---|---|---|
| 1 | Contrato de precio aceptado e idempotencia preservada | M/L | API y pruebas de compra | Cambio de precio nunca cobra sin reconfirmar |
| 1 | Reglas acordadas y ficha completa antes de pagar | M | Decisiones comerciales | Oferta, confirmación y caja dicen lo mismo |
| 2 | Destino Cómo funciona y acceso desde todos los tamaños | M | Contenido validado | La invitación siempre produce una explicación |
| 2 | Panel por estado, recarga contextual y próximos pasos | M | Arquitectura y diseño | Cada estado tiene una acción útil |
| 2 | Vencimiento de códigos, errores, foco y avisos | M | Fechas de API y componentes | Canje y resultado comprensibles con teclado |
| 3 | Espera/cesión/prioridad con recorrido operativo | M/L | Responsables y servicio real | Solicitud y resolución trazables |
| 3 | Enlaces, títulos y nombres accesibles | S/M | Navegación | Pruebas nativas y lector de pantalla |
| 4 | Medición mínima, recursos y documentación vigente | S/M | Línea base y propietario del contenido | Evaluación antes/después y contratos claros |

La primera iteración no necesita nuevos niveles, gamificación adicional, una app nativa, más pestañas ni una migración de framework. Esas decisiones no resuelven los defectos identificados.

### Pruebas para aceptar una corrección

1. **Comprensión:** personas nuevas y miembros explican qué es gratis, cómo ganan un sello, qué incluye la Mesa, cuánto/cuándo se cobra y cómo dejan de renovar. Incluir al personal de caja para detectar respuestas divergentes.
2. **Compra:** precio cambia entre lectura y POST; se pierde respuesta; doble toque; saldo cambia; cupo se agota; reintento conserva el resultado. Usar una base aislada.
3. **Tiempo:** 23:59/00:00 Managua, cambio de mes, febrero, alta el 31, cancelación, vencimiento y regeneración de código.
4. **Accesibilidad:** teclado completo, NVDA/VoiceOver, foco tras alta, Escape, nombres de botones, zoom nativo 200/400 %, texto e interlineado, nombre largo, movimiento reducido y foco sin quedar oculto. Cero axe es una base, no una conclusión. [WAI sobre reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) y [foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
5. **Operación:** generar código no entrega; caja confirma una sola vez; el cliente ve la actualización; prioridad, espera y cesión tienen un caso completo verificable.
6. **Regresión:** Club gratuito funciona sin suscripción, no se cobra por abrir condiciones y una cancelación conserva lo pagado. Probar publicación pública y cuentas autenticadas controladas por separado.

## Medición útil para saber si mejoró

Definir una línea base antes de rediseñar. Un aumento de altas no demuestra éxito si también aumentan confusión, devoluciones o reclamos. La tasa de uso tampoco debe incentivar consumo de beneficios que la persona no quiere.

| Pregunta | Indicador | Fuente |
|---|---|---|
| ¿Se entiende el programa? | Respuestas correctas sobre gratis/pago, sello y ciclo | Pruebas de tareas moderadas |
| ¿La explicación se encuentra? | Aperturas por origen y éxito al localizar condiciones | Eventos mínimos y observación |
| ¿Dónde se corta la compra? | Revisión → intento → resultado confirmado, por motivo de fallo | UI y resultado del servidor |
| ¿Se entrega lo prometido? | Código generado → entrega; proporción de vencidos | Eventos agregados de operación |
| ¿La salida funciona? | Intentos y cancelaciones confirmadas; incidencias | Backend y soporte |
| ¿La experiencia responde bien? | LCP, INP y CLS por grupo de dispositivo | Medición de campo |
| ¿El programa es sostenible? | Margen por ciclo y costo por beneficio entregado | Operación y contabilidad |

Eventos propuestos: `club_abierto`, `reglas_abiertas`, `oferta_revisada`, `compra_resultado`, `codigo_solicitado`, `entrega_confirmada` y `renovacion_cambiada`. Un clic no confirma una compra ni una entrega. Separar usuario gratuito/miembro, origen y resultado con categorías simples.

Excluir nombre, teléfono, correo, saldo exacto, códigos, alergias, cumpleaños, notas libres y grabaciones de sesión. Definir finalidad, acceso y retención antes de recoger datos. Esta minimización sigue los [principios de privacidad del W3C](https://www.w3.org/TR/privacy-principles/); no requiere instalar una herramienta específica.

## Evidencia y archivos de apoyo

Los nombres y saldos de las capturas autenticadas son sintéticos. Las capturas completas pueden mostrar la barra fija en la posición del viewport inicial dentro de una imagen larga; eso por sí solo no demuestra contenido inaccesible al desplazarse.

- [Pantalla actual de miembro en escritorio](evidencia/socio-1440.png).
- [Recorrido de cuenta gratuita en móvil](evidencia/gratuito-390.png).
- [Bienvenida pública al abrir Club](evidencia/publico-club-390.png).
- [Confirmación de afiliación](evidencia/confirmacion-plaza.png).
- [Fallo de catálogo con mensaje de cuenta](evidencia/error-catalogo.png).
- [Resultado de alta local](evidencia/alta-local-exitosa.png) y [cancelación local](evidencia/cancelacion-local-exitosa.png).
- [Resultados de las 21 exploraciones: base Edge y público](evidencia/resultados.json) y [Firefox e interacciones](evidencia/interacciones.json).
- [Alta, cancelación y foco](evidencia/alta-cancelacion-local.json).
- [Pase bajo ampliación instrumentada](evidencia/texto-esfuerzo-viewport.png) y [medidas del recorte](evidencia/texto-esfuerzo-geometria.json).
- [Defecto de precio y protección de reintento](repro_precio_club_resultado.json).
- [Referentes completos](findings_referentes.md), [accesibilidad y fuentes](findings_accesibilidad.md), [reglas y operación](findings_confianza.md).

Scripts reproducibles: `audit-browser.mjs`, `audit-interactions.mjs`, `audit-success.mjs`, `audit-text.mjs` y `repro_precio_club.mjs`. La compilación de auditoría está en `club-lupita/.test-output/conoce-club-dist`; no sustituye el paquete publicado. Los archivos fuente citados como `Club.tsx`, `datos.tsx` y `Navegacion.tsx` corresponden a `club-lupita/src/casa`; los de servidor a `club-lupita/src/worker`.

**Decisión recomendada:** conservar la identidad y las protecciones existentes; cerrar el defecto de precio y el contrato de beneficios; convertir «Conocé tu club» en una explicación real, accesible desde cualquier dispositivo, y ordenar «Mi Club» alrededor de lo que cada persona puede hacer hoy.
