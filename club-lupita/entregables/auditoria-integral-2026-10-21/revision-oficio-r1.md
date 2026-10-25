# Revisión independiente de oficio visual — ronda 1

Fecha: 21 de octubre de 2026. Objeto: propuestas locales en `http://127.0.0.1:5310/compra`, `/visitas` y `/equipo`. Dictamen posterior a la corrección de Visitas móvil observada durante esta ronda.

| Propuesta | Dictamen de oficio | Impedimento material al cierre |
|---|---|---|
| Compra | **PASS** | No encontrado en las muestras revisadas. |
| Visitas | **PASS tras corrección** | Cerrado V1: la imagen y su texto ya no se comprimen en una columna residual móvil. |
| Equipo | **PASS** | No encontrado en las muestras revisadas. |

Este dictamen acredita composición, jerarquía, densidad y calidad visual de los estados observados de las demos. No acredita integración, operaciones de negocio ni una auditoría integral de accesibilidad. La revisión estricta de identidad, contraste, teclado, texto al 200% y anchos intermedios corresponde al otro frente. No se asignan puntuaciones ni se infiere funcionamiento a partir de referencias conceptuales.

## Método y separación

Se leyeron únicamente `bar.md`, la dirección visual aprobada de `entregables/redisenio-2026-10-20/design-system.md` y `REFERENCIAS.md`. No se leyó implementación ni dictámenes de otros árbitros. Se inspeccionaron renders de Edge/Playwright a 1440×1000, 390×844 y 320×844; las interacciones se efectuaron mediante controles visibles de las propuestas y datos simulados. Los scripts propios y los registros de texto renderizado están en [revision-oficio](revision-oficio/).

La comparación anterior utiliza las capturas congeladas de `/pedir`, `/reservar` y pedidos del personal que se enlazan abajo. No se presentan como una prueba comparativa de velocidad ni como un recorrido idéntico: Compra anterior abre Café y la propuesta abre seis opciones de Para hoy; Equipo anterior mostrado es Propietario y la propuesta comienza en Caja.

## Compra — PASS

La cuadrícula de escritorio hace visibles tres productos, sus descripciones, precios y acciones en paralelo. El pedido ocupa una columna secundaria estable. En móvil, imagen y texto quedan juntos y los controles de agregar conservan una relación inequívoca con su producto. La fotografía identifica alimentos concretos; no ocupa una portada que obligue a pasar un relato antes de elegir.

La diferencia respecto a la base es observable: el gran destacado de Latte y su repetición en la lista ceden lugar a tarjetas homogéneas. El primer producto móvil conserva una fotografía reconocible y obtiene una acción explícita de agregar. La propuesta favorece explorar varios platos; la lista anterior de Café era más compacta para comparar muchas bebidas. No hay fundamento para afirmar que toda selección sea más rápida.

Se abrieron las opciones de Risotto, se agregó Latte y se recorrieron carrito y revisión previa al pago. En la revisión, productos, empaque, total, saldo y botón con importe pertenecen al mismo bloque. A 320 el detalle de Risotto tiene desplazamiento interno: el campo obligatorio, la cantidad y el botón final siguen alcanzables; se completó el campo y se agregó el producto. No se hizo ningún cobro real.

Evidencia: [actual 1440](revision-oficio/compra-1440.png), [actual 390](revision-oficio/compra-390.png), [actual 320](revision-oficio/compra-320.png), [detalle 390](revision-oficio/compra-detalle-390.png), [final del detalle 320](revision-oficio/compra-detalle-320-final.png), [revisión de pago 320](revision-oficio/compra-pago-revision-320.png). Base: [anterior 1440](compra/capturas/cliente-pedir-1440.png), [anterior 390](compra/capturas/cliente-pedir-390.png).

## Visitas — PASS tras corrección

Fecha, personas, duración, zona y hora forman una secuencia legible. La distinción entre elegir, revisar y confirmar se expresa mediante títulos, grupos y acciones. El importe y las condiciones aparecen en la revisión. El error de horarios ocupa el lugar de los horarios y ofrece reintento conservando contexto. La confirmación cambia título y estado y mantiene acciones de cambio, calendario y cancelación.

