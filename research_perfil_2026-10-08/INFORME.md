# Auditoría integral de Perfil de La Bella Lupita

8 de octubre de 2026 · America/Managua · Diagnóstico y propuesta de mejoras

**Perfil tiene una base funcional y visual sólida, pero todavía no resuelve por completo la administración de la cuenta ni la continuidad entre lo que el cliente declara y lo que el equipo utiliza.** Las prioridades son proteger los cambios guardados, hacer que el cierre de sesión revoque el acceso y definir cómo llegan las alergias al pedido. Después conviene reorganizar la pantalla alrededor de editar datos, identificar la cuenta, administrar comunicaciones y conseguir ayuda.

La estética de la marca puede conservarse. El mayor retorno vendría de corregir estos comportamientos y dar prioridad a las tareas del cliente. No hay evidencia que justifique una reconstrucción total de la pestaña.

## Alcance y grado de certeza

Se revisaron experiencia, diseño visual, contenido, navegación, formularios, estados, accesibilidad, adaptación móvil, seguridad, privacidad, datos, backend, integración con operación, rendimiento, mantenibilidad y medición. Se siguieron las conexiones con Mi Club, registro, compras, atención, caja y cocina cuando afectaban a Perfil.

La imagen proporcionada señala Perfil en el lateral de escritorio; no muestra el cuerpo de la pantalla. La implementación activa es `index.html → src/casa/main.tsx → App.tsx → src/casa/pantallas/Perfil.tsx`. La otra implementación en `src/pantallas/Perfil.tsx` es heredada y no se usó para atribuir fallos a la pantalla actual.

La página pública `/perfil` exige acceso. Sus dos activos principales se descargaron mediante lecturas públicas y coinciden por SHA-256 con la compilación auditada:

| Activo público | Tamaño sin compresión | Coincidencia |
|---|---:|---|
| `principal-Cfxl5pt5.js` | 415.080 bytes | Exacta |
| `principal-C3oGQIwt.css` | 73.931 bytes | Exacta |

También coinciden 18 archivos relevantes con la copia local conservada de la publicación de acceso del equipo. Esto fundamenta la correspondencia de interfaz y fuentes; no sustituye probar sesiones y datos reales en producción. [Evidencia de versión](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/version-verificada.json>).

Los recorridos autenticados, escrituras, errores inducidos y operaciones de pedidos se ejecutaron con cuentas sintéticas y base PGlite en memoria. No se modificó el producto, no se desplegaron cambios y no se escribieron datos de clientes reales. Los incidentes reproducidos son del código auditado, no afirmaciones de incidentes sufridos por clientes.

Se aplican tres prioridades: **P1**, corregir antes de ampliar el uso del flujo afectado; **P2**, siguiente mejora funcional; **P3**, calidad y mantenimiento. La prioridad representa juicio de producto y riesgo, no una puntuación CVSS.

## Lo que funciona y debe conservarse

- El perfil guarda realmente nombre, bebida, alergias y cumpleaños. El servidor limita campos y tamaño, valida fecha y longitudes, identifica al cliente desde su sesión y usa SQL parametrizado.
- La actualización y su registro de auditoría son atómicos; el registro no copia los valores personales de los campos.
- La actividad tiene filtros, paginación por cursor con desempate, deduplicación, reintento y estados vacíos. El resumen de ocho movimientos no es el límite del historial.
- El diálogo nativo tiene nombre, cierre, Escape y contención de foco; la navegación de ruta mueve el foco al contenido. Hay etiquetas, autocompletado, contraste de texto adecuado en los estados comprobados y soporte de movimiento reducido.
- El transporte distingue error de lectura de resultado incierto de escritura; una respuesta antigua no restaura datos de otra cuenta. Cliente y Personal tienen aislamiento explícito.
- Las respuestas públicas comprobadas incluyen `no-store`, CSP y HSTS. `/api/yo` y `/api/actividad` responden 401 sin sesión.
- La voz de marca, tipografía, colores y lenguaje cercano están presentes. Copiar el enlace funciona como invitación genérica y ofrece una salida cuando falla el portapapeles.

No se detectó en esta revisión acceso entre cuentas distintas, inyección SQL ni XSS explotable en Perfil. Eso no equivale a una certificación general de seguridad.

