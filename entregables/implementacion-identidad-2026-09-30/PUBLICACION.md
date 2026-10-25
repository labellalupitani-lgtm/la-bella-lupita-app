# Publicación de la identidad V3

- Sitio: https://club-lupita.el-molino.workers.dev/
- Fecha local: 30 de septiembre de 2026, America/Managua
- Versión publicada: `0d4120e5-652c-48bc-b8e9-713962a34208`
- Versión anterior: `eb1b7aa5-93fe-4879-b59b-c6920ebff778`
- Publicación autorizada expresamente por el usuario

## Validación

Build, guardian, TypeScript, pruebas de regresión, cuenta y operación, y ensayo de despliegue completados sin fallos

El servicio público responde correctamente en `/api/health`
Las nueve rutas revisadas entregan HTTP 200 y referencias a los nuevos recursos
JavaScript, CSS, fuente de iconos, logo y retrato coinciden por SHA-256 con el build local

Las pantallas públicas de acceso del cliente y personal fueron revisadas en Edge a 390 × 844, con capturas y comprobación visual
Fondo crema y texto café correctos, sin errores JavaScript, imágenes rotas ni desbordamiento horizontal
Evidencia: `produccion/verificacion.json`, `produccion/acceso-cliente.png` y `produccion/acceso-personal.png`

La revisión pública no ejecutó compras, canjes, reservas, inicios de sesión ni escrituras de cuentas
Los recorridos autenticados y permisos se probaron previamente con datos aislados

Se conservaron las variables remotas mediante `--keep-vars`, incluida la configuración existente `DEMO_AISLADA=true`
No se realizaron migraciones de base de datos ni modificaciones de secretos
El envío de códigos personales conserva su disponibilidad anterior
