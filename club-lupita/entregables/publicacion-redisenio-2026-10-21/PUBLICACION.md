# Publicación del rediseño aprobado

- App: [app.labellalupita.com](https://app.labellalupita.com/).
- Fecha: 21 de octubre de 2026, 14:22, America/Managua.
- Autorización del usuario: «Procede a aplicar el nuevo diseño».
- Versión activa al 100 %: `cfd8bb75-1dd3-4497-abcb-883ef418cbb2`.
- Versión anterior: `c19fcdb1-1b39-401e-87fb-0db2a40dfc9b`.
- JavaScript principal: `principal-Ctm5IHgB.js`.
- SHA-256: `5ccd0230fe9cdd88e0dcaadf682fc88859c23e131f642c0d7d9691576d48040e`.

Se publicó la entrega aprobada completa: once rutas, doce módulos del equipo y el sistema visual común. Se verificaron los 277 archivos del manifiesto antes de publicar; la compilación repetida produce exactamente los mismos archivos. Los 32 archivos de servidor y configuración coinciden con la publicación del 12 de octubre. Se usó `wrangler deploy --keep-vars` con las variables remotas ya comprobadas. No se realizaron migraciones ni modificaciones de secretos.

## Comprobación posterior

| Verificación | Resultado |
|---|---|
| TypeScript, build y guardianes | PASS, [build.log](build.log). |
| Ensayo de despliegue | PASS, [ensayo.log](ensayo.log). |
| Publicación Cloudflare | Confirmada al 100 %, [deploy.log](deploy.log) y [publicacion.json](publicacion.json). |
| Once rutas | HTTP 200, CSP presente y referencia a la compilación aprobada. |
| 172 archivos públicos | JavaScript, CSS, fuentes, fotografías y marca coinciden por SHA-256 con la entrega. |
| API | Salud, catálogo y configuración de reserva: 200; cuenta, reservas propias y agenda del equipo sin sesión: 401. Las seis respuestas conservan `no-store`. |
| Navegador | Acceso, Carta, Conocé tu club, Reservar, acceso del personal y Kit, en Edge a 390 y 1440 px: doce renders sin errores JS, desbordamiento, imágenes rotas ni respuestas 5xx. Playfair/Montserrat confirmadas. |
| Preview | El selector y su endpoint local no se publican. `/__preview/status` devuelve la entrada HTML genérica de la SPA, no el servidor de pruebas. |

[Resultados detallados](verificacion.json) · [Verificador de lectura](verificar.mjs) · [Vista pública abierta](vista-publicada.png).

El primer intento de descarga en paralelo encontró un `ECONNRESET` de red. Se acotó la concurrencia y se agregaron tres intentos máximos para errores de transporte. La repetición completa terminó sin errores ni reintentos. No fue necesario cambiar la aplicación ni volver a publicar.

Las pruebas públicas se realizaron sin iniciar sesiones, crear cuentas, comprar, reservar, canjear ni enviar correos. Las pantallas autenticadas y operaciones se respaldan con las pruebas aisladas de la [entrega aprobada](../extension-aprobada-2026-10-21/LEEME.md); no se afirma que se hayan repetido transacciones reales después del despliegue. No se ensayaron dispositivos físicos.

## Reversión preparada

Se conserva el identificador anterior en [estado-anterior.json](estado-anterior.json) y la descripción de sus bindings sin valores secretos en [version-anterior.json](version-anterior.json). Si se necesita revertir este despliegue, desde el proyecto y con autenticación de Cloudflare disponible:

```powershell
node node_modules/wrangler/bin/wrangler.js rollback c19fcdb1-1b39-401e-87fb-0db2a40dfc9b
```

La reversión no se ha ejecutado. La versión activa continúa siendo el rediseño aprobado.
