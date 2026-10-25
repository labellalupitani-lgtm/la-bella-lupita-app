import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const base='https://app.labellalupita.com',dir='entregables/mejoras-tienda-2026-10-09',checks=[]
const hash=b=>createHash('sha256').update(b).digest('hex')
let cookie='',csrf=''
async function call(path,body){
 const r=await fetch(base+'/api'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',origin:base,'x-cliente-solicitud':'1','x-cliente-csrf':csrf,...(cookie?{cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})})
 const cookies=r.headers.getSetCookie();if(cookies.length){cookie=cookies.map(c=>c.split(';')[0]).join('; ');csrf=decodeURIComponent(cookies.find(c=>c.startsWith('__Host-lupita-cliente-csrf='))?.split(';')[0].split('=')[1]??'')}
 return {status:r.status,body:await r.json(),cache:r.headers.get('cache-control')}
}
for(const path of ['/','/tienda','/compras','/personal?seccion=tienda'])assert.equal((await fetch(base+path)).status,200)
assert.equal((await call('/tienda')).status,401)
checks.push('Rutas de Tienda, historial y panel disponibles; consulta privada protegida')
for(const path of ['/index.html',...readdirSync('dist/assets').filter(f=>/^(Tienda-|tienda-|CondicionesTienda-|MisCompras-|Personal-|principal-).*(js|css)$/.test(f)).map(f=>'/assets/'+f)]){
 const r=await fetch(base+path);assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(readFileSync('dist'+path)),path)
}
checks.push('HTML y activos publicados idénticos byte a byte al build verificado')
// Cuenta de demostración pública. No se envían mensajes externos ni se cobra.
const codigo=await call('/auth/codigo',{telefono:'50587442005'});assert.equal(codigo.status,200);assert.ok(codigo.body.codigoDemo)
assert.equal((await call('/auth/entrar',{telefono:'50587442005',codigo:codigo.body.codigoDemo})).status,200)
try{
 assert.ok(cookie.includes('__Host-lupita-cliente='));assert.ok(csrf)
 const o=await call('/tienda');assert.equal(o.status,200);assert.equal(o.body.disponible,false);assert.equal(o.body.ficha.fuente,'');assert.match(o.cache,/no-store/)
 assert.equal((await call('/tienda/cotizar',{ref:'verificacion-tienda-'+crypto.randomUUID()})).status,409)
 assert.equal((await call('/tienda/recuperacion')).status,200)
 assert.equal((await call('/compras')).status,200)
 assert.equal((await call('/operacion/tienda')).status,403)
 checks.push('Sesión segura de demostración: oferta pausada sin condiciones, recuperación e historial disponibles; operación denegada a clientes')
}finally{assert.equal((await call('/sesion/salir',{})).status,200)}
writeFileSync(dir+'/evidencia/produccion.json',JSON.stringify({fecha:new Date().toISOString(),base,checks,sinCobros:true,soloCuentaDemo:true},null,2))
console.log(checks.map(c=>'PASA '+c).join('\n'))
