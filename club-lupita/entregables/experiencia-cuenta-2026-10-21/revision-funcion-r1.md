# Revisión funcional independiente · ronda 1

Fecha: 21 de octubre de 2026, hora de Managua. Crítico de funcionalidad/brief. Se juzgó el navegador y sus respuestas, sin leer ni modificar la implementación del producto ni los reportes de construcción. Se consultaron pruebas existentes únicamente para identificar recorridos.

Entorno: vista propia `http://127.0.0.1:5298`, iniciada con `node scripts/vista-previa-diseno.mjs --port 5298 --dist dist --experiencia --equipo`. `/__preview/status` confirmó PGlite en memoria, credenciales sintéticas y red externa bloqueada. Edge sin interfaz, 390 × 844; reflujo adicional a 913 px con gutter estable y 320 px con fuentes efectivamente duplicadas. Las peticiones externas se bloquearon también en el navegador. No se enviaron mensajes ni operaciones a la casa real.

## Veredicto binario

| Pieza | Veredicto | Brecha que debe cerrar |
| --- | --- | --- |
| Tienda | **PASS** | Ninguna brecha funcional bloqueante en los recorridos ejercitados. |
| Mi Club | **FAIL** | «Ver movimientos» abre preferencias, sin mostrar movimientos. |
| Perfil | **FAIL** | El error del resumen de cuenta pide actualizar pero no ofrece reintento. |

## F1 · «Ver movimientos» pierde su destino — P2

**Reproducción:** entrar como cliente sintético; abrir `/club`; pulsar «Ver movimientos» en Tu saldo disponible. Ocurre también usando teclado.

**Resultado:** URL `/perfil`; pestaña seleccionada «A tu gusto»; panel de bebida, cumpleaños y alergias. Los movimientos quedan ocultos tras «Tu cuenta». La acción no cumple el destino anunciado. Es un desvío introducido por la separación del Perfil en pestañas.

**Impacto:** quien quiere revisar dinero y consumos llega a un área distinta y debe descubrir otra pestaña. El enlace de saldo deja de ser un acceso directo útil.

**Evidencia:** `evidencia-funcion/club-ver-movimientos-destino.png`; reproducción automática `evidencia-funcion/repro-r1.mjs`. El navegador confirma que `/perfil#perfil-cuenta` sí abre «Tu cuenta», por lo que existe un destino directo apropiado.

**Corrección requerida:** dirigir este enlace al panel de cuenta y llevar el contenido pertinente a la vista. Volver a probar desde Mi Club con clic y Enter, comprobando pestaña, URL y movimientos visibles.

## F2 · Resumen de cuenta sin mecanismo de recuperación — P2

**Reproducción:** interceptar solo `/api/yo` y devolver HTTP 503, manteniendo `/api/perfil` correcto; recargar `/perfil#perfil-cuenta`. También se reprodujo con HTTP 200 y respuesta incompleta, omitiendo `movimientos`.

**Resultado:** Perfil sigue operativo y no inventa saldo, pero muestra «El resumen de saldo no está disponible. Podés consultar tu actividad e intentar actualizar la cuenta.» sin botón de actualización/reintento. El árbol accesible de toda la página solo presenta «Ver toda mi actividad», «Mis compras y reservas» y «Ver Mi Club y sus reglas» en ese panel. Después de recuperar el servicio no hay acción local para pedir de nuevo el resumen.

**Impacto:** el usuario recibe una instrucción que la interfaz no permite ejecutar. Depende de recargar el navegador o abandonar la página. El fallo de dinero y nivel queda sin recuperación clara aunque la edición del perfil funcione.

**Evidencia:** `evidencia-funcion/perfil-cuenta-error-sin-reintento.png`, `evidencia-funcion/perfil-lectura-incompleta.png`; reproducción automática `evidencia-funcion/repro-r1.mjs`.

