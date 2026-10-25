# Perfilado de Reservar y mejora publicada

Documento histórico del 10 de octubre. La versión y las mediciones actuales están en el [informe del 12 de octubre](../reservas-2026-10-12/INFORME.md); conserva también los resultados finales con mayor latencia y no declara una mejora móvil estable.

10 de octubre de 2026, Managua. Chrome DevTools MCP 1.10.1; HeadlessChrome 154.0.0.0 en Windows. Versión publicada: `94286822-b77b-4250-94fb-4df5719323ee`.

## Resultados medidos

| Escenario | LCP | CLS | Alcance |
|---|---:|---:|---|
| Antes, móvil, primera visita | 6.650 ms | 0 | Una muestra con perfil temporal vacío. |
| Después, móvil, primeras visitas | 3.189 / 3.007 / 3.018 ms | 0 / 0 / 0 | Tres perfiles vacíos; mediana 3.018 ms. |
| Después, escritorio, primeras visitas | 1.019 / 481 / 832 ms | 0 / 0 / 0 | Tres perfiles vacíos; mediana 832 ms. |
| Recorrido local hasta confirmación | INP observado: 81 ms | 0,03 | Zona, fecha, horario, revisión y confirmación; cuenta e inventario sintéticos. |

Móvil: viewport 390×844, DPR 3, touch, CPU ×4, preset **Slow 4G**. Escritorio: 1365×900, DPR 1, sin limitación artificial. No son dispositivos físicos ni datos de visitantes reales. CrUX y estadísticas del servidor están desactivados. No se evalúa percentil 75 de usuarios con seis muestras de laboratorio.

Las primeras trazas cuyos nombres contienen `cold` corresponden en realidad a **recargas exploratorias con caché previamente poblada**. La opción `ignoreCache` no eliminó todas las validaciones condicionales: se observaron respuestas 304. Se reemplazó ese método por reinicio del servidor y perfil temporal vacío en cada primera visita; las trazas válidas son `trace-mobile-firstvisit-1.json.gz` (antes) y `trace-post-{mobile,desktop}-{1,2,3}.json.gz` (después).

La primera muestra anterior tuvo además TTFB 1.235 ms; las posteriores móviles tuvieron 491 / 179 / 145 ms. Por esa variación y por tener una sola muestra anterior, **no se presenta el cambio como un porcentaje causal garantizado**. La traza sí demuestra que la imagen pasó de descubrirse a los 4.991 ms a descubrirse a los 698 ms en la tercera muestra posterior.

## Cambio implementado

La entrada `/reservar` ahora precarga la imagen adaptable con prioridad alta y los módulos estáticos y estilos necesarios para esa pantalla. El manifiesto de Vite identifica los nombres finales de los archivos. El generador no recorre imports dinámicos ni precarga las demás pantallas. `index.html` conserva su estrategia anterior.

Se comprobó en la traza que la imagen se solicitó **una sola vez**, con prioridad High y con el documento como iniciador. No hubo una descarga duplicada de las variantes 480 y 960. La transferencia de la imagen, que continúa usando el asset existente, es ahora el componente dominante: 2.272 ms de los 3.018 ms de LCP de la tercera muestra.

Esta corrección sigue la recomendación de hacer descubrible y priorizar el recurso LCP desde el documento, en lugar de esperar a JavaScript. [Guía oficial de optimización de LCP](https://web.dev/articles/optimize-lcp).

## Interpretación y siguiente mejora

El escritorio medido está por debajo de 2,5 s. El perfil móvil exigente todavía está por encima: queda por optimizar la codificación y las dimensiones efectivamente transferidas de la fotografía y volver a medir. La imagen ocupa 350×180 CSS px en la vista móvil comprobada. El insight automático propone hasta 129,1 kB de ahorro para esa imagen, pero mezcla compresión y dimensiones; es una estimación que requiere validar calidad y recorte antes de aplicarla. No se promete ese ahorro como realizado.

El INP de 81 ms describe las interacciones observadas del entorno sintético, incluidas entradas por teclado. No es una medida de latencia de API ni garantiza el INP de visitantes. La traza sin navegación conservó en su resumen la URL anterior de producción; los controles, el comprobante y las solicitudes del ensayo pertenecen a `localhost:4189`. Se conserva ese límite de la herramienta explícitamente. El CLS 0,03 de ese recorrido es distinto del CLS 0 de las cargas públicas.

Los valores de referencia de Web Vitals se aplican a experiencias reales y a sus distribuciones; estas trazas sirven para diagnosticar causas y comparar condiciones controladas. [Web Vitals](https://web.dev/articles/vitals).

## Validación y reproducción

- Compilación TypeScript/Vite y comprobaciones de build aprobadas: `build-perfilado.log`.
- Presupuestos existentes de JavaScript y consultas con 30.000 reservas sintéticas aprobados; la imagen no cambió de formato ni contenido.
- Empaquetado Worker sin publicar aprobado: `worker-perfilado-validacion.log`.
- Publicación al 100% confirmada y cinco grupos de comprobaciones públicas aprobados; HTML y JavaScript coinciden con el build.
- Recorrido hasta comprobante confirmado en la base sintética; ninguna reserva real creada para medir.
- Consola de la entrada pública: tres respuestas 401 de consultas sin sesión, sin excepción JavaScript ni advertencia de precarga duplicada en la observación final.
- `medir-primera-visita.ps1 -Perfil mobile -Repeticiones 3` y equivalente `desktop` repiten las cargas públicas mediante la CLI oficial del MCP. Ejecutar desde el proyecto. El script usa perfiles temporales y sobrescribe solo sus propios resultados con el mismo nombre.

La configuración de Codex queda instalada. El servidor temporal usado para estas mediciones se cierra al terminar; no se mantiene acceso al Chrome habitual. [Configuración y verificación](HABILITAR_PERFILADO.md).
