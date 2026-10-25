import {vistaAislada} from './soporte-ui.mjs'
import {writeFileSync} from 'node:fs'
const t=await vistaAislada()
const caja=await t.crearEmpleado({usuario:'caja.ui',nombre:'Caja de ensayo',clave:'Una taza tranquila antes del turno'})
const invitacion=await t.crearEmpleado({usuario:'propietaria.ui',nombre:'Propietaria de ensayo',permiso:'propietario',activar:false})
writeFileSync('.test-output/vista-acceso.local',JSON.stringify({url:t.url,caja:{usuario:caja.usuario,clave:caja.clave},owner:{usuario:t.owner.usuario,clave:t.owner.clave,secretoMfa:t.owner.secretoMfa},invitacion},null,2))
console.log('VISTA AISLADA '+t.url+'/personal')
process.on('SIGINT',async()=>{await t.close();process.exit()})
