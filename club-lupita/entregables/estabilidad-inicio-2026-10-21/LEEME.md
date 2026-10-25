# Estabilidad de Inicio

La actualización de datos conservaba contenido válido pero insertaba mensajes transitorios encima, desplazando cuenta, fotografía y controles. Inicio ahora mantiene un único progreso visible («En curso…») y accesible, hasta terminar cuenta, catálogo, cupos y seguimiento. Conserva los errores, el saldo anterior y la fecha de la última consulta válida durante los reintentos.

La composición final no cambió en esta corrección. Las otras pantallas conservan el comportamiento habitual de los componentes compartidos.

Validación: compilación, TypeScript y guardianes correctos; diez grupos de aceptación visual, nueve de regresión y siete escenarios de estabilidad de la suite principal. La [revisión independiente](REVISION.md) repitió once escenarios y ocho comprobaciones funcionales: 76/80/84 px de movimiento en actualizaciones móviles/escritorio pasaron a 0 px. No se afirma cero en errores o en toda apertura fría; el informe conserva esos límites y la incidencia de ejecución observada.

Fuentes originales y compilación en `antes/`; evidencia de las suites principales en `evidencia/`. Mediciones independientes en `mediciones-baseline.json`, `mediciones-despues.json` y `comparacion-final.json`. La aprobación técnica no equivale a aprobación visual ni autoriza publicar o extender el diseño.
