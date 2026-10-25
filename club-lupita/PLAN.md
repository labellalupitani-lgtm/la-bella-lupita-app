# Club Lupita — Plan maestro de producto y construcción

> App de socios de **La Bella Lupita Bistró Café** (Km 7.5 carretera sur, Plaza La Fe, Managua).
> Construida sobre la investigación de las fases 1–3 (`../research_apps_bella_lupita/`).

## 0. La tesis

La Bella Lupita ya tiene lo que ningún competidor de Managua puede copiar: **una finca familiar propia
desde 1971** en Matagalpa y Jinotega, a más de 1,200 m. Hoy ese activo se cuenta en un párrafo de la web
y muere ahí. La app lo convierte en **motor de ingresos recurrentes**: cada sello, cada bolsa numerada,
cada cata y cada recarga del monedero son la finca cobrando por adelantado.

**Regla de oro del proyecto:** ninguna pantalla existe para lucirse. Cada interacción poco convencional
tiene que mover una palanca medible (frecuencia, ticket, prepago, retención) o se elimina.

## 1. Identidad — la real, no la inventada

Extraída de `labellalupita.com` en vivo (no de un moodboard):

| Elemento | Valor real de marca |
|---|---|
| Tinta | `#120D0A` (negro cálido, café quemado) — es su `theme-color` |
| Oro | `#C9A456` |
| Crema | `#F4EFE4` / `#F9F4EE` |
| Display | **Playfair Display** (incl. itálica) |
| Interfaz | **Inter** 300–600 |
| Voz | Voseo nicaragüense, frases de dos tiempos: *"Café con pulso. Mesa con memoria."* |
| Ejes | **BARRA · BRUNCH · BISTRÓ · SOBREMESA** |
| Ritual | MOLIENDA → EXTRACCIÓN → FIRMA LUPITA |

> El prototipo previo de Stitch usó una paleta verde inventada. **Queda descartada.** La app hereda la
> identidad viva del cliente para que se sienta la misma casa.

## 2. Arquitectura

```
Navegador  ──►  Cloudflare Worker (Hono)  ──►  Neon Postgres (driver serverless HTTP)
                 │
                 └── static assets (React 18 + Vite, SPA)
```

- **Frontend:** React 18 + TypeScript + Vite. CSS propio con custom properties (sin framework de
  utilidades: control total del detalle). Animación con `motion`.
- **Backend:** un solo Worker sirve la SPA y `/api/*`. Sin servidor que mantener.
- **Datos:** Neon Postgres 17, proyecto `club-lupita` (`polished-waterfall-53015854`, us-east-2).
- **Dinero:** enteros de centavos. Monedero como libro mayor append-only, nunca un campo mutable.
- **Secretos:** `.dev.vars` y `.env.deploy`, ambos fuera de control de versiones.

## 3. Mapa de la app

**Socio (móvil primero)**
1. Umbral / registro por WhatsApp — con 2 sellos de regalo (endowed progress: 19% → 34%)
2. Casa (home) — el pulso del día
3. Sellos — rueda de catación 9+1
4. Monedero — saldo líquido y recarga con bono
5. Carnet de socio — cupo 100 fundadores
6. Carta y pedido anticipado — filtrada por el momento del día
7. Tienda de la finca — grano, Espresso Portable, suscripción
8. Ficha de lote — transparencia radical (puntaje, altura, proceso, productor)
9. Experiencias + detalle — tickets prepagados con cupo
10. Reserva — plano real de la casa + Salón VIP con depósito
11. Perfil y referidos

**Negocio (escritorio)**
12. Ficha de servicio del staff — "sentirse conocido"
13. Panel del dueño — transacciones identificadas, attach, float, cupos

## 4. Palancas de negocio → interacción

