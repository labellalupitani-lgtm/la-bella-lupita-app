# Operación y mantenimiento de Carta

Versión publicada: `9520a549-108a-4297-9bbe-8a6cf785498a`, 9 de octubre de 2026. Acceso: https://app.labellalupita.com/pedir.

## Reglas vigentes

- Lunes a sábado 07:00–21:00; domingo 08:00–21:00, zona America/Managua. La recepción termina al llegar la hora de cierre.
- Empaque para llevar: C$40 por pedido. Se muestra por separado antes de confirmar.
- Máximo 20 unidades por producto, sumando variantes; 40 artículos por pedido.
- Cotización del servidor válida 10 minutos. Cambios de precio, opciones, empaque, disponibilidad o recepción se comprueban otra vez antes de cobrar. Un cambio de importe obliga a revisar otra cotización.
- No se configuró un tiempo de preparación ni capacidad ficticios. Administración puede fijarlos según el turno real.
- Las opciones explícitas del catálogo conservan su precio anunciado. Huevo admite preferencia escrita; la recepción del pedido no equivale a aceptación de una excepción de preparación.

## Turno de cocina y administración

En **Personal → Pedidos → Disponibilidad y recepción de Carta**, cocina puede marcar agotados por producto/categoría, pausar 30 minutos, reanudar y ajustar una estimación. Propietario y encargado también pueden cambiar horario, empaque y capacidad. Guardar aplica una versión nueva y conserva responsable y cambios en auditoría. Si otra persona guardó antes, hay que recargar y revisar; no se sobrescribe su versión.

La estimación corresponde al tiempo desde el ingreso hasta estar listo. La bandeja señala los pedidos que la superan; el responsable de turno debe revisar la comanda e informar al cliente. Sin estimación configurada no se calcula una alerta arbitraria. La capacidad cuenta recibidos, aceptados y en preparación; los listos ya salieron de preparación.

Las variantes aparecen en cocina y en Mis compras. Una restricción solo llega a cocina si el cliente la incluyó y confirmó para ese pedido; el perfil completo y los importes no se entregan al rol cocina. La descripción de un plato nunca se presenta como garantía de ausencia de alérgenos.

Propietario y encargado pueden cancelar por incidencia un pedido en preparación o listo, con motivo obligatorio. La misma transacción cancela, devuelve el importe completo —incluido el empaque— y revierte puntos. Repetir la solicitud no duplica la devolución. Caja conserva sus facultades anteriores para pedidos recibidos/aceptados.

## Una respuesta de pago no llegó

1. El cliente abre Carta y pulsa **Consultar resultado**. La referencia y la cotización enviada sobreviven al cierre de pestaña y a cambios del catálogo.
2. Si existe recibo, se muestra la compra sin volver a cobrar. Si no existe, puede consultarlo nuevamente o **Cerrar intento sin cobro**; el cierre y el cobro usan el mismo bloqueo de cuenta, de modo que un envío tardío no cobra después de cerrarse.
3. No crear un nuevo cobro para «probar». Administración puede introducir la referencia en **Medición e incidencias de Carta → Consultar envío**. Allí aparecen el pedido asociado y el hash de correlación de Workers Logs (`evento: carta_cobro`, `intento: hash`). Esta consulta de soporte no cierra una solicitud en curso.
4. Si los datos locales están incompletos pero la referencia se conserva, se mantiene la consulta. Si el documento local es ilegible, **Recuperar referencia del servidor** permite seleccionar un intento reciente. Los intentos históricos anteriores a esta versión se consultan en Mis compras o mediante su referencia conservada.

El navegador debe permitir almacenamiento local y Web Locks para enviar. Si no puede guardar y comprobar la referencia durable, el botón no produce un cobro. Las pestañas comparten el pendiente y coordinan la escritura con un bloqueo. La protección del servidor por referencia es independiente de estas medidas del navegador. No se promete recuperación de una referencia desconocida si el usuario borró todos los datos y el intento nunca llegó al servidor.

## Fichas verificadas y trabajo pendiente C20

En **Personal → Pedidos → Fichas verificadas con cocina**, el equipo autorizado puede registrar porción/tamaño, componentes, fuente de verificación y correspondencia de fotografía. Cada publicación exige confirmación, controla la revisión y conserva responsable/fecha en auditoría. El catálogo público solo muestra información aprobada; no publica identificadores internos de personal ni la fuente interna.

Pendiente: confirmar porciones, tamaños y componentes reales de los productos prioritarios, especialmente los cuatro sabores de Pizza Cuatro Estaciones, y verificar las fotografías contra el producto servido. Se solicitó esta información al propietario; todavía no se recibió. No se publicaron recetas, medidas ni garantías dietéticas inventadas. Mientras tanto, las fichas explican qué debe consultarse en barra y las fotos sin revisión se identifican como imágenes de referencia. No hay filtro dietético inferido de descripciones incompletas.

