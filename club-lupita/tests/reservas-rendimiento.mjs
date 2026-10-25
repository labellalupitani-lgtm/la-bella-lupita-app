import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {gzipSync} from 'node:zlib'
import {preparar} from './soporte-perfiles-equipo.mjs'
const t=await preparar(),carpeta='entregables/reservas-2026-10-09',muestras=[]
try{
  await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,mesas) SELECT $1,'terraza',now()-interval '400 days'+n*interval '1 minute',now()-interval '400 days'+n*interval '1 minute'+interval '2 hours',2,ARRAY['prueba-1'] FROM generate_series(1,30000)n",[t.id])
  await t.db.exec('ANALYZE reserva; ANALYZE socio')
  const dia=new Date(Date.now()-21600000+86400000).toISOString().slice(0,10)
  await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,mesas) SELECT $1,'terraza',$2::timestamptz,$2::timestamptz+interval '2 hours',2,ARRAY['prueba-'||n] FROM generate_series(1,8)n",[t.id,dia+'T12:00:00-06:00'])
  await t.db.exec('ANALYZE reserva')
  for(const ruta of ['/api/reservas/disponibilidad?dia='+dia+'&personas=2&horas=2','/api/ocupacion?dia='+dia]){
    const tiempos=[]
    for(let i=0;i<12;i++){const inicio=performance.now(),r=await t.request(ruta,undefined,ruta.includes('disponibilidad')?null:t.token);assert.equal(r.status,200);if(i>1)tiempos.push(performance.now()-inicio)}
    tiempos.sort((a,b)=>a-b);const p95=tiempos[Math.ceil(tiempos.length*.95)-1]
    assert.ok(p95<250,`${ruta}: p95 local ${p95}ms excede presupuesto 250ms`)
    muestras.push({ruta,muestras:tiempos.length,p95_ms:p95,presupuesto_ms:250})
  }
  const plan=await t.db.query("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT zona,mesas,cuando,termina FROM operativo_reserva WHERE cancelada IS NULL AND estado IN ('confirmada','llego','sentada') AND cuando<$2 AND termina>$1",[dia+'T00:00:00-06:00',dia+'T23:59:59-06:00'])
  const assets=readdirSync('dist/assets'),pesos=[]
  for(const [patron,max] of [[/^principal-.*\.js$/,95000],[/^Reservar-.*\.js$/,7000],[/^MisReservas-.*\.js$/,5000]]){
    const archivo=assets.find(n=>patron.test(n));assert.ok(archivo);const gzip=gzipSync(readFileSync('dist/assets/'+archivo)).length;assert.ok(gzip<=max,archivo+' excede el presupuesto');pesos.push({archivo,gzip_bytes:gzip,presupuesto_bytes:max})
  }
  const informe={fecha:new Date().toISOString(),alcance:'Laboratorio PGlite con 30.000 reservas históricas sintéticas; no representa latencia de red ni Core Web Vitals de producción.',muestras,paquetes:pesos,plan:plan.rows[0]['QUERY PLAN']}
  writeFileSync(carpeta+'/rendimiento.json',JSON.stringify(informe,null,2));console.log('PASA presupuestos locales: 30.000 reservas históricas, disponibilidad y ocupación p95 <250ms; paquetes diferidos dentro de presupuesto.')
}finally{await t.close()}
