# Revisión independiente de uso

Fecha: 21 de octubre de 2026. Árbitro: `critico_integral_uso`. Revisión integral: `principal-4KPpZegJ.js`. Revalidación focal final del Kit: `principal-Ctm5IHgB.js` / `principal-BzyWdM0B.css`; ver adenda U-03 al final.

## Veredicto

| Conjunto | Veredicto de uso observado | Fundamento |
|---|---|---|
| Sistema, acceso y Kit | **PASS final** | Revisión integral pasada y U-03 del aviso de Kit corregido y revalidado en Ctm5IHgB a 320 × 700 y 320 × 568, normal y texto al 200%. |
| Comercio y reservas | **PASS** | Pedido con cotización y restricción, pago con respuesta perdida y recuperación; compra de bolsa con consentimiento/comprobante; reserva, modificación y cancelación. Obstrucción de foco en Reservar corregida y revalidada. |
| Cuenta y Club | **PASS** | Perfil validado y persistente, borrador recuperable, pase, beneficio con vigencia y entrega, entrada pagada/asistida, comprobantes, ayuda respondida y cierre de todos los dispositivos. |
| Equipo | **PASS** | Los doce módulos cargan; cuatro roles y restricciones por URL; recorrido real de pedido, recarga, beneficio, bolsa, asistencia, atención, directorio, exportación y bloqueo. |

No quedan defectos importantes reproducidos por este árbitro sin corregir. Los PASS corresponden a las superficies y recorridos descritos: **no equivalen a haber ejecutado todas las combinaciones de estados del inventario**, ni autorizan producción o sustituyen aprobación visual.

## Método y aislamiento

Inspección del resultado renderizado con Playwright y Microsoft Edge, interacciones por nombres accesibles, teclado, capturas y DOM de la página. No se leyó TSX/CSS de implementación. Se consultaron el objetivo, el inventario y pruebas/helpers para conocer las entradas del entorno. No se modificó producto.

Todas las acciones de esta revisión se realizaron en `http://127.0.0.1:5198`, con cuentas sintéticas, Worker/PGlite en memoria y bloqueo adicional de red externa en navegador. El baseline `5197` no fue modificado. La configuración del lote se completó mediante la UI del propietario con textos explícitos de prueba, para poder recorrer su compra. No se enviaron mensajes al negocio ni servicios externos.

Se visitaron las diez rutas de cliente/herramientas (`/`, `/pedir`, `/tienda`, `/club`, `/conoce-tu-club`, `/perfil`, `/compras`, `/reservas`, `/reservar`, `/kit`), `/personal`, acceso y una ruta desconocida. En personal se recorrieron Resumen, Pedidos, Caja, Club, Tienda, Entregas, Agenda, Atención, Informes, Clientes, Equipo y Seguridad.

## Hallazgos, corrección y revalidación

### U-01 — P2: la barra de Reservar tapaba la opción enfocada

- **Dónde:** `/reservar`, primer paso, 390 × 844.
- **Reproducción:** desde la zona Ventanal, avanzar con Tab a Barra; repetir con Bistró y Salón VIP.
- **Qué fallaba:** el navegador situaba la tarjeta enfocada entre `y=701.48` y `y=796.47`, mientras el cierre fijo empezaba aproximadamente en `y=742`. La parte inferior de la opción, incluida la condición del anticipo, quedaba tapada.
- **Impacto:** quien usa teclado pierde parte de la información del elemento que está seleccionando.
- **Corrección solicitada:** reservar espacio de desplazamiento para el cierre fijo y mantener completo el control enfocado sobre él.
- **Resultado:** corregido por implementación y revalidado independientemente en `principal-4KPpZegJ.js`. Tras estabilizar el ajuste, la tarjeta queda entre `y=631.48` y `y=726.47`; su centro pertenece a la tarjeta y ya no a la barra fija.
- **Evidencia:** [antes](evidencia/critico-uso/hallazgo-reserva-foco-barra.png), [después](evidencia/critico-uso/reserva-foco-corregido.png), [recorrido Tab](evidencia/critico-uso/foco-cliente.json), [revalidación](evidencia/critico-uso/acciones.json).

### U-02 — P3: el aviso local tapaba el salto al contenido

