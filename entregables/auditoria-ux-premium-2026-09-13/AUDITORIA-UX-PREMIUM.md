# Auditoría UX y dirección visual de Club Lupita

La mejora con mayor impacto visual es convertir el café, el lugar y la pertenencia al club en protagonistas. La aplicación tiene una identidad reconocible —verde, papel cálido, Libre Caslon Text y Work Sans—, pero la experiencia actual se apoya demasiado en bloques de texto y superficies repetidas. El resultado comunica orden; comunica menos el atractivo del producto y la hospitalidad que promete La Bella Lupita.

La dirección propuesta conserva la identidad de la casa y añade fotografía, jerarquías más claras, profundidad selectiva y movimiento ligado a acciones. La prioridad es una apariencia más premium y animada, con el pedido y la reserva siempre comprensibles.

## Alcance y grado de certeza

Se examinó la entrada activa `index.html → src/casa/main.tsx`, el código de las pantallas del socio y la aplicación ejecutada localmente. La revisión visual cubrió bienvenida, inicio, carta, detalle de producto, tienda, club y reserva en una ventana móvil de 390 × 844. En 1440 × 1000 se observó la bienvenida y un estado de error de cuenta. El perfil se revisó por código; su vista autenticada no quedó validada visualmente porque la lectura de cuenta falló durante ese tramo.

La API configurada por el proyecto apunta al servicio de la casa. Se utilizó la cuenta de muestra para navegar y abrir un detalle; no se realizaron cobros, canjes ni reservas. Los valores observados —por ejemplo, C$ 15 de saldo— son estados transitorios de esa cuenta, no cifras comerciales agregadas.

Esta es una auditoría experta de diseño y UX con evidencia de interfaz y código. No incluye entrevistas, pruebas con clientes reales, lector de pantalla completo, certificación WCAG ni medición nueva de Lighthouse/Core Web Vitals. Las propuestas son hipótesis de mejora, no aumentos de conversión demostrados. Las comparaciones visuales reproducen esquemas simplificados del estado actual; no se presentan como capturas exactas.

## Lo que conviene conservar

La pareja tipográfica ya tiene carácter y relación con la marca. El verde sostiene bien la navegación y los beneficios. Los precios se muestran con moneda local; el lenguaje usa el voseo de la casa. Hay controles con etiquetas, objetivos de 44 px en varias acciones, tratamiento de movimiento reducido, estados de carga y errores, y un diálogo nativo para detalles y confirmaciones.

Estas bases reducen el alcance necesario del rediseño. La mejora puede concentrarse en composición, contenido, fotografía y comportamiento sin reemplazar todo el sistema.

## Hallazgos prioritarios

Las prioridades expresan impacto esperado por juicio experto: **alta** afecta comprensión, confianza o atractivo en recorridos centrales; **media** mejora consistencia, comodidad o acabado. El esfuerzo es relativo y excluye operaciones externas como una sesión fotográfica.

