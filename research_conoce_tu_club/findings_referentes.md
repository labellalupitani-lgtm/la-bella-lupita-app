# Referentes de fidelización y diagnóstico de producto — Conocé tu club

Fecha de referencia: 8 de octubre de 2026, America/Managua. Investigación ejecutada con cuatro consultas de búsqueda, seguida de apertura de fuentes oficiales. Se leyó `club-lupita/src/casa/pantallas/Club.tsx`; no se modificó la aplicación ni se realizaron altas, canjes, pagos o acciones en producción.

## Conclusión

El Club Lupita tiene una base comprensible —nueve sellos y una bebida— y una identidad propia que conviene preservar. El problema de producto más claro es la distancia entre la invitación a conocer el programa y la información necesaria para usarlo o comprar la Mesa Fundadora. La pantalla concentra progreso, premios, suscripción, experiencias y reservas, pero no explica completamente cómo se gana un sello ni muestra al no suscriptor todos los beneficios que está evaluando. La mejora prioritaria es hacer explícito el contrato de cada propuesta: qué incluye, cómo se obtiene, cómo se utiliza y qué límites tiene.

Los referentes sustentan patrones de comunicación. No demuestran aumentos de conversión, retención o rentabilidad para La Bella Lupita. No se proponen cambios a precios, límites, vencimientos ni reglas comerciales sin validación de operación y negocio.

## Evidencia externa y aplicación

