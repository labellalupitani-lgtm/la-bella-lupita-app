// Exportación privada y restauración de prueba en PGlite, nunca sobre la base remota.
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {Client,neonConfig} from '@neondatabase/serverless'
import {PGlite} from '@electric-sql/pglite'
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto'
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist'
const quote=s=>'"'+s.replaceAll('"','""')+'"'
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
export async function respaldar(url,file){
  neonConfig.webSocketConstructor=globalThis.WebSocket
  const c=new Client(url);await c.connect()
  const copia={created:new Date().toISOString(),tables:{},sequences:[],columns:{}}
  try{
    await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
    await c.query("SET LOCAL timezone='UTC'")
    const tablas=(await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows
    for(const {tablename:t} of tablas){
      copia.tables[t]=(await c.query(`SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY to_jsonb(r)::text),'[]'::jsonb) AS rows FROM ${quote(t)} r`)).rows[0].rows
      copia.columns[t]=(await c.query(`SELECT attname FROM pg_attribute WHERE attrelid=$1::regclass AND attnum>0 AND NOT attisdropped AND attgenerated='' ORDER BY attnum`,[t])).rows.map(r=>r.attname)
    }
    for(const r of (await c.query("SELECT sequencename FROM pg_sequences WHERE schemaname='public' ORDER BY sequencename")).rows){
      const value=(await c.query(`SELECT last_value::text,is_called FROM ${quote(r.sequencename)}`)).rows[0];copia.sequences.push({name:r.sequencename,...value})
    }
    await c.query('COMMIT');writeFileSync(file,JSON.stringify(copia))
  }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e}finally{await c.end()}
  // La base de comprobación solo existe en memoria en este proceso.
  const prueba=new PGlite({extensions:{pgcrypto,btree_gist}})
  try{
    const scripts=['001_schema','003_correcciones','004_sesiones','005_generacion','006_orden_del_saldo','007_vale','009_puntos','010_integridad','011_plazas','012_operacion','013_correo','014_promociones','015_saldo_cronologico','016_baja_socio']
    if(copia.tables.seguridad_propietario)scripts.push('017_seguridad_personal')
    if(copia.tables.archivo_muestra)scripts.push('018_clientes_equipo')
    for(const name of scripts)await prueba.exec(readFileSync('db/'+name+'.sql','utf8'))
    await prueba.exec("SET timezone='UTC'; SET session_replication_role=replica")
    const locales=(await prueba.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows
    await prueba.exec('TRUNCATE '+locales.map(r=>quote(r.tablename)).join(',')+' RESTART IDENTITY CASCADE')
    for(const [tabla,rows] of Object.entries(copia.tables)){
      if(!rows.length)continue
      const cols=copia.columns[tabla].map(quote).join(',')
      await prueba.query(`INSERT INTO ${quote(tabla)}(${cols}) OVERRIDING SYSTEM VALUE SELECT ${cols} FROM jsonb_populate_recordset(NULL::${quote(tabla)},$1::jsonb)`,[JSON.stringify(rows)])
    }
    for(const r of copia.sequences)await prueba.query('SELECT setval($1::regclass,$2::bigint,$3)',[r.name,r.last_value,r.is_called])
    await prueba.exec('SET session_replication_role=origin')
    for(const [tabla,rows] of Object.entries(copia.tables)){
      const restored=(await prueba.query(`SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY to_jsonb(r)::text),'[]'::jsonb) AS rows FROM ${quote(tabla)} r`)).rows[0].rows
      assert.equal(digest(restored),digest(rows),'Restauración idéntica: '+tabla)
    }
    return {file,created:copia.created,tables:Object.keys(copia.tables).length,rows:Object.values(copia.tables).reduce((n,r)=>n+r.length,0),sha256:digest(copia),restored:true}
  }finally{await prueba.close()}
}
