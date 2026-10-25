# La Bella Lupita: investigación del manual original y criterio para la interfaz

Fecha de revisión: 21 de octubre de 2026. Objeto: identidad y traducción a interfaz, sin modificar la aplicación.

## Dictamen

El manual sostiene una marca de bistró y café cálida, sobria y cercana, cuyo carácter procede del retrato de Lupita, el contraste entre tipografía expresiva e información ordenada y la comida real. La identidad tiene más profundidad que una paleta beige con tarjetas redondas. En las páginas revisadas, la comida aporta gran parte del color; el sistema gráfico la enmarca y deja leer.

El `design-system.md` existente acierta en los colores maestros, las familias tipográficas, el respeto básico del logo y el tono. Su problema principal no es una contradicción frontal con el manual: es una reducción demasiado breve. Omite la jerarquía gastronómica, la alternativa de símbolo contextual, el tratamiento de precios, las condiciones de las fotografías, la distinción entre reglas y propuestas y las limitaciones de los mockups. Tampoco resuelve la tensión real entre una firma de 280/320 px con reserva y un encabezado móvil compacto.

La nueva dirección debe convertir esas reglas en decisiones de composición y jerarquía. Cambiar colores, radios y tipografías sobre una estructura indiferenciada no basta para trasladar el carácter observado.

## 1. Fuentes, método y límites

Fuente primaria: `C:\Users\artur\Downloads\La_Bella_Lupita_Manual_de_Marca_2026.pdf`. Metadatos: título «La Bella Lupita | Manual de marca editorial 2026», asunto «Identidad, benchmark, web real y aplicaciones · Edición 02», 64 páginas, 54.282.587 bytes, tamaño de página aproximado 680,315 × 442,205 pt. La portada identifica octubre de 2026.

SHA-256 del PDF leído: `8ffa062443176da4a9313417723a528859dc2381565b03fbd66a8a1181c095bd`.

Fuente de contraste: `entregables/redisenio-2026-10-20/design-system.md`, leído completo, 13 líneas. Este informe no evalúa el código ni afirma haber inspeccionado las cinco propuestas de portada; esa evaluación requiere sus capturas y archivos. Aquí se establece qué permite concluir el manual real.

Trabajo efectivamente realizado:

- Extracción y lectura del texto de las 64 páginas mediante Poppler `pdftotext -layout`; extracción adicional por página con `pypdf`.
- Render de las 64 páginas mediante Poppler `pdftoppm -png -scale-to 1400`, aproximadamente 1400 × 910 px cada una.
- Inspección visual de todas las páginas mediante ocho hojas de contacto de ocho páginas. Esta vista permite valorar secuencia, distribución, color, imágenes y aplicaciones; no se usó para fingir lectura del texto pequeño.
- Inspección adicional individual de las páginas 11, 12, 17, 28, 34, 37, 39, 49, 55 y 64 a la resolución renderizada. Sus textos y notas se cruzaron con la extracción.
- Cálculo local de contraste para los HEX maestros y el marfil agregado por el proyecto.

No hubo fallos de render. No se inspeccionaron los archivos fuente externos mencionados por el manual (`LEEME.md`, `FUENTES.md`, SVG maestros, artes de producción). El texto del PDF los menciona, pero eso no demuestra que estén disponibles en este proyecto. Tampoco se verificaron en línea los referentes de su benchmark: aquí se analiza lo que el manual declara, no se presenta su investigación como una auditoría externa nueva. Las capturas web del PDF corresponden al 02.10.2026; no son prueba del estado actual del sitio, catálogo o disponibilidad.

### Evidencia conservada

Todo está en [evidencia/marca](./evidencia/marca/):

- [Procedencia y huella del archivo](./evidencia/marca/procedencia.json).
- [Texto completo extraído](./evidencia/marca/manual-texto-completo.txt) y [texto separado por página](./evidencia/marca/manual-paginas.json), como evidencia de consulta, no como sustituto del original.
- `pagina-01.png` a `pagina-64.png`, renders completos.
- `contacto-01-08.jpg`, `contacto-09-16.jpg`, `contacto-17-24.jpg`, `contacto-25-32.jpg`, `contacto-33-40.jpg`, `contacto-41-48.jpg`, `contacto-49-56.jpg` y `contacto-57-64.jpg`.
- [Contrastes calculados](./evidencia/marca/contrastes-calculados.csv).

