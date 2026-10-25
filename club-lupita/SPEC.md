> Actualización autorizada · 9 de octubre de 2026. Mesa Fundadora usa la versión `fundadora-2026-10`: C$950 por 30 días, un café filtrado diario y una bolsa de 250 g por período pagado. Se preservan contratos anteriores. Fuente ejecutable: `src/compartido/club.ts`. Plan y validación: `entregables/mejoras-mi-club-2026-10-09/PLAN.md`.

> Actualización autorizada · 13 septiembre 2026. La solicitud del usuario de ejecutar la auditoría premium sustituye las restricciones visuales anteriores cuando entren en conflicto con `PLAN-UX-PREMIUM.md`. Se conserva la lógica de negocio. Se autorizan portada fotográfica, cuenta compacta, carnet con radio de 16 px, superficies editoriales de 12 px, carta mixta, retiro de módulos sin servicio y reserva por pasos. Estas decisiones son de diseño, no cambios de precios ni beneficios.

# SPEC · Club Lupita

> Especificación congelada. Resuelve las diez decisiones que el prototipo de Stitch
> tomaba dos veces y de dos maneras distintas. **Nada de esto se rediscute dentro del
> código**: si algo hay que cambiar, se cambia aquí primero.
>
> Fase 0 del plan de obra · 22 de agosto de 2026 · ver `PLAN-RECONSTRUCCION.md`

## Regla de gobierno

El prototipo de Stitch manda. Toda desviación tiene que caber en una de estas tres
causas, y quedar escrita en el §11 de este documento:

- **(a)** El PRD lo exige y el prototipo no lo cumple.
- **(b)** El prototipo se contradice a sí mismo y hay que elegir.
- **(c)** Hay un defecto de accesibilidad o de inclusión que un profesional no firma.

Cualquier otra diferencia con el prototipo es un error de implementación, no una decisión.

### Regla de las cifras

**Todo número que aparezca en un comentario, en este documento o en la interfaz o
se deriva de un script, o se acompaña del comando que lo reproduce, o no se escribe.**

Esta regla existe porque se rompió tres veces: dos cifras de contraste infladas en la
ronda 2, y en la ronda 4 dos recuentos **exactamente invertidos** —«`text-porcelana` en
nueve pantallas» cuando era una, y «`max-w-lg` es el ancho compartido» cuando el
compartido es `md`—. Un comentario que cita una medición y se equivoca es peor que uno
que no la cita: hace que ninguna cifra del repositorio sea confiable.

---

## 1 · La tanda: diez casillas, nueve sellos

**Decisión.** Diez casillas visibles en dos filas de cinco. **Nueve se ganan; la décima
la pone la casa.** El contador de progreso cuenta hacia nueve.

**Por qué.** Es la única lectura que reconcilia toda la evidencia en vez de descartar
parte: el `DESIGN.md` pide «10 espacios en 2 filas de 5», el panel de caja dice `7/9`,
cuatro pantallas del socio dicen «te faltan 2» y una sola dice «te faltan 3». Diez
casillas donde la última es el premio hace verdaderas todas menos esa.

**Consecuencia.** El backend en producción ya modela exactamente esto. **La tanda no
necesita ni una migración.** La pantalla que dice `7/10` y «te faltan 3» se corrige.

**Copy canónico.** Eyebrow: `NUEVE SELLOS. LA DÉCIMA LA PONE LA CASA.` ·
Progreso: `Te faltan 2 para tu bebida de cortesía.` · Décima casilla: contorno dorado
punteado con el ícono de taza, nunca vacía y gris.

## 2 · Un solo nombre, tres registros

| Registro | Nombre | Dónde |
|---|---|---|
| Marca madre | **La Bella Lupita** | Panel de staff, correos, pie legal, `<title>` |
| Producto | **Club Lupita** | La app del socio: logotipo, onboarding, carnet |
| Sustantivo común | **la casa** | El copy, siempre en minúscula: «pasa en la casa», «la casa pone» |

**«Casa Lupita» se retira.** Era una invención del prototipo y no existe fuera de él.
Lo que lo hacía sonar bien —la calidez de llamar «la casa» al local— se conserva
convertido en lo que siempre fue: una manera de hablar, no un logotipo.

## 3 · Variante canónica por vista

