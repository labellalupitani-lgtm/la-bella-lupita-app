# Revisión independiente de objetivo y uso — Inicio

**Veredicto vigente: PASS — ronda 2.**

## Ronda 1 — FAIL

**Veredicto inicial: FAIL**

Revisión: 21 de octubre de 2026. Alcance solicitado: portada de Inicio más visual, con menos texto y cabecera, manteniendo carta, pase y funciones reales accesibles. Se revisó el render compilado de `http://127.0.0.1:5190/__preview/entrar` en Microsoft Edge headless mediante Playwright, a 320×844, 390×844 y 1440×900. No se consultó código de implementación ni notas del constructor. No se modificó la aplicación ni se publicó.

La portada cumple la dirección de producto: fotografía y CTA Carta dominan la primera vista; pase visible arriba; tres platos disponibles; cabecera más contenida y menos texto que la captura anterior. Hay un defecto reproducible de lectura al navegar el carrusel con teclado, por lo que todavía no aprueba.

## Hallazgo que bloquea la aprobación

### P2 — Risotto recibe foco sin entrar completamente en pantalla

**Ubicación:** Inicio → «Para acompañar» → segunda tarjeta, «Risotto de Gallo Pinto», en móvil de 320 y 390 px.

**Reproducción:**

1. Entrar a la vista previa y esperar a que aparezca «Explorar la carta».
2. Con Tab, llegar a la tarjeta «Pizza Churrasco».
3. Pulsar Tab una vez más para enfocar «Risotto de Gallo Pinto».
4. Esperar al menos 350 ms.

**Resultado observado:** el borde de foco aparece en el extremo derecho, pero el carrusel no desplaza la segunda tarjeta. El nombre queda cortado; en 320 px también queda incompleto el precio. La tarjeta ocupa x=244,8–457,6 en viewport de 320 px y x=298–564 en viewport de 390 px. El tercer plato sí provoca un desplazamiento posterior. Enter abre el detalle correcto del Risotto, de modo que el problema es la visibilidad y lectura de la acción enfocada.

**Impacto:** una persona que navega con teclado no puede leer completamente qué plato está seleccionando antes de activarlo. La presentación visual de la carta pierde contexto justo en su acción principal.

**Corrección solicitada:** desplazar el carrusel horizontalmente para dejar visible la tarjeta completa cada vez que recibe foco, conservando el desplazamiento táctil. Revalidar Tab primero→segundo→tercero y Shift+Tab tercero→segundo→primero en 320 y 390 px.

**Evidencia:**

- [Foco Risotto a 320 px](evidencia/objetivo/foco-320-Risotto.png).
- [Foco Risotto a 390 px](evidencia/objetivo/foco-390-Risotto.png).
- [Coordenadas y estados sintéticos](evidencia/objetivo/foco-estados.json).
- [Prueba reproducible](evidencia/objetivo/foco-estados.cjs).

## Comprobaciones que pasan

| Comprobación | Resultado observado |
|---|---|
| Primera vista en 320/390/1440 | Foto, pase y «Explorar la carta» visibles; ancho de documento igual al viewport; sin desbordamiento global. |
| CTA Carta | Abre `/pedir`. |
| Tres productos | Pizza, Risotto y Dulce Tentación abren `/pedir?plato=…` y el detalle con nombre y precio correspondientes. |
| Pase | Abre el panel y muestra el identificador sintético. Escape cierra y devuelve foco al botón de apertura. |
| Cuenta y privacidad | «Ocultar saldo en Inicio» reemplaza el saldo por puntos, persiste al recargar y puede revertirse. |
| Recarga | Panel explica pago en caja, límites y actualización; «Enseñar mi pase» abre el pase. |
| Saludo y perfil | «Tu casa, Vista» y acceso «Ver perfil de Vista» conservan identidad y abren `/perfil`. |
| Movimientos | Conserva acceso a `/perfil`, donde se encuentra el contenido de cuenta. |
| Sellos | Inicio muestra 8/9; «Ver reglas y beneficios» abre `/club`, que mantiene 8 de 9 y reglas. |
| Reserva y tienda | Accesos abren `/reservar` y `/tienda`. |
| Avisos | «Ver mis avisos» abre `/compras` con aviso sintético. |
| Pedido activo | Estado sintético «Estamos preparando tu pedido · #987654» aparece antes de la fotografía; «Seguir mi pedido» abre `/compras`. |
| Reserva activa | Fecha, hora y 12 personas se muestran antes de la fotografía; «Ver mi reserva» abre `/compras`. |
| Error de seguimiento | HTTP 500 sintético muestra que no se pudieron comprobar pedidos/reservas/avisos, con acción de actualización. Restaurar respuesta y pulsar «Actualizar Inicio» recupera el estado normal. |

Capturas generales: [320](evidencia/objetivo/vista-320.png), [390](evidencia/objetivo/vista-390.png), [1440](evidencia/objetivo/vista-1440.png). Evidencia de navegación, privacidad y paneles: [registro](evidencia/objetivo/revision.json), [teclado y error](evidencia/objetivo/teclado-error.json), [paneles confirmados](evidencia/objetivo/paneles-confirmacion.json). El sondeo de teclado inicial de `revision.json` ocurrió antes de terminar la hidratación; la prueba válida de teclado es `teclado-error.json` y su confirmación en `foco-estados.json`.

## Alcance y límites

`/__preview/status` confirmó PGlite en memoria, credenciales sintéticas y salida externa bloqueada. Los escenarios de pedido/reserva y el error se inyectaron exclusivamente en el contexto aislado del navegador mediante interceptación de `/api/inicio/contexto`; no crearon compras ni reservas. Se verificaron presentación y destino de esos botones, no entrega real ni pagos. La comparación de dirección visual utilizó la captura anterior de 390 px; no se auditó el resto de la aplicación ni un lector de pantalla real. El defecto de foco fue repetido en ambas anchuras móviles y documentado después de esperar a que el render y el desplazamiento terminaran.

## Ronda 2 — PASS

Revalidación sobre nueva compilación en el mismo servidor, 21 de octubre de 2026 a las 12:28 UTC. La revisión se limitó al defecto del carrusel y sus destinos; se preserva arriba el resultado inicial.

**Resultado:** corrección reproducida. Tab permite avanzar Pizza → Risotto → Dulce y Shift+Tab volver Dulce → Risotto → Pizza con la tarjeta enfocada completamente visible, tanto a 320 como a 390 px. El nombre y precio del Risotto ahora se leen completos. Sus coordenadas son x=15,8–228,6 en 320 px y x=16–282 en 390 px. Las diez observaciones de foco (cinco por anchura) pasan.

Enter en cada uno de los tres productos abre su detalle correspondiente en ambas anchuras: seis activaciones comprobadas con ruta y encabezado correctos. No quedan hallazgos abiertos de esta revisión de objetivo/uso.

- [Risotto con Tab, 320 px](evidencia/objetivo/ronda2/foco-320-tab-2.png).
- [Risotto con Shift+Tab, 390 px](evidencia/objetivo/ronda2/foco-390-shift-2.png).
- [Registro de los diez focos y seis destinos](evidencia/objetivo/ronda2/resultado.json).
- [Script de revalidación](evidencia/objetivo/ronda2/revalidar.cjs).

La evidencia completa de avance, retroceso y detalle está en `evidencia/objetivo/ronda2/`. No se leyó implementación ni se modificó la app, los builds o el servidor. El PASS se refiere al objetivo y al alcance documentado, manteniendo los límites de la vista previa sintética indicados arriba.
