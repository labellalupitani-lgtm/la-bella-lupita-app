# Revisión complementaria del frontend por perfil

Fecha: 7 de octubre de 2026, America/Managua.

Alcance: revisión de la aplicación activa `src/casa`, sus formularios, diálogos, navegación, gestión de sesión, consultas y componentes compartidos, seguida de reproducción automatizada ejecutada por el coordinador. Se contrastó la recarga con su contrato en el worker. **Los cinco hallazgos UI-01 a UI-05 quedaron confirmados en dos ciclos locales**, con Microsoft Edge 154.0.4258.62, datos sintéticos y respuestas HTTP controladas. No se modificó la aplicación ni se consultó producción; estos resultados no equivalen a una comprobación en producción.

El primer ciclo obtuvo cinco fallos de comportamiento y aprobó la comprobación estable de contraste. El segundo volvió a ejecutar únicamente los cinco casos fallidos y reprodujo los cinco, conservando capturas del área visible después de esperar las animaciones. Ambos ciclos registraron cero errores JavaScript de página. Las aserciones fallidas expresan los defectos observados, no interrupciones de la infraestructura de prueba. Evidencia general: [resultados del ciclo 1](evidencia/bordes-ui/resultados.json), [resultados del ciclo 2](evidencia/bordes-ui-ciclo2/resultados.json), [log del ciclo 1](logs/bordes-ui-ciclo1.txt) y [log del ciclo 2](logs/bordes-ui-ciclo2.txt).

## Hallazgos

### UI-01 · P2 · La confirmación de recarga oculta centavos admitidos y registrados

- Perfiles: Propietario, Encargado y Caja; el Cliente ve después su saldo con el mismo redondeo.
- Evidencia: `src/casa/componentes/CajaCliente.tsx:16` acepta importes con `step="0.01"`; `:23` muestra la confirmación con `cordobas()` y envía `Math.round(Number(monto)*100)`. `src/casa/datos.tsx:516-519` convierte todos los importes a enteros mediante `Math.round(Math.abs(centavos)/100)`. El servidor admite enteros de centavos en `src/worker/index.ts:686-689`.
- Camino: buscar cliente, escribir una referencia válida y `200.49`, pulsar **Revisar recarga**. La confirmación muestra **C$ 200**, pero confirmar enviaría **20049** centavos. `200.50` se muestra como **C$ 201**. Basta abrir la confirmación para comprobarlo; no es necesario registrar una recarga.
- Resultado observado en ambos ciclos: entrada `200.49`, confirmación **Importe recibido: C$ 200**. La prueba no envió la recarga; el importe de 20049 centavos y el caso 200.50 se derivan del código citado. [Datos](evidencia/bordes-ui-ciclo2/UI-01-centavos.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-01-centavos.png).
- Impacto: el importe revisado por caja no coincide con el importe que se registra; saldos y movimientos también pierden precisión visible.
- Corrección propuesta: conservar centavos al formatear dinero, usando dos decimales cuando existan. Añadir una verificación que contraste el importe introducido, confirmado, enviado y mostrado en saldo.

### UI-02 · P2 · Los errores de pagar un pedido quedan fuera del diálogo modal

- Perfil: Cliente.
- Evidencia: `src/casa/pantallas/Pedir.tsx:98-100` guarda el rechazo del cobro en `aviso` sin cerrar el pedido. El diálogo ocupa `:190-274`; el único mensaje está en un `AvisoFlotante` hermano externo, `:276-278`. `src/casa/componentes/Superficies.tsx:219` abre la hoja con `showModal()`. `src/casa/componentes/Estados.tsx:296-329` coloca el aviso y su región viva fuera de ese diálogo.
- Camino: cargar una cuenta con saldo, agregar un plato, abrir **Tu pedido**, interceptar solo `POST /api/cuenta/cobrar` para responder con 409, 422 o 500 y confirmar el pago. El diálogo permanece abierto y vuelve a habilitar el pago sin presentar el motivo dentro de la superficie activa.
- Resultado observado en ambos ciclos, con respuesta controlada **409**: una petición interceptada, modal abierto, mensaje existente en el documento pero ausente del diálogo y de su árbol accesible; **cero regiones vivas dentro**. No se escribió un pedido en el worker. Los códigos 422/500 son variantes propuestas, no pruebas ejecutadas de este caso. [Datos y árbol del diálogo](evidencia/bordes-ui-ciclo2/UI-02-error-cobro.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-02-error-cobro.png).
- Impacto: el aviso queda detrás de la capa modal y su región viva queda en el fondo inerte; el Cliente no recibe una explicación accesible del rechazo y puede insistir sin saber qué corregir.
- Corrección propuesta: mostrar el fallo de cobro dentro de **Tu pedido** con `role="alert"`, preservando el pedido y su referencia para el reintento. Verificar el mensaje en el árbol accesible del diálogo, además de una captura.

