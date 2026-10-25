# Inventario del alcance completo de Club Lupita

Fecha: 21 de octubre de 2026. Proyecto: `club-lupita`.

Este inventario se preparó mediante lectura del código y de la configuración de compilación. La auditoría de alcance no ejecutó pruebas, no abrió cuentas reales ni consultó datos del negocio, secretos o producción. La actualización del 21 de octubre incorpora tres utilidades nuevas de prueba y aclara exportaciones sin consumo activo; las evidencias posteriores de Inicio se vinculan por separado en `COBERTURA.json`. No se encontraron `AGENTS.md` en los directorios ascendentes comprobados ni dentro de los directorios de código revisados.

## 1. Qué forma parte de la aplicación activa

La entrada efectiva es `index.html` → `src/casa/main.tsx` → `src/casa/App.tsx`. `vite.config.ts` declara únicamente `index.html` como entrada de Rollup. El enrutador activo es `useRuta`, dentro de `src/casa/App.tsx`, basado en History API; `src/lib/router.tsx` pertenece al cliente anterior.

Hay **10 rutas de cliente/herramientas**, **1 ruta independiente del equipo**, **12 secciones del equipo**, la pantalla de acceso del cliente y la pantalla de ruta desconocida. El análisis estático de imports locales desde la entrada activa alcanza **92 archivos fuente**, contando contratos, CSS y módulos importados sólo por tipos. El anexo enumera esos archivos para que ninguna superficie activa quede fuera.

`/personal` no es legado: `App()` la reconoce expresamente antes de montar `DatosProvider`, carga `pantallas/Personal.tsx` y mantiene su sesión de personal independiente. Propietario, encargado, caja y cocina son roles activos con interfaces diferentes. Un rediseño completo incluye estos cuatro roles.

El frontend antiguo sigue presente como referencia: `legado.html` carga `src/main.tsx`, pero no es entrada del build. `public/_redirects` contiene `/legado.html /personal 302`. Sus antiguas rutas no deben confundirse con rutas activas ni eliminarse sin una decisión separada.

## 2. Rutas, páginas y acceso

Los archivos de la tabla son relativos a `src/casa/pantallas/`, salvo indicación contraria. La condición pública deriva directamente de `App.tsx`.

| Ruta | Pantalla | Acceso y alcance funcional que preservar |
|---|---|---|
| `/` | `Inicio.tsx` | Cuenta autenticada; cuenta y saldo con privacidad persistente, pase, sellos/premios, nivel, próxima visita, estado de pedido/reserva, novedades/ofertas y accesos a Carta, reserva y Tienda. |
| `/pedir` | `Pedir.tsx` + `DetalleCarta.tsx` | Carta pública si no aparece `?acceso`; compra exige cuenta. Búsqueda, categorías/momentos, detalle de producto, elecciones, cantidades, carrito, restricciones para cocina, cotización, cobro, recibo y recuperación de intentos. |
| `/tienda` | `Tienda.tsx` | Cuenta autenticada; Reserva de Cosecha, ficha del lote, condiciones, cotización, aceptación, pago con cuenta, recibo, compra incierta/pendiente, recuperación, recarga y formulario de encargos grandes. |
| `/conoce-tu-club` | `ConoceClub.tsx` | Pública si no aparece `?acceso`; explicación de Cuenta de Casa, Mesa Fundadora, beneficios, reglas, precios/cupos vigentes, preguntas frecuentes y llamadas a la acción según sesión. |
| `/club` | `Club.tsx` | Cuenta autenticada; pase, premios, saldo/recarga, membresía activa/en gracia/sin membresía, contratación, renovación y cancelación de renovación, beneficios y reposiciones, lista de espera, experiencias, historial y ayuda. |
| `/reservas` | `MisReservas.tsx` | Cuenta autenticada; lista y comprobante de reservas, calendario, cambio de visita, cancelación, estado del anticipo, avisos y ayuda. |
| `/reservar` | `Reservar.tsx` | Consulta pública si no aparece `?acceso`; confirmación exige cuenta. Flujo en tres pasos, zonas, fecha/hora, personas/duración, disponibilidad, anticipo VIP, revisión, confirmación, recibo e intento incierto recuperable. |
| `/perfil` | `Perfil.tsx` | Cuenta autenticada; datos personales/contacto, preferencias, consentimiento de correo, club/nivel, cuenta/actividad, compras/reservas, compartir invitación, soporte de cuenta y cierre de sesión. |
| `/compras` | `MisCompras.tsx` | Cuenta autenticada; compras y reservas por tipo: pedidos, bolsas, experiencias y reservas. Incluye estados, referencias, condiciones de compra y cesión de entradas mediante `EntradaClub`. |
| `/kit` | `Kit.tsx` | Excepción al requisito de sesión; catálogo visual interactivo del sistema. Sin cabecera general ni barra de pestañas. Incluye componentes, formularios, estados, ejemplo de hoja y métricas. Sigue siendo una ruta activa. |
| `/personal` | `Personal.tsx` | Sesión independiente de personal; acceso, MFA, seguridad y 12 secciones operativas. Se monta fuera del contexto del cliente. |
| Cualquier ruta protegida sin cuenta | `Umbral.tsx` + `componentes/AccesoPersonal.tsx` | Acceso/alta por correo, verificación de código, perfil inicial y consentimiento opcional; acceso demo sólo cuando la URL contiene `demo`. No tiene una ruta `/umbral` propia en el enrutador activo. |
| Ruta desconocida con sesión | `NoHay` en `App.tsx` | Estado vacío «Esa puerta no da a ningún lado» y regreso al inicio. Sin sesión, aplica primero el acceso. |

