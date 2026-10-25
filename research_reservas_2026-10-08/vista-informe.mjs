import {createServer} from 'node:http'
import {readFileSync,existsSync} from 'node:fs'
import {resolve,extname,sep} from 'node:path'
const base=import.meta.dirname
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
 const file=resolve(base,'.'+(pathname==='/'?'/informe.html':pathname))
 if(!file.startsWith(base+sep)||!existsSync(file)){res.writeHead(404);res.end('No encontrado');return}
 try{const types={'.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};res.writeHead(200,{'content-type':types[extname(file)]||'text/plain; charset=utf-8','cache-control':'no-store'});res.end(readFileSync(file))}catch{res.writeHead(404);res.end('No encontrado')}
})
server.listen(0,'127.0.0.1',()=>console.log('Informe: http://127.0.0.1:'+server.address().port))
process.on('SIGINT',()=>server.close(()=>process.exit(0)))