| Vista | Canónica | Por qué |
|---|---|---|
| Inicio | `inicio_club_lupita_2` | Es la única con los tres accesos rápidos que el PRD exige, y el reto lleva premio explícito |
| Bienvenida | `bienvenida_a_club_lupita_2` | La `_1` no tiene fotografía; el PRD pide abrir con la finca |
| Perfil | `perfil_de_socio_club_lupita_2` | Trae nivel, referidos, preferencias, pago y notificaciones completos |
| Reservá | La variante con tarjeta de Salón VIP y horario sugerido | La otra pierde las condiciones del depósito, que son información contractual |
| Analítica | `panel_de_anal_tica_la_bella_lupita_1` | Es la única con «Ingresos por palanca», que el PRD pide, y con Ajustes |

Las otras siete quedan archivadas como exploración. No se consultan durante la construcción.

## 4 · Iconografía: un glifo, un significado

**La regla.** Ningún glifo carga dos significados. Es lo que ordena las 89 formas que el
prototipo usa para unos 45 conceptos.

| Pestaña | Ícono | Descartados | Por qué el elegido |
|---|---|---|---|
| Inicio | `home` | — | Unánime en las 17 pantallas |
| Pedir | `local_cafe` | `coffee_maker`, `restaurant_menu`, `coffee` | `restaurant_menu` sesga a restaurante y esto es café de especialidad |
| Tienda | `storefront` | `shopping_bag`, `local_mall`, `store` | `shopping_bag` es el carrito, no la tienda; `local_mall` es centro comercial, lo contrario de una finca familiar |
| Club | `military_tech` | `loyalty`, `workspace_premium` | `workspace_premium` se reserva para el sello de socia fundadora; darle también la pestaña sería un glifo con dos significados |
| Perfil | `person` | — | Unánime |

**El sello es `coffee_maker`, y su estado se dice con el eje `FILL`, no cambiando de
dibujo.** Ganado: `FILL 1`. Vacío: `FILL 0`. Es la decisión que desatasca el resto —
si el sello vacío fuera otro glifo dejaría de leerse como progreso, y usar `local_cafe`
para el sello lo dejaba ocupado y sin ícono libre para la pestaña Pedir.

| Concepto | Canónico | Mata a |
|---|---|---|
| Sello, lleno y vacío | `coffee_maker` + eje `FILL` | `drive_file_rename_outline` (17 usos), `local_cafe`, `star` |
| Sello de socia fundadora | `workspace_premium` | `stars`, `star`, `verified`, `crown` |
| Carrito / pedido | `shopping_bag` | — |
| Bolsa del mes | `local_mall` | `shopping_bag` |
| Reservá mesa | `event_seat` | `deck`, `chair_alt`, `chair` |
| Pedí para llevar | `takeout_dining` | `shopping_bag`, `local_mall` |
| Regalo / beneficio | `redeem` | `card_giftcard`, `featured_seasonal_and_gifts` |
| Alergia / alerta clínica | `warning` | `info`, `error_outline` |
| Avance de CTA | `arrow_forward` | `arrow_right_alt` |
| Fecha | `calendar_today` | `calendar_month` |

El subconjunto de la fuente se deriva del código con `scripts/iconos.mjs` y el build
falla si el código pide un glifo que no está: Material Symbols no da error, **imprime
el nombre en letras** en medio de la pantalla.

**Estado activo de la pestaña:** píldora `rounded-xl` **tintada** al 15 % de verde hoja,
con ícono y texto en verde hoja sólido. Se descartan el rectángulo gris —que comunica
hover, no estado— y la píldora verde rellena: en Pedir compite con el botón «+» y con el
primario, que son el mismo verde. El `DESIGN.md` pide verde hoja para las pestañas
activas y esto lo cumple sin que la barra parezca una llamada a la acción.
Contraste **6,03:1** sobre el compuesto `#e0e7e3` — medido, no estimado.

## 5 · Menú del panel, con roles

| Grupo | Entradas |
|---|---|
| Turno | Resumen · Check-in · Pedidos · Reservas |
| Gestión | Socios · Eventos · Tienda · Campañas |
| Casa | Arqueo · Ajustes |

| Rol | Ve |
|---|---|
| Barista | Turno |
| Encargado | Turno + Gestión |
| Dueño | Todo |

Los cuatro menús distintos del prototipo eran cuatro bocetos del mismo panel. Esto es su
unión, deduplicada y ordenada por frecuencia de uso en el turno.

