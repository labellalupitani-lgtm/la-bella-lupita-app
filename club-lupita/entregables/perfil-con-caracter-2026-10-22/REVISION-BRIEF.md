# Revisión independiente de Brief — R1

Encargo juzgado: «mejora radicalmente el diseño, cumpleaños se ve aburrido y otras cosas también». Se evalúa si el cambio responde al encargo y conserva información y acciones comprensibles. La calidad estética frente a la referencia corresponde al crítico de Craft.

## Veredictos

| Pieza | Veredicto | Fundamento verificable |
| --- | --- | --- |
| Preferencias / celebración | **PASS** | Cumpleaños ya no aparece como la fila secundaria de la versión anterior: tiene una tarjeta propia, una fecha protagonista y una ilustración. Bebida y alergias también cambian de presentación; los datos y las acciones siguen reconocibles. |
| Identidad / movimiento | **PASS** | Nombre, edición de perfil y las tres pestañas mantienen una jerarquía reconocible. En la primera vista inicial de 390 px se ve la acción de bebida. El foco visible del editor y la continuidad de borradores tienen evidencia; el movimiento se sustenta solamente en las mediciones registradas. |
| Cuenta / datos / ayuda | **PASS** | Saldo, movimientos y Club conservan su separación semántica. Datos de acceso, consentimiento, privacidad, sesiones y ayuda siguen teniendo accesos identificables. El tratamiento en bloques responde también al pedido de intervenir «otras cosas». |

No hay un bloqueante de Brief en esta ronda. Estos veredictos no sustituyen las revisiones de System y Craft.

## Observado en las capturas

- En `gusto-1440-inicial-completo.png`, la fecha guardada se lee «14 de septiembre». No se anuncia un regalo ni una recompensa. La comparación con `../perfil-a-tu-manera-2026-10-22/pruebas-r3/gusto-1440-inicial-completo.png` confirma una modificación de composición y protagonismo, no únicamente un cambio de texto.
- En `cumple-sin-fecha-390-completo.png`, «Tu día, a tu manera» se acompaña de «Añadí tu fecha · opcional». No aparece una fecha inventada. El estado «Guardado» comunica la persistencia de ese estado vacío; el llamado a añadir fecha resuelve su significado.
- En `cumple-febrero-390-completo.png`, «29 de febrero» aparece completo y legible, con confirmación de guardado. No se muestra un año ni una edad inferida.
- La foto de bebida está rotulada «Un momento en la casa». Se ve junto a preferencias distintas, como «Chocolate caliente» y «Cacao con canela», sin afirmar que la imagen reproduce esa bebida concreta. «Cambiar mi preferencia» mantiene la acción explícita. Cumpleaños usa una flecha de acceso consistente; alergias mantiene «Editar» y el aviso de confirmar con quien atiende.
- `editor-bebida-390-borrador-completo.png` muestra el campo focal, «Guardar cambios», el acceso a editar todos los datos y la explicación de que cerrar conserva el borrador mientras se esté en Perfil.
- Las capturas de cuenta presentan `C$ 9,900`, movimientos de `−C$ 100` y `+C$ 10,000`, y `510 pts` en un bloque distinto. No se confunden dinero y puntos. A 320 px con texto al 200 %, los importes revisados conservan los dígitos completos.
- Datos y ayuda muestran el estado de promociones, el cambio de preferencia, privacidad, sesiones y el acceso a consulta. La captura de solicitud confirmada distingue «Pendiente de atención» de la confirmación de registro; no promete resolución inmediata.
- Los nombres y bebidas largos revisados refluyen sin fragmentar las palabras comunes. En 320 px con nombre largo la cabecera requiere desplazamiento; el acceso inmediato a la acción protagonista está demostrado para el caso inicial de 390 px, no para todos los casos extremos.

## Comportamiento: evidencia registrada, no inferida de PNG

`pruebas-r1/resultados.json` registra diez comprobaciones correctas: navegación por teclado, devolución del foco, confirmación tras respuesta real, edición focal, validación, revisión de borradores, separación entre dinero/puntos/sellos, continuidad de ayuda, reflujo y ausencia de efectos externos. Registra cero errores y cero llamadas externas.

