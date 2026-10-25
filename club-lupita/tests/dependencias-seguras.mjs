import assert from 'node:assert/strict'
import braces from 'braces'
assert.deepEqual(braces.expand('src/{casa,worker}/*.{ts,tsx}'),['src/casa/*.ts','src/casa/*.tsx','src/worker/*.ts','src/worker/*.tsx'])
assert.equal(braces.compile('a/{b,c}/d'),'a/(b|c)/d')
const deep = '{'.repeat(4000)+'a,b'+'}'.repeat(4000)
for (const method of ['parse','compile','expand','stringify']) {
  assert.throws(()=>braces[method](deep),e=>e instanceof SyntaxError && /safe depth/.test(e.message),method)
  assert.throws(()=>braces[method]('('.repeat(4000)+'a'+')'.repeat(4000)),/safe depth/)
}
// Un AST recibido directamente no pasa por parse, también necesita límite.
for (const method of ['compile','expand','stringify']) {
  const root={type:'root',nodes:[]}; let node=root
  for(let i=0;i<10000;i++){const child={type:'brace',nodes:[],parent:node};node.nodes=[child];node=child}
  assert.throws(()=>braces[method](root),e=>e instanceof SyntaxError && /safe depth/.test(e.message),method+' AST')
}
console.log('PASA patrones válidos y rechazo acotado: texto 4.000 niveles (bajo límite de caracteres), AST 10.000 niveles')
