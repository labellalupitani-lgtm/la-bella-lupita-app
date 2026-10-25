# Coordinación con acceso de administradores

Artur autorizó explícitamente: «Sí, coordiná ambos chats». Se enviaron mensajes al chat de acceso desde este chat de perfiles. **Estado final:** ese chat sigue pausado por instrucción del usuario; esta entrega se publicó desde una copia aislada, sin autenticación 020. Consultar [CONTINUIDAD.md](CONTINUIDAD.md) y [CIERRE.md](CIERRE.md). Las notas siguientes conservan el registro histórico de la integración antes de adoptar esa decisión y no representan instrucciones para reanudar ni el estado final de publicación.

## Propiedad de cambios

- Chat de acceso: autenticación del personal, `Personal`, `Equipo`, `Seguridad`, cookies/CSRF/MFA/invitaciones, migración 020, secretos nuevos y soporte general de pruebas. Este chat no revierte esas modificaciones ni publica mientras estén incompletas.
- Chat de perfiles: Cliente (`http`, `sesion-cliente`, `datos`, carrito/pantallas), validaciones calendario/bigint/nombre, plazas de membresía, minimización Cocina, cabeceras, cron y dependencias. El nuevo `operacion.ts` ya conserva `pedirJSON`; se agregan pruebas de coexistencia.

## Evidencia independiente ya obtenida

16 pruebas puras de Cliente; cabeceras 200/401/404/500; compilación TypeScript; Vite en `.test-output/perfiles-dist`; 12 casos UI de Cliente en Edge con CSP activa; 4 grupos de concurrencia/entradas en Neon aislado.

El ensayo Neon usa exclusivamente la rama temporal identificada en `evidencia/ensayo-infra.json` y estado privado `.perfiles-ensayo.local`. Ninguna migración ni operación sintética se hizo en producción o capacitación.

## Integraciones necesarias

1. Verificar convivencia en un mismo navegador: consultas/compras del cliente deben conservar su identidad. La revisión completa confirmó que `tokenEquipo` ya exige `x-equipo-solicitud`; el aviso preliminar enviado sobre precedencia de cookies no constituye un defecto confirmado. Se añade regresión de coexistencia.
2. `qrcode` embebido por esbuild `platform:node`/ESM requiere `fs` dinámico. En nuestros fixtures se deja `external:['qrcode']`; el empaquetado Workers se debe comprobar aparte.
3. `validacion.ts` exporta `nombrePersonalValido` para B04: rechaza NUL, controles, Unicode malformado y marcadores bidireccionales; cuenta caracteres completos para no rechazar nombres no BMP válidos. La nueva ruta de altas debe reutilizarlo.
4. Nuestros fixtures temporales tienen directorios propios y no escriben los bundles del soporte general. El backend prepara un fixture de cuentas por invitación y MFA en `tests/soporte-perfiles-equipo.mjs`; debe seguir el contrato real y no omitir verificaciones.
5. API remota confirmó cron vacío. `wrangler.jsonc` ahora prepara `17 * * * *`. El handler separa real/demo y detecta alias de la misma base. Conservar este cambio al publicar.
6. Publicación única tras regresión integrada. El chat de acceso debe coordinar migración/secretos y activación personal de MFA; el de perfiles verificará regresión, CSP, assets y cron finales. Por ahora no se ha publicado nada.

## Pruebas y build

Este chat usa exclusivamente `.test-output/perfiles-*` para UI/Neon/fixtures mientras el acceso se estabiliza. Los archivos de evidencia nuevos están en esta carpeta. El informe de auditoría original se mantiene histórico. El soporte Cliente reutiliza el fixture del respaldo, compilando el código actual y con un teléfono sintético normal; no simula endpoints del Worker. C01 necesitó corregir el tipo de un abono sintético (un ajuste exige firma), y la prueba Neon se ajustó al contrato existente de saldo insuficiente (409); ambos fallos de fixture están en los logs del primer ciclo.
