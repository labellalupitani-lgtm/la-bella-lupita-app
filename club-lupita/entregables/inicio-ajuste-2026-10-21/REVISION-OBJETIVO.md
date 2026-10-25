# Revisión independiente de objetivo y uso — sexta Inicio

**Dictamen final: PASS.** La revalidación independiente de la tercera ronda cierra el único hallazgo de continuidad y prioridad. El objetivo de foto/carta y los accesos recurrentes se cumplen en el alcance revisado.

Revisión del render compilado en http://127.0.0.1:5190/__preview/entrar, Chromium con Playwright local. Bundle de cierre observado: /assets/principal-d6VqfP8e.js; la evidencia de las rondas previas corresponde a /assets/principal-BIRiwIr-.js. No leí TSX/CSS ni el informe del constructor, ni cambié aplicación o tests. Criterio: entregables/investigacion-diseno-2026-10-21/bar.md. Se usaron mocks por página para los estados; no se mutó el fixture compartido.

## Rondas y cierre independiente

- Rondas 1–2: se comprobaron composición, acciones, estados y accesibilidad de uso. La prueba adicional de historial reprodujo el P2 documentado abajo en el bundle /assets/principal-BIRiwIr-.js.
- Ronda 3, bundle /assets/principal-d6VqfP8e.js: se repitió la misma reproducción con pedido y reserva nuevos, tanto con respuesta inmediata como con demora de 800 ms. Las cuatro combinaciones pasan. El pedido queda visible en y=48,98–92,98; la reserva en y=59,39–103,39. En todos los casos scrollY=137 y el foco está en la acción prioritaria correspondiente.
- Control de regresión: sin nueva prioridad, el regreso por historial conserva exactamente desplazamiento, posición horizontal y foco de Dulce Tentación. A 390: scrollY=115, x=219; a 320: scrollY=545, x=153,78. Ambas verificaciones pasan.

No queda una brecha de objetivo reproducible dentro del alcance de esta revisión. Se conserva el detalle del fallo anterior para hacer trazable su cierre.

Evidencias de cierre: [retorno con pedido y demora](evidencia/objetivo/R3-retorno-pedido-800ms.png), [reserva y demora](evidencia/objetivo/R3-retorno-reserva-800ms.png), [cuatro comprobaciones prioritarias](evidencia/objetivo/R3-retorno-prioritario.json), [regreso normal 390/320 y bundle](evidencia/objetivo/R3-retorno-normal.json), [Inicio final 390](evidencia/objetivo/R3-inicio-390.png).

## Hallazgo de ronda 2 — CORREGIDO: retorno ocultaba una prioridad nueva

**P2 corregido. En la ronda 2, el historial restauraba el área de productos cuando acababa de aparecer un pedido o reserva.** Incumplía la conservación de prioridades y la continuidad al actuar exigidas por los criterios 3, 6 y 7. La ronda 3 valida su corrección con respuesta inmediata y demorada.

Reproducción a 390 × 844:

1. Abrir Inicio con /api/inicio/contexto = {pedido:null,reserva:null,avisos:0,ahora:fechaActual}.
2. Desplazar verticalmente hasta scrollY=450, dejando las tarjetas de producto cerca del borde superior.
3. Abrir Pizza Churrasco.
4. Cambiar solo la respuesta simulada de contexto a pedido {numero:987654,estado:'preparando'}.
5. Volver con el historial del navegador.

Resultado: Inicio queda en scrollY=580. “Seguir mi pedido” está en y=-394,02, alto 44: existe, pero no es visible. La persona vuelve a los productos sin ver el estado nuevo. Con reserva {zona:'Zona de prueba',cuando:'2027-01-30T18:30:00.000Z',personas:2}, queda en scrollY=601 y “Ver mi reserva” en y=-404,61.

Resultado requerido: cuando el regreso detecta una prioridad nueva, el bloque prioritario y su acción deben quedar visibles; si no hay prioridad nueva, debe conservarse el contexto del producto.

Evidencia: [pedido](evidencia/objetivo/FINAL-retorno-prioritario.png), [medidas de pedido](evidencia/objetivo/FINAL-retorno-prioritario.json), [reserva](evidencia/objetivo/FINAL-retorno-reserva.png), [medidas de reserva](evidencia/objetivo/FINAL-retorno-reserva.json).

## Criterios cumplidos

