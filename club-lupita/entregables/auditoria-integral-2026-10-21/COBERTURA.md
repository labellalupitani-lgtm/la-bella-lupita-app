# Matriz consolidada de cobertura

Cada fila tiene resultado y evidencia. Revisado no equivale a aprobado: los defectos permanecen documentados. La cobertura de laboratorio y las comprobaciones de campo se cuentan por separado. No es el producto cartesiano de todos los datos posibles.

[JSON completo](cobertura.json) · [CSV completo](cobertura.csv)

| Grupo / estado | Filas |
|---|---:|
| base / revisado | 30 |
| compra / revisado | 125 |
| compra / no_aplicable | 11 |
| visitas / revisado | 183 |
| visitas / no_aplicable | 3 |
| equipo / revisado | 329 |
| equipo / no_aplicable | 13 |
| campo / pendiente | 2 |

## Inventario base

11 rutas: `/`, `/pedir`, `/tienda`, `/conoce-tu-club`, `/club`, `/reservas`, `/reservar`, `/perfil`, `/compras`, `/kit`, `/personal`. Además: acceso público, acceso del equipo, ruta inexistente, carga fallida, sesión vencida, selector local y comunicaciones.

12 módulos: Resumen, Pedidos, Caja, Mi Club, Tienda, Entregas, Agenda, Atención, Informes, Clientes, Equipo y permisos, Cuenta y seguridad. Roles: visitante, cliente, miembro, propietario, encargado, caja y cocina.

Anchos de pantalla: 320, 390, 768, 913 y 1440 px; 913 incluye canal de scroll de Windows. Texto 200%, foco, teclado, contraste, nombres largos y movimiento reducido figuran en registros específicos. Formularios/diálogos y variantes se identifican por estado.

## Filas del inventario