### UI-03 · P2 · Actualizar el saldo puede fallar sin aviso mientras sigue visible el anterior

- Perfil: Cliente.
- Evidencia: `src/casa/datos.tsx:481-484` conserva `yo` y guarda `error` tras un fallo de lectura. `src/casa/pantallas/Inicio.tsx:47-55` muestra el error únicamente cuando no hay `yo`; con una cuenta ya cargada lo omite. La hoja de recarga sigue mostrando **Tenés ahora** y el saldo anterior en `:210-219`.
- Camino: cargar normalmente Inicio; abrir la información de recarga; responder 500 o abortar la siguiente consulta `GET /api/yo`; pulsar **Actualizar mi saldo**. La petición falla, pero la hoja mantiene el importe anterior sin mensaje de fallo ni antigüedad.
- Resultado observado en ambos ciclos, con una respuesta controlada **500**: el texto anterior y posterior es idéntico, conserva **C$ 9,900** bajo **Tenés ahora** y el listado de avisos es vacío. No se ejecutó la variante de aborto de conexión en este caso. [Datos y árbol del diálogo](evidencia/bordes-ui-ciclo2/UI-03-saldo-antiguo.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-03-saldo-antiguo.png).
- Impacto: después de una recarga en caja, una devolución o un movimiento desde otra sesión, el usuario puede interpretar un saldo antiguo como el recién actualizado. El error global tampoco se presenta al navegar a Perfil, Tienda o Club.
- Corrección propuesta: presentar estado de actualización y fallo dentro de la hoja donde se solicitó el saldo, y señalar cuando el resto de la aplicación conserva una lectura anterior. Preservar datos anteriores resulta útil si se indica su estado.

### UI-04 · P2 · Un fallo inicial del catálogo deja Tienda y Reservas sin recuperación local

- Perfil: Cliente.
- Evidencia: `src/casa/datos.tsx:462-490` permite entrar con `/yo` correcto, pero ignora el error de `/catalogo` y deja `catalogo` vacío. El efecto inicial se ejecuta al montar el proveedor, `:493-495`, sin reconsulta por cambiar de pestaña. `src/casa/pantallas/Tienda.tsx:97-100` muestra un estado de conexión sin `accion`; `src/casa/pantallas/Reservar.tsx:191-196` solo dice que se pruebe luego.
- Camino: primera carga con `/yo` y `/cupos` correctos y `/catalogo` fallando una vez. Restablecer la respuesta; visitar Tienda o Reservar y volver a entrar en esa pestaña. No se vuelve a pedir el catálogo ni hay botón de reintento en la pantalla afectada.
- Resultado observado en ambos ciclos: `/catalogo` respondió **503 una sola vez**; `/yo`, `/cupos` y `/ocupacion` respondieron 200. Después de recorrer **Tienda → Perfil → Tienda → Reservar** por navegación SPA, el contador de catálogo permaneció en **1**, hubo **1 documento cargado**, ningún reintento visible, la compra siguió ausente y se ofrecieron **0 zonas**. Las respuestas posteriores del catálogo estaban habilitadas, pero la aplicación no hizo una segunda consulta. [Registro por fase y peticiones](evidencia/bordes-ui-ciclo2/UI-04-catalogo.json) · [Tienda](evidencia/bordes-ui-ciclo2/UI-04-catalogo-tienda.png) · [Reservar](evidencia/bordes-ui-ciclo2/UI-04-catalogo.png).
- Impacto: quedan bloqueadas la elección de zona y la compra de bolsa tras un fallo transitorio. Recuperar requiere recargar la página o descubrir la acción de actualizar saldo de Inicio, que incidentalmente reconsulta el catálogo.
- Corrección propuesta: exponer el fallo del catálogo por separado y proporcionar reintento desde las pantallas afectadas. Verificar la recuperación tras un solo fallo, sin recarga completa.