| Prueba | Observación |
| --- | --- |
| 390 × 844 con aviso local | Pizza y Risotto muestran foto, nombre y precio completos. Tarjetas hasta y=765,39; navegación desde y=771. Separación de 5,61 px. |
| 1440 × 1000 | Tres productos reconocibles con nombre/precio dentro del primer viewport. Pizza termina en y=990,81. |
| 320 × 568 | Se permite desplazamiento vertical. Pase visible en y=140 y alto 44. Sin overflow horizontal del documento. La tercera tarjeta se coloca completa al enfocar. |
| Texto al 200 % | Tamaño raíz de 16 a 32 px. Sin overflow. La navegación refluye en 3+2 con palabras enteras y altura de 158,59 px. Producto enfocado y última acción quedan por encima. |
| Pase y actualización | Pase 141,25 × 44 px y Actualizar Inicio 44 × 44 px a 390. Nombres accesibles. Pase abre el diálogo “Tu pase de la casa”; Escape restaura foco. |
| Producto, regreso normal | Tab permite recorrer las tarjetas y Enter abre foto/nombre/precio de Dulce Tentación. Cerrar ficha y Volver conserva scroll y foco de la tarjeta si no aparece una prioridad nueva. También funciona con movimiento reducido. |
| Jerarquía de entrada | Foto hasta ambos bordes, titular breve y acción hacia carta. No se añadió un párrafo promocional antes de los productos. |

## Funciones y estados comprobados

- Pedido/reserva activos al cargar: seguimiento inmediatamente bajo cabecera y antes de la foto, con acciones de 44 px. Pedido muestra estado/número; reserva, fecha/personas. Ambos llevan a Mis compras y reservas (/compras).
- Error 503 de cuenta: conserva datos anteriores, explica que son de la última consulta, muestra fecha y reintento. Restaurar la respuesta y pulsar reintento elimina el error. Revalidado en el bundle señalado.
- Error 503 de seguimiento: comunica que no pudo comprobar pedidos/reservas/avisos y “Actualizar seguimiento” recupera el bloque al restaurar la respuesta.
- Error inicial en contexto nuevo: muestra “No pudimos abrir tu cuenta” y “Probar de nuevo”; no presenta saldo inventado.
- Saldo/privacidad: ocultar sustituye el monto por puntos y persiste tras recargar; se puede mostrar otra vez. Ver movimientos abre Perfil con movimientos.
- Recargar en caja: abre instrucciones, límites, acceso al pase y actualización del saldo. Sin ejecutar recarga.
- Sellos/premio: 8/9 y mensaje correspondiente visibles. Reglas abre Mi Club. Mock de premio pendiente muestra premio, nueva tanda 0/9 y abre su panel.
- Reservar mesa abre el selector de reserva. Ninguna de las acciones revisadas necesita hover.

## Límites de la revisión

Este dictamen es de objetivo/uso observado, no de acabado estético ni una certificación WCAG, de contraste o rendimiento. No sustituye las revisiones de identidad/acabado ni el tester técnico. La ampliación fue de texto raíz en Chromium; no se usó lector de pantalla.

Se bloquearon los métodos de mutación de API. No se validaron pagos, recargas, creación de reservas ni emisión/canje de premios. El panel del premio muestra resultado no confirmado porque su mutación fue bloqueada; no es un hallazgo del producto. Los destinos de seguimiento se abrieron, pero no contenían el pedido/reserva del mock de Inicio, porque no se escribió el fixture.

## Evidencias del resto del recorrido

Capturas prefijadas R3 pertenecen al bundle de cierre principal-d6VqfP8e.js. Las prefijadas FINAL pertenecen a la ronda 2 (principal-BIRiwIr-.js); las numeradas documentan estados anteriores. La corrección final no cambia la composición, y se recapturó Inicio a 390.

- [390](evidencia/objetivo/FINAL-390.png), [320](evidencia/objetivo/FINAL-320.png), [foco 320](evidencia/objetivo/FINAL-320-foco.png), [1440](evidencia/objetivo/FINAL-1440.png).
- [Texto 200 %](evidencia/objetivo/FINAL-200-texto.png), [producto enfocado](evidencia/objetivo/FINAL-200-foco.png), [última acción](evidencia/objetivo/FINAL-200-ultima-accion.png).
- [Medidas](evidencia/objetivo/FINAL-medidas.json), [revalidación funcional](evidencia/objetivo/FINAL-revalidacion.json), [teclado](evidencia/objetivo/teclado.json), [destinos de seguimiento](evidencia/objetivo/destinos-seguimiento.json).
