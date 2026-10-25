# Revisión de uso R2 — dictamen vigente

Fecha: 22 de octubre de 2026. Revalidación focal de caja negra sobre la preview R2; sin leer ni modificar la implementación. La revisión R1 se conserva a continuación como antecedente.

| Pieza | Dictamen R2 | Resultado de la revalidación |
| --- | --- | --- |
| Entrada y beneficios | **PASS** | Café y pase conservan sus controles y retorno de foco. Los botones de café y bolsa continúan visibles a 320 px con texto al 200%. La captura ampliada muestra «250 g» unido. |
| Pase, sellos y estados | **PASS** | Enter abre pase/código, Escape cierra y devuelve el foco. Consultar el sello 8 conserva 8/9. A 200%, icono y número ocupan posiciones separadas y legibles; el foco rodea la celda completa. |
| Agenda y gestión | **PASS** | Las cuatro anclas enfocan sus títulos. Recarga mantiene instrucciones y límites, y el acordeón de ayuda conserva el borrador. El saldo ampliado se presenta como «C$ 9,900» sin partir el número. |

No se encontró una regresión de uso bloqueante en las áreas revalidadas.

## Evidencia directa de R2

- Contexto independiente Edge Chromium, entrada por `/__preview/entrar` seguida de `/club`, con red externa bloqueada. Recurso principal observado: `principal-WGvFKpDP.js`.
- Pase y código del café abiertos mediante Enter; el foco inicial entra en «Cerrar panel». Escape devuelve el foco al control que los abrió. Se leyó código vigente y su vencimiento; no se confirmó entrega.
- «Mis beneficios», «Mis sellos», «Experiencias» y «Mi cuenta» actualizaron el fragmento y enfocaron su título correspondiente.
- Consulta de «Sello 8 · Prueba» mediante Enter: conserva «8 de 9 sellos. Te falta 1 sello». El número se distingue del icono en la celda ampliada.
- «Cómo recargar» mantiene el mensaje de pago en caja y los límites de C$ 200 a C$ 3,000; se cerró sin recargar. El borrador «Borrador local R2 sin enviar.» permaneció tras cerrar y abrir el acordeón de ayuda.
- En una página independiente a 320 × 700 se duplicaron los tamaños computados de texto. Documento y cuerpo mantuvieron 320 px. Café, pase, bolsa, sello y recarga quedaron completos dentro del ancho y con su centro visible sin cobertura. La celda del sello pasó a 118 × 118 px, con icono y número separados.
- No se ejecutaron compras, entregas, renovaciones, cobros ni envíos de ayuda. La solicitud de código y telemetría permanecieron locales.

Capturas propias: [sello por teclado](uso-r2/01-sello-teclado-390.png), [borrador conservado](uso-r2/02-ayuda-borrador-390.png), [sello y foco al 200%](uso-r2/03-sello-foco-texto200-320.png), [gestión y foco al 200%](uso-r2/04-saldo-foco-texto200-320.png). Registro: [uso-r2/observaciones.json](uso-r2/observaciones.json).

## Evidencia R2 revisada y límites

Se revisó [pruebas-r2/resultados.json](pruebas-r2/resultados.json): nueve comprobaciones aprobadas, sin errores ni solicitudes externas registradas. No se repitió esa suite ni la suite transaccional.

Las capturas [saldo al 200%](pruebas-r2/activo-320-texto200-saldo.png), [sellos al 200%](pruebas-r2/activo-320-texto200-sellos.png) y [bolsa al 200%](pruebas-r2/activo-320-texto200-bolsa.png) muestran saldo legible, cifras sin fraccionamiento e iconos separados de los números. Estas son evidencias previas revisadas; las capturas propias documentan la interacción focal.

La [cuenta gratuita R2](pruebas-r2/gratis-390-completo.png) mantiene los sellos antes de la oferta y ahora indica «Tu período anterior terminó el 1 oct.» frente a consulta del 22 de octubre. La incoherencia de fecha anotada en R1 queda **resuelta en la evidencia R2**.

