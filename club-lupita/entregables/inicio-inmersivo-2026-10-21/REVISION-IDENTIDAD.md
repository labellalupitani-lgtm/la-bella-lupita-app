# Revisión independiente de identidad y contraste

**PASS en el alcance revisado.** No se detectó un defecto bloqueante de identidad ni contraste del hero. Revisión del render compilado en `http://127.0.0.1:5190/__preview/entrar`, 21 de octubre de 2026, contra `entregables/redisenio-2026-10-20/design-system.md`. No se leyó código de la app ni notas del constructor; no se editó la app.

## Contraste medido sobre la foto real

Microsoft Edge, DPR 1. Viewports: 320×844, 390×844 y 1440×1000. Tamaño raíz al 100 % = 16 px; al 200 % = 32 px. Se trata de aumento de texto mediante la raíz, no de zoom del navegador. El titular resulta en 32/64 px en móvil y 56/80 px en escritorio.

Para cada caso se capturó el render original y el mismo render ocultando únicamente el color y relleno del texto del titular, CTA e icono. Se conservó la fotografía, sus recortes, el degradado y el resto de la composición. La comparación usa el marfil real de las letras, #FBF6EE, contra los píxeles de esa captura sin tinta, no un color CSS supuesto del fondo ni un resultado de axe.

Se recorrieron todos los píxeles de los rangos DOM del texto. La máscara de tinta incluye todos los píxeles modificados con diferencia ≥2/255 y contribución estimada del texto >1 %. Se verificó además el núcleo con contribución ≥50 %; ambos dan el mismo mínimo. La tabla presenta el mínimo bajo tinta visible, no promedios. La cobertura del titular fue 2.101, 6.902, 2.101, 6.902, 5.479 y 10.160 píxeles, respectivamente.

| Ancho | Texto raíz | Titular mínimo | CTA mínimo | Foco mínimo | Resultado ≥4.5:1 |
|---|---:|---:|---:|---:|---|
| 320 | 100 % | 8.88:1 | 6.43:1 | 9.48:1 | PASS |
| 320 | 200 % | 8.96:1 | 6.43:1 | 9.52:1 | PASS |
| 390 | 100 % | 8.60:1 | 6.43:1 | 9.35:1 | PASS |
| 390 | 200 % | 8.90:1 | 6.43:1 | 9.81:1 | PASS |
| 1440 | 100 % | 7.34:1 | 6.43:1 | 7.65:1 | PASS |
| 1440 | 200 % | 4.70:1 | 6.43:1 | 5.72:1 | PASS |
| 1440 | 200 % directo* | 6.35:1 | 6.43:1 | 5.22:1 | PASS |

*Prueba adicional solicitada: se congelaron todos los tamaños computados y `line-height` del estado al 100 % y se multiplicaron directamente por dos. Así el titular de escritorio aumenta realmente de 56 a **112 px**, con interlínea 120.96 px, sin que el `clamp()` lo limite a 80 px. El titular pasa a tres líneas y el hero crece. Se midieron sus **18.762 píxeles de tinta**, sin ninguno por debajo de 4.5:1; mínimo 6.3457:1 (núcleo ≥50 %: 6.3755:1). El rectángulo completo también pasa, mínimo 5.6294:1. CTA: 2.223 píxeles de tinta, 6.4311:1. Foco: 1.686 píxeles sólidos, mínimo 5.2192:1. Captura y medición propias, con el titular y CTA completos visibles tras scroll. Este caso complementa la matriz de aumento raíz y no la reemplaza.

El punto más ajustado está en 1440/200 %: fondo RGB(133,104,97) bajo el titular, contra RGB(251,246,238), 4.7033:1. El rectángulo completo de esa línea contiene 234 píxeles de espacio sin tinta por debajo de 4.5:1, con mínimo 4.2437:1; ninguno intersecta la máscara de los glifos actuales. Por eso este PASS corresponde a la composición y texto probados. Un cambio de titular, tipografía, fotografía o recorte requiere volver a medir.

