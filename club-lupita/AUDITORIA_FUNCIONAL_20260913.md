# Auditoría funcional de Club Lupita

13 de septiembre de 2026. Versión auditada: `club-lupita` de este proyecto, con el nuevo diseño de `src/casa`. No se usó la aplicación de la carpeta vecina APP _ v2.

El diseño nuevo tiene una base funcional real: no es una maqueta de botones. Sin embargo, todavía no puede calificarse como una aplicación operativa completa para clientes reales. Las principales brechas siguen siendo el registro personal, la gestión del pedido por el restaurante y la validación de algunos beneficios.

## Alcance y evidencia

Se inspeccionó la aplicación publicada con el navegador integrado. Las operaciones que modifican datos se probaron en `http://127.0.0.1:5212`, con una base PostgreSQL efímera mediante PGlite y cuentas sintéticas. El servidor ejecuta el Worker del proyecto y sirve la compilación de producción: las compras de prueba no tocan Neon ni generan cargos reales.

Se recorrieron Inicio, Carta, Tienda, Club, Reservar, Perfil y la entrada de demostración. Se inspeccionaron escritorio y una vista móvil de 390 px mediante un iframe de prueba. Esto no equivale a certificar Safari/iOS, Android físico, carga de producción ni cada combinación posible de datos.

| Recorrido | Resultado observado | Límite relevante |
|---|---|---|
| Navegación principal y accesos de Inicio | Abren las pantallas correspondientes | No se comprobaron todos los enlaces externos |
| Recomendación del Inicio | Abre el detalle del Risotto de Gallo Pinto | Recomendación editorial; no prueba personalización por hábitos |
| Detalle y cantidad de producto | Dos lattes recalculan C$190 y llegan al pedido | No hay selección de modificadores de preparación en ese recorrido |
| Pago con Cuenta de Casa | Descuenta C$190: C$9,900 → C$9,710; vacía el pedido y confirma | Es un cobro registrado. No demuestra recepción en cocina ni seguimiento de preparación |
| Reserva de mesa | Zona, fecha, disponibilidad, revisión y confirmación funcionan | Falta una vista de próximas reservas con gestión y recibo recuperable |
| Reserva de cosecha | Bolsa 001, cobro de C$890 e inventario 150 → 149 | Entrega física no verificada; el aviso transitorio no sustituye una sección de compras |
| Compra de experiencia | Butaca 1, cobro de C$850 y cupos 12 → 11 | Falta entrada recuperable con detalles de asistencia |
| Premio de nueve sellos | Genera un código y conserva el premio pendiente | El cierre por personal se verifica en regresión de API; no se simuló la atención física |
| Café de membresía | El botón marca “Ya lo tomaste hoy” y deja registro | El socio puede consumir el beneficio sin validación del personal: brecha prioritaria |
| Cancelar renovación | Pide confirmación y muestra fin del mes pagado; conserva beneficios | Facturación bancaria externa no existe en este recorrido |
| Recarga y pase | Explican la recarga en mostrador; pase abre y gira correctamente | El acceso de recarga no es un pago en línea |
| Perfil editable nuevo | Guarda bebida en escritorio y móvil; persiste al recargar | Los datos no equivalen a un motor automático de personalización |
| Historial nuevo | Dinero, puntos, sellos y usos; filtros, vacío y segunda página funcionan | Muestra registros existentes; no crea información de entrega que la operación no guarda |
| Compartir Club | Copia un enlace real y confirma el resultado | No concede premios ni atribuye referidos |
| Cerrar sesión y volver a entrar | Cierra y permite entrar con la cuenta de muestra | El registro personal sigue expresamente no disponible |

## Mejoras implementadas en esta auditoría

1. **Edición real del perfil.** Nombre, bebida habitual, alergias y cumpleaños se guardan mediante una ruta autenticada. La identidad proviene de la sesión. No se permite cambiar teléfono, rol o cuenta mediante el formulario. Hay límites de longitud, validación de fecha, mensajes de error y auditoría de la operación sin duplicar los valores personales en el registro.
2. **Historial completo de la actividad registrada.** Se eliminó la limitación práctica de consultar solo ocho movimientos visibles: ahora hay un panel con filtros y páginas de veinte registros. Incluye dinero, puntos, sellos, canjes de tanda y usos de membresía. La paginación conserva microsegundos y desempata por identificador para no perder movimientos simultáneos. Cada usuario recibe solamente su actividad.
3. **Promesas coherentes con lo implementado.** El código de referido inventado se reemplazó por el enlace real del Club. Se retiraron las promesas de bebidas para ambos invitados y de regalo automático de cumpleaños. Se eliminó la promesa de confirmación por WhatsApp en el mensaje de reserva, porque el código no envía esa confirmación.
4. **Claridad de los beneficios.** El historial explica la diferencia entre dinero, puntos de nivel y sellos de tanda. Los beneficios de membresía aparecen como “uso registrado”, sin presentar ese registro como una entrega físicamente verificada.

