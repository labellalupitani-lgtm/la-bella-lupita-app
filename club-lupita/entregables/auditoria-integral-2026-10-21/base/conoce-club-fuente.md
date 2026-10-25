# Fuente de referencia: Conocé tu Club

Copia documental de src/casa/pantallas/ConoceClub.tsx, de la base auditada. SHA-256: cf2a3777cd79732104f3ca71fd8bd64735a49f8a7a68fa844252eb00ee2329e1.

La pantalla presenta información y enlaces de navegación. No contiene una escritura de negocio propia; por eso no aplican confirmación de pago, respuesta perdida de escritura o conflicto de actualización a esta pantalla informativa. Los destinos sí se auditan por separado.

~~~tsx
import { useEffect, useState, type MouseEvent } from 'react'
import { Boton, Eyebrow } from '../componentes/Base'
import { cordobas, useDatos } from '../datos'
import { medirClub, type ConfigClub } from '../club'
import type { CONTRATO_CLUB } from '../../compartido/club'
import './ConoceClub.css'
import '../estilos/redisenio-cuenta.css'

type Informacion = { contrato: typeof CONTRATO_CLUB; config: ConfigClub; recarga: {minimo:number;maximo:number}; ahora:string }
function esInformacion(v: unknown): v is Informacion {
  if(!v||typeof v!=='object')return false
  const d=v as Informacion,c=d.contrato,r=d.recarga,g=d.config
  return !!c&&typeof c.version==='string'&&[c.cuota,c.dias,c.plazas,c.descuentoReposteria,c.anticipacionHoras].every(n=>Number.isSafeInteger(n)&&n>0)
    &&[c.cafe,c.bolsa,c.renovacion,c.cancelacion].every(t=>typeof t==='string'&&t.length>0)
    &&!!r&&Number.isSafeInteger(r.minimo)&&Number.isSafeInteger(r.maximo)&&r.minimo>0&&r.maximo>=r.minimo
    &&!!g&&Number.isSafeInteger(g.version)&&Array.isArray(g.reposteria_productos)&&g.reposteria_productos.every(t=>typeof t==='string')
    &&[g.cafe_detalle,g.sellos_regla,g.premio_detalle,g.vip_regla].every(t=>t===null||typeof t==='string')
    &&typeof d.ahora==='string'&&Number.isFinite(Date.parse(d.ahora))
}

