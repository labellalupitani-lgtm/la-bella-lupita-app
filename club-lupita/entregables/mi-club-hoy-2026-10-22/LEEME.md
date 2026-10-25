# Mi Club: disfrutar hoy

Aplicación de la dirección aprobada el 22 de octubre de 2026. Nueva vista local: http://127.0.0.1:5320/club. El navegador contiene una sesión sintética; si hace falta iniciarla, abrir http://127.0.0.1:5320/__preview/entrar y luego `/club`.

## Dirección

Beneficio prioritario al entrar, credencial compacta, cinco beneficios reconocibles, sellos vinculados a visitas reales y experiencias con jerarquía editorial. La cuenta gratuita sitúa los sellos antes de la oferta de membresía. La renovación pendiente conserva una explicación y acción explícitas.

Las referencias del usuario orientan la relación entre imagen, información y acción; no acreditan animaciones, que se diseñan y verifican para esta aplicación. Las fuentes visuales y su lectura están en `../investigacion-diseno-2026-10-21/`.

## Fotografía

No hay fotografía verificada del café filtrado ni del envase de 250 g en los recursos disponibles. Se reutiliza la escena de una persona tomando café junto a la ventana, identificada como ambiente, y se presenta la bolsa mediante tipografía. No se inventan envases ni fotos de experiencias.

## Alcance y conservación

Solo diseño y comportamiento de presentación de Mi Club. Se mantienen códigos, confirmación de entrega por el personal, cuotas, vigencia, renovación, contratos actuales y anteriores, consentimiento de pago, recuperación de operaciones y referencias de compra.

`antes/` conserva los archivos anteriores y la compilación completa; las capturas de 390 y 1440 px permiten comparar con el resultado. La vista previa de comparación permanece en `http://127.0.0.1:5310/club`.

No se publican cambios ni se usan cuentas o movimientos reales. La revisión se realiza con Worker/PGlite y datos sintéticos, con servicios externos bloqueados.

## Archivos

- Aplicación: `src/casa/pantallas/Club.tsx` y `src/casa/pantallas/ClubExperiencia.css`.
- Prueba nueva: `tests/mi-club-hoy-ui.mjs`.
- Copia final de esos tres archivos y sus SHA-256: `final/`. Compilación usada por la vista previa: `compilacion/` (entrada `principal-WGvFKpDP.js`, pantalla `Club-B7vMDbkJ.js`).
- Referencia anterior: `antes/`. No se cambian dependencias ni servicios del servidor.

## Verificación

`npm run build` pasó (`build-r3.log`). Nueve grupos focales pasaron en Edge (`pruebas-r2/resultados.json`), incluyendo 320, 390, 768 y 1440 px con texto normal y 200 %, nombre largo, foco, estados de membresía, códigos, enlaces directos y animación de sellos.

La revisión independiente R1 detectó tres defectos de legibilidad al 200 % aunque las primeras pruebas habían pasado. R2 corrige el peso 250 g partido, la colisión de taza/número y el saldo fragmentado. La prueba ahora mide los glifos de las cifras y la separación de iconos; las capturas focales y completas están en `pruebas-r2/`. Las capturas de página completa pueden mostrar la navegación fija en su posición de viewport; no significa que esté insertada en medio del contenido al desplazarse.

Los 24 casos transaccionales previos al último ajuste tipográfico pasaron en Edge, Firefox y WebKit (`transacciones.log`, ocho por navegador). Después solo cambiaron CSS y el reparto visual del saldo en dos spans; se conservan el formateador y todos los valores. El bloque completo de diálogos y operaciones desde `<Hoja abierta=` se verificó idéntico al original.

El movimiento de estampado solo ocurre cuando la lectura confirma un sello nuevo en la misma tanda; no celebra carga inicial, reentrada, actualizaciones idénticas ni reinicios. La preferencia de movimiento reducido elimina esos efectos. Las pruebas automáticas de accesibilidad incluidas no equivalen a una auditoría completa con tecnologías de asistencia o dispositivos físicos.

Los tres dictámenes independientes de uso, marca y composición aprobaron las tres piezas en la segunda ronda: `REVISION-USO.md`, `REVISION-MARCA.md` y `REVISION-COMPOSICION.md`; `PROGRESO.md` conserva ambas rondas. Se documenta un salto de palabra secundario en el título de una experiencia a 320 px/200 %, sin pérdida de caracteres ni controles.

## Volver a abrir la vista

Desde la carpeta de la aplicación:

```powershell
node scripts/vista-previa-diseno.mjs --port 5320 --dist entregables/mi-club-hoy-2026-10-22/compilacion --equipo
```

La vista actual ya está iniciada. No ejecutar otra instancia en el mismo puerto. Esta entrega no publica en producción.
