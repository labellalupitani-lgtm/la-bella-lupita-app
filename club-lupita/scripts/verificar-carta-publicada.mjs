import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {chromium} from 'playwright'
const dir='entregables/mejoras-carta-2026-10-09',base='https://app.labellalupita.com',sha=b=>createHash('sha256').update(b).digest('hex')
const html=await fetch(base+'/pedir').then(r=>r.text()),local=readFileSync('dist/index.html','utf8'),entrada=local.match(/src="([^"]+\.js)"/)[1]
assert.ok(html.includes(entrada),'La entrada publicada no es la construida')
const recursos=[]
for(const f of readdirSync('dist/assets').filter(f=>/\.(js|css)$/.test(f))){
 const ruta='/assets/'+f,r=await fetch(base+ruta),b=Buffer.from(await r.arrayBuffer());assert.equal(r.status,200);assert.equal(sha(b),sha(readFileSync('dist'+ruta)),ruta);assert.match(r.headers.get('cache-control'),/max-age=31536000/)
 recursos.push({ruta,bytes:b.length,sha256:sha(b),cache:r.headers.get('cache-control')})
}
const r=await fetch(base+'/api/carta'),carta=await r.json();assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/)
assert.equal(carta.platos.length,73);assert.equal(carta.empaque,4000)
assert.deepEqual(carta.horario,[{abre:'08:00',cierra:'21:00'},...Array.from({length:6},()=>({abre:'07:00',cierra:'21:00'}))])
let imagenes=0
for(const p of carta.platos)if(p.foto){for(const size of [240,480,960])assert.ok(existsSync('dist'+p.foto.replace('-960.','-'+size+'.')),p.foto);imagenes++}
const privadas=[]
for(const ruta of ['/api/yo','/api/operacion/carta','/api/operacion/metricas-carta','/api/operacion/carta/fichas','/api/carta/recuperacion']){const r=await fetch(base+ruta);assert.equal(r.status,401,ruta);privadas.push({ruta,status:r.status})}
const browser=await chromium.launch({channel:'msedge',headless:true}),errores=[]
try{
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage()
 // Defensa adicional: esta comprobación pública no admite ninguna escritura de API.
 await c.route('**/api/**',r=>r.request().method()==='GET'?r.continue():r.abort())
 p.on('pageerror',e=>errores.push(e.message));await p.goto(base+'/pedir');await p.getByRole('searchbox',{name:'Buscar en la carta'}).waitFor()
 await p.getByRole('button',{name:'Ingresar a mi cuenta',exact:true}).waitFor();await p.getByRole('searchbox').fill('maracuyá');await p.getByText('1 resultado en toda la carta',{exact:true}).waitFor()
 await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:dir+'/evidencia/publicada-movil.png',fullPage:true})
 await p.locator('.casa-carta-plato').click();await p.getByRole('dialog',{name:'Limonada de Calala',exact:true}).waitFor();await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual(errores,[])
 await c.close()
}finally{await browser.close()}
writeFileSync(dir+'/evidencia/publicacion-verificada.json',JSON.stringify({fecha:new Date().toISOString(),base,recursos,privadas,catalogo:{productos:carta.platos.length,conFoto:imagenes,empaque:carta.empaque,horario:carta.horario,revision:carta.revision},errores,escriturasReales:0},null,2))
console.log('PASA publicación: '+recursos.length+' activos idénticos y cacheados; horario, empaque, consulta pública, autenticación y navegador verificados; cero escrituras reales.')
