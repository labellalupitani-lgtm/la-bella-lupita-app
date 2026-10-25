# Plan de diagnóstico y auditoría de perfiles

Fecha de referencia: 7 de octubre de 2026, America/Managua. Aplicación: Club Lupita / La Bella Lupita. Alcance: código local, base de pruebas aislada y comprobaciones públicas de https://app.labellalupita.com. La imagen aportada define cinco perfiles; Mesa Fundadora es una membresía comercial y se revisa dentro del perfil Cliente.

El objetivo es determinar qué funciona, qué permisos se respetan, qué problemas afectan a cada perfil y qué queda pendiente de validar en infraestructura real. Una auditoría completa no equivale a certificar ausencia de errores ni a desplegar correcciones.

## Perfiles y contrato esperado

| Perfil | Acceso esperado | Restricciones que se deben comprobar |
| --- | --- | --- |
| Propietario | Resumen, pedidos, caja, entregas, agenda, atención, informes, clientes, equipo y seguridad; administrar accesos; consultar muestras archivadas | Reautenticación y control de concurrencia al restablecer claves; separación de datos real/prueba |
| Encargado | Operación completa, clientes, informes, consulta del equipo, seguridad personal | No crear, cambiar roles, desactivar, reactivar ni restablecer claves ajenas; no muestras archivadas |
| Caja | Pedidos, recargas, sellos, canjes, entregas, reservas, atención, consulta puntual de cliente por teléfono, seguridad personal | No directorio general, informes, resumen gerencial ni administración del equipo |
| Cocina | Consulta de pedidos, marcar preparando/listo, seguridad personal | No caja, datos de clientes, entregas, reservas, informes ni equipo; no aceptar, entregar o cancelar pedidos |
| Cliente | Cuenta propia, correo/código, pedido, saldo, sellos, beneficios, compras, membresía, tienda, reservas, atención y baja | No panel de personal ni recursos de otros clientes; no privilegios administrativos por membresía |

## Etapas y evidencia

1. **Inventario y línea base.** Identificar entrada activa, rutas, migraciones, versiones, scripts, perfiles, instrucciones y pruebas existentes. Registrar las condiciones del entorno. Guardar huellas de fuentes auditadas y no confundir copias de respaldo con la aplicación activa.
2. **Revisión estática.** Contrastar controles de interfaz y API; autenticación, expiración, cambio de clave, desactivación, control de roles en cada petición, aislamiento real/demo, acceso por identificadores, datos sensibles, validación de entrada, consistencia y concurrencia. Revisar configuración de despliegue y cobertura de pruebas.
3. **Línea base automatizada.** Ejecutar guardianes, compilación TypeScript/Vite y las suites locales existentes; conservar comando, resultado y salida. Ejecutar secuencialmente las suites que comparten archivos de prueba. Revisar dependencias con `npm audit` sin aplicar actualizaciones automáticas.
4. **Matriz de API y flujos completos.** Añadir pruebas significativas para huecos de permisos, entradas inválidas, accesos directos, privacidad y transición de estados. Probar pedido Cliente → Caja → Cocina → entrega, operaciones contables idempotentes, reservas, beneficios y ciclo de vida de cuentas/accesos. Todas las escrituras usan datos sintéticos locales.
5. **Navegador y calidad.** Ingresar como cada perfil, recorrer sus secciones y accesos prohibidos, recargar y navegar atrás/adelante; verificar sesiones y primera clave; recorrer cliente registrado. Revisar 390 y 1440 px y bordes de 320/768 px, desbordamientos, nombres accesibles, contraste con axe, teclado/foco, carga, vacíos, errores de red, consola y solicitudes fallidas. Capturar pantallas representativas. La comprobación automática de accesibilidad no sustituye una evaluación manual completa con lector de pantalla.
6. **Cierre y dictamen.** Consolidar resultados por perfil, hallazgos con severidad, reproducción, esperado/obtenido y evidencia. Distinguir defectos de aplicación, fallos de pruebas antiguas y limitaciones ambientales. Entregar plan ejecutado, resultados reproducibles y acciones priorizadas.

## Ciclos de ejecución

- **Ciclo 1, descubrir:** ejecutar la línea base y la matriz; registrar cada fallo sin detener los demás recorridos independientes.
- **Ciclo 2, reproducir:** aislar cada fallo, inspeccionar código y datos, repetir el caso específico. Corregir únicamente problemas del instrumento de auditoría cuando falseen el diagnóstico.
- **Ciclo 3, verificar y cerrar:** ejecutar de nuevo los casos corregidos del instrumento y confirmar hallazgos de aplicación con evidencia independiente. Un defecto reproducido se cierra como hallazgo confirmado con propuesta de solución; no se convierte en aprobado.
- Los ciclos adicionales se justifican por nueva evidencia. No se repiten suites ya aprobadas sin cambios o dudas relevantes.

## Clasificación y criterio de finalización

Estados: aprobado, fallo confirmado, no ejecutado con motivo, o no aplicable. Severidad: crítica (acceso no autorizado o integridad grave), alta (flujo principal bloqueado o privacidad), media (operación parcial, recuperación o accesibilidad), baja (claridad, mantenimiento o detalle visual).

El trabajo termina cuando los cinco perfiles tienen evaluación explícita, las pruebas ejecutadas tienen resultados conservados, los fallos observados están reproducidos o identificados como limitaciones, y existe un informe con prioridades y brechas. Los controles que requieren correo externo real, credenciales de empleados reales, múltiples bases remotas o infraestructura de Cloudflare deben identificarse expresamente si solo se comprobaron con sustitutos locales.

## Entregables

- `PLAN.md`: alcance, matriz y proceso antes de ejecutar.
- `INFORME.md` y vista HTML: dictamen y resultados por perfil.
- `logs/`: salidas de las comprobaciones ejecutadas.
- `evidencia/`: resultados JSON, capturas y casos reproducibles.
- Pruebas nuevas dentro de `tests/`, con instrucciones de repetición.

Referencia de plataforma: [Cloudflare Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/), consultada durante la auditoría. Se aplica al revisar comportamiento de Workers; los permisos comerciales se contrastan con la imagen y el código de la aplicación.

## Registro de finalización

Las seis etapas están ejecutadas. El inventario y las huellas se conservan en evidencia; la revisión estática tiene informes de backend y frontend; el build y las diez suites de API existentes pasaron; la matriz adicional validó 132 lecturas y 60 denegaciones; el recorrido general pasó 97 controles en Edge y otros 97 en Firefox. Los cuatro defectos de API y cinco de interfaz fueron reproducidos en dos ciclos. Se descartaron tres falsos positivos causados por transiciones de color y se resolvió la ausencia del ejecutable Firefox requerido por el instrumento. El [informe final](INFORME.md) contiene los nueve hallazgos, sus criterios de corrección y los límites de la aceptación local.
