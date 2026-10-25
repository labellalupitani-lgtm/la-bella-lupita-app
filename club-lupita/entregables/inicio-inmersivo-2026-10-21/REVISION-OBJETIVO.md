# Revisión independiente de objetivo y uso

**Dictamen: PASS.** La portada cumple «Una portada más inmersiva, con la foto a todo el ancho» en la vista previa examinada y conserva los accesos revisados. No encontré un defecto bloqueante reproducible dentro de este alcance.

Revisión del 21 de octubre de 2026 mediante Microsoft Edge con Playwright, sobre `http://127.0.0.1:5190/__preview/entrar`; comparación visual con `http://127.0.0.1:5195/__preview/entrar`. Se inspeccionaron render, DOM y evidencias, sin leer código de la aplicación ni notas de implementación. No se modificaron aplicación, pruebas compartidas, compilaciones o servidores.

| Criterio | Resultado y evidencia |
| --- | --- |
| Foto de borde a borde | PASS. En 320, 390 y 1440 px, la fotografía comienza en x=0 y termina exactamente en el ancho del documento. El ancho desplazable coincide con el viewport. La imagen cubre toda la portada y la taza permanece reconocible. |
| Cambio visible respecto al anterior | PASS. En 390 px, la imagen anterior ocupaba x=16 a x=374 y terminaba antes del bloque de texto. La nueva ocupa x=0 a x=390 y mantiene título y acción sobre la foto. La diferencia satisface el objetivo solicitado. |
| Carta única | PASS. Hay un único botón promocional «Explorar la carta»; el acceso global de navegación permanece. El botón enfocado queda libre y Enter conduce a `/pedir` en 320 y 390 px. |
| Pase accesible | PASS. En 320 y 390 px está entre y=128 y y=176, visible antes de la foto y sin obstrucción. Enter abre el pase; Escape cierra y devuelve el foco al mismo acceso. |
| Productos con teclado | PASS. En 320 y 390 px, Tab recorre los tres productos y Shift+Tab regresa al segundo y primero. Cada tarjeta enfocada queda completa dentro del viewport y por encima de la navegación fija. Enter abre el detalle de Pizza Churrasco. |
| Cuenta y recarga | PASS. La cuenta conserva saldo e instrucciones; el control de recarga enfocado queda libre. La hoja explica la recarga en caja y permite abrir el pase. Solo se utilizaron datos sintéticos locales. |
| Texto al 200 % | PASS en el muestreo de 320 × 568 y 1440 × 1000. Se comprobó el tamaño raíz de 16 a 32 px, esperando el reflujo antes de medir. No aparece overflow horizontal; Carta y el producto enfocado permanecen operables, y el detalle abre. |

En 320 × 568, el botón de Carta está inicialmente por debajo del primer pliegue (y=592 a 640); es la condición expresamente admitida. El pase sí permanece visible. Al enfocar Carta, el desplazamiento deja el botón completo y libre. La navegación móvil con texto al 200 % divide algunas palabras en varias líneas, pero en esta prueba no tapa los controles enfocados ni impide la operación.

**Evidencia propia:** [medidas.json](evidencia/objetivo/medidas.json), [uso.json](evidencia/objetivo/uso.json) — 32 comprobaciones de uso aprobadas — y capturas [320](evidencia/objetivo/despues-320.png), [390](evidencia/objetivo/despues-390.png), [1440](evidencia/objetivo/despues-1440.png), [anterior 390](evidencia/objetivo/antes-390.png), [Carta enfocada 320](evidencia/objetivo/carta-foco-320.png), [tercer producto 320](evidencia/objetivo/producto-320-3.png), [detalle 320](evidencia/objetivo/detalle-320.png), [recarga 320](evidencia/objetivo/recarga-320.png), [Carta al 200 %](evidencia/objetivo/texto200-carta-320.png) y [producto al 200 %](evidencia/objetivo/texto200-producto-320.png). Los dos scripts propios reproducen este muestreo.

Se contrastaron además los resultados existentes: aceptación (11 grupos), composición inmersiva (133 comprobaciones, cero fallos), estabilidad y regresión. Esas suites no se volvieron a ejecutar. El PASS se limita a esta portada y a las interacciones descritas; no certifica el 100 % de la aplicación, estados de negocio reales ni producción. No se publicó ningún cambio.
