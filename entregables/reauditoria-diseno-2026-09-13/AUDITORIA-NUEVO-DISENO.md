# Auditoría del diseño publicado · Club Lupita

Revisión del 13 de septiembre de 2026 sobre https://club-lupita.el-molino.workers.dev/ y el código que se desplegó. Objetivo solicitado: apariencia más premium y animada.

**Dictamen: hubo mejoras funcionales y cambios visuales puntuales; el objetivo de transformación visual no está cumplido.** La captura del usuario corresponde al diseño nuevo. No es una explicación de caché ni una versión anterior.

La evaluación anterior cerró el trabajo con criterios insuficientes: compilar, pasar regresiones y no tener desbordamiento de página no demuestra calidad visual. Mantener el contenedor móvil de 448 px, considerar resuelta la carta al sustituir marcadores por filas y dar por terminada la dirección premium fue una decisión de implementación insuficiente. La petición del usuario permitía revisar esas decisiones.

## Alcance y evidencia

- Inspección directa en producción: Inicio, Carta —Barra, Brunch, Bistró y Sobremesa—, búsqueda, sin resultados, detalle de latte, carrito, Tienda, Club, Perfil y los tres pasos de Reserva. También apertura/cierre y giro del pase.
- Tamaños inspeccionados: móvil de 390 px, pantalla estrecha de 320 px y escritorio de 1440 px; se restauró el tamaño original al terminar.
- Bienvenida: revisión del código publicado. El intento de verla en un origen local sin sesión terminó en error del proxy; no se atribuye ese error a producción. La petición pública anónima a `/api/yo` respondió 401, coherente con exigir sesión. No se cerró la sesión del usuario para forzar ese estado.
- Se añadió un Espresso al carrito local para inspeccionarlo y se retiró al terminar. No se pagó, canjeó, reservó, activó una suscripción ni se enviaron mensajes.
- Comparación del código actual con `respaldo-ux-premium-20260913`. Club y Perfil no recibieron cambios propios de pantalla; sólo heredaron cambios de componentes compartidos.
- Las mediciones y recuentos se guardaron en `evidencia.json`. La captura original del usuario se conserva sin modificar en `captura-usuario.png`.

Es una evaluación experta de interfaz, no un experimento con clientes ni una medición de conversión. Las observaciones visuales no son puntuaciones objetivas. No se repitieron Lighthouse ni una certificación completa de accesibilidad.

## Hallazgos prioritarios

P1 = afecta una tarea central o impide cumplir la dirección visual solicitada. P2 = reduce consistencia, claridad o acabado. No se asigna P0 porque esta revisión no demostró un bloqueo general del servicio ni pérdida de dinero.

