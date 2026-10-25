import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { Client,neonConfig } from '@neondatabase/serverless';
const demo=JSON.parse(readFileSync('.demo.local','utf8'));
const prod=parseEnv(readFileSync('.dev.vars','utf8'));
assert.notEqual(demo.branch,demo.parent);assert.notEqual(new URL(demo.DATABASE_URL).hostname.replace('-pooler',''),new URL(prod.DATABASE_URL).hostname.replace('-pooler',''));
neonConfig.webSocketConstructor=globalThis.WebSocket;const db=new Client(demo.DATABASE_URL);await db.connect();
try{
 await db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) SELECT id,3000000,'recarga','Saldo ficticio para recorrido de demostración','recorrido-ui-20260913' FROM socio WHERE telefono='50587442005' ON CONFLICT DO NOTHING");
 const {rows}=await db.query("SELECT t.id FROM tanda t JOIN socio s ON s.id=t.socio_id WHERE s.telefono='50587442005' AND t.cerrada IS NOT NULL AND NOT EXISTS(SELECT 1 FROM sello WHERE tanda_id=t.id) LIMIT 1");
 if(rows.length)await db.query("INSERT INTO sello(tanda_id,n,motivo,ref_externa) SELECT $1::uuid,n,'Prueba de interfaz','recorrido-ui-'||($1::uuid)::text||'-'||n FROM generate_series(1,9) n",[rows[0].id]);
 console.log('Saldo y premio sintéticos preparados únicamente en la demo');
}finally{await db.end();}
