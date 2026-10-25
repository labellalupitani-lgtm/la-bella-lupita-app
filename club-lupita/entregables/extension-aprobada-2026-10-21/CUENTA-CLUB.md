# Club, cuenta y lectura: implementación y evidencia

Fecha: 21 de octubre de 2026. Alcance de esta entrega: Club, Conocé tu club, Perfil y sus componentes de cuenta. La sexta composición de Inicio ya fue aprobada para extenderse. Este informe acredita los recorridos descritos, no la aprobación visual del conjunto de la aplicación. La crítica independiente corresponde al siguiente paso de integración. No se publicó ni se usaron cuentas reales.

## Diseño aplicado

**Club** organiza la tarea en pertenencia/pase, beneficios, sellos, saldo y experiencias. Los atajos internos conducen a destinos existentes, incluso con renovación pendiente. Las tarjetas de café y bolsa tienen una categoría breve; los sellos forman un bloque propio; el saldo usa cifras Montserrat y acciones claras. Las experiencias mantienen nombre, fecha, precio, disponibilidad y condiciones juntas. Se incorporó un acceso visible a «Conocé tu club» dentro de «Tu próxima visita».

**Conocé tu club** combina una foto natural existente de la casa con la explicación inicial, luego compara cuenta gratuita y membresía opcional. Sus índices, pasos y preguntas frecuentes hacen legible el contenido sin modificar precios ni reglas. La foto no sustituye ningún dato contractual.

**Perfil** tiene un índice de datos/cuenta/ayuda, una identidad personal con inicial, contacto estructurado y grupos visuales distintos para preferencias, privacidad, nivel, saldo, ayuda y sesión. Conserva la edición con borradores y conciliación. La actividad indica su filtro con forma y `aria-pressed`; el cambio de lista tiene una transición breve que desaparece con movimiento reducido.

**Componentes**: códigos con contraste y espacio, condiciones versionadas, estado de la entrada separado de su comprobante, formularios coherentes y estado ocupado veraz en espera VIP y atención. El pase compartido solo recibe la nueva superficie cuando está en Mi Club: la regla CSS se limita a `body:has(.mi-club)` para preservar Inicio.

Se usan Playfair para titulares, Montserrat para texto/cifras/controles y los tokens existentes de la dirección aprobada. No se alteraron APIs, precios, reglas comerciales, consentimientos, registro de cobros, versiones de contrato ni mecanismos de recuperación.

## Fuentes modificadas

- `src/casa/pantallas/Club.tsx`
- `src/casa/pantallas/ConoceClub.tsx`
- `src/casa/pantallas/Perfil.tsx`
- `src/casa/componentes/PaseSocio.tsx`
- `src/casa/componentes/CodigoBeneficio.tsx`
- `src/casa/componentes/CondicionesClub.tsx`
- `src/casa/componentes/EsperaVip.tsx`
- `src/casa/componentes/EntradaClub.tsx`
- `src/casa/componentes/CuentaCliente.tsx`
- `src/casa/componentes/Atencion.tsx`
- `src/casa/estilos/redisenio-cuenta.css` (nuevo)

Las fuentes globales, topbar, navegación, botones, hojas y escala rem fueron integradas por el coordinador. Este conjunto no editó Inicio ni ejecutó builds concurrentes. [Huellas SHA-256 de cierre](evidencia/cuenta/fuentes-cuenta.json).

## Evidencia visual

Las capturas completas muestran el documento; las barras fijas aparecen en la posición del viewport capturado. Las imágenes de viewport sirven para valorar el primer encuadre.

| Superficie | Antes a 390 px | Después a 390 px | Después a 1440 px |
| --- | --- | --- | --- |
| Club | [Antes](evidencia/cuenta/antes-club-390.png) | [Documento](evidencia/cuenta/final-club-390.png) · [Viewport](evidencia/cuenta/viewport-club-390.png) | [Documento](evidencia/cuenta/final-club-1440.png) |
| Conocé | [Antes](evidencia/cuenta/antes-conoce-tu-club-390.png) | [Documento](evidencia/cuenta/final-conoce-tu-club-390.png) · [Viewport](evidencia/cuenta/viewport-conoce-tu-club-390.png) | [Documento](evidencia/cuenta/final-conoce-tu-club-1440.png) |
| Perfil | [Antes](evidencia/cuenta/antes-perfil-390.png) | [Documento](evidencia/cuenta/final-perfil-390.png) · [Viewport](evidencia/cuenta/viewport-perfil-390.png) | [Documento](evidencia/cuenta/final-perfil-1440.png) |