Los números de página de este informe corresponden al orden físico del PDF. Coinciden con los folios impresos donde aparecen; portada y contraportada no muestran folio.

## 2. Qué es existente, qué es regla y qué es propuesta

El propio manual exige esta separación. La p.9 diferencia logo y paleta suministrados, fotos propias y capturas reales, frente a un sistema gráfico, medidas de aplicación y escenas de producción propuestos. La p.5 identifica parte del posicionamiento como propuesta de dirección de marca. Por tanto, que algo aparezca en el PDF no lo convierte automáticamente en una condición histórica aprobada por el negocio.

En este informe se usan cuatro categorías:

| Categoría | Significado | Ejemplos y evidencia |
|---|---|---|
| Regla expresa del manual | El documento indica preservar, usar o evitar algo. Es una condición documental de esta edición. | Integridad y reserva de firma, pp.10–15 y 63; HEX maestros, p.16; roles tipográficos, pp.18–19; hechos verificables en el contenido, pp.29, 55 y 58. |
| Parámetro propuesto por el manual | El documento marca explícitamente una medida, sistema o aplicación como propuesta. Debe trasladarse con criterio y comprobarse en su soporte. | Mínimos digitales, p.11; rangos tipográficos, p.20; retícula, p.21; medidas de soportes, pp.38–57. |
| Aplicación o referencia visual | Enseña un efecto, material, estado previo o escena. No constituye por sí sola una regla de interfaz ni un dato actual del negocio. | Web capturada, pp.34–37; mesa, p.39; uniforme conceptual, p.41; fachada imaginada, p.49. |
| Decisión nueva de interfaz | Traducción profesional que proponemos ahora. Debe declararse como nuestra y probarse en el producto. | Jerarquía entre comida y saldo, geometría de componentes, estados activos, adaptación móvil y sistema de espacios. |

## 3. Lo que revela la revisión visual completa

### 3.1 La calidez procede del alimento y de los materiales

Las páginas 3, 63 y 64 usan cacao como campo amplio; la mayor parte del manual deja superficies claras. Los soportes de las pp.38–57 sugieren papel mate, algodón, cerámica, madera y luz lateral. No hay evidencia que obligue a convertir esos materiales en texturas digitales visibles.

Las fotos de las pp.28 y 31 muestran verdes vivos, huevo amarillo, flores azules y brotes magenta. Es decisivo: el alimento mantiene su color y aporta contraste cromático propio. «Marca cálida» no significa teñir todas las fotos de marrón, naranja o beige. La p.27 desaconseja precisamente el filtro naranja y la saturación artificial.

Traducción propia: usar calma en el fondo para que los alimentos conserven presencia. Evitar una página beige uniforme en la que foto, texto y controles tengan el mismo peso.

### 3.2 La estructura se siente editorial por su jerarquía

Se repiten títulos expresivos, bloques breves de texto funcional, pequeñas etiquetas borgoña, mucho espacio y separadores finos. La p.21 propone un punto focal y separación clara entre bloques. La p.55 jerarquiza nombre, descripción y precio sin multiplicar marcos o etiquetas.

La revisión no muestra un sistema general de tarjetas blandas de gran radio, sombras flotantes o pastillas para toda la información. Los principales marcos de las pp.21, 30, 34, 38, 50, 54 y 55 son rectangulares y discretos. Esto no prohíbe redondear controles en una app: demuestra que un radio de 16–24 px es una decisión nuestra, no un atributo obligatorio de Lupita.

Traducción propia: cada grupo debe existir por su función, no porque todo deba encerrarse en una tarjeta. Se puede separar con espacio, alineación, escala o una línea antes de agregar un fondo.

### 3.3 El logo da reconocimiento; la foto provoca el antojo

La p.31 declara que el sabor protagoniza y el logo acompaña. La p.30 aplica una composición con foto real, titular breve y una sola invitación. La p.54 presenta el menú con una firma reconocible, un mensaje corto y una foto protagonista, no con una colección de reclamos equivalentes.

Traducción propia: el encabezado establece pertenencia a La Bella Lupita; el contenido principal debe permitir entender qué se puede disfrutar o hacer. Repetir el retrato, el nombre y otro sello grande en la misma vista puede consumir el espacio que necesita la experiencia gastronómica.

## 4. Identidad y reserva del logo

### Reglas explícitas

