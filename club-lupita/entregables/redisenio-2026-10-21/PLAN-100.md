# Rediseño integral y movimiento — La Bella Lupita

Fecha: 21 de octubre de 2026. Estado: sexta propuesta de Inicio aprobada visualmente; extensión integral aplicada y revisada. [Entrega final, preview y límites de prueba](../extension-aprobada-2026-10-21/LEEME.md). La matriz77 está actualizada; uso, marca y acabado terminaron en PASS. Producción no modificada.

**Decisión vigente:** el usuario respondió «Aprobar y extender el rediseño». La condición previa de validación visual de Inicio está satisfecha. El historial inferior describe decisiones anteriores; no impone una segunda aprobación de la base. La ejecución se registra en [Extensión aprobada](../extension-aprobada-2026-10-21/REGISTRO.md). Producción continúa sin autorizar.

## Alcance que debe completarse

El objetivo abarca el 100 % de la aplicación activa: páginas públicas, cuenta del cliente, compra, reserva, fidelidad, perfil, acceso, panel del equipo, administración, componentes compartidos y estados secundarios. Inicio fue el primer ciclo de validación, no el alcance final del rediseño.

La ruta del objetivo recibida tenía `artur.codex`; se leyó el archivo existente en `C:/Users/artur/.codex/attachments/01357268-40de-4ead-a0f4-017c9e750e80/goal-objective.md`. Se conservan sus condiciones: funciones existentes, entorno aislado, revisión independiente, vista previa y aprobación explícita para producción.