- **Dónde:** rutas cliente, enlace «Ir al contenido» al recibir foco.
- **Reproducción:** cargar una ruta y avanzar por Tab hasta ese enlace.
- **Qué fallaba:** el aviso del entorno de prueba quedaba por encima del enlace. Es un problema de presentación de la preview.
- **Resultado:** corregido; el enlace se ve sobre el aviso y Enter mueve el foco al elemento `main`.
- **Evidencia:** [salto corregido](evidencia/critico-uso/skiplink-corregido.png) y [acciones](evidencia/critico-uso/acciones.json).

Una comprobación automática inicial del editor de Perfil marcó como escape de foco el paso a la interfaz del navegador. Se repitió observando `document.hasFocus()`: en ese paso es `false`, y el siguiente Tab vuelve al diálogo. No se enfocó ningún control de la página de fondo. Se conserva el registro original con esta interpretación; no es un defecto de la aplicación.

## Recorridos ejecutados directamente

| Área | Evidencia de comportamiento observada |
|---|---|
| Sistema/acceso | Selector; tres rutas públicas sin cuenta; Perfil protegido; registro por correo deshabilitado con explicación; caída de capacidades y «Volver a comprobar»; desconocida → Inicio; salto al contenido. |
| Kit | Panel explicativo desde botón; Escape y retorno de foco; selección de chip; controles de sellos; ausencia de desborde con texto al 200%. |
| Carta | Búsqueda sin resultados y búsqueda Latte; detalle; agregar unidad; total C$135 con empaque; restricción deshabilita revisión hasta confirmarla; cotización explícita. Atrás cierra el detalle y conserva la búsqueda. |
| Pedido incierto | El Worker cobró la cuenta sintética y se abortó solamente la respuesta. La UI mantuvo referencia y consulta; recargar y consultar llevó a un único pedido visible en Compras. La comprobación directa es de UI/comprobante, no una auditoría independiente de asientos SQL. |
| Tienda | Lote incompleto bloquea compra; propietario completa ficha sintética; Enter abre, Escape retorna foco; consentimiento; pago C$890; saldo C$9,010 y comprobante; catálogo caído muestra error y reintento recupera oferta. |
| Reservas | Terraza, dos personas, tres pasos y fecha futura; comprobante; intento de cancelar y Escape conserva visita; cambio de fecha/hora con nueva revisión; cancelación explícita visible en Reservas y Compras. |
| Perfil | Nombre de un carácter produce error; preferencias se conservan como borrador al cerrar y reabrir; guardar y recargar conserva la bebida; copiar enlace confirma éxito; solicitud de ayuda aparece pendiente y luego respondida; cierre de todos los dispositivos devuelve al acceso. |
| Club | Pase y reverso; beneficio con código y cuenta regresiva; `?beneficio=bolsa` enfoca `club-beneficios`; experiencia con consentimiento, pago y confirmación; entrada registrada, diálogo de cesión inspeccionado sin transferir; asistencia posterior visible. |
| Pedido por roles | Cocina ve recibido sin precios/contacto y espera a caja; propietario acepta; cocina debe reconocer restricción; preparar → listo; caja confirma entrega; cliente ve entregado. |
| Caja | Consultar cliente por teléfono sintético; revisión y confirmación de recarga C$200; consulta de beneficio identifica titular y vigencia; entrega registrada. Se abrieron también Premio por sellos y Descuento para inspeccionar sus formularios. |
| Tienda/Entregas | Intentar entregar bolsa pagada sin preparar genera error explícito que dirige a Tienda; marcar lista exige confirmación; entregar posteriormente sale de pendientes y aparece como entregada al cliente. Asistencia exige confirmación y aparece en Compras. |
| Agenda | Consulta por fecha muestra la reserva creada por cliente, personas, hora, mesas, revisión y acciones. La modificación y cancelación se ejecutaron desde cliente. |
| Atención | Solicitud sintética desde Perfil → encargado lee, responde y resuelve → cliente ve respuesta. |
| Clientes | Buscar «Vista», abrir ficha e historial, verificar acciones recientes; volver al directorio conserva búsqueda. |
| Informes | Descarga CSV real del entorno de prueba, guardada en la evidencia. |
| Equipo/seguridad | Encargado no tiene acción Invitar; propietario abre formulario de invitación y valida requerido; cuatro menús correctos. Caja por URL directa a Clientes vuelve a Caja; Cocina a Club vuelve a Pedidos. Bloqueo oculta operación; contraseña/MFA incorrectos producen error y mantienen bloqueo; cierre desde bloqueo vuelve a ingreso. |

