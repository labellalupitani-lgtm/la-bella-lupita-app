# Carta: entrega de las correcciones

Publicada y comprobada el 9 de octubre de 2026: versión `9520a549-108a-4297-9bbe-8a6cf785498a` en [la aplicación](https://app.labellalupita.com/pedir).

**23 hallazgos implementados y verificados. C20 mantiene un pendiente de contenido real**, no una aprobación técnica: se requiere confirmar porciones, tamaños, componentes y fotografías. El editor, la validación y el registro de revisión ya funcionan. No se inventaron datos para cerrar ese hallazgo.

## Resultado

- Cobro según un total aceptado, con C$40 de empaque; recuperación durable sin duplicar un pago.
- Opciones obligatorias, restricciones confirmadas y controles de disponibilidad para cocina.
- Carta pública, búsqueda mejorada, foco visible y estado conservado al regresar.
- Horario confirmado: lunes–sábado 07:00–21:00; domingo 08:00–21:00, Managua.
- Métricas agregadas y consulta de referencias para soporte, con acceso por rol.

## Verificación

21 escenarios específicos de servidor, 14 grupos de cliente y 3 de operación correctos. Suite general, TypeScript, guardianes y compilación correctos. Cinco anchos: 320, 390, 768, 1024 y 1440 px. Revisión de teclado, movimiento reducido y axe sin infracciones detectadas en los estados comprobados. No equivale a una certificación de accesibilidad.

Ambas bases se exportaron y restauraron exactamente en aislamiento; migración aplicada dos veces y luego a real/demo conservando integridad. Cloudflare confirma la versión al 100 %. Los 15 activos JS/CSS publicados coinciden por hash con el build, tienen caché de un año y la API usa no-store. No se hicieron pedidos de prueba en producción.

## Rendimiento de laboratorio

Cinco pares intercalados; Edge, 390×844, CPU ×4, latencia 150 ms, descarga 200.000 bytes/s, gzip y caché fría, API sintética local. Comparación contra la versión del 9 de octubre que ya incluía las mejoras de Inicio.

| Mediana | Antes | Después |
|---|---:|---:|
| LCP | 2.440 s | 1.804 s |
| JavaScript recibido en Carta | 118.2 kB | 89.5 kB |
| Recursos recibidos | 289.6 kB | 263.8 kB |
| CLS observado en la carga | 0.0005 | 0.0190 |

LCP mejoró 26.1 % y JavaScript del recorrido disminuyó 24.3 %. El CLS subió ligeramente, permanece por debajo de 0,1 en este laboratorio; no se oculta esa variación. No hay resultado de INP de campo ni afirmación de mejora de conversión. La medición real quedó instrumentada. [Evidencia y condiciones](evidencia/rendimiento.json).

## Cierre por hallazgo

| ID | Estado | Implementación | Evidencia |
|---|---|---|---|
| C01 | Verificado | Cotización explícita con total, empaque y vencimiento; revalidación atómica antes del débito. | [Comprobación](evidencia/servidor-carta.json) |
| C02 | Verificado | Recuperación del recibo antes de consultar precios o catálogo, compatible con referencias históricas. | [Comprobación](evidencia/servidor-carta.json) |
| C03 | Verificado | Referencia pendiente preservada aunque el producto ya no exista o falten líneas locales. | [Comprobación](evidencia/interfaz-carta.json) |
| C04 | Verificado | Proteína, temperatura y preferencia de huevo obligatorias donde la carta las ofrece; variantes en comanda. | [Comprobación](evidencia/servidor-carta.json) |
| C05 | Verificado | Horario, pausa, agotados, categorías y capacidad comprobados de nuevo al cobrar; edición autorizada y versionada. | [Comprobación](evidencia/operacion-ui.json) |
| C06 | Verificado | Restricción del pedido explícita y confirmada; cocina recibe esa información sin exponer el perfil completo. | [Comprobación](evidencia/servidor-carta.json) |
| C07 | Verificado | Límite único de 20 unidades por producto y 40 artículos, agregando variantes y líneas duplicadas. | [Comprobación](evidencia/servidor-carta.json) |
| C08 | Verificado | Recarga en caja explicada; actualización de saldo con borrador y cotización conservados. | [Comprobación](evidencia/interfaz-carta.json) |
| C09 | Verificado | Buscador y categorías antes del destacado; fotografía compacta y oculta durante búsqueda. | [Comprobación](evidencia/interfaz-carta.json) |
| C10 | Verificado | Normalización de tildes, espacios y alias; búsqueda global; Todo y recuperación de cero resultados. | [Comprobación](evidencia/interfaz-carta.json) |
| C11 | Verificado | Cierre nativo antes de restaurar foco al disparador; vaciar enfoca un destino que sigue disponible. | [Comprobación](evidencia/interfaz-carta.json) |
| C12 | Verificado | Foco desplazado por encima de barras fijas; márgenes y comprobación de tabulación móvil. | [Comprobación](evidencia/interfaz-carta.json) |
| C13 | Verificado | Región de estado para resultados y agregados; errores enfocables y anuncios de cantidad. | [Comprobación](evidencia/axe-carta.json) |
| C14 | Verificado | Consulta y selección en URL; ficha usa historial; sesión conserva consulta y posición. | [Comprobación](evidencia/interfaz-carta.json) |
| C15 | Verificado | Carta y su API son públicas y funcionan aunque la cuenta no se haya cargado. | [Comprobación](evidencia/publicacion-verificada.json) |
| C16 | Verificado | Imágenes responsivas con respaldo; barrera de errores vigente; éxito de cobro validado estructuralmente. | [Comprobación](evidencia/interfaz-carta.json) |
| C17 | Verificado | Envío durable por cuenta, coordinación entre pestañas con Web Locks y consulta/cierre atómico en servidor. | [Comprobación](evidencia/interfaz-carta.json) |
| C18 | Verificado | Seguimiento al volver, reconectar y cada 30 s visible; cancelación excepcional autorizada con devolución única. | [Comprobación](evidencia/servidor-carta.json) |
| C19 | Verificado | C$40 por pedido para llevar, confirmado por propietario, incluido en cotización, recibo y devolución. | [Comprobación](evidencia/publicacion-verificada.json) |
| C20 | Pendiente de contenido | Editor verificado por cocina, registro de fuente/responsable/fecha y fotografía de referencia; faltan datos físicos confirmados. | [Comprobación](evidencia/operacion-ui.json) |
| C21 | Verificado | CSS consolidado, rutas diferidas preservadas, imágenes adaptadas y caché de activos; comparación reproducible e instrumentación de campo. | [Comprobación](evidencia/rendimiento.json) |
| C22 | Verificado | Entrada activa documentada; regresión aislada específica; recorrido remoto histórico protegido. | [Comprobación](evidencia/regresion-final.txt) |
| C23 | Verificado | Eventos agregados, percentiles, límites por cuenta, alertas por estimación y consulta de referencia correlacionada con logs. | [Comprobación](evidencia/servidor-carta.json) |
| C24 | Verificado | Nombre visible Carta; puntuación de descripciones preservada; textos de revisión, cargo y resultado diferenciados. | [Comprobación](evidencia/publicacion-verificada.json) |

## Continuidad

[Guía de operación y mantenimiento](OPERACION.md): turnos, recuperación de pagos, incidencias, métricas, límites de pruebas y restauración. [Plan ejecutado](PLAN.md). [Matriz estructurada](matriz-cierre.json). [Publicación](publicacion.json).

Pendiente C20: priorizar productos con el propietario y registrar los datos confirmados por cocina, en particular la composición de Pizza Cuatro Estaciones. Hasta entonces, se pide consultar porción en barra; no se publican atributos dietéticos inferidos. Esta dependencia impide declarar completado el 100 % del objetivo.

Las cinco alertas de npm audit sobre la cadena de desarrollo de braces siguen documentadas; la mitigación existente y sus pruebas están verificadas. No se declara cero vulnerabilidades.

## Verificación adicional del pendiente

La consulta renderizada de la carta oficial tampoco aporta los cuatro sabores ni las porciones faltantes. Se dejó una [lista de datos por producto](FICHAS-POR-CONFIRMAR.md), con la información disponible y los campos concretos que cocina debe completar. El código publicado sigue íntegro y todavía no hay fichas revisadas cargadas en la API.
