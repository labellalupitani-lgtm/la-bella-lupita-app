# Inicio: fotografía de borde a borde

21 de octubre de 2026. Quinta propuesta, preparada a partir de «Una portada más inmersiva, con la foto a todo el ancho». Alcance: composición de Inicio. La extensión al resto de la aplicación requiere la validación visual del usuario prevista en su prompt.

## Abrir y comparar

- [Propuesta inmersiva](http://127.0.0.1:5190/__preview/entrar).
- [Cuarta composición, antes del ajuste](http://127.0.0.1:5195/__preview/entrar).

Ambos servidores son locales, con datos sintéticos, PGlite en memoria y llamadas salientes bloqueadas. No se publicó en producción. Desde la raíz `club-lupita`, pueden iniciarse por separado con `node scripts/vista-previa-diseno.mjs --port 5190 --dist dist` y `node scripts/vista-previa-diseno.mjs --port 5195 --dist entregables/inicio-inmersivo-2026-10-21/antes/dist`.

## Qué cambió

La fotografía existente ocupa toda la portada y llega a ambos bordes de la ventana. «Una pausa rica» y «Explorar la carta» se superponen a la foto: abajo en móvil y a la izquierda en escritorio. El encuadre y el fondo oscuro del texto se adaptan al espacio disponible. Los tres productos continúan inmediatamente después de la portada.

Se conserva la cabecera compacta, la firma original, el pase visible antes de la foto y la prioridad de pedidos, reservas y errores. También se conservan la cuenta, privacidad del saldo, sellos, recarga, actualización y navegación. Los cambios de este ciclo están integrados en `src/casa/pantallas/Inicio.tsx` y `src/casa/estilos/redisenio-inicio.css`.

| Estado normal | Cuarta composición | Quinta composición |
| --- | ---: | ---: |
| Foto, ancho a 390 px | 358 px | 390 px |
| Foto, alto a 390 px | 359 px | 499 px |
| Inicio de foto a 390 px | 188 px | 188 px |
| Foto respecto al área de portada a 390 px | 73.9 % | 100 % |
| Inicio de foto a 1440 px | 231 px | 231 px |
| Foto respecto al área de portada a 1440 px | 68.0 % | 100 % |

Las posiciones incluyen el aviso de prueba. [Mediciones completas](evidencia/composicion-inmersiva.json). Capturas comparables: [antes móvil](evidencia/antes-390-viewport.png), [después móvil](evidencia/despues-390-viewport.png), [antes escritorio](evidencia/antes-1440-viewport.png), [después escritorio](evidencia/despues-1440-viewport.png). También se guardaron capturas completas y de 320, 768 y 1024 px.

## Verificación

- `npm run build`: guardián, TypeScript y Vite aprobados.
- [Composición](evidencia/composicion-inmersiva.json): 133 comprobaciones aprobadas, ninguna omitida, cinco anchos entre 320 y 1440 px. Se mide la superficie pintada por la imagen, además de su caja; sin desbordamiento horizontal.
- [Aceptación](evidencia/aceptacion/aceptacion.json): 11 grupos aprobados. Incluye siete anchos, navegación, pase y retorno del foco, recarga, privacidad, prioridades, recuperación, texto al 200 %, movimiento reducido, carrusel con teclado y cero infracciones reportadas por axe en las vistas comprobadas.
- [Regresión](evidencia/regresion/resultados-ui.json): nueve grupos funcionales aprobados con datos sintéticos.
- [Estabilidad](evidencia/estabilidad/estabilidad.json): siete escenarios aprobados, incluidas respuestas escalonadas de cuenta y catálogo en tres tamaños y errores recuperables.

El test nuevo confundía inicialmente un aviso normal con seguimiento prioritario y omitía verificar la apertura. Se corrigió esa clasificación para exigir una acción real de pedido, reserva o recuperación, y se volvió a ejecutar: las comprobaciones de apertura pasan sin omisiones. No se cambió la interfaz para resolver ese defecto del test.

[Rendimiento local](evidencia/rendimiento.json), mediana de tres cargas por compilación en Edge a 390 px: LCP 132→136 ms; recursos 545,590→546,258 bytes; solicitudes 35→34. Suma de desplazamientos sin entrada reciente 0.010352→0.001288; no es CLS por ventanas de sesión. Son muestras sin limitación de red/CPU: no se observó un deterioro relevante en estas condiciones, pero la diferencia de 4 ms no permite afirmar una mejora o empeoramiento de velocidad en producción.

## Revisión y siguiente paso

Tres revisiones independientes cerradas con PASS: [objetivo y uso](REVISION-OBJETIVO.md), [identidad y contraste](REVISION-IDENTIDAD.md), y [acabado](REVISION-ACABADO.md). Su trayectoria y las correcciones se registran en [REGISTRO.md](REGISTRO.md). La primera implementación se corrigió para que el degradado acompañara al titular ampliado; las revisiones finales no encontraron fallos importantes pendientes.

El contraste se midió sobre los píxeles reales de la foto con su degradado. En 320/390/1440 px, con raíz al 100/200 %, el mínimo del titular es 4.70:1 y del CTA 6.43:1. La ampliación directa adicional de fuente en escritorio de 56 a 112 px también pasa, con 6.35:1 para el titular. El foco exterior permanece visible y supera 5.21:1 en los casos examinados. El informe incluye método, capturas y límites: estos valores no certifican otros textos, fotografías o recortes.

En pantallas pequeñas, o con texto ampliado, puede ser necesario desplazarse para ver la acción sobre la foto completa. El pase y la navegación global permanecen disponibles. La imagen es una foto cuadrada existente; el encuadre panorámico conserva la taza y la marca, con recorte de la parte inferior.

El usuario pidió seguir ajustando esta quinta propuesta y revisar profundamente las referencias originales. La [investigación posterior](../investigacion-diseno-2026-10-21/LEEME.md) prepara el siguiente ajuste de Inicio; esta versión no queda aprobada para extender el diseño. Se conserva el alcance de [PLAN-100.md](../redisenio-2026-10-21/PLAN-100.md). La aprobación técnica no autoriza producción ni acredita el rediseño integral.