Los cuatro menús se registran en [roles.json](evidencia/critico-uso/roles.json). El detalle de acciones está en [acciones.json](evidencia/critico-uso/acciones.json), y el resultado final transversal en [Compras](evidencia/critico-uso/compras-estados-finales.png).

## Teclado, ampliación y tamaños

Se recorrieron controles mediante Tab en ocho rutas de cliente, además de diálogos por Enter/Escape, devolución de foco y navegación Atrás. Se revisó el editor de Perfil con texto al 200%, incluyendo el recorrido de sus campos y regreso al control que lo abrió.

El script independiente [revision-reflujo.mjs](evidencia/critico-uso/revision-reflujo.mjs) produjo **45 comprobaciones**, con **0 desbordamientos de página, 0 errores de JavaScript y 0 peticiones externas** en ese barrido. Incluye las diez rutas más desconocida a 320 × 568, 390 × 844 con texto al 200%, y 720 × 450; los doce módulos de propietario a 390 px con texto al 200%. [Resultados completos](evidencia/critico-uso/reflujo.json).

720 × 450 comprueba el reflujo equivalente al espacio CSS disponible al ampliar una ventana 1440 × 900 al 200%. No se manipuló el control de zoom nativo de Edge; no se presenta esta equivalencia como una comprobación de ese control. No se ejecutó aquí navegación con lector de pantalla ni dispositivos físicos.

## Evidencia complementaria inspeccionada

Estas comprobaciones fueron ejecutadas por otros agentes. Se revisaron sus resultados y las capturas indicadas; no se contabilizan como recorridos ejecutados por este árbitro.

- [Seguridad, siete recorridos](evidencia/seguridad/resultados.json), con compilación `principal-4KPpZegJ.js`: invitación, rol, activación, MFA, códigos, bloqueo, recuperación y reingreso. Se inspeccionó [la pantalla de segundo factor](evidencia/seguridad/verificar-mfa.png), que presenta código, acción principal y cambio de persona legibles.
- [Descuento de Caja](evidencia/caja-descuento/caja-ui.json): recuperación tras respuesta perdida, registro único y anulación con motivo. Se inspeccionó [el resultado anulado y su historial](evidencia/caja-descuento/caja-descuento.png).
- [Tienda](evidencia/tienda-ui/ui.json): cambio de precio, diálogo bloqueado al cobrar, recuperación, contrato incompleto, recarga, error de catálogo y otros motores. Los recorridos base fueron contrastados con la operación propia descrita arriba.
- [Variantes de cuenta](evidencia/cuenta/variantes/resultados.json): gracia/renovación, reposición, caducidad, espera, experiencia no abierta/agotada, cesión y actividad paginada. El archivo distingue expresamente las respuestas interceptadas de las operaciones Worker/PGlite.

## Límites y pendientes de cobertura independiente

No se declara PASS independiente para: alta completa por correo/OTP; activación por invitación y MFA correcto; recuperación válida de personal; descuento/anulación completo; canje de premio por sellos; devolución monetaria de bolsa/pedido; reserva VIP con anticipo/reembolso; creación manual y configuración de agenda; publicación/cancelación de experiencia; experiencia con saldo insuficiente o resultado incierto; entrada recibida por otro cliente, cancelada o error de cesión. Algunos tienen evidencia complementaria de otras suites, como se indica arriba.

En este Edge la acción ofrecida fue «Copiar enlace del Club» y funcionó. Un stub de `navigator.share` no hizo que se ofreciera compartir nativo; esa variante no fue ejercitada. Tampoco se comprobó aquí la atribución analítica del enlace de beneficio, aunque sí su destino y foco. No se produjo una comparación funcional independiente antes/después contra `5197`; el baseline quedó intacto.

