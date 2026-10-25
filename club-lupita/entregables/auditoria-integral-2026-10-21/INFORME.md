# Auditoría crítica integral · La Bella Lupita

La identidad ya se reconoce. La ejecución todavía concede demasiado espacio a introducciones, filtros y tarjetas antes de la acción, y algunos estados de recuperación exigen que la persona deduzca cómo continuar. Las mayores oportunidades están en **ordenar mejor las decisiones y hacer visibles los resultados**, antes de añadir más imágenes o animaciones.

La aplicación conserva cacao/marfil/borgoña, Playfair Display/Montserrat, fotografía gastronómica y una voz propia. Eso merece conservarse. La Carta repite contenido destacado y posterga agregar; la reserva presenta pasos comprensibles pero no resuelve bien una respuesta perdida al modificar; el equipo hereda una densidad de presentación que demora la operación frecuente. No hace falta otra identidad: hace falta una mejor ejecución por tarea.

## Alcance y método

Se tomó como base `index.html → src/casa/main.tsx → App.tsx` y la compilación visible `principal-B6EbsuoF.js`. Los archivos compilados coincidieron con la copia congelada; se registraron hashes de 463 archivos de fuente/recursos/pruebas/scripts antes del trabajo. El árbol activo tiene 100 archivos alcanzables. El código antiguo no accesible desde esta entrada se excluye del producto actual, con justificación en BASE.json y el grafo.

Inventario: 11 rutas, 12 secciones del equipo, roles de visitante, cliente, miembro, propietario, encargado, caja y cocina, acceso y recuperación, navegación, diálogos, formularios, correos, comprobantes, CSV y vista previa. Las matrices distinguen render observado, pruebas de interacción, inspección de fuente y limitaciones. «Revisado» no significa «sin defectos». «100%» se refiere a filas del inventario definido con resultado verificable, no a todas las combinaciones posibles de datos ni a todos los dispositivos.

Se usan fixtures locales con red comercial bloqueada; los recorridos de la app ejercitan su Worker contra PGlite en memoria. Las propuestas son React/TypeScript independientes y solo usan estado simulado. No hay pagos, correos ni operaciones reales.

## Crítica por dimensión

**Diseño.** La tipografía y las fotos sostienen una personalidad reconocible. El problema recurrente es dar similar peso a introducción, contexto y tarea. Carta y Pedidos requieren demasiado desplazamiento antes de actuar. La mejora debe demostrarse con posición de la acción, comprensión y pasos, no con una puntuación de belleza. El equipo necesita más información útil por pantalla que un área de descubrimiento.

**Multimedia.** Hay una biblioteca amplia y consistente de platos. Añadir video no resolvería los bloqueos observados. Faltan recursos que respondan preguntas concretas: qué café se retira y qué espacio se está reservando. Las fotos ambientales deben conservar su papel y no representar productos/zonas diferentes. Los correos tienen contenido funcional, pero escasa continuidad visual. [Inventario y encargos](MULTIMEDIA.md).

**Dinamismo.** La app ya usa cambios de color, paneles y transiciones; no está ausente el movimiento. Falta reforzar selección, espera y resultado en los puntos de incertidumbre. Una animación de éxito no puede reemplazar la consulta del estado guardado. En Pedidos, el cambio de estado debe preservar orientación y foco. [Especificación de movimiento](MOVIMIENTO.md).

**Uso y contenido.** Hay buenas bases: mensajes de agotado, validación y acciones de reintento. La pérdida de respuesta al cambiar una reserva rompe esa continuidad. La fecha, el estado y el siguiente paso deberían poder leerse juntos. Las metáforas de marca funcionan como tono, pero «Sin mesa» para una página inexistente es menos claro que un título directo.

**Consistencia.** Cliente y equipo comparten identidad, pero no necesitan la misma densidad. El registro y los correos todavía repiten introducciones o usan presentación predeterminada. Los patrones de reintento del equipo deben funcionar sobre el bloque que falla, no solo sobre la consulta principal de la sección.

## Tres propuestas elegidas por evidencia

1. **Carta y pedido.** Un producto destacado duplicado y la primera acción bajo el viewport inicial retrasan una tarea frecuente. La propuesta pone la lista, las opciones y el pedido antes, conserva los 73 productos y recorre cotización, confirmación y seguimiento. [Ficha y evidencia](compra/fichas.md).
2. **Tu visita.** Un cambio confirmado con respuesta perdida pide actualizar el comprobante fuera del diálogo. La propuesta reúne datos/disponibilidad y hace explícita la consulta de resultado, con antes/después y conservación del original. [Ficha y evidencia](visitas/fichas.md).
3. **Pedidos del turno.** Con 26 pedidos, el orden por más reciente relega los antiguos a la segunda página; en móvil no se ve ninguna acción inicialmente. La propuesta prioriza espera, estado y siguiente acción, preservando restricciones alimentarias y permisos. [Ficha y evidencia](equipo/fichas.md).

Frecuencia inferida del carácter de las tareas, no medida con datos reales de producción. Se eligió un problema por grupo, como pide el plan. Los prototipos no son integración funcional del producto: sirven para evaluar la propuesta completa con datos simulados.

## Evidencias y cierre

El inventario de laboratorio cierra con **694 filas: 667 revisadas y 27 no aplicables justificadas**. Hay dos pendientes adicionales de campo, identificados aparte. Los tres prototipos pasaron revisión independiente de función, sistema y oficio, con correcciones verificadas y mejoras menores explícitas.

- [Matriz consolidada](COBERTURA.md), con registros y enlaces por módulo; datos completos en cobertura.json.
- Fichas de [base/acceso/comunicaciones](base/fichas.md), [compra](compra/fichas.md), [visitas](visitas/fichas.md) y [equipo](equipo/fichas.md).
- [Plan priorizado](PLAN.md), con impacto, dependencias, esfuerzo y aceptación.
- [Referencias y límites de comparación](REFERENCIAS.md), [multimedia](MULTIMEDIA.md) y [movimiento](MOVIMIENTO.md).
- [Registro de revisión independiente](REVISION.md) y [progreso](PROGRESO.md).

Las mediciones de carga son de laboratorio local y red simulada, con caché fría y tres muestras por condición; no equivalen a INP ni percentiles de campo. La latencia de un clic automatizado incluye la herramienta. Se registran saltos de contenido sin atribuirles una causa no comprobada. Ver las [mediciones completas](rendimiento/mediciones.json) y el [resumen de laboratorio](rendimiento/RESUMEN.md).

Quedan fuera de la afirmación de cobertura de laboratorio: dispositivos físicos, teclado virtual real, lector de pantalla humano, proveedor de correo real, datos y carga de producción, derechos/actualidad editorial de cada recurso. Están identificados como comprobaciones de campo o encargos, no como pruebas superadas. La revisión independiente valida el alcance observado; no sustituye la aprobación visual del usuario ni autoriza publicación.
