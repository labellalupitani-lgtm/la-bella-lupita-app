import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
const root = resolve(import.meta.dirname, '..');
const out = import.meta.dirname;
const extra = createRequire(join(tmpdir(), 'club-lupita-audit-20260911', 'package.json'));
const { PGlite } = extra('@electric-sql/pglite');
const { pgcrypto } = extra('@electric-sql/pglite/contrib/pgcrypto');
const { btree_gist } = extra('@electric-sql/pglite/contrib/btree_gist');
const { build } = createRequire(join(root, 'package.json'))('esbuild');
const db = new PGlite({ extensions: { pgcrypto, btree_gist } });
globalThis.__auditDb = db;
for (const f of ['001_schema', '003_correcciones', '004_sesiones', '005_generacion', '006_orden_del_saldo', '007_vale']) {
  await db.exec(readFileSync(join(root, 'db', f + '.sql'), 'utf8'));
}
const id = '00000000-0000-4000-8000-000000000001';
const tel = '50587442005';
await db.exec(`
INSERT INTO socio(id,telefono,nombre,cumple) VALUES ('${id}','${tel}','Prueba Auditoría','2000-09-14');
INSERT INTO asiento(socio_id,monto,tipo,concepto,creado) VALUES ('${id}',1000000,'recarga','Saldo ficticio de auditoría',now()-interval '2 days');
INSERT INTO tanda(socio_id) VALUES ('${id}');
INSERT INTO sello(tanda_id,n,motivo,ref_externa) SELECT t.id,n,'Prueba local','local-sello-'||n FROM tanda t,generate_series(1,8) n;
INSERT INTO membresia(socio_id,numero,cuota,desde,hasta) VALUES ('${id}',1,95000,now()-interval '31 days',now()-interval '1 day');
INSERT INTO reserva_cosecha(numero,precio) SELECT n,89000 FROM generate_series(1,150) n;
INSERT INTO experiencia(id,nombre,cuando,cupos,precio) VALUES ('mesa-tostador','Experiencia de prueba',now()+interval '7 days',12,85000);
`);
await build({ entryPoints: [join(root,'src/worker/index.ts')], bundle:true, platform:'node', format:'esm', outfile:join(out,'worker-local.mjs'), alias:{'@neondatabase/serverless':join(out,'driver-local.mjs')} });
await build({ entryPoints: [join(root,'src/worker/sesion.ts')], bundle:true, platform:'node', format:'esm', outfile:join(out,'sesion-local.mjs') });
const app = (await import(pathToFileURL(join(out,'worker-local.mjs')))).default;
const { firmar } = await import(pathToFileURL(join(out,'sesion-local.mjs')));
const env = { DATABASE_URL:'postgres://unused-local-only', SESION_SECRETO:'audit-session-key-local-only', CASA_SECRETO:'audit-staff-key-local-only' };
const pending = [];
const ctx = { waitUntil(p) {pending.push(p);}, passThroughOnException() {} };
const token = await firmar(env.SESION_SECRETO, {tel, rol:'socio', exp:Date.now()+3600000});
const staff = await firmar(env.SESION_SECRETO, {tel:'', rol:'casa', exp:Date.now()+3600000});
const request = async (path, body, auth=token) => {
  const r = await app.request('http://localhost'+path, {method:body === undefined?'GET':'POST', headers:{'content-type':'application/json', ...(auth?{authorization:'Bearer '+auth}:{})}, ...(body===undefined?{}:{body:JSON.stringify(body)})}, env, ctx);
  return { status:r.status, body:await r.json() };
};
const results = [];
const record = (name,result) => {results.push({name,...result}); console.log(JSON.stringify(results.at(-1)));};
record('unauthenticated-account', await request('/api/yo',undefined,null));
record('member-cannot-recharge', await request('/api/cuenta/recargar',{telefono:tel,monto:20000}));
record('member-cannot-stamp', await request('/api/tanda/sellar',{telefono:tel,ticket:'test-local-1'}));
record('staff-cannot-charge-member', await request('/api/cuenta/cobrar',{telefono:tel,monto:10000,ref:'audit-cashier-charge'},staff));
record('expired-membership-benefit', await request('/api/beneficio/bebida_dia',{}));
record('ninth-stamp', await request('/api/tanda/sellar',{telefono:tel,ticket:'test-local-9'},staff));
const afterStamp = await request('/api/yo');
record('account-after-ninth-stamp',{status:afterStamp.status,body:{visibleStamps:afterStamp.body.sellos.length,redeemedCycles:afterStamp.body.tandasCerradas,voucher:afterStamp.body.vale}});
record('voucher-first-issue',await request('/api/tanda/canjear',{}));
await db.exec("UPDATE vale SET emitido=now()-interval '2 minutes', vence=now()-interval '1 second'");
record('expired-voucher-reissue',await request('/api/tanda/canjear',{}));
const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10)+'T15:00:00-06:00';
record('valid-new-reservation',await request('/api/reserva',{zona:'terraza',cuando:tomorrow,personas:2,horas:2}));
try { await db.query('SELECT count(*) FROM reserva FOR UPDATE'); } catch(e) { record('reservation-postgres-error',{code:e.code,error:e.message}); }
record('membership-cancel',await request('/api/membresia/cancelar',{}));
const afterCancel = await request('/api/yo');
record('membership-after-cancel',{body:afterCancel.body.membresia});
record('recharge-original',await request('/api/cuenta/recargar',{telefono:tel,monto:20000,ref:'audit-recharge-ref'},staff));
record('recharge-same-ref-different-amount',await request('/api/cuenta/recargar',{telefono:tel,monto:200000,ref:'audit-recharge-ref'},staff));
record('recharge-persisted',{body:(await db.query("SELECT monto,tipo,ref_externa FROM asiento WHERE ref_externa LIKE 'audit-recharge-ref%' ORDER BY id")).rows});
try {
  await db.exec(readFileSync(join(root,'db/009_puntos.sql'),'utf8'));
  record('points-migration',{applied:true});
} catch(e) {
  record('points-migration',{applied:false,code:e.code,error:e.message});
  await db.exec('ROLLBACK');
}
await Promise.all(pending);
writeFileSync(join(out,'resultados-api.json'),JSON.stringify(results,null,2));
// A partir de aquí se sirven solamente datos sintéticos para las pruebas UI.
await db.exec(`UPDATE membresia SET hasta=now()+interval '15 days', autorenueva=true; INSERT INTO tanda(socio_id) VALUES ('${id}'); INSERT INTO sello(tanda_id,n,motivo,ref_externa) SELECT t.id,n,'Prueba local','ui-sello-'||n FROM tanda t,generate_series(1,7) n WHERE t.cerrada IS NULL;`);
writeFileSync(join(out,'yo-fixture.json'),JSON.stringify((await request('/api/yo')).body,null,2));
if (!process.argv.includes('--serve')) {await db.close(); process.exit(0);}
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.webp':'image/webp','.png':'image/png','.json':'application/json'};
let queue = Promise.resolve();
const server = createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://127.0.0.1:5199');
    if(url.pathname.startsWith('/api/')) {
      const chunks=[]; for await(const c of req) chunks.push(c);
      const body=Buffer.concat(chunks);
      const operation=queue.then(async()=>{
        const r=await app.request(url.href,{method:req.method,headers:req.headers,...(body.length?{body}: {})},env,ctx);
        res.writeHead(r.status,Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
      });
      queue=operation.catch(()=>{}); await operation; return;
    }
    const pathname=decodeURIComponent(url.pathname);
    const file=extname(pathname)?resolve(root,'dist','.'+pathname):join(root,'dist','index.html');
    if(!file.startsWith(resolve(root,'dist')+ '/'.replace('/',process.platform==='win32'?'\\':'/'))) {res.writeHead(403);res.end();return;}
    try {res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream'});res.end(readFileSync(file));}
    catch {res.writeHead(404);res.end('Not found');}
  } catch(e) {res.writeHead(500);res.end('Local audit error');console.error(e.message);}
});
server.listen(5199,'127.0.0.1',()=>console.log('LOCAL AUDIT ONLY: http://127.0.0.1:5199'));
