import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'
import { preparar } from '../club-lupita/tests/soporte-perfiles-equipo.mjs'

// SQL, identidad y saldo sintéticos. No se cargan variables ni credenciales remotas.
const base = resolve(import.meta.dirname, 'build')
const t = await preparar({propietario:false})
await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,-1000000,'consumo','Agotar saldo sintético para auditoría')",[t.otro])
let cola=Promise.resolve()
const estados=[]
const server=createServer(async(req,res)=>{
 try {
  if(req.url.startsWith('/api/')){
   const modo=new URL(req.headers.referer||'http://localhost').searchParams.get('modo')
   if(modo==='reserva-malformada'&&req.url==='/api/reserva'&&req.method==='POST'){
    const n=await t.db.query('SELECT count(*)::int AS n FROM reserva')
    writeFileSync(join(import.meta.dirname,'respuesta-invalida-servidor.json'),JSON.stringify({respuesta:{},status:200,reservasReales:n.rows[0].n,escenario:'Respuesta 200 vacía inyectada, el Worker no recibe la creación'},null,2))
    res.writeHead(200,{'content-type':'application/json'});res.end('{}');return
   }
   if(modo==='ocupacion-error'&&req.url.startsWith('/api/ocupacion')){
    res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:'Fallo de disponibilidad simulado para auditoría'}));return
   }
   if(modo==='ocupacion-malformada'&&req.url.startsWith('/api/ocupacion')){
    res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ocupacion:{}}));return
   }
   const chunks=[];for await(const c of req)chunks.push(c)
   const job=cola.then(()=>t.worker.app.request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})},t.env,t.ctx))
   cola=job.catch(()=>{})
   const r=await job
   const body=Buffer.from(await r.arrayBuffer())
   estados.push({method:req.method,path:req.url,status:r.status,...(req.url==='/api/reserva'?{body:JSON.parse(body.toString())}:{})})
   writeFileSync(join(import.meta.dirname,'evidencia-api-ui.json'),JSON.stringify(estados,null,2))
   res.writeHead(r.status,Object.fromEntries(r.headers));res.end(body)
  }else{
   const url=new URL(req.url,'http://localhost')
   let file=resolve(base,'.'+url.pathname)
   if(!file.startsWith(base+'\\')||!existsSync(file)||!extname(file))file=join(base,'index.html')
   const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'}
   let body=readFileSync(file)
   if(extname(file)==='.html')body=Buffer.from(body.toString().replace('<head>','<head><script>localStorage.setItem("club-lupita:sesion",'+JSON.stringify(url.searchParams.get('modo')==='sin-saldo'?t.otroToken:t.token)+')</script>'))
   res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body)
  }
 }catch(e){res.writeHead(500);res.end('Error local aislado: '+e.message)}
})
server.listen(0,'127.0.0.1',()=>{const url='http://127.0.0.1:'+server.address().port;writeFileSync(join(import.meta.dirname,'servidor-url.txt'),url);console.log('Auditoría aislada: '+url)})
process.on('SIGINT',()=>server.close(async()=>{await t.close();process.exit(0)}))
