import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { Client,neonConfig } from '@neondatabase/serverless';
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8'))};
const backup=JSON.parse(readFileSync('.backup.local','utf8'));
const demo=JSON.parse(readFileSync('.demo.local','utf8'));
if(backup.project!==env.NEON_PROJECT_ID||backup.branch===backup.parent||demo.branch===demo.parent)throw Error('Respaldo o demo no válidos');
neonConfig.webSocketConstructor=globalThis.WebSocket;
async function migrar(url,files){const c=new Client(url);await c.connect();try{for(const f of files){await c.query(readFileSync('db/'+f+'.sql','utf8'));console.log('Aplicada '+f);}}finally{await c.end();}}
if(process.argv.includes('--preparar')){
 await migrar(demo.DATABASE_URL,['009_puntos','010_integridad','011_plazas']);
 const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita/secrets',{method:'PUT',headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({name:'DEMO_DATABASE_URL',text:demo.DATABASE_URL,type:'secret_text'})});
 if(!r.ok)throw Error('No se pudo configurar la demo: '+r.status);
 console.log('Demo preparada y secreto configurado');
}
if(process.argv.includes('--publicar')||process.argv.includes('--worker')){
 if(!process.argv.includes('--worker'))await migrar(env.DATABASE_URL,['009_puntos','010_integridad']);
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy'],{env:{...process.env,...env,WRANGLER_SEND_METRICS:'false'},stdio:'inherit'});child.on('exit',resolve);});
 if(code!==0)throw Error('Despliegue falló; se conserva la restricción anterior');
 if(!process.argv.includes('--worker'))await migrar(env.DATABASE_URL,['011_plazas']);
 console.log('Publicación y migraciones terminadas');
}
