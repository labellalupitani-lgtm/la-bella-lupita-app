// Verificación pública de solo lectura: no crea cuentas, reservas ni mensajes.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
const origin='https://app.labellalupita.com',casos=[]
async function pedir(path,status=200){const r=await fetch(origin+path,{signal:AbortSignal.timeout(15000)});assert.equal(r.status,status,path);return r}
const html=await(await pedir('/reservar')).text(),local=readFileSync('dist/reservar.html','utf8')
assert.equal(html,local,'La entrada publicada difiere de la compilación verificada')
assert.match(html,/<title>[^<]*[Rr]eserv/);assert.match(html,/rel="canonical"[^>]*app.labellalupita.com\/reservar/)
const scripts=[...html.matchAll(/src="(\/assets\/[^"?]+\.js)"/g)].map(m=>m[1]);assert.ok(scripts.length)
for(const path of scripts){const r=await pedir(path);assert.equal(await r.text(),readFileSync('dist'+path,'utf8'))}
casos.push('HTML específico y scripts publicados coinciden exactamente con la compilación local')
const conf=await pedir('/api/reservas/configuracion');assert.equal(conf.headers.get('cache-control'),'no-store');const cfg=await conf.json()
assert.equal(cfg.zonas.length,5);assert.ok(cfg.zonas.every(z=>z.mesas.length===0))
assert.match(cfg.politica.cancelacion,/devuelve íntegramente/);assert.match(cfg.politica.inasistencia,/devuelve íntegramente/)
casos.push('Consulta pública sin sesión; inventario inicial vacío y política aprobada, sin caché de API')
const dia=new Date(Date.now()-21600000+86400000).toISOString().slice(0,10)
const disp=await(await pedir('/api/reservas/disponibilidad?dia='+dia+'&personas=2&horas=2')).json()
assert.equal(disp.version,cfg.version);assert.equal(disp.dia,dia);assert.ok(Object.values(disp.zonas).every(z=>!z.configurada&&z.horas.length===0))
await pedir('/api/reservas/disponibilidad?dia=2026-11-31&personas=2&horas=2',422)
await pedir('/api/reservas/disponibilidad?dia='+dia+'&personas=99&horas=2',422)
casos.push('Capacidad pendiente no ofrece cupos ficticios; fecha imposible y grupo inválido se rechazan')
for(const path of ['/api/reservas/mias','/api/operacion/reservas','/api/yo'])await pedir(path,401)
casos.push('Comprobantes, agenda y cuenta siguen requiriendo autenticación')
await pedir('/api/catalogo');await pedir('/api/ocupacion?dia='+dia)
for(const path of ['/','/personal','/reservas','/perfil','/pedir','/tienda','/club'])await pedir(path)
casos.push('Catálogo, ocupación y entradas existentes siguen respondiendo')
const resultado={fecha:new Date().toISOString(),correcto:true,origen:origin,version:JSON.parse(readFileSync('entregables/reservas-2026-10-10/publicacion.json','utf8')).publicada,casos}
writeFileSync('entregables/reservas-2026-10-10/verificacion-publica.json',JSON.stringify(resultado,null,2))
console.log('PASA producción: '+casos.length+' grupos de comprobaciones públicas, sin crear datos ni enviar mensajes.')
