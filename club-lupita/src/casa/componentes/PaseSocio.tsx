import { useId, useState } from 'react'
import { Boton } from './Base'

/** Altura natural para nombres largos, zoom y tamaño de texto ampliado. */
export function PaseSocio({nombre,identificador,fundador,sellos,numero}:{nombre:string;identificador:string;fundador:boolean;sellos?:number;numero?:number}) {
  const [ayuda,setAyuda]=useState(false),id=useId()
  return <section className="cuenta-pase space-y-4 border border-contorno bg-papel p-5 text-tinta" aria-label="Pase de la casa">
    <div className="flex flex-wrap items-start justify-between gap-4"><p className="font-titular text-seccion">La Bella Lupita</p><p className="t-caption">{fundador?'Mesa Fundadora':'Mi Club · gratuito'}</p></div>
    <p className="break-words font-titular text-seccion">{nombre}</p><p className="break-all font-semibold tabular-nums">{identificador}</p>
    {numero&&<p>Mesa Fundadora #{String(numero).padStart(3,'0')}</p>}{sellos!==undefined&&<p>{sellos} de 9 sellos para tu próxima bebida.</p>}
    <Boton tono="tenue" ancho aria-expanded={ayuda} aria-controls={id} onClick={()=>setAyuda(!ayuda)}>Ver cómo usarlo</Boton>
    <div id={id} hidden={!ayuda}><p>Mostrá este pase en caja. El personal puede buscar tu cuenta con el código. La entrega de premios y beneficios requiere su propio código vigente.</p></div>
  </section>
}
