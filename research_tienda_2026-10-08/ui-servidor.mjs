import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'
import { preparar, root } from '../club-lupita/tests/soporte-perfiles-equipo.mjs'

// Sólo memoria y loopback. No utiliza configuración ni credenciales de producción.
export async function servidor() {
  const t = await preparar({ propietario: false })
  const base = resolve(root, '.test-output/tienda-auditoria-dist')
  let cola = Promise.resolve()
  const server = createServer(async (req,res) => {
    try {
      const u = new URL(req.url, 'http://localhost')
      if (u.pathname.startsWith('/api/')) {
        const chunks=[]; for await(const c of req) chunks.push(c)
        const tarea=cola.then(()=>t.worker.app.request('http://localhost'+req.url, {
          method:req.method,headers:req.headers,
          ...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})
        }, t.env,t.ctx)); cola=tarea.catch(()=>{})
        const r=await tarea
        res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))
      } else {
        let file=resolve(base,'.'+u.pathname)
        if(!file.startsWith(base+'\\')||!existsSync(file)||!extname(file))file=join(base,'index.html')
        const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'}
        let body=readFileSync(file)
        if(u.pathname==='/__bootstrap')body=Buffer.from(body.toString().replace('<head>',`<head><script>localStorage.setItem('club-lupita:sesion',${JSON.stringify(t.token)});history.replaceState({},'', '/tienda')</script>`))
        res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body)
      }
    } catch(e) {res.writeHead(500);res.end('Fallo del fixture local')}
  })
  await new Promise(r=>server.listen(0,'127.0.0.1',r))
  return {...t,url:'http://127.0.0.1:'+server.address().port,close:async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));await t.close()}}
}
if(process.argv.includes('--serve')) {
  const t=await servidor();console.log(t.url+'/__bootstrap')
  process.on('SIGINT',async()=>{await t.close();process.exit(0)})
}
