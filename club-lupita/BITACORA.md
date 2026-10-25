## 25-08-2026 · Desplegado

`npm run deploy` — versión `5bf455ed-d69d-4316-b48d-4b370fd04f81`.
3 archivos nuevos (`index.html`, `principal-CuLCJjM6.css`, `principal-D2wiZlPv.js`),
155 ya subidos. 335 KiB en total, 86 KiB gzip. Arranque del worker: 20 ms.

Comprobado en producción con la cuenta de muestra: las cuatro pantallas cargan
con datos reales (C$ 905, 7 de 10 sellos) y no hay más respuestas ≥400 que el
401 de `/api/yo` antes de iniciar sesión, que es el esperado.

También se corrigió el `theme-color` de `index.html`: seguía en `#FCF9F2`, el
beige del sistema retirado, sobre una app cuya cabecera ahora es verde. Pasa a
`#1D4632`.

Respaldo de la capa visual anterior, fuera del árbol de la app y durable:
`../respaldo-visual-2026-08-25/`.

---


## 25-08-2026 · Fase A+B+D — el sistema «Etiqueta» sustituye al esquema de Stitch

Tras la auditoría visual (`AUDITORIA-VISUAL.html`) y la elección de dirección
(`DIRECCIONES-VISUALES.html`, opción 2), se rehizo la capa visual entera.

**Qué manda ahora.** La app es una cosa impresa: la etiqueta de la bolsa que la
casa ya vende. Fondo avena, tarjeta de papel, y una BANDA VERDE —cabecera,
carnet y barra de pestañas son la misma— que parte la pantalla a 8,03:1. El
achiote entra como tinta de sello. La píldora queda reservada para lo que se
aprieta: el botón y el sello.

**Lo medido, antes → después:**

| | antes | después |
|---|---|---|
| tokens de color declarados | 52 (29 muertos) | 12 (0 muertos) |
| colores de fondo en pantalla | 18 | 12 |
| beiges que cubren la app | 5 · 87,5 % | 2 · 81,4 % |
| color dominante no neutro | 7,3 % | **17,7 %** (banda) |
| radios distintos | 5 (dos hacían el 96 %) | 3 + canto vivo, con oficio |
| tamaños de texto | 13 | **8** |
| alias de familia tipográfica | 4 | 2 |
| sombras | 4 tipos · 115 elementos | **0** |
| objetivos táctiles < 44 px | 59 | **0** |
| fallos de contraste | 4 | **0** |
| CSS del bundle | — | 28,7 kB · 6,7 kB gzip |

**Los ocho defectos de fase D, cerrados:** V-06 (el apagado dejó de ser una
píldora descolorida y pasó a recuadro punteado), V-07 (el icono a 1,06:1),
V-08 (chips a 42, «+» a 40, enlaces a 21), V-09 (carriles con máscara y sangre
sólo por la derecha), V-10 (los 48 px muertos de cada ficha, ahora reserva
horizontal), V-11 («Horas» pasó de fila de píldoras a contador), V-12 (la
regla de sombras se hizo verdad y el guardián la vigila), y la poda de la
escala tipográfica.

**Lo que NO se hizo:** la fase C. La fotografía sigue en 1,4 % y «Barra» sigue
con 0 fotos de 24. Eso no es código: es una sesión de fotos.

**El guardián.** `colors`, `borderRadius` y `fontSize` salieron de `extend`, así
que reemplazan la escala de fábrica: `bg-red-500`, `rounded-lg` y `text-4xl` ya
ni compilan. Se añadió la regla `sombra-prohibida` y se reescribieron cuatro.
18 reglas vivas, 11 alias cazados, cero falsos positivos.

**Una trampa que se cerró sola.** El botón primario es verde sobre claro, y
dentro del carnet —que ES la banda verde— quedaba invisible. Pasó tres veces
en la misma tarde. Ahora `Carnet` declara el contexto `EnLaBanda` y el botón se
invierte solo; no hay forma de volver a cometerlo.

**Respaldo del árbol anterior:** el scratchpad de la sesión, `respaldo-src-casa/`.

---
# Bitácora de la reconstrucción

Registro por iteración del loop. Cada entrada dice qué se cerró, qué se rompió
y qué queda abierto. Es lo que permite retomar sin releer el repositorio entero.

---

## Iteración 1 · 22 de agosto de 2026

### Cerrado

**Fase 0 — Especificación congelada.** `SPEC.md` resuelve las diez decisiones que el
prototipo tomaba dos veces. La de más peso: **la tanda son diez casillas, nueve se
ganan, la décima la pone la casa.** Es la única lectura que hace verdaderas el
`DESIGN.md` (2 filas de 5), el panel de caja (`7/9`) y cuatro de las cinco pantallas
del socio a la vez — y, de regalo, **coincide con lo que el backend ya implementa**,
así que la tanda no necesita migración.

Se declararon tres desviaciones del prototipo, cada una con su causa:
el Inicio canónico injerta el carnet de otra variante (lo exige el PRD), el primer
nivel pasa de «Amiga de la Casa» a **Gente de la Casa** (el nombre en femenino excluía
a la mitad de los socios), y se retira la tarjeta guardada del Perfil (dos pantallas
del prototipo se contradecían).

**Fase 1 — Fundación visual, en paralelo y sin destruir nada.** La app nueva vive en
`src/casa/` con su propia entrada `casa.html`. La app actual sigue intacta en `src/`
hasta que la nueva pase la puerta de calidad.

| Pieza | Estado |
|---|---|
| `tailwind.config.js` | Los 52 colores, 4 radios y 2 familias del export, copiados sin editar |
| Tipografía | Libre Caslon Text + Work Sans autoalojadas |
| Iconos | Subconjunto de Material Symbols **derivado del código**, 21 glifos, 4,9 kB |
| Kit | 15 componentes en `src/casa/componentes/`, con su página de estados |
| Build | `npm run build` verde · el bundle nuevo pesa 5,85 kB comprimido |

### Dos fallos propios, encontrados probando

1. **Tipografía en silencio.** `@fontsource-variable/work-sans` registra la familia
   como `Work Sans Variable`, no `Work Sans`. La config pedía `Work Sans`, el navegador
   caía a `system-ui` **sin avisar** y la app se veía casi bien. Se detectó comparando
   `document.fonts` contra lo declarado, no mirando la pantalla.

2. **`LOCAL_MALL` impreso en letras dentro del carnet.** Material Symbols no falla
   cuando le pedís un glifo que no está en el archivo: **imprime el nombre**. El icono
   se había quedado fuera del subconjunto. La corrección no fue añadirlo a mano sino
   cambiar el método: `scripts/iconos.mjs` lee del código qué iconos se usan, baja el
   subconjunto exacto y **falla el build** si alguno falta. Corre en `prebuild`.

### Una interacción que no es decoración

El carnet lleva `lustre`: la lámina de oro sigue al dedo o al puntero, como el carnet
de cartón cuando lo girás. Es la tesis del producto —«el carnet digital del club»—
convertida en materia. Se apaga solo con `prefers-reduced-motion` y no cuesta nada
cuando nadie lo toca.

### Abierto para la iteración 2

- [x] Recibir el inventario de componentes del equipo extractor y reconciliarlo contra el kit
- [x] `scripts/guardian-tokens.mjs`
- [ ] Fase 3: la pestaña Inicio, completa y contra la API real
- [x] Primer paso del árbitro adversarial sobre el kit

---

## Iteración 2 · 22 de agosto de 2026

### El equipo extractor

Trece agentes leyeron las 23 pantallas del prototipo por separado: **234 componentes crudos
→ 47 canónicos**, más cuatro informes de especialista (tokens, tipografía, iconografía, copy)
y dieciséis decisiones que el prototipo no permite tomar. Cinco ya estaban resueltas en
`SPEC.md`; las once nuevas se resolvieron en el §12.

### Una colisión que yo no había visto

El kit usaba `local_cafe` **para dos cosas**: la pestaña Pedir y el sello de la tanda. Un
glifo con dos significados. La resolución del equipo es mejor que la mía y se adoptó:

> **El sello es `coffee_maker`, y su estado se dice con el eje `FILL`, no cambiando de dibujo.**

Si el sello vacío fuera otro glifo, la fila dejaría de leerse como progreso. Y al liberar
`local_cafe`, la pestaña Pedir recupera su ícono. Una decisión desatasca las dos.

También cambió, contra mi propuesta anterior:

| Antes | Ahora | Por qué |
|---|---|---|
| Pestaña Club: `workspace_premium` | `military_tech` | `workspace_premium` es el sello de socia fundadora; darle también la pestaña repetía el conflicto |
| Pestaña activa: píldora verde **rellena** | píldora **tintada** al 15 % | El relleno usa el mismo verde que el botón primario y que el «+» de la Carta: en esa pantalla la barra entera parecería una llamada a la acción |
| `max-w-xl` | `max-w-lg` | Único ancho que el prototipo comparte entre familias de pantallas |
| Eyebrow a 10 px | 11 px | Canon de la escala; 10 px queda para el contador de pestaña |

### El guardián de tokens

`scripts/guardian-tokens.mjs` lee `tailwind.config.js` y **falla el build** ante:
color escrito a mano, color arbitrario `bg-[#…]`, paleta de fábrica de Tailwind, radio fuera
de escala, familia inventada, tamaño prohibido, `<img>` sin `alt`, y las siete erratas que el
prototipo trae de fábrica (`Active: scale-95` con mayúscula, `docked`, `bg-surface-low`…).

Se probó metiéndole una infracción a propósito: caza las cuatro clases y devuelve exit 1.
Con esto, «el prototipo manda» deja de ser un juicio y pasa a ser una condición del build.

Ambos guardianes corren en `prebuild`. El build sigue verde: **5,91 kB de JS y 5,92 kB de CSS,
comprimidos.**

### Fase 2, primer ladrillo

`db/009_puntos.sql`: el motor de puntos y niveles que el prototipo promete y la casa no tiene
—hoy cuenta tandas, no puntos—. Libro append-only, la escalera en tabla y no en código, la
vista `puntaje` que calcula el avance exacto (el prototipo lo dibujaba al 70 % en dos
pantallas y al 75 % en otra, a ojo), y los puntos se otorgan por *trigger*: se ganan por
existir el hecho, no porque alguien se acuerde de llamarlos. Incluye la acreditación
retroactiva, para que nadie abra la app y vea que perdió su historia.

> **Sin aplicar.** Toca datos de producción; no se corre sin decisión explícita.
> Falta el `+250` por referido: espera a que exista la tabla `referido`.

### Abierto para la iteración 3

- [x] Leer el veredicto del árbitro y cerrar sus obligados
- [x] Los siete componentes que el prototipo nunca dibujó
- [ ] Fase 3: la pestaña Inicio, completa y contra la API real

---

## Iteración 3 · 22 de agosto de 2026 · el árbitro dijo RECHAZADO

