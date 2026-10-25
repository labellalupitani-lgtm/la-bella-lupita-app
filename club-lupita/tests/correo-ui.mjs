import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
const t=await vistaAislada();let codigo
const b=await chromium.launch({channel:'msedge',headless:true})
const p=await b.newPage({viewport:{width:390,height:844}})
const out=process.env.TEST_OUTPUT_DIR||'../entregables/registro-correo-2026-10-01';mkdirSync(out,{recursive:true})
const errores=[];p.on('pageerror',e=>errores.push(e.message))
async function inspect(name){await p.evaluate(()=>document.fonts.ready);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));writeFileSync(out+'/'+name+'-axe.json',JSON.stringify(a.violations,null,2));await p.screenshot({path:out+'/'+name+'.png',fullPage:true});assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])}
try{
 await p.goto(t.url);await p.getByText('Estamos preparando el registro por correo.',{exact:false}).waitFor();assert(await p.getByRole('button',{name:'Continuar con mi correo'}).isDisabled());assert.equal(await p.getByText('Versión de demostración').count(),0)
 await p.route('**/api/capacidades',r=>r.abort());await p.reload();await p.getByRole('alert').waitFor();await p.unroute('**/api/capacidades')
 t.env.ACCESO_CORREO='true';t.env.EMAIL_FROM='acceso@labellalupita.com';t.env.EMAIL={send:async msg=>{codigo=msg.text.match(/es (\d{6})/)[1];return {messageId:'local'}}}
 await p.getByRole('button',{name:'Volver a comprobar'}).click();await p.getByLabel('Correo electrónico').fill('cliente-ui@example.com');await inspect('01-correo-movil')
 await p.getByRole('button',{name:'Continuar con mi correo'}).click();await p.getByLabel('Código de verificación').waitFor();await inspect('02-codigo-movil')
 await p.getByLabel('Código de verificación').fill(codigo==='000000'?'111111':'000000');await p.getByRole('button',{name:'Verificar y continuar'}).click();await p.getByRole('alert').waitFor()
 await p.getByLabel('Código de verificación').fill(codigo);await p.getByRole('button',{name:'Verificar y continuar'}).click();await p.getByLabel('Tu nombre',{exact:true}).waitFor();assert.equal(await p.getByRole('checkbox').isChecked(),false);await p.getByRole('checkbox').check();await inspect('03-perfil-movil')
 await p.getByLabel('Tu nombre',{exact:true}).fill('Cliente Correo UI');await p.getByLabel('Número de teléfono').fill('88886666');await p.getByRole('button',{name:'Crear mi cuenta'}).click();await p.getByRole('heading',{name:'Tu cuenta de casa',exact:true}).waitFor()
 assert.equal((await t.db.query("SELECT promociones_correo FROM socio WHERE correo='cliente-ui@example.com'")).rows[0].promociones_correo,true)
 await p.goto(t.url+'/perfil');await p.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await p.getByLabel('Correo electrónico').waitFor();await p.goto(t.url);await p.setViewportSize({width:1440,height:960});await p.getByLabel('Correo electrónico').waitFor();await inspect('04-portada-escritorio')
 await p.getByLabel('Correo electrónico').fill('cliente-ui@example.com');await t.db.query("UPDATE codigo_correo SET creado=now()-interval '2 minutes'");await p.getByRole('button',{name:'Continuar con mi correo'}).click();await p.getByLabel('Código de verificación').fill(codigo);await p.getByRole('button',{name:'Verificar y continuar'}).click();await p.getByRole('heading',{name:'Tu cuenta de casa',exact:true}).waitFor();assert.equal(await p.getByLabel('Número de teléfono').count(),0)
 assert.deepEqual(errores,[]);console.log('OK UI: disponibilidad, recuperación de red, correo, código incorrecto/correcto, teléfono obligatorio, alta, reingreso sin repetir datos, accesibilidad y móvil/escritorio.')
}finally{await b.close();await t.close()}
