# Revisión independiente de sistema — ronda 1

Fecha: 21 de octubre de 2026 (Managua). Criterio único: `design-system.md`. No se leyó implementación ni informes de deconstrucción. Se juzgó el render de Tienda, Mi Club y Perfil, sus estados y controles; no gustos personales ni aspiraciones a premios.

## Compilación y entorno verificados

- Preview: `http://127.0.0.1:5296`.
- `/__preview/status`: preview activa, PGlite en memoria, salida externa bloqueada, credenciales sintéticas, frontend compilado.
- Compilación revalidada desde cargas nuevas: `principal-C1ep5tM_.js` (ronda 2 del producto). Las capturas válidas de este informe están en `evidencia-sistema/r2/`; las capturas de la raíz corresponden a la compilación anterior y no fundamentan el veredicto actual.
- Edge headless, contexto aislado, rutas externas abortadas en el navegador. Sin compras, canjes, renovación, envío de solicitudes ni guardado de cambios de perfil. El ensayo de borrador solo modificó un campo local y cerró el contexto sin guardarlo.
- 390 × 844, 913 × 900 con `scrollbar-gutter: stable`, 1440 × 1000 y 320 × 850 con texto al 200 % y movimiento reducido. En texto 200 % se duplicó una sola vez el tamaño computado de cada elemento tras abrir el estado, manteniendo el viewport; se recargó antes de cada estado para evitar acumulación.
- 32 estados capturados: Tienda/retirada; Mi Club/pase/detalles; Perfil/A tu gusto/Tu cuenta/Datos y ayuda. Evidencia adicional: foco de teclado, nombre sintético largo y editor/borrador.

## Veredicto binario

| Pieza | Resultado | Motivo |
| --- | --- | --- |
| Tienda | **FAIL** | El distintivo sobre la foto se recorta y se superpone a la aclaración de imagen de ambiente con texto 200 % a 320 px. |
| Mi Club | **FAIL** | El ordinal 01 introduce desborde horizontal y el bloque 250 g queda recortado con texto 200 % a 320 px. |
| Perfil | **FAIL** | Las filas de cumpleaños y alergias conservan columnas demasiado estrechas a 320 px/200 %, fragmentando palabras de lectura ordinaria. |
| Pase, editor y detalles desplegables | **PASS** | Identidad consistente, texto accesible mediante scroll, controles y cierre accesibles; no se observó pérdida de información en los estados probados. |

Los tres fallos corresponden al criterio explícito de reflujo y legibilidad. El sistema visual funciona en los anchos normales, pero eso no compensa estos estados solicitados.

## Defectos reproducibles

### S1 · Tienda: distintivo y leyenda compiten y se recortan (P2)

**Reproducción:** abrir `/tienda` a 320 px, duplicar tamaños de texto una sola vez y mirar la foto inicial.

**Evidencia:** [captura de Tienda a 320/200 %](evidencia-sistema/r2/tienda-320-text200-reduced-top.png).

**Resultado:** el texto «DE LA CASA / a tu taza» desborda el círculo de tamaño fijo, su parte superior se corta y la parte inferior coincide con «Una pausa en la casa · imagen de ambiente». La aclaración contextual sigue presente, pero su lectura compite con texto decorativo superpuesto.

**Impacto:** rompe el reflujo y la legibilidad de la distinción entre imagen contextual y producto, precisamente una aclaración exigida por el sistema.

**Corrección concreta:** permitir que el distintivo tome altura y ancho de contenido o trasladarlo fuera del plano de la leyenda cuando no caben ambos. Al ser decorativo puede ocultarse en esa configuración; preservar la aclaración de imagen de ambiente.

### S2 · Mi Club: el ordinal 01 excede la anchura (P2)

**Reproducción:** `/club`, 320 px y texto al 200 %; revisar la cabecera de beneficios.

**Evidencia:** [ordinal fuera del ancho](evidencia-sistema/r2/defecto-club-ordinal-320-text200.png), [mediciones completas](evidencia-sistema/r2/mediciones-r1.json). Elemento observado en DOM: `.club-numero`.

**Medición:** x = 263,6875 px, ancho = 57,6094 px, extremo derecho = 321,2969 px. Documento: `scrollWidth = 321`, viewport = 320. Los otros anchos normales no presentan desborde.

**Impacto:** genera desplazamiento horizontal en una página que debe refluir. Aunque la diferencia sea pequeña, la causa está identificada y es corregible.

**Corrección concreta:** permitir que cabecera y ordinal salten de línea o reducir el espacio que reserva el título cuando el conjunto no cabe. No resolver tapando globalmente el desborde.

### S3 · Mi Club: el texto 250 g rebasa su franja fija (P2)

**Reproducción:** `/club`, 320 px, texto al 200 %; desplazar hasta el beneficio de bolsa.

**Evidencia:** [recorte del bloque 250 g](evidencia-sistema/r2/defecto-club-peso-320-text200.png), [mediciones adicionales](evidencia-sistema/r2/adicionales-r2.json).

**Medición:** `.club-peso` tiene ancho 131,0938 px y x = −7,5469 px dentro de un padre de 84 px situado en x = 16. Se recortan los extremos del peso; el texto contiguo queda forzado a una columna muy estrecha.