| ID | Prioridad | Hallazgo comprobado | Consecuencia | Corrección propuesta |
|---|---|---|---|---|
| N01 | P1 | En escritorio de 1440 px el contenedor sigue midiendo 448 px: 31,1 % del ancho. Cabecera y navegación atraviesan el resto de la ventana. | Sensación de teléfono colocado dentro de un lienzo vacío; no existe una composición de escritorio. | Diseñar catálogo y resumen del pedido en columnas, con anchura máxima deliberada y navegación adaptada. Validar contenido y proporción, no sólo ausencia de scroll horizontal. |
| N02 | P1 | Barra tiene 24 productos y sólo uno con foto. Se ven cuatro filas antes del latte; la imagen empieza aproximadamente a 702 px desde el borde superior en la medición de escritorio. | La sección principal de una cafetería abre con una lista administrativa. La fotografía queda relegada y los productos tienen la misma jerarquía. | Destacado de café al principio; agrupación por calientes, fríos y otras bebidas; filas con descripción breve y precio alineado. Un formato sin foto puede ser atractivo si se compone como carta. |
| N03 | P1 | `sizes` declara 224 px en escritorio incluso para la ficha ancha. El navegador eligió `latte-logo-mesa-240.webp` para un elemento de 414 px a DPR 1. | Se amplía una imagen pequeña, perjudicando nitidez justo en la imagen protagonista. | Hacer que `sizes` refleje el ancho real de cada variante; verificar `currentSrc` en móvil y escritorio. No sustituir el problema por un archivo pesado para todas las fichas. |
| N04 | P1 | En Inicio, el botón «Mostrá tu pase» excede la tarjeta. A 320 px se midió borde de tarjeta en x=289 y borde de botón en x=376,64. El contenedor lo recorta. | Parte de una acción principal queda fuera de su superficie aunque el ancho global de la página pase el test. | Botones que se distribuyan o apilen según el espacio; eliminar la combinación rígida de ancho completo y texto sin salto. Verificar límites internos y focos, no sólo `scrollWidth`. |
| N05 | P1 | Buscar «capuchino» devuelve cero resultados, mientras el estado vacío recomienda exactamente esa palabra. La carta contiene «Cappuccino». | El sistema invita al usuario a repetir una búsqueda que falla. | Alias lingüísticos y ortográficos; prueba de las sugerencias visibles contra el catálogo real. Mantener los nombres comerciales y permitir términos habituales en español. |
| N06 | P1 | Perfil muestra «0 pts · Llegaste al nivel más alto de la casa», aunque el progreso tiene etiqueta de 2727 puntos. | Se confunden puntos acumulados con puntos que faltan; la recompensa parece borrar la trayectoria. | Mostrar acumulado y nivel alcanzado. Ocultar la distancia al siguiente nivel cuando no existe uno. |
| N07 | P1 | En el resumen de Reserva, la flecha superior «Volver» navega a Club. «Paso anterior» sí vuelve a la selección. | Dos controles que parecen retroceder hacen cosas distintas; salir desmonta el formulario y pierde la selección. | La flecha retrocede dentro del flujo. Separar y etiquetar la salida completa; preservar el borrador si se abandona y regresa. |
| N08 | P1 | Tienda sigue vendiendo la Reserva mediante un bloque verde de texto sin imagen del producto. | Precio y condiciones son legibles, pero la mercancía no tiene presencia visual. | Conseguir una foto auténtica del empaque; componer producto, peso, precio y retiro juntos. Hasta obtenerla, usar una presentación tipográfica deliberada, sin aparentar una foto de otro producto. |
| N09 | P1 visual | El movimiento está concentrado en entradas CSS, pulsaciones y un pase escondido en una hoja. No hay continuidad entre ficha y detalle, ni transición de salida de la hoja, ni coordinación perceptible de producto y resumen. | La petición de una app más animada apenas se percibe en el recorrido cotidiano. | Diseñar y comprobar categoría→contenido, ficha→detalle, agregar→cantidad/resumen y paso→resumen. Mantenerlos breves y funcionales; conservar alternativa reducida. |
| N10 | P2 | El segundo paso de Reserva concentra día, doce opciones de personas, duración y todas las horas. En 390×844 la barra fija ocupa la zona inferior antes de verse los horarios. | Dividir el formulario redujo parte del esfuerzo, pero la etapa central sigue siendo larga. | Contador de personas, bloques más compactos y horas visibles cerca de la selección de fecha; resumen breve y navegación sin duplicaciones. |
| N11 | P2 | Elegir VIP no cambia la foto de terraza ni muestra atributos que permitan comparar los espacios. | La foto ambienta, pero no ayuda a elegir la zona. | Foto auténtica y atributos de cada espacio cuando estén disponibles; no reutilizar la terraza como imagen del VIP. |
| N12 | P2 | El carnet aparece como estilo genérico en Cuenta, Tienda, Club y nivel de Perfil. Hay mezcla de tarjetas redondeadas, filas rectas y filetes negros gruesos. | El objeto de membresía pierde singularidad; el nuevo radio no constituye una nueva dirección visual. | Reservar el carnet para identidad/membresía; dar a mercancía, saldo y progreso sus superficies propias; reducir reglas y marcos que compiten. |
| N13 | P2 | Perfil conserva «Se conectan en la próxima entrega» y explica que llegará una pantalla para editar. Tienda conserva párrafos justificando sus limitaciones. | La app sigue hablando de su construcción en vez de ayudar al cliente a resolver una necesidad. | Mostrar capacidad actual y canal de atención concreto; retirar cronogramas de desarrollo y justificaciones internas. |
| N14 | P2 | La cantidad añadida se muestra como «1 +» en filas y como insignia separada en tarjetas con foto. El nombre accesible de la pestaña es «Pedir, 1 sin ver». | Estados equivalentes usan señales distintas; el lector de pantalla recibe lenguaje de notificaciones para un pedido. | Patrón consistente de cantidad y nombre «Pedir, 1 artículo»; anuncio breve del agregado cuando sea pertinente. |

## Auditoría por pantalla

### Bienvenida

