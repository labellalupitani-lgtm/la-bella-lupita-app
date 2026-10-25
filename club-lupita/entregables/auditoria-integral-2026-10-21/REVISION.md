# Revisión independiente

Se convocaron tres revisores que no construyeron las propuestas: función, sistema visual y oficio. Los criterios están en [bar.md](bar.md). Las aprobaciones de ciclos anteriores no se heredaron.

## Estado de la revisión

| Propuesta | Función | Sistema | Oficio |
|---|---|---|---|
| Carta y pedido | PASS | PASS | PASS |
| Tu visita | PASS | PASS | PASS tras corrección |
| Pedidos del turno | PASS | PASS | PASS |

Los veredictos se refieren a los recorridos y renders de las propuestas. La revisión documental también obtuvo PASS: 696 filas, con 667 revisadas, 27 no aplicables con justificación y dos comprobaciones de campo pendientes. Las 694 filas del inventario de laboratorio tienen resultado; no se dejaron estados aplicables como pendientes por falta de tiempo. El árbitro comprobó 1.042 enlaces Markdown sin destinos rotos.

## Discrepancias detectadas y corregidas

- **Función:** el resumen de una visita cancelada seguía llamándola próxima visita; en cambios inciertos mostraba la propuesta como si ya fuera definitiva. Se corrigieron título, importe y referencia a la última visita confirmada. La nueva verificación reprodujo creación, modificación y cancelación con respuesta perdida.
- **Función:** al aceptar un pedido situado abajo en la lista, la recuperación quedaba fuera de vista y el foco caía en BODY. Ahora se enfoca el control de consulta o reintento y, después, el encabezado del pedido. Se verificaron error y pérdida de respuesta sin incrementar dos veces el contador.
- **Sistema:** títulos de producto con área de 40 px y enlace de salto de 43 px no alcanzaban el mínimo de 44 px acordado. Se ajustaron y midieron de nuevo.
- **Sistema:** tonos principales de las propuestas se apartaban de los tokens aprobados. Cacao, marfil y borgoña se alinearon; colores semánticos de estados operativos permanecen diferenciados.
- **Sistema:** «Cerrar» del diálogo de cancelación se partía en dos líneas. Se conservó el botón completo y se permitió que el encabezado ocupe varias filas.
- **Sistema:** el seguimiento del pedido se superponía con texto al 200 %. Se reorganizó en columna en móvil y con reflujo en escritorio.
- **Sistema y oficio:** el resumen/foto de Visitas creaba una columna residual estrecha. Se corrigió la colocación de los elementos y la altura pasó a responder al contenido. La nueva comprobación a 390 px y texto al 200 % muestra imagen completa de 354 × 480 px y leyenda legible.
- **Documentación:** el calendario original estaba inventariado sin descarga probada. Se ejecutó desde su botón en una fixture nueva y se verificaron archivo, UID, comienzo y duración. No se importó en servicios externos.

## Informes y límites

[Función](revision-funcion-r1.md) · [Sistema](revision-sistema-r1.md) · [Oficio](revision-oficio-r1.md). Las capturas y scripts propios están en sus carpetas. Los revisores comprobaron comportamientos concretos; PASS no significa ausencia universal de defectos ni aprobación visual del usuario. La sesión física y los clientes de correo reales siguen separados como pendientes de campo.

El árbitro de oficio dejó tres refinamientos explícitos, sin convertirlos en bloqueos: evitar la segunda síntesis de visita tras confirmar en móvil; reducir huecos de filas del equipo cuando una tarjeta tiene restricciones; mantener filtros accesibles en listas largas. Son candidatos de una siguiente iteración. No se afirma que todas las tareas sean más rápidas: las comparaciones de captura pueden usar categorías o roles iniciales distintos, como detalla el dictamen.

La compilación final se comprobó en el puerto 5311: 20 combinaciones de ruta/ancho, sin desborde del documento, errores JavaScript ni solicitudes externas; cuatro comprobaciones axe sin violaciones reportadas. La prueba del informe verificó enlaces internos, filtros y reflujo. El cotejo de los 463 archivos originales no encontró cambios. Evidencias: [render final](integracion/resultados.json), [entrega](integracion/entrega-verificada.json) y [fuentes](VERIFICACION-FUENTES.json).