## Prioridades del diagnóstico

| ID | Prioridad | Hallazgo | Evidencia y efecto |
|---|---|---|---|
| F01 | P1 | Un borrador antiguo sobrescribe cambios ya guardados | Reproducido al cerrar/reabrir durante guardado y con dos borradores independientes |
| F02 | P1 | Cerrar sesión no revoca la credencial en servidor | El acceso local desaparece, pero una copia del token conserva respuesta 200 |
| F03 | P1 | Las alergias no llegan a preparación | Persisten en perfil/directorio; faltan en los dos payloads de pedidos de cocina |
| F04 | P2 | Un nombre válido rompe el ancho móvil | 80 letras continuas producen documento de 2.632 px en pantalla de 320 px |
| F05 | P2 | Guardar depende de recursos ajenos y puede dejar vista antigua | Catálogo detenido bloquea confirmación; `/yo` fallido conserva nombre anterior |
| F06 | P2 | Cerrar el editor pierde el borrador sin aviso | Escape y reapertura devuelven valores anteriores |
| F07 | P2 | Editar está demasiado abajo en móvil | Botón a y=1.315 px en viewport 390 × 844, después de nivel y promoción |
| F08 | P2 | No se identifica ni administra el acceso de la cuenta | Perfil omite correo de ingreso y teléfono, sin flujo específico de cambio |
| F09 | P2 | Comunicaciones no reflejan las preferencias reales | Se muestra WhatsApp informativo; el alta guarda consentimiento de correo |
| F10 | P2 | Faltan propósito y vías claras para gestionar datos personales | Cumpleaños completo y alergias sin explicación contextual suficiente; sin acceso a solicitud de datos/baja |
| F11 | P2 | Perfil mezcla nivel, membresía, saldo y actividad | No explica cómo progresar ni qué cambia; «Cuenta de Casa» no muestra saldo |
| F12 | P2 | La ayuda de cuenta es difícil de encontrar | Atención está dentro de compras y redactada para compras/reservas |
| F13 | P3 | Una operación cambia de fecha entre resumen y detalle | Madrid: resumen 9 oct, historial Managua 8 oct, para el mismo movimiento |
| F14 | P3 | Feedback accesible y errores pueden ser más precisos | Base correcta; falta verificar anuncios reales y asociar errores al campo |
| F15 | P3 | El contrato de `/yo` valida solo parte de lo consumido | Riesgo ante datos corruptos, inferido de código; no observado con respuestas normales |
| F16 | P3 | Perfil hereda una lectura amplia y costosa | 11 consultas secuenciales en `/yo` sin membresía activa; latencia pública no medida |
| F17 | P3 | La auditoría no distingue cambios reales de reenvíos | Cada POST registra los cuatro campos incluso sin cambios |
| F18 | P3 | Persisten incoherencias de copy, validación y mantenimiento | Puntuación, nombres de navegación, Unicode y comentarios históricos |

Son **18 asuntos consolidados: 3 P1, 9 P2 y 6 P3**. Algunos son defectos reproducidos; otros, carencias de producto o riesgos condicionados, como se explica a continuación. No deben tratarse todos como vulnerabilidades.

## Integridad de edición y sesión

### F01 Evitar que un guardado posterior borre cambios ajenos al formulario

El formulario inicializa cuatro campos al montarse y los envía completos. Puede cerrarse mientras el POST continúa. Si se reabre antes de terminar, nace otro editor con los datos antiguos; cuando llegan los nuevos, su borrador no se reconcilia. La protección que evita actualizar un componente desmontado no protege el contenido del nuevo borrador.

**Reproducción:** guardar «Nombre nuevo confirmado» con respuesta demorada; cerrar; reabrir; dejar terminar; cambiar solo bebida a «Chocolate»; guardar. El nombre vuelve silenciosamente a «Cliente de auditoría». Dos borradores en sesiones distintas producen la misma pérdida en el backend: ambos POST devuelven 200. La prueba usó nombre; el mecanismo también afecta alergias y cumpleaños.

**Corrección propuesta:** estado estable de la operación, borrador asociado a socio y versión, respuesta canónica de guardado y control de concurrencia en servidor. Un editor desactualizado debe recibir conflicto y permitir reconciliar. Enviar solo campos modificados ayuda entre campos distintos, pero no protege por sí solo cambios simultáneos del mismo campo.