### Variantes de URL y navegación

- Carta: `?momento=…`, `?q=…`, `?plato=…`; `plato` abre el detalle y las otras opciones preservan filtros/búsqueda. Se usa History API, incluida navegación atrás/adelante.
- Mi Club: `?beneficio=bolsa` enfoca y desplaza a los beneficios. Hay enlaces de oferta medidos por `medicion.ts`; el destino y su atribución no deben perderse al cambiar botones o enlaces.
- Equipo: `?seccion=resumen|pedidos|caja|club|tienda|entregas|agenda|atencion|informes|clientes|equipo|seguridad`.
- Capacitación de equipo: `?entorno=capacitacion`, conservado al navegar.
- Activación de equipo: fragmento `#activar=…&usuario=…`; una sesión completa ya abierta debe cerrarse antes de activar otra persona.
- Directorio de clientes: parámetros `cliente`, `q`, `estado`, `origen`, `desde`, `hasta`, `archivo` y `pagina`, además de `seccion=clientes`.
- `?acceso` en las tres rutas públicas hace que se muestre el acceso cuando no hay cuenta. `?demo` permite mostrar la muestra de acceso en `Umbral`.
- La navegación principal tiene cinco destinos: Inicio, Carta, Tienda, Mi Club y Perfil. La cabecera amplia añade Reservar y Conocé tu club. La barra móvil muestra el contador del carrito.
- `/reservar` tiene acciones propias y no monta la barra de pestañas; `/kit` tampoco la monta. No debe aparecer una doble barra fija sobre acciones importantes.

## 3. Panel del equipo: módulos y permisos

`Personal.tsx` contiene el shell, navegación, nombre/rol, modo de prueba u operación real, estado de conexión, bloqueo manual, cierre de sesión y foco al cambiar sección. El contenido efectivo se selecciona por `seccion`; las secciones no autorizadas vuelven a una sección permitida.

| Sección (`/personal?seccion=`) | Archivo / componente | Superficies y tareas |
|---|---|---|
| `resumen` | `equipo/Lecturas.tsx` → `ResumenEquipo` | Indicadores operativos y accesos a asuntos pendientes; sincronización/actualización y error de consulta. |
| `pedidos` | `equipo/Pedidos.tsx` → `PedidosEquipo`, `Bandeja` | Filtros por estado, fecha y búsqueda; recibido → aceptado → preparando → listo → entregado; reconocimiento expreso de restricciones; retraso estimado; cancelación/devolución con motivo. |
| `pedidos` / configuración | `equipo/CartaOperacion.tsx`, `FichasCarta.tsx`, `MetricasCarta.tsx` | Disponibilidad y recepción, fichas verificadas con cocina, revisión de ingredientes/opciones, métricas e incidencias, consulta por referencia. Son subpaneles activos, no rutas independientes. |
| `caja` | `equipo/Caja.tsx` → `CajaEquipo`, `BeneficioEquipo` | Cuatro pestañas internas: Cliente y recargas, Beneficio de membresía, Premio por sellos, Descuento de repostería. |
| `caja` / cliente | `componentes/CajaCliente.tsx` | Identificación del cliente, saldo y últimos movimientos; recarga con monto/referencia y confirmación de pago recibido. |
| `caja` / premio | `componentes/EntregaVale.tsx` | Consulta/validación del vale y confirmación de entrega/canje. |
| `caja` / beneficio | `equipo/Caja.tsx` | Código de membresía/reposición, titular, vigencia, ya entregado y confirmación al entregar. |
| `caja` / descuento | `equipo/DescuentoClub.tsx` | Pase, comprobante, productos elegibles, cotización y confirmación del descuento físico. Caja, encargado y propietario pueden consultar/recuperar registros; solo encargado y propietario pueden anular con motivo. |
| `club` | `equipo/Club.tsx` → `ClubEquipo` | Condiciones de Mesa Fundadora, costos internos, elegibilidad de repostería, espera por plaza, experiencias y sus condiciones, publicación, cancelación con devolución, seguimiento y rendimiento. |
| `club` / reglas | `equipo/ReglasClub.tsx` → `ReglasClubEquipo` | Lectura de reglas aprobadas, activación con evidencia para propietario y gestión de espera VIP. |
| `club` / reposiciones | `equipo/CorreccionesClub.tsx` | Consulta de entrega de beneficio, revisión de error, motivo y autorización de reposición. |
| `tienda` | `equipo/Tienda.tsx` → `TiendaEquipo`, `MetricasTienda` | Lote/ficha/condiciones, bolsas, filtros y paginación, preparada/entregada/reembolsada, comprobantes, devolución con motivo y métricas. |
| `entregas` | `equipo/Lecturas.tsx` → `EntregasEquipo`, `Entregas` | Bolsas y asistencias; filtros y confirmación de entrega/asistencia. |
| `agenda` | `equipo/ReservasEquipo.tsx` → `AgendaEquipo`, `ConfiguracionEquipo` | Agenda por día, reserva manual, llegada/inasistencia/cancelación, anticipo aplicado al consumo o devuelto, referencias; configuración de inventario, límites, horarios, excepciones, cierres y VIP. `Lecturas.tsx` reexporta `AgendaEquipo`. |
| `atencion` | `equipo/Lecturas.tsx` → `AtencionPersonal`, `Solicitudes` | Solicitudes de clientes, filtros, lectura, respuesta y resolución. |
| `informes` | `equipo/Lecturas.tsx` → `InformesEquipo`; `equipo/MetricasInicio.tsx` | Cifras por intervalo, atención de caja, uso de Inicio y registro de actividad con responsable/detalle. |
| `clientes` | `equipo/Clientes.tsx` → `ClientesEquipo`, `DirectorioClientes`, `FichaCliente`, `HistorialCliente`, `DetalleActividad` | Directorio con filtros/búsqueda/paginación, ficha de contacto/registro, cuenta/membresía, actividad por tipo con cursores y regreso al directorio preservando contexto. |
| `equipo` | `equipo/Equipo.tsx` | Tabla de roles, directorio/búsqueda, invitación, cambio de rol, desactivación/reactivación, renovación de invitación y copia del enlace individual. |
| `seguridad` | `equipo/Seguridad.tsx` → `SeguridadEquipo` | Contraseña, MFA, recuperación, códigos nuevos, sesiones/dispositivos, revocación y actividad de seguridad. |