La eliminación del teléfono sin almacenamiento es una mejora real de honestidad. Se conserva la fotografía de terraza y el titular; no se produjo una nueva composición sustancial. El acceso sigue siendo a una demostración y el registro personal no está disponible. Publicar la app no convierte ese registro en una función terminada. Esta pantalla requiere una verificación visual anónima independiente antes de afirmar que está auditada en producción.

### Inicio

Es la vista con la diferencia visual más evidente: latte real, llamada a pedir y accesos anteriores a los módulos secundarios. Se retiraron el reto sin servicio y la campana con destino incorrecto.

Sin embargo, «Elegí tu café», «Pedí para llevar» y la pestaña Pedir repiten la entrada a la carta. El saldo queda en otra tarjeta grande y sus acciones tienen el recorte N04. La tanda sigue ocupando un bloque amplio. En la cuenta revisada conviven una bebida pendiente y «te faltan 2 para tu bebida»: ambos estados pueden ser correctos, pero el texto debería distinguir **premio disponible** de **progreso hacia el siguiente premio**.

Dirección: una apertura con producto, una franja compacta de cuenta/pase y un resumen claro del premio. La fotografía y los textos deben formar una composición, no sólo añadir una tarjeta encima de las anteriores.

### Carta y detalle

La sustitución de marcadores vacíos reduce ruido y el detalle ahora muestra la foto real cuando existe. La búsqueda abarca las categorías y el carrito conserva cantidades. Esas mejoras se mantienen.

La cobertura fotográfica sigue siendo desigual: Barra 1/24, Brunch 9/14, Bistró 22/27, Sobremesa 1/8. Total: 33/73 con foto; **40/73 sin foto, 54,8 %**. Antes había 41 sin foto: el cambio material fue una imagen adicional, no resolver el catálogo visual.

Brunch y Bistró se ven más apetitosos gracias a los activos que ya tenían, no por una transformación equivalente del diseño. Sus títulos largos compiten con el área reservada al botón. Barra conserva una repetición de contenedores de aproximadamente 82 px de alto sin descripciones visibles. El usuario debe abrir cada producto para conocer la diferencia.

Hay espacio reservado para la imagen del detalle, pero durante su carga se observó un rectángulo vacío; después la imagen cargó correctamente. **No se clasifica como imagen rota.** Conviene mantener una miniatura o un estado de carga claro y usar la imagen de origen para conservar continuidad.

### Carrito y paneles

El cierre visible, Escape, foco y precios separados son mejoras funcionales comprobadas anteriormente; en esta revisión se comprobó apertura y cierre visible. El resumen permite sumar y restar, pero conserva una maqueta de lista genérica y no presenta miniaturas. El botón de pago podría incluir el total, coherente con las confirmaciones de otras compras.

La apertura de la hoja anima; su cierre invoca `dialog.close()` inmediatamente. El botón de cerrar ocupa una fila completa antes del encabezado. Debe mantenerse visible, pero puede compartir la cabecera para aprovechar mejor el espacio. No hace falta introducir una biblioteca nueva para resolverlo.

### Tienda

Se mantienen precio, peso, disponibilidad y condiciones antes de la compra. Retirar una imagen de otra mercancía fue correcto; no resolvió la ausencia de fotografía. Las tarjetas verdes nuevas dan acabado, pero el producto sigue ausente. Tampoco hay una historia de origen desplegable ni una presentación visual del empaque como en la dirección propuesta.

La salida para recargar navega a Inicio y obliga a localizar allí la recarga. Mejor abrir las instrucciones y el pase desde el contexto de la compra, preservando la intención de apartar esa bolsa.

### Club y pase

Club sigue abriendo con identificación y renovación, después una pila de beneficios y experiencias sin fotografía. Su estructura de pantalla no cambió en la ejecución anterior. Un beneficio disponible, otro ya utilizado y una regla permanente merecen jerarquías diferentes.

El giro del pase existe, pero se encuentra dentro de Inicio y no es protagonista de Club. Su reverso repite instrucciones que también están debajo; no añade valor suficiente para sostener por sí solo la promesa de dinamismo. Debe servir para consultar identificación y beneficios útiles, con la legibilidad como condición.

### Reserva

Es la mejora funcional más sustancial: pasos, revisión del grupo y depósito explícito antes de confirmar. Se comprobó el recorrido hasta la revisión, sin efectuar una reserva.

Quedan N07, N10 y N11. La foto es ambiental y fija. El segundo paso concentra casi todo el formulario anterior. La revisión repite los mismos datos en tarjeta y barra inferior; el espacio puede destinarse a una mejor comparación de fecha, grupo y coste.

