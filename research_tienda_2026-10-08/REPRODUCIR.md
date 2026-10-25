# Reproducir la auditoría de Tienda

Los scripts usan dependencias existentes del proyecto y PGlite en memoria. No leen credenciales de producción. La suite UI bloquea peticiones fuera de su servidor de loopback.

Desde `club-lupita`, compilar la interfaz aislada:

```powershell
node node_modules/vite/bin/vite.js build --outDir .test-output/tienda-auditoria-dist
npm run check
```

Desde la raíz del proyecto:

```powershell
node research_tienda_2026-10-08/ui-pruebas.mjs
node research_tienda_2026-10-08/integridad-pruebas.mjs
node research_tienda_2026-10-08/integridad-contrato.mjs
```

La suite UI necesita Edge y los motores Firefox/WebKit de Playwright instalados. Un motor ausente se informa como error de prueba, no como fallo del producto. Para repetir sólo escenarios concretos ya existentes:

```powershell
$env:TIENDA_CASOS='precio-en-pantalla-vs-cobrado,respuesta-perdida-saldo-exacto'
node research_tienda_2026-10-08/ui-pruebas.mjs
Remove-Item Env:TIENDA_CASOS
```

La variable filtra por ID exacto y conserva los resultados previos de escenarios no repetidos. Los escenarios de precio y fallo de red alteran exclusivamente la base sintética o el transporte del navegador de prueba. `OBSERVADO` significa que se completó la observación: puede demostrar un defecto. No debe interpretarse como una prueba de aceptación aprobada.

Para inspección manual opcional, el servidor sintético puede abrirse con:

```powershell
node research_tienda_2026-10-08/ui-servidor.mjs --serve
```

El proceso imprime una URL local con sesión sintética. No compartir esa URL como sitio publicado. Terminar el proceso con Ctrl+C elimina la base en memoria.

Archivos principales: AUDITORIA-TIENDA.md (síntesis), findings_*.md (revisiones), evidencia-ui/resultados.json y PNG/árboles accesibles, integridad-resultados.json, integridad-contrato-resultados.json, huellas-version.json y lecturas públicas.

No ejecutar pruebas transaccionales contra la URL pública ni cambiar `DATABASE_URL` de estos fixtures por una base real. La concurrencia multiconexión no queda validada con este servidor secuencial/PGlite: requiere una suite separada contra PostgreSQL de prueba.
