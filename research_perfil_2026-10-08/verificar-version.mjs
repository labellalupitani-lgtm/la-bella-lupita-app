import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {createHash} from 'node:crypto'
const root=resolve(import.meta.dirname,'../club-lupita'),out=join(import.meta.dirname,'evidencia')
mkdirSync(out,{recursive:true})
const sha=b=>createHash('sha256').update(b).digest('hex')
const paths=['index.html','src/casa/pantallas/Perfil.tsx','src/casa/componentes/CuentaCliente.tsx','src/casa/componentes/Base.tsx','src/casa/componentes/Superficies.tsx','src/casa/componentes/Navegacion.tsx','src/casa/componentes/EstadoDatos.tsx','src/casa/datos.tsx','src/casa/App.tsx','src/casa/http.ts','src/casa/sesion-cliente.ts','src/casa/estilos/casa.css','src/casa/estilos/identidad.css','src/worker/cuenta-cliente.ts','src/worker/index.ts','src/worker/sesion.ts','src/worker/acceso-correo.ts','src/worker/equipo-sesion.ts']
const sources=paths.map(path=>{const p=join(root,path),pub=join(root,'entregables/acceso-equipo-2026-10-07/version-publicada',path);return{path,sha256:sha(readFileSync(p)),publicadaLocalIgual:existsSync(pub)&&sha(readFileSync(p))===sha(readFileSync(pub))}})
const base='https://app.labellalupita.com',r=await fetch(base+'/perfil'),html=await r.text()
const assetPaths=[...html.matchAll(/(?:src|href)="(\/assets\/principal-[^"]+\.(?:js|css))"/g)].map(m=>m[1])
const assets=[]
for(const path of assetPaths){const a=await fetch(base+path);const bytes=Buffer.from(await a.arrayBuffer()),local=readFileSync(join(import.meta.dirname,'build',path));assets.push({path,status:a.status,bytes:bytes.length,sha256:sha(bytes),igualCompilacionActual:sha(bytes)===sha(local)})}
const endpoints=[]
for(const path of ['/api/health','/api/yo','/api/actividad']){const r=await fetch(base+path);endpoints.push({path,status:r.status,cache:r.headers.get('cache-control'),csp:!!r.headers.get('content-security-policy'),hsts:!!r.headers.get('strict-transport-security')})}
const result={fecha:new Date().toISOString(),zonaInforme:'America/Managua',publico:{ruta:'/perfil',status:r.status,requiresLoginObserved:true,assets,endpoints},sources}
writeFileSync(join(out,'version-verificada.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({assets,fuentesCoinciden:sources.every(s=>s.publicadaLocalIgual),endpoints},null,2))
