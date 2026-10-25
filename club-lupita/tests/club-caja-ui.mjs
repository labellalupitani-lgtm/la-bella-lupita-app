import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
const t=await vistaAislada({tls:tlsLocal()}),browser=await chromium.launch({channel:'msedge',headless:true}),resultados=[]
const dir=process.env.TEST_OUTPUT_DIR||'entregables/mejoras-mi-club-2026-10-09/segunda-etapa/evidencia'
mkdirSync(dir,{recursive:true})
try{
 const config=(await t.request('/api/operacion/club/panel',undefined,t.staff)).body.config
 assert.equal((await t.request('/api/operacion/club/configuracion',{...config,reposteria:['cheesecake-cafe']},t.staff)).status,200)
 await t.db.query("UPDATE membresia SET hasta=now()+interval '5 days' WHERE socio_id=$1",[t.id])
 const pase=(await t.request('/api/yo')).body.socio.codigo_club,ledger=JSON.stringify((await t.db.query('SELECT * FROM asiento ORDER BY id')).rows)
 const c=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},reducedMotion:'reduce'})
 await c.addCookies(t.staff.cookie.split('; ').map(x=>{const i=x.indexOf('=');return{name:x.slice(0,i),value:x.slice(i+1),domain:'127.0.0.1',path:'/',secure:true,sameSite:'Strict',httpOnly:!x.slice(0,i).includes('csrf')}}))
 await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
 const p=await c.newPage(),errores=[];p.on('pageerror',e=>errores.push(e.message));p.setDefaultTimeout(12000)
 await p.goto(t.url+'/personal?seccion=caja');await p.getByRole('button',{name:'Descuento de repostería',exact:true}).click()
 await p.getByLabel('Código del pase del cliente').fill(pase);await p.getByLabel('Referencia del comprobante físico',{exact:true}).fill('ui-club-caja-0001')
 await p.getByLabel(/Cheesecake de Café/).fill('2');await p.getByRole('button',{name:'Revisar descuento de este comprobante'}).click()
 const d=p.getByRole('dialog',{name:'Confirmar descuento de repostería'});await d.waitFor();assert.match(await d.innerText(),/408/)
 assert.equal(await d.getByRole('button',{name:'Confirmar descuento aplicado'}).isDisabled(),true)
 await d.getByRole('checkbox').check()
 await p.route('**/api/operacion/club-caja/registrar',async ruta=>{const r=await ruta.fetch();assert.equal(r.status(),200);await ruta.abort('failed')},{times:1})
 await d.getByRole('button',{name:'Confirmar descuento aplicado'}).click();await d.getByRole('alert').waitFor();assert.equal(await d.isVisible(),true)
 await d.getByRole('button',{name:'Confirmar descuento aplicado'}).click();await d.waitFor({state:'hidden'})
 await p.getByText('Descuento registrado. No se realizó ningún cobro desde la aplicación.').waitFor()
 assert.equal((await t.db.query('SELECT count(*)::int n FROM club_descuento_caja')).rows[0].n,1)
 assert.equal(JSON.stringify((await t.db.query('SELECT * FROM asiento ORDER BY id')).rows),ledger);resultados.push('Descuento revisado y registrado una vez tras perder respuesta, sin movimiento financiero')
 await p.getByText('Consultar registros y recuperar una confirmación',{exact:true}).click()
 await p.getByLabel('Buscar referencia de comprobante').fill('ui-club-caja-0001');await p.getByRole('button',{name:'Consultar registros',exact:true}).click()
 await p.getByRole('button',{name:'Revisar anulación · UI-CLUB-CAJA-0001'}).click();const anular=p.getByRole('dialog',{name:'Anular registro de descuento'})
 assert.equal(await anular.getByRole('button',{name:'Confirmar anulación del registro'}).isDisabled(),true)
 await anular.getByLabel('Motivo y corrección realizada').fill('Se corrigió el comprobante de prueba')
 await anular.getByRole('button',{name:'Confirmar anulación del registro'}).click();await anular.waitFor({state:'hidden'})
 await p.getByText('Anulado: Se corrigió el comprobante de prueba.',{exact:false}).waitFor();resultados.push('Anulación administrativa visible con motivo e historial')
 await p.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const axe=await p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>v.id),[])
 await p.screenshot({path:dir+'/caja-descuento.png',fullPage:true});await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errores,[]);resultados.push('Caja sin desbordamiento móvil, errores de ejecución ni infracciones automáticas AA')
 console.log(resultados.map(x=>'PASA '+x).join('\n'))
}finally{writeFileSync(dir+'/caja-ui.json',JSON.stringify(resultados,null,2));await browser.close();await t.close()}
