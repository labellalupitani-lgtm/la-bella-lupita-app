import {mkdirSync,readFileSync,existsSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
export function tlsLocal(){
 const dir='.test-output/tienda-tls';mkdirSync(dir,{recursive:true})
 if(!existsSync(dir+'/fixture.crt')){
  const exe=process.platform==='win32'?'C:/Program Files/Git/usr/bin/openssl.exe':'openssl'
  const r=spawnSync(exe,['req','-x509','-newkey','rsa:2048','-nodes','-keyout',dir+'/fixture.key','-out',dir+'/fixture.crt','-days','2','-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{encoding:'utf8'})
  if(r.status!==0)throw Error('No se pudo preparar el certificado HTTPS local de prueba.')
 }
 return {key:readFileSync(dir+'/fixture.key'),cert:readFileSync(dir+'/fixture.crt')}
}
