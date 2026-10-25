# Auditoría de calidad y funcionalidad de los cinco perfiles

La Bella Lupita · 7 de octubre de 2026 · America/Managua

**Auditoría ejecutada. Los flujos principales y los permisos evaluados funcionan; quedan nueve defectos reproducidos por corregir.** Seis son de severidad media y tres de severidad baja. No se demostró una escalada de permisos, acceso entre cuentas ni corrupción del saldo en los casos probados. Esto no certifica ausencia de vulnerabilidades fuera del alcance.

Se elaboró primero el [plan](PLAN.md) y luego se ejecutaron ciclos de descubrimiento, reproducción y cierre. La aplicación se probó con su frontend compilado, sus rutas reales del worker y PostgreSQL PGlite en memoria, usando cuentas sintéticas. Las consultas al sitio publicado fueron públicas y de lectura. No se modificaron fuentes de la aplicación ni datos del negocio; no se desplegaron cambios.

## Dictamen por perfil

| Perfil | Comprobaciones realizadas | Resultado y pendiente |
| --- | --- | --- |
| Propietario | Diez secciones; control exclusivo del equipo; cuentas, fichas e informes; claves, roles, bajas, reactivación, archivo y revocación; confirmaciones y navegación | Operación principal y autorización satisfactorias. Corregir precisión monetaria compartida con Caja y validación del nombre de nuevos empleados. |
| Encargado | Diez secciones; operaciones, directorio, ficha, historial, CSV y equipo de consulta; prohibición de administrar accesos y archivo | Permisos y recorridos satisfactorios. Comparte el problema de centavos en Caja. |
| Caja | Seis secciones; cliente por teléfono, recarga confirmada, sellos/canjes, pedidos, atención, agenda, entregas, cambio de clave | Flujos y restricciones satisfactorios. La confirmación de una recarga con centavos muestra un importe redondeado. |
| Cocina | Pedidos y seguridad; preparar/listo, bloqueo de aceptar/cancelar/entregar; ausencia de teléfonos/correos/saldos; desconexión y revocación | Sin defectos específicos reproducidos en los recorridos evaluados. |
| Cliente | Acceso por correo, código y alta; siete pantallas; cuenta, saldo, pedidos, compras, membresía, reservas, tienda, beneficios, atención, baja y privacidad | Recorridos normales satisfactorios. Corregir precisión de importes, error de cobro, actualización de saldo, recuperación del catálogo, salida por 401, cupos y validación de entradas. |

Mesa Fundadora se verificó como membresía comercial, sin privilegios administrativos. La [matriz detallada de permisos](backend-revision.md) distingue operaciones permitidas y prohibidas por perfil.

## Pruebas y evidencia

| Comprobación | Resultado |
| --- | --- |
| Guardianes y build de producción | Aprobados: TypeScript, Vite, reglas visuales e iconos. |
| Diez suites existentes de API | Aprobadas: regresión, cuenta, operación, correo, Resend, auditoría, saldo cronológico, panel, seguridad personal y clientes/equipo. |
| Tres suites existentes de navegador | Aprobadas: recorrido general, registro por correo y regresión de reserva/sesión. |
| Matriz adicional de permisos | 132 consultas: 22 rutas × cinco perfiles y visitante. 60 intentos de escrituras prohibidas. Todos aprobados. |
| Suite ampliada de API | 11 grupos: siete aprobados y cuatro defectos nuevos. Los cuatro se reprodujeron de nuevo de forma aislada. |
| Recorrido actual de cinco perfiles en Edge | 97 controles aprobados; 83 capturas/estados inspeccionados. Incluye 1440 y 390 px, bordes de 320/768 px en personal, acceso directo, historial, foco, red y sesiones. |
| Contraste del recorrido completo en Firefox | Los mismos 97 controles aprobados y 83 capturas/estados inspeccionados. En total, 194 ejecuciones satisfactorias del recorrido general entre ambos motores. |
| Recuperación e importes en navegador | Cinco defectos confirmados y repetidos; la comprobación independiente de contraste estable pasó. |
| Aplicación publicada | Inicio y acceso del equipo responden 200; tres consultas privadas sin sesión devuelven 401. Cuatro vistas públicas, móvil/escritorio, sin desbordamiento, excepciones JavaScript ni violaciones axe detectadas. |
| Dependencias | `npm audit`: 11 alertas en desarrollo, nueve altas y dos moderadas; `npm audit --omit=dev`: cero alertas. No equivalen a once vulnerabilidades independientes ni a una explotación demostrada en producción. |
| Integridad de fuentes | 120 archivos inventariados sin cambios durante la auditoría. Bundles principal y Personal publicados coinciden byte por byte con los locales. La coincidencia solo prueba el frontend. |

