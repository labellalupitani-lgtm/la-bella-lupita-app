import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { Client,neonConfig } from '@neondatabase/serverless';
const staging=JSON.parse(readFileSync('.staging.local','utf8'));
assert(staging.branch!==staging.parent && staging.branch.startsWith('br-'));
neonConfig.webSocketConstructor=globalThis.WebSocket;
const db=new Client(staging.DATABASE_URL);await db.connect();
try{
 for(const file of ['009_puntos','010_integridad','011_plazas'])await db.query(readFileSync('db/'+file+'.sql','utf8'));
 console.log('OK migraciones sobre copia real de producción');
 await build({entryPoints:['src/worker/index.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test-output/worker-neon.mjs'});
 const {app}=await import('../.test-output/worker-neon.mjs');const {firmar}=await import('../.test-output/sesion.mjs');
 const env={DATABASE_URL:staging.DATABASE_URL,SESION_SECRETO:'prueba-aislada-sesion',CASA_SECRETO:'prueba-caja'};
 const waiting=[];const ctx={waitUntil(p){waiting.push(p)},passThroughOnException(){}};
 const phones=['50500000091','50500000092'];const tokens=[];
 for(const tel of phones){
  const {rows}=await db.query("INSERT INTO socio(telefono,nombre) VALUES ($1,'Prueba aislada') RETURNING id",[tel]);
  await db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES ($1,1000000,'recarga','Prueba aislada')",[rows[0].id]);
  tokens.push(await firmar(env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000}));
 }
 const req=async(path,body,token=tokens[0])=>{const r=await app.request('http://localhost/api'+path,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)},env,ctx);return {status:r.status,body:await r.json()}};
 const dia=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
 const reservas=await Promise.all(tokens.map(token=>req('/reserva',{zona:'vip',cuando:dia+'T10:00:00-06:00',horas:1,personas:2},token)));
 assert.deepEqual(reservas.map(r=>r.status).sort(),[200,409]);console.log('OK reservas simultáneas: un solo Salón VIP');
 const compras=await Promise.all([1,2].map(()=>req('/reserva-cosecha/apartar',{ref:'concurrente-20260913'})));
 assert(compras.every(r=>r.status===200));assert.equal(compras[0].body.numero,compras[1].body.numero);assert.equal(compras.filter(r=>r.body.repetido).length,1);
 console.log('OK compras simultáneas: un recurso y un recibo');
 await Promise.allSettled(waiting);
}finally{await db.end();}
