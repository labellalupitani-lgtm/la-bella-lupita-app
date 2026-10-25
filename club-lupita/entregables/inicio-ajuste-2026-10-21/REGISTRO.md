# Sexta composición de Inicio

**Actualización posterior al cierre:** el usuario respondió «Aprobar y extender el rediseño» el 21 de octubre de 2026. La sexta composición queda aprobada visualmente y la extensión está autorizada. El estado pendiente que figura en el historial siguiente corresponde al momento de entrega. Continuidad en `../extension-aprobada-2026-10-21/REGISTRO.md`; publicación no autorizada.

Estado: implementación revisada y verificada; pendiente de validación visual humana. La quinta composición fue revisada técnicamente, pero el usuario pidió seguir ajustándola e investigar todas las referencias. La investigación terminó; este ciclo aplica sus conclusiones. La extensión al resto de la aplicación sigue pendiente de esa validación.

## Criterios y materiales

La fuente vigente de criterios es [bar.md de la investigación](../investigacion-diseno-2026-10-21/bar.md). Se dispone del manual completo renderizado, los dos pines exactos y sus autores identificados, la referencia de Dribbble y los dos JPEG adjuntos. Las cinco entradas contienen cuatro diseños distintos. Las imágenes estáticas no acreditan interacciones.

La [comparación visual](../investigacion-diseno-2026-10-21/panel-referencias.html) documenta el diagnóstico. El resultado de la app puede capturarse en Edge local en móvil, tablet y escritorio. No falta material que impida a los revisores evaluar composición o identidad. Esta pieza usa activos existentes; no requiere generación de imagen, vídeo ni voz.

## Pieza y revisión

Una pieza: Inicio autenticado, incluyendo los controles de cabecera necesarios. Prioridades: integración de identidad/pase, fotografía con encuadre reconocible y productos completos visibles en la primera pantalla normal de 390 × 844.

| Etapa | Estado |
| --- | --- |
| Investigación y siete mecanismos | Terminada y revisada |
| Implementación por agente constructor | Terminada, tres rondas |
| Pruebas de composición y contratos | PASS; 93 comprobaciones de composición, 11 grupos de aceptación, 7 de estabilidad, 9 de regresión |
| Revisión independiente de objetivo | PASS, retorno prioritario corregido y revalidado |
| Revisión independiente de marca | PASS, tres grupos de hallazgos corregidos y revalidados |
| Revisión independiente de acabado | PASS; refinamiento futuro para pantallas cortas |
| Validación visual del usuario | Pendiente |

La revisión independiente evalúa el resultado renderizado. Un PASS técnico no autoriza extender la dirección ni publicar.

## Vistas locales

- Nueva compilación al terminar: http://127.0.0.1:5190/__preview/entrar
- Quinta conservada: http://127.0.0.1:5196/__preview/entrar

Ambas usan datos sintéticos en memoria y bloqueo de servicios externos. Se conservó la quinta compilación y las fuentes en `antes/`. No se ha publicado este ciclo.

Decisión de encuadre durante implementación: se permite un díptico continuo en escritorio y una foto en móvil. Las fotos disponibles son cuadradas o verticales salvo el desayuno 960 × 609; forzar una sola en 1440 × 350 recorta gran parte de taza o bandeja. El criterio 2 conserva bordes completos, color natural y sujeto reconocible; se verifica la cobertura de la franja, no que cada imagen llene el viewport. Cambio comunicado antes de probarlo, sujeto a la revisión visual independiente.

## Ronda 1 de revisión de interfaz

La compilación inicial pasó guardián, TypeScript y Vite. La prueba de composición pasó 89 comprobaciones y las suites de aceptación, estabilidad y regresión pasaron 11, 7 y 9 grupos respectivamente. Estos resultados no sustituyen el examen visual.

El crítico de marca detectó tres grupos de hallazgos para corregir:

1. Reserva de la firma al foco: el contorno interior invade H/4. El primer ajuste colocó un outline exterior, pero se mantuvo un box-shadow interior; hay que anularlo. En 320 px, la cabecera envuelta también requiere separación vertical suficiente entre firma y pase.
2. Texto ampliado al 200 %: las cinco columnas fijas parten palabras de navegación en fragmentos. Las etiquetas deben refluir completas, conservando el aumento y el acceso a los cinco destinos.
3. Resolución de Risotto: la variante denominada 480 tiene realmente 283 × 480 px; declararla como 480w elige una fuente insuficiente para su ancho de escritorio. La variante mayor tiene 567 × 960 px. Deben declararse los anchos reales en el srcset de Inicio.

Estado: correcciones en curso; revisión de objetivo en paralelo, acabado pendiente. No se entrega como aprobado hasta revalidar los hallazgos.

## Ronda 2 y cierre visual

Los tres grupos de marca quedaron corregidos: contorno exterior sin sombra interior, separación suficiente de la firma, navegación al 200 % con cinco etiquetas enteras en dos filas y fuente de risotto con ancho útil suficiente. La altura real de la barra se reserva mediante observación de tamaño, limitada a Inicio. La aceptación completa se repitió sobre estos cambios; las tres fotos y precios siguen visibles en escritorio y dos en móvil normal.

El crítico de acabado cerró en PASS. Dejó como oportunidad no bloqueante adelantar más el catálogo en 320 × 568, donde el criterio permite desplazamiento. No se redujeron letras ni controles para forzar ese encuadre.

## Ronda 3 y cierre funcional

El crítico de objetivo reprodujo un P2 al volver desde un producto después de aparecer un pedido o reserva: el navegador restablecía el desplazamiento antiguo y ocultaba la acción prioritaria. Se agregó una regresión que falló en ambos estados sobre la compilación anterior, conservada en `evidencia/retorno-antes/`.

La corrección espera la revalidación actual de entrada y coloca el seguimiento y su foco después de la restauración nativa. La prueba pasó después: 93 comprobaciones de composición, incluidos ambos retornos prioritarios y los retornos normales. Se repitió estabilidad. El árbitro revalidó pedido/reserva con respuesta inmediata y con 800 ms de demora: cuatro de cuatro casos pasan y el retorno normal conserva exactamente su contexto. No hubo cambio visual en esta ronda; los dictámenes de marca y acabado conservan su alcance.

Las ocho fuentes/pruebas medidas y la compilación se registran en `fuentes.json`. El resultado local de rendimiento usa tres cargas por versión, sin otras sesiones de prueba en ejecución: bytes 546.258 → 494.109, peticiones 34 → 34 y LCP mediano 120 → 132 ms. No se afirma una mejora de velocidad a partir de esta muestra pequeña. El detalle y límites figuran en `LEEME.md`.

No quedan hallazgos críticos o importantes abiertos dentro del ciclo. La aprobación visual sigue pendiente y el resto del alcance integral no se acredita como rediseñado.