| Hallazgo | Evidencia actual | Mejora propuesta | Prioridad / esfuerzo |
|---|---|---|---|
| El producto desaparece del catálogo | 41 de 73 entradas tienen `foto: null`; las 24 de Barra carecen de foto. La cuadrícula repite el mismo espacio «DE LA CASA». | Fotografiar primero las bebidas principales. Mientras tanto, usar una foto destacada donde exista y filas compactas para los productos sin imagen. | Alta / medio + fotografía |
| Inicio parece una cuenta antes que una cafetería | El carnet con saldo abre la pantalla. Después vienen sellos y un módulo de retos no conectado. Los accesos rápidos aparecen más abajo. | Mostrar una bebida y la acción de pedir cerca del inicio; condensar saldo y progreso. Reservar espacio principal para beneficios utilizables. | Alta / medio |
| La bienvenida promete una gestión que no existe | «Dejá tu número y te escribimos» acompaña un campo mantenido únicamente en estado React y un botón deshabilitado. | En modo demo, explicar el estado y ofrecer una sola entrada funcional. Una lista de espera requiere guardar el número y confirmar esa acción realmente. | Alta / bajo para corregir el mensaje |
| La reserva de café se vende sin verla | La tienda usa un bloque verde con texto y precio para la bolsa, sin fotografía dentro de esa oferta. | Presentar el empaque real, gramaje, precio, retiro y beneficio del lote. Mostrar detalles secundarios al expandir. | Alta / medio |
| El sello mezcla dos denominadores | Inicio dice «7 de 10», mientras el progreso anuncia «7 de 9» y faltan dos compras. La décima casilla es el premio. | Escribir «7 de 9 visitas» y «La décima bebida la pone la casa». Separar visualmente el premio. | Alta / bajo |
| La salida de algunos detalles se descubre por ensayo | La hoja de Espresso no muestra un botón de cerrar; sí admite Escape y clic fuera. El tirador se dibuja, pero no tiene implementación de arrastre. | Añadir cierre visible de 44 × 44 px, conservar Escape y retorno del foco. Si se representa arrastre, implementarlo y mantener el botón. | Alta / bajo |
| La navegación puede ocultar contenido superior | El enrutador llama a `scrollTo(0)` y después enfoca `main` sin `preventScroll`. En la navegación observada, la cabecera fija tapaba parte del inicio del contenido. | Gestionar el foco sin desplazar la página inesperadamente, respetar la cabecera y probar volver a cada pestaña. | Media / bajo |
| Los mensajes muestran el proceso de desarrollo | «Falta el lado de la casa» y «próxima entrega» ocupan módulos del producto. La recarga explica por qué la API no puede acreditarse saldo. | Describir la acción disponible: dónde recargar, cuándo retirar, cómo resolver el problema. Mover las limitaciones técnicas a documentación. | Alta / bajo |
| Las reservas exigen recorrer demasiado contenido | Zonas, 14 días, horas, 12 cantidades de personas y duración viven en un mismo recorrido vertical. | Presentar zona con fotografía, elección de fecha/hora y revisión final; mantener un resumen de la selección. | Media / medio |
| El movimiento existe de forma aislada | La app activa no importa Motion; usa CSS para presión, aparición de hojas, carga y sellos. Inicio no pasa `ultimoReciente`, por lo que allí no activa la caída del nuevo sello. | Conectar cada transición con un cambio real: producto→detalle, artículo→pedido, visita→sello, selección→resumen. | Alta para esta dirección / medio |
| La campana no abre avisos | En Inicio, `alAvisos` navega a Perfil. El significado del icono y el destino no coinciden. | Crear un panel de avisos relevante o retirar la campana hasta disponer del flujo. | Media / bajo |
| Las pantallas del socio no aprovechan escritorio | `.marco` limita el contenido a 448 px por diseño. | Mantener el enfoque móvil; si el uso de escritorio es relevante, estudiar catálogo + pedido en dos columnas. Validación visual autenticada pendiente. | Media / medio |

El catálogo sin fotos es el problema visual dominante: **56,2 %** de las 73 entradas no tienen fotografía declarada. La cifra cuenta los datos del catálogo; no estima el área de pantalla ni verifica la calidad de las 32 imágenes restantes.

### Evidencia local trazable

| Tema | Fuente del proyecto |
|---|---|
| Catálogo y fotografías | [menu.ts](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/data/menu.ts:57>) |
| Orden de Inicio, campana y sello | [Inicio.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Inicio.tsx:118>) |
| Promesa de WhatsApp y campo local | [Umbral.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Umbral.tsx:28>) |
| Nueve sellos y décimo premio | [Datos.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Datos.tsx:12>) |
| Apertura, cierre y tirador de la hoja | [Superficies.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Superficies.tsx:198>) |
| Foco después de navegar | [App.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/App.tsx:66>) |
| Mensajes de módulos no disponibles | [Estados.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Estados.tsx:129>) |
| Presentación de la bolsa | [Tienda.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Tienda.tsx:87>) |
| Reserva y selección de opciones | [Reservar.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Reservar.tsx>) |
| Ancho y movimiento reducido | [base.css](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/base.css:149>) |
| Dependencias disponibles | [package.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/package.json>) |

## Dirección visual propuesta