- P.10: firma compuesta por retrato, nombre y descriptor «Bistró-Café», conservados como unidad.
- P.11: dos usos representados, firma principal y símbolo contextual. El segundo conserva el retrato y el descriptor y exige el nombre cerca. No permite inventar otro monograma.
- P.11: no reemplazar el lettering original por Playfair Display.
- P.12: proporción de firma `W = 2,11 H`, con reserva mínima `x = H/4` en todo el perímetro. Ningún texto, borde ni foto invade esa reserva.
- Pp.13–14: mantener escala proporcional, contraste y márgenes; no estirar, inclinar, recortar, recolorear arbitrariamente, añadir contornos, separar letras, mover el retrato o cambiar el descriptor.
- Pp.13 y 15: sobre fotografía o fondo oscuro, usar cartela clara. Debe dejar reserva; una caja pegada a la firma es otro problema, aunque sea clara.
- P.15: el archivo suministrado es raster. Una versión negativa, simplificada o de una tinta necesita un maestro vectorial revisado. Un filtro CSS no la sustituye.

Evidencia individual: [variantes, p.11](./evidencia/marca/pagina-11.png), [reserva, p.12](./evidencia/marca/pagina-12.png). Las prohibiciones y fondos se pueden revisar en [pp.9–16](./evidencia/marca/contacto-09-16.jpg).

### Parámetros propuestos y problema móvil

La p.11 señala 280 px para la firma principal como mínimo propuesto y 320 px como preferencia digital. No define «280–320 px» como intervalo rígido ni establece que la firma deba medir 320 px en todo encabezado. Para el símbolo contextual propone 96 px. Añade que el tamaño debe probarse según la técnica.

Interpretando los 280/320 px como ancho de firma, y usando la proporción de la p.12:

| Ancho de firma | Alto calculado | Reserva por lado | Ancho total con reserva | Alto total con reserva |
|---|---:|---:|---:|---:|
| 280 px | 132,7 px | 33,2 px | 346,4 px | 199,1 px |
| 320 px | 151,7 px | 37,9 px | 395,8 px | 227,5 px |

Es una derivación geométrica, no otra regla del manual. Explica por qué no se puede asumir simultáneamente firma a 320 px, reserva H/4 y barra móvil muy compacta. En una pantalla de 390 px, la firma de 320 px con reserva ya sobrepasa el ancho total, antes de márgenes de pantalla. Reducirla silenciosamente o ignorar la reserva no resuelve el criterio.

Dirección propia para estudiar: dar a la firma principal un lugar con espacio suficiente y separar su presencia editorial de los controles utilitarios. El símbolo contextual es una alternativa documentada que merece evaluación; tampoco equivale a un ícono de 24 o 32 px. Solo se debe usar su archivo correcto, conservando el descriptor y el contexto de nombre. Si ese recurso no está disponible, la ilustración del manual no autoriza reconstruirlo o recortarlo arbitrariamente del logo de la app.

## 5. Color: roles, no una colección de cinco tonos

La p.16 establece estos valores escritos como referencia digital, e indica no muestrear la lámina JPG porque sus bandas presentan diferencias respecto de los códigos.

| Color | HEX maestro | Papel expreso en el manual | Traducción propuesta para interfaz |
|---|---|---|---|
| Cacao | `#53291E` | Base junto a arena; texto principal, pp.16–17. | Tinta principal, acción dominante cuando corresponda, estados activos claros. |
| Arena | `#D7C1A5` | Base junto a cacao, p.16. | Soportes secundarios y pequeños campos de fondo; no necesariamente fondo de toda la pantalla. |
| Borgoña | `#B60032` | Acento, p.16. | Énfasis elegido y limitado. No asignar automáticamente todos los significados de error a una identidad que también lo usa editorialmente. |
| Coral | `#FC6F6F` | Acento; insuficiente como texto sobre blanco, p.17. | Detalles o rellenos decorativos con función comprobada; no texto pequeño ni botón de texto blanco por defecto. |
| Rosa | `#F9AFA4` | Acento, p.16. | Fondo ocasional de información cálida; cacao resulta legible sobre él. |

El marfil `#FBF6EE` aparece en el `design-system.md` como fondo existente. El manual nombra marfil en materiales y usa superficies claras, pero no da ese HEX como sexto color maestro. Es una decisión funcional del proyecto compatible con lo observado; debe seguir etiquetada así.

