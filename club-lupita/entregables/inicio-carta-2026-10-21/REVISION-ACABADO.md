# Revisión independiente de acabado visual

**Resultado final: PASS. Trayectoria: FAIL → PASS.**

## Ronda 2 — corrección aprobada

Revalidación del render en 390 × 844 y 1440 × 900. El encuadre del risotto ahora conserva la flor superior, las capas de alimento, la base de arroz y una parte amplia de la bandeja. El fondo de sillas queda reducido a una franja secundaria. El producto vuelve a ocupar el centro de atención y se reconoce entero dentro de la tarjeta.

Las tres tarjetas mantienen tamaños, alineación de nombres y precios y continuidad visual. La pizza y el postre conservan su presencia gastronómica. El defecto que bloqueó la primera revisión queda resuelto, con la misma fotografía y sin alterar el ritmo de la sección.

- [Escritorio: las tres tarjetas corregidas](evidencia/acabado/ronda2/1440-tarjetas.png).
- [Móvil: risotto corregido](evidencia/acabado/ronda2/390-risotto.png).
- [Móvil: pizza](evidencia/acabado/ronda2/390-pizza.png) y [postre](evidencia/acabado/ronda2/390-postre.png).

El alcance de esta ronda es el recorte corregido y su coherencia con las otras tarjetas. Los hallazgos favorables de apertura y jerarquía de la ronda 1 siguen siendo la base del veredicto global de acabado. La aprobación del usuario es posterior.

## Ronda 1 — FAIL conservado como evidencia

La apertura y la jerarquía gastronómica alcanzan la dirección pedida. El acabado de la carta aún falla por el encuadre de la tarjeta **Risotto de Gallo Pinto**, tanto en móvil como en escritorio.

## Mayor brecha

La imagen del risotto dedica aproximadamente la mitad superior del cuadro a sillas y fondo del local, mientras el borde inferior corta la base del alimento y prácticamente todo el plato. La elección se presenta como una foto de ambiente con comida recortada. En las referencias, el producto se reconoce como objeto completo y el espacio circundante refuerza su presencia. Aquí ese mecanismo se pierde justo en una de las tres tarjetas principales de la carta.

- [Escritorio: las tres tarjetas](evidencia/acabado/1440-tarjetas.png). La pizza y el postre ocupan el cuadro; el risotto queda arrinconado abajo.
- [Móvil: risotto](evidencia/acabado/390-risotto.png). La base del producto desaparece bajo la franja de nombre y precio, y el fondo sigue dominando la mitad superior.

**Corrección que permite reevaluar:** orientar el encuadre del risotto hacia la parte inferior de su fotografía, conservando el alimento y una porción legible del plato. Igualar su presencia visual a la pizza y al postre. Mantener el tamaño generoso y el ritmo actual de las tarjetas.

## Lo que sí alcanza la barra visual

- **390 × 844:** la fotografía comienza aproximadamente en y=250, antes del límite y=360, con unos 227 px de imagen visibles. Sándwich, papas y plato se reconocen completos. El pase permanece visible y la acción «Explorar la carta» entra en el primer pantallazo. [Captura](evidencia/acabado/390-viewport.png).
- **320 × 568:** la fotografía comienza aproximadamente en y=232 y muestra comida reconocible antes de la navegación inferior. «Mostrá tu pase» permanece visible. [Captura](evidencia/acabado/320-viewport.png).
- **1440 × 900:** la foto ocupa aproximadamente 730 × 463 px y domina la portada junto al titular. Conserva los cuatro lados del plato y el volumen del sándwich; el recorte evita el efecto de una franja panorámica. [Captura](evidencia/acabado/1440-viewport.png).
- La secuencia portada gastronómica → productos → accesos → cuenta y sellos tiene un ritmo claro. Los bloques de cuenta ya no interrumpen la invitación a comer. [Página completa móvil](evidencia/acabado/390-completa.png), [página completa escritorio](evidencia/acabado/1440-completa.png).
- La tipografía, el fondo cálido, los bordes y el acento de acción mantienen continuidad entre portada y carta. La pizza y Dulce Tentación usan bien la superficie de imagen, con nombres y precios legibles y subordinados al producto. [Postre en móvil](evidencia/acabado/390-postre.png).

## Método y alcance

Revisión del render local `http://127.0.0.1:5190/__preview/entrar`, con datos sintéticos, capturas propias y aviso de preview visible al abrir. Comparación con `bar.md` y las dos referencias gráficas suministradas. Evaluación del mecanismo visual de protagonismo, encuadre, jerarquía y ritmo; la decisión corresponde exclusivamente al acabado visual en el estado normal. La aprobación del usuario sigue siendo posterior.

Fecha: 21 de octubre de 2026.