La matriz de navegador completó pedido Cliente → aceptación en Caja → preparación en Cocina → entrega en Caja → estado entregado para el Cliente. También completó recarga, consulta de ficha/historial, exportación CSV, respuesta de atención, revocación y cambio obligatorio de una clave temporal.

Los resultados detallados están en [evidencia de Edge](evidencia/perfiles-ui-ciclo2/resultados.json), [evidencia de Firefox](evidencia/perfiles-firefox/resultados.json), [matriz API](evidencia/perfiles-api-ciclo1.json), [reproducción API](evidencia/perfiles-api-ciclo2.json), [reproducción de interfaz](evidencia/bordes-ui-ciclo2/resultados.json), [lecturas públicas](evidencia/publico/resultados.json) e [integridad y publicación](evidencia/integridad-y-publicacion.json). El contraste automatizado se evaluó con axe; no sustituye una revisión completa con tecnologías de asistencia.

## Hallazgos confirmados y orden de corrección

### 1 Precisión monetaria en la confirmación de recarga

**UI-01 · Media · Propietario, Encargado, Caja y Cliente.** Introducir **C$ 200.49** y pulsar **Revisar recarga** muestra **C$ 200**. La entrada y la API admiten centavos; el formateador compartido los redondea. La operación preparada registraría 20049 centavos. También afecta a la lectura de saldos y movimientos.

Corregir el formateo para conservar los centavos existentes. Cierre: importe introducido, confirmado, registrado y mostrado coinciden para 200.49, 200.50 y valores negativos. La reproducción no registró una recarga real.

Código: `src/casa/datos.tsx:516`, `src/casa/componentes/CajaCliente.tsx:16` y `:23`. [Evidencia](evidencia/bordes-ui-ciclo2/UI-01-centavos.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-01-centavos.png).

### 2 Error de pago fuera del diálogo activo

**UI-02 · Media · Cliente.** Ante un 409 del cobro, el pedido permanece abierto y permite pagar de nuevo, pero el mensaje de error está fuera del diálogo modal y de su árbol accesible. Se confirmó un mensaje presente en el documento y ausente del diálogo, con cero regiones de aviso dentro de este.

Mostrar el error en **Tu pedido**, conservar la referencia de compra y permitir el reintento. Cierre: rechazos de negocio, error interno y caída de red muestran una explicación visible y anunciable dentro del modal, sin duplicar cobros.

Código: `src/casa/pantallas/Pedir.tsx:98`, `:276`; `src/casa/componentes/Superficies.tsx:219`. [Evidencia](evidencia/bordes-ui-ciclo2/UI-02-error-cobro.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-02-error-cobro.png).

### 3 Saldo anterior presentado sin avisar que falló la actualización

**UI-03 · Media · Cliente.** Después de cargar la cuenta, un 500 al pulsar **Actualizar mi saldo** conserva la cifra previa sin explicar el fallo ni indicar su antigüedad. No se encontró un error contable en el servidor; el problema es la confianza en el dato presentado.

Mostrar el estado de actualización, la hora de la última lectura y un reintento en la superficie donde se solicitó. Cierre: una consulta fallida conserva el saldo identificado como anterior y una posterior correcta elimina el aviso.

Código: `src/casa/datos.tsx:481`; `src/casa/pantallas/Inicio.tsx:47` y `:219`. [Evidencia](evidencia/bordes-ui-ciclo2/UI-03-saldo-antiguo.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-03-saldo-antiguo.png).

### 4 Catálogo sin recuperación desde Tienda o Reservar

**UI-04 · Media · Cliente.** Una sola respuesta 503 inicial del catálogo deja la compra y las zonas de reserva inaccesibles. Tras restablecer la respuesta y navegar Tienda → Perfil → Tienda → Reservar, el contador sigue en una consulta; ninguna pantalla ofrece reintento.

