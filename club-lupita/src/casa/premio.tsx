import { useCallback, useEffect, useRef, useState } from 'react'
import { medir } from './medicion'
import { api, useDatos } from './datos'
import { sesion } from './sesion-cliente'
import { Boton } from './componentes/Base'

/** El vale presenta un premio; su vencimiento no consume la tanda. */
export function usePremio() {
  const { yo, refrescarCuenta, actualizado, error: errorCuenta } = useDatos()
  const [vale, setVale] = useState<{codigo:string; limite:number} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [restan, setRestan] = useState(0)
  const bloqueo = useRef(false), vivo = useRef(true), emision = useRef(0)
  useEffect(() => { vivo.current=true; return () => {vivo.current=false} }, [])
  useEffect(() => {
    // Una lectura iniciada antes de emitir no puede borrar la respuesta del POST.
    if (!yo || !actualizado || Date.parse(yo.ahora ?? actualizado) < emision.current) return
    const segundos = yo.vale ? Math.max(0, (Date.parse(yo.vale.vence) - Date.parse(yo.ahora ?? actualizado)) / 1000) : 0
    setVale(yo.vale ? {codigo:yo.vale.codigo, limite:performance.now()+segundos*1000} : null)
  }, [yo, actualizado])
  useEffect(() => {
    const tick=()=>setRestan(vale ? Math.max(0,Math.ceil((vale.limite-performance.now())/1000)) : 0)
    tick(); const reloj=setInterval(tick,500)
    document.addEventListener('visibilitychange',tick)
    return ()=>{clearInterval(reloj);document.removeEventListener('visibilitychange',tick)}
  }, [vale])
  const emitir=useCallback(async()=>{
    if(bloqueo.current)return
    bloqueo.current=true;setOcupado(true);setError(null);medir('premio_intento')
    const identidad=sesion.leer(),inicio=performance.now()
    try {
      const r=await api.canjearTanda()
      if(!vivo.current||identidad!==sesion.leer())return
      if(!r.ok){medir('premio_error');setError(r.error);if(r.codigo===409)void refrescarCuenta();return}
      medir('premio_ok')
      emision.current=Date.parse(r.datos.ahora)
      // Descontar todo el viaje es conservador y evita prolongar el código por latencia.
      const restante=Math.max(0,r.datos.vence*1000-(performance.now()-inicio))
      setVale({codigo:r.datos.codigo,limite:performance.now()+restante})
      setRestan(Math.ceil(restante/1000))
      void refrescarCuenta(true)
    } finally {bloqueo.current=false;if(vivo.current)setOcupado(false)}
  }, [refrescarCuenta])
  return {vale,restan,ocupado,error,errorCuenta,emitir}
}

export function PremioPresentado({ premio, pendientes }: {premio:ReturnType<typeof usePremio>;pendientes:number}) {
  const alerta=useRef<HTMLParagraphElement>(null)
  useEffect(()=>{if(premio.error)alerta.current?.focus()},[premio.error])
  return <section className="space-y-3" aria-label="Código de tu premio" aria-busy={premio.ocupado}>
    {premio.vale && premio.restan>0 ? <>
      <p className="t-eyebrow">Mostrá este código en la barra</p>
      <p className="premio-codigo">{premio.vale.codigo}</p>
      <p>Vence en {premio.restan} s. La entrega la confirma el personal.</p>
    </> : premio.vale ? <p role="status">El código venció. Podés renovarlo si el premio sigue pendiente; el vencimiento no consume tu bebida.</p>
      : pendientes>0 ? <p>Tenés {pendientes} {pendientes===1?'bebida de cortesía pendiente':'bebidas de cortesía pendientes'}.</p>
      : <p>No hay premios pendientes en la última consulta.</p>}
    {premio.error && <p ref={alerta} tabIndex={-1} role="alert" className="text-achiote">{premio.error}</p>}
    {premio.errorCuenta && <p role="alert">No pudimos comprobar cambios recientes en tu cuenta. {premio.errorCuenta}</p>}
    {(pendientes>0||premio.vale) && <Boton ancho cargando={premio.ocupado} disabled={!!premio.vale&&premio.restan>0} onClick={()=>void premio.emitir()}>{premio.error?'Reintentar código':premio.vale?'Renovar código del premio':'Mostrar código del premio'}</Boton>}
  </section>
}