| Referente primario | Evidencia observada | Patrón aplicable a Lupita | Diferencia que impide copiar reglas |
|---|---|---|---|
| [Costa Club, presentación oficial](https://www.costa.co.uk/costa-club) | Explica el recorrido de alta, acumulación y uso; presenta el umbral de diez compras y el beneficio. Incluye preguntas frecuentes junto al relato comercial. | Una secuencia corta y visible: identificarse, acumular, mostrar premio; ayuda situada junto al contador. | Es un programa británico, con tiendas y máquinas, compras elegibles y canales propios. Diez compras no justifican cambiar los nueve sellos de Lupita. |
| [Costa Club, términos](https://www.costa.co.uk/costa-club/terms-of-use) | Distingue cómo se gana un sello, compras excluidas, lugares donde puede canjearse y vigencia de recompensas. | Separar regla principal de detalles desplegables; responder si cuenta una visita, una bebida o una compra y cuándo aparece el sello. | Sus vencimientos y exclusiones son decisiones del programa, no estándares de UX ni reglas apropiadas por defecto para Nicaragua. |
| [Starbucks Rewards, términos oficiales de EE. UU., vigentes desde 10/03/2026](https://www.starbucks.com/terms/rewards/) | La membresía no tiene cuota; al abrir la cuenta se provisiona una tarjeta digital con saldo cero. Acumular premios, mantener saldo y alcanzar niveles son conceptos diferenciados. | Diferenciar Club gratuito, Cuenta de Casa y Mesa Fundadora; evitar que recargar se perciba como requisito para pertenecer al Club. | Programa multinacional basado en gasto, múltiples niveles y medios de pago. No es evidencia a favor de agregar niveles o complejidad a Lupita. |
| [Panera Sip Club, términos vigentes desde 19/08/2026](https://www.panerabread.com/en-us/mypanera/subscription/terms-and-conditions.html) | MyPanera es gratuito y Sip Club es una suscripción adicional. Precisa bebidas elegibles, límites, renovación y cancelación; cancelar conserva beneficios hasta terminar el ciclo pagado. | Etiquetar la Mesa como suscripción opcional, con alcance, recurrencia y salida comprensibles antes de pagar. | Cobra por medios guardados y opera en EE. UU.; Lupita usa Cuenta de Casa. No trasladar sus requisitos de pago, plazos o política de reembolso. |
| [Panera, página comercial actual](https://www.panerabread.com/en-us/mypanera/subscription.html) | Presenta una promoción con duración y condiciones, además de enlazar términos. El programa actual limita a 30 canjes por período; las referencias antiguas a “Unlimited” pueden inducir a error. | Mantener sincronizados marketing, términos, confirmación y operación cuando cambien beneficios. | No utilizar precios estadounidenses ni promesas de ahorro de Panera para valorar C$ ni proyectar rentabilidad de Lupita. |
| [Café Las Flores, FAQ oficial nicaragüense](https://cafelasflores.com/faq/) | Explica registro gratuito, identificación en caja, acreditación que puede demorar hasta una hora, consulta de historial, canjes, vigencia, reversión por devoluciones y soporte. Incluye versión y vigencia. | Una ayuda local concreta puede explicar excepciones sin perder sencillez: “No aparece mi sello”, “Cómo uso mi premio”, “Dónde pido ayuda”. | Sus puntos no vencen por inactividad, pero esa es su política. No determina cómo deben funcionar los sellos de Lupita. |
| [Casa del Café, ficha oficial publicada por Casa del Cafe S.A. en App Store Nicaragua](https://apps.apple.com/ni/app/casa-del-caf%C3%A9/id1536908037) | Resume en voseo la relación compra → puntos → café y separa otras funciones como pedir y retirar. | La voz nicaragüense puede ser cálida y explícita simultáneamente. Una frase útil puede preceder al lenguaje evocador. | La ficha publicitaria no verifica por sí sola desempeño, experiencia completa ni satisfacción; no se usaron reseñas como evidencia. |

## Diagnóstico específico sobre la implementación leída

Las observaciones siguientes son de contenido y estructura en el código, no resultados de una prueba completa de uso real.

### R1. Se muestra progreso, pero no la acción que produce ese progreso

En `Club.tsx:175` aparecen la visita y los nueve sellos; el contador informa lo que falta. La pantalla no responde, en ese bloque, si se gana por compra, por visita, por importe o por producto; tampoco explica qué presentar al personal ni qué hacer si un sello no aparece. Un usuario puede entender la recompensa sin entender cómo acercarse a ella.

**Propuesta:** añadir “Cómo ganás tus sellos” junto al progreso, con tres pasos y enlace a condiciones. El primer paso debe usar exactamente la regla del backend y la operación de barra. Ejemplo de estructura, pendiente de completar con reglas confirmadas: “Identificate en caja → [acción elegible] suma [regla real] → al completar nueve sellos, mostrás tu premio”. No publicar una equivalencia inventada como “una visita = un sello”.

**Aceptación:** una persona puede explicar qué acción suma, cuándo se acredita, si hay límite y cómo reclamar una omisión, sin abandonar el módulo.

### R2. Los beneficios completos de la Mesa están disponibles demasiado tarde

La oferta a no socios (`Club.tsx:248`) menciona bolsa, café y preferencia en términos generales. La sección operativa de beneficios está condicionada a que exista membresía; los detalles de 250 g, filtrado, 15 % en repostería, prioridad VIP y anticipación de 48 horas aparecen ahí (`Club.tsx:316`, `Club.tsx:335`, `Club.tsx:350`). Una persona evalúa el pago con menos información que quien ya pagó.

**Propuesta:** publicar el mismo catálogo de beneficios antes y después del alta; cambiar únicamente los controles por estado. Para no socios: descripción y límites. Para socios: descripción, disponibilidad y acción de canje. Extraer el contenido a una fuente compartida reduce divergencias. Separar “Incluido” de “Acceso anticipado para comprar”; la reserva de una experiencia tiene un cobro propio en el código y no debe confundirse con una entrada incluida.

**Aceptación:** todos los beneficios y sus límites relevantes son visibles antes de confirmar la primera cuota; cada uno conserva la misma redacción después del alta.

### R3. Hay dos unidades incompatibles en la promesa del café

El texto de venta ofrece café “por visita” (`Club.tsx:249`), mientras el estado operativo utiliza `bebidaDelDia` y muestra “Ya lo tomaste hoy” (`Club.tsx:335`). Esto prueba una divergencia de lenguaje. La regla real de canje debe confirmarse en el servidor antes de decidir cuál texto corregir.

**Propuesta:** hacer coincidir oferta, botón, contador, mensaje agotado y condiciones. Si la regla real es diaria, indicar “Un café filtrado al día”; si depende de visita, representar visita y elegibilidad real. Precisar producto, tamaño y extras si la operación tiene exclusiones.

**Aceptación:** la misma persona que vuelve dos veces el mismo día puede anticipar correctamente si el segundo café está incluido.

### R4. “Mes” y “treinta días” requieren una sola definición

Los precios aparecen por mes y la confirmación indica renovación cada treinta días (`Club.tsx:492`). No son equivalentes a lo largo del calendario. El flujo de renovación conserva además la expresión “al terminar tu mes” (`Club.tsx:519`).

**Propuesta:** si se confirma que el ciclo es fijo de treinta días, mostrar “C$ [cuota real] cada 30 días” con fecha del siguiente cobro y período exacto. Si negocio pretende mes calendario, habrá que revisar la regla y sus pruebas, no solamente cambiar texto. Conservar la buena explicación existente de que cancelar renovación mantiene lo ya pagado.

**Aceptación:** precio, primer cobro, frecuencia, próximo cobro, fuente del saldo y consecuencia de cancelar se entienden antes de aceptar y se consultan después.

### R5. Falta de saldo informa el problema, pero no habilita la recuperación

El botón de la Mesa queda desactivado y el texto comunica cuánto falta (`Club.tsx:286`). El usuario necesita saber qué significa Cuenta de Casa y cómo cargarla. `Inicio.tsx:206` ya describe recarga en mostrador con efectivo o tarjeta, información reutilizable tras confirmar que sigue vigente.

**Propuesta:** mantener accesible la explicación del plan aunque no exista saldo suficiente; ofrecer “Cómo recargar mi Cuenta de Casa” y una salida a la ruta real. Evitar que un CTA de recarga dé a entender que se realizará un pago digital inmediato si el procedimiento es presencial. Explicar si la recarga puede usarse para otras compras según la política existente.

**Aceptación:** con saldo cero se puede evaluar la oferta y encontrar el siguiente paso, sin interpretar que el Club gratuito exige una recarga.

### R6. El lenguaje afectivo necesita un respaldo literal

“Cien personas, y una silla que siempre está” puede sugerir asiento garantizado; el beneficio concreto se denomina prioridad de horario VIP. “Se retira de 7 a 9” (`Club.tsx:316`) carece de a. m./p. m. “La casa contando con vos antes que con nadie” no explica una ventana de 48 horas.

**Propuesta:** conservar una frase de marca y añadir condiciones literales adyacentes. Precisar cuándo y dónde se retira la bolsa; qué significa prioridad; cómo se reciben o consultan las experiencias anticipadas. No afirmar disponibilidad garantizada salvo que exista una política operativa que la respalde.

**Aceptación:** usuarios y personal interpretan igual los límites y horarios; no es necesario explicar de memoria una excepción después del cobro.

### R7. La atención en barra forma parte de la experiencia digital

El código distingue beneficios canjeables mediante código y tres aplicados por personal. Eso es una decisión operativa válida; la claridad depende de que personal y usuario dispongan de la misma información. El texto actual explica bien que generar un código no consume el beneficio y que el personal confirma la entrega.

**Propuesta:** preservar esa distinción; mostrar estado de entrega, vigencia real del código y recuperación si caduca. Para beneficios manuales, indicar qué presentar y cómo se confirma la pertenencia. Para incidencias, publicar un canal y horario real. Definir un procedimiento breve de barra para código vencido, falta de conectividad, cuenta equivocada, beneficio ya entregado y discrepancia de saldo, sin autorizar canjes fuera de reglas existentes.

**Aceptación:** generar código, entregar producto y consumir derecho son estados distintos tanto para el cliente como para el personal; un intento fallido no se describe como entrega realizada.

## Arquitectura de información propuesta

1. **Tu Club Lupita — gratis.** Estado actual, próximos sellos o premio listo. Frase concreta de beneficio y ayuda “Cómo funciona”.
2. **Usá tu Club.** Identificación, acumulación, premio, condiciones y soporte. La acción principal depende del estado: explicar el primer sello, mostrar el premio o consultar movimientos.
3. **Mesa Fundadora — suscripción opcional.** Beneficios completos, cuota real, ciclo, disponibilidad de plazas, mecanismo de pago y cancelación. Para miembros, sustituir adquisición por administración y canjes.
4. **Experiencias y reservas.** Separadas visualmente de los beneficios incluidos y con su precio o condición explícita. La cantidad de módulos visibles debe validarse en móvil.

Este orden es una hipótesis de diseño para probar. No exige sumar pestañas ni copiar la navegación de una cadena grande. Si la invitación “Conocé tu club” lleva a esta pantalla, debe aterrizar en una explicación reconocible y no dar por supuesto que la persona conoce las reglas.

## Adaptación a Nicaragua y decisiones pendientes

La evidencia local demuestra que existen programas publicados con voseo, acumulación y canje; no demuestra qué interfaz prefiere la clientela de La Bella Lupita. Mantener C$, fechas legibles y hora de Managua, sin importar precios o condiciones extranjeras. Distinguir la gratuidad de la cuenta del saldo prepago y de la cuota. Validar con clientes reales el uso de “sellos”, “tanda”, “Mesa Fundadora” y “Cuenta de Casa”; “tanda” puede necesitar una explicación inicial aunque resulte expresivo.

No se asume conectividad deficiente, ingreso bajo ni preferencia universal por efectivo por tratarse de Nicaragua. Se recomienda incluir en pruebas los dispositivos, conexiones y medios de recarga efectivamente usados por clientes, para evitar que los hábitos del equipo definan el producto.

Antes de editar contenido contractual, negocio y operación deben resolver: regla exacta para ganar sellos; elegibilidad de la bebida gratuita; límite del café de suscripción; vigencia de sellos y premios; período de la bolsa; horario de retiro; alcance de prioridad VIP; ejecución de acceso anticipado; estados en gracia; devolución y cesión; y funcionamiento real de la lista de espera.

## Validación propuesta

Realizar pruebas moderadas con personas nuevas, miembros gratuitos y suscriptores, incluyendo personal de barra. Usar tareas, no opiniones generales: explicar qué es gratis; ganar el primer sello; determinar si puede tomar otro café hoy; encontrar condiciones de la Mesa; continuar con saldo insuficiente; identificar siguiente cobro; cancelar renovación; recuperar un código vencido.

Registrar errores de comprensión, pasos requeridos, éxito sin ayuda y discrepancias entre la explicación del cliente y la del personal. Solo después medir si el rediseño modifica altas o uso; las altas deben interpretarse junto con cancelaciones, reclamos y comprensión, porque un cobro aceptado por confusión no prueba una buena experiencia.

## Límites de este subestudio

No se accedió a cuentas de las marcas comparadas ni se auditaron sus interfaces completas. Las fuentes describen ofertas publicadas, no prueban su calidad operativa. No se calculó valor económico para el cliente ni margen de la Mesa porque faltan costos y precios locales validados. La evidencia local de código puede diferir del despliegue público y debe cruzarse con la inspección principal. No se emiten conclusiones legales.