## Medición y límites

Los contadores abarcan sesiones de clientes que permiten medición; respetan Do Not Track y Global Privacy Control. No cuentan invitados ni personas únicas y pueden perder eventos por bloqueadores, desconexión o cierre abrupto. No representan un embudo individual ni permiten atribuir causalidad a una mejora. Eventos: visita, ficha, búsqueda, sin resultados, agregado, salida con borrador, revisión, cotización correcta/error, confirmación, cobro correcto/incierto, recuperación y actualización de saldo. «Salida con borrador» no demuestra abandono definitivo.

Se almacenan día, evento y dispositivo; no se registran texto buscado, producto, teléfono, referencia, saldo ni restricción. Retención: 90 días; vista de administración: últimos 30 días. Cotizaciones nuevas: 30/minuto por cuenta; pedidos nuevos: máximo 3/minuto por cuenta. Los recibos repetidos se recuperan antes de aplicar el límite de pedidos nuevos.

Web Vitals usa la librería oficial, cargada por separado. Solo se atribuye a documentos abiertos directamente en `/pedir`; la métrica corresponde al documento y puede incluir navegación posterior dentro de la aplicación. LCP e INP se agrupan en intervalos de 100 y 20 ms; CLS en 0,01. El informe muestra el límite superior aproximado del percentil 75 y el número de muestras. No se presentan valores vacíos como cero. Objetivos orientativos: LCP ≤2.500 ms, INP ≤200 ms, CLS ≤0,1. No se declara que producción ya cumple esos objetivos sin una muestra de campo suficiente.

Referencias: [Web Vitals](https://web.dev/articles/vitals), [librería oficial](https://github.com/GoogleChrome/web-vitals), [cabeceras de activos de Workers](https://developers.cloudflare.com/workers/static-assets/headers/).

## Código activo y pruebas

La entrada vigente es `index.html → src/casa/main.tsx → src/casa/App.tsx`. Carta está en `src/casa/pantallas/Pedir.tsx`; `Carta.css` reúne sus estilos y su ficha. Las pantallas de `src/pantallas` y `src/app` son legado y no deben confundirse con el módulo distribuido. La ruta `/pedir` mantiene compatibilidad; el nombre visible es Carta.

- `npm test`: suites generales y servidor de Carta, con datos sintéticos en PGlite.
- `npm run test:carta`: servidor, cliente y controles de operación. Requiere compilar primero y tener Edge disponible para Playwright.
- `node tests/carta-rendimiento.mjs`: cinco pares antes/después intercalados, API aislada, CPU ×4, latencia 150 ms y descarga 200.000 bytes/s. La base de comparación es el código del 9 de octubre, que ya incluía las mejoras de Inicio.
- `node scripts/verificar-carta-publicada.mjs`: compara activos publicados, cabeceras y contrato público; bloquea escrituras de API en el navegador.

El recorrido remoto histórico exige un destino explícito de pruebas y una habilitación específica; ambos dominios de producción están bloqueados. No ejecutarlo como regresión habitual. Los guardianes, TypeScript, mitigación de dependencias y compilación siguen activos.

`npm audit` sigue informando cinco entradas de severidad alta de la cadena de herramientas de desarrollo basada en `braces`. El proyecto ya tenía una mitigación acotada que se verifica en postinstall/prebuild y con `tests/dependencias-seguras.mjs`. No se ocultó la alerta ni se hizo una migración forzada a otra versión mayor de Tailwind. `web-vitals` no introdujo esa cadena. No declarar «cero vulnerabilidades».

## Publicación y recuperación

La migración `db/022_carta.sql` es aditiva. Se exportaron ambas bases a archivos privados `.carta-backup-*.local`, se restauraron exactamente en PGlite y se aplicó dos veces la migración. Se verificó integridad de clientes, libro, membresías, personal, pedidos y vales antes de confirmar la migración remota. Los respaldos no deben compartirse con el informe.

`manifest.json` identifica el código y activos publicados; `publicacion.json` registra las versiones anterior y nueva. El despliegue preserva variables y secretos. Los activos con hash usan caché inmutable; la API conserva `no-store`.

Si surge una incidencia, preferir una corrección sobre esta versión o pausar recepción desde administración. Una reversión al Worker anterior conserva compatibilidad de esquema, pero también restablece el flujo de cobro anterior sin estas protecciones; no hacerla de forma rutinaria. Nunca restaurar una copia antigua encima de operaciones nuevas sin conciliación del libro. Los respaldos están conservados y las pruebas de restauración no escribieron sobre producción.

Límites de verificación: pruebas de navegador en Chromium/Edge; comprobaciones de teclado y axe no equivalen a certificación con lectores de pantalla reales. La concurrencia del servidor se razona y protege mediante transacciones/bloqueos; PGlite no reproduce todas las condiciones de concurrencia y latencia de Neon. No se hicieron cobros de prueba en producción.
