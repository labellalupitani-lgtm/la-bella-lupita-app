import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join, extname, sep } from 'node:path'
import { chromium, firefox } from '../club-lupita/node_modules/playwright/index.mjs'
import { preparar } from '../club-lupita/tests/soporte-perfiles-equipo.mjs'

const base = import.meta.dirname, out = join(base, 'evidencia-ui'), build = join(base, 'build')
mkdirSync(out, { recursive: true })
const t = await preparar({ propietario: false })
let cola = Promise.resolve()
const server = createServer(async (req,res) => {
  try {
    if(req.url.startsWith('/api/')) {
      const chunks=[]; for await(const c of req) chunks.push(c)
      const job = cola.then(()=>t.worker.app.request('http://'+req.headers.host+req.url,{ method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{}) },t.env,t.ctx))
      cola=job.catch(()=>{}); const r=await job
      res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))
    } else {
      let file=resolve(build,'.'+new URL(req.url,'http://localhost').pathname)
      if(!file.startsWith(build+sep)||!existsSync(file)||!extname(file)) file=join(build,'index.html')
      const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'}
      res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(readFileSync(file))
    }
  }catch(e){res.writeHead(500);res.end(JSON.stringify({error:e.message}))}
})
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port
const motor=process.env.MOTOR||'edge'
const browser=await (motor==='firefox'?firefox.launch({headless:true}):chromium.launch({channel:'msedge',headless:true}))
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
await ctx.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),t.token)
const page=await ctx.newPage();page.setDefaultTimeout(10000)
const results=[],screens=[],errors=[];page.on('pageerror',e=>errors.push(e.message))
const axe=readFileSync(join(base,'../club-lupita/node_modules/axe-core/axe.min.js'),'utf8')
const save=()=>writeFileSync(join(out,'resultados-'+motor+'.json'),JSON.stringify({motor,version:browser.version(),fechaLocal:'2026-10-08',results,screens,errors},null,2))
async function check(name,fn){try{const evidence=await fn();results.push({name,estado:'COMPROBADO',evidence});console.log('COMPROBADO '+name)}catch(e){results.push({name,estado:'NO_COMPLETADO',error:e.message});console.log('NO_COMPLETADO '+name+': '+e.message.slice(0,250))}save()}
async function go(){await page.goto(url+'/club');await page.locator('#club-bienvenida').waitFor();await page.getByText('Actualizando el catálogo…',{exact:true}).waitFor({state:'hidden'});await page.evaluate(()=>document.fonts.ready)}
async function snap(name,audit=true){
  await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))))
  const data=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,positions:Object.fromEntries(['club-bienvenida','club-premio-titulo','club-beneficios','club-experiencias','club-mesa'].map(id=>{const e=document.getElementById(id);return[id,e?Math.round(e.getBoundingClientRect().top+scrollY):null]})),buttons:[...document.querySelectorAll('main button')].map(e=>({text:e.innerText,disabled:e.disabled,top:Math.round(e.getBoundingClientRect().top+scrollY),width:Math.round(e.getBoundingClientRect().width),height:Math.round(e.getBoundingClientRect().height)}))}))
  const file=name+'-'+motor+'.png';await page.screenshot({path:join(out,file),fullPage:!(await page.getByRole('dialog').count())})
  let violations=[]
  if(audit){await page.addScriptTag({content:axe});violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,why:n.failureSummary}))}))})}
  const record={name,file,...data,audited:audit,violations};screens.push(record);save();return record
}
try {
  await t.db.query("UPDATE membresia SET estado='activa',desde=now()-interval '15 days',hasta=now()+interval '15 days',autorenueva=true,renovacion_consentida=now() WHERE socio_id=$1",[t.id])
  for(const width of [1440,1024,768,390,320]) await check('Membresía activa a '+width+' px',async()=>{await page.setViewportSize({width,height:width>=1000?960:844});await go();const s=await snap('activa-'+width);assert(s.width<=s.viewport+1);return s.positions})
  await check('Texto 200 por ciento a 390 px',async()=>{await page.setViewportSize({width:390,height:844});await go();await page.addStyleTag({content:'html{font-size:200% !important}'});const s=await snap('texto-200');return {desborde:s.width>s.viewport+1,width:s.width}})
  await check('Generar código no consume beneficio y hay foco modal',async()=>{
    await go();await page.getByRole('button',{name:'Mostrar código',exact:true}).first().click();await page.getByRole('dialog').waitFor()
    const code=await page.getByRole('dialog').locator('p').first().innerText();const foco=await page.evaluate(()=>({tag:document.activeElement?.tagName,text:document.activeElement?.textContent,modal:!!document.activeElement?.closest('dialog')}))
    await snap('codigo-bolsa');const yo=(await t.request('/api/yo')).body;assert.equal(yo.bolsaDelMes,null)
    await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});const focusReturn=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id,text:document.activeElement?.textContent?.slice(0,90)}))
    return {foco,focusReturn,longitudCodigo:code.length,bolsaSinConsumir:yo.bolsaDelMes===null}
  })
  await check('Error de beneficio queda visible desde su acción',async()=>{
    await page.route('**/api/beneficios/solicitar',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Servicio no disponible durante esta prueba aislada'})}))
    await page.getByRole('button',{name:'Mostrar código',exact:true}).last().click();await page.getByRole('alert').waitFor()
    const geometry=await page.getByRole('alert').evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,viewport:innerHeight,text:e.textContent}))
    await snap('error-beneficio');await page.unroute('**/api/beneficios/solicitar');return geometry
  })
  await check('Cancelación y feedback persistente',async()=>{
    await go();await page.getByRole('button',{name:'Cancelar renovación',exact:true}).click();await page.getByRole('dialog').waitFor();await snap('cancelar-confirmacion')
    await page.getByRole('button',{name:'Sí, cancelar renovación',exact:true}).click();await page.getByRole('button',{name:'Activar renovación automática',exact:true}).waitFor()
    await snap('cancelada');return{autorenueva:(await t.request('/api/yo')).body.membresia.autorenueva,status:await page.locator('[aria-live]').allTextContents(),cerrarAviso:await page.getByRole('button',{name:/cerrar aviso|descartar/i}).count()}
  })
  await check('Compra experiencia durante respuesta pendiente',async()=>{
    let release, started;const gate=new Promise(r=>release=r),begin=new Promise(r=>started=r)
    await page.route('**/api/experiencia/*/apartar',async r=>{started();await gate;await r.continue()})
    await page.getByRole('button',{name:'Apartar butaca',exact:true}).click();await page.getByRole('dialog').waitFor();await snap('experiencia-confirmacion')
    const dialog=await page.getByRole('dialog').innerText();await page.getByRole('dialog').getByRole('button',{name:/Sí, cobrá/}).click();await begin
    const pending={dialogAbierto:await page.getByRole('dialog').count(),busy:await page.locator('[aria-busy=true]').allTextContents(),status:await page.locator('[aria-live]').allTextContents()};await snap('experiencia-pendiente',false);const completion=page.waitForResponse(r=>r.url().includes('/api/experiencia/')&&r.request().method()==='POST');release();await completion;await page.unroute('**/api/experiencia/*/apartar')
    await page.locator('[aria-live=polite]').filter({hasText:/Butaca/}).waitFor({state:'attached'});await snap('experiencia-comprada');return{dialog,pending,success:await page.locator('[aria-live]').allTextContents(),enlaceCompra:await page.getByRole('link',{name:/compra|entrada/i}).count(),botonCompra:await page.getByRole('button',{name:/compra|entrada/i}).count()}
  })
  await check('Beneficios con datos sin refrescar al volver de otra pestaña',async()=>{
    await go();const before=await page.getByText('Disponible hoy',{exact:true}).count();await t.db.query("INSERT INTO beneficio_uso(membresia_id,clase) SELECT id,'bebida_dia' FROM membresia WHERE socio_id=$1 AND estado='activa'",[t.id]);await page.getByRole('navigation',{name:'Secciones de Club Lupita'}).getByRole('button',{name:'Inicio',exact:true}).click();await page.getByRole('navigation',{name:'Secciones de Club Lupita'}).getByRole('button',{name:'Club',exact:true}).click()
    const after=await page.getByText('Disponible hoy',{exact:true}).count();await snap('beneficio-desactualizado');return{before,after,servidor:(await t.request('/api/yo')).body.bebidaDelDia}
  })
  await check('Recompensa de tanda y progreso reiniciado',async()=>{
    await t.db.query("INSERT INTO sello(tanda_id,n,motivo,ref_externa) SELECT id,9,'Prueba de auditoría','audit-9' FROM tanda WHERE socio_id=$1 AND cerrada IS NULL",[t.id]);await t.db.query('UPDATE tanda SET cerrada=now() WHERE socio_id=$1 AND cerrada IS NULL',[t.id]);await go();await page.getByRole('button',{name:'Mostrar mi premio'}).waitFor();await snap('premio-disponible')
    await page.getByRole('button',{name:'Mostrar mi premio'}).click();await page.getByRole('dialog').waitFor();await snap('premio-codigo');const yo=(await t.request('/api/yo')).body;await page.keyboard.press('Escape');return{premiosPendientes:yo.premiosPendientes,sellos:yo.sellos.length,codigoVivo:!!yo.vale}
  })
  await check('Sin membresía con saldo insuficiente',async()=>{
    await t.db.query("UPDATE membresia SET estado='vencida',autorenueva=false,hasta=now()-interval '1 day' WHERE socio_id=$1",[t.id]);const saldo=(await t.request('/api/yo')).body.saldo.total;await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Vaciar saldo sintético')",[t.id,-saldo]);await go();await snap('sin-saldo');return{ctaDisabled:!(await page.getByRole('button',{name:/Tomar una plaza/}).isEnabled()),recargarEnMain:await page.getByRole('main').getByRole('button',{name:/recarg/i}).count(),beneficiosDetalladosVisibles:await page.getByText('15 % en toda la repostería, todos los días').count()}
  })
  await check('Estado en gracia servido por la API',async()=>{
    await t.db.query("UPDATE membresia SET estado='en_gracia',autorenueva=true,renovacion_consentida=now(),hasta=now()-interval '1 day' WHERE socio_id=$1",[t.id]);await go();await snap('gracia-real');return{membresia:(await t.request('/api/yo')).body.membresia,db:(await t.db.query('SELECT estado,hasta FROM membresia WHERE socio_id=$1',[t.id])).rows,ctaAlta:await page.getByRole('button',{name:/Tomar una plaza/}).count()}
  })
  await check('Catálogo no disponible sin ocultar la cuenta',async()=>{
    await page.route('**/api/catalogo',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Fallo sintético del catálogo'})}));await go();await page.getByRole('button',{name:'Actualizar catálogo'}).waitFor();await snap('catalogo-error');await page.unroute('**/api/catalogo');return{reintento:true}
  })
  await check('Texto calculado duplicado a 390 px',async()=>{
    await t.db.query("UPDATE membresia SET estado='activa',hasta=now()+interval '15 days' WHERE socio_id=$1",[t.id]);await go()
    await page.evaluate(()=>{const els=[...document.querySelectorAll('body *')].map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)}));for(const {e,size,line} of els){e.style.setProperty('font-size',size*2+'px','important');if(Number.isFinite(line))e.style.setProperty('line-height',line*2+'px','important')}})
    const s=await snap('texto-calculado-200',false);await page.screenshot({path:join(out,'texto-200-portada-'+motor+'.png')})
    const pase=await page.locator('.pase-frente').evaluate(e=>({alto:e.clientHeight,contenido:e.scrollHeight,elementos:[...e.children].map(c=>({text:c.textContent.slice(0,50),top:Math.round(c.getBoundingClientRect().top-e.getBoundingClientRect().top),bottom:Math.round(c.getBoundingClientRect().bottom-e.getBoundingClientRect().top)}))}))
    return{width:s.width,viewport:s.viewport,pase,metodo:'Todos los font-size calculados multiplicados por 2, line-height numérico también; simulación de texto ampliado. No ejecutar axe sobre estilos introducidos por la prueba.'}
  })
  await check('Espaciado WCAG a 390 px',async()=>{
    await go();await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'})
    const s=await snap('espaciado-wcag');await page.screenshot({path:join(out,'espaciado-portada-'+motor+'.png')});return{width:s.width,viewport:s.viewport}
  })
} finally {save();await browser.close();await new Promise(r=>server.close(r));await t.close()}



