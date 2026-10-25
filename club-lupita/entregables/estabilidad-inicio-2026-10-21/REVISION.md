# Revisión independiente de la corrección de carga

Fecha: 2026-10-21. Compilación local en `http://127.0.0.1:5190/__preview/entrar`. Resultado: **APROBADO para la corrección de estabilidad de carga de Inicio.** No se hallaron fallos reproducibles introducidos por el cambio. Este resultado no aprueba nuevos cambios de composición ni su extensión a otras pantallas.

No se modificó código de la aplicación, no se ejecutó build ni se contactó red externa durante esta revisión. Se leyó la implementación y se inspeccionaron el navegador, las transiciones y capturas. El baseline permanece intacto en `mediciones-baseline.json`.

## Resultado medido

Se repitieron los mismos 11 escenarios con el mismo script, latencias, tamaños y cálculo de CLS por ventanas. La captura se amplió para registrar `aria-busy`, etiqueta, estado disabled y geometría del encabezado/botón; no se cambió el estímulo de los escenarios. Resultado completo en `mediciones-despues.json` y comparación en `comparacion-final.json`.

| Escenario | Desplazamiento antes → después | CLS después |
|---|---:|---:|
| Frío, cuenta primero | 50 → **0 px** | 0.000525 |
| Frío, catálogo primero | 9.047 → **0 px** | 0.000440 |
| Catálogo lento | 80 → **0 px** | **0** |
| Cuenta lenta, perfil rápido | 80 → **0 px** | **0** |
| Cuenta y perfil lentos | 80 → **0 px** | **0** |
| Actualización automática escalonada | 80 → **0 px** | **0** |
| Actualizar por clic | 80 → **0 px** | **0** |
| Error de catálogo y recuperación | 186 → 186 px | 0.123395 |
| Error de cuenta y recuperación | 168 → 168 px | 0.204803 |
| Actualización a 320 × 568 | 76 → **0 px** | **0** |
| Actualización a 1440 × 900 | 84 → **0 px** | **0** |

Los siete escenarios calientes sin error tienen cero también en la suma de **todas** las entradas `layout-shift`, incluidas las excluidas por interacción reciente. La mejora no depende de esa exclusión del CLS. La cuenta, el detalle, el seguimiento, la invitación, el encabezado y el botón mantienen su geometría durante la actualización normal.

En **los 11 casos**, las coordenadas finales `y`, alto y ancho de todos los bloques compartidos con el baseline coinciden exactamente: resumen, alertas, cuenta, detalle, seguimiento, invitación, accesos y fidelidad. No hay hueco permanente ni cambio del estado final.

Los dos casos de error mantienen el crecimiento útil para mostrar el mensaje y sus acciones. El CLS de catálogo no bajó en esa secuencia —antes 0.102941; después 0.123395—, mientras su desplazamiento máximo permaneció igual. El objetivo aprobado es quitar las inserciones transitorias de la actualización normal; no se oculta ni recorta un error para conseguir cero en todas las situaciones.

## Estado real y errores: 8 comprobaciones adicionales aprobadas

`revision-independiente.mjs` retuvo las respuestas hasta liberarlas explícitamente, en vez de limitarse a observar un momento temprano de la carga. Evidencia: `revision-funcional-despues.json`.

- **Cuenta pendiente con perfil terminado:** “En curso…” visible, botón disabled y `aria-busy=true`, anuncio “Actualizando los datos de Inicio…”, saldo y fecha anterior conservados, geometría estable. La señal permanece hasta que se libera `/api/yo`.
- **Catálogo pendiente:** la misma señal permanece aunque cuenta y perfil ya hayan terminado.
- **Cupos pendientes:** el control sigue ocupado mientras sólo falta `/api/cupos`.
- **Contexto pendiente:** el control sigue ocupado mientras sólo falta `/api/inicio/contexto`.
- **Error de cuenta con dato previo:** se conserva saldo y fecha de la última respuesta válida. Durante el reintento retenido el error sigue visible y el control central indica trabajo. Sólo el éxito retira el error y actualiza la fecha.
- **Error de catálogo:** conserva el aviso de información anterior, la fecha y el error durante el reintento retenido. El éxito restaura el estado normal.
- **Aislamiento de estilos:** al navegar a Carta desaparece `.inicio-redisenado`, el body vuelve a Work Sans y no hay desbordamiento.
- **Error inicial sin `yo`:** se muestra “No pudimos abrir tu cuenta” y “Probar de nuevo”, sin saldo inventado. El estado conserva Montserrat, no desborda y se recupera al permitir la respuesta válida.

No hubo excepciones JavaScript ni solicitudes externas en las ejecuciones completadas. Se inspeccionaron las capturas `pendiente-cuenta-despues.png`, `error-cuenta-reintento-pendiente-despues.png` y `error-inicial-despues.png`: el estado normal de trabajo es visible, el aviso de error conserva texto/acciones y la pantalla inicial de error se puede recuperar.

## Revisión de implementación

La implementación corresponde al alcance propuesto:

- `datos.tsx` expone `cuentaCargando: cuenta.cargando` de forma independiente. La lógica compartida de apertura basada en `cargando` permanece igual.
- `Inicio.tsx` reúne cuenta, catálogo, cupos y contexto en `actualizando`, evita montar sus avisos normales antes del resumen y mantiene los componentes de error. La instancia de detalle conserva la última consulta y opta por `mostrarCarga={false}`.
- `EstadoCuenta` conserva `mostrarCarga=true` por defecto. Las hojas de pase/recarga y las otras pantallas no reciben esa opción; mantienen su comportamiento anterior.
- La etiqueta del botón ocupa la misma celda de grid en ambos estados, con reserva de ancho por los textos existentes. El spinner sólo se omite en `.inicio-redisenado .inicio-actualizar`; “En curso…” y el estado accesible permanecen. No se reserva una fila vacía ni se ocultan errores.
- La clase de Inicio también se aplica al estado sin `yo`, adelantando su estilo a esa fase; desaparece al cambiar de pantalla. Las medidas frías conservan un pequeño CLS residual, por lo que no se afirma cero absoluto en toda apertura.

## Incidencia de ejecución y alcance

El primer barrido posterior se interrumpió al abrir su séptimo contexto: no apareció la cuenta en 30 segundos, **antes de activar la latencia de ese caso**. Coincidió con otras suites sobre el mismo servidor y cuenta sintética; no se capturó causa suficiente para atribuirlo al cambio. Se preservó la captura parcial en `mediciones-despues-parcial-interrumpido.json`. Una apertura nueva devolvió 200 en las API y mostró la cuenta; la repetición completa en serie pasó los 11 escenarios. No se clasificó ese timeout aislado como fallo de la aplicación ni se ocultó en los resultados.

Esta revisión valida la estabilidad, la información de progreso y los caminos de error descritos. Las pruebas generales de regresión, guardianes y build corresponden al trabajo del agente principal y no se repitieron aquí.
