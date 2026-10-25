# Continuidad · Carta · 21 de octubre de 2026

## Decisiones aprobadas

El usuario confirmó: «Mejorar la versión actual conservando la dirección aprobada». Se retoman la identidad y los componentes existentes, documentados en `../extension-aprobada-2026-10-21/REGISTRO.md`. La publicación anterior registrada no autoriza publicar este ciclo. No se hizo ningún despliegue.

## Alcance implementado

- Búsqueda de Carta: las áreas de la composición se definen juntas, tanto en exploración como al buscar. Se eliminó el conflicto de CSS que podía crear columnas implícitas y comprimir los resultados.
- Buscador con etiqueta permanente y botón Borrar; limpiar conserva la categoría elegida, retira la consulta de la URL y devuelve el foco al campo.
- Cierre de ficha: vuelve al producto de origen si existe. Después de recargar una ficha, espera la restauración del historial y muestra el buscador de respaldo dentro de pantalla.
- La disponibilidad deja de mostrarse como una consulta interminable cuando falla la API; se indica que no está confirmada y se conserva el reintento existente.
- Las categorías enfocadas se muestran completas al recorrerlas con teclado, incluso al ampliar el texto; salir del estado vacío también devuelve el foco al buscador.
- Prueba de regresión específica en `tests/carta-exploracion-ui.mjs`, sobre Vite y sobre el build. Mide ancho útil de resultados además de overflow, porque un documento estrecho también puede ser ilegible.

Los cambios viven en `src/casa/pantallas/Pedir.tsx`, `DetalleCarta.tsx`, `Carta.css` y `src/casa/estilos/redisenio-comercio.css`. Fuentes anteriores preservadas en `antes/`. Esta carpeta no es un repositorio Git; no se presenta un commit inexistente.

## Entorno y evidencias

Preview compilada en `http://127.0.0.1:5262`, Worker real con PGlite en memoria, cuentas sintéticas y red externa bloqueada. Preview Vite independiente en el puerto 5261. Las pruebas transaccionales crean su propia base temporal.

- Build, TypeScript y guardianes: PASS, `evidencia/build.log`.
- Exploración: ocho grupos PASS en Vite y ocho en build, `evidencia/exploracion-vite/resultados.json` y `evidencia/exploracion-build/resultados.json`.
- Carta existente: catorce grupos PASS en la compilación final, `evidencia/regresion-carta.log`.
- Anchos 320, 390, 768, 1024 y 1440; texto al 200 % a 320/390; teclado, cierre con Escape, recarga, historial, filtros, borrado, vacío y fallo/recuperación de API.
- Axe: cero hallazgos con reglas WCAG A/AA ejecutadas a 390, 768 y 1440. Cero errores JavaScript y solicitudes externas en el recorrido de exploración.

## Rondas

1. Árbitro inicial: dos defectos importantes reproducidos, compresión de búsqueda y foco fuera de pantalla. Informe `revision-inicial.md`.
2. Construcción: se corrigieron ambos. La primera prueba del foco reveló que la restauración nativa del historial deshacía el desplazamiento; se ajustó la secuencia y pasó la repetición. Una prueba nueva suponía erróneamente barra móvil en Reserva; se corrigió el recorrido de prueba a destinos que sí tienen esa navegación, sin cambiar Reserva.
3. Revalidación independiente: confirmó ambos arreglos y detectó el último filtro parcialmente recortado a 320 px/texto200. Se corrigieron el desplazamiento y el margen horizontal, con regresión de Tab/Shift+Tab. Se atendió también la observación menor sobre el foco al salir del vacío.
4. Revalidación final del árbitro: PASS en `principal-Bhouru2Z.js`. R1/R2/R3 corregidos; ida/vuelta por categorías y salida del vacío revalidadas en navegador. Sin hallazgos críticos o importantes pendientes dentro del alcance. Resultado y límites en `revision-final.md`.

## Coste y límites

Frente al log de la compilación anteriormente publicada, los CSS de Carta/comercio y el módulo Carta suman aproximadamente **0,43 kB gzip adicionales** (redondeo del informe Vite). No se añaden imágenes, fuentes ni dependencias. No se ejecutó una comparación de velocidad en red real; no se afirma una mejora de rendimiento general. Compilación de cierre: `principal-Bhouru2Z.js`, Carta `Pedir-UC0MhFmR.js`.

Las capturas antes/después comparan la preview Vite con idéntico viewport y búsqueda. El fallo de la base se reprodujo allí; no se afirma haberlo reproducido en producción. El build final se verificó aparte. Sin pruebas en teléfonos físicos o lector de pantalla real. No se recertifica toda la administración en este ciclo acotado.

## Pendientes

- Validación del usuario de esta mejora en la preview; producción requiere aprobación explícita.
- Siguiente ciclo recomendado: revisar la consulta pública de productos y el paso al ingreso desde el detalle, con tareas reales del equipo y clientes.
- Mantener la dirección aprobada. No extender cambios puramente cosméticos sin una necesidad comprobada.
