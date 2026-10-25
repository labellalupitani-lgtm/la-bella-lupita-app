# Cuarta composición de Inicio

Usuario: «Seguir ajustando Inicio» y después «Una portada más visual, con menos texto y cabecera». La propuesta anterior quedó técnicamente revisada pero no aprobada visualmente. Copia de fuentes y compilación en `antes/`.

Diagnóstico: en 390, 203 px de marca/utilidades antes de foto (sin contar aviso local); portada casi dividida por igual entre foto de 227 px y texto/CTA de 232 px. La dirección [bar.md](bar.md) recupera espacio para fotografía y consolida texto/acciones. Se dispone de manual, sistema, referencias y fotografías propias; navegador y captura locales funcionan. No se necesita generación de activos y ningún crítico queda sin material visual.

- Implementación: integrada. Foto de café existente, cabecera compacta, titular breve/CTA único, saludo y nivel junto a cuenta; pase y actualización visibles, estados prioritarios conservados.
- Pruebas: build, 59 comprobaciones de composición, 11 grupos de aceptación, nueve grupos de regresión y siete escenarios de estabilidad aprobados. Tras el arreglo de foco se repitieron build, composición y aceptación con una prueba nueva de Tab/Shift+Tab/Enter.
- Objetivo: ronda 1 FAIL por tarjeta enfocada recortada; ronda 2 PASS tras corrección y reproducción en 320/390.
- Identidad: PASS. Firma completa y reserva H/4, contraste mínimo medido 5.43:1, cuatro anchos, diálogos, texto al 200% y foco completo con reserva horizontal de 4 px.
- Acabado: PASS y revalidación posterior al arreglo de foco. La diferencia fotográfica frente a referencias (encuadre con manos más cerrado en escritorio) se registra como observación, no como defecto bloqueante.
- Validación visual: el usuario pidió seguir ajustando y eligió «Una portada más inmersiva, con la foto a todo el ancho». Esta propuesta no se aprobó para extender. Próxima iteración en `../inicio-inmersivo-2026-10-21/`.
- Publicación: no autorizada ni realizada.

## Hallazgo y corrección

El árbitro de objetivo encontró que Tab hacia Risotto dejaba parte de su nombre/precio fuera del carrusel móvil. Se incorporó desplazamiento horizontal al recibir foco cuando la tarjeta no está completa. La primera verificación automatizada detectó que el ajuste de scroll-snap pegaba el aro al borde; se añadió reserva horizontal de 4 px para mantener el foco completo. La prueba final verifica avance y retroceso en ambos tamaños, además de Enter al detalle. Los árbitros de objetivo y acabado confirmaron las tarjetas completas; el contenido, navegación y comportamiento táctil se conservan.
