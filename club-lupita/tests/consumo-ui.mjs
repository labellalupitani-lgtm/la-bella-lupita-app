import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
import {mkdirSync,writeFileSync} from 'node:fs'
const dir='entregables/optimizacion-consumo-2026-10-22';mkdirSync(dir,{recursive:true})
const t=await vistaAislada({tls:tlsLocal()})
const browser=await chromium.launch({channel:'msedge',headless:true})
const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1280,height:900},reducedMotion:'reduce'})
await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
await ctx.addInitScript(token=>{if(!sessionStorage.getItem('fixture-consumo')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('fixture-consumo','1')}},t.token)
const page=await ctx.newPage(),errores=[],peticiones=[]
const pendientes=new Set()
page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))pendientes.add(r)})
page.on('response',r=>pendientes.delete(r.request()))
page.on('requestfinished',r=>pendientes.delete(r));page.on('requestfailed',r=>pendientes.delete(r))
async function tranquilo(){let desde=Date.now();for(let n=0;n<400;n++){if(pendientes.size)desde=Date.now();else if(Date.now()-desde>250)return;await new Promise(r=>setTimeout(r,25))}throw Error('Peticiones sin resolver: '+[...pendientes].map(r=>new URL(r.url()).pathname).join(','))}
page.on('pageerror',e=>errores.push(e.message))
page.on('request',r=>{if(r.method()==='GET'&&new URL(r.url()).pathname.startsWith('/api/'))peticiones.push(new URL(r.url()).pathname)})
try{
 await page.goto(t.url+'/club');await page.waitForFunction(()=>document.cookie.includes('__Host-lupita-cliente-csrf='));await tranquilo()
 await page.clock.install();await page.reload();await page.getByRole('heading',{name:'Mi Club',exact:true}).waitFor()
 await tranquilo();await page.clock.pauseAt(new Date(Date.now()+1000))
 const inicio=peticiones.length
 await page.clock.runFor(60000);await page.mouse.click(5,300);await page.clock.runFor(65000)
 await tranquilo()
 const activas=peticiones.slice(inicio)
 assert(activas.includes('/api/club')&&activas.includes('/api/yo'),JSON.stringify(activas))
 assert(!activas.some(p=>['/api/perfil','/api/catalogo','/api/cupos','/api/inicio/contexto'].includes(p)),JSON.stringify(activas))
 const antes=peticiones.length;await page.clock.runFor(10*60000);await tranquilo()
 assert(peticiones.length-antes<=2,'La pantalla inactiva sigue consultando')
 const dormida=peticiones.length;await page.mouse.click(5,300);await tranquilo();assert.equal(peticiones.length-dormida,2)
 await page.screenshot({path:dir+'/club-validado.png',fullPage:true})
 for(const ruta of ['/','/pedir','/perfil']){await page.goto(t.url+ruta);await tranquilo();assert.equal(await page.getByText('No pudimos abrir tu cuenta',{exact:true}).count(),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
 assert.deepEqual(errores,[])
 writeFileSync(dir+'/navegador.json',JSON.stringify({activas,peticionesTotales:peticiones.length,errores,resultado:'correcto'},null,2))
 console.log('PASA navegador: Mi Club sólo relee cuenta/club, pausa por inactividad, reanuda y conserva Inicio/Carta/Perfil')
}finally{await browser.close();await t.close()}
