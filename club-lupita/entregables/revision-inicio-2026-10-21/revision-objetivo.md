# Revisión independiente del objetivo — composición de Inicio

**Veredicto: PASS para el alcance revisado.** No encontré un fallo importante reproducible que impida presentar esta composición al usuario. Esta revisión técnica no constituye aprobación visual ni autorización para publicar o extender el diseño.

Revisión del 21 de octubre de 2026. El árbitro no participó en la implementación. Inspeccioné el render y las interacciones en Chrome, en contextos aislados, sobre `http://127.0.0.1:5190/__preview/entrar` y la versión anterior `http://127.0.0.1:5192/__preview/entrar`. Leí el objetivo, `bar.md` y las evidencias de aceptación/regresión; no inspeccioné código de implementación ni modifiqué la aplicación. Las sesiones mostraron el aviso de vista previa local y datos sintéticos.

## Comprobaciones propias en el navegador

| Criterio | Resultado observado |
| --- | --- |
| Cuenta, saldo y pase al abrir | En 320 × 568 el pase termina en y = 419,17 y la navegación comienza en y = 495. En 390 × 844 termina en y = 449,73, antes de la navegación en y = 771. Cuenta, importe y pase resultan identificables sin desplazarse. |
| Fotografía más arriba | A 390 px, el inicio de la fotografía pasó de y = 1394,83 a y = 674,11: adelanto de **51,7 %**, superior al 30 % requerido. Sigue siendo reconocible; el texto está en su propio fondo. |
| Composición de escritorio | En 1440 × 1000 la cuenta y la fotografía comienzan juntas en y = 409,22. La cuenta ocupa la columna izquierda; fotografía e invitación forman la derecha. Los accesos quedan inmediatamente después. |
| Contenido conservado | Sellos 8/9, explicación de la bebida de cortesía, beneficio de bolsa, seguimiento, accesos a carta/reserva/tienda, movimientos y navegación siguen presentes. La jerarquía del pase y de la invitación es clara. |
| Pase y teclado | Abrí el pase mediante botón y Enter. El foco inicial está en Cerrar; Escape cierra y devuelve el foco a Mostrá tu pase. Tab alcanza Recargar en caja con un anillo visible. Enter abre su panel informativo y Escape lo cierra. |
| Privacidad | Ocultar saldo cambia el importe a puntos; la preferencia permanece después de recargar la página. |
| Destinos | Explorá/Explorar la carta abre `/pedir`; Reservar mesa abre `/reservar`; Tienda de la finca abre `/tienda`; Ver reglas y beneficios abre `/club`; Ver movimientos abre `/perfil`, donde existe el historial. Regresar vuelve a Inicio. |
| Seguimiento | Ver mis avisos abre `/compras`, muestra el aviso sintético y el estado vacío de compras/reservas. No hay una pantalla sin salida. |
| Error y recuperación | Con la red de esta pestaña desconectada, Actualizar Inicio muestra errores comprensibles de cuenta, catálogo, cupos y seguimiento, fecha de última consulta y acciones de reintento. Al restaurar la red y actualizar, se recuperan los datos y Ver mis avisos. |
| Tamaños y texto | Inspeccioné 320 × 568, 390 × 844 y 1440 × 1000, sin desbordamiento horizontal. A 320 y 390 px también inspeccioné el render con fuente raíz de 32 px (200 %): el título pasó de 28,8 a 57,6 px y las acciones de 12 a 24 px; el documento conservó el ancho de viewport. El pase sigue abriendo y cerrando en ese estado. |
| Movimiento reducido | Con `prefers-reduced-motion: reduce`, las acciones siguieron utilizables y no encontré animaciones activas continuas en el estado estable. |

En 320 px al 200 %, varias etiquetas de navegación y accesos se parten en más de una línea. Comprobé que conservan el texto y su acción, sin recorte ni superposición entre controles; no lo clasifico como bloqueo de este ciclo.

## Evidencia complementaria y límites

- `evidencia/composicion.json` coincide con las medidas propias de fotografía y composición. Las capturas antes/después son comparables con los renders inspeccionados.
- `evidencia/aceptacion.json` registra aceptación en siete anchuras, foco, accesibilidad automática, estados, navegación y texto ampliado. `evidencia/regresion/resultados-ui.json` registra la regresión funcional, incluido el premio y su error/expiración. Esos escenarios de premio son evidencia automatizada: no generé personalmente un premio en esta sesión.
- Revisé visualmente `evidencia/seguimiento-pedido-200.png` y `evidencia/seguimiento-reserva-200.png`: número/estado del pedido y fecha/grupo de la reserva se distinguen de sus acciones en 320 px al 200 %. El informe de aceptación registra además avisos numerosos y vacío, y la apertura de compras desde las acciones. Son escenarios sintéticos interceptados por la prueba, no operaciones propias sobre reservas o pedidos.
- No realicé pagos, reservas, canjes ni mensajes externos. Esta revisión no prueba dispositivos físicos ni todos los estados de negocio posibles. La decisión de extender la dirección visual sigue pendiente de la revisión del usuario.

**Hallazgos que requieren corrección para este alcance: ninguno.**
