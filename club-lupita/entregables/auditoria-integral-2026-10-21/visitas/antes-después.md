# Tu visita — propuesta separada

El prototipo corrige el problema V-01 mediante una consulta explícita del resultado. Vive en `prototipo.tsx` y `prototipo.css`, se integra en `/visitas` del host local 5310 y no modifica la app original. Usa React local sin llamadas API. Todas las reservas, disponibilidades, datos de cuenta y cargos son sintéticos.

## Antes y después

| Decisión | App auditada | Propuesta |
|---|---|---|
| Preparación | Lugar → Fecha y grupo → Revisión | Fecha/grupo/duración + zona/horarios → Revisión |
| Consulta vacía | Explica que se pruebe otra fecha, duración o zona | Conserva la consulta y ofrece «Ver el día siguiente» |
| Cambio | Campos nuevos con una línea del original | Comparación «Antes · sigue confirmada» / «Después · por confirmar» |
| Respuesta perdida | Reconfirmar produce conflicto; requiere cerrar y actualizar fuera | Estado «Resultado por verificar», referencia conservada y «Consultar resultado» |
| Anticipo VIP | C$ 500 con revisión y política | C$ 500 visible en opción, resumen y revisión; cambio sin cargo adicional; devolución explícita al cancelar |
| Jerarquía | Utilidades y explicación del borrador preceden a fecha/grupo | Datos de la visita preceden a disponibilidad; controles de demostración quedan en un disclosure final |

La consulta del prototipo **simula** una operación ya guardada y recupera ese estado; no demuestra la implementación de idempotencia del backend. El original sí se ensayó con Worker real local: recibió el POST y devolvió 200 antes de abortar la respuesta al navegador. La futura integración deberá leer y comparar el comprobante real, distinguir 404/conflicto/indisponibilidad y mantener el estado incierto si no se puede verificar.

## Comparación medida a 390 × 844

| Medida en coordenadas del documento | Original, Fecha y grupo | Propuesta, preparación |
|---|---:|---:|
| Campo de fecha | 610 px | 396 px |
| Primera hora disponible | 1047 px | 863 px |
| Altura del área principal del paso | 1173 px | 880 px |
| Palabras del área medida | 134 | 145 |

La propuesta reúne también la elección de zona en esa área, por lo que no se atribuye la diferencia de palabras a una reducción textual equivalente. El original tiene además su paso previo de Lugar. Su CTA es fijo, mientras que el de la propuesta está en el flujo: sus posiciones verticales no son comparables como disponibilidad permanente. Se priorizó que el CTA no tape contenido al ampliar texto.

Una primera iteración de la propuesta empujó los horarios hacia 1200 px por cinco filas de zonas; se descartó. El resultado usa un select accesible con nombre y anticipo en cada opción, más detalle visible de la selección. Se quitó el aviso de demo duplicado porque el shell ya lo presenta. No se ocultó ningún costo.

## Aceptación observada

- Crear una reserva de terraza, revisar, confirmar y ver comprobante.
- Cambiar hora, revisar Antes/Después, simular respuesta perdida y recuperar con «Consultar resultado»; no se vuelve a confirmar el cambio.
- Cancelar con condición explícita; simular respuesta perdida de cancelación y recuperar su estado.
- VIP muestra el anticipo de C$ 500 y la devolución pendiente en revisión de cancelación.
- Error de horarios conserva datos y permite reintentar; vacío propone el día siguiente; ausencia de hora valida con mensaje y foco.
- El calendario genera un ICS identificado como prueba, sin operaciones reales.
- 320/390/768/913/1440 sin desborde horizontal en la preparación; también en resultado incierto y comprobante con nombre largo.
- Texto efectivo 200% en los cinco anchos sin desborde; se ajustó el tamaño mínimo de imagen para conservar su texto.
- Teclado: radio de hora con Espacio, revisión y consulta con Enter, foco al encabezado de cada cambio de pantalla.
- Movimiento reducido elimina transiciones; axe en preparación y comprobante no detectó infracciones A/AA.

Evidencia verificable: `prototipo-validacion.json`, `prototipo-bordes.json` y capturas `prototipo-*`. Capturas iniciales de móvil/escritorio y el estado incierto se inspeccionaron con `view_image`. El control de escenarios está al final y no pretende ser parte del producto publicado.

## Recursos y límites

Playfair Display/Montserrat y la paleta cacao, marfil, rosa y borgoña provienen del proyecto. La única fotografía es el activo de terraza existente; la composición señala ese espacio y no lo presenta como Ventanal, Barra, Bistró o Salón VIP. Faltan descripciones físicas verificadas de esas zonas: la propuesta conserva la incertidumbre. El día y horario iniciales son ejemplos fijos de octubre de 2026.

La propuesta no sustituye todos los módulos de Club o Perfil; resuelve un recorrido elegido a partir de la auditoría. Las diez filas inicialmente pendientes de la app original se ejecutaron después en una segunda fixture real sintética. La evidencia del prototipo nunca se usa como aprobación de una fila de la app original.
