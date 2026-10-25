# Diagnóstico independiente de estabilidad de Inicio

Fecha: 2026-10-21. Sólo vista previa local `http://127.0.0.1:5190/__preview/entrar`, Edge/Chromium headless, datos sintéticos del servidor existente. No se modificó la aplicación, no se compiló, no se leyeron secretos y no se contactó red externa. Esta revisión técnica no aprueba extender el diseño a otras pantallas.

## Resultado

La causa principal comprobada son los mensajes de carga que se insertan y retiran antes de `.inicio-resumen`. Con fuentes ya cargadas, la actualización normal mueve el resumen **76 px en 320**, **80 px en 390** y **84 px en 1440**. Reservar un hueco permanente no es necesario: se puede reunir el progreso normal en el control de actualización que ya ocupa espacio y conservar los errores con su texto y acciones.

En 390 × 844 la secuencia medida es:

1. Reposo: resumen `y=261.15625`; alertas vacías y ocultas.
2. Cuenta y catálogo pendientes: `y=341.15625`; alertas de 60 px más el espacio entre filas.
3. Queda un recurso pendiente: `y=311.15625`; alerta de 30 px.
4. Éxito: vuelve a `y=261.15625`.

Además, el detalle bajo la cuenta crece de **18 a 44 px** por la segunda instancia de “Actualizando tu cuenta…” y vuelve a 18 px. Eso mueve el seguimiento y, en móvil, la invitación y el contenido inferior aunque se corrigiera únicamente el aviso superior.

## Evidencia y método

`medir-carga.mjs` intercepta todas las solicitudes en un contexto de navegador nuevo, aborta cualquier origen distinto al local y aplica latencia sólo a los endpoints indicados. Las respuestas satisfactorias son las reales del servidor local; los errores 503 son sintéticos y explícitos. Se registran fotogramas con geometría, textos de estado/error, saldo, estado del botón, solicitudes, fuentes y todas las entradas `layout-shift` con `hadRecentInput`.

La referencia íntegra está en `mediciones-baseline.json`. `mediciones.json` puede reutilizarse para la revisión posterior. Los dos PNG `error-*-y-reintento-error.png` documentan el error antes de reintentar. Las 11 ejecuciones terminaron sin excepciones JavaScript ni solicitudes a red externa.

Los casos calientes esperan las fuentes y una carga previa completa antes de medir. La revalidación automática se activa con el evento `online`, que utiliza el camino real de `DatosProvider`; no se alteran datos ni DOM de la aplicación. Un caso aparte pulsa el botón real.

El campo `cls` es el máximo de las ventanas de desplazamiento sin interacción reciente: ventana de hasta 5 s y separación de hasta 1 s. `noRecentShiftSum` conserva la suma de todas esas entradas; `allShiftSum` incluye las excluidas por interacción. **No son tres nombres del mismo indicador.** La posición de los elementos se mide independientemente del CLS.

| Caso | Latencia añadida | Rango vertical del resumen | CLS por ventanas |
|---|---|---:|---:|
| Apertura fría, cuenta primero | cuenta 600 ms; catálogo 1800 ms | 50 px | 0.0367 |
| Apertura fría, catálogo primero | cuenta 1800 ms; catálogo 600 ms | 9.047 px | 0.0130 |
| Catálogo lento | catálogo 1800 ms | 80 px | 0.1105 |
| Cuenta lenta, perfil rápido | cuenta 1800 ms | 80 px | 0.1433 |
| Cuenta y perfil lentos | ambos 1800 ms | 80 px | 0.0939 |
| Actualización automática escalonada | cuenta/perfil 1800 ms; catálogo 3000 ms | 80 px | 0.0738 |
| Mismo caso pulsando Actualizar Inicio | igual | 80 px | 0.0367 |
| Catálogo falla y se reintenta | 503 tras 1200 ms | 186 px | 0.1029 |
| Cuenta falla y se reintenta | 503 tras 1200 ms | 168 px | 0.2048 |
| Actualización escalonada a 320 × 568 | cuenta/perfil 1800 ms; catálogo 3000 ms | 76 px | 0.0712 |
| Actualización escalonada a 1440 × 900 | igual | 84 px | 0.0275 |

El caso por clic muestra por qué no basta un umbral de CLS: el desplazamiento visible sigue siendo 80 px y la suma de todas las entradas sigue en 0.1472, pero el salto inicial queda excluido por interacción reciente. Un test que sólo espere a que termine todo o mida sólo CLS puede dar una aprobación falsa.

## Causas comprobadas en el código