| Palanca (evidencia) | Cómo se materializa |
|---|---|
| Goal-gradient +20% | La rueda de sellos acelera visualmente cerca del final |
| Endowed progress +79% | Dos sellos ya puestos al abrir la cuenta |
| Escasez honesta | Contadores reales: 82/100 socios, 4 cupos, 34/150 bolsas |
| Transparencia radical (Onyx #1 mundial) | Ascenso altimétrico a 1,200 m en la ficha de lote |
| Float del monedero (Starbucks) | Bono visible como marca en el vidrio del recipiente |
| Sentirse conocido (50% > puntos) | Ficha de servicio del staff al hacer check-in |

## 5. El loop de calidad

```
PLANIFICAR ──► CONSTRUIR ──► PROBAR (build + tipos + navegador real)
     ▲                                    │
     └──── CORREGIR ◄── ÁRBITRO ADVERSARIAL
```

**El árbitro** es un agente independiente con encargo hostil: buscar todo lo que impide que esto sea
digno de Awwwards y todo lo que se rompería en producción. No aprueba por cortesía. Cada iteración
cierra con su veredicto y una lista priorizada de defectos.

**Criterios de aprobación (todos, no la mayoría):**
1. Compila sin errores de tipos y sin advertencias del build.
2. Funciona con el teclado y respeta `prefers-reduced-motion`.
3. Ninguna pantalla se ve como una plantilla de SaaS.
4. Cada texto pasa la prueba del copywriter: nadie escribiría eso por descuido.
5. Las interacciones firma responden en menos de 100 ms al gesto.
6. El dinero cuadra: ningún camino permite saldo negativo ni doble canje.
7. Móvil de 390 px impecable, sin desbordes horizontales.

## 6. Estado — iteración 1 del loop

- [x] Identidad real extraída del sitio en vivo
- [x] Fotografía real del cliente descargada (36 platos + 6 ambientes + logo)
- [x] Carta real completa extraída del sitio: 74 platos con precios y descripciones
- [x] Neon Postgres aprovisionado (`polished-waterfall-53015854`)
- [x] Scaffold Vite + Worker + Hono
- [x] Sistema de diseño en CSS — contrastes WCAG verificados, dos temas
- [x] Copy deck completo en voseo nicaragüense
- [x] Esquema de datos (dinero en centavos, monedero como libro mayor, cupos con
      restricciones que impiden la sobreventa) y semilla aplicados
- [x] API del Worker con las transacciones críticas, verificadas en producción
- [x] 12 pantallas del socio + consola de negocio
- [x] Despliegue en Cloudflare: https://club-lupita.el-molino.workers.dev
- [ ] Auditoría del árbitro y correcciones (en curso)
- [ ] Segunda iteración de pulido

### Verificado en producción

| Prueba | Resultado |
|---|---|
| Sellar dos veces con el mismo ticket | El segundo no otorga sello — idempotente |
| Cobrar más de lo que hay en el monedero | Rechazado con el faltante exacto, en voz de casa |
| Apartar bolsa numerada | Asigna la 117, deja 33 — cupo real, sin sobreventa |
| Ruta profunda de la SPA (`/finca/lote`) | 200 |
| Tipos y build | Sin errores

---

## 7. Iteración 2 — el árbitro dijo RECHAZADO

Auditoría adversarial con **52 hallazgos**, once de ellos bloqueantes. Se verificó
uno por uno antes de tocar nada: **todos los que se comprobaron eran ciertos**.

### Lo que estaba mal de verdad

| Lo que encontró | Por qué importaba |
|---|---|
| La API pública sin autenticación | Un `curl` acuñaba C$3,000 de saldo. Y recorriendo los ocho dígitos de un móvil nicaragüense se leían nombre, **alergias**, cumpleaños y saldo de cualquiera |
| Cuatro compras que anunciaban cargo y no cobraban | Membresía, bolsa numerada, experiencia y depósito VIP: la casa regalaba hasta C$2,400 por clic |
| `e.cupos - 4` | Una resta constante disfrazada de inventario, en una app cuyo propio comentario prohíbe las cifras decorativas |
| El auto-repeat del teclado | Sostener Enter reiniciaba la animación: la décima bebida era inalcanzable sin ratón |
| Deslizar para hacer scroll compraba café | El disparo por velocidad (>600 px/s) se activaba con un flick normal |
| Topes de beneficio como booleano | Usada una vez, la bebida diaria se perdía de por vida |
| Registrarse heredaba las alergias de la demo | Un socio nuevo aparecía en la ficha del barista con «Nueces» ajenas |
| `modulepreload` sobre el chunk de `motion` | Anulaba `LazyMotion`: 51 kB gzip entraban antes del primer píxel |
| Tres hojas modales sin foco, sin Escape, sin trampa | Cero `.focus()` en todo el repositorio |
| «Bistro», «Reposteria», «sarten» | La carta contradecía a la marca dentro del mismo encuadre |

### Lo que se corrigió y quedó verificado

- **Sesión firmada** (HMAC-SHA256, WebCrypto, comparación de tiempo constante).
  El teléfono viaja dentro del token; nunca en el cuerpo. Login por código de
  seis dígitos con huella en base, tope de 5 por hora y 5 intentos.
- **Una sola puerta para el dinero**: acción `cobrar` con guarda de saldo e
  idempotencia; cupo y cargo se mueven en la misma transición.
- **Integridad en la base** (`003_correcciones.sql`): día en hora de Managua,
  libro mayor append-only por *trigger*, exclusión GiST contra el solape del
  Salón VIP, y una vista `cuadre` para el cierre diario.
- **Accesibilidad**: `useHoja` (foco, trampa de tabulador, Escape, devolución
  del foco), guarda de `e.repeat`, plano fuera del recorrido de teclado.
- **Rendimiento**: carga completa **715 ms → 385 ms**; `motion` ahora llega a
  los 321 ms, después de la entrada.

### Verificado en producción

| Prueba | Resultado |
|---|---|
| `POST /api/cuenta/recargar` sin sesión | 401 |
| Leer la cuenta de un tercero | El endpoint ya no existe; `/api/yo` usa el token |
| Token con un carácter cambiado | 401 |
| Panel del dueño sin la contraseña de la casa | 403 |
| Mismo ticket de caja dos veces | El segundo no otorga sello |
| Cobrar por encima del saldo | Rechazado con el faltante exacto |
| Salón VIP a una hora que se solapa | Rechazado por la restricción de exclusión |
| Dos bebidas de cortesía el mismo día de Managua | Rechazado |
| `UPDATE`/`DELETE` sobre el libro mayor | Bloqueado por *trigger* |

### Deuda declarada, no escondida

1. La recarga acredita saldo **sin pasarela de pago**. En producción el asiento
   lo escribe el webhook de la pasarela o lo firma la caja. Mientras tanto,
   tope de C$3,000 por operación y C$6,000 al día.
2. El código del carnet es estático: sirve para demostrar, no para pagar.
3. `menu.ts` tiene 42 platos sin foto y 21 descripciones repetidas — es deuda de
   contenido del cliente, no de código.
4. Sin política de privacidad, y tres beneficios de la membresía siguen sin
   implementar (15% en repostería, prioridad VIP, ventana de 48 horas).

---

## 8. Iteración 4 — la puerta de entrada

El árbitro atacó la capa de dinero y **no cedió**: cinco compras simultáneas con
saldo para una dejaron una venta y cuatro rechazos; el socio no puede sellarse a
sí mismo; la reserva rechaza 1999, las 3 a.m. y las 26.280 horas. Las cinco
pruebas de integridad de la base pasan.

Quedaba un bloqueante, y era el más grave de todos porque **lo creé yo al
cablear las compras**: el arranque abría sesión automáticamente en la cuenta de
demostración, así que todo el que abría la URL escribía en el mismo libro mayor.
Dos visitantes compartían monedero, tanda y bolsas.

### Cerrado

- **Umbral real**: número de WhatsApp → código de seis dígitos → nombre →
  sesión firmada. La cuenta de muestra sigue a un toque, dicha por su nombre.
- **Vale de la décima en el servidor** (`db/007`): código aleatorio de ocho
  caracteres sin vocales, noventa segundos de vida, un solo uso, y consume la
  tanda en el mismo acto. Antes era `LUP-037-03`, determinista y fotografiable.
- **Desglose del saldo del servidor**: el cliente calculaba con la fórmula vieja
  y pintaba «−C$ 435 tuyos» bajo un total positivo.
- **Número de bolsa del servidor**: dos compradores simultáneos leían los dos
  «te tocó la 117», en el producto cuya tesis es que cada bolsa lleva su número.
- **`ROLLBACK` cuando la referencia ya existe**: confirmar el trabajo sin
  cobrarlo regalaba la bolsa o la butaca.
- **Ocupación real** (`GET /api/ocupacion`): los cinco arrays literales del
  plano eran ocupación inventada.
- **La mesa cabe antes del cierre**: una de dos horas a las 20:00 terminaba a
  las 22:00.

### Dos fallos propios encontrados probando

1. **Zona muerta temporal en Reservar**: el `useState` de la ocupación quedó
   declarado después de la función que lo lee, y `libres` la llamaba en el mismo
   render. Tumbaba la app entera al entrar a esa pantalla.
2. **Sin barrera de error**, ese fallo dejaba la pantalla en blanco y se llevaba
   por delante el resto de la app. Ahora `Barrera` aísla la pantalla rota, se
   reinicia al cambiar de ruta y ofrece volver a la casa.

Además: se revirtió el chunk propio de React (rompía el orden de inicialización)
y se añadió una recarga única ante un trozo de código caducado tras un
despliegue, que es lo que deja la SPA en blanco al publicar una versión nueva.

---

## 9. Iteración 5 — de corrección a producto

El árbitro cerró la fase de ingeniería con estas palabras: **«ya no hay
corrección pendiente»**, verificado por ataque, no por confianza. Su auditoría
de jurado dio 4/10 en diseño y **2/10 en contenido** a la Carta, y nombró el
detalle que más caro costaba: **«Empaque · C$ 40» estaba a la venta** — un cargo
del punto de venta publicado como si fuera un producto.

### La Barra: de lista a matriz

Veinticinco filas, veintiuna con la misma frase debajo, era lo primero que veía
alguien que abriera la app a las siete de la tarde.

| Antes | Ahora |
|---|---|
| 25 filas idénticas | 4 bloques |
| 21 descripciones repetidas | **0** — cada bebida tiene la suya |
| 8 cafés en fila | Matriz de dos ejes: *puro grano* / *con leche al vapor* |
| 9 limonadas en 9 filas | Una pieza, la fruta como decisión |
| «Empaque» a la venta | Fuera de la carta; se cobra solo al pedir para llevar |

El **anillo de taza** —el primitivo gráfico de la marca— indica el volumen real
con su diámetro y su grosor: 30 ml el espresso, 250 el té. Cero bytes de imagen.

Y las descripciones las escribió el mismo copywriter del deck. *«Un espresso
cortado con leche caliente en partes iguales. Baja el filo, no el café.»* contra
*«Mismo espresso, apenas manchado: una cucharada de espuma encima.»* — mismo
precio, diferencia legible sin saber de café.

### El resto de la lista del jurado

- **El oro volvió a ser dinero.** De catorce apariciones en la Casa a las tres
  que permite la regla escrita en `base.css`: el saldo, el compromiso y el cupo.
- **`.brasa` solo donde emite luz de verdad:** el saldo y el vale de la décima.
  Estaba en cinco pantallas; lo excepcional en cinco sitios no es excepcional.
- **Fotografía servida al tamaño del hueco.** Se generaron variantes de 240, 480
  y 960 px. La miniatura de la carta pasó de **92 kB a 8 kB**: el navegador elige
  240w para un hueco de 92 px. Verificado en producción.
- **El jarro dejó de repintar la pantalla.** El monto vive en una ref mientras se
  arrastra y sube a estado al soltar; el bucle del menisco se apaga fuera del
  viewport y con movimiento reducido.

### Dos residuos que el árbitro nombró y no bloqueaban

- **El umbral afirmaba que el código llega por WhatsApp** y no hay quien lo
  mande. Ahora lo dice: *«Todavía no estamos mandando los códigos por WhatsApp:
  esa conexión se enciende cuando la casa abra el club de verdad.»*
- **El plano aseguraba «con lugar» cuando no sabía.** Sin dato del servidor
  ahora dice «consultando» y no pinta densidad.

### Lo que se intentó y no funcionó

Cambiar los imports de `m` al punto de entrada ligero `motion/react-m` **no
ahorró un solo kilobyte** (150.98 kB contra 150.72) y rompió tipos en la comanda.
Revertido. `motion` sigue siendo una dependencia estática de la entrada: ~48 kB
gzip que bloquean el primer píxel, contra los 34 declarados en el presupuesto.
Queda como deuda medida, no como mejora imaginada.

---

## 10. Iteración 6 — la votación del jurado

**Carta: 4/6/3/2 → 7/7/7/8.** Dejó de ser la pantalla más floja.
**App: Diseño 7 · Usabilidad 8 · Creatividad 7 · Contenido 8.**
**Site of the Day: no**, por una sola razón — *«la primera pantalla que abre un
jurado es la menos distintiva, y las seis ideas que valen un premio están todas
a dos toques de profundidad»*.

### La Casa: media pantalla para una idea

El primer pliegue repartía ocho segundos de atención entre un saludo, dos
tarjetas de cifra, una de membresía y un riel. Ahora **la comanda ES el pliegue**
(748 px de 992 medidos en producción), con un anillo de taza enorme y apenas
visible detrás —puro CSS— y las cifras degradadas a una línea de datos:
`CUENTA C$ 905 · TANDA 7 de 9 · NIVEL Mesa de Siempre`.

### El Perfil: el Camino de altura, de 40 px a 374

Era la pantalla más floja: tres puntos en un borde con `opacity: .5` para una
de las mecánicas centrales. La idea que lo salva ya estaba en la marca y no se
usaba: **el nivel del socio es la misma subida que la ficha del lote**, medida
en visitas en vez de en metros. Casa Abierta está en la barra, a 40 m; Reserva
de Altura arriba, a 1.340, donde crece el café que se bebe abajo.

### El Mostrador: fuera la última cifra inventada

`34%`, `31%`, `4.2`, `3.1%` eran literales presentados como el panel del dueño,
junto a referencias reales de Panera y OXXO. Ahora hay **dos clases de fila que
se distinguen a la vista**: las que la casa calcula hoy con sus datos (visitas
por socio, membresías que no renuevan, consumo del mes) y las que necesitan la
caja conectada, que no muestran un número sino **qué falta**.

### La regresión que yo mismo metí

La celda de la matriz era un `<button>` cuyo nombre accesible era la tarjeta
entera —perfil de taza incluido— **y sin un solo verbo**. Con lector de pantalla
se oía un párrafo y no se sabía que eso pedía un café. Antes decía «Pedir».
Corregido, junto con el anillo: lineal dejaba el espresso y el macchiato a un
píxel y medio; con raíz cuadrada el rango se abre donde vive la diferencia.

### Deuda medida que sigue abierta

`motion` como dependencia estática de la entrada: **~128 kB gzip bloqueantes**
contra los 34 del presupuesto. El árbitro dio el camino —volver `Casa` perezosa
y sacar el único `m.div` de `App.tsx` a CSS— y queda anotado, no hecho.

---

## 11. Iteración 7 — la línea que faltaba, y la mesa

### El fallo de una línea

`CaminoDeAltura.tsx` dividía entre 9 y el tramo entre niveles no son nueve
sellos: de Casa Abierta a Mesa de Siempre hay dos tandas (18) y de ahí a Reserva
de Altura hay tres (27). El avance salía negativo durante los primeros dos
tercios de cada nivel, `Math.max` lo aplastaba a cero, y **la senda —que es la
firma de la pieza— se quedaba clavada en el hito sin un milímetro andado**.

Verificado contra el servidor antes y después:

```
María: 2 tandas cerradas, 7 sellos, faltan 20 para la cima
   antes:  620 m   (el hito, inmóvil)
   ahora:  807 m   (26% del tramo andado)
```

Era justo lo que la app lleva siete rondas prometiendo que no hace: una figura
que no sigue al dato que dice representar.

### La Mesa Larga

Experiencias era la última pantalla de socio sin nada con autoría propia —y la
que cobra más caro, C$2,400 el tour. Vendía una silla en una mesa de doce y no
había ninguna mesa en pantalla: el cupo vivía en un chip.

Ahora la mesa se dibuja con las sillas que de verdad hay: **12 sillas con 8
tomadas** en la Mesa del Tostador, 16 y 20 en las otras dos, todas contadas por
`/api/cupos`. Las tomadas apagadas, la tuya encendiéndose al apartarla. Y si el
servidor no responde, **la mesa no se dibuja**: una mesa con sillas inventadas
sería exactamente lo que este proyecto prohíbe.

También se quitó la repetición de fotografía: el tour usaba la misma imagen que
la ficha del lote en Finca.

---

## 12. Veredicto final — Site of the Day

Séptima ronda de auditoría adversarial. El árbitro recalculó la corrección del
Camino por su cuenta, sin mirar la mía, y los nueve casos coincidieron uno a uno.

**SÍ. Site of the Day.**

| Eje | Nota |
|---|---|
| Diseño | **8/10** |
| Usabilidad | **8/10** |
| Creatividad | **8/10** |
| Contenido | **9/10** |
| **Ponderado (40/30/20/10)** | **8,1** |

> «Lo que inclina el voto no es ninguna de las cuatro notas por separado. Es que
> esta app **hace lo que dice**. Empezó con nueve caminos que perdían dinero, un
> endpoint que acuñaba saldo, un directorio de alergias abierto a internet y
> cuatro compras que anunciaban un cargo y no lo hacían. Hoy le tiré cinco
> compras simultáneas y no se dobló, le pedí sellos con mi propio token y me
> dijo que los sellos los pone la barra, y su propia vista `cuadre` vigila el
> monedero en negativo que yo mismo le provoqué en la ronda dos.»

### Las tres notas de oficio, cerradas

1. **La mesa encogía en vez de crecer.** El ancho fijo en CSS hacía que un
   `viewBox` más ancho empequeñeciera todo lo de dentro: el tour de C$2,400 se
   veía más chico que la cata de C$750. Con el alto fijo, medido en producción:
   **303 → 385 → 468 px de ancho, la silla clavada en 19,3 px en las tres.**
2. **La silla «tuya» no era la tuya:** se pintaba «la última tomada» con un `1`
   de relleno. Ahora usa la butaca que devuelve `/api/experiencia/:id/apartar`.
3. **Las sillas se llenaban de izquierda a derecha,** dejando una fila entera
   vacía: el dibujo afirmaba una disposición que el servidor nunca reportó.
   Ahora se alternan entre filas.

### Deuda declarada que sobrevive al premio

`motion` como dependencia estática de la entrada: **~128 kB gzip bloqueantes**
contra los 34 del presupuesto. Medida, anotada y con el camino escrito (volver
`Casa` perezosa y sacar el `m.div` de `App.tsx` a CSS). El árbitro la aceptó como
criterio, no como descuido.
