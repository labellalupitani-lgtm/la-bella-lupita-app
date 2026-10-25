# Preparación de la vista previa integral

Abrir [selector local](http://127.0.0.1:5191/__preview) en esta computadora. Permite entrar como cliente, visitante o como propietario, encargado, caja y cocina. Son perfiles sintéticos con los permisos del Worker real; la base PGlite vive en memoria.

Esta preparación permite recorrer todas las áreas. **No significa que su diseño esté terminado o aprobado.** El usuario pidió revisar primero Inicio. La [sexta composición](../inicio-ajuste-2026-10-21/LEEME.md), con fotografía editorial y carta desde el comienzo, ya está implementada y revisada técnicamente; espera aprobación visual. Se abre compilada en [5190](http://127.0.0.1:5190/__preview/entrar), frente a la quinta conservada en [5196](http://127.0.0.1:5196/__preview/entrar).

Para arrancarlo de nuevo desde la raíz de `club-lupita`:

```powershell
node scripts/vista-previa-diseno.mjs --equipo --port 5191
```

El aviso superior regresa al selector. Elegir de nuevo un rol abre una nueva sesión sintética y permite continuar después de bloquearla o cerrarla. Cambiar a visitante elimina las sesiones de prueba de cliente/equipo. Reiniciar el servidor reinicia los datos. No hace falta introducir credenciales del negocio.

El proceso no carga archivos de entorno ni usa una base remota. Las llamadas salientes están bloqueadas y escucha únicamente en loopback. El modo sin `--equipo` conserva la entrada directa a Inicio del primer ciclo.

Validación: [ocho grupos de aceptación](evidencia-preview/aceptacion-equipo.json) en Edge, incluyendo permisos diferenciados, sesiones, teclado, WCAG automatizado, consultas inválidas, origen/Host/CSP y ausencia de red externa/errores JS en las vistas comprobadas. No es una validación de todas las operaciones del negocio.

Repetir comprobación con el servidor encendido:

```powershell
node entregables/redisenio-2026-10-21/evidencia-preview/comprobar-preview-equipo.mjs
```

La [matriz de cobertura](COBERTURA.json) contiene 77 superficies y familias con estados y pruebas asociados. Es un inventario de trabajo; no declara cumplimiento del 100 %.