Siete lentes ciegas entre sí y un cuerpo de refutadores. El veredicto:

> «Tres defectos vivos llegan a pantalla y los dos guardianes que existen para impedirlo
> dan verde: el kit no falla por falta de gusto, falla porque su aparato de verificación
> no verifica.»

Tenía razón en los tres. Reproduje cada uno antes de tocar nada.

### 1 · El guardián tenía una zona franca de una línea

`PERMITIDO` exoneraba **la línea entera**, no el fragmento que excusa. Bastaba con
escribir al lado la sombra de la barra inferior:

```
bg-[#ff0000] rounded-3xl bg-red-500                                   → 4 infracciones
bg-[#ff0000] rounded-3xl bg-red-500 shadow-[0_-4px_12px_0_rgba(…)]    → «limpio», exit 0
```

Y `Navegacion.tsx:33` ya tenía esa sombra: esa línea admitía cualquier cosa. Ahora la
excepción tapa exactamente lo que excusa. Al arreglarlo, el guardián se delató a sí
mismo —tapar el `rgba` de adentro dejaba `shadow-[0_-4px_12px_0_    ]`, que sigue siendo
un valor arbitrario—, así que la excepción pasó a cubrir la clase completa.

### 2 · El detector de iconos falló contra su único caso conocido

`local_fire_department` no estaba en la fuente y el script decía «23 en uso, todos
presentes». La causa era un espacio: `Base.tsx` lo escribe como **valor por defecto de
parámetro** —`icono = 'local_fire_department'`— y los tres patrones exigían el nombre
pegado al signo. El script se había escrito para cazar exactamente esta clase de fallo.

Ahora hay un cuarto patrón deliberadamente ancho —cualquier cadena con forma de nombre
de Material Symbols— con lista de excepciones a mano. Preferimos un falso positivo
ruidoso a un glifo impreso en letras dentro del carnet.

### 3 · La Hoja prometía cuatro cosas en un comentario y no hacía ninguna

Decía «`dialog` nativo con retroceso por Escape» y entregaba un `<div role="dialog">`:
sin Escape, sin trampa de foco, sin bloqueo del fondo, y con un botón de cerrar a
pantalla completa como primer elemento tabulable. Ahora es un `<dialog>` de verdad, con
`showModal()`, y está **verificado en navegador**: abre, la etiqueta coincide con el
encabezado visible, el fondo queda bloqueado, el foco entra y sigue dentro tras doce
tabulaciones, Escape cierra y el fondo se libera.

### Y algo peor que los tres: el oro no pasa AA

Recalculé todos los contrastes con luminancia relativa. Las dos únicas cifras que la
especificación publicaba sobre sí misma estaban infladas —**7,4:1 era 6,83:1** y
**7,1:1 era 6,03:1**—, y una se leía impresa en la página de kit. Pero el hallazgo de
fondo es otro:

| Pareja | Real | |
|---|---|---|
| oro-miel sobre porcelana · eyebrow a 11 px | 2,74:1 | **falla** |
| oro-miel sobre blanco · «te faltan 2», «Barista» | 3,04:1 | **falla** |
| oro-miel sobre el aviso oro · ícono | 2,57:1 | **falla** |
| oro-miel sobre el sello ganado · ícono | 2,67:1 | **falla** |
| casilla vacía en `outline-variant` | 1,70:1 | **falla** |
| buscador sin filete | 1,05:1 | **invisible** |

**El oro no es un color de texto sobre claro.** Es relleno, filete y acreditación. Sobre
claro habla el café tostado (9,10:1); sobre espresso el oro sí habla (5,46:1) y se queda,
por la única puerta que hay: `.oro-en-tinta`. El guardián prohíbe `text-oro-miel` en
cualquier otro sitio, y verificado en navegador quedan tres usos, los tres sobre espresso.

> La casa ya lo sabía. El sistema que ahora se retira lo tenía escrito en sus tokens:
> «el oro lámina rinde 2,09:1 sobre papel y queda PROHIBIDO como texto». El prototipo de
> Stitch no lo sabía, y esta reconstrucción estuvo a punto de heredarlo entero.

### Lo que se construyó

Nueve componentes nuevos. Los cinco estados que **ninguna de las 23 pantallas del
prototipo dibuja** —vacío, error de campo, esqueleto, aviso flotante, botón ocupado— con
sus quince vacíos y siete errores ya redactados, en una sola voz y en un solo archivo:
un vacío que se escribe en la pantalla donde se usa termina siendo quince voces distintas.

Y las cuatro piezas del Inicio canónico que faltaban, entre ellas los **accesos rápidos**,
que son el motivo declarado por el que se eligió esa variante.

### Dos fallos más, encontrados de paso

- La ficha de producto apuntaba a `/menu/latte-logo-mesa-480.webp`, que está en otra
  carpeta: pintaba el ícono de imagen rota encima de la carta. Ahora una foto que falla
  degrada sola al marcador de la casa, y el kit demuestra los dos casos.
- La página de kit afirmaba «Quince componentes, todos sus estados» sobre un árbol que
  exportaba diecinueve y no demostraba un solo estado vacío. Ahora dice cuántos hay y
  **cuáles faltan**.

### Abierto para la iteración 4

- [x] Segunda ronda del árbitro sobre el kit corregido
- [ ] Fase 3: la pestaña Inicio, completa y contra la API real
- [ ] Los cuatro componentes que llegan con su pantalla

---

## Iteración 4 · el árbitro no llegó a fallar

La segunda ronda se cortó a medias: **el límite semanal de uso** tumbó al auditor de
ingeniería, a los cinco refutadores y al árbitro. Seis de doce agentes.

Eso deja el resultado con una trampa que hay que decir en voz alta: el informe trae
«117 sobrevivientes, 0 derribados». **No sobrevivieron a nada.** Nadie los atacó. Los
seis lentes que sí terminaron dijeron RECHAZA, y sus hallazgos entran como sospecha, no
como sentencia. Los verifiqué uno a uno antes de tocar nada.

### Cuatro reglas del guardián llevaban semanas muertas

Escribí una sonda con doce infracciones, una por regla. **El guardián cazó nueve.**

| Regla | Por qué estaba muerta |
|---|---|
| `oro-como-texto` | La expresión tenía **dos bytes `0x08`** donde debía ir ``. La escribí a través de un heredoc y el shell se comió las barras. Nunca ejecutó |
| `imagen-sin-alt` | El bucle iba línea a línea y **todos los `<img>` reales del kit son JSX de seis líneas** |
| `importante-en-utilidad` | Exigía `className="…"` literal, y el kit escribe `className={[…].join(' ')}` |
| `token-inexistente` | Traía `u.endsWith(c)`, que exoneraba cualquier alias terminado en un nombre de token: `bg-brand-espresso` acaba en `espresso` y entraba tranquilo |

Las cuatro se arreglaron —las reglas corren ahora sobre el archivo completo y la
comprobación cruzada exige igualdad exacta— pero el arreglo de fondo es otro:

> **`scripts/pruebas-guardian.mjs`.** Cada regla trae su propia sonda y la prueba exige
> que dispare. Corre antes que el guardián en `npm run guardian`. Si falla, el guardián
> no es de fiar y da igual lo que diga después.

Una regla que nunca se probó no es una regla: es un comentario.

### El detector de iconos: se cerró la clase entera, no el caso

Seguía ciego a los nombres de una sola palabra —`nombre={'sync'}`, `nombre={abierto ?
'close' : 'menu'}`— porque el patrón ancho exigía al menos un guión bajo. Al ensancharlo
más, produjo diez falsos positivos: `kit`, `root`, `rounded`, `salto`. Analizar
léxicamente lo que no es léxico nunca cierra.

El arreglo no es un regex mejor: es **el tipo**. `scripts/iconos.mjs` genera ahora
`iconos.gen.ts` con la unión literal de los 32 glifos que hay en la fuente, y `build`
corre `tsc -b` **sin `--noCheck`**. Verificado:

```
src/casa/Sonda.tsx(2,31): error TS2322: Type '"cloce"' is not assignable to type 'NombreIcono'.
src/casa/Sonda.tsx(3,31): error TS2322: Type '"sync"'  is not assignable to type 'NombreIcono'.
```

Un glifo inventado dejó de ser un hallazgo de auditoría y pasó a ser un error de
compilación, se escriba como se escriba.

### La barra de progreso no pasaba, y encima estaba del color equivocado

Oro miel sobre su carril: **2,35:1**. La 1.4.11 pide 3,0 para objetos gráficos, y la
barra es lo único que se lee de un vistazo en la tanda y en el reto. Peor: yo la había
pintado de oro y **las cuatro variantes del Inicio del prototipo la pintan de verde**.
No cabía en ninguna de las tres causas del §11 — el prototipo no se contradice ahí.

`Progreso` toma ahora `tono`: `fidelidad` en café tostado (7,80:1) para la tanda y el
nivel, `accion` en verde hoja (5,85:1) para el reto. Y el carril lleva filete, porque a
1,29:1 contra la tarjeta blanca no se veía dónde terminaba la barra.

### Copy

El guardián tiene dos reglas nuevas y las dos cazaron algo real en el acto: la página de
kit imprimía **«Casa Lupita»**, el nombre que el §2 retira, y un KPI se llamaba **«Attach
de miembros»**, que el §12.8 mata por su nombre. Ahora dice «Comen en sus visitas ·
De cada 100 visitas de socio, 31 llevan plato».

Y una corrección a mí mismo: el §10 fijaba el punto como separador de millares.
Nicaragua usa **coma** —`Intl.NumberFormat('es-NI')` lo confirma— así que el prototipo
tenía razón y el documento estaba mal. Corregido, con la regla de formato completa.

### Abierto para la iteración 5

- [x] Cribar a mano los 36 hallazgos graves de la ronda 2
- [ ] Tercera ronda del árbitro **cuando el límite semanal se restablezca**
- [ ] Fase 3: la pestaña Inicio, completa y contra la API real

---

## Iteración 5 · los graves, a mano

Sin refutadores —el límite semanal sigue puesto—, tomé los 36 hallazgos graves y los
verifiqué uno a uno en el navegador. Once eran reales. Éstos son los que importan.

### El `aria-live` que yo creí haber arreglado

Tres lentes distintos señalaron lo mismo y las tres tenían razón. En la iteración 3 moví
el `aria-live` a un `<span>` interior, pero **el bloque entero seguía dentro de
`{visible && …}`**: la región nacía ya con el mensaje adentro.

> Una región viva sólo notifica los cambios que ocurren **mientras existe**. Si se monta
> junto con su contenido, el lector la descubre poblada y no anuncia nada.

Ahora vive siempre en el árbol, vacía, y sólo cambia de contenido. Verificado: antes del
disparo la región existe con `""`; después contiene «Tu capuchino va para la barra.»

