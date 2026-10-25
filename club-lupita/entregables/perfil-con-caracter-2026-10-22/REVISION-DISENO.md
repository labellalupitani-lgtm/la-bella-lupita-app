# Revisión independiente Craft

**Dictamen vigente: R2 PASS en las tres piezas.** La revisión de R1 se conserva a continuación; la reevaluación de R2 está al final.

## Ronda 1

Veredicto global: **FAIL**. Hay un cambio real en la composición de preferencias, especialmente cumpleaños y alergias. Todavía no supera la barra en los estados exigentes de texto y ancho. Añadir foto, bordes y fondos no resuelve por sí solo la jerarquía de esos estados.

Evaluación limitada a `bar.md`, PNG de `pruebas-r1/`, PNG comparables de `../perfil-a-tu-manera-2026-10-22/pruebas-r3/` y `../investigacion-diseno-2026-10-21/evidencia/comparacion-referencias.png`. No leí implementación ni resultados de pruebas. No realicé acciones en la aplicación. Los PNG permiten juzgar composición, estados visibles y reflujo; no demuestran animación, hover, navegación por teclado ni persistencia.

## Dictamen por pieza

| Pieza | Veredicto | Mayor defecto concreto |
| --- | --- | --- |
| Preferencias / celebración | **FAIL** | La foto mantiene una columna lateral demasiado ancha frente a una preferencia larga. En `gusto-390-normal-completo.png`, el título queda en una franja de aproximadamente 150 px y crece en numerosas líneas cortas; «almendras,», «disfrutar» y «terraza» quedan como renglones aislados. La referencia agrupa imagen, nombre y decisión como una unidad legible; aquí el texto libre se trata como un titular de cartel incluso cuando tiene un párrafo de extensión. |
| Identidad / movimiento, solo aspecto visible | **FAIL** | En `gusto-768-texto200-completo.png`, la foto ambiental de cabecera ocupa una fila propia después de «Editar mi perfil», separada del nombre, y añade altura sin información personal. Es una pieza decorativa aislada que debilita la cabecera compacta del mecanismo 4. |
| Cuenta / datos / ayuda | **FAIL** | En `datos-768-texto200-completo.png` el teléfono se divide en «505874420» y «05». La captura equivalente anterior lo mantiene íntegro. El grupo de acceso conserva dos columnas demasiado estrechas dentro de la nueva tarjeta; incumple directamente el mecanismo de números íntegros. |

## Comparación por mecanismo de la barra

1. **Cumpleaños: gana la composición nueva.** La fecha grande, el mes y el pastel construyen una pieza reconocible; la anterior era una fila utilitaria. En `cumple-sin-fecha-390-completo.png`, «Tu día, a tu manera» y «Añadí tu fecha · opcional» expresan el vacío sin inventar fecha ni regalo. La proporción de número y pastel en 390 y 1440 es clara. No es solo una fila decorada.

2. **Bebida: gana la nueva con texto corto; gana la anterior para el reparto de ancho con texto largo.** `gusto-1440-inicial-completo.png` presenta una composición de imagen y título más tangible que el icono previo. La leyenda «Un momento en la casa» ayuda a leer la fotografía como ambiente. Sin embargo, el recorte ovalado reserva una gran franja junto al texto largo en 390 y 1440; el aumento de volumen visual empeora la lectura del dato. La referencia de producto conserva una silueta y una relación breve entre imagen, nombre y controles. La nueva todavía no logra esa economía cuando la preferencia es extensa.

3. **Jerarquía de preferencias: gana la nueva.** En 1440, bebida grande, cumpleaños rosa y alergias independiente forman una composición asimétrica explícita. La alerta de alergias ya no compite como otra fila pequeña. En móvil se apilan y no hay un carrusel representado. La mejora estructural es comprobable, aunque debe corregirse la composición interna de bebida.

4. **Cabecera y escalas: empate insuficiente.** Nombre, fecha de alta, acción y posición general son prácticamente los mismos. El aro rosa del monograma, la inclinación de la foto y las mayúsculas de «A TU MANERA» son decoración; no compactan la cabecera. La anterior ofrece una foto algo menos recortada; la nueva no usa esa foto para reforzar la identidad del socio. Ambas conservan una fila aislada de fotografía ambiental a 768/200 %. Las familias visuales serif/sans y los colores sí mantienen coherencia.

5. **Estado activo y foco: evidencia visible suficiente, movimiento sin evaluar.** El indicador cacao de pestaña se distingue con claridad; `editar-foco-320-texto200-viewport.png` representa un foco borgoña inequívoco. No asigno superioridad de movimiento a ninguna versión a partir de imágenes estáticas.

6. **Cuenta, datos y ayuda: gana la nueva en jerarquía normal; la anterior gana en integridad del teléfono a 768/200 %.** El saldo cacao y el bloque rosa del Club diferencian dinero y membresía. Los grupos de acceso, consentimientos y ayuda se reconocen mejor como unidades. Saldo y movimientos inspeccionados conservan sus cifras, también en `cuenta-320-texto200-saldo.png` y `cuenta-768-texto200-saldo.png`. La nueva envolvente de acceso sacrifica ancho útil y produce la regresión numérica indicada. Consentimiento y solicitud pendiente siguen visibles. El editor de borrador conserva una jerarquía clara de campo, guardado y cierre en `editor-bebida-390-borrador-viewport.png`.

