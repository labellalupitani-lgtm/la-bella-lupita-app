# Plan de investigación — 30 de septiembre de 2026

Pregunta: qué método y herramientas actuales permitirían auditar cada funcionalidad de Club Lupita y su calidad, sin ejecutar la auditoría ni modificar la aplicación.

Contexto preliminar: React 18, TypeScript, Vite, Hono, Cloudflare Workers y cliente Neon/PostgreSQL. El manifiesto ya declara Playwright, axe-core y PGlite; existen scripts de pruebas y documentos de verificaciones anteriores. Esto no acredita su cobertura ni resultados actuales.

Subtemas delegados:
1. Pruebas funcionales de extremo a extremo, componentes, servidor y datos: Playwright, Vitest, Testing Library, pruebas de Workers y aislamiento de PostgreSQL. Entregar capacidades, límites, encaje y alternativas.
2. Seguridad y accesibilidad: requisitos verificables de OWASP, herramientas de análisis y de navegador, WCAG y límites de la automatización. Entregar propuesta proporcionada a una aplicación de pedidos, reservas y membresía.
3. Rendimiento, compatibilidad y operación: Lighthouse, carga, dispositivos reales y observabilidad. Entregar diferencias entre laboratorio, carga y producción, opciones y límites.

Método: 3–5 búsquedas web por subtema, fuentes primarias y documentación oficial; evitar afirmaciones de versiones, precios o novedades sin verificación. Fecha de corte solicitada: 2026-09-30, zona America/Managua. No instalar, ejecutar pruebas, escanear sistemas ni tocar datos operativos. Guardar solamente notas de investigación en esta carpeta.

Síntesis: revisar el inventario local de tecnología y funciones en modo lectura; relacionar los resultados con los módulos reales; proponer una matriz de cobertura, evidencias y prioridades; distinguir herramientas declaradas, herramientas propuestas y capacidades no verificadas. La respuesta final estará en español con enlaces directos a las fuentes.
