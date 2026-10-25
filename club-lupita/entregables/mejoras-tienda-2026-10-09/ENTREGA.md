# Tienda — ejecución del plan

9 de octubre de 2026.

Se implementó el [plan](PLAN.md) sobre el estado actualizado de la aplicación. Se conservaron las mejoras de Inicio y Carta, incluidas sesiones seguras, títulos por ruta, carga diferida, diseño y operaciones de pedidos. Se respaldaron las fuentes antes de editar. La relación de archivos modificados está en [la evidencia](evidencia/archivos-modificados.json).

La compra ahora exige revisar una cotización persistida con precio, lote y condiciones. Si cambia el precio o el acuerdo, el servidor exige nueva aceptación. El resultado se recupera por referencia aunque el cliente haya agotado saldo o inventario. El comprobante conserva lo aceptado y el historial muestra la preparación, entrega o devolución.

**La información comercial sigue pendiente de confirmación del negocio.** Se dejó un editor para el propietario y la venta permanece pausada mientras falten los datos esenciales. No se inventaron fechas, políticas, presentaciones ni fotografías. Esto afecta el cierre comercial de T03, T09 y T15; sus mecanismos técnicos están implementados. Las compras existentes y su atención siguen disponibles.

## Estado de los 19 hallazgos

| Hallazgo | Cambio ejecutado | Resultado / evidencia |
|---|---|---|
| T01 · Precio consentido | Cotización persistida, caducidad de 10 minutos, revisión de lote/precio/condiciones al cobrar y aceptación explícita. | Prueba de cambio C$890 → C$990 sin débito hasta volver a revisar. |
| T02 · Recuperación bloqueada | Consulta de intentos en servidor y recuperación por referencia, independiente de saldo/stock; cierre serializado contra cobro. | Última bolsa y saldo exacto: respuesta perdida, recarga de página, un solo cargo y comprobante. |
| T03 · Compromiso de preventa | Fechas, lugar, horario y política editables; copia de condiciones en comprobante; bloqueo de oferta incompleta o ventana vencida. | Implementado. Pendiente que el negocio confirme esos valores para habilitar venta. |
| T04 · Respuestas inválidas | Validación de oferta, cotización, recibo y recuperación; número, centavos, identidad y precio consentido. | Un HTTP 200 incompleto conserva el intento, no anuncia éxito y no pinta NaN. |
| T05 · Saldo histórico | El comprobante identifica el saldo posterior a esa compra y actualiza la cuenta por separado. | Recuperación tras recarga conserva el recibo histórico sin afirmar que sea el saldo actual. |
| T06 · Éxito y fallo mezclados | Estados separados; una compra nueva limpia el resultado anterior; errores aparecen en la superficie activa. | Recorridos de rechazo, respuesta perdida, consulta y nuevo intento. |
| T07 · Carga y error incorrectos | Carga/error propios del catálogo de Tienda y botón para reintentar. | Contrato de catálogo inválido muestra el error de Tienda. |
| T08 · Comprobante desconectado | Confirmación enlaza a Mis compras y reservas, donde quedan lote, condiciones, estado y ayuda. | Comprobante visible en historial después de perder la respuesta. |
| T09 · Ficha insuficiente | Editor de presentación, gramos, origen, proceso, perfil, fotografía real y descripción; comprobación de imagen publicada. | Implementado. Pendientes atributos y fotografía reales; no se sustituyen por material ficticio. |
| T10 · Compra muy abajo | Oferta compacta con precio, preventa, disponibilidad y acción principal al inicio. | CTA visible en 320×568 y 390×844; sin desbordamiento en cinco anchos. |
| T11 · Recarga pierde contexto | Instrucciones y actualización de saldo dentro de Tienda. | Se recarga en fixture, actualiza y continúa en `/tienda`. |
| T12 · Bolsa mensual ambigua | Estado vigente/retirada/inactiva y enlace directo a la sección de beneficios con foco. | Probados membresía activa, canje registrado y acceso directo. |
| T13 · Ciclo operativo incompleto | Estados pagada/lista/entregada/reembolsada, avisos en cuenta, permisos, devolución exacta y trazabilidad. | Preparación, entrega y devolución idempotentes; restauración del cargo y puntos; no se revende el número. Históricos solo se enlazan con prueba exacta. |
| T14 · Contacto y agotado | Enlaces reales de WhatsApp con destino anunciado y borrador de cantidad/fecha/zona. Consulta contextual del lote y eliminación de noviembre fijo. | El mensaje se prepara; el usuario decide enviarlo. La casa confirma condiciones del encargo individual. |
| T15 · Lote ambiguo | Registro de configuración por generación, nombre público editable, cupos reales del lote y número+lote en compra/operación. | Dos bolsas número 1 de generaciones distintas conservan comprobantes distintos. Pendiente identidad comercial confirmada de la nueva oferta. |
| T16 · Diálogo y foco | Superficie estable, cierre bloqueado durante solicitud, estado de espera, error enfocable y retorno al iniciador. | Teclado, Escape, solicitud demorada y tres motores de navegador. |
| T17 · Agotado por contención | Selección con espera y límite transaccional, sin omitir filas bloqueadas; revalidación antes del débito. | PostgreSQL real con dos conexiones: rollback libera la última bolsa, commit confirma agotamiento. |
| T18 · Texto y semántica | Frases completas, enlaces externos explícitos, instrucciones útiles y título por ruta preservado. | Revisión visual y navegación por teclado. |
| T19 · Gestión sin evidencia | Eventos agregados de oferta/saldo/revisión/confirmación/error/recuperación/comprobante/contacto; estadísticas operativas y entregas atrasadas. | Panel con estados, importes y tiempo medio hasta entrega. DNT/GPC, categorías cerradas y rechazo de datos personales en eventos. |