Los contrastes recalculados confirman las cifras de la p.17: cacao/blanco 12,326:1, borgoña/blanco 6,919:1, cacao/rosa 6,865:1 y coral/blanco 2,748:1. Los cálculos nuevos dan cacao/marfil del proyecto 11,457:1, cacao/arena 7,079:1 y borgoña/marfil 6,431:1.

Hay una combinación fácil de pasar por alto: cacao sobre coral da 4,486:1, ligeramente inferior al objetivo 4,5:1 que el manual fija para lectura normal. No debe redondearse a 4,5 para declararla aprobada. El texto blanco sobre coral tampoco funciona para ese objetivo: mantiene 2,748:1. La paleta no puede asignarse a botones sin comprobar el par completo de texto y fondo.

La proporción de uso de colores no está cuantificada en el manual. Cualquier regla «60/30/10», porcentaje de rosa o obligación de botones borgoña sería nueva y debe justificarse como tal.

## 6. Tipografía y jerarquía gastronómica

P.18: Playfair Display para titulares, nombres de platos y mensajes breves; pesos 400, 500, 600 y 700. La cursiva se reserva para una palabra o frase corta. No sustituye el lettering de la firma.

P.19: Montserrat Regular para lectura; Medium para datos y navegación; Bold para énfasis y llamadas. Los precios usan Medium, cifras de misma altura y alineación y margen derecho estable. La p.52 repite ese orden numérico para documentos comerciales y la p.55 lo aplica a una ficha de plato.

P.20 propone, para pantalla, titulares de 40–64 px, subtítulos de 24–32 px, texto de 16–18 px y precio/CTA de 18–24 px. También propone interlineado de 140–150 % en textos y evita párrafos enteros en mayúsculas. Son rangos declarados como propuestos, no una plantilla que deba forzarse en todos los anchos.

Traducción propia:

- Reservar la serif para los momentos de identidad y deseo: saludo editorial breve, encabezado de sección y nombre de plato. El saldo, la fecha, los sellos, la navegación y los controles necesitan la lectura estable de Montserrat.
- Conservar nombre, descripción y precio como tres niveles inequívocos. El título no debe comerse la información ni el precio depender de encontrar una pastilla pequeña.
- Dar al precio alineación y consistencia numérica entre productos. No usar un tamaño distinto para cada cantidad según cuánto espacio quede.
- Mantener los textos funcionales en un tamaño cómodo. Una página muy clara con etiquetas diminutas y poco contraste no cumple el espíritu de la p.20.
- Elegir cortes de línea por significado. La composición editorial no consiste en romper automáticamente cada frase en tres renglones ni en usar cursiva como decoración continua.
- Verificar tildes, signos, «C$», cifras y espaciado de la fuente real. Autoalojar las fuentes es una decisión técnica del proyecto; el manual prescribe familias y roles, no su mecanismo de carga.

## 7. Fotografía y dirección de arte

### Evidencia del manual

- P.7: fotografía de producto real, luz natural y disponibilidad revisada.
- P.27: conservar los tonos de alimentos y materiales; evitar filtros naranjas o saturación artificial.
- P.28: luz lateral suave, color real, textura, plato centrado, vajilla reconocible y aire. El render enseña una toma elevada de un plato, con textura del huevo, hojas verdes y flores visibles.
- P.31: una toma más cercana enfatiza textura y volumen. Se admite una secuencia de plato, café, mesa y detalle. Eso permite alternar encuadres; no convierte todos los productos en recortes abstractos.
- Pp.30 y 33: una idea y una invitación; secuencia de antojo, detalle y visita/mesa.
- P.36: disponibilidad y contenido deben mantenerse; registra una discrepancia concreta del bagel de salmón en las capturas de octubre.

### Traducción propuesta

La imagen principal debe mostrar una experiencia reconocible y apetecible del restaurante. Para una ficha de producto, el encuadre debe dejar identificar el plato, su porción y su presentación. Para un bloque editorial puede existir un detalle cercano, siempre que conserve relación inequívoca con el contenido.

Cada foto debe elegirse por sujeto y encuadre, no solo por resolución. Antes de aplicar `cover`, decidir dónde está el plato, cuánto del borde es necesario y qué parte se puede perder en móvil. Una misma imagen no funciona automáticamente en una franja horizontal estrecha, una tarjeta cuadrada y un hero vertical. Conviene elegir un encuadre por contexto o una relación que preserve el contenido.

