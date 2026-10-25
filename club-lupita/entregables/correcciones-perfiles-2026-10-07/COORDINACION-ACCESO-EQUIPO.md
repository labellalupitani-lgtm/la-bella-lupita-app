# Integración con la tarea de acceso del equipo

Estado verificado: 8 de octubre de 2026, 03:07 UTC. No se leyeron secretos remotos ni se ejecutaron operaciones sobre clientes reales.

## Cambios de esta auditoría que deben conservarse

- `acceso-equipo.ts:13` reutiliza `nombrePersonalValido` de `validacion.ts`, integrado por el coordinador. La API rechaza NUL/C0/C1, Unicode malformado y controles direccionales; acepta 80 caracteres no BMP. No reemplazar por longitud UTF-16 y una expresión solo C0.
- `panel.ts:100` usa `plazasOcupadas` para devolver `membresiasVivas` y `bajasAnunciadas` coherentes con `/api/cupos`, sin cobrar ni mutar al consultar.
- `pedidoParaCocina` se aplica en las dos rutas de pedidos; conserva preparación y elimina importes/contacto/motivo libre para Cocina.
- Scheduled trabaja real/demo de forma independiente y rechaza alias de una sola base. El campo interno y de log se llama `entorno`; el guardián del proyecto requiere conservarlo así.
- Cabeceras del coordinador ya están integradas en `index.ts`; deben conservarse.

## Defecto de entrada reproducido

**Prioridad media: HTTP 500 por `dispositivo` en login válido.** `equipo-sesion.ts:51` ejecuta `.trim()` sobre un valor que puede ser número u objeto y permite NUL hacia SQL. Prueba: `POST /api/auth/equipo/entrar` con usuario/clave sintéticos válidos y, separadamente, `dispositivo: 123`, `{}`, o `"Equipo\u0000compartido"`. Los tres devuelven 500. Evidencia: `evidencia/equipo-integracion.json`.

Propuesta: validar tipo, controles y longitud antes de crear la sesión; devolver 422 ante valor inválido o aplicar normalización explícita y segura del campo opcional. Cubrir otros caminos que llaman `emitirSesion` con datos de entrada (bootstrap y activación), conservando nombre predeterminado cuando se omite.

## Decisiones de migración que faltan resolver

**Cuenta previa sin cambio registrado.** La fila 6 de `020_acceso_equipo.sql` marca `requiere_cambio=true` aunque antes era false. En ensayo, contraseña válida conserva login 200 pero obtiene fase `clave` y no puede operar hasta cambiar. Esto contradice la invariante 6/O04 del PLAN-MAESTRO. La otra tarea puede tener autorización más reciente; debe contrastarse y documentarse, no ocultarse como conservación de acceso sin cambios. Un empleado histórico con `clave_cambiada` informado mantiene fase completa.

**Material de hashes históricos.** El código anterior generaba el HMAC previo a bcrypt con `SESION_SECRETO`; el actual usa únicamente `PERSONAL_CREDENCIAL_SECRETO` (`equipo-sesion.ts:18`). En ensayo con secretos distintos, el mismo hash/contraseña devuelve 401; configurando el nuevo binding con el valor histórico devuelve 200. Antes de publicar debe preservarse ese material o implementarse una transición explícita compatible. No generar un valor diferente por defecto sin estrategia de migración. No hace falta compartir ni registrar el valor secreto para acordar este requisito.

## Evidencia y helper disponibles

`node tests/correcciones-servidor.mjs`: **12/12 grupos aprobados**, incluida invitación de 24 h, uso único, caducidad, revocación, MFA real y convivencia Cliente/Personal. Cookie personal sin cabecera no sustituye a Bearer de Cliente; con `x-equipo-solicitud: 1` selecciona Personal. No hay defecto demostrado en esa convivencia.

`node tests/perfiles-equipo-integracion.mjs`: reproduce las observaciones en PGlite con preparación previa a 020. JSON sin contraseñas, tokens ni cookies.

`tests/soporte-perfiles-equipo.mjs` es reutilizable: `preparar`, `leerAutenticacion`, `crearPropietario`, `crearEmpleado`, `activarInvitacion`, `configurarMfa`, `entrarEquipo`. La autenticación sale de cookies y TOTP reales de la API. Namespace por proceso evita colisiones con suites antiguas.
