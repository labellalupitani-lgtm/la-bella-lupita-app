#!/usr/bin/env node
/**
 * Subconjunto de iconos, derivado del código.
 *
 * El problema que resuelve: si un componente pide un icono que no está en el
 * archivo de fuente, Material Symbols no falla — **imprime el nombre en
 * letras**. `LOCAL_MALL` aparece en medio del carnet y nadie se entera hasta
 * que alguien mira la pantalla. Pasó en la primera pasada del kit.
 *
 * Este script lee qué iconos usa el código de verdad, baja el subconjunto
 * exacto y falla si algo no cuadra. Se corre en `prebuild`, así que un icono
 * inventado rompe el build en vez de llegar a producción.
 *
 *   node scripts/iconos.mjs            → verifica; falla si falta alguno
 *   node scripts/iconos.mjs --escribir → regenera el .woff2
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = 'src/casa'

/**
 * Ademas del cliente, se escanea el worker.
 *
 * `/api/catalogo` publica las zonas de la casa CON su icono, asi que hay
 * nombres de glifo que nacen en el servidor y llegan por la red. El tipo
 * `NombreIcono` no puede atraparlos —son datos en tiempo de ejecucion, no
 * literales del cliente—, de manera que si el worker manda uno que no esta
 * en el subconjunto, se imprimiria en letras dentro de la pantalla.
 *
 * Escanearlo aqui cierra el agujero por construccion: el glifo que el
 * servidor nombra entra en la fuente y en el tipo, o el guardian falla.
 */
const SUELTOS = ['src/worker/index.ts']
const DESTINO = 'public/fuentes/material-symbols-subset.woff2'
const MANIFIESTO = 'public/fuentes/iconos.json'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

/**
 * Los sitios donde el código nombra un icono, para construir el subconjunto.
 *
 * Estos patrones **no** son la red de seguridad: es imposible que lo sean.
 * Dieron verde con `local_fire_department` ausente porque `Base.tsx` lo
 * escribía como valor por defecto de parámetro —con espacios alrededor del
 * signo— y luego, al ensancharlos, produjeron diez falsos positivos (`kit`,
 * `root`, `rounded`, `salto`) con una lista de excepciones que iba a crecer
 * sin fin. Analizar léxicamente lo que no es léxico nunca cierra.
 *
 * La red de seguridad es el TIPO. Ver `TIPO` abajo.
 */
const PATRONES = [
  /\bnombre\s*=\s*["']([a-z0-9_]+)["']/g,
  /\bicono\s*=\s*["']([a-z0-9_]+)["']/g,
  /\b(?:icono|porDefecto|nombre)\s*:\s*["']([a-z0-9_]+)["']/g,
]

/**
 * Dónde se declara el tipo con los nombres válidos.
 *
 * Éste es el gate de verdad, no el regex. Se probó una red ancha que cazara
 * cualquier cadena con forma de icono, y produjo diez falsos positivos en el
 * primer intento —`kit`, `root`, `rounded`, `salto`— con una lista de
 * excepciones que iba a crecer sin fin. Un análisis léxico de un lenguaje que
 * no es léxico nunca cierra.
 *
 * El tipo sí cierra: `NombreIcono` es la unión literal de lo que hay en la
 * fuente, así que `nombre={'sync'}`, `nombre={cond ? 'close' : 'menu'}` y
 * `nombre="cloce"` son errores de compilación, se escriban como se escriban.
 * Por eso `build` corre `tsc -b` sin `--noCheck`.
 */
const TIPO = 'src/casa/componentes/iconos.gen.ts'

function archivos(dir) {
  const salida = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) salida.push(...archivos(p))
    else if (/\.tsx?$/.test(p)) salida.push(p)
  }
  return salida
}

const usados = new Set()
for (const f of [...archivos(RAIZ), ...SUELTOS]) {
  const s = readFileSync(f, 'utf8')
  for (const re of PATRONES) for (const m of s.matchAll(re)) usados.add(m[1])
}
const lista = [...usados].sort()

if (lista.length === 0) {
  console.error('iconos: no se encontró ningún icono en el código. ¿Cambió el patrón?')
  process.exit(1)
}

/**
 * Escribe la union literal. Con esto, un glifo que no esta en la fuente deja
 * de ser un hallazgo de auditoria y pasa a ser un error de compilacion.
 */
function escribirTipo(nombres) {
  const NL = String.fromCharCode(10)
  const cuerpo = nombres.map((n) => `  | '${n}'`).join(NL)
  writeFileSync(
    TIPO,
    [
      '/* GENERADO por scripts/iconos.mjs — no se edita a mano.',
      ' *',
      ' * La unión de los glifos que están de verdad en el subconjunto de la',
      ' * fuente. Si el código pide uno que no está, Material Symbols no falla:',
      ' * imprime el nombre en letras dentro de la pantalla. Con este tipo, eso',
      ' * deja de compilar.',
      ' */',
      'export type NombreIcono =',
      cuerpo,
      '',
    ].join(NL),
  )
}

const escribir = process.argv.includes('--escribir')
const previo = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : null

if (!escribir) {
  if (!previo) {
    console.error('iconos: falta el manifiesto. Corré `node scripts/iconos.mjs --escribir`.')
    process.exit(1)
  }
  const faltan = lista.filter((i) => !previo.iconos.includes(i))
  const sobran = previo.iconos.filter((i) => !lista.includes(i))
  if (faltan.length) {
    console.error(
      `iconos: el código usa ${faltan.length} icono(s) que NO están en la fuente:\n  ${faltan.join(', ')}\n` +
        'Se imprimirían como texto en pantalla. Corré `node scripts/iconos.mjs --escribir`.',
    )
    process.exit(1)
  }
  console.log(
    `iconos: ${lista.length} en uso, todos presentes${sobran.length ? ` · ${sobran.length} de más en la fuente` : ''}`,
  )
  process.exit(0)
}

const url =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0' +
  `&icon_names=${lista.join(',')}&display=block`

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text()
const m = css.match(/url\((https:\/\/[^)]+)\)/)
if (!m) {
  console.error('iconos: Google no devolvió una fuente. ¿Algún nombre de icono no existe?')
  console.error(css.slice(0, 400))
  process.exit(1)
}
const woff2 = Buffer.from(await (await fetch(m[1], { headers: { 'User-Agent': UA } })).arrayBuffer())
if (woff2.subarray(0, 4).toString() !== 'wOF2') {
  console.error('iconos: lo descargado no es un woff2.')
  process.exit(1)
}
writeFileSync(DESTINO, woff2)
writeFileSync(MANIFIESTO, JSON.stringify({ iconos: lista, bytes: woff2.length }, null, 2) + '\n')
escribirTipo(lista)
console.log(
  `iconos: ${lista.length} glifos · ${(woff2.length / 1024).toFixed(1)} kB → ${DESTINO}` +
    `\n        tipo con ${lista.length} nombres → ${TIPO}`,
)
