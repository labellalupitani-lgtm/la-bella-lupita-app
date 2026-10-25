# Plan de ejecución de mejoras de Perfil

9 de octubre de 2026 · Objetivo: resolver los 18 asuntos y recomendaciones de la auditoría, conservando los cambios posteriores de Inicio, Carta, Tienda y Mi Club.

## Estado inicial revalidado

- No hay repositorio Git ni AGENTS.md aplicable encontrado. Se conserva respaldo explícito de fuentes, migraciones, pruebas y configuración sin secretos antes de editar.
- Migraciones actuales llegan a 025_club_operacion.sql. La nueva migración de Perfil será 026_perfil.sql, aditiva.
- F02 cambió: la aplicación ya usa cookie HttpOnly con sesión revocable (021_inicio_sesion.sql). Se verificará esta protección y se completará gestión de sesiones/salida local pendiente, sin restaurar tokens en localStorage.
- F15 mejoró parcialmente: movimientos y puntaje se validan; faltan campos personales/fechas de perfil.
- Mi Club tiene reglas y pantallas nuevas; Perfil enlazará esa fuente, sin inventar ni reemplazar beneficios.
- Los otros chats relevantes figuran sin ejecución activa al inicio; los archivos siguen siendo la fuente autoritativa. Antes de publicar se cotejarán hashes y el estado remoto nuevamente.

## Etapas y pruebas de aceptación

1. **Datos y edición (F01, F05, F06, F15, F17, parte F18).** Contrato compartido estricto, lectura independiente de perfil, versión atómica, conflicto 409 y respuesta canónica, actualización local sin catálogo/cupos. Borrador persistente al cerrar, operación estable y conciliación explícita. Auditoría solo de campos realmente cambiados sin valores privados. Probar dos borradores, guardar/cerrar/reabrir, respuesta perdida y payload corrupto.
2. **Cuenta y servicio (F02, F03, F08, F09, F10, F12).** Conservar sesión protegida; cierre de todas las sesiones y recuperación de salida sin red. Perfil muestra correo verificado/contacto, preferencias reales de correo, cumpleaños sin año nuevo innecesario, propósito y visibilidad de datos. Solicitudes de cambio de acceso/privacidad con categoría, permisos, seguimiento y resolución verificable. Alergias confirmadas por pedido, instantánea y acuse del equipo antes de preparación. Probar permisos de cliente/caja/cocina, persistencia, revocación y recorrido de solicitudes.
3. **Experiencia (F04, F07, F11, F13, F14, F18).** Identidad compacta y edición inmediata; cuenta/comunicaciones/ayuda claras; saldo y movimientos diferenciados, puente a reglas de Mi Club; invitación secundaria. Nombres largos, fechas Managua, etiquetas y anuncios estables, errores asociados. Probar móvil/escritorio, nombre máximo, teclado, foco, errores y zoom/reflujo.
4. **Rendimiento y mantenimiento (F16, F17, F18).** Desacoplar perfil de lectura completa de cuenta, agrupar consultas compatibles sin alterar contabilidad; instrumentar latencia/resultado con datos mínimos, validar métricas y no incluir PII. Revisar compatibilidad del Worker y tipos sin cambiar reglas de negocio. Medir consultas y pruebas en runtime.
5. **Integración y publicación.** Ejecutar regresiones relevantes y suite completa, build/guardian/tipos, ensayar migración en base aislada y runtime real. Preparar respaldo/migración reversible por adición, publicar versión verificada en destino vigente conservando secretos y datos. Comprobar assets/cabeceras/versión y evidencia de cada hallazgo. Nunca cargar pedidos/clientes sintéticos en producción.
6. **Cierre por requisito.** Mantener matriz F01–F18 con archivos, pruebas y evidencia. Las validaciones humanas/operativas que no puedan simularse se distinguirán de pruebas técnicas y se solicitarán sin afirmar resultados inexistentes. No declarar completo el objetivo con requisitos pendientes.

## Invariantes

- No pérdida silenciosa de datos, saldos, membresías ni accesos.
- No secretos en entregables; ninguna prueba con datos reales de clientes.
- Perfil no promete beneficios ni políticas de retención que no estén definidos.
- Cocina recibe solo indicaciones pertinentes al pedido confirmado, no el expediente personal.
- Cambiar correo/teléfono no transfiere identidad automáticamente: verificación humana o técnica obligatoria.
- Las acciones de privacidad son solicitudes explícitas y trazables, no borrado financiero automático.

## Registro

Etapas 1–5: implementación, regresiones, respaldo, migración y publicación verificadas. Etapa 6: matriz documentada; 13 asuntos cerrados técnicamente y 5 pendientes de validación presencial o definición operativa. Ver RESULTADO.md y VALIDACION-PRESENCIAL.md.

Revisión de cierre: se añadió a F17 el intervalo del cliente hasta aplicar/renderizar el resultado, con pruebas de privacidad y fallo de telemetría; F13 se verificó con tres instantes en tres zonas. La versión corregida pasó regresión y se publicó sin una nueva migración. Los cinco requisitos externos conservan sus criterios de salida y una plantilla de acta; no constan como aprobados.
