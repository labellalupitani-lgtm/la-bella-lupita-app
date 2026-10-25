# Validación pendiente · Mi Club

Estado: protocolo listo; no ejecutado con participantes. Los datos de pruebas automáticas son sintéticos. Responsable de la validación comercial: propietario de La Bella Lupita. Responsable de aplicar resultados al producto: desarrollo y encargado de operación.

## 1. Decisiones que debe confirmar la casa

| Dato pendiente | Lugar preparado | Criterio para poder publicarlo |
|---|---|---|
| Tamaño del café filtrado y extras incluidos/excluidos | Personal → Mi Club → Café | Una segunda visita el mismo día y una petición con extras reciben una explicación idéntica antes del pago. |
| Compras que suman sello y exclusiones | Personal → Mi Club → Compras elegibles | Dos turnos resuelven el mismo ticket igual; el mismo ticket nunca suma dos sellos. |
| Bebida al completar nueve sellos | Personal → Mi Club → Bebidas del premio | Producto, tamaño, extras y disponibilidad inequívocos. |
| Productos que cuentan como repostería | Personal → Mi Club → Productos con 15% | Lista aprobada de productos existentes; prueba de cotización y cobro con miembro vigente y vencido. No activar productos por su nombre supuesto. |
| Prioridad del Salón VIP | Personal → Mi Club → Prioridad VIP | Definir quién solicita, hasta cuándo, quién decide, plazo de respuesta, qué ocurre ante falta de aforo y cómo se registra la decisión. Luego implementar y ensayar esa política; un texto no garantiza prioridad. |
| Faltantes y excepciones | Procedimiento de caja por aprobar | No confirmar entrega hasta entregar físicamente. Acordar alternativa sin inventar sustituciones ni consumir un derecho no atendido. Si ya se registró por error, usar reposición auditada. |
| Experiencias históricas | Inventario del encargado | Lugar, duración, contenido y condiciones verificadas. Conservar derechos ya vendidos; no modificar expectativas de compradores sin un proceso explícito. |
| Costos | Personal → Mi Club → Costos internos | Costo verificable de café, bolsa y costo por período; documentar fuente/fecha de medición fuera de datos del cliente. No usar cero para representar desconocido. |

La decisión principal ya está confirmada: C$950 cada 30 días, café diario y bolsa por período pagado para nuevas contrataciones. No hace falta volver a pedir esa aprobación.

## 2. Comprensión y uso con clientes

Propuesta de primera ronda: cinco a ocho participantes con familiaridad digital variada, incluidos clientes nuevos y recurrentes. Esta cantidad sirve para detectar problemas cualitativos; no estima una tasa poblacional. Participación voluntaria, consentimiento para tomar notas y datos ficticios. No se deben ejecutar cobros reales durante la prueba.

Entregar tareas sin explicar la ruta:

1. Encontrar el café disponible y explicar cómo retirarlo.
2. Encontrar la bolsa y explicar qué ocurre si cambia el mes a mitad del período.
3. Explicar precio, período, renovación, falta de saldo y cancelación antes de contratar.
4. Recargar con saldo insuficiente, volver y decidir si contratar.
5. Recuperar una compra cuya respuesta se perdió y comprobar que no se duplicó.
6. Explicar qué compra suma sello y qué premio se entrega, una vez confirmada la regla.
7. Comprar una entrada ficticia, localizar su comprobante y distinguir comprador de titular al cederla.

Registrar por tarea: éxito sin ayuda, errores, tiempo, dudas y palabras del participante; sin teléfono, código real del pase ni grabaciones innecesarias. No atribuir a estas pruebas los resultados automáticos ya obtenidos.

Criterio de salida: ningún problema grave impide retirar un derecho, provoca un cobro equivocado o hace creer que la renovación se canceló cuando no fue así. Revisar cada duda repetida, cambiar copy/flujo y repetir la tarea afectada.

## 3. Accesibilidad en dispositivos físicos

Probar iPhone con VoiceOver, Android con TalkBack y escritorio con lector de pantalla disponible. Anotar sistema, navegador y versión. No declarar que WebKit automatizado equivale a Safari en un teléfono.

- Navegar por encabezados y controles; distinguir café, bolsa, premio y cada experiencia.
- Abrir y cerrar pase, compra, recarga, código y error; verificar anuncio y retorno de foco.
- Probar 200% de texto, zoom hasta 400% donde corresponda, orientación y espaciado de texto (interlineado 1.5, párrafos 2, letras .12em, palabras .16em). Estos valores corresponden al ensayo de adaptación de [WCAG 2.2, espaciado de texto](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).
- Comprobar nombre largo, código completo, contador, mensajes y botones sin recortes ni superposición.
- Con teclado, comprobar orden, foco visible y ausencia de controles tapados por la navegación fija.

Guardar solo capturas anonimizadas y una lista reproducible de incidencias.

## 4. Ensayo de caja entre dos turnos

Usar capacitación y cuentas sintéticas. Cada turno resuelve independientemente los mismos casos: café ya usado hoy, bolsa de período anterior, recontratación, código vencido, ticket repetido, bolsa agotada, descuento de repostería, solicitud VIP y reposición.

Comparar producto/importe, decisión, motivo, mensaje al cliente y evidencia de auditoría. La prueba se cierra cuando ambos turnos producen resultados equivalentes y el encargado puede reconstruir cada caso sin borrar registros.

La app ya dispone de lista de espera, reposición, descuento automático en Carta y descuento asistido en caja con comprobante único y anulación auditada. Confirmar los productos y comparar dos turnos sigue pendiente. La política de prioridad VIP necesita definición e implementación adicional antes de considerarse cerrada.

## 5. Negocio y rendimiento

El panel registra movimientos de renovación, motivos de fin, descuentos de Carta, entregas incluidas reposiciones, contratos por cohorte y acciones agregadas. No son personas únicas ni una atribución causal. La contribución parcial excluye costos no registrados y no equivale a utilidad neta.

Con costos y políticas confirmados, definir un período de observación, cohorte elegible y grupo comparable para estimar incrementalidad. Separar cargos de membresía, consumo ordinario, costo de productos, descuentos, devoluciones y gastos. No inferir que toda compra de un miembro fue causada por el programa.

Para rendimiento, recoger una ventana real suficiente y mostrar tamaño de muestra por dispositivo y ruta. Objetivos de referencia: p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1, según [Web Vitals](https://web.dev/articles/vitals). Los Core Web Vitals actuales corresponden a entradas directas a /club. Los tiempos de consulta, obtención de código y recuperación se miden además en navegación interna, separados por resultado y dispositivo, sin identificadores personales. Observar por separado la espera física en caja; no confundirla con el tiempo de respuesta de la aplicación.

No programar avisos ni contactar participantes sin instrucciones explícitas. Este documento no crea una automatización.
