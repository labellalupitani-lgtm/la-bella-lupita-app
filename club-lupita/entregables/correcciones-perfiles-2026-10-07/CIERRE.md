# Correcciones de perfiles — informe de cierre

La Bella Lupita · cierre: 7 de octubre de 2026, 21:26, America/Managua (8 de octubre, 03:26 UTC).

**Los nueve defectos reproducidos están corregidos y publicados en [app.labellalupita.com](https://app.labellalupita.com).** Se ejecutó el [plan maestro](PLAN-MAESTRO.md), con ciclos de implementación, regresión, concurrencia, publicación y verificación. Las siete observaciones adicionales tienen tratamiento y evidencia; la alerta de `braces` permanece identificada y mitigada, y las pruebas físicas/entrega real de correo no se presentan como certificadas.

La versión final de Cloudflare es **144530db-b68b-4f0a-b3a3-b45ce04ca034**, al 100 %. Se conservaron los secretos, el dominio y las bases real/demo. No se ejecutaron migraciones ni operaciones sintéticas contra clientes de producción.

## Código entregado y coordinación

La [carpeta version-publicada](version-publicada/LEEME.md) conserva las fuentes, los activos y las pruebas de esta entrega. Sus 408 archivos de código/configuración/activos se cotejaron contra el [manifiesto final](evidencia/release-final-manifest.json), con SHA-256 global `741850bea1688fe68311511da3481dc63fd87712e75cc01e3f3629448652b9bf`.

El árbol principal de `club-lupita` contiene también la transición de acceso administrativo de otro chat, pausada por instrucción del usuario. Ese desarrollo fue preservado; **el árbol principal no equivale a la versión publicada**. Se publicó una copia aislada con el acceso vigente y las correcciones de esta auditoría. No se aplicó la migración 020, ni se activaron las nuevas cookies, invitaciones o MFA. La coordinación para retomarlo está en [CONTINUIDAD.md](CONTINUIDAD.md).

## Los nueve defectos

| Hallazgo | Resultado publicado | Evidencia principal |
| --- | --- | --- |
| UI-01 Centavos truncados | El formato compartido conserva centavos. La recarga de C$ 200.49 se presenta y registra con ese importe. | Bordes UI; recorridos Caja; 16 pruebas unitarias. |
| UI-02 Error fuera del modal de pago | El aviso aparece dentro de «Tu pedido», recibe foco y puede leerse con teclado. Un resultado incierto conserva carrito y referencia, incluso tras recargar. | Cliente: rechazos, red y respuesta perdida; un único cargo tras reintentar. |
| UI-03 Saldo antiguo sin aviso | Cuenta, catálogo y cupos tienen estados separados; la última consulta válida conserva fecha y muestra el fallo con reintento. | UI de saldo, recuperación por teclado y lectura posterior correcta. |
| UI-04 Catálogo irrecuperable tras 503 | Tienda y Reservar muestran recuperación explícita sin perder sesión ni exigir recargar el documento. | Un 503 inicial seguido de recuperación mediante la interfaz. |
| UI-05 Sesión persistente tras 401 | Se invalida solo el token correspondiente; se retiran los datos privados, se sincronizan pestañas y se ignoran respuestas antiguas. La sesión del personal permanece separada. | Compras/perfil/pago, dos pestañas, respuesta tardía y contrato del equipo. |
| B-01 Cupos ocupados por membresías vencidas | La proyección de disponibilidad comparte criterio con la consulta administrativa y contempla vigencia, renovación consentida y saldo, sin cobrar por leer. | Correcciones de servidor y comprobación antes/después del mantenimiento. |
| B-02 Fechas imposibles provocaban 500 | Validación de calendario antes de SQL; fecha inválida devuelve 422. | Fronteras locales, Neon y GET público de producción. |
| B-03 ID de aviso desbordaba bigint | Se valida entero positivo dentro del rango antes del cast; entradas inválidas reciben 404. | Rango máximo, desbordamiento y aislamiento entre clientes. |
| B-04 Controles en nombre administrativo provocaban 500 | Validación de nombre y Unicode antes del hash/SQL; controles inválidos reciben 422. | Controles, NUL, acentos, longitud y permisos de alta. |

Las cinco reproducciones de interfaz y la observación de contraste pasaron **6/6** en [bordes UI, ciclo final](evidencia/release/bordes-ui-ciclo2/resultados.json). Las cuatro correcciones de servidor forman parte de [10 grupos aprobados](evidencia/release-correcciones-servidor.json).

## Observaciones adicionales

| Punto | Tratamiento y estado |
| --- | --- |
| O-01 Dependencias | Actualizados `sharp` a 0.35.5, `postcss-selector-parser` a 7.1.6 y `source-map-js` a 1.2.2. Audit de producción: **0 alertas**. Audit completo: **5 alertas altas transitivas de desarrollo**, todas de la cadena `braces`; no se ocultaron. Mitigación local comprobada en instalación y prebuild. |
| O-02 Cabeceras | CSP, HSTS, nosniff, Referrer-Policy y protección contra marcos en API y activos. Política compatible con fuentes del legado y con Web Analytics de Cloudflare que ya estaba activo. Verificación pública sin errores CSP/JavaScript. |
| O-03 Mantenimiento | Cron remoto antes vacío; ahora `17 * * * *`, cada hora al minuto 17. Real y demo se procesan de manera independiente; un fallo no impide intentar la otra base. Se rechazan alias que apuntan a la misma base y se evitan secretos en logs. |
| O-04 Clave inicial | Nuevas altas reciben clave temporal de 24 horas y deben cambiarla antes de operar. Expiración, revocación, restablecimiento y conservación de cuentas históricas verificados. No se forzó un cambio a los empleados existentes. |
| O-05 Cocina | Contrato positivo de datos operativos: cantidades, líneas e identificación necesaria para preparar. Se omiten importes, precios y contacto; la interfaz no presenta totales. Otros perfiles conservan sus facultades. |
| O-06 Integración | Ensayos con PostgreSQL/Neon real en ramas temporales separadas, con controles de identidad y limpieza confirmada. Transporte de correo probado localmente. No se enviaron mensajes reales no solicitados ni se certificó recepción en un buzón. |
| O-07 Accesibilidad | Teclado, apertura/cierre de modales, retorno del foco, errores, reintento, axe, responsive y ampliación probados. Edge, Firefox y WebKit aprobados. El reflujo equivalente al 200 % y texto al 200 % no sustituyen una certificación con lector de pantalla o dispositivos físicos. |

`braces` no tenía una versión corregida publicada para [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). El script `scripts/proteger-braces.mjs` verifica huellas de los archivos del proveedor y limita a 128 niveles el parser y los recorridos de compilación, expansión y serialización. Se comprobaron patrones válidos y rechazo acotado de entradas de 4.000 niveles y árboles de 10.000 niveles. La mitigación debe mantenerse hasta sustituirla por una corrección del proveedor verificada; **no se afirma que el audit completo esté limpio**. [Auditoría completa](evidencia/release/audit-completo.json), [auditoría de producción](evidencia/release/audit-produccion.json).

La excepción CSP para el medidor existente usa únicamente los orígenes documentados por Cloudflare, sin permitir scripts inline ni `unsafe-eval`. [Documentación oficial de CSP y Cloudflare](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/).

## Verificación realizada

| Conjunto | Resultado |
| --- | --- |
| Compilación, TypeScript y guardianes de diseño | Aprobados; paquete de Workers verificado con dry-run. |
| Diez suites existentes de negocio | Todas aprobadas: regresión, cuenta, operación, correo, Resend, auditoría, saldo, panel, seguridad y clientes. |
| Matriz API | 11/11 grupos; 132 lecturas y 60 escrituras denegadas comprobadas. Incluye invitado, Cliente, Propietario, Encargado, Caja y Cocina. |
| Correcciones del servidor | 10/10 grupos aprobados. |
| Recorridos de perfiles | Edge 97/97 y Firefox 97/97; 83 capturas por motor. Incluyen compra→aceptación→preparación→entrega, recarga, atención, informes, revocación y cambio de clave. |
| Cliente y accesibilidad | 16 unitarias + 12 funcionales × 3 motores + 16 de accesibilidad × 3 motores = **100 comprobaciones aprobadas**. |
| Bordes originales | 6/6 aprobados. |
| Suites UI heredadas | Las tres suites aprobaron: interfaz general, correo y auditoría UI. |
| Contención de base | 2/2 pruebas de rollback, 503 recuperable y reintento con un único cargo. |
| Neon aislado | 4/4 grupos aprobados: referencia repetida, competencia por saldo, competencia por horario VIP y entradas límite. |
| Runtime Workers | Documentos, API 200/401/422, cabeceras y evento scheduled sobre base de ensayo aprobados. |
| Producción | Nueve consultas públicas/negativas, huellas de JS/CSS del cliente y equipo y ambos accesos en navegador aprobados. Versión, bindings y cron confirmados por API. |

Las pruebas se basaron en Worker y SQL reales con datos sintéticos; las interrupciones de red/respuestas controladas se usaron solamente donde el escenario lo requería. Las pruebas locales de correo sustituyeron el transporte para evitar envíos a personas. Los resultados relativos al nuevo acceso 020 que existían en el árbol principal son diagnósticos del trabajo pausado y **no se cuentan como evidencia de esta publicación**.

## Ciclos y decisiones relevantes

1. La implementación corrigió los nueve defectos y las observaciones. Las pruebas de teclado detectaron además un problema real de foco al deshabilitar el botón de pago; se corrigió el foco del diálogo/error y se conservó el botón de origen para restaurarlo al cerrar.
2. La transición concurrente de autenticación impedía publicar el árbol compartido tal como estaba. Se aisló la entrega, se restauró el contrato vigente exclusivamente en esa copia y se reaplicaron las correcciones. Los fixtures recorren el primer cambio de clave por API; no saltan esa protección.
3. Neon reprodujo contención: ocho solicitudes simultáneas podían superar el límite existente de ocho segundos y obtener 500. Se conservó el límite, se añadió respuesta 503 recuperable con `Retry-After: 2` y se comprobó el reenvío de la misma referencia. En el ciclo final, una petición del grupo de referencia repetida y cuatro del grupo de saldo limitado requirieron reintento. Terminó con un único cargo para la misma referencia y exactamente dos compras para el saldo que alcanzaba para dos. **No es una garantía de ocho respuestas inmediatas ni una prueba de carga general.**
4. La primera verificación pública detectó el medidor Cloudflare bloqueado por CSP. Se agregó la compatibilidad documentada y se publicó una segunda versión. La comprobación final registró cero errores JavaScript y cero violaciones CSP. Un error de lectura del formato del endpoint de schedules se corrigió en el instrumento de verificación; la publicación se confirmó por API sin repetirla por ese motivo.
5. Se ajustaron instrumentos obsoletos: espera de resultado observable en lugar de `networkidle`, mensaje actual de desconexión, inyección de axe mediante evaluación del navegador y separación de archivos por proceso. Los fallos iniciales y logs se conservaron; las expectativas de permisos, dinero y aislamiento siguieron vigentes.

Evidencia detallada: [matriz API](evidencia/release-perfiles-api.json), [frontend](FRONTEND-RELEASE.md), [backend](RELEASE-BACKEND.md), [Neon](evidencia/release-concurrencia-neon.json), [limpieza de ensayo](evidencia/ensayo-infra.json), [publicación](evidencia/publicacion.json), [verificación pública](evidencia/verificacion-publicacion.json). Las capturas y los logs finales se conservaron en `evidencia/release` y `logs/release`; los ciclos anteriores siguen disponibles.

## Reversión y continuidad

La versión anterior a este trabajo es `c2f3beee-0db8-4147-bb90-a82bd6789339`. La reversión de código debe usar esa versión registrada, comprobar también sus activos y revisar por separado el cron: las programaciones son configuración del Worker y no deben suponerse revertidas junto al código. El cron previo estaba vacío. No se necesita revertir migraciones porque esta entrega no ejecutó ninguna.

La carpeta principal debe integrarse selectivamente cuando el usuario reanude el otro chat. No publicar esa carpeta sin terminar la nueva autenticación y repetir su matriz. Las limitaciones externas declaradas y el aviso residual de `braces` quedan documentados para mantenimiento; no invalidan las comprobaciones funcionales realizadas ni se presentan como pruebas aprobadas que no se ejecutaron.