**Impacto:** una cifra legible en el sistema normal pierde forma al ampliar el texto. El título contiguo repite la cantidad, de modo que no se pierde el dato completo, pero sí falla la pieza visual y su reflujo.

**Corrección concreta:** convertir la tarjeta a una disposición vertical cuando el contenido ampliado no cabe, o dimensionar la franja por contenido. Mantener el texto ampliado y la cifra completa.

### S4 · Perfil: filas de lectura con palabras fragmentadas (P2)

**Reproducción:** `/perfil`, panel A tu gusto, 320 px, texto al 200 %; desplazar a cumpleaños y alergias.

**Evidencia:** [filas de Perfil ampliadas](evidencia-sistema/r2/perfil-320-text200-reduced-middle.png).

**Resultado:** los iconos y acciones conservan sus columnas y dejan el cuerpo de texto reducido; «septiembre» y «indicaste» se parten dejando una letra sola en otra línea. La fecha y el estado de alergias se pueden reconstruir, pero su lectura normal se deteriora de manera evitable.

**Impacto:** el tamaño mayor solicitado no se traduce en mejor legibilidad en estas filas, y el estado de alergias es contenido que requiere lectura clara.

**Corrección concreta:** apilar icono, contenido y acción, o mover la acción a una segunda fila en el ancho estrecho. La columna principal necesita espacio para palabras ordinarias; evitar usar ruptura arbitraria como la única estrategia de ajuste.

## Evidencia positiva que se conserva

- **Tipografía e identidad:** Playfair Display para títulos y Montserrat para lectura/controles están cargadas y alojadas localmente (`/fuentes/diseno/playfair-latin.woff2` y `/fuentes/diseno/montserrat-latin.woff2`). Las tres piezas sostienen cacao, papel, crema, rosa y borgoña, radios existentes y bordes selectivos. Las fotos se integran como contexto; Tienda muestra una aclaración explícita.
- **Jerarquía y ritmo:** en 390, 913 con gutter y 1440 px los títulos, separadores, tarjetas y acciones forman una jerarquía consistente. Los tres paneles de Perfil mantienen el mismo ancho y ritmo. Véanse las capturas `*-390-full.png`, `*-913-gutter-top.png` y `*-1440-top.png` en la carpeta r2.
- **Contraste de pares observados:** cacao sobre papel 11,46:1; texto secundario #76574B sobre papel 6,03:1; crema sobre borgoña 6,81:1; crema sobre cacao 12,13:1. El ordinal decorativo #957569 sobre papel mide 3,88:1 y usa tamaño grande. No se identificó un fallo de contraste en estos pares.
- **Números:** los importes de saldo y movimientos inspeccionados usan `font-variant-numeric: tabular-nums`; se leen con claridad.
- **Foco:** evidencia visible para [acción principal Tienda](evidencia-sistema/r2/tienda-foco-390.png), [pase Mi Club](evidencia-sistema/r2/club-foco-390.png) y [tab Perfil](evidencia-sistema/r2/perfil-foco-390.png). Los tres estaban en estado `:focus-visible`. Escape cierra el pase y devuelve foco a «Mostrar mi pase».
- **Nombre largo:** «María Fernanda de los Ángeles Rodríguez Montenegro» se inyectó solo en respuestas sintéticas del navegador, sin cambiar PGlite. Nombre completo visible sin desborde a 390, 913 y 1440; [Perfil 390](evidencia-sistema/r2/perfil-nombre-largo-390.png), [tarjeta Club 390](evidencia-sistema/r2/club-nombre-largo-390.png), [pase 390](evidencia-sistema/r2/pase-nombre-largo-390.png).
- **Pase ampliado:** permite scroll interno hasta «Ver cómo usarlo» sin recorte irreversible; [pase 320/200 % al final](evidencia-sistema/r2/club-pase-320-text200-abajo.png).
- **Consentimiento y borrador:** editor conserva avisos de alergias, carácter opcional, promociones y comunicaciones necesarias. El borrador local reaparece tras cerrar/reabrir; la página informa el alcance de su conservación. [Aviso de borrador](evidencia-sistema/r2/perfil-aviso-borrador-390.png), [editor ampliado y consentimiento](evidencia-sistema/r2/perfil-editor-320-text200-bottom.png). No se pulsó Guardar cambios.
- **Movimiento reducido:** en los 8 estados a 320 px con `prefers-reduced-motion: reduce` no se encontraron duraciones activas de transición ni animación en el DOM visible.
- **Textos corregidos:** la fecha de finalización de Mesa Fundadora ya no contiene el punto final duplicado observado en la compilación anterior.

## Alcance de la conclusión

Se aprueba la consistencia del lenguaje visual y de los componentes normales; la aceptación global de las páginas queda suspendida por S1–S4. Esta revisión no certifica uso interno de `theme()` ni procedencia de archivos fotográficos: no se abrió código de implementación. Tampoco usa un resultado automático de axe como aprobación visual. Las mediciones, capturas y decisiones se basan en el render efectivo.

