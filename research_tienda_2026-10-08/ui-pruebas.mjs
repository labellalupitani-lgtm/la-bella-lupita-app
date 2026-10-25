import assert from 'node:assert/strict'
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { servidor } from './ui-servidor.mjs'
const require=createRequire(new URL('../club-lupita/package.json',import.meta.url))
const {chromium,firefox,webkit}=require('playwright')
const axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8')
const out=join(import.meta.dirname,'evidencia-ui');mkdirSync(out,{recursive:true})
const filtro=(process.env.TIENDA_CASOS||'').split(',').filter(Boolean)
const previos=filtro.length?JSON.parse(readFileSync(join(out,'resultados.json'),'utf8')):{resultados:[],errores:[]}
const resultados=previos.resultados.filter(r=>!filtro.includes(r.id)),errores=[]
let browser,t
const guardar=()=>writeFileSync(join(out,'resultados.json'),JSON.stringify({alcance:'Frontend recompilado actual; Worker actual; PostgreSQL PGlite sintético, peticiones externas bloqueadas. Los casos OBSERVADO pueden reproducir defectos, no indican aprobación del producto.',resultados,errores},null,2))
async function caso(id,fn) {
  if(filtro.length&&!filtro.includes(id))return
  try {const datos=await fn();resultados.push({id,estado:'OBSERVADO',...datos});console.log(id+': OBSERVADO')}
  catch(e){resultados.push({id,estado:'ERROR_PRUEBA',error:e.message});console.log(id+': ERROR '+e.message.slice(0,300))}
  guardar()
}
async function pagina(width=390,b=browser) {
  const ctx=await b.newContext({viewport:{width,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
  await ctx.route('**/*',r=>r.request().url().startsWith(t.url+'/')?r.continue():r.abort())
  await ctx.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),t.token)
  const p=await ctx.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errores.push(e.message))
  return p
}
async function lista(p) {
  await p.goto(t.url+'/tienda');await p.getByRole('button',{name:'Apartar la mía',exact:true}).waitFor()
  await p.evaluate(()=>document.fonts.ready)
}
async function evidencia(p,id) {
  await p.screenshot({path:join(out,id+'.png'),fullPage:true,animations:'disabled'})
  writeFileSync(join(out,id+'.aria.txt'),await p.locator('body').ariaSnapshot())
}
const foco=p=>p.evaluate(()=>({tag:document.activeElement.tagName,texto:document.activeElement.textContent?.trim().slice(0,120),disabled:document.activeElement.disabled}))
try {
  t=await servidor();browser=await chromium.launch({channel:'msedge',headless:true})
  for(const w of [320,390,768,1024,1440])await caso('base-'+w,async()=>{
    const p=await pagina(w);await lista(p);await evidencia(p,'base-'+w)
    await p.addScriptTag({content:axe});const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}))
    const datos=await p.evaluate(()=>({ancho:innerWidth,scroll:document.documentElement.scrollWidth,titulo:document.title,
      ctaY:document.querySelector('main button').getBoundingClientRect().top,
      imagenesProducto:document.querySelectorAll('main img').length,
      h1:document.querySelectorAll('h1').length,
      recursos:performance.getEntriesByType('resource').map(r=>({nombre:new URL(r.name).pathname,bytes:r.transferSize,duracion:r.duration}))}))
    await p.context().close();return{...datos,axeViolaciones:a.violations.map(v=>({id:v.id,impact:v.impact,nodos:v.nodes.length})),axeIncompletos:a.incomplete.map(v=>v.id)}
  })
  await caso('modal-teclado',async()=>{
    const p=await pagina();await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click()
    const d=p.getByRole('dialog',{name:'Una bolsa de la Reserva'});await d.waitFor();const inicial=await foco(p)
    await evidencia(p,'modal-teclado');await p.addScriptTag({content:axe})
    const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}))
    const pasos=[];for(let i=0;i<6;i++){await p.keyboard.press('Tab');pasos.push(await foco(p))}
    await p.keyboard.press('Escape');await d.waitFor({state:'hidden'});const cierre=await foco(p)
    await p.context().close();return{focoInicial:inicial,pasos,focoCierre:cierre,axeViolaciones:a.violations.map(v=>({id:v.id,impact:v.impact}))}
  })
  await caso('saldo-insuficiente',async()=>{
    const p=await pagina();await p.route('**/api/yo',async r=>{const resp=await r.fetch();const b=await resp.json();b.saldo={pagado:0,bono:0,total:0};await r.fulfill({response:resp,json:b})})
    await lista(p);assert.equal(await p.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled(),false)
    await p.getByRole('button',{name:'Ver mi cuenta y recargar'}).click();await p.getByRole('button',{name:'Recargá',exact:true}).waitFor()
    await evidencia(p,'saldo-insuficiente-destino');const destino=p.url();const cuerpo=await p.locator('main').innerText()
    await p.context().close();return{destino,abreRecarga:false,textoDestino:cuerpo}
  })
  await caso('agotado',async()=>{
    const p=await pagina();await p.route('**/api/catalogo',async r=>{const resp=await r.fetch();const b=await resp.json();b.bolsa.quedan=0;await r.fulfill({response:resp,json:b})})
    await p.goto(t.url+'/tienda');await p.getByText('Las 150 están apartadas').waitFor();await evidencia(p,'agotado');const cta=await p.getByRole('button',{name:'Apartar la mía',exact:true}).count();await p.context().close();return{botonesCompra:cta}
  })
  await caso('catalogo-cargando',async()=>{
    const p=await pagina(1440);let soltar;const espera=new Promise(r=>soltar=r)
    await p.route('**/api/catalogo',async r=>{await espera;await r.continue()})
    await p.goto(t.url+'/tienda');await p.getByText('Actualizando el catálogo…').waitFor()
    await p.getByRole('heading',{name:'No pudimos abrir tu cuenta'}).waitFor();await evidencia(p,'catalogo-cargando')
    const durante=await p.locator('main').innerText();soltar();await p.getByRole('button',{name:'Apartar la mía',exact:true}).waitFor();await p.context().close();return{falsoErrorDuranteCarga:true,texto:durante}
  })
  await caso('catalogo-error-recuperacion',async()=>{
    const p=await pagina();let fallar=true
    await p.route('**/api/catalogo',r=>fallar?r.fulfill({status:503,json:{error:'Error de catálogo sintético'}}):r.continue())
    await p.goto(t.url+'/tienda');await p.getByRole('button',{name:'Actualizar catálogo',exact:true}).waitFor();await evidencia(p,'catalogo-error')
    fallar=false;await p.getByRole('button',{name:'Actualizar catálogo',exact:true}).click();await p.getByRole('button',{name:'Apartar la mía',exact:true}).waitFor();await p.context().close();return{reintentoRecupera:true}
  })
  await caso('catalogo-malformado',async()=>{
    const p=await pagina();await p.route('**/api/catalogo',r=>r.fulfill({json:{experiencias:[],zonas:[],bolsa:{},membresia:{}}}))
    await lista(p);const texto=await p.locator('main').innerText();await evidencia(p,'catalogo-malformado');await p.context().close();return{contieneNaN:texto.includes('NaN'),texto}
  })
  await caso('rechazo-compra-foco',async()=>{
    const p=await pagina();let soltar;const espera=new Promise(r=>soltar=r)
    await p.route('**/api/reserva-cosecha/apartar',async r=>{await espera;await r.fulfill({status:409,json:{error:'Saldo insuficiente sintético'}})})
    await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click()
    await p.getByRole('dialog').waitFor({state:'hidden'});const pendiente=await foco(p);await evidencia(p,'compra-pendiente')
    soltar();await p.getByRole('alert').filter({hasText:'Saldo insuficiente sintético'}).waitFor();const rechazo=await foco(p)
    await evidencia(p,'compra-rechazada');await p.context().close();return{dialogoCierraAntesDeRespuesta:true,focoPendiente:pendiente,focoRechazo:rechazo}
  })
  await caso('exito-compra-malformado',async()=>{
    const p=await pagina();await p.route('**/api/reserva-cosecha/apartar',r=>r.fulfill({json:{cobrado:89000,saldo:{total:901000,pagado:901000,bono:0}}}))
    await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click()
    await p.getByText(/Es tuya la bolsa undefined/).first().waitFor();await evidencia(p,'compra-exito-malformado');await p.context().close();return{aceptaExitoSinNumero:true}
  })
  await caso('compra-real-local-posventa',async()=>{
    const p=await pagina(320);await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click()
    await p.getByText(/Es tuya la bolsa 001/).first().waitFor();await p.getByText(/Tenés C\$ 9,010/).waitFor();await evidencia(p,'compra-exito-320')
    const toast=await p.locator('[aria-live="polite"]').allTextContents();const enlacesCompras=await p.getByRole('link',{name:/compra/}).count()+await p.getByRole('button',{name:/compras|comprobante/}).count()
    await p.getByRole('button',{name:'Perfil',exact:true}).click();await p.getByRole('button',{name:/Mis compras y reservas/}).click()
    await p.getByRole('heading',{name:'Reserva de Cosecha · bolsa 1'}).waitFor();await evidencia(p,'historial-bolsa')
    const historial=await p.locator('main').innerText();await p.context().close();return{toast,enlacesComprasEnTienda:enlacesCompras,historial}
  })
  await caso('respuesta-perdida-saldo-exacto',async()=>{
    const nuevo=await servidor();const anterior=t;t=nuevo
    try {
      await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,-901000,'consumo','Ajuste sintético a saldo exacto')",[t.id])
      const p=await pagina();let cobros=0
      await p.route('**/api/reserva-cosecha/apartar',async r=>{cobros++;await r.fetch();await r.abort('connectionfailed')})
      await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click()
      await p.getByRole('alert').filter({hasText:'no pudimos confirmar'}).waitFor();await evidencia(p,'respuesta-perdida-antes-recarga')
      await p.reload();await p.getByRole('button',{name:'Ver mi cuenta y recargar'}).waitFor();await evidencia(p,'respuesta-perdida-despues-recarga')
      const disabled=!await p.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled()
      const pendientes=await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('club-lupita:compra:')).length)
      const compras=(await t.db.query('SELECT count(*)::int n FROM reserva_cosecha WHERE socio_id=$1',[t.id])).rows[0].n
      const texto=await p.locator('main').innerText();await p.context().close();assert.equal(compras,1);assert.equal(disabled,true)
      return{cobros,compras,pendientesLocalStorage:pendientes,ctaBloqueadoTrasRecargar:disabled,texto}
    } finally {await nuevo.close();t=anterior}
  })
  await caso('exito-anterior-error-nuevo',async()=>{
    const p=await pagina();await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click()
    await p.getByText(/Es tuya la bolsa/).first().waitFor();await p.getByRole('button',{name:'Apartar la mía',exact:true}).waitFor()
    await p.route('**/api/reserva-cosecha/apartar',r=>r.fulfill({status:409,json:{error:'Segundo intento rechazado sintético'}}))
    await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click()
    await p.getByRole('alert').filter({hasText:'Segundo intento rechazado'}).waitFor();await evidencia(p,'exito-anterior-error-nuevo')
    const viejo=await p.locator('[aria-live="polite"]').allTextContents();await p.context().close();return{mensajeExitoAnterior:viejo,nuevoRechazoVisible:true}
  })
  await caso('precio-en-pantalla-vs-cobrado',async()=>{
    const p=await pagina();await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click()
    const confirmacion=await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).innerText()
    await t.db.query('UPDATE reserva_cosecha SET precio=99000 WHERE apartada IS NULL')
    await p.getByRole('button',{name:'Sí, cobrá C$ 890',exact:true}).click();await p.getByText(/Se fueron C\$ 990/).first().waitFor()
    await evidencia(p,'precio-en-pantalla-vs-cobrado');const resultado=await p.locator('[aria-live="polite"]').allTextContents()
    await t.db.query('UPDATE reserva_cosecha SET precio=89000');await p.context().close();return{confirmacion,resultado,reconfirmacionDe990:false}
  })
  for(const [nombre,tipo]of[['firefox',firefox],['webkit',webkit]])await caso('motor-'+nombre,async()=>{
    const b=await tipo.launch({headless:true});try{const p=await pagina(390,b);await lista(p);await p.getByRole('button',{name:'Apartar la mía',exact:true}).click();await p.getByRole('dialog').waitFor();await evidencia(p,'motor-'+nombre);await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});const f=await foco(p);await p.context().close();return{version:b.version(),abreYCierra:true,focoCierre:f}}finally{await b.close()}
  })
} finally {await browser?.close();await t?.close();guardar()}