## Verificación

- `npm run build`: tipos, guardián de diseño, iconos y compilación correctos. [Registro](evidencia/build.log).
- `npm test`: batería general de regresión correcta, incluidos acceso del equipo, cuenta, saldo cronológico, operación, Inicio, Carta y Tienda. [Registro](evidencia/regresion.log).
- `npm run test:tienda`: nueve grupos de API, nueve recorridos de cliente y tres comprobaciones de operación; finalizados sin errores de página. [Registro final](evidencia/tienda-final.log), [API](evidencia/api.json), [cliente](evidencia/ui.json), [operación](evidencia/operacion-ui.json).
- Edge/Chromium, Firefox y WebKit sobre HTTPS local; cinco tamaños, foco, errores, recarga y respuesta perdida. Axe no detectó infracciones de las reglas WCAG A/AA ejecutadas en las superficies evaluadas. Esto no sustituye una evaluación manual con NVDA o VoiceOver.
- Regresiones visuales/funcionales de Inicio y Carta correctas: [Inicio](evidencia/regresion-inicio-ui.log), [Carta](evidencia/regresion-carta-ui.log). Comprobación final del API de Inicio después de unificar los cupos del lote: [registro](evidencia/inicio-api-final.log).
- Ensayo multiconexión en PostgreSQL: una tabla sintética en un esquema exclusivo de la base de demostración, eliminado al terminar. Comprueba el comportamiento de selección bajo bloqueo; no es una prueba de carga del Worker completo. [Evidencia](evidencia/concurrencia.json).
- Respaldo completo privado de ambas bases, restauración exacta y doble aplicación de la migración. Integridad del libro, clientes, membresías, personal, pedidos, vales y compras previas verificada. [Evidencia sin datos personales](evidencia/respaldos.json).

## Publicación

Publicada al 100% la versión `24031546-ee88-4ad4-b5ee-f4e9de29ff67`. La publicación se controló con manifiesto de archivos y comprobación de la versión remota. Los resultados están en [publicacion.json](publicacion.json) y la comprobación de las rutas y activos publicados en [produccion.json](evidencia/produccion.json). Esta última utilizó únicamente la cuenta pública de demostración y no realizó cobros ni envió mensajes externos.

El [manual de operación](OPERACION.md) explica cómo confirmar la ficha, preparar, entregar, devolver, atender incertidumbres y revisar métricas. El propietario puede abrir el panel en [Personal → Tienda](https://app.labellalupita.com/personal?seccion=tienda).

## Límites y dependencias pendientes

La publicación técnica no confirma atributos de café ni acuerdos comerciales. Para abrir nuevas ventas faltan las condiciones reales solicitadas al negocio. La fotografía y el perfil deberán ser verificados; la estructura los admite sin exigir inventarlos. Los encargos se cotizan individualmente, sin prometer zonas, costos o plazos no confirmados.

Las compras históricas sin vínculo inequívoco al movimiento original requieren conciliación documental antes de devolución automática. No se reconstruyen condiciones históricas por suposición. El inventario conserva su límite estructural de 150 números; esta entrega no fabrica lotes nuevos ni cambia cantidades o precios comerciales.

Las capturas y mediciones locales usan datos sintéticos. No se afirma una tasa de conversión, cumplimiento de tiempos de negocio, Core Web Vitals reales ni conformidad completa de accesibilidad. La base de medición se recogerá con el uso y debe revisarse antes de fijar objetivos.

## Referencias técnicas consultadas

Se contrastaron las decisiones con las [buenas prácticas de Workers](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/), los [comandos oficiales de Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/#deploy), la documentación de [bloqueos de PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html) y la [guía WAI de diálogos](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) usada en la auditoría. Se revisaron el esquema de Wrangler instalado y los tipos de Workers publicados el 9 de octubre de 2026.
