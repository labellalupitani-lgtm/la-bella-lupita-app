# Revisión independiente de marca — Perfil «A tu manera»

Fecha: 22 de octubre de 2026. Revisión R1 sobre render y artefactos de prueba. No se leyó ni se modificó la implementación de la app.

**Estado final R3: PASS en las tres piezas.** La revisión R1 fallida se conserva a continuación. La evidencia y el cierre de sus hallazgos están al final de este documento.

Referencias: `design-system.md` y `bar.md` de esta entrega. Evidencia: PNG de `pruebas-r1` en 390 y 1440, editor focal y capturas de texto al 200 % en 320 y 390. Las mediciones de `resultados.json` se distinguen del juicio visual; una captura fija no demuestra movimiento ni el momento de una confirmación.

## R1 — resultado conservado

| Pieza | Resultado | Evidencia y condición |
| --- | --- | --- |
| Identidad y preferencias | **FAIL** | A 390 × 844 y texto normal, nombre, pestañas, bebida y «Cambiar mi preferencia» están en la primera pantalla. A 1440, la bebida domina sobre cumpleaños y alergias. Sin embargo, `gusto-390-texto200-viewport.png` conserva el nombre en una columna estrecha entre inicial y terraza: aparecen «Fernand / a» y «Gonzále / z». En `editar-foco-320-texto200-viewport.png`, «Tu cuenta» se divide como «Tu / cuent / a». Falta un reflujo que conserve las palabras y dé ancho de lectura al nombre. |
| Edición y movimiento, aspecto visual | **PASS** | `editor-bebida-390-viewport.png` muestra un solo campo, foco borgoña visible, límite de caracteres, guardado, cierre y acceso al editor completo. La selección cacao distingue las pestañas en los tres paneles. El movimiento no se deduce de estos PNG: `resultados.json` registra desplazamiento del indicador de x=0 a x=116 en unos 233 ms y, con movimiento reducido, transición/animación de 0 s y cero animaciones activas. El momento real de la confirmación corresponde a la prueba funcional, no a este juicio visual. |
| Cuenta, datos y ayuda | **FAIL** | El saldo C$ 9,900 conserva unidad y cifra sin fragmentación en 390 normal y en las capturas de saldo al 200 % de 320/390. Compras, historial y Club están separados. Los datos distinguen correo ausente, verificación, teléfono y consentimiento; la ayuda diferencia solicitudes existentes de «Una nueva consulta». La captura `cuenta-1440-inicial-viewport.png`, sin embargo, presenta «Historial de puntos» con «-C$ 100» bajo «Últimos movimientos de dinero». Ese rótulo hace ambigua la unidad del movimiento. Si procede de la fixture sintética, debe corregirse esa evidencia y conservarse esta observación como fallo de contenido de la fixture. |

## Rasgos de marca comprobados visualmente

- La combinación cacao, papel/crema, rosa y acento borgoña se mantiene en los tres paneles. Los títulos serif y la lectura sans son visualmente coherentes con Playfair Display y Montserrat; esta revisión de PNG no certifica nombres de archivos de fuente ni valores exactos de tokens.
- La foto de terraza ocupa un área secundaria. La taza es un símbolo genérico; no añade empaque, precio, ingredientes, atributo de café ni una promesa de producto al texto libre «Chocolate caliente».
- Cumpleaños y alergias tienen espacio propio. La advertencia «Avisá y confirmá tus alergias con quien te atiende antes de pedir» es legible y conserva el alcance operativo.
- Los botones, bordes selectivos, títulos serif y controles redondeados mantienen continuidad visual desde preferencias hasta ayuda.

## Cambios concretos para cerrar R1

1. En anchuras estrechas con texto al 200 %, colocar nombre y foto de modo que la foto no reserve una columna lateral que fuerce cortes dentro del nombre. Mantener el nombre completo mediante reflujo y desplazamiento vertical.
2. Dar a las pestañas una distribución que admita palabras completas al 200 % en 320 px. La comprobación debe incluir «Tu cuenta» con foco visible.
3. Corregir el rótulo monetario «Historial de puntos» en la evidencia sintética o demostrar su contexto. No aprobar separación semántica mientras el render revisado mezcle ese nombre con una cantidad en C$.

