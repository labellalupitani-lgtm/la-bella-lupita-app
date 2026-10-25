# Revalidación independiente — cuenta y sistema

21 de octubre de 2026. Árbitro `/root/revision_cuenta`, sin implementación de producto ni build. Resultado: **los cuatro hallazgos de la ronda inicial están corregidos; no quedan fallos críticos o importantes detectados en este alcance**.

## Versión examinada

Preview exclusiva `http://127.0.0.1:5275`, asset verificado `/assets/principal-D7uKApT5.js`. Backend sintético PGlite, bloqueo de tráfico externo y banner de prueba. No se accedió a producción ni se enviaron correos reales.

La evidencia inicial permanece en `evidencia/arbitro-cuenta/`; la final en `evidencia/arbitro-cuenta-final/`. El informe inicial es `revision-cuenta.md`.

## Hallazgos revalidados

| Hallazgo | Comprobación final | Resultado |
|---|---|---|
| CU-01: desborde de Perfil |320px, texto200: viewport/client/scrollWidth320. El título parte la palabra larga. Editor en emulación móvil320×700 ocupa x0–320,y24–700 | Corregido |
| CU-02: textarea tapado |Tab natural desde el principio de Perfil320×844,texto200. Campo y531.6–661.6; navegación inferior comienza685.4: quedan23.8px libres | Corregido |
| CU-03: error de lectura persistente |GET `/api/atencion`503; restaurar respuesta; Actualizar avisos elimina alerta. POST422 seguido de Actualizar avisos conserva su error y el borrador completo | Corregido sin ocultar error de envío |
| CU-04: singular de sellos |Cuenta sintética8/9 muestra «Te falta 1 sello.» | Corregido |

También se comprobó que Ayuda sin avisos ni solicitudes presenta un estado vacío explícito. La variante «1 premio pendiente» se verificó en código; la fixture usada tiene0premios pendientes y no se alteró para esa variante.

## Pruebas finales ejecutadas

- Matriz responsive de Inicio, Mi Club, Conocé tu club, Perfil, Kit, ruta desconocida y Umbral/acceso:320,390,768,1440px,28 combinaciones. Sin desbordes horizontales ni imágenes rotas.
- Las siete vistas con texto200% a320px: sin desbordes; axe sin violaciones A/AA detectadas. No equivale a certificación completa de accesibilidad.
- Recorrido Tab de42 pasos en las seis páginas autenticadas/sistema, con foco visible. Tras excluir los propios enlaces de la navegación fija de la detección de superposición, no aparecen controles tapados. El textarea se revalidó además con aserciones y captura específica.
- Editor en emulación móvil320×700 con texto200, dentro del viewport.
- Ayuda: lectura503 y recuperación, envío422 conservado al refrescar lecturas, borrador conservado y vacío explícito.
- Inicio: ocultar/mostrar saldo y persistencia tras recargar; apertura/cierre de pase y recarga informativa.
- Conocé tu club: error503 de condiciones, recuperación sin alerta y cinco beneficios cargados.
- Perfil: lectura demorada muestra «Cargando tu perfil…»,503 muestra alerta y «Volver a intentar» recupera el editor.
- Sin errores JavaScript en la matriz final.

Scripts terminados con código0: `auditar-cuenta.mjs` con `PREVIEW_URL=5275` y directorio final; `revalidar-cuenta.mjs`; `auditar-cuenta-inicio.mjs` con esas mismas variables. Resultados guardados en `resultados.json`, `revalidacion.json`, `inicio.json` dentro del directorio final.

## Evidencia comparable

| Caso | Antes | Después |
|---|---|---|
| Perfil texto200 |`evidencia/arbitro-cuenta/perfil-texto200.png` |`evidencia/arbitro-cuenta-final/perfil-texto200.png`; detalle `perfil-titulo-texto200.png` |
| Foco en ayuda |`evidencia/arbitro-cuenta/ayuda-tab-natural.png` |`evidencia/arbitro-cuenta-final/ayuda-tab-natural.png` |
| Singular Club |`evidencia/arbitro-cuenta/club-390.png` |`evidencia/arbitro-cuenta-final/club-390.png`; detalle `club-singular.png` |
| Editor móvil |Inspección DevTools de la ronda inicial; el archivo inicial `editor-texto200.png` es desktop |`evidencia/arbitro-cuenta-final/editor-mobile-texto200.png` |

Las capturas completas390/1440 de las siete vistas se conservaron con los mismos nombres en ambos directorios. Los datos sintéticos de la primera ronda incluyen las operaciones de prueba; por eso algunas cifras/nombres difieren aunque el diseño se compara con la misma resolución.

## Alcance y límites por página

| Página | Ronda final | Cobertura funcional complementaria de ronda inicial / límites |
|---|---|---|
| Inicio |Responsive,texto200,teclado,privacidad,pase,recarga |No se ejecuta operación física de caja |
| Mi Club |Responsive,texto200,teclado,singular |Ronda inicial: código de beneficio, renovar/cancelar, consentimiento y compra sintética de experiencia, catálogo vacío. No se repitieron esos cargos en la versión final; no se certifican cron ni entrega física |
| Conocé tu club |Responsive,texto200,teclado,error/reintento de condiciones |Ronda inicial: seis FAQ con Enter. Sin cambios de reglas comerciales |
| Perfil |Responsive,texto200,editor móvil,foco,ayuda GET/POST,lectura de perfil |Ronda inicial: editar/guardar, actividad normal/vacía/error/reintento, envío exitoso y cerrar sesión. No se repiten conflictos multiusuario ni todas las sesiones reales |
| Umbral/acceso |Responsive,texto200,axe,estado deshabilitado |Ronda inicial: capacidades503/reintento, código inválido y alta con mocks. Sin correo real ni autenticación de proveedor externo |
| Kit |Responsive,texto200,teclado,axe,galería visual |Los controles demostrativos no se certifican como operaciones comerciales |
| Desconocida |Responsive,texto200,teclado,axe |Ronda inicial: retorno a Inicio. No prueba rutasAPI |

Revisado con Edge/Chromium; no se repitieron Safari/WebKit, Firefox, lector de pantalla ni dispositivo físico en esta ronda. La aprobación técnica es para el alcance y la build indicados; no reemplaza la aprobación visual del usuario ni autoriza publicar.
