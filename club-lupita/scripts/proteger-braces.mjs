// Mitigación local acotada de GHSA-vfj7-8cjw-p6xm mientras no exista release.
// No cambia versiones ni oculta npm audit. Falla si el proveedor cambia archivos.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
const require = createRequire(import.meta.url)
const root = dirname(require.resolve('braces/package.json'))
const hash = text => createHash('sha256').update(text).digest('hex')
const marker = '// Club Lupita: límite de profundidad GHSA-vfj7-8cjw-p6xm'
const specs = [
  ['parse.js','e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310',[
    ['  while (index < length) {',`  while (index < length) {\n    ${marker}\n    if (stack.length > 128) throw new SyntaxError('Brace nesting exceeds safe depth (128)');`],
  ]],
  ['compile.js','dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f',[
    ['  const walk = (node, parent = {}) => {',`  const walk = (node, parent = {}, depth = 0) => {\n    ${marker}\n    if (depth > 128) throw new SyntaxError('Brace nesting exceeds safe depth (128)');`],
    ['output += walk(child, node);','output += walk(child, node, depth + 1);'],
  ]],
  ['expand.js','41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7',[
    ['  const walk = (node, parent = {}) => {',`  const walk = (node, parent = {}, depth = 0) => {\n    ${marker}\n    if (depth > 128) throw new SyntaxError('Brace nesting exceeds safe depth (128)');`],
    ['walk(child, node);','walk(child, node, depth + 1);'],
  ]],
  ['stringify.js','379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a',[
    ['  const stringify = (node, parent = {}) => {',`  const stringify = (node, parent = {}, depth = 0) => {\n    ${marker}\n    if (depth > 128) throw new SyntaxError('Brace nesting exceeds safe depth (128)');`],
    ['output += stringify(child);','output += stringify(child, node, depth + 1);'],
  ]],
]
for (const [file, expected, edits] of specs) {
  const path = join(root,'lib',file), current = readFileSync(path,'utf8')
  let original = current
  if (current.includes(marker)) for (const [before,after] of [...edits].reverse()) original = original.replace(after,before)
  if (hash(original) !== expected) throw Error('Revisar nueva versión de braces/lib/'+file+' antes de parchearla')
  let patched = original
  for (const [before,after] of edits) {
    if (patched.split(before).length!==2) throw Error('Parche ambiguo: '+file)
    patched = patched.replace(before,after)
  }
  if (current!==patched) writeFileSync(path,patched)
}
console.log('Protección braces verificada: parser y tres recorridos limitados a 128 niveles.')
