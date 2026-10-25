# Revisión adversarial de oficio visual

21 de octubre de 2026. Revisión independiente de render, referencias adjuntas y `bar.md`. No se leyó implementación ni reportes de construcción. Preview `http://127.0.0.1:5296`: confirmado `preview:true`, PGlite en memoria, salida bloqueada y credenciales sintéticas. Compilación estable comprobada mediante el recurso de entrada visible: `principal-C1ep5tM_.js`.

## Veredicto

**FAIL global. Tienda: FAIL. Mi club: PASS. Perfil: PASS.**

No se usan puntuaciones ni se atribuye validación de Awwwards. El juicio se aplica a los mecanismos concretos del bar y al render observado.

## Brechas que bloquean Tienda

1. **El producto no es el protagonista visual — bar 1 y 4.** El artículo es una reserva de 250 g de café en grano, pero la mayor superficie de la cabecera muestra una taza con leche. A 1440 px la imagen ocupa aproximadamente media cabecera; la referencia visual del artículo que se aparta sigue ausente. La leyenda «imagen de ambiente» evita engañar, pero no resuelve la jerarquía del producto. Las referencias aportadas ponen el artículo en primer plano y lo conectan con elección y precio; aquí la imagen principal solo comunica ambiente. Hace falta una composición protagonista del lote, deliberada y honesta cuando no existe foto del producto, con la fotografía de la taza como apoyo secundario. Evidencia: `evidencia-oficio/r2-tienda-390.png`, `tienda-1440.png`.

2. **El encargo desborda con texto al 200% — bar 7.** En 390 px con gutter estable de 15 px, duplicar el tamaño raíz duplica efectivamente la tipografía del producto (34→68 px en título; 13→26 px en párrafo). El documento pasa de 375 px útiles a `scrollWidth:518`. El selector y el campo de zona terminan en x517.7; la fila de cantidad/fecha también excede el ancho. No es una preferencia estética: se cortan información y controles. Evidencia: `evidencia-oficio/r2-tienda-encargo-texto200-390.png`, `r2-text200-metrics.json`.

La estructura ordinaria de Tienda sí agrupa precio, estado y CTA. La ficha separa café/retiro, muestra las condiciones antes de confirmar y el encargo produce un resumen útil. No se confirmó ninguna compra ni se abrió WhatsApp.

## Mi club — PASS

La credencial tiene escala y jerarquía propias. El nombre, la membresía, el número y «Mostrar mi pase» se leen como una unidad. En la compilación estable, el acceso «Usar mi café de hoy» queda unido visualmente al pase y visible a 390 px. Beneficios, sellos y saldo tienen ritmos distintos: no hay una pila de tarjetas idénticas.

Los sellos son interacción real: activar el primero revela visita y fecha; el segundo también funciona por teclado. El pase presenta un identificador legible y la explicación está a una acción. Con movimiento reducido, abrirlo no deja animaciones activas. No se generaron códigos de canje ni se modificó renovación.

Mayor distancia residual respecto de las referencias: la pequeña fotografía de una visita es ambientación, no añade información operativa. Su escala contenida no desplaza la credencial ni bloquea el mecanismo del bar. No hay un defecto de oficio suficiente para forzar FAIL.

Evidencia: `r2-club-390.png`, `r2-club-913.png`, `r2-club-1440.png`, `r2-club-sello-390.png`, `r2-club-pase-estable-390.png`, `r2-keyboard-reduced-motion.json`.

## Perfil — PASS

La identidad tiene jerarquía clara, el botón de edición es reconocible y el bloque de bebida aporta una acción concreta. Las preferencias, el cumpleaños y las alergias tienen tratamientos distintos y no se confunden con saldo o beneficios. La fotografía conserva un encuadre intencional y el texto de identidad sigue siendo dominante.

El acceso desde la bebida abre el editor y enfoca ese campo. Se cambió únicamente el borrador local a «Café negro», se cerró y se volvió a abrir para comprobar su persistencia; no se guardó. El estado final del panel es opaco y legible. Una captura a 180 ms mostraba translucidez propia de la transición; se descartó como defecto y se repitió a 900 ms.

Mayor distancia residual: la foto de terraza ocupa bastante superficie en escritorio para una tarea de preferencias. Podría ceder peso a una expresión más personal de la identidad, pero el nombre, la edición y las preferencias están claros y disponibles, por lo que no incumple la jerarquía exigida.

Evidencia: `r2-perfil-390.png`, `r2-perfil-913.png`, `r2-perfil-1440.png`, `r2-perfil-preferencias-estable-390.png`.

## Comprobaciones y límites

- Edge propio en modo headless, sin controlar el navegador del usuario. Vistas de 390×844, 913×1000 y 1440×1000; gutter estable de 15 px. También 320×844 y tamaño de texto raíz al 200% en 390 px.
- En tamaño ordinario no se observó desborde horizontal de las tres piezas. A 320 px hay más desplazamiento vertical, sin pérdida del contenido por desborde horizontal.
- A 200% Mi club y Perfil conservaron `scrollWidth:375` dentro de 390 px. La prueba verifica reflujo y legibilidad del render, no constituye una auditoría integral de accesibilidad.
- Se probó ficha de retiro, preparación de encargo, consulta de sellos, pase y edición de preferencias. Estado, precio y condiciones se vieron juntos en la confirmación de reserva; no se confirmó el cobro.
- La compilación y el estado del preview son compartidos con otras revisiones. Apareció un aviso de intento sin cobro; no se descartó ni se modificó. No se usa ese estado incidental como defecto de oficio.
- Las capturas sin prefijo `r2-` documentan la inspección inicial. La decisión de Mi club y Perfil se basa en las de prefijo `r2-`, tomadas tras recibir el hash estable.

La siguiente revalidación debe comprobar la nueva composición del producto y que el formulario de encargo deje de ensanchar el documento a 200%. No requiere cambiar el bar ni volver a puntuar las piezas que ya cumplen.