Separar el error del catálogo del estado de cuenta y añadir recuperación en las pantallas afectadas. Cierre: restaurar el servicio y pulsar reintento recupera productos y zonas sin recargar todo el documento ni perder la sesión.

Código: `src/casa/datos.tsx:486`; `src/casa/pantallas/Tienda.tsx:97`; `src/casa/pantallas/Reservar.tsx:191`. [Evidencia](evidencia/bordes-ui-ciclo2/UI-04-catalogo.json).

### 5 Rechazo de sesión que no limpia el perfil del Cliente

**UI-05 · Media · Cliente.** Un 401 al consultar compras muestra el error, pero conserva el token, no vuelve al acceso y permite ver el perfil previamente cargado. La API rechaza la consulta correctamente; no se demostró acceso nuevo a datos privados con un token inválido.

Unificar la invalidación de sesión del Cliente en todos sus clientes HTTP y comprobar que la respuesta corresponde al token vigente. Cierre: un 401 limpia token y estado privado en las pestañas, conserva separada la sesión del equipo y lleva al acceso; una respuesta antigua no cierra una sesión nueva.

Código: `src/casa/operacion.ts:17`; `src/casa/datos.tsx:201`, `:448`, `:469`. [Evidencia](evidencia/bordes-ui-ciclo2/UI-05-sesion-401.json) · [Captura](evidencia/bordes-ui-ciclo2/UI-05-sesion-401.png).

### 6 Cupos anunciados incluyen una membresía vencida

**B-01 · Media · Cliente y consulta administrativa heredada.** Una membresía sin renovación, vencida ayer pero todavía marcada activa, produce **99 plazas libres en lugar de 100** en `/api/cupos`. El conteo depende del mantenimiento del estado. El camino de compra ejecuta mantenimiento: no se probó una pérdida de dinero ni asignación duplicada.

Hacer coherente la disponibilidad pública con la vigencia efectiva y verificar el mantenimiento de los entornos. Cierre: el conteo es correcto antes y después del mantenimiento, conservando las reglas comerciales de gracia y renovación.

Código: `src/worker/index.ts:373`, `:1126`. [Evidencia de reproducción](evidencia/perfiles-api-ciclo2.json).

### 7 Fecha imposible produce error interno

**B-02 · Baja · Endpoint público de ocupación.** `GET /api/ocupacion?dia=2026-02-31` devuelve 500 con SQLSTATE 22008 en el entorno local. Solo se valida el formato antes de convertir a fecha en PostgreSQL.

Validar calendario y rango de año antes de consultar. Cierre: fechas imposibles responden 422 y fechas válidas, incluidos años bisiestos, mantienen su resultado. Código: `src/worker/index.ts:1170` y `:1197`.

### 8 Identificador de aviso desbordado produce error interno

**B-03 · Baja · Cliente.** Un ID de aviso con demasiados dígitos pasa la validación de caracteres y desborda `bigint`, devolviendo 500 con SQLSTATE 22003. El filtro de titular conserva el aislamiento.

Acotar el ID a un entero positivo válido antes del cast. Cierre: ID fuera de rango devuelve 404/422 y un aviso ajeno permanece sin modificar. Código: `src/worker/operacion.ts:48`. [Evidencia de entradas inválidas](evidencia/perfiles-api-ciclo2.json).

### 9 Nombre de empleado con carácter NUL produce error interno

**B-04 · Baja · Propietario.** Crear un acceso con nombre que contenga `\u0000` devuelve 500 con SQLSTATE 22021. No crea el empleado, pero informa un fallo de servidor en vez de una entrada inválida.

Rechazar caracteres de control antes de calcular credenciales y escribir en la base. Cierre: devuelve 422, no crea registros y preserva nombres Unicode válidos. Código: `src/worker/personal.ts:34`. [Evidencia](evidencia/perfiles-api-ciclo2.json).

## Ciclos realizados

