# Plan de reducción de consumo

Encargo activo: elaborar y ejecutar los cambios derivados del diagnóstico de cuota. Se conserva el diseño publicado y la integridad de reservas, renovaciones y cobros. No se contratan servicios ni se intenta eludir la cuota agotada.

## Evidencia de partida

Neon: 110,50 CU-h registradas; producción 60,52 y demostración 49,21. Dos bases con mínimo 1 CU se despiertan cada hora. El 80 % del tiempo reconstruido coincide con ese mantenimiento. Fuente: ../auditoria-cuota-2026-10-22/INFORME.md. La cuota agotada no se recupera reduciendo consumo.

## Secuencia y criterios de aceptación

1. Guardar configuración remota, versión desplegada y copia de fuentes antes de modificar. Establecer un procedimiento reproducible de reversión.
2. Separar demostración del mantenimiento periódico. Procesarla sólo cuando se utiliza. Producción conserva renovaciones y procesamiento de correos; limpieza de sesiones y métricas como máximo una vez al día.
3. Guardar fuera de PostgreSQL la siguiente fecha de trabajo pendiente. Las comprobaciones automáticas sin trabajo no consultan Neon. Invalidar la planificación cuando cambia una reserva o membresía; conservar reintentos, recuperación ante fallos e idempotencia. Reconciliación diaria como respaldo de cambios externos.
4. Reducir las relecturas del navegador: Mi Club e Inicio actualizan los datos que muestran; suspender consultas cuando la pestaña queda inactiva; refrescar al volver. Los procesos de compra y canje mantienen validación en el servidor y su seguimiento activo.
5. Configurar mínimo 0,25 CU en producción, demostración y valores predeterminados, manteniendo máximo 2 CU y suspensión automática. Registrar el resultado real de cada operación. La prueba de rendimiento real queda condicionada a que Neon vuelva a aceptar conexiones; las pruebas locales no sustituyen esa medición.
6. Añadir estado de disponibilidad y control de cuota con presupuesto, umbrales 60/80/90 % y proyección, consultando el plano de gestión sin despertar la base. No exponer credenciales ni cifras internas a visitantes, ni enviar correos externos de prueba.
7. Verificar renovaciones sin duplicación, reservas/correos/reintentos, aislamiento demo, carreras del programador, pausas/reanudación del navegador y compilación. Ensayar el despliegue; publicar y comprobar versión, configuración y rutas.

## Límites y cierre

Se distingue entre cambios implementados, cambios publicados y funcionamiento que requiere recuperar cuota. No declarar restaurada la app mientras la base responda 402. No usar datos ficticios como sustituto de saldos reales. Comparar consumo posterior por intervalos reales, sin atribuir a esta corrección el consumo histórico del mes.