### Matriz de visibilidad del shell

| Rol | Sección inicial | Secciones visibles |
|---|---|---|
| Propietario | Resumen | Las 12. Además administra accesos y las operaciones específicas de propietario. |
| Encargado | Resumen | Las 12. Consulta equipo; la gestión de accesos se restringe al propietario. Algunas configuraciones también son sólo del propietario. |
| Caja | Caja | Pedidos, Caja, Tienda, Entregas, Agenda, Atención, Cuenta y seguridad. |
| Cocina | Pedidos | Pedidos y Cuenta y seguridad. La vista de cocina omite precios y contacto; permite pasos de preparación, disponibilidad/fichas de Carta. |
| Cuenta con cambio obligatorio | Seguridad | La navegación se restringe a seguridad hasta completar el cambio. |

La visibilidad anterior procede del cliente; los permisos efectivos también se validan en el Worker. No se deben ampliar permisos al unificar componentes visuales. En Pedidos, propietario/encargado tienen métricas y cancelación por incidencia; caja puede aceptar/entregar y cancelar sólo los estados permitidos; cocina debe esperar aceptación de caja y reconocer restricciones antes de preparar.

### Acceso y seguridad del equipo como pantallas de primer nivel

`equipo/Acceso.tsx` contiene `MarcoAcceso`, `Acceso`, `Contraseña`, `Codigo`, `VerificarMfa`, `ConfigurarMfa`, `CodigosGuardados`, `CambiarClave` y `Revalidar`. Deben contemplarse estos estados:

- Ingreso normal, activación por invitación, recuperación y activación del primer propietario cuando el servidor lo permite.
- Dispositivo compartido/personal y nombre opcional del dispositivo.
- Fases de sesión `mfa`, `configurar`, `clave`, `completa`; QR de configuración y alternativa manual.
- Códigos de recuperación recién generados y confirmación de guardado.
- Sesión bloqueada manualmente o por inactividad; revalidación solicitada para una acción sensible.
- Cierre y cambio de persona, sesión caducada, consulta inicial fallida, desconexión y sincronización entre pestañas por BroadcastChannel.
- El shell bloquea por inactividad a los 5 minutos en dispositivo compartido y 30 en personal; el rediseño no debe retirar estos avisos/controles.

## 4. Componentes compartidos activos

La tabla enumera módulos alcanzables desde la entrada activa. Algunos exports sólo aparecen en `/kit`; se especifican como parte del catálogo activo. Que un módulo sea alcanzable no significa que todos sus exports se instancien en rutas de negocio.

