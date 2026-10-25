# Confianza, reglas comerciales y operación de «Conocé tu club»

Fecha de referencia: 8 de octubre de 2026, America/Managua. Revisión estática de la implementación activa en `club-lupita/src` y sus migraciones/pruebas, complementada por una reproducción del precio y los cupos en Worker local con PGlite efímero y datos sintéticos. No se ejecutaron compras, canjes, renovaciones ni consultas autenticadas en producción; no se inspeccionaron credenciales. Los hallazgos prueban código/comportamiento local, no el estado de una base publicada ni el cumplimiento del personal en el local.

## Diagnóstico central

La base transaccional tiene varias defensas acertadas. El principal problema comercial es que el lenguaje y la estructura no dejan conocer con precisión el programa antes de comprometer saldo. El Club gratuito, la Mesa Fundadora de pago, el saldo prepago, los sellos y las experiencias conviven, pero faltan reglas visibles que expliquen sus relaciones. Además hay discrepancias concretas entre la promesa y las ventanas de consumo implementadas.

## Fortalezas que conviene conservar

- **Precio publicado por la misma fuente que cobra.** La cuota es `CUOTA_MENSUAL=95000` centavos (C$950) y se entrega en `/api/catalogo`; Club la utiliza. No corresponde denunciar C$400 como precio actual: aparece en un comentario histórico, no en la oferta renderizada. Evidencia: `src/worker/index.ts:84–89, 431, 801–802`; `src/casa/pantallas/Club.tsx:92, 281, 493`.
- **Confirmación antes de gastar.** `ConfirmarCompra` muestra precio, saldo y remanente, ofrece salida y repite el importe en el botón. Evidencia: `src/casa/componentes/Superficies.tsx:305–370`.
- **Cancelación autónoma y conservación del período pagado.** La pantalla ofrece cancelar renovación; el servidor cambia `autorenueva` sin quitar la fecha pagada. La renovación exige consentimiento registrado y saldo suficiente; no crea deuda cuando falta saldo. Evidencia: `Club.tsx:237–239, 515–525`; `src/worker/index.ts:845–864`; migración vigente `db/018_clientes_equipo.sql:52–65`.
- **Canjear código no consume inmediatamente el beneficio.** Se conserva el premio hasta entrega; caja valida vigencia y evita doble entrega. Evidencia: `src/worker/index.ts:575–611, 629–635`; `src/worker/operacion.ts:90–124`.
- **Reintento de experiencias identificado.** La referencia persiste por socio y experiencia hasta confirmación y viaja al servidor. Evidencia: `src/casa/compras.ts:1–19`; `Club.tsx:141–154`; `src/worker/index.ts:905–946`.
- **Datos desactualizados identificados.** Hay avisos de última consulta y recuperación de cuenta, catálogo y cupos. Evidencia: `src/casa/componentes/EstadoDatos.tsx:8–38`; `src/casa/App.tsx:141`. Esto ayuda a entender fallos, aunque aún no protege contra cambio de precio entre consulta y cobro.
- **Pruebas pertinentes existentes.** Hay casos de renovación con/sin consentimiento, canje renovable, reintento de compra y entrega de beneficios por caja; se leyeron, no se ejecutaron. Referencias: `tests/regresion.mjs:26–38, 57–76`; `tests/operacion.mjs:55–64`; `tests/correcciones-servidor.mjs:174–203`.

## Hallazgos y criterios de aceptación

Prioridades: P1 = corregir antes de promover/ampliar la membresía; P2 = siguiente iteración por fricción o confianza. Se reprodujo un defecto de precio en datos sintéticos; no se identificó aquí un incidente financiero real en producción.

### C1 · P1 · «Café por visita» contradice el límite diario

**Evidencia:** la oferta promete «un café por visita» (`Club.tsx:248–249`), la lista titulada «Un café filtrado por visita» luego dice «Ya lo tomaste hoy» (`334–335`). La API calcula una ventana por fecha de Managua, comprueba un uso y rechaza otro (`src/worker/operacion.ts:99–101, 117–120`); la base aplica unicidad (`db/003_correcciones.sql:51–61`).

