# Inventario y criterio multimedia

Se registraron **134 archivos** visuales/tipográficos y **47 familias raster**. La lista por archivo, bytes, dimensión, referencias y decisión está en [multimedia-inventario.json](base/multimedia-inventario.json). Las cuatro [láminas de inspección](base/multimedia-lamina-1.png) conservan encuadres completos; son un inventario, no una propuesta de recorte. Se inspeccionaron las cuatro láminas.

| Decisión | Recurso | Motivo y aceptación |
|---|---|---|
| Conservar | Fotografías de platos en `public/menu`, variantes 240/480/960 | Paleta cálida, vajilla y producto consistentes. Mantener asignación por plato; variantes verticales usan ancho real. No uniformar todos los encuadres a costa de cortar la porción. |
| Conservar | Firma original y versiones WebP; fuentes locales | Reconocimiento y carga autónoma. Usar variante adecuada a densidad de pantalla; reserva visual alrededor; no ampliar 160 px para gran portada. |
| Conservar con contexto | Latte entre manos, desayuno y terraza existentes | Útiles para marca y ambiente. No usarlos como prueba del lote comercial o como representación de otra zona. |
| Sustituir asignación cuando corresponda | Foto ambiental en una decisión de producto/espacio que no representa | El archivo puede seguir siendo útil en Inicio. Una sustitución de contexto no exige borrar una imagen. Validar cada asignación con negocio. |
| Producir | Café vendido en Tienda | Una foto del envase real del lote, etiqueta legible y 250 g verificables. Frontal 4:5 y toma con granos/taza 1:1; luz cálida neutra, fondo crema, sin añadir premios, origen ni notas no documentadas. Entregar original 2400 px y WebP/AVIF 480/960; texto alternativo descriptivo. |
| Producir | Zonas reservables | Una toma verificable por zona y una vista que permita entender mobiliario/capacidad. Registrar nombre exacto, fecha, capacidad vigente y permiso de uso. Priorizar terraza/VIP según demanda real; no inventar vistas de barra o ventanal. |
| Producir si falta al verificar catálogo | Bebidas sin imagen específica | La comparación puede seguir siendo tipográfica. Fotografiar tamaños/variantes reales con escala comparable cuando la imagen ayude a elegir. No crear bebidas sintéticas como prueba del producto. |
| Eliminar de la entrega activa tras comprobación | Recursos sin referencia en el grafo activo | `base/grafo-activo.json` enumera 100 archivos alcanzables. La ausencia textual no prueba desuso dinámico: comprobar manifiesto y rutas antes de borrar. No se eliminó ningún archivo. |
| No añadir por obligación | Video, audio, 3D | No hay medios de estas clases en `public`. No se detectó una tarea que necesite autoplay, banda sonora o 3D. Una animación de respuesta resuelve mejor la mayoría de los cambios de estado. |

Procedencia: la fuente del catálogo declara extracción de la web del negocio en agosto de 2026. Este inventario confirma archivos y asignaciones del proyecto; no acredita por sí solo fecha de captura, derechos individuales ni actualidad de cada fotografía. Esa validación editorial queda en el encargo, separada de la cobertura de interfaz.

Los prototipos reutilizan archivos existentes. La ilustración del ticket en la portada es HTML/CSS y se identifica como demostración; no es un comprobante real. Los nombres, operaciones, disponibilidad e importes de los prototipos son simulados.
