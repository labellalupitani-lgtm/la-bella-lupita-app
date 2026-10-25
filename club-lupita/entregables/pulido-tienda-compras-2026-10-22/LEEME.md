# Pulido de Tienda y Mis compras — 22 de octubre de 2026

Mejora aplicada en el proyecto local y en una compilación conservada para revisión. Sin despliegue a producción.

## Ver el resultado

- [Tienda nueva](http://127.0.0.1:5310/tienda).
- [Mis compras nuevo](http://127.0.0.1:5310/compras).
- [Entrar al entorno sintético](http://127.0.0.1:5310/__preview/entrar), si una sesión nueva necesita acceso. Después, abrir las rutas anteriores.
- Comparación anterior: [Tienda](http://127.0.0.1:5300/tienda) y [Mis compras](http://127.0.0.1:5300/compras).

La cuenta de la vista previa comienza sin compras. Las capturas de comprobantes poblados en `pruebas-compras-cierre/` usan datos sintéticos de los cuatro tipos de operación; no representan movimientos reales.

## Cambios

- Tienda: composición abierta y asimétrica, fotografía dominante con encuadre móvil corregido, bordes selectivos y relación más clara entre producto, precio y acción.
- Mis compras: título único y breve introducción; actualización compacta; filtros; compras en curso y próximas separadas del historial; comprobantes con tipo, nombre, estado e importe destacados.
- Ayuda: sección desplegable que conserva borradores, errores y solicitudes al cerrarla. El motivo seleccionado se presenta completo, incluso a 320 px con texto al 200 %.
- Se conservan condiciones, restricciones, descuentos, identificadores, estados inciertos, consentimientos y acciones de compra/reserva/beneficio.

Se mantienen la marca y los recursos existentes. La fotografía contextual se identifica como imagen de ambiente; una fotografía verificada del producto publicada en su ficha tiene prioridad. No se ha creado un envase ficticio.

## Fuentes modificadas

1. `src/casa/pantallas/Tienda.tsx`
2. `src/casa/pantallas/TiendaExperiencia.css`
3. `src/casa/pantallas/MisCompras.tsx`
4. `src/casa/pantallas/MisComprasExperiencia.css` (nuevo)
5. `src/casa/componentes/Atencion.tsx` (prop opcional; el resto de pantallas conserva el valor predeterminado)

Pruebas: nuevo `tests/pulido-compras-ui.mjs` y ajuste de sincronización de imágenes responsivas en `tests/tienda-producto-ui.mjs`.

## Validación

| Comprobación | Resultado y alcance | Evidencia |
| --- | --- | --- |
| Compilación | PASS: guardian, TypeScript y Vite | `build-final.log` |
| Tienda visual y accesible | 6 grupos PASS: imagen de ficha/fallback, condiciones, teclado, texto 200 %, movimiento reducido y axe | `tienda-r2.log`, `pruebas-tienda-r2/` |
| Flujos de Tienda | 9 grupos PASS: precio cambiado, respuesta perdida, referencias persistentes, beneficios y diálogos; incluye Firefox y WebKit | `transacciones.log`, `pruebas-transacciones/` |
| Mis compras final | 9 grupos PASS: carga/vacío/error, cuatro tipos, datos antiguos, paginación/deduplicado, filtros, ayuda, teclado, reflujo y ausencia de operaciones de compra | `compras-cierre.log`, `pruebas-compras-cierre/` |
| Revisión independiente | Composición, marca y uso, con sus hallazgos y comprobaciones de cierre | archivos `REVISION-*.md` |

La suite de Mis compras se ejecutó sobre la compilación final. Tienda y sus transacciones se probaron antes de los últimos ajustes de densidad y ayuda de Mis compras; desde esas pruebas no se modificó su CSS ni su lógica de compra. La revisión de uso completa se complementa con una comprobación focal del último ajuste. No se afirma una auditoría integral de toda la aplicación.

Datos locales sintéticos en Worker/PGlite, con servicios externos bloqueados. El historial poblado usa respuestas de prueba del contrato de compras; solicitudes de ayuda y respuestas atraviesan el Worker local. No hay cargos reales ni envíos a terceros.

## Versiones y recuperación

Entrada final: `principal-CUBKWecD.js`. La carpeta `compilacion/` conserva el resultado servido en 5310. `MANIFIESTO-SHA256.json` identifica fuentes, pruebas y archivos compilados; puede haber recursos antiguos no referenciados por la entrada final.

`antes/` conserva la compilación y las fuentes existentes antes de esta ronda. `MisComprasExperiencia.css` es nuevo; cualquier restauración debe tenerlo en cuenta. No se realizaron cambios de dependencias, configuración de despliegue ni datos de producción.

Para volver a abrir esta vista desde la raíz del proyecto:

```powershell
node scripts/vista-previa-diseno.mjs --port 5310 --dist entregables/pulido-tienda-compras-2026-10-22/compilacion --equipo
```

Capturas finales abiertas en el navegador: `vista-tienda-abierta.png` y `vista-compras-abierta.png`. Las capturas móviles y estados adicionales están en las carpetas de pruebas.
