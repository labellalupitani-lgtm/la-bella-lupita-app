# Plan de auditoría de Perfil — 8 de octubre de 2026

## Pregunta
¿Qué tan comprensible, útil, accesible, confiable y segura es la pestaña Perfil que hoy usa La Bella Lupita, y qué mejoras tienen más impacto?

## Líneas de investigación
1. Experiencia, contenido, arquitectura de información, relación con Mi Club y servicio en barra. Revisar implementación activa y respaldar recomendaciones con fuentes primarias; distinguir preferencias de defectos.
2. Accesibilidad y robustez del frontend: formularios, diálogos, teclado, estados de carga/error, adaptación y consistencia de datos. Contrastar con W3C/WAI y documentación oficial.
3. Backend, identidad, privacidad y operación: autorización, validación, actividad, sesiones y datos personales. Contrastar con OWASP y Cloudflare; distinguir hallazgos confirmados de riesgos condicionados.
4. Verificación integrada a cargo del agente principal: versión pública, recorridos y pruebas locales aisladas con datos sintéticos; capturas, registros y matriz de evidencia.

## Método y entregables
- Hasta tres investigadores en paralelo, con 3–5 búsquedas web máximo por línea y archivos findings_*.md separados.
- Revisar las auditorías anteriores como antecedentes, nunca como prueba del estado actual.
- No modificar código funcional ni publicar cambios. No ejecutar escrituras o pruebas destructivas sobre cuentas reales.
- Sintetizar un informe con evidencia reproducible, prioridad, impacto, propuesta y criterios de aceptación, además de límites de verificación.
- Conservar scripts y resultados nuevos dentro de esta carpeta.