## 6 · Puntos y niveles

**Tres niveles.** El PRD nombra dos, pero un programa de fidelidad sin escalón de entrada
no tiene primer peldaño: quien acaba de abrir cuenta necesita pertenecer a algo desde el
primer día.

| Nivel | Umbral | Qué desbloquea |
|---|---|---|
| **Gente de la Casa** | 0 pts | La tanda, la cuenta abierta, el reto semanal |
| **Barista** | 1.000 pts | 15 % en repostería · acceso a experiencias 48 h antes |
| **Reserva Lupita** | 2.500 pts | Prioridad de horario en Salón VIP · lote numerado antes que el público |

**Cómo se ganan.**

| Acción | Puntos |
|---|---|
| Consumo | 1 pt por cada C$ 10 |
| Tanda cerrada | +100 |
| Referido que completa su primera visita | +250 |
| Activación de la membresía | +500 |

Los puntos **no caducan** y no se descuentan al canjear beneficios: miden trayectoria, no
saldo. El saldo es el monedero y es otra cosa.

> Con esta tabla, una socia con 1.880 pts está a **620 de Reserva Lupita** — exactamente
> la cifra que el prototipo muestra. La escala se calibró para reproducirla.

## 7 · Kits de regalo y corporativo: fuera del carrito, dentro de la app

**Decisión.** No entran al carrito en la v1. Entra un **formulario de cotización** —
ocasión, cantidad, fecha, presupuesto— que arma el mensaje y lo abre en WhatsApp con
todo escrito.

**Por qué.** Es venta con precio negociado y logística propia. Montar carrito, existencias
y pago para un volumen bajo cuesta más de lo que devuelve. Pero el enlace desnudo que hay
hoy —«Cotizá por WhatsApp»— traslada al cliente el trabajo de explicar qué quiere. El
formulario es la diferencia entre una salida y un abandono.

**El PRD se actualiza:** «kits de regalo» pasa de venta a cotización asistida.

## 8 · Pago con tarjeta: fuera de la v1

**Decisión.** Se retira la fila «Monedero · Visa ····4412» del Perfil. En su lugar:
**«Recargás en caja, con efectivo o con tarjeta.»**

**Por qué.** No es un recorte, es coherencia interna: **el propio prototipo ya lo dice**.
La pantalla de Monedero declara «Podés recargar en caja con efectivo o con tarjeta»,
y la fila del Perfil la contradice prometiendo una tarjeta guardada que nadie diseñó ni
contrató. Entre dos pantallas del prototipo que se contradicen, gana la que describe el
proceso real de la casa.

Además, el monedero prepago **es** el modelo de negocio: C$ 186.400 de flujo futuro
asegurado es el número que el panel presume. Una pasarela que permita pagar sin recargar
compite contra la palanca principal del club.

## 9 · Un solo año: 2026

Los paneles de staff usaban 2023 y 2024; las pantallas del socio, 2026. **Gana 2026:**
aparece 18 veces contra 6, es coherente con «Cosecha 2026» y «Reserva de Cosecha 2026»,
y es el año en curso. El juego de datos de demostración se rehace completo y coherente:
una sola socia, una sola línea de tiempo, cifras que cuadran entre pantallas.

## 10 · Datos canónicos de demostración

| Dato | Valor |
|---|---|
| Socia | María Fernanda R. · #037 de 100 |
| Desde | Marzo 2026 |
| Nivel | Barista · 1.880 pts · 620 para Reserva Lupita |
| Monedero | C$ 1.240 |
| Tanda | 7 de 9 · te faltan 2 |
| Bebida de siempre | Capuchino con leche de almendra |
| Alergia | Nueces |
| Cumpleaños | 14 de octubre · el regalo se activa el 7 |
| Visitas | 77ª |
| Socios fundadores | 82 de 100 · 17 en lista de espera |
| Reserva de Cosecha | quedan 34 de 150 |
| Mesa del Tostador | 8 de 12 cupos · vie 12 sep · C$ 1.150 |
| Saldo prepago vivo | C$ 186.400 |

Cualquier cifra que aparezca en pantalla y no esté en esta tabla o se derive de ella
**sale de la base de datos o no aparece**. No hay números decorativos.

### Formato de número

Nicaragua separa los millares con **coma** y los decimales con **punto**:
`Intl.NumberFormat('es-NI').format(186400)` da `186,400`. El prototipo lo escribía
bien y la primera versión de este documento lo escribió mal —con punto—, así que el
prototipo manda también aquí.

