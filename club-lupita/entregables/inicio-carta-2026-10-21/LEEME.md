# Inicio con fotos y carta primero

La nueva propuesta responde a «Más protagonismo para las fotos y la carta, como en las referencias». El plato abre Inicio, seguido de la invitación a explorar la carta y los productos destacados. La cuenta y los sellos quedan después; el pase conserva un acceso único en la parte superior.

- [Propuesta local](http://127.0.0.1:5190/__preview/entrar)
- [Composición anterior](http://127.0.0.1:5193/__preview/entrar)

Ambas usan datos sintéticos identificados, memoria local y red externa bloqueada. Abrir en el equipo donde están iniciados los servidores. No se publicaron cambios ni se ejecutaron operaciones reales.

## Cambios visibles

La foto empieza a 250 px en móvil de 390 × 844, frente a 674 px antes; se ve completa antes de la navegación. En 320 × 568 también se reconoce el plato al abrir. El pase está visible en ambos tamaños. En escritorio, la foto pasa de 685 × 250 a aproximadamente 730 × 463 px y conserva el encuadre original del plato.

El titular principal pasa a «Hacé una pausa rica». Los tres productos existentes conservan sus fotografías, nombres, precios y acceso al detalle. «Toda la carta» acompaña los destacados. Pedidos, reservas y errores de seguimiento aparecen antes de la foto cuando corresponda; avisos y estado vacío se muestran cerca de la cuenta.

Se mantienen privacidad del saldo, recarga informativa, movimientos, pase, sellos, premios y beneficios. La corrección de estabilidad de actualización del ciclo anterior permanece aplicada. No se agregaron dependencias ni activos. La revisión detectó un recorte excesivo del risotto: se corrigió el foco para mostrar alimento y bandeja, sin modificar la foto original.

## Evidencias y comprobaciones

- [Antes móvil](evidencia/antes-390-viewport.png) · [Después móvil](evidencia/despues-390-viewport.png)
- [Antes escritorio](evidencia/antes-1440-completa.png) · [Después escritorio](evidencia/despues-1440-completa.png)
- [Geometría comparada](evidencia/composicion.json): 37 comprobaciones correctas, incluyendo visibilidad, orden de lectura y controles táctiles.
- [Aceptación](evidencia/aceptacion.json): diez grupos correctos; siete tamaños, navegación, privacidad, pase/recarga, seguimiento, recuperación, teclado, texto ampliado y movimiento reducido. Axe sin infracciones detectadas en móvil, escritorio y diálogo.
- [Regresión](evidencia/regresion/resultados-ui.json): nueve grupos correctos, con ocho resoluciones, premio/expiración, sesión aislada y respuestas retrasadas.
- [Estabilidad](evidencia/estabilidad/estabilidad.json): siete escenarios correctos; cuenta, catálogo, cupos y contexto mantienen progreso veraz y geometría estable en actualizaciones normales; errores recuperables.
- Compilación, TypeScript y guardianes correctos.

Las pruebas de llegada a Inicio ahora usan el título estable de la cuenta en lugar del titular editorial sustituido. La aserción geométrica anterior exigía cuenta estrictamente más arriba que sellos: se adaptó a su colocación en columnas en escritorio, conservando el orden del DOM y la prohibición de que la cuenta quede después visualmente. El primer fallo por esa expectativa antigua se conserva en `evidencia/regresion/fallo.*`; el JSON vigente contiene la repetición correcta.

## Revisión y pendientes

Las tres revisiones independientes terminaron en PASS: [objetivo](objetivo/REVISION-OBJETIVO.md), [identidad](REVISION-IDENTIDAD.md) y [acabado](REVISION-ACABADO.md). Objetivo e identidad necesitaron una ronda; acabado dos, por el encuadre del risotto. Ver [registro del ciclo](REGISTRO.md). No quedan fallos críticos o importantes del alcance elegido. La tarjeta interior del pase conserva esquinas rectas; el crítico de identidad registró su redondeo como mejora opcional posterior.

La extensión al resto de la aplicación requiere validar esta dirección visual. El objetivo del 100 % sigue pendiente de los siguientes ciclos; producción requiere autorización explícita independiente.

## Medición local

Tres cargas de cada compilación en Edge, 390 × 844, sin limitación de red ni CPU: LCP mediano 124 → 128 ms; suma de desplazamientos sin interacción reciente 0,00270 → 0,00044; recursos 559.774 → 559.323 bytes; 34 solicitudes en ambas medianas. [Datos](evidencia/rendimiento.json). No se interpreta la diferencia de 4 ms como una mejora ni deterioro demostrado; son muestras locales, no métricas de producción ni una auditoría exhaustiva de rendimiento. La suma de desplazamientos del script no sustituye al CLS de campo por ventanas. Las actualizaciones normales también se comprobaron con respuestas retenidas, por separado.

Fuentes integradas en `src/casa/pantallas/Inicio.tsx` y `src/casa/estilos/redisenio-inicio.css`; huellas de los archivos en [fuentes.json](fuentes.json). Si los servidores se cierran, ejecutar desde la carpeta del proyecto `node scripts/vista-previa-diseno.mjs --port 5190 --dist dist` y, para comparar, `node scripts/vista-previa-diseno.mjs --port 5193 --dist entregables/inicio-carta-2026-10-21/antes/dist`.
