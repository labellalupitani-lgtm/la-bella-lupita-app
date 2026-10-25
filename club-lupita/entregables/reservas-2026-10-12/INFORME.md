# Reservar: mejoras publicadas y verificación del 12 de octubre

12 de octubre de 2026, Managua. Versión activa al 100%: `a1f530ec-9ca5-49d7-8c30-bb6996163287`. [Abrir Reservar](https://app.labellalupita.com/reservar). La matriz de los 23 hallazgos continúa en [ESTADO](../reservas-2026-10-10/ESTADO.md).

## Cambios comprobados

La fotografía de la terraza ahora tiene variantes AVIF de 480 y 960 píxeles, con WebP como alternativa. Se conservaron encuadre, dimensiones y contenido; se comparó visualmente la compresión. La variante grande pasa de **159.734 a 85.609 bytes**, un ahorro del **46,4%**. La pequeña pasa de 50.472 a 27.301 bytes. La precarga solicita únicamente AVIF cuando el navegador admite ese formato; en Chrome publicado se observó una sola descarga de la imagen, iniciada desde el HTML. Se verificaron HTTP 200, MIME y coincidencia de las cuatro imágenes con los archivos locales. El fallback WebP está disponible, aunque no se ensayó un navegador antiguo sin AVIF.

Inicio y Acceso se separaron del paquete inicial de Reservar. La entrada general conserva la precarga de sus dependencias; `/reservar` anticipa únicamente su árbol estático. El paquete principal pasa de aproximadamente **82,32 a 73,09 KB gzip**. Las mediciones de red confirman que abrir Reservar ya no descarga los módulos Inicio y Umbral. Se mantuvieron las alturas de la imagen: 180 px en móvil y 420 px en escritorio. A 320 y 390 px no apareció desborde horizontal.

La comprobación de navegación encontró y corrigió una transición adicional: al pulsar **Mis reservas** sin sesión, Acceso mantenía el título anterior y el foco quedaba en el cuerpo de la página. Ahora, cuando termina de cargar esa pantalla, el título cambia a **Acceso · La Bella Lupita**, el foco llega al contenido y la siguiente pulsación de Tab alcanza el campo de correo. Se reprodujo y verificó en local y en producción. Esta prueba de teclado no sustituye una prueba auditiva con lector de pantalla.

## Rendimiento medido, sin descartar muestras

Herramienta: Chrome DevTools MCP nativo, HeadlessChrome 154 en Windows. Cada muestra abrió un contexto aislado nuevo, sin sesión ni caché previa. Móvil emulado: 390×844, DPR 3, touch, Slow 4G y CPU ×4. CrUX está desactivado y no se consultó. Se esperó la decodificación de imágenes, fuentes y dos fotogramas antes de detener cada traza. Las mediciones son de laboratorio; no son el p75 de visitantes ni una prueba en teléfono físico.

| Etapa publicada | LCP de las tres visitas | Mediana | TTFB observado | CLS |
|---|---|---:|---:|---:|
| Base `94286822` | 3.010 / 3.052 / 2.986 ms | 3.010 ms | 157–219 ms | 0 |
| AVIF `449c9bea` | 2.887 / 2.995 / 2.926 ms | 2.926 ms | 160–203 ms | 0 |
| AVIF + módulos diferidos `b579fb74` | 2.824 / 2.741 / 2.748 ms | 2.748 ms | 162–181 ms | 0 |
| Final, con foco de Acceso `a1f530ec` | 3.266 / 3.132 / 3.258 ms | **3.258 ms** | **527–920 ms** | 0 |

La última serie tiene una respuesta inicial considerablemente más lenta. Aunque el ahorro de bytes y de módulos es verificable, **no se acredita una mejora estable del LCP final**. La serie de 2.748 ms se conserva como resultado intermedio, no como promesa del estado actual. La variación tampoco permite atribuir el empeoramiento al pequeño cambio de foco.

El desglose confirma dos costes restantes. La descarga del recurso LCP baja de unos 2.264–2.277 ms a unos 1.808–1.811 ms en la serie final, pero después quedan 294–448 ms hasta pintarlo. La interfaz necesita cargar y ejecutar JavaScript para crear el elemento. La guía oficial de [optimización del LCP](https://web.dev/articles/optimize-lcp) describe cómo una reducción de transferencia puede trasladar parte de la espera al renderizado; el [desglose de DevTools](https://developer.chrome.com/docs/performance/insights/lcp-breakdown) permite distinguir esas fases.

En escritorio, sin limitación y antes de la corrección exclusiva de foco, se registraron 937 / 408 / 1.398 ms de LCP, CLS 0; el TTFB varió entre 177 y 700 ms. La serie AVIF anterior había dado 371 / 466 / 411 ms. Se conservan ambas. No se volvió a medir INP en esta continuación; los 81 ms del ensayo previo pertenecen a la versión y recorrido sintético del 10 de octubre.

## Validación y trazabilidad

- Compilación TypeScript/Vite y guardianes: correctos. Empaquetado Wrangler sin publicar: correcto. Cada publicación comprobó previamente que ningún otro despliegue hubiera cambiado la versión base.
- Verificación pública final: cinco grupos correctos, incluyendo HTML/JavaScript del build, configuración, disponibilidad, entradas y protección de rutas. Cotejo posterior: **627 archivos sin diferencias** con el manifiesto final; también se registró por separado la huella de `vite.config.ts`.
- Regresión de Inicio: cinco grupos correctos. Presupuestos existentes de paquetes y consulta de 30.000 reservas sintéticas: correctos. La suite completa de 19 grupos corresponde al 10 de octubre; no se presenta como una ejecución nueva.
- Navegador local: Reservar → elección de Terraza → segundo paso → Inicio → regreso a Reservar conserva el borrador. Inicio y Acceso cargan sin excepciones JavaScript. En navegación pública aparecen los 401 esperados de recursos de cuenta sin sesión.
- La precarga local inicialmente se descargaba otra vez porque el servidor de ensayos enviaba `no-store` para todos los recursos. Se alineó la política de assets con producción (`public, max-age=0, must-revalidate`), manteniendo HTML sin almacenamiento. Después se verificó una sola descarga también en local.
- Esta continuación no creó reservas de clientes, no movió dinero y no envió correos. La única prueba de Resend autorizada anteriormente sigue documentada como Delivered a `hey@creativemk.net`; no demuestra el recorrido de la cola del Worker.

Evidencia: [publicación](publicacion.json), [manifiesto](manifest.json), [verificación de versión](verificacion-version.json), [verificación pública](verificacion-publica.json), [assets](verificacion-assets.json), [métricas y condiciones](perfilado.json), [resúmenes finales de DevTools y foco](resumenes-version-final.json), [rendimiento local](rendimiento-local.json), [compilación](build-final.log) y [empaquetado](worker-final.log). Las trazas comprimidas se guardan junto a este informe y pueden importarse en Performance de DevTools; sus prefijos identifican cada etapa. Las capturas `reservas-final-publicada-*` corresponden a `b579fb74`, cuyo diseño no cambió en la corrección posterior de foco; la [captura de Acceso](reservas-acceso-foco-publicado.png) corresponde a la versión final.

## Criterios que todavía requieren cierre

1. **Rendimiento móvil:** sigue por encima de 2,5 s en estas muestras. La siguiente intervención debe reducir la dependencia de JavaScript para mostrar el contenido inicial y contrastar la variación de TTFB desde un teléfono y una conexión representativos. Un objetivo de visitantes requiere medir su percentil 75; tres visitas emuladas no lo certifican.
2. **Inventario y características físicas:** el negocio aún no ha definido mesas, plazas, combinaciones ni atributos verificados. La edición administrativa está preparada y la confirmación en línea continúa bloqueada mientras no exista inventario. No se completó con datos supuestos.
3. **Accesibilidad manual:** ejecutar el [guion](../reservas-2026-10-10/VERIFICACION_MANUAL.md) con NVDA/Edge, VoiceOver/Safari, ampliación nativa y voz. El foco comprobado aquí no certifica esos resultados.
4. **Correo de extremo a extremo:** falta una entrega que atraviese la cola del Worker en un entorno de ensayo autorizado. La autorización anterior cubría un único correo, ya enviado; no se reutilizó para enviar otro.

La implementación anterior y estas mejoras están publicadas. El objetivo integral sigue abierto por estos criterios; no se marca como completamente verificado.