También hay capturas de 320 y 768 px, y [Club](evidencia/cuenta/texto200-club.png), [Conocé](evidencia/cuenta/texto200-conoce-tu-club.png) y [Perfil](evidencia/cuenta/texto200-perfil.png) con texto duplicado de forma efectiva. Los recorridos posteriores de dist añaden [renovación pendiente](evidencia/cuenta/variantes/gracia.png), [cesión](evidencia/cuenta/variantes/cesion-confirmacion.png), [actividad con error que conserva datos](evidencia/cuenta/variantes/actividad-error-con-datos.png) y [ayuda respondida](evidencia/cuenta/perfil-estados/ayuda-respondida.png).

## Pruebas ejecutadas

Todas las pruebas usan Worker y PGlite aislados con datos sintéticos. El navegador bloquea solicitudes ajenas a localhost. Las compras, renovaciones, cesiones y respuestas indicadas como reales corresponden únicamente a ese servidor de prueba. Los dobles de red se detallan en los resultados de cada script.

| Suite propia en `evidencia/cuenta` | Resultado | Qué respalda |
| --- | --- | --- |
| `verificar.mjs` | 21 casos pasaron; un timeout de navegación repetido por separado pasó | Fuente servida en 5210: tres rutas a 320/390/768/1440, fuentes, imágenes, reflujo, atajos, pase, beneficio, borrador, actividad, FAQ, texto 200 % y axe. [Primera ejecución](evidencia/cuenta/resultados.json) y [cierre del único timeout](evidencia/cuenta/resultados-conoce-cierre.json). |
| `perfil-regresion.mjs` | 10/10 | Datos independientes, borrador/foco, cierre mientras guarda, conflicto por campo, respuesta perdida, validación y consentimiento, contrato corrupto, texto 200 %, ayuda y salida offline con revocación posterior. [JSON](evidencia/cuenta/regresion-perfil/edge/ui.json). |
| `club-regresion.mjs` | 24/24 (8 por motor) | Edge/Firefox/WebKit: oferta y aceptación, pase, recarga sin contratación automática, respuesta perdida sin doble cobro, beneficio/foco/tiempo, código incompleto/reintento/entrega, comprobantes/axe y DNT. [JSON](evidencia/cuenta/regresion-club/interfaz.json). |
| `conoce-regresion.mjs` | 21/21 (7 por motor) | Edge/Firefox/WebKit: información pública, error/contrato incompleto, 320–1440/200 %/teclado/axe, enlace visible desde Club, precio cambiado en experiencia y contrato aceptado inmóvil durante refresco, DNT. [JSON](evidencia/cuenta/regresion-conoce/interfaz.json). |
| `operacion-regresion.mjs` | 3/3 | Propietario edita reglas verificadas y cliente las ve, reposición con motivo/confirmación, axe y errores de ejecución del panel recorrido. [JSON](evidencia/cuenta/regresion-operacion/operacion-ui.json). |
| `reglas-regresion.mjs` | 4/4 | Activación requiere costos/evidencias, sello en caja con comprobante, selección de premio, solicitud VIP → oferta del propietario → actualización → cancelación sin cobro. [JSON](evidencia/cuenta/regresion-reglas/reglas-interfaz.json). |
| `variantes.mjs` | 8/8 | Gracia/pending, renovación activa y cancelada, historial anterior, reposición, caducidad, espera por plaza, experiencias no abiertas/agotadas, cesión y actividad paginada. [JSON](evidencia/cuenta/variantes/resultados.json). |
| `perfil-estados.mjs` | 4/4 | Perfil ausente/error/reintento, actividad vacía, invitación copiar/fallo, atención ocupada/error conservando texto/pendiente/respondida y aviso marcado leído persistido. [JSON](evidencia/cuenta/perfil-estados/resultados.json). |

