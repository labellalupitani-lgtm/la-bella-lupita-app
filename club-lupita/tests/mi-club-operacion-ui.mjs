import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {readFileSync,writeFileSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
const t=await vistaAislada({tls:tlsLocal()}),browser=await chromium.launch({channel:'msedge',headless:true}),resultados=[]
const dir='entregables/mejoras-mi-club-2026-10-09/evidencia'
try{
 const config=(await t.request('/api/club')).body.config
 assert.equal((await t.request('/api/membresia/apartar',{ref:'mi-club-personal-01',version:'fundadora-2026-10',configVersion:config.version,acepto:true})).status,200)
 const codigo=(await t.request('/api/beneficios/solicitar',{clase:'bolsa_mes'})).body.codigo
 assert.equal((await t.request('/api/operacion/beneficios/entregar',{codigo},t.staff)).status,200)
 const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},reducedMotion:'reduce'})
 await c.addCookies(t.staff.cookie.split('; ').map(x=>{const i=x.indexOf('=');return {name:x.slice(0,i),value:x.slice(i+1),domain:'127.0.0.1',path:'/',secure:true,sameSite:'Strict',httpOnly:!x.slice(0,i).includes('csrf')}}))
 await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
 const p=await c.newPage(),errores=[];p.on('pageerror',e=>errores.push(e.message));p.setDefaultTimeout(12000)
 await p.goto(t.url+'/personal?seccion=club');await p.getByRole('heading',{name:'Mi Club',exact:true}).waitFor()
 await p.getByLabel('Café: tamaño, extras y condiciones de entrega',{exact:true}).fill('Regla sintética de ensayo, no publicable')
 assert.equal(await p.getByRole('button',{name:'Guardar configuración de Mi Club'}).isDisabled(),true)
 await p.getByLabel('Confirmo que estas reglas y costos fueron verificados por la casa.').check()
 await p.getByRole('button',{name:'Guardar configuración de Mi Club'}).click();await p.getByText('Condiciones y costos guardados con registro de auditoría.').waitFor()
 assert.equal((await t.request('/api/club')).body.config.cafe_detalle,'Regla sintética de ensayo, no publicable');resultados.push('Configuración revisada por propietario y transmitida a cliente')
 await p.getByRole('button',{name:/Revisar reposición de entrega/}).click();const d=p.getByRole('dialog',{name:'Autorizar reposición de beneficio'})
 assert.equal(await d.getByRole('button',{name:'Confirmar reposición'}).isDisabled(),true)
 await d.getByLabel('Qué ocurrió y qué verificaste').fill('Producto defectuoso, ensayo controlado')
 await d.getByLabel('Comprobé el error y autorizo la reposición a este cliente.').check();await d.getByRole('button',{name:'Confirmar reposición'}).click();await d.waitFor({state:'hidden'})
 await p.getByText('Reposición autorizada, pendiente de entrega.').waitFor();assert.equal((await t.request('/api/club')).body.reposiciones.length,1);resultados.push('Reposición requiere motivo y confirmación y queda disponible en la cuenta')
 await p.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const axe=await p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}))
 assert.deepEqual(axe.violations.map(v=>({id:v.id,n:v.nodes.length})),[]);assert.deepEqual(errores,[])
 await p.screenshot({path:dir+'/operacion.png',fullPage:true});resultados.push('Panel sin errores de ejecución ni infracciones automáticas AA')
 console.log(resultados.map(x=>'PASA '+x).join('\n'))
}finally{writeFileSync(dir+'/operacion-ui.json',JSON.stringify(resultados,null,2));await browser.close();await t.close()}
