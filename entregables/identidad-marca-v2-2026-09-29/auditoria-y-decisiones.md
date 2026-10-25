# La Bella Lupita — revisión crítica e identidad v2

Propuesta del 29 de septiembre de 2026. Documento independiente; no integrado en la aplicación.

## Dictamen

La primera propuesta acertaba al conservar el logo, recuperar su paleta y usar fotografía del proyecto. Sin embargo, era una aproximación estética: su personalidad dependía demasiado de elementos habituales de cafeterías y sus maquetas no demostraban las reglas que la guía recomendaba. Mi recomendación es sustituirla por la v2 para continuar la revisión.

No hay base para declarar una identidad «perfecta» antes de observar cómo la reconocen y usan sus clientes. Sí se puede exigir coherencia con la marca, detalles comprobables y ausencia de problemas conocidos. Esta revisión separa esos aspectos de las hipótesis de diseño.

## 1. Fidelidad: la marca ya tiene un lenguaje

El archivo `Logo - Identidad/Logo LBL.ai` contiene un conjunto reconocible: retrato femenino, cabello de líneas fluidas, lettering robusto y un detalle rosa en los labios. Esa combinación es más específica que una paleta de cafetería o una tipografía clásica.

La v1 empleaba el logo como una firma colocada sobre un diseño genérico. Su tarjeta de membresía añadía una L tipográfica decorativa que no aportaba continuidad con el símbolo. En v2, un recurso de seis curvas independientes conecta las superficies editoriales con el ritmo del cabello. No se recorta el rostro para construir una textura ni se presenta este recurso como un nuevo logo.

Se mantiene el logo principal original. Su rasterización procede del archivo vectorial, conserva la proporción y no repinta las formas. La normalización futura de los archivos a sRGB debe usar los colores rotulados como referencia y comprobarse visualmente antes de exportar los activos definitivos.

**Corrección de mi informe anterior:** los cinco HEX sí coinciden con los valores RGB impresos. Por ejemplo, #D7C1A5 es RGB 215, 193, 165. No existe la discrepancia que señalé en v1. Las diferencias visuales de una conversión de color no prueban un error entre códigos.

## 2. Posicionamiento: también es un bistró

La revisión del perfil público y de la publicación del 28/09 muestra platos, café, personas y una invitación cercana a disfrutar la comida. El post enlaza café y gastronomía mediante un plato con salsa de café. «Tu pausa» encajaba con la taza, pero limitaba la amplitud de la experiencia.

La nueva idea es **El gusto de volver**. Funciona como dirección creativa propuesta: gusto por lo que se come y bebe, y deseo de regresar. No se afirma que sea un eslogan exclusivo, registrado o ya validado en clientes. Tampoco se inventa una historia familiar, antigüedad o procedencia del café a partir de las imágenes de Instagram.

La promesa de la aplicación es concreta: facilitar pedir, reservar y seguir la relación con la casa. Para el cliente recurrente, «Lo de siempre» tiene prioridad sobre una campaña genérica; para quien explora, la carta muestra producto, ingredientes y precio.

## 3. Arquitectura: una marca principal

La Bella Lupita identifica la aplicación y firma sus pantallas. Club Lupita es la membresía. La Tanda es el mecanismo de sellos existente. Esa jerarquía evita construir tres marcas competidoras.

La v1 mostraba seis sellos y «Gente de la casa» como título de tarjeta. Aunque lo marcaba como ilustrativo, sugería reglas distintas del producto. La v2 representa nueve sellos, tres obtenidos como dato ficticio y el nivel existente Casa Abierta. Mesa de Siempre y Reserva de Altura se conservan en la explicación.

La regla de nueve sellos y décima taza procede del código local; no constituye verificación de condiciones comerciales vigentes fuera del proyecto. Los precios C$ 95 y C$ 430 también proceden del catálogo local, no de una consulta comercial actual.

## 4. Color: prioridad antes que variedad

Se conserva la paleta de cinco colores. La diferencia está en la jerarquía:

| Color | Función propuesta |
| --- | --- |
| Café #53291E | Identidad dominante, lectura, acciones habituales y tarjeta del club |
| Crema #FBF6EE | Extensión digital: fondo de lectura |
| Rosa #F9AFA4 | Pertenencia, sellos y recurso gráfico |
| Beige #D7C1A5 | Superficie secundaria |
| Frambuesa #B60032 | Énfasis puntual en beneficios o comunicación |
| Coral #FC6F6F | Repertorio editorial; excepcional dentro de la interfaz |

No se eliminan colores oficiales porque aparezcan poco en una pantalla. Tampoco se impone una proporción matemática fija: un pase de socio y una carta gastronómica necesitan distribuciones distintas. El frambuesa deja de competir con cada foto y cada control.

El sistema distingue acción de estado. Los errores llevan explicación y símbolo; las confirmaciones hacen explícito qué ocurrió. Un verde de servicio o un rojo de error no redefinen la paleta de marca.

## 5. Tipografía: corregir el uso, no cambiar por cambiar

Libre Caslon Text y Work Sans son una pareja adecuada para esta dirección: una aporta expresión y la otra organiza la acción. No se afirma que sean las fuentes oficiales del Instagram. Se conservan como elección propuesta, con los archivos y licencias presentes en el proyecto.