**Aceptación:** cerrar/reabrir durante cualquier fase del POST no permite reenviar datos antiguos sin advertencia; dos pestañas no pierden cambios; corregir bebida nunca revierte una alergia confirmada; los conflictos no se registran como guardados exitosos.

Evidencia: [CuentaCliente.tsx](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/CuentaCliente.tsx:19>), [actualización del servidor](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/cuenta-cliente.ts:35>), caso `03-guardado-y-reapertura` en [resultados UI](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/ui/resultados.json>) y `dos_borradores_misma_version` en [resultados backend](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/reproduce_backend.json>).

### F02 Hacer efectivo el cierre de sesión

Salir elimina el token local y sincroniza el cierre entre pestañas; esa parte funciona. El servidor sigue aceptando una copia porque no hay revocación individual. Los accesos cliente se emiten por 30 días y viven en `localStorage`, accesible al JavaScript del origen. **El impacto requiere que alguien conserve u obtenga esa credencial; no se demostró robo ni una XSS.**

**Corrección propuesta:** sesión revocable, cierre actual y opción de cerrar todas las sesiones, política explícita de duración y recuperación. Evaluar cookie `HttpOnly`/`Secure` con protección CSRF y política SameSite apropiada, manteniendo independencia de Personal. No basta con mover el token a otro almacenamiento sin añadir revocación.

**Aceptación:** la credencial usada para cerrar recibe 401 después de confirmarse el cierre; las otras sesiones solo se revocan cuando corresponde; sin red se sale localmente y se informa si falta confirmar revocación remota. Estos criterios siguen la orientación de [OWASP sobre sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) y [almacenamiento accesible a JavaScript](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html).

Evidencia: [sesion-cliente.ts](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/sesion-cliente.ts:18>), [duración de acceso](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/acceso-correo.ts:73>), casos de cierre en los resultados UI/backend.

### F05 y F06 Separar guardar, actualizar la vista y cerrar un borrador

Después de un POST correcto, el formulario espera `refrescar()`, que consulta cuenta, catálogo y cupos. Confirmé que una respuesta de catálogo retenida mantiene «Guardando…» aunque el perfil ya esté guardado y leído. Además, si falla `/yo`, se muestra «Tu perfil quedó guardado» con el nombre anterior todavía visible. El mensaje de éxito es verdadero respecto al POST; la interfaz resulta contradictoria respecto al resumen. **Sí hay alerta global que explica la antigüedad y permite reintentar.**

Por separado, Escape descarta cambios no enviados sin aviso. Durante un guardado, cerrar tampoco significa cancelar la operación recibida por el servidor.

**Corrección propuesta:** guardar y devolver el perfil normalizado con versión; actualizar solo la cuenta; distinguir «Guardado» de «No pudimos actualizar el resumen»; conservar borrador o pedir decisión únicamente cuando hay cambios. Mantener Escape y una salida accesible. Una lectura anterior al POST no debe servir como verificación posterior: esa variante es riesgo de código pendiente de reproducción específica.

**Aceptación:** catálogo/cupos no bloquean Perfil; un fallo de refresco conserva una explicación junto a la edición y una recuperación inequívoca; cerrar sin cambios sigue siendo inmediato; cerrar con cambios no pierde trabajo accidentalmente.

Evidencia: [refresco global](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:427>), [aviso de cuenta](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/EstadoDatos.tsx:12>), casos UI `02`, `04` y `05`.

## Servicio y confianza del cliente

### F03 Convertir las alergias en un proceso operativo explícito

Guardar alergias funciona. Se muestran en la ficha del directorio que pueden consultar propietario/encargado. Caja y cocina no tienen esa pestaña, y ninguna de las dos respuestas de pedidos de cocina contiene el dato. La lectura técnica confirmó la ausencia con un pedido sintético y una alergia guardada.

El formulario ya pide avisar a quien atiende; es una mitigación útil que debe conservarse. El problema es que «Mantené tus preferencias al día para tu próxima visita» puede generar una expectativa que el flujo diario no cumple. No se está afirmando que haya ocurrido un incidente alimentario.