Las capturas de página completa contienen la navegación fija superpuesta a su posición de viewport. No se ha interpretado esa superposición, por sí sola, como pérdida permanente de contenido ni como fallo de scroll.

## R3 — revisión final independiente

Se inspeccionaron las capturas de `pruebas-r3`, incluidas las vistas iniciales de 390 y 1440, el borrador del editor de bebida, el foco a 320 con texto al 200 %, nombres y bebidas largos a 320/390/768 con texto al 200 %, saldo ampliado a 320/390/1440 y datos/ayuda en sus estados vacío y con solicitud. No se leyó fuente de la app ni se realizaron compras, guardados o envíos durante esta revisión.

| Pieza | Resultado final | Evidencia y cierre |
| --- | --- | --- |
| Identidad y preferencias | **PASS** | `gusto-390-inicial-viewport.png` conserva nombre, pestañas, bebida y acción en la primera pantalla. `gusto-1440-inicial-viewport.png` mantiene la bebida como pieza dominante y la terraza como imagen secundaria. `gusto-390-texto200-viewport.png` da el ancho disponible al nombre: «Fernanda» y «González» ya no se cortan dentro de la palabra. `editar-foco-320-texto200-viewport.png` muestra «Tu / cuenta» con la palabra completa y el foco visible; `gusto-320-texto200-completo.png` mantiene bebida, acción, cumpleaños y alergias mediante reflujo vertical. La taza sigue siendo genérica y no inventa un producto. |
| Edición y movimiento, aspecto visual | **PASS** | `editor-bebida-390-borrador-viewport.png` muestra un solo campo, cierre, alcance del borrador, límite de caracteres y «Guardar cambios» en borgoña, con «Editar todos mis datos» como alternativa secundaria. No aparece confirmación de guardado en esta captura del borrador. La selección de pestaña y los focos mantienen el lenguaje cromático. La evidencia temporal se atribuye exclusivamente a `pruebas-r3/resultados.json`: el indicador pasa de x=0 a x=116 en aproximadamente 234 ms y la variante de movimiento reducido registra 0 s y cero animaciones activas. No se deduce esa conducta de PNG. |
| Cuenta, datos y ayuda | **PASS** | `cuenta-1440-inicial-viewport.png` presenta el movimiento como «Consumo en la casa · prueba», junto a −C$100, dentro de «Últimos movimientos de dinero». El vocabulario de puntos queda en el bloque Club. Las capturas `cuenta-320-texto200-saldo.png`, `cuenta-390-texto200-saldo.png` y `cuenta-1440-texto200-saldo.png` mantienen C$ 9,900 sin fragmentación. «Tus datos y mensajes» en `datos-320-texto200-completo.png` fluye en palabras completas. Los datos de acceso, estado de correo, promociones, privacidad y sesión se distinguen por etiquetas. La ayuda separa el estado vacío o las solicitudes de «Una nueva consulta» mediante texto y espacio. En `datos-390-confirmada-completo.png`, el motivo elegido se repite debajo del selector, haciendo legible su contenido completo aunque el control nativo sea estrecho. |

La corrección monetaria queda verificada visualmente en el render R3. El apartado `alcance` del resultado de pruebas documenta que el rótulo se aclara únicamente en GET `/api/yo` y `/api/actividad`, sin modificar el libro mayor; esta revisión de marca no realizó una auditoría independiente del libro mayor.

No quedan hallazgos visuales de marca que bloqueen estas tres piezas en la evidencia R3 inspeccionada. Se conservan los límites de alcance: las capturas no certifican por sí solas los valores exactos de tokens, los archivos de fuentes, los tiempos de respuesta ni las transacciones.
