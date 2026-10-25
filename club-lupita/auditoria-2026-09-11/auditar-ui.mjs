import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const extra = createRequire(join(tmpdir(),'club-lupita-audit-20260911','package.json'));
const { chromium } = extra('playwright');
const out=import.meta.dirname;
mkdirSync(join(out,'capturas'),{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'});
// Garantía de aislamiento: ningún recurso ni solicitud sale a producción.
await ctx.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
const page=await ctx.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const results=[];
const record=(name,data)=>{results.push({name,...data});console.log(JSON.stringify(results.at(-1)));};
const go=async path=>{await page.goto('http://127.0.0.1:5199'+path);await page.getByRole('main').waitFor();await page.evaluate(()=>document.fonts.ready);};
try {
  await go('/');
  await page.screenshot({path:join(out,'capturas','umbral-390.png'),fullPage:true});
  record('signup-disabled',{disabled:await page.getByRole('button',{name:'Unite al club'}).isDisabled()});
  await page.getByRole('button',{name:'Entrar con la cuenta de muestra'}).click();
  await page.getByText('Buenas, Prueba').waitFor();
  const storage=await ctx.storageState();
  for(const width of [360,390,1440]) {
    await page.setViewportSize({width,height:844});
    for(const path of ['/','/pedir','/tienda','/club','/perfil','/reservar','/kit']) {
      await go(path);
      if(path!=='/kit') await page.getByRole('heading').first().waitFor();
      const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('h1').length}));
      record('viewport',{path,width,...metrics});
      if(width===390) {
        await page.screenshot({path:join(out,'capturas',(path==='/'?'inicio':path.slice(1))+'-390.png'),fullPage:true});
        await page.addScriptTag({content:readFileSync(extra.resolve('axe-core/axe.min.js'),'utf8')});
        const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
        record('axe',{path,violations:axe});
      }
    }
  }
  await page.setViewportSize({width:390,height:844});
  await go('/perfil');
  record('birthday',{expected:'14 de septiembre',visible:await page.getByText(/septiembre.*el regalo/).innerText()});
  record('cancel-membership-control',{count:await page.getByRole('button',{name:/cancelar|cortar|renovación/i}).count()});
  await go('/tienda');
  await page.getByRole('button',{name:'Apartar la mía'}).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  record('dialog-escape',{visible:await page.getByRole('dialog').count(),focus:await page.evaluate(()=>document.activeElement?.textContent)});
  // La primera compra se guarda, pero se pierde su respuesta en la red.
  const before=await page.evaluate(async()=> (await fetch('/api/yo',{headers:{authorization:'Bearer '+localStorage.getItem('club-lupita:sesion')}})).json());
  const priorIds=new Set(before.movimientos.map(m=>String(m.id)));
  const refs=[];
  let lost=false;
  await page.route('**/api/reserva-cosecha/apartar',async route=>{
    refs.push(route.request().postDataJSON().ref);
    if(!lost){lost=true;await route.fetch();await route.abort('failed');}
    else await route.continue();
  });
  await page.getByRole('button',{name:'Apartar la mía'}).click();
  await page.getByRole('button',{name:'Sí, cobrá C$ 890'}).click();
  await page.getByRole('alert').filter({hasText:/cayó la señal/}).waitFor();
  await page.getByRole('button',{name:'Inicio',exact:true}).click();
  await page.getByRole('button',{name:'Tienda',exact:true}).click();
  await page.getByRole('button',{name:'Apartar la mía'}).click();
  await page.getByRole('button',{name:'Sí, cobrá C$ 890'}).click();
  await page.getByText(/Es tuya la bolsa/).last().waitFor();
  const account=await page.evaluate(async()=> (await fetch('/api/yo',{headers:{authorization:'Bearer '+localStorage.getItem('club-lupita:sesion')}})).json());
  record('purchase-lost-response-navigation',{differentRefs:refs.length===2&&refs[0]!==refs[1],refs,charges:account.movimientos.filter(m=>!priorIds.has(String(m.id))&&m.concepto.startsWith('Reserva de Cosecha'))});
  await go('/perfil');
  await page.route('**/api/yo',route=>route.abort('internetdisconnected'));
  await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();
  await page.getByText('Buenas, Prueba').waitFor();
  record('logout-offline',{stillShowsAccount:await page.getByText('Buenas, Prueba').isVisible(),tokenRemoved:await page.evaluate(()=>localStorage.getItem('club-lupita:sesion')===null)});
  await page.screenshot({path:join(out,'capturas','logout-offline-390.png'),fullPage:true});
  const malformed=await browser.newContext({storageState:storage,viewport:{width:390,height:844}});
  await malformed.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await malformed.route('**/api/yo',route=>route.fulfill({status:200,contentType:'text/html',body:'<html>Unexpected proxy response</html>'}));
  const badPage=await malformed.newPage();
  await badPage.goto('http://127.0.0.1:5199/');
  await badPage.getByRole('navigation').waitFor();
  record('malformed-200',{mainCount:await badPage.getByRole('main').count(),body:await badPage.locator('body').innerText()});
  await badPage.screenshot({path:join(out,'capturas','json-invalido-390.png'),fullPage:true});
  await malformed.close();
  record('page-errors',{errors});
} catch(e) { record('harness-error',{error:e.message}); await page.screenshot({path:join(out,'capturas','harness-error.png'),fullPage:true});process.exitCode=1; }
finally {writeFileSync(join(out,'resultados-ui.json'),JSON.stringify(results,null,2));await browser.close();}
