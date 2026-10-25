// PostgreSQL real, dos conexiones. Solo toca un esquema nuevo con una fila sintética.
import {readFileSync,writeFileSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {randomUUID} from 'node:crypto'
import assert from 'node:assert/strict'
import {Client,neonConfig} from '@neondatabase/serverless'
const real=parseEnv(readFileSync('.dev.vars','utf8')).DATABASE_URL,demo=JSON.parse(readFileSync('.demo.local','utf8')).DATABASE_URL
assert.notEqual(new URL(real).hostname.replace('-pooler',''),new URL(demo).hostname.replace('-pooler',''))
neonConfig.webSocketConstructor=globalThis.WebSocket
const nombre='tienda_test_'+randomUUID().replaceAll('-','');assert.match(nombre,/^tienda_test_[a-f0-9]{32}$/)
const tabla='"'+nombre+'".reserva_cosecha',a=new Client(demo),b=new Client(demo),resultados=[];let creado=false
await a.connect();await b.connect()
try{
 await a.query('CREATE SCHEMA "'+nombre+'"');creado=true;await a.query('CREATE TABLE '+tabla+'(numero integer PRIMARY KEY,apartada timestamptz)');await a.query('INSERT INTO '+tabla+' VALUES(1,NULL)')
 const seleccionar=()=>b.query('SELECT numero FROM '+tabla+' WHERE apartada IS NULL ORDER BY numero LIMIT 1 FOR UPDATE')
 for(const cierre of ['ROLLBACK','COMMIT']){
  await a.query('BEGIN');await a.query('UPDATE '+tabla+' SET apartada=now() WHERE numero=1')
  await b.query('BEGIN');await b.query("SET LOCAL statement_timeout='8s'");let termino=false
  const pendiente=seleccionar().then(r=>{termino=true;return r})
  await new Promise(r=>setTimeout(r,350));assert.equal(termino,false,'Debe esperar al bloqueo, no declarar agotado')
  await a.query(cierre);const resultado=await pendiente;assert.equal(resultado.rows.length,cierre==='ROLLBACK'?1:0);await b.query('ROLLBACK')
  resultados.push({caso:'Última bolsa bloqueada y '+cierre,correcto:true,resultado:resultado.rows.length})
 }
 console.log('PASA PostgreSQL multiconexión: espera al bloqueo; rollback libera la última bolsa, commit confirma agotamiento real.')
}catch(e){throw Error('Falló el ensayo aislado de bloqueos: '+(e.code??e.message))}
finally{await a.query('ROLLBACK').catch(()=>{});await b.query('ROLLBACK').catch(()=>{});if(creado)await a.query('DROP SCHEMA "'+nombre+'" CASCADE');await a.end();await b.end();writeFileSync('entregables/mejoras-tienda-2026-10-09/evidencia/concurrencia.json',JSON.stringify({metodo:'PostgreSQL real, dos conexiones; SQL de selección sobre una fila sintética en esquema exclusivo, borrado al terminar. No es una prueba de carga del Worker.',resultados},null,2))}