No añadir texto sobre ingredientes complejos ni oscurecer toda la comida para acomodar un titular. El manual usa cartelas claras en piezas editoriales: la lección útil es proteger la lectura y el alimento, no copiar literalmente una caja encima de cada foto. En la interfaz, separar texto e imagen puede lograrlo con mayor claridad.

Una foto de producto disponible vale más que un escenario aspiracional no documentado. Las pp.39, 41 y 49 se identifican como conceptos; no deben presentarse como fotos del local, de su personal o de su experiencia actual. Para producción, el manual pide sRGB y dimensiones de uso, sin ampliar archivos pequeños esperando definición (pp.59–60).

La nota sobre el bagel de salmón no autoriza cambiar datos de la app durante esta investigación. Sí obliga a no reutilizar esa antigua captura o su catálogo como fuente de disponibilidad vigente. Los datos actuales se resuelven con la fuente de negocio correspondiente.

## 8. Voz y relación con el visitante

Las pp.3–5 proponen hospitalidad cálida, cuidado y conversación natural. La p.29 define voseo amable, descripciones de ingredientes y preparación reales y ayuda para elegir. Desaconseja superlativos vacíos, promesas sin respaldo y diminutivos excesivos. La p.58 relaciona esa cercanía con precisión: ingredientes, alergias, preparación y disponibilidad se confirman.

Traducción propuesta para una app con fidelización: el club debe sentirse como parte de volver a la mesa. El vocabulario puede ser directo y humano: «Tu próxima visita», «Ver la carta», «Tus sellos», «Usar tu pase», siempre que las acciones y estados existan. No agregar promesas de descuentos, premios, rapidez o exclusividad por motivos de diseño.

El manual no define reglas de saldo, recarga, recompensa, membresía o gamificación. Tampoco establece la prioridad de esos módulos. Por ello, «hacer protagonista la comida y presentar el estado personal como apoyo útil» es una hipótesis de diseño para probar con los objetivos de la app, no una orden literal del manual ni permiso para eliminar funciones.

El tono se sostiene en claridad y atención. Mucha exclamación, metáforas de lujo, frases grandilocuentes o un eslogan distinto en cada tarjeta dispersarían esa voz. Un saludo corto debe abrir paso al contenido y a la acción.

## 9. Recursos gráficos: uso contenido y con función

P.22: familia de doce íconos, grosor coherente, extremos redondos y color cacao. No reemplazan el logo. P.23: retícula de 64 × 64 y trazo de dos unidades; propone 24 px como mínimo y 32–64 px como escala preferida. Exige ícono con etiqueta y no depender solo del color. Los íconos de servicios se usan con datos confirmados.

P.24: ondas inspiradas en el movimiento del cabello, rama de café y aroma son recursos de apoyo, expresamente distintos de versiones o fragmentos del logo. P.25: un motivo por pieza y tranquilidad alrededor de texto, fotos y firma.

Pp.26–27: el degradado descrito es un tratamiento editorial de pliego, con luz y continuidad entre páginas. No es una instrucción para llenar tarjetas, botones y fondos de la app con degradados.

Traducción propuesta: los íconos deben orientar acciones y estados, manteniendo nombres legibles; no se necesita un símbolo distinto por cada línea de texto. Una onda discreta puede cerrar una sección si existe el recurso correcto y hay espacio. Incorporar simultáneamente ondas, hojas, vapor, destellos, patrones y varias sombras debilitaría la contención que prescribe el manual.

No se inspeccionó el paquete SVG citado en el PDF. No afirmamos que esta biblioteca exista en el repositorio ni autorizamos reemplazarla por dibujos improvisados.

## 10. Contraste con el design-system existente

Referencia: `entregables/redisenio-2026-10-20/design-system.md`. Las líneas indicadas corresponden a la versión leída en esta revisión.