| | |
|---|---|
| Moneda | `C$ 1,240` · espacio fino tras el símbolo, sin decimales cuando son cero |
| Porcentaje | `31 %` · con espacio, siempre |
| Puntos | `1,880 pts` |
| Cifras en columna | `tabular-nums`, sin excepción |

---

## 11 · Desviaciones declaradas

Tres, y solo tres. Cada una con su causa según la regla de gobierno.

| # | Desviación | Causa | Justificación |
|---|---|---|---|
| 1 | El Inicio canónico es `inicio_2`, pero toma el carnet de socio de `inicio_4` | **(a)** | `inicio_2` es la única variante que cumple el requisito de accesos rápidos del PRD; el carnet de `inicio_4` es el único con el chip de escasez de la bolsa del mes, que es una palanca de negocio |
| 2 | El primer nivel se llama **Gente de la Casa**, no «Amiga de la Casa» | **(c)** | El nombre del prototipo está en femenino. Un socio hombre leería un nivel que no lo nombra. «Gente de la Casa» conserva la calidez y el registro nicaragüense sin excluir a nadie |
| 3 | Se retira la tarjeta guardada del Perfil | **(b)** | Dos pantallas del prototipo se contradicen; gana la que describe el proceso real de la casa (§8) |
| 4 | La pestaña activa es una píldora **tintada**, no rellena | **(b)** | El prototipo pinta cuatro tratamientos distintos. El relleno sólido usa el mismo verde que el botón primario y el «+» de la Carta: en esa pantalla la barra parecería una llamada a la acción |
| 5 | El carnet dice **«MESA FUNDADORA · #037 / 100»**, sin sustantivo con género | **(c)** | El prototipo alterna «Socia Fundadora», «Socia» y «Amiga de la casa». Nombrar el nivel en vez de a la persona resuelve las cuatro formulaciones y no deja fuera a nadie |
| 6 | No hay modo oscuro en la v1 | **(b)** | Las 23 pantallas declaran `darkMode: "class"` y salpican `dark:` inertes, pero **no existe una paleta oscura**: los 47 tokens son un solo esquema. Inventarla sería crear un segundo sistema de diseño, que es justo lo que este proyecto viene a deshacer |

| 7 | **El oro no es un color de texto sobre claro** | **(c)** | El prototipo pinta eyebrows, cifras y nombres de nivel en oro miel sobre porcelana y sobre blanco: **2,74:1 y 3,04:1**. No pasa AA en ningún tamaño. Sobre claro habla el café tostado (9,10:1); sobre espresso el oro sí habla (5,46:1) y se queda |
| 8 | La casilla vacía y el buscador suben de contraste | **(c)** | La casilla vacía copiaba `outline-variant` sobre blanco: **1,70:1**. El buscador iba sin filete sobre un fondo casi idéntico: **1,05:1**, invisible. Pasan a `outline`: 4,49:1 y 4,05:1 |

| 9 | El botón primario lleva `text-porcelana`, no `text-on-primary-container` | **(c)** | El prototipo usa `on-primary-container` en 12 pantallas y porcelana en 1, así que esto va **contra** la mayoría. Va igual porque `on-primary-container` sobre el verde da 4,43:1 y no llega a AA; porcelana da 6,83:1 |
| 10 | La Tienda **no vende** los tres cafés de mostrador del prototipo —C$ 380, C$ 620, C$ 540— ni la suscripción de C$ 342/mes | **(b)** | Ese inventario no existe en ninguna tabla ni endpoint. Pintar sus precios habría sido escribir en el cliente cifras que la caja no honra: el mismo defecto que dejar que el cliente ponga el monto, con un rodeo más largo. La única mercancía que la casa sabe apartar y cobrar es la Reserva de Cosecha, y la única suscripción es la Mesa Fundadora |
| 11 | El Club enseña la cuota **del servidor**, no la del prototipo | **(b)** | El prototipo y el §12.1 dicen C$ 400/mes; `CUOTA_MENSUAL` en el worker cobra **C$ 950**. Reproducible: `curl -s https://club-lupita.el-molino.workers.dev/api/catalogo` devuelve `"membresia":{"cuota":95000}`. Entre prometer una cifra y cargar otra, manda la que se cobra. **Discrepancia resuelta por el usuario el 9 de octubre de 2026: C$950 cada 30 días; ver §12.1** |
| 12 | La Reserva de Cosecha **no lleva año** en el título; el prototipo la llama «Reserva de Cosecha 2026» | **(b)** | El año no está en la base. `reserva_cosecha.generacion` es un contador de corte —hoy vale 6— y pintarlo como año sería inventar un dato con forma de dato, contra la regla de las cifras del §10 |