| Archivo en `src/casa/componentes/` | Componentes / responsabilidad |
|---|---|
| `Base.tsx` | `EnLaBanda`, `Icono`, `Boton`, `ChipFiltro`, `ChipEscasez`, `Progreso`, `Eyebrow`, `Contador`; variantes de botón, carga, deshabilitado, etiquetas/iconos, controles de cantidad. |
| `Superficies.tsx` | `Tarjeta`, `Carnet`, `Aviso`, `Fila`, `Hoja`; superficies, listas y diálogo. `Hoja` usa `<dialog>` nativo, foco y retorno, Escape condicionado, fondo inerte, cierre exterior real, bloqueo de scroll, safe area y estado `bloqueada`. El archivo también exporta `ConfirmarCompra`, sin consumo activo encontrado: no constituye una superficie adicional. |
| `Navegacion.tsx` | `PESTANAS`, `CabeceraCasa`, `BarraDePestanas`, `CabeceraSaludo`, `CabeceraPantalla`, `SubBanda`; shell de escritorio/móvil, subcabecera, contexto y contador de carrito. |
| `Datos.tsx` | `Sello`, `TarjetaDeSellos`, `Buscador`, `FichaProducto`, `Kpi`; constantes de sellos/casillas, fichas y datos visuales. |
| `Estados.tsx` | `EstadoVacio`, `VACIOS`, `conSalida`, `CONFIRMACIONES`, `ErrorDeCampo`, `ERRORES`, `Esqueleto`, `EsqueletoFichas`, `AvisoFlotante`; vacíos, feedback, errores y carga. |
| `EstadoDatos.tsx` | `EstadoCuenta`, `EstadoCatalogo`, `EstadoCupos`; errores independientes, fecha de lectura, datos previos y reintento. |
| `LimiteError.tsx` | Barrera de error de render por ruta. |
| `Inicio.tsx` | `RetoDeLaSemana`, `PasaEnLaCasa`, `AccesosRapidos`, `LoDeSiempre`; piezas reutilizables, varias también presentes en `/kit`. Exporta también `ContenedorInicio`, sin consumo activo encontrado: no constituye una superficie adicional. |
| `FotoCarta.tsx` | Imagen de producto y presentación de ausencia/error de recurso. |
| `PaseSocio.tsx` | Pase de socio/fundador, identificador, número y ayuda; mantiene su propósito identificativo. |
| `CodigoBeneficio.tsx` | Código de café/bolsa/reposición, emisión, caducidad en tiempo real, ya entregado, error y consulta periódica. |
| `CondicionesClub.tsx` | Condiciones del contrato del período concreto, incluidas versiones históricas. |
| `CondicionesTienda.tsx` | Condiciones/ficha de la compra concreta y formato de fecha. |
| `EsperaVip.tsx` | Solicitud y seguimiento de lista de espera VIP. |
| `EntradaClub.tsx` | Entrada de experiencia, titular y cesión con destinatario/confirmación. |
| `CuentaCliente.tsx` | `EditarPerfil`, `ActividadCuenta`, `Historial`; edición, borrador, validaciones, conflicto/conciliación y recuperación; actividad por tipo con paginación. |
| `AccesoPersonal.tsx` | Acceso del cliente por correo/código y perfil inicial. El nombre no significa acceso del empleado. |
| `Atencion.tsx` | `AtencionCliente`: avisos/leído, solicitud categorizada y respuestas; se utiliza en Perfil, compras, Club y reservas. Exporta también `AtencionEquipo`, pero no se encontró consumo activo de ese export; el panel usa `AtencionPersonal` de `equipo/Lecturas.tsx`. |
| `CajaCliente.tsx` | Cliente y recargas dentro del panel del equipo. |
| `EntregaVale.tsx` | Premio por sellos dentro de Caja. |
| `iconos.gen.ts` | Inventario generado de iconos. Cambios de iconografía deben mantener sincronía con `scripts/iconos.mjs` y la fuente subset. |

Fuera de la carpeta de componentes, `premio.tsx` proporciona `usePremio` y `PremioPresentado` para Inicio y Mi Club; `equipo/comun.tsx` proporciona `useLectura`, `useAccion`, `Aviso`, `Sincronizacion`, `Lista`, `Estado` y formato de fecha/hora para las secciones operativas.

### Estados y overlays que el rediseño debe cubrir

- Globales: apertura de sesión; carga diferida de pantalla; cuenta no disponible; error de render; datos de cuenta, catálogo o cupos desactualizados/ausentes por separado; ruta desconocida; cierre local pendiente de confirmar en servidor.
- Acceso de cliente: correo, código, alta de perfil; cargando/listo/deshabilitado/error del servicio; código reenviable con espera; validación; promocionales opcionales; demo visible sólo por URL.
- Inicio: saldo oculto/visible persistente; cuenta vacía; sellos/premios; pase; premio vigente/agotado/caducado; recarga informativa; pedido/reserva/avisos; fallos independientes al actualizar.
- Carta: lista/categorías/búsqueda sin resultados; grupos plegados; producto disponible/no disponible; detalle y elecciones; límites de cantidad; carrito vacío/con líneas; restricciones confirmadas; cotización anterior al pago; total cambiado; saldo insuficiente; intento pendiente, incierto, recuperado y cerrado; recibo. El detalle también se abre desde enlaces directos `?plato=`.
- Tienda: cargando/error/sin oferta o agotada; condiciones sin verificar; modal de compra, aceptación y bloqueo durante envío; cotización/recibo; intento pendiente o incierto; referencia recuperable; recarga; encargos grandes y su confirmación.
- Mi Club: sin membresía, activa, en gracia, sin plazas, espera; contrato anterior/nuevo; beneficio disponible/entregado/caducado y reposición; contratación y aceptación; renovación activada/desactivada, renovación pendiente; experiencia disponible/agotada/no abierta; compra recuperable; historial; ayuda y espera VIP.
- Reservar: zona → datos de visita → revisión; carga/configuración no válida, ausencia de horarios, disponibilidad cambiante, conflicto al confirmar, anticipo/saldo, borrador de cuenta, intento incierto, recibo y cancelada. Conserva la hora de Managua y las condiciones de la reserva.
- Mis reservas: vacío/error/carga/listado; cambio con horarios consultados; cancelación con devolución exacta del anticipo pendiente; comprobante y calendario.
- Perfil: datos cargando/ausentes; editor limpio/sucio/guardando; errores de campo; cierre con borrador conservado; respuesta incierta; versión remota distinta; conciliación campo a campo; actividad vacía/paginada; cierre de sesión y errores; compartir/copiar fallido.
- Equipo: las confirmaciones de recarga, vale, beneficio, descuento, cancelación/devolución, entrega, asistencia, reserva manual, consumo del anticipo, cambio de acceso, invitación, publicación/cancelación de experiencia, reposición, MFA y códigos. Las acciones que hoy exigen motivo o confirmación deben mantenerlos.