- `src/casa/pantallas/Inicio.tsx` renderiza `EstadoCuenta` y `EstadoCatalogo` antes del resumen, además de `EstadoCuenta detalle` debajo de la cuenta. Los tres insertan una línea de progreso mientras cargan.
- `src/casa/componentes/EstadoDatos.tsx` retorna `null` para los estados normales completados; durante carga crea un contenedor `my-3`. `.inicio-alertas:empty { display:none }` y el espacio entre filas hacen que el retiro del último mensaje produzca un movimiento adicional.
- El detalle de cuenta conserva la fecha de la última consulta, pero antepone la línea de progreso; la fecha útil por sí sola ya ocupa su espacio final.
- `DatosProvider` expone `cargando` como `preparando || (cuenta.cargando && perfil.cargando)`. Es un estado de apertura compartido, no una señal fiable de que `/api/yo` terminó. Con perfil rápido el indicador de cuenta y el botón dejan de cargar aproximadamente a 52 ms aunque `/api/yo` sigue pendiente hasta unos 1840 ms. **No conviene reutilizar ese booleano como única señal del progreso consolidado.**
- `DatosProvider` llama `refrescar()` al montar y `Inicio` llama `revalidar(true)` al montar. Las dos aperturas frías hicieron dos consultas a `/api/yo` y dos al catálogo; `useRecurso` encola la forzada detrás de la pendiente. Esto prolonga los estados, pero eliminarlo no resuelve las actualizaciones manuales/automáticas y toca una garantía de frescura. No lo incluiría en la corrección mínima de presentación.

## Corrección mínima recomendada

Reunir **sólo el progreso normal de Inicio** en el espacio que ocupa el botón “Actualizar Inicio”, con texto visible durante el trabajo, dimensión estable, `aria-busy` y anuncio de estado accesible. Debe seguir indicando actividad mientras esté pendiente cuenta, catálogo, cupos o contexto incluidos en esa actualización. Exponer el estado propio de cuenta para este propósito, conservando la lógica de apertura existente del proveedor.

En las instancias de estados de Inicio, permitir omitir la línea temporal de carga porque el progreso ya está informado en ese control. En el detalle de cuenta, conservar la fecha de la última consulta durante la actualización y renovarla sólo tras respuesta válida. Los errores deben continuar mostrando el motivo, la antigüedad del dato cuando exista y el reintento. El cambio debe ser optativo para Inicio: no alterar por defecto el comportamiento en otras pantallas ni en las hojas de pase/recarga.

No fijar altura al bloque de errores, no recortarlo, no posicionarlo fuera de flujo, no vaciarlo en el reintento y no sustituir la fecha por un éxito prematuro. Los errores reales pueden requerir más altura que el estado normal. Ese crecimiento es informativo; la aceptación no debe penalizarlo como si fuera la inserción innecesaria de una línea de carga. La composición final de éxito debe conservar exactamente el espacio actual.

## Prueba útil para aprobar la corrección

1. **Geometría durante todas las fases**, a 320/390/1440: fuentes cargadas, respuesta sin cambios, comparar reposo → ambos pendientes → sólo cuenta → sólo catálogo → éxito. Resumen, cuenta, detalle, seguimiento e invitación deben permanecer en su posición y tamaño final (tolerancia subpíxel de 1 px). Comprobar también el control de actualización; un cambio de texto no debe alterar la altura del encabezado. Registrar fotogramas, sin esperar a `networkidle` antes de empezar a medir.
2. **Progreso veraz**: retener cuenta mientras perfil termina, y luego retener catálogo mientras cuenta termina. En ambos momentos debe seguir existiendo estado visible/accesible de trabajo. La hora anterior permanece hasta el éxito. Medir el intervalo durante la solicitud, no sólo la presencia del estado inmediatamente después del clic. Retener cupos y contexto de forma independiente comprueba el resto del indicador consolidado.
3. **Mismo resultado por clic y por revalidación automática**: medir los deltas de posición y todas las entradas de desplazamiento, además del CLS estándar. Usar latencia mayor a 500 ms permite observar también la finalización fuera de la exclusión por interacción reciente.
4. **Errores y recuperación reales**: inyectar 503 de cuenta y catálogo por separado, con dato previo y en apertura sin dato. Verificar el texto, `role=alert`, fecha anterior, conservación del saldo previo, disponibilidad del reintento y desaparición del error sólo tras respuesta satisfactoria. Mantener el reintento pendiente confirma que el aviso no se borra anticipadamente. Añadir respuesta inválida o timeout valida el camino de error de transporte si se modifica esa parte; para una corrección estrictamente visual no hace falta revalidar toda la API.
5. **Ningún hueco final ni contenido oculto**: comparar las coordenadas finales y una captura contra el baseline, comprobar overflow en 320, y verificar que todos los avisos caben con texto al 200 %. Una reducción de CLS causada por eliminar un mensaje obligatorio debe fallar la prueba funcional.
6. **Carga fría aparte**: repetir la apertura con contexto nuevo y fuentes sin caché. El caso catálogo-primero dejó un cambio de 9.047 px relacionado con la carga de fuentes, y el archivo anterior de revisión también registra sustituciones tipográficas. Una corrección de estados no debe presentarse como solución completa de todas las causas de CLS. Mantener una medición fría aparte permite distinguir ese residuo sin cambiar la composición aprobable.

Este diagnóstico es la referencia previa al cambio. La verificación independiente posterior debe registrarse aparte o añadirse claramente como sección posterior, sin sobrescribir `mediciones-baseline.json`.
