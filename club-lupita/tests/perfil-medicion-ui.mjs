import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
import {tlsLocal} from './tienda-tls.mjs'
import {vistaAislada} from './soporte-ui.mjs'
const t=await vistaAislada({tls:tlsLocal()}),browser=await chromium.launch({channel:'msedge',headless:true})
const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce'})
const page=await ctx.newPage(),eventos=[],errores=[]
const dialogo=()=>page.getByRole('dialog',{name:'Editar mi perfil'})
async function editar(nombre){await page.getByRole('button',{name:/^(Editar mi perfil|Continuar edición de mi perfil)$/}).click();await dialogo().getByLabel('Tu nombre',{exact:true}).fill(nombre)}
async function guardar(){await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click()}
async function esperar(evento){for(let n=0;n<100;n++){const r=eventos.find(e=>e.evento===evento);if(r)return r;await new Promise(r=>setTimeout(r,50))}throw Error('No llegó '+evento)}
try{
  await ctx.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),t.token)
  page.on('pageerror',e=>errores.push(e.message))
  await page.route('**/api/metricas-perfil',async r=>{
    const dato=r.request().postDataJSON()
    eventos.push({...dato,confirmacionEnDOM:await page.locator('.casa-perfil-identidad > [role="status"]').filter({hasText:'Tu perfil quedó guardado.'}).isVisible()})
    // Un fallo de observabilidad no puede romper la operación del cliente.
    await r.fulfill({status:503,json:{error:'Medición no disponible'}})
  })
  await page.goto(t.url+'/perfil');await page.getByRole('heading',{name:'Prueba Regresión',exact:true}).waitFor()
  await page.route('**/api/perfil',async r=>{if(r.request().method()==='POST')await new Promise(res=>setTimeout(res,250));await r.continue()})
  await editar('Nombre privado de prueba');await guardar();await dialogo().waitFor({state:'hidden'})
  const confirmado=await esperar('guardado_confirmado');assert.ok(confirmado.duracion>=250);assert.equal(confirmado.confirmacionEnDOM,true);await page.unroute('**/api/perfil')
  await editar('Borrador reservado');await t.db.query('UPDATE socio SET nombre=$2 WHERE id=$1',[t.id,'Cambio paralelo']);await guardar()
  await esperar('guardado_conflicto');await dialogo().getByRole('button',{name:'Consultar versión guardada'}).click();await esperar('recuperacion_revision')
  await dialogo().getByLabel('Usar mi cambio',{exact:true}).check();await dialogo().getByRole('button',{name:'Continuar con los cambios elegidos'}).click()
  await page.route('**/api/perfil',async r=>{if(r.request().method()==='POST'){await r.fetch();await r.abort('failed')}else await r.continue()})
  await guardar();await esperar('guardado_incierto');await dialogo().getByRole('button',{name:'Consultar versión guardada'}).click();await dialogo().waitFor({state:'hidden'})
  assert.equal((await esperar('recuperacion_confirmada')).confirmacionEnDOM,true);await page.unroute('**/api/perfil')
  const n=eventos.length
  await page.evaluate(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true,configurable:true}))
  await editar('Cambio con privacidad');await guardar();await dialogo().waitFor({state:'hidden'});await page.getByRole('heading',{name:'Cambio con privacidad',exact:true}).waitFor()
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))
  await new Promise(r=>setTimeout(r,100));assert.equal(eventos.length,n)
  for(const e of eventos){assert.deepEqual(Object.keys(e).sort(),['confirmacionEnDOM','dispositivo','duracion','evento']);assert.equal(e.dispositivo,'movil');assert.ok(Number.isInteger(e.duracion)&&e.duracion>=0&&e.duracion<=300000)}
  assert.deepEqual(errores,[])
  writeFileSync('entregables/mejoras-perfil-2026-10-09/evidencias/medicion-navegador.json',JSON.stringify({fecha:new Date().toISOString(),entorno:'Edge local, fixture sintético, demora de POST controlada de 250 ms; no representa latencia de producción',eventos,gpcSinEnvios:true,errorDeMedicionNoBloquea:true,errores},null,2))
  console.log('PASA medición hasta confirmación: demora, conflicto, recuperación, GPC y fallo de telemetría')
}finally{await browser.close();await t.close()}