| Elemento actual | Diagnóstico con evidencia | Corrección documental que necesita |
|---|---|---|
| L.3 cita pp.11 y 16–20 como base general. | Fuente demasiado estrecha. La reserva está en p.12; fotografía en pp.27–31; voz en p.29; composición en p.21; variantes y fondos en pp.11–15. | Ampliar trazabilidad y distinguir regla, propuesta y referencia. |
| L.5 reproduce los cinco HEX. | Coincide con p.16. Omite el aviso de usar códigos y no muestrear JPG. | Preservar códigos y roles base/acento. |
| L.5 usa marfil `#FBF6EE`. | Compatible como decisión existente; ese HEX no está definido como maestro del manual. El texto actual ya lo llama existente. | Mantenerlo expresamente como neutral funcional del proyecto. |
| L.6 fija Playfair y Montserrat. | Correcto, pero incompleto: nombres de platos, pesos, cursiva restringida y alineación numérica desaparecen. | Explicar roles y jerarquía; dar ejemplos de ficha y datos personales. |
| L.6 limita tipografía al Inicio. | Decisión de entrega, no regla de identidad. Puede producir inconsistencia entre pantallas si se eterniza. | Separar el alcance de implementación de la dirección de marca. No cambiarlo durante esta investigación. |
| L.7 resume «280–320 px». | Comprime un mínimo propuesto y una preferencia en un aparente rango. Omite el símbolo contextual de p.11. | Especificar ambos valores, su condición y la alternativa; resolver geometría móvil. |
| L.7 pide firma intacta y H/4. | Correcto según pp.10–15. La frase «revisar adaptación» deja sin solución el problema espacial. | Decidir presencia editorial y navegación con una composición que realmente deje reserva. |
| L.8 fija escala 4/8 px y objetivo de 44 px. | Decisiones de interfaz; no aparecen en el manual. Son razonables como criterios del producto, pero no provienen de él. | Identificarlas como nuevas y comprobar densidad, legibilidad y tacto en el prototipo. |
| L.9 propone radios de 16–24 px. | Se reconoce correctamente que son nuevos. El manual no respalda esa geometría general; predominan marcos rectos discretos. | Justificar el radio por el componente y el resultado visual, no por una supuesta obligación de marca. |
| L.10 fija voseo, hechos y fotos propias. | Correcto según pp.7, 27–31, 36, 55 y 58. Insuficiente para seleccionar y encuadrar fotos. | Añadir luz, color natural, textura, vajilla, focalización y disponibilidad. |
| L.11 exige 4,5:1, teclado y movimiento reducido. | El objetivo de contraste sí está en p.17. Teclado y movimiento reducido son criterios de producto agregados, no citas del PDF. | Mantenerlos como criterios propios y verificar los pares reales, incluido cacao/coral. |
| L.13 enumera funciones conservadas. | Es alcance funcional de la app. El manual no determina estas funciones ni su prioridad. | Conservar las funciones y resolver jerarquía sin atribuir al manual una arquitectura que no contiene. |

No se detectó una inversión de colores ni una fuente directamente opuesta al manual en ese archivo. La mayor brecha es que conserva ingredientes de la marca y deja sin definir cómo se combinan en una pantalla convincente.

## 11. Tensiones dentro del propio manual que no deben copiarse

1. **Captura histórica frente a norma propuesta.** La web móvil de p.37 muestra una firma completa pequeña dentro de una barra compacta. El pie dice expresamente que es una captura sin rediseñar de 390 × 844 px del 02.10.2026. No demuestra que ese tamaño satisfaga el mínimo propuesto de p.11 ni convierte el sitio existente en especificación de la app. La p.35 aclara además que sus dispositivos no enseñan una interfaz nueva.
2. **Mockup de acabado frente a color autorizado.** La p.39 muestra en un portacuenta cacao una firma de aspecto dorado. Las pp.13–15 no autorizan una versión recoloreada libremente; exigen maestro revisado para una tinta/negativa. El pie de p.39 la identifica como concepto de acabados y remite al arte nativo. Es una inspiración material, no permiso para poner el logo dorado en la app.
3. **Contraportada frente a reserva H/4.** En el render completo de p.64, el logo queda muy cerca del borde de su cartela blanca y la frase empieza cerca de su base. Visualmente esa reserva parece muy inferior a H/4. Esta es una observación del render, no una medición del arte original. No conviene usar la contraportada como plantilla para ejecutar la reserva que p.12 sí define expresamente.
4. **Foto amplia frente a detalle.** La p.28 pide conservar la vajilla, mientras p.31 presenta un primer plano parcial. Se entiende mejor como dos funciones de fotografía, identificación y detalle, que como permiso indiscriminado de recorte. El contexto decide cuál corresponde.
5. **Datos documentados frente a datos vigentes.** La p.36 admite que una captura aún muestra un producto excluido de las promociones de esa edición. La p.55 fecha un precio y exige confirmación antes de publicar. Las fotos de página y ejemplos no son un catálogo actualizado.