Se conservaron los componentes, colores, tipografías, navegación y distribución del diseño nuevo. No se cambiaron precios, reglas comerciales ni proveedores. No se agregaron dependencias ni migraciones.

## Brechas que siguen abiertas, por prioridad

**Críticas para operar con clientes reales:**

- Alta e inicio de sesión personal con entrega efectiva del código y recuperación de acceso. El flujo visible sigue siendo una demostración compartida.
- Pedido completo para el restaurante: número y detalle persistente, recepción por barra/cocina, estados, disponibilidad y resolución de incidencias. Descontar el monedero no completa este circuito.
- Validación por personal de café y bolsa de membresía. El clic del cliente actualmente registra el consumo; hace falta separar solicitar/mostrar beneficio de confirmar su entrega.

**Siguiente nivel de autogestión:**

- “Mis reservas” y “Mis compras”, con recibos, número de bolsa/butaca, fecha, estado y opciones permitidas por las reglas del negocio. El nuevo historial financiero ayuda, pero no reemplaza esos objetos operativos.
- Seguimiento de reclamos, acreditación de compras omitidas y corrección de incidencias con trazabilidad.
- Mensajes realmente conectados, con preferencias y confirmación de entrega; automatización comercial de cumpleaños o referidos solo después de definir y respaldar las reglas.

**Para competir con referentes internacionales:**

- Reconocimiento consistente de compras en mostrador y en la app, personalización basada en comportamiento y medición de recompra, canje y margen. Tener más tarjetas o beneficios escritos no demuestra retención ni rentabilidad.

Estas prioridades continúan el diagnóstico de investigación previo. Esta auditoría aporta evidencia del producto actual; no pretende demostrar con pruebas locales que el negocio ya iguala los resultados de los referentes.

## Verificación técnica

- Compilación `npm run build`: correcta, incluyendo TypeScript y Vite.
- Guardián visual: correcto; se conservan los tokens y los iconos permitidos.
- Doce grupos existentes de regresión API: correctos. Cubren permisos, aislamiento, cobros idempotentes, membresías vencidas, premio de noveno sello, reservas y reintentos de compras, entre otros.
- Nueva suite `tests/cuenta-cliente.mjs`: correcta. Verifica persistencia, validación, permisos, auditoría y paginación sin duplicados u omisiones, incluyendo registros separados por microsegundos.
- La suite nueva queda incluida en `npm test`.
- Se verificó el guardado final también desde la interfaz móvil. No hubo desbordamiento horizontal del documento de Perfil en el contenedor móvil inspeccionado.
- La pestaña directa no registró errores de consola durante la inspección. El contenedor móvil registró una excepción de MutationObserver al recargarse; los recorridos posteriores funcionaron y no se reprodujo en la pestaña directa. Su origen no quedó atribuido, por lo que no se afirma una certificación de consola limpia en todos los entornos.
- No se ejecutó la suite que abre otro navegador (`test:ui`): la inspección interactiva de esta auditoría se hizo en el navegador integrado solicitado.

## Entrega

**Publicados con autorización del usuario el 13 de septiembre de 2026.** URL: https://club-lupita.el-molino.workers.dev/perfil . Versión Cloudflare: `b7bc3956-a08e-4f2b-a947-9fbcbc11322f`. Versión anterior: `5ff9cfaa-b1a6-4c2e-8b98-e4c93b84fc5d`.

Antes del despliegue pasaron nuevamente `npm run build` y `npm test`. Después, `/api/health` y `/perfil` respondieron HTTP 200, se comprobó el archivo de la compilación actual y se abrió el historial en el navegador integrado contra la API publicada. Se conserva `DEMO_AISLADA=true`; esta publicación no habilita el registro personal ni resuelve las brechas operativas pendientes. No hubo migraciones ni cambios de secretos.

También queda la vista local `http://127.0.0.1:5212/perfil`, mientras esté encendido el servidor de prueba. Para reiniciarlo: `node tests/preview-auditoria.mjs` desde `club-lupita`, después de compilar. La cuenta y las operaciones de esa vista son efímeras.

Hay un respaldo previo en `../respaldo-auditoria-funcional-20260913/`.

Archivos principales: `src/casa/componentes/CuentaCliente.tsx`, `src/casa/pantallas/Perfil.tsx`, `src/casa/datos.tsx`, `src/casa/componentes/Estados.tsx`, `src/worker/cuenta-cliente.ts`, `src/worker/index.ts` y `tests/cuenta-cliente.mjs`.
