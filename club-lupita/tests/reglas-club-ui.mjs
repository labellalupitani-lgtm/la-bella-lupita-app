import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {readFileSync,writeFileSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
const t=await vistaAislada({tls:tlsLocal()}),browser=await chromium.launch({channel:'msedge',headless:true}),resultados=[]
const dir='entregables/conoce-tu-club-2026-10-12/evidencia'
try{
 const staff=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},reducedMotion:'reduce'})
 await staff.addCookies(t.staff.cookie.split('; ').map(x=>{const i=x.indexOf('=');return{name:x.slice(0,i),value:x.slice(i+1),domain:'127.0.0.1',path:'/',secure:true,sameSite:'Strict',httpOnly:!x.slice(0,i).includes('csrf')}}))
 await staff.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
 const p=await staff.newPage(),errores=[];p.on('pageerror',e=>errores.push(e.message));p.setDefaultTimeout(10000)
 await p.goto(t.url+'/personal?seccion=club');await p.getByRole('heading',{name:'Reglas aprobadas del club',exact:true}).waitFor()
 const activar=p.getByRole('button',{name:'Activar las cinco reglas aprobadas'});assert.equal(await activar.isDisabled(),true)
 await p.getByLabel('Comprobación realizada: fecha, responsable y resultados').fill('Ensayo sintético local: vasos, tamaños, costos y cola verificados en la prueba. No es evidencia de producción.')
 await p.getByLabel('Verificamos estos puntos en la operación real y autorizo la activación.').check();await activar.click()
 await p.getByRole('alert').filter({hasText:'Registrá los costos reales'}).waitFor()
 await t.db.exec('UPDATE club_config SET costo_cafe=1000,costo_bolsa=15000,costo_fijo_periodo=5000')
 await activar.click();await p.getByText('Reglas activadas con versión y comprobación operativa.').waitFor()
 await p.getByText('Activa para la operación;', {exact:false}).waitFor();resultados.push('Activación bloqueada sin costos; evidencias sintéticas habilitan solo fixture local')
 await p.goto(t.url+'/personal?seccion=caja');await p.getByLabel('Teléfono o código del pase').fill(t.tel);await p.getByRole('button',{name:'Buscar cliente',exact:true}).click()
 await p.getByLabel('Referencia del ticket de caja',{exact:true}).fill('NUEVA-UI-SELLO-001')
 const sello=p.getByRole('button',{name:'Acreditar sello de esta compra'});assert.equal(await sello.isDisabled(),true)
 await p.getByLabel('Importe neto elegible del ticket, en córdobas').fill('100');await p.getByLabel('Verifiqué el ticket y su importe elegible.').check();await sello.click();await p.getByText('Sello registrado',{exact:true}).waitFor()
 assert.equal((await t.db.query('SELECT neto FROM club_ticket_validacion')).rows[0].neto,10000);resultados.push('Caja acredita con ticket, neto elegible y confirmación')
 // El premio previo sigue siendo previo. Preparar una nueva tanda de la versión activada.
 const legado=(await t.request('/api/tanda/canjear',{})).body.codigo
 assert.equal((await t.request('/api/vale/quemar',{codigo:legado},t.staff)).status,200)
 for(let i=0;i<9;i++)await t.request('/api/tanda/sellar',{telefono:t.tel,ticket:'PREMIO-UI-SELLO-'+i,netoElegible:10000,confirmoElegible:true},t.staff)
 const codigo=(await t.request('/api/tanda/canjear',{})).body.codigo
 await p.getByRole('button',{name:'Premio por sellos',exact:true}).click();await p.getByLabel('Código del vale').fill(codigo);await p.getByRole('button',{name:'Consultar vale',exact:true}).click()
 const entrega=p.getByRole('button',{name:'Confirmar entrega de la bebida'});assert.equal(await entrega.isDisabled(),true)
 await p.getByLabel('Bebida entregada, presentación regular y sin extras').selectOption('latte');await entrega.click();await p.getByText('Bebida entregada y vale utilizado.').waitFor();resultados.push('Premio nuevo requiere seleccionar bebida aprobada')
 const cliente=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844}})
 await cliente.addInitScript(token=>{localStorage.setItem('club-lupita:sesion',token)},t.token)
 await cliente.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
 const q=await cliente.newPage();q.on('pageerror',e=>errores.push(e.message));await q.goto(t.url+'/club');await q.getByRole('heading',{name:'Lista de espera del Salón VIP'}).waitFor()
 await q.getByLabel('Acepto que la casa gestione esta solicitud. La espera no garantiza mesa.').check();await q.getByRole('button',{name:'Solicitar espera VIP'}).click();await q.getByText('Solicitud registrada. Podés consultar su estado aquí.').waitFor()
 await p.goto(t.url+'/personal?seccion=club');await p.getByLabel('Gestión con Prueba Regresión',{exact:true}).fill('Disponibilidad validada en ensayo local')
 await p.getByRole('button',{name:'Registrar oferta a Prueba Regresión'}).click();await p.getByText('Oferta registrada; acordá la reserva con su titular por el flujo habitual.').waitFor()
 await q.getByRole('button',{name:'Actualizar solicitudes VIP'}).click();await q.getByText('La casa registró la gestión de una oferta;', {exact:false}).waitFor()
 await q.getByRole('button',{name:/Cancelar solicitud del/}).click();await q.getByText('Solicitud VIP cancelada. No se modificó ninguna reserva.').waitFor();resultados.push('Solicitud cliente, gestión de administración, actualización y cancelación VIP sin cargos')
 for(const [pagina,nombre] of [[p,'reglas-equipo'],[q,'reglas-cliente']]){
  await pagina.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const axe=await pagina.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>({id:v.id,n:v.nodes.length})),[]);await pagina.screenshot({path:dir+'/'+nombre+'.png',fullPage:true})
 }
 assert.deepEqual(errores,[])
}finally{await browser.close();await t.close();writeFileSync(dir+'/reglas-interfaz.json',JSON.stringify({resultados},null,2))}
