# Revisión independiente de marca y legibilidad — sexta composición de Inicio

Fecha: 21 de octubre de 2026. Compilación examinada: `http://127.0.0.1:5190/__preview/entrar`, con datos locales sintéticos. **Dictamen final: PASS**, después de revalidar la segunda corrección compilada. No quedan incumplimientos abiertos en este alcance. No equivale a aprobación humana del diseño.

## Base y método

Se leyó `MARCA.md` y se inspeccionaron los renders originales de las páginas 11, 12, 16, 20 y 28. Se revisaron únicamente la interfaz renderizada, imágenes entregadas al navegador, geometría y estilos calculados del DOM. No se leyó implementación TSX/CSS ni explicaciones del constructor. Las capturas preliminares del constructor sirvieron de orientación; los dictámenes se basan en capturas propias de la compilación 5190.

Pruebas en Chromium, escala de dispositivo 1: 320 × 844, 390 × 844 y 1440 × 1000. Para texto al 200 %, se guardó el `font-size` calculado de cada elemento y se aplicó el doble, excluyendo la asignación directa a Material Symbols, sin zoom general ni cambio de imágenes o viewport. Se esperaron 100 ms adicionales para estabilizar el nuevo layout. El procedimiento se conserva en [auditar-render.mjs](./evidencia/marca/auditar-render.mjs). Se recorrieron controles con Tab y se registraron contornos y sombras de foco. El alcance es Inicio; no certifica disponibilidad, precios ni datos comerciales reales.

Las reglas expresas examinadas son integridad y proporción de la firma, reserva H/4, separación de texto y firma, color maestro, roles Playfair/Montserrat y conservación del color de alimentos. Los 280/320 px de firma y rangos tipográficos de la p.20 son **propuestos**: no se han convertido en umbrales obligatorios. Los neutros de interfaz y adaptación responsive son decisiones de producto, no reglas históricas del manual.

## Hallazgos corregidos y revalidados

1. **FAIL — el foco invade la reserva de la firma.** En la primera compilación 5190 la sombra borgoña se dibuja a 2–4 px del logo. La firma móvil mide 120 × 57 px; necesita 14,25 px de reserva. En escritorio mide 144 × 68,39 px; necesita 17,10 px. La primera corrección añadió un contorno exterior de 15/18 px, pero conservó la sombra interior, como se observa en [320](./evidencia/marca/revalidacion-logo-foco-320.png) y [1440](./evidencia/marca/revalidacion-logo-foco-1440.png). En 320, el salto de la cabecera a dos filas también dejó solo 12 px entre la firma y el borde de «Mostrá tu pase». Pasos: abrir Inicio al ancho indicado y pulsar Tab hasta la firma. Impacto: el estado de teclado contradice la reserva expresa de la p.12. Corrección: retirar la sombra interior, mantener un foco visible fuera de H/4 y separar suficientemente la fila de controles.

2. **FAIL — las etiquetas de navegación se fragmentan con texto al 200 %.** A 320 px aparecen «Inici / o», «Cart / a», «Tien / da», «Mi / Clu / b» y «Perf / il». En 390 también se parten palabras. [Evidencia a 320](./evidencia/marca/final-texto200-superior-320.png). No existe desbordamiento horizontal global, pero la ausencia de scroll horizontal no demuestra legibilidad. Pasos: aplicar el método de ampliación descrito y observar la barra inferior. Impacto: los destinos persistentes exigen reconstruir palabras. Corrección: permitir que los enlaces refluyan por su ancho intrínseco y conservar palabras completas, sin reducir el texto ampliado.

3. **FAIL — resolución entregada insuficiente para el risotto de escritorio.** El bitmap servido mide 283 × 480 px, aunque `naturalWidth` ajustado por `srcset` reporta 226 px. Se pinta a 389,33 × 222,47 px con `cover`: amplía 1,376 veces su ancho real. La pérdida de definición se aprecia frente a las fotografías vecinas. La recomendación de producción recogida en MARCA §7, pp.59–60, pide dimensiones de uso y evitar ampliar imágenes pequeñas. Corrección: entregar una variante con suficiente ancho útil para ese recorte; no confundir el lado largo vertical con ancho disponible.

Los tres FAIL anteriores describen las rondas previas. Su estado de cierre es **PASS**:

