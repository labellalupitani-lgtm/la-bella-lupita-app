# Auditoría adversarial base — Tienda, Mi Club y Perfil

Fecha: 21 de octubre de 2026. Auditor independiente del constructor. Producto no modificado.

## Alcance y evidencia

Preview `http://127.0.0.1:5277` verificado con `/__preview/status`: compilación local, PGlite en memoria, credenciales sintéticas y red externa bloqueada. Navegador Edge/Chromium headless; 390, 913 y 1440 × 884. Nueve pares de capturas completas y de primer viewport, texto visible y geometría en `metricas.json`. Se inspeccionaron visualmente las capturas. `interacciones.json` registra pase, editor, Escape, foco y borrador sin guardar. No se enviaron compras, cambios de perfil, solicitudes al negocio ni enlaces externos.

**Veredicto base: NO APROBADO para la experiencia pedida.** La funcionalidad existe, pero la estructura visual da al contenido administrativo más protagonismo que al producto, a los beneficios o a las preferencias. No alcanza con agregar transiciones a estas mismas cajas.

## Hallazgos prioritarios

### B1 · La preview no representa una Tienda comprable ni visual

- Dónde: `/tienda`, todos los anchos. Capturas `tienda-*-top.png`.
- Reproducción: abrir Tienda en la cuenta sintética. La ficha carece de foto, presentación, origen, retiro y lugar; la oferta queda no disponible. No existe el botón «Apartar la mía».
- Resultado: seis apariciones de «Por confirmar»/«por confirmar», precio y bloques de texto, pero ningún producto visible. No hay imágenes en `main` de ninguno de los tres módulos inspeccionados.
- Impacto: no se puede evaluar el estado normal del comercio ni su flujo de revisión de compra. El intento de abrir ese botón en `capturar.mjs` terminó por timeout; esto es una limitación de la fixture, no un fallo de compra demostrado.
- Corrección: crear en un puerto aislado una oferta de prueba explícitamente sintética, completa y válida. Conservar esta captura incompleta como estado real a diseñar; no completar datos del negocio con invenciones. Cuando falte foto, usar composición visual deliberada sin simular que se trata del producto real.

### B2 · Mi Club oculta la utilidad tras una introducción larga

- Dónde: `/club` a 390 px; `club-390-top.png` y `club-390-full.png`.
- Reproducción: abrir como miembro activo y no desplazar.
- Evidencia: la primera acción de canje «Mostrar código del café» empieza en y=945. El título de sellos está en y=1520, saldo en y=2067; documento de 3323 px. Antes aparecen navegación global, título de página, otra portada, texto de bienvenida, pase, atajos, fecha de consulta y actualizar.
- Impacto: la persona frente a caja debe buscar su beneficio por debajo del primer viewport. La pertenencia está expresada como encabezados y líneas de texto, no como un pase o una superficie reconocible.
- Corrección: dar al pase y a los beneficios una composición principal compacta; hacer visibles disponibilidad y acción. Agrupar detalles de contrato bajo una expansión clara, manteniendo condiciones completas en la confirmación. Convertir sellos en una trayectoria visual útil, vinculada a actividad real.

### B3 · Perfil funciona como una ficha administrativa extensa

- Dónde: `/perfil` móvil y escritorio; `perfil-390-full.png`, `perfil-1440-top.png`.
- Evidencia: 460 palabras visibles en `main`, 4116 px de documento móvil. Preferencias en y=871, cuenta en y=2157, ayuda en y=2732. El primer bloque dedica más espacio a correo inexistente/verificación/contacto y su explicación que a personalización.
- Impacto: cuesta entender qué se puede hacer hoy. La fila de preferencias se ve igual que un dato estático aunque la edición existe en un panel separado.
- Corrección: organizar identidad compacta, preferencias y actividad como acciones claras. Dar a «Tu bebida de siempre» una superficie visual vinculada al dato guardado; no inferir un producto o gusto desconocido. Privacidad y sesión pueden ocupar detalles expansibles, con acceso visible y sin eliminar información sensible necesaria. No sustituir consentimiento real por un switch ornamental.

### B4 · Cabecera se rompe por el ancho efectivo del scrollbar

