# Plan de ejecución de las mejoras de Inicio

Objetivo: resolver los 20 hallazgos de la auditoría del 8 de octubre, conservar la identidad visual y demostrar los resultados con pruebas de servidor, interfaz y publicación. Las reglas comerciales se derivan de la implementación vigente; cuando no existe disponibilidad física verificada, el contenido explica elegibilidad sin prometer preparación.

## Etapas y criterios de cierre

1. **Cuenta, promociones y premios (I01–I06, I10–I11).** Una única fuente de experiencias vigentes; capacidad dinámica; cuenta revalidada al volver y recuperar señal; código emitido visible aunque fallen consultas secundarias; vigencia con hora del servidor; error dentro del panel; pase resoluble por caja para cualquier miembro y teléfono internacional.
2. **Inicio orientado a tareas (I07–I09, I12–I13, I16–I17).** Saldo y pase visibles al abrir en móvil; sellos junto a cuenta en escritorio; premio anterior separado de nueva tanda; beneficios descritos según elegibilidad; navegación consistente con retorno al origen; estado contextual de pedido/reserva/avisos; bienvenida válida durante todo el servicio y condiciones de recarga compartidas con caja.
3. **Rendimiento y resiliencia (I14–I15, I18).** Imágenes responsivas y logo optimizado; rutas secundarias diferidas; recuperación de errores de render y validación de contratos; pruebas de regresión específicas y limpieza de comentarios obsoletos relevantes.
4. **Medición y sesión (I19–I20).** Eventos mínimos y agregados sin teléfono, código, saldo o token; vista de métricas protegida para administración y definiciones documentadas. Sesión de cliente en cookie HttpOnly/Secure, protección de origen/CSRF, cierre y revocación; migración segura de sesiones anteriores y coexistencia con el equipo.
5. **Verificación y entrega.** Compilación, suite existente y nuevas regresiones; ocho resoluciones, estados de error, teclado, contraste, texto ampliado y movimiento reducido; comparar carga; desplegar la versión verificada con respaldo y comprobar cliente/contratos publicados sin escrituras sobre clientes reales.

## Reglas de ejecución

- Respaldo previo de código, activos, pruebas, configuración y esquema en `respaldo`; no incluye secretos.
- Cambios de esquema aditivos, con ensayo en bases aisladas antes de aplicarlos; no borrar historial, premios ni saldos.
- El pase identifica; nunca autoriza por sí solo un cobro. El personal conserva sus permisos y controles.
- No inventar horarios, disponibilidad física, precios, promociones ni condiciones de fidelidad.
- Regresiones de P1 desde la primera etapa. No declarar un hallazgo resuelto sin evidencia correspondiente.
- Documentar la implementación y la verificación de cada I01–I20 en la matriz final. Los objetivos de campo de rendimiento y conversión quedan instrumentados; no se inventan resultados de usuarios reales.

## Estado inicial

Plan aprobado por la solicitud de elaborar y ejecutar todas las mejoras. Inicio de ejecución: 9 de octubre de 2026, America/Managua. El proyecto no tiene repositorio Git; se conserva un respaldo local explícito.

## Avance verificado

Etapas 1–4 implementadas. Compilación, suite completa de servidor, nueve grupos nuevos de navegador y recorridos existentes de compras, reservas y correo correctos. Inicio se verificó en ocho resoluciones y las comprobaciones automatizadas de accesibilidad no detectaron infracciones.

Etapa 5 completada. Versión `6af7f335-b72e-4536-9d14-351d62327379` publicada y confirmada al 100 %. Los activos públicos coinciden con sus hashes locales; catálogo y cupos son coherentes y los endpoints privados exigen autenticación. JavaScript inicial reducido de 415,08 a 242,89 kB. LCP mediano de laboratorio: 1,392 s frente a 3,540 s iniciales, con la configuración indicada en `OPERACION.md`; no representa rendimiento de usuarios reales.

Neon no permite más ramas/snapshots en el proyecto actual; las exportaciones privadas de ambas bases se restauraron íntegramente en bases locales aisladas y se compararon por tabla. La migración aditiva se ensayó dos veces sobre esas restauraciones y se aplicó a real y demo comprobando la integridad de los datos existentes. Se conservan las copias remotas anteriores, sin eliminarlas ni cambiar el plan de servicio.

El cierre individual I01–I20 queda en `matriz-cierre.json`; `entrega.html` reúne resultados, capturas y límites de la verificación. Fecha de cierre: 9 de octubre de 2026.
