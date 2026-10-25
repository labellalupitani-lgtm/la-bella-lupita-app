# Perfil: experiencia, contenido y continuidad del servicio

Auditoría de código y documentación del 8 de octubre de 2026. Alcance: Perfil cliente activo y sus conexiones con Club, registro, atención y preparación. No se modificó el producto ni se realizaron escrituras en producción. Las conclusiones de usabilidad son evaluación experta; no sustituyen observación de clientes reales. Las pruebas dinámicas y medidas visuales corresponden a la integración del agente principal.

## Qué se auditó realmente

La entrada vigente es `club-lupita/index.html:16` → `src/casa/main.tsx` → `src/casa/App.tsx` → `src/casa/pantallas/Perfil.tsx`. El `src/main.tsx` y `src/app/App.tsx` alternativos importan el Perfil antiguo de `src/pantallas/Perfil.tsx`: sus formularios, tema oscuro y estado local no son prueba del comportamiento activo.

La imagen aportada solo muestra el lateral de escritorio con Perfil seleccionado. No contiene el cuerpo del módulo; no permite concluir que los datos, acciones o formularios funcionen o estén bien distribuidos.

La especificación contiene decisiones históricas que el producto ya ha superado (por ejemplo, ancho fijo móvil o comentarios que dicen que el motor de puntos no está aplicado). Se contrastó cada afirmación con código. No se reabre como defecto la ausencia de tarjeta guardada: `SPEC.md:175–188` excluye explícitamente ese pago y describe la recarga en caja.

## Diagnóstico

Perfil dispone de edición real de nombre, bebida, alergias y cumpleaños; un historial con filtros y paginación; compras y reservas; copia del enlace; y salida de sesión. Es una base funcional, pero no una administración completa de la cuenta. La mayor mejora no es agregar más tarjetas: es conectar lo que el cliente declara con la operación de la casa y hacer visibles los datos y controles de su acceso.

El orden móvil atiende primero identidad, nivel y promoción; solo después aparecen datos editables. Se mezclan cuatro conceptos con nombres parecidos: perfil personal, nivel por puntos, membresía pagada y Cuenta de Casa. La información que determina el acceso y el contacto —correo, teléfono, promociones— no está administrada aquí.

## Hallazgos priorizados

### EXP-01 · P1 · Las preferencias críticas no llegan al lugar donde se prepara o entrega el pedido

**Confirmado en código; riesgo operativo, no prueba de daño real.**

- Perfil muestra alergias y permite guardarlas: `src/casa/pantallas/Perfil.tsx:179–183`, `src/casa/componentes/CuentaCliente.tsx:37–46`, `src/worker/cuenta-cliente.ts:37`.
- Se ven en la ficha del directorio: `src/casa/equipo/Clientes.tsx:74`.
- La atención en caja usa un contrato de nombre/teléfono/saldo y no presenta alergias ni bebida: `src/casa/componentes/CajaCliente.tsx:8–16`.
- Preparación representa nombre y líneas del pedido, sin preferencias: `src/casa/equipo/Pedidos.tsx:22–29`; `src/casa/operacion.ts:4` tampoco contiene estos datos.
- Caja y cocina no tienen acceso a la pestaña Clientes: `src/casa/pantallas/Personal.tsx:59`. Por tanto no basta con afirmar que el dato está en otra ficha.
- El PRD pedía explícitamente preferencias críticas en check-in/caja: `PRD.txt:29`.

**Consecuencia:** guardar una alergia puede producir una expectativa de atención que el flujo diario no satisface. La frase del formulario que pide avisar verbalmente es una mitigación existente y debe conservarse; no demuestra integración con cocina.

**Propuesta:** definir un circuito explícito: alergia declarada → confirmación al pedir → dato pertinente visible en caja/preparación → confirmación humana. Evitar dar acceso al directorio completo para resolverlo. Mantener acceso mínimo a la información necesaria para el pedido. Para bebida habitual, definir si es solo una nota consultable o habilita repetir una preparación; no asumir que es una variante válida de catálogo.

**Aceptación:** con un cliente sintético que declara una alergia, la persona autorizada que recibe y prepara su pedido ve la declaración pertinente antes de confirmar preparación; se distingue ausencia de declaración de declaración de ausencia; el texto cliente explica que debe confirmarla en cada pedido y que guardar el perfil no garantiza ausencia de alérgenos. La política de cuándo mostrar el dato y cuánto conservarlo debe estar acordada con operación.

