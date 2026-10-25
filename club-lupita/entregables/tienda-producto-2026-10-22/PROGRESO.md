# Tienda · Producto protagonista

Estado: terminada y abierta en vista previa local. Las tres revisiones independientes cierran en PASS. No se publicó en producción; fuentes anteriores y compilación preservadas en `antes/`.

Preflight: captura y esquema del usuario disponibles; proyecto React/Worker renderizable en preview local con datos sintéticos. Identidad y referencias de café ya aportadas. No se encontró una fotografía verificada de la bolsa de 250 g entre los activos revisados. Se emplea una foto existente de café servido con rótulo de ambiente; la ficha API tiene prioridad. Los tres críticos recibieron renders y criterios; ninguno trabajó sin evidencia visual.

| Ronda | Construcción | Función | Marca | Composición |
|---|---|---|---|---|
| 1 | Imagen y ficha unidas; detalles plegados; beneficio secundario | FAIL: colisión de etiquetas/valores en encargo con texto al 200% | FAIL de evidencia: captura larga no demuestra alcance del título y CTA | FAIL de evidencia: misma limitación de captura larga |
| 2 | Corrección del resumen de encargos; capturas de ventana durante scroll/foco | PASS: repetición independiente a 320 y 390 px, sin cruces de texto ni controles tapados | PASS visual: portada y resumen final revisados | PASS visual: portada y resumen final revisados |

## Cierre de hallazgos

- La captura de página completa dibujaba la barra fija sobre una zona del documento fuera de la ventana inicial. Capturas reales del viewport muestran el título completo y la acción enfocada alcanzables al 200%. Se cerró la observación sin alterar la portada por ese artefacto.
- La colisión del resumen de encargos sí era reproducible. Se corrigió con columnas adaptadas al contenido en escritorio y pares apilados en móvil. La prueba focal final y la revisión independiente comprueban geometría de texto, además del render.
- El primer intento de la suite transaccional no esperaba que finalizara el cierre de un intento antes del siguiente escenario. Se añadió esa espera al arnés. La suite final pasó; no se cambió la lógica comercial por esa carrera de prueba.

## Evidencia final

- Compilación: `principal-CxOhDyaZ.js`, `Tienda-BIQ9D-kA.js`.
- Servidor: 9 grupos PASS (`servidor.log`).
- Interfaz transaccional: 9 grupos PASS (`compra-final.log`); ejecutados antes de la última corrección, exclusivamente CSS.
- Prueba focal final: 6 grupos PASS, 12 estados, 0 errores registrados (`pruebas-final/resultados.json`).
- Uso independiente final: `REVISION-USO.md`, `pruebas-uso-final/`; R1 preservada.
- Marca y composición finales: `REVISION-MARCA.md`, `REVISION-COMPOSICION.md`.
- Página abierta y verificada en `/tienda`: http://127.0.0.1:5300/tienda ; captura `vista-abierta.png`.
- Compilación congelada y SHA-256: `compilacion/`, `manifiesto.json`.

Pendiente de contenido comercial: una foto verificada de la bolsa. La entrega visual ya usa una alternativa identificada como ambiente y no habilita pagos cuando la ficha está incompleta.