El usuario pidió investigar [21st.dev](https://21st.dev/). Sus componentes son referencias para interacciones concretas; las decisiones de marca proceden del manual de La Bella Lupita y las referencias originales.

La investigación de ocho referencias está documentada en [REFERENCIAS-21ST.md](REFERENCIAS-21ST.md), con destino, comportamiento útil, dependencias, licencia declarada y adaptación propuesta. Los patrones pertinentes se aplicaron en la extensión integrada, con movimiento reducido y pruebas por conjunto.

## Historial de autorización visual (superado por la decisión vigente)

El usuario respondió «Revisar primero la composición de Inicio», pidió después más protagonismo para fotos/carta y una cabecera más breve. Tras la cuarta propuesta pidió «Una portada más inmersiva, con la foto a todo el ancho». La quinta composición coloca fotografía de borde a borde con titular breve y CTA sobre ella. La extensión visual al resto de la aplicación sigue sin aprobarse. El alcance integral permanece vigente; inventario y vista previa por roles no equivalen a rediseñar esas pantallas. La cuarta composición se conserva en el puerto 5195 y en `../inicio-inmersivo-2026-10-21/antes/dist`; los puertos 5194, 5193 y 5192 conservan propuestas anteriores.

La [quinta propuesta de Inicio](../inicio-inmersivo-2026-10-21/LEEME.md) reúne sus pruebas y revisiones independientes. [COBERTURA.json](COBERTURA.json) identifica la evidencia de Inicio; las demás superficies permanecen pendientes. No se calcula un porcentaje de avance dividiendo filas: algunas representan grupos compartidos y otras pantallas o variantes. La cuarta propuesta tuvo aprobación técnica, pero el usuario pidió continuar ajustándola.

El usuario también pidió seguir ajustando la quinta propuesta y, en lugar de elegir otro cambio aislado, solicitó investigar profundamente todas las referencias iniciales. La [investigación completa](../investigacion-diseno-2026-10-21/LEEME.md) verifica cuatro diseños distintos, las 64 páginas del manual, el PDF del método y cuatro demos de 21st. Su dirección recomendada es fotografía editorial con carta visible antes, integrando cabecera/pase y eligiendo encuadres por tarea. La [sexta composición](../inicio-ajuste-2026-10-21/LEEME.md) aplica ahora esa investigación: fotografía natural, pase integrado y productos completos en el primer encuadre normal. Tres revisiones independientes cerraron en PASS tras corregir marca, texto ampliado, resolución y retorno prioritario. La validación visual humana sigue pendiente. La sexta se abre en el puerto 5190; la quinta se conserva en 5196 y en `../inicio-ajuste-2026-10-21/antes/dist`.

La [auditoría estática de cobertura](AUDITORIA-COBERTURA.md) contrastó 11 rutas, 12 secciones, cuatro roles y 92 archivos alcanzables. Se cerraron cuatro imprecisiones del inventario: tres utilidades de prueba nuevas, dos exportaciones sin consumo activo, variantes de acceso demostrativo y consulta/recuperación de descuentos para Caja. Esta revisión comprueba el alcance planificado; no acredita rediseño, accesibilidad ni funcionamiento de las superficies pendientes.

## Dirección de movimiento propuesta

1. **Selección visible:** una superficie o subrayado acompaña el cambio de categoría o pestaña. La etiqueta permanece legible; el movimiento nunca es la única señal de selección.
2. **Fotografía interactiva:** encuadre estable y acercamiento leve al señalar una tarjeta. En táctil, la tarjeta sigue abriéndose con un toque; ninguna información depende del hover.
3. **Continuidad entre tarjeta y detalle:** la foto y el título ayudan a reconocer el producto que se abrió. Se conserva el diálogo nativo, foco, Escape y confirmación existente.
4. **Progreso comprensible:** las etapas de reserva/acceso muestran qué se completó y cuál sigue. No se espera a terminar una animación para mostrar errores o habilitar acciones válidas.
5. **Respuesta a una acción:** botón ocupado, confirmación de cambio y actualización de cantidad describen el resultado real de la API. No se anima un saldo a través de importes ficticios ni se muestra éxito antes de la respuesta.
6. **Contenido que aparece sin saltos:** fotos y esqueletos reservan espacio; la transición modifica preferentemente opacidad/transformación. Un estado vacío, error o carga continúa siendo comprensible sin movimiento.
7. **Movimiento reducido:** con `prefers-reduced-motion`, desaparecen desplazamientos, escala y secuencias decorativas. Permanecen texto, selección y confirmaciones.

Duraciones propuestas para probar, coherentes con la investigación: 120–200 ms en pulsación/selección y 200–320 ms en apertura o cambio de panel. Son hipótesis de implementación, no decisiones visuales aprobadas ni mediciones. No introducir carruseles automáticos, fondos en movimiento continuo, cursores magnéticos o números financieros que ruedan al cargar.

## Familias y aplicación

| Familia | Aplicación prevista | Referencia concreta |
| --- | --- | --- |
| Navegación y filtros | Carta, Tienda, Mi Club, categorías e informes del equipo | [Animated Tabs](https://21st.dev/@ibelick/components/animated-tabs) |
| Fotos y productos | Inicio, Carta, detalle, Tienda, experiencias | [Product Card de Ravi Katiyar](https://21st.dev/@ravikatiyar162/components/product-card-2); composición visual, sin copiar código de licencia no confirmada |
| Formularios y etapas | Acceso, reservar mesa, perfil, cambios del equipo | [Input with clear button](https://21st.dev/@originui/components/input/input-with-clear-button) y [Stepper with titles and descriptions](https://21st.dev/@originui/components/stepper/with-titles-and-descriptions) |
| Información desplegable | Condiciones, beneficios, detalle de reserva, ayuda | [FAQ Accordion Reveal](https://21st.dev/@mohammadshehadeh/components/faq-06), adaptando expansión y omitiendo revelado decorativo de palabras |
| Diálogos y confirmaciones | Detalle, edición, cancelación, canje, permisos | [Dialog de Fluid Functionalism](https://21st.dev/@micka_design/components/dialog); composición de referencia sobre Hoja existente, sin copiar código de licencia no confirmada |
| Respuesta y estados | Añadir artículo, guardar datos, reintentar, confirmar acciones | [Order Confirmation Toast](https://21st.dev/@bundui/components/toast6), adaptado a avisos existentes y respuesta real del servidor |
| Operación y administración | Caja, pedidos, entregas, agenda, clientes, permisos, informes | [Table de Fluid Functionalism](https://21st.dev/@micka_design/components/table), conservando resaltado de fila/foco y omitiendo seguimiento del cursor |

La ficha de Animated Tabs se inspeccionó en navegador: el indicador cambia de opción; su ejemplo usa iconos sin nombres accesibles visibles en el árbol. Adoptar el movimiento requiere conservar las etiquetas y semántica de nuestra app. La licencia declarada de esa ficha es MIT y lista framer-motion/lucide-react. No es una certificación automática de accesibilidad.

La [segunda investigación con interacción real](../investigacion-diseno-2026-10-21/INTERACCIONES.md) precisa límites adicionales: la variante segmentada no cambia paneles ni responde a flechas como un conjunto de pestañas; tabs, producto y acordeón mantienen movimiento con reducción activada. La tarjeta de producto no demuestra detalle ni compra; la acción del toast solo genera otro aviso. La fuente actual del acordeón Hirael difiere del bundle de su demo. Se adoptarán mecanismos y se revisará cada versión concreta, sin tratar estas demos como recorridos completos.

## Trabajo por conjuntos, sin reducir la cobertura

| Conjunto | Contenido | Estado actual |
| --- | --- | --- |
| 1. Sistema compartido | Fuentes, tokens, navegación, botones, campos, tarjetas, paneles, avisos, carga/vacío/error/éxito, movimiento reducido | Propuesta de Inicio existente; extensión y movimiento pendientes |
| 2. Experiencia del cliente | Inicio, Carta y detalle/carrito/confirmación, Tienda, Mi Club, Conocé tu club, reservas, compras, Perfil y acceso | Inicio revisado en ciclo anterior; rediseño integral pendiente |
| 3. Equipo y administración | Resumen, Pedidos, Caja, Mi Club, Tienda, Entregas, Agenda, Atención, Informes, Clientes, Equipo y permisos, Cuenta y seguridad; acceso/MFA/invitación/bloqueo | Inventariado; diseño y verificación pendientes |
| 4. Cobertura final | Kit, ruta desconocida, estados globales, permisos/roles, responsive, accesibilidad, regresión, rendimiento y comparativas | Pendiente |

Cada conjunto conserva diagnóstico, implementación real, pruebas y revisión independiente. Separar el trabajo en ciclos no excluye pantallas ni componentes.

## Reglas de integración

- Trabajar en React/Vite/Tailwind actuales. `motion` está declarado e instalado, pero `src/casa` no importa `motion/react` ni `src/lib/movimiento.ts`: tener el paquete no significa que el sistema de movimiento esté aplicado. El módulo heredado contiene resortes, vibración y duraciones de hasta 840 ms; no trasladarlo íntegro. Elegir CSS o una adaptación puntual de Motion según la interacción y medir el coste de carga antes de extenderla.
- Consultar código, licencia y dependencias de cada componente antes de reutilizarlo. Donde no se confirme licencia, usar el mecanismo como referencia y escribir una adaptación propia.
- Usar fotos propias, fuentes locales y colores de marca. No traer datos, imágenes de ejemplo o precios del catálogo de 21st.
- Mantener importes, permisos, validaciones, formularios y operaciones del Worker. La presentación no debe modificar sus reglas.
- Conservar el servidor aislado (PGlite en memoria, datos sintéticos, red externa bloqueada), incluyendo cuentas sintéticas del equipo para revisar sus módulos.
- Reemplazar la antigua aceptación «solo Inicio» cuando se autorice la extensión: actualmente `tests/redisenio-inicio-ui.mjs` exige Work Sans fuera de Inicio, criterio incompatible con el nuevo alcance.
- Los estilos compartidos no bastan para declarar completa una pantalla. Revisar cada ruta, diálogo, estado y rol enumerado en el inventario.

## Prueba exigida para declarar 100 %

Para cada fila del inventario debe existir: estado de diseño implementado; captura móvil y escritorio (tablet cuando cambie composición); recorrido principal y estados aplicables; teclado/foco/texto ampliado; movimiento reducido; errores de ejecución; revisión independiente y correcciones cerradas. Formularios deben conservar etiquetas y errores asociados. Compras/canjes/reservas deben probarse solo en el entorno sintético.

El cierre integral exige todas las filas cubiertas, sin fallos críticos o importantes abiertos, registro de limitaciones y una vista previa accesible. No se puede deducir 100 % de un cambio global de CSS, una compilación verde o una captura de Inicio.

Antes/después de rendimiento deben medirse en condiciones equivalentes. El coste de la nueva librería/estilos/fotos y el respeto por movimiento reducido forman parte de la decisión. Evitar la descarga de Work Sans durante el arranque es un pendiente conocido del primer ciclo.

## Contraste documental del 21 de octubre

Se alineó la tabla con las ocho fichas de `REFERENCIAS-21ST.md`; las referencias preliminares Carousel/Morphing Dialog/Transition Panel/Accordion no se consideran verificadas por esa investigación ni seleccionadas para implementar. Se unificaron las duraciones propuestas y se distinguieron dependencia instalada, código heredado y aplicación activa. Estos ajustes preparan la extensión; no cambian la interfaz ni su autorización pendiente.

Un revisor independiente confirmó esas tres discrepancias sin encontrar otra material. En aquella comprobación, los ocho enlaces seleccionados tenían ficha documentada y los siete archivos de aplicación/pruebas coincidían con `inicio-portada-2026-10-21/fuentes.json`. La quinta composición modifica después Inicio y su CSS; sus fuentes y evidencias se registran por separado en `inicio-inmersivo-2026-10-21/`.

## Próximo paso

Con la base visual validada por el usuario, implementar el sistema compartido y la experiencia del cliente usando la investigación y la matriz ya preparadas; continuar con todos los módulos del equipo y terminar con la auditoría integral. En cada grupo, conservar evidencias por superficie y estado, no extrapolar las pruebas de Inicio. La publicación permanece sujeta a una aprobación explícita posterior.

