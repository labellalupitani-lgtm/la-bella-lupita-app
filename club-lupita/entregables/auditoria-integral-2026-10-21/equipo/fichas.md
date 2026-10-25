# Auditoría del equipo · 21 octubre 2026

La propuesta prioritaria es **Pedidos del turno**: atender primero la espera más antigua, mostrar la siguiente acción sin recorrer cabeceras y filtros, y conservar restricciones, estados y comprobación de operaciones inciertas.

La auditoría ejecutó la compilación activa indicada, con Worker real y PGlite en memoria en el puerto 5301. No leyó credenciales ni modificó `src`, `public`, `tests` o `scripts`. Las copias del harness y todos sus archivos de salida viven aquí. Datos: 26 pedidos en cuatro estados, 28 clientes, 26 solicitudes, una compra de bolsa y una reserva histórica; después se ejercitaron operaciones locales. No se heredan resultados PASS anteriores.

## EQ-01 · P1 · Juicio de diseño sustentado · La espera más antigua queda fuera de la primera página

**Reproducción:** abrir Pedidos, estado Activos, con 26 pedidos de distintas antigüedades. La primera página muestra #1–#20, los más recientes. Pulsar Siguiente: aparecen #21–#26, los seis más antiguos, ya por encima de la estimación. La consulta de `src/worker/panel.ts:40` ordena `creado DESC` y limita a 20.

**Impacto:** durante un turno concurrido, el personal necesita recordar revisar páginas para encontrar los pedidos que llevan más tiempo. La frecuencia real de turnos con más de veinte pendientes no está medida; el riesgo se demuestra con la fixture, no con ventas reales.

**Recomendación:** orden por antigüedad en la bandeja de trabajo, estado y demora en texto, acceso separado al historial. Conservar orden inverso como opción explícita. Evidencia: `capturas/estado-pedidos-pagina2.png`, `cobertura-base.json` y `src/worker/panel.ts`.

## EQ-02 · P1 · Juicio de diseño · La primera vista móvil no muestra pedidos

**Reproducción:** abrir Pedidos a 390×844 o 320×844. Cabecera, identidad, título y filtros ocupan la vista inicial. La primera acción queda en y=1359 a390 y y=1431 a320. A1440×1000 empieza en y=898.

**Impacto:** una tarea repetida de servicio exige desplazarse antes de reconocer el siguiente pedido. También afecta Entregas y Atención porque usan la misma Lista. No se afirma una reducción de tiempo humano: se midieron posición y contenido visible.

**Recomendación:** filtros secundarios desplegables, estados compactos con conteo, cabecera breve, acciones pegadas al pedido. Evidencia visual revisada con `view_image`: `capturas/antes-propietario-pedidos-390.png`, `capturas/antes-propietario-pedidos-1440.png` y los cinco contactos por ancho.

## EQ-03 · P2 · Defecto · Los importes se recortan con texto200

**Reproducción:** 390 px, duplicar tamaño de todo el texto calculado y su interlineado, conservar geometría de imágenes/controles. Desplazarse a un pedido con nombre de producto largo. `C$ 280` rebasa el borde derecho; `scrollWidth=423`, viewport390. El precio tiene `white-space:nowrap` dentro de una fila flex sin espacio reservado (`equipo.css:82–83`). El rectángulo del span puede seguir dentro de la pantalla aunque su contenido interno desborde.

**Impacto:** impide leer entero un dato decisivo al ampliar texto. **Recomendación:** permitir que la fila de producto se reorganice; reservar espacio al importe o pasarlo a una línea propia. No recortar ni esconder el precio. Evidencia visual vista: `capturas/ampliacion-texto200-pedido-detalle.png`; diagnóstico detallado en `accesibilidad.json`.

## EQ-04 · P2 · Defecto · Caja no recupera las reglas tras un fallo inicial

**Reproducción:** provocar503 en GET `/api/operacion/reglas-club` al abrir Caja. Quitar el fallo. El módulo no ofrece reconsulta y esas reglas se cargan solo en un `useEffect`; Acreditar sello permanece deshabilitado con `reglas=null`. Buscar un cliente puede limpiar el error sin volver a cargar las reglas.

**Impacto:** se necesita abandonar/reabrir o recargar la página para continuar una tarea. **Recomendación:** error junto a la tarea con Reintentar reglas, estado de carga y conservación de los datos del cliente. Evidencia: `capturas/estado-caja-error.png`, `cobertura-estados.json`, `src/casa/componentes/CajaCliente.tsx`.