Se conservan los límites de R1: datos sintéticos, una única experiencia visible y ausencia de operaciones reales. La lógica de nuevo sello confirmado, los estados adicionales y la matriz restante siguen respaldados por la suite previa, no por nuevas transacciones de esta revisión. La revalidación no es una auditoría completa de lector de pantalla ni de todos los navegadores.

---

# Revisión R1 — antecedente conservado

Fecha: 22 de octubre de 2026. Revisión de caja negra: no se leyó ni modificó la implementación de la aplicación.

## Dictamen

| Pieza | Resultado | Fundamento |
| --- | --- | --- |
| Entrada y beneficios | **PASS** | La vista activa abre con el café del día como acción principal; el pase queda compacto debajo. Los cinco beneficios se distinguen y sus alcances, vigencia y renovación se pueden consultar con teclado. La captura de cuenta gratuita coloca sus sellos antes de la oferta opcional. |
| Pase, sellos y estados | **PASS** | El pase y el código se abren con Enter y se cierran con Escape, devolviendo el foco. Consultar un sello muestra su visita sin alterar el progreso. Los estados adicionales y la animación exclusiva del sello nuevo están respaldados por la evidencia previa identificada abajo. |
| Agenda y gestión | **PASS** | La experiencia presenta fecha, nombre, precio, disponibilidad y condiciones antes de revisar la entrada. El saldo tiene una sola ubicación principal; movimientos, recarga, reservas, historial y ayuda son localizables. El borrador de ayuda permanece al cerrar y volver a abrir su acordeón. |

No se encontró una brecha de uso bloqueante en el alcance observado. Los PASS están limitados a la vista sintética y a las evidencias revisadas; no certifican operaciones reales.

## Observación directa

Se abrió `http://127.0.0.1:5320/__preview/entrar` y luego `/club` en un contexto independiente de Microsoft Edge Chromium, con bloqueo de solicitudes externas. La cuenta sintética estaba activa, con 8 de 9 sellos, una experiencia y contrato anterior. Se guardaron evidencias propias en [uso](uso/).

