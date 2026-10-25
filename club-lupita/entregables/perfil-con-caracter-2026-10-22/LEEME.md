# Perfil con carácter

Rediseño solicitado el 22 de octubre de 2026 tras considerar demasiado sobria la versión anterior. La dirección se centra en cumpleaños, preferencias y una composición más visual.

## Piezas

- Cumpleaños como tarjeta de celebración: día y mes con jerarquía, ilustración decorativa y edición de la fecha existente. Estado sin fecha explícito; sin inventar recompensas ni años.
- Bebida con fotografía ambiental de la casa y tipografía protagonista. La fotografía no es una ficha de producto ni intenta reproducir el texto libre de la preferencia.
- Alergias con bloque propio, valor guardado y acción visible. Se conserva la confirmación necesaria con el equipo antes de pedir.
- Cabecera, cuenta y ayuda coordinadas con la nueva composición. Editor por campo, borradores, validaciones, consentimientos e historial existentes.

Marca: `design-system.md`. Criterios: `bar.md`. Iteraciones y revisión independiente: `PROGRESO.md`.

## Ilustración

El recurso de cumpleaños se generó con image_gen integrado. `IMAGEN.md` conserva el prompt, la procedencia y las rutas finales. PNG original conservado y versiones WebP con alfa de 480 px (32 KB) y 240 px (12 KB) para la app.

## Entorno

Trabajo local con datos sintéticos y red externa bloqueada en la vista previa. No modifica backend, reglas comerciales o datos reales; no publica en producción. La entrega anterior permanece en localhost:5330/perfil.

Vista final: http://127.0.0.1:5340/perfil. Si la sesión sintética vence, entrar por http://127.0.0.1:5340/__preview/entrar y abrir Perfil. Captura del navegador abierta para el usuario: `perfil-final-abierto.png`.

## Cambios finales

La foto secundaria de la cabecera se retiró: el nombre tiene más espacio y la fotografía se concentra en la bebida. Una preferencia de más de 48 caracteres se presenta con menor escala y todo el ancho; su foto pasa debajo. Datos y ayuda se distribuyen por espacio disponible para conservar teléfonos y textos íntegros. La indicación inicial del selector Motivo se simplificó a «Elegí…».

Archivos de implementación: `src/casa/pantallas/Perfil.tsx`, `PerfilExperiencia.css`, una modificación de texto en `src/casa/componentes/Atencion.tsx` y dos imágenes WebP. La prueba `tests/perfil-a-tu-manera-ui.mjs` incorpora los estados y comportamientos nuevos. Fuentes preservadas en `fuentes/`, huellas en `SHA256.csv` y compilación en `compilacion/`.

## Verificación final

- Build completo con guardianes, TypeScript y Vite aprobado. Recurso final `Perfil-IyyJ3Uz0.js`.
- Diez grupos de la suite específica aprobados en Edge Chromium sobre Worker/PGlite efímero: guardado, borradores, validación, consentimiento, historial, ayuda y continuidad con Mi Club. Incluye borrar cumpleaños y 29 de febrero.
- Matriz de 24 combinaciones: tres pestañas, cuatro anchos (320, 390, 768, 1440), texto normal y ampliado al 200 %. Se verifican palabras, cifras y teléfono íntegros, imágenes cargadas e indicación de selector sin recorte.
- Nueve informes axe sin violaciones detectadas. No equivalen a certificación de accesibilidad.
- Transición de pestañas y respuesta de las dos tarjetas al puntero medidas por fotogramas; con movimiento reducido no quedan animaciones activas. El comportamiento no se deduce de las capturas estáticas.
- Regresión existente de diez grupos aprobada en Firefox sobre R1. R2 conserva esa lógica y cambia distribución, escala y un texto de ayuda; la suite completa específica sí se ejecutó de nuevo sobre R2. No se volvió a ejecutar WebKit; no se declara verificado Safari real.
- Evidencias finales: `pruebas-r2/resultados.json`, `pruebas-r2.log`, 83 capturas y `regresion-firefox.log`. La captura adicional de teléfono a 768/200 % conserva la navegación y desplaza el bloque al centro, evitando que la navegación fija lo oculte en la imagen completa. Reproducción: `captura-acceso.mjs`.

Las rondas y los defectos iniciales quedan registrados en `PROGRESO.md` y en los tres informes independientes. La revisión se limita a navegadores de escritorio, emulación de tamaños y texto ampliado; no a dispositivos físicos.

## Reabrir

Desde la raíz de club-lupita:

```powershell
node scripts/vista-previa-diseno.mjs --port 5340 --dist entregables/perfil-con-caracter-2026-10-22/compilacion --equipo --experiencia
```