El foco se activó después de usar teclado y se confirmó `:focus-visible` en los seis casos. Se midió el contorno exterior marfil de 3 px, separado 5 px del botón, contra el render sin foco en las mismas coordenadas. Cobertura: 946, 1.326, 944, 1.570, 946 y 1.578 píxeles sólidos del contorno; se excluyeron los bordes suavizados y los anillos interiores. El menor contraste medido es 5.72:1.

Al 200 % en móvil, el hero completo excede el espacio inicial disponible entre la cabecera y la navegación fija. Se hizo scroll normal hasta situarlo al inicio del viewport antes de medir. Las capturas finales muestran **todos los glifos del titular y CTA visibles simultáneamente** por encima de la barra: no queda una obstrucción persistente, ni hay un PASS basado en letras ocultas. No queda pendiente la medición al 200 %.

## Identidad observada

- **Foto inmersiva — PASS.** El hero ocupa x=0 y exactamente 320/390/1440 px, sin radio ni marco lateral. Esta adaptación responde al pedido explícito. La taza y la marca impresa sobre la espuma permanecen visibles; titular y CTA se apoyan sobre la zona inferior/izquierda sin tapar la marca de la fotografía.
- **Firma y reserva — PASS.** El DOM usa la firma completa existente `/brand/v3/logo-160.webp` en móvil y `logo-320.webp` en escritorio, con `object-fit: contain`, sin filtro ni transformación. La presentación visible mantiene proporción y contenido. Caja móvil 100×47.5 px: H/4=11.875 px; margen vertical mínimo 12.25 px y separación mínima del control vecino 12 px, incluso en 320/200 %. Caja de escritorio 176×83.047 px: H/4=20.762 px; margen vertical 22 px y separación mínima de navegación 33.047 px al 200 %. La firma es una adaptación compacta de los 280–320 px sugeridos, contemplada por el sistema; no se declara que aquí mida ese ancho.
- **Paleta y tipografía — PASS.** Cacao #53291E en texto, marfil #FBF6EE y borgoña #B60032 en el hero/CTA. Playfair Display Inicio para el titular; Montserrat Inicio para CTA y navegación. Fuentes cargadas desde `/fuentes/diseno/playfair-latin.woff2` y `/fuentes/diseno/montserrat-latin.woff2`, en el mismo origen. La foto conserva color natural y el degradado cacao mantiene la lectura.
- **Foco del CTA — PASS.** Visible, completo, sin recorte y por encima del umbral pedido en los seis casos. La revisión se limita al foco y contenido relevantes del hero; no sustituye la auditoría funcional de todos los controles de la aplicación.

## Evidencia reproducible y límites

En `evidencia/identidad/`:

- `medir.mjs`: captura y análisis de píxeles, sin modificación persistente de la app.
- `mediciones.json`: geometría DOM, colores del texto oculto, rangos, recuentos, mínimos y coordenadas de cada caso.
- `{320,390,1440}-{100,200}-original.png`, `-sin-tinta.png`, `-foco.png`: seis ternas de capturas válidas y alineadas.
- `marca.json` y `*-200-cabecera.png`: dimensiones, reserva H/4, recursos de fuentes y cabecera al 200 %.
- `1440-directo200-{original,sin-tinta,foco}.png` y `mediciones-directo200.json`: ampliación directa del titular hasta 112 px. Se reproduce ejecutando el mismo script con `IDENTIDAD_DIRECT_TEXT=1`.

Cobertura exhaustiva de la máscara raster indicada en los seis estados de la matriz y la ampliación directa adicional de escritorio, no una afirmación sobre todos los anchos intermedios, otros motores de navegador o fotografías futuras. La revisión de integridad de firma es visual/DOM y confirma el recurso renderizado sin deformación; no es una pericia del archivo maestro original. No se revisaron nuevamente las otras pantallas ni el inventario funcional completo.
