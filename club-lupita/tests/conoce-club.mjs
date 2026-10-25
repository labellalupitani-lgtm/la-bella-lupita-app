import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {preparar} from './soporte.mjs'
const dir='entregables/conoce-tu-club-2026-10-12/evidencia';mkdirSync(dir,{recursive:true})
const t=await preparar(),{db,request,id}=t,resultados=[]
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
const saldo=async()=>Number((await db.query('SELECT total FROM saldo_de($1)',[id])).rows[0].total)
const oferta=async()=>(await request('/api/catalogo',undefined,null)).body.experiencias.find(e=>e.id==='mesa-tostador').oferta
const comprar=(c)=>request('/api/experiencia/mesa-tostador/apartar',c)
try{
 await caso('información pública sin sesión, sin costos ni datos privados y sin escrituras',async()=>{
  const antes=await saldo()
  await db.exec('UPDATE club_config SET costo_cafe=1500,costo_bolsa=18000,costo_fijo_periodo=10000')
  const r=await request('/api/club/informacion',undefined,null);assert.equal(r.status,200)
  assert.match(r.headers.get('cache-control'),/no-store/)
  assert.deepEqual(Object.keys(r.body).sort(),['ahora','config','contrato','recarga'])
  assert.deepEqual(Object.keys(r.body.config).sort(),['cafe_detalle','premio_detalle','reglas_version','reposteria','reposteria_productos','sellos_regla','version','vip_regla'])
  assert.equal(r.body.contrato.cuota,95000);assert.equal(r.body.contrato.dias,30)
  assert.equal((await request('/api/club',undefined,null)).status,401);assert.equal(await saldo(),antes)
 })
 await caso('la explicación publica solo los productos configurados y las reglas actuales',async()=>{
  await db.exec("UPDATE club_config SET cafe_detalle='Regla sintética de café',reposteria='[\"cheesecake-cafe\"]'::jsonb,version=version+1")
  const r=await request('/api/club/informacion',undefined,null)
  assert.equal(r.body.config.cafe_detalle,'Regla sintética de café');assert.deepEqual(r.body.config.reposteria_productos,['Cheesecake de Café'])
 })
 await caso('omitir o manipular oferta no puede comprar ni cobrar',async()=>{
  const antes=await saldo()
  assert.equal((await comprar({ref:'oferta-ausente-0001'})).status,409)
  assert.equal((await comprar({ref:'oferta-falsa-00001',oferta:'a'.repeat(64),precio:1})).status,409)
  assert.equal(await saldo(),antes);assert.equal((await db.query('SELECT count(*)::int n FROM asiento_experiencia')).rows[0].n,0)
 })
 await caso('precio distinto al mostrado se rechaza dentro de la transacción sin cargo',async()=>{
  const antigua=await oferta(),antes=await saldo()
  await db.exec('UPDATE experiencia SET precio=90000')
  const r=await comprar({ref:'precio-cambia-00001',oferta:antigua});assert.equal(r.status,409);assert.match(r.body.error,/No te cobramos/)
  assert.equal(await saldo(),antes);assert.notEqual(await oferta(),antigua)
 })
 for(const [campo,valor] of [['cuando',"cuando+interval '1 day'"],['incluye',"'Contenido nuevo'"],['condiciones',"'Política nueva'"],['lugar',"'Otro lugar'"],['duracion_minutos','120'],['abre_publico',"abre_publico-interval '1 minute'"]]){
  await caso('cambio de '+campo+' exige nueva aceptación',async()=>{
   const antigua=await oferta(),antes=await saldo();await db.exec(`UPDATE experiencia SET ${campo}=${valor}`)
   assert.equal((await comprar({ref:'cambio-'+campo.replace('_','-')+'-0001',oferta:antigua})).status,409);assert.equal(await saldo(),antes)
  })
 }
 await caso('oferta revisada cobra precio real una vez; reintento resiste cambios posteriores',async()=>{
  const aceptada=await oferta(),antes=await saldo(),payload={ref:'oferta-aceptada-0001',oferta:aceptada,precio:1}
  const r=await comprar(payload);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.cobrado,90000)
  await db.exec('UPDATE experiencia SET precio=100000')
  const repetido=await comprar(payload);assert.equal(repetido.status,200);assert.equal(repetido.body.repetido,true);assert.equal(repetido.body.butaca,r.body.butaca)
  assert.equal(await saldo(),antes-90000)
  assert.equal((await comprar({...payload,oferta:await oferta()})).status,409)
 })
 await caso('metadatos propios conservan Reservas y no anticipan pantallas ajenas',async()=>{
  const html=readFileSync('dist/conoce-tu-club.html','utf8'),manifest=JSON.parse(readFileSync('dist/.vite/manifest.json','utf8'))
  assert.match(html,/<title>Conocé tu club/);assert.match(html,/rel="canonical" href="https:\/\/app.labellalupita.com\/conoce-tu-club"/)
  assert.ok(html.includes(manifest['src/casa/pantallas/ConoceClub.tsx'].file))
  assert.ok(!html.includes(manifest['src/casa/pantallas/Inicio.tsx'].file));assert.ok(!html.includes(manifest['src/casa/pantallas/Umbral.tsx'].file))
  assert.match(readFileSync('dist/reservar.html','utf8'),/<title>Reservá una mesa/)
 })
}finally{await db.close();writeFileSync(dir+'/api.json',JSON.stringify({resultados},null,2))}