7. **Reflujo: ninguna gana de forma completa.** A 390/1440 con contenido corto, la nueva supera la monotonía anterior. La primera vista inicial representativa de 390 muestra identidad, navegación de Perfil y «Cambiar mi preferencia»: cumple ese criterio. A 320/200 % se lee el contenido en una columna y no se fragmentan las palabras comunes observadas; no exijo que el nombre largo y la tarjeta completa quepan simultáneamente en ese estado extremo. A 768/200 %, la identidad se separa en filas y Datos mantiene columnas demasiado estrechas. No interpreto la barra fija situada a mitad de una captura completa como una obstrucción permanente: esa posición es propia de la captura de una página con elemento fijo.

## Cambios necesarios para otra ronda

- Dar a la preferencia larga un ancho de lectura mayor y una escala distinta del titular corto; reubicar la foto cuando empiece a comprimir el dato. Conservar la pieza de cumpleaños y el bloque de alergias.
- Evitar que la foto ambiental de cabecera genere una fila suelta. Eliminar esa pieza redundante es una solución válida ahora que la tarjeta de bebida ya aporta fotografía. No basta con reducir ligeramente la foto ni cambiar su borde.
- Refluir el contenido de acceso antes de partir números: el teléfono debe permanecer como unidad legible a 768 con texto al 200 %.

La nueva dirección merece continuar, pero los tres fallos anteriores impiden aprobar la ronda.

## Ronda 2 — reevaluación visual

**Veredicto global R2: PASS.** Comparé las capturas equivalentes de `pruebas-r2/` con R1 y con la versión sobria anterior. Las tres correcciones cambian el reparto de espacio y la jerarquía; no dependen de adornos nuevos. No leí implementación, scripts de captura ni resultados de pruebas.

| Pieza | Veredicto R2 | Evidencia de cierre |
| --- | --- | --- |
| Preferencias / celebración | **PASS** | En `gusto-390-normal-completo.png`, la preferencia larga ocupa el ancho de la tarjeta y se lee en cinco líneas, en vez de la columna estrecha de R1. La foto queda debajo, con una escala secundaria y junto a la acción. En `gusto-1440-normal-completo.png`, el mismo dato se organiza en tres líneas y ya no compite lateralmente con la imagen. |
| Identidad / movimiento, solo aspecto visible | **PASS** | En `gusto-768-texto200-completo.png` y `editar-foco-320-texto200-viewport.png`, «Editar mi perfil» conduce directamente a las pestañas: desaparece la fila fotográfica aislada. Nombre y monograma conservan la identidad. `gusto-390-inicial-viewport.png` sigue mostrando identidad, pestañas y la acción «Cambiar mi preferencia» en la primera vista representativa. |
| Cuenta / datos / ayuda | **PASS** | `datos-768-texto200-telefono-visible.png` muestra el teléfono completo en una sola línea, con separación de la etiqueta. El acceso ocupa una columna suficientemente amplia; la captura específica permite ver el renglón que la barra fija tapaba en la captura completa. `datos-320-texto200-completo.png` también conserva el número entero. |

### Composición y comparación

La pieza de bebida ahora distingue entre un nombre corto y un dato largo: las capturas iniciales de 390/1440 mantienen el protagonismo de fotografía y título breve; las capturas con preferencia extensa convierten el texto en un bloque de lectura y dejan la imagen en segundo plano. Esta separación resuelve el mayor defecto de R1 y supera la proporción del icono ampliado de la versión anterior. A 320/200 % el contenido crece verticalmente sin invadir otra columna; a 768/200 % conserva el ancho de lectura. No se requiere que el caso de nombre y bebida largos al 200 % quepa en una sola pantalla.

Cumpleaños conserva la composición de día grande, mes e ilustración; `cumple-sin-fecha-390-completo.png` sigue ofreciendo un estado vacío explícito. Alergias mantiene un bloque independiente con dato, advertencia y edición visibles. Las piezas siguen siendo distintas por función y escala, en lugar de una colección de filas administrativas. La fotografía ambiental está concentrada en la tarjeta donde aporta contexto, y la cabecera queda más directa.

Cuenta mantiene el contraste entre saldo cacao, actividad y membresía rosa en `cuenta-390-normal-completo.png` y `cuenta-1440-normal-completo.png`. Las capturas específicas de saldo a 320/200 % y 768/200 % muestran `C$ 9,900` íntegro. Datos conserva acceso, consentimiento y solicitud pendiente reconocibles en 390/1440; la composición se apila con suficiente ancho al 200 %. El campo de motivo tiene una indicación breve legible. `editor-bebida-390-borrador-viewport.png` mantiene la separación visual entre campo enfocado, guardado y cierre.

El indicador activo y el foco continúan representados con claridad. **Este PASS de identidad cubre únicamente el aspecto visible; no certifica movimiento, hover ni comportamiento a partir de PNG.**

No queda un defecto mayor de composición en los estados revisados que justifique otra ronda Craft. Como refinamiento menor, en `datos-390-normal-completo.png` podría aumentarse la separación entre «Teléfono de contacto» y su valor; ambos se leen íntegros y esto no bloquea el PASS.