## 5. Estado, datos y contratos que se conservan

| Módulo | Responsabilidad |
|---|---|
| `src/casa/datos.tsx` | `DatosProvider`, `useDatos`, cliente API y contratos de cuenta. Carga/valida cuenta, perfil, catálogo, cupos y contexto de Inicio como recursos independientes; nivel/puntos y formatos. |
| `src/casa/sesion-cliente.ts` | Sesión del cliente, migración/transporte, CSRF, invalidación y salida pendiente. |
| `src/casa/pedido.tsx` | `PedidoProvider` por cuenta, borrador por pestaña e intento enviado durable por cuenta; sincronía entre pestañas, referencia, bloqueo de envío, recuperación y límites. No se vuelve a cotizar un intento pendiente como si fuera nuevo. |
| `src/casa/http.ts` | Peticiones JSON, errores y tiempo límite; representa resultados inciertos. |
| `src/casa/operacion.ts` | Transporte operativo, sesión del personal, errores/avisos de sesión y tipos de operaciones. |
| `src/casa/carta.ts`, `carta-api.ts` | Catálogo de presentación, momentos, normalización y validación de cotización/recibo. |
| `src/casa/tienda.ts` | Oferta, cotización, recuperación y persistencia de intentos de Tienda. |
| `src/casa/club.ts` | Lectura de Club, recuperación de compras, entradas y medición. |
| `src/casa/compras.ts` | Referencia idempotente y confirmación de compra. |
| `src/casa/reservas-api.ts` | Configuración, disponibilidad, confirmación y recuperación de reservas. |
| `src/casa/premio.tsx` | Emisión/lectura de vale de premio y vigencia basada en servidor/tiempo monotónico. |
| `src/casa/medicion.ts`, `medicion-carta.ts`, `medicion-perfil.ts` | Eventos, atribución y rendimiento de Inicio/ofertas, Carta y Perfil. |
| `src/compartido/carta.ts`, `tienda.ts`, `club.ts`, `perfil.ts`, `reservas.ts` | Contratos, límites, validadores y normalización compartidos entre frontend y Worker. |
| `src/compartido/reglas.ts`, `reglas-club.ts` | Reglas comerciales compartidas y recarga; no convertirlas en cifras decorativas copiadas en pantallas. |
| `src/compartido/metricas-carta.ts`, `metricas-inicio.ts`, `metricas-perfil.ts` | Contratos de eventos/medición. |
| `src/data/menu.ts`, `src/lib/format.ts` | Datos compartidos de productos y formato monetario. Aunque no están dentro de `casa`, son alcanzables desde el cliente activo. |

### Backend activo

`src/worker/index.ts` registra los módulos de sesión, acceso por teléfono/correo/equipo, operación, Inicio, Carta, Tienda, métricas/fichas, reglas/Club, reposiciones, descuentos de caja, mostrador, panel, clientes, reservas, atención y perfil. Los helpers de credenciales/sesiones, membresías, validación, cabeceras, oferta de experiencia y correo forman parte del backend. El anexo incluye los 31 archivos de `src/worker`.

Las familias de API que sostienen el diseño son `/api/auth/*`, `/api/sesion/*`, `/api/personal/*`, `/api/yo`, `/api/perfil`, `/api/actividad`, `/api/catalogo`, `/api/cupos`, `/api/inicio/*`, `/api/carta/*`, `/api/cuenta/*`, `/api/tanda/*`, `/api/vale/*`, `/api/beneficio*`, `/api/membresia/*`, `/api/club/*`, `/api/experiencia/*`, `/api/tienda/*`, `/api/reserva-cosecha/*`, `/api/reserva`, `/api/reservas/*`, `/api/compras`, `/api/avisos*`, `/api/atencion` y `/api/operacion/*`.

El rediseño visual debe preservar los contratos anteriores, los controles de permisos, las referencias idempotentes, los importes en centavos, las condiciones históricas de compra/membresía, las recuperaciones después de una respuesta incierta y la separación entre datos reales/capacitación. No hay razón visual para modificar migraciones `db/001…029`, integraciones de correo o reglas de negocio.

## 6. Estilos y activos

La entrada activa importa globalmente `estilos/base.css`, `casa.css`, `identidad.css` e `inicio.css`. `Inicio.tsx` importa además `estilos/redisenio-inicio.css`, incorporado en el rediseño parcial anterior. Las hojas de sección activas son:

- `pantallas/Carta.css` desde Carta.
- `pantallas/ClubReserva.css` desde Mi Club y Reservar.
- `pantallas/MiClub.css` desde Mi Club.
- `pantallas/ConoceClub.css` desde Conocé tu club.
- `pantallas/Reservas.css` desde Reservar, Mis reservas y Agenda de equipo.
- `estilos/equipo.css` desde Personal.

El shell usa recursos de `public/brand/v3/`; las imágenes de Carta y ofertas se referencian desde los módulos de datos/componentes. Hay fuente de iconos autoalojada y familias autoalojadas mediante paquetes `@fontsource`. Un cambio global de identidad debe revisar también el modal, el acceso del cliente, el acceso del equipo, `/kit` y las hojas de sección para evitar mezcla de sistemas visuales.

