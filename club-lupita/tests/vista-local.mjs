// Entorno de inspección manual: servidor y cuenta efímeros, sin servicios externos.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { preparar, root } from './soporte.mjs';
const t = await preparar();
await t.db.query("UPDATE membresia SET hasta=now()+interval '15 days',renovacion_consentida=now()");
await t.db.query('UPDATE tanda SET cerrada=now()');
let cola=Promise.resolve();
const server=createServer(async(req,res)=>{
  try {
    if(req.url.startsWith('/api/')){
      const chunks=[];for await(const c of req)chunks.push(c);
      const trabajo=cola.then(()=>t.worker.app.request('http://localhost'+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})},t.env,t.ctx));
      cola=trabajo.catch(()=>{});const r=await trabajo;res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
    } else {
      const base=join(root,'dist');let file=resolve(base,'.'+new URL(req.url,'http://localhost').pathname);
      if(!file.startsWith(base+ '\\')||!existsSync(file)||!extname(file))file=join(base,'index.html');
      const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'};
      let body=readFileSync(file);
      if(extname(file)==='.html')body=Buffer.from(body.toString().replace('<head>',`<head><script>localStorage.setItem('club-lupita:sesion',${JSON.stringify(t.token)})</script>`));
      res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);
    }
  }catch(e){console.error(e.message);res.writeHead(500);res.end('Error del entorno de prueba');}
});
server.listen(5210,'127.0.0.1',()=>console.log('Vista aislada: http://127.0.0.1:5210/'));
process.on('SIGINT',()=>server.close(async()=>{await t.db.close();process.exit(0)}));
