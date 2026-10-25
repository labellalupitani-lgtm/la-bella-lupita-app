# Correcciones de Cliente y superficie de Cocina

7 de octubre de 2026. Implementación local correspondiente a T03–T08 y la superficie de O-05. Este documento describe el código y la evidencia disponible; el cierre de integración y publicación corresponde al coordinador.

## Cambios

| Tarea | Comportamiento implementado | Archivos principales |
| --- | --- | --- |
| T03 / UI-01 | `casa` reutiliza el formateador monetario común. Conserva centavos y signo; los importes enteros conservan su presentación. | `src/casa/datos.tsx`, `src/lib/format.ts` reutilizado sin cambios |
| T04 / UI-02 | Error de pago dentro del diálogo con `role=alert`. Bloqueo de envío simultáneo y de cambios del carrito durante el envío. La referencia y las cantidades se conservan ante resultado incierto y después de recargar. Un reintento utiliza la misma referencia. | `src/casa/pantallas/Pedir.tsx`, `src/casa/pedido.tsx`, `src/casa/pantallas/DetalleCarta.tsx` |
| T05 / UI-03 | Cuenta con estados propios de carga, error y fecha de última lectura correcta. Si falla la actualización, se conserva la información con aviso explícito y acción de reintento, también dentro de la hoja del saldo. | `src/casa/datos.tsx`, `src/casa/componentes/EstadoDatos.tsx`, `src/casa/App.tsx`, `src/casa/pantallas/Inicio.tsx` |
| T06 / UI-04 | Catálogo y cupos se cargan y reintentan independientemente. Tienda, Club y Reservar muestran la recuperación del catálogo; Inicio y Club muestran fallos de cupos. Una zona seleccionada válida se conserva; si desaparece del catálogo se limpia la selección inválida. | `datos.tsx`, `EstadoDatos.tsx`, pantallas `Tienda.tsx`, `Club.tsx`, `Reservar.tsx`, `Inicio.tsx` |
| T07 / UI-05 | Ambos clientes HTTP comparten invalidación del token de cliente vigente. El cierre limpia los datos conservados y se propaga por `storage` a otras pestañas. Un 401 de una cuenta anterior no cierra la nueva. Personal conserva su política separada. | `src/casa/http.ts`, `src/casa/sesion-cliente.ts`, `src/casa/datos.tsx`, `src/casa/operacion.ts` |
| T08 | Límite de 20 segundos para recepción y lectura de cada respuesta, con limpieza del temporizador y soporte de cancelación. Generaciones/token evitan aplicar respuestas obsoletas. Errores de red, timeout, respuesta inválida, cancelación o 5xx al escribir conservan la condición de resultado incierto. | `http.ts`, `datos.tsx`, `Pedir.tsx` |
| O-05 | `total` y `precio` opcionales en el contrato operativo. Cocina no pinta precios, total ni motivo libre de cancelación, incluso si un servidor los enviara. | `src/casa/operacion.ts`, `src/casa/equipo/Pedidos.tsx` |

Las modificaciones del acceso de Personal pertenecen al chat coordinado que implementa cookies e invitaciones. Su integración de `TOKEN_PERSONAL='@equipo-cookie'` en `operacion.ts` se conserva; las pruebas de transporte comprueban envío de cookie/CSRF, ausencia de Bearer de cliente y separación del evento de caducidad. O-04 queda sujeto a ese contrato, sin sustituirlo por las antiguas claves de los fixtures.

## Pruebas y evidencia

- `tests/correcciones-cliente.mjs`: **16/16 aprobadas**, ejecutadas con el cliente compilado en memoria, transporte simulado y sin red, Worker, `dist` ni bundles compartidos. Incluye formato, 401 en ambos clientes, separación de cookies/CSRF del equipo, 403/500, respuestas retrasadas antes y durante la lectura del cuerpo, escrituras inciertas, timeout y cancelación. Evidencia en `evidencia/cliente-unitario.log` y `evidencia/cliente-unitario/resultados.json`.
- `tests/correcciones-cliente-ui.mjs`: 12 casos preparados. El coordinador ejecutó el primer ciclo con el Worker actual y base local: 11 aprobados y un fallo del dato de preparación de centavos (`tipo=ajuste` no admitido por el esquema). El coordinador corrige el fixture y ejecuta los ciclos definitivos. La suite comprueba además un cargo/pedido único después de perder una respuesta real y reintentar tras recargar, y cierre entre pestañas. Usar sus resultados finales para el cierre.
- `tests/accesibilidad-cliente-perfiles.mjs`: 16 casos preparados; comprobación de sintaxis aprobada, ejecución delegada al coordinador. Incluye teclado, foco y Escape; error y reintento accesibles; siete rutas con reflujo equivalente a 200 %; tres modales con texto al 200 %. Ejecuta axe mediante `page.evaluate`, sin desactivar CSP, y conserva los eventos `securitypolicyviolation`, capturas, árbol accesible y JSON. No certifica zoom nativo ni uso con lector de pantalla.

Las suites UI usan `tests/soporte-cliente-perfiles.mjs`, creado por el coordinador: Worker actual, SQL local y activos aislados. No dependen de autenticación del personal, ni vuelven a insertar el token mediante un script persistente al recargar después de un 401. Admiten `NAVEGADOR`, `TEST_OUTPUT_DIR` y `AUDIT_CASE_FILTER`. Ejecutarlas en serie por el soporte local compartido.

### Corrección tras el primer ciclo de accesibilidad

El ciclo Edge encontró que deshabilitar el botón de pago dejaba el foco en `body`. `Pedir.tsx` ahora enfoca el diálogo antes de deshabilitar el botón y el aviso cuando llega un error. Conserva montados los controles que abren el pedido para que el cierre nativo restaure el foco al origen. La comprobación de Escape y retorno no se relajó.

Se reconstruyó únicamente `.test-output/perfiles-dist` y se ejecutaron los casos afectados: **A03 y los tres A06, 4/4 aprobados**. Los A06 fallaban por leer el tamaño calculado antes de estabilizarse los estilos; ahora verifican el tamaño final, conservando la expectativa de 32 px. Evidencia: `logs/accesibilidad-cliente-enfocada.log` y `evidencia/accesibilidad-cliente-enfocada/`. Los otros doce casos habían aprobado en el ciclo previo del coordinador.

El coordinador informó 12/12 casos funcionales de WebKit con una excepción aislada del navegador relacionada con `/capacidades`. La suite funcional ahora registra caso, fase, stack y solicitudes API pendientes para determinar si sucede en el recorrido o en el cierre del contexto. Cualquier excepción sigue haciendo fallar la ejecución; no se excluye sin evidencia. Este punto queda pendiente del ciclo instrumentado del coordinador.

## Límites de la entrega de frontend

No se ejecutó publicación, se accedió a producción ni se enviaron mensajes a personas. Las respuestas controladas verifican fallos y recuperación del navegador; la suite UI que pierde una respuesta contrasta la idempotencia con registros reales de una base local. Las pruebas posteriores del coordinador y cualquier defecto nuevo encontrado deben incorporarse al informe de cierre.
