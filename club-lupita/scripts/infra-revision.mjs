import { readFileSync,writeFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { neon } from '@neondatabase/serverless';
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))};
const base='https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID;
async function api(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('Neon '+r.status);return r.json();}
const endpoints=(await api('/endpoints')).endpoints;
const host=new URL(env.DATABASE_URL).hostname.replace('-pooler','');
const ep=endpoints.find(e=>e.host===host);
if(!ep)throw Error('La base configurada no coincide con este proyecto');
console.log('Base identificada:',env.NEON_PROJECT_ID,ep.branch_id);
const sql=neon(env.DATABASE_URL);
console.log('Esquema:',await sql`select to_regclass('punto') is not null as puntos, to_regclass('solicitud_compra') is not null as recibos`);
const cf=await fetch('https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita/settings',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});
const cfData=await cf.json();console.log('Cloudflare:',cf.status,cfData.success);
if(process.argv.includes('--backup')){
 if(!cfData.success)throw Error('No hay acceso de publicación');
 const b=await api('/branches',{branch:{name:'respaldo-correcciones-20260913',parent_id:ep.branch_id}});
 writeFileSync('.backup.local',JSON.stringify({project:env.NEON_PROJECT_ID,branch:b.branch.id,parent:ep.branch_id,created:new Date().toISOString()},null,2));
 console.log('Respaldo creado:',b.branch.id);
}
if(process.argv.includes('--staging')){
 const b=await api('/branches',{branch:{name:'verificacion-correcciones-20260913',parent_id:ep.branch_id},endpoints:[{type:'read_write'}]});
 const url=new URL(env.DATABASE_URL);url.hostname=b.endpoints[0].host;
 writeFileSync('.staging.local',JSON.stringify({branch:b.branch.id,parent:ep.branch_id,DATABASE_URL:url.toString()},null,2));
 console.log('Rama de verificación:',b.branch.id);
}
if(process.argv.includes('--demo')){
 const b=await api('/branches',{branch:{name:'demostracion-aislada',parent_id:ep.branch_id},endpoints:[{type:'read_write'}]});
 const url=new URL(env.DATABASE_URL);url.hostname=b.endpoints[0].host;
 writeFileSync('.demo.local',JSON.stringify({branch:b.branch.id,parent:ep.branch_id,DATABASE_URL:url.toString()},null,2));
 console.log('Rama demo:',b.branch.id);
}
