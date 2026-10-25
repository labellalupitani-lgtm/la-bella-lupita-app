# Auditoría de Perfil: backend, seguridad, privacidad y datos

Fecha de trabajo: 8 de octubre de 2026, America/Managua. Alcance: código actual de `club-lupita`, sin cambios en la aplicación, sin secretos ni datos reales y sin llamadas a producción. Las reproducciones usan el Worker real empaquetado contra PostgreSQL en memoria (PGlite), datos sintéticos y autenticación de Personal emitida por sus APIs. Esto demuestra el comportamiento del código local; no acredita la versión desplegada ni latencias de producción.

Evidencia ejecutable: [reproduce_backend.mjs](./reproduce_backend.mjs). Resultados: [reproduce_backend.json](./reproduce_backend.json). Ejecución desde la raíz del proyecto: `node research_perfil_2026-10-08/reproduce_backend.mjs`. Los artefactos no contienen tokens, cookies, correos, claves ni datos reales.

Prioridades: P1 antes de ampliar uso real del flujo afectado; P2 siguiente mejora funcional; P3 mantenimiento. «Confirmado» significa código y, cuando se indica, reproducción. «Riesgo» expresa impacto plausible, no incidente o explotación observados.

## Hallazgos priorizados

### B01 · P1 · Cerrar sesión no invalida la credencial en el servidor

**Defecto confirmado; impacto de seguridad condicionado a que alguien conserve una copia de la credencial.** Perfil llama a `cerrarSesion()`; el proveedor ejecuta exclusivamente `sesion.borrar()`, que elimina almacenamiento local. No hay endpoint de cierre cliente. La verificación HMAC solo comprueba estructura, firma y expiración, y el middleware consulta que el socio esté activo. Los tokens de acceso se emiten por 30 días, sin identificador de sesión, revocación individual, versión de credencial ni caducidad por inactividad.

Evidencia:

- `club-lupita/src/casa/pantallas/Perfil.tsx:81`–85: botón de salida.
- `club-lupita/src/casa/datos.tsx:431`: solo `sesion.borrar()`.
- `club-lupita/src/casa/sesion-cliente.ts:18`–22: borrado local.
- `club-lupita/src/worker/sesion.ts:51` y 59–70: payload y verificación.
- `club-lupita/src/worker/index.ts:320`–324: usuario activo, sin registro de sesión cliente.
- `club-lupita/src/worker/acceso-correo.ts:73` y 105; `acceso.ts:65`: 30 días.

**Reproducción:** se empaquetó y ejecutó el módulo real de sesión con almacenamiento simulado, se guardó la credencial sintética y se llamó `sesion.borrar()`. `clientSessionCleared=true`, pero reutilizar la misma credencial en `/api/yo` devolvió 200. No demuestra robo de credenciales; demuestra que cerrar sesión no las revoca.

**Mejora:** sesión cliente revocable en servidor, cierre de sesión actual y cierre de todas las sesiones, política explícita de duración y opción consciente de recordar acceso. Si se conservan tokens firmados, añadir `sid`/versión comprobables y revocación. No hace falta reutilizar exactamente la arquitectura de Personal; sí lograr el resultado de seguridad.

