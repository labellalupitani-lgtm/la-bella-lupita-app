# Inicio: portada de café y cabecera compacta

21 de octubre de 2026. Cuarta propuesta, preparada a partir de «Una portada más visual, con menos texto y cabecera». Alcance: Inicio y su presentación de navegación. El usuario pidió seguir ajustándola con una foto a todo el ancho; este informe se conserva como histórico. La propuesta actual se documenta en [Inicio inmersivo](../inicio-inmersivo-2026-10-21/LEEME.md).

## Abrir y comparar

- [Cuarta propuesta conservada](http://127.0.0.1:5195/__preview/entrar).
- [Versión anterior](http://127.0.0.1:5194/__preview/entrar).

Los dos servidores son locales: datos sintéticos, PGlite en memoria y red exterior bloqueada. La banda superior identifica el entorno. No se realizaron operaciones sobre producción. Si se detienen, desde la raíz `club-lupita` ejecutar por separado `node scripts/vista-previa-diseno.mjs --port 5195 --dist entregables/inicio-inmersivo-2026-10-21/antes/dist` y `node scripts/vista-previa-diseno.mjs --port 5194 --dist entregables/inicio-portada-2026-10-21/antes/dist`.

## Cambio y evidencia

La foto existente de café con la marca ocupa la portada. Se conserva un titular de tres palabras y una acción «Explorar la carta». Se eliminan los accesos promocionales duplicados a Carta; su navegación global y los detalles de los tres platos siguen disponibles. Saludo y nivel acompañan ahora a la cuenta. El pase y la actualización permanecen arriba; pedidos, reservas y errores mantienen prioridad.

La firma original mide 100 px de ancho en móvil y 176 px en escritorio, sin reconstrucción ni deformación. La adaptación responde al pedido de compactar la cabecera, conservando la reserva H/4.

| Medición en estado normal | Anterior | Propuesta |
| --- | ---: | ---: |
| Inicio de foto, móvil 390 px | 250 px | 188 px |
| Alto de foto, móvil 390 px | 227 px | 359 px |
| Foto respecto al área de portada, móvil | 49.6% | 73.9% |
| Inicio de foto, escritorio 1440 px | 384 px | 231 px |
| Foto respecto al área de portada, escritorio | 60% | 68% |

Todas las posiciones incluyen el aviso de prueba. [Mediciones y 59 comprobaciones](evidencia/composicion-portada.json). Capturas comparables: [antes móvil](evidencia/antes-390-viewport.png), [después móvil](evidencia/despues-390-viewport.png), [antes escritorio](evidencia/antes-1440-viewport.png), [después escritorio](evidencia/despues-1440-viewport.png). Las imágenes completas están en la misma carpeta.

## Verificación

- `npm run build`: guardián, TypeScript y Vite aprobados.
- Composición: 59 comprobaciones aprobadas en 320, 390 y 1440 px, sin omisiones.
- [Aceptación](evidencia/aceptacion/aceptacion.json): 11 grupos aprobados; navegación, pase/recarga, saldo, seguimiento, recuperación, siete anchos, texto ampliado, movimiento reducido, tarjetas completas al recorrerlas con teclado y cero infracciones reportadas por axe en las vistas comprobadas.
- [Regresión](evidencia/regresion/resultados-ui.json): nueve grupos funcionales aprobados, incluida sesión, premio, errores y respuestas retrasadas.
- [Estabilidad](evidencia/estabilidad/estabilidad.json): siete escenarios aprobados; cuenta y catálogo escalonados en tres tamaños, errores recuperables y actualización de otros recursos. No se detectó desplazamiento mayor que la tolerancia de 1 px en los bloques medidos durante actualización normal.

Se adaptaron dos expectativas de pruebas a la composición: accesos duplicados retirados se sustituyen por la comprobación de Carta global; en escritorio se verifica cuenta en la primera columna y antes de fidelidad en el DOM, mientras en móvil se exige cuenta completa antes de sellos. No se alteraron contratos funcionales para obtener resultados favorables.

[Rendimiento local](evidencia/rendimiento.json), mediana de tres cargas por compilación final en Edge a 390 px: LCP 128→120 ms, recursos 609,639→545,634 bytes, solicitudes 35→34. Suma de desplazamientos de diseño sin entrada reciente 0.010242→0.000751. Esta última es una suma observada, no el cálculo de CLS por ventanas de sesión. Sin limitación de red/CPU: no se detectó deterioro en estas muestras, pero la diferencia de 8 ms no demuestra una mejora de velocidad ni describe producción. Las muestras individuales, con su variación de carga de fuentes y solicitudes, permanecen en el informe.

## Revisiones y pendientes

Tres revisiones independientes cerradas: [objetivo](REVISION-OBJETIVO.md) PASS en segunda ronda, [identidad](REVISION-IDENTIDAD.md) PASS y [acabado](REVISION-ACABADO.md) PASS con revalidación. El defecto encontrado fue el recorte de una tarjeta al navegar con teclado; se corrigieron el desplazamiento al foco y su reserva lateral. La trayectoria y las comprobaciones constan en [REGISTRO.md](REGISTRO.md).

En 320×568 la fotografía ocupa la primera pantalla y la acción «Explorar la carta» requiere desplazarse; el pase y la navegación global siguen a la vista. Este comportamiento corresponde a la prioridad fotográfica solicitada. El crítico de acabado registra como diferencia no bloqueante el encuadre de manos/plato más cerrado en escritorio frente al producto aislado de las referencias.

La validación técnica no sustituye la decisión visual del usuario. Próximo paso después de esa decisión: aplicar la dirección aprobada al sistema compartido y al resto del alcance registrado en [PLAN-100.md](../redisenio-2026-10-21/PLAN-100.md).

Fuentes anteriores y compilación preservadas en `antes/`; cambios actuales integrados en `src/casa/pantallas/Inicio.tsx`, `src/casa/estilos/redisenio-inicio.css` y el tamaño declarado del logo de Inicio en `src/casa/componentes/Navegacion.tsx`.
