import { preparar as equipo, root } from './soporte-perfiles-equipo.mjs'
export {root}
export async function preparar(){const t=await equipo({telefono:'50587442005',compatibilidadDemo:true});await t.db.query('UPDATE socio SET nombre=$2 WHERE id=$1',[t.id,'Prueba Regresi\u00f3n']);await t.db.query('UPDATE socio SET nombre=$2 WHERE id=$1',[t.otro,'Otro Socio']);return t}
