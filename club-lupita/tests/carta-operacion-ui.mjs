import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { writeFileSync, readFileSync } from 'node:fs'
import { vistaAislada } from './soporte-ui.mjs'
const t = await vistaAislada(), browser = await chromium.launch({channel:'msedge',headless:true}), resultados=[]
async function contexto(auth) {
 const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
 await c.addCookies(auth.cookie.split('; ').map(x=>{const i=x.indexOf('=');return{name:x.slice(0,i),value:x.slice(i+1),domain:'127.0.0.1',path:'/',secure:true,sameSite:'Strict',httpOnly:!x.slice(0,i).includes('csrf')}}))
 const p=await c.newPage();await p.goto(t.url+'/personal?seccion=pedidos');await p.getByRole('heading',{name:'Pedidos',exact:true}).waitFor();return{c,p}
}
try {
 const {c,p}=await contexto(t.staff),errores=[];p.on('pageerror',e=>errores.push(e.message))
 await p.getByText('Disponibilidad y recepción de Carta',{exact:true}).click()
 await p.getByLabel('Preparación estimada en minutos').fill('25')
 await p.getByRole('button',{name:'Guardar reglas de Carta'}).click();await p.getByText('Carta actualizada. Los nuevos cobros usan estas reglas.').waitFor()
 assert.equal((await t.request('/api/carta',undefined,null)).body.minutos,25)
 resultados.push('Administración guarda reglas y cliente recibe estimación')
 await p.getByText('Fichas verificadas con cocina',{exact:true}).click()
 await p.getByLabel('Porción o tamaño confirmado').fill('Porción sintética para ensayo')
 await p.getByLabel('Componentes confirmados').fill('Componentes de prueba aislada')
 await p.getByLabel('Fuente de verificación').fill('Prueba local, sin datos reales')
 assert.equal(await p.getByRole('button',{name:'Publicar ficha revisada'}).isDisabled(),true)
 await p.getByLabel('Confirmo con cocina los datos que voy a publicar.').check()
 await p.getByRole('button',{name:'Publicar ficha revisada'}).click();await p.getByText('Ficha publicada y revisión registrada.').waitFor()
 resultados.push('Ficha exige revisión y se publica desde administración')
 await p.getByText('Medición e incidencias de Carta',{exact:true}).click();await p.getByText('Aún no hay mediciones de rendimiento. No equivalen a cero.').waitFor()
 await p.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const axe=await p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}))
 assert.deepEqual(axe.violations.map(v=>({id:v.id,n:v.nodes.length})),[])
 await p.screenshot({path:'entregables/extension-aprobada-2026-10-21/evidencia/carta-operacion/operacion-carta.png',fullPage:true})
 await c.close()
 const cocina=await t.crearEmpleado({permiso:'cocina'}),k=await contexto(cocina.auth)
 await k.p.getByText('Disponibilidad y recepción de Carta',{exact:true}).click()
 assert.equal(await k.p.getByLabel('Empaque por pedido (C$)').count(),0)
 await k.p.getByLabel('Buscar producto para marcar agotado').fill('Latte');await k.p.getByLabel('Latte',{exact:true}).check()
 await k.p.getByRole('button',{name:'Guardar reglas de Carta'}).click();await k.p.getByText('Carta actualizada. Los nuevos cobros usan estas reglas.').waitFor()
 assert.equal((await t.request('/api/carta',undefined,null)).body.platos.find(p=>p.id==='latte').disponible,false)
 resultados.push('Cocina marca agotados sin editar precio, horario o capacidad')
 assert.deepEqual(errores,[]);await k.c.close()
 console.log(resultados.map(x=>'PASA '+x).join('\n'))
} finally {writeFileSync('entregables/extension-aprobada-2026-10-21/evidencia/carta-operacion/operacion-ui.json',JSON.stringify(resultados,null,2));await browser.close();await t.close()}
