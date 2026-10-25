import {build} from 'vite'
import {chromium} from 'playwright'
import {copyFileSync,readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,join,extname} from 'node:path'
import {createServer} from 'node:http'
import {gzipSync} from 'node:zlib'
import {vistaAislada} from './soporte-ui.mjs'
const dir='entregables/mejoras-carta-2026-10-09',base=resolve(dir,'respaldo')
for(const file of ['index.html','postcss.config.js','tailwind.config.js'])if(!existsSync(join(base,file)))copyFileSync(file,join(base,file))
await build({root:base,configFile:join(base,'vite.config.ts'),publicDir:resolve('public'),logLevel:'error',build:{outDir:resolve(dir,'baseline-dist'),emptyOutDir:false}})
const t=await vistaAislada(),browser=await chromium.launch({channel:'msedge',headless:true}),datos=[]
let version='antes'
const server=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){const partes=[];for await(const x of req)partes.push(x);const r=await t.worker.app.request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(partes)}:{})},t.env,t.ctx);const h=Object.fromEntries(r.headers);if(r.headers.getSetCookie().length)h['set-cookie']=r.headers.getSetCookie();res.writeHead(r.status,h);res.end(Buffer.from(await r.arrayBuffer()));return}
  const root=resolve(version==='antes'?dir+'/baseline-dist':'dist');let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+'\\')||!existsSync(f)||!extname(f))f=join(root,'index.html')
  const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'},body=gzipSync(readFileSync(f));res.writeHead(200,{'content-type':mime[extname(f)]??'application/octet-stream','content-encoding':'gzip','cache-control':'no-store','content-length':body.length});res.end(body)
 }catch{res.writeHead(500);res.end()}
})
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port
try{
 // Cinco pares intercalados; cookies reales de la fixture, nunca API de producción.
 for(let i=0;i<5;i++)for(const v of ['antes','despues']){
  version=v
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage()
  await p.goto(url);await p.evaluate(token=>localStorage.setItem('club-lupita:sesion',token),await t.firmar(t.env.SESION_SECRETO,{tel:t.tel,rol:'socio',exp:Date.now()+3600000}));await p.goto(url);await p.getByRole('button',{name:/Mostrá tu pase/}).waitFor()
  const ses=await c.newCDPSession(p);await ses.send('Network.enable');await ses.send('Network.setCacheDisabled',{cacheDisabled:true});await ses.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await ses.send('Emulation.setCPUThrottlingRate',{rate:4})
  await p.addInitScript(()=>{window.medicion={lcp:0,cls:0};new PerformanceObserver(list=>{window.medicion.lcp=list.getEntries().at(-1).startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const x of list.getEntries())if(!x.hadRecentInput)window.medicion.cls+=x.value}).observe({type:'layout-shift',buffered:true})})
  await p.goto(url+'/pedir');await p.getByRole('searchbox').waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForLoadState('networkidle');await p.getByRole('searchbox').fill('maracuyá')
  datos.push({version:v,ejecucion:i+1,...await p.evaluate(()=>({...window.medicion,bytes:performance.getEntriesByType('resource').reduce((n,x)=>n+x.encodedBodySize,0),js:performance.getEntriesByType('resource').filter(x=>x.name.endsWith('.js')).reduce((n,x)=>n+x.encodedBodySize,0)}))});console.log(v+' '+(i+1)+' LCP '+Math.round(datos.at(-1).lcp));await c.close()
 }
 const mediana=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)]
 writeFileSync(dir+'/evidencia/rendimiento.json',JSON.stringify({condiciones:{navegador:await browser.version(),cpu:4,latencia:150,descargaBytesSegundo:200000,cache:'fría',gzip:true,viewport:'390x844',api:'PGlite local, cuenta sintética',fecha:new Date().toISOString()},datos,resumen:['antes','despues'].map(version=>({version,...Object.fromEntries(['lcp','cls','bytes','js'].map(k=>[k,mediana(datos.filter(d=>d.version===version).map(d=>d[k]))]))}))},null,2))
}finally{await browser.close();await new Promise(r=>server.close(r));await t.close()}