## EQ-05 · P2 · Oportunidad · La recuperación de consultas es inconsistente

Seguridad muestra errores de sesiones y eventos sin reintento inmediato. En Mi Club, Tienda e Informes, Actualizar superior recupera la consulta principal pero deja errores de módulos secundarios; se necesita su propio control o esperar la siguiente actualización automática. Esto se comprobó con503 retirado, no se atribuye a datos reales.

**Recomendación:** definir claramente qué actualiza cada control o recuperar juntas las consultas fallidas. Evidencia: `capturas/estado-seguridad-error.png`, `cobertura-estados.json` (alerts antes/después).

## EQ-06 · P2 · Oportunidad · Recuperación de una operación incierta lejos de la acción

Al guardar la aceptación y perder la respuesta, el original avisa «Consultá el estado o reintentá la misma operación». La tarjeta todavía dice Recibido y conserva Aceptar. Actualizar recupera Aceptado correctamente. El backend evita duplicar el mismo estado; **no se encontró doble operación** en este ensayo.

**Recomendación:** señalar el pedido incierto, bloquear su siguiente acción y ofrecer Comprobar estado junto al aviso. Evidencia vista: `capturas/estado-pedido-respuesta-perdida.png` y `capturas/estado-pedido-recuperado.png`. El prototipo implementa una consulta simulada sin repetir la transacción.

## Lo comprobado y lo que debe preservarse

- Cocina no recibe precios ni contactos en la API de pedidos, no puede abrir administración y solo ve Pedidos/Seguridad. Caja recibe403 en resumen, clientes, equipo e informes. Encargado puede consultar esos módulos. Se probaron rutas UI para los cuatro roles y GET reales contra el Worker.
- La restricción alimentaria se expresa en texto y bloquea Comenzar preparación hasta marcar la confirmación. El ensayo de cocina pasó de Aceptado a Preparando después de esa acción explícita.
- Cancelar un pedido exige motivo, muestra importe y persona y devuelve contra el asiento original sintético. Tienda/Entregas comprueban el estado listo y el comprobante. Recarga tiene mínimo200, confirmación de pago recibido e identidad.
- CSV nuevo exportado:26 pedidos,1 cancelado, importe C$12000 después de la devolución sintética. No incluye recargas y el texto de la pantalla lo declara.
- Axe no reportó violaciones en12 secciones base ni8 módulos expandidos; es evidencia automática complementaria. Se revisaron visualmente los contactos de los cinco anchos y capturas detalladas citadas. No equivale a conformidad integral WCAG.
- Movimiento reducido no dejó animaciones/transiciones activas en los nodos revisados. Los controles enfocados mostraron contorno sólido. Escape cerró menú/diálogo y devolvió foco al disparador; el barrido Tab de diálogo incluyó el paso del navegador representado por BODY y no demuestra por sí solo una trampa de foco absoluta.

## EQ-07 · P2 · Defecto · Las listas de Equipo y Seguridad parecen vacías durante la carga

**Reproducción:** detener las lecturas GET de `/personal/equipo`, `/personal/sesiones` y `/personal/eventos` antes de responder. Equipo mantiene búsqueda y Actualizar pero no muestra carga de accesos; Seguridad muestra títulos de sesiones/eventos sin indicador local. Mi Club, aunque conserva «Actualizando información», ya muestra textos de ausencia de personas/muestras antes de recibir esos subdatos.

**Impacto:** una respuesta lenta puede interpretarse como ausencia de accesos, sesiones o actividad. **Recomendación:** distinguir carga inicial, vacío confirmado y error en cada lista; mantener la actualización accesible con `aria-busy` o estado anunciado. Se observaron las respuestas retenidas y su liberación, no solo una inspección de código. Evidencia: `cierres-lecturas/equipo-carga.png`, `seguridad-carga.png`, `club-carga.png`, registro `cierres-lecturas/resultados.json`; contactos 2–5 vistos con `view_image`.

## EQ-08 · P3 · Oportunidad · La búsqueda de accesos no confirma que terminó sin coincidencias