### UI-05 · P2 · La sesión del Cliente no se invalida al recibir 401 fuera de `/yo`

- Perfil: Cliente.
- Evidencia: `src/casa/operacion.ts:17` emite `personal:sesion-caducada` tras 401; solo Personal lo escucha (`src/casa/pantallas/Personal.tsx:32`). El proveedor del Cliente escucha salida local y cambios de almacenamiento (`src/casa/datos.tsx:448-456`) y solo invalida explícitamente ante 401 de su propia consulta `/yo` (`:469-471`). El otro cliente HTTP, `pedir()`, retorna el 401 sin invalidación global (`:201-211`).
- Camino: cargar una cuenta válida y después hacer que `GET /api/compras` responda 401. Abrir **Mis compras y reservas**. Se presenta un error de operación, pero se conserva la interfaz de cuenta iniciada; cambiar a Perfil muestra los datos anteriores. Una consulta fallida de edición de perfil o cobro a través de `pedir()` presenta la misma falta de invalidación.
- Resultado observado en ambos ciclos, tras una respuesta controlada **401 de compras**: `tokenConservado=true`, `accesoCorreoVisible=false` y `perfilCacheadoVisible=true`. Apareció el mensaje de sesión terminada, pero se pudo volver al perfil sintético mediante la navegación de la aplicación. La edición de perfil y el cobro se analizaron estáticamente, sin repetir este caso en esos endpoints. [Datos](evidencia/bordes-ui-ciclo2/UI-05-sesion-401.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-05-sesion-401.png).
- Impacto: la recuperación de una sesión caducada o revocada no lleva a iniciar sesión y permite seguir recorriendo información ya cargada como si el acceso siguiera vigente. Esto es un defecto del estado del frontend; no demuestra que el servidor acepte el token vencido ni una fuga entre cuentas.
- Corrección propuesta: centralizar la invalidación 401 por tipo de sesión/token y hacer que el proveedor del Cliente limpie su estado y vuelva al acceso. La invalidación debe comprobar que la respuesta corresponde al token actual para no cerrar una sesión nueva por una petición antigua.

## Cobertura por perfil y controles encontrados

| Perfil | Superficies revisadas | Controles presentes en código |
| --- | --- | --- |
| Propietario | Resumen, Pedidos, Caja, Entregas, Agenda, Atención, Informes, Clientes, Equipo y Seguridad | Alta/restablecimiento/rol/baja exclusivos por `id==='propietario'`; confirmaciones antes de cambios; versión de clave enviada en cambios del equipo; muestras archivadas visibles solo al propietario. |
| Encargado | Secciones operativas, informes, directorio y consulta del equipo | Consulta Equipo sin botones de administración; no muestra el archivo de muestras. Comparte UI-01 en Caja. |
| Caja | Pedidos, recargas, sellos, beneficios, premios, entregas, agenda y atención | Secciones excluidas por filtro; confirmación explícita de recarga; código del beneficio normalizado, vencimiento revisado con reloj; propietario/encargado comparten estos controles. |
| Cocina | Pedidos y seguridad | Solo ofrece preparar/listo; no ofrece aceptar, entregar ni cancelar; indica que Caja debe aceptar un pedido recibido. |
| Cliente | Acceso por correo, Inicio, Pedir y detalle, Tienda, Club, Reservar, Perfil, actividad, compras y atención | Carrito por cuenta; tokens separados de Personal; referencias persistentes de compra; confirmaciones de compras; formularios con etiquetas; diálogos nativos; foco tras navegación normal y pasos de reserva. Presenta UI-01 a UI-05 según el flujo. |

