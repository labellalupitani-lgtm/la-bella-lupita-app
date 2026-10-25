# Investigación: seguridad y accesibilidad de Club Lupita

Fecha de corte: 30 de septiembre de 2026. Investigación documental, sin instalar herramientas, ejecutar pruebas, escanear la aplicación ni modificar código. El encaje parte de la arquitectura y los módulos comunicados para esta investigación: React/TypeScript, API Hono sobre Cloudflare Workers, Neon PostgreSQL, cuentas, pedidos, reservas, membresías y personal. Los casos siguientes son propuestas de auditoría; no describen vulnerabilidades encontradas.

## Conclusión práctica

Para esta aplicación, conviene combinar una matriz de requisitos con pruebas dirigidas de permisos y procesos de negocio, análisis del código y de dependencias, y evaluación de accesibilidad durante recorridos reales. Un escáner aislado no permite concluir que todos los aspectos funcionan correctamente. Selección pequeña: **Playwright + axe-core**, **npm audit** y **ZAP**; **Semgrep** como complemento para revisión del código. Los criterios de evaluación deberían apoyarse en **OWASP ASVS 5.0.0 / WSTG 4.2** y **WCAG 2.2 nivel AA**. La selección y priorización son recomendaciones para el proyecto, no un mandato universal de esas fuentes.

## Referencias para decidir qué revisar