La presencia simultánea del aviso sintético y la etiqueta «Operación real / Datos reales del negocio» del shell de personal corresponde a ejecutar el modo normal contra la fixture. El aviso superior identifica el aislamiento; esta revisión no infiere de esa etiqueta que se hayan realizado operaciones reales.

## Estado del entorno al terminar

Se detuvieron las mutaciones de la revisión antes del cierre. Datos sintéticos resultantes: pedido 1 entregado; bolsa 1 entregada; butaca 1 de la experiencia con asistencia; reserva `67c502a6` cancelada después de moverla al 24 de octubre a las 12:00; solicitud `93a48aea` resuelta; preferencia «Latte de prueba»; saldo C$8,225. No se modificó producción.

## Adenda focal — Kit en DRrjk9bX

Revalidación solicitada después del cierre integral, únicamente `/kit`, en `http://127.0.0.1:5203`, sin operaciones de negocio. Ambos navegadores de esta revalidación quedaron cerrados.

Se comprobó a 320 × 700, normal y con `html` al 200%: enfocar «Pedir», Enter, estado `disabled=true` y `aria-busy=true`, aviso, diez pulsaciones Tab hasta «Cerrar», Enter y desaparición del aviso. «Cerrar» tiene 44 px de altura, foco visible y centro libre de obstrucción en ambas variantes. El nombre de la bebida refluye correctamente a 320 px normal. [Registro del recorrido](evidencia/critico-uso/kit-final-DRrjk9bX.json), [bebida y botón](evidencia/critico-uso/kit-final-pedir-320.png).

### U-03 — P2 corregido: mensaje flotante recortado al 200%

- **Reproducción:** viewport 320 × 700, `/kit`, ampliar el texto de `html` al 200%, enfocar «Pedir» y pulsar Enter; esperar el aviso de ejemplo.
- **Fallo:** la caja del aviso empieza en `y=-119.875`, tiene 627.875 px de altura y termina en `y=508`. Su inicio queda fuera de la pantalla. Además, su ancho interior es 256 px pero el contenido ocupa 301 px: la palabra «confirmación» queda cortada a la derecha. El ancho de la página sigue en 320 px, por lo que el barrido general de desborde no detecta este recorte local.
- **Impacto:** el aviso puede cerrarse, pero una persona con texto ampliado no puede leer el mensaje completo.
- **Corrección solicitada:** permitir que el texto aproveche el ancho y corte palabras largas cuando sea necesario; adaptar la posición y altura del aviso al espacio disponible, con desplazamiento interno si corresponde.
- **Estado de la primera revalidación:** FAIL del conjunto Sistema/Kit en DRrjk9bX. Los otros tres conjuntos conservaron el resultado de la revisión integral, pues esta solicitud sólo cambió Kit.
- **Evidencia:** [recorte](evidencia/critico-uso/kit-final-aviso200-recorte.png), [medidas](evidencia/critico-uso/kit-final-aviso200-medida.json).

### Revalidación final de U-03 — PASS

Compilación verificada por recursos del navegador: `principal-Ctm5IHgB.js`, CSS `principal-BzyWdM0B.css`, en `5203`. Se repitieron cuatro variantes: 320 × 700 y 320 × 568, cada una normal y con texto al 200%.

En las cuatro, Enter sobre «Pedir» muestra estado ocupado (`disabled=true`, `aria-busy=true`); el aviso queda completo dentro del viewport; su ancho interior y contenido coinciden en 288 px. Con texto al 200%, el aviso mide 395.125 px de alto y empieza en y=288.875 para altura 700, o y=156.875 para altura 568. Se inspeccionó la captura más estrecha/corta: el mensaje completo y la palabra «confirmación» son legibles, sin recortes. Diez pulsaciones Tab alcanzan «Cerrar», que conserva altura 44 px, foco visible y centro sin obstrucción; Enter lo cierra en las cuatro variantes. La página conserva ancho 320 px.

[Resultado completo](evidencia/critico-uso/kit-U03-revalidado-Ctm5IHgB.json), [320 × 568 con texto al 200%](evidencia/critico-uso/kit-U03-corregido-568-texto200.png). **U-03 cerrado; Sistema/Kit vuelve a PASS.** Navegador cerrado al terminar, sin operaciones de negocio.