La matriz anterior describe controles del frontend; la autorización efectiva debe corroborarse en la auditoría del worker y las pruebas de acceso directo a sus endpoints. En código no se encontró una elevación visual evidente entre los cuatro perfiles de personal.

## Límites y comprobación complementaria

- Actualización del recorrido principal comunicada por el auditor coordinador: la matriz del segundo ciclo pasó **97/97 comprobaciones**, con **83 pantallas** y sin violaciones automatizadas de accesibilidad. Los tres avisos previos sobre el contraste de numerales del menú desaparecieron al esperar el fin de las animaciones finitas antes de ejecutar axe y capturar. La comprobación adicional `OBS-nav-contraste` también pasó en el primer ciclo de bordes, incluyendo el menú estabilizado y el estado hover. Se clasifican los avisos iniciales como medición transitoria, no como defecto de contraste confirmado. [Evidencia estable de contraste](evidencia/bordes-ui/OBS-nav-contraste.json).
- Se revisaron estilos de equipo y componentes compartidos: existen puntos de adaptación para escritorio/tablet/móvil, columnas fluidas y desbordamiento controlado de fichas y diálogos. Esto no equivale a aprobar su aspecto ni descarta desbordamientos: las capturas y mediciones del recorrido principal son la evidencia correspondiente.
- Los diálogos usan `showModal`, etiquetas vinculadas y controles de cierre; UI-02 muestra por qué además hace falta comprobar los errores dentro del modal.
- El panel de personal usa consultas abortables, límite de 20 segundos, actualización cada 30 segundos, reanudación por foco/conexión y bloqueo de doble acción mediante referencia (`src/casa/equipo/comun.tsx:9-40`, `src/casa/operacion.ts:9-24`).
- El cliente HTTP de `datos.tsx` no aplica el límite de tiempo de `operacion.ts`; una respuesta que no termine puede mantener estados de carga. Se deja como escenario de resiliencia para prueba con conexión retenida, sin agregar un fallo ejecutado inexistente.
- Las ejecuciones de navegador fueron realizadas por el coordinador de la auditoría; esta revisión contrastó ambos logs, ambos archivos de resultados y los datos de cada hallazgo. Las pruebas de respuestas 401/409/500/503 son inyecciones controladas sobre el servidor local y no demuestran que esos errores se produzcan actualmente en producción. No hubo correcciones a la aplicación en estos ciclos, por lo que los cinco defectos permanecen abiertos.

## Suite de reproducción ejecutada

Archivo: `tests/perfiles-ui-bordes.mjs`. Utiliza `vistaAislada`, Edge sin interfaz, sesiones sintéticas independientes y permite red únicamente al origen local `127.0.0.1` de la prueba. Los casos UI-01 a UI-05 capturan imagen, árbol accesible y datos de diagnóstico antes de verificar el comportamiento esperado; un fallo no interrumpe los casos posteriores. UI-04 falla solamente la primera consulta del catálogo, restaura las siguientes respuestas y recorre Tienda/Perfil/Tienda/Reservar mediante la navegación SPA. Registra por fase las consultas a catálogo, cuenta y cupos, las acciones de reintento visibles y si vuelven a estar disponibles el producto y las zonas; comprueba que no haya recargas completas del documento. Devuelve código de salida 1 si hay fallos o errores JavaScript. La comprobación opcional de contraste separa los numerales decorativos de las etiquetas informativas y espera animaciones finitas.

Los resultados del primer ciclo están en `entregables/auditoria-perfiles-2026-10-07/evidencia/bordes-ui`; los del segundo están en `evidencia/bordes-ui-ciclo2` dentro del mismo entregable. `AUDIT_CASE_FILTER` limita la ejecución por ID o prefijo, separados por coma, por ejemplo `UI-02,UI-05`. `TEST_OUTPUT_DIR` permite preservar ciclos distintos. La suite fue validada sintácticamente y el coordinador la ejecutó secuencialmente respecto al soporte compartido. El segundo ciclo filtró UI-01 a UI-05 y guardó las capturas del área visible después de esperar las animaciones; no repitió la observación de contraste ya aprobada.
