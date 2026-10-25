import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {preparar} from './soporte-perfiles-equipo.mjs'
const t=await preparar(),logs=[],resultados=[],original=console.info
const valido={evento:'guardado_confirmado',duracion:350,dispositivo:'movil'}
const enviar=(dato=valido,auth=t.token,opciones={})=>t.request('/api/metricas-perfil',dato,auth,opciones)
console.info=(...args)=>{try{const r=JSON.parse(args[0]);if(r.evento==='perfil_cliente')logs.push(r);else original(...args)}catch{original(...args)}}
try{
  assert.equal((await enviar(valido,null)).status,401)
  assert.equal((await enviar(valido,t.staff)).status,403)
  for(const dato of [null,[],{...valido,alergias:'No debe registrarse'},{...valido,duracion:-1},{...valido,duracion:300001},{...valido,duracion:1.5},{...valido,duracion:null},{...valido,evento:'texto libre'},{...valido,dispositivo:'identificador'}])assert.equal((await enviar(dato)).status,422)
  assert.equal((await enviar({...valido,extra:'X'.repeat(600)})).status,413)
  assert.equal(logs.length,0)
  resultados.push({nombre:'autenticación, permisos, tamaño y lista cerrada sin datos personales',correcto:true})
  for(const evento of ['guardado_confirmado','guardado_conflicto','guardado_error','guardado_incierto','recuperacion_confirmada','recuperacion_revision','recuperacion_error']){
    assert.equal((await enviar({...valido,evento})).status,200)
    assert.deepEqual(logs.at(-1),{evento:'perfil_cliente',resultado:evento,duracion_ms:350,dispositivo:'movil'})
  }
  assert.equal((await enviar(valido,t.token,{headers:{DNT:'1'}})).body.registrado,false)
  assert.equal((await enviar(valido,t.token,{headers:{'Sec-GPC':'1'}})).body.registrado,false)
  assert.equal(logs.length,7)
  resultados.push({nombre:'siete resultados acotados; DNT y GPC impiden el registro',correcto:true})
  for(let n=7;n<60;n++)assert.equal((await enviar()).status,200)
  assert.equal((await enviar()).status,429)
  assert.equal(logs.length,60)
  resultados.push({nombre:'máximo de 60 mediciones por cuenta y ventana de 60 segundos',correcto:true})
  writeFileSync('entregables/mejoras-perfil-2026-10-09/evidencias/medicion-servidor.json',JSON.stringify({fecha:new Date().toISOString(),resultados},null,2))
  console.log('PASA medición de Perfil: contrato privado, permisos, exclusión y límite de frecuencia')
}finally{console.info=original;await t.db.close()}
