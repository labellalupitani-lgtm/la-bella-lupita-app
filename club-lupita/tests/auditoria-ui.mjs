import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {chromium,firefox} from 'playwright';
import {vistaAislada} from './soporte-ui.mjs';

const t=await vistaAislada();
const browser=await (process.env.NAVEGADOR==='firefox'?firefox.launch({headless:true}):chromium.launch({channel:'msedge',headless:true}));
const out=process.env.TEST_OUTPUT_DIR||join(import.meta.dirname,'../.test-output/auditoria-ui');
mkdirSync(out,{recursive:true});
const results=[];
try {
  const tel='50577778899';
  const {rows:[s]}=await t.db.query("INSERT INTO socio(telefono,nombre) VALUES($1,'Regresión VIP') RETURNING id",[tel]);
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,50000,'recarga','Saldo exacto de prueba')",[s.id]);
  const {firmar}=await import('../.test-output/sesion.mjs');
  const token=await firmar(t.env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'});
  await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);
  await p.goto(t.url);
  await p.evaluate(value=>localStorage.setItem('club-lupita:sesion',value),token);
  await p.goto(t.url+'/reservar');
  await p.getByRole('button',{name:/El Salón VIP/}).click();
  await p.getByRole('button',{name:'Elegir fecha y grupo'}).click();
  const day=new Date(Date.now()+86400000-6*3600000).toISOString().slice(0,10);
  const label=new Intl.DateTimeFormat('es-NI',{weekday:'long',day:'numeric',month:'long',timeZone:'America/Managua'}).format(new Date(day+'T12:00:00-06:00'));
  await p.getByRole('button',{name:label,exact:true}).click();
  await p.getByRole('region',{name:'¿A qué hora?'}).getByRole('button',{name:/^10\D/}).click();
  await p.getByRole('button',{name:'Revisar mi reserva'}).click();
  let firstStatus;
  await p.route('**/api/reserva',async route=>{
    if(firstStatus!==undefined)return route.continue();
    const response=await route.fetch();firstStatus=response.status();
    await route.abort('failed');
  });
  await p.getByRole('button',{name:/Apartar con/}).click();
  await p.getByRole('alert').waitFor();
  assert.equal(firstStatus,200,'el servidor confirmó antes de perderse la respuesta');
  await p.getByRole('button',{name:/Apartar con/}).click();
  // El mensaje tiene una copia visible y otra para el anuncio del lector de pantalla.
  await p.getByText(/Esa mesa ya era tuya/).first().waitFor({state:'attached'});
  assert.equal((await t.db.query('SELECT count(*)::int n FROM reserva WHERE socio_id=$1',[s.id])).rows[0].n,1);
  assert.equal((await t.db.query('SELECT count(*)::int n FROM asiento WHERE socio_id=$1 AND monto<0',[s.id])).rows[0].n,1);
  assert.equal((await t.db.query('SELECT total FROM saldo_de($1)',[s.id])).rows[0].total,0);
  results.push({caso:'F2: respuesta VIP perdida y reintento con saldo exacto',estado:'APROBADO'});
  await p.screenshot({path:join(out,'vip-recuperado.png'),fullPage:true});
  const second=await ctx.newPage();
  await second.goto(t.url+'/perfil');
  await second.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor();
  await t.db.query('UPDATE socio SET baja=now() WHERE id=$1',[s.id]);
  const revoked=p.waitForResponse(r=>new URL(r.url()).pathname==='/api/yo'&&r.status()===401);
  await p.reload();
  await revoked;
  await p.waitForFunction(()=>localStorage.getItem('club-lupita:sesion')===null);
  await p.getByRole('heading',{name:'Tu lugar en Club Lupita'}).waitFor();
  await second.getByRole('heading',{name:'Tu lugar en Club Lupita'}).waitFor();
  assert.equal(await p.evaluate(()=>localStorage.getItem('club-lupita:sesion')),null);
  assert.equal(await p.getByText('Regresión VIP',{exact:true}).count(),0);
  results.push({caso:'F1: baja elimina el token y oculta los datos privados en ambas pestañas',estado:'APROBADO'});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({motor:process.env.NAVEGADOR||'edge',version:browser.version(),results},null,2));
}finally {
  writeFileSync(join(out,'resultados.json'),JSON.stringify(results,null,2));
  await browser.close();await t.close();
}