**Investigación:** Square ofrece un ejemplo verificable de continuidad entre datos de perfil y la cita donde se entrega el servicio; no prueba resultados para Lupita ni prescribe copiar todo su producto. [Campos de perfil en reservas, Square](https://squareup.com/help/us/en/article/8271-collect-customer-profile-fields-in-online-booking).

### EXP-02 · P1 · Perfil no permite conocer ni gestionar los datos que sostienen el acceso y el contacto

**Carencia funcional confirmada; no vulnerabilidad demostrada.**

Registro exige correo verificado y teléfono, y permite aceptar promociones por correo (`src/casa/componentes/AccesoPersonal.tsx:54–62`). Perfil solo edita cuatro campos (`CuentaCliente.tsx:37–44`); `/yo` no selecciona correo ni el estado promocional (`src/worker/index.ts:443`) y el contrato `Socio` tampoco los incluye (`src/casa/datos.tsx:37–45`). El nombre no identifica inequívocamente cuál correo usa esta sesión. Un cambio de número o pérdida de correo no tiene una salida específica en Perfil.

La vista ofrece «Avisos por WhatsApp» / «Consultá tus preferencias en la barra» (`Perfil.tsx:196–199`), sin estado ni acción. Eso no corresponde al canal promocional que registra el alta. No se encontró en la UI activa un control para revisar/revocar la aceptación de promociones por correo. No se afirma que se estén enviando mensajes no autorizados: este trabajo no inspeccionó campañas externas.

**Propuesta:** sección «Tu cuenta» con correo de acceso verificado, teléfono de contacto y acciones separadas para actualizarlos; verificaciones y recuperación diseñadas con seguridad. Sección «Comunicaciones» que muestre la preferencia real por canal y distinga códigos de acceso de publicidad. Si WhatsApp todavía no tiene operación soportada, no representarlo como preferencia gestionable. Si depende de atención humana, ofrecer una solicitud explícita con estado.

**Aceptación:** el usuario sabe con qué correo entró; puede corregir el contacto o solicitar el cambio sin perder identidad ni historial; ve el consentimiento promocional guardado y puede retirarlo de forma verificable; la UI y el backend concuerdan por canal, y el siguiente acceso con la misma cuenta refleja el cambio. No se envían códigos de acceso a un correo nuevo sin verificarlo.

**Investigación:** la política vigente consultada de WhatsApp, actualizada el 23 de septiembre de 2026, exige permiso previo y respetar solicitudes de baja. Esto respalda diseñar un registro y una salida reales antes de activar el canal; no es una conclusión jurídica sobre la aplicación ni prueba de incumplimiento actual. [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/).

### EXP-03 · P2 · El trabajo principal de Perfil queda detrás de nivel e invitación en móvil

**Distancia a la acción confirmada en prueba local; impacto en abandono pendiente de usuarios.**

El DOM ordena identidad (`Perfil.tsx:93`), nivel (`109`), invitación (`148`), preferencias (`169`) y edición al final de cinco filas (`205`). En móvil CSS cambia a columna conservando ese orden (`src/casa/estilos/casa.css:306–309`). En escritorio recoloca preferencias arriba a la izquierda (`138`); así, la facilidad de encontrar la edición cambia entre dispositivos.

La prueba local del agente principal, con datos sintéticos, sitúa «Editar mi perfil» a 1.314,9 px desde el inicio en 390 × 844; «Cerrar sesión» a 1.827,4 px. En escritorio de 1.440 px la edición está en y=839,2 px. Evidencia: `evidencia/ui/resultados.json`, caso `01-diseno-responsive`, y `perfil-390.png`. Son medidas del fixture y viewport indicados, no promedios de usuarios.

La edición queda después de dos filas que no edita: recarga y WhatsApp. «Mantené tus preferencias al día» inmediatamente antes del botón sugiere más capacidad de la que tiene ese formulario. «Cómo recargás» es una explicación de operación, no un dato individual.

**Propuesta:** identidad breve con «Editar mis datos» inmediato; preferencias de visita a continuación; cuenta/comunicaciones/ayuda accesibles mediante filas con acción inequívoca. Mover la invitación a una zona secundaria. Conservar un resumen compacto de pertenencia y un enlace a Mi Club. La distribución exacta debe validarse con clientes; no hay base para imponer un rediseño total de marca.

**Aceptación:** en móvil, localizar la acción para editar nombre y alergias no requiere pasar la promoción; ninguna fila no editable parece incluida en el formulario; el orden de lectura y la navegación son coherentes en escritorio y móvil. Validar con tareas, no solo con preferencia estética.

### EXP-04 · P2 · El nivel no explica su valor ni la relación con Mesa Fundadora

**Contenido incompleto confirmado; política comercial pendiente de reconciliar.**

Perfil muestra nivel, siguiente nivel y puntos restantes (`Perfil.tsx:109–145`), pero no explica cómo se ganan ni qué obtiene quien sube. La única ayuda «el dinero paga… los puntos indican…» está dentro del historial (`CuentaCliente.tsx:85`). No hay enlace del bloque a Mi Club ni a reglas del programa.

`SPEC.md:141–156` atribuye beneficios a Barista y Reserva Lupita y explica fuentes de puntos. Club presenta beneficios en un bloque condicionado a membresía pagada (`src/casa/pantallas/Club.tsx:306`), y declara los beneficios manuales de la membresía en `Club.tsx:38–42`. La evidencia muestra ambigüedad entre la especificación y la experiencia visible; no permite asegurar cómo se concede un descuento manual real. No se deben prometer beneficios antiguos simplemente porque aparecen en SPEC.

**Propuesta:** aprobar una tabla única de pertenencia gratuita, nivel por trayectoria y suscripción pagada; publicarla resumida en «Cómo funciona tu nivel» y enlazar desde Perfil. Explicar únicamente reglas implementadas y beneficios operativamente garantizados. Si los puntos miden solo trayectoria, decirlo expresamente.

**Aceptación:** cliente sin membresía y cliente fundador pueden explicar por separado su nivel y su suscripción, cómo progresar y qué cambia al progresar. Los datos y reglas visibles provienen de una configuración consistente con backend y operación. No activar referidos remunerados porque la especificación mencione +250: el enlace actual no atribuye referidos.

### EXP-05 · P2 · La ayuda existe, pero está escondida bajo compras y formulada solo para compras

**Problema de descubrimiento confirmado en arquitectura; impacto por validar.**

Perfil solo enlaza «Mis compras y reservas» (`Perfil.tsx:242`); allí se monta `AtencionCliente` después del historial (`src/casa/pantallas/MisCompras.tsx:39`). Su formulario pregunta por cambios en reservas o revisión de compras (`src/casa/componentes/Atencion.tsx:15–16`). No hay entrada identificable a ayuda de cuenta, teléfono, promociones o corrección de puntos, aunque Perfil remite a la barra en varios lugares.

**Propuesta:** acceso «Ayuda con mi cuenta» en Perfil, reutilizando el sistema de solicitudes existente con una categoría/contexto claro. Enlace a política de privacidad y gestión de datos cuando esos procesos estén definidos. No añadir botones ficticios de eliminación o exportación sin un proceso verificable.

**Aceptación:** quien necesita corregir un contacto o reclamar actividad localiza ayuda sin adivinar que está dentro de compras; la solicitud recibe confirmación, lugar de respuesta y expectativa operativa concreta. La categoría y responsable de atención quedan registrados.

### EXP-06 · P2 · «Tu cuenta de casa» presenta movimientos sin saldo ni puente claro al monedero

**Inconsistencia de información confirmada; no error contable.**

Perfil usa ese encabezado para ocho movimientos monetarios y dos botones (`Perfil.tsx:209–243`), pero no muestra `yo.saldo`. Inicio usa el mismo nombre para saldo disponible, separación pagado/bono y recarga (`src/casa/pantallas/Inicio.tsx:138–145`). La fila «Cómo recargás» de Perfil tampoco abre la explicación existente en Inicio.

En el historial global se mezclan dinero, puntos, sellos y canjes correctamente diferenciados por tipo, pero todos se presentan como movimientos de cuenta. Falta explicar que el resumen de Perfil solo incluye dinero y que «toda mi actividad» amplía el universo, no solo las ocho filas.

**Propuesta:** titular el bloque «Últimos movimientos de dinero» o añadir saldo disponible y acceso al monedero. Separar «Actividad del Club» de «Compras y reservas» con subtítulos que indiquen qué consulta responde cada uno. Mantener un único origen contable.

**Aceptación:** un usuario puede responder desde Perfil cuánto puede gastar o llegar directamente al saldo, identificar si una cifra es dinero o puntos, y acceder al comprobante/soporte de un movimiento dudoso. El saldo es idéntico al de Inicio tras la misma actualización.

### EXP-07 · P2 · Cumpleaños pide una fecha completa sin explicar para qué se usará

**Oportunidad de minimización y claridad; no diagnóstico legal.**

El formulario pide `type="date"` con `autoComplete="bday"` (`CuentaCliente.tsx:38–44`), el servidor guarda fecha completa (`src/worker/cuenta-cliente.ts:27–37`), pero Perfil muestra solo día y mes (`Perfil.tsx:26–31`). No aparece explicación del uso ni beneficio verificado. La mención histórica de regalo en `SPEC.md:208` no prueba que haya un flujo actual de cumpleaños.

**Propuesta:** decidir si la casa necesita año. Si el único uso es felicitar u ofrecer un beneficio anual, preferir día y mes y explicar el uso real; si necesita fecha completa, documentar la razón. Mantener opcional, permitir borrar y mostrar claramente que quedó sin dato. No prometer un regalo sin operación respaldada. Evaluar entrada directa de fechas memorables en móvil, sin imponer un calendario de décadas.

**Aceptación:** existe un propósito documentado y visible; no se pide año sin necesidad; se puede omitir/borrar; ingreso con teclado y móvil es sencillo; el servidor rechaza fechas imposibles y conserva correctamente 29 de febrero según la decisión del producto.

**Investigación:** GOV.UK aconseja conocer necesidad, uso y mantenimiento antes de añadir una pregunta. Su patrón distingue fechas memorables de selección en calendario. La reducción a día/mes es inferencia para el caso Lupita, no una exigencia textual de esas fuentes. [Estructurar formularios](https://www.gov.uk/service-manual/design/form-structure), [Patrón de fechas](https://design-system.service.gov.uk/patterns/dates/).

### EXP-08 · P2 · «Ninguna anotada» no distingue falta de respuesta de ausencia declarada

**Ambigüedad semántica confirmada.**

`Perfil.tsx:182` muestra «Ninguna anotada» para `null`, y el formulario convierte vacío a ausencia de valor (`CuentaCliente.tsx:19`, servidor `cuenta-cliente.ts:37`). El directorio usa «Sin indicar» (`Clientes.tsx:74`). No existe un estado separado para quien explícitamente afirma no tener alergias.

**Propuesta:** a corto plazo unificar vacío como «No has indicado alergias» (adaptar a voseo: «No indicaste alergias») y mostrar también en lectura la instrucción de confirmarlas al pedir. Solo añadir «No tengo alergias conocidas» como decisión explícita si operación necesita distinguir esos estados; no inferirla de un campo vacío.

**Aceptación:** campo nunca informado, dato borrado y declaración explícita se muestran sin convertir desconocimiento en seguridad alimentaria. Confirmar con operación que las etiquetas permiten tomar la acción correcta.

### EXP-09 · P3 · Microcopy y consistencia reducen precisión sin necesidad

**Defectos editoriales confirmados; impacto menor.**

- Texto de fallback de nivel une dos frases sin punto (`Perfil.tsx:142`); error de copia también (`165`); explicación del historial une tres (`CuentaCliente.tsx:85`).
- Actividad imprime cantidades de sellos como «2 sello» y canjes como «2 uso» (`CuentaCliente.tsx:93`).
- Resumen monetario usa fecha local del navegador (`Perfil.tsx:225`), mientras historial usa Managua (`CuentaCliente.tsx:92`). Prueba local del agente principal en Europe/Madrid: el mismo `2026-10-09T02:00:00Z` aparece como 9 de octubre en resumen y 8 de octubre a las 20:00 en actividad; evidencia `evidencia/ui/actividad-zona-madrid.png` y `resultados.json`. Es inconsistencia visible reproducida, no solamente posibilidad.
- «Mesa Fundadora … de 100» está fijado en Perfil (`102`), aunque Club usa `catalogo.membresia.total` (`Club.tsx:93`). Hoy no prueba discrepancia de cupo, pero constituye riesgo si cambia la configuración.

**Propuesta:** puntuación natural, pluralización, vocabulario fijo para saldo/puntos/sellos, una política de zona horaria en toda actividad y total de membresía desde la fuente común.

**Aceptación:** lectura de los mensajes como frases completas; singular/plural correctos; misma operación tiene misma fecha en resumen/detalle para cualquier zona del navegador; el total de plazas no diverge de catálogo.

### EXP-10 · P3 · Compartir es correcto como enlace genérico, pero no es un programa de referidos

**Límite funcional confirmado; no botón roto.**

`Perfil.tsx:70–78` copia la raíz del sitio y maneja fallo de portapapeles (`165`), consistente con el botón «Copiar enlace del Club». La bienvenida pública explica sellos, cuenta y carta (`src/casa/pantallas/Umbral.tsx:43–48`). No hay atribución del socio ni premio por referido; no se encontró promesa de puntos en la UI de esta tarjeta. No marcar esto como bug ni cambiarlo automáticamente a `/club`, ruta protegida.

**Propuesta:** mantener el carácter genérico, reducir protagonismo dentro de Perfil y, si negocio quiere medir invitaciones, definir primero un programa real y privacidad de atribución. Compartir nativo en móvil con copia como respaldo sería mejora opcional de conveniencia, no requisito.

**Aceptación:** el enlace funciona sin sesión y explica qué recibe quien lo abre; cancelación/error de compartir conserva una salida; no se promete premio inexistente ni se incorpora un identificador personal en la URL por defecto.

## Qué conviene conservar

- Voseo, lenguaje de hospitalidad y marca reconocible; los problemas editoriales no justifican volverlo lenguaje bancario.
- Edición de cuatro campos breve y opcionales identificados; límites también presentes en servidor; aviso de confirmar alergias con quien atiende.
- Confirmación de guardado y errores visibles. Revalidar la rama de guardado con refresco fallido en la línea de robustez.
- Estado de ausencia de cuenta con reintento, en lugar de pantalla vacía (`Perfil.tsx:50–60`).
- Historial real con filtros, paginación, reintento y deduplicación; no decir que solo existen ocho movimientos porque el resumen los limite.
- No inventar métodos de pago almacenados. La recarga física es una decisión legítima; necesita buena orientación, no una pasarela obligatoria.
- No añadir fotografía, gamificación o porcentaje de perfil completo sin necesidad demostrada. Pedir más datos no garantiza mejor servicio.

## Arquitectura propuesta para probar

1. **Identidad y cuenta:** nombre, correo de acceso, teléfono de contacto, editar/solicitar cambio.
2. **Para tu próxima visita:** bebida y alergias declaradas; cumpleaños solo con propósito; explicación breve de cómo llega a la casa.
3. **Comunicaciones:** preferencias reales por canal y separación de mensajes de acceso.
4. **Tu Club:** resumen de nivel y membresía, enlace a reglas/beneficios de Mi Club.
5. **Actividad y ayuda:** saldo o acceso al monedero, actividad, compras/reservas, ayuda de cuenta.
6. **Invitar y salir:** acciones secundarias diferenciadas.

No es una prescripción de seis tarjetas grandes. Es un orden de responsabilidades; puede resolverse con filas compactas y dos niveles de navegación. La personalización debe servir a una necesidad concreta y no compensar una estructura confusa. [Customization vs. Personalization, NN/g](https://www.nngroup.com/articles/customization-personalization/).

## Validación con personas y operación

Hacer una ronda corta con clientes frecuentes y nuevos, fundadores y no fundadores, y personal de caja/cocina. Tareas: corregir bebida, declarar/borrar una alergia, localizar el correo de acceso, dejar de recibir promociones, explicar diferencia entre puntos y dinero, revisar un movimiento y pedir ayuda. Registrar éxito sin ayuda, primer lugar donde buscan, errores y tiempo hasta encontrar la acción. Estas son métricas propuestas; no hay resultados medidos aún.

Para alergias usar datos ficticios y verificar una entrega simulada completa. Para controles de comunicaciones, verificar persistencia y efecto en selección de destinatarios sin mandar campañas. Priorizar que la información se usa correctamente sobre «porcentaje de perfiles completos»; no recopilar el contenido de alergias o fechas de nacimiento en analítica de producto.

## Fuentes y límites

Se realizaron cinco búsquedas web y se abrieron fuentes primarias: documentación oficial de Square y GOV.UK, política de Meta y análisis original de NN/g. Estas fuentes fundamentan criterios, no demuestran causalidad en La Bella Lupita. No se evaluó legislación nicaragüense ni se afirma cumplimiento/incumplimiento legal. No se verificaron cambios de cuenta, pedidos ni comunicaciones con datos reales. Los detalles de teclado, contraste, guardado, errores HTTP y seguridad quedan en las líneas paralelas de accesibilidad/robustez y backend.