**Café de finca, servido con calma.** La fotografía representa textura, porcelana, manos y espacio. Los títulos conservan la serifa de la casa, pero hay menos titulares y reglas gruesas compitiendo. Work Sans sigue resolviendo precios, formularios y navegación.

El papel funciona como base; el bosque profundo identifica acciones y membresía. El dorado se concentra en el carnet y el premio. La profundidad aparece en objetos concretos —carnet y producto—, mientras el resto de la interfaz permanece sobrio. Es una evolución explícita del sistema «Etiqueta», cuya prohibición actual de sombras habría que revisar antes de una implementación.

| Pantalla | Composición propuesta | Dinamismo que aporta valor |
|---|---|---|
| Bienvenida | Fotografía amplia, marca, promesa breve y entrada demo inequívoca | Una transición de entrada corta; el botón puede usarse de inmediato |
| Inicio | Café destacado, pedido visible, saldo compacto y cercanía al premio | La bebida abre su detalle; el contexto visual se conserva |
| Pedir | Una bebida destacada y lista legible; fotos reales según disponibilidad | Al agregar, cambia cantidad y aparece el resumen del pedido |
| Tienda | Empaque, precio, gramaje y condiciones de retiro | Profundidad suave del empaque; origen desplegable |
| Club | Carnet reconocible, beneficios de hoy y progreso consistente | Brillo breve del carnet y estampado exclusivamente del sello nuevo |
| Reservar | Espacio con imagen, fecha/hora y revisión de la elección | Selección y resumen responden juntos; pasos reversibles |
| Perfil | Datos personales, preferencias y gestión organizados por función | Confirmación corta junto a cada cambio; pendiente de prueba visual autenticada |

Las imágenes de la propuesta proceden del proyecto. La foto de empaque es una referencia de marca: hay que confirmar que corresponde a la Reserva de Cosecha antes de usarla como imagen comercial de esa bolsa. Las horas y fechas seleccionables de la maqueta son ilustrativas; no representan disponibilidad de la casa.

## Cómo usar mesh3d y 21st.dev

### mesh3d: dirección y relato del producto