### Perfil

No se rediseñó su estructura. Mantiene identidad, nivel, referido, datos y movimientos en una columna extensa. N06 es un error de representación de datos, además de un problema de jerarquía. La edición sigue remitiendo a la barra y el aviso de WhatsApp promete una entrega futura. Debe organizarse por cuenta, preferencias y ayuda, mostrando únicamente capacidades disponibles.

## Dinamismo: propuesta frente a implementación

| Interacción | Estado observado / código | Evaluación |
|---|---|---|
| Cambiar categoría | Entrada CSS `sube` de 220 ms al cambiar la clave del contenedor | Hay animación, pero el indicador y el contenido no conservan continuidad visual |
| Abrir producto | Hoja con entrada de 320 ms e imagen cargada aparte | La apertura funciona; no hay transición conectada con la ficha |
| Cerrar producto | `dialog.close()` inmediato | Falta salida coordinada |
| Agregar | Cantidad y botón del pedido aparecen; el signo cambia según variante de ficha | Respuesta funcional, acabado inconsistente |
| Carnet | Entrada `sube` de 520 ms en las superficies Carnet | Se aplica a varias superficies, incluso donde el carnet no es el objeto |
| Pase | Giro de 600 ms, alternativa sin giro | Implementado, pero secundario y con contenido redundante |
| Pasos de reserva | El mismo encabezado cambia de texto; tiene animación CSS sin remonte por paso | La regla por sí sola no reinicia la transición al cambiar el paso |
| Sellos | Condición para aumento real de sellos de la misma cuenta | Implementación prudente; no se provocó un nuevo sello real en producción para probarla |

Las referencias Mesh y 21st.dev sugerían protagonismo del producto y continuidad entre estados. El uso de esos principios quedó parcial. Instalar más skills o componentes no sustituye el trabajo de composición ni la revisión visual del resultado.

## Qué conservar

- Libre Caslon Text y Work Sans, la identidad verde/papel y la moneda local.
- Fotos auténticas y eliminación de imágenes de otros productos.
- Nueve visitas como objetivo de la tanda y diferenciación del premio.
- Cierre visible de paneles, foco de navegación y respeto al movimiento reducido.
- Revisión previa de la reserva y de las compras; lógica de idempotencia y aislamiento de cuentas.

## Orden de corrección y aceptación

1. **Corregir N04–N07 y N03:** recorte del pase, alias de búsqueda, puntos del nivel máximo, retroceso de reservas y tamaños de fotografía. Cada caso se acepta reproduciendo el fallo y comprobando la salida correcta.
2. **Rediseñar Carta en móvil y escritorio:** presentar el café antes del listado, usar categorías internas claras y precios comparables, aprovechar el escritorio para catálogo y pedido. Revisar ambas anchuras visualmente antes de extender el sistema.
3. **Unificar Inicio, Tienda, Club y Perfil:** asignar una función a cada superficie; evitar carnet como estilo universal; reducir redundancias y retirar mensajes de desarrollo. Tienda conserva una dependencia explícita de fotografía auténtica.
4. **Aplicar movimiento al recorrido principal:** categoría, producto, pedido y reserva. Grabar y revisar una secuencia normal y otra con movimiento reducido; no basta con que exista una propiedad `animation`.
5. **Aceptar con tareas y comparación visual:** encontrar Cappuccino usando «capuchino», entender premio actual/siguiente, recargar desde una compra, cambiar la reserva sin perderla, y leer saldo/pase a 320 px. Las pruebas automatizadas complementan esta evaluación.

No se modificó ni se volvió a desplegar la aplicación durante esta auditoría. El nuevo informe sustituye la conclusión anterior de que la dirección visual premium estaba completada.

## Fuentes locales para corregir

- [Ancho y movimiento](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/estilos/base.css:153>)
- [Tamaños y variantes de las fotos](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Datos.tsx:199>)
- [Botón rígido y texto sin salto](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Base.tsx:158>)
- [Sugerencia de búsqueda](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Estados.tsx:87>)
- [Puntos en Perfil](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Perfil.tsx:124>)
- [Retroceso de la reserva](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Reservar.tsx:164>)
- [Cierre de las hojas](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Superficies.tsx:221>)
- [Etiquetas de navegación](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/Navegacion.tsx:52>)
- [Pase](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/PaseSocio.tsx>)
