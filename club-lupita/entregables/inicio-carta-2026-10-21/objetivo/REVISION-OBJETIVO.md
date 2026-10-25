# Revisión independiente del objetivo — PASS

Fecha: 21 de octubre de 2026. Referencia: `../bar.md`. Evaluación del render real de `http://127.0.0.1:5190/__preview/entrar`, las cinco capturas `despues-*` entregadas y sus páginas completas. No se leyó código de aplicación ni del builder; no se modificaron la aplicación ni el build.

## Dictamen

**PASS para el objetivo de esta propuesta de Inicio.** La invitación gastronómica domina el contenido normal antes de la cuenta completa, la carta tiene acceso claro y el pase conserva una entrada única visible sin desplazamiento. No se encontró un fallo reproducible que requiera corrección para este objetivo. Esto es una revisión independiente de producto y funcionamiento visible; no constituye aprobación visual humana ni autoriza extender el rediseño o publicarlo.

## Evidencia comprobada

| Criterio | Resultado observado | Evidencia |
|---|---|---|
| Comida y carta preceden a cuenta y sellos | PASS. Orden visual y de lectura: pase compacto, fotografía y CTA, productos, accesos, cuenta completa y sellos. | `normal-390.png`, capturas completas entregadas, `normal-medidas.json` |
| 390 × 844 con aviso del preview | PASS. Foto en y=250.05, alto=227.09, termina en y=477.14. Supera los 180 px exigidos antes de navegación (y=772). CTA Explorar la carta visible en y=635.23. | `normal-390.png` |
| 320 × 568 con aviso del preview | PASS. Foto en y=231.50, alto=182.69, comida reconocible. Carta permanece accesible por navegación inferior. La CTA del hero requiere scroll en este tamaño, cosa que la barra no exige evitar. | `normal-320.png` |
| Pase sin scroll y único | PASS. Botón a y=167.50, alto=48 en 320; y=186.05, alto=48 en 390. Un solo Mostrá tu pase en Inicio. Abre el código; Escape cierra y restaura foco al botón. El panel del pase puede desplazarse en 320. | `pase-320.png`, `pase-390.png`, `pase-320.json` |
| Fotografía de escritorio | PASS. Superficie 729.59 × 462.83 en 1440. Plato y comida reconocibles; composición conserva profundidad de imagen. | `normal-1440.png` y captura completa entregada |
| Cuenta y privacidad | PASS. Saldo, recarga, movimientos y última consulta siguen disponibles tras carta. Ocultar saldo cambia el control a Mostrar saldo; saldo permanece oculto tras recargar. | `saldo-oculto.png`, `flujos.json` |
| Recarga, sellos y beneficios | PASS. Recarga abre instrucciones, saldo y acceso al pase; movimientos abre Perfil con historial; reglas abre Mi Club con 8/9 sellos y beneficios. No se generaron códigos ni realizaron operaciones. | `recarga.png`, `movimientos.png`, `club.png`, `flujos.json` |
| Productos y precios | PASS. Los tres destacados abren sus fichas: Pizza Churrasco C$670, Risotto de Gallo Pinto C$280 y Dulce Tentación C$320; fotos y contenido visibles. | `pizza.png`, `risotto.png`, `dulce.png`, `productos.json` |
| Navegación | PASS. Carta → /pedir; Tienda → /tienda; Mi Club → /club; Perfil → /perfil; Inicio → /; Reservar una mesa → /reservar, con selector de lugar y pasos. | `navegacion.json`, `reservar.png` |
| Pedido, reserva y error | PASS. En 320 y 390 aparecen antes de la fotografía y sin scroll, con acciones Seguir mi pedido, Ver mi reserva o Actualizar seguimiento. | `pedido-320.png`, `reserva-390.png`, `error-320.png`, `estados.json` |
| Actualización estable | PASS. Botón conserva x=274.875, y=186.047, ancho=99.125, alto=48 antes, durante y después. Durante espera presenta En curso… y se deshabilita. | `actualizar.png`, `accesibilidad.json` |
| Texto ampliado y movimiento reducido | PASS en comprobación puntual. Texto raíz al 200% en 320: documento de 320 px de ancho, sin overflow horizontal; contenido y controles se redistribuyen. Las palabras de navegación ocupan varias líneas, pero siguen dentro de la barra. Movimiento reducido activo: animaciones observadas de 0.01 ms, una iteración. | `texto-200-320.png`, `texto-200-320-viewport.png`, `accesibilidad.json` |

## Reproducción de estados

Navegador Edge headless aislado por Playwright, con red fuera de `http://127.0.0.1:5190/` bloqueada. Se interceptó únicamente GET `/api/inicio/contexto` en el navegador; no se escribieron datos de servidor.

- Pedido: `{pedido:{numero:987654,estado:"preparando"},reserva:null,avisos:0,ahora:<ISO>}`.
- Reserva: `{pedido:null,reserva:{zona:"Zona de prueba",cuando:"2027-01-30T18:30:00.000Z",personas:12},avisos:0,ahora:<ISO>}`.
- Error: HTTP 503, `{error:"Prueba local de conexión",ahora:<ISO>}`.
- Actualización: respuesta local demorada 700 ms.

## Fallos y corrección principal

No se detectaron fallos bloqueantes reproducibles contra la barra del objetivo. **Corrección principal: ninguna requerida a partir de esta revisión.**

La verificación cubrió la experiencia de Inicio, la apertura de los destinos y los estados mencionados; no ejecutó pagos, pedidos, reservas ni canjes. No audita código, dependencias, backend ni exhaustivamente accesibilidad. Las suites de regresión del responsable complementan esta revisión.
