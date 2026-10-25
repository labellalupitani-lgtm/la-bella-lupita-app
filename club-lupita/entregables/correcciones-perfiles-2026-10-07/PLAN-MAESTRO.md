# Plan maestro para resolver los hallazgos de perfiles

La Bella Lupita · 7 de octubre de 2026 · America/Managua

## Objetivo y contrato de cierre

Corregir los nueve defectos reproducidos de la auditoría, tratar cada observación adicional con una solución o una decisión fundamentada, verificar la aplicación completa y entregar código, evidencia y estado de publicación. El informe anterior se conserva como línea base. Ningún fallo se cierra cambiando su expectativa para ocultarlo; los cambios de contrato deliberados, como una clave inicial temporal, requieren actualizar los escenarios de preparación y comprobar el nuevo comportamiento expresamente.

Se trabaja sobre `club-lupita`, que no tiene repositorio Git. Antes de editar se respalda código, configuración, dependencias y pruebas; cada etapa conserva salidas separadas. Los datos sintéticos se limitan a bases locales o una rama remota de ensayo verificada. Las pruebas no realizan compras o movimientos de clientes reales.

## Invariantes

1. El dinero sigue almacenado y calculado en centavos enteros. Se conserva la precisión visible sin cambiar precios, saldos o reglas de cobro.
2. El servidor conserva la identidad firmada, los permisos de los cinco perfiles, la revocación por versión y el aislamiento real/demo.
3. Una petición repetida no crea una compra o cargo adicional. La recuperación de red conserva la referencia original.
4. Un 401 limpia únicamente la sesión a la que pertenece la respuesta. Una respuesta retrasada de una cuenta anterior no cierra ni contamina la cuenta nueva.
5. Un fallo de lectura no borra datos útiles sin explicación ni presenta datos antiguos como recién comprobados.
6. Las migraciones y configuraciones son compatibles con la reversión; no se elimina historial ni se obliga a cambiar claves vigentes de empleados existentes por sorpresa.
7. La publicación conserva dominio, secretos, bases reales/demo y servicios existentes; las pruebas destructivas o de concurrencia se hacen en un entorno aislado.

## Etapa 1 Preparación y línea base

**T01.** Leer el informe y el estado actual, localizar fuentes y pruebas de cada hallazgo, comprobar instrucciones y herramientas. Guardar respaldo y huellas antes de cambios.

**T02.** Establecer una matriz de seguimiento para UI-01 a UI-05, B-01 a B-04 y observaciones O-01 a O-07. Cada fila tendrá estado, archivos, pruebas, resultado y evidencia. Inspeccionar de forma privada la configuración actual de Cloudflare/Neon cuando sea necesaria; registrar solo identificadores no secretos y resultados resumidos.

**Puerta de salida:** plan guardado, respaldo disponible, alcance y estado actual identificados. Dependencia de todas las etapas siguientes.

## Etapa 2 Precisión monetaria y recuperación del Cliente

| Tarea | Cambio previsto | Aceptación verificable |
| --- | --- | --- |
| T03 UI-01 | Formateador compartido conserva dos decimales cuando hay centavos; mantiene la presentación de importes enteros. Revisar caja, cuenta, movimientos, pedidos y componente heredado si comparte el problema. | 20049 → C$ 200.49; 20050 → C$ 200.50; importes negativos conservan signo/centavos; recarga introducida, confirmada, enviada y registrada coinciden; no cambia el libro. |
| T04 UI-02 | Error de cobro dentro de Tu pedido con aviso accesible. Evitar doble envío y cambios incompatibles del carrito durante el pago; conservar referencia ante respuesta perdida. | 409, 422, 500 y red fallida explicados dentro del modal; aviso desaparece al reintentar; reintento exitoso produce exactamente un cargo/pedido. |
| T05 UI-03 | Separar última lectura correcta, carga y error de cuenta; mostrar antigüedad y fallo en la hoja de saldo y donde se presenta información conservada. | Actualización fallida muestra aviso y cifra anterior identificada; reintento exitoso actualiza saldo/hora y quita aviso; no bloquea permanentemente ni se duplica la petición. |
| T06 UI-04 | Estado de catálogo separado de cuenta y cupos; recuperación explícita en Tienda, Reservar y demás superficies dependientes. | Un único 503 inicial se recupera con acción visible y navegación normal, sin recargar documento, perder sesión o inventar precios; recuperación mantiene selección válida. |
| T07 UI-05 | Unificar invalidación 401 en los clientes HTTP, ligada al token actual; limpiar datos privados y propagar cierre a otras pestañas. | 401 de compras, perfil y pago lleva al acceso; no deja perfil visible; no cierra sesión de personal; respuesta 401 antigua no invalida nuevo token; 403/500 no se tratan como expiración. |
| T08 | Acotar consultas que no terminan y conservar mensajes de resultado incierto para escrituras; evitar actualizaciones tardías tras salir. | Timeout recuperable; ninguna respuesta antigua restaura cuenta anterior ni da por confirmada una escritura cuyo resultado se desconoce. |

