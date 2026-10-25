import { vistaAislada } from './soporte-ui.mjs'
const t=await vistaAislada()
const e=await t.request('/api/personal/equipo',{nombre:'Cocina de prueba',usuario:'seguridad.cocina',permiso:'cocina'},t.staff)
console.log('URL aislada: '+t.url+'/personal')
console.log('Propietario local: '+t.env.CASA_SECRETO)
console.log('Empleado sintético: seguridad.cocina / '+e.body.clave)
process.on('SIGINT',async()=>{await t.close();process.exit(0)})