## 7. Legado y código sin consumo activo

No alcanzables desde la entrada activa:

- `src/main.tsx`, `src/app/App.tsx`, `BarraDeLaCasa.tsx`, `Barrera.tsx`.
- `src/pantallas/`: `Casa`, `Tanda`, `Cuenta`, `Carta`, `Finca`, `Lote`, `MesaFundadora`, `Experiencias`, `Reservar`, `Perfil`, `Umbral`, `Mostrador`.
- `src/componentes/`: `Aviso`, `BarraDeCafe`, `CaminoDeAltura`, `Comanda`, `Foto`, `MesaLarga`, `MiniTanda`, `useHoja`.
- `src/lib/api.ts`, `estado.tsx`, `movimiento.ts`, `router.tsx`; `src/data/copy.ts`; `src/styles/app.css`, `base.css`, `pantallas.css`, `tokens.css`.
- Dentro de `src/casa/componentes/`, `EntregasCaja.tsx` y `MetricasOperacion.tsx` no tienen imports desde el grafo activo. Sus responsabilidades están representadas por módulos activos del equipo, pero no se eliminaron ni se modificaron.

Las rutas antiguas declaradas en `src/app/App.tsx` son `/`, `/tanda`, `/cuenta`, `/carta`, `/finca`, `/finca/lote`, `/mesa-fundadora`, `/experiencias`, `/reservar`, `/perfil`, `/umbral`, `/mostrador`. Que `/reservar` y `/perfil` coincidan en nombre con rutas activas no convierte sus archivos antiguos en los usados por el frontend actual.

Las carpetas `respaldo-*`, entregas previas, auditorías, HTML de propuestas y compilaciones preservadas no son entradas activas. Se conservan como referencia/evidencia; no se han inspeccionado como si fueran código fuente vigente.

## 8. Pruebas existentes y vista previa

`package.json` define `npm test` para 21 suites funcionales: regresión, cuenta cliente, operación, correo, resend, auditoría, saldo cronológico, panel, acceso equipo, clientes equipo, Inicio, Carta, Tienda, Mi Club, operación Club, Perfil, reservas, reembolso reservas, correo reservas, conoce-club y reglas-club.

Hay además scripts de suites de UI/operación por módulo (`test:inicio`, `test:carta`, `test:tienda`, `test:mi-club`, `test:perfil`, `test:conoce-club`), concurrencia de Club, seguridad y auditoría; `test:ui` y `test:diseno`. `check` ejecuta TypeScript y `build` ejecuta TypeScript+Vite con `prebuild` guardian y `postbuild` metadata de reservas. `guardian` comprueba reglas/tokens/iconos mediante `scripts/pruebas-guardian.mjs`, `scripts/iconos.mjs` y `scripts/guardian-tokens.mjs`.

Los archivos de `tests/` incluyen pruebas, fixtures, drivers, servidores de preview y verificaciones de publicaciones. **El nombre de un archivo no demuestra que una prueba esté al día ni que sea segura para ejecutar sin leer su destino.** No se ejecutó ninguno durante este inventario. El anexo lista todos los `.mjs` de esta carpeta.

### Preview existente utilizable para el rediseño

`npm run preview:diseno` → `scripts/vista-previa-diseno.mjs` sirve la aplicación real con Worker y PGlite en memoria. Su fuente declara y aplica:

- No lee `.env`, `.dev.vars`, Wrangler ni credenciales.
- Sin proxy remoto; bloquea `fetch` externo; usa datos/sesión sintéticos.
- Escucha en loopback, por defecto `127.0.0.1:5188`.
- Muestra aviso de vista previa y bloquea enlaces salientes.
- `/__preview/status` identifica entorno; `/__preview/entrar` abre cuenta sintética.
- `--dist` permite comparar una compilación preservada; `preview:antes` apunta a la entrega del 20 de octubre en puerto 5189.

`tests/soporte-perfiles-equipo.mjs` proporciona el Worker con base local y migraciones para pruebas de integración. Es una base existente para preparar cuentas sintéticas de los distintos roles; el servidor de diseño actual inicia la fixture con `propietario:false`, por lo que el recorrido visual del equipo deberá configurarse explícitamente dentro del entorno aislado.

### Aceptación anterior que hay que actualizar

`tests/redisenio-inicio-ui.mjs` es una prueba del rediseño **sólo de Inicio**. Exige Playfair/Montserrat en Inicio y Work Sans fuera de Inicio, y titula un caso «rutas existentes y estilos limitados a Inicio». Esa restricción visual contradice el nuevo alcance de rediseño completo y debe revisarse, conservando sus comprobaciones de aislamiento, responsive, foco, imágenes, privacidad de saldo y navegación.

Su matriz responsive actual cubre 320, 360, 390, 430, 768, 1024 y 1440 px; produce capturas y revisa desbordamientos, imágenes/fuentes, posición del pase, teclado/diálogo y estados de red. Es útil ampliar esa evidencia a todas las rutas y roles activos.

## 9. Matriz mínima de cobertura de un rediseño del 100%

