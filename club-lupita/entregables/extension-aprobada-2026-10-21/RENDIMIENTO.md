# Rendimiento local de la extensión

Comparación intercalada de tres cargas por versión y ruta, contexto nuevo, viewport390 × 844, movimiento reducido y Edge. Se abrieron sesiones con el Worker sintético antes de medir, sin cargar recursos de la app en el navegador. Las dos compilaciones se sirvieron con `no-store`, sin limitar red ni CPU y sin otros navegadores de prueba activos. Títulos comprobados: Inicio, Carta, Club y Pedidos.

| Ruta | LCP mediano antes → después | CLS mediano antes → después | Bytes de recursos antes → después | Peticiones |
|---|---|---|---|---|
| Inicio |156 →172 ms|0,00006 →0,00383|494.014 →503.424 (+1,9 %)|30 →30|
| Carta |148 →168 ms|0,00052 →0,00038|555.048 →549.875 (−0,9 %)|27 →27|
| Club |156 →160 ms|0,07934 →0,06462|505.867 →529.967 (+4,8 %)|37 →38|
| Pedidos del equipo |56 →60 ms|0 →0,00025|747.022 →779.809 (+4,4 %)|26 →26|

No hubo imágenes rotas ni errores de ejecución en las24 cargas. La extensión no ofrece una mejora general de velocidad: añade entre9,4 y32,8 KB en tres rutas, mientras Carta reduce5,2 KB. El LCP medido aumenta4–20 ms, una diferencia pequeña en este entorno local que no permite atribuir una regresión perceptible en dispositivos reales. Los desplazamientos medidos aumentan ligeramente en Inicio/Equipo y bajan en Carta/Club. Se conserva este coste explícito; no se informa «cero variación».

Son recursos servidos por el servidor local, sin la compresión/caché de un despliegue. Las cifras no son Core Web Vitals de producción, ni cubren las otras rutas o interacción sostenida. Una comprobación posterior en dispositivos físicos y red móvil debe preceder a cualquier promesa de rendimiento real. No se desplegó para obtenerlas.

[Datos y recursos por carga](evidencia/rendimiento/resultados.json) · [Script](../../tests/redisenio-rendimiento.mjs) · [Log](evidencia/rendimiento.log).