La v1 recomendaba texto de 16 px, pero dibujaba el cuerpo a 11 px y parte de la navegación a 8 px. El logo de las maquetas era de 91 px, por debajo de los 144 px que recomendaba la propia guía. La apariencia reducida no permitía evaluar legibilidad ni objetivos táctiles.

La v2 usa un lienzo móvil real, texto base de 16 px, etiquetas secundarias de 14 px y navegación breve de 12 px. Las acciones principales tienen al menos 48 px de altura. El texto al 200% se reorganiza y la pantalla permite desplazamiento; no se reduce automáticamente para mantener un encuadre bonito.

No hay un mínimo tipográfico universal que por sí solo garantice accesibilidad. El tamaño, la forma, el contraste, el espaciado y la ampliación se evalúan juntos.

## 6. Fotografía, iconos y componentes

La fotografía tiene que conservar el color real de la comida y una luz coherente. Las fotos provienen de los recursos existentes del proyecto; esta revisión no certifica su autoría ni supone que todas provienen de Instagram. No se han generado fotografías nuevas.

El recorte arqueado de la imagen de bienvenida conversa con las formas curvas del símbolo; las fichas de comida conservan un recorte más utilitario. Se limita este gesto para que no convierta toda la interfaz en decoración.

Los iconos usan una retícula de 24 px, el mismo trazo y etiquetas. La navegación seleccionada se distingue por texto, peso e indicador, además del color. Se evita el recurso de encerrar cada dato en una tarjeta: los bordes separan lo que realmente necesita separación.

El logo completo no sirve como favicon de 16 px. Aquí no se simula que ese problema está resuelto: una adaptación óptica para icono de instalación es una pieza de identidad pendiente, que debe evaluarse junto al original. Reducir el detalle o usar un monograma sin comprobar reconocimiento sería prematuro.

## 7. Voz: cercanía con precisión

Se conserva el voseo observado: vení, elegí, reservá. La personalidad es más visible en bienvenida y exploración. En importes, reservas, errores y requisitos, el texto es preciso.

«Qué gusto verte, María» recibe. «Pedir mi latte» acciona. «3 de 9 sellos» informa. Se evita prometer una mesa guardada, disponibilidad, beneficios o tiempos que el sistema no pueda confirmar.

La propuesta editorial «Vení por el gusto. Volvé por cómo te sentís» es un ejemplo de tono; no reemplaza textos operativos por poesía ni se presenta como un mensaje oficial existente.

## 8. Comprobaciones y validación restante

Las relaciones de contraste se calculan con luminancia relativa sRGB y se guardan en `contrastes.json`. Las comprobaciones de renderizado y accesibilidad automatizada se documentan en `verificacion.json`. Son evidencia sobre estas maquetas y esta presentación; no certifican la aplicación completa.

Referencias de W3C consultadas:

- [Contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4,5:1 para texto normal, con sus excepciones.
- [Tamaño mínimo de objetivos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): AA establece 24 × 24 CSS px, sujeto a excepciones. Los 48 px de la propuesta son una decisión de diseño más cómoda, no una cita errónea del mínimo.
- [Ampliación de texto](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): el contenido debe seguir siendo utilizable al aumentar el texto.

La comprobación humana pendiente es breve y concreta: con cinco clientes, observar si reconocen la marca sin explicación, encuentran su pedido habitual, ubican una reserva y entienden cuántos sellos tienen. Registrar dudas y errores, sin convertir cinco respuestas en una prueba estadística de mercado.

## Fuentes y alcance

- Archivo original de marca: `Logo - Identidad/Logo LBL.ai`.
- [Perfil de Instagram](https://www.instagram.com/la_bellalupita.ni/) y [publicación del 28/09/2026](https://www.instagram.com/la_bellalupita.ni/p/Dd2hyXzln0z/), revisados el 29/09/2026.
- Código del proyecto: `src/data/copy.ts`, `src/data/menu.ts`, `src/pantallas/Tanda.tsx`, `src/pantallas/Casa.tsx`.
- V1 y sus archivos HTML/CSS para comprobar lo representado frente a sus propias reglas.

No se ha realizado un estudio competitivo, una investigación con usuarios ni una validación de disponibilidad de eslogan. La revisión es de fidelidad de marca, dirección visual y adecuación digital. La v2 es la recomendación para revisión; la aplicación continúa intacta.

## Resultado de la revisión técnica

- Tres pantallas principales en 320, 390 y 430 px, con texto al 100% y al 200%: 18 combinaciones sin desbordamiento horizontal.
- Presentación revisada en 1440, 948, 390 y 320 px, sin desbordamiento horizontal.
- Axe-core no detectó infracciones en los criterios automatizados ejecutados sobre la presentación y las tres pantallas principales. Esto no sustituye una auditoría humana completa.
- Imágenes cargadas y navegación entre vistas comprobadas.
- Los 205 archivos registrados de código, recursos, paquete y logo permanecen idénticos por hash.

La validación pendiente con clientes y la adaptación del icono no se han realizado ni se dan por aprobadas.