### Ningún botón declaraba su tipo

35 botones, cero con `type`. Dentro de un formulario, **todos habrían enviado**. Es de
esas cosas que no rompen nada hasta la primera pantalla con formulario —que es la
siguiente, el onboarding— y entonces rompen todo. Ahora los 35 lo declaran.

### El marcador de foto rota reintroducía el error que la desviación 8 acababa de retirar

`text-outline-variant` sobre `bg-surface-container`: **1,47:1**. Peor que el 1,70:1 que
habíamos corregido dos iteraciones antes. Ahora es `on-surface-variant` sobre
`surface-container-high` y además **dice «Sin foto»**: un ícono solo no informa de nada.

### Los avisos gritaban

Tres oraciones enteras en versalitas de 11 px. Las versalitas son para etiquetas de una
o dos palabras. La peor de las tres era **«ALERGIA: NUECES»** —información clínica, en el
peor formato posible para leerla rápido—. Ahora los avisos van en caja baja a 14 px.

### El único texto con género de todo el sistema

«Dejá tu nombre y **sos la primera** en enterarte» contradecía las desviaciones 2 y 5,
que existen justamente para eso. Ahora: «te escribimos primero si alguien suelta uno».

### Quince maneras de decir que no hay nada, ninguna de decir que salió bien

Los vacíos informaban y abandonaban: le decían al socio que no hay nada y lo dejaban en
un callejón. Once de los quince llevan ahora **su salida ya redactada** —«Ver la carta»,
«Anotarme en la lista», «Avisame cuando llegue»— que la pantalla ata con `conSalida()`.

Y el sistema no tenía **una sola línea de confirmación**. Nueve escritas, todas en
pasado y en la voz de la casa: «Sello puesto. Te faltan 2.», «Quedaron C$ 1,100 en tu
cuenta, C$ 100 los puso la casa.», «Listo, ya lo sabe la barra.» Nunca «¡Éxito!».

### El canon de iconos no tenía guardián

El §4 decidía qué glifo gana para cada concepto, y el kit ya lo rompía en tres puntos
—entre ellos `error_outline` para la alergia, cuando el canon dice `warning`—. Regla
número quince: `glifo-retirado`, con los catorce glifos que el §4 mata.

### Estado de los instrumentos

```
pruebas del guardián: 15 reglas vivas, 4 alias cazados, cero falsos positivos
iconos: 31 en uso, todos presentes
guardián: limpio · 52 colores, 8 radios y 4 familias
tsc -b: sin errores (ya sin --noCheck)
```

### Abierto para la iteración 6

- [x] Fase 3: la pestaña Inicio, completa y contra la API real
- [x] Tercera ronda del árbitro lanzada
- [ ] Los 71 hallazgos medios y menores de la ronda 2, todavía sin cribar
- [ ] El carnet «objeto» del §12.6, que llega con la pantalla de Mesa Fundadora

---

## Iteración 6 · Fase 3 — la app habla con la casa

El armazón está de pie y el Inicio trae datos de verdad.

```
Buenas, María · MESA FUNDADORA · SOCIA #037
Tu cuenta de casa   C$ 905
Bolsa del mes lista para retirar
Tu tanda            7 de 9 · «Te faltan 2 para tu bebida de cortesía.»
```

Todo eso sale de `/api/yo` y `/api/cupos` **en producción**, con la cuenta de muestra. No
hay ni un archivo de ejemplo: el saldo es el saldo, los sellos son los sellos y los cupos
del carril son los que quedan de verdad.

### Lo que se construyó

| | |
|---|---|
| `src/casa/datos.tsx` | El cliente y el estado. Contratos tipados con la forma exacta que devuelve el worker |
| `src/casa/App.tsx` | Armazón, enrutador de cinco pestañas y las pantallas pendientes declaradas |
| `src/casa/pantallas/Inicio.tsx` | La canónica `inicio_club_lupita_2`, con sus seis módulos |
| `src/casa/pantallas/Umbral.tsx` | La puerta: foto a sangre, tarjeta blanca flotante, cuenta de muestra |
| `src/casa/pantallas/Kit.tsx` | El kit, movido fuera del armazón y accesible en `/kit` |

### La sesión no era una cookie

Dos vueltas perdidas: monté el cliente con `credentials: 'include'` y reescribí el
dominio de la cookie en el proxy, y el `/yo` seguía devolviendo 401 después de un
`/auth/entrar` con 200. La sesión de esta casa es **un token firmado en
`Authorization: Bearer`** —el teléfono va dentro del token y el servidor no guarda
estado—. Se guarda en `entrar()`, no en la pantalla: que quien llame tenga que acordarse
de guardarlo sería un 401 mudo esperando a pasar.

La reescritura de cookies del proxy salió: no arreglaba nada y habría confundido al
siguiente que lo leyera.

### Lo que la pantalla NO enseña, y por qué

El prototipo pone «620 pts para Reserva Lupita» en la cabecera. **Esa cifra hoy no existe
en ninguna parte**: el motor de puntos es `db/009_puntos.sql`, sin aplicar. Estimarla
desde los cuarenta últimos movimientos daría un número inventado con aspecto de dato,
que es justo lo que el §10 prohíbe.

Así que la cabecera enseña lo único demostrable —`MESA FUNDADORA · SOCIA #037`— y
`nivelDe()` devuelve `medido: false`. Cuando la migración esté aplicada y `/api/yo`
mande `puntaje`, la misma función devuelve `medido: true` y la cabecera cambia sola.

Lo mismo con el reto de la semana: es estructura permanente por el §12.7, pero no hay
tabla `reto` ni endpoint. El módulo se queda y **dice la verdad** en vez de enseñar un
reto que nadie puede cumplir.

Y las cuatro pestañas que faltan no llevan a una pantalla en blanco —que se lee como un
fallo— sino a una que explica qué falta y qué se puede hacer mientras tanto:

> «Los setenta y siete platos ya están cargados con su precio; falta el carrito y la cola
> de la barra. Mientras tanto pedí en la barra, que el sello se pone igual.»

### Abierto para la iteración 7

- [x] El veredicto de la tercera ronda del árbitro

---

## Iteración 7 · tercera ronda — RECHAZADO, y con razón

Doce agentes, ninguno caído. El veredicto:

> «La interacción firmada del producto —el lustre del carnet— hunde a 2,47:1 el texto que
> anuncia el dinero del socio, y el guardián que da fe de todo esto firma "limpio" ante
> diez evasiones que reproduje en un minuto, incluida una clase que ni siquiera compila.»

De las nueve correcciones que declaré, **siete eran reales** y el árbitro las verificó una
por una. Las trece cifras del §13 las recalculó con luminancia relativa y **dan exactas**.
Eso hace más grave lo que faltaba.

### El lustre medía el carnet apagado

La tabla de contraste era honesta y estaba incompleta: medía la cara del carnet **sin la
lámina encendida**. Con ella, el degradado de oro es el fondo real del texto:

| | Apagado | Encendido |
|---|---|---|
| `.oro-en-tinta` · el eyebrow del carnet | 5,46:1 | **2,47:1** |
| `porcelana/70` · el desglose del saldo | 7,92:1 | **4,25:1** |

Y no hay alfa que lo salve: al 12 % el oro sigue en 4,46:1. Peor: sólo se apagaba al salir
el puntero, así que en escritorio bastaba dejar el ratón encima; y en teléfono, un
desplazamiento que empiece sobre el carnet lo enciende justo mientras se arrastra.

**La luz pasó al filete.** La lámina de un carnet de cartón está en el canto, no en la
cara. Confinarla ahí con una máscara de dos capas es más fiel al objeto y seguro por
construcción: ningún texto tiene el degradado debajo. Verificado con la lámina encendida —
el fondo de la cara no cambia ni un valor.

### Ocho de diez evasiones del guardián pasaban

Un auditor que no escribió las reglas escribió diez sondas. Reproduje las diez: **ocho
pasaron**. La peor, `bg-marfil text-tinta border-lamina` — que ni siquiera compila en
Tailwind y deja el elemento **sin fondo**— y el guardián imprimía «limpio · 15 reglas
vivas».

| Evasión | Por qué pasaba |
|---|---|
| `bg-marfil` | La comprobación cruzada exigía un guión: cerraba `bg-brand-espresso` y dejaba abierto el alias de una palabra, que es el más fácil de teclear |
| `rounded-t-3xl` | La regla no contemplaba el lado |
| `text-[8px]`, `text-[14px]`, `text-[48px]` | Sólo se prohibían 9, 12 y 13 |
| `Casa lupita`, `CASA LUPITA` | Al regex le faltaba la `i` |
| `#f00` | La regla exigía seis dígitos |
| `rgb(34,30,23)`, `hsl(…)` | Nadie miraba los colores CSS literales |
| `bg-white text-black` | No estaban en ninguna lista |
| `<Icono nombre="stars" />` | Retirado por el §4 y **era el `porDefecto` del aviso oro** |

Diecisiete reglas ahora, y **las diez sondas ajenas viven dentro de la prueba**. Ésa es la
lección: una sonda escrita por quien escribió la regla sólo prueba lo que la regla ya
sabía. Además el guardián revisa `tailwind.config.js` y `casa.html`, donde el nombre
retirado seguía vivo y era invisible.

De paso, el árbitro encontró que **el fixture «limpio» de la propia prueba escribía
`C$ 1.240` con punto** — el archivo que certifica el sistema codificaba la errata que el
sistema prohíbe.

### Y lo que nadie había visto

- **La décima casilla nunca cambiaba de estado.** Con nueve sellos el texto decía «la
  tanda está cerrada» y el círculo del premio se dibujaba **idéntico** a cuando había
  cero. El momento por el que existe el programa entero no tenía representación. Ahora se
  llena de oro con el glifo del regalo.
- **`viewport-fit=cover` sin franja segura en tres de las cuatro superficies fijas.** Yo
  conocía el mecanismo —lo apliqué a la barra inferior— y lo olvidé en las dos cabeceras,
  en la hoja y en el umbral. En la hoja es peor que estético: el botón de confirmar
  aterrizaba en la franja del indicador de inicio, **que además cancela la hoja al
  tocarla**.
- **El enlace de salto estaba muerto en dos rutas**, y ningún `<main>` era enfocable.
- **`CONFIRMACIONES` tenía cero importadores**: el kit reescribía a mano, carácter por
  carácter, lo que ya devolvía `pedidoHecho('Capuchino')`.
- **El kit se contradecía sobre la insignia**: sobre la foto en la ficha de producto,
  debajo en el carril. Dos soluciones opuestas al mismo problema en el mismo archivo.

### Abierto para la iteración 8

- [x] Cuarta ronda del árbitro, lanzada sobre la app viva
- [x] Fase 3, pestaña Pedir: la carta con carrito
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**

---

## Iteración 8 · la pestaña Pedir, y el cobro es de verdad