El indicador tiene muestras de posición desde `x=0` hasta `x=116`; la medición de movimiento reducido registra transición `0s`, animación `0s` y cero animaciones activas. Esto respalda el comportamiento declarado por la prueba. Las capturas estáticas no permiten observar movimiento, suavidad ni respuesta temporal, y esta revisión no afirma haberlos visto.

Las anchuras de documento y cuerpo registradas coinciden con 320, 390, 768 y 1440 en las tres pestañas, a tamaño normal y texto al 200 %. El resultado automatizado se tomó como evidencia complementaria, no como sustituto de la revisión visual. Las barras fijas aparecen superpuestas en algunas capturas de página completa; esas imágenes por sí solas no demuestran una obstrucción permanente durante el desplazamiento.

## Alcance

Se leyeron `bar.md`, las capturas citadas y otras capturas de cuenta/datos a 1440 y 390, preferencias a 768, casos extremos a 320 y el archivo de resultados. No se leyó implementación ni se operó la aplicación. No se enviaron solicitudes, no se guardaron datos ni se realizaron acciones de compra. La única escritura de esta revisión es este informe.

---

# Revalidación independiente de Brief — R2

Se conserva R1 como registro. Esta ronda se basa en `pruebas-r2/`, sin leer implementación ni operar la aplicación.

| Pieza | Veredicto R2 | Evidencia de esta ronda |
| --- | --- | --- |
| Preferencias / celebración | **PASS** | `gusto-1440-normal-completo.png` conserva cumpleaños protagonista y una fecha completa. La bebida larga dispone de una línea de lectura más ancha y coloca la foto secundaria debajo, también en `gusto-320-normal-completo.png`. «Un momento en la casa» conserva el carácter ambiental de la foto. `cumple-febrero-390-completo.png` y `cumple-sin-fecha-390-completo.png` muestran respectivamente «29 de febrero» y «Añadí tu fecha · opcional», sin fecha inventada ni recompensa prometida. |
| Identidad / movimiento | **PASS** | La cabecera sin foto permite más ancho al nombre largo, que se lee completo en las muestras de 320 y 1440. `gusto-390-inicial-viewport.png` conserva nombre, edición, pestañas y acción de bebida antes de la navegación inferior. `editor-bebida-390-borrador-viewport.png` conserva foco visible, guardar, cerrar y acceso a todos los datos. El movimiento se confirma exclusivamente mediante las mediciones registradas. |
| Cuenta / datos / ayuda | **PASS** | `cuenta-1440-inicial-completo.png` mantiene separados saldo, movimientos monetarios y puntos. `cuenta-320-texto200-saldo.png` conserva `C$ 9,900` íntegro. `datos-320-texto200-completo.png` muestra completo el teléfono `50587442005`, el consentimiento, los accesos a privacidad/sesiones y la ayuda. El selector inicial «Elegí…» tiene la etiqueta visible «Motivo», por lo que conserva contexto sin truncar una instrucción larga. |

**Sin bloqueantes de Brief en R2.** La nueva disposición mejora la lectura del caso largo sin quitar los elementos que responden al encargo. Sigue vigente el límite de R1: no se promete que una bebida y un nombre largos permitan alcanzar la acción principal sin desplazamiento en 320 px.

`pruebas-r2/resultados.json` vuelve a registrar **10/10** comprobaciones correctas, cero errores y cero llamadas externas. Las mediciones incluyen cambios de matriz ante el puntero para bebida y cumpleaños, además del desplazamiento del indicador; el modo de movimiento reducido registra transición `0s`, animación `0s` y cero animaciones activas. Las capturas no muestran ese movimiento y no se utilizan para afirmarlo. Las anchuras de documento y cuerpo registradas coinciden con los cuatro tamaños evaluados a texto normal y al 200 %.

La revalidación solo añadió este apartado al informe; no produjo envíos, guardados de perfil ni acciones de compra.