**Impacto:** una segunda visita el mismo día cumple la lectura natural de la oferta, pero el código rechaza su beneficio. No es un problema meramente cosmético: altera lo adquirido.

**Recomendación:** validar con negocio cuál es la regla correcta. Si se conserva el backend, escribir «Un café filtrado al día, durante tu visita» antes de pagar. Precisar tamaño, variantes, extras y para llevar si existen restricciones; no inventarlas.

**Aceptación:** una persona puede distinguir visita de día sin abrir la confirmación; oferta, lista, ayuda y caja usan la misma regla; prueba a las 23:59/00:00 de Managua y dos visitas el mismo día produce el resultado acordado.

### C2 · P1 · La cuota de 30 días y la bolsa por mes calendario son relojes distintos

**Evidencia:** alta/renovación dura 30 días (`src/worker/index.ts:820–821`; `db/018_clientes_equipo.sql:62`), mientras la bolsa usa el primer día del mes calendario de Managua (`src/worker/operacion.ts:99, 117`; `src/worker/index.ts:483–485`). La oferta dice «una bolsa del lote cada mes» y el beneficio «Tu bolsa del mes» (`Club.tsx:248, 314–316`).

**Impacto:** un alta cerca de fin de mes puede disponer de dos ventanas de bolsa en un solo período pagado; otra iniciada al principio puede disponer de una. Es una consecuencia del modelo actual, no un fraude del usuario. Tampoco se explica si una bolsa no retirada se acumula, ni se especifica si «de 7 a 9» son horas o fechas (`316`).

**Recomendación:** elegir conscientemente mes calendario o ciclo de membresía y publicar ejemplos/fechas. Mostrar «Disponible hasta [fecha]», próxima disponibilidad y horario inequívoco. Revisar el costo de la regla antes de alterarla.

**Aceptación:** alta el 30/31 y renovaciones alrededor de febrero tienen beneficios previsibles; la pantalla muestra exactamente la ventana que acepta caja; no se prometen acumulaciones no implementadas.

### C3 · P1 · Precio confirmado y precio cobrado pueden divergir si cambia el catálogo

**Evidencia:** la confirmación muestra `e.precio` en memoria (`Club.tsx:499–511`); el POST únicamente envía `{ref}` (`src/casa/datos.tsx:249–253`). El servidor vuelve a leer el precio de la experiencia y lo cobra (`src/worker/index.ts:913–920, 931, 940–946`), sin comparar precio o versión aceptados. La membresía también envía `{}` y cobra la constante de la versión vigente (`datos.tsx:255–260`; `index.ts:801–814`).

**Reproducción local confirmada:** el catálogo del fixture devolvió 85000 centavos (C$850); se modificó únicamente la fila efímera a 90000; se envió el mismo cuerpo `{ref}` que usa el cliente. HTTP 200 cobró 90000 centavos (C$900): C$50 por encima del precio consultado. Se comprobó también la reducción exacta del saldo sintético. Una segunda modificación a C$950 y el reintento con la misma referencia devolvieron cargo C$900, misma butaca y mismo saldo, confirmando que la idempotencia sí funciona.

**Artefactos:** `research_conoce_tu_club/repro_precio_club.mjs` y `repro_precio_club_resultado.json`. Se usó `tests/soporte-cliente-perfiles.mjs`, que compila el Worker actual con transporte de base local, y se bloqueó `fetch` externo durante las solicitudes. No se cambiaron precios reales ni archivos de la app.

**Recomendación:** el servidor sigue determinando el precio, pero exige una versión de oferta o presupuesto breve y compara con lo aceptado. Si cambió, devuelve «El precio se actualizó» y exige nueva confirmación; refrescar al abrir el diálogo ayuda, pero no resuelve por sí solo la carrera.

**Aceptación:** prueba aislada de cambio de precio entre vista y confirmación no genera cargo; un reintento de una compra ya confirmada devuelve su resultado original incluso si el catálogo cambió después.

### C4 · P1 · Beneficios comerciales manuales sin recorrido comprobable

**Evidencia:** se promete 15% en toda repostería, prioridad de VIP y acceso a experiencias 48 h antes (`Club.tsx:38–41`). La pantalla dice que los tres los aplica quien atiende (`354–356`). El catálogo público entrega todas las experiencias futuras, sin ventanas de lanzamiento (`src/worker/index.ts:399–405`), y la compra no consulta nivel de membresía (`905–946`). La reserva de VIP compara disponibilidad/saldo, sin prioridad por membresía (`1018–1081`).

