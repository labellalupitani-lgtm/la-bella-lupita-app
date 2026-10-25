import { useEffect, useState } from 'react'
import { Boton } from './Base'
import { Tarjeta } from './Superficies'
import { cordobas } from '../datos'
import { operacion } from '../operacion'
type Metricas={pedidos:number;entregados:number;cancelados:number;ventas:number;clientes:number}
export function MetricasOperacion({token}:{token:string}) {
  const [datos,mostrar]=useState<Metricas|null>(null),[error,fallar]=useState(''),[cargando,cargar]=useState(false)
  async function consultar(){cargar(true);fallar('');try{mostrar(await operacion('/operacion/metricas',undefined,token))}catch(e){fallar((e as Error).message)}finally{cargar(false)}}
  useEffect(()=>{void consultar()},[])
  return <Tarjeta><h2 className="t-seccion">Últimos 30 días</h2><p className="mt-2 t-caption">Pedidos registrados en esta versión El importe excluye cancelados; no incluye recargas, membresías ni ventas externas</p>
    <Boton tono="claro" className="my-3" disabled={cargando} onClick={()=>void consultar()}>Actualizar cifras</Boton>
    {datos&&<dl className="grid grid-cols-2 gap-4">{[['Pedidos',datos.pedidos],['Entregados',datos.entregados],['Cancelados',datos.cancelados],['Clientes con pedidos',datos.clientes],['Importe de pedidos',cordobas(Number(datos.ventas))]].map(([titulo,valor])=><div key={titulo}><dt className="t-caption">{titulo}</dt><dd className="text-cuerpo font-semibold">{valor}</dd></div>)}</dl>}
    {error&&<p role="alert" className="text-achiote">{error}</p>}
  </Tarjeta>
}
