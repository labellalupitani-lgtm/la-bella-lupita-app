# La Bella Lupita — aplicación y panel del equipo

Repositorio privado del proyecto. Incluye la aplicación de clientes, el panel del
equipo, servidor, migraciones SQL, pruebas, recursos de marca y documentación.

## Empezar en otra computadora, sin Neon

Entorno utilizado para preparar esta entrega: Node.js **24.12.0** y npm **11.6.2**.
Instalá Git y Node.js 24 antes de comenzar. La instalación inicial necesita Internet
para descargar las dependencias; la vista previa no requiere credenciales.

```sh
git clone https://github.com/labellalupitani-lgtm/la-bella-lupita-app.git
cd la-bella-lupita-app/club-lupita
npm ci
npm run preview:diseno -- --port 5190 --experiencia --equipo
```

Abrí **http://127.0.0.1:5190/__preview**. El selector permite entrar como cliente,
visitante, propietario, encargado, caja y cocina. Mantené la terminal abierta;
Ctrl+C detiene el servidor. Si el puerto está ocupado, elegí otro con `--port`.

- Cliente: http://127.0.0.1:5190/__preview/entrar
- Administrador de prueba: http://127.0.0.1:5190/__preview/equipo?rol=propietario

Esta vista ejecuta el servidor de la aplicación con PGlite en memoria y datos
sintéticos. Bloquea las conexiones externas del servidor, no consulta Neon y no
envía correos ni realiza operaciones reales. Los datos se reinician cuando se
reinicia el proceso. Los cambios en las fuentes y diseños sí quedan en archivos.
La franja superior identifica la vista previa incluso si alguna pantalla interna
muestra la etiqueta heredada «Operación real».

`npm run dev` inicia solo Vite y necesita una API aparte. Para recorrer la app
completa sin Neon, utilizá `preview:diseno` con los argumentos anteriores.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `club-lupita/src/casa` | Interfaz de clientes y del equipo |
| `club-lupita/src/worker` | API, permisos, cobros, reservas y mantenimiento |
| `club-lupita/src/compartido` | Contratos y reglas compartidas |
| `club-lupita/db` | Esquema y migraciones SQL numeradas |
| `club-lupita/public` | Fotografías, logotipos, tipografías y recursos de la app |
| `club-lupita/tests` | Pruebas y bases sintéticas |
| `club-lupita/scripts` | Desarrollo, comprobaciones, migraciones y publicación |
| `club-lupita/entregables`, `entregables` | Informes y manuales históricos |
| `research_*`, `Logo - Identidad`, `stitch_*` | Investigación y materiales de diseño |

## Comprobar el proyecto

Desde `club-lupita`:

```sh
npm run check
npm run build
npm test
```

`build` incluye los guardianes visuales y genera `dist/`. La batería `npm test`
utiliza datos de prueba. Las pruebas de navegador, publicación, infraestructura y
concurrencia tienen requisitos adicionales; revisá cada script antes de ejecutarlo.
En particular, `test:mi-club:concurrencia` utiliza conexiones reales configuradas en
archivos locales y no forma parte del recorrido sin Neon.

## Estado y continuidad

Esta entrega a GitHub se preparó el **25 de octubre de 2026**. Las fuentes actuales
están en `club-lupita/src`; los informes antiguos describen versiones anteriores.
Los documentos prioritarios son:

- [Continuidad vigente](club-lupita/CONTINUIDAD-DISENO.md).
- [Optimización de consumo publicada el 22 de octubre](club-lupita/entregables/optimizacion-consumo-2026-10-22/RESULTADO.md).
- [Diagnóstico de la cuota](club-lupita/entregables/auditoria-cuota-2026-10-22/INFORME.md).

En la última comprobación documentada del 22 de octubre, Neon seguía bloqueado por
la cuota agotada. Publicar este repositorio no restablece la base ni cambia el plan.
La versión de producción registrada es `78f403bb-85b6-46c2-b918-a9fcad8d2d49`.

## Datos, credenciales y producción

El repositorio permite reconstruir el programa. **No es un respaldo de la base de
datos de clientes.** No incluye contraseñas, tokens, `.env.deploy`, `.dev.vars`,
archivos `*.local`, sesiones, respaldos privados ni dependencias instaladas.
Tampoco incluye compilaciones y capturas históricas reproducibles. Algunos enlaces
de informes históricos apuntan a esa evidencia que permanece en la computadora de
origen; no se necesita para construir la aplicación actual.

Para conectarse a datos reales se deben proporcionar las credenciales por un canal
privado y configurar el entorno correspondiente. La lista de variables está en
`club-lupita/src/worker/index.ts` (tipo `Env`). La plantilla
`club-lupita/.dev.vars.example` contiene únicamente nombres y valores vacíos.
La vista previa local no necesita esa plantilla.

La publicación usa Cloudflare Workers. `club-lupita/wrangler.jsonc` conserva el
destino existente `app.labellalupita.com`. **`npm run deploy` publica en ese destino**
si las credenciales lo permiten; no lo ejecutes para iniciar una demostración.
Este repositorio no incorpora publicación automática al hacer push.

Las migraciones SQL deben revisarse contra la estructura existente y aplicarse
solo cuando correspondan. `scripts/db.mjs` ejecuta los archivos recibidos: no lleva
por sí solo un registro de migraciones aplicadas. No ejecutes todas las migraciones
ni las semillas sobre producción sin revisar el estado, respaldo y destino.

Los recursos de terceros conservan sus licencias originales. Este repositorio no
concede una licencia pública sobre la marca ni sobre el código del negocio.