1. Acceso/alta del cliente con servicio disponible, error y formulario en los tres pasos.
2. Las diez rutas de cliente/herramientas y estado de ruta desconocida; visita pública de Carta, Reservar y Conocé tu club.
3. Los diálogos/transacciones de pase, premio, recarga, Carta, Tienda, Club, reservas, perfil, historial, ayuda y cesión.
4. Acceso/activación/recuperación/MFA/bloqueo del equipo y las doce secciones, con variantes de propietario, encargado, caja y cocina.
5. Loading, vacío, error, pendiente/incierto, conflicto, éxito, sin conexión, caducidad, deshabilitado y datos anteriores; nunca sólo capturas del estado ideal.
6. Navegación móvil/escritorio, teclado, foco, labels/avisos, dialog, reduced motion, safe areas y tamaños estrechos; persistencia y recuperación de estado.
7. API/negocio y suite funcional preservados; preview aislada y revisión del resultado antes de cualquier publicación.


## Anexo A. Lista completa de módulos alcanzables

92 archivos obtenidos mediante recorrido estático de imports locales (estáticos y dinámicos) desde `src/casa/main.tsx`. Incluye imports de tipos; no sustituye una medición de chunks de producción.

```text
src/casa/App.tsx
src/casa/carta-api.ts
src/casa/carta.ts
src/casa/club.ts
src/casa/componentes/AccesoPersonal.tsx
src/casa/componentes/Atencion.tsx
src/casa/componentes/Base.tsx
src/casa/componentes/CajaCliente.tsx
src/casa/componentes/CodigoBeneficio.tsx
src/casa/componentes/CondicionesClub.tsx
src/casa/componentes/CondicionesTienda.tsx
src/casa/componentes/CuentaCliente.tsx
src/casa/componentes/Datos.tsx
src/casa/componentes/EntradaClub.tsx
src/casa/componentes/EntregaVale.tsx
src/casa/componentes/EsperaVip.tsx
src/casa/componentes/EstadoDatos.tsx
src/casa/componentes/Estados.tsx
src/casa/componentes/FotoCarta.tsx
src/casa/componentes/Inicio.tsx
src/casa/componentes/LimiteError.tsx
src/casa/componentes/Navegacion.tsx
src/casa/componentes/PaseSocio.tsx
src/casa/componentes/Superficies.tsx
src/casa/componentes/iconos.gen.ts
src/casa/compras.ts
src/casa/datos.tsx
src/casa/equipo/Acceso.tsx
src/casa/equipo/Caja.tsx
src/casa/equipo/CartaOperacion.tsx
src/casa/equipo/Clientes.tsx
src/casa/equipo/Club.tsx
src/casa/equipo/CorreccionesClub.tsx
src/casa/equipo/DescuentoClub.tsx
src/casa/equipo/Equipo.tsx
src/casa/equipo/FichasCarta.tsx
src/casa/equipo/Lecturas.tsx
src/casa/equipo/MetricasCarta.tsx
src/casa/equipo/MetricasInicio.tsx
src/casa/equipo/Pedidos.tsx
src/casa/equipo/ReglasClub.tsx
src/casa/equipo/ReservasEquipo.tsx
src/casa/equipo/Seguridad.tsx
src/casa/equipo/Tienda.tsx
src/casa/equipo/comun.tsx
src/casa/estilos/base.css
src/casa/estilos/casa.css
src/casa/estilos/equipo.css
src/casa/estilos/identidad.css
src/casa/estilos/inicio.css
src/casa/estilos/redisenio-inicio.css
src/casa/http.ts
src/casa/main.tsx
src/casa/medicion-carta.ts
src/casa/medicion-perfil.ts
src/casa/medicion.ts
src/casa/operacion.ts
src/casa/pantallas/Carta.css
src/casa/pantallas/Club.tsx
src/casa/pantallas/ClubReserva.css
src/casa/pantallas/ConoceClub.css
src/casa/pantallas/ConoceClub.tsx
src/casa/pantallas/DetalleCarta.tsx
src/casa/pantallas/Inicio.tsx
src/casa/pantallas/Kit.tsx
src/casa/pantallas/MiClub.css
src/casa/pantallas/MisCompras.tsx
src/casa/pantallas/MisReservas.tsx
src/casa/pantallas/Pedir.tsx
src/casa/pantallas/Perfil.tsx
src/casa/pantallas/Personal.tsx
src/casa/pantallas/Reservar.tsx
src/casa/pantallas/Reservas.css
src/casa/pantallas/Tienda.tsx
src/casa/pantallas/Umbral.tsx
src/casa/pedido.tsx
src/casa/premio.tsx
src/casa/reservas-api.ts
src/casa/sesion-cliente.ts
src/casa/tienda.ts
src/compartido/carta.ts
src/compartido/club.ts
src/compartido/metricas-carta.ts
src/compartido/metricas-inicio.ts
src/compartido/metricas-perfil.ts
src/compartido/perfil.ts
src/compartido/reglas-club.ts
src/compartido/reglas.ts
src/compartido/reservas.ts
src/compartido/tienda.ts
src/data/menu.ts
src/lib/format.ts
```

## Anexo B. Backend vigente

31 archivos fuente; no se leyeron secretos ni configuración de conexiones para este inventario.

