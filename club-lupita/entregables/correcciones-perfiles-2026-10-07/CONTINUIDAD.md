# Continuidad con el chat de acceso administrativo

El usuario autorizó coordinar ambos chats, pero mantiene pausado «Audita el acceso de administradores» hasta que él avise. Este documento no revoca esa pausa.

## Estado publicado

- Cloudflare `144530db-b68b-4f0a-b3a3-b45ce04ca034`, 100 %, dominio app.labellalupita.com.
- Copia estable `version-publicada/`, cotejada con `evidencia/release-final-manifest.json`.
- Acceso anterior operativo; altas NUEVAS con clave temporal 24 h y cambio obligatorio.
- Sin migración 020, sin nuevos secretos, sin MFA/cookies/invitaciones del desarrollo pausado.
- Cron cada hora al minuto 17; mantenimiento de ambas bases con guardia de identidad y errores independientes.
- CSP final permite Web Analytics de Cloudflare ya presente; las cabeceras propias en root también recibieron esa corrección.

## Integración al retomar

No restaurar globalmente la copia publicada sobre root: eliminaría el trabajo nuevo. Usar la versión publicada como referencia de las correcciones de dinero, pagos, datos, permisos de Cocina, validaciones, cupos y cron. Terminar primero el contrato de acceso que el otro chat tiene en desarrollo.

Revisar expresamente estas diferencias finales:

1. `src/worker/index.ts` de la versión publicada: ante 57014/55P03 en `enTransaccion`, rollback y 503 con Retry-After 2; para pedidos se indica conservar referencia; para otras operaciones se indica revisar estado. No aumentar el límite de ocho segundos para ocultar contención.
2. `src/worker/personal.ts` existe en la versión publicada con validación de nombre y alta temporal de 24 h. Si el nuevo sistema elimina este módulo, trasladar sus invariantes a las invitaciones/rutas nuevas y conservar los casos de frontera de B-04.
3. `src/casa/operacion.ts`, `sesion-cliente.ts` y `pantallas/Personal.tsx` del release usan Bearer y evento `{token}` para el equipo. La nueva autenticación deberá adaptar ese aislamiento a su contrato cookie/CSRF sin perder la protección del Cliente y de respuestas antiguas.
4. `public/_headers` y `src/worker/cabeceras.ts`: política idéntica de activos/API; incluye `https://static.cloudflareinsights.com` en script-src y `https://cloudflareinsights.com` en connect-src. No añadir unsafe-eval o scripts inline.
5. Paquetes/lock y `scripts/proteger-braces.mjs`: preservar actualizaciones y mitigación; audit completo mantiene cinco alertas de desarrollo hasta disponer de una versión del proveedor corregida.
6. Pruebas finales independientes de autenticación en `version-publicada/tests`; pruebas específicas de nuevo acceso en root quedan como trabajo de ese chat. No mezclar sus conteos de aprobación.

Durante la exploración de 020 se observó que la compatibilidad de huellas históricas depende de conservar el secreto inicial de credenciales compatible con SESION_SECRETO; cambiarlo indiscriminadamente rompe el ingreso migrado. También se documentaron entradas no válidas de `dispositivo` que necesitan validación y el efecto de `clave_cambiada IS NULL` sobre el cambio obligatorio. Consultar `tests/perfiles-equipo-integracion.mjs` y su evidencia raíz antes de certificar ese contrato. Estos diagnósticos no formaron parte de la autenticación publicada.

El despliegue siguiente debe verificar como versión previa la publicada aquí, conservar sus correcciones y realizar un ensayo de migración con PostgreSQL aislado. Las dos ramas temporales creadas por esta auditoría fueron eliminadas; no reutilizar sus URL.