**Propuesta:** declaración en perfil → confirmación en el pedido → indicación pertinente visible para caja/preparación → confirmación humana. Conservar una instantánea de lo confirmado para ese pedido, de modo que editar el perfil después no cambie su historial. Mostrar solo lo necesario a las personas que atienden/preparan; no abrir el directorio completo como solución.

También conviene cambiar «Ninguna anotada» por «No indicaste alergias» cuando no hay dato. Un vacío no es una declaración explícita de ausencia de alergias.

**Aceptación:** un pedido de prueba transmite la declaración confirmada antes de su preparación; el equipo entiende qué debe hacer; se distingue dato desconocido de declaración negativa; el cliente sigue confirmándolo en cada pedido. Si negocio decide mantenerlo solo como nota de directorio, la interfaz debe explicar claramente ese alcance.

Evidencia: [aviso existente](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/CuentaCliente.tsx:46>), [preparación](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/equipo/Pedidos.tsx:22>), [campos de cocina](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/pedido-publico.ts:1>), resultados backend `alergias_en_preparacion`. La conexión entre información del perfil y momento del servicio también tiene un ejemplo operativo en [Square](https://squareup.com/help/us/en/article/8271-collect-customer-profile-fields-in-online-booking); no prueba efectos específicos en Lupita.

### F08 F09 F10 y F12 Completar las responsabilidades de una cuenta

El ingreso real es por correo verificado y el alta permite promociones por correo. Perfil no muestra con qué correo se entró ni el teléfono de contacto. Tampoco presenta el consentimiento promocional real: la fila visible habla de WhatsApp y remite a la barra, sin estado ni acción. No se encontró aquí un flujo de autoservicio para revisar datos, solicitar exportación/baja o resolver pérdida/cambio de contacto.

El cumpleaños solicita año, mes y día, pero la pantalla solo usa día y mes; no explica el propósito ni un beneficio actualmente garantizado. Las alergias tampoco explican quién puede verlas. Existe atención en la app, pero se descubre entrando a compras y usa copy de compras/reservas.

**Propuesta concreta:**

1. Mostrar correo de ingreso, estado verificado y teléfono de contacto; ofrecer cambio o solicitud con verificación. Nunca aceptar un nuevo teléfono como identidad sin comprobarlo ni trasladarle saldos automáticamente.
2. Mostrar preferencias reales por canal, separando publicidad de códigos de acceso y comunicaciones necesarias. Persistir la retirada del consentimiento y aplicarla donde se eligen destinatarios. No activar envíos como parte de esta mejora de pantalla.
3. Explicar uso y visibilidad de los datos opcionales. Decidir si hace falta el año de nacimiento; si no, reducir la captura. Conservar posibilidad de borrar esos datos.
4. Ofrecer «Ayuda con mi cuenta» y una vía real para consultas sobre datos, exportación o baja, con responsable, confirmación y seguimiento. No añadir botones que prometan operaciones inexistentes.

**Aceptación:** el cliente identifica su cuenta, distingue acceso de publicidad, revisa/revoca su preferencia real, entiende el uso de datos opcionales y localiza ayuda sin adivinar que está dentro de compras.

Son recomendaciones de producto y privacidad; no constituyen dictamen de cumplimiento legal nicaragüense. La transparencia se apoya en [OWASP User Privacy Protection](https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html). GOV.UK recomienda justificar necesidad y uso de cada pregunta y distinguir [fechas memorables](https://design-system.service.gov.uk/patterns/dates/) de elección de una fecha de calendario. La política de [WhatsApp Business](https://whatsappbusiness.com/policy/) refuerza la necesidad de permiso y respeto a bajas si se opera ese canal; no se inspeccionaron campañas externas.

Evidencia: [alta por correo](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/acceso-correo.ts:84>), [contrato de cuenta](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/index.ts:443>), [campos editables](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/componentes/CuentaCliente.tsx:37>), [fila WhatsApp](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/Perfil.tsx:196>), [atención en compras](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/pantallas/MisCompras.tsx:39>).

## Diseño, navegación y comprensión

### F04 y F07 Dar prioridad a editar y admitir datos reales

En escritorio las dos columnas aprovechan bien el espacio y agrupan preferencias a la izquierda. En móvil el orden es identidad, nivel, invitación, preferencias y finalmente edición. El enlace para invitar ocupa el botón más prominente de la primera pantalla, mientras editar queda más abajo.

En el fixture de 390 × 844, «Editar mi perfil» empieza a **1.315 px** desde el inicio; «Cerrar sesión», a **1.827 px**. No son tiempos ni tasas de abandono medidos, pero sí una distancia objetiva a la tarea principal. A 320 px, con nombre normal no hay desbordamiento; con 80 letras continuas admitidas por la validación, el documento llega a **2.632 px** de ancho.

**Propuesta:** identidad compacta con edición inmediata, preferencias debajo y promoción secundaria. Limitar ancho de contenedores y permitir ruptura de cadenas largas preservando el nombre completo; ocultar el desbordamiento no sería una solución suficiente. Revisar también navegación lateral y detalles de preferencias al máximo permitido.

**Aceptación:** editar nombre/alergias es visible antes de la promoción; el orden visual y de lectura es coherente; a 320 y 390 px los datos válidos no requieren desplazamiento horizontal. El caso de nombre largo compromete el criterio de [reflujo de W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), aunque Axe no lo marque.

![Perfil actual en escritorio con datos sintéticos](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/ui/perfil-1440.png>)

[Ver captura móvil completa](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/ui/perfil-390.png>) · [Ver reproducción del desbordamiento](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/ui/perfil-nombre-largo-320.png>).

### F11 Aclarar qué significa cada parte del Club

El nivel aparece con puntos restantes, pero no explica cómo se ganan ni qué obtiene el cliente al subir. Mesa Fundadora es una membresía pagada y no debe confundirse con el nivel. Antes de publicar reglas o beneficios, hay que reconciliar especificaciones históricas, backend y operación real.

«Tu cuenta de casa» contiene ocho movimientos de dinero, pero no el saldo; Inicio usa el mismo nombre para mostrar saldo disponible y recarga. «Ver toda mi actividad» añade puntos, sellos y canjes. La implementación distingue los tipos, pero el cambio de alcance no se explica suficientemente.

**Propuesta:** resumen breve con enlace «Ver mi Club» y «Cómo funciona mi nivel»; definir una única tabla de reglas aprobadas. En dinero, mostrar saldo real o titular «Últimos movimientos de dinero» con acceso claro al monedero. No inventar recompensas ni beneficios a partir de la especificación antigua.

**Aceptación:** una persona distingue saldo, puntos, sellos y membresía; sabe qué puede gastar, cómo progresar y qué beneficio real recibe. El saldo coincide con Inicio para la misma consulta. El enlace de invitación continúa siendo genérico, sin prometer un referido remunerado inexistente.

### Organización propuesta para validar

| Orden | Contenido | Acción principal |
|---:|---|---|
| 1 | Identidad y cuenta: nombre, correo verificado, teléfono | Editar mis datos / gestionar acceso |
| 2 | Para tu próxima visita: bebida y alergias; cumpleaños con propósito | Editar preferencias |
| 3 | Comunicaciones y privacidad | Revisar preferencias reales y pedir ayuda con datos |
| 4 | Tu Club: nivel y membresía separados | Ver beneficios y reglas |
| 5 | Actividad, compras y ayuda | Consultar saldo/movimientos o pedir atención |
| 6 | Invitación y sesión | Compartir enlace / cerrar sesión |

Este orden representa responsabilidades, no seis tarjetas grandes obligatorias. Puede resolverse con filas compactas. Conviene conservar el estilo de la casa y reducir contenedores donde no aportan jerarquía. Foto, porcentaje de perfil completo y más gamificación no tienen necesidad demostrada.

## Accesibilidad, resiliencia y calidad

**F13 Fechas.** El resumen utiliza la zona del dispositivo; el historial fija Managua. Para `2026-10-09T02:00:00Z`, un navegador en Madrid muestra «9 oct» en resumen y «8 oct 2026, 8:00 p. m.» en detalle. Unificar el formateador y la política de fecha comercial, manteniendo cumpleaños como fecha civil. [Evidencia](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/ui/resultados.json>), caso `10-fechas-dos-zonas`.

**F14 Feedback y errores.** La fecha futura produce un mensaje textual correcto y `role=alert`. La mejora es prevenirla con límite, asociar mensaje al campo y elegir el foco inicial deliberadamente. No tener `aria-invalid` por sí solo no demuestra incumplimiento. El estado «Guardando…» y la terminación del historial merecen una región viva estable y prueba con lector real. Los principios están descritos por [W3C sobre identificación de errores](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) y [patrón de diálogo](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**F15 Contratos incompletos.** `/yo` valida menos campos de los que Perfil consume. Una fecha de creación inválida o tipo inesperado de cumpleaños podría provocar error de render. Es una hipótesis sustentada por código, no un error producido por respuestas normales en esta auditoría. Validar el contrato completo, conservar última lectura válida y mostrar error recuperable. [Validación de datos](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/casa/datos.tsx:149>).

**F16 Rendimiento y disponibilidad.** El driver instrumentado contó 11 consultas secuenciales para `/yo` sin membresía activa. El guardado agrega refresco de cuenta/catálogo/cupos. El paquete principal completo pesa aproximadamente 129,27 kB gzip según la compilación; no es peso exclusivo de Perfil ni medición de Core Web Vitals. Priorizar respuesta canónica de guardado, lectura por necesidades y reducción de consultas, verificando dependencias de saldo/membresía antes de paralelizar. No se midieron latencia de producción, P95 ni rendimiento en red móvil. Cloudflare admite [drivers HTTP de proveedores](https://developers.cloudflare.com/workers/databases/connecting-to-databases/); no corresponde recomendar una migración de base solo por usar Neon HTTP.

**F17 Observabilidad.** Cada POST registra los cuatro nombres de campo aun cuando solo cambia uno o ninguno. Registrar diferencias reales, versión y correlación, manteniendo actualización/auditoría atómicas. Medir guardado, conflicto, fallo de lectura, recuperación y tiempo de confirmación sin contenido de alergias, cumpleaños, correo o tokens. Guardar sin cambios no debería parecer una edición sustantiva. [Auditoría actual](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/cuenta-cliente.ts:34>).

**F18 Copy y mantenimiento.** Corregir frases unidas sin puntuación, mantener vocabulario consistente entre «Carta/Pedir» y «Mi Club/Club», y acordar límites Unicode. La API acepta controles bidi/C1 y un sustituto aislado, mientras rechaza 41 caracteres fuera del BMP por contar unidades UTF-16. Es calidad y representación de datos, no XSS demostrada. Unificar validación sin excluir nombres culturales legítimos. Retirar comentarios que aún dicen que edición o puntos no existen, tomar el total de plazas desde la configuración y revisar la fecha de compatibilidad del Worker con regresión. [Validador común](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/club-lupita/src/worker/validacion.ts:13>), [guía de compatibilidad de Cloudflare](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).

## Verificación realizada

| Prueba | Resultado | Alcance |
|---|---|---|
| Compilación aislada de Vite y TypeScript | Correcta | Fuentes actuales; salida fuera de `dist` de publicación |
| Suite de cuenta cliente | Correcta | Persistencia, límites, permisos, auditoría y paginación de 45 movimientos con fechas empatadas |
| Suite de transporte | 18 casos aprobados | Expiración, aislamiento de cuentas, respuestas antiguas, errores, JSON inválido, timeout e incertidumbre |
| Accesibilidad seleccionada | 12 comprobaciones aprobadas | 4 recorridos en Edge, 4 Firefox, 4 WebKit |
| Auditoría UI específica | 11 escenarios ejecutados | Incluye reproducción deliberada de fallos; «comprobado» no significa comportamiento correcto |
| Axe | Sin violaciones en 23 estados capturados y evaluados | 11 UI + 12 de accesibilidad; no detectó el desbordamiento de nombre |
| Backend específico | Evidencia guardada | Sesiones, 15 combinaciones de lectura/escritura, concurrencia, alergias, consultas y Unicode |
| Versión pública y cabeceras | Coincidencias verificadas | JS/CSS exactos; health 200; cuenta y actividad sin sesión 401 |

Los recorridos de accesibilidad comprobaron foco de navegación, Tab/Shift+Tab, Escape, retorno al disparador, reflujo equivalente al 200 % y comportamiento con tamaño de fuente raíz duplicado de 16 a 32 px. La interfaz también usa tamaños en píxeles: no se verificó ampliación efectiva de todo el texto ni zoom nativo. La emulación no equivale a un dispositivo físico. WebKit de prueba no equivale a certificar Safari en iPhone.

No se probó con NVDA/VoiceOver real, teclado virtual físico, usuarios reales, condiciones de producción, carga concurrente de PostgreSQL remoto, campañas externas ni políticas legales/empresariales de retención. Estos límites impiden certificar conformidad total o estimar tasas de abandono. **Cero errores de Axe no equivale a cero problemas de accesibilidad.**

La sospecha de que la cookie de Personal eclipsara al cliente se descartó: `x-equipo-solicitud` separa los flujos. También se descartaron diagnósticos antiguos de modal sin foco, errores sin salida e historial limitado a ocho registros.

## Plan de mejoras y criterios de salida

| Etapa | Trabajo | Dependencias y criterio de salida |
|---|---|---|
| 1 · Integridad y protección | F01, F02; corregir F04 y desacoplar guardado de F05 | Versionado/contrato de perfil y sesiones. Reproducciones actuales convertidas en regresión: sin sobrescritura, token revocado, sin desbordamiento y sin espera de catálogo |
| 2 · Servicio en la casa | F03 | Acuerdo con caja/cocina sobre confirmación, visibilidad mínima e instantánea del pedido. Ensayo de punta a punta con datos ficticios |
| 3 · Perfil útil y comprensible | F06–F12 | Definir identidad, canales reales, reglas del Club y procedimiento de ayuda/datos. Validar arquitectura móvil antes de ampliar campos |
| 4 · Calidad medible | F13–F18 | Zona horaria común, lectores reales, contratos robustos, instrumentación y optimización basada en latencia medida |

F01 y F05 deben resolverse juntos para no añadir controles de concurrencia a un editor que sigue mostrando versiones antiguas. F02 requiere migración compatible de sesiones; no debe romper el acceso ya existente. F03 necesita una decisión operativa además de implementación. Las etapas expresan orden y dependencias; no son una promesa de calendario sin estimación del equipo.

Para validar con personas, propongo una ronda de 5–8 clientes variados y 2–3 integrantes de caja/cocina. Tareas: editar bebida, declarar/borrar alergia, identificar correo, dejar de recibir promociones, distinguir dinero/puntos, revisar una operación y pedir ayuda. Registrar éxito sin asistencia, primer lugar de búsqueda y errores; los tiempos se medirían como línea base, no se inventan aquí. El ensayo de alergias utiliza información ficticia.

Como condiciones de aceptación de producto: editar debe localizarse antes de la promoción, los datos de acceso y consentimiento deben concordar con backend, un fallo recuperable debe tener salida visible, y ningún cambio silencioso debe perder información confirmada. Las métricas de producto deben registrar el resultado y nunca el contenido sensible.

## Evidencia y reproducción

- [Investigación de experiencia y contenido](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/findings_experiencia.md>).
- [Investigación de accesibilidad y frontend](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/findings_accesibilidad.md>).
- [Investigación de backend, seguridad y privacidad](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/findings_backend.md>).
- [Resultados de los 11 escenarios UI](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/ui/resultados.json>) y [script](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/audit-ui.mjs>).
- [Resultados backend](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/reproduce_backend.json>) y [script](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/reproduce_backend.mjs>).
- [Edge](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/accesibilidad/resultados.json>), [Firefox](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/accesibilidad-firefox/resultados.json>), [WebKit](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/accesibilidad-webkit/resultados.json>), [transporte](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/transporte/resultados.json>).
- [Identidad de versión y activos públicos](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/evidencia/version-verificada.json>) y [script](<C:/Users/artur/Desktop/Proyectos/La Bella Lupita  - APP/research_perfil_2026-10-08/verificar-version.mjs>).

Para ejecutar `audit-ui.mjs`, usar como directorio de trabajo `club-lupita`; requiere su instalación existente de dependencias y el build aislado conservado en esta carpeta. El backend usa exclusivamente su fixture local. Los scripts de auditoría no son una corrección ni un despliegue del producto.
