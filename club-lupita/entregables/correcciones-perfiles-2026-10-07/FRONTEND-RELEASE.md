# Integración de frontend en la copia de publicación

Cambios limitados a `.test-output/release-perfiles`. El árbol de trabajo mixto se conserva intacto.

## Contrato integrado

- `src/casa/operacion.ts` vuelve al contrato de Personal con Bearer explícito y `PersonalIdentidad` del acceso anterior. Conserva el transporte compartido `pedirJSON`, timeout, resultado incierto y protección de Cliente ante respuestas obsoletas. Los importes de `PedidoOperativo` permanecen opcionales para Cocina.
- `src/casa/sesion-cliente.ts` emite la caducidad de Personal mediante `detail: { token }`. `src/casa/pantallas/Personal.tsx` compara ese token con su sesión vigente; un 401 de Cliente o de un acceso anterior no cierra el acceso actual del equipo.
- `src/casa/equipo/Equipo.tsx` presenta la nueva clave temporal de 24 horas, usuario y vencimiento; el acceso anterior ya dirige a Cuenta y seguridad mientras `requiereCambio` es verdadero. El backend conserva el contrato `{id, usuario, clave, vence}`.
- Las correcciones de centavos, errores dentro del diálogo, conservación del carrito y referencia, foco, recuperación de cuenta/catálogo y cierre entre pestañas permanecen integradas.
- `tests/correcciones-cliente.mjs` verifica el contrato Bearer de publicación, sin asumir cookies o MFA del desarrollo pausado.
- `tests/soporte-cliente-perfiles.mjs` es autocontenido: utiliza `tests/soporte.mjs` de esta copia y su Worker actual, con un namespace por proceso y `dist` local. No requiere leer el respaldo del otro árbol.

## Verificación ejecutada

`npm run build`: aprobado; guardianes, TypeScript y Vite completados. Artefacto en `dist/` de esta copia.

| Suite | Resultado | Evidencia |
| --- | --- | --- |
| Transporte, dinero y sesiones | 16/16 | `evidencia/cliente-unitario/resultados.json`, `logs/cliente-unitario-release.log` |
| Cliente Edge 154.0.4258.62 | 12/12 | `evidencia/cliente-release-edge/`, `logs/cliente-release-edge.log` |
| Accesibilidad Edge 154.0.4258.62 | 16/16 | `evidencia/accesibilidad-release-edge/`, `logs/accesibilidad-release-edge.log` |
| Cliente Firefox 155.0 | 12/12 | `evidencia/cliente-release-firefox/`, `logs/cliente-release-firefox.log` |
| Accesibilidad Firefox 155.0 | 16/16 | `evidencia/accesibilidad-release-firefox/`, `logs/accesibilidad-release-firefox.log` |
| Cliente WebKit 26.6 | 12/12 | `evidencia/cliente-release-webkit/`, `logs/cliente-release-webkit.log` |
| Accesibilidad WebKit 26.6 | 16/16 | `evidencia/accesibilidad-release-webkit/`, `logs/accesibilidad-release-webkit.log` |

Total: **100 casos aprobados, cero fallos y cero excepciones JavaScript registradas**. Los tres recorridos de accesibilidad registraron cero violaciones CSP y cero violaciones axe. Se incluyen capturas y árboles accesibles junto a los JSON.

La ampliación comprueba reflujo equivalente al 200 % mediante viewport CSS de 640×450, captura con escala 2 sobre una base de 1280×900, y ampliación de texto al 200 % en tres modales. No se presenta como certificación con lector de pantalla ni accionamiento de zoom nativo en dispositivos físicos.

El coordinador ejecuta la matriz completa del personal. Su prueba de Cocina sin red debe esperar el mensaje actual del transporte: «Se cayó la señal. Revisá tu conexión y volvé a intentar.», además de conservar «Información sin actualizar» y verificar recuperación. El antiguo literal «No pudimos conectar» pertenecía al `TypeError` que ahora envuelve el transporte compartido; no cambia la expectativa funcional de error y reintento.

No se publicó desde esta subtarea ni se utilizaron datos reales. Las transacciones e interrupciones de red se verificaron contra SQL local sintético.

## Puerta de suites heredadas

Las tres suites existentes se ejecutaron en esta misma copia con Edge 154.0.4258.62 y terminaron con código 0:

| Suite | Resultado | Log / evidencia |
| --- | --- | --- |
| `tests/ui.mjs` | 16 comprobaciones aprobadas: compra idempotente tras respuesta perdida, reserva, pase, navegación, responsive, seis pantallas con axe, salida sin conexión y respuesta inválida recuperable. | `logs/ui-heredada-release.log`, `evidencia/ui-heredada-release/` |
| `tests/correo-ui.mjs` | Flujo completo aprobado: disponibilidad, recuperación, código incorrecto/correcto, alta con consentimiento, reingreso, móvil/escritorio y axe. Correo sustituido por transporte local; no envía mensajes reales. | `logs/correo-ui-release.log`, `evidencia/correo-ui-release/` |
| `tests/auditoria-ui.mjs` | 2/2: respuesta VIP perdida con saldo exacto produce una reserva/cargo, y baja del cliente elimina token y datos de ambas pestañas. | `logs/auditoria-ui-release.log`, `evidencia/auditoria-ui-release/` |

Ajustes limitados a la instrumentación: axe se ejecuta con `page.evaluate`; el servidor propio de `ui.mjs` aplica `public/_headers`, y se esperan fuentes y animaciones finitas antes de medir. `auditoria-ui.mjs` obtiene `firmar` de `t.firmar`, compatible con el namespace por proceso del soporte. No fue necesario cambiar expectativas de negocio ni fuentes de la aplicación para aprobar estas tres suites.
