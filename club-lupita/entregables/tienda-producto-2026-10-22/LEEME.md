# Tienda · Producto protagonista

Aplicación local de la opción 1 elegida el 22 de octubre de 2026.

## Ver el resultado

- Vista nueva: http://127.0.0.1:5300/tienda
- Entrada al entorno de prueba, si falta sesión: http://127.0.0.1:5300/__preview/entrar (después, seleccionar Tienda).
- Versión anterior preservada: http://127.0.0.1:5301/__preview/entrar (después, seleccionar Tienda).
- Captura de la pantalla abierta al entregar: `vista-abierta.png`.

Los servidores usan datos sintéticos y bloquean las operaciones externas. Esta entrega no se publicó en producción. Se preservaron los cambios locales anteriores de la aplicación.

## Cambios

La fotografía y la ficha forman un bloque: nombre, frase breve, peso, precio y acción. Las secciones «Sobre el café», «Retiro y condiciones» y «Regalos y café para oficina» se despliegan a pedido; la membresía ocupa una fila secundaria.

Una oferta incompleta presenta un aviso y «Consultar este lote», sin filas repetidas de datos pendientes ni cobro habilitado. La oferta completa mantiene modalidad, retiro confirmado, consentimiento y condiciones antes de pagar. Se conservan compra, recuperación de resultados inciertos, recarga y beneficio mensual.

La foto publicada en la ficha tiene prioridad. Al no disponer de una foto verificada de la bolsa de 250 g, se usa la fotografía existente de café servido, rotulada «Café servido en la casa · imagen de ambiente». No representa el envase. Si falla la imagen de producto, se recupera esta imagen contextual; si también falla, se muestra una composición tipográfica.

## Archivos de aplicación modificados

- `src/casa/pantallas/Tienda.tsx`
- `src/casa/pantallas/TiendaExperiencia.css`
- `src/casa/componentes/CondicionesTienda.tsx`

Pruebas: nuevo `tests/tienda-producto-ui.mjs` y adaptación de `tests/tienda-ui.mjs` al contenido desplegable. La prueba existente ahora espera el cierre efectivo de un intento antes de comenzar el siguiente escenario.

## Verificación

- Compilación final correcta: `principal-CxOhDyaZ.js`, `Tienda-BIQ9D-kA.js` (`build-final.log`).
- Servidor: 9 grupos aprobados, con datos aislados (`servidor.log`).
- Compra en interfaz: 9 grupos aprobados, incluidos respuesta perdida, cambio de precio, recarga y beneficio; comprobaciones en Edge, Firefox y WebKit (`compra-final.log`). Esta suite precede al último ajuste, limitado a la distribución CSS del resumen de encargos.
- Composición final: 6 grupos aprobados y 12 estados registrados; anchos de 320, 390, 768, 913 y 1440 px, teclado, texto al 200%, movimiento reducido, prioridad y recuperación de foto, condiciones y axe (`pruebas-final/resultados.json`). Sin errores JavaScript registrados.
- Corregida una colisión de etiquetas y valores en el encargo al ampliar el texto. El resumen se apila en móvil; la prueba final comprueba que los textos no se superponen.
- Revisión independiente de uso, composición y marca: consultar sus informes `REVISION-*.md` y el cierre de `PROGRESO.md`.

Las capturas de página completa pueden representar la navegación fija sobre contenido que todavía está fuera de la ventana. Para juzgar accesibilidad al 200%, usar también `texto200-viewport-inicial.png`, `texto200-viewport-titulo.png` y `texto200-viewport-accion.png`, que muestran ventanas reales durante el recorrido.

## Reproducir

Desde `club-lupita`:

```powershell
npm run build
node tests/tienda.mjs
node tests/tienda-ui.mjs
node tests/tienda-producto-ui.mjs
```

La compilación de esta entrega permanece en `compilacion/`; las fuentes y compilación anteriores, en `antes/`. Para volver a abrir su vista previa si el proceso se cerró:

```powershell
node scripts/vista-previa-diseno.mjs --port 5300 --dist entregables/tienda-producto-2026-10-22/compilacion --equipo
```

`manifiesto.json` identifica mediante SHA-256 las fuentes, pruebas y archivos de la compilación conservada.