Las suites copiadas de `tests/` conservan sus comprobaciones comerciales. Solo se adaptaron rutas de importación y salida, título aprobado de acceso, texto del enlace vigente y apertura del nuevo `summary` «Editar condiciones y costos verificados». La evidencia histórica no se sobrescribió.

**Trazabilidad de build:** el coordinador informó `principal-B-AEWBC6.js` antes de las regresiones iniciales y `principal-DImVgW3Q.js` antes de Conocé/variantes. Las suites no imprimían el hash al comenzar; no se afirma que todas usaran un hash idéntico. El manifiesto de cierre registra `principal-4KPpZegJ.js`, compilado después por integración. Los resultados de fuente y dist se distinguen aquí; no equivalen a una repetición completa sobre ese último dist.

**Hallazgo corregido:** al duplicar texto, el estado de membresía y el botón de pase podían producir 451 px de ancho en un viewport de 390. El contenedor ahora permite envolver sus elementos y limita el botón al ancho disponible. El reflujo posterior pasó. También se corrigió la especificidad de sellos/experiencias frente a las superficies globales. Los archivos `fallo*.png` conservan intentos previos del ensayo, no son el resultado final; el timeout de Conocé se resolvió con repetición aislada y espera de navegación de 30 s. Los ajustes de selectores del ensayo de ayuda y las consultas del fixture no requirieron cambios funcionales de la app.

## Cobertura por componente y estado

Esta tabla delimita lo recorrido. «Pendiente» significa que esta entrega no tiene evidencia suficiente de ese caso; no afirma que exista un defecto.

| Fila de la matriz / componente | Recorrido y fuente | Límites que debe cerrar la revisión integrada |
| --- | --- | --- |
| `cliente-conoce-club`, `publico-conoce-club` / ConoceClub | Información vigente, cinco beneficios, cuenta gratuita frente a membresía, FAQ cerrada/abierta por teclado, error/incompleto/reintento y acceso sin cobro. Conocé 21 y fuente. | Crítica visual independiente. |
| `cliente-mi-club` / Club | Sin membresía y activa (Club 24), gracia y renovación pendiente, contrato anterior/historial, espera sin plazas, experiencia disponible/agotada/no abierta (Variantes 8), contrato vigente tras edición de propietario (Operación 3). | Entrada `?beneficio=bolsa`: foco y atribución no recorridos por este conjunto. |
| `cliente-club-contratacion-renovacion` / Club, CondicionesClub | Contrato previo, consentimiento, saldo insuficiente con recarga, compra incierta y recuperación sin duplicar, renovación activa/cancelada/pendiente y condiciones históricas. Club 24 + Conocé 21 + Variantes 8. | Crítica visual de estados además de las capturas proporcionadas. |
| `cliente-club-beneficios-espera` / CodigoBeneficio, EsperaVip | Código y tiempo, respuesta incompleta/reintento, entrega, reposición autorizada conservando original entregado, vencimiento visual y regeneración disponible, alta/baja de espera, VIP ofrecida y cancelada. Club 24 + Reglas 4 + Variantes 8. | El caso de fecha ya caducada usa respuesta interceptada; no equivale a esperar minutos reales. Café, bolsa y reposición tienen evidencia; no se extrapola a cada combinación posible de reglas. |
| `cliente-club-experiencias` / Club | Oferta abierta, no abierta y agotada; precio cambiado rechazado y oferta aceptada conservada durante refresco. Compra de entrada registrada mediante API del fixture para preparar cesión. | Oferta cancelada, saldo insuficiente específico de experiencia, compra UI ocupada/incierta/recuperada y confirmada de extremo a extremo requieren evidencia adicional. La prueba de membresía no acredita esas variantes de experiencia. |
| `cliente-entrada-cesion` / EntradaClub | Entrada vigente, botón deshabilitado sin destinatario/confirmación, destinatario sintético válido, confirmación, envío real, entrada cedida y conservación de comprobante en compras. Variantes 8. | Asistida, cancelada/reembolsada, recibida y error del servidor al ceder no recorridos aquí; revisar con el conjunto de compras. |
| `cliente-perfil` / Perfil | Contacto, ausencia de datos, carga independiente, nivel, preferencias, privacidad, invitación copiada/fallo y salida sin red/revocación al reconectar. Perfil 10 + Perfil estados 4. | Compartir nativo, cierre online y cierre de todos los dispositivos no recorridos por este conjunto. Copia y fallo están simulados para no tocar el portapapeles del usuario. |
| `cliente-perfil-edicion-conciliacion` / CuentaCliente | Limpio/sucio/guardando, validación, borrador al reabrir, respuesta perdida, conflicto por campo y última lectura válida. Perfil 10. | Crítica visual del diálogo de conflicto; la funcionalidad sí está en la suite. |
| `cliente-perfil-actividad` / CuentaCliente | Vacía/poblada, filtro/selección, carga de anteriores, error conservando registros, reintento, final. 45 asientos adicionales generados; total visible contrastado con IDs únicos de API, importes y fechas en Managua preservados. Fuente + Variantes 8 + Perfil estados 4. | No se declara auditoría contable de producción; es regresión local de presentación y paginación. |
| `cliente-atencion-ayuda` / AtencionCliente | Categoría datos, validación nativa presente, ocupado/error con texto conservado, solicitud registrada/pendiente, respuesta real del propietario, aviso sin leer/leído persistido. Perfil estados 4 y Perfil 10. | Validación de longitud corta, desplegado/plegado en Club/Reservar y todos los consumidores deben examinarse en revisión integrada; no se acreditan por haber probado Perfil. |
| PaseSocio compartido | Apertura, texto, Escape/retorno, no teléfono expuesto y texto 200 %. Fuente + Club 24. | Composición Inicio a comparar por el coordinador; estilo propio se limita a Mi Club. |
| Paneles operativos relacionados | Propietario reglas/costos/reposición y flujo VIP con caja/cliente. Operación 3 + Reglas 4. | No acredita todas las funciones ni roles de Equipo. `AtencionEquipo` no es el consumidor operativo activo; el activo se encuentra fuera de esta propiedad. |