Ninguna otra diferencia con el prototipo está autorizada.


---

## 12 · Segunda ronda

Trece agentes leyeron las 23 pantallas por separado y devolvieron 234 componentes
crudos, 47 canónicos y dieciséis decisiones que el prototipo no permite tomar. Cinco
ya estaban resueltas arriba. Estas son las once nuevas.

### 12.1 · El Club es gratis; la Mesa Fundadora se paga

Mi Club es gratuito. Mesa Fundadora es una contratación opcional de cien plazas. Para las altas desde la versión `fundadora-2026-10` rigen las condiciones confirmadas por el usuario:

| Modalidad | Incluye | Precio |
|---|---|---|
| Mi Club | Programa de nueve sellos, cuenta, puntos y niveles | Gratis al abrir cuenta |
| Mesa Fundadora | Un café filtrado por día de Managua; una bolsa de 250 g por período pagado; 15% en repostería; prioridad de horario VIP sujeta a disponibilidad; acceso a nuevas experiencias 48 horas antes | C$950 cada 30 días · 100 plazas |

El contrato aceptado conserva su versión, cuota y condiciones operativas. Los contratos anteriores mantienen la cuota individual y la bolsa por mes calendario; no se recalculan cargos o derechos ya contratados. El café ya entregado en el día no se repite por una nueva contratación.

La renovación requiere consentimiento y saldo suficiente. Consultar la cuenta o abrir Mi Club no cobra. Desactivar la renovación conserva el período pagado. La solicitud explícita de un beneficio puede completar una renovación consentida pendiente; también lo hace el proceso programado. Ante saldo insuficiente el contrato vence sin generar deuda; una nueva alta requiere plaza y aceptación.

Consulta, emisión de código y entrega usan las mismas funciones de base de datos. La entrega física confirmada por caja consume el derecho; el vencimiento de un código no lo consume. Las correcciones conservan el registro original y una reposición autorizada deja motivo y responsable.

Los productos con descuento, tamaño/extras del café, compras elegibles para sellos, bebida de premio y procedimiento VIP se configuran en Personal → Mi Club con revisión del propietario. No se infieren productos ni se inventan condiciones. Mientras falte confirmación, la interfaz remite a caja y el descuento automático solo afecta productos explícitamente configurados.

### 12.2 · La barra de nivel tiene fórmula

`puntos actuales ÷ umbral del siguiente nivel`. Con la escala de §6, una socia con
1.880 pts va al **75,2 %** de Reserva Lupita. El prototipo dibujaba el mismo dato al
70 % en dos pantallas y al 75 % en otra, a ojo.

### 12.3 · La barra de nivel no va en la cabecera

La cabecera es chrome fijo en diecisiete pantallas. Meter ahí una barra roba altura
permanente por un dato que se consulta de vez en cuando, no que se vigila. En la
cabecera va el texto —«Nivel Barista · 620 pts para Reserva Lupita»—; la barra vive en
el Perfil, que es donde uno va a mirarla.

### 12.4 · Ancho congelado: la app del socio es de teléfono

**`max-w-md`** —448 px— centrado, sin puntos de quiebre.

> La primera versión de este párrafo decía `max-w-lg` y lo justificaba con un
> recuento inventado. El real, sobre los `code.html` del export:
> **18 `max-w-md` · 4 `max-w-xl` · 4 `max-w-lg` · 2 `max-w-2xl`**, y la variante
> canónica del Inicio usa `md`. Corregido en la ronda 4. El PRD separa explícitamente «Experiencia
del Socio (Mobile)» de «Panel (Desktop)», y una de las variantes de Inicio del prototipo
esconde la barra inferior en `md:` **sin poner nada en su lugar**: la pantalla se queda
sin navegación. El panel de staff sí es de escritorio y tiene su propio kit.

### 12.5 · Sin modo oscuro en la v1

Ver desviación 6. Cuando se haga, se hace con paleta propia y auditada, no invirtiendo.

