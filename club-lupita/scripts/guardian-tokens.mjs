#!/usr/bin/env node
/**
 * Guardián de tokens.
 *
 * El objetivo del proyecto es que el prototipo mande. Eso sólo es verificable
 * si ningún color, radio o familia puede entrar al código sin pasar por
 * `tailwind.config.js`. Este script lo comprueba y **falla el build**.
 *
 * Las reglas viven en `reglas.mjs` para que `pruebas-guardian.mjs` pueda
 * exigir que cada una dispare. Ver el encabezado de ese archivo: cuatro de
 * once llevaban semanas inertes y el guardián decía «limpio».
 *
 *   node scripts/guardian-tokens.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { colores, radios, familias, revisar, tokensInexistentes } from './reglas.mjs'

const RAIZ = 'src/casa'

/**
 * Archivos de fuera de `src/casa` que también se revisan, y con qué reglas.
 *
 * `tailwind.config.js` es la FUENTE de los colores: ahí los hexadecimales no
 * son una infracción, son el archivo. Pero el nombre retirado seguía vivo en
 * su cabecera y el guardián no podía verlo, así que se revisa con el juego de
 * reglas que sí aplica: las de lenguaje.
 */
const SUELTOS = [
  { archivo: 'tailwind.config.js', soloReglas: ['nombre-retirado', 'jerga-sin-traducir'] },
  { archivo: 'index.html', soloReglas: ['nombre-retirado', 'jerga-sin-traducir', 'imagen-sin-alt'] },
]

function archivos(dir) {
  const salida = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) salida.push(...archivos(p))
    else if (/\.(tsx?|css)$/.test(p)) salida.push(p)
  }
  return salida
}

const fallos = []
for (const f of archivos(RAIZ)) {
  const texto = readFileSync(f, 'utf8')
  for (const x of revisar(texto)) fallos.push({ f, ...x })
  for (const t of tokensInexistentes(texto))
    fallos.push({ f, linea: 0, id: 'token-inexistente', texto: `«${t}» no existe en tailwind.config.js` })
}
for (const { archivo, soloReglas } of SUELTOS) {
  const texto = readFileSync(archivo, 'utf8')
  for (const x of revisar(texto)) {
    if (soloReglas.includes(x.id)) fallos.push({ f: archivo, ...x })
  }
}

if (fallos.length === 0) {
  console.log(
    `guardián: limpio · ${colores.length} colores, ${radios.length} radios y ${familias.length} familias son todo lo que el código puede usar`,
  )
  process.exit(0)
}

console.error(`guardián: ${fallos.length} infracción(es) de token\n`)
const porArchivo = {}
for (const x of fallos) (porArchivo[x.f] ??= []).push(x)
for (const [f, xs] of Object.entries(porArchivo)) {
  console.error(`  ${f}`)
  for (const x of xs.sort((a, b) => a.linea - b.linea))
    console.error(`    ${String(x.linea).padStart(4)}  [${x.id}] ${x.texto}`)
  console.error('')
}
process.exit(1)