/** Una explicación pública. Ninguna acción aquí contrata, cobra ni emite un código. */
export function ConoceClub({navegar}:{navegar:(ruta:string)=>void}) {
  const { dentro }=useDatos()
  useEffect(()=>{if(dentro)medirClub('informacion_vista')},[dentro])
  const [info,setInfo]=useState<Informacion|null>(null),[error,setError]=useState(''),[revision,revisar]=useState(0)
  useEffect(()=>{
    const control=new AbortController();let vigente=true
    const limite=setTimeout(()=>control.abort(),10000)
    setInfo(null);setError('')
    void (async()=>{
      try {
        const respuesta=await fetch('/api/club/informacion',{credentials:'omit',cache:'reload',signal:control.signal})
        if(!respuesta.ok)throw Error('condiciones-no-disponibles')
        const datos:unknown=await respuesta.json()
        if(!esInformacion(datos))throw Error('condiciones-incompletas')
        if(vigente)setInfo(datos)
      } catch { if(vigente)setError('No pudimos consultar las condiciones actuales. Volvé a intentar antes de decidir sobre Mesa Fundadora.') }
      finally { clearTimeout(limite) }
    })()
    return()=>{vigente=false;clearTimeout(limite);control.abort()}
  },[revision])
  useEffect(()=>{
    const actualizar=()=>{if(document.visibilityState==='visible')revisar(n=>n+1)}
    window.addEventListener('focus',actualizar);window.addEventListener('online',actualizar)
    document.addEventListener('visibilitychange',actualizar)
    return()=>{window.removeEventListener('focus',actualizar);window.removeEventListener('online',actualizar);document.removeEventListener('visibilitychange',actualizar)}
  },[])
  const seguir=(e:MouseEvent<HTMLAnchorElement>,ruta:string)=>{if(dentro&&e.button===0){if(ruta==='#mesa-fundadora')medirClub('informacion_mesa');if(ruta==='/club')medirClub('informacion_acceso')}if(!ruta.startsWith('#')&&e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();navegar(ruta)}}
  const enlace=(ruta:string,texto:string,clase='conoce-enlace')=><a className={clase} href={ruta} onClick={e=>seguir(e,ruta)}>{texto}</a>
  const c=info?.contrato,g=info?.config
  return <main id="contenido" tabIndex={-1} className="marco conoce-club pb-28">
    <header className="conoce-portada"><div className="conoce-portada-texto">
      <Eyebrow>La Bella Lupita · Club Lupita</Eyebrow>
      <h1 className="casa-titular">Conocé tu club</h1>
      <p className="conoce-intro">Un lugar para tus sellos, tu saldo y tus próximas visitas a la casa.</p>
      <p>Tu cuenta es gratuita. Si querés sumar beneficios, Mesa Fundadora es una membresía opcional.</p>
      <div className="conoce-acciones">{enlace('/club',dentro?'Ir a Mi Club':'Crear mi cuenta o ingresar','conoce-boton')}{enlace('#mesa-fundadora','Ver Mesa Fundadora')}</div>
      <p className="t-caption">Ingresar o consultar tus beneficios no inicia ningún cobro.</p></div><figure className="conoce-portada-foto"><img src="/brand/v3/desayuno.webp" width="960" height="609" alt="Desayuno servido en La Bella Lupita" decoding="async"/><figcaption>Para disfrutar la casa, a tu manera.</figcaption></figure>
    </header>
    <nav className="cuenta-atajos" aria-label="Conocé el Club"><a href="#conoce-gratis">Cuenta gratuita</a><a href="#mesa-fundadora">Mesa Fundadora</a><a href="#conoce-condiciones">Preguntas frecuentes</a></nav>
    <div className="conoce-comparacion">
      <section aria-labelledby="conoce-gratis" className="conoce-panel">
        <Eyebrow>Para empezar</Eyebrow><h2 id="conoce-gratis" tabIndex={-1} className="t-seccion">Tu cuenta de casa</h2>
        <p className="conoce-precio">Sin cuota de membresía</p>
        <ul><li>Seguí tus sellos y tu próxima bebida de cortesía.</li><li>Consultá el saldo y los movimientos de tu Cuenta de Casa.</li><li>Revisá tus pedidos, entradas y reservas en un solo lugar.</li></ul>
        <p>Los consumos, las entradas y los depósitos que correspondan se pagan por separado.</p>
        {enlace('/pedir','Explorar la carta')}
      </section>
      <section id="mesa-fundadora" aria-labelledby="conoce-fundadora" className="conoce-panel conoce-fundadora" tabIndex={-1}>
        <Eyebrow>Opcional</Eyebrow><h2 id="conoce-fundadora" className="t-seccion">Mesa Fundadora</h2>
        {!info&&!error&&<p role="status">Consultando beneficios y cuota actuales…</p>}
        {error&&<div><p role="alert">{error}</p><Boton tono="contorno" onClick={()=>revisar(n=>n+1)}>Reintentar condiciones</Boton></div>}
        {c&&<><p className="conoce-precio">{cordobas(c.cuota)} <span>cada {c.dias} días</span></p>
          <ul><li><strong>{c.cafe}.</strong> El día se cuenta con la hora de Managua.</li><li><strong>{c.bolsa}.</strong> La fecha del período aparece en Mi Club.</li><li><strong>{c.descuentoReposteria}% en repostería incluida.</strong></li><li><strong>Prioridad de horario en el Salón VIP.</strong> Sujeta a disponibilidad y confirmación de la casa.</li><li><strong>Acceso a experiencias {c.anticipacionHoras} horas antes.</strong> Cada entrada se compra por separado, según su calendario.</li></ul>
          <p>Hasta {c.plazas} plazas. Consultá las disponibles en Mi Club; si están ocupadas, podés unirte a la lista de espera.</p>
          {enlace('/club',dentro?'Revisar disponibilidad en Mi Club':'Ingresar para revisar disponibilidad','conoce-boton')}
        </>}
      </section>
    </div>
    <section aria-labelledby="conoce-pasos" className="conoce-seccion">
      <Eyebrow>En tu próxima visita</Eyebrow><h2 id="conoce-pasos" className="t-seccion">Así usás tu club</h2>
      <ol className="conoce-pasos"><li><span aria-hidden="true">01</span><h3>Mostrá tu pase</h3><p>En Mi Club abrís tu pase. La caja usa tu código para encontrar tu cuenta.</p></li><li><span aria-hidden="true">02</span><h3>Sumá tus sellos</h3><p>{g?.sellos_regla??'La caja registra las compras elegibles con su ticket. Consultá qué compras suman sello antes de pagar.'}</p></li><li><span aria-hidden="true">03</span><h3>Disfrutá tu premio</h3><p>Con nueve sellos obtenés una bebida de cortesía. Abrí «Mostrar mi premio» y presentá el código en caja para recibirla.</p></li></ol>
      <p>{g?.premio_detalle??'Consultá las bebidas, tamaños y extras incluidos en tu premio con la casa.'} El código muestra cuánto tiempo le queda; si vence sin usarse, podés generar otro. Tu premio se consume cuando la caja registra la entrega. Los premios anteriores conservan las condiciones con las que se ganaron.</p>
    </section>
    <section aria-labelledby="conoce-condiciones" className="conoce-seccion">
      <Eyebrow>Antes de decidir</Eyebrow><h2 id="conoce-condiciones" tabIndex={-1} className="t-seccion">Las cosas claras</h2>
      <details><summary>¿Cómo pago y recargo mi Cuenta de Casa?</summary><p>Recargás en caja y consultás el saldo en tu cuenta. {info&&<>La recarga permitida es de {cordobas(info.recarga.minimo)} a {cordobas(info.recarga.maximo)} por operación.</>} Cada compra muestra el importe antes de confirmar. Tener saldo no contrata Mesa Fundadora automáticamente.</p></details>
      <details><summary>¿Cómo se renueva y cómo la cancelo?</summary>{c?<><p>{c.renovacion} {c.cancelacion}</p><p>El cobro inicial requiere que revises y aceptes las condiciones. Si no alcanza el saldo, el período termina sin deuda. Una nueva contratación depende de las plazas disponibles.</p><p>Los contratos anteriores conservan sus condiciones; consultá las de tu período en Mi Club.</p></>:<p>Consultá las condiciones actuales cuando se restablezca la conexión.</p>}</details>
      <details><summary>¿Qué café, repostería y prioridad VIP incluye?</summary><p>{g?.cafe_detalle??'La casa está verificando el tamaño del café y los extras antes de publicar estas condiciones. Consultalos antes de contratar.'}</p><p>{g?.reposteria_productos?.length?`Repostería incluida: ${g.reposteria_productos.join(', ')}.`:'Productos con descuento: pendientes de activación por la casa. Consultalos antes de pagar.'}</p>{g?.reglas_version&&<p>El descuento corresponde a porciones individuales de esta lista. No incluye extras, pasteles enteros ni encargos, y no se acumula con otras promociones.</p>}<p>{g?.vip_regla??'La lista de espera VIP se habilitará cuando la casa verifique su operación. Mientras tanto, confirmá el horario con el equipo antes de reservar.'}</p></details>
      <details><summary>¿Cómo retiro el café y la bolsa de Mesa Fundadora?</summary><p>En Mi Club elegís «Mostrar código del café» o «Mostrar código de la bolsa». Presentalo en caja y verificá la entrega. La pantalla indica si ya usaste el beneficio y cuándo vence el código.</p><p>La bolsa de una nueva membresía corresponde al período pagado, aunque cambie el mes calendario. Consultá la fecha y las condiciones de tu contrato en Mi Club.</p></details>
      <details><summary>¿Qué pasa si no hay plazas o una experiencia cambia?</summary><p>La lista de espera pide tu consentimiento para que la casa te contacte; podés salir de ella desde Mi Club. No cobra ni garantiza una plaza. Las experiencias publican fecha, contenido, precio y condiciones antes de comprar. Revisá allí las reglas de cesión y cancelación de cada entrada.</p></details>
      <details><summary>¿Dónde pido ayuda y reviso mis datos?</summary><p>En Mi Club, «Avisos y ayuda de la casa» te permite consultar al equipo. En Perfil podés revisar tu información y solicitar ayuda con tus datos o tu cuenta. La respuesta aparece en la app; enviar una solicitud no cancela una membresía automáticamente.</p>{enlace('/perfil','Ir a mi perfil')}</details>
      {info&&<p className="t-caption conoce-version">Condiciones {c?.version} · Consultadas el {new Intl.DateTimeFormat('es-NI',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Managua'}).format(new Date(info.ahora))}, hora de Managua.</p>}
    </section>
    <footer className="conoce-cierre"><h2 className="t-seccion">Tu próxima visita empieza aquí</h2>{enlace('/club',dentro?'Abrir Mi Club':'Crear mi cuenta o ingresar','conoce-boton')}{enlace('/reservar','Consultar mesas')}</footer>
  </main>
}

~~~
