import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {mkdirSync,writeFileSync} from 'node:fs'

const url=process.env.PREVIEW_URL||'http://127.0.0.1:5190'
assert.equal(new URL(url).hostname,'127.0.0.1','Solo se admiten datos locales de prueba')
const dir=process.env.EVIDENCIA_ESTABILIDAD_DIR||'entregables/estabilidad-inicio-2026-10-21/evidencia'
mkdirSync(dir,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
const context=await browser.newContext({reducedMotion:'reduce'})
const page=await context.newPage(),resultados=[],errores=[],externas=[]
page.on('pageerror',e=>errores.push(e.message))
page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==url)externas.push(r.url())})
page.setDefaultTimeout(15000)
const actualizar=()=>page.getByRole('button',{name:'Actualizar Inicio',exact:true})
async function fondoActualizacion(){await page.mouse.move(0,0);return actualizar().evaluate(el=>getComputedStyle(el).backgroundColor)}
async function progresoVisible(fondoAnterior){
  await page.mouse.move(0,0)
  assert.equal(await actualizar().isDisabled(),true)
  assert.equal(await actualizar().getAttribute('aria-busy'),'true')
  assert.equal(await actualizar().getAttribute('title'),'Actualizando Inicio…')
  assert.equal((await page.locator('.inicio-encabezado [role="status"]').textContent()).trim(),'Actualizando los datos de Inicio…')
  const senal=await actualizar().evaluate(el=>{
    const icono=el.querySelector('.inicio-refrescar-icono'),r=icono?.getBoundingClientRect()
    return {fondo:getComputedStyle(el).backgroundColor,iconoVisible:Boolean(icono?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&r.width>0&&r.height>0),animacion:icono?getComputedStyle(icono).animationName:null}
  })
  assert.equal(senal.iconoVisible,true,'El indicador de actualización permanece dibujado')
  assert.notEqual(senal.fondo,fondoAnterior,'El estado pendiente tiene una señal visual estática también con movimiento reducido')
  assert.equal(senal.animacion,'none','El progreso respeta movimiento reducido')
  return senal
}
async function estable(){await page.waitForFunction(()=>document.querySelector('.inicio-actualizar')?.getAttribute('aria-busy')!=='true');await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))})}
async function inicio(){await page.goto(url+'/__preview/entrar');await page.getByRole('heading',{name:'Tu cuenta de casa',exact:true}).waitFor();await estable()}
async function medir(){return page.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return Object.fromEntries(['.inicio-encabezado','.inicio-resumen','.casa-cuenta','.inicio-actualizacion','.inicio-seguimiento','.inicio-invitacion'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y,width:r.width,height:r.height}]}))})}
function sinSalto(antes,despues,etapa){for(const s of Object.keys(antes))for(const eje of ['x','y','width','height'])assert.ok(Math.abs(antes[s][eje]-despues[s][eje])<=1,`${etapa}: ${s} ${eje} cambia ${antes[s][eje]}→${despues[s][eje]}`)}
function compuerta(){let abrir,entrar,terminar;return{espera:new Promise(r=>abrir=r),entrada:new Promise(r=>entrar=r),fin:new Promise(r=>terminar=r),abrir:()=>abrir(),entrar:()=>entrar(),terminar:()=>terminar()}}
async function entraron(...gates){let timer;try{await Promise.race([Promise.all(gates.map(g=>g.entrada)),new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('La lectura no llegó a la compuerta')),10000))])}finally{clearTimeout(timer)}}
try{
  for(const width of [320,390,1440]){
    await page.setViewportSize({width,height:width===1440?1000:844});await inicio()
    const antes=await medir(),saldo=await page.locator('.casa-cuenta-saldo').innerText(),fondoAnterior=await fondoActualizacion()
    const cuenta=compuerta(),catalogo=compuerta()
    await page.route('**/api/yo',async r=>{const response=await r.fetch();cuenta.entrar();await cuenta.espera;await r.fulfill({response})})
    await page.route('**/api/catalogo',async r=>{const response=await r.fetch();catalogo.entrar();await catalogo.espera;await r.fulfill({response});catalogo.terminar()})
    try{
      await actualizar().click();await entraron(cuenta,catalogo)
      const senal=await progresoVisible(fondoAnterior)
      assert.equal(await page.locator('.casa-cuenta-saldo').innerText(),saldo)
      const durante=await medir();sinSalto(antes,durante,`${width}: cuenta y catálogo pendientes`)
      await page.screenshot({path:`${dir}/actualizando-${width}.png`})
      catalogo.abrir();await catalogo.fin
      await page.waitForFunction(()=>!document.querySelector('.inicio-alertas')?.textContent.trim())
      assert.equal(await actualizar().getAttribute('aria-busy'),'true','El perfil/catalogo rápido no puede anunciar lista una cuenta pendiente')
      const cuentaPendiente=await medir();sinSalto(antes,cuentaPendiente,`${width}: cuenta pendiente`)
      cuenta.abrir();await estable()
      const despues=await medir();sinSalto(antes,despues,`${width}: datos actualizados`)
      assert.equal(await actualizar().isDisabled(),false)
      assert.equal(await actualizar().getAttribute('title'),'Actualizar Inicio')
      assert.equal((await page.locator('.inicio-encabezado [role="status"]').textContent()).trim(),'')
      assert.equal(await fondoActualizacion(),fondoAnterior)
      resultados.push({caso:`actualización escalonada ${width}`,ok:true,senal,antes,durante,cuentaPendiente,despues})
      console.log(`PASA carga estable y estado veraz ${width}`)
    }finally{cuenta.abrir();catalogo.abrir();await page.unrouteAll({behavior:'wait'})}
  }
  await page.setViewportSize({width:390,height:844});await inicio()
  const saldo=await page.locator('.casa-cuenta-saldo').innerText()
  await page.route('**/api/yo',r=>r.fulfill({status:503,json:{error:'Cuenta de prueba temporalmente sin conexión'}}))
  await page.route('**/api/catalogo',r=>r.fulfill({status:503,json:{error:'Catálogo de prueba temporalmente sin conexión'}}))
  await actualizar().click();await estable()
  await page.locator('.inicio-alertas').getByText(/No pudimos actualizar tu cuenta/).waitFor()
  await page.locator('.inicio-alertas').getByText(/No pudimos actualizar el catálogo/).waitFor()
  assert.equal(await page.locator('.casa-cuenta-saldo').innerText(),saldo)
  await page.locator('.inicio-actualizacion').getByText(/Última consulta de tu cuenta/).waitFor()
  await page.screenshot({path:`${dir}/error-con-datos-anteriores.png`,fullPage:true})
  await page.unrouteAll({behavior:'wait'})
  await page.locator('.inicio-alertas').getByRole('button',{name:'Reintentar actualización de cuenta',exact:true}).click()
  await page.locator('.inicio-alertas').getByText(/No pudimos actualizar tu cuenta/).waitFor({state:'hidden'})
  await page.locator('.inicio-alertas').getByRole('button',{name:'Actualizar catálogo',exact:true}).click()
  await page.locator('.inicio-alertas').getByText(/No pudimos actualizar el catálogo/).waitFor({state:'hidden'})
  await estable()
  resultados.push({caso:'errores, datos anteriores y recuperación por recurso',ok:true});console.log('PASA errores conservados y recuperables')
  for(const recurso of ['cupos','inicio/contexto']){
    const gate=compuerta(),antes=await medir(),fondoAnterior=await fondoActualizacion()
    await page.route(`**/api/${recurso}`,async r=>{const response=await r.fetch();gate.entrar();await gate.espera;await r.fulfill({response})})
    try{
      await page.evaluate(()=>window.dispatchEvent(new Event('online')));await entraron(gate)
      assert.equal(await actualizar().getAttribute('aria-busy'),'true',`${recurso} pendiente debe mantener progreso`)
      await progresoVisible(fondoAnterior)
      sinSalto(antes,await medir(),`${recurso}: actualización automática`)
      gate.abrir();await estable();sinSalto(antes,await medir(),`${recurso}: recuperación automática`)
      resultados.push({caso:`progreso automático de ${recurso}`,ok:true})
    }finally{gate.abrir();await page.unrouteAll({behavior:'wait'})}
  }
  await page.locator('.casa-nav-movil').getByRole('link',{name:'Perfil',exact:true}).click()
  await page.waitForURL(url+'/perfil')
  const cuentaPerfil=compuerta(),perfil=compuerta()
  await page.route('**/api/yo',async r=>{const response=await r.fetch();cuentaPerfil.entrar();await cuentaPerfil.espera;await r.fulfill({response})})
  await page.route('**/api/perfil',async r=>{const response=await r.fetch();perfil.entrar();await perfil.espera;await r.fulfill({response})})
  try{
    await page.evaluate(()=>window.dispatchEvent(new Event('online')));await entraron(cuentaPerfil,perfil)
    await page.getByText('Actualizando tu cuenta…',{exact:true}).waitFor()
    assert.equal(await page.locator('.inicio-redisenado').count(),0)
    resultados.push({caso:'EstadoCuenta conserva su presentación por defecto fuera de Inicio',ok:true})
  }finally{cuentaPerfil.abrir();perfil.abrir();await page.unrouteAll({behavior:'wait'})}
  console.log('PASA progreso de otros recursos y comportamiento fuera de Inicio')
  assert.deepEqual(errores,[]);assert.deepEqual(externas,[])
}catch(error){resultados.push({ok:false,error:error.message});console.error(error);process.exitCode=1;await page.screenshot({path:`${dir}/fallo-estabilidad.png`,fullPage:true})}
finally{writeFileSync(`${dir}/estabilidad.json`,JSON.stringify({resultados,errores,externas},null,2));await browser.close()}