**Dependencias:** T03 independiente; T05/T06/T07 comparten la capa de datos y deben integrarse por un único responsable. T04 consume la invalidación sin crear una segunda política de sesión.

## Etapa 3 Integridad de API y entradas

| Tarea | Cambio previsto | Aceptación verificable |
| --- | --- | --- |
| T09 B-01 | Disponibilidad coherente con vigencia efectiva de membresías; mismo criterio en cupos y consulta administrativa; conservar gracia y renovación consentida. | Vencida sin renovación libera cupo anunciado antes del mantenimiento; activa vigente/gracia válida siguen ocupando; antes/después del mantenimiento no hay contradicción ni cargos por una consulta. |
| T10 B-02 | Validar fecha calendario y rango antes de SQL de ocupación; reutilizar una regla consistente donde proceda. | Fechas imposibles/año cero devuelven 422; bisiestos válidos y fechas normales funcionan; no 500 por entrada del usuario. |
| T11 B-03 | Validar ID de aviso como entero positivo dentro del rango bigint antes del cast. | Cero, signo, decimales, letras y desbordamiento reciben 4xx; valor límite se maneja; aviso propio se marca y ajeno no cambia. |
| T12 B-04 | Validar nombre administrativo, incluidos controles y Unicode, antes de hash/SQL. | NUL y controles rechazados con 422 sin insertar; nombres válidos con acentos y Unicode conservados; rol propietario sigue siendo obligatorio. |

**Puerta de salida:** cuatro reproducciones originales verdes y pruebas de frontera nuevas; 132 lecturas y 60 denegaciones conservadas; suites de dinero, reservas, revocación e idempotencia aprobadas.

## Etapa 4 Observaciones adicionales

| Código | Tratamiento | Evidencia de cierre |
| --- | --- | --- |
| O-01 Dependencias | Resolver las cuatro familias de alertas mediante versiones compatibles y, solo si hace falta, parches acotados revisables. No usar fix --force ni degradar herramientas de despliegue. | Árbol instalado y lock coherentes; audit completo/producción revisados; build, guardianes y navegador pasan; cualquier alerta sin parche se acompaña de mitigación comprobable y estado explícito, no cierre ficticio. |
| O-02 Cabeceras | Añadir CSP compatible, HSTS, nosniff, Referrer-Policy y protección de embebido en API/documentos/activos pertinentes, sin romper estilos, fuentes o recursos. | Respuestas del runtime y del sitio publicado incluyen política; navegador no registra bloqueos de recursos legítimos; pruebas de panel/cliente pasan. |
| O-03 Mantenimiento | Verificar cron remoto; explicitar configuración vigente y garantizar mantenimiento independiente de real/demo con reporte de errores y sin mezcla de bases. | Configuración remota consultada; handler probado con ambas bases y fallo de una; renovación/cupos coherentes; preservar cadencia válida existente. |
| O-04 Clave inicial | Alta nueva con clave temporal de 24 h y cambio obligatorio, como el restablecimiento. Mantener accesos existentes intactos. | Nuevo empleado solo entra a seguridad hasta cambiar; caducidad, reutilización/revocación y auditoría sin secretos probadas. Adaptar fixtures a completar el alta, sin saltar este control. |
| O-05 Cocina | Reducir campos ajenos a preparación: precios/totales no son necesarios para preparar; conservar identificación operativa y líneas/cantidades. | Contrato de pedidos para Cocina no contiene importes/contactos; UI no muestra totales ni botones adicionales; Caja/Encargado/Propietario mantienen la información necesaria. |
| O-06 Integración real | Usar ensayo aislado verificable para SQL/Neon y concurrencia si las credenciales disponibles lo permiten. Revisar transporte de correo sin enviar mensajes no solicitados a personas. | Escenarios de concurrencia en rama separada, evidencia de aislamiento y limpieza de recursos temporales. La entrega a buzón y dispositivos físicos se declara como aceptación externa no certificada, no como defecto corregido. |
| O-07 Accesibilidad | Probar errores, carga, recuperación, foco, teclado, ampliación de texto y 200 % de zoom, además de axe y responsive. | Recorridos Edge/Firefox y prueba adicional de WebKit disponible; modales con avisos accesibles; ausencia de recortes de controles relevantes. No llamar a esto certificación integral con lector de pantalla. |

