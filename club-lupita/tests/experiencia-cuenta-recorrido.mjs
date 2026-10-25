/** Recorrido grabado de interacciones locales; no confirma compras ni guarda datos. */
import {chromium} from 'playwright'
import {mkdir,rename,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5296',dir=process.env.EVIDENCIA_DIR||'entregables/experiencia-cuenta-2026-10-21/recorrido'
assert.equal(new URL(base).hostname,'127.0.0.1')
await mkdir(dir,{recursive:true})
const b=await chromium.launch({channel:'msedge',headless:true})
const c=await b.newContext({viewport:{width:913,height:884},recordVideo:{dir,size:{width:913,height:884}},reducedMotion:'no-preference'})
await c.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort())
const status=await(await c.request.get(base+'/__preview/status')).json();assert.ok(status.preview&&status.outbound==='bloqueado')
await c.request.get(base+'/__preview/entrar')
const p=await c.newPage(),pasos=[]
async function toma(nombre){await p.waitForTimeout(650);await p.screenshot({path:dir+'/'+nombre+'.png'});pasos.push({nombre,url:p.url()})}
try{
 await p.goto(base+'/tienda');await p.evaluate(()=>document.fonts.ready);await toma('01-tienda')
 await p.getByRole('button',{name:'El retiro',exact:true}).click();await toma('02-retiro')
 await p.getByRole('button',{name:'El café',exact:true}).click();await toma('03-cafe')
 await p.getByLabel('Cantidad aproximada (opcional)',{exact:true}).fill('12 bolsas');await toma('04-consulta')
 assert.match(decodeURIComponent(await p.getByRole('link',{name:/Preparar consulta por WhatsApp/}).getAttribute('href')),/12 bolsas/)
 await p.goto(base+'/club');await toma('05-club')
 await p.getByRole('button',{name:'Consultar sello 1',exact:true}).click();await toma('06-sello')
 await p.getByRole('button',{name:'Mostrar mi pase',exact:true}).click();await toma('07-pase');await p.keyboard.press('Escape')
 await p.goto(base+'/perfil');await toma('08-perfil')
 await p.getByRole('tab',{name:'Tu cuenta',exact:true}).click();await toma('09-cuenta')
 await p.getByRole('tab',{name:'Datos y ayuda',exact:true}).click();await toma('10-datos')
 await p.getByRole('tab',{name:'A tu gusto',exact:true}).click()
 await p.getByRole('button',{name:/Cambiar tu bebida de siempre:/}).click();await toma('11-edicion-contextual')
 assert.equal(await p.locator('#perfil-bebida_siempre').evaluate(e=>e===document.activeElement),true)
 await p.keyboard.press('Escape');await toma('12-perfil-final')
}finally{const video=p.video();await c.close();if(video)await rename(await video.path(),dir+'/interacciones.webm');await b.close();await writeFile(dir+'/pasos.json',JSON.stringify(pasos,null,2))}
console.log('Recorrido grabado: '+pasos.length+' estados; sin compras ni cambios de datos')