Cuando un ejemplo decorativo entra en tensión con una regla explícita, esta investigación usa la regla para orientar la futura interfaz y deja constancia de la tensión. No presenta al manual como un sistema ejecutado sin errores.

## 12. Dirección propia para el siguiente diseño

Esta sección es una propuesta derivada, no una transcripción normativa del PDF.

**Concepto de trabajo: una visita a La Bella Lupita, organizada con claridad.** La persona debe reconocer el restaurante, ver algo que quiera disfrutar y entender la acción disponible. Su relación con el club aparece como parte de esa visita.

1. **Composición con una jerarquía principal.** Decidir el primer punto focal de cada vista. Una foto gastronómica y un mensaje breve pueden liderar el Inicio; datos personales y beneficios forman un bloque de apoyo coherente. Si una acción del club debe liderar por un estado real, elevarla de forma deliberada sin convertir todos los módulos en protagonistas.
2. **Logo con espacio verificable.** Elegir y justificar la variante correcta; medir reserva y proporción en móvil y escritorio. Evitar una firma microscópica compensada con varias repeticiones decorativas.
3. **Fotografía como contenido.** Seleccionar imagen por producto, momento y encuadre, conservar su color y darle escala suficiente. El alimento no debe reducirse a una miniatura entre cifras.
4. **Identidad tipográfica con roles.** Playfair expresa hospitalidad y apetito; Montserrat organiza tareas, cantidades y estado. La vista debe conservar una lectura clara incluso al cubrir mentalmente las fotos.
5. **Color con economía.** Superficie clara, tinta cacao y un acento coherente por situación. No asignar un color a cada módulo solo para diferenciarlos. La foto ya aporta diversidad.
6. **Componentes según función.** Usar bloques abiertos para contenido editorial, agrupación sólida para información relacionada y controles reconocibles. Elegir radios moderados o rectos según la familia; 16–24 px no es un requisito de Lupita.
7. **Cercanía en acciones concretas.** Textos breves y voseo consistente, sin titulares publicitarios repetidos ni promesas nuevas. Confirmación, estado y siguiente paso deben ser más claros que la decoración.

### Criterios observables para revisar el próximo prototipo

- Se reconoce una experiencia de restaurante y café en los primeros segundos, con fotos y contenido verdaderos.
- Existe una prioridad evidente; saldo, sellos, ofertas, próxima visita y accesos no parecen seis campañas compitiendo.
- La firma está intacta y tiene reserva real, no solo padding alrededor de una imagen cuyo contenido ya está pegado al borde.
- La comida conserva color, porción y encuadre útiles en móvil; no se ha convertido en una banda de textura.
- Nombres, descripciones, precios y acciones tienen jerarquías distintas y constantes.
- Las combinaciones de color cumplen el objetivo definido; el acento no carga información sin texto o forma adicional.
- No se presentan mockups de personal o fachada como evidencia del local real.
- Cada motivo decorativo tiene una función; los recursos no rodean simultáneamente cada tarjeta.
- Toda decisión no presente en el manual está identificada como propuesta del diseño, con razón concreta.

Estos criterios permiten juzgar una portada por composición y fidelidad, antes de invertir otra ronda en su implementación.

## 13. Registro de páginas inspeccionadas

Todas las filas tienen texto leído y revisión visual de su hoja de contacto. «Individual» indica una inspección adicional del render de esa página. El agrupamiento no implica páginas omitidas.