- **OWASP ASVS 5.0.0** aporta requisitos verificables de seguridad y permite relacionar cada control con una prueba, una evidencia y un resultado. La página oficial identifica 5.0.0 como última versión estable. Registrar la versión junto a cada identificador evita que cambios posteriores alteren la referencia del informe. [ASVS oficial](https://owasp.org/projects/asvs).
- **OWASP WSTG 4.2** aporta procedimientos de prueba; la página oficial publica 4.2 y mantiene 5.0 en desarrollo. Utilizar documentos versionados para un informe reproducible. [WSTG oficial](https://owasp.org/projects/web-security-testing-guide).
- **OWASP Top 10 2025** es la edición vigente que identifica la página oficial; sintetiza grandes categorías de riesgo y sirve para comunicación y priorización. Para una auditoría, mi recomendación es desarrollar la matriz de controles con ASVS y las pruebas con WSTG: limitar el trabajo a diez categorías no define por sí solo todos los casos verificables. [OWASP Top 10](https://owasp.org/projects/top-ten).

## Seguridad: herramientas y límites

| Recurso | Aporte concreto | Aplicación propuesta | Límite que debe quedar en el informe |
|---|---|---|---|
| Pruebas API y navegador mediante Playwright, más revisión de endpoints | Verificar comportamientos definidos para cada identidad y estado | Comprobar permisos de cuentas, acceso a pedidos/reservas y acciones del personal | Hay que especificar quién puede hacer qué; un recorrido exitoso no prueba aislamiento entre usuarios |
| npm audit | Consulta vulnerabilidades conocidas de las dependencias del proyecto | Revisar dependencias frontend/backend y distinguir dependencias de ejecución y desarrollo | Su alcance son avisos conocidos; no verifica reglas de negocio ni permisos |
| ZAP | Examina tráfico HTTP y permite exploración y escaneo de seguridad | Observar recorridos autenticados y revisar cabeceras, cookies y alertas; escaneo activo posterior en un entorno de pruebas | Cobertura dependiente de rutas y estados alcanzados; no reemplaza pruebas de autorización o lógica |
| Semgrep | Análisis estático basado en reglas y flujos de datos; soporte JavaScript/TypeScript | Complementar la revisión de código React/Hono con reglas seleccionadas y revisión de hallazgos | Cobertura variable por regla y edición; los hallazgos requieren comprobación contextual |

**npm audit:** envía una descripción de las dependencias al registro configurado y solicita un informe. Para investigación de un estado se usaría el informe de auditoría; `npm audit fix` modifica el árbol de paquetes y ejecuta la lógica de instalación. Por tanto, las actualizaciones correctivas serían una fase posterior con pruebas de regresión. Un resultado sin avisos significa que no se encontraron avisos conocidos en esa consulta, no ausencia demostrada de vulnerabilidades. [Documentación npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/).

**ZAP:** el análisis pasivo examina mensajes sin cambiarlos. Eso no convierte en inocuo todo el recorrido que genera dichos mensajes: una navegación o prueba que confirme un pedido puede modificar datos por sí misma. Para la aplicación propondría cuentas y datos ficticios en staging. [Escáner pasivo](https://www.zaproxy.org/docs/desktop/addons/passive-scanner/). El escaneo activo envía ataques de prueba y debe limitarse al entorno propio autorizado, con alcance y exclusiones definidos. La documentación de ZAP advierte que el escáner activo encuentra ciertos tipos de problemas y no sustituye la revisión de lógica y control de acceso. [Escaneo activo](https://www.zaproxy.org/docs/desktop/start/features/ascan/).

**Semgrep:** distingue entre Community Edition, cuyo análisis de flujo se limita a una función, y capacidades más amplias de Semgrep Code, incluido análisis entre archivos. No asumir que el resultado de una edición equivale al de otra. Las reglas deben ajustarse al código real; el soporte de TypeScript no confirma por sí solo cobertura específica de todos los patrones de Hono. [Descripción y diferencias](https://docs.semgrep.dev/semgrep-code/overview), [lenguajes soportados](https://docs.semgrep.dev/supported-languages).

## Los casos de permisos tienen prioridad

WSTG recomienda disponer de al menos dos usuarios con objetos distintos y, cuando corresponda, usuarios con privilegios diferentes para comprobar referencias directas a objetos. [WSTG: referencias directas inseguras](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References/).

Propuesta propia para Club Lupita, a ajustar a sus permisos reales:

1. Crear una matriz **rol × acción × objeto × estado**. Incluir visitante, dos clientes distintos, personal con permisos diferentes y administrador si esos perfiles existen.
2. Comprobar que el cliente A no pueda leer, editar o cancelar el pedido/reserva del cliente B, ni consultar datos de su cuenta o membresía, cambiando identificadores de las solicitudes.
3. Comprobar que el personal solo ejecute las acciones asignadas y que una acción denegada no altere la base de datos. Verificar el endpoint directamente: ocultar un botón no demuestra protección del servidor.
4. Probar sesión ausente, vencida y cerrada; cambio de permisos; cuenta desactivada; referencias a registros inexistentes y entradas inválidas.
5. Probar intentos de enviar precios, descuentos, puntos o niveles de membresía alterados desde el cliente cuando estos valores deban calcularse en servidor; reenvío de una solicitud y doble clic; transiciones de pedido/reserva no permitidas. Las reglas esperadas deben confirmarse con el negocio.

La evidencia de cada caso debería incluir identidad ficticia, estado inicial, solicitud, respuesta, efecto comprobado en datos y resultado esperado/real. Evitar tokens, contraseñas o datos de clientes en capturas e informes.

## Accesibilidad: automatizar durante el uso de la aplicación

**Playwright + `@axe-core/playwright`:** permite incorporar escaneos de accesibilidad a los recorridos funcionales. La documentación muestra detección de problemas como contraste, etiquetas y propiedades de controles. El análisis se realiza sobre el estado actual de la página; en una aplicación React conviene abrir menús y modales, activar validaciones y llegar a los estados relevantes antes de analizar. La propia documentación exige complementar la automatización con evaluación manual y pruebas inclusivas. [Guía oficial](https://playwright.dev/docs/accessibility-testing).

**WCAG 2.2 AA como objetivo técnico propuesto:** W3C recomienda WCAG 2.2 para nuevos esfuerzos. Incluye criterios especialmente pertinentes para esta app: foco no oculto, tamaño mínimo de objetivos, alternativas al arrastre, evitar pedir información redundante y autenticación accesible. La fuente consultada identifica la recomendación del 12 de diciembre de 2024. No constituye por sí sola una afirmación de obligación legal local. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

Propuesta de revisión manual: completar registro/inicio de sesión, selección de productos, pedido, reserva y tareas de personal usando solo teclado; revisar orden y visibilidad del foco, entrada/salida de modales, mensajes de error y confirmación con lector de pantalla, ampliación de texto y reflujo en pantalla estrecha. Confirmar que la información y las acciones sigan siendo comprensibles. Una evaluación de procesos debe cubrir los pasos completos, también los estados de error.

**Límite:** ningún resultado limpio de axe demuestra conformidad total. W3C señala que las herramientas no pueden comprobar automáticamente todos los aspectos. El entregable debe separar criterios comprobados automáticamente, revisados manualmente, no aplicables y pendientes; no usar un porcentaje de escáner como certificado. [W3C: selección de herramientas de evaluación](https://www.w3.org/WAI/test-evaluate/tools/selecting/).

## Orden sugerido y condición de cierre

Primero definir alcance, flujos y permisos; después producir casos positivos/negativos reproducibles y datos de prueba; ejecutar revisión de dependencias/código y accesibilidad automatizada sobre esos flujos; incorporar ZAP y pruebas manuales dirigidas; finalmente reproducir, priorizar y documentar hallazgos. La condición de cierre debe expresar qué versiones, rutas, roles y estados se verificaron, qué falló y qué quedó fuera. Esta investigación no ha medido ni certificado el estado actual de Club Lupita.