**Conclusión acotada:** no hay automatización de la ventaja de 48 h o prioridad en estos flujos. Podrían existir procedimientos manuales válidos, pero el código no permite verificarlos. No cabe afirmar que el local incumple el descuento.

**Recomendación:** escoger entre implementar ventanas/cuotas o explicar con exactitud el canal manual y sus límites. Documentar responsable, elegibilidad, cómo solicitarlo, momento de aplicación, exclusiones y solución si el beneficio no se cumple. Para 48 h, publicar fecha de apertura para cada público, si esa es la política real.

**Aceptación:** el mismo caso de socio/no socio tiene resultados coherentes en app y caja; el equipo puede consultar y ejecutar la ventaja; la oferta nunca promete prioridad que el inventario abierto ya hace imposible.

### C5 · P2 · La persona compra antes de ver el detalle completo de beneficios

**Evidencia:** los cinco beneficios y la bolsa de 250 g se renderizan solo dentro de `{socio && (...)}` (`Club.tsx:306–359`). La oferta al no miembro únicamente anticipa bolsa, café y trato preferente (`243–250`).

**Impacto:** se exige evaluar C$950 por cada 30 días con información incompleta; tampoco se muestra una comparación limpia entre Club gratuito y Mesa Fundadora.

**Recomendación:** hacer visible la misma ficha de beneficios antes/después de alta, variando solo estado y acciones. Comparar «Club Lupita: gratis» con «Mesa Fundadora: C$950 cada 30 días», conservando la cuota dinámica. Evitar estimaciones de ahorro hasta conocer precios elegibles, frecuencia y costos reales.

**Aceptación:** sin membresía se conocen cantidad/tipo, límites, medio de pago, recurrencia, cancelación y condiciones manuales antes de tocar comprar.

### C6 · P2 · Saldo insuficiente deja sin siguiente paso

**Evidencia:** comprar plaza/experiencia se deshabilita y solo informa cuánto falta (`Club.tsx:278, 283–286, 420–428`). La explicación de recarga existe lejos, en Perfil: «En caja, con efectivo o con tarjeta» (`src/casa/pantallas/Perfil.tsx:189–195`).

**Recomendación:** junto al importe faltante, mostrar la vía real: «Recargá en caja, con efectivo o tarjeta» y un enlace «Cómo recargar / Ver mi cuenta». No simular una recarga online que la operación no ofrece.

**Aceptación:** desde el bloqueo el usuario encuentra cómo resolverlo en un paso y conserva el contexto de la oferta; la app nunca afirma que cargó una tarjeta cuando solo registró saldo.

### C7 · P2 · El código de premio vence en 90 segundos sin estado de vencimiento visible

**Evidencia:** API devuelve `vence:90` y guarda 90 segundos (`src/worker/index.ts:600–611`); Club guarda solo `codigo` y espera un refresco antes de abrir (`Club.tsx:97–106`). La hoja advierte genéricamente que se puede generar otro, pero no muestra tiempo/estado ni acción dentro de la hoja (`474–477`). El otro beneficio dura diez minutos (`db/012_operacion.sql:58`); su respuesta incluye `vence`, pero la UI muestra siempre «Vence en diez minutos», incluso al recuperar un código existente con menos tiempo (`operacion.ts:103–104`; `Club.tsx:479–482`).

**Recomendación:** mostrar expiración real proporcionada por servidor, estado vencido y regenerar dentro de la misma hoja; mantener visible que el premio no se pierde. Evitar anuncios por lector de pantalla cada segundo.

**Aceptación:** código recuperado con 30 segundos no dice diez minutos; cola lenta, reloj cliente desviado y regeneración conservan el premio; entrega repetida no consume dos veces.

### C8 · P2 · Lista de espera y cesión prometidas con canal incompleto

