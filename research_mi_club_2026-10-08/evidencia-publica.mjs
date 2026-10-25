import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='https://app.labellalupita.com', output={observadoUTC:new Date().toISOString(),metodo:'GET publico sin sesion'};
for(const path of ['/club','/api/catalogo','/api/cupos']){const r=await fetch(base+path);const body=await r.text();output[path]={status:r.status,headers:Object.fromEntries([...r.headers].filter(([k])=>['content-type','cache-control','etag','content-security-policy','x-content-type-options','referrer-policy','strict-transport-security'].includes(k))),body};}
const html=output['/club'].body;output.assets=[];
for(const path of [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(m=>m[1])){const r=await fetch(base+path);const b=Buffer.from(await r.arrayBuffer());let local=null;try{local=readFileSync('build'+path)}catch{}output.assets.push({path,status:r.status,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),igualALocal:local?b.equals(local):false});}
writeFileSync('evidencia-publica.json',JSON.stringify(output,null,2));console.log(JSON.stringify({status:Object.fromEntries(['/club','/api/catalogo','/api/cupos'].map(p=>[p,output[p].status])),assets:output.assets},null,2));
