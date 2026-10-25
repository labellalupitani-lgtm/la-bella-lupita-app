# Una dirección completa para La Bella Lupita

Investigación del 21 de octubre de 2026, a petición del usuario después de revisar la quinta portada. **Conclusión de diseño:** hay que reorganizar la relación entre identidad, fotografía y elección. La siguiente composición debe conservar una imagen inmersiva y hacer que la carta se sienta disponible desde el comienzo.

[Abrir el panel visual de referencias](panel-referencias.html). Es un archivo HTML local: incluye comparación móvil/escritorio y ampliación de las imágenes. Presenta investigación, no una sexta versión de la aplicación.

## 1. Fuentes realmente revisadas

| Material recibido | Comprobación realizada | Resultado |
| --- | --- | --- |
| Manual de Marca 2026 | Texto de las 64 páginas; render de todas; ocho hojas de contacto y ampliación de diez páginas clave | Reglas, propuestas, ejemplos y límites separados en [MARCA.md](MARCA.md). |
| Primer pin, `1060034831036382763` | Página, metadatos, imagen exacta y comparación con publicación original | [Coffee App Design de UIDesignz](https://dribbble.com/shots/21908991-Coffee-App-Design-UIdesignz): catálogo y detalle. |
| Segundo pin, `919297342739063250` | Página, metadatos, imagen exacta y fuente de autor | Republica el diseño de Bacancy, reordenando los teléfonos en un montaje vertical. |
| Enlace de Dribbble | Página original y render de su imagen principal a 1024 × 768 px | [Starbucks Coffee App Design de Bacancy](https://dribbble.com/shots/20371794-Starbucks-Coffee-App-Design): bienvenida y exploración/compra. |
| Dos imágenes de WhatsApp | Inspección de los originales locales y copias verificadas | Son otros dos diseños: bienvenida/cuadrícula/detalle y fichas de café con configuración. Autoría original no confirmada. |
| PDF inicial del prompt | Extracción de las 19 páginas, identificación de secciones, render de pp.16–18 y lectura visual de p.17 | Fuente del método y del ejemplo FridgeFlow; no constituye un diseño para Lupita. [Análisis](DRIBBBLE-Y-METODO.md). |
| 21st.dev | Nueva comprobación de cuatro demos: categorías, producto, acordeón y confirmación | Estados, teclado, tamaño móvil y movimiento reducido analizados en [INTERACCIONES.md](INTERACCIONES.md). |

Por tanto, las cinco entradas de inspiración visual contienen **cuatro diseños distintos**. Se comprobó la correspondencia de los pines en el navegador después de que el extractor web no pudiera abrirlos. No se sustituyó ningún pin por una imagen parecida. Las dos imágenes de WhatsApp siguen identificadas como adjuntos sin autor confirmado.

## 2. Lo que tienen en común las referencias

La escala de la imagen cambia con la tarea. En una bienvenida se concentra el deseo en un producto y una acción. En un catálogo se muestran opciones, nombres y precios próximos. En el detalle se amplía el mismo producto y se agrupan sus decisiones. Esta diferencia explica por qué una imagen grande puede funcionar en una pantalla y consumir demasiado espacio en otra.

La profundidad nace de relaciones concretas: una taza cruza el borde de una superficie; una silueta clara se separa de un fondo oscuro; la sombra asienta el objeto; una segunda escala de productos acompaña al destacado. Parte del efecto pertenece a la lámina promocional: por ejemplo, un vaso sale del marco dibujado de un teléfono. Ese recurso no debe convertirse en overflow de una app real.

El color organiza la lectura. Las superficies de mayor intensidad sostienen identidad o un producto destacado; las zonas claras facilitan comparar y leer. La foto conserva una silueta y una temperatura coherentes. El espacio vacío tiene una función: despejar el sujeto, separar controles o distinguir niveles.

Estas son observaciones de imágenes estáticas. No prueban animaciones, transiciones, gestos, compra funcional ni accesibilidad. Las interacciones se investigaron aparte. [Análisis detallado de los cuatro diseños](REFERENCIAS-PINTEREST.md).

## 3. La identidad que debe aportar Lupita

El manual presenta comida real, hospitalidad y una estructura editorial: titulares expresivos, información ordenada, precio reconocible y recursos gráficos contenidos. Su personalidad no se reduce a fondos beige, radios grandes y una tipografía serif.

- **Fotografía:** las pp.27–31 piden color real, luz suave, textura y una relación comprensible entre plato, vajilla y ambiente. Admiten detalles cercanos, pero también piden aire. No conviene oscurecer toda la comida para acomodar un titular ni forzar una misma toma en cualquier proporción.
- **Tipografía:** Playfair para titulares, nombres de platos y mensajes breves; Montserrat para lectura, datos, navegación y precio. Las cifras necesitan alineación consistente. Los rangos de tamaño de p.20 son propuestos; deben resolverse por soporte.
- **Firma:** p.11 distingue firma principal y símbolo contextual, cuyo uso exige el nombre cerca. Los 280/320 px son parámetros propuestos; la reserva H/4 y la integridad de la marca sí están expresamente definidas. No corresponde inventar una variante con un filtro CSS o rehacer sus letras.
- **Color:** cacao y arena como base; borgoña, coral y rosa como acentos. El marfil `#FBF6EE` es una decisión funcional existente del proyecto, no un sexto HEX maestro escrito en el manual. Los pares se comprueban: cacao/coral llega a 4.486:1 y no alcanza 4.5:1 para texto normal.
- **Voz:** voseo natural, ingredientes y preparación verificables, ayuda para elegir. Evitar promesas, superlativos y beneficios inventados.

Las escenas propuestas de fachada, uniforme o materiales no son fotos verificadas de la operación real. Algunos mockups tampoco cumplen perfectamente las reglas del propio manual; una escena atractiva no prevalece sobre las instrucciones expresas de uso del logo. El [informe de marca](MARCA.md) localiza cada distinción por página.

## 4. Diagnóstico de la quinta composición

La foto a todo el ancho responde al último ajuste pedido, y su funcionamiento se verificó. La lectura conjunta de las referencias revela una desviación de composición: **se aplicó una jerarquía de bienvenida a un Inicio de cliente identificado**.

En 390 × 844 px, la foto comienza en y=188 y mide aproximadamente 499 px de alto. La primera tarjeta de producto apenas empieza a aparecer detrás de la zona inferior; sus nombres y precios requieren desplazarse. En 1440 × 1000 px, la foto termina cerca de y=922 y solo comienza a verse el título de la sección siguiente. Las [mediciones](../inicio-inmersivo-2026-10-21/evidencia/composicion-inmersiva.json) incluyen el aviso local de prueba: al excluirlo quedan 141 px de interfaz antes de la foto móvil.

También hay una discontinuidad entre cabecera, franja de pase/actualización y foto. Cada bloque funciona, pero su suma retrasa el contenido gastronómico. El acercamiento extremo de la taza en escritorio mantiene su reconocimiento, aunque pierde parte del aire y la vajilla presentes en las referencias. Cumplir un mínimo de reconocimiento no equivale a elegir el mejor encuadre.

Los PASS anteriores corresponden a los criterios y estados revisados, incluida accesibilidad y operación de esa portada. El criterio de diseño necesita ampliarse: comparar la misma tarea, valorar la composición completa y comprobar cuánto producto real llega a verse. La validación visual del usuario sigue sin concederse; no se extrapola la revisión técnica al resto de la app.

## 5. Dirección recomendada

**Fotografía editorial y carta inmediata.** Conservar la foto a todo el ancho, ajustar su altura al contexto de uso y unir mejor la entrada con los primeros productos. La marca establece el lugar; la comida abre el apetito; el nombre, precio y acción permiten avanzar.

El próximo ajuste debe resolver en conjunto cabecera, pase, fotografía y comienzo de la carta. La actualización conserva acceso y estados, con menor peso visual. El encuadre debe elegirse antes de decidir la altura: si una foto cuadrada no soporta el formato panorámico, se busca un recurso propio adecuado o se replantea la composición sin deformar ni inventar el producto.

Como criterio nuevo a probar en 390 × 844, un producto destacado debería verse completo —foto, nombre y precio— antes de la barra inferior en estado normal. En pantallas muy cortas y con texto ampliado se priorizan lectura y acceso, permitiendo desplazamiento. En escritorio, el comienzo de la carta debe ofrecer contenido reconocible, no quedarse en su título. Son objetivos de la siguiente iteración, no propiedades ya implementadas.

La profundidad puede lograrse con encuadres consistentes, una superficie de marca y solapes selectivos. Los recortes aislados se usan solo donde el activo real lo permite; la cuadrícula de comida no necesita convertirse en una colección de ilustraciones flotantes. Un fondo intenso en cada módulo diluiría el foco.

## 6. Dinamismo que cumple una función

La investigación de 21st.dev aporta mecanismos, no componentes aprobados para pegar directamente. Las pestañas inspeccionadas conservan movimiento con la preferencia de reducción activada y requieren adaptar semántica y teclado; el acordeón mantiene una transición de altura; la confirmación sí elimina su transición en ese modo. La tarjeta de producto examinada no demuestra una transición a detalle ni una acción de compra.

La adaptación propuesta tiene cuatro objetivos: indicar qué categoría está seleccionada; reconocer el producto al abrir su detalle; explicar qué panel se expandió; confirmar una respuesta real del servidor. Precio, disponibilidad, foco y acciones siguen presentes sin movimiento. Los errores críticos permanecen junto al control o formulario y no dependen de un aviso que desaparece.

El [informe de interacciones](INTERACCIONES.md) distingue acciones observadas, fuente publicada, limitaciones y recomendaciones. No se ha incorporado una biblioteca nueva ni se afirma que estos comportamientos estén implementados en Lupita.

## 7. Aplicación al 100 % del producto

| Familia | Traducción del lenguaje visual |
| --- | --- |
| Inicio y páginas públicas | Identidad, fotografía, acceso claro a la oferta; jerarquía distinta para presentación y uso recurrente. |
| Carta, Tienda y detalles | Foto consistente, comparación, nombre/precio/disponibilidad próximos y selección reconocible; conservar carrito y confirmación reales. |
| Club, pase, saldo y premios | Estado personal legible y acciones inequívocas. Los números y condiciones tienen prioridad sobre decoración. |
| Reservas, perfil y compras | Formularios ordenados, progreso cuando existe, resumen, errores y confirmaciones contextualizados. |
| Las doce secciones del equipo | Mismos tokens, tipografía y respuesta de controles; densidad apropiada para operar, permisos y datos claros. No trasladar una gran portada gastronómica a cada pantalla de trabajo. |
| Componentes compartidos, kit y estados globales | Botones, campos, navegación, hojas, avisos, carga/vacío/error/éxito y movimiento reducido; revisión específica por superficie. |

La matriz de 77 superficies y familias mantiene el alcance completo. Esta investigación no acredita su rediseño ni cambia reglas del negocio. [Plan integral](../redisenio-2026-10-21/PLAN-100.md) y [cobertura](../redisenio-2026-10-21/COBERTURA.json).

## Estado al cierre de la investigación

Se conservó la quinta compilación y sus fuentes en `../inicio-ajuste-2026-10-21/antes/`. No se modificó la interfaz durante esta investigación ni se publicó. La próxima implementación se limitará a Inicio hasta la validación visual prevista en el encargo. Los informes y el panel conservan evidencia, atribución y límites para que el siguiente crítico evalúe el resultado contra estas referencias completas.

La [revisión independiente](REVISION-INVESTIGACION.md) cerró sin hallazgos materiales abiertos después de precisar la atribución del borgoña y la secuencia Inicio → extensión. Se verificaron enlaces locales, nueve hashes de fuentes/compilación sin cambios y el panel a 390/1440 px: imágenes cargadas, sin overflow, selector y ampliación/cierre operables. Estas verificaciones corresponden al documento, no a una nueva app. Los [siete criterios para el siguiente ajuste](bar.md) convierten la investigación en comprobaciones de composición y uso.