### 12.6 · El carnet tiene dos variantes declaradas

| Variante | Dónde | Tratamiento |
|---|---|---|
| **Compacto** | Inicio | Sin proporción fija. El dato principal es el saldo; el carnet es su soporte |
| **Objeto** | Mesa Fundadora | `aspect-[1.586/1]` —la proporción de una tarjeta física—, doble marco dorado y lustre |

Son el mismo componente con dos alturas, no dos componentes. La proporción de tarjeta
solo se gana donde el carnet **es** el contenido.

### 12.7 · El reto es permanente

Aparece en las cuatro variantes de Inicio, así que es estructura, no promoción. Cuando
no haya reto activo, el módulo se queda y lo dice: la casa siempre está tramando algo.
Necesita estado vacío propio.

### 12.8 · Inglés: los platos sí, la jerga no

«Iced Coffee Latte» y «Espresso Portable» son nombres de producto de la carta real y se
respetan. «Attach de miembros» y «flight de 3 lotes» son jerga sin traducir y salen:
pasan a **«Comen en sus visitas»** y **«tanda de 3 lotes»**. Los `<title>` en inglés
—`Onboarding`, `Welcome`— se traducen. El `DESIGN.md` no admite inglés en la interfaz y
un nombre propio no es interfaz.

### 12.9 · Siete componentes que hay que escribir desde cero

Ninguna de las 23 pantallas tiene estado vacío, de error, de carga ni de confirmación.
No hay nada que canonizar: hay que escribirlos.

`estado-vacio` · `estado-error` de campo · `esqueleto` de carga · `aviso-flotante` ·
`hoja` inferior · botón con `aria-busy` · `contador` de pestaña.

Con quince casos mínimos ya identificados: número inválido, socio sin sellos, monedero
en cero, búsqueda sin resultados, fuera de horario, producto agotado, cupos llenos,
saldo insuficiente, sin conexión, mes sin datos, reserva sin confirmar, tanda recién
abierta, sin referidos, sin movimientos, sin experiencias en el mes.

### 12.10 · Accesibilidad: WCAG 2.1 AA, obligatorio

Cero de las 23 pantallas declara `focus:`, `disabled:` o `aria-current`. El kit los
trae desde el primer componente y el agente A5 los verifica. No es una mejora opcional:
es el suelo.

### 12.11 · Lo que el prototipo escribe mal y no se copia

Siete clases con mayúscula (`Active: scale-95`) que no compilan · `docked` y
`full-width`, que no existen en Tailwind · `hover:bg-primary-fixed-variant`, token
inexistente · `scrollbar-hide` y `pb-safe` usadas sin definir · `bg-surface-low`, que
tampoco existe. Copiar el prototipo **literalmente** significa copiar lo que quiso
decir, no sus erratas.


---

## 13 · Contraste medido

Siete auditores independientes revisaron el kit y un cuerpo de refutadores intentó
derribar cada hallazgo. El árbitro lo **rechazó**, y con razón: las dos únicas cifras de
contraste que la especificación publicaba sobre sí misma estaban infladas un 8 % y un
18 %, y una de ellas se leía impresa en la página de kit.

Esta tabla se calcula con luminancia relativa (WCAG 2.1) y se vuelve a calcular en cada
ronda. **Ninguna cifra de accesibilidad de este documento se escribe a ojo.**

| Pareja | Ratio | Mínimo | |
|---|---|---|---|
| verde-hoja sobre porcelana · botón primario | **6,83:1** | 4,5 | pasa |
| verde-hoja sobre tinta 15 % · pestaña activa | **6,03:1** | 4,5 | pasa |
| café-tostado sobre porcelana · eyebrow | **9,10:1** | 4,5 | pasa |
| café-tostado sobre blanco · cifras | **10,09:1** | 4,5 | pasa |
| café-tostado sobre el sello ganado | **8,87:1** | 3,0 | pasa |
| café-tostado sobre el aviso oro | **8,54:1** | 3,0 | pasa |
| oro-miel sobre espresso · `.oro-en-tinta` | **5,46:1** | 4,5 | pasa |
| secondary-fixed sobre chip en carnet | **9,33:1** | 4,5 | pasa |
| espresso sobre oro-miel · insignia y contador | **5,46:1** | 4,5 | pasa |
| outline sobre blanco · casilla vacía | **4,49:1** | 3,0 | pasa |
| outline sobre porcelana · filete del buscador | **4,05:1** | 3,0 | pasa |
| café-tostado sobre el carril · barra de la tanda y del nivel | **7,80:1** | 3,0 | pasa |
| verde-hoja sobre el carril · barra del reto | **5,85:1** | 3,0 | pasa |

