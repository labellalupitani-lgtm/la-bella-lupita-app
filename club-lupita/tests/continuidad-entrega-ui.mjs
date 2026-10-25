import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {mkdirSync,writeFileSync} from 'node:fs'
const dir='entregables/continuidad-modulos-2026-10-21/evidencia/entrega'
mkdirSync(dir,{recursive:true})
const b=await chromium.launch({channel:'msedge',headless:true}),results=[],errors=[]
async function context(base){assert.equal(new URL(base).hostname,'127.0.0.1');const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await c.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());const p=await c.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));return{c,p}}
async function estable(p){await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready)}
async function colocar(p,selector){await p.locator(selector).evaluate(e=>window.scrollTo(0,window.scrollY+e.getBoundingClientRect().top-64))}
try{
 for(const [version,base] of [['antes','http://127.0.0.1:5271'],['despues','http://127.0.0.1:5277']]){
  const {c,p}=await context(base)
  await p.goto(base+'/__preview/publico?destino=%2Fpedir');await p.goto(base+'/pedir?plato=latte');await p.getByRole('dialog',{name:'Latte',exact:true}).waitFor();await estable(p)
  await p.screenshot({path:dir+'/'+version+'-carta-publica.png'})
  await p.goto(base+'/__preview/entrar');await p.goto(base+'/perfil');await p.getByRole('heading',{name:'Comunicaciones y tus datos',exact:true}).waitFor()
  await p.setViewportSize({width:320,height:844});await p.addStyleTag({content:'html{font-size:200%!important}'});await estable(p);await colocar(p,'.perfil-privacidad')
  await p.screenshot({path:dir+'/'+version+'-perfil200.png'})
  await p.setViewportSize({width:390,height:844})
  await p.route('**/api/tienda/recuperacion',r=>r.fulfill({status:503,json:{error:'La consulta de prueba falló.'}}))
  await p.goto(base+'/tienda');await p.locator('.tienda-estado').getByText(/La consulta de prueba falló/).waitFor();await estable(p);await colocar(p,'.tienda-estado')
  await p.screenshot({path:dir+'/'+version+'-tienda-error.png'});await p.unroute('**/api/tienda/recuperacion')
  await p.goto(base+'/__preview/equipo?rol=propietario');await p.goto(base+'/personal?seccion=agenda');await p.getByRole('button',{name:'Actualizar',exact:true}).waitFor();await estable(p)
  await p.setViewportSize({width:320,height:844});await p.addStyleTag({content:'html{font-size:200%!important}'});await colocar(p,'.equipo-sincronizacion')
  await p.screenshot({path:dir+'/'+version+'-agenda200.png'})
  await c.close()
 }
 const base='http://127.0.0.1:5277',{c,p}=await context(base)
 await p.goto(base+'/__preview/entrar')
 const rutas=['/','/pedir','/tienda','/club','/conoce-tu-club','/perfil','/compras','/reservas','/reservar','/kit','/__ruta-desconocida__']
 for(const ruta of rutas){await p.goto(base+ruta);await p.locator('main').waitFor();await estable(p);results.push({ruta,title:await p.title(),asset:await p.locator('script[type=module][src]').first().getAttribute('src'),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),rotas:await p.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth).length)})}
 await p.goto(base+'/__preview/equipo?rol=propietario')
 for(const seccion of ['resumen','pedidos','caja','club','tienda','entregas','agenda','atencion','informes','clientes','equipo','seguridad']){const ruta='/personal?seccion='+seccion;await p.goto(base+ruta);await p.locator('main').waitFor();await estable(p);results.push({ruta,title:await p.title(),asset:await p.locator('script[type=module][src]').first().getAttribute('src'),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),rotas:await p.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth).length)})}
 await c.close();assert.deepEqual(errors,[]);assert.ok(results.every(r=>!r.overflow&&!r.rotas&&r.asset.includes('principal-BdaynFmx')))
 console.log('PASS 8 capturas comparables y 23 vistas con assets de la compilación final')
}finally{writeFileSync(dir+'/resultados.json',JSON.stringify({results,errors},null,2));await b.close()}
