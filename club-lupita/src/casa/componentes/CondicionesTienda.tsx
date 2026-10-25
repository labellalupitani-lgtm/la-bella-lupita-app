import type { FichaTienda } from '../../compartido/tienda'
export const diaTienda=(s:string)=>s?new Intl.DateTimeFormat('es-NI',{dateStyle:'medium',timeZone:'America/Managua'}).format(new Date(s+'T12:00:00-06:00')):'Por confirmar'
export const rangoRetiroTienda=(f:Pick<FichaTienda,'retiroDesde'|'retiroHasta'>)=>f.retiroDesde&&f.retiroHasta?(f.retiroDesde===f.retiroHasta?diaTienda(f.retiroDesde):`${diaTienda(f.retiroDesde)} al ${diaTienda(f.retiroHasta)}`):f.retiroDesde?`Desde ${diaTienda(f.retiroDesde)}`:f.retiroHasta?`Hasta ${diaTienda(f.retiroHasta)}`:''
export function CondicionesTienda({ficha:f}:{ficha:FichaTienda}){
  const retiro=rangoRetiroTienda(f),lugar=[f.lugar.trim(),f.horario.trim()].filter(Boolean).join(' · ')
  if(!retiro&&!lugar&&!f.politica.trim())return <p className="mt-3 text-cuerpo">La casa está confirmando las condiciones de retiro de este lote.</p>
  return <dl className="tienda-condiciones mt-3 space-y-2 text-cuerpo">{retiro&&<div><dt className="font-semibold">Retiro estimado</dt><dd>{retiro}</dd></div>}{lugar&&<div><dt className="font-semibold">Lugar y horario</dt><dd>{lugar}</dd></div>}{f.politica.trim()&&<div><dt className="font-semibold">Demoras y cancelaciones</dt><dd className="whitespace-pre-wrap">{f.politica}</dd></div>}</dl>
}
