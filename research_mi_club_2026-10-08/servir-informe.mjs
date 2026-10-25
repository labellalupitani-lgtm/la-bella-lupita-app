import {createServer} from 'node:http'
import {readFileSync,existsSync,statSync} from 'node:fs'
import {resolve,join,extname,sep} from 'node:path'
const root=import.meta.dirname
const server=createServer((req,res)=>{
  try{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
    const file=path==='/'?join(root,'auditoria-mi-club.html'):resolve(root,'.'+path)
    if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end('No encontrado');return}
    const types={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.mjs':'text/plain; charset=utf-8','.png':'image/png','.css':'text/css','.js':'application/javascript','.woff2':'font/woff2'}
    res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(req.method==='HEAD'?undefined:readFileSync(file))
  }catch{res.writeHead(500);res.end('No se pudo leer el archivo')}
})
server.listen(0,'127.0.0.1',()=>console.log('INFORME_URL=http://127.0.0.1:'+server.address().port+'/auditoria-mi-club.html'))
