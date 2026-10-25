# Cobertura actual por módulo

Se inspeccionaron las 11 rutas registradas: diez de cliente/sistema y `/personal`, que contiene doce secciones. Acceso y ruta desconocida también se revisaron. No se hereda un PASS de entregas anteriores: los resultados citados aquí se ejecutaron en este ciclo.

La matriz común prueba320/390/768/1440, texto al 200 % a 320, imágenes, errores de ejecución y axe. Los árbitros agregan inspección visual, teclado y estados. Los resultados de negocio provienen de fixtures locales con Worker real; las interrupciones de red/respuestas incompletas se simulan en el navegador.

| Página / ruta | Cobertura actual complementaria | Límite relevante |
|---|---|---|
| Inicio `/` | Saldo privado y persistencia, pase, recarga informativa, contexto de visita, navegación y métricas; suite Inicio17 | Sin recarga física ni dispositivo real |
| Carta `/pedir` | Búsqueda/filtros, detalle, teclado, carrito/contrato/cobro/recuperación en fixture; acceso público y vuelta al producto | Disponibilidad real y preparación física no comprobadas |
| Tienda `/tienda` | Oferta/consentimiento, compra y respuesta perdida, recuperación, contrato incompleto y referencia local;14 casos UI con muestras Firefox/WebKit | Sin entrega física ni lote comercial real |
| Mi Club `/club` | Consentimiento, membresía, beneficio/código, renovación y cancelación, entrada de experiencia, espera;24 casos UI en 3 motores | Cron y entregas reales no certificados |
| Conocé `/conoce-tu-club` | Cinco beneficios, enlaces, seisFAQ, teclado, condiciones503/reintento, oferta vigente y rechazo de cambio de precio;21 casos UI en 3 motores | No se modificaron contratos/reglas comerciales |
| Perfil `/perfil` | Edición/validación, conflictos y recuperación, actividad/filtros, ayuda, privacidad/salida;10 casos UI, texto al 200 % y Tab natural | No se usaron dispositivos o cuentas reales |
| Mis compras `/compras` | Listado, filtros, vacío, carga/error/reintento, comprobantes de compras sintéticas | No se comprobó cada combinación histórica de comprobante |
| Mis reservas `/reservas` | Reserva, cambio, calendario, cancelación; error/vacío/recuperación de horarios; reembolso en pruebas de servidor | No se confirmó anticipo o asistencia real |
| Reservar `/reservar` | Zona/fecha/grupo/revisión, alta/cambio/cancelación, acceso público, errores, reflujo de pie y foco | Se probaron anchos emulados, no teclado virtual físico |
| Kit `/kit` | Galería, componentes, estados, teclado, tamaños y axe | Controles de demostración no son operaciones comerciales |
| Acceso | Deshabilitado, error/reintento, correo/código, validación, alta y reingreso; continuidad Carta | Correo simulado; no proveedor ni entrega real |
| Desconocida | Mensaje, regreso a Inicio, teclado, reflujo | No equivale a auditar rutasAPI |

| Sección de `/personal` | Cobertura actual | Límite de la revisión visual |
|---|---|---|
| Resumen | Indicadores/enlaces, cuatro tamaños, carga, sincronización | Cifras de muestra; cálculo respaldado por suites de servidor |
| Pedidos | Lista, disponibilidad, fichas, medición, filtros/foco, roles, carga | Transiciones completas respaldadas por `operacion`/`carta`; no cocina física |
| Caja | Cuatro tareas, cliente/código, validaciones y diálogos | Recarga/canje respaldados por pruebas de operación y Club; sin caja real |
| Mi Club | Condiciones, reglas, experiencias, espera, reposiciones, métricas y diálogos | No se publicó configuración real; reglas/operaciones probadas en servidor |
| Tienda | Ficha/lote, filtros, paginación, permisos y seguimiento | Listas visuales parcialmente vacías; entrega/reembolso respaldados por tests de servidor |
| Entregas | Lista, filtros, vacío, fallo/reconexión, teclado | Sin entrega física; autorización/operación en suites de servidor |
| Agenda | Fecha, reserva manual/configuración, inventario, sincronización y roles | No se guardó configuración de producción; reservas/reembolsos probados con fixture |
| Atención | Buscar, vacío, limpiar con teclado, sincronización | Resolución respaldada por pruebas de operación; no se contactó a clientes |
| Informes | Período, cifras, actividad, detalles, buscar/limpiar | No se certificó contenido de CSV con ventas reales |
| Clientes | Directorio, filtros, ficha/historial, permisos, retorno de foco | Sin edición ni archivo de cuentas reales; suite clientes del servidor pasó |
| Equipo y permisos | Directorio, invitación, roles, diálogo y permisos; invitación/activación real en fixture de seguridad | Sin accesos reales |
| Cuenta y seguridad | Identidad, bloqueo, salida, contraseña, códigos, recuperación y MFA;7 casos UI con Worker | Sin dispositivo autenticador físico ni recuperación de personal real |

Propietario y encargado:12 secciones; caja:7; cocina:2. Menús y redirecciones de cliente se revisaron con cuatro cuentas sintéticas; `npm test` también comprobó autorizaciones en servidor. Una redirección visual por sí sola no acredita seguridad.

## Evidencia y rondas

- `revision-comercio.md` → `revision-comercio-final.md`: C1–C5 corregidos; adenda de respuesta 200 inválida sobre build final.
- `revision-cuenta.md` → `revision-cuenta-final.md`: CU-01–CU-04 corregidos.
- `revision-equipo.md` → `revision-equipo-final.md`: H1/E1,H2/E2,H3 corregidos, con foco en cinco formularios y sincronización en 23 instancias.
- Constructor: región desplazable de detalle sin foco corregida; cinco regresiones de acceso y cinco de estados pasaron.
- `evidencia/integral/resultados.json`:138 registros sobre buildD7uKApT5.
- `evidencia/entrega/resultados.json`:23 vistas y recursos de buildBdaynFmx, sin errores ni desbordes.
- Logs actuales y JSON por suite en `evidencia/`; `servidor.log` corresponde a las 21 suites de `npm test` completas.

Las auditorías automáticas no sustituyen lector de pantalla ni evaluación en dispositivos físicos. Se midió tamaño de recursos; no se ejecutó una comparación controlada de Core Web Vitals. La aprobación técnica no autoriza producción.
