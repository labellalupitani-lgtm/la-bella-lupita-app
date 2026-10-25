import assert from 'node:assert/strict'
import { chromium, webkit } from 'playwright'
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { vistaAislada } from './soporte-ui.mjs'
const motor=process.env.NAVEGADOR==='webkit'?'webkit':'edge'
const anchoInicial=process.env.ANCHO==='1440'?1440:390
const t=await vistaAislada(),out=process.env.TEST_OUTPUT_DIR||'../entregables/implementacion-identidad-2026-09-30/estados'+(motor==='webkit'?'/webkit':'')+(anchoInicial===1440?'/escritorio':'')
mkdirSync(out,{recursive:true})
await t.db.query("UPDATE membresia SET hasta=now()+interval '15 days',renovacion_consentida=now()")
const browser=await (motor==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'msedge',headless:true})),ctx=await browser.newContext({viewport:{width:anchoInicial,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
await ctx.addInitScript(token=>{if(location.search.includes('visitante'))localStorage.removeItem('club-lupita:sesion');else localStorage.setItem('club-lupita:sesion',token)},t.token)
await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
const page=await ctx.newPage();page.setDefaultTimeout(10000)
const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message))
const axe=readFileSync('node_modules/axe-core/axe.min.js','utf8')
const go=async path=>{await page.goto(t.url+path);await page.getByRole('main').waitFor();await page.waitForTimeout(100)}
async function inspect(name,{audit=true}={}){
 await page.waitForTimeout(160)
 for(const dialog of await page.getByRole('dialog').all()){
  const box=await dialog.boundingBox();assert(box&&box.y<page.viewportSize().height&&box.y+box.height>0,'El diálogo debe quedar dentro del área visible: '+name)
 }
 await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))})
 const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,small:[...document.querySelectorAll('main p,main h1,main h2,main h3,main label')].filter(e=>e.getClientRects().length&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.outerHTML.slice(0,150)),broken:[...document.images].filter(i=>i.offsetWidth&&!i.naturalWidth).map(i=>i.getAttribute('src'))}))
 await page.screenshot({path:join(out,name+'.png'),fullPage:await page.getByRole('dialog').count()===0})
 let violations=[];if(audit){await page.addScriptTag({content:axe});violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,why:n.failureSummary}))}))})}
 results.push({name,...geometry,violations});console.log('Revisado '+name)
}
try{
 await go('/');await page.getByRole('button',{name:'Recargá',exact:true}).click();await inspect('inicio-recarga');await page.keyboard.press('Escape')
 await page.getByRole('button',{name:'Mostrá tu pase'}).click();await inspect('pase-frente');await page.getByRole('button',{name:'Ver cómo usarlo'}).click();await inspect('pase-reverso');await page.keyboard.press('Escape')
 await go('/pedir');await page.getByRole('searchbox').fill('xxxxxxxx');await inspect('carta-vacia');await page.getByRole('searchbox').fill('Latte')
 await page.getByRole('button',{name:'Latte C$ 95',exact:true}).click();await inspect('producto-detalle');await page.keyboard.press('Escape')
 await page.getByRole('button',{name:'Agregar Latte al pedido',exact:true}).click();await page.getByRole('button',{name:/Ver tu pedido/}).click();await inspect('pedido-confirmar')
 await page.getByRole('button',{name:'Pagar con la Cuenta de Casa'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await inspect('pedido-enviado')
 await go('/compras');await page.getByLabel('¿Necesitás cambiar una reserva o revisar una compra?').fill('Consulta sintética de la revisión visual')
 await page.getByRole('button',{name:'Enviar solicitud a la casa'}).click();await page.getByText('Solicitud registrada La respuesta aparecerá aquí').waitFor();await inspect('compras-y-ayuda')
 await go('/tienda');await page.getByRole('button',{name:'Apartar la mía'}).click();await inspect('tienda-confirmar');await page.keyboard.press('Escape')
 await go('/club');await page.getByRole('button',{name:'Cancelar renovación',exact:true}).click();await inspect('membresia-cancelacion');await page.keyboard.press('Escape')
 await page.getByRole('button',{name:'Mostrar código'}).first().click();await page.getByRole('dialog').waitFor();await inspect('beneficio-codigo');await page.keyboard.press('Escape')
 await page.getByRole('button',{name:'Apartar butaca'}).click();await inspect('experiencia-confirmar');await page.keyboard.press('Escape')
 const base=(await t.request('/api/yo')).body
 for(const [name,change] of [
 ['sin-membresia',x=>{x.membresia=null}],['sin-saldo',x=>{x.membresia=null;x.saldo={total:0,pagado:0,bono:0}}],
 ['en-gracia',x=>{x.membresia.estado='en_gracia'}],['sin-renovacion',x=>{x.membresia.autorenueva=false}],
 ['tanda-completa',x=>{x.sellos=Array.from({length:9},(_,n)=>({n:n+1}));x.premiosPendientes=1}],
 ['nombre-largo',x=>{x.socio.nombre='María de los Ángeles Hernández de Montenegro';x.membresia=null}]
 ]){
  const data=structuredClone(base);change(data);await page.route('**/api/yo',r=>r.fulfill({json:data}));await go('/club');await inspect('club-'+name);await page.unroute('**/api/yo')
 }
 await go('/perfil');await page.getByRole('button',{name:/Editar/}).first().click();await inspect('perfil-editar');await page.getByLabel('Tu nombre',{exact:true}).fill('María López');await page.getByRole('button',{name:'Guardar cambios'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal((await t.request('/api/yo')).body.socio.nombre,'María López')
 await page.getByRole('button',{name:/Ver toda|Toda la actividad|Ver actividad/}).first().click();await inspect('perfil-actividad');await page.keyboard.press('Escape')
 await go('/?visitante&demo');await page.getByRole('button',{name:'Explorar la demostración'}).waitFor();await inspect('acceso-demo')
 let codigo;t.env.ACCESO_CORREO='true';t.env.EMAIL_FROM='acceso@labellalupita.com';t.env.EMAIL={send:async mensaje=>{codigo=mensaje.text.match(/es (\d{6})/)[1];return {messageId:'local'}}}
 await go('/?visitante');await page.getByLabel('Correo electrónico').fill('identidad@example.com');await inspect('acceso-correo');await page.getByRole('button',{name:'Continuar con mi correo'}).click();await page.getByLabel('Código de verificación').waitFor();await inspect('acceso-codigo')
 await page.getByLabel('Código de verificación').fill(codigo==='000000'?'111111':'000000');await page.getByRole('button',{name:'Verificar y continuar'}).click();await page.getByRole('alert').waitFor();await inspect('acceso-error')
 await page.getByLabel('Código de verificación').fill(codigo);await page.getByRole('button',{name:'Verificar y continuar'}).click();await page.getByLabel('Tu nombre',{exact:true}).fill('Prueba de identidad');await page.getByLabel('Número de teléfono').fill('88887777');await page.getByRole('button',{name:'Crear mi cuenta'}).click();await page.getByRole('heading',{name:'Un buen día empieza aquí'}).waitFor()
 // Compras y reservas sintéticas para revisar también las filas con entregas pendientes
 assert.equal((await t.request('/api/reserva-cosecha/apartar',{ref:'identidad-bolsa-local'})).status,200)
 await t.db.query("INSERT INTO asiento_experiencia(id,experiencia_id,butaca,socio_id,pagado) VALUES($1,'mesa-tostador',1,$2,85000)",[crypto.randomUUID(),t.id])
 await t.db.query("INSERT INTO reserva(id,socio_id,zona,cuando,termina,personas,deposito) VALUES($1,$2,'terraza',now()+interval '10 days',now()+interval '10 days 2 hours',2,0)",[crypto.randomUUID(),t.id])
 const bebida=await t.request('/api/beneficios/solicitar',{clase:'bebida_dia'});assert.equal(bebida.status,200)
 await go('/compras');await inspect('compras-todos-los-tipos');await page.getByRole('button',{name:'Cancelar esta reserva'}).click();await inspect('reserva-cancelacion');await page.keyboard.press('Escape')
 // Cada rol inicia por el formulario real con credenciales efímeras
 for(const role of ['caja','cocina','encargado']){
  const employee=await t.request('/api/personal/equipo',{nombre:'Equipo de prueba '+role,usuario:'revision.'+role,permiso:role},t.staff);assert.equal(employee.status,200)
  await go('/personal');await page.evaluate(()=>sessionStorage.removeItem('club-lupita:personal'));await page.reload();await page.getByLabel('Usuario',{exact:true}).fill('revision.'+role);await page.getByLabel('Clave de acceso',{exact:true}).fill(employee.body.clave)
  await page.getByRole('button',{name:'Entrar al turno'}).click();await page.getByRole('button',{name:'Actualizar bandeja'}).waitFor()
  await inspect('personal-'+role+'-390');await page.setViewportSize({width:1440,height:900});await inspect('personal-'+role+'-1440');await page.setViewportSize({width:390,height:844})
  if(role==='cocina'){assert.equal(await page.getByRole('heading',{name:'Atender a un cliente'}).count(),0);assert.equal(await page.getByRole('button',{name:'Marcar aceptado'}).count(),0)}
  else{
   await page.getByLabel('Teléfono del cliente').fill(t.tel);await page.getByRole('button',{name:'Buscar cliente'}).click();await page.getByLabel('Referencia del ticket de caja').waitFor();await inspect('personal-'+role+'-cliente')
   if(role==='caja'){
    await page.getByRole('button',{name:'Cancelar y devolver saldo'}).first().click();await page.getByLabel('Motivo',{exact:true}).fill('Revisión con datos sintéticos');await inspect('personal-cancelacion');await page.keyboard.press('Escape')
    await page.getByLabel('Referencia del ticket de caja').fill('identidad-recarga-local');await page.getByLabel('Recarga en córdobas').fill('200');await inspect('caja-recarga');await page.getByRole('button',{name:'Confirmar pago recibido y registrar recarga'}).click();await page.getByText('Recarga registrada',{exact:true}).waitFor()
    await page.getByLabel('Referencia del ticket de caja').fill('identidad-sello-local');await page.getByRole('button',{name:'Acreditar sello de esta compra'}).click();await page.getByText('Sello registrado',{exact:true}).waitFor();await inspect('caja-sello-registrado')
    const vale=await t.request('/api/tanda/canjear',{});assert.equal(vale.status,200)
    await page.getByLabel('Código del vale').fill(vale.body.codigo);await page.getByRole('button',{name:'Consultar vale',exact:true}).click();await page.getByRole('button',{name:'Confirmar entrega de la décima'}).waitFor();await inspect('caja-vale');await page.getByRole('button',{name:'Confirmar entrega de la décima'}).click();await page.getByText('Décima entregada y vale utilizado').waitFor()
    await page.getByLabel('Código del cliente',{exact:true}).fill(bebida.body.codigo);await page.getByRole('button',{name:'Consultar beneficio'}).click();await page.getByRole('button',{name:'Confirmar entrega',exact:true}).waitFor();await inspect('caja-beneficio');await page.getByRole('button',{name:'Confirmar entrega',exact:true}).click();await page.getByText('Entrega registrada',{exact:true}).waitFor()
    for(const label of ['Registrar entrega','Registrar asistencia']){await page.getByRole('button',{name:label,exact:true}).first().click();await inspect(label==='Registrar entrega'?'bolsa-entrega':'experiencia-asistencia');await page.getByRole('button',{name:'Confirmar registro'}).click();await page.getByRole('dialog').waitFor({state:'hidden'})}
    await page.getByLabel('Respuesta y resolución').fill('Tu solicitud de prueba quedó atendida');await page.getByRole('button',{name:'Responder y cerrar solicitud'}).click();await page.getByText('No hay solicitudes pendientes en esta vista').waitFor();await inspect('atencion-resuelta')
    await page.getByRole('button',{name:'Marcar aceptado'}).click();await page.getByRole('button',{name:'Marcar preparando'}).waitFor();await inspect('pedido-aceptado')
   }
  }
  assert.equal(await page.getByRole('heading',{name:'Accesos del equipo'}).count(),role==='encargado'?1:0)
  if(role==='cocina'){await page.getByRole('button',{name:'Marcar preparando'}).click();await page.getByRole('button',{name:'Marcar listo'}).waitFor();await inspect('cocina-preparando');await page.getByRole('button',{name:'Marcar listo'}).click();await inspect('cocina-listo')}
  if(role==='encargado'){
   await page.getByRole('button',{name:'Marcar entregado'}).click();await page.getByText('No hay pedidos pendientes',{exact:true}).waitFor();await inspect('pedido-entregado')
   await page.getByLabel('Nombre del empleado').fill('Persona de prueba');await page.getByLabel('Usuario nuevo').fill('revision.nueva');await page.getByRole('combobox').selectOption('caja');await inspect('equipo-formulario')
   await page.getByRole('button',{name:'Crear acceso individual'}).click();await page.getByRole('dialog').waitFor();await page.getByRole('dialog').locator('p.break-all').evaluate(e=>e.style.visibility='hidden');await inspect('equipo-clave-oculta');await page.getByRole('button',{name:'Ya la guardé'}).click();await page.getByRole('button',{name:'Desactivar revision.nueva'}).click();await page.getByText(/Persona de prueba.*Desactivado/).waitFor();await inspect('equipo-desactivado')
  }
  await page.getByRole('button',{name:'Cerrar turno'}).click()
 }
 for(const width of [320,360,430,768,899,900,1024,1120,1121]){
  await page.setViewportSize({width,height:844});for(const path of ['/','/pedir','/club','/tienda','/perfil','/reservar','/compras','/kit','/personal']){await go(path);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} overflow ${width}`)}
  results.push({name:'responsive-'+width,overflow:false})
 }
 await page.setViewportSize({width:844,height:390});await go('/pedir');await inspect('horizontal')
 await page.setViewportSize({width:390,height:844});await go('/perfil')
 await page.evaluate(()=>{const els=[...document.querySelectorAll('body *')].filter(e=>!e.classList.contains('ico')&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));const sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px')});await inspect('texto-ampliado')
 assert.deepEqual(errors,[])
 const fail=results.filter(r=>r.overflow||r.small?.length||r.broken?.length||r.violations?.length)
 assert.deepEqual(fail,[])
}catch(e){await page.screenshot({path:join(out,'fallo.png'),fullPage:true});throw e}
finally{writeFileSync(join(out,'resultados.json'),JSON.stringify(results,null,2));await browser.close();await t.close()}