- Dónde: los módulos con cabecera compartida, viewport913 con 15px de gutter. `perfil-913-gutter.png`, `cabecera-913.json`.
- Reproducción: en Windows con scrollbar nativo o en prueba aplicando `html{scrollbar-gutter:stable}` a913px.
- Evidencia: headless sin gutter: header111.39px, ancho de contenido913. Con gutter: ancho898 y header183.39px, reserva en segunda fila. Acceso directo y navegación desde Inicio sin gutter producen el mismo111.39; no se encontró contaminación por orden de estilos en esta comparación.
- Impacto: se pierde una fila completa en el panel real del usuario aunque no exista overflow horizontal. Un test que solo mide `scrollWidth > innerWidth` no lo detecta.
- Corrección: adaptar la navegación por espacio real o adelantar breakpoint; probar899/900/913/960/1024/1120 con gutter normal y estable. Verificar composición, no solo desbordamiento.

### B5 · Mismo ritmo visual para contenidos distintos, sin medios ni interacción narrativa

- Dónde: los tres módulos; conjunto de capturas.
- Evidencia: predominan tarjetas crema, filetes, subtítulos serif, párrafos y botones. No hay imágenes en los tres `main`. El CSS leído ofrece transiciones de hover y aparición de detalles; no hay una interacción que ayude a explorar producto, comprender progreso o reconocer preferencias.
- Impacto: la marca está en color y tipografía, pero producto, pertenencia y persona se sienten como secciones del mismo formulario.
- Corrección: Tienda necesita exploración de producto real; Mi Club, pase/beneficios/progreso; Perfil, preferencias y actividad. Movimiento debe explicar una transición (ver producto, descubrir condición, pasar de datos a edición), respetar reduced-motion y no bloquear acciones. Evitar video genérico en autoplay que compita con la operación o invente atributos del café.

## Contratos que el rediseño debe conservar

Estos contratos se identificaron en código y pruebas existentes; no equivalen a una reejecución integral en esta auditoría.

- **Tienda:** cotización y consentimiento antes de cobrar; precio/oferta revisada; referencia local para recuperar resultados inciertos; no duplicar cargos; impedir nueva compra antes de resolver pendientes; distinguir dinero de beneficio mensual; condiciones y retiro presentes al confirmar; recarga conserva contexto; preparar WhatsApp no equivale a enviar. Suites relevantes `tests/tienda-ui.mjs`, `tests/tienda.mjs`.
- **Mi Club:** cuenta gratuita distinta de Mesa Fundadora; café diario/bolsa por contrato vigente; código temporal no implica entrega; personal confirma; límites y expiración; apertura de experiencia/cupos/precio reales; renovación/cancelación con consentimiento; saldo independiente de sellos/puntos; recuperación idempotente; foco al originador. Suites `tests/mi-club-ui.mjs`, `tests/mi-club.mjs`, `tests/club-operacion.mjs`.
- **Perfil:** recurso independiente aunque fallen resumen/catálogo; edición con borrador; validación por campo; día/mes sin promesa de regalo; consentimiento de promociones explícito; conflictos por campo y recuperación de escritura incierta; datos opcionales borrables; cambio de identidad de acceso requiere ayuda; sesión local/todos dispositivos y fallo de red; actividad filtrada/paginada. Suites `tests/perfil-ui.mjs`, `tests/perfil.mjs`.

## Funciones observadas directamente

- Pase abre y Escape cierra, devolviendo el foco a «Mostrar mi pase».
- Editor abre y Escape cierra, devolviendo foco a «Editar mi perfil».
- Un borrador de bebida sin guardar se conserva tras cerrar/reabrir el panel.
- Tab permanece dentro del diálogo nativo en la primera transición inspeccionada. No se auditaron todas las secuencias de foco.
- Cero errores de página en la captura de las nueve vistas y cero overflow horizontal ordinario. Esto no aprueba el diseño ni representa pruebas completas de accesibilidad.

## Criterios para la siguiente ronda

1. Primer viewport tiene acción y objeto protagonista en cada módulo; móvil muestra utilidad antes que el registro administrativo.
2. Menos prosa inicial sin perder contrato, seguridad ni acceso a detalles.
3. Al menos una interacción propia y útil por módulo, probada con teclado y movimiento reducido.
4. Medios reales o ilustraciones explícitas; no inventar datos del negocio ni usar contenido de relleno.
5. Evidencia a390/913 con gutter/1440 y casos de contenido ausente, lectura fallida y estados de membresía.
6. Pruebas de los contratos preservados y segunda revisión independiente del render final.