La carta ya funciona: **73 platos con su precio**, cuatro momentos, buscador que ignora
tildes, rejilla de dos columnas y la barra flotante del pedido.

```
Barra    24 platos     Bistró   27
Brunch   14            Sobremesa 8
buscar «cafe» → 8 resultados, incluidos los que llevan «café» con tilde
3 artículos · C$ 250   ·   contador «3» en la pestaña Pedir
```

### El pedido se arma acá y se cobra allá

`src/casa/pedido.tsx` guarda el pedido en `sessionStorage` y no en `localStorage`: un
pedido a medio armar de hace tres días no es un pedido, es basura con precio viejo. Y
lleva **referencia de idempotencia**, que se renueva al vaciar — si se heredara, el
servidor tomaría el pedido siguiente por un reintento del anterior y no cobraría.

El cobro sí es real: `/api/cuenta/cobrar` descuenta de la Cuenta de Casa con la misma
idempotencia. Lo que **no** existe es la cola de la barra, así que la pantalla no promete
que alguien lo esté preparando:

> «Al pagar se descuenta de tu cuenta y el pedido queda anotado a tu nombre. Pasá a la
> barra a recogerlo: todavía no le llega solo al barista.»

Verificado hasta el botón de pagar, **sin apretarlo**: cobrar escribe en datos de
producción y eso necesita visto bueno.

### El tipo de iconos cazó su primera pieza en producción

`nombre="remove"` no estaba en el subconjunto de la fuente. En la ronda 2 eso habría sido
un glifo impreso en letras dentro del pedido; ahora fue **un error de compilación** antes
de que nadie mirara la pantalla.

### «SIN FOTO», ocho veces en una pantalla

Sólo 32 de los 73 platos tienen fotografía, así que media rejilla eran marcadores que
repetían «Sin foto». Eso le cuenta al socio **un problema nuestro que no es suyo**.

Son dos ausencias distintas y ahora tienen dos tratamientos:

| | |
|---|---|
| La foto **no cargó** | Es un fallo y hay que decirlo, o el navegador pinta su ícono de imagen rota encima de la carta |
| El plato **todavía no se fotografió** | No es un fallo: es el estado normal de 41 platos. Va la marca en tono bajo, como en cualquier carta impresa |

### Abierto para la iteración 9

- [x] El veredicto de la cuarta ronda

---

## Iteración 9 · cuarta ronda — tres bloqueantes, los tres donde se mueve dinero

> «La única puerta que abre la app es invisible, el pedido puede cobrarse dos veces y el
> servidor acepta el precio que le dicte el cliente.»

Los tres eran ciertos. Los siete arreglos de la ronda 3 el árbitro los verificó uno por
uno y los dio por buenos; las trece cifras del §13 las recalculó y **dan exactas**.

### 1 · La puerta era invisible

El único botón que de verdad entra —la cuenta de muestra— iba en `tono="tenue"`, que usa
`on-surface-variant`: **un gris para superficie clara**, puesto sobre una foto velada.
Peor: la foto traía **tipografía quemada** —«EL INICIO PERFECTO PARA UN GRAN DIA»— justo
en esa franja. Se cruzaban dos frases y no se leía ninguna.

Y «Unite al club» hacía `setError(null)` y en la línea siguiente ponía un error: **la
llamada a la acción principal no podía tener éxito nunca.**

Tres cosas cambiaron:

- Foto nueva —la terraza al atardecer, sin texto quemado— con degradado en vez de velo
  plano, para que el titular tenga fondo oscuro y el cielo no lo pierda.
- **Todo lo interactivo baja a la tarjeta blanca.** Sobre una fotografía arbitraria no
  existe cota inferior de contraste; sobre la tarjeta el fondo se conoce. Verificado:
  porcelana sobre verde hoja, 6,83:1.
- La entrada que funciona va primero. El formulario de WhatsApp se queda, **dice antes de
  que nadie escriba** que se conecta en la próxima entrega, y su botón está deshabilitado
  con la razón a la vista. Un botón que siempre falla no es un botón.

### 2 · El pedido podía cobrarse dos veces

Las líneas se guardaban en `sessionStorage`; la referencia que las protege se generaba en
**cada montaje**. Un pedido y su marca de idempotencia son el mismo objeto: si uno
sobrevive a la recarga y el otro no, la protección dura hasta el primer refresco — que es
exactamente lo que hace cualquiera cuando se le pierde la respuesta.

Ahora se guardan juntos. Verificado: la referencia es la misma antes y después de recargar.

### 3 · El precio lo ponía el cliente

`/api/cuenta/cobrar` tomaba el importe del cuerpo con una única validación —entero y
positivo— mientras el teléfono salía del token firmado. Cualquiera podía pagar su pedido
por un córdoba y el asiento quedaba escrito en producción con el concepto correcto.

El worker ahora recibe **líneas** y las valora con su propia copia de la carta; el
concepto también lo escribe él. `monto` sólo lo admite el rol `casa`, que es la caja.

> El worker **no está desplegado**. Hasta que lo esté, `COBRO_SEGURO_DESPLEGADO` es
> `false` y el botón de pagar está deshabilitado **con su razón en pantalla**, no
> escondido. Es una constante y un despliegue.

### Dos afirmaciones exactamente invertidas

El árbitro encontró el mismo defecto que hundió la ronda 2, mudado de las cifras de
contraste a los recuentos:

| Lo que decía el comentario | Lo que dice el recuento |
|---|---|
| «`text-porcelana` en nueve pantallas» | En **una**. `on-primary-container` en 12 |
| «`max-w-lg` es el único ancho compartido» | **`max-w-md` en 18 usos**, y la canónica del Inicio lo usa |

Los dos corregidos, y el ancho de la app **cambió a `max-w-md`**. Porcelana se queda,
pero por accesibilidad —4,43:1 no llega a AA— y ahora está en el §11 como desviación 9.

Y el SPEC tiene una regla nueva:

> **Todo número que aparezca en un comentario, en el documento o en la interfaz o se
> deriva de un script, o se acompaña del comando que lo reproduce, o no se escribe.**

### Copy que decía lo que no era

- «Retirás en barra en 6 min» salía del **chip de filtro**: con un espresso en la bolsa,
  tocar «Bistró» prometía 22 minutos. Ahora sale del pedido.
- La confirmación decía «va para la barra», justo lo contrario de lo que la misma hoja
  acababa de explicar. Ahora dice cuánto se cobró y con cuánto queda la cuenta, y lo dice
  con **la respuesta del servidor**, no con lo que la pantalla creía.
- «Se cayó la señal. Lo que hiciste está guardado acá» aparecía al fallar la **lectura**
  inicial: no hay cola en ninguna parte y el socio no había hecho nada. Dos afirmaciones
  falsas en una frase.
- «Esta semana no hay reto. **Volvé el lunes**» — el lunes tampoco lo habrá, porque no
  hay tabla. Ahora hay dos vacíos distintos: no hay reto esta semana, y el reto todavía
  no existe.

### Las fotos del carril enseñaban otro producto

«Reserva de Cosecha 2026» —una bolsa de café— era un plato de salsa roja con
microvegetales, y «Mesa del Tostador» —una cata— un bowl de pollo. Los elegí por nombre
de archivo sin mirarlos.

### Abierto para la iteración 10

- [ ] Quinta ronda del árbitro
- [ ] Desplegar el worker con el cobro por líneas, y poner `COBRO_SEGURO_DESPLEGADO` en `true`
- [ ] `wrangler.jsonc` sirve `index.html`: **la app nueva todavía no es la que se publica**
- [ ] Fase 3: Tienda, Club y Perfil
- [ ] Fase 3: Tienda, Club y Perfil
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**
- [ ] Fase 3, pestaña Pedir: la carta con carrito, contra los 77 platos ya cargados
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**
- [ ] Los 71 hallazgos medios y menores de la ronda 2

---

## Iteración 10 — Perfil, y la app nueva sale a la calle

### Perfil, con los datos de la casa

`/perfil` ya no es una pantalla que se disculpa. Sale entera de `/api/yo`: el nombre, el
número de socia, la fecha de alta, la bebida de siempre, las alergias, el cumpleaños y
los movimientos de la cuenta. Contra producción enseña a **María, #037 de 100, en la casa
desde abril de 2026**, con ocho asientos reales.

Dos cosas del prototipo **no** están, y las dos con causa escrita:

| Lo que pinta el prototipo | Qué se hizo | Causa |
|---|---|---|
| «Monedero · Visa ····4412» | Se sustituye por «En caja, con efectivo o con tarjeta» | (b) el propio prototipo se contradice: su pantalla de Monedero dice que se recarga en caja |
| Barra de nivel con cifra | Se dice qué falta, sin barra | (a)+(b) sin `009_puntos.sql` no hay puntos, y una barra sin cifra detrás es el número decorativo que el §10 prohíbe |

**El tipo volvió a cazar dos iconos.** `cake` y `share` no estaban en el subconjunto, y
`tsc -b` lo dijo antes que el navegador:

```
src/casa/pantallas/Perfil.tsx(138,24): error TS2322: Type '"share"' is not assignable to type 'NombreIcono | undefined'.
src/casa/pantallas/Perfil.tsx(160,15): error TS2322: Type '"cake"' is not assignable to type 'NombreIcono'.
```

Antes eso se imprimía en letras dentro de la pantalla. Subconjunto regenerado: **33
glifos · 6,8 kB**. Los 13 iconos de la pantalla miden cuadrado en el navegador —si la
fuente cayera, `account_balance_wallet` mediría cientos de píxeles de ancho.

Contraste de la pantalla entera, compositando alfa y subiendo por la cadena de
ancestros: **cero fallos** contra el mínimo que le toca a cada tamaño y peso.

### La app nueva es la que se publica

Era el punto abierto más incómodo de la iteración 9: todo esto se construía en
`casa.html` mientras la raíz seguía sirviendo la app anterior.

- `casa.html` → **`index.html`**. Es la que sirve el worker en la raíz y la que recibe el
  404 de la SPA.
- La app anterior → **`legado.html`**, alcanzable en `/legado`. Se sigue construyendo por
  una sola razón: si algo sale mal, está ahí sin volver a desplegar. Cuando la nueva
  lleve una temporada en pie se borra, y con ella `src/app`, `src/components`,
  `src/pantallas`, `src/styles` y `src/lib`.
- El guardián de tokens revisa ahora `index.html`, no `casa.html`.

Comprobado contra producción:

```
curl -s https://club-lupita.el-molino.workers.dev/       → <title>Club Lupita — La Bella Lupita</title>
curl -s https://club-lupita.el-molino.workers.dev/perfil → mismo título (la SPA nueva recoge el 404)
curl -sL https://club-lupita.el-molino.workers.dev/legado → «… Bistró Café» (la anterior, intacta)
```

