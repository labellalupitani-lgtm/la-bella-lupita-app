// Verificación pública sin autenticarse ni crear operaciones en producción.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {join,resolve} from 'node:path'
import {chromium} from 'playwright'
const root=resolve(import.meta.dirname,'..'),release=join(root,'.test-output/release-perfiles')
const out=join(root,'entregables/correcciones-perfiles-2026-10-07/evidencia')
const base='https://app.labellalupita.com',results=[],errors=[],csp=[]
const policy=readFileSync(join(release,'public/_headers'),'utf8').split(/\r?\n/).find(l=>l.includes('Content-Security-Policy:')).split('Content-Security-Policy: ')[1]
for(const [path,status] of [['/',200],['/personal',200],['/api/health',200],['/api/capacidades',200],['/api/catalogo',200],['/api/cupos',200],['/api/yo',401],['/api/panel/resumen',401],['/api/ocupacion?dia=2026-02-31',422]]){
 const r=await fetch(base+path,{headers:{'cache-control':'no-cache'}})
 assert.equal(r.status,status,path)
 assert.equal(r.headers.get('content-security-policy'),policy,path)
 assert.equal(r.headers.get('x-content-type-options'),'nosniff')
 assert.equal(r.headers.get('x-frame-options'),'DENY')
 assert.equal(r.headers.get('strict-transport-security'),'max-age=31536000')
 results.push({path,status,cabeceras:true});console.log('PASA producción '+path+' '+status)
}
const manifest=JSON.parse(readFileSync(join(out,'release-final-manifest.json'),'utf8'))
for(const f of manifest.archivos.filter(f=>/^dist\/assets\/(principal-|Personal-).+\.(js|css)$/.test(f.path))){
 const r=await fetch(base+'/'+f.path.slice(5));assert.equal(r.status,200)
 assert.equal(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),f.sha256,'Activo publicado diferente: '+f.path)
 results.push({path:f.path,sha256:f.sha256,identico:true})
}
const browser=await chromium.launch({channel:'msedge',headless:true})
try{
 const context=await browser.newContext({viewport:{width:1440,height:960},locale:'es-NI'})
 await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
 await context.addInitScript(()=>{window.__violacionesCsp=[];document.addEventListener('securitypolicyviolation',e=>window.__violacionesCsp.push({directive:e.violatedDirective,blocked:e.blockedURI}))})
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
 const estabilizar=()=>page.evaluate(async()=>{
  await document.fonts.ready
  await Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>{})))
  await Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))
 })
 await page.goto(base);await page.getByLabel('Correo electrónico',{exact:true}).waitFor()
 await estabilizar()
 await page.screenshot({path:join(out,'produccion-acceso-cliente.png'),fullPage:true})
 csp.push(...await page.evaluate(()=>window.__violacionesCsp))
 await page.goto(base+'/personal');await page.getByRole('heading',{name:'Ingresar al panel'}).waitFor()
 await page.getByLabel('Acceso del propietario').check();await page.getByLabel('Clave de acceso',{exact:true}).waitFor()
 await estabilizar()
 await page.screenshot({path:join(out,'produccion-acceso-equipo.png'),fullPage:true})
 csp.push(...await page.evaluate(()=>window.__violacionesCsp))
 assert.deepEqual(errors,[]);assert.deepEqual(csp,[])
 results.push({navegador:browser.version(),cliente:'acceso visible',equipo:'acceso vigente visible',escriturasPermitidas:false,errors,csp})
 console.log('PASA accesos publicados en navegador sin errores JavaScript/CSP')
}finally{
 await browser.close()
 writeFileSync(join(out,'verificacion-publicacion.json'),JSON.stringify({fecha:new Date().toISOString(),base,results,errors,csp},null,2))
}
