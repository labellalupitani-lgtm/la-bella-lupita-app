# Revisión adversarial de oficio · cierre R4

21 de octubre de 2026. Compilación final comprobada en carga nueva: `principal-B6EbsuoF.js`, preview `http://127.0.0.1:5296`. La revalidación anterior de esta ronda usó `principal-DTOZgFsC.js`; después se comprobó visualmente el ajuste final R4. El estado confirma PGlite en memoria, credenciales sintéticas y salidas bloqueadas. Se mantuvo el mismo `bar.md`, sin leer implementación ni reportes de construcción.

**Veredicto global: PASS. Tienda: PASS. Mi club: PASS. Perfil: PASS.**

Este PASS significa que los mecanismos del bar se sostienen en el render observado. No es una puntuación ni una atribución de premio o validación de Awwwards. El informe R1 permanece intacto.

## Tienda — PASS

Las dos brechas de R1 se cerraron.

- El estado sin fotografía del lote tiene ahora una composición editorial propia: lote, peso y presentación se convierten en el protagonista. El motivo de granos acompaña datos reales y la leyenda informa que la fotografía está pendiente. No se presenta una taza preparada como si fuera el producto ni se inventa un empaque. La escala de «250 g» conecta visualmente con lo que se aparta.
- En 390 px con gutter estable de 15 px y texto raíz al 200%, el documento conserva `scrollWidth:375`. Selector, cantidad, fecha y zona se ajustan al ancho. La cantidad y la fecha se apilan; se pueden leer y operar sin desplazamiento horizontal. En R1 el documento llegaba a 518 px.
- Precio, estado y CTA siguen juntos. Título, protagonista y «Apartar la mía» están presentes en la primera vista a 390, 913 y 1440 px. La ficha de retiro funciona con teclado. El encargo actualiza correctamente el resumen y el enlace preparado con 12 bolsas, fecha 1 de noviembre y retiro en la casa; no se abrió WhatsApp ni se confirmó una compra.

Mayor distancia residual respecto de las referencias: la ficha editorial todavía no tiene la riqueza material de una fotografía real del lote. Es una limitación de contenido reconocida y resuelta con una composición deliberada; ya no es una ruptura del bar.

Evidencia final: `evidencia-oficio/r4-tienda-390.png`, `r4-tienda-913.png`, `r4-tienda-1440.png`. Evidencia de la corrección y tareas: `r3-tienda-encargo-texto200-390.png`, `r3-tienda-resumen-texto200-390.png`, `r3-tienda-retiro-390.png`.

## Mi club — PASS

La credencial continúa como protagonista y conserva el acceso al pase y al café de hoy. El nombre y la membresía tienen una jerarquía consistente; el acceso al saldo es secundario. La consulta del sello 2 revela visita y fecha, y el pase abre por teclado. Con movimiento reducido se observaron cero animaciones activas al abrirlo. La retícula de sellos se redistribuye a 200% sin cortar el contenido ni ensanchar la página.

Se detectó y corrigió una irregularidad adicional de acabado. En R3, a 913 px las tarjetas de beneficios apilaban arte y contenido con un rectángulo blanco amplio arriba a la derecha. En R4 forman una unidad horizontal: arte y contenido miden aproximadamente 165 y 328 px dentro de una tarjeta de 493 px y comparten altura. La relación entre símbolo, estado, título y acción vuelve a ser clara. A 200% en 390 px se conserva la composición apilada sin recortes. No queda una brecha concreta pendiente que impida el PASS. La fotografía pequeña del encabezado sigue siendo ambientación secundaria, sin desplazar la credencial.

Evidencia final: `r4-club-390.png`, `r4-club-913.png`, `r4-club-1440.png`, `r4-club-beneficios-detalle-913.png`, `r4-club-beneficios-texto200-390.png`. Evidencia de tareas: `r3-club-pase-390.png`, `r3-club-sello-390.png`, `r3-club-sellos-texto200-390.png`.

## Perfil — PASS

Identidad, edición y bebida favorita siguen componiendo una jerarquía propia. La fotografía de terraza conserva un encuadre intencional y no sustituye el nombre ni la acción. El acceso a la bebida abre el panel y enfoca ese campo, también desde teclado. No se guardaron cambios.

Las filas de cumpleaños y alergias refluyen con texto duplicado; el enlace de edición conserva su identificación, el texto de alergias se puede leer y no se genera desborde horizontal. El panel mantiene una superficie opaca, controles explícitos y foco visible.

Mayor distancia residual: la fotografía tiene un peso considerable en escritorio para una tarea de preferencias. Una futura fotografía personal o una expresión más propia de la identidad podría aportar más sentido; no se exige para aprobar el mecanismo actual.

Evidencia final: `r4-perfil-390.png`, `r4-perfil-913.png`, `r4-perfil-1440.png`. Evidencia de tareas: `r3-perfil-preferencias-390.png`, `r3-perfil-preferencias-texto200-390.png`.

## Alcance de verificación

Edge propio en modo headless. Se inspeccionaron 390×844, 913×1000 y 1440×1000, además de 320×844, siempre con gutter estable de 15 px. Se repitieron los cuatro anchos y el texto al 200% sobre la compilación final R4. No se observó desborde horizontal ordinario en las tres piezas. A 200% y 390 px las tres conservaron 375 px útiles. Métricas finales en `r4-metrics.json`; se conservan `r3-metrics.json` y `r3-text200-metrics.json`.

Se comprobaron tareas locales de ficha, encargo, pase, sellos y preferencias durante R3; R4 añadió la revalidación visual de la composición final y el reflujo. No se pagó, canjeó, envió un mensaje, guardó perfil ni modificó una renovación. El aviso compartido de intento sin cobro se mantuvo intacto y no se convirtió en un hallazgo de oficio. Las capturas finales llevan prefijo `r4-`; las de tareas y evolución llevan `r3-`.
