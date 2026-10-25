import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { vistaAislada } from './soporte-ui.mjs'

const dir='entregables/continuidad-modulos-2026-10-21/evidencia/acceso'
mkdirSync(dir,{recursive:true})
const t=await vistaAislada(), browser=await chromium.launch({channel:'msedge',headless:true})
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
const page=await context.newPage(), results=[],errors=[],external=[]
page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message))
await context.route('**/*',r=>{if(new URL(r.request().url()).origin===t.url)return r.continue();external.push(r.request().url());return r.abort()})
async function test(name,fn){await fn();results.push({name,pass:true});console.log('PASA '+name)}
const detail=()=>page.getByRole('dialog',{name:'Latte',exact:true})
let code
try {
  await test('el detalle público distingue ingreso y mantiene una acción disponible',async()=>{
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:844});await page.goto(t.url+'/pedir?momento=brunch&q=latte&plato=latte')
      await detail().waitFor();await detail().getByText(/Ingresá a tu cuenta para pedir/).waitFor()
      assert.equal(await detail().getByRole('button',{name:'Ingresar para pedir'}).isEnabled(),true)
      assert.equal(await detail().getByRole('button',{name:'Aumentar cantidad'}).count(),0)
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
      if(width===390)await page.screenshot({path:dir+'/detalle-publico.png'})
    }
  })
  await test('ir al acceso y volver conserva plato, consulta y categoría aun sin servicio',async()=>{
    await page.setViewportSize({width:320,height:700});await detail().getByRole('button',{name:'Ingresar para pedir'}).click()
    await page.getByLabel('Correo electrónico').waitFor()
    assert.equal(new URL(page.url()).searchParams.get('plato'),'latte')
    assert.equal(new URL(page.url()).searchParams.get('q'),'latte')
    assert.equal(new URL(page.url()).searchParams.get('momento'),'brunch')
    await page.getByText(/Estamos preparando el registro/).waitFor()
    await page.getByRole('button',{name:'Volver a la carta',exact:true}).click();await detail().waitFor()
    assert.equal(new URL(page.url()).searchParams.has('acceso'),false)
  })
  await test('alta real con correo simulado vuelve al producto sin agregar ni cobrar automáticamente',async()=>{
    t.env.ACCESO_CORREO='true';t.env.EMAIL_FROM='prueba@example.com'
    t.env.EMAIL={send:async msg=>{code=msg.text.match(/es (\d{6})/)[1];return{messageId:'solo-local'}}}
    await detail().getByRole('button',{name:'Ingresar para pedir'}).click()
    await page.getByLabel('Correo electrónico').fill('continuidad@example.com')
    await page.getByRole('button',{name:'Continuar con mi correo'}).click()
    await page.getByLabel('Código de verificación').waitFor()
    await page.getByLabel('Código de verificación').fill(code)
    await page.getByRole('button',{name:'Verificar y continuar'}).click()
    await page.getByLabel('Tu nombre',{exact:true}).fill('Continuidad de prueba')
    await page.getByLabel('Número de teléfono').fill('88882222')
    await page.getByRole('button',{name:'Crear mi cuenta'}).click();await detail().waitFor()
    assert.equal(await detail().getByRole('button',{name:/Agregar ·/}).isEnabled(),true)
    assert.equal(new URL(page.url()).searchParams.get('q'),'latte')
    assert.equal(new URL(page.url()).searchParams.get('momento'),'brunch')
    assert.equal((await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n,0)
    await page.keyboard.press('Escape');await detail().waitFor({state:'hidden'})
    assert.equal(await page.getByRole('searchbox').inputValue(),'latte')
  })
  await test('agotado se identifica sin confundirlo con ingreso',async()=>{
    await context.clearCookies()
    await page.route('**/api/carta',async route=>{
      const response=await route.fetch(), data=await response.json()
      data.platos=data.platos.map(p=>p.id==='latte'?{...p,disponible:false}:p)
      await route.fulfill({json:data})
    })
    await page.goto(t.url+'/pedir?plato=latte');await detail().waitFor()
    await detail().getByText(/Este producto está agotado/).waitFor()
    assert.equal(await detail().getByRole('button',{name:'Agotado por ahora',exact:true}).isDisabled(),true)
    assert.equal(await detail().getByRole('button',{name:'Ingresar para pedir'}).count(),0)
    await page.unroute('**/api/carta')
  })
  await test('ingreso desde agregar en lista conserva el producto; foco, reflujo y axe',async()=>{
    await page.goto(t.url+'/pedir?q=latte&momento=brunch')
    await page.getByRole('button',{name:/^Agregar Latte al pedido/}).click()
    await page.getByLabel('Correo electrónico').waitFor()
    assert.equal(new URL(page.url()).searchParams.get('plato'),'latte')
    await page.addStyleTag({content:'html{font-size:200%!important}'})
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
    await page.getByRole('button',{name:'Volver a la carta',exact:true}).click();await detail().waitFor()
    const button=detail().getByRole('button',{name:'Ingresar para pedir'})
    await button.focus();assert.equal(await button.evaluate(e=>e===document.activeElement),true)
    const bounds=await button.boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=700)
    await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
    const a=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations)
    writeFileSync(dir+'/axe.json',JSON.stringify(a,null,2));assert.deepEqual(a,[])
    assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  })
}finally{writeFileSync(dir+'/resultados.json',JSON.stringify({results,errors,external},null,2));await browser.close();await t.close()}