Las seis rutas responden en producción: `/`, `/pedir`, `/tienda`, `/club`, `/perfil` y
una inventada, que cae en «Esa puerta no da a ningún lado».

### El precio ya lo pone el servidor

El worker con cobro por líneas **está desplegado**. La sonda que lo prueba, contra
producción y con una sesión de muestra:

```
POST /api/cuenta/cobrar  {"monto":1,"concepto":"sonda","ref":"sonda-precio-cliente"}
→ 422  {"error":"El pedido se cobra por líneas, no por monto. Actualizá la app."}
```

Con eso, `COBRO_SEGURO_DESPLEGADO` **desaparece** —era una constante y un despliegue, y
el despliegue ya ocurrió—. Con él se va el aviso de «el pago se abre cuando…», que a
partir de ahora sería mentira. El botón de pagar queda habilitado: con un espresso en la
bolsa, `disabled: false` y total C$ 80.

> **El camino feliz no se ha ejecutado nunca.** Apretar ese botón cobra de verdad contra
> la cuenta de muestra —C$ 80 el artículo más barato de la carta— y eso es una compra:
> hace falta el visto bueno. La idempotencia por `ref` está puesta y sobrevive a la
> recarga desde la iteración 9, pero **medida no está**.

### Abierto para la iteración 11

- [ ] Quinta ronda del árbitro, ya sobre la app publicada
- [ ] Ejecutar el camino feliz del cobro **una vez** — necesita visto bueno: cobra C$ 80
- [ ] Fase 3: Tienda y Club (Perfil hecho)
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**
- [ ] Los 71 hallazgos medios y menores de la ronda 2
- [ ] Borrar `legado.html` y el `src/` anterior cuando la nueva lleve rodaje

---

## Iteración 11 — Tienda, Club, y dos bugs de fondo que salieron al construirlas

Las cinco pestañas existen. `PENDIENTES` y el componente `Pendiente` se borraron de
`App.tsx`: ya no hay ninguna pantalla que se disculpe por no existir.

### El catálogo no estaba en ninguna parte

Al abrir Tienda y Club apareció el agujero: la base guarda `experiencia.precio`,
`experiencia.cuando`, `experiencia.cupos` y `reserva_cosecha.precio`, y **la API no los
publicaba**. `/api/cupos` devolvía cuántos lugares quedan, pero no a qué precio ni qué día.

Las pantallas habrían tenido que llevar C$ 890, C$ 750, C$ 850 y C$ 2.400 escritos a
mano en el cliente. Un precio escrito a mano se separa del que cobra la caja en cuanto
alguien toca el `seed`, y entonces la pantalla promete lo que el cobro no cumple. Es el
mismo defecto que dejar que el cliente ponga el monto, con un rodeo más largo.

**`GET /api/catalogo`**, abierto, con los precios de la base:

```
curl -s https://club-lupita.el-molino.workers.dev/api/catalogo
```

```
mesa-tostador | Mesa del Tostador                     | C$   750 |  4/12 | 2026-09-12 18:00
cacao         | Cata y maridaje con cacao nicaragüense| C$   850 | 16/16 | 2026-09-27 16:00
finca         | Tour a la finca en Matagalpa          | C$ 2.400 | 20/20 | 2026-10-04 05:00
bolsa    {"precio":89000,"quedan":34,"total":150,"generacion":6}
membresia{"cuota":95000,"total":100}
```

`CUOTA_MENSUAL` pasó a ser constante de módulo: la cobra `/api/membresia/apartar` y la
publica `/api/catalogo`, de manera que la pantalla no puede prometer una cuota distinta
de la que se carga.

> **Las 34 bolsas de 150 del prototipo son exactas.** Lo que no cuadra es la cuota: el
> prototipo y el §12.1 dicen **C$ 400/mes**; el worker cobra **C$ 950**. La pantalla
> enseña la del servidor —entre prometer una y cargar otra, manda la que se cobra— y la
> discrepancia queda abierta como **decisión de negocio**, en el §11 como desviación 11.

### El beneficio del mes se apagaba para siempre

`/api/yo` calculaba los topes así:

```sql
SELECT clase, max(ventana)::text FROM beneficio_uso b … WHERE m.socio_id = $1 GROUP BY clase
```

Sin filtro de ventana. `ventana` es una columna generada —día para la bebida, mes para la
bolsa, hora de Managua— así que `max(ventana)` devuelve **la última vez en la historia**.
Una bolsa retirada en julio dejaba `bolsaDelMes` con valor para siempre, y el beneficio
no volvía a aparecer nunca. La consulta ahora compara contra la ventana **abierta**,
repitiendo el mismo `CASE` con el que la base genera la columna: calcular la ventana de
dos maneras distintas es la forma larga de volver a tener el mismo error.

### El guardián frenó dos cosas mías, con razón

```
[glifo-retirado] «chair»  → canónico `event_seat`        (SPEC §4)
[glifo-retirado] «stars»  → canónico `workspace_premium` (SPEC §4)
[importante-en-utilidad] «!min-h-» «!px-4» «!py-1» pisan el componente
```

El `!important` era peor de lo que parecía: iba a bajar el botón de la fila a **36 px de
alto**, por debajo del mínimo táctil. Se resolvió como pedía la regla —«si hay que
pisarlo, el componente necesita una prop»—: `Boton` tiene ahora `compacto`, que recorta
el aire horizontal y **deja `min-h-[44px]` intacto**.

Y el tipo volvió a cazar cinco iconos que no estaban en la fuente —`bakery_dining`,
`chair`, `lock`, `stars`, `info`— antes de que se imprimieran en letras. Subconjunto
final: **36 glifos · 7,6 kB**.

### Medido en las pantallas nuevas

| | Tienda | Club |
|---|---|---|
| Fallos de contraste AA | 0 | 0 |
| Desbordes horizontales | 0 | 0 |
| Glifos sin dibujar | 0 | 0 |
| Objetivos táctiles < 44 px | 0 | 0 |

El contraste se mide compositando alfa y subiendo por la cadena de ancestros, no a ojo.

Paquete: **70,05 kB de JS (19,34 kB gzip)** y 30,23 kB de CSS para las cinco pestañas.

### Lo que hace cada pantalla, de verdad

- **Tienda** — aparta una bolsa numerada contra la Cuenta de Casa. El número lo elige el
  servidor con `FOR UPDATE SKIP LOCKED`, no la app. Los encargos grandes salen a WhatsApp
  con el mensaje ya escrito, porque así se cotizan.
- **Club** — toma una de las cien plazas, canjea la bolsa del mes y el café del día, y
  aparta butaca en las tres experiencias. Los otros tres beneficios van **escritos y sin
  botón**: los aplica quien atiende, y un botón que no hace nada es peor que ninguno.

### Abierto para la iteración 12

- [ ] **Resolver la cuota: C$ 400 del prototipo contra C$ 950 del worker.** Es de negocio
- [ ] Apartar mesa: `/api/reserva` existe y no tiene pantalla
- [ ] Ejecutar el camino feliz del cobro **una vez** — necesita visto bueno: cobra C$ 80
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**
- [ ] El `seed` le da a María las 116 bolsas vendidas y las 8 butacas: cualquier vista de
      «lo tuyo» leería absurdo. Debería repartirse entre socios de relleno
- [ ] Los 71 hallazgos medios y menores de la ronda 2
- [ ] Borrar `legado.html` y el `src/` anterior cuando la nueva lleve rodaje

---

## Iteración 12 — Apartar mesa, y un cobro que no debí dejar que ocurriera

### Primero, lo que salió mal

Un agente de la ronda del árbitro **cobró C$ 850 de verdad** contra la cuenta de
muestra: apartó una butaca en la cata de cacao para «verificar» un hallazgo sobre
dinero. La cuenta pasó de **C$ 905 a C$ 55**, y por eso el depósito del Salón VIP
—C$ 500— aparece hoy fuera de alcance en la pantalla de reservar.

```
2026-08-24T23:17     -850 | Experiencia · cacao
```

La butaca está apartada y el asiento contable es correcto: el sistema hizo lo que le
pidieron. **El error fue del encargo, no del código.** El brief del árbitro decía «un
hallazgo sin reproducción es una opinión» y le dejaba la mano suelta contra producción.

El brief nuevo lo prohíbe por escrito, con la lista de rutas nombrada una por una:

> **No escribas NUNCA contra producción.** Un hallazgo sobre dinero se demuestra
> LEYENDO el código y, como mucho, con una petición que el servidor tenga que
> RECHAZAR. Si la única forma de probarlo fuera cobrar, no lo pruebes: describilo y
> decí que no lo ejecutaste. Eso vale como hallazgo igual.

La cuenta de muestra necesita recarga para volver a enseñar la app entera.

### Apartar mesa

`/api/reserva` llevaba meses escrito y sin pantalla. Ya la tiene: zona, día, hora,
personas y duración, con la **ocupación real** de `/api/ocupacion` — que devuelve, por
zona y por hora, qué proporción del aforo está tomada.

La pantalla **no repite las siete validaciones del servidor**. Sólo ofrece lo que
existe: con dos horas de duración, la última hora que cabe antes del cierre es las
7 p. m., y ésas son exactamente las trece que se pintan.

```
7 a. m. · 8 · 9 · 10 · 11 · 12 p. m. · 1 · 2 · 3 · 4 · 5 · 6 · 7 p. m.
```

Medido en producción, con la terraza elegida: «13 horas libres el martes, 25 de agosto».
Al cambiar a Salón VIP el pie pasa a «Te faltan C$ 445 para el depósito» y el botón se
apaga —que es como salió a la luz el cobro de arriba—.

`/reservar` no lleva barra de pestañas: tiene su propia barra de acción abajo, y dos
barras fijas apiladas se comen media pantalla en un teléfono. Se sale por la flecha.

### Las zonas vivían en tres sitios

`ZONAS_VALIDAS`, el `aforo` de `/api/ocupacion` y el ternario `zona === 'vip' ? 50000 : 0`
eran tres literales del mismo hecho. Añadir una zona y olvidar su aforo la dejaba con el
de por defecto, sin nadie que avisara. Ahora hay una tabla `ZONAS` y las tres salen de
ella. `/api/catalogo` la publica, así que la pantalla tampoco escribe los nombres:

```
terraza   La terraza    aforo 10 | deposito C$ 0   | balcony
ventanal  El ventanal   aforo  6 | deposito C$ 0   | window
barra     La barra      aforo  8 | deposito C$ 0   | countertops
bistro    El bistró     aforo 12 | deposito C$ 0   | restaurant
vip       El Salón VIP  aforo  1 | deposito C$ 500 | diamond
```

### Un agujero que abrió esa misma tabla

Los íconos de las zonas **nacen en el servidor** y llegan por la red. El tipo
`NombreIcono` no puede atraparlos —son datos en tiempo de ejecución, no literales del
cliente—, así que un glifo que el worker nombrara y no estuviera en el subconjunto se
habría impreso en letras dentro de la pantalla, que es justo lo que el tipo existía para
impedir.

