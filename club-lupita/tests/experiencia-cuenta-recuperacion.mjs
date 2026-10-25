/** Regresiones de los fallos F1/F2: destino de movimientos y recuperación sin recargar la página. */
import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {mkdir,writeFile} from 'node:fs/promises'
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5296'
const dir=process.env.EVIDENCIA_DIR||'entregables/experiencia-cuenta-2026-10-21/recuperacion'
assert.equal(new URL(base).hostname,'127.0.0.1')
await mkdir(dir,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort())
const status=await(await context.request.get(base+'/__preview/status')).json()
assert.ok(status.preview&&status.outbound==='bloqueado')
await context.request.get(base+'/__preview/entrar')
const page=await context.newPage(),results=[],errors=[]
page.on('pageerror',e=>errors.push(e.message))
try {
 await page.goto(base+'/club')
 await page.getByRole('link',{name:'Ver movimientos',exact:true}).click()
 await page.getByRole('tab',{name:'Tu cuenta',exact:true,selected:true}).waitFor()
 await page.getByRole('heading',{name:'Últimos movimientos de dinero',exact:true}).waitFor()
 await page.waitForFunction(()=>document.activeElement?.id==='perfil-cuenta')
 assert.equal(new URL(page.url()).hash,'#perfil-cuenta')
 results.push({caso:'Movimientos abre y enfoca Tu cuenta',ok:true})
 await page.screenshot({path:dir+'/movimientos.png',fullPage:true})
 let fallo=true,lecturas=0
 await page.route('**/api/yo',r=>{lecturas++;return fallo?r.fulfill({status:503,json:{error:'Error temporal sintético'}}):r.continue()})
 await page.reload()
 await page.getByText('El resumen de saldo no está disponible.',{exact:false}).waitFor()
 assert.equal(await page.locator('.cuenta-importe').count(),0)
 await page.screenshot({path:dir+'/saldo-error.png',fullPage:true})
 await page.getByRole('button',{name:'Actualizar cuenta',exact:true}).click()
 await page.getByRole('button',{name:'Actualizar cuenta',exact:true}).waitFor({state:'visible'})
 await page.waitForFunction(()=>!document.querySelector('.perfil-cuenta-resumen .casa-boton')?.disabled)
 assert.ok(lecturas>=2)
 assert.equal(await page.locator('.cuenta-importe').count(),0)
 fallo=false
 await page.getByRole('button',{name:'Actualizar cuenta',exact:true}).click()
 await page.locator('.cuenta-importe').waitFor()
 assert.equal(await page.getByText('El resumen de saldo no está disponible.',{exact:false}).count(),0)
 results.push({caso:'Saldo ausente no inventado; reintento fallido y recuperación sin recargar',ok:true,lecturas})
 await page.screenshot({path:dir+'/saldo-recuperado.png',fullPage:true})
 fallo=true
 await page.getByRole('button',{name:'Actualizar cuenta',exact:true}).click()
 await page.getByText('El saldo y los movimientos corresponden a la última consulta disponible.',{exact:false}).waitFor()
 assert.ok(await page.locator('.cuenta-importe').isVisible())
 results.push({caso:'Lectura anterior identificada al fallar una actualización',ok:true})
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({results,errors},null,2))
} finally {await writeFile(dir+'/resultados.json',JSON.stringify({results,errors},null,2));await browser.close()}