**Reproducción:** Equipo → buscar `nadie-con-este-nombre`. La lista desaparece; no aparece un texto de resultado ni una acción de limpiar. El campo permanece y se puede borrar manualmente. **Impacto:** añade incertidumbre al distinguir vacío, carga y búsqueda errónea, especialmente porque comparte el comportamiento anterior de carga silenciosa. **Recomendación:** «No encontramos accesos con esa búsqueda» y Limpiar búsqueda, con conteo anunciado. Evidencia: `cierres-lecturas/equipo-vacio.png`, aserción de cero artículos en `cierres-lecturas/resultados.json`, contacto 4.

## Cierre adicional de estados y ciclos

Las 59 filas antes pendientes están resueltas: 57 recorridas con evidencia nueva y 2 N/A por contrato de Seguridad. `pendientes-resueltos.json` conserva cada ID y la evidencia que lo cerró. Cobertura final: 342 filas, 329 revisadas, 13 N/A y cero pendientes. «Revisado» no significa «sin hallazgos».

Las seis suites UI originales se copiaron dentro de esta carpeta y se ejecutaron sobre bases nuevas. Carta guardó estimación/ficha, cocina marcó agotado; un ciclo adicional pausó y reanudó recepción. Caja entregó beneficio y premio, acreditó sello con ticket y confirmó/anuló descuento. Mi Club guardó configuración y costos, activó reglas, autorizó reposición, gestionó espera VIP y publicó/canceló una experiencia. Tienda guardó ficha y devolvió una bolsa con motivo. Equipo invitó, activó, cambió rol, renovó invitación, desactivó y reactivó. Seguridad cambió contraseña, configuró MFA, bloqueó/desbloqueó, rotó códigos, cerró sesiones y recuperó acceso.

Agenda creó una reserva manual VIP con autorización explícita. Después se alineó **solo el horario de esa reserva en PGlite** con el momento de atención para ensayar llegada/mesa/salida sin esperar al día siguiente. El ciclo UI aplicó C$300 del anticipo de C$500 y devolvió C$200; el Worker confirmó `finalizada`, `anticipo_aplicado=30000` y `anticipo_devuelto=20000`. Un intento inicial de llegada anticipada fue rechazado con409; es protección observada, no fallo de negocio. Las correcciones de selectores del harness y este ajuste no modificaron la app.

Se abortó la respuesta **después de ejecutar el POST real local** en Mi Club, Tienda, Entregas, Agenda, Atención, Equipo y Seguridad, además de Caja/Pedidos ya cubiertos. Tienda/Entregas y descuento recuperaron por reintento idempotente. Publicación, agenda y atención recuperaron por consulta sin repetir la mutación. Equipo recuperó un enlace mediante Renovar invitación y conservó un usuario único. Seguridad generó un conjunto nuevo de ocho códigos tras la respuesta perdida. Esto amplía EQ-06: la recuperación existe, pero depende de conocer acciones diferentes según módulo.

Las listas extensas incluyen 61 entregas/bolsas paginadas, 30 reservas, propietario más 40 accesos, 30 sesiones y100 eventos, 50 personas en espera y24 experiencias; Informes usó la segunda página del historial real del fixture. Los interceptores verifican presentación, cantidades y paginación de la UI, **no el rendimiento del servidor con esos volúmenes**. Las capturas completas conservan los estados, y los12 contactos de `revision-cierre/` fueron vistos; su juicio visual alcanza los encuadres inicial/final indicados en `indice.json`, no cada fila interior.

## Límites explícitos

`cobertura.json` diferencia inspección visual, recorrido funcional, geometría y comprobación automática. No quedan estados aplicables pendientes del inventario. Una sesión de Seguridad completamente vacía y una identidad con sus campos obligatorios ausentes se marcaron N/A: una pantalla autenticada siempre conserva la sesión actual y eventos de ingreso, y el servidor requiere los campos que presenta. No se inventó una ausencia incompatible con ese contrato. No se probaron lectores de pantalla humanos, impresión física o motores distintos de Edge Chromium. Las métricas con cero/sin muestra son datos sintéticos, no resultados del negocio. Las suites de acceso usan identidades efímeras y servidores locales TLS; el aviso «Operación real» de la compilación no indica acceso a producción y no se reporta como fallo del producto.

No se agregó fotografía o video al prototipo: la tarea consiste en reconocer filas, estados y decisiones; imágenes decorativas reducirían espacio útil. Se conserva la identidad aprobada mediante Playfair en el título, Montserrat en datos y la paleta cacao/marfil/borgoña/rosa.
