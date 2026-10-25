# Revisión independiente de identidad

**Veredicto: PASS**

Fecha: 21 de octubre de 2026. Referencia: `entregables/redisenio-2026-10-20/design-system.md`, basada en el Manual de Marca 2026. Se revisó el render local de `http://127.0.0.1:5190/__preview/entrar` y las cinco capturas `despues-*.png` entregadas. No se leyó la implementación de la aplicación ni se modificó código o build.

Alcance: Inicio, navegación, cuenta, recarga y pase; escritorio 1440 × 1000, móviles 390 × 844 y 320 × 844. También se revisó la captura entregada de 320 × 568. Los datos son sintéticos; no se publicaron contenidos ni se realizaron operaciones reales.

## Resultado por criterio

| Criterio | Resultado observado |
|---|---|
| Tipografía | Playfair Display en titulares editoriales y títulos de diálogos; Montserrat en texto, navegación, precios, saldo y códigos. Ambas fuentes se cargan del mismo origen local en archivos WOFF2. Los rótulos funcionales pequeños de cuenta y avisos mantienen Montserrat sin crear una segunda identidad tipográfica. |
| Paleta | Cacao `#53291E` para texto y cuenta; marfil `#FBF6EE` como fondo; borgoña `#B60032` en acciones; rosa `#F9AFA4` en recarga. Los neutros derivados y superficies claras mantienen la dirección cálida. No se encontró coral como texto pequeño sobre claro. |
| Logo | Firma completa original visible, sin filtros o transformaciones. Ancho medido: 280 px en escritorio, 118 px a 390, 100 px a 320. Se acepta la adaptación móvil previamente documentada. La reserva visual permanece libre; no se exige 280 px en móvil. |
| Superficies | Hero, cuenta, sellos, ofertas y diálogos emplean radios de 24 px; accesos y avisos, 16 px. Los diálogos móviles usan 24 px en las esquinas superiores al apoyarse en el borde inferior. Véase la observación menor del pase. |
| Contraste | Ningún texto estable inspeccionado quedó por debajo de 4,5:1. Mínimo de Inicio: **5,43:1**, texto secundario `#76574B` sobre rosa claro `#F9E7E2`. Recarga: mínimo **6,39:1**. Pase: mínimo **6,03:1**. Cacao sobre marfil: aproximadamente **11,46:1**. |
| Foco y controles | En cuenta, “Ocultar saldo en Inicio” muestra contorno marfil de 3 px sobre cacao. En recarga, “Enseñar mi pase” muestra anillo doble marfil/borgoña. Los controles de aplicación medidos cumplen al menos 44 × 44 px; no se cuenta el enlace auxiliar de la banda de vista previa ni el enlace oculto de salto. |
| Movimiento reducido | Con `prefers-reduced-motion: reduce`, la animación de entrada del diálogo reduce su duración a **0,01 ms** en los tres anchos. La medición de contraste se hizo después de que el diálogo alcanzara opacidad 1. |
| Adaptación | El ancho del documento coincide con 320, 390 y 1440 px, respectivamente. El pase y la recarga conservan tipografía, paleta y controles legibles en los dos anchos móviles. |
| Voz e imágenes | Voseo consistente en “Hacé”, “Mostrá”, “Consultá”, “Tenés” y “Conocé”. Las fotografías del render son los recursos locales existentes de desayuno, pizza, risotto y waffle. La revisión visual no valida precios, stock o reglas comerciales de los datos sintéticos. |

## Defectos y corrección principal

**No hay defectos de identidad bloqueantes ni una corrección obligatoria para aprobar esta revisión.**

Observación menor: la tarjeta interior de “Tu pase de la casa” conserva `border-radius: 0px`, dentro de un diálogo de 24 px. Es una discontinuidad concreta frente al lenguaje de tarjetas de Inicio. Si se adopta la propuesta de superficies redondeadas como regla uniforme, la corrección principal sería darle un radio de 16 px. No la uso para rechazar la identidad porque el documento de referencia presenta esos radios como una propuesta pendiente de aprobación, no como una obligación del manual original.

## Evidencia

- `evidencia/identidad/inicio-1440.png`, `inicio-390.png` e `inicio-320.png`: vistas completas reproducidas de forma independiente.
- `evidencia/identidad/cuenta-1440.png`, `cuenta-390.png`, `cuenta-320.png`: cuenta y paleta oscura.
- `evidencia/identidad/cuenta-foco-1440.png`, `cuenta-foco-390.png`, `cuenta-foco-320.png`: foco de teclado sobre cacao.
- `evidencia/identidad/recarga-foco-1440.png`, `recarga-foco-390.png`, `recarga-foco-320.png`: diálogo y foco de acción principal.
- `evidencia/identidad/pase-1440.png`, `pase-390.png`, `pase-320.png`, más variantes `pase-expandido-*`: pase y ayuda desplegada.
- `evidencia/identidad/mediciones.json`: estilos computados, dimensiones, colores, contraste, fuentes, foco y duración con movimiento reducido.
- `evidencia/identidad/inspeccion.cjs`: procedimiento reproducible de lectura del DOM y captura; no lee archivos de implementación.

La banda “VISTA PREVIA LOCAL” pertenece al entorno de comprobación y se excluyó del juicio sobre la identidad de la aplicación. Este PASS evalúa identidad dentro del alcance indicado; no sustituye una revisión de comportamiento comercial ni de accesibilidad completa.
