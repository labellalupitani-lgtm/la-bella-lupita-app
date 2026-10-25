# Revisión independiente de uso — Perfil «A tu manera»

Fecha: 22 de octubre de 2026. Revisión sobre render de `http://127.0.0.1:5330/perfil`, cuenta sintética Lucía de prueba, contexto de navegador aislado. No se leyó el código fuente de la aplicación ni se realizaron cambios en él.

## Dictamen final R3

| Pieza | Dictamen | Evidencia de uso |
|---|---|---|
| Identidad y preferencias | **PASS** | A 390 × 844 se ven nombre, pestañas y tarjeta de bebida completa con acción antes de la navegación fija. No hay formulario inicial. Cumpleaños y alergias siguen localizables y el editor explica sus alcances. |
| Edición y movimiento | **PASS** | Flechas, Home y End trasladan foco y selección; la posición permanece. La bebida abre únicamente su campo con foco visible. Escape devuelve el foco y conserva el borrador. El acceso general sigue disponible. Un borrador adicional de nombre obliga a mostrar el formulario completo y su aviso antes de guardar. Movimiento reducido conserva estados con transición computada de 0 s y ninguna animación activa. |
| Cuenta, datos y ayuda | **PASS** | Saldo y dinero separados de puntos y membresía. Historial abrible y filtrable por teclado, con devolución del foco al cerrar. Compras abre `/compras`. Ayuda exige elegir motivo antes de mostrar formulario, conserva texto y motivo al colapsar/retomar y al cambiar pestaña. Consentimiento y cierre de sesiones siguen localizables. |

No encontré un fallo funcional bloqueante en los recorridos observados. **PASS en las tres piezas para la revisión local R3**, build `principal-BZE3ikGp.js` y CSS `Perfil-BoGMI488.css`. La comprobación final conserva la evidencia funcional R1 y vuelve a revisar selección/foco, datos, cuenta y reflujo del build final.

## Cierre del build final

[revision-uso/registro-r3.json](revision-uso/registro-r3.json) contiene la recomprobación directa de R3. A 390 × 844, flecha derecha activa Cuenta y End activa Datos y ayuda, con selección y foco coincidentes y sin desplazamiento de contexto. Saldo C$ 9,900 permanece separado de 510 pts y Mesa Fundadora; el concepto sintético se muestra como «Consumo en la casa · prueba». El título «Tus datos y mensajes» está presente y la ayuda sigue sin textarea inicial.

Se comprobó directamente Datos y ayuda a 320 px con cada tamaño de letra computado multiplicado por dos. El documento y el cuerpo siguen midiendo 320 px; los títulos y las tres pestañas quedan dentro de sus cajas. El título nuevo se lee en dos líneas, sin recorte. `Cambiar mi preferencia` continúa abriendo el editor focal con foco en el checkbox. Los estilos temporales se descartaron por recarga. El cierre volvió a 390 × 844 con el nombre y la bebida originales y sin formularios abiertos.

[pruebas-r3/resultados.json](pruebas-r3/resultados.json), leído en esta revisión, informa 10/10 casos correctos, sin errores ni solicitudes externas; registra 24 combinaciones de pestaña, ancho (320/390/768/1440) y texto (normal/200 %) sin desborde horizontal del documento. Esta matriz es evidencia indirecta de la cobertura ampliada; la revisión directa al 200 % se limitó al caso descrito arriba.

## Evidencia directa

El registro de acciones y resultados está en [revision-uso/registro-r1.json](revision-uso/registro-r1.json). Build observado: `principal-BSCfF5q_.js`, `Perfil-wIOLJBZ8.css`.

- Se comprobó el tabulado único de las pestañas (`tabindex=0` solo en la seleccionada), su recorrido circular y los nombres de los paneles en el árbol de accesibilidad.
- El editor de bebida recibe el foco en el campo; el guardado inicial está deshabilitado. Al editar sin guardar, cerrar con Escape y reabrir, el texto permanece. Tras sumar un borrador de nombre, entrar desde bebida muestra el editor completo con el aviso «Tenés cambios pendientes en otros datos. Revisá el formulario completo antes de guardarlos».
- `Tu actividad` abre por teclado con foco en Cerrar; el filtro Dinero presenta dos movimientos C$. Escape devuelve el foco a `Ver toda mi actividad`, cuya caja queda por encima de la navegación móvil.
- `Volver sin enviar` oculta el formulario de ayuda, devuelve el foco a Motivo y ofrece `Continuar solicitud`. Retomar restaura motivo y texto y enfoca el textarea. La alternancia de pestañas mantiene el borrador.
- La ampliación de las secciones Privacidad y Sesión expone sus controles. Cambiar la preferencia de promociones abre solo su checkbox. Las acciones de cierre no se ejecutaron.
- Los anchos normales 320, 390, 768 y 1440 no mostraron desborde horizontal del documento en las vistas medidas. En 320 la cabecera se apila y la bebida queda parcialmente bajo el primer pliegue; la condición de primera pantalla de `bar.md` se aplica a 390 y se cumple allí.

## Evidencia indirecta y límites

[pruebas-r1/resultados.json](pruebas-r1/resultados.json) declara 10 casos correctos, sin errores ni solicitudes externas. Incluye confirmación después de la respuesta, campos focales, revisión del borrador completo, ayuda progresiva y reflujo. Sus muestras temporales del indicador registran posiciones intermedias hasta asentarse aproximadamente a 233 ms; esta es la evidencia de desplazamiento, no una imagen PNG. La revisión directa corroboró 0,22 s de transición normal y 0 s con movimiento reducido.

[regresion-edge.log](regresion-edge.log) y [regresion-firefox.log](regresion-firefox.log) registran casos correctos de conflicto por campo, respuesta perdida recuperada con lectura, cierre/reapertura durante guardado, contratos corruptos, errores asociados, solicitud y cierre de sesión sin red. No repetí esas mutaciones en la vista previa compartida; esos resultados respaldan la inferencia funcional, no equivalen a una observación propia de esos estados.

Se usaron solo borradores descartados por recarga. No se guardaron perfiles, enviaron solicitudes, compraron productos, marcaron avisos ni cerraron sesiones. No se probó con lector de pantalla real. Esta revisión no constituye aprobación para producción.