En escritorio, el formulario tiene prioridad a la izquierda y la foto identifica la terraza a la derecha. En móvil corregido, la foto queda después de la acción principal, con encuadre reconocible y texto completo. La nota delimita que esa imagen no representa otras zonas. Frente a la base, que comienza con selección de lugar y un paso separado para fecha y grupo, la propuesta concentra esas elecciones en un formulario. La captura no permite atribuir una reducción cuantificada de tiempo.

**V1, impedimento inicial cerrado:** a 390 la foto inferior quedó en una columna de unos 96 px y su texto se dividió en fragmentos de una a tres letras. A 320 quedó una franja todavía más estrecha, con una gran extensión vertical. Esto incumplía multimedia útil, ritmo y reflujo. Se comunicó el requisito de apilar o recomponer el bloque sin ocultar desbordamiento. Tras la corrección, recargas limpias a 320 y 390 muestran resumen, fotografía y nota apilados, sin la columna residual. Se preserva evidencia inicial y final.

Mejora no bloqueante: la revisión y la confirmación repiten la información de la visita en un segundo resumen móvil situado después de las acciones. Una única síntesis bastaría en esos estados y reduciría desplazamiento. No impide la decisión ni oculta controles, por lo que no se convierte en FAIL.

Evidencia inicial del fallo: [390](revision-oficio/visitas-390.png), [320](revision-oficio/visitas-320.png). Evidencia final: [1440](revision-oficio/visitas-corregida-1440.png), [390](revision-oficio/visitas-corregida-390.png), [320](revision-oficio/visitas-corregida-320.png), [revisión 390](revision-oficio/visitas-revision-390.png), [confirmada 320](revision-oficio/visitas-completada-320.png), [error 390](revision-oficio/visitas-error-390.png). Base: [anterior 1440](visitas/capturas/base-cliente-reservar-1440.png), [anterior 390](visitas/capturas/base-cliente-reservar-390.png).

## Equipo — PASS

La tarea se reconoce desde el título, los conteos y el orden explícito de antigüedad. Cada tarjeta reúne identificador, estado escrito, cliente, espera, productos, total y siguiente acción. La restricción alimentaria tiene una agrupación propia y confirmación legible. No requiere interpretar solo colores ni descubrir una acción por hover.

La primera vista de la base móvil está ocupada por cabecera, sesión y el formulario de búsqueda; la propuesta ya muestra un pedido accionable en el primer viewport de 390. Los filtros por estado quedan expuestos y la búsqueda secundaria se puede abrir. En escritorio se comparan tres pedidos por fila. La ausencia de fotografía en este recorrido es adecuada: las cantidades y estados son la información útil para operar.

Se aceptó un pedido, se abrió la cancelación y se provocó respuesta perdida con el escenario local. La cancelación reúne pedido, devolución, advertencia, motivo y confirmación. El resultado incierto presenta un aviso distinguible con «Comprobar estado», y las tarjetas explican por qué queda detenida la acción. Los cambios de estado se perciben en texto y controles, sin depender de una animación.

Mejora no bloqueante: en escritorio, una tarjeta con restricción hace más alta su fila y deja huecos bajo sus vecinas. No interrumpe el orden ni esconde una acción. En móvil la lista de 26 pedidos es extensa; los filtros permiten reducirla, aunque mantenerlos accesibles durante el desplazamiento mejoraría el uso continuado.

Evidencia: [primera vista 1440](revision-oficio/equipo-viewport-1440.png), [390](revision-oficio/equipo-viewport-390.png), [320](revision-oficio/equipo-viewport-320.png), [aceptado 390](revision-oficio/equipo-aceptar-390.png), [cancelación 320](revision-oficio/equipo-cancelar-320.png), [resultado incierto 390](revision-oficio/equipo-respuesta-perdida-390.png), [composición completa 1440](revision-oficio/equipo-1440.png). Base: [anterior móvil](equipo/capturas/antes-propietario-pedidos-390.png).

## Alcance del cierre

En las tres propuestas, la acción, sus datos decisivos y la continuación de los estados observados tienen calidad visual suficiente para presentar la propuesta a revisión. El único impedimento material encontrado por este árbitro fue V1 y quedó cerrado con evidencia. Los PASS no sustituyen las comprobaciones funcionales ni amplían el alcance a la aplicación integrada.