Los pendientes se comunicaron al coordinador para evitar marcar filas completas por una captura o por un cambio de CSS. Esta entrega queda lista para el recorrido crítico independiente y cualquier corrección que arroje.

## Adenda: cierre de experiencias y entradas

Ejecutada el 21 de octubre a las 15:51 UTC con **`principal-y2OYufuF.js`**, registrado igual al inicio y al final. El coordinador compiló ese dist después del ajuste aislado de Kit; se esperó su confirmación antes de iniciar. No se modificó ninguna fuente del producto. El fixture abrió un puerto HTTPS efímero propio con Worker/PGlite, dos cuentas sintéticas en contextos de navegador separados y red externa bloqueada. No se usaron los puertos compartidos de revisión.

Script: [cierre-experiencias.mjs](evidencia/cuenta/cierre-experiencias.mjs). Resultado: **6/6 casos**, sin errores de ejecución ni desbordamiento a 390 px. **Siete estados examinados con axe, cero infracciones**. [Resultados, hashes y limitaciones](evidencia/cuenta/cierre-experiencias/resultados.json).

| Pendiente anterior cerrado | Evidencia obtenida |
| --- | --- |
| Saldo insuficiente específico de experiencia | Saldo preparado a cero con un asiento del fixture. «Recargar para…» abre la hoja, mantiene `/club` y no crea entrada. Restaurar el saldo y volver tampoco cobra automáticamente. [Captura](evidencia/cuenta/cierre-experiencias/saldo-insuficiente.png) · [axe](evidencia/cuenta/cierre-experiencias/axe-recarga.json). |
| Pago de experiencia ocupado, fallido, incierto y recuperado | Checkbox previo obligatorio. Durante una demora sintética, botón `aria-busy` y checkbox deshabilitado. Un 503 antes del procesamiento no crea entrada ni cargo. El siguiente intento sí llega al Worker, pero su respuesta se descarta: la UI explica la incertidumbre y conserva la referencia. Reintentar envía la misma referencia, confirma la entrada y permite abrir su comprobante. Se comprobó exactamente una entrada, un asiento con `sol:` + referencia y un único descuento del saldo. [Ocupado](evidencia/cuenta/cierre-experiencias/pago-ocupado.png) · [error](evidencia/cuenta/cierre-experiencias/pago-error.png) · [respuesta perdida](evidencia/cuenta/cierre-experiencias/pago-respuesta-perdida.png) · [recuperado](evidencia/cuenta/cierre-experiencias/pago-recuperado.png). |
| Error de cesión y entrada recibida | Enviar el código del propio comprador produce el 422 real del Worker, conserva código y consentimiento, y no cambia el titular. Corregir al código de la segunda cuenta obliga a confirmar otra vez. Después de ceder, el comprador conserva el comprobante y el receptor ve «Entrada recibida a tu nombre», importe cero y ausencia de botón para volver a ceder. [Error real](evidencia/cuenta/cierre-experiencias/cesion-error-real.png) · [receptor](evidencia/cuenta/cierre-experiencias/entrada-recibida.png). |
| Entrada cancelada/reembolsada en ambas cuentas | Cancelación mediante endpoint real del propietario, con motivo y confirmación. El saldo del comprador recibe el precio íntegro una sola vez; el del receptor no cambia. Ambas UIs muestran la cancelación y devolución al comprador, sin cesión. Repetir la cancelación no crea otro asiento de devolución. [Comprador](evidencia/cuenta/cierre-experiencias/entrada-cancelada-comprador.png) · [receptor](evidencia/cuenta/cierre-experiencias/entrada-cancelada-receptor.png). |
| Oferta cancelada | La cancelación anterior elimina la experiencia del catálogo y muestra el vacío en Club. Además se creó otra oferta por el endpoint operativo, se abrió su revisión y se canceló antes de confirmar: el pago es rechazado por el Worker, sin cargo ni entrada. Actualizar elimina la oferta. [Catálogo](evidencia/cuenta/cierre-experiencias/catalogo-sin-oferta-cancelada.png) · [rechazo durante revisión](evidencia/cuenta/cierre-experiencias/oferta-cancelada-durante-revision.png). |
| Aclaración de compartir nativo | Edge expone `navigator.share`, pero Perfil no implementa esa acción: su función usa únicamente `navigator.clipboard.writeText`. La UI ofrece «Copiar enlace del Club» y alternativa manual. Se acreditó esa UI; no se invocó ni simuló una hoja de compartir inexistente. Copia y fallo ya tenían evidencia en `perfil-estados.mjs`. [Captura](evidencia/cuenta/cierre-experiencias/perfil-copia-ui.png). |

