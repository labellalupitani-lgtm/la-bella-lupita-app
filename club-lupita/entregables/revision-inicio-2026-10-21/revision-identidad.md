# Revisión independiente SYSTEM — identidad de Inicio

**Dictamen final: PASS, tras una corrección comprobada.** Fecha: 21 de octubre de 2026. No quedan fallas de identidad confirmadas en los estados examinados. Este dictamen no aprueba el diseño en nombre del usuario ni autoriza extenderlo al 100 % de la app.

## Alcance y método

Se contrastó `entregables/redisenio-2026-10-20/design-system.md` con el render compilado de `http://127.0.0.1:5190/__preview/entrar`, usando Chrome real y viewports efectivos de 320 × 812, 390 × 844 y 1440 × 1000. Se inspeccionaron capturas, árbol accesible, medidas y estilos computados del DOM; no se leyó implementación de la app. Se usaron exclusivamente la cuenta y datos sintéticos de la vista previa.

Se revisaron Inicio, navegación y los diálogos de pase y recarga. La fotografía se comparó visualmente con el render anterior en `http://127.0.0.1:5192/__preview/entrar`. El enlace de reglas abre Mi Club: esa pantalla queda fuera de este juicio.

## Historial de hallazgo y revalidación

**FAIL inicial — P2: saldo de recarga con una tercera familia tipográfica.** En Inicio → «Recargar en caja», la línea «Saldo: C$ 9,900» se mostraba en `Libre Caslon Text, Georgia, serif`, 24 px. Se confirmó en 320 y 390 px. El sistema exige Montserrat para números: el mismo saldo cambiaba de voz tipográfica entre la tarjeta de Inicio y su diálogo. Corrección solicitada: aplicar Montserrat a esa línea, manteniendo Playfair en el título del diálogo.

Evidencia anterior: [recarga-saldo-fuente-320.png](critic-identidad/recarga-saldo-fuente-320.png).

**Corrección revalidada — PASS.** Tras recibir la nueva compilación y recargar la entrada de la vista previa, se repitió la apertura en 1440, 390 y 320 px. En los tres anchos, «Saldo: C$ 9,900» computa `Montserrat Inicio, system-ui, sans-serif`, 24 px, y «Recargar en caja» mantiene `Playfair Display Inicio, Georgia, serif`, 30 px. La revisión solo registró la corrección: no modificó la app.

Evidencia corregida: [recarga-saldo-corregido-320.png](critic-identidad/recarga-saldo-corregido-320.png).

## Comprobaciones de identidad

| Criterio | Resultado observado |
| --- | --- |
| Tipografía | Playfair en titulares editoriales y de diálogos; Montserrat en cuerpo, navegación, importes y controles. Los rótulos funcionales «Tu cuenta de casa» y «Tu próxima visita» usan Montserrat. Las dos fuentes de Inicio aparecen cargadas desde `/fuentes/diseno/` del mismo origen. |
| Paleta y contraste | Cacao `#53291E`, rosa `#F9AFA4`, borgoña `#B60032` y fondo marfil `#FBF6EE` presentes. No se encontró coral como texto pequeño sobre claro. La medición de combinaciones de texto y fondo computados en Inicio dio un mínimo de 5,43:1, superior a 4,5:1. |
| Firma | Logo íntegro, sin filtro y con ajuste `contain`. Medidas: 100 × 47,5 px a 320; 118 × 56,05 px a 390; 280 × 132,13 px a 1440. La reserva vertical mínima observada ronda 12, 15 y 33,5 px respectivamente, compatible con H/4. La adaptación compacta de 100–118 px sigue siendo una propuesta pendiente de aprobación, no una nueva desviación. |
| Controles y foco | Los controles visibles de Inicio examinados alcanzan al menos 44 × 44 px; enlaces de navegación móvil, 72 px de alto en tamaño normal. Se comprobó foco por Tab en enlace de salto, logo y control del pase: anillo borgoña con separación marfil. Escape cerró el pase y devolvió foco al disparador. Los controles del pase y recarga alcanzan 44–48 px o más. La barra técnica de vista previa queda fuera del producto revisado. |
| Lenguaje | Voseo consistente en «Mostrá», «Hacé», «Tenés», «Consultá», «Conocé», «decí» y «querés». El texto visible de recarga explica la confirmación en caja sin prometer una operación automática. |
| Fotografía | Se conserva visualmente el desayuno del sándwich con huevo y papas y las fotografías de pizza, risotto y waffle respecto al render anterior de 5192. Esta comparación verifica conservación visual; no certifica derechos ni procedencia documental. |
| Reflujo | En tamaño normal, `scrollWidth` global coincide con 320, 390 y 1440 px. El carrusel de productos tiene desplazamiento horizontal interno previsto. |

## Texto al 200 %

Se duplicaron temporalmente los tamaños tipográficos computados y sus interlineados en el DOM, sin ampliar cajas ni iconos; no se guardaron estos cambios. Es una prueba de ampliación de texto, no zoom completo de la página ni una simulación de ajustes específicos de iOS/Android.

En Inicio, el documento conservó los anchos 320, 390 y 1440 sin desplazamiento horizontal global. En móvil la navegación creció hasta aproximadamente 137 px a 320 y 109 px a 390: las etiquetas se conservan, aunque «Inicio», «Tienda» y «Mi Club» se fragmentan en varias líneas. **No se confirmó recorte de esas etiquetas**; por eso no se registra como fallo de overflow. Evidencia: [texto-200-320.png](critic-identidad/texto-200-320.png).

La recarga corregida se volvió a ampliar al 200 % en 320 px: el diálogo mantuvo ancho de 320 px, contenido de 318 px y desplazamiento vertical. Al desplazarse al final se pudieron leer el saldo, «Enseñar mi pase», la fecha de consulta y «Actualizar mi saldo» completos.

La revisión se realizó con preferencia de movimiento reducido emulada. No constituye una auditoría exhaustiva de animaciones, lectores de pantalla, todos los estados de datos ni todas las plataformas. Las superficies redondeadas y la adaptación compacta de la firma mantienen su condición de propuestas pendientes de validación visual del usuario.