## Etapa 5 Integración y ciclos

1. **Ciclo de implementación:** aplicar cambios pequeños por responsabilidad; ejecutar pruebas enfocadas tras cada conjunto; conservar fallo inicial y resultado final.
2. **Ciclo de regresión:** build, diez suites existentes, API ampliada, bordes de UI, recorridos de cinco perfiles en Edge/Firefox, correo UI y auditoría UI. Ajustar únicamente fixtures/esperas por cambios deliberados, conservando la verificación de negocio.
3. **Ciclo de revisión adversarial:** entradas límite, red interrumpida, respuestas retrasadas, saldo exacto, doble clic, primera clave, revocación, navegación y sesiones cruzadas; resolver cualquier regresión antes de continuar.
4. **Ciclo de plataforma:** empaquetado Workers, tipos/configuración, cabeceras, cron y ensayo Neon independiente. Verificar paridad del artefacto final y preservar datos durante publicación.

No se amplían ciclos por repetición automática sin nueva evidencia. Un fallo nuevo reabre la tarea correspondiente. Los escenarios imposibles de comprobar se registran con motivo y alcance preciso; no se marcan aprobados por inferencia.

## Etapa 6 Publicación y entrega

**T13.** Preparar artefacto reproducible, respaldo de versión/configuración y cambios SQL necesarios. Verificar que scripts de publicación no ejecuten migraciones históricas o reinicios de datos ajenos a este alcance.

**T14.** Publicar correcciones sobre la aplicación existente cuando las puertas de verificación estén aprobadas y la configuración destino haya sido contrastada; conservar ruta de reversión. Comprobar salud, cabeceras, frontend, acceso público, rechazo de consultas privadas y estado de despliegue. Mantener las operaciones sintéticas en ensayo.

**T15.** Entregar PLAN-MAESTRO, seguimiento, informe de cierre, capturas/JSON/logs, pruebas reproducibles, resumen de cambios y estado de publicación. Conservar el informe original como evidencia histórica y enlazar el cierre actualizado.

## Orden de ejecución y responsabilidades

Preparación → frontend/API en paralelo sobre archivos distintos → integración de contratos de personal/cocina → dependencias/configuración → regresión completa → ensayo de plataforma → publicación/verificación → informe. El coordinador mantiene configuración, paquetes, instrumentos, publicación y cierre. La revisión frontend concentra datos/pantallas; la revisión backend concentra reglas/validaciones. Las suites que compilan `.test-output` se ejecutan en serie.

## Reversión

Conservar copia íntegra previa de fuentes/configuración/lock; registrar versión remota anterior antes de publicar. Las correcciones de formato, validación y UI no requieren reescritura histórica. Si una comprobación posterior falla, recuperar la versión anterior del Worker con sus activos y revisar el fallo; no revertir bases mediante borrado ni restauración indiscriminada. Las nuevas claves temporales se almacenan con campos ya existentes y no modifican cuentas previas.

## Ajustes del plan durante la ejecución

El usuario mantuvo pausado el chat de nueva autenticación. Para completar esta entrega se preparó una copia aislada con el acceso vigente y todas las correcciones, sin sobrescribir el desarrollo del otro chat ni aplicar migración 020. La copia se sometió de nuevo a las diez suites, matriz API, UI de cinco perfiles, tres motores para Cliente/accesibilidad y ensayo Neon.

La concurrencia remota añadió un caso al ciclo adversarial: los límites de espera 57014/55P03 se convierten en 503 recuperable después del rollback, con Retry-After y preservación de referencia en pedidos. Se conserva el límite de ocho segundos y se comprueba que el reintento no duplica cargos. La primera comprobación pública añadió compatibilidad CSP con el Web Analytics preexistente de Cloudflare; se verificó otra vez tras publicar.

T01–T15 quedaron ejecutadas. El estado final, las limitaciones externas y la alerta residual mitigada se detallan en [CIERRE.md](CIERRE.md). Versión final: `144530db-b68b-4f0a-b3a3-b45ce04ca034`. La reversión debe comprobar también la programación cron, que es configuración separada de la versión de código.