Y lo que se retiró, con su cifra:

| Pareja retirada | Ratio | |
|---|---|---|
| oro-miel sobre porcelana · eyebrow a 11 px | 2,74:1 | **falla** |
| oro-miel sobre blanco · «te faltan **2**», «Barista» | 3,04:1 | **falla** |
| oro-miel sobre el aviso oro · ícono | 2,57:1 | **falla** |
| oro-miel sobre el sello ganado · ícono | 2,67:1 | **falla** |
| outline-variant sobre blanco · casilla vacía | 1,70:1 | **falla** |
| surface-container sobre porcelana · buscador sin filete | 1,05:1 | **falla** |
| oro-miel sobre el carril · la barra de progreso entera | 2,35:1 | **falla** |

Esa última la había puesto yo, no el prototipo: las cuatro variantes del Inicio pintan
la barra del reto en **verde**, ninguna en oro. Teñirla de oro borraba la distinción que
el prototipo mantenía con disciplina —el oro es el color del dinero y de la escasez— y
además no cabía en ninguna de las tres causas del §11. Vuelve al verde.

> La casa ya sabía esto. El sistema que ahora se retira lo tenía escrito en sus tokens:
> «el oro lámina rinde 2,09:1 sobre papel y queda PROHIBIDO como texto». El prototipo de
> Stitch no lo sabía, y esta reconstrucción estuvo a punto de heredarlo entero.

### El lustre se mide encendido, no apagado

La tabla de arriba medía el carnet **con la lámina apagada**. Encendida, el degradado de
oro es el fondo real del texto, y el texto es el que anuncia el dinero del socio:

| Pareja, con el lustre al 42 % | Apagado | Encendido | |
|---|---|---|---|
| `.oro-en-tinta` · «CLUB LUPITA · MESA FUNDADORA» | 5,46:1 | **2,47:1** | falla |
| `porcelana/70` · «C$ 505 tuyos · C$ 400 que puso la casa» | 7,92:1 | **4,25:1** | falla |
| `secondary-fixed` · chip de la bolsa del mes | 9,33:1 | **5,80:1** | pasa |

Y no hay alfa que lo salve: al 12 % el oro sigue en **4,46:1**. Tampoco era transitorio —
sólo se apagaba al salir el puntero, así que en escritorio bastaba dejar el ratón encima,
y en teléfono un desplazamiento que empezara sobre el carnet lo encendía justo mientras
se arrastra la pantalla.

**La luz pasó al filete.** La lámina de oro de un carnet de cartón está en el canto, no
en la cara: confinarla ahí con una máscara de dos capas es más fiel al objeto y es seguro
por construcción — ningún texto tiene el degradado debajo. Verificado en navegador con la
lámina encendida: el fondo de la cara no cambia ni un valor.


### Extensión operativa de Mi Club · 9 de octubre de 2026

La migración 025 incorpora un registro de descuento aplicado en comprobantes externos de caja, separado del libro de la Cuenta de Casa. Caja selecciona productos aprobados por el propietario; el cálculo usa los precios actuales de Carta y el mismo redondeo por unidad. Si el comprobante tiene otros precios, extras o promociones, administración debe revisar el caso: el formulario no infiere reglas de acumulación de descuentos.

La cotización verifica membresía vigente y la confirmación revalida productos, precios y configuración. La referencia normalizada del comprobante es única; un reintento recupera el registro anterior incluso si la membresía venció después. Administración puede anular con motivo mediante un registro separado e inmutable. La anulación no devuelve dinero ni cambia por sí misma el comprobante externo. Cliente y panel pueden consultar el registro y su anulación.

Los tiempos de consulta de Mi Club, obtención de código y recuperación de compra se miden en milisegundos, sin identificadores personales, tanto en entrada directa como por navegación interna. Se separan respuestas correctas, errores y cancelaciones. Se respeta No rastrear/GPC y se conservan 90 días. Estas medidas no sustituyen Core Web Vitals ni miden la fila física de caja; el panel informa muestras y p75 sin declarar cumplimiento de campo.
