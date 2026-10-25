# Especificación de movimiento y respuesta

La aplicación tiene transiciones; su carencia principal es la jerarquía de los cambios de estado. Añadir movimiento a una operación incierta no explica si se guardó. El movimiento debe acompañar un estado textual correcto.

| Comportamiento | Activación y propósito | Duración propuesta | Alternativa accesible y aceptación |
|---|---|---|---|
| Selección de categoría, pestaña o filtro | Click/teclado; hacer visible selección y contenido asociado | 120–180 ms de color/opacidad | Cambio inmediato; texto/aria-selected o aria-pressed, foco estable. No depender de color. |
| Agregar al pedido | Confirmación local de una línea; actualizar cantidad/importe | 160 ms, sin volar imágenes por la pantalla | Mensaje de estado y contador textual. El botón sigue operable; cantidad correcta aun con clics rápidos. |
| Abrir detalle o revisión | Acción explícita; enfocar título o primer control relevante | 180–220 ms, desplazamiento máximo 8 px | Diálogo inmediato, foco contenido, Escape y retorno al disparador; fondo no operable. |
| Consultar disponibilidad/cotización | Petición en curso; explicar espera | Sin mínimo artificial; estado textual inmediato | Estado `aria-busy`/status, borrador conservado. Un indicador puede girar solo sin reducción de movimiento. |
| Confirmar y recuperar respuesta | Separar enviando, resultado desconocido y confirmado | La duración depende del resultado, nunca del efecto | Mensajes explícitos y «Consultar resultado»; no repetir cargo/reserva para hacer avanzar una animación. |
| Cambiar una visita | Mostrar original, solicitud y resultado | 180 ms de aparición del nuevo resumen | Original permanece legible hasta confirmación. Mensaje anunciable sin mover foco innecesariamente. |
| Cambiar un pedido del equipo | Confirmar nueva etapa y mantener ubicación de trabajo | 120–160 ms de fondo; sin reordenamiento animado de toda la lista | Estado textual, anuncio breve, siguiente acción alcanzable. El foco vuelve al ticket o título cuando desaparece por filtro. |
| Error y validación | Tras respuesta/validación; relacionar causa y corrección | Inmediato; sin sacudidas | Texto asociado al campo, foco al error cuando impide avanzar y valores conservados. |
| Pase de socio actual | Acción sobre credencial; revelar información | Actual: transformación de 600 ms | Mantener frente/reverso equivalentes sin giro con reduced-motion. Evaluar reducir a 180–240 ms si no aporta comprensión. |

Inventario técnico: [337 anclas de componentes/estados/estilos](base/componentes-estados-fuente.json), que incluye transiciones actuales de 160–320 ms y el giro del pase. Es inventario de fuente, no prueba de que cada regla CSS esté activa. Las comprobaciones de render/movimiento reducido están en las matrices de cada módulo.

Se conserva la misma información y capacidad de acción con `prefers-reduced-motion: reduce`. No habrá autoplay, parallax, desplazamiento forzado, esperas decorativas ni mensajes cuya comprensión dependa de un efecto. Estos son criterios de la futura implementación; las demos los materializan con estado local.
