# Sistema compartido, acceso y kit

Se cargan Playfair y Montserrat locales desde la entrada de cualquier ruta; se retiraron las importaciones de Work Sans y Libre Caslon del cliente activo. La escala de texto usa rem con el mismo tamaño base mínimo de 12 px y permite ampliación real. El guardián interpreta la unidad y conserva ese umbral.

La navegación del cliente sigue la cabecera horizontal aprobada. En móvil, sus cinco destinos refluyen con texto grande y su altura real reserva espacio. Se conservan carrito, destinos, navegación modificada del navegador y el pase integrado de Inicio. Formularios, botones, filtros, contadores, avisos, tarjetas y hojas comparten tipografía, radios y acciones de marca. La composición de Inicio mantiene sus reglas específicas.

El acceso muestra una introducción breve, fotografía natural, estado de correo/verificación/cuenta y enlaces para explorar sin sesión. Se conservan OTP, alta opcional, consentimiento no marcado por defecto, reenvío y estados del servicio. No se envía correo real durante las pruebas.

El kit presenta grupos de componentes en columnas adaptables, búsqueda funcional de productos de ejemplo, diálogos con el nombre elegido, cierre y retorno de foco. Sus muestras no realizan operaciones ni descuentan saldo; las acciones antes vacías ahora abren ejemplos identificados o navegan a la ruta pertinente. Indicadores, filas y sellos refluyen con texto ampliado.

## Evidencia

- `evidencia/sistema.mjs` y `evidencia/sistema/resultados.json`: dieciocho grupos; acceso, kit y ruta desconocida en cuatro anchos; pasos, consentimiento, axe, texto 200 %, búsqueda, diálogo y retorno de foco. Incluye tres variantes de aviso en pantallas cortas y ampliación, sin recorte y con cierre por teclado.
- `evidencia/correo.log`: recorrido existente con Worker real y envío simulado; disponibilidad/fallo de red, código incorrecto/correcto, alta, teléfono, consentimiento, cierre y reingreso. Capturas y axe en `evidencia/correo/`.
- `tests/redisenio-integral-ui.mjs`: revisión transversal final, 138 comprobaciones PASS sobre 23 superficies. Resultados en `evidencia/integral-final/`; complementa recorridos por pantalla. No sustituye estados transaccionales ni revisión humana.

La transición de color del botón disponible falló contraste en su estado intermedio y fue corregida. El desbordamiento de Kit al 200 % fue reproducido, corregido y revalidado. Inicio superó los once grupos de su aceptación actualizada para confirmar que la extensión conserva la composición y sus recorridos; evidencia en `evidencia/inicio-aceptacion/`.