Los únicos dobles de red de esta adenda fueron el 503 previo al pago y la pérdida deliberada de la respuesta después del pago confirmado por el Worker. La preparación del saldo usa asientos sintéticos; cesión, rechazo por destinatario, publicación/cancelación de oferta, devolución e idempotencia se ejecutaron contra la lógica real aislada. La primera ejecución del ensayo consultó la referencia sin el prefijo `sol:`; se corrigió esa comprobación del test y se repitió el recorrido completo, sin cambios de producto.

Esta adenda cierra los pendientes enumerados de `cliente-club-experiencias` y amplía `cliente-entrada-cesion` con error, recibida y cancelada/reembolsada. **Entrada asistida** permanece sin recorrido propio. También siguen pendientes aquí el foco/atribución de `?beneficio=bolsa`, cierres de sesión online/todos dispositivos y las variantes de ayuda desplegada/plegada en otros consumidores. No se extiende esta prueba de Edge 390 × 844 a otros motores o tamaños; las regresiones previas conservan su alcance y versión.

### Conciliación con revisión integrada

El árbitro de uso recorrió la entrada asistida, el foco de `?beneficio=bolsa`, cierre de todos los dispositivos y atención cliente→equipo→cliente. Se cierran esos pendientes por su evidencia independiente, sin reatribuirlos a esta suite. Las tres disciplinas terminaron en PASS. [REVISION-USO.md](REVISION-USO.md) y [LEEME.md](LEEME.md) son el estado de cierre vigente; las tablas anteriores conservan el alcance propio de cada ejecución.
