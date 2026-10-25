# Inicio: verificación y operación

El plan se ejecuta sobre la aplicación existente y conserva sus reglas comerciales. La fuente de precios y disponibilidad es la base; el teléfono completo identifica al cliente en caja y los códigos de premio o beneficio conservan sus controles de entrega.

## Verificación reproducible

Desde `club-lupita`: `npm run build`, `npm test`, `npm run test:inicio`, `npm run test:ui` y `node tests/correo-ui.mjs`. Todas las escrituras de estas pruebas usan bases sintéticas locales. `tests/inicio-ui.mjs` genera las ocho capturas y el resultado de axe en `evidencias`.

Los escenarios nuevos comprueban catálogo pasado y capacidad modificada; premio idempotente y renovable; lectura de cuenta fallida después de emitir; caducidad visible; teléfono de fundador; retorno de Reservar; reconexión concurrente; respuesta atrasada de otra cuenta; cookie inaccesible a JavaScript, origen, CSRF, revocación y coexistencia con personal; contratos dañados; acciones agregadas y permisos de sus métricas.

## Medición

Administración encuentra los contadores en Personal → Informes → Uso de Inicio. La colección acepta únicamente los nombres definidos en `src/compartido/metricas-inicio.ts`, duración entera de 0–30.000 ms y el tamaño de pantalla como móvil, tableta o escritorio. El servidor deriva el tipo de cuenta (cliente o fundador) de la membresía vigente. No acepta nombre, teléfono, correo, saldo, código, URL ni texto libre. La base guarda día, evento, tipo de cuenta, categoría de pantalla, cantidad y duración total. El limitador de abuso conserva una huella en su mecanismo habitual; esa huella no se incorpora a las métricas.

La app respeta Do Not Track y Global Privacy Control. Los contadores no son personas únicas ni una muestra completa. Las tasas dividen acciones: códigos obtenidos/intentos de premio; pases/aperturas; apartados/ofertas abiertas. Un apartado se atribuye sólo si ocurre en la misma visita, en la misma cuenta y dentro de 30 minutos; perder la respuesta puede impedir atribuirlo hasta el reintento. Los eventos son orientativos y pueden perderse por conexión o cierre de pestaña. No se usan para cobros ni conciliación. La retención es de 90 días, con limpieza horaria. Administración revisa errores y tendencias semanales; cualquier cambio comercial debe contrastarse con pedidos y entregas.

Las mediciones de carga son de laboratorio con API simulada. No prueban resultados de usuarios reales ni sustituyen percentiles de campo. La comparación mantiene móvil 390×844, CPU ×4, latencia 150 ms, descarga 200 kB/s y caché desactivada.

## Sesiones del cliente

La app actual solicita una cookie opaca `HttpOnly; Secure; SameSite=Strict; Path=/` con duración de 30 días. La base sólo guarda su huella; las operaciones verifican cuenta activa, vigencia, origen y un valor CSRF independiente. El cierre revoca la sesión en el servidor. Si no hay conexión, la app informa que no pudo confirmar el cierre y permite reintentarlo: no declara una revocación inexistente.

Una credencial antigua en localStorage se intercambia por cookie al abrir; se elimina del navegador y se invalida su huella para impedir reutilizarla. La migración entre pestañas usa Web Locks cuando existe y el servidor sólo permite consumir una credencial una vez. Las respuestas tardías se descartan al cambiar la identidad. Personal mantiene sus cookies, permisos y segundo factor propios. La API heredada sigue atendiendo clientes antiguos con bearer hasta que migren o expire su acceso; la interfaz publicada no persiste esos tokens. HttpOnly reduce la exposición de la credencial, pero no convierte una vulnerabilidad XSS en inocua.

## Publicación y recuperación

La migración `db/021_inicio_sesion.sql` sólo añade tablas e índices. Se ensaya dos veces sobre restauraciones locales verificadas de las bases real y demo y se compara su integridad. Hay copia local del código anterior y exportaciones privadas de datos en archivos `.inicio-backup-*.local`, fuera de `public` y `dist`; no deben compartirse. `respaldos.json` contiene únicamente evidencia y hashes.

Neon rechazó crear una nueva rama de respaldo; por ello se usa la exportación privada con restauración comprobada. No se elimina ninguna copia anterior ni se cambia el plan de servicio. La disponibilidad de snapshots remotos queda registrada en `respaldos.json`.

`scripts/publicar-inicio.mjs` comprueba que la versión pública y el manifiesto no cambien antes de migrar/publicar. `publicacion.json` registra las versiones. Para revertir la interfaz y el servidor, restablecer la versión anterior de Workers; las tablas nuevas pueden permanecer sin afectar al código previo. Las sesiones migradas requerirían volver a entrar en una versión anterior que sólo entiende bearer. No restaurar una base completa sobre actividad nueva: primero comparar fechas y operaciones para evitar perder compras posteriores.

Referencias revisadas: [buenas prácticas de Workers](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/), tipos oficiales `@cloudflare/workers-types` 5.20261009.1 y configuración local de Wrangler. Se conservaron los bindings y el controlador de Neon existentes.