**Aceptación:** la misma credencial recibe 401 inmediatamente después del cierre confirmado; cerrar una sesión no interrumpe otras salvo petición expresa; pruebas de cuenta desactivada, token caducado, recuperación y revocación global; salida local funciona aun sin red y explica si no pudo confirmar la revocación remota. OWASP recomienda invalidación de sesión en servidor al cerrar y caducidades controladas por servidor. [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

### B02 · P1 · Las alergias guardadas no llegan al flujo de preparación

**Ausencia de integración confirmada; riesgo operativo, sin incidente demostrado.** El dato persiste en el perfil y la ficha CRM del propietario/encargado. Caja y cocina no acceden a esa ficha; ninguna de las dos respuestas de pedidos incluye alergias y el filtro específico de cocina tampoco. El perfil invita a mantener preferencias para la próxima visita, lo que puede generar expectativa de que la casa las utiliza.

Evidencia:

- `cuenta-cliente.ts:37`: guarda alergias.
- `clientes.ts:6`, 36–47: solo propietario/encargado pueden leer la ficha con alergias.
- `operacion.ts:55`–59: pedidos activos sin alergias.
- `panel.ts:33`–41: listado vigente de pedidos sin alergias.
- `pedido-publico.ts:1`–15: lista de campos de cocina sin alergias.
- `Perfil.tsx:168`–205: sección de preferencias y próxima visita.
- `CuentaCliente.tsx:46`: sí existe aviso de comunicar alergias a quien atiende. Esta mitigación debe reconocerse; no hay promesa explícita de seguridad alimentaria automática.

**Reproducción:** alergia sintética guardada, confirmada en CRM y pedido sintético creado; cocina autenticada obtiene 200 y un pedido en ambos endpoints, pero `kitchenPayloadHasAllergy=false` en ambos.

**Mejora:** decidir y comunicar el alcance. Si se usa en pedidos, pedir confirmación específica al encargar, guardar una instantánea de las indicaciones pertinentes al pedido, mostrar aviso visible a caja/preparación y registrar acuse; limitar el acceso a quienes preparan/atienden ese pedido. Si se mantiene solo como nota CRM, explicarlo donde se captura y muestra. Evitar presentar el dato guardado como garantía sobre ingredientes o preparación.

**Aceptación:** un pedido con indicación confirmada muestra esa indicación a su preparación; ningún cambio posterior del perfil altera silenciosamente el historial de ese pedido; «sin información» se distingue de «sin alergias declaradas»; las personas ajenas al flujo no reciben datos adicionales del perfil. Se requiere validar el proceso real con el equipo, además del código.

### B03 · P2 · Dos borradores pueden borrar cambios ya guardados, incluidas alergias

**Defecto de integridad confirmado.** El cliente captura los cuatro campos al abrir el formulario y siempre los envía completos. El servidor reemplaza los cuatro sin versión, ETag ni comparación contra el estado leído. Basta abrir Perfil en dos pestañas: A guarda un nombre/alergia; B cambia solo la bebida usando su borrador antiguo; B restaura silenciosamente los demás valores.

Evidencia: `CuentaCliente.tsx:19`, 28; `datos.tsx:178`; `cuenta-cliente.ts:15`–17 y 35–44. No existe campo de revisión de perfil en el esquema inspeccionado.

**Reproducción:** dos POST 200 desde el mismo estado inicial. A cambia nombre; B cambia bebida. Resultado: `firstChangePreserved=false`, bebida nueva conservada. El mismo mecanismo aplica a alergias y cumpleaños.

**Mejora:** control de concurrencia con versión de perfil y actualización condicional; responder 409 si el borrador está desactualizado. Permitir reconciliar o recargar conservando las entradas locales. Enviar solo los campos modificados reduce pérdidas entre campos distintos, pero no sustituye la detección de conflictos del mismo campo.

**Aceptación:** dos borradores no pierden cambios sin aviso; versión incrementa atómicamente junto a la auditoría; un conflicto no registra un guardado exitoso; reintento después de respuesta incierta no revierte modificaciones de otra sesión.

### B04 · P2 · La sesión duradera está expuesta al JavaScript del origen

**Riesgo arquitectónico confirmado, sin XSS demostrada.** Se almacena el token en `localStorage` y se reutiliza tras cerrar/reabrir el navegador. Una inyección de scripts o dependencia comprometida tendría acceso a la credencial reutilizable durante su vigencia. El token también contiene el teléfono codificado, no cifrado. Esto agrava B01; no equivale a afirmar una filtración existente.

Evidencia: `sesion-cliente.ts:2`, 8–15; `http.ts:19`–20; `sesion.ts:51`–56. Mitigaciones existentes: CSP con scripts acotados (`cabeceras.ts:6`), HTTPS/HSTS, respuestas sin caché y React al renderizar texto.

**Mejora:** cookie de sesión cliente `HttpOnly`, `Secure`, política SameSite adecuada, revocación y defensas CSRF; o token de acceso efímero en memoria y renovación protegida. Mantener separación explícita de la sesión de Personal.

**Aceptación:** ningún identificador de sesión duradero aparece en Web Storage; un script no puede leer la credencial principal; pruebas negativas de CSRF, origen y ambos roles. OWASP advierte que Web Storage es accesible desde JavaScript y recomienda no guardar identificadores de sesión allí. [HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html).

### B05 · P2 · Perfil no permite entender ni gestionar la identidad y privacidad vigentes

**Brecha de producto confirmada en la superficie auditada; no se declara incumplimiento legal.** El acceso real por correo guarda correo verificado y consentimiento promocional, pero `/api/yo` omite ambos. El editor solo admite nombre, bebida, alergias y cumpleaños. Perfil muestra «Avisos por WhatsApp / Consultá tus preferencias en la barra», aunque las promociones persistidas son de correo. No ofrece consultar/cambiar correo de acceso, revisar/revocar promociones, descargar datos ni solicitar eliminación; no explica junto a alergias/cumpleaños para qué se usan, quién los ve ni cuánto se conservan.

Evidencia: `acceso-correo.ts:82`–106; `db/014_promociones.sql:2`–5; `index.ts:443`; `cuenta-cliente.ts:15`–17; `Perfil.tsx:174`–205; `CuentaCliente.tsx:35`–48. Búsqueda estática en `src/worker`, `src/casa` y `public`: no se encontró flujo de autoservicio para estas acciones. Puede existir atención manual o documentación externa no revisada; debe confirmarse.

**Mejora:** sección «Acceso y privacidad» con correo de acceso y estado verificado, canales reales y preferencias modificables; explicar los usos de datos opcionales y ofrecer borrarlos. Para cumpleaños, justificar guardar año completo cuando Perfil únicamente muestra día/mes; reducir datos si no hay finalidad adicional. Cambiar correo/teléfono exige verificación y tratamiento de sesiones, no añadirlos a la lista editable sin controles. Definir retención y canal de exportación/eliminación con conservación de registros necesarios cuando corresponda.

**Aceptación:** mostrar y revocar el consentimiento real de correo sin recurrir a WhatsApp; documentar responsable/procedimiento para datos; vaciar un dato opcional lo retira de sus vistas operativas; no reenlazar saldos a otra persona por declarar un teléfono. La recomendación de transparencia se apoya en [OWASP User Privacy Protection](https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html); obligaciones jurídicas específicas requieren evaluación separada.

### B06 · P2 · Perfil depende de una lectura de cuenta con 11 consultas secuenciales

**Acoplamiento y número de consultas confirmados; impacto de latencia de producción no medido.** `/api/yo` comprueba socio, mantiene membresía y lee sellos, saldos, membresía, movimientos, tandas, premios, puntos y vale; agrega consulta de topes si hay membresía. Todo se espera en serie. Una falla en un recurso accesorio impide devolver el perfil completo. Guardar el perfil responde solo `{guardado:true}`, y después el cliente espera refresco global que incluye catálogo/cupos.

Evidencia: `index.ts:322`, 439–509, especialmente 446; `cuenta-cliente.ts:44`; `CuentaCliente.tsx:28`–32; `datos.tsx:427`–429.

**Medición local:** instrumentación del driver HTTP registra 11 consultas para `/api/yo` sin membresía activa; con membresía se suma topes. Son consultas emuladas, no medición de red ni costo monetario.

**Mejora:** devolver perfil normalizado y versión al guardar; separar estados de identidad/preferencias de saldos/historial cuando la UI necesite recuperarlos de manera independiente; agrupar consultas compatibles, establecer consistencia de lectura y medir P50/P95 por segmento. Evaluar si el mantenimiento de membresía debe seguir en esa lectura, preservando siempre reglas de negocio e idempotencia. No paralelizar sin examinar las dependencias sobre membresía y saldo.

**Aceptación:** un fallo del historial no impide ver/editar identidad; actualización confirma los valores normalizados sin esperar catálogo/cupos; presupuesto explícito de consultas y P95 probado con condiciones de red representativas; misma exactitud de saldo y premios.

### B07 · P2/P3 · Validación Unicode incoherente con otras identidades de la app

**Defecto confirmado, impacto habitual bajo pero afecta representación de nombres y datos.** Perfil usa `string.length` (unidades UTF-16) y rechaza solo controles ASCII. El validador compartido de nombres ya usa puntos de código y rechaza controles C1, sustitutos aislados y controles bidireccionales, pero Perfil no lo utiliza.

Evidencia: `cuenta-cliente.ts:19`–25 frente a `validacion.ts:13`–17. La entrada `maxLength` del formulario también usa la longitud HTML habitual, por lo que hace falta resolver coherentemente frontend/backend, no solo cambiar una regex.

**Reproducción:** nombre con U+202E (bidi), U+0085 (control C1) y sustituto aislado devuelven 200. Un nombre sintético de 41 ideogramas fuera del BMP devuelve 422 pese al mensaje de «2 a 80 caracteres». No se demostró XSS: las vistas React escapan texto.

**Mejora:** contrato único de validación y normalización para nombres y texto de preferencias; definir si el límite cuenta puntos de código o grafemas, con manejo seguro de controles invisibles. Reutilizar el validador existente cuando corresponda, conservando nombres culturales legítimos.

**Aceptación:** casos ASCII/acento/combinación/no BMP consistentes; controles de presentación problemáticos rechazados con error entendible; mismos límites entre registro, edición y almacenamiento.

### B08 · P3 · Auditoría no distingue cambios reales de reenvíos

**Limitación confirmada.** Cada POST válido inserta `editar_perfil` con los cuatro nombres de campos aunque no cambie ninguno. Es positivo que no copie valores de alergias/cumpleaños; sin embargo, múltiples reintentos o pulsar guardar sin cambios parecen modificaciones reales y no permiten identificar qué campo cambió.

Evidencia: `cuenta-cliente.ts:34`–42. No se observó límite específico por cuenta para este endpoint; el límite general de cuerpo protege tamaño, no frecuencia. No se realizó prueba de carga ni se afirma un ataque actual.

**Mejora:** detectar diferencias en la misma operación atómica y auditar únicamente nombres de campos cambiados, versión, actor/sesión y correlación; no copiar datos sensibles. Aplicar límites moderados si los volúmenes lo justifican.

**Aceptación:** guardar sin cambios no produce evento engañoso; reintentos identificables; cambios y auditoría siguen siendo atómicos; ningún valor personal aparece en logs operativos.

## Controles correctos y falsos positivos descartados

- **Identidad desde sesión:** actualización y actividad usan `sesion.tel`, no identificadores aportados en el cuerpo (`cuenta-cliente.ts:10`–17, 38, 70). Lista cerrada de campos evita asignación masiva de teléfono/rol/saldo.
- **SQL parametrizado:** interpolación del tag `neon` y parámetros en transacciones; no se encontró concatenación de entradas en SQL en Perfil.
- **Validación y límites:** JSON objeto, cuatro tipos string, longitudes, fecha real/no futura en Managua; 4 KiB en Perfil y 16 KiB global (`cuenta-cliente.ts:8`–31; `index.ts:70`–81).
- **Escritura y auditoría atómicas:** CTE conserva ambas juntas (`cuenta-cliente.ts:34`–42), sin duplicar valores personales.
- **Datos sin caché:** `Cache-Control: no-store` global y de rutas; medido en las 15 combinaciones de autenticación del harness. CSP, HSTS, nosniff y restricciones de referer presentes.
- **Autorización y baja:** rol socio exigido para Perfil/actividad y cuenta activa verificada por middleware. Personal solo, sin bearer de cliente, no obtiene el perfil: `/yo` 404, `/actividad` y `/perfil` 403. El 404 de `/yo` puede armonizarse a 403 como detalle de contrato, no es acceso indebido.
- **Cliente y Personal conviven correctamente:** hipótesis inicial descartada con prueba. `equipo-sesion.ts:24` solo considera cookies de equipo cuando llega `x-equipo-solicitud:1`. El cliente normal no manda ese header; bearer válido + cookie de equipo o cookie inválida conserva 200 en las tres rutas. No publicar esto como defecto.
- **No ausencia general de CSRF demostrada:** Perfil cliente usa Authorization explícito, no una cookie autenticante automática; Personal requiere selección de flujo, origen y CSRF. Si se migra cliente a cookies, entonces debe diseñarse su protección correspondiente.
- **Paginación estable:** actividad limita 20 filas, cursor acotado/validado con microsegundos y desempate por ID (`cuenta-cliente.ts:53`–86). La suite existente tiene prueba de 45 movimientos con fechas empatadas; su ejecución quedó a cargo del agente principal.
- **No acusar Neon HTTP por falta de Hyperdrive:** Cloudflare reconoce tanto Hyperdrive como drivers HTTP de proveedores. Aquí `neon()` evita conexiones TCP duraderas; la mejora demostrable es reducir/organizar las consultas. [Cloudflare: conectar bases de datos](https://developers.cloudflare.com/workers/databases/connecting-to-databases/).

## Mantenimiento de Workers y observabilidad

- `wrangler.jsonc:5`: `compatibility_date` es `2025-08-01`, más de 14 meses anterior a la fecha de auditoría. Es deuda de mantenimiento P3, no prueba de vulnerabilidad. Actualizar en entorno de prueba con regresión antes de desplegar. [Compatibilidad de Workers](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).
- `index.ts:39`–56 define `Env` manualmente. Generarlo desde Wrangler evita deriva de bindings; no se encontró un binding roto de Perfil. JSONC, `nodejs_compat` y observabilidad ya están presentes (`wrangler.jsonc:6`, 18).
- `index.ts:109`–113 limita logs a código e ID y evita mensajes de PostgreSQL que pueden revelar valores. Es positivo. El ID aleatorio no se devuelve al cliente; conviene correlación de solicitudes sin PII y métricas de error/latencia/guardado/conflicto por ruta, nunca valores de alergias o cumpleaños.
- Referencias recuperadas antes del cierre: [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/); tipos publicados que resolvió npm: `@cloudflare/workers-types@5.20261009.1`, descargados en directorio temporal (su número de versión no cambia la fecha local del informe); inspeccionadas firmas actuales `ExportedHandler` y esquema local `node_modules/wrangler/config-schema.json`. No se actualizó ninguna dependencia ni configuración.

## Plan de corrección verificable

1. Definir tratamiento de alergias en pedidos y corregir revocación de sesión cliente (B01/B02). Conservar el aislamiento real/capacitación y la independencia de Personal.
2. Versionar el perfil y devolver su estado normalizado; resolver conflictos y guardados inciertos (B03). Añadir gestión de identidad/privacidad y preferencias reales (B05).
3. Elegir almacenamiento de sesión protegido y migración compatible (B04); reducir acoplamiento/consultas (B06).
4. Unificar validación y auditoría (B07/B08); actualizar compatibilidad/tipos con regresión de los tres endpoints.

No se comprobó explotación, acceso cruzado entre clientes, exposición pública de alergias ni incumplimiento legal. Tampoco se inspeccionaron secretos, cifrado de Neon, políticas empresariales externas, configuración real de retención o métricas de producción. Estas son verificaciones pendientes, no fallos atribuidos.