| Páginas | Contenido comprobado | Lectura para el proyecto | Inspección |
|---|---|---|---|
| 1–2 | Portada, lema, edición e índice. | Presentación editorial, firma y grandes áreas claras. | Contacto 01–08. |
| 3–5 | Plataforma propuesta, esencia, promesa y experiencia. | Hospitalidad y cercanía; distinguir existente de propuesto. | Contacto 01–08. |
| 6–8 | Benchmark y principios transferidos. | Se comparan prácticas de diseño, sin datos comerciales; adoptar criterio, no copiar marcas. | Contacto 01–08. |
| 9 | Existente/propuesto/operativo. | Clave de procedencia y autoridad de todo el documento. | Contacto 09–16. |
| 10–11 | Firma y símbolo contextual. | Unidad del logo, variantes, mínimos propuestos. | Contacto 09–16; p.11 individual. |
| 12 | Construcción y reserva. | W = 2,11 H y H/4. | Contacto 09–16; individual. |
| 13–15 | Criterios, errores y fondos. | No alterar; cartela clara; limitación del maestro raster. | Contacto 09–16. |
| 16–17 | Paleta y contrastes. | Códigos escritos maestros, cacao/arena base y acentos; pares legibles. | Contactos 09–16 y 17–24; p.17 individual. |
| 18–20 | Familias, pesos, precios y escalas. | Roles editoriales/funcionales, cifras alineadas; rangos propuestos. | Contacto 17–24. |
| 21 | Retícula y composición. | Un punto focal, espacio entre bloques; no prescripción de tarjetas. | Contacto 17–24. |
| 22–23 | Biblioteca de íconos y construcción. | Coherencia de trazo, etiqueta y veracidad de servicios. | Contacto 17–24. |
| 24–25 | Ondas, rama, aroma y textura. | Apoyo contenido; un motivo por pieza. | Contactos 17–24 y 25–32. |
| 26–27 | Degradado de pliego y continuidad. | Tratamiento editorial; preservar color real en foto. | Contacto 25–32. |
| 28–29 | Fotografía y voz. | Plato real, luz lateral, textura, voseo e información cierta. | Contacto 25–32; p.28 individual. |
| 30–31 | Publicación y protagonismo del sabor. | Foto grande, una invitación, logo subordinado a comida. | Contacto 25–32. |
| 32–33 | Formato vertical y guion de 15 s. | Márgenes propios de medios; secuencia gastronómica, no copiar dimensiones a la app. | Contactos 25–32 y 33–40. |
| 34–35 | Captura desktop y mockup de dispositivos. | Estado histórico del sitio, explícitamente sin nueva interfaz. | Contacto 33–40; p.34 individual. |
| 36–37 | Flujo publicado, mantenimiento y captura móvil. | Accesos claros; disponibilidad fechada; no convertir screenshot en norma de logo. | Contacto 33–40; p.37 individual. |
| 38–39 | Tarjeta, mesa y papelería. | Materialidad y calma; mockup de acabado no prescribe recolorear firma. | Contacto 33–40; p.39 individual. |
| 40–41 | Delantal y uniforme conceptual. | Cartela, prueba de reproducción; la persona no es personal documentado. | Contactos 33–40 y 41–48. |
| 42–43 | Gorra y aplicación propuesta. | Ajuste de soporte y validación material. | Contacto 41–48. |
| 44–45 | Camiseta y visualización de acabados. | Continuidad cacao/marfil, tamaños de soporte. | Contacto 41–48. |
| 46–47 | Packaging y colección para llevar. | Firma frontal, un acento, limpieza; visualización sin troquel final. | Contacto 41–48. |
| 48–49 | Señalética y fachada conceptual. | Reconocimiento; fachada no corresponde a local real. | Contactos 41–48 y 49–56; p.49 individual. |
| 50–51 | Roll-up, arte y mockup. | Orden de lectura y llamada real al menú; medio publicitario distinto de app. | Contacto 49–56. |
| 52–53 | Documento comercial y factura modelo. | Orden numérico; no comprobante fiscal válido. | Contacto 49–56. |
| 54–55 | Menú, mesa y ficha gastronómica. | Nombre, descripción y precio claros; contenido fechado. | Contacto 49–56; p.55 individual. |
| 56–57 | Temporada y pizarra. | Cambia acento, permanece firma; una llamada por pieza. | Contactos 49–56 y 57–64. |
| 58 | Atención. | Cercanía y exactitud, confirmar cocina. | Contacto 57–64. |
| 59–61 | Producción, formatos y mantenimiento. | sRGB, resolución real, maestro y responsabilidad de contenido. | Contacto 57–64. |
| 62 | Procedencia. | Fuentes y recursos mencionados; no verificados externamente en esta tarea. | Contacto 57–64. |
| 63 | Lista de revisión. | Resumen coherente de firma, color, lectura, fotos y datos. | Contacto 57–64. |
| 64 | Contraportada. | Ejemplo visual cuya reserva parece inconsistente con H/4. | Contacto 57–64; individual. |