1. **Descubrimiento.** Build y suites existentes aprobados; matriz de permisos aprobada; cuatro fallos nuevos de API y cinco de recuperación/precisión en navegador.
2. **Reproducción.** Los cuatro fallos de API y los cinco de interfaz se repitieron en bases/contextos nuevos. Cada hallazgo tiene entrada, resultado, código y criterio de aceptación. No se dieron por corregidos.
3. **Depuración del diagnóstico.** Tres avisos iniciales de contraste provenían de colores intermedios durante transiciones. Se corrigió la espera del instrumento de auditoría y el recorrido pasó 97/97. Una comprobación específica del menú estable también pasó. Los avisos se excluyeron de los nueve defectos.

El contraste final en Firefox también pasó 97/97. La primera ejecución no arrancó porque faltaba la versión de navegador requerida por Playwright; se descargó únicamente Firefox en su caché y se completó la prueba. Ese problema ambiental tampoco se contó como defecto de aplicación.

## Mantenimiento y límites de la conclusión

- **Dependencias de desarrollo:** las 11 alertas deben resolverse con actualización compatible y nueva compilación/regresión. `npm audit fix --force` puede proponer cambios mayores o un descenso de Wrangler; no se aplicó automáticamente. Las alertas se agrupan en cuatro familias: [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [sharp](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), [PostCSS selector parser](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) y [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). [Salida completa](logs/dependencias.json).
- **Cabeceras públicas:** en las respuestas observadas faltan CSP, HSTS, `X-Content-Type-Options` y `Referrer-Policy`. Revisar una política compatible de defensa adicional. Esta observación no demuestra una explotación ni invalida la protección de sesiones comprobada.
- **Mantenimiento programado:** el código tiene handler `scheduled`, pero el archivo local omite `triggers.crons`. Omitirlo no demuestra que el cron remoto esté ausente. Verificar su configuración, ejecución y separación de entornos en Cloudflare. [Revisión de plataforma](backend-revision.md).
- **Alta del personal:** las claves iniciales son aleatorias, pero no exigen cambio ni caducidad como sí ocurre al restablecerlas. Homogeneizar esa política es una mejora de seguridad, no un fallo del permiso actual.
- **Cocina:** precios y totales aparecen expresamente en la interfaz; no se envían teléfonos, correos o saldo. Decidir si la preparación necesita importes es una decisión de producto, no una escalada demostrada.
- **Producción y concurrencia:** los flujos con escritura se ejecutaron localmente. Falta una aceptación autenticada en staging con Neon real, conexiones concurrentes, correo entregado en un buzón y configuración programada. Los sustitutos locales de transporte y correo no certifican esos servicios. No se realizaron carga sostenida, Core Web Vitals de campo ni pruebas en dispositivos físicos/Safari.
- **Accesibilidad:** se comprobaron axe, desbordamientos, etiquetas, teclado/foco y diálogos seleccionados. El error modal UI-02 demuestra que un resultado automático limpio no cubre todos los estados de fallo; queda pendiente una evaluación completa con lector de pantalla y zoom.

## Cómo repetir la auditoría

Ejecutar desde la carpeta `club-lupita`, en serie: las suites comparten bundles temporales.

```powershell
npm run build
npm test
node tests/ui.mjs
node tests/correo-ui.mjs
node tests/auditoria-ui.mjs
node tests/perfiles-api-audit.mjs
node tests/perfiles-ui-audit.mjs
node tests/perfiles-ui-bordes.mjs
```

Las suites nuevas de API y bordes terminan actualmente con código **1** por los defectos documentados. No debe cambiarse la expectativa para obtener verde: después de corregir la aplicación, deben pasar los criterios existentes. Para conservar evidencias de cada ejecución, indicar `TEST_OUTPUT_DIR`; API admite `AUDIT_CYCLE` y `AUDIT_CASE_FILTER`. La suite de bordes admite prefijos separados por coma, por ejemplo `UI-01,UI-02`. Para el segundo motor, establecer `$env:NAVEGADOR='firefox'` y ejecutar `perfiles-ui-audit.mjs`, retirando la variable al terminar. Los scripts de pruebas públicas realizan solo lecturas.

Entregables complementarios: [plan](PLAN.md), [revisión backend](backend-revision.md), [revisión frontend](frontend-revision.md), [logs](logs/) y [evidencia](evidencia/).

La siguiente fase es corregir los nueve hallazgos en el orden indicado y repetir sus pruebas, seguida de aceptación en staging antes de publicar. La auditoría queda cerrada con defectos pendientes de implementación.