**Evidencia:** Mesa agotada indica dejar número en barra (`Club.tsx:266–269`); experiencia agotada afirma que escribirán en orden, sin acción para solicitar aviso (`409–413`). Confirmación permite ceder «decinos a quién» (`505`). Existe `cedido_a` y la operación interna puede leerlo, pero no se encontró ruta de escritura de cesión ni formulario de espera en `src/worker`/`src/casa`. `MisCompras` muestra la entrada del comprador y estado cedida (`src/casa/pantallas/MisCompras.tsx:33`; `src/worker/operacion.ts:40`).

**Recomendación:** indicar un canal concreto ya atendido y crear seguimiento/acuse si se ofrece notificación. Si la cesión seguirá siendo manual, explicar datos necesarios y a quién dirigirse. No asumir que una persona ya está en lista por mirar una experiencia agotada.

**Aceptación:** solicitar aviso termina con confirmación explícita; una cesión autorizada aparece para la persona receptora y el personal no admite la entrada dos veces. Si solo existe atención en barra, el texto lo dice claramente.

### C9 · P2 · Reglas de sellos y premio quedan demasiado implícitas

**Evidencia:** «Cada visita cuenta» y nueve sellos aparecen en `Club.tsx:175, 186–190`; el reverso del pase pide mostrar identificación, pero no explica elegibilidad (`PaseSocio.tsx:18–20`). Sellar requiere ticket y acción de caja; la base asegura una referencia única (`src/worker/index.ts:516–548`; `db/001_schema.sql:66–67`).

**Recomendación:** responder cerca de la tanda: qué da un sello, si se requiere compra, qué consumo cuenta, qué bebida incluye el premio, si tiene vencimiento y qué hacer si falta un sello. Estas reglas necesitan decisión comercial: el ticket idempotente evita duplicar la operación, pero no define por sí mismo una visita elegible.

**Aceptación:** cliente y cajero resuelven igual los casos de dos tickets el mismo día, visita sin compra y compra grupal; los premios pendientes y la tanda siguiente se distinguen al completar nueve.

### C10 · P2 · Condiciones de renovación y salida son visibles, pero dispersas

**Evidencia:** antes de confirmar se presenta `/mes` (`Club.tsx:281`); el ciclo exacto y autorrenovación aparecen dentro de confirmación (`492`). No se observa enlace a condiciones guardables ni versión de reglas asociada al alta; se registra fecha de consentimiento (`src/worker/index.ts:820–827, 860–861`). Estado `en_gracia` dice «unos días más» sin fecha (`Club.tsx:220–225`), mientras mantenimiento actual vence sin saldo al finalizar (`db/018_clientes_equipo.sql:59–62`).

**Recomendación:** una ficha breve junto al CTA con importe/ciclo, medio de cobro, próxima fecha, qué sucede si falta saldo y cómo cancelar; confirmación/recibo consultables con la versión aceptada. Validar si aún existe período de gracia real antes de mantener ese mensaje.

**Aceptación:** la fecha se expresa en Managua; se distingue cancelar renovación de devolver el período pagado; el recibo permite reconstruir qué se aceptó. No se exige un checkbox como solución automática: claridad, intención y registro deben probarse con el flujo.

### C11 · P2 · Cupos públicos conservan experiencias pasadas

**Evidencia y reproducción:** `/api/catalogo` filtra por `e.cuando > now()` (`src/worker/index.ts:399–405`), pero `/api/cupos` agrupa todas las experiencias sin ese filtro (`367–379`). En PGlite se insertó una experiencia sintética de ayer: quedó fuera del catálogo y dentro de `cupos.experiencias`. Resultado registrado en el mismo JSON de reproducción.

**Impacto acotado:** Club lista `catalogo.experiencias`, así que esta diferencia no significa que allí se estén vendiendo eventos pasados. Sí deja un contrato inconsistente para otras superficies que consumen `cupos` —incluido `mesaTostador`— y futuros usos del endpoint.

**Recomendación/aceptación:** definir si cupos representa oferta vigente o historial; si es vigente, aplicar la misma ventana al catálogo y cupos, y verificar que una experiencia pasada desaparece de ambos y de toda promoción pública.

## Investigación primaria y aplicación

