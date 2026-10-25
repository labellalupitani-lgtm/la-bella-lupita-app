# Diseños publicados — 22 de octubre de 2026

La app está publicada en https://app.labellalupita.com. Cloudflare confirmó la versión `3cd66007-3eaf-42e2-9b1a-915b51f2fb2e` al 100 %, a las 13:57 de Managua. Autorización explícita del usuario: «Procede a implementar todos los muevos diseños a producción.»

Se publicó la compilación completa vigente: Inicio, Carta, Tienda, Mis compras, Mi Club, Perfil (incluida la composición visual de cumpleaños), reservas y los estilos de los doce módulos del equipo. Conserva la dirección de marca aprobada y todas las mejoras incorporadas en los ciclos locales.

## Identificación y recuperación

- Worker: `club-lupita`.
- Build: `principal-C0W0OOGv.js`.
- Versión anterior: `cfd8bb75-1dd3-4497-abcb-883ef418cbb2`.
- Deployment: `0dfed2fc-557c-46db-9033-6b55d4fac10c`.
- SHA-256 del inventario de la copia congelada: `5c73fa9d57caa9ca4a3374e2fb36bfdffa5f271ad43cdda912b91407f35ae708`.
- [Manifiesto](MANIFIESTO.json): 499 archivos de la copia `release/`, sin archivos de credenciales.
- [Confirmación remota](publicacion.json) y [registro del despliegue](publicar.log).

La versión anterior queda identificada para una eventual reversión mediante Cloudflare. No fue necesario revertir.

## Validación

- Compilación final `npm run build`: aprobada. [Registro](build.log).
- Ensayo Wrangler de la copia congelada: aprobado. [Registro](ensayar.log).
- Revisión integral local: **138 comprobaciones aprobadas**, con datos sintéticos, pantallas de clientes y doce módulos del equipo; anchos de 320, 390, 768 y 1440 px, revisión de accesibilidad y texto ampliado. [Resultados](revision-integral/resultados.json).
- Producción: **11 rutas HTTP**, **176 recursos cotejados por SHA-256**, **6 comprobaciones de API** y **12 vistas públicas** en 390 y 1440 px. Sin errores JavaScript, fallos de servidor, imágenes rotas ni desbordamientos detectados en esas vistas. [Verificación](verificacion.json).
- El selector del servidor de vista previa no quedó expuesto en producción.
- [Captura real de la Carta publicada](vista-publicada.png).

Las comprobaciones remotas fueron de lectura. Los flujos autenticados se probaron en el entorno local con datos sintéticos; sus recursos publicados coinciden con la compilación verificada. No se realizaron pedidos, pagos, reservas ni envíos de códigos de acceso reales. Esta validación no sustituye una prueba observada en teléfonos físicos ni mediciones de rendimiento de campo.

## Preservación de la operación

Los 31 archivos del servidor y `wrangler.jsonc` coinciden por hash con la entrega publicada del 12 de octubre. Se conservaron bindings, variables, secretos existentes y cron. El despliegue usó `--keep-vars`; no ejecutó migraciones ni modificó datos de clientes.

`publicar.mjs` registra preparación, ensayo y publicación usando las credenciales específicas del proyecto sin imprimirlas. `verificar.mjs` permite repetir las comprobaciones públicas de lectura. El estado anterior está registrado en `estado-anterior.json`; `publicacion.json` contiene la comprobación de la versión activa posterior.