| ID | Ruta | Rol | Estado | Ancho | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| base-acceso-0 | / | visitante | normal | 320 | revisado | [acceso-320.png](base/acceso-320.png) |
| base-acceso-1 | / | visitante | normal | 390 | revisado | [acceso-390.png](base/acceso-390.png) |
| base-acceso-contraste-2 | / | visitante | accesibilidad automatizada | 390 | revisado | [acceso-axe.json](base/acceso-axe.json) |
| base-acceso-3 | / | visitante | normal | 768 | revisado | [acceso-768.png](base/acceso-768.png) |
| base-acceso-4 | / | visitante | normal | 913 | revisado | [acceso-913.png](base/acceso-913.png) |
| base-acceso-5 | / | visitante | normal | 1440 | revisado | [acceso-1440.png](base/acceso-1440.png) |
| base-kit-6 | /kit | visitante | normal | 320 | revisado | [kit-320.png](base/kit-320.png) |
| base-kit-7 | /kit | visitante | normal | 390 | revisado | [kit-390.png](base/kit-390.png) |
| base-kit-contraste-8 | /kit | visitante | accesibilidad automatizada | 390 | revisado | [kit-axe.json](base/kit-axe.json) |
| base-kit-9 | /kit | visitante | normal | 768 | revisado | [kit-768.png](base/kit-768.png) |
| base-kit-10 | /kit | visitante | normal | 913 | revisado | [kit-913.png](base/kit-913.png) |
| base-kit-11 | /kit | visitante | normal | 1440 | revisado | [kit-1440.png](base/kit-1440.png) |
| base-acceso-equipo-12 | /personal | visitante | normal | 320 | revisado | [acceso-equipo-320.png](base/acceso-equipo-320.png) |
| base-acceso-equipo-13 | /personal | visitante | normal | 390 | revisado | [acceso-equipo-390.png](base/acceso-equipo-390.png) |
| base-acceso-equipo-contraste-14 | /personal | visitante | accesibilidad automatizada | 390 | revisado | [acceso-equipo-axe.json](base/acceso-equipo-axe.json) |
| base-acceso-equipo-15 | /personal | visitante | normal | 768 | revisado | [acceso-equipo-768.png](base/acceso-equipo-768.png) |
| base-acceso-equipo-16 | /personal | visitante | normal | 913 | revisado | [acceso-equipo-913.png](base/acceso-equipo-913.png) |
| base-acceso-equipo-17 | /personal | visitante | normal | 1440 | revisado | [acceso-equipo-1440.png](base/acceso-equipo-1440.png) |
| base-acceso-texto200-18 | / | visitante | texto 200% por tamaño computado | 320 | revisado | [acceso-texto200-320.png](base/acceso-texto200-320.png) |
| base-kit-texto200-19 | /kit | visitante | texto 200% por tamaño computado | 320 | revisado | [kit-texto200-320.png](base/kit-texto200-320.png) |
| base-acceso-equipo-texto200-20 | /personal | visitante | texto 200% por tamaño computado | 320 | revisado | [acceso-equipo-texto200-320.png](base/acceso-equipo-texto200-320.png) |
| base-ruta-inexistente-21 | /ruta-audit-inexistente | visitante | 404 | 390 | revisado | [ruta-inexistente-390.png](base/ruta-inexistente-390.png) |
| base-correo-acceso-22 | correo OTP | visitante | correo simulado | 390 | revisado | [correo-acceso-390.png](base/correo-acceso-390.png) |
| compra-CO-001-0 | / | cliente | base | 320 | revisado | [cliente-inicio-320.png](compra/capturas/cliente-inicio-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-002-1 | / | cliente | base | 390 | revisado | [cliente-inicio-390.png](compra/capturas/cliente-inicio-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-003-2 | / | cliente | base | 768 | revisado | [cliente-inicio-768.png](compra/capturas/cliente-inicio-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-004-3 | / | cliente | base | 913 | revisado | [cliente-inicio-913.png](compra/capturas/cliente-inicio-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-005-4 | / | cliente | base | 1440 | revisado | [cliente-inicio-1440.png](compra/capturas/cliente-inicio-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-006-5 | /pedir | cliente | base | 320 | revisado | [cliente-pedir-320.png](compra/capturas/cliente-pedir-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-007-6 | /pedir | cliente | base | 390 | revisado | [cliente-pedir-390.png](compra/capturas/cliente-pedir-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-008-7 | /pedir | cliente | base | 768 | revisado | [cliente-pedir-768.png](compra/capturas/cliente-pedir-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-009-8 | /pedir | cliente | base | 913 | revisado | [cliente-pedir-913.png](compra/capturas/cliente-pedir-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-010-9 | /pedir | cliente | base | 1440 | revisado | [cliente-pedir-1440.png](compra/capturas/cliente-pedir-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-011-10 | /tienda | cliente | base | 320 | revisado | [cliente-tienda-320.png](compra/capturas/cliente-tienda-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-012-11 | /tienda | cliente | base | 390 | revisado | [cliente-tienda-390.png](compra/capturas/cliente-tienda-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-013-12 | /tienda | cliente | base | 768 | revisado | [cliente-tienda-768.png](compra/capturas/cliente-tienda-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-014-13 | /tienda | cliente | base | 913 | revisado | [cliente-tienda-913.png](compra/capturas/cliente-tienda-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-015-14 | /tienda | cliente | base | 1440 | revisado | [cliente-tienda-1440.png](compra/capturas/cliente-tienda-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-016-15 | /compras | cliente | base | 320 | revisado | [cliente-compras-320.png](compra/capturas/cliente-compras-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-017-16 | /compras | cliente | base | 390 | revisado | [cliente-compras-390.png](compra/capturas/cliente-compras-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-018-17 | /compras | cliente | base | 768 | revisado | [cliente-compras-768.png](compra/capturas/cliente-compras-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-019-18 | /compras | cliente | base | 913 | revisado | [cliente-compras-913.png](compra/capturas/cliente-compras-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-020-19 | /compras | cliente | base | 1440 | revisado | [cliente-compras-1440.png](compra/capturas/cliente-compras-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-021-20 | / | visitante | base | 320 | revisado | [visitante-inicio-320.png](compra/capturas/visitante-inicio-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-022-21 | / | visitante | base | 390 | revisado | [visitante-inicio-390.png](compra/capturas/visitante-inicio-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-023-22 | / | visitante | base | 768 | revisado | [visitante-inicio-768.png](compra/capturas/visitante-inicio-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-024-23 | / | visitante | base | 913 | revisado | [visitante-inicio-913.png](compra/capturas/visitante-inicio-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-025-24 | / | visitante | base | 1440 | revisado | [visitante-inicio-1440.png](compra/capturas/visitante-inicio-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-026-25 | /pedir | visitante | base | 320 | revisado | [visitante-pedir-320.png](compra/capturas/visitante-pedir-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-027-26 | /pedir | visitante | base | 390 | revisado | [visitante-pedir-390.png](compra/capturas/visitante-pedir-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-028-27 | /pedir | visitante | base | 768 | revisado | [visitante-pedir-768.png](compra/capturas/visitante-pedir-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-029-28 | /pedir | visitante | base | 913 | revisado | [visitante-pedir-913.png](compra/capturas/visitante-pedir-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-030-29 | /pedir | visitante | base | 1440 | revisado | [visitante-pedir-1440.png](compra/capturas/visitante-pedir-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-031-30 | /tienda | visitante | barrera de acceso: entrada pública | 320 | revisado | [visitante-tienda-320.png](compra/capturas/visitante-tienda-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-032-31 | /tienda | visitante | barrera de acceso: entrada pública | 390 | revisado | [visitante-tienda-390.png](compra/capturas/visitante-tienda-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-033-32 | /tienda | visitante | barrera de acceso: entrada pública | 768 | revisado | [visitante-tienda-768.png](compra/capturas/visitante-tienda-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-034-33 | /tienda | visitante | barrera de acceso: entrada pública | 913 | revisado | [visitante-tienda-913.png](compra/capturas/visitante-tienda-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-035-34 | /tienda | visitante | barrera de acceso: entrada pública | 1440 | revisado | [visitante-tienda-1440.png](compra/capturas/visitante-tienda-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-036-35 | /compras | visitante | barrera de acceso: entrada pública | 320 | revisado | [visitante-compras-320.png](compra/capturas/visitante-compras-320.png) · [metricas.json](compra/metricas.json) |
| compra-CO-037-36 | /compras | visitante | barrera de acceso: entrada pública | 390 | revisado | [visitante-compras-390.png](compra/capturas/visitante-compras-390.png) · [metricas.json](compra/metricas.json) |
| compra-CO-038-37 | /compras | visitante | barrera de acceso: entrada pública | 768 | revisado | [visitante-compras-768.png](compra/capturas/visitante-compras-768.png) · [metricas.json](compra/metricas.json) |
| compra-CO-039-38 | /compras | visitante | barrera de acceso: entrada pública | 913 | revisado | [visitante-compras-913.png](compra/capturas/visitante-compras-913.png) · [metricas.json](compra/metricas.json) |
| compra-CO-040-39 | /compras | visitante | barrera de acceso: entrada pública | 1440 | revisado | [visitante-compras-1440.png](compra/capturas/visitante-compras-1440.png) · [metricas.json](compra/metricas.json) |
| compra-CO-101-40 | / | cliente | texto200 | 320 | revisado | [texto200-inicio-320.png](compra/capturas/texto200-inicio-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-102-41 | / | cliente | texto200 | 390 | revisado | [texto200-inicio-390.png](compra/capturas/texto200-inicio-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-103-42 | / | cliente | texto200 | 768 | revisado | [texto200-inicio-768.png](compra/capturas/texto200-inicio-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-104-43 | / | cliente | texto200 | 913 | revisado | [texto200-inicio-913.png](compra/capturas/texto200-inicio-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-105-44 | / | cliente | texto200 | 1440 | revisado | [texto200-inicio-1440.png](compra/capturas/texto200-inicio-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-106-45 | /pedir | cliente | texto200 | 320 | revisado | [texto200-pedir-320.png](compra/capturas/texto200-pedir-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-107-46 | /pedir | cliente | texto200 | 390 | revisado | [texto200-pedir-390.png](compra/capturas/texto200-pedir-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-108-47 | /pedir | cliente | texto200 | 768 | revisado | [texto200-pedir-768.png](compra/capturas/texto200-pedir-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-109-48 | /pedir | cliente | texto200 | 913 | revisado | [texto200-pedir-913.png](compra/capturas/texto200-pedir-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-110-49 | /pedir | cliente | texto200 | 1440 | revisado | [texto200-pedir-1440.png](compra/capturas/texto200-pedir-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-111-50 | /tienda | cliente | texto200 | 320 | revisado | [texto200-tienda-320.png](compra/capturas/texto200-tienda-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-112-51 | /tienda | cliente | texto200 | 390 | revisado | [texto200-tienda-390.png](compra/capturas/texto200-tienda-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-113-52 | /tienda | cliente | texto200 | 768 | revisado | [texto200-tienda-768.png](compra/capturas/texto200-tienda-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-114-53 | /tienda | cliente | texto200 | 913 | revisado | [texto200-tienda-913.png](compra/capturas/texto200-tienda-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-115-54 | /tienda | cliente | texto200 | 1440 | revisado | [texto200-tienda-1440.png](compra/capturas/texto200-tienda-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-116-55 | /compras | cliente | texto200 | 320 | revisado | [texto200-compras-320.png](compra/capturas/texto200-compras-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-117-56 | /compras | cliente | texto200 | 390 | revisado | [texto200-compras-390.png](compra/capturas/texto200-compras-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-118-57 | /compras | cliente | texto200 | 768 | revisado | [texto200-compras-768.png](compra/capturas/texto200-compras-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-119-58 | /compras | cliente | texto200 | 913 | revisado | [texto200-compras-913.png](compra/capturas/texto200-compras-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-120-59 | /compras | cliente | texto200 | 1440 | revisado | [texto200-compras-1440.png](compra/capturas/texto200-compras-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-121-60 | /pedir | cliente | búsqueda latte | 320 | revisado | [carta-busqueda-320.png](compra/capturas/carta-busqueda-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-122-61 | /pedir | cliente | búsqueda latte | 390 | revisado | [carta-busqueda-390.png](compra/capturas/carta-busqueda-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-123-62 | /pedir | cliente | búsqueda latte | 768 | revisado | [carta-busqueda-768.png](compra/capturas/carta-busqueda-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-124-63 | /pedir | cliente | búsqueda latte | 913 | revisado | [carta-busqueda-913.png](compra/capturas/carta-busqueda-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-125-64 | /pedir | cliente | búsqueda latte | 1440 | revisado | [carta-busqueda-1440.png](compra/capturas/carta-busqueda-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-126-65 | /pedir | cliente | borrador 1 latte | 320 | revisado | [pedido-borrador-320.png](compra/capturas/pedido-borrador-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-127-66 | /pedir | cliente | borrador 1 latte | 390 | revisado | [pedido-borrador-390.png](compra/capturas/pedido-borrador-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-128-67 | /pedir | cliente | borrador 1 latte | 768 | revisado | [pedido-borrador-768.png](compra/capturas/pedido-borrador-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-129-68 | /pedir | cliente | borrador 1 latte | 913 | revisado | [pedido-borrador-913.png](compra/capturas/pedido-borrador-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-130-69 | /pedir | cliente | borrador 1 latte | 1440 | revisado | [pedido-borrador-1440.png](compra/capturas/pedido-borrador-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-131-70 | /pedir | cliente | cotización vigente | 320 | revisado | [pedido-cotizacion-320.png](compra/capturas/pedido-cotizacion-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-132-71 | /pedir | cliente | cotización vigente | 390 | revisado | [pedido-cotizacion-390.png](compra/capturas/pedido-cotizacion-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-133-72 | /pedir | cliente | cotización vigente | 768 | revisado | [pedido-cotizacion-768.png](compra/capturas/pedido-cotizacion-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-134-73 | /pedir | cliente | cotización vigente | 913 | revisado | [pedido-cotizacion-913.png](compra/capturas/pedido-cotizacion-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-135-74 | /pedir | cliente | cotización vigente | 1440 | revisado | [pedido-cotizacion-1440.png](compra/capturas/pedido-cotizacion-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-136-75 | /pedir | cliente | cobro con respuesta perdida | 390 | revisado | [pedido-respuesta-perdida.png](compra/capturas/pedido-respuesta-perdida.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-137-76 | /tienda | cliente | confirmación antes de aceptar | 320 | revisado | [tienda-confirmacion-320.png](compra/capturas/tienda-confirmacion-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-138-77 | /tienda | cliente | confirmación antes de aceptar | 390 | revisado | [tienda-confirmacion-390.png](compra/capturas/tienda-confirmacion-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-139-78 | /tienda | cliente | confirmación antes de aceptar | 768 | revisado | [tienda-confirmacion-768.png](compra/capturas/tienda-confirmacion-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-140-79 | /tienda | cliente | confirmación antes de aceptar | 913 | revisado | [tienda-confirmacion-913.png](compra/capturas/tienda-confirmacion-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-141-80 | /tienda | cliente | confirmación antes de aceptar | 1440 | revisado | [tienda-confirmacion-1440.png](compra/capturas/tienda-confirmacion-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-142-81 | /tienda | cliente | cobro con respuesta perdida | 390 | revisado | [tienda-respuesta-perdida.png](compra/capturas/tienda-respuesta-perdida.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-143-82 | /tienda | cliente | compra recuperada | 320 | revisado | [tienda-recuperada-320.png](compra/capturas/tienda-recuperada-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-144-83 | /tienda | cliente | compra recuperada | 390 | revisado | [tienda-recuperada-390.png](compra/capturas/tienda-recuperada-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-145-84 | /tienda | cliente | compra recuperada | 768 | revisado | [tienda-recuperada-768.png](compra/capturas/tienda-recuperada-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-146-85 | /tienda | cliente | compra recuperada | 913 | revisado | [tienda-recuperada-913.png](compra/capturas/tienda-recuperada-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-147-86 | /tienda | cliente | compra recuperada | 1440 | revisado | [tienda-recuperada-1440.png](compra/capturas/tienda-recuperada-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-148-87 | /tienda | cliente | error de catálogo | 390 | revisado | [tienda-error.png](compra/capturas/tienda-error.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-149-88 | /pedir | cliente | cerrada y Espresso agotado | 390 | revisado | [carta-cerrada-agotado.png](compra/capturas/carta-cerrada-agotado.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-150-89 | /pedir | cliente | búsqueda sin resultados | 390 | revisado | [carta-sin-resultados.png](compra/capturas/carta-sin-resultados.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-151-90 | /pedir | cliente | carta guardada tras error | 390 | revisado | [carta-error.png](compra/capturas/carta-error.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-152-91 | /compras | cliente | 20 comprobantes con nombres largos | 320 | revisado | [compras-largas-320.png](compra/capturas/compras-largas-320.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-153-92 | /compras | cliente | 20 comprobantes con nombres largos | 390 | revisado | [compras-largas-390.png](compra/capturas/compras-largas-390.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-154-93 | /compras | cliente | 20 comprobantes con nombres largos | 768 | revisado | [compras-largas-768.png](compra/capturas/compras-largas-768.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-155-94 | /compras | cliente | 20 comprobantes con nombres largos | 913 | revisado | [compras-largas-913.png](compra/capturas/compras-largas-913.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-156-95 | /compras | cliente | 20 comprobantes con nombres largos | 1440 | revisado | [compras-largas-1440.png](compra/capturas/compras-largas-1440.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-157-96 | /compras | cliente | filtro café sin resultados cargados | 390 | revisado | [compras-filtro-vacio.png](compra/capturas/compras-filtro-vacio.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-158-97 | /compras | cliente | 40 comprobantes tras cargar segunda página | 390 | revisado | [compras-40-final.png](compra/capturas/compras-40-final.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-159-98 | /compras | cliente | compra histórica sin total ni cotización | 390 | revisado | [compras-incompletas.png](compra/capturas/compras-incompletas.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-160-99 | /compras | cliente | falló actualizar; datos anteriores identificados | 390 | revisado | [compras-error-con-datos.png](compra/capturas/compras-error-con-datos.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CO-161-100 | /pedir | cliente | teclado y foco en ficha | 390 | revisado | [teclado-foco-ficha.png](compra/capturas/teclado-foco-ficha.png) · [recorridos-metricas.json](compra/recorridos-metricas.json) |
| compra-CR-1-101 | /pedir | cliente | búsqueda global con alias y resultados próximos en cinco anchos | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-2-102 | /pedir | cliente | ficha restaura foco por teclado y limpia la URL | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-3-103 | /pedir | cliente | opciones obligatorias conservan variantes distintas y sus límites | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-4-104 | /pedir | cliente | veinte unidades no se pueden exceder en ficha y listado | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-5-105 | /pedir | cliente | el pago muestra empaque y requiere revisar una cotización | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-6-106 | /pedir | cliente | respuesta perdida y cierre de pestaña recuperan exactamente un cobro | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-7-107 | /pedir | cliente | consulta pública y cuenta caída conservan productos | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-8-108 | /pedir | cliente | pendiente con producto retirado o contenido dañado conserva consulta y cierre | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-9-109 | /pedir | cliente | almacenamiento bloqueado impide cobrar y conserva el presupuesto | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-10-110 | /pedir | cliente | otra pestaña reconoce el intento y no envía un segundo pedido | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-11-111 | /pedir | cliente | un HTTP 200 sin recibo válido no se interpreta como pago exitoso | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-12-112 | /pedir | cliente | foco de teclado queda visible por encima del pedido y navegación móvil | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-13-113 | /pedir | cliente | consulta y posición sobreviven a salir y volver a Carta | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-14-114 | /pedir | cliente | foto fallida y revisión automatizada de accesibilidad | 390 | revisado | [interfaz-carta.json](compra/regresion-carta/interfaz-carta.json) · [carta-ui.log](compra/carta-ui.log) |
| compra-CR-15-115 | /tienda | cliente | oferta y compra visibles en móvil; teclado, semántica y cero desbordamiento | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-16-116 | /tienda | cliente | precio modificado exige revisión y no cobra; error permanece en diálogo | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-17-117 | /tienda | cliente | diálogo bloqueado durante el cargo; respuesta perdida recupera última bolsa y saldo exacto | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-18-118 | /tienda | cliente | contrato incompleto nunca borra referencia ni anuncia éxito; se consulta antes de repetir | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-19-119 | /tienda | cliente | recarga conserva Tienda; beneficio distingue retirada y WhatsApp prepara contexto sin enviarlo | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-20-120 | /tienda | cliente | error de catálogo tiene su propio mensaje y reintento; datos inválidos no producen NaN | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-21-121 | /tienda | cliente | beneficio mensual activo, acceso directo y canje ya retirado se distinguen | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-22-122 | /tienda | cliente | Firefox: render, contrato y diálogo accesible | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CR-23-123 | /tienda | cliente | WebKit: render, contrato y diálogo accesible | 390 | revisado | [ui.json](compra/regresion-tienda/ui.json) · [tienda-ui.log](compra/tienda-ui.log) |
| compra-CN-24-124 | /tienda | visitante | comprar sin cuenta | 320 | no_aplicable | [visitante-tienda-320.png](compra/capturas/visitante-tienda-320.png) |
| compra-CN-25-125 | /tienda | visitante | comprar sin cuenta | 390 | no_aplicable | [visitante-tienda-390.png](compra/capturas/visitante-tienda-390.png) |
| compra-CN-26-126 | /tienda | visitante | comprar sin cuenta | 768 | no_aplicable | [visitante-tienda-768.png](compra/capturas/visitante-tienda-768.png) |
| compra-CN-27-127 | /tienda | visitante | comprar sin cuenta | 913 | no_aplicable | [visitante-tienda-913.png](compra/capturas/visitante-tienda-913.png) |
| compra-CN-28-128 | /tienda | visitante | comprar sin cuenta | 1440 | no_aplicable | [visitante-tienda-1440.png](compra/capturas/visitante-tienda-1440.png) |
| compra-CN-29-129 | /compras | visitante | leer comprobantes privados | 320 | no_aplicable | [visitante-compras-320.png](compra/capturas/visitante-compras-320.png) |
| compra-CN-30-130 | /compras | visitante | leer comprobantes privados | 390 | no_aplicable | [visitante-compras-390.png](compra/capturas/visitante-compras-390.png) |
| compra-CN-31-131 | /compras | visitante | leer comprobantes privados | 768 | no_aplicable | [visitante-compras-768.png](compra/capturas/visitante-compras-768.png) |
| compra-CN-32-132 | /compras | visitante | leer comprobantes privados | 913 | no_aplicable | [visitante-compras-913.png](compra/capturas/visitante-compras-913.png) |
| compra-CN-33-133 | /compras | visitante | leer comprobantes privados | 1440 | no_aplicable | [visitante-compras-1440.png](compra/capturas/visitante-compras-1440.png) |
| compra-CR-34-134 | /compras | cliente | verificación posterior de recuperación y paginación | 390 | revisado | [revision-final.json](compra/revision-final.json) · [revision-final.log](compra/revision-final.log) · [compras-recuperacion-verificada.png](compra/capturas/compras-recuperacion-verificada.png) |
| compra-CN-35-135 | /tienda | cliente | enviar consulta externa WhatsApp | 390 | no_aplicable | [tienda-ui.log](compra/tienda-ui.log) |
| visitas-base-visitante-conoce-tu-club-320-0 | /conoce-tu-club | visitante | normal | 320 | revisado | [base-visitante-conoce-tu-club-320.png](visitas/capturas/base-visitante-conoce-tu-club-320.png) |
| visitas-base-visitante-conoce-tu-club-390-1 | /conoce-tu-club | visitante | normal | 390 | revisado | [base-visitante-conoce-tu-club-390.png](visitas/capturas/base-visitante-conoce-tu-club-390.png) |
| visitas-base-visitante-conoce-tu-club-768-2 | /conoce-tu-club | visitante | normal | 768 | revisado | [base-visitante-conoce-tu-club-768.png](visitas/capturas/base-visitante-conoce-tu-club-768.png) |
| visitas-base-visitante-conoce-tu-club-913-3 | /conoce-tu-club | visitante | normal | 913 | revisado | [base-visitante-conoce-tu-club-913.png](visitas/capturas/base-visitante-conoce-tu-club-913.png) |
| visitas-base-visitante-conoce-tu-club-1440-4 | /conoce-tu-club | visitante | normal | 1440 | revisado | [base-visitante-conoce-tu-club-1440.png](visitas/capturas/base-visitante-conoce-tu-club-1440.png) |
| visitas-base-visitante-club-320-5 | /club | visitante | restricted | 320 | revisado | [base-visitante-club-320.png](visitas/capturas/base-visitante-club-320.png) |
| visitas-base-visitante-club-390-6 | /club | visitante | restricted | 390 | revisado | [base-visitante-club-390.png](visitas/capturas/base-visitante-club-390.png) |
| visitas-base-visitante-club-768-7 | /club | visitante | restricted | 768 | revisado | [base-visitante-club-768.png](visitas/capturas/base-visitante-club-768.png) |
| visitas-base-visitante-club-913-8 | /club | visitante | restricted | 913 | revisado | [base-visitante-club-913.png](visitas/capturas/base-visitante-club-913.png) |
| visitas-base-visitante-club-1440-9 | /club | visitante | restricted | 1440 | revisado | [base-visitante-club-1440.png](visitas/capturas/base-visitante-club-1440.png) |
| visitas-base-visitante-reservas-320-10 | /reservas | visitante | restricted | 320 | revisado | [base-visitante-reservas-320.png](visitas/capturas/base-visitante-reservas-320.png) |
| visitas-base-visitante-reservas-390-11 | /reservas | visitante | restricted | 390 | revisado | [base-visitante-reservas-390.png](visitas/capturas/base-visitante-reservas-390.png) |
| visitas-base-visitante-reservas-768-12 | /reservas | visitante | restricted | 768 | revisado | [base-visitante-reservas-768.png](visitas/capturas/base-visitante-reservas-768.png) |
| visitas-base-visitante-reservas-913-13 | /reservas | visitante | restricted | 913 | revisado | [base-visitante-reservas-913.png](visitas/capturas/base-visitante-reservas-913.png) |
| visitas-base-visitante-reservas-1440-14 | /reservas | visitante | restricted | 1440 | revisado | [base-visitante-reservas-1440.png](visitas/capturas/base-visitante-reservas-1440.png) |
| visitas-base-visitante-reservar-320-15 | /reservar | visitante | normal | 320 | revisado | [base-visitante-reservar-320.png](visitas/capturas/base-visitante-reservar-320.png) |
| visitas-base-visitante-reservar-390-16 | /reservar | visitante | normal | 390 | revisado | [base-visitante-reservar-390.png](visitas/capturas/base-visitante-reservar-390.png) |
| visitas-base-visitante-reservar-768-17 | /reservar | visitante | normal | 768 | revisado | [base-visitante-reservar-768.png](visitas/capturas/base-visitante-reservar-768.png) |
| visitas-base-visitante-reservar-913-18 | /reservar | visitante | normal | 913 | revisado | [base-visitante-reservar-913.png](visitas/capturas/base-visitante-reservar-913.png) |
| visitas-base-visitante-reservar-1440-19 | /reservar | visitante | normal | 1440 | revisado | [base-visitante-reservar-1440.png](visitas/capturas/base-visitante-reservar-1440.png) |
| visitas-base-visitante-perfil-320-20 | /perfil | visitante | restricted | 320 | revisado | [base-visitante-perfil-320.png](visitas/capturas/base-visitante-perfil-320.png) |
| visitas-base-visitante-perfil-390-21 | /perfil | visitante | restricted | 390 | revisado | [base-visitante-perfil-390.png](visitas/capturas/base-visitante-perfil-390.png) |
| visitas-base-visitante-perfil-768-22 | /perfil | visitante | restricted | 768 | revisado | [base-visitante-perfil-768.png](visitas/capturas/base-visitante-perfil-768.png) |
| visitas-base-visitante-perfil-913-23 | /perfil | visitante | restricted | 913 | revisado | [base-visitante-perfil-913.png](visitas/capturas/base-visitante-perfil-913.png) |
| visitas-base-visitante-perfil-1440-24 | /perfil | visitante | restricted | 1440 | revisado | [base-visitante-perfil-1440.png](visitas/capturas/base-visitante-perfil-1440.png) |
| visitas-base-cliente-conoce-tu-club-320-25 | /conoce-tu-club | cliente | normal | 320 | revisado | [base-cliente-conoce-tu-club-320.png](visitas/capturas/base-cliente-conoce-tu-club-320.png) |
| visitas-base-cliente-conoce-tu-club-390-26 | /conoce-tu-club | cliente | normal | 390 | revisado | [base-cliente-conoce-tu-club-390.png](visitas/capturas/base-cliente-conoce-tu-club-390.png) |
| visitas-base-cliente-conoce-tu-club-768-27 | /conoce-tu-club | cliente | normal | 768 | revisado | [base-cliente-conoce-tu-club-768.png](visitas/capturas/base-cliente-conoce-tu-club-768.png) |
| visitas-base-cliente-conoce-tu-club-913-28 | /conoce-tu-club | cliente | normal | 913 | revisado | [base-cliente-conoce-tu-club-913.png](visitas/capturas/base-cliente-conoce-tu-club-913.png) |
| visitas-base-cliente-conoce-tu-club-1440-29 | /conoce-tu-club | cliente | normal | 1440 | revisado | [base-cliente-conoce-tu-club-1440.png](visitas/capturas/base-cliente-conoce-tu-club-1440.png) |
| visitas-base-cliente-club-320-30 | /club | cliente | normal | 320 | revisado | [base-cliente-club-320.png](visitas/capturas/base-cliente-club-320.png) |
| visitas-base-cliente-club-390-31 | /club | cliente | normal | 390 | revisado | [base-cliente-club-390.png](visitas/capturas/base-cliente-club-390.png) |
| visitas-base-cliente-club-768-32 | /club | cliente | normal | 768 | revisado | [base-cliente-club-768.png](visitas/capturas/base-cliente-club-768.png) |
| visitas-base-cliente-club-913-33 | /club | cliente | normal | 913 | revisado | [base-cliente-club-913.png](visitas/capturas/base-cliente-club-913.png) |
| visitas-base-cliente-club-1440-34 | /club | cliente | normal | 1440 | revisado | [base-cliente-club-1440.png](visitas/capturas/base-cliente-club-1440.png) |
| visitas-base-cliente-reservas-320-35 | /reservas | cliente | normal | 320 | revisado | [base-cliente-reservas-320.png](visitas/capturas/base-cliente-reservas-320.png) |
| visitas-base-cliente-reservas-390-36 | /reservas | cliente | normal | 390 | revisado | [base-cliente-reservas-390.png](visitas/capturas/base-cliente-reservas-390.png) |
| visitas-base-cliente-reservas-768-37 | /reservas | cliente | normal | 768 | revisado | [base-cliente-reservas-768.png](visitas/capturas/base-cliente-reservas-768.png) |
| visitas-base-cliente-reservas-913-38 | /reservas | cliente | normal | 913 | revisado | [base-cliente-reservas-913.png](visitas/capturas/base-cliente-reservas-913.png) |
| visitas-base-cliente-reservas-1440-39 | /reservas | cliente | normal | 1440 | revisado | [base-cliente-reservas-1440.png](visitas/capturas/base-cliente-reservas-1440.png) |
| visitas-base-cliente-reservar-320-40 | /reservar | cliente | normal | 320 | revisado | [base-cliente-reservar-320.png](visitas/capturas/base-cliente-reservar-320.png) |
| visitas-base-cliente-reservar-390-41 | /reservar | cliente | normal | 390 | revisado | [base-cliente-reservar-390.png](visitas/capturas/base-cliente-reservar-390.png) |
| visitas-base-cliente-reservar-768-42 | /reservar | cliente | normal | 768 | revisado | [base-cliente-reservar-768.png](visitas/capturas/base-cliente-reservar-768.png) |
| visitas-base-cliente-reservar-913-43 | /reservar | cliente | normal | 913 | revisado | [base-cliente-reservar-913.png](visitas/capturas/base-cliente-reservar-913.png) |
| visitas-base-cliente-reservar-1440-44 | /reservar | cliente | normal | 1440 | revisado | [base-cliente-reservar-1440.png](visitas/capturas/base-cliente-reservar-1440.png) |
| visitas-base-cliente-perfil-320-45 | /perfil | cliente | normal | 320 | revisado | [base-cliente-perfil-320.png](visitas/capturas/base-cliente-perfil-320.png) |
| visitas-base-cliente-perfil-390-46 | /perfil | cliente | normal | 390 | revisado | [base-cliente-perfil-390.png](visitas/capturas/base-cliente-perfil-390.png) |
| visitas-base-cliente-perfil-768-47 | /perfil | cliente | normal | 768 | revisado | [base-cliente-perfil-768.png](visitas/capturas/base-cliente-perfil-768.png) |
| visitas-base-cliente-perfil-913-48 | /perfil | cliente | normal | 913 | revisado | [base-cliente-perfil-913.png](visitas/capturas/base-cliente-perfil-913.png) |
| visitas-base-cliente-perfil-1440-49 | /perfil | cliente | normal | 1440 | revisado | [base-cliente-perfil-1440.png](visitas/capturas/base-cliente-perfil-1440.png) |
| visitas-base-miembro-conoce-tu-club-320-50 | /conoce-tu-club | miembro | normal | 320 | revisado | [base-miembro-conoce-tu-club-320.png](visitas/capturas/base-miembro-conoce-tu-club-320.png) |
| visitas-base-miembro-conoce-tu-club-390-51 | /conoce-tu-club | miembro | normal | 390 | revisado | [base-miembro-conoce-tu-club-390.png](visitas/capturas/base-miembro-conoce-tu-club-390.png) |
| visitas-base-miembro-conoce-tu-club-768-52 | /conoce-tu-club | miembro | normal | 768 | revisado | [base-miembro-conoce-tu-club-768.png](visitas/capturas/base-miembro-conoce-tu-club-768.png) |
| visitas-base-miembro-conoce-tu-club-913-53 | /conoce-tu-club | miembro | normal | 913 | revisado | [base-miembro-conoce-tu-club-913.png](visitas/capturas/base-miembro-conoce-tu-club-913.png) |
| visitas-base-miembro-conoce-tu-club-1440-54 | /conoce-tu-club | miembro | normal | 1440 | revisado | [base-miembro-conoce-tu-club-1440.png](visitas/capturas/base-miembro-conoce-tu-club-1440.png) |
| visitas-texto200-conoce-tu-club-320-55 | /conoce-tu-club | miembro | texto200 | 320 | revisado | [texto200-conoce-tu-club-320.png](visitas/capturas/texto200-conoce-tu-club-320.png) |
| visitas-texto200-conoce-tu-club-390-56 | /conoce-tu-club | miembro | texto200 | 390 | revisado | [texto200-conoce-tu-club-390.png](visitas/capturas/texto200-conoce-tu-club-390.png) |
| visitas-texto200-conoce-tu-club-768-57 | /conoce-tu-club | miembro | texto200 | 768 | revisado | [texto200-conoce-tu-club-768.png](visitas/capturas/texto200-conoce-tu-club-768.png) |
| visitas-texto200-conoce-tu-club-913-58 | /conoce-tu-club | miembro | texto200 | 913 | revisado | [texto200-conoce-tu-club-913.png](visitas/capturas/texto200-conoce-tu-club-913.png) |
| visitas-texto200-conoce-tu-club-1440-59 | /conoce-tu-club | miembro | texto200 | 1440 | revisado | [texto200-conoce-tu-club-1440.png](visitas/capturas/texto200-conoce-tu-club-1440.png) |
| visitas-base-miembro-club-320-60 | /club | miembro | normal | 320 | revisado | [base-miembro-club-320.png](visitas/capturas/base-miembro-club-320.png) |
| visitas-base-miembro-club-390-61 | /club | miembro | normal | 390 | revisado | [base-miembro-club-390.png](visitas/capturas/base-miembro-club-390.png) |
| visitas-base-miembro-club-768-62 | /club | miembro | normal | 768 | revisado | [base-miembro-club-768.png](visitas/capturas/base-miembro-club-768.png) |
| visitas-base-miembro-club-913-63 | /club | miembro | normal | 913 | revisado | [base-miembro-club-913.png](visitas/capturas/base-miembro-club-913.png) |
| visitas-base-miembro-club-1440-64 | /club | miembro | normal | 1440 | revisado | [base-miembro-club-1440.png](visitas/capturas/base-miembro-club-1440.png) |
| visitas-texto200-club-320-65 | /club | miembro | texto200 | 320 | revisado | [texto200-club-320.png](visitas/capturas/texto200-club-320.png) |
| visitas-texto200-club-390-66 | /club | miembro | texto200 | 390 | revisado | [texto200-club-390.png](visitas/capturas/texto200-club-390.png) |
| visitas-texto200-club-768-67 | /club | miembro | texto200 | 768 | revisado | [texto200-club-768.png](visitas/capturas/texto200-club-768.png) |
| visitas-texto200-club-913-68 | /club | miembro | texto200 | 913 | revisado | [texto200-club-913.png](visitas/capturas/texto200-club-913.png) |
| visitas-texto200-club-1440-69 | /club | miembro | texto200 | 1440 | revisado | [texto200-club-1440.png](visitas/capturas/texto200-club-1440.png) |
| visitas-base-miembro-reservas-320-70 | /reservas | miembro | normal | 320 | revisado | [base-miembro-reservas-320.png](visitas/capturas/base-miembro-reservas-320.png) |
| visitas-base-miembro-reservas-390-71 | /reservas | miembro | normal | 390 | revisado | [base-miembro-reservas-390.png](visitas/capturas/base-miembro-reservas-390.png) |
| visitas-base-miembro-reservas-768-72 | /reservas | miembro | normal | 768 | revisado | [base-miembro-reservas-768.png](visitas/capturas/base-miembro-reservas-768.png) |
| visitas-base-miembro-reservas-913-73 | /reservas | miembro | normal | 913 | revisado | [base-miembro-reservas-913.png](visitas/capturas/base-miembro-reservas-913.png) |
| visitas-base-miembro-reservas-1440-74 | /reservas | miembro | normal | 1440 | revisado | [base-miembro-reservas-1440.png](visitas/capturas/base-miembro-reservas-1440.png) |
| visitas-texto200-reservas-320-75 | /reservas | miembro | texto200 | 320 | revisado | [texto200-reservas-320.png](visitas/capturas/texto200-reservas-320.png) |
| visitas-texto200-reservas-390-76 | /reservas | miembro | texto200 | 390 | revisado | [texto200-reservas-390.png](visitas/capturas/texto200-reservas-390.png) |
| visitas-texto200-reservas-768-77 | /reservas | miembro | texto200 | 768 | revisado | [texto200-reservas-768.png](visitas/capturas/texto200-reservas-768.png) |
| visitas-texto200-reservas-913-78 | /reservas | miembro | texto200 | 913 | revisado | [texto200-reservas-913.png](visitas/capturas/texto200-reservas-913.png) |
| visitas-texto200-reservas-1440-79 | /reservas | miembro | texto200 | 1440 | revisado | [texto200-reservas-1440.png](visitas/capturas/texto200-reservas-1440.png) |
| visitas-base-miembro-reservar-320-80 | /reservar | miembro | normal | 320 | revisado | [base-miembro-reservar-320.png](visitas/capturas/base-miembro-reservar-320.png) |
| visitas-base-miembro-reservar-390-81 | /reservar | miembro | normal | 390 | revisado | [base-miembro-reservar-390.png](visitas/capturas/base-miembro-reservar-390.png) |
| visitas-base-miembro-reservar-768-82 | /reservar | miembro | normal | 768 | revisado | [base-miembro-reservar-768.png](visitas/capturas/base-miembro-reservar-768.png) |
| visitas-base-miembro-reservar-913-83 | /reservar | miembro | normal | 913 | revisado | [base-miembro-reservar-913.png](visitas/capturas/base-miembro-reservar-913.png) |
| visitas-base-miembro-reservar-1440-84 | /reservar | miembro | normal | 1440 | revisado | [base-miembro-reservar-1440.png](visitas/capturas/base-miembro-reservar-1440.png) |
| visitas-texto200-reservar-320-85 | /reservar | miembro | texto200 | 320 | revisado | [texto200-reservar-320.png](visitas/capturas/texto200-reservar-320.png) |
| visitas-texto200-reservar-390-86 | /reservar | miembro | texto200 | 390 | revisado | [texto200-reservar-390.png](visitas/capturas/texto200-reservar-390.png) |
| visitas-texto200-reservar-768-87 | /reservar | miembro | texto200 | 768 | revisado | [texto200-reservar-768.png](visitas/capturas/texto200-reservar-768.png) |
| visitas-texto200-reservar-913-88 | /reservar | miembro | texto200 | 913 | revisado | [texto200-reservar-913.png](visitas/capturas/texto200-reservar-913.png) |
| visitas-texto200-reservar-1440-89 | /reservar | miembro | texto200 | 1440 | revisado | [texto200-reservar-1440.png](visitas/capturas/texto200-reservar-1440.png) |
| visitas-base-miembro-perfil-320-90 | /perfil | miembro | normal | 320 | revisado | [base-miembro-perfil-320.png](visitas/capturas/base-miembro-perfil-320.png) |
| visitas-base-miembro-perfil-390-91 | /perfil | miembro | normal | 390 | revisado | [base-miembro-perfil-390.png](visitas/capturas/base-miembro-perfil-390.png) |
| visitas-base-miembro-perfil-768-92 | /perfil | miembro | normal | 768 | revisado | [base-miembro-perfil-768.png](visitas/capturas/base-miembro-perfil-768.png) |
| visitas-base-miembro-perfil-913-93 | /perfil | miembro | normal | 913 | revisado | [base-miembro-perfil-913.png](visitas/capturas/base-miembro-perfil-913.png) |
| visitas-base-miembro-perfil-1440-94 | /perfil | miembro | normal | 1440 | revisado | [base-miembro-perfil-1440.png](visitas/capturas/base-miembro-perfil-1440.png) |
| visitas-texto200-perfil-320-95 | /perfil | miembro | texto200 | 320 | revisado | [texto200-perfil-320.png](visitas/capturas/texto200-perfil-320.png) |
| visitas-texto200-perfil-390-96 | /perfil | miembro | texto200 | 390 | revisado | [texto200-perfil-390.png](visitas/capturas/texto200-perfil-390.png) |
| visitas-texto200-perfil-768-97 | /perfil | miembro | texto200 | 768 | revisado | [texto200-perfil-768.png](visitas/capturas/texto200-perfil-768.png) |
| visitas-texto200-perfil-913-98 | /perfil | miembro | texto200 | 913 | revisado | [texto200-perfil-913.png](visitas/capturas/texto200-perfil-913.png) |
| visitas-texto200-perfil-1440-99 | /perfil | miembro | texto200 | 1440 | revisado | [texto200-perfil-1440.png](visitas/capturas/texto200-perfil-1440.png) |
| visitas-condiciones-load-100 | /conoce-tu-club | miembro | load | 390 | revisado | [condiciones-load.png](visitas/capturas/condiciones-load.png) |
| visitas-condiciones-error-101 | /conoce-tu-club | miembro | error | 390 | revisado | [condiciones-error.png](visitas/capturas/condiciones-error.png) |
| visitas-condiciones-retry-102 | /conoce-tu-club | miembro | retry | 390 | revisado | [condiciones-retry.png](visitas/capturas/condiciones-retry.png) |
| visitas-condiciones-teclado-103 | /conoce-tu-club | miembro | teclado | 390 | revisado | [condiciones-teclado.png](visitas/capturas/condiciones-teclado.png) |
| visitas-reservas-load-104 | /reservas | miembro | load | 390 | revisado | [reservas-load.png](visitas/capturas/reservas-load.png) |
| visitas-reservas-empty-105 | /reservas | miembro | empty | 390 | revisado | [reservas-empty.png](visitas/capturas/reservas-empty.png) |
| visitas-reservas-error-106 | /reservas | miembro | error | 390 | revisado | [reservas-error.png](visitas/capturas/reservas-error.png) |
| visitas-reservas-retry-107 | /reservas | miembro | retry | 390 | revisado | [reservas-retry.png](visitas/capturas/reservas-retry.png) |
| visitas-club-pase-108 | /club | miembro | normal | 390 | revisado | [club-pase.png](visitas/capturas/club-pase.png) |
| visitas-club-pase-foco-109 | /club | miembro | teclado | 390 | revisado | [club-pase-foco.png](visitas/capturas/club-pase-foco.png) |
| visitas-beneficio-load-110 | /club | miembro | load | 390 | revisado | [beneficio-load.png](visitas/capturas/beneficio-load.png) |
| visitas-beneficio-success-111 | /club | miembro | success | 390 | revisado | [beneficio-success.png](visitas/capturas/beneficio-success.png) |
| visitas-beneficio-error-112 | /club | miembro | error | 390 | revisado | [beneficio-error.png](visitas/capturas/beneficio-error.png) |
| visitas-beneficio-retry-113 | /club | miembro | retry | 390 | revisado | [beneficio-retry.png](visitas/capturas/beneficio-retry.png) |
| visitas-beneficio-expired-114 | /club | miembro | expired | 390 | revisado | [beneficio-expired.png](visitas/capturas/beneficio-expired.png) |
| visitas-beneficio-expired-retry-115 | /club | miembro | retry | 390 | revisado | [beneficio-expired-retry.png](visitas/capturas/beneficio-expired-retry.png) |
| visitas-club-renovacion-dialogo-116 | /club | miembro | validation | 390 | revisado | [club-renovacion-dialogo.png](visitas/capturas/club-renovacion-dialogo.png) |
| visitas-perfil-validation-117 | /perfil | miembro | validation | 390 | revisado | [perfil-validation.png](visitas/capturas/perfil-validation.png) |
| visitas-perfil-draft-118 | /perfil | miembro | normal | 390 | revisado | [perfil-draft.png](visitas/capturas/perfil-draft.png) |
| visitas-perfil-lostresponse-119 | /perfil | miembro | lostresponse | 390 | revisado | [perfil-lostresponse.png](visitas/capturas/perfil-lostresponse.png) |
| visitas-perfil-load-120 | /perfil | miembro | load | 390 | revisado | [perfil-load.png](visitas/capturas/perfil-load.png) |
| visitas-perfil-error-121 | /perfil | miembro | error | 390 | revisado | [perfil-error.png](visitas/capturas/perfil-error.png) |
| visitas-perfil-retry-122 | /perfil | miembro | retry | 390 | revisado | [perfil-retry.png](visitas/capturas/perfil-retry.png) |
| visitas-reserva-sin-horario-123 | /reservar | miembro | empty | 390 | revisado | [reserva-sin-horario.png](visitas/capturas/reserva-sin-horario.png) |
| visitas-reserva-fecha-grupo-124 | /reservar | miembro | normal | 390 | revisado | [reserva-fecha-grupo.png](visitas/capturas/reserva-fecha-grupo.png) |
| visitas-reserva-horarios-error-125 | /reservar | miembro | error | 390 | revisado | [reserva-horarios-error.png](visitas/capturas/reserva-horarios-error.png) |
| visitas-reserva-horarios-retry-126 | /reservar | miembro | retry | 390 | revisado | [reserva-horarios-retry.png](visitas/capturas/reserva-horarios-retry.png) |
| visitas-reserva-revision-127 | /reservar | miembro | validation | 390 | revisado | [reserva-revision.png](visitas/capturas/reserva-revision.png) |
| visitas-reserva-respuesta-perdida-128 | /reservar | miembro | lostresponse | 390 | revisado | [reserva-respuesta-perdida.png](visitas/capturas/reserva-respuesta-perdida.png) |
| visitas-reserva-recuperada-129 | /reservar | miembro | success | 390 | revisado | [reserva-recuperada.png](visitas/capturas/reserva-recuperada.png) |
| visitas-reserva-lista-130 | /reservas | miembro | success | 390 | revisado | [reserva-lista.png](visitas/capturas/reserva-lista.png) |
| visitas-modificar-dialogo-131 | /reservas | miembro | normal | 390 | revisado | [modificar-dialogo.png](visitas/capturas/modificar-dialogo.png) |
| visitas-modificar-respuesta-perdida-132 | /reservas | miembro | lostresponse | 390 | revisado | [modificar-respuesta-perdida.png](visitas/capturas/modificar-respuesta-perdida.png) |
| visitas-modificar-reintento-conflicto-133 | /reservas | miembro | retry | 390 | revisado | [modificar-reintento-conflicto.png](visitas/capturas/modificar-reintento-conflicto.png) |
| visitas-modificar-recuperacion-manual-134 | /reservas | miembro | success | 390 | revisado | [modificar-recuperacion-manual.png](visitas/capturas/modificar-recuperacion-manual.png) |
| visitas-cancelar-revision-135 | /reservas | miembro | validation | 390 | revisado | [cancelar-revision.png](visitas/capturas/cancelar-revision.png) |
| visitas-cancelar-success-136 | /reservas | miembro | success | 390 | revisado | [cancelar-success.png](visitas/capturas/cancelar-success.png) |
| visitas-perfil-success-137 | /perfil | miembro | success | 390 | revisado | [perfil-success.png](visitas/capturas/perfil-success.png) |
| visitas-perfil-tabs-teclado-138 | /perfil | miembro | teclado | 390 | revisado | [perfil-tabs-teclado.png](visitas/capturas/perfil-tabs-teclado.png) |
| visitas-perfil-ayuda-success-139 | /perfil | miembro | success | 390 | revisado | [perfil-ayuda-success.png](visitas/capturas/perfil-ayuda-success.png) |
| visitas-perfil-actividad-140 | /perfil | miembro | normal | 390 | revisado | [perfil-actividad.png](visitas/capturas/perfil-actividad.png) |
| visitas-gutter-conoce-tu-club-141 | /conoce-tu-club | miembro | gutter-913 | 913 | revisado | [gutter-conoce-tu-club.png](visitas/capturas/gutter-conoce-tu-club.png) |
| visitas-teclado-conoce-tu-club-142 | /conoce-tu-club | miembro | teclado | 913 | revisado | [teclado-conoce-tu-club.png](visitas/capturas/teclado-conoce-tu-club.png) |
| visitas-movimiento-conoce-tu-club-143 | /conoce-tu-club | miembro | reducedmotion | 913 | revisado | [accesibilidad.json](visitas/accesibilidad.json) |
| visitas-gutter-club-144 | /club | miembro | gutter-913 | 913 | revisado | [gutter-club.png](visitas/capturas/gutter-club.png) |
| visitas-teclado-club-145 | /club | miembro | teclado | 913 | revisado | [teclado-club.png](visitas/capturas/teclado-club.png) |
| visitas-movimiento-club-146 | /club | miembro | reducedmotion | 913 | revisado | [accesibilidad.json](visitas/accesibilidad.json) |
| visitas-gutter-reservas-147 | /reservas | miembro | gutter-913 | 913 | revisado | [gutter-reservas.png](visitas/capturas/gutter-reservas.png) |
| visitas-teclado-reservas-148 | /reservas | miembro | teclado | 913 | revisado | [teclado-reservas.png](visitas/capturas/teclado-reservas.png) |
| visitas-movimiento-reservas-149 | /reservas | miembro | reducedmotion | 913 | revisado | [accesibilidad.json](visitas/accesibilidad.json) |
| visitas-gutter-reservar-150 | /reservar | miembro | gutter-913 | 913 | revisado | [gutter-reservar.png](visitas/capturas/gutter-reservar.png) |
| visitas-teclado-reservar-151 | /reservar | miembro | teclado | 913 | revisado | [teclado-reservar.png](visitas/capturas/teclado-reservar.png) |
| visitas-movimiento-reservar-152 | /reservar | miembro | reducedmotion | 913 | revisado | [accesibilidad.json](visitas/accesibilidad.json) |
| visitas-gutter-perfil-153 | /perfil | miembro | gutter-913 | 913 | revisado | [gutter-perfil.png](visitas/capturas/gutter-perfil.png) |
| visitas-teclado-perfil-154 | /perfil | miembro | teclado | 913 | revisado | [teclado-perfil.png](visitas/capturas/teclado-perfil.png) |
| visitas-movimiento-perfil-155 | /perfil | miembro | reducedmotion | 913 | revisado | [accesibilidad.json](visitas/accesibilidad.json) |
| visitas-dialogo-beneficio-320-156 | /club | miembro | beneficio-dialogo | 320 | revisado | [dialogo-beneficio-320.png](visitas/capturas/dialogo-beneficio-320.png) |
| visitas-dialogo-beneficio-390-157 | /club | miembro | beneficio-dialogo | 390 | revisado | [dialogo-beneficio-390.png](visitas/capturas/dialogo-beneficio-390.png) |
| visitas-dialogo-beneficio-768-158 | /club | miembro | beneficio-dialogo | 768 | revisado | [dialogo-beneficio-768.png](visitas/capturas/dialogo-beneficio-768.png) |
| visitas-dialogo-beneficio-913-159 | /club | miembro | beneficio-dialogo | 913 | revisado | [dialogo-beneficio-913.png](visitas/capturas/dialogo-beneficio-913.png) |
| visitas-dialogo-beneficio-1440-160 | /club | miembro | beneficio-dialogo | 1440 | revisado | [dialogo-beneficio-1440.png](visitas/capturas/dialogo-beneficio-1440.png) |
| visitas-beneficio-restricted-161 | /club | miembro | restricted | 390 | revisado | [beneficio-restricted.png](visitas/capturas/beneficio-restricted.png) |
| visitas-dialogo-perfil-320-162 | /perfil | miembro | perfil-dialogo | 320 | revisado | [dialogo-perfil-320.png](visitas/capturas/dialogo-perfil-320.png) |
| visitas-dialogo-perfil-390-163 | /perfil | miembro | perfil-dialogo | 390 | revisado | [dialogo-perfil-390.png](visitas/capturas/dialogo-perfil-390.png) |
| visitas-dialogo-perfil-768-164 | /perfil | miembro | perfil-dialogo | 768 | revisado | [dialogo-perfil-768.png](visitas/capturas/dialogo-perfil-768.png) |
| visitas-dialogo-perfil-913-165 | /perfil | miembro | perfil-dialogo | 913 | revisado | [dialogo-perfil-913.png](visitas/capturas/dialogo-perfil-913.png) |
| visitas-dialogo-perfil-1440-166 | /perfil | miembro | perfil-dialogo | 1440 | revisado | [dialogo-perfil-1440.png](visitas/capturas/dialogo-perfil-1440.png) |
| visitas-dialogo-perfil-texto200-167 | /perfil | miembro | texto200 | 390 | revisado | [dialogo-perfil-texto200.png](visitas/capturas/dialogo-perfil-texto200.png) |
| visitas-visitante-reserva-revision-168 | /reservar | visitante | validation | 390 | revisado | [visitante-reserva-revision.png](visitas/capturas/visitante-reserva-revision.png) |
| visitas-visitante-reserva-acceso-169 | /reservar | visitante | restricted | 390 | revisado | [visitante-reserva-acceso.png](visitas/capturas/visitante-reserva-acceso.png) |
| visitas-visitante-reserva-regreso-170 | /reservar | visitante | success | 390 | revisado | [visitante-reserva-regreso.png](visitas/capturas/visitante-reserva-regreso.png) |
| visitas-club-contratacion-real-171 | /club | cliente | success | 390 | revisado | [cierre-club-contratacion-real.png](visitas/capturas/cierre-club-contratacion-real.png) |
| visitas-club-premio-172 | /club | miembro | success | 390 | revisado | [cierre-club-premio.png](visitas/capturas/cierre-club-premio.png) |
| visitas-club-reposicion-173 | /club | miembro | success | 390 | revisado | [cierre-club-reposicion.png](visitas/capturas/cierre-club-reposicion.png) |
| visitas-club-entrega-174 | /club | miembro | success | 390 | revisado | [cierre-club-entrega.png](visitas/capturas/cierre-club-entrega.png) |
| visitas-club-membresia-expirada-175 | /club | cliente | expired | 390 | revisado | [cierre-club-membresia-expirada.png](visitas/capturas/cierre-club-membresia-expirada.png) |
| visitas-reserva-disponibilidad-expirada-176 | /reservar | miembro | expired | 390 | revisado | [cierre-reserva-disponibilidad-expirada.png](visitas/capturas/cierre-reserva-disponibilidad-expirada.png) |
| visitas-reserva-saldo-insuficiente-177 | /reservar | miembro | restricted | 390 | revisado | [cierre-reserva-saldo-insuficiente.png](visitas/capturas/cierre-reserva-saldo-insuficiente.png) |
| visitas-perfil-conflicto-178 | /perfil | miembro | conflict | 390 | revisado | [cierre-perfil-conflicto.png](visitas/capturas/cierre-perfil-conflicto.png) |
| visitas-perfil-cierre-todos-179 | /perfil | miembro | success | 390 | revisado | [cierre-perfil-cierre-todos.png](visitas/capturas/cierre-perfil-cierre-todos.png) |
| visitas-sesion-expirada-180 | /perfil | miembro | expired | 390 | revisado | [cierre-sesion-expirada.png](visitas/capturas/cierre-sesion-expirada.png) |
| visitas-na-conoce-validation-181 | /conoce-tu-club | visitante | validation |  | no_aplicable | [conoce-club-fuente.md](base/conoce-club-fuente.md) |
| visitas-na-conoce-lostresponse-182 | /conoce-tu-club | visitante | lostresponse |  | no_aplicable | [conoce-club-fuente.md](base/conoce-club-fuente.md) |
| visitas-na-conoce-expired-183 | /conoce-tu-club | visitante | expired |  | no_aplicable | [conoce-club-fuente.md](base/conoce-club-fuente.md) |
| visitas-club-premio-codigo-184 | /club | miembro | success | 390 | revisado | [cierre-club-premio-codigo.png](visitas/capturas/cierre-club-premio-codigo.png) |
| visitas-perfil-conflicto-comparacion-185 | /perfil | miembro | conflict | 390 | revisado | [cierre-perfil-conflicto-comparacion.png](visitas/capturas/cierre-perfil-conflicto-comparacion.png) |
| equipo-EQ-B-resumen-320-0 | /personal?seccion=resumen | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-resumen-320.png](equipo/capturas/antes-propietario-resumen-320.png) |
| equipo-EQ-B-pedidos-320-1 | /personal?seccion=pedidos | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-pedidos-320.png](equipo/capturas/antes-propietario-pedidos-320.png) |
| equipo-EQ-B-caja-320-2 | /personal?seccion=caja | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-caja-320.png](equipo/capturas/antes-propietario-caja-320.png) |
| equipo-EQ-B-club-320-3 | /personal?seccion=club | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-club-320.png](equipo/capturas/antes-propietario-club-320.png) |
| equipo-EQ-B-tienda-320-4 | /personal?seccion=tienda | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-tienda-320.png](equipo/capturas/antes-propietario-tienda-320.png) |
| equipo-EQ-B-entregas-320-5 | /personal?seccion=entregas | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-entregas-320.png](equipo/capturas/antes-propietario-entregas-320.png) |
| equipo-EQ-B-agenda-320-6 | /personal?seccion=agenda | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-agenda-320.png](equipo/capturas/antes-propietario-agenda-320.png) |
| equipo-EQ-B-atencion-320-7 | /personal?seccion=atencion | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-atencion-320.png](equipo/capturas/antes-propietario-atencion-320.png) |
| equipo-EQ-B-informes-320-8 | /personal?seccion=informes | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-informes-320.png](equipo/capturas/antes-propietario-informes-320.png) |
| equipo-EQ-B-clientes-320-9 | /personal?seccion=clientes | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-clientes-320.png](equipo/capturas/antes-propietario-clientes-320.png) |
| equipo-EQ-B-equipo-320-10 | /personal?seccion=equipo | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-equipo-320.png](equipo/capturas/antes-propietario-equipo-320.png) |
| equipo-EQ-B-seguridad-320-11 | /personal?seccion=seguridad | propietario | poblado o vacío natural documentado | 320 | revisado | [antes-propietario-seguridad-320.png](equipo/capturas/antes-propietario-seguridad-320.png) |
| equipo-EQ-B-resumen-390-12 | /personal?seccion=resumen | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-resumen-390.png](equipo/capturas/antes-propietario-resumen-390.png) |
| equipo-EQ-AXE-resumen-13 | /personal?seccion=resumen | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-resumen-390.png](equipo/capturas/antes-propietario-resumen-390.png) |
| equipo-EQ-B-pedidos-390-14 | /personal?seccion=pedidos | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-pedidos-390.png](equipo/capturas/antes-propietario-pedidos-390.png) |
| equipo-EQ-AXE-pedidos-15 | /personal?seccion=pedidos | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-pedidos-390.png](equipo/capturas/antes-propietario-pedidos-390.png) |
| equipo-EQ-B-caja-390-16 | /personal?seccion=caja | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-caja-390.png](equipo/capturas/antes-propietario-caja-390.png) |
| equipo-EQ-AXE-caja-17 | /personal?seccion=caja | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-caja-390.png](equipo/capturas/antes-propietario-caja-390.png) |
| equipo-EQ-B-club-390-18 | /personal?seccion=club | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-club-390.png](equipo/capturas/antes-propietario-club-390.png) |
| equipo-EQ-AXE-club-19 | /personal?seccion=club | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-club-390.png](equipo/capturas/antes-propietario-club-390.png) |
| equipo-EQ-B-tienda-390-20 | /personal?seccion=tienda | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-tienda-390.png](equipo/capturas/antes-propietario-tienda-390.png) |
| equipo-EQ-AXE-tienda-21 | /personal?seccion=tienda | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-tienda-390.png](equipo/capturas/antes-propietario-tienda-390.png) |
| equipo-EQ-B-entregas-390-22 | /personal?seccion=entregas | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-entregas-390.png](equipo/capturas/antes-propietario-entregas-390.png) |
| equipo-EQ-AXE-entregas-23 | /personal?seccion=entregas | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-entregas-390.png](equipo/capturas/antes-propietario-entregas-390.png) |
| equipo-EQ-B-agenda-390-24 | /personal?seccion=agenda | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-agenda-390.png](equipo/capturas/antes-propietario-agenda-390.png) |
| equipo-EQ-AXE-agenda-25 | /personal?seccion=agenda | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-agenda-390.png](equipo/capturas/antes-propietario-agenda-390.png) |
| equipo-EQ-B-atencion-390-26 | /personal?seccion=atencion | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-atencion-390.png](equipo/capturas/antes-propietario-atencion-390.png) |
| equipo-EQ-AXE-atencion-27 | /personal?seccion=atencion | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-atencion-390.png](equipo/capturas/antes-propietario-atencion-390.png) |
| equipo-EQ-B-informes-390-28 | /personal?seccion=informes | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-informes-390.png](equipo/capturas/antes-propietario-informes-390.png) |
| equipo-EQ-AXE-informes-29 | /personal?seccion=informes | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-informes-390.png](equipo/capturas/antes-propietario-informes-390.png) |
| equipo-EQ-B-clientes-390-30 | /personal?seccion=clientes | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-clientes-390.png](equipo/capturas/antes-propietario-clientes-390.png) |
| equipo-EQ-AXE-clientes-31 | /personal?seccion=clientes | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-clientes-390.png](equipo/capturas/antes-propietario-clientes-390.png) |
| equipo-EQ-B-equipo-390-32 | /personal?seccion=equipo | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-equipo-390.png](equipo/capturas/antes-propietario-equipo-390.png) |
| equipo-EQ-AXE-equipo-33 | /personal?seccion=equipo | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-equipo-390.png](equipo/capturas/antes-propietario-equipo-390.png) |
| equipo-EQ-B-seguridad-390-34 | /personal?seccion=seguridad | propietario | poblado o vacío natural documentado | 390 | revisado | [antes-propietario-seguridad-390.png](equipo/capturas/antes-propietario-seguridad-390.png) |
| equipo-EQ-AXE-seguridad-35 | /personal?seccion=seguridad | propietario | accesibilidad automática | 390 | revisado | [antes-propietario-seguridad-390.png](equipo/capturas/antes-propietario-seguridad-390.png) |
| equipo-EQ-B-resumen-768-36 | /personal?seccion=resumen | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-resumen-768.png](equipo/capturas/antes-propietario-resumen-768.png) |
| equipo-EQ-B-pedidos-768-37 | /personal?seccion=pedidos | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-pedidos-768.png](equipo/capturas/antes-propietario-pedidos-768.png) |
| equipo-EQ-B-caja-768-38 | /personal?seccion=caja | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-caja-768.png](equipo/capturas/antes-propietario-caja-768.png) |
| equipo-EQ-B-club-768-39 | /personal?seccion=club | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-club-768.png](equipo/capturas/antes-propietario-club-768.png) |
| equipo-EQ-B-tienda-768-40 | /personal?seccion=tienda | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-tienda-768.png](equipo/capturas/antes-propietario-tienda-768.png) |
| equipo-EQ-B-entregas-768-41 | /personal?seccion=entregas | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-entregas-768.png](equipo/capturas/antes-propietario-entregas-768.png) |
| equipo-EQ-B-agenda-768-42 | /personal?seccion=agenda | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-agenda-768.png](equipo/capturas/antes-propietario-agenda-768.png) |
| equipo-EQ-B-atencion-768-43 | /personal?seccion=atencion | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-atencion-768.png](equipo/capturas/antes-propietario-atencion-768.png) |
| equipo-EQ-B-informes-768-44 | /personal?seccion=informes | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-informes-768.png](equipo/capturas/antes-propietario-informes-768.png) |
| equipo-EQ-B-clientes-768-45 | /personal?seccion=clientes | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-clientes-768.png](equipo/capturas/antes-propietario-clientes-768.png) |
| equipo-EQ-B-equipo-768-46 | /personal?seccion=equipo | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-equipo-768.png](equipo/capturas/antes-propietario-equipo-768.png) |
| equipo-EQ-B-seguridad-768-47 | /personal?seccion=seguridad | propietario | poblado o vacío natural documentado | 768 | revisado | [antes-propietario-seguridad-768.png](equipo/capturas/antes-propietario-seguridad-768.png) |
| equipo-EQ-B-resumen-913-48 | /personal?seccion=resumen | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-resumen-913.png](equipo/capturas/antes-propietario-resumen-913.png) |
| equipo-EQ-B-pedidos-913-49 | /personal?seccion=pedidos | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-pedidos-913.png](equipo/capturas/antes-propietario-pedidos-913.png) |
| equipo-EQ-B-caja-913-50 | /personal?seccion=caja | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-caja-913.png](equipo/capturas/antes-propietario-caja-913.png) |
| equipo-EQ-B-club-913-51 | /personal?seccion=club | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-club-913.png](equipo/capturas/antes-propietario-club-913.png) |
| equipo-EQ-B-tienda-913-52 | /personal?seccion=tienda | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-tienda-913.png](equipo/capturas/antes-propietario-tienda-913.png) |
| equipo-EQ-B-entregas-913-53 | /personal?seccion=entregas | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-entregas-913.png](equipo/capturas/antes-propietario-entregas-913.png) |
| equipo-EQ-B-agenda-913-54 | /personal?seccion=agenda | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-agenda-913.png](equipo/capturas/antes-propietario-agenda-913.png) |
| equipo-EQ-B-atencion-913-55 | /personal?seccion=atencion | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-atencion-913.png](equipo/capturas/antes-propietario-atencion-913.png) |
| equipo-EQ-B-informes-913-56 | /personal?seccion=informes | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-informes-913.png](equipo/capturas/antes-propietario-informes-913.png) |
| equipo-EQ-B-clientes-913-57 | /personal?seccion=clientes | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-clientes-913.png](equipo/capturas/antes-propietario-clientes-913.png) |
| equipo-EQ-B-equipo-913-58 | /personal?seccion=equipo | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-equipo-913.png](equipo/capturas/antes-propietario-equipo-913.png) |
| equipo-EQ-B-seguridad-913-59 | /personal?seccion=seguridad | propietario | poblado o vacío natural documentado | 913 | revisado | [antes-propietario-seguridad-913.png](equipo/capturas/antes-propietario-seguridad-913.png) |
| equipo-EQ-B-resumen-1440-60 | /personal?seccion=resumen | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-resumen-1440.png](equipo/capturas/antes-propietario-resumen-1440.png) |
| equipo-EQ-B-pedidos-1440-61 | /personal?seccion=pedidos | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-pedidos-1440.png](equipo/capturas/antes-propietario-pedidos-1440.png) |
| equipo-EQ-B-caja-1440-62 | /personal?seccion=caja | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-caja-1440.png](equipo/capturas/antes-propietario-caja-1440.png) |
| equipo-EQ-B-club-1440-63 | /personal?seccion=club | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-club-1440.png](equipo/capturas/antes-propietario-club-1440.png) |
| equipo-EQ-B-tienda-1440-64 | /personal?seccion=tienda | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-tienda-1440.png](equipo/capturas/antes-propietario-tienda-1440.png) |
| equipo-EQ-B-entregas-1440-65 | /personal?seccion=entregas | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-entregas-1440.png](equipo/capturas/antes-propietario-entregas-1440.png) |
| equipo-EQ-B-agenda-1440-66 | /personal?seccion=agenda | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-agenda-1440.png](equipo/capturas/antes-propietario-agenda-1440.png) |
| equipo-EQ-B-atencion-1440-67 | /personal?seccion=atencion | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-atencion-1440.png](equipo/capturas/antes-propietario-atencion-1440.png) |
| equipo-EQ-B-informes-1440-68 | /personal?seccion=informes | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-informes-1440.png](equipo/capturas/antes-propietario-informes-1440.png) |
| equipo-EQ-B-clientes-1440-69 | /personal?seccion=clientes | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-clientes-1440.png](equipo/capturas/antes-propietario-clientes-1440.png) |
| equipo-EQ-B-equipo-1440-70 | /personal?seccion=equipo | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-equipo-1440.png](equipo/capturas/antes-propietario-equipo-1440.png) |
| equipo-EQ-B-seguridad-1440-71 | /personal?seccion=seguridad | propietario | poblado o vacío natural documentado | 1440 | revisado | [antes-propietario-seguridad-1440.png](equipo/capturas/antes-propietario-seguridad-1440.png) |
| equipo-EQ-T200-resumen-72 | /personal?seccion=resumen | propietario | texto 200% | 390 | revisado | [texto200-resumen-390.png](equipo/capturas/texto200-resumen-390.png) |
| equipo-EQ-T200-pedidos-73 | /personal?seccion=pedidos | propietario | texto 200% | 390 | revisado | [texto200-pedidos-390.png](equipo/capturas/texto200-pedidos-390.png) |
| equipo-EQ-T200-caja-74 | /personal?seccion=caja | propietario | texto 200% | 390 | revisado | [texto200-caja-390.png](equipo/capturas/texto200-caja-390.png) |
| equipo-EQ-T200-club-75 | /personal?seccion=club | propietario | texto 200% | 390 | revisado | [texto200-club-390.png](equipo/capturas/texto200-club-390.png) |
| equipo-EQ-T200-tienda-76 | /personal?seccion=tienda | propietario | texto 200% | 390 | revisado | [texto200-tienda-390.png](equipo/capturas/texto200-tienda-390.png) |
| equipo-EQ-T200-entregas-77 | /personal?seccion=entregas | propietario | texto 200% | 390 | revisado | [texto200-entregas-390.png](equipo/capturas/texto200-entregas-390.png) |
| equipo-EQ-T200-agenda-78 | /personal?seccion=agenda | propietario | texto 200% | 390 | revisado | [texto200-agenda-390.png](equipo/capturas/texto200-agenda-390.png) |
| equipo-EQ-T200-atencion-79 | /personal?seccion=atencion | propietario | texto 200% | 390 | revisado | [texto200-atencion-390.png](equipo/capturas/texto200-atencion-390.png) |
| equipo-EQ-T200-informes-80 | /personal?seccion=informes | propietario | texto 200% | 390 | revisado | [texto200-informes-390.png](equipo/capturas/texto200-informes-390.png) |
| equipo-EQ-T200-clientes-81 | /personal?seccion=clientes | propietario | texto 200% | 390 | revisado | [texto200-clientes-390.png](equipo/capturas/texto200-clientes-390.png) |
| equipo-EQ-T200-equipo-82 | /personal?seccion=equipo | propietario | texto 200% | 390 | revisado | [texto200-equipo-390.png](equipo/capturas/texto200-equipo-390.png) |
| equipo-EQ-T200-seguridad-83 | /personal?seccion=seguridad | propietario | texto 200% | 390 | revisado | [texto200-seguridad-390.png](equipo/capturas/texto200-seguridad-390.png) |
| equipo-EQ-ROL-propietario-resumen-84 | /personal?seccion=resumen | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-pedidos-85 | /personal?seccion=pedidos | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-caja-86 | /personal?seccion=caja | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-club-87 | /personal?seccion=club | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-tienda-88 | /personal?seccion=tienda | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-entregas-89 | /personal?seccion=entregas | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-agenda-90 | /personal?seccion=agenda | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-atencion-91 | /personal?seccion=atencion | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-informes-92 | /personal?seccion=informes | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-clientes-93 | /personal?seccion=clientes | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-equipo-94 | /personal?seccion=equipo | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-propietario-seguridad-95 | /personal?seccion=seguridad | propietario | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-PEDIDOS-propietario-390-96 | /personal?seccion=pedidos | propietario | acciones visibles y restricción alimentaria | 390 | revisado | [rol-propietario-pedidos-390.png](equipo/capturas/rol-propietario-pedidos-390.png) |
| equipo-EQ-ROL-PEDIDOS-propietario-1440-97 | /personal?seccion=pedidos | propietario | acciones visibles y restricción alimentaria | 1440 | revisado | [rol-propietario-pedidos-1440.png](equipo/capturas/rol-propietario-pedidos-1440.png) |
| equipo-EQ-ROL-encargado-resumen-98 | /personal?seccion=resumen | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-pedidos-99 | /personal?seccion=pedidos | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-caja-100 | /personal?seccion=caja | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-club-101 | /personal?seccion=club | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-tienda-102 | /personal?seccion=tienda | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-entregas-103 | /personal?seccion=entregas | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-agenda-104 | /personal?seccion=agenda | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-atencion-105 | /personal?seccion=atencion | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-informes-106 | /personal?seccion=informes | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-clientes-107 | /personal?seccion=clientes | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-equipo-108 | /personal?seccion=equipo | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-encargado-seguridad-109 | /personal?seccion=seguridad | encargado | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-PEDIDOS-encargado-390-110 | /personal?seccion=pedidos | encargado | acciones visibles y restricción alimentaria | 390 | revisado | [rol-encargado-pedidos-390.png](equipo/capturas/rol-encargado-pedidos-390.png) |
| equipo-EQ-ROL-PEDIDOS-encargado-1440-111 | /personal?seccion=pedidos | encargado | acciones visibles y restricción alimentaria | 1440 | revisado | [rol-encargado-pedidos-1440.png](equipo/capturas/rol-encargado-pedidos-1440.png) |
| equipo-EQ-ROL-caja-resumen-112 | /personal?seccion=resumen | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-pedidos-113 | /personal?seccion=pedidos | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-caja-114 | /personal?seccion=caja | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-club-115 | /personal?seccion=club | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-tienda-116 | /personal?seccion=tienda | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-entregas-117 | /personal?seccion=entregas | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-agenda-118 | /personal?seccion=agenda | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-atencion-119 | /personal?seccion=atencion | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-informes-120 | /personal?seccion=informes | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-clientes-121 | /personal?seccion=clientes | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-equipo-122 | /personal?seccion=equipo | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-caja-seguridad-123 | /personal?seccion=seguridad | caja | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-PEDIDOS-caja-390-124 | /personal?seccion=pedidos | caja | acciones visibles y restricción alimentaria | 390 | revisado | [rol-caja-pedidos-390.png](equipo/capturas/rol-caja-pedidos-390.png) |
| equipo-EQ-ROL-PEDIDOS-caja-1440-125 | /personal?seccion=pedidos | caja | acciones visibles y restricción alimentaria | 1440 | revisado | [rol-caja-pedidos-1440.png](equipo/capturas/rol-caja-pedidos-1440.png) |
| equipo-EQ-ROL-cocina-resumen-126 | /personal?seccion=resumen | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-pedidos-127 | /personal?seccion=pedidos | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-caja-128 | /personal?seccion=caja | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-club-129 | /personal?seccion=club | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-tienda-130 | /personal?seccion=tienda | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-entregas-131 | /personal?seccion=entregas | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-agenda-132 | /personal?seccion=agenda | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-atencion-133 | /personal?seccion=atencion | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-informes-134 | /personal?seccion=informes | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-clientes-135 | /personal?seccion=clientes | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-equipo-136 | /personal?seccion=equipo | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-cocina-seguridad-137 | /personal?seccion=seguridad | cocina | acceso directo y navegación visible | 1440 | revisado | [roles-dom.json](equipo/roles-dom.json) |
| equipo-EQ-ROL-PEDIDOS-cocina-390-138 | /personal?seccion=pedidos | cocina | acciones visibles y restricción alimentaria | 390 | revisado | [rol-cocina-pedidos-390.png](equipo/capturas/rol-cocina-pedidos-390.png) |
| equipo-EQ-ROL-PEDIDOS-cocina-1440-139 | /personal?seccion=pedidos | cocina | acciones visibles y restricción alimentaria | 1440 | revisado | [rol-cocina-pedidos-1440.png](equipo/capturas/rol-cocina-pedidos-1440.png) |
| equipo-EQ-S-resumen-error-140 | /personal?seccion=resumen | propietario | error de consulta | 390 | revisado | [estado-resumen-error.png](equipo/capturas/estado-resumen-error.png) |
| equipo-EQ-S-resumen-retry-141 | /personal?seccion=resumen | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-resumen-retry.png](equipo/capturas/estado-resumen-retry.png) |
| equipo-EQ-S-pedidos-error-142 | /personal?seccion=pedidos | propietario | error de consulta | 390 | revisado | [estado-pedidos-error.png](equipo/capturas/estado-pedidos-error.png) |
| equipo-EQ-S-pedidos-retry-143 | /personal?seccion=pedidos | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-pedidos-retry.png](equipo/capturas/estado-pedidos-retry.png) |
| equipo-EQ-S-caja-error-144 | /personal?seccion=caja | propietario | error de consulta | 390 | revisado | [estado-caja-error.png](equipo/capturas/estado-caja-error.png) |
| equipo-EQ-S-caja-retry-145 | /personal?seccion=caja | propietario | reintento local | 390 | revisado | [estado-caja-error.png](equipo/capturas/estado-caja-error.png) |
| equipo-EQ-S-club-error-146 | /personal?seccion=club | propietario | error de consulta | 390 | revisado | [estado-club-error.png](equipo/capturas/estado-club-error.png) |
| equipo-EQ-S-club-retry-147 | /personal?seccion=club | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-club-retry.png](equipo/capturas/estado-club-retry.png) |
| equipo-EQ-S-tienda-error-148 | /personal?seccion=tienda | propietario | error de consulta | 390 | revisado | [estado-tienda-error.png](equipo/capturas/estado-tienda-error.png) |
| equipo-EQ-S-tienda-retry-149 | /personal?seccion=tienda | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-tienda-retry.png](equipo/capturas/estado-tienda-retry.png) |
| equipo-EQ-S-entregas-error-150 | /personal?seccion=entregas | propietario | error de consulta | 390 | revisado | [estado-entregas-error.png](equipo/capturas/estado-entregas-error.png) |
| equipo-EQ-S-entregas-retry-151 | /personal?seccion=entregas | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-entregas-retry.png](equipo/capturas/estado-entregas-retry.png) |
| equipo-EQ-S-agenda-error-152 | /personal?seccion=agenda | propietario | error de consulta | 390 | revisado | [estado-agenda-error.png](equipo/capturas/estado-agenda-error.png) |
| equipo-EQ-S-agenda-retry-153 | /personal?seccion=agenda | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-agenda-retry.png](equipo/capturas/estado-agenda-retry.png) |
| equipo-EQ-S-atencion-error-154 | /personal?seccion=atencion | propietario | error de consulta | 390 | revisado | [estado-atencion-error.png](equipo/capturas/estado-atencion-error.png) |
| equipo-EQ-S-atencion-retry-155 | /personal?seccion=atencion | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-atencion-retry.png](equipo/capturas/estado-atencion-retry.png) |
| equipo-EQ-S-informes-error-156 | /personal?seccion=informes | propietario | error de consulta | 390 | revisado | [estado-informes-error.png](equipo/capturas/estado-informes-error.png) |
| equipo-EQ-S-informes-retry-157 | /personal?seccion=informes | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-informes-retry.png](equipo/capturas/estado-informes-retry.png) |
| equipo-EQ-S-clientes-error-158 | /personal?seccion=clientes | propietario | error de consulta | 390 | revisado | [estado-clientes-error.png](equipo/capturas/estado-clientes-error.png) |
| equipo-EQ-S-clientes-retry-159 | /personal?seccion=clientes | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-clientes-retry.png](equipo/capturas/estado-clientes-retry.png) |
| equipo-EQ-S-equipo-error-160 | /personal?seccion=equipo | propietario | error de consulta | 390 | revisado | [estado-equipo-error.png](equipo/capturas/estado-equipo-error.png) |
| equipo-EQ-S-equipo-retry-161 | /personal?seccion=equipo | propietario | recuperación mediante Actualizar | 390 | revisado | [estado-equipo-retry.png](equipo/capturas/estado-equipo-retry.png) |
| equipo-EQ-S-seguridad-error-162 | /personal?seccion=seguridad | propietario | error de consulta | 390 | revisado | [estado-seguridad-error.png](equipo/capturas/estado-seguridad-error.png) |
| equipo-EQ-S-seguridad-retry-163 | /personal?seccion=seguridad | propietario | reintento local | 390 | revisado | [estado-seguridad-error.png](equipo/capturas/estado-seguridad-error.png) |
| equipo-EQ-S-pedidos-vacio-164 | /personal?seccion=pedidos | propietario | búsqueda sin resultados | 390 | revisado | [estado-pedidos-vacio.png](equipo/capturas/estado-pedidos-vacio.png) |
| equipo-EQ-S-pedidos-pagina2-165 | /personal?seccion=pedidos | propietario | lista extensa y pedidos antiguos | 390 | revisado | [estado-pedidos-pagina2.png](equipo/capturas/estado-pedidos-pagina2.png) |
| equipo-EQ-S-cocina-restriccion-166 | /personal?seccion=pedidos | cocina | restricción bloqueante | 390 | revisado | [estado-cocina-restriccion.png](equipo/capturas/estado-cocina-restriccion.png) |
| equipo-EQ-S-cocina-preparacion-167 | /personal?seccion=pedidos | cocina | éxito preparación | 390 | revisado | [estado-cocina-preparacion.png](equipo/capturas/estado-cocina-preparacion.png) |
| equipo-EQ-S-pedido-respuesta-perdida-168 | /personal?seccion=pedidos | propietario | cambio guardado con respuesta perdida | 390 | revisado | [estado-pedido-respuesta-perdida.png](equipo/capturas/estado-pedido-respuesta-perdida.png) |
| equipo-EQ-S-pedido-recuperado-169 | /personal?seccion=pedidos | propietario | Actualización recupera cambio guardado | 390 | revisado | [estado-pedido-recuperado.png](equipo/capturas/estado-pedido-recuperado.png) |
| equipo-EQ-S-cancelar-validacion-170 | /personal?seccion=pedidos | propietario | confirmación sin motivo | 390 | revisado | [estado-cancelar-validacion.png](equipo/capturas/estado-cancelar-validacion.png) |
| equipo-EQ-S-cancelar-exito-171 | /personal?seccion=pedidos | propietario | cancelación con devolución comprobada | 390 | revisado | [estado-cancelar-exito.png](equipo/capturas/estado-cancelar-exito.png) |
| equipo-EQ-S-atencion-dialogo-172 | /personal?seccion=atencion | propietario | respuesta requerida | 390 | revisado | [estado-atencion-dialogo.png](equipo/capturas/estado-atencion-dialogo.png) |
| equipo-EQ-S-atencion-exito-173 | /personal?seccion=atencion | propietario | resolución local sintética | 390 | revisado | [estado-atencion-exito.png](equipo/capturas/estado-atencion-exito.png) |
| equipo-EQ-S-tienda-lista-confirmacion-174 | /personal?seccion=tienda | propietario | confirmación preparar retiro | 390 | revisado | [estado-tienda-lista-confirmacion.png](equipo/capturas/estado-tienda-lista-confirmacion.png) |
| equipo-EQ-S-entrega-confirmacion-175 | /personal?seccion=entregas | propietario | identidad y comprobante | 390 | revisado | [estado-entrega-confirmacion.png](equipo/capturas/estado-entrega-confirmacion.png) |
| equipo-EQ-S-entrega-exito-176 | /personal?seccion=entregas | propietario | entrega registrada | 390 | revisado | [estado-entrega-exito.png](equipo/capturas/estado-entrega-exito.png) |
| equipo-EQ-S-caja-validacion-177 | /personal?seccion=caja | propietario | recarga inferior al mínimo | 390 | revisado | [estado-caja-validacion.png](equipo/capturas/estado-caja-validacion.png) |
| equipo-EQ-S-caja-confirmacion-178 | /personal?seccion=caja | propietario | recarga con importe e identidad | 390 | revisado | [estado-caja-confirmacion.png](equipo/capturas/estado-caja-confirmacion.png) |
| equipo-EQ-S-caja-exito-179 | /personal?seccion=caja | propietario | recarga local | 390 | revisado | [estado-caja-exito.png](equipo/capturas/estado-caja-exito.png) |
| equipo-EQ-S-csv-180 | /personal?seccion=informes | propietario | exportación CSV | 390 | revisado | [estado-csv.png](equipo/capturas/estado-csv.png) |
| equipo-EQ-S-equipo-invitar-181 | /personal?seccion=equipo | propietario | formulario invitación y validación nativa | 390 | revisado | [estado-equipo-invitar.png](equipo/capturas/estado-equipo-invitar.png) |
| equipo-EQ-S-equipo-invalido-182 | /personal?seccion=equipo | propietario | campos requeridos | 390 | revisado | [estado-equipo-invalido.png](equipo/capturas/estado-equipo-invalido.png) |
| equipo-EQ-S-seguridad-renovar-183 | /personal?seccion=seguridad | propietario | confirmación renovación destructiva | 390 | revisado | [estado-seguridad-renovar.png](equipo/capturas/estado-seguridad-renovar.png) |
| equipo-EQ-S-seguridad-identidad-184 | /personal?seccion=seguridad | propietario | revalidación de identidad | 390 | revisado | [estado-seguridad-identidad.png](equipo/capturas/estado-seguridad-identidad.png) |
| equipo-EQ-S-cliente-incompleto-185 | /personal?seccion=clientes | propietario | sin correo ni bebida declarada | 390 | revisado | [estado-cliente-incompleto.png](equipo/capturas/estado-cliente-incompleto.png) |
| equipo-EQ-S-menu-teclado-186 | /personal?seccion=pedidos | propietario | menú móvil abierto por teclado | 390 | revisado | [estado-menu-teclado.png](equipo/capturas/estado-menu-teclado.png) |
| equipo-EQ-TECLADO-MENU-187 | /personal?seccion=pedidos | propietario | teclado Escape | 390 | revisado | [estado-menu-teclado.png](equipo/capturas/estado-menu-teclado.png) |
| equipo-EQ-A-pedidos-expandido-188 | /personal?seccion=pedidos | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-pedidos-expandido.png](equipo/capturas/ampliacion-pedidos-expandido.png) |
| equipo-EQ-A-AXE-pedidos-189 | /personal?seccion=pedidos | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-pedidos-expandido.png](equipo/capturas/ampliacion-pedidos-expandido.png) |
| equipo-EQ-A-club-expandido-190 | /personal?seccion=club | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-club-expandido.png](equipo/capturas/ampliacion-club-expandido.png) |
| equipo-EQ-A-AXE-club-191 | /personal?seccion=club | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-club-expandido.png](equipo/capturas/ampliacion-club-expandido.png) |
| equipo-EQ-A-tienda-expandido-192 | /personal?seccion=tienda | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-tienda-expandido.png](equipo/capturas/ampliacion-tienda-expandido.png) |
| equipo-EQ-A-AXE-tienda-193 | /personal?seccion=tienda | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-tienda-expandido.png](equipo/capturas/ampliacion-tienda-expandido.png) |
| equipo-EQ-A-agenda-expandido-194 | /personal?seccion=agenda | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-agenda-expandido.png](equipo/capturas/ampliacion-agenda-expandido.png) |
| equipo-EQ-A-AXE-agenda-195 | /personal?seccion=agenda | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-agenda-expandido.png](equipo/capturas/ampliacion-agenda-expandido.png) |
| equipo-EQ-A-informes-expandido-196 | /personal?seccion=informes | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-informes-expandido.png](equipo/capturas/ampliacion-informes-expandido.png) |
| equipo-EQ-A-AXE-informes-197 | /personal?seccion=informes | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-informes-expandido.png](equipo/capturas/ampliacion-informes-expandido.png) |
| equipo-EQ-A-clientes-expandido-198 | /personal?seccion=clientes | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-clientes-expandido.png](equipo/capturas/ampliacion-clientes-expandido.png) |
| equipo-EQ-A-AXE-clientes-199 | /personal?seccion=clientes | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-clientes-expandido.png](equipo/capturas/ampliacion-clientes-expandido.png) |
| equipo-EQ-A-equipo-expandido-200 | /personal?seccion=equipo | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-equipo-expandido.png](equipo/capturas/ampliacion-equipo-expandido.png) |
| equipo-EQ-A-AXE-equipo-201 | /personal?seccion=equipo | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-equipo-expandido.png](equipo/capturas/ampliacion-equipo-expandido.png) |
| equipo-EQ-A-seguridad-expandido-202 | /personal?seccion=seguridad | propietario | herramientas y formularios desplegados | 390 | revisado | [ampliacion-seguridad-expandido.png](equipo/capturas/ampliacion-seguridad-expandido.png) |
| equipo-EQ-A-AXE-seguridad-203 | /personal?seccion=seguridad | propietario | accesibilidad módulos expandidos | 390 | revisado | [ampliacion-seguridad-expandido.png](equipo/capturas/ampliacion-seguridad-expandido.png) |
| equipo-EQ-A-agenda-manual-204 | /personal?seccion=agenda | propietario | formulario de reserva manual y motivo requerido | 390 | revisado | [ampliacion-agenda-manual.png](equipo/capturas/ampliacion-agenda-manual.png) |
| equipo-EQ-A-API-caja-205 | /personal | caja | restricción de API real | 390 | revisado | [ampliacion.json](equipo/ampliacion.json) |
| equipo-EQ-A-API-cocina-206 | /personal | cocina | restricción de API real | 390 | revisado | [ampliacion.json](equipo/ampliacion.json) |
| equipo-EQ-A-API-encargado-207 | /personal | encargado | restricción de API real | 390 | revisado | [ampliacion.json](equipo/ampliacion.json) |
| equipo-EQ-A-texto200-pedido-detalle-208 | /personal?seccion=pedidos | propietario | texto duplicado y detalle de pedido | 390 | revisado | [ampliacion-texto200-pedido-detalle.png](equipo/capturas/ampliacion-texto200-pedido-detalle.png) |
| equipo-EQ-FOCO-DIALOGO-209 | /personal?seccion=equipo | propietario | tabulación, Escape y retorno del foco | 390 | revisado | [foco-dialogo.png](equipo/capturas/foco-dialogo.png) |
| equipo-EQ-MOVIMIENTO-210 | http://127.0.0.1:5301/personal?seccion=pedidos | propietario | movimiento reducido y pares de contraste | 390 | revisado | [accesibilidad.json](equipo/accesibilidad.json) |
| equipo-PE-MOVIMIENTO-211 | http://127.0.0.1:5310/equipo | propietario | movimiento reducido y pares de contraste | 390 | revisado | [accesibilidad.json](equipo/accesibilidad.json) |
| equipo-EQ-TEXTO200-ANALISIS-212 | /personal?seccion=pedidos | propietario | investigación del ancho interno | 390 | revisado | [ampliacion-texto200-pedido-detalle.png](equipo/capturas/ampliacion-texto200-pedido-detalle.png) |
| equipo-EQ-MATRIZ-resumen-vacio-213 | /personal?seccion=resumen | propietario | vacio | 390 | revisado | [resumen-vacio.png](equipo/cierres-lecturas/resumen-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-resumen-carga-214 | /personal?seccion=resumen | propietario | carga | 390 | revisado | [resumen-carga.png](equipo/cierres-lecturas/resumen-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-resumen-error-215 | /personal?seccion=resumen | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-resumen-reintento-216 | /personal?seccion=resumen | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-resumen-exito-217 | /personal?seccion=resumen | propietario | exito | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-resumen-validacion-218 | /personal?seccion=resumen | propietario | validacion | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-resumen-respuesta_perdida-219 | /personal?seccion=resumen | propietario | respuesta_perdida | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-resumen-lista_extensa-220 | /personal?seccion=resumen | propietario | lista_extensa | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-resumen-dato_incompleto-221 | /personal?seccion=resumen | propietario | dato_incompleto | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-pedidos-vacio-222 | /personal?seccion=pedidos | propietario | vacio | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-carga-223 | /personal?seccion=pedidos | propietario | carga | 390 | revisado | [pedidos-carga.png](equipo/cierres-lecturas/pedidos-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-pedidos-error-224 | /personal?seccion=pedidos | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-reintento-225 | /personal?seccion=pedidos | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-exito-226 | /personal?seccion=pedidos | propietario | exito | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-validacion-227 | /personal?seccion=pedidos | propietario | validacion | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-respuesta_perdida-228 | /personal?seccion=pedidos | propietario | respuesta_perdida | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-lista_extensa-229 | /personal?seccion=pedidos | propietario | lista_extensa | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-pedidos-dato_incompleto-230 | /personal?seccion=pedidos | propietario | dato_incompleto | 390 | revisado | [pedidos-dato_incompleto.png](equipo/cierres-lecturas/pedidos-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-caja-vacio-231 | /personal?seccion=caja | propietario | vacio | 390 | revisado | [caja-vacio.png](equipo/cierres-lecturas/caja-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-caja-carga-232 | /personal?seccion=caja | propietario | carga | 390 | revisado | [caja-carga.png](equipo/cierres-lecturas/caja-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-caja-error-233 | /personal?seccion=caja | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-caja-reintento-234 | /personal?seccion=caja | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-caja-exito-235 | /personal?seccion=caja | propietario | exito | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-caja-validacion-236 | /personal?seccion=caja | propietario | validacion | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-caja-respuesta_perdida-237 | /personal?seccion=caja | propietario | respuesta_perdida | 1440 | revisado | [caja-ui.json](equipo/ciclos/club-caja-ui/caja-ui.json) · [caja-descuento.png](equipo/ciclos/club-caja-ui/caja-descuento.png) |
| equipo-EQ-MATRIZ-caja-lista_extensa-238 | /personal?seccion=caja | propietario | lista_extensa | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-caja-dato_incompleto-239 | /personal?seccion=caja | propietario | dato_incompleto | 390 | revisado | [caja-dato_incompleto.png](equipo/cierres-lecturas/caja-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-club-vacio-240 | /personal?seccion=club | propietario | vacio | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-club-carga-241 | /personal?seccion=club | propietario | carga | 390 | revisado | [club-carga.png](equipo/cierres-lecturas/club-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-club-error-242 | /personal?seccion=club | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-club-reintento-243 | /personal?seccion=club | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-club-exito-244 | /personal?seccion=club | propietario | exito | 390 | revisado | [operacion-ui.json](equipo/ciclos/mi-club-operacion-ui/operacion-ui.json) · [operacion.png](equipo/ciclos/mi-club-operacion-ui/operacion.png) · [reglas-interfaz.json](equipo/ciclos/reglas-club-ui/reglas-interfaz.json) · [reglas-equipo.png](equipo/ciclos/reglas-club-ui/reglas-equipo.png) · [reglas-cliente.png](equipo/ciclos/reglas-club-ui/reglas-cliente.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [club-validacion.png](equipo/cierres-ciclos/club-validacion.png) · [club-respuesta-perdida.png](equipo/cierres-ciclos/club-respuesta-perdida.png) · [club-publicada-cancelada.png](equipo/cierres-ciclos/club-publicada-cancelada.png) |
| equipo-EQ-MATRIZ-club-validacion-245 | /personal?seccion=club | propietario | validacion | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [club-validacion.png](equipo/cierres-ciclos/club-validacion.png) · [club-respuesta-perdida.png](equipo/cierres-ciclos/club-respuesta-perdida.png) · [club-publicada-cancelada.png](equipo/cierres-ciclos/club-publicada-cancelada.png) · [operacion-ui.json](equipo/ciclos/mi-club-operacion-ui/operacion-ui.json) · [operacion.png](equipo/ciclos/mi-club-operacion-ui/operacion.png) · [reglas-interfaz.json](equipo/ciclos/reglas-club-ui/reglas-interfaz.json) · [reglas-equipo.png](equipo/ciclos/reglas-club-ui/reglas-equipo.png) · [reglas-cliente.png](equipo/ciclos/reglas-club-ui/reglas-cliente.png) |
| equipo-EQ-MATRIZ-club-respuesta_perdida-246 | /personal?seccion=club | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [club-validacion.png](equipo/cierres-ciclos/club-validacion.png) · [club-respuesta-perdida.png](equipo/cierres-ciclos/club-respuesta-perdida.png) · [club-publicada-cancelada.png](equipo/cierres-ciclos/club-publicada-cancelada.png) |
| equipo-EQ-MATRIZ-club-lista_extensa-247 | /personal?seccion=club | propietario | lista_extensa | 390 | revisado | [club-lista_extensa.png](equipo/cierres-lecturas/club-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-club-dato_incompleto-248 | /personal?seccion=club | propietario | dato_incompleto | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-tienda-vacio-249 | /personal?seccion=tienda | propietario | vacio | 390 | revisado | [tienda-vacio.png](equipo/cierres-lecturas/tienda-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-tienda-carga-250 | /personal?seccion=tienda | propietario | carga | 390 | revisado | [tienda-carga.png](equipo/cierres-lecturas/tienda-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-tienda-error-251 | /personal?seccion=tienda | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-tienda-reintento-252 | /personal?seccion=tienda | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-tienda-exito-253 | /personal?seccion=tienda | propietario | exito | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-tienda-validacion-254 | /personal?seccion=tienda | propietario | validacion | 1440 | revisado | [operacion-ui.json](equipo/ciclos/tienda-operacion-ui/operacion-ui.json) · [operacion.png](equipo/ciclos/tienda-operacion-ui/operacion.png) |
| equipo-EQ-MATRIZ-tienda-respuesta_perdida-255 | /personal?seccion=tienda | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [tienda-respuesta-perdida.png](equipo/cierres-ciclos/tienda-respuesta-perdida.png) · [tienda-recuperada.png](equipo/cierres-ciclos/tienda-recuperada.png) |
| equipo-EQ-MATRIZ-tienda-lista_extensa-256 | /personal?seccion=tienda | propietario | lista_extensa | 390 | revisado | [tienda-lista_extensa.png](equipo/cierres-lecturas/tienda-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-tienda-dato_incompleto-257 | /personal?seccion=tienda | propietario | dato_incompleto | 390 | revisado | [tienda-dato_incompleto.png](equipo/cierres-lecturas/tienda-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-entregas-vacio-258 | /personal?seccion=entregas | propietario | vacio | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-entregas-carga-259 | /personal?seccion=entregas | propietario | carga | 390 | revisado | [entregas-carga.png](equipo/cierres-lecturas/entregas-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-entregas-error-260 | /personal?seccion=entregas | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-entregas-reintento-261 | /personal?seccion=entregas | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-entregas-exito-262 | /personal?seccion=entregas | propietario | exito | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-entregas-validacion-263 | /personal?seccion=entregas | propietario | validacion | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [entregas-validacion-identidad.png](equipo/cierres-ciclos/entregas-validacion-identidad.png) · [entregas-respuesta-perdida.png](equipo/cierres-ciclos/entregas-respuesta-perdida.png) · [entregas-recuperada.png](equipo/cierres-ciclos/entregas-recuperada.png) |
| equipo-EQ-MATRIZ-entregas-respuesta_perdida-264 | /personal?seccion=entregas | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [entregas-validacion-identidad.png](equipo/cierres-ciclos/entregas-validacion-identidad.png) · [entregas-respuesta-perdida.png](equipo/cierres-ciclos/entregas-respuesta-perdida.png) · [entregas-recuperada.png](equipo/cierres-ciclos/entregas-recuperada.png) |
| equipo-EQ-MATRIZ-entregas-lista_extensa-265 | /personal?seccion=entregas | propietario | lista_extensa | 390 | revisado | [entregas-lista_extensa.png](equipo/cierres-lecturas/entregas-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-entregas-dato_incompleto-266 | /personal?seccion=entregas | propietario | dato_incompleto | 390 | revisado | [entregas-dato_incompleto.png](equipo/cierres-lecturas/entregas-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-agenda-vacio-267 | /personal?seccion=agenda | propietario | vacio | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-agenda-carga-268 | /personal?seccion=agenda | propietario | carga | 390 | revisado | [agenda-carga.png](equipo/cierres-lecturas/agenda-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-agenda-error-269 | /personal?seccion=agenda | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-agenda-reintento-270 | /personal?seccion=agenda | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-agenda-exito-271 | /personal?seccion=agenda | propietario | exito | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [agenda-validacion-vip.png](equipo/cierres-ciclos/agenda-validacion-vip.png) · [agenda-manual-creada.png](equipo/cierres-ciclos/agenda-manual-creada.png) · [agenda-respuesta-perdida.png](equipo/cierres-ciclos/agenda-respuesta-perdida.png) · [agenda-ciclo-finalizado.png](equipo/cierres-ciclos/agenda-ciclo-finalizado.png) |
| equipo-EQ-MATRIZ-agenda-validacion-272 | /personal?seccion=agenda | propietario | validacion | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [agenda-validacion-vip.png](equipo/cierres-ciclos/agenda-validacion-vip.png) · [agenda-manual-creada.png](equipo/cierres-ciclos/agenda-manual-creada.png) · [agenda-respuesta-perdida.png](equipo/cierres-ciclos/agenda-respuesta-perdida.png) · [agenda-ciclo-finalizado.png](equipo/cierres-ciclos/agenda-ciclo-finalizado.png) |
| equipo-EQ-MATRIZ-agenda-respuesta_perdida-273 | /personal?seccion=agenda | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [agenda-validacion-vip.png](equipo/cierres-ciclos/agenda-validacion-vip.png) · [agenda-manual-creada.png](equipo/cierres-ciclos/agenda-manual-creada.png) · [agenda-respuesta-perdida.png](equipo/cierres-ciclos/agenda-respuesta-perdida.png) · [agenda-ciclo-finalizado.png](equipo/cierres-ciclos/agenda-ciclo-finalizado.png) |
| equipo-EQ-MATRIZ-agenda-lista_extensa-274 | /personal?seccion=agenda | propietario | lista_extensa | 390 | revisado | [agenda-lista_extensa.png](equipo/cierres-lecturas/agenda-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-agenda-dato_incompleto-275 | /personal?seccion=agenda | propietario | dato_incompleto | 390 | revisado | [agenda-dato_incompleto.png](equipo/cierres-lecturas/agenda-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-atencion-vacio-276 | /personal?seccion=atencion | propietario | vacio | 390 | revisado | [atencion-vacio.png](equipo/cierres-lecturas/atencion-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-atencion-carga-277 | /personal?seccion=atencion | propietario | carga | 390 | revisado | [atencion-carga.png](equipo/cierres-lecturas/atencion-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-atencion-error-278 | /personal?seccion=atencion | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-atencion-reintento-279 | /personal?seccion=atencion | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-atencion-exito-280 | /personal?seccion=atencion | propietario | exito | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-atencion-validacion-281 | /personal?seccion=atencion | propietario | validacion | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-atencion-respuesta_perdida-282 | /personal?seccion=atencion | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [atencion-respuesta-perdida.png](equipo/cierres-ciclos/atencion-respuesta-perdida.png) · [atencion-recuperada.png](equipo/cierres-ciclos/atencion-recuperada.png) |
| equipo-EQ-MATRIZ-atencion-lista_extensa-283 | /personal?seccion=atencion | propietario | lista_extensa | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-atencion-dato_incompleto-284 | /personal?seccion=atencion | propietario | dato_incompleto | 390 | revisado | [atencion-dato_incompleto.png](equipo/cierres-lecturas/atencion-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-informes-vacio-285 | /personal?seccion=informes | propietario | vacio | 390 | revisado | [informes-vacio.png](equipo/cierres-lecturas/informes-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-informes-carga-286 | /personal?seccion=informes | propietario | carga | 390 | revisado | [informes-carga.png](equipo/cierres-lecturas/informes-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-informes-error-287 | /personal?seccion=informes | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-informes-reintento-288 | /personal?seccion=informes | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-informes-exito-289 | /personal?seccion=informes | propietario | exito | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-informes-validacion-290 | /personal?seccion=informes | propietario | validacion | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-informes-respuesta_perdida-291 | /personal?seccion=informes | propietario | respuesta_perdida | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-informes-lista_extensa-292 | /personal?seccion=informes | propietario | lista_extensa | 390 | revisado | [informes-lista_extensa.png](equipo/cierres-lecturas/informes-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-informes-dato_incompleto-293 | /personal?seccion=informes | propietario | dato_incompleto | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-clientes-vacio-294 | /personal?seccion=clientes | propietario | vacio | 390 | revisado | [clientes-vacio.png](equipo/cierres-lecturas/clientes-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-clientes-carga-295 | /personal?seccion=clientes | propietario | carga | 390 | revisado | [clientes-carga.png](equipo/cierres-lecturas/clientes-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-clientes-error-296 | /personal?seccion=clientes | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-clientes-reintento-297 | /personal?seccion=clientes | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-clientes-exito-298 | /personal?seccion=clientes | propietario | exito | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-clientes-validacion-299 | /personal?seccion=clientes | propietario | validacion | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-clientes-respuesta_perdida-300 | /personal?seccion=clientes | propietario | respuesta_perdida | 390 | no_aplicable | [inventario.md](equipo/inventario.md) |
| equipo-EQ-MATRIZ-clientes-lista_extensa-301 | /personal?seccion=clientes | propietario | lista_extensa | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-clientes-dato_incompleto-302 | /personal?seccion=clientes | propietario | dato_incompleto | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-equipo-vacio-303 | /personal?seccion=equipo | propietario | vacio | 390 | revisado | [equipo-vacio.png](equipo/cierres-lecturas/equipo-vacio.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-equipo-carga-304 | /personal?seccion=equipo | propietario | carga | 390 | revisado | [equipo-carga.png](equipo/cierres-lecturas/equipo-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-equipo-error-305 | /personal?seccion=equipo | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-equipo-reintento-306 | /personal?seccion=equipo | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-equipo-exito-307 | /personal?seccion=equipo | propietario | exito | 390 | revisado | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) · [invitacion.png](equipo/ciclos/redisenio-seguridad-ui/invitacion.png) · [codigos.png](equipo/ciclos/redisenio-seguridad-ui/codigos.png) · [recuperar.png](equipo/ciclos/redisenio-seguridad-ui/recuperar.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [equipo-respuesta-perdida.png](equipo/cierres-ciclos/equipo-respuesta-perdida.png) · [equipo-recuperado-reactivado.png](equipo/cierres-ciclos/equipo-recuperado-reactivado.png) |
| equipo-EQ-MATRIZ-equipo-validacion-308 | /personal?seccion=equipo | propietario | validacion | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-equipo-respuesta_perdida-309 | /personal?seccion=equipo | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [equipo-respuesta-perdida.png](equipo/cierres-ciclos/equipo-respuesta-perdida.png) · [equipo-recuperado-reactivado.png](equipo/cierres-ciclos/equipo-recuperado-reactivado.png) |
| equipo-EQ-MATRIZ-equipo-lista_extensa-310 | /personal?seccion=equipo | propietario | lista_extensa | 390 | revisado | [equipo-lista_extensa.png](equipo/cierres-lecturas/equipo-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-equipo-dato_incompleto-311 | /personal?seccion=equipo | propietario | dato_incompleto | 390 | revisado | [equipo-dato_incompleto.png](equipo/cierres-lecturas/equipo-dato_incompleto.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-seguridad-vacio-312 | /personal?seccion=seguridad | propietario | vacio | 390 | no_aplicable | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) |
| equipo-EQ-MATRIZ-seguridad-carga-313 | /personal?seccion=seguridad | propietario | carga | 390 | revisado | [seguridad-carga.png](equipo/cierres-lecturas/seguridad-carga.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-seguridad-error-314 | /personal?seccion=seguridad | propietario | error | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-seguridad-reintento-315 | /personal?seccion=seguridad | propietario | reintento | 390 | revisado | [cobertura-estados.json](equipo/cobertura-estados.json) · [inventario-dom.json](equipo/inventario-dom.json) |
| equipo-EQ-MATRIZ-seguridad-exito-316 | /personal?seccion=seguridad | propietario | exito | 390 | revisado | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) · [invitacion.png](equipo/ciclos/redisenio-seguridad-ui/invitacion.png) · [codigos.png](equipo/ciclos/redisenio-seguridad-ui/codigos.png) · [recuperar.png](equipo/ciclos/redisenio-seguridad-ui/recuperar.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [seguridad-respuesta-perdida.png](equipo/cierres-ciclos/seguridad-respuesta-perdida.png) · [seguridad-validacion.png](equipo/cierres-ciclos/seguridad-validacion.png) · [seguridad-clave-guardada.png](equipo/cierres-ciclos/seguridad-clave-guardada.png) |
| equipo-EQ-MATRIZ-seguridad-validacion-317 | /personal?seccion=seguridad | propietario | validacion | 390 | revisado | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) · [invitacion.png](equipo/ciclos/redisenio-seguridad-ui/invitacion.png) · [codigos.png](equipo/ciclos/redisenio-seguridad-ui/codigos.png) · [recuperar.png](equipo/ciclos/redisenio-seguridad-ui/recuperar.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [seguridad-respuesta-perdida.png](equipo/cierres-ciclos/seguridad-respuesta-perdida.png) · [seguridad-validacion.png](equipo/cierres-ciclos/seguridad-validacion.png) · [seguridad-clave-guardada.png](equipo/cierres-ciclos/seguridad-clave-guardada.png) |
| equipo-EQ-MATRIZ-seguridad-respuesta_perdida-318 | /personal?seccion=seguridad | propietario | respuesta_perdida | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [seguridad-respuesta-perdida.png](equipo/cierres-ciclos/seguridad-respuesta-perdida.png) · [seguridad-validacion.png](equipo/cierres-ciclos/seguridad-validacion.png) · [seguridad-clave-guardada.png](equipo/cierres-ciclos/seguridad-clave-guardada.png) |
| equipo-EQ-MATRIZ-seguridad-lista_extensa-319 | /personal?seccion=seguridad | propietario | lista_extensa | 390 | revisado | [seguridad-lista_extensa.png](equipo/cierres-lecturas/seguridad-lista_extensa.png) · [resultados.json](equipo/cierres-lecturas/resultados.json) |
| equipo-EQ-MATRIZ-seguridad-dato_incompleto-320 | /personal?seccion=seguridad | propietario | dato_incompleto | 390 | no_aplicable | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) |
| equipo-EQ-PENDIENTE-pedidos-321 | /personal?seccion=pedidos | propietario | Guardar configuración/ficha/pausa de Carta hasta éxito | 390 | revisado | [operacion-ui.json](equipo/ciclos/carta-operacion-ui/operacion-ui.json) · [operacion-carta.png](equipo/ciclos/carta-operacion-ui/operacion-carta.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [carta-pausa.png](equipo/cierres-ciclos/carta-pausa.png) · [carta-reanudada.png](equipo/cierres-ciclos/carta-reanudada.png) |
| equipo-EQ-PENDIENTE-caja-322 | /personal?seccion=caja | propietario | Entrega de beneficio, premio por sellos, descuento y anulación hasta éxito | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [beneficio-entregado.png](equipo/cierres-ciclos/beneficio-entregado.png) · [reglas-interfaz.json](equipo/ciclos/reglas-club-ui/reglas-interfaz.json) · [reglas-equipo.png](equipo/ciclos/reglas-club-ui/reglas-equipo.png) · [reglas-cliente.png](equipo/ciclos/reglas-club-ui/reglas-cliente.png) · [caja-ui.json](equipo/ciclos/club-caja-ui/caja-ui.json) · [caja-descuento.png](equipo/ciclos/club-caja-ui/caja-descuento.png) |
| equipo-EQ-PENDIENTE-club-323 | /personal?seccion=club | propietario | Publicar/cancelar experiencia, reglas/costos y reposiciones hasta éxito | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [club-validacion.png](equipo/cierres-ciclos/club-validacion.png) · [club-respuesta-perdida.png](equipo/cierres-ciclos/club-respuesta-perdida.png) · [club-publicada-cancelada.png](equipo/cierres-ciclos/club-publicada-cancelada.png) · [operacion-ui.json](equipo/ciclos/mi-club-operacion-ui/operacion-ui.json) · [operacion.png](equipo/ciclos/mi-club-operacion-ui/operacion.png) · [reglas-interfaz.json](equipo/ciclos/reglas-club-ui/reglas-interfaz.json) · [reglas-equipo.png](equipo/ciclos/reglas-club-ui/reglas-equipo.png) · [reglas-cliente.png](equipo/ciclos/reglas-club-ui/reglas-cliente.png) |
| equipo-EQ-PENDIENTE-tienda-324 | /personal?seccion=tienda | propietario | Reembolso de bolsa y guardar ficha completa hasta éxito | 1440 | revisado | [operacion-ui.json](equipo/ciclos/tienda-operacion-ui/operacion-ui.json) · [operacion.png](equipo/ciclos/tienda-operacion-ui/operacion.png) |
| equipo-EQ-PENDIENTE-agenda-325 | /personal?seccion=agenda | propietario | Registrar visita y ciclo llegada/mesa/salida; aplicar/devolver anticipo | 390 | revisado | [resultados.json](equipo/cierres-ciclos/resultados.json) · [agenda-validacion-vip.png](equipo/cierres-ciclos/agenda-validacion-vip.png) · [agenda-manual-creada.png](equipo/cierres-ciclos/agenda-manual-creada.png) · [agenda-respuesta-perdida.png](equipo/cierres-ciclos/agenda-respuesta-perdida.png) · [agenda-ciclo-finalizado.png](equipo/cierres-ciclos/agenda-ciclo-finalizado.png) |
| equipo-EQ-PENDIENTE-equipo-326 | /personal?seccion=equipo | propietario | Invitar/activar; cambiar rol; desactivar/reactivar/renovar invitación | 390 | revisado | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) · [invitacion.png](equipo/ciclos/redisenio-seguridad-ui/invitacion.png) · [codigos.png](equipo/ciclos/redisenio-seguridad-ui/codigos.png) · [recuperar.png](equipo/ciclos/redisenio-seguridad-ui/recuperar.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [equipo-respuesta-perdida.png](equipo/cierres-ciclos/equipo-respuesta-perdida.png) · [equipo-recuperado-reactivado.png](equipo/cierres-ciclos/equipo-recuperado-reactivado.png) |
| equipo-EQ-PENDIENTE-seguridad-327 | /personal?seccion=seguridad | propietario | Cambiar contraseña/rotar códigos/revocar sesiones hasta éxito | 390 | revisado | [resultados.json](equipo/ciclos/redisenio-seguridad-ui/resultados.json) · [invitacion.png](equipo/ciclos/redisenio-seguridad-ui/invitacion.png) · [codigos.png](equipo/ciclos/redisenio-seguridad-ui/codigos.png) · [recuperar.png](equipo/ciclos/redisenio-seguridad-ui/recuperar.png) · [resultados.json](equipo/cierres-ciclos/resultados.json) · [seguridad-respuesta-perdida.png](equipo/cierres-ciclos/seguridad-respuesta-perdida.png) · [seguridad-validacion.png](equipo/cierres-ciclos/seguridad-validacion.png) · [seguridad-clave-guardada.png](equipo/cierres-ciclos/seguridad-clave-guardada.png) |
| equipo-PE-ANCHO-320-328 | /equipo (prototipo 5310) | caja/cocina simulados | poblado | 320 | revisado | [despues-320.png](equipo/capturas/despues-320.png) |
| equipo-PE-ANCHO-390-329 | /equipo (prototipo 5310) | caja/cocina simulados | poblado | 390 | revisado | [despues-390.png](equipo/capturas/despues-390.png) |
| equipo-PE-ANCHO-768-330 | /equipo (prototipo 5310) | caja/cocina simulados | poblado | 768 | revisado | [despues-768.png](equipo/capturas/despues-768.png) |
| equipo-PE-ANCHO-913-331 | /equipo (prototipo 5310) | caja/cocina simulados | poblado | 913 | revisado | [despues-913.png](equipo/capturas/despues-913.png) |
| equipo-PE-ANCHO-1440-332 | /equipo (prototipo 5310) | caja/cocina simulados | poblado | 1440 | revisado | [despues-1440.png](equipo/capturas/despues-1440.png) |
| equipo-PE-AXE-333 | /equipo (prototipo 5310) | caja/cocina simulados | PE-AXE | 390 | revisado | [verificacion-prototipo.json](equipo/verificacion-prototipo.json) |
| equipo-PE-RESTRICCION-334 | /equipo (prototipo 5310) | caja/cocina simulados | PE-RESTRICCION | 390 | revisado | [despues-restriccion.png](equipo/capturas/despues-restriccion.png) |
| equipo-PE-ERROR-335 | /equipo (prototipo 5310) | caja/cocina simulados | PE-ERROR | 390 | revisado | [despues-error.png](equipo/capturas/despues-error.png) |
| equipo-PE-RESPUESTA-PERDIDA-336 | /equipo (prototipo 5310) | caja/cocina simulados | PE-RESPUESTA-PERDIDA | 390 | revisado | [despues-respuesta-perdida.png](equipo/capturas/despues-respuesta-perdida.png) |
| equipo-PE-ENTREGA-337 | /equipo (prototipo 5310) | caja/cocina simulados | PE-ENTREGA | 390 | revisado | [despues-entrega.png](equipo/capturas/despues-entrega.png) |
| equipo-PE-VALIDACION-338 | /equipo (prototipo 5310) | caja/cocina simulados | PE-VALIDACION | 390 | revisado | [despues-validacion.png](equipo/capturas/despues-validacion.png) |
| equipo-PE-HISTORIAL-339 | /equipo (prototipo 5310) | caja/cocina simulados | PE-HISTORIAL | 390 | revisado | [despues-historial.png](equipo/capturas/despues-historial.png) |
| equipo-PE-VACIO-340 | /equipo (prototipo 5310) | caja/cocina simulados | PE-VACIO | 390 | revisado | [despues-vacio.png](equipo/capturas/despues-vacio.png) |
| equipo-PE-TEXTO200-341 | /equipo (prototipo 5310) | caja/cocina simulados | PE-TEXTO200 | 390 | revisado | [despues-texto200.png](equipo/capturas/despues-texto200.png) |
| otp | acceso/compartido | visitante o cliente sintético | código solicitado | 390 | revisado | [otp.png](base/estados/otp.png) |
| otp-invalido | acceso/compartido | visitante o cliente sintético | validación código incorrecto | 390 | revisado | [otp-invalido.png](base/estados/otp-invalido.png) |
| otp-vencido | acceso/compartido | visitante o cliente sintético | código vencido | 390 | revisado | [otp-vencido.png](base/estados/otp-vencido.png) |
| sesion-vencida | /club | cliente | 401 simulado | 390 | revisado | [sesion-vencida.png](base/estados/sesion-vencida.png) |
| seccion-no-disponible | /kit | visitante | chunk ausente | 390 | revisado | [seccion-no-disponible.png](base/estados/seccion-no-disponible.png) |
| sesion-revocada | /perfil | cliente | sesión revocada en base local | 390 | revisado | [sesion-revocada-real-fixture.png](base/estados/sesion-revocada-real-fixture.png) |
| calendario-original | /reservas | cliente | descarga del calendario original | 390 | revisado | [calendario-reserva-390.png](base/calendario-reserva-390.png) · [calendario-reserva.ics](base/calendario-reserva.ics) · [calendario-original.json](base/calendario-original.json) |
| campo-dispositivos | todas | todos | dispositivos físicos/teclado virtual/lector humano | real | pendiente | [INFORME.md](INFORME.md) |
| campo-correo | correos | cliente | Gmail/Outlook reales | real | pendiente | [fichas.md](base/fichas.md) |