```text
src/worker/acceso-correo.ts
src/worker/acceso-equipo.ts
src/worker/acceso.ts
src/worker/atencion.ts
src/worker/cabeceras.ts
src/worker/carta.ts
src/worker/cliente-sesion.ts
src/worker/clientes.ts
src/worker/club-caja.ts
src/worker/club-reposiciones.ts
src/worker/club.ts
src/worker/correo.ts
src/worker/credenciales.ts
src/worker/cuenta-cliente.ts
src/worker/equipo-sesion.ts
src/worker/fichas-carta.ts
src/worker/index.ts
src/worker/inicio.ts
src/worker/membresias.ts
src/worker/metricas-carta.ts
src/worker/mostrador.ts
src/worker/oferta-experiencia.ts
src/worker/operacion.ts
src/worker/panel.ts
src/worker/pedido-publico.ts
src/worker/reglas-club.ts
src/worker/reservas-correo.ts
src/worker/reservas.ts
src/worker/sesion.ts
src/worker/tienda.ts
src/worker/validacion.ts
```

## Anexo C. Pruebas y utilidades existentes

99 archivos `.mjs` en `tests/`, incluido el nuevo control de composición editorial. Incluye fixtures, herramientas, servidores y verificaciones además de tests. Este anexo solo acredita su existencia, no su ejecución. Las pruebas verificadas de la propuesta actual de Inicio están identificadas en `COBERTURA.json`; el resto conserva estado pendiente en la matriz.

```text
tests/accesibilidad-cliente-perfiles.mjs
tests/acceso-equipo.mjs
tests/aislamiento-demo.mjs
tests/auditoria-ui.mjs
tests/auditoria.mjs
tests/bordes-publicos.mjs
tests/cabeceras-perfiles.mjs
tests/capturas-identidad.mjs
tests/carta-operacion-ui.mjs
tests/carta-rendimiento.mjs
tests/carta-ui.mjs
tests/carta.mjs
tests/clientes-equipo.mjs
tests/club-caja-ui.mjs
tests/club-operacion.mjs
tests/composicion-carta-inicio-ui.mjs
tests/composicion-editorial-inicio-ui.mjs
tests/composicion-portada-inicio-ui.mjs
tests/composicion-inmersiva-inicio-ui.mjs
tests/composicion-inicio-ui.mjs
tests/comparacion-identidad.mjs
tests/conoce-club-ui.mjs
tests/conoce-club.mjs
tests/correcciones-cliente-ui.mjs
tests/correcciones-cliente.mjs
tests/correcciones-servidor.mjs
tests/correo-ui.mjs
tests/correo.mjs
tests/cuenta-cliente.mjs
tests/dependencias-seguras.mjs
tests/diagnostico-membresia.mjs
tests/driver-local.mjs
tests/entrega-identidad.mjs
tests/estabilidad-inicio-ui.mjs
tests/identidad-ui.mjs
tests/inicio-ui.mjs
tests/inicio.mjs
tests/inventario-publico.mjs
tests/mi-club-concurrencia.mjs
tests/mi-club-operacion-ui.mjs
tests/mi-club-ui.mjs
tests/mi-club.mjs
tests/neon-aislado.mjs
tests/operacion.mjs
tests/panel.mjs
tests/perfil-fechas-ui.mjs
tests/perfil-medicion-ui.mjs
tests/perfil-medicion.mjs
tests/perfil-postgres.mjs
tests/perfil-runtime.mjs
tests/perfil-ui.mjs
tests/perfil.mjs
tests/perfiles-api-audit.mjs
tests/perfiles-api-corregidos.mjs
tests/perfiles-equipo-integracion.mjs
tests/perfiles-neon.mjs
tests/perfiles-publico-audit.mjs
tests/perfiles-ui-audit.mjs
tests/perfiles-ui-bordes.mjs
tests/personal-fixture.mjs
tests/portada.mjs
tests/preparar-recorrido.mjs
tests/preview-auditoria.mjs
tests/preview-diseno.mjs
tests/preview-operacion.mjs
tests/preview-panel.mjs
tests/preview-seguridad.mjs
tests/publicacion-perfiles.mjs
tests/publicacion.mjs
tests/recorrido-publico.mjs
tests/redisenio-inicio-ui.mjs
tests/reglas-club-ui.mjs
tests/reglas-club.mjs
tests/regresion.mjs
tests/resend.mjs
tests/reservas-concurrencia.mjs
tests/reservas-correo.mjs
tests/reservas-reembolso.mjs
tests/reservas-rendimiento.mjs
tests/reservas-vista.mjs
tests/reservas.mjs
tests/runtime-acceso.mjs
tests/runtime-perfiles.mjs
tests/saldo-cronologico.mjs
tests/seguridad-personal.mjs
tests/soporte-cliente-perfiles.mjs
tests/soporte-perfiles-equipo.mjs
tests/soporte-ui.mjs
tests/soporte.mjs
tests/tienda-bloqueos.mjs
tests/tienda-fixture.mjs
tests/tienda-operacion-ui.mjs
tests/tienda-tls.mjs
tests/tienda-ui.mjs
tests/tienda.mjs
tests/ui.mjs
tests/verificar-publicacion-identidad.mjs
tests/vista-acceso.mjs
tests/vista-local.mjs
```

## Estado de esta entrega

Inventario de alcance completado por lectura estática. Rediseño de toda la app, aceptación visual de la base, implementación, pruebas de la nueva UI y publicación: **pendientes**. Este documento no declara la aplicación rediseñada ni aprobada; sirve para revisar el alcance antes de implementar.