- **Primera pantalla, 390 × 844:** café filtrado, estado «Disponible hoy» y «Mostrar código del café» dominan la entrada. La fotografía está identificada como imagen de ambiente. El pase no compite con el café y su botón completo dispone del nombre accesible «Mostrar mi pase».
- **Beneficios y términos:** los cinco beneficios aparecen enumerados. Se abrieron con Enter «Qué incluye tu café», «Cuándo retirarla», «Ver alcance del descuento», «Cómo solicitarla» y «Todos tus beneficios y condiciones». Los textos explican día de Managua, confirmación en caja, bolsa del contrato anterior por mes calendario, productos sujetos a consulta, prioridad VIP según disponibilidad y acceso anticipado de 48 horas. Las condiciones explican renovación de 30 días con consentimiento y saldo, posibilidad de desactivarla, conservación del período pagado y finalización sin deuda si falta saldo. El fin de vigencia es visible junto al pase.
- **Pase:** Enter abre el panel y enfoca «Cerrar panel». Tab recorre los controles del diálogo; no activa controles del fondo. Escape cierra y devuelve el foco a «Mostrar mi pase». El código y la identidad son legibles.
- **Código del café:** se esperó el código vigente y su cuenta regresiva. El panel dice expresamente que mostrarlo no consume el beneficio y que la entrega la confirma el personal. Escape devuelve el foco al botón original; el café continúa disponible. No se confirmó una entrega.
- **Anclas:** «Mis beneficios», «Mis sellos», «Experiencias» y «Mi cuenta» actualizan el fragmento, desplazan al título y lo enfocan. Los títulos quedaron aproximadamente a 56 px del borde superior en 390 px de ancho.
- **Sellos:** los ocho marcados tienen nombres como «Consultar sello 8». Enter sobre el octavo muestra «Sello 8 · Prueba» y fecha; el progreso sigue en 8/9. La novena posición permanece sin marcar. La selección tiene foco visible.
- **Experiencia:** se distinguieron fecha, nombre, precio y 12 de 12 butacas, con un acordeón de contenido y condiciones. «Revisar entrada» abre un diálogo con importe, saldo y casilla de revisión. «Confirmar pago» está deshabilitado inicialmente. Se salió con Escape sin marcar la casilla ni comprar.
- **Gestión:** «Cómo recargar» explica pago en caja y límites de C$ 200 a C$ 3,000. Se salió sin actualizar ni recargar. El historial del período se abre con teclado. Se escribió un borrador en «Contanos qué necesitás», se cerró y abrió el acordeón y se comprobó que seguía íntegro. No se envió.
- **Texto al 200%:** en una página independiente de 320 × 700 se duplicó el tamaño computado de cada elemento, sin escalar el contenedor. Documento y cuerpo mantuvieron 320 px; no se detectaron elementos visibles del contenido principal fuera del ancho. El CTA del café quedó completo y con foco visible. Un recorrido de 35 tabulaciones mantuvo visible y sin cobertura el centro de cada control, incluidos beneficios, sellos, agenda y gestión. La barra inferior se distribuye en dos filas. Esto no equivale a probar todas las combinaciones de zoom de cada navegador.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce`, la carga y consulta del sello no generaron eventos `animationstart`. No se creó un sello nuevo en esta revisión.

Las solicitudes observadas fueron locales. Las escrituras correspondieron a telemetría y solicitud del código del beneficio. No hubo compras, cobros, renovación, entrega ni envío de ayuda en esta inspección. El registro resumido está en [uso/observaciones.json](uso/observaciones.json).

## Evidencia previa revisada, sin repetir la suite

Se leyeron [pruebas-r1/resultados.json](pruebas-r1/resultados.json), los cinco informes Axe y capturas de cuenta gratuita, entregado, renovación pendiente, premio pendiente, experiencia agotada y error de actualización. No se presentan esos resultados como interacciones realizadas por esta revisión.

- El JSON contiene nueve comprobaciones focales aprobadas, sin errores de JavaScript ni solicitudes externas registradas. Declara Edge Chromium, Worker y PGlite aislados y variantes GET sintéticas.
- Las cinco salidas Axe revisadas informan cero violaciones; esto no sustituye la inspección humana ni acredita accesibilidad completa.
- Las capturas permiten observar sellos antes de la oferta opcional en cuenta gratuita; café entregado con acción visualmente desactivada; aviso de renovación pendiente; premio pendiente separado del progreso de la tanda; experiencia sin butacas; y error de actualización que conserva los beneficios visibles.
- El resultado previo declara que únicamente el sello nuevo anima y que no animan carga, reentrada, cambio de tanda ni movimiento reducido. La condición de nuevo sello confirmado no se provocó aquí.
- La suite transaccional de 24 casos en tres motores fue comunicada como antecedente. No se volvió a ejecutar ni se afirma como observación personal.

## Límites y observación de la evidencia

- La preview utilizada presentó una única experiencia; se verificó la jerarquía interna de su tarjeta y las acciones de agenda, pero no una ordenación entre varias experiencias simultáneas.
- Las consultas y condiciones del catálogo son sintéticas. No se validaron precios, cupos, vigencias o contenido comercial frente a datos de producción.
- La captura gratuita presenta una inconsistencia temporal del fixture: dice «Tu período anterior terminó el 21 nov.» mientras el pie registra consulta el 22 de octubre de 2026. Conviene corregir esa fecha en la evidencia para evitar una lectura contradictoria. No se atribuye a la lógica real sin reproducirla con datos coherentes.
- No se revisaron lector de pantalla real, alto contraste del sistema, navegación por voz ni toda la matriz de dispositivos. La comprobación propia de texto ampliado cubre Edge a 320 px; las otras dimensiones pertenecen a la suite previa.

## Capturas propias

- [Entrada activa, 390 px](uso/01-inicial-390.png)
- [Pase abierto y foco](uso/02-pase-390.png)
- [Código vigente del café](uso/03-codigo-cafe-390.png)
- [Borrador conservado](uso/04-ayuda-borrador-390.png)
- [Consulta de sello](uso/05-sello-consulta-390.png)
- [Texto al 200% y foco, 320 px](uso/06-texto200-foco-320.png)
- [Consulta con movimiento reducido](uso/07-reduced-motion-sello-390.png)