`scripts/iconos.mjs` escanea ahora también `src/worker/index.ts`. El agujero se cierra
por construcción: el glifo que el servidor nombra entra en la fuente y en el tipo, o el
guardián falla. Subconjunto: **41 glifos · 8,2 kB**.

Los cinco íconos esquivan los que el §4 ya tiene ocupados —`local_cafe` es la pestaña
Pedir, `workspace_premium` el sello de socia, y `deck` está retirado—.

### `className` en `ChipFiltro` no hacía nada

Caía en `...resto`, y la línea que arma las clases del componente iba después y lo
pisaba entero. Quien lo pasara no veía ningún efecto y tampoco ningún error. Ahora va al
final del array.

### Paquete

**78,22 kB de JS (21,34 kB gzip)** y 31,04 kB de CSS, con seis pantallas.

### Abierto para la iteración 13

- [ ] **Recargar la cuenta de muestra**: quedan C$ 55 y no alcanza para enseñar casi nada
- [ ] Doble envío en `/api/reserva`: el `ref` sale del `INSERT`, así que nunca repite y
      la guardia de idempotencia no lo ve. En el VIP lo frena `reserva_sin_solape`; en
      las otras zonas dos toques crean **dos reservas**
- [ ] **Resolver la cuota: C$ 400 del prototipo contra C$ 950 del worker.** Es de negocio
- [ ] Cancelar una reserva: la columna `cancelada` existe y no hay endpoint
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**
- [ ] El `seed` le da a María las 116 bolsas vendidas y las 8 butacas
- [ ] Los 71 hallazgos medios y menores de la ronda 2

---

## Quinta ronda · auditoría integral — dos críticos donde se mueve el dinero

> Auditoría externa de diseño, UI/UX y funcionalidad, 25 de agosto de 2026.
> Informe completo: https://claude.ai/code/artifact/07f10931-79ad-40e8-ad7e-96e937b47e53

Se recorrió **la app publicada** como socio con la cuenta de muestra, y se leyeron enteros
el frontend de `src/casa`, el worker y las nueve migraciones, midiendo todo contra
`SPEC.md`. Resultado: **2 críticos, 11 graves, 16 medios y unos 24 menores.**

**Lo que esta ronda NO hizo, dicho antes que nada:** no hay diff de píxel contra los 23 PNG
del prototipo —eso sigue siendo trabajo del agente A1— y **no se ejecutó ningún cobro**:
los botones que escriben dinero se inspeccionaron sin apretarlos.

La auditoría corrió mientras esta bitácora avanzaba dos iteraciones. **Cada hallazgo se
volvió a verificar contra el árbol vivo antes de escribirlo aquí**, y dos se cayeron al
hacerlo, que es como tiene que ser: «el Club manda a WhatsApp sin dar el enlace» está
resuelto —`Club.tsx:385` lleva a `/reservar`, que `App.tsx:94` enruta— y el doble envío de
`/api/reserva` ya lo encontraron ustedes solos y está en la lista de la 13. Los de abajo
siguen en pie, comprobados uno por uno.

### 1 · La recarga acuña dinero sin cobrar, y la puede llamar cualquier socio

`src/worker/index.ts:543`. El endpoint escribe el asiento de recarga **más su bono** sin
ninguna verificación de pago. El comentario de arriba lo declara deuda asumida —«el tope
por operación y el tope diario mantienen acotado el daño»— pero acotar no es impedir:
cualquiera con un código de WhatsApp a su propio número tiene sesión válida, y ese saldo
ficticio compra bienes reales por los tres caminos que la iteración 11 abrió —bolsa
numerada, butaca, plaza de la Mesa Fundadora—.

Las otras dos puertas de caja sí están cerradas con `sesion.rol !== 'casa'`
(`index.ts:424` y `:517`). Ésta no. Y es la única de las tres que mueve saldo hacia arriba.

### 2 · Tres compras de un toque, sin idempotencia de solicitud

`datos.tsx:234, 241, 248` — las tres mandan `body: '{}'`. `cobrarPedido` sí manda su `ref`
y está bien protegido: constraint `asiento_ref_externa_unica`, y la referencia sobrevive a
la recarga desde la iteración 9. **`apartarBolsa`, `apartarExperiencia` y
`apartarMembresia` no mandan ninguna**, y cobran al primer toque sin hoja de confirmación.

En el servidor la referencia se arma **por recurso** (`bolsa:gen:num`, `exp:butaca-id`,
`index.ts:785-851`), no por solicitud: dos toques rápidos apartan dos recursos distintos y
cobran dos veces. Y el error genérico invita al reintento —«Probá otra vez»—, que es
justamente el gesto que compra la segunda bolsa. La membresía se salva de rebote, por el
chequeo de «una viva por socio» (`:728-731`), no por diseño.

Es el mismo defecto que la ronda 4 cerró para el pedido, vivo en las tres compras nuevas.

### 3 · La caja no puede entrar a su propio sistema

`index.ts:256-260` es **la única** llamada a `firmar`, y fija `rol: 'socio'`. No existe
manera de emitir el rol `casa`. Los tres endpoints de barra —sellar la tanda, quemar el
vale, cobrar por monto— quedan inalcanzables por la API, y `/mostrador` sólo vive en
`legado.html`, sin un enlace que lleve ahí.

O la barra no está sellando, o se están firmando tokens a mano fuera de banda, sin
auditoría de quién los emite ni hasta cuándo valen. Sellar la tanda es el corazón del
programa: es la operación que no debería depender de un token artesanal.

### 4 · Los dos botones del carnet mueren en un 404

`Inicio.tsx:128` navega a `/cuenta` y `:131` a `/pase`. `App.tsx` enruta siete rutas y
ninguna es ésas. Verificado en producción: los dos CTA del carnet —la pieza central del
Inicio— caen en «Esa puerta no da a ningún lado». «Recargá» además contradice el §8, que
decidió que no hay pantalla de recarga porque se recarga en caja.

### 5 · El SPEC y la base se están separando

La cuota ya la tenían anotada. No es la única, y el patrón importa más que cada pieza:
**si el SPEC deja de ser confiable se vuelve decoración**, que es la enfermedad que esta
reconstrucción vino a curar. Las cifras de demo, derivadas de las semillas con las reglas
de `009`:

```
consumos  db/002_seed.sql:71-78 · FLOOR(|monto|/1000) → 9+43+9+28+32+8 = 129 pts
tandas    db/008_historial_demo.sql · 2 cerradas × 100 = 200 pts
membresía activa                                       = 500 pts
                                                  total = 829 pts → «Gente de la Casa»
```

El §10 exige «Barista · 1,880 pts · 620 para Reserva Lupita» y el §6 afirma que la escala
**se calibró para reproducirla**. No se reproduce: faltan 1.051 puntos. El saldo demo
arrancó en C$ 905 (`reset-demo.mjs:16`, `SALDO_DEMO=90500`) contra los C$ 1,240 del §10 —y
hoy va por C$ 55, que ya está en la lista de la 13—. El cumpleaños en pantalla es el 13 de
septiembre contra el 14 de octubre del §10.

Y cuatro desviaciones vivas que el §11 no declara, cuando el §11 dice que ninguna otra está
autorizada: la décima casilla lleva `redeem` donde el copy canónico del §1 pide el ícono de
taza; el catálogo de mostrador retirado, que `Tienda.tsx:12-13` **cita como si estuviera en
el §11** y no está; el Perfil llama «Nivel actual» a la membresía, que es justo lo que el
§12.1 separó; y la cabecera dice «Socia».

### 6 · «Socia #037», en la cabecera de todo el mundo

`Inicio.tsx:94` interpola `` `Socia #${…}` `` fijo. Las desviaciones 2 y 5 existen
literalmente para esto —nombrar el nivel en vez de a la persona— y el Perfil ya lo hace
bien: «Mesa Fundadora · #037 de 100». Es el mismo defecto que la iteración 5 corrigió en el
copy de la lista de espera, reaparecido en el sitio de más tráfico de la app.

### 7 · Promesas que la casa no puede honrar

| Promesa en pantalla | Qué hay detrás |
|---|---|
| «Compartir MARIA037» · «los dos toman algo por cuenta de la casa» | Código fabricado en el cliente (`Perfil.tsx:43`); cero endpoints de referido. Toda «María» sin membresía comparte `MARIA000` |
| «Dejá tu número y te escribimos el día que abra» | El teléfono sólo alimenta el `value` del input (`Umbral.tsx:104-130`). Quien lo deje se pierde en silencio |
| «Se corta cuando querás» | `cancelarMembresia` existe en `datos.tsx:259` y **no lo llama ninguna pantalla** |
| Campana de «Avisos» | Lleva al Perfil, donde no hay avisos (`Inicio.tsx:98`) |
| «Tu pedido sale en 6 min» | Nadie lo prepara hasta que el socio llega; la misma hoja lo dice tres líneas después |

El sistema ya sabe hacer esto bien —el reto y los avisos por WhatsApp **dicen la verdad**
sobre lo que falta—. Estas cinco no.

### 8 · Un megabyte y medio de fotos para una pantalla de carta

Las fichas de plato piden la variante de **960 px a secas**: sin `srcset` ni `sizes`. El
hueco real mide 164 px. Las de 240 y 480 existen en disco y nadie las pide.

```js
// en producción, sobre la vista Bistró
performance.getEntriesByType('resource').filter(r => /webp/.test(r.name))
// → 24 imágenes · ~1,5 MB transferidos
document.querySelector('main img').srcset       // → null
document.querySelector('main img').clientWidth  // → 164   (dpr 2)
```

El presupuesto de A6 —LCP ≤ 2,5 s en 3G lento— no sobrevive a esto. El mismo defecto en las
fotos del carril del Inicio, con la 480 fija.

### Lo que sí aguantó el examen

No todo es deuda, y conviene que quede escrito con la misma tinta:

- **El aparato de verificación se verifica a sí mismo.** 17 reglas con sondas ajenas que
  deben disparar, y el tipo `NombreIcono` convirtiendo un glifo inventado en error de
  compilación. Es lo que permitió que esta ronda encontrara defectos de producto y no
  erratas.
- **El dinero del pedido está bien defendido:** precio valorado por el servidor contra su
  propia carta, `FOR UPDATE` que serializa todos los caminos del monedero, libro
  append-only con triggers que rechazan UPDATE y DELETE, cupos defendidos por constraints
  y no por un `if`.
- **Sin inyección y sin IDOR:** toda la SQL parametrizada, el teléfono siempre desde el
  token firmado.
- **Accesibilidad por encima de la media:** `aria-current` en las pestañas, anillo de foco
  de dos capas, todos los iconos con `aria-hidden`, `dialog` nativo con Escape, la tanda
  como lista con nombres y barra semántica. Comprobado en la app viva, no en el código.

