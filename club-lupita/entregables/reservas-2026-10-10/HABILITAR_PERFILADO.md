# Chrome DevTools MCP habilitado y probado

Actualización del 12 de octubre: las herramientas nativas `mcp__chrome_devtools` ya están disponibles en esta conversación y se usaron directamente para las [nuevas mediciones](../reservas-2026-10-12/INFORME.md). Cada primera visita utiliza un contexto aislado nuevo. El procedimiento de CLI descrito abajo corresponde a la etapa del día 10.

El usuario autorizó la instalación el 10 de octubre de 2026. Se agregó el servidor global `chrome-devtools` a Codex y `codex mcp get chrome-devtools` confirmó que está habilitado con los parámetros acordados.

Configuración aplicada:

```powershell
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --isolated --headless --no-usage-statistics --no-performance-crux
```

Esto agrega un servidor MCP a la configuración local de Codex y permite perfilar una instancia separada de Chrome. `--isolated` usa un perfil temporal; `--headless` evita abrir una ventana; las dos últimas opciones desactivan estadísticas del servidor y consultas CrUX. No se conecta al perfil de navegación habitual. Las opciones están documentadas en la [configuración oficial](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md) y el [README oficial](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/README.md).

La lista de herramientas nativas de esta conversación no se recargó automáticamente. Se verificó el servidor mediante la **CLI oficial incluida en el mismo paquete**, versión **1.10.1**: `list_pages`, `navigate_page`, `emulate`, `performance_start_trace`, `performance_stop_trace` y análisis de insights ejecutados correctamente. Chrome usado: **HeadlessChrome 154.0.0.0**, Windows. Las mediciones no dependen únicamente de que exista una entrada de configuración. El ejecutor oficial está documentado en [Chrome DevTools CLI](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/cli.md).

Se midieron entradas directas a `/reservar`, perfiles de escritorio y móvil, carga y cambios de pasos. Las interacciones hasta la confirmación usan PGlite local con cuenta, inventario y saldo sintéticos. No se crearon reservas reales para perfilar. Cada primera visita reproducible reinicia el servidor con un perfil temporal nuevo. Las recargas iniciales se conservan como evidencia exploratoria: `ignoreCache` no eliminó todos los recursos previamente visitados y se observaron respuestas 304; **no son primeras visitas limpias**.

`medir-primera-visita.ps1` reproduce las mediciones públicas con el paquete fijado en 1.10.1. El perfil móvil es viewport 390×844, DPR 3, touch, CPU ×4 y preset Slow 4G; no equivale a un teléfono físico ni a su procesador. El perfil de escritorio es 1365×900, DPR 1, sin limitación. CrUX está desactivado: los textos automáticos de las trazas sobre ausencia de datos no demuestran que no existan datos públicos; simplemente no se consultaron.

La latencia de la API medida por HTTP está en `latencia-publica.json`; no mide LCP, INP ni CLS. Esa distinción coincide con la documentación de [Web Vitals](https://web.dev/articles/vitals).
