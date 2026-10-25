import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { preparar } from './soporte.mjs';

const t = await preparar();
const {firmar} = t;
const day = new Date(Date.now()+4*86400000).toISOString().slice(0,10);
let serial=0, groups=0;
const fresh = async (balance=0) => {
  const tel='5057777'+String(++serial).padStart(4,'0');
  const {rows:[s]}=await t.db.query("INSERT INTO socio(telefono,nombre) VALUES($1,'Regresión de auditoría') RETURNING id",[tel]);
  if(balance) await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'recarga','Saldo sintético')",[s.id,balance]);
  return {id:s.id,tel,token:await firmar(t.env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000})};
};
const test=async(name,fn)=>{await fn();groups++;console.log('PASA '+name);};
const balance=async s=>(await t.db.query('SELECT * FROM saldo_de($1)',[s.id])).rows[0];
const panel=async()=>{
  const r=await t.request('/api/operacion/flotante',undefined,t.staff);
  assert.equal(r.status,200);return r.body.flotante;
};
const reservation=(zona='terraza',hora='10:00',horas=2)=>({zona,cuando:day+'T'+hora+':00-06:00',horas,personas:2,configuracion:1});
try {
  await test('F1: baja revoca la sesión anterior, cobros de caja y renovación automática',async()=>{
    const s=await fresh(200000);
    assert.equal((await t.request('/api/yo',undefined,s.token)).status,200);
    await t.db.query("INSERT INTO membresia(socio_id,numero,cuota,desde,hasta,renovacion_consentida) VALUES($1,80,95000,now()-interval '31 days',now()-interval '1 day',now())",[s.id]);
    const before=await balance(s);
    await t.db.query('UPDATE socio SET baja=now() WHERE id=$1',[s.id]);
    for(const path of ['/api/yo','/api/actividad','/api/compras','/api/avisos','/api/atencion']){
      assert.equal((await t.request(path,undefined,s.token)).status,401,path);
    }
    for(const [path,body] of [
      ['/api/cuenta/cobrar',{lineas:[{id:'latte',cuanto:1}],ref:'baja-pedido-0001'}],
      ['/api/reserva',reservation()],
      ['/api/reserva-cosecha/apartar',{ref:'baja-bolsa-0001'}],
      ['/api/experiencia/mesa-tostador/apartar',{ref:'baja-butaca-001'}],
      ['/api/membresia/apartar',{}],['/api/membresia/renovacion',{}],
      ['/api/tanda/canjear',{}],['/api/beneficios/solicitar',{clase:'bebida_dia'}],
      ['/api/perfil',{nombre:'Otra identidad',bebida_siempre:'',alergias:'',cumple:''}],
      ['/api/atencion',{referencia:crypto.randomUUID(),mensaje:'Prueba de baja de cuenta'}],
    ]) assert.equal((await t.request(path,body,s.token)).status,401,path);
    // La caja no depende del middleware de socios: la transacción debe revalidar al titular.
    for(const path of ['/api/cuenta/cobrar','/api/cuenta/recargar']){
      assert.equal((await t.request(path,{telefono:s.tel,monto:20000,ref:'caja-baja-0001'},t.staff)).status,404,path);
    }
    await t.worker.mantenerMembresias(t.env);
    await t.db.exec(readFileSync(new URL('../db/016_baja_socio.sql',import.meta.url),'utf8'));
    await t.db.query('SELECT mantener_membresia($1)',[s.id]);
    assert.deepEqual(await balance(s),before);
    assert.equal((await t.db.query('SELECT count(*)::int n FROM pedido WHERE socio_id=$1',[s.id])).rows[0].n,0);
    assert.equal((await t.db.query("SELECT estado FROM membresia WHERE socio_id=$1",[s.id])).rows[0].estado,'vencida');
    assert.equal((await t.request('/api/yo',undefined,t.otroToken)).status,200);
  });

  await test('F2: reintento VIP con saldo exacto devuelve la reserva sin un segundo cargo',async()=>{
    const s=await fresh(50000), body=reservation('vip','10:00',1);
    const first=await t.request('/api/reserva',body,s.token);
    assert.equal(first.status,200,JSON.stringify(first));
    const retry=await t.request('/api/reserva',body,s.token);
    assert.equal(retry.status,200,JSON.stringify(retry));
    assert.equal(retry.body.yaEstaba,true);
    assert.equal(retry.body.reserva.id,first.body.reserva.id);
    assert.equal(retry.body.cobrado,0);
    assert.equal((await t.db.query('SELECT count(*)::int n FROM reserva WHERE socio_id=$1',[s.id])).rows[0].n,1);
    assert.equal((await t.db.query('SELECT count(*)::int n FROM asiento WHERE socio_id=$1 AND monto<0',[s.id])).rows[0].n,1);
    assert.equal((await balance(s)).total,0);
    // La siguiente reserva en la frontera de salida sí es una operación nueva.
    const other=await fresh(100000);
    assert.equal((await t.request('/api/reserva',reservation('vip','11:00',1),other.token)).status,200);
    assert.equal((await t.request('/api/reserva',reservation('vip','10:30',1),other.token)).status,422);
  });

  await test('F3: aforo simultáneo permite tramos adyacentes y rechaza un pico intermedio lleno',async()=>{
    const occupied=await fresh(), buyer=await fresh(), other=await fresh();
    for(let hour=10;hour<=11;hour++)for(let i=0;i<6;i++){
      await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito,mesas) VALUES($1,'terraza',$2,$3,2,0,$4)",[occupied.id,day+'T'+hour+':00:00-06:00',day+'T'+(hour+1)+':00:00-06:00',['prueba-'+(i+1)]]);
    }
    const first=await t.request('/api/reserva',reservation(),buyer.token);
    assert.equal(first.status,200,JSON.stringify(first));
    for(let i=0;i<3;i++)await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito,mesas) VALUES($1,'terraza',$2,$3,2,0,$4)",[occupied.id,day+'T10:30:00-06:00',day+'T11:30:00-06:00',['prueba-'+(i+8)]]);
    assert.equal((await t.request('/api/reserva',reservation(),other.token)).status,409);
    // Reservas canceladas y reservas que terminan justo al inicio no consumen aforo.
    await t.db.query('UPDATE reserva SET cancelada=now() WHERE socio_id=$1 AND cuando=$2',[occupied.id,day+'T10:30:00-06:00']);
    assert.equal((await t.request('/api/reserva',reservation(),other.token)).status,200);
    assert.equal((await t.request('/api/reserva',reservation('terraza','12:00',1),other.token)).status,200);
    // Dos bloques que solo tocan partes distintas de una hora no llenan esa hora.
    for(const [inicio,fin] of [['09:15','10:15'],['10:45','11:45']]){
      for(let i=0;i<4;i++) await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito,mesas) VALUES($1,'ventanal',$2,$3,2,0,$4)",[occupied.id,day+'T'+inicio+':00-06:00',day+'T'+fin+':00-06:00',['prueba-'+(i+1)]]);
    }
    const availability=await t.request('/api/ocupacion?dia='+day);
    assert.equal(availability.status,200);
    assert.equal(availability.body.ocupacion.ventanal['10'],4/6);
    assert.equal((await t.request('/api/reserva',reservation('ventanal','10:00',1),(await fresh()).token)).status,200);
  });

  await test('F4: la API conserva el bono nuevo después de agotar una recarga anterior',async()=>{
    const s=await fresh();
    assert.equal((await t.request('/api/cuenta/recargar',{telefono:s.tel,monto:20000,ref:'audit-recarga-001'},t.staff)).status,200);
    assert.equal((await t.request('/api/cuenta/cobrar',{telefono:s.tel,monto:20000,ref:'audit-consumo-001'},t.staff)).status,200);
    assert.equal((await t.request('/api/cuenta/recargar',{telefono:s.tel,monto:50000,ref:'audit-recarga-002'},t.staff)).status,200);
    assert.deepEqual((await t.request('/api/yo',undefined,s.token)).body.saldo,{pagado:50000,bono:4000,total:54000});
  });

  await test('F5: el panel concilia con la composición de las cuentas, incluidas las bajas',async()=>{
    const before=await panel(), s=await fresh();
    assert.equal((await t.request('/api/cuenta/recargar',{telefono:s.tel,monto:50000,ref:'audit-panel-recarga'},t.staff)).status,200);
    assert.equal((await t.request('/api/cuenta/cobrar',{telefono:s.tel,monto:52000,ref:'audit-panel-consumo'},t.staff)).status,200);
    const after=await panel(), individual=await balance(s);
    assert.deepEqual(individual,{pagado:2000,bono:0,total:2000});
    assert.deepEqual(Object.fromEntries(Object.keys(before).map(k=>[k,after[k]-before[k]])),individual);
    const rows=(await t.db.query('SELECT s.id,d.* FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d')).rows;
    for(const key of ['pagado','bono','total'])assert.equal(after[key],rows.reduce((sum,r)=>sum+r[key],0));
  });

  await test('F6: entradas ausentes, null, escalares, arreglos y JSON truncado devuelven 422 sin escribir',async()=>{
    const before=(await t.db.query('SELECT count(*)::int n FROM asiento')).rows[0].n;
    for(const path of ['/api/reserva','/api/cuenta/cobrar','/api/reserva-cosecha/apartar','/api/tanda/sellar']){
      for(const body of [undefined,'','null','[]','true','5','"texto"','{"incompleto":']){
        const r=await t.worker.app.request('http://localhost'+path,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+(path.endsWith('/sellar')?t.staff:t.token)},...(body===undefined?{}:{body})},t.env,t.ctx);
        assert.equal(r.status,422,path+' '+String(body));
        assert.equal(typeof (await r.json()).error,'string');
      }
    }
    for(const [path,body,token] of [
      ['/api/reserva',{...reservation(),personas:true},t.token],
      ['/api/reserva',{...reservation(),horas:[]},t.token],
      ['/api/cuenta/cobrar',{lineas:[{id:'latte',cuanto:true}],ref:'invalid-quantity'},t.token],
      ['/api/cuenta/cobrar',{lineas:'latte',ref:'invalid-lines'},t.staff],
      ['/api/cuenta/cobrar',{telefono:t.tel,monto:[1],ref:'invalid-amount'},t.staff],
      ['/api/cuenta/recargar',{telefono:t.tel,monto:[50000],ref:'invalid-topup'},t.staff],
      ['/api/cuenta/recargar',{telefono:t.tel,monto:50000.6,ref:'fraction-topup'},t.staff],
      ['/api/reserva-cosecha/apartar',{ref:{}},t.token],
      ['/api/tanda/sellar',{telefono:t.tel,ticket:{}},t.staff],
    ]){const r=await t.request(path,body,token);assert.ok(r.status>=400&&r.status<500,JSON.stringify(r));}
    assert.equal((await t.db.query('SELECT count(*)::int n FROM asiento')).rows[0].n,before);
    // La validación del cuerpo conserva el aislamiento de la demostración.
    assert.equal((await t.request('/api/auth/codigo',null)).status,422);
    t.env.DEMO_AISLADA='true';delete t.env.DEMO_DATABASE_URL;
    assert.equal((await t.request('/api/auth/codigo',{telefono:t.tel})).status,503);
  });
  console.log(groups+' grupos de correcciones de auditoría correctos.');
}finally{await t.db.close();}