### Obligados de la quinta ronda

Se suman a la lista de la iteración 13, ordenados por sangrado. Los cuatro primeros son el
bloque «parar la sangre»: mientras estén abiertos, **la app no se le enseña a un socio real
ni se promociona**.

- [ ] **Cerrar `/api/cuenta/recargar`** detrás del rol `casa`, o retirarlo hasta que haya
      cobro de verdad — `index.ts:543`
- [ ] **Idempotencia por solicitud** en bolsa, butaca y membresía: la `ref` la manda el
      cliente y la respeta la base, como ya hace el pedido — `datos.tsx:234, 241, 248`
- [ ] **Hoja de confirmación** con total y saldo antes de cada una de esas tres compras
- [ ] **Nada navega a un 404:** `/cuenta` y `/pase` — o pantalla, o el copy del §8 —
      `Inicio.tsx:128, 131`
- [ ] Congelar «+», «−» y «Vaciar» mientras un cobro está en vuelo; `ocupado` por pantalla
      y no por botón — `Pedir.tsx:236-254` · `Club.tsx:72-80`
- [ ] Emisión auditable de sesión con rol `casa`, y puerta visible al mostrador
- [ ] Sesión: expiración más corta y revocación (`jti` o versión por socio); `/api/panel`
      con comparación en tiempo constante y tope de intentos — `sesion.ts:34-60` · `index.ts:918`
- [ ] «Socia» fuera de la cabecera — `Inicio.tsx:94`
- [ ] Enmendar el §11 con las cuatro desviaciones vivas, o revertirlas
- [ ] Reconciliar el §10 con la base: saldo, puntos, cumpleaños y fechas. **Es la misma
      decisión de negocio que la cuota**, y conviene tomarla de una vez
- [ ] Las cinco promesas de la tabla del §7: o backend, o la verdad, como ya hace el reto
- [ ] `srcset`/`sizes` con las tres resoluciones que ya existen, y volver a medir contra A6
- [ ] Limpiar el historial de la cuenta demo —«prueba arbitro», cuatro «Ajuste de
      demostración»— cuando se recargue
- [ ] La hoja se cierra al tocar su propio padding: distinguir el panel del `::backdrop`
      — `Superficies.tsx:230-235`
- [ ] Foco al `main` tras `navegar()`: hoy el cambio de pantalla no existe para un lector
      — `App.tsx:39-44`
- [ ] Pantallas en blanco cuando `yo` es nulo con sesión viva — `Perfil.tsx:36` · `Club.tsx:63`
- [ ] Membresía: vencimiento real de `hasta`, y una salida para «se corta cuando querás»
- [ ] Neon: `connect()` dentro del `try` con `end()` garantizado, `statement_timeout`, tasa

---

## Iteración 13 — Los obligados de la quinta ronda

Una sesión hermana corrió una auditoría integral en paralelo y dejó su veredicto arriba.
**Los ocho puntos se comprobaron uno por uno contra el árbol vivo antes de tocar nada.**
Los ocho eran ciertos. Seis quedan cerrados.

### 1 · La recarga acuñaba dinero — CERRADO

`/api/cuenta/recargar` acreditaba saldo **y su bono** sin comprobar ningún pago y sin
guardia de rol. Las otras dos bocas de caja sí la tenían. Cualquier socio con sesión se
acuñaba hasta C$ 3.000 por llamada, y desde la iteración 11 ese saldo compra bolsa,
butaca y plaza. El tope acotaba el daño; no lo impedía.

Antes devolvía 200. Ahora, contra producción y con una sesión de socio de verdad:

```
POST /api/cuenta/recargar  {"monto":300000,"telefono":"50587442005"}
→ 403  {"error":"La recarga se hace en el mostrador, con efectivo o con tarjeta."}
```

Y el saldo no se movió: sigue en C$ 55.

### 2 · La caja no podía entrar a su propio sistema — CERRADO

El rol `casa` lo miran cuatro rutas —sellar, quemar vale, cobrar por monto y ahora
recargar— y **no había forma de emitirlo**: la única llamada a `firmar` fijaba
`rol: 'socio'`. Media aplicación vivía detrás de una puerta sin llave.

`POST /api/auth/casa` la abre con `CASA_SECRETO`, el mismo secreto que ya abre el
Mostrador, porque es el mismo permiso. Dura **un turno de doce horas**, no un mes: un
token de caja olvidado en el navegador del mostrador es una llave de la registradora.

```
POST /api/auth/casa  (x-casa: llave equivocada)
→ 403  {"error":"Esa no es la llave de la casa."}
```

El `tel` va vacío a propósito. La caja no es una persona: cuando sella o recarga dice a
nombre de quién en el cuerpo. Dejar ahí un teléfono real habría convertido un descuido
—olvidar `telefono`— en un cargo a la cuenta de alguien.

### 3 · Tres compras sin idempotencia de solicitud — CERRADO

Las compras armaban su `ref` con **el recurso que acababan de tomar**. Eso impide pagar
dos veces la misma bolsa, que es imposible de todos modos porque el `SKIP LOCKED` ya no
la reparte. Lo que no impedía es que un segundo envío del mismo toque se llevara la
bolsa **siguiente**: dos peticiones, dos recursos, dos refs distintas, dos cobros. La
guardia miraba, y nunca veía nada repetido.

Ahora la llave la manda el cliente y se conserva mientras el intento siga vivo; se
renueva sólo al acertar, porque la siguiente compra es otra compra. El reintento trae la
misma llave, la guardia la reconoce y `enTransaccion` deshace todo: el cupo vuelve al
montón y no se cobra nada.

`/api/reserva` tenía el mismo defecto por otro camino —el `ref` salía del `INSERT`— y
además sin depósito no escribe asiento, así que la guardia ni corría. Se resuelve dentro
del handler: si ya hay una reserva viva del mismo socio, zona y hora, se devuelve **esa**
con `yaEstaba: true` en vez de crear una segunda. No hace falta índice nuevo: la fila del
socio ya está bloqueada con `FOR UPDATE`, así que sus peticiones van en fila india.

### 4 · Una compra de un solo toque — CERRADO

C$ 890 se iban de la cuenta entre que el dedo bajaba y subía. **No es una hipótesis: así
se fueron los C$ 850 de la cata de cacao**, cuando un agente tocó el botón para
comprobar que respondía.

`ConfirmarCompra` dice las tres cifras que importan y pone el importe **dentro del
botón**, donde está el dedo. Con la cuenta en C$ 55, las cuatro hojas del Club dicen la
verdad y no dejan seguir:

```
Una plaza en la Mesa Fundadora   Cuesta C$ 950    Tenés C$ 55   Te queda −C$ 895
Mesa del Tostador                Cuesta C$ 750    Tenés C$ 55   Te queda −C$ 695
Cata y maridaje con cacao        Cuesta C$ 850    Tenés C$ 55   Te queda −C$ 795
Tour a la finca en Matagalpa     Cuesta C$ 2,400  Tenés C$ 55   Te queda −C$ 2,345
```

### 5 · Dos botones que morían en un 404 — CERRADO

«Recargá» iba a `/cuenta` y «Pagá con QR» a `/pase`. **Ninguna de las dos fue nunca una
ruta**: los dos CTA del carnet, en la primera pantalla, caían en «Esa puerta no da a
ningún lado».

Ahora abren la hoja del mostrador, que es donde ocurren las dos cosas de verdad: la
recarga la hace la caja —y ahora el endpoint lo exige—, y el pase es el número con el que
el barista te encuentra. Si hay un vale vivo, la hoja lo enseña.

### 6 · Un megabyte y medio de fotos — CERRADO

Las tres tallas ya estaban en disco y el código pedía siempre la de 960 px para un hueco
de 164:

```
240 px · 36 archivos · 233 kB · media  6 kB
480 px · 36 archivos · 749 kB · media 20 kB
960 px · 36 archivos · 2282 kB · media 63 kB
```

Con `srcSet` y `sizes`, medido en el navegador a 375 px y DPR 2: las nueve fichas
visibles bajan **480w y pesan 214 kB**. Antes eran nueve de 960: unos 570 kB.

### 7 · «Socia #037» en la cabecera de todo el mundo — CERRADO

El §11.5 ya había resuelto que se nombra **el nivel, no a la persona**, y la forma vieja
seguía viva en la cabecera que se ve en cada pantalla. Ahora dice «Miembro #037».

### Lo que sigue abierto de esa auditoría

- [ ] Las cinco promesas sin backend: código de referido fabricado en el cliente, la
      lista de espera que no guarda el teléfono, «se corta cuando querás» sin pantalla
      que llame a `cancelarMembresia`, la campana de avisos, y los 6 minutos del pedido
- [ ] Congelar «+», «−» y «Vaciar» mientras un cobro está en vuelo
- [ ] Sesión: expiración más corta y revocación
- [ ] Reconciliar el §10 con la base
- [ ] La hoja se cierra al tocar su propio padding
- [ ] Limpiar el historial de la cuenta de muestra

### Y lo de siempre

- [ ] **Recargar la cuenta de muestra**: con C$ 55 no se puede enseñar ninguna compra
- [ ] **La cuota: C$ 400 del prototipo contra C$ 950 del worker.** Es de negocio
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**

---

## Cierre de la quinta ronda · cinco arreglos, ninguno de producto

De los obligados que dejó la auditoría, la reconstrucción se llevó por delante casi todos
—la recarga detrás del rol, las llaves de solicitud, `/api/auth/casa`, el `srcset`, las
rutas muertas del carnet, «Socia» fuera de la cabecera—. Quedaban cinco que nadie había
tocado y que no piden ninguna decisión de negocio. Están hechos y **verificados en el
navegador, no supuestos**.

### 1 · La hoja se cerraba al tocarse a sí misma

El comentario decía que el `<dialog>` «ocupa toda la pantalla». No: con
`w-full max-w-md … mt-auto`, **el `<dialog>` ES el panel**. Por eso `e.target === dialog`
era cierto en dos sitios opuestos —el backdrop y el propio padding del panel— y tocar el
hueco entre dos filas del pedido descartaba la hoja con el pedido dentro.

Lo que de verdad los separa es dónde cayó el puntero respecto de la caja del panel, así
que es eso lo que se mide ahora. Verificado con la hoja del pedido abierta:

```
caja del panel: top=201 left=416 w=448 h=536
clic en su propio padding (422,730) → sigue abierta   ✓
clic en el backdrop         (640,161) → se cierra      ✓
```

### 2 · Cambiar de pestaña no movía el foco

Los seis `<main id="contenido" tabIndex={-1}>` llevaban desde la primera iteración
preparados para recibir el foco y **nadie los enfocaba nunca**: para un lector de pantalla
el cambio de pantalla no ocurría, y Tab seguía recorriendo desde la barra de abajo.

