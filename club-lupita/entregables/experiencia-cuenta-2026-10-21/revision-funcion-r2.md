# Revisión funcional independiente · ronda 2

Fecha: 21 de octubre de 2026, Managua. Revalidación de F1 y F2 de la ronda 1 sobre **principal-DTOZgFsC.js**. Vista propia reiniciada en http://127.0.0.1:5298; /__preview/status confirmó compilación, PGlite en memoria, credenciales sintéticas y red externa bloqueada. Navegador Edge; revisión desde interfaz y respuestas de red, sin leer la implementación del producto.

| Pieza | Veredicto | Alcance |
| --- | --- | --- |
| Tienda | **PASS** | Se conserva el dictamen de ronda 1; no se repitió la compra en esta revalidación. |
| Mi Club | **PASS** | F1 corregido: el enlace de movimientos cumple su destino y enfoca la cuenta. Los demás recorridos mantienen la evidencia de ronda 1. |
| Perfil | **PASS** | F2 corregido: recuperación local, error repetido y datos anteriores identificados correctamente. |

## F1 cerrado

Desde Mi Club se enfocó «Ver movimientos» y se activó con Enter. Resultado: URL /perfil#perfil-cuenta; pestaña «Tu cuenta» seleccionada; foco en el encabezado #perfil-cuenta, «Tu próxima pausa empieza aquí.»; saldo y últimos movimientos visibles. El usuario llega al contenido anunciado.

Evidencia: evidencia-funcion/r2/movimientos-corregido.png y resultados.json, sección linkResult.

## F2 cerrado

Se forzó /api/yo → 503 y se recargó directamente el panel de cuenta. La interfaz muestra un aviso de error accesible y el botón «Actualizar cuenta». Se activó el reintento con Enter manteniendo el 503: volvió a quedar disponible y el panel mantuvo «Tu cuenta».

Al retirar el 503 y pulsar «Actualizar cuenta», recuperó C$ 9,900 y los dos movimientos sintéticos. Hubo una nueva petición al resumen y **cero navegaciones/recargas** durante la recuperación. URL y pestaña permanecieron.

Después se volvió a forzar 503 sobre una cuenta ya cargada. Conservó saldo y movimientos junto con el aviso «No pudimos actualizar la cuenta. El saldo y los movimientos corresponden a la última consulta disponible.» Al recuperar el servicio, desapareció el aviso. El botón se deshabilita durante la petición; Tab después de terminar continúa en «Ver toda mi actividad», sin saltar al inicio de la página.

Evidencia: evidencia-funcion/r2/cuenta-error-reintento.png, cuenta-recuperada.png, cuenta-ultima-lectura.png y resultados.json. También se capturó el control nuevo a 913 px con gutter y 320 px con texto al 200%; permanece visible y accionable.

## Límites de esta revalidación

No se repitieron pase, código, premio ni cobro; su evidencia de ronda 1 sigue separada. No hubo errores JavaScript en los recorridos de esta ronda.

El coordinador confirmó que el harness de vista previa redirige los documentos sin cookie a /__preview/entrar y vuelve a iniciar la sesión sintética. Por ello, la reaparición de Lucía tras recargar en la prueba de salida de ronda 1 es un límite de la fixture, no evidencia de una vulnerabilidad del producto. La revocación real corresponde a las pruebas TLS aisladas de Perfil; el coordinador informó que pasaron en los tres motores en R2. Este crítico no infiere de la vista previa el comportamiento de seguridad de producción.