1. **OCDE, modelos de suscripción.** Su análisis de comercio electrónico recomienda hacer comprensibles cargos recurrentes, condiciones de pago y formas de salir. Se usa aquí como referencia de diseño, no como ley aplicable a Nicaragua. Aplicación: misma información antes de alta, en confirmación y en gestión; no esconderla en un bloque tardío. [Evolving E-Commerce Business Models](https://www.oecd.org/en/publications/unpacking-e-commerce_23561431-en/full-report/component-7.html).
2. **OCDE, patrones comerciales.** Identifica falsa urgencia y obstáculos de cancelación como prácticas problemáticas. La app tiene cupos derivados del servidor y una cancelación directa, fortalezas que deben mantenerse. Esto no demuestra que toda escasez sea falsa ni acusa a esta app de manipulación. [Dark commercial patterns](https://www.oecd.org/en/topics/dark-commercial-patterns.html).
3. **W3C Privacy Principles, declaración del 15 de mayo de 2025.** Promueve minimización, finalidad explícita y explicación accesible del tratamiento de datos. Aplicación: medir comprensión y errores con pocos eventos y campos; no exportar contenido de perfiles para saber si el recorrido funciona. Son principios de arquitectura, no dictamen legal. [Privacy Principles](https://www.w3.org/TR/privacy-principles/).
4. **Google Analytics, documentación del proveedor.** Advierte sobre identificación personal en URL, títulos, formularios y campos de evento. Si se eligiera esa herramienta, sería una restricción concreta del producto, no una recomendación de instalarlo. [Evitar información identificable en Analytics](https://support.google.com/analytics/answer/6366371?hl=en).

## Medición propuesta, sin recolectar de más

No se encontró instrumentación explícita de producto para este recorrido en `src/casa`, `index.html` o dependencias revisadas; podría existir medición externa al repositorio. No debe confundirse la auditoría transaccional del backend con un embudo de comprensión.

Propuesta de diseño propia:

| Evento mínimo | Pregunta que responde | Campos permitidos inicialmente |
|---|---|---|
| `club_abierto` | ¿Se llega desde la invitación? | origen enumerado, visitante/socio/miembro, tamaño de pantalla por grupo |
| `reglas_abiertas` | ¿Se buscan condiciones? | bloque: sellos/membresía/experiencia |
| `compra_revisada` | ¿Se entiende la oferta? | tipo de producto, saldo suficiente sí/no |
| `compra_resultado` | ¿Dónde falla la compra? | éxito/fallo/incierto, código de error enumerado |
| `codigo_solicitado` | ¿El canje progresa? | premio/beneficio, éxito/fallo |
| `entrega_confirmada` | ¿El beneficio llegó a la persona? | clase de entrega, agregado diario desde servidor |
| `renovacion_cambiada` | ¿El control funciona? | activar/cancelar, éxito/fallo |

Excluir teléfono, nombre, correo, código de canje, saldo exacto, alergias, cumpleaños, notas libres, URL completa y grabaciones de sesión. Preferir conteos agregados; cualquier enlace entre dispositivos o identidades requiere una necesidad explícita. Definir finalidad, responsable, acceso y retención breve revisable antes de implementarlo; no presentar un plazo inventado como obligación legal.

Indicadores útiles: comprensión de gratis/pago/ciclo en pruebas con personas, finalización por etapa, incidencia de precio actualizado, compras inciertas reconciliadas, tiempo hasta entrega y proporción de códigos vencidos, solicitudes de soporte por reglas y cancelaciones exitosas. Segmentar por estado de usuario y fallos técnicos; no concluir causalidad de una mejora solo porque cambió la conversión.

## Validación recomendada

- Decisiones de negocio primero: sello por qué acción; café por día o visita; bolsa por mes o ciclo; bebida elegible; horario; gracia; prioridad y acceso anticipado; cesiones, espera y devoluciones.
- Pruebas aisladas con reloj controlado: cambio de precio; 23:59/00:00 Managua; fin de mes; saldo insuficiente; renovación cancelada; expiración de código; doble entrega; reintento tras respuesta perdida. No hace falta realizar compras reales.
- Cinco tareas de comprensión con personas nuevas y recurrentes: explicar qué es gratis, qué recibirían por C$950, cómo recuperar un sello, cómo obtener una cortesía y cómo dejar de renovar. Las mejoras de conversión siguen siendo hipótesis hasta medirlas.
