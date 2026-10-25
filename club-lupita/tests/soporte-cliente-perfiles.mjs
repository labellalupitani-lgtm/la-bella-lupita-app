// Aísla la regresión del Cliente mientras se integra el nuevo acceso del equipo.
// Reutiliza el fixture histórico sin rutas simuladas: compila el Worker ACTUAL
// y ejecuta SQL real de PGlite. Los bundles/dist no se comparten con otras suites.
import { createServer } from 'node:http'
import { readFileSync,writeFileSync,mkdirSync,existsSync } from 'node:fs'
import { resolve,join,extname } from 'node:path'
import { pathToFileURL } from 'node:url'
const root=resolve(import.meta.dirname,'..'),namespace='.test-output/perfiles-cliente/'+process.pid,bundle=join(root,namespace)
export async function vistaAislada(){
 mkdirSync(bundle,{recursive:true})
 let fuente=readFileSync(join(root,'entregables/correcciones-perfiles-2026-10-07/respaldo/tests/soporte.mjs'),'utf8')
 fuente=fuente.replace("export const root=resolve(import.meta.dirname,'..');",'export const root='+JSON.stringify(root)+';')
 fuente=fuente.replaceAll('.test-output',namespace)
 fuente=fuente.replace("alias:{'@neondatabase/serverless'","external:['qrcode'],alias:{'@neondatabase/serverless'")
 // Ambos socios son sintéticos normales: el número reservado de capacitación
 // requiere otra base en el nuevo contrato y no pertenece a estas pruebas.
 fuente=fuente.replace("const tel='50587442005';","const tel='50587442006';")
 writeFileSync(join(bundle,'soporte.mjs'),fuente)
 const {preparar}=await import(pathToFileURL(join(bundle,'soporte.mjs')))
 const t=await preparar();let cola=Promise.resolve()
 const headers=Object.fromEntries(readFileSync(join(root,'public/_headers'),'utf8').split(/\r?\n/).filter(l=>l.startsWith('  ')).map(l=>{const i=l.indexOf(':');return [l.slice(2,i),l.slice(i+1).trim()]}))
 const base=resolve(root,process.env.TEST_DIST_DIR||'.test-output/perfiles-dist')
 const server=createServer(async(req,res)=>{
  try{
   if(req.url.startsWith('/api/')){
    const chunks=[];for await(const c of req)chunks.push(c)
    const task=cola.then(()=>t.worker.app.request('http://localhost'+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})},t.env,t.ctx))
    cola=task.catch(()=>{});const r=await task;res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))
   }else{
    let file=resolve(base,'.'+new URL(req.url,'http://localhost').pathname)
    if(!file.startsWith(base+'\\')||!existsSync(file)||!extname(file))file=join(base,'index.html')
    const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'}
    res.writeHead(200,{...headers,'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(readFileSync(file))
   }
  }catch{res.writeHead(500);res.end('Fallo del entorno aislado')}
 })
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 return {...t,url:'http://127.0.0.1:'+server.address().port,close:async()=>{await new Promise(r=>server.close(r));await t.db.close()}}
}