**Corrección requerida:** acción visible y accesible que recargue el resumen, con estado de carga y resultado. Verificar que funciona tras retirar la respuesta 503, conserva la pestaña y recupera saldo y movimientos sin recargar la página.

## Recorridos ejercitados

- **Tienda:** «El café» y «El retiro» cambian el contenido con Enter; fechas, ubicación y condiciones se mantienen coherentes. El encargo refleja tipo, cantidad, fecha y zona tanto en vista previa como en enlace WhatsApp codificado; caracteres `&` y `< >` permanecen datos, sin alterar el enlace. No se abrió ni envió WhatsApp.
- **Compra:** el botón de pago comienza deshabilitado; requiere consentimiento. Se forzó 503, apareció error en el diálogo, se consultó el intento sin cobro y se descartó. La siguiente cotización exige consentimiento otra vez y conserva los datos de encargo. No se duplicó el envío de compra durante este recorrido.
- **Mi Club:** sello 8 activado con Espacio anuncia visita y fecha. El pase se abre y se cierra con Escape. «Usar mi café de hoy» y «Mostrar código del café» entregan el mismo código vigente y vencimiento. Pase, café y bolsa son códigos distintos. Respuesta incompleta de código se rechaza y «Reintentar código» recupera uno válido. El premio pendiente se comprobó con una lectura sintética: acceso por Enter y error recuperable cuando el backend no contiene la tanda; esto valida la interfaz del error, no el canje exitoso.
- **Perfil:** flechas, Home y End seleccionan las tres pestañas y mantienen foco; el acceso por campo enfoca la bebida después de abrir el diálogo. Cerrar con Escape y cambiar pestañas conserva el borrador. `#perfil-cuenta` y `#perfil-ayuda` abren el panel esperado; ayuda recibe foco. La actividad carga y los filtros se actualizan correctamente una vez terminada su petición.
- **Ayuda:** texto y motivo persisten al cambiar pestañas. Un 503 mantiene el texto y permite reenviar; la respuesta correcta muestra solicitud registrada y pendiente de atención. Se usó solo la instancia sintética propia.
- **Lecturas incompletas:** perfil sin nombre se rechaza con «Volver a intentar», sin excepción ni datos inventados. El resumen incompleto queda indisponible; es el F2 por falta de recuperación local.
- **Reflujo:** se guardaron vistas de las tres piezas a 913 px con gutter y a 320 px con texto al 200%. No aparecieron acciones inalcanzables en los recorridos probados. Mi Club mide 321 px de scroll en una ventana de 320 px; se registra como observación menor de reflujo, sin elevarla a fallo funcional. Los pseudoelementos decorativos del pase producen `scrollWidth` interno mayor; esto por sí solo no demuestra contenido funcional cortado.
- **Sesión:** sin red, cerrar sesión oculta datos y muestra cierre pendiente con reintento. Al reconectar desaparece el pendiente. Tras recargar, la vista previa vuelve a mostrar la cuenta sintética: no se clasifica como fallo del producto sin descartar la autenticación de la fixture. Debe contrastarse con la regresión de sesión real aislada que ejecuta el coordinador.

## Evidencia y límites

`evidencia-funcion/revision-sesion.json` registra entorno, recurso JS, errores, respuestas de actividad y medidas. `layout.json` contiene medidas de ancho. Las capturas `tienda-encargo.png`, `tienda-error.png`, `club-sello-teclado.png`, `club-codigo.png`, `perfil-borrador.png`, `perfil-ayuda-error.png` y variantes `*-913-gutter.png` / `*-320-texto200.png` documentan los estados.

No hubo excepciones de ejecución en la sesión de revisión. El canje exitoso de premio, cierre remoto definitivo de sesión y contratos de cobro del backend requieren las regresiones independientes; esta revisión no los da por probados. La primera captura `perfil-filtro-canjes.png` tomó un estado transitorio antes de completar la respuesta y no es evidencia de fallo de filtros.
