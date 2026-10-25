# Acceso, sistema compartido y comunicaciones

Evidencia nueva sobre la compilación congelada: 23 registros base, cinco estados adicionales y cinco casos de continuidad del acceso. No se presupone que un resultado técnico demuestre calidad visual.

## B01 · Selector de vista previa sin jerarquía · Juicio de diseño · P2

Ubicación: `/__preview`. Evidencia: [captura de 390 px](selector-preview-390.png). Reproducción: abrir el selector local. Presenta enlaces HTML predeterminados para cliente, visitante y cuatro roles; no comunica fecha de revisión ni una entrada recomendada. Consecuencia: cuesta distinguir la aplicación actual, una comparación antigua y una propuesta nueva cuando hay varias pestañas locales. Recomendación: una portada de revisión con tres entradas nombradas, estado de versión y enlace a la aplicación de referencia. La portada de los prototipos materializa esa propuesta; no cambia el selector de la app.

## B02 · Mensaje de ruta inexistente ambiguo · Juicio de contenido · P3

Ubicación: ruta desconocida con sesión válida. Evidencia: [captura](ruta-inexistente-390.png); `src/casa/App.tsx`, componente NoHay. Reproducción: abrir `/ruta-audit-inexistente`. El título «Sin mesa» puede sugerir falta de disponibilidad al reservar; la explicación de «puerta» no identifica una página inexistente. La acción de volver funciona. Recomendación: titular «No encontramos esta página», conservar una frase de marca secundaria y ofrecer Inicio/Carta. No es un bloqueo técnico.

## B03 · El correo pierde la identidad y la jerarquía del producto · Juicio de diseño · P2

Ubicación: correo OTP y notificación de reserva. Evidencia: [OTP renderizado](correo-acceso-390.png), [mensaje de reserva renderizado](correo-reserva-390.png), payloads JSON adyacentes; `src/worker/correo.ts` y `src/worker/reservas-correo.ts`. Ambos se generaron mediante transporte interceptado; cero envíos reales. El OTP usa HTML predeterminado sin firma visual; la reserva abre con un UUID largo antes de la fecha. Consecuencia: el reconocimiento de remitente y la lectura de fecha/estado quedan por debajo de la experiencia de la app. Recomendación: plantilla ligera de 600 px máximo, firma íntegra, tarea como título, código/fecha y estado como contenido dominante, enlace explícito a gestionar, vencimiento/anticipo cerca. Mantener texto plano equivalente. El UUID queda como referencia secundaria, sin inventar un número público nuevo. Pendiente de implementación: render real en Gmail/Outlook; el navegador no lo sustituye.

## B04 · Acceso largo y doble introducción · Juicio de diseño · P2

Ubicación: Umbral. Evidencia: [móvil](acceso-390.png), [200%](acceso-texto200-320.png). Reproducción: visitante `/`. «Tu lugar en la casa» y «Tu lugar en Club Lupita» repiten la presentación; las vías para explorar sin entrar llegan al final. La foto aporta reconocimiento de marca, pero sumada a las introducciones desplaza la tarea. Recomendación: un título funcional y una introducción breve; acceso y exploración visibles antes; conservar la foto con menor altura móvil. La indisponibilidad del envío en la fixture está explicada y no se atribuye a producción.

## Estados revisados

Acceso por correo: solicitud, código incorrecto, código vencido, retorno al producto conservando categoría/consulta, alta sintética sin pedido ni cargo automático. Fuente ejecutable: `../acceso-recorrido.mjs`; resultados: `acceso/resultados.json`. Recuperación de sección: fallo de chunk simulado, mensaje y salidas Inicio/Recargar visibles, [captura](estados/seccion-no-disponible.png). El estado de sesión expirada se contrasta con revocación en la fixture, no con una sola petición fallida.

`/kit`: galería interna accesible, revisada a cinco anchos y texto 200%; sus ejemplos no equivalen a funciones comerciales. No aplica éxito de compra o permisos de caja a esta galería. Sus datos demostrativos no se incorporaron a precios ni condiciones de las propuestas. La automatización de contraste no halló infracciones en acceso, acceso de equipo ni kit; no cubre lectores de pantalla físicos.

Navegación compartida: identidad, encabezado, barra móvil y retorno se revisan también en las fichas de compra/visitas/equipo. El código legado de `src/main.tsx`, `src/app` y pantallas no alcanzables no se cuenta como experiencia actual.
