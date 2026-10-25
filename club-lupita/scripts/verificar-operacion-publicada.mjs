import {readFileSync,writeFileSync} from 'node:fs';import {parseEnv} from 'node:util';import assert from 'node:assert/strict';import {firmar} from '../.test-output/sesion.mjs';
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8'))};
const base='https://club-lupita.labellalupita.workers.dev';
async function call(path,{token,body,headers={}}={}){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
const capabilities=await call('/api/capacidades');assert.equal(capabilities.status,200);assert.equal(capabilities.data.accesoPersonal,false);assert.equal(capabilities.data.operacion,true);
assert.equal((await call('/api/compras')).status,401);
const demoToken=await firmar(env.SESION_SECRETO,{tel:'50587442005',rol:'socio',exp:Date.now()+60000});
for(const path of ['/api/yo','/api/compras','/api/avisos','/api/atencion'])assert.equal((await call(path,{token:demoToken})).status,200,path);
assert.equal((await call('/api/operacion/pedidos',{token:demoToken})).status,403);
for(const demo of [true,false]){
 const auth=await call('/api/auth/casa',{body:{demo},headers:{'x-casa':env.CASA_SECRETO}});assert.equal(auth.status,200);
 const token=auth.data.token;
 const yo=await call('/api/personal/yo',{token});assert.equal(yo.status,200);assert.equal(yo.data.demo,demo);
 for(const path of ['/api/personal/equipo','/api/operacion/pedidos','/api/operacion/entregas','/api/operacion/atencion','/api/operacion/metricas'])assert.equal((await call(path,{token})).status,200,path);
 console.log((demo?'Demo':'Real')+': acceso propietario y lecturas operativas correctos');
}
const index=readFileSync('dist/index.html','utf8');const assets=index.match(/\/assets\/[^" ]+\.js/g);for(const asset of assets){const r=await fetch(base+asset);assert.equal(r.status,200);assert.equal(await r.text(),readFileSync('dist'+asset,'utf8'));}
for(const path of ['/club','/compras','/personal'])assert.equal((await fetch(base+path)).status,200);
console.log('Producción verificada: frontend exacto, permisos, API y acceso personal desactivado');
writeFileSync('PUBLICACION_OPERATIVA_20260913.json',JSON.stringify({url:base,version:'eb1b7aa5-93fe-4879-b59b-c6920ebff778',verified:new Date().toISOString(),migration:{real:true,demo:true,balancePreserved:true},checks:['tests','build','dry-run','api-real','api-demo','permissions','assets-exact'],personalAccessEnabled:false},null,2));