Va en un efecto sobre `ruta` y no dentro de `navegar`, porque cuando `navegar` corre el
`<main>` de la pantalla nueva todavía no existe. Y la primera pantalla no roba el foco:
quien abre la app no ha navegado a ningún lado. Verificado:

```
al arrancar        → BODY            (no lo roba)
Pedir / Perfil / Inicio → MAIN#contenido, las tres
```

### 3 · Dos pantallas en blanco con la sesión viva

`Perfil` y `Club` hacían `if (!yo) return null`: en blanco, sin cabecera, sin error y sin
salida. No es teórico —`setDentro(r.codigo !== 401)`, así que un 500 o un corte de red
dejan la sesión «dentro» con `yo` en nulo—. Ahora enseñan el mismo estado que el Inicio ya
enseñaba, con su salida. Verificado forzando la rama con una sonda temporal, que se retiró:

```
cabecera: arrow_back · Tu perfil
No pudimos abrir tu cuenta · … · PROBAR DE NUEVO
```

### 4 · El secreto de la casa se comparaba con `!==`

Las dos puertas que usan `x-casa` —`/api/auth/casa` y `/api/panel`— cortaban en el primer
carácter distinto, y ninguna tiene tope de intentos: el tiempo de respuesta filtraba
cuántos iban bien. La comparación en tiempo constante ya existía **suelta dentro de
`verificar`**; se sacó a `igualEnTiempoConstante` y ahora la usan las tres.

Y un segundo agujero que apareció al escribirlo: si `CASA_SECRETO` faltara del entorno,
comparar dos cadenas vacías da `true` y la casa quedaba abierta de par en par. Un secreto
vacío no abre nunca.

### 5 · Un bloqueo colgado retenía al socio sin límite

Toda compra bloquea la fila del socio con `FOR UPDATE` y no había `statement_timeout`: una
sentencia colgada retenía ese candado indefinidamente y la petición siguiente esperaba
detrás de algo que ya no llevaba a ninguna parte. `SET LOCAL statement_timeout = '8s'` en
las dos transacciones que lo toman —`enTransaccion` y `/api/tanda/canjear`—. Es `LOCAL` a
propósito: muere con la transacción en vez de quedarse pegado a una conexión que el pooler
reparte a otros.

### Estado

```
tsc -b: sin errores
guardián: limpio · 17 reglas vivas, 41 iconos, todos presentes
build: 84,04 kB de JS (22,88 kB gzip)
las cinco pestañas recorridas: las cinco pintan y el foco aterriza en el <main>
```

### Desplegado y comprobado en producción

```
bundle: principal-CAWmMY36.js — el de dist, idéntico
/api/panel  sin cabecera · secreto equivocado · cabecera vacía → 403 las tres
/api/auth/casa con llave equivocada                            → 403
foco al <main>: las cinco pestañas ✓ · al arrancar se queda en BODY ✓
hoja: clic en su propio padding (5,823) sigue abierta ✓ · backdrop (188,546) cierra ✓
las seis rutas → 200 · /api/yo sin sesión → 401
```

La cabecera `x-casa` vacía rechazada es la comprobación que importa de la guardia nueva:
es la forma que tendría el intento si `CASA_SECRETO` faltara del entorno.

El `statement_timeout` no se puede observar desde fuera sin colgar una sentencia a
propósito; va en el mismo archivo que la guardia del panel, y esa guardia ya responde
distinto en producción, así que el worker nuevo está arriba.

> Se ensució el carrito de la cuenta de muestra al probar la hoja y **se dejó vacío**.
> No se movió dinero: el saldo sigue en C$ 55.

### Lo que queda y NO se tocó, porque es decisión de la casa

- El código de referido se sigue fabricando en el cliente y promete un premio que ningún
  endpoint registra. O tabla y canje, o decir la verdad como hace el reto.
- El número del Umbral no se guarda en ninguna parte.
- «Se corta cuando querás» sigue sin pantalla: `cancelarMembresia` no tiene consumidor.
- «Tu pedido sale en 6 min», cuando nadie empieza a prepararlo hasta que el socio llega.
- La sesión dura 30 días y no se puede revocar. Acortarla es una decisión de producto.
- La cuota, el saldo, los puntos y las fechas del §10 contra lo que dice la base.

---

## Iteración 14 — El árbitro dijo RECHAZADO, y tenía razón

Seis lentes ciegas entre sí, cada hallazgo pasado por un refutador adversarial que por
defecto lo tumba. **36 hallazgos levantados, 30 sobrevivieron, 10 graves.** El brief
nuevo prohibía escribir contra producción y se respetó: cero cobros esta ronda.

> **RECHAZADO** — quedan ocho graves vivos, y tres tocan la caja: un cobro que se puede
> repetir gratis, un aforo que sólo defiende el navegador, y una membresía que se cobra
> una vez y regala beneficios para siempre.

### Comida gratis con una llave vieja

`/api/cuenta/cobrar` tenía su propia guardia de idempotencia, distinta de la de
`enTransaccion`, y estaba mal escrita: leía sólo el `id`, hacía **COMMIT** y contestaba
`{cobrado: cent}` con el total del pedido **nuevo**, sin escribir asiento.

Repetir una `ref` gastada confirmaba en pantalla cualquier pedido, por cualquier importe,
sin tocar el saldo. El mismo archivo hacía lo correcto seiscientas líneas antes.

Ahora devuelve **el cobro original** —importe y concepto—, que es lo que una llave de
idempotencia significa: la misma llave, la misma respuesta. Quien reintente por un
timeout ve su cobro; quien reutilice la llave con otro pedido ve el viejo, y en el
mostrador no le sirve de nada.

### La ocupación era real sólo en la primera hora

`/api/ocupacion` contaba únicamente la hora de `cuando`. Una reserva del Salón VIP de
16:00 a 19:00 marcaba las 16:00 y dejaba las 17:00 y las 18:00 pintadas como libres: la
pantalla las ofrecía, el socio las elegía, y el servidor le contestaba 409 por
`reserva_sin_solape` —el único sitio donde el solape sí se miraba—.

`generate_series` reparte ahora cada reserva sobre todas las horas que ocupa de verdad,
desde la de inicio hasta la anterior al final.

### El aforo lo defendía el navegador

`/api/ocupacion` publicaba el aforo de cada zona y la pantalla lo respetaba, pero el
servidor no lo miraba. Sólo el VIP estaba protegido, y de rebote. La terraza admitía las
reservas que le pidieran. Ahora se cuenta el solape con `FOR UPDATE` **antes** de
insertar: el bloqueo sobre la fila del socio serializa a un socio, no a la zona.

También se cerró el pago de butacas de experiencias **ya pasadas**: `/api/catalogo` sólo
publica las futuras, pero el endpoint no lo comprobaba y con el id a mano se pagaba la
cata del mes anterior.

### Yo escribí las cifras decorativas que llevo diez iteraciones persiguiendo

El aviso del depósito prometía tres cosas que no existen: que se «descuenta de lo que
consumás esa noche», que hay penalidad por no avisar, y un plazo de **«cuatro horas»**.
No hay endpoint que devuelva un depósito, ni columna que guarde una política, ni sitio
del que salieran esas cuatro horas. Es la regla del §10, incumplida por quien la escribe.

Y en el mismo minuto en que lo corregía, escribí «Son **doce** sillas contadas» en una
hoja que también sirve a una cata de 16 y a un tour de 20. Ahora sale de `e.cupos`.

Además: «El **El** Salón VIP» —el nombre ya trae artículo—, «**1 horas** libres», y
«Reserva de Cosecha **2026**» seguía viva en el Inicio y en el Kit, contra la desviación
12 que este mismo documento declaró hace dos iteraciones.

### Una pantalla que hablaba de tu dinero sin tener tu cuenta

`setDentro(r.codigo !== 401)`. Cualquier fallo que no fuera 401 —un 500, la señal
caída— metía al socio dentro con `yo` en `null`: Perfil y Club en blanco, y Tienda y
Reservar afirmando «te faltan C$ 890» sobre un saldo que nunca leyeron.

Ahora un 401 saca y limpia; cualquier otro fallo conserva lo que ya se había leído, y si
nunca hubo cuenta, no se entra. El «ya había cuenta» va en una `useRef` **a propósito**:
ponerlo en las dependencias de `refrescar` monta un bucle infinito, porque el `useEffect`
se dispara con cada identidad nueva y `refrescar` escribe `yo`. Me pasó al escribirlo.

### Reflow a 320 px

La fila de seis chips de «Horas» no llevaba `overflow-x`, trece líneas debajo de la de
«Personas», que sí. A 320 px el documento pedía **354** y el navegador contestaba
encogiendo la pantalla entera al 90,4 %. Es la 1.4.10, nivel AA.

Medido en producción tras el arreglo, con recarga real y viewport de 320×700:

| ruta | clientWidth | scrollWidth | escala |
|---|---|---|---|
| `/` `/pedir` `/tienda` `/club` `/perfil` | 320 | 320 | 1 |
| `/reservar` | 320 | **320** | **1** |

El refutador corrigió al auditor en dos puntos y los dos se aceptan: a 360 px no se
rompía —el fallo vive por debajo de ~345—, y el argumento de «44 px quedan en 39,8
físicos» es flojo, porque el mínimo táctil se mide en píxeles CSS.

### Lo que el árbitro dejó abierto y no se ha tocado

- [ ] La Mesa Fundadora se cobra **una vez** y sus beneficios no vencen nunca: no hay
      renovación ni cobro recurrente, y el carnet dice «se renueva el 5 sept»
- [ ] El depósito del VIP se asienta como consumo y **ningún camino lo devuelve**
- [ ] `disabled` mientras carga tira el foco al `<body>` y no lo devuelve (WCAG 2.4.3):
      el patrón correcto es `aria-disabled` + `aria-busy`
- [ ] Los 18 chips de «Personas» y «Horas» miden 40–42 px de alto
- [ ] Si `/api/ocupacion` falla, Reservar queda en carga falsa para siempre
- [ ] El `AvisoFlotante` de Reservar no se apaga nunca
- [ ] Los estados de fallo de Tienda, Club y Reservar no tienen salida: `conSalida()`
      existe y no se usa
- [ ] Reservar no tiene ninguna región viva: nada se anuncia a un lector de pantalla
- [ ] El domingo se decide con el reloj del dispositivo
- [ ] El token de caja nace sin teléfono y deja muerto el cobro por monto
- [ ] El enlace desnudo de WhatsApp en la Tienda, que el §7 rechaza por escrito

### Y lo de siempre

- [ ] **Recargar la cuenta de muestra**: C$ 55
- [ ] **La cuota: C$ 400 del prototipo contra C$ 950 del worker.** Es de negocio
- [ ] Aplicar `009_puntos.sql` — **toca producción, hace falta el visto bueno**