[mesh3d](https://mesh3d.gallery/websites?sort=featured) reúne experiencias de Three.js y WebGL. Es una fuente de inspiración, no una biblioteca instalable ni una garantía de buena conversión. Se inspeccionó visualmente la galería y la ficha de Pioneer.

En [Pioneer — Corn. Revolutionized.](https://mesh3d.gallery/website/pioneer-corn-revolutionized), el objeto agrícola ocupa el centro y la animación articula una historia sobre el producto. La transferencia útil a Lupita sería presentar una bolsa o una taza con presencia y explicar origen→tueste→preparación. La escala, la luz y el ritmo pueden comunicar esa historia incluso con fotografía y transformaciones CSS.

La ficha de [Of/Horse](https://mesh3d.gallery/website/of-horse-how-arena-footing-interacts-with-the-horse) describe una exposición 3D guiada por desplazamiento sobre propiedades del terreno. La aplicación posible sería explicar procesos del café con cambios de estado comprensibles. Esta extrapolación es una propuesta de diseño; no se hizo una auditoría del sitio externo completo.

Para Lupita, el 3D real tendría sentido como una experiencia opcional del lote o recorrido de finca. El catálogo cotidiano y las reservas se benefician primero de imágenes adecuadas y estados claros. Evitaría imponer cámaras, cursores magnéticos o desplazamiento secuestrado en recorridos de compra.

### 21st.dev: patrones concretos, seleccionados uno a uno

[21st.dev](https://21st.dev/) es un catálogo de componentes de distintos autores que se incorporan como código. Su propia documentación lo diferencia de una única biblioteca. Por tanto, conviene elegir componentes específicos y adaptarlos al sistema de Lupita; importar estilos heterogéneos produciría una interfaz menos coherente.

Se revisó la colección [Motion Primitives en 21st](https://21st.dev/@ibelick/library/motion-primitives) y sus enlaces de componentes. Las diferencias entre contadores de la portada y el listado interno desaconsejan usar el número de componentes como criterio de calidad.

| Patrón encontrado | Uso propuesto en Lupita | Condición de uso |
|---|---|---|
| [Morphing Dialog](https://21st.dev/@ibelick/components/morphing-dialog) | Continuidad entre producto y detalle | Preservar nombre accesible, Escape, cierre visible y retorno del foco |
| [Animated Tabs](https://21st.dev/@ibelick/components/animated-tabs) | Indicador de categoría o sección | Estado seleccionado claro incluso sin animación |
| [Disclosure](https://21st.dev/@ibelick/components/disclosure) | Origen del lote y condiciones secundarias | Precio, retiro y restricciones siguen visibles |
| [Sliding Number](https://21st.dev/@ibelick/components/sliding-number) | Cantidad de artículos o progreso | Evitar contar saldo desde cero; anunciar el valor final |
| [Tilt](https://21st.dev/@ibelick/components/tilt) | Carnet o empaque en un momento puntual | Alternativa al tocar y con movimiento reducido |
| [Transition Panel](https://21st.dev/@ibelick/components/transition-panel) | Paso entre elecciones de reserva | Mantener datos y permitir volver |

La demostración entregada representa estos comportamientos con código propio y CSS. No contiene una integración instalada de esas bibliotecas.

## Skills: selección recomendada

No existe un «top» universal que determine calidad UX. La selección combina adecuación a este proyecto, fuente original, alcance, adopción visible y facilidad de aplicar criterios verificables. Las instalaciones consultadas en Skills CLI son una señal de uso, no de eficacia probada. Consulta realizada el 13 de septiembre de 2026.

| Orden para este trabajo | Skill / fuente original | Qué aporta | Límite |
|---|---|---|---|
| 1 | [Impeccable](https://github.com/pbakaus/impeccable) | Vocabulario y comandos para crítica, auditoría, pulido y animación; especialmente alineado con elevar el acabado visual. | Su README y capacidades se investigaron; no se instaló ni se ejecutó su motor o sus hooks. |
| 2 | [Web Design Guidelines — Vercel](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) | Revisión estructurada de interfaz, foco, navegación, estados y movimiento. 629,8 mil instalaciones mostradas por Skills CLI. | Leída y aplicada como guía. Las convenciones editoriales en inglés no sustituyen el tono y el español de Lupita. |
| 3 | [UI UX Pro Max](https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max) | Referencias de diseño y recomendaciones por plataforma; útil para contraste de alternativas. 355,3 mil instalaciones consultadas. | La base de estilos no debe sustituir decisiones de marca ni evidencia de usuarios. Investigada, sin ejecutar su generador. |
| 4 | [Frontend Design — Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Dirección estética deliberada, contenido propio del negocio y crítica de resultados demasiado genéricos. | Leída y aplicada a la composición; no valida por sí sola accesibilidad o conversión. |

Skills CLI mostró 274,6 mil instalaciones para la skill unificada de Impeccable y también entradas separadas de comandos. No se sumaron, porque pueden solaparse. El repositorio actual documenta una skill unificada con comandos; conviene seguir su documentación vigente en una instalación posterior. [Documentación de Impeccable](https://github.com/pbakaus/impeccable).

Las guías consultadas directamente fueron el [SKILL.md de Vercel](https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md), sus [reglas de interfaz](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) y el [SKILL.md de Frontend Design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md). La skill local de investigación profunda organizó la evidencia y la de visualización permitió comparar y probar propuestas.

Si se decide incorporarlas al flujo de trabajo, el comando verificado por Skills CLI para la guía de Vercel es `npx skills add vercel-labs/agent-skills@web-design-guidelines`. Para Impeccable, seguir el instalador del repositorio original y revisar su alcance de proyecto y hooks. Instalar una herramienta no es necesario para evaluar esta propuesta.

## Repositorios de herramientas

La API pública de GitHub se consultó para 13 repositorios. Todos aparecieron sin archivar; la última actividad indicada estaba entre el 28 de agosto y el 13 de septiembre de 2026. La fecha de `pushed_at` mide actividad del repositorio, no una versión estable ni mantenimiento garantizado. El detalle queda en [repositorios.json](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/entregables/auditoria-ux-premium-2026-09-13/fuentes/repositorios.json>).

| Herramienta | Función y recomendación | Licencia declarada / señal de adopción |
|---|---|---|
| [Playwright](https://github.com/microsoft/playwright) | Primera elección para recorridos repetibles, tamaños de pantalla, teclado y comparación visual. La inspección de esta auditoría utilizó el navegador conectado y sus locators. | Apache-2.0 · 96.060 estrellas |
| [axe-core](https://github.com/dequelabs/axe-core) | Complemento de accesibilidad automatizada para cada estado, incluidos diálogos. No ejecutado de nuevo en esta auditoría. | MPL-2.0 · 7.505 estrellas |
| [Lighthouse](https://github.com/GoogleChrome/lighthouse) | Medir carga, rendimiento y buenas prácticas sobre una compilación de producción. Recomendado como control posterior al prototipo. | Apache-2.0 · 30.764 estrellas |
| [Motion](https://github.com/motiondivision/motion) | Motor principal recomendado. Ya existe en las dependencias del proyecto; permite evolucionar con una sola familia de animación. | MIT · 33.591 estrellas |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | La mejor coincidencia de componentes para paneles, detalles y cambios de estado de esta app. Elegir pocos patrones. | MIT · 6.282 estrellas |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Referencia de composición y primitivas; útil si alguna pieza actual no cubre el comportamiento requerido. No justifica sustituir todos los componentes propios. | MIT · 123.675 estrellas |
| [Magic UI](https://github.com/magicuidesign/magicui) | Recursos de animación para una bienvenida o un momento de membresía. Selección secundaria frente a Motion Primitives para flujos diarios. | MIT · 22.268 estrellas |
| [React Bits](https://github.com/DavidHDev/react-bits) | Explorar un efecto protagonista de marca. Evaluar individualmente coste y dependencia. | 47.113 estrellas. La [licencia](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md) incluye Commons Clause; no es MIT puro. |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Sólo para un visor 3D opcional con propósito concreto y activos adecuados. El README empareja Fiber 8 con React 18 y Fiber 9 con React 19. | MIT · 32.276 estrellas |

Las cifras anteriores son una instantánea de la API consultada, no una clasificación de calidad. Para Vercel y Anthropic la API no devolvió una licencia SPDX de repositorio; debe revisarse la licencia del material específico. Para React Bits, la licencia declara uso en aplicaciones y restricciones sobre redistribución de los componentes como producto.

La documentación oficial de [Playwright sobre accesibilidad](https://playwright.dev/docs/accessibility-testing) explica cómo integrar axe y por qué las pruebas automáticas deben complementarse con revisión manual. Ningún resultado automático debe presentarse como validación de toda la experiencia.

## Especificación de movimiento

Los siguientes tiempos son objetivos de diseño propuestos, no medidas del rendimiento actual ni normas universales.

| Acción | Duración inicial | Tratamiento | Versión con movimiento reducido |
|---|---|---|---|
| Presionar una acción | 120–160 ms | Respuesta breve de escala y color | Color sin escala |
| Cambiar una categoría | 180–240 ms | Indicador y contenido cambian juntos | Estado inmediato o fundido corto |
| Abrir / cerrar detalle | 240–300 ms | Entrada y salida coordinadas, sin rebote | Opacidad, sin desplazamiento |
| Agregar un artículo | 180–240 ms | Contador y resumen responden a la misma acción | Actualización inmediata con anuncio |
| Ganar un sello real | 350–450 ms | Estampar sólo la casilla nueva | Nuevo sello sin recorrido |
| Mostrar el carnet | 450–650 ms | Cambio breve de relieve o luz | Cara estática con los mismos datos |
| Explorar un empaque | 400–600 ms | Inclinación pequeña y voluntaria | Fotografía inmóvil |

El contenido esencial debe aparecer aunque falle la animación. La interacción sigue disponible durante las transiciones. No se deben repetir contadores de saldo, hacer parpadear precios ni reproducir celebraciones por cada navegación. Para React, [Motion documenta](https://motion.dev/docs/react-accessibility) `MotionConfig reducedMotion="user"` y `useReducedMotion`; las animaciones CSS necesitan además sus propias reglas de preferencia.

La visualización permite probar apertura/cierre del producto, agregado local al pedido, selección de reserva, carnet y un sello simulado. La inclinación del empaque usa CSS y una fotografía: no es un modelo 3D. En el diseño final, las animaciones de recompensa deben dispararse únicamente tras confirmar la operación correspondiente en el servidor.

## Criterios para aceptar una implementación

El primer grupo de cambios debería resolver fotografía, composición de Inicio, claridad de mensajes y cierre de hojas. El segundo puede incorporar continuidad del detalle, carrito y carnet. La reserva guiada y una experiencia 3D opcional quedarían después de comprobar esos cambios con personas.

Validar cinco tareas con clientes representativos: encontrar una bebida, entender cuánto falta para la cortesía, agregar y revisar un pedido, ubicar la recarga y seleccionar una mesa. Registrar éxito, retrocesos, confusión y tiempo por tarea; comparar con la interfaz actual bajo las mismas condiciones. La muestra inicial serviría para detectar problemas, no para prometer una mejora estadística de conversión.

La lectura debe mantener un contraste de al menos 4,5:1 en texto normal y 3:1 en texto grande. Para el tacto, se propone 44 × 44 px como objetivo de comodidad; WCAG 2.2 AA establece 24 × 24 CSS px o condiciones de espaciado/excepciones, por lo que 44 px no debe describirse como el mínimo AA universal. [Contraste — W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [tamaño mínimo — W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Al implementar, medir LCP, INP y CLS en producción y en dispositivos representativos. Las referencias de buena experiencia son LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1 en el percentil 75. Estos son objetivos de validación futura; esta auditoría no atribuye esos resultados a Lupita. [Web Vitals — Google](https://web.dev/articles/vitals).

## Referencias y fecha de consulta

Fuentes consultadas el 13 de septiembre de 2026. Los enlaces dentro del informe apuntan a la página exacta utilizada. Los datos del producto proceden de los archivos locales citados; las capacidades de herramientas proceden de sus repositorios y documentación original.

1. mesh3d. [Galería Featured](https://mesh3d.gallery/websites?sort=featured), [Pioneer](https://mesh3d.gallery/website/pioneer-corn-revolutionized) y [Of/Horse](https://mesh3d.gallery/website/of-horse-how-arena-footing-interacts-with-the-horse).
2. 21st. [Descripción del catálogo](https://21st.dev/) y [Motion Primitives](https://21st.dev/@ibelick/library/motion-primitives).
3. Paul Bakaus. [Impeccable](https://github.com/pbakaus/impeccable).
4. Vercel. [Agent Skills](https://github.com/vercel-labs/agent-skills) y [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
5. NextLevelBuilder. [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
6. Anthropic. [Frontend Design](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md).
7. Microsoft. [Playwright](https://github.com/microsoft/playwright) y [guía de accesibilidad](https://playwright.dev/docs/accessibility-testing).
8. Deque. [axe-core](https://github.com/dequelabs/axe-core).
9. Google. [Lighthouse](https://github.com/GoogleChrome/lighthouse) y [Web Vitals](https://web.dev/articles/vitals).
10. Motion. [Repositorio](https://github.com/motiondivision/motion) y [accesibilidad](https://motion.dev/docs/react-accessibility).
11. Julien Thibeaut. [Motion Primitives](https://github.com/ibelick/motion-primitives).
12. shadcn. [ui](https://github.com/shadcn-ui/ui).
13. Magic UI. [Repositorio](https://github.com/magicuidesign/magicui).
14. David Haz. [React Bits](https://github.com/DavidHDev/react-bits) y [licencia](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md).
15. Poimandres. [React Three Fiber](https://github.com/pmndrs/react-three-fiber).
16. W3C WAI. [Contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [tamaño de objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
17. Skills CLI / skills.sh. Consultas `web design guidelines`, `ui ux pro max` e `impeccable`; resultados de adopción usados sólo como señales orientativas.
