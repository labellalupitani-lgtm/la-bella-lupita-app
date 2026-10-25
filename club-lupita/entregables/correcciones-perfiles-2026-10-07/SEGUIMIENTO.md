# Seguimiento de correcciones

Estado final de ejecución. Detalles y evidencias en [CIERRE.md](CIERRE.md). Versión publicada `144530db-b68b-4f0a-b3a3-b45ce04ca034`.

| Punto | Estado | Implementación / evidencia |
| --- | --- | --- |
| T01–T02 | Hecho | Plan maestro, respaldo local y `evidencia/infra-antes.json`. |
| UI-01 | Corregido, verificado y publicado | Centavos; recarga 200.49 en confirmación y registro. |
| UI-02 | Corregido, verificado y publicado | Error/foco dentro del modal, referencia persistente e idempotencia. |
| UI-03 | Corregido, verificado y publicado | Última lectura y recuperación explícita. |
| UI-04 | Corregido, verificado y publicado | Reintento de catálogo sin recargar documento. |
| UI-05 / T08 | Corregido, verificado y publicado | Token correspondiente, pestañas, timeout y respuestas antiguas. |
| B-01 | Corregido, verificado y publicado | Proyección de plazas sin mutación, compartida con panel. |
| B-02 | Corregido, verificado y publicado | Fecha calendario antes de SQL, 422 también en producción. |
| B-03 | Corregido, verificado y publicado | Rango bigint antes de SQL. |
| B-04 | Corregido, verificado y publicado | Validación en el alta del acceso vigente. |
| O-01 | Actualizado y mitigado con residual explícito | Producción 0; desarrollo 5 alertas transitivas braces, parche local probado. |
| O-02 | Verificado y publicado | CSP/cabeceras; Web Analytics existente compatible; cero CSP en comprobación pública final. |
| O-03 | Verificado y publicado | Cron cada hora, minuto 17, real/demo independientes. |
| O-04 | Verificado y publicado | Alta temporal 24 h, cambio obligatorio; cuentas existentes conservadas. |
| O-05 | Verificado y publicado | Cocina recibe solo datos de preparación. |
| O-06 | Ensayo terminado y recursos limpiados | 4 grupos Neon; correo real a buzón no certificado. |
| O-07 | Pruebas ejecutadas | Tres motores, teclado, foco, reflujo y texto; no certificación de dispositivos/lector físico. |
| Contención adicional | Corregida y verificada | 503 recuperable y reintento de la misma referencia, sin duplicar cargos. |
| T13–T15 | Hecho | Copia exacta, SHA-256, publicación, verificación, reversión documentada e informe. |

## Incidencia de integración

Se detectaron cambios del chat «Audita el acceso de administradores» en esta misma carpeta. El usuario autorizó coordinar y mantuvo ese trabajo pausado. Se conservaron sus avances y se publicó una copia aislada con el acceso vigente. La nueva autenticación y migración 020 no fueron publicadas. Ver [CONTINUIDAD.md](CONTINUIDAD.md) antes del siguiente despliegue del árbol principal.