- **Reserva y foco:** el DOM final muestra `box-shadow: none` y contorno de 2 px con offset de 15 px en móvil y 18 px en escritorio. Ambos superan H/4 (14,25 y 17,10 px). En 320, la fila de controles queda a 18 px de la firma. Se inspeccionó el foco tanto con texto normal como al 200 %. Evidencia: [320 normal](./evidencia/marca/cierre-320-logo-foco.png), [390 al 200 %](./evidencia/marca/cierre-390-texto200-logo-foco.png) y [1440 normal](./evidencia/marca/cierre-1440-logo-foco.png).
- **Navegación ampliada:** en 320 y 390 las cinco etiquetas siguen a 24 px, cada una ocupa una sola línea y los enlaces se distribuyen en dos filas, tres más dos. Las palabras permanecen completas. No hay desbordamiento horizontal de página. Evidencia: [320 al 200 %](./evidencia/marca/cierre-320-texto200-viewport.png), [390 al 200 %](./evidencia/marca/cierre-390-texto200-viewport.png) y las cajas de línea registradas en [cierre-render.json](./evidencia/marca/cierre-render.json).
- **Risotto:** en 1440 se entrega el bitmap de 567 × 960 px para un área de 389,33 × 222,47 px. Ya no necesita ampliar el ancho del archivo. En móvil se entrega una imagen de 240 px de ancho para aproximadamente 150,5 px de presentación. Se conserva el encuadre y el color. Evidencia: [escritorio final](./evidencia/marca/cierre-1440.png) y dimensiones de bitmap en `cierre-render.json`.

## Resultados restantes

| Criterio | Dictamen | Evidencia observada |
|---|---|---|
| Integridad y proporción del logo | PASS | Retrato, lettering y descriptor forman la misma unidad; relación aproximada 2,11; `contain`, sin filtro ni transformación. El ancho menor al mínimo propuesto no se registra como incumplimiento automático. |
| Tipografía y jerarquía | PASS | Titulares y nombres de platos en Playfair; datos, acciones y precios en Montserrat. Las familias están cargadas. Foto y llamada a la carta preceden al estado del club. Los precios tienen peso y posición consistentes. |
| Color y fotografía | PASS | Cacao `#53291E`, borgoña `#B60032` y rosa `#F9AFA4` conservan sus funciones; marfil y tinta secundaria se tratan como colores de interfaz. Verdes, huevo, fruta y café conservan color diferenciado; no hay filtro CSS ni texto sobre los alimentos. |
| Contraste textual | PASS | Todos los pares sólidos examinados superan 4,5:1; el menor es 5,427:1. No se redondea un valor inferior al umbral para aprobarlo. |
| Contraste del foco | PASS | Borgoña sobre superficies claras: 5,785–6,810:1. En campos cacao, el anillo claro aporta 11,457:1. El problema señalado del logo es ubicación del foco, no falta de contraste. |
| Anchos normales 320/390/1440 | PASS | No hay desbordamiento horizontal de la página. El carrusel móvil conserva desplazamiento propio y permite ver los productos sucesivos; los cortes parciales corresponden a ese contenido desplazable. |
| Texto al 200 % | PASS | Refluye en 320/390/1440 sin pérdida de texto examinada. Las etiquetas móviles permanecen completas; en escritorio «Mi Club» puede ocupar dos líneas por la separación entre palabras. |

Contrastes recalculados en el cierre desde estilos reales y fondos sólidos, sin opacidades de grupo: [cierre-contrastes.json](./evidencia/marca/cierre-contrastes.json). CTA marfil/borgoña: 6,431:1; cacao/marfil: 11,457:1; cacao/rosa: 6,865:1; tinta secundaria sobre rosa claro: 5,427:1. Los cálculos no usan colores muestreados de la lámina JPG.

## Registro de rondas

| Ronda | Evidencia | Resultado |
|---|---|---|
| Preliminar 5188 | `preliminar-*` | Detectada invasión del foco; pendiente comprobar build final. |
| Primera compilación 5190 | `final-*` | Confirmados foco, fragmentación al 200 % y resolución insuficiente del risotto. |
| Primera corrección de foco 5190 | `revalidacion-foco-*`, `revalidacion-logo-foco-*` | FAIL en aquella ronda: persistió sombra interior y surgió separación vertical de 12 px a 320. |
| Segunda corrección compilada 5190 | `cierre-*` | PASS: foco sin sombra invasiva, separación de 18 px, palabras completas al 200 % y risotto con resolución suficiente. |

La mayor brecha normativa detectada fue la reserva de firma en el estado de foco; la mayor brecha de lectura fue la navegación ampliada. Ambas quedaron corregidas y revalidadas sin interpretar los mínimos propuestos como reglas absolutas. La revisión técnica no decide la preferencia humana por esta composición.
