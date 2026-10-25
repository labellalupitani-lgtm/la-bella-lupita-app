# Investigación visual · Tienda, Mi Club y Perfil

21 de octubre de 2026. Investigación independiente, previa a implementación. No se modificó el producto ni sus pruebas.

## Referencias y evidencia

### 1. Bacancy · Starbucks Coffee App Design

[Página del autor en Dribbble](https://dribbble.com/shots/20371794-Starbucks-Coffee-App-Design) · [Imagen completa publicada por el autor](https://cdn.dribbble.com/userupload/4278636/file/original-384c09548938c20f5405556a1d28c616.jpg?resize=752x&vertical=center).

Se abrió la página y la imagen en el navegador integrado. El montaje muestra dos pantallas móviles: bebidas recortadas grandes sobre superficies curvas, producto superpuesto a su contenedor, títulos cortos, precio próximo a controles de cantidad y una acción dominante en el extremo inferior. El producto tiene más peso visual que los párrafos.

Es un concepto estático del autor, no la aplicación oficial. No prueba funcionalidad, accesibilidad ni animación. No copiar verde, logotipo, vasos ni productos. Sí trasladar profundidad de capas, brevedad y relación inmediata entre producto, precio y acción.

### 2. Escape Coffee · comercio y ficha de producto

[Sitio oficial](https://escape.cafe/) · [Ficha Cottage](https://escape.cafe/products/cottage) · [Reconocimiento Awwwards](https://www.awwwards.com/sites/escape-coffee).

Awwwards documenta Site of the Day del 15 de mayo de 2024 y Developer Award. La versión actual se abrió y observó en navegador: portada con imagen ambiental, tipografía muy grande y acceso a tienda; ficha con bolsa aislada a la izquierda y título, precio y compra a la derecha. El árbol accesible contiene disclosures distintos para origen, preparación y entrega. La portada ofrece un cuestionario de selección de café. No se compró ni se alteró una cuenta.

La ficha actual también tiene demasiado texto antes de comprar; no conviene reproducirlo. Su barra vertical de navegación y portada casi de pantalla completa perjudicarían la rapidez de una app frecuente. Trasladar protagonismo material del producto, descubrimiento opcional y separación de información secundaria. No copiar recetas ni declaraciones de origen ajenas.

### 3. Starbucks Rewards · recompensa y cuenta

[Página oficial de Rewards](https://www.starbucks.com/rewards) · [Ayuda oficial sobre cuenta y app](https://www.starbucks.com.cn/en/help/mobile).

Se renderizó la portada de Rewards y se probó su selector: al activar «200 Stars», cambió el tab seleccionado y apareció un panel con imagen de bebida/comida y explicación breve. La página separa presentación de beneficios, selector y condiciones largas. Las tarjetas de estado usan colores y motivos propios. La ayuda oficial describe consulta de estado, recompensas con vencimiento, historial y datos de cuenta.

No se inició sesión: la cuenta privada no se inspeccionó. No se afirma que su Perfil tenga una composición determinada. Para Lupita, separar «lo que puedo usar ahora» de reglas y administración es una inferencia de diseño, no una reproducción de una cuenta observada. No importar niveles, estrellas, premios, tarifas ni condiciones de Starbucks.

## Siete mecanismos verificables para el ciclo

Los umbrales siguientes son criterios propuestos para este proyecto; no son medidas atribuidas a las referencias.

1. **Un protagonista por primera vista.** Tienda: café real del catálogo; Mi Club: pase y beneficio disponible; Perfil: identidad y acción personal. En una captura debe reconocerse qué diferencia a los tres módulos, sin leer varios párrafos.
2. **Acción junto a información decisiva.** Cada bloque tiene un CTA dominante; importe, disponibilidad o estado aparecen a su lado. Ninguna condición crítica se descubre después del compromiso.
3. **Síntesis visible y detalle a un gesto.** Una frase introductoria de hasta 25 palabras y 2–4 datos breves. Condiciones, privacidad e historial completo siguen accesibles mediante un control explícito. Los avisos de error y pagos inciertos no se esconden.
4. **Profundidad con propósito.** Producto o credencial se separan del fondo mediante recorte, capas o borde propio. Evitar que todo el carácter multimedia sea una foto genérica rectangular encima de una lista.
5. **Ritmo de superficies, no cajas infinitas.** Alternar marfil y cacao/borgoña con secciones abiertas. Mantener Playfair Display/Montserrat. Una pantalla no debe parecer ocho tarjetas equivalentes con el mismo peso.
6. **Una interacción visual útil por módulo.** Tienda: acercar producto o explorar ficha; Mi Club: elegir un beneficio o abrir el pase; Perfil: revelar/editar datos de forma contextual. Cada interacción cambia información o facilita una tarea real. Teclado y controles explícitos sustituyen cualquier gesto.
7. **Movimiento subordinado a la tarea.** Transiciones cortas de selección, apertura o progreso; sin bucles que distraigan, números de saldo que «cuenten» lentamente ni acciones demoradas. Con movimiento reducido se conserva la misma información y capacidad de operar.

Revisar 390, 913 y 1440 px, además de 320 px y texto al 200 %. El punto de 913 px es obligatorio por el defecto observado en la entrega anterior. El protagonista y la acción no deben quedar separados por cabeceras acumuladas.

## Propuestas concretas para el producto existente

### Tienda: una pieza de café, no un formulario

- Composición de producto con fotografía de la ficha existente, marca de lote, cantidad y precio visibles. Texto sugerido: «El café de la casa, en tu casa». No inventar finca, altitud, notas ni disponibilidad.
- Un control «Ver el café de cerca» abre una imagen ampliada; la ficha de origen/perfil usa exclusivamente datos actuales. La foto no se transforma en una falsa animación 3D.
- La compra conserva sus pasos, condición de saldo e idempotencia. Presentar «Preventa · pagás hoy» junto al CTA y las fechas de retiro antes de confirmar.
- Mostrar la bolsa de membresía en una banda claramente distinta de la oferta pagada. Encargos grandes se inicia con elección visual «Regalos / Oficina» y revela su formulario; conservar WhatsApp y textos de intención sin prometer entrega.

### Mi Club: una credencial que sirve

- Un pase visible con nombre y estado real que abre el código ya existente. La interacción puede cambiar de credencial a código mediante expansión suave; no requiere arrastrar ni hover.
- Beneficios café/bolsa como piezas con imagen apropiada y estado breve. Si ya se entregó, mostrarlo como tal; no simular disponibilidad ni volver a emitir una entrega consumida.
- La tanda de nueve sellos puede tener diseño de tarjeta física y una transición de entrada; conservar contadores reales y texto accesible. Separar premio pendiente de progreso de la tanda actual.
- Experiencias tienen fecha, precio y cupos al frente. Detalle de contenido y condiciones se despliega antes del pago. Fotografías solo si hay un recurso auténtico apropiado o una ilustración identificable como tal.

### Perfil: lugar personal, no centro de documentación

- Identidad compacta con inicial, nombre, antigüedad y «Editar mi perfil» al frente. El editor existente sigue siendo la fuente de la actualización y el consentimiento.
- Mostrar bebida habitual, cumpleaños y alergias en una composición visual diferenciada. Los datos de alergias deben permanecer explícitos, sin convertirse en un icono ambiguo ni quedar ocultos por el efecto visual.
- Cuenta de Casa como tarjeta con saldo estable y acceso a movimientos; reducir duplicación de la explicación de puntos/sellos. Historial resumido y expansión contextual, sin perder «Actividad de cuenta».
- Comunicaciones, datos personales y sesiones como filas operables con paneles de detalle. Los textos de privacidad siguen disponibles donde la persona decide; no borrar contenido necesario para lograr una captura limpia.

## Límites de esta investigación

Se inspeccionaron visualmente tres referencias concretas; no se hizo una auditoría completa de sus accesibilidades ni se accedió a cuentas privadas. La composición de Perfil es propuesta propia apoyada en las funciones existentes, no una cuenta externa verificada. No se descargaron ni copiaron recursos de las referencias. «Digno de Awwwards» se usa como exigencia de oficio, originalidad y ejecución; ningún árbitro interno puede conceder ni garantizar ese reconocimiento.
