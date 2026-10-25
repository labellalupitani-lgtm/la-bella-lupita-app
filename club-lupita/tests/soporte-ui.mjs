import { createServer } from 'node:http'
import { createServer as createSecureServer } from 'node:https'
import { readFileSync,existsSync } from 'node:fs'
import { join,resolve,extname } from 'node:path'
import { preparar,root } from './soporte.mjs'

export async function vistaAislada({tls}={}){
 const t=await preparar();let cola=Promise.resolve()
 const atender=async(req,res)=>{
  try {
   if(req.url.startsWith('/api/')){
    const chunks=[];for await(const c of req)chunks.push(c)
    const task=cola.then(()=>t.worker.app.request((tls?'https://':'http://')+req.headers.host+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})},t.env,t.ctx))
    cola=task.catch(()=>{});const r=await task;const headers=Object.fromEntries(r.headers);if(r.headers.getSetCookie().length)headers['set-cookie']=r.headers.getSetCookie();res.writeHead(r.status,headers);res.end(Buffer.from(await r.arrayBuffer()))
   }else{
    const base=join(root,'dist');let file=resolve(base,'.'+new URL(req.url,'http://localhost').pathname)
    if(!file.startsWith(base+'\\')||!existsSync(file)||!extname(file))file=join(base,'index.html')
    const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'}
    res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(readFileSync(file))
   }
  }catch(e){res.writeHead(500);res.end('Fallo del entorno aislado')}
 }
 const server=tls?createSecureServer(tls,atender):createServer(atender)
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 return {...t,url:(tls?'https://':'http://')+'127.0.0.1:'+server.address().port,close:async()=>{await new Promise(r=>server.close(r));await t.db.close()}}
}
