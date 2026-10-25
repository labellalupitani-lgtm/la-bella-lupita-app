import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Boton } from '../componentes/Base'
import { cordobas } from '../datos'
import { Aviso, Estado, fechaHora, Sincronizacion, useLectura, type Pagina } from './comun'

type Cliente={id:string;nombre:string;telefono:string;correo:string|null;correo_verificado:string|null;creado:string;baja:string|null;origen:string;archivado_muestra:string|null}
type Directorio=Pagina<Cliente>&{registrados:number;activos:number;verificados:number;muestras_archivadas:number}
type Ficha=Cliente&{bebida_siempre:string|null;alergias:string|null;cumple:string|null;cumple_mes_dia:string|null;promociones_correo:boolean;saldo:{pagado:number;bono:number;total:number};puntos:{puntos:number;nivel:string}|null;membresia:{numero:number;estado:string;desde:string;hasta:string;autorenueva:boolean;consentida:boolean}|null;pedidos:number;ultimo_pedido:string|null}
type Actividad={id:string;tipo:string;fecha:string;titulo:string;detalle:Record<string,unknown>}
const origenes:Record<string,string>={correo:'Registro por correo',anterior:'Registro anterior',muestra:'Dato de muestra'}
const tipos=[['todos','Toda la actividad'],['dinero','Movimientos de saldo'],['pedidos','Pedidos'],['reservas','Reservas'],['bolsas','Bolsas'],['experiencias','Experiencias'],['sellos','Sellos'],['canjes','Canjes de tandas'],['puntos','Puntos'],['membresias','Membresías'],['beneficios','Beneficios entregados'],['atencion','Atención']]
const fecha=(s:string)=>new Intl.DateTimeFormat('es-NI',{dateStyle:'medium',timeZone:'America/Managua'}).format(new Date(s))
const normal=(e:MouseEvent)=>e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey

export function ClientesEquipo({token,propietario}:{token:string;propietario:boolean}){
  const [consulta,setConsulta]=useState(location.search)
  useEffect(()=>{const pop=()=>setConsulta(location.search);window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop)},[])
  const params=new URLSearchParams(consulta),cliente=params.get('cliente')
  function url(cambios:Record<string,string|null>){const p=new URLSearchParams(consulta);p.set('seccion','clientes');for(const [k,v] of Object.entries(cambios))v?p.set(k,v):p.delete(k);return '/personal?'+p}
  function ir(destino:string,foco=false){history.pushState({},'',destino);setConsulta(location.search);if(foco){window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.getElementById('cliente-encabezado')?.focus({preventScroll:true}))}}
  return cliente?<FichaCliente key={cliente} id={cliente} token={token} volver={url({cliente:null})} ir={ir}/>:<DirectorioClientes token={token} propietario={propietario} params={params} url={url} ir={ir}/>
}

function DirectorioClientes({token,propietario,params,url,ir}:{token:string;propietario:boolean;params:URLSearchParams;url:(c:Record<string,string|null>)=>string;ir:(s:string,f?:boolean)=>void}){
  const q=params.get('q')??'',[busqueda,setBusqueda]=useState(q)
  const buscador=useRef<HTMLInputElement>(null)
  useEffect(()=>setBusqueda(q),[q])
  const estado=params.get('estado')??'todos',origen=params.get('origen')??'todos',desde=params.get('desde')??'',hasta=params.get('hasta')??'',archivo=params.get('archivo')??'operativos',pagina=Number(params.get('pagina')??0)
  const l=useLectura<Directorio>('/operacion/clientes?'+new URLSearchParams({q,estado,origen,desde,hasta,archivo,pagina:String(pagina)}),token),d=l.datos
  const filtrar=(c:Record<string,string|null>)=>ir(url({...c,pagina:null}))
  return <>
    <p id="cliente-encabezado" tabIndex={-1} className="equipo-nota">Todas las cuentas registradas, incluso las que todavía no tienen pedidos. Propietario y encargado pueden consultar estas fichas.</p>
    {d&&<dl className="equipo-cifras equipo-clientes-cifras">{[['Cuentas registradas',d.registrados],['Cuentas activas',d.activos],['Correo verificado',d.verificados]].map(([n,v])=><div key={n}><dt>{n}</dt><dd>{v}</dd></div>)}</dl>}
    {propietario&&<div className="equipo-pestanas" aria-label="Directorio o archivo"><Boton tono={archivo==='operativos'?'primario':'claro'} aria-pressed={archivo==='operativos'} onClick={()=>filtrar({archivo:null})}>Directorio</Boton><Boton tono={archivo==='muestras'?'primario':'claro'} aria-pressed={archivo==='muestras'} onClick={()=>filtrar({archivo:'muestras'})}>Muestras archivadas{d?' · '+d.muestras_archivadas:''}</Boton></div>}
    {archivo==='muestras'&&<p className="equipo-aviso">Archivo de consulta del propietario. Conserva el historial de prueba y está excluido de la operación y de las cifras reales.</p>}
    <form className="equipo-filtros" role="search" onSubmit={e=>{e.preventDefault();filtrar({q:busqueda.trim()})}}>
      <label>Buscar cliente<input ref={buscador} type="search" maxLength={100} placeholder="Nombre, correo o teléfono" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></label>
      <label>Estado<select value={estado} onChange={e=>filtrar({estado:e.target.value})}><option value="todos">Todos</option><option value="activos">Activos</option><option value="bajas">Dados de baja</option></select></label>
      <label>Origen<select value={origen} onChange={e=>filtrar({origen:e.target.value})}><option value="todos">Todos los orígenes</option>{Object.entries(origenes).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
      <label>Registro desde<input type="date" value={desde} max={hasta||undefined} onChange={e=>filtrar({desde:e.target.value})}/></label>
      <label>Registro hasta<input type="date" value={hasta} min={desde||undefined} onChange={e=>filtrar({hasta:e.target.value})}/></label>
      <Boton type="submit" tono="claro">Buscar</Boton>
      {(q||desde||hasta||estado!=='todos'||origen!=='todos')&&<Boton tono="tenue" onClick={()=>{setBusqueda('');filtrar({q:null,estado:null,origen:null,desde:null,hasta:null});buscador.current?.focus()}}>Limpiar filtros</Boton>}
    </form>
    <Sincronizacion {...l}/><Aviso error={l.error}/>
    {!d&&l.cargando&&<p role="status" className="equipo-vacio">Consultando clientes…</p>}
    {d&&<>
      <div className="equipo-paginacion"><p role="status">{d.total?`${pagina*20+1}–${Math.min((pagina+1)*20,d.total)} de ${d.total} cuentas`:'Sin resultados'}</p><nav aria-label="Páginas de clientes"><Boton tono="claro" compacto disabled={l.cargando||pagina===0} onClick={()=>ir(url({pagina:String(pagina-1)}))}>Anterior</Boton><span>Página {pagina+1} de {Math.max(1,Math.ceil(d.total/20))}</span><Boton tono="claro" compacto disabled={l.cargando||(pagina+1)*20>=d.total} onClick={()=>ir(url({pagina:String(pagina+1)}))}>Siguiente</Boton></nav></div>
      {!d.filas.length&&<p className="equipo-vacio">{archivo==='muestras'?'No hay muestras archivadas para estos filtros.':'No hay clientes para estos filtros.'}{pagina>0&&<Boton tono="tenue" onClick={()=>ir(url({pagina:null}))}>Volver a la primera página</Boton>}</p>}
      <div className="equipo-clientes-lista">{d.filas.map(c=><article className="equipo-cliente-tarjeta" key={c.id}>
        <div className="equipo-fila-titulo"><h2><a href={url({cliente:c.id})} onClick={e=>{if(normal(e)){e.preventDefault();ir(url({cliente:c.id}),true)}}}>{c.nombre}</a></h2><Estado valor={c.archivado_muestra?'archivado':c.baja?'baja':'activo'}/></div>
        <p>{c.correo??'Sin correo registrado'}</p><p>{c.telefono}</p><p className="equipo-nota">{c.correo_verificado?'Correo verificado':'Sin verificación de correo'} · Alta {fecha(c.creado)}</p><p className="equipo-nota">{origenes[c.origen]}</p>
        <a className="equipo-cliente-enlace" href={url({cliente:c.id})} aria-label={'Ver ficha de '+c.nombre} onClick={e=>{if(normal(e)){e.preventDefault();ir(url({cliente:c.id}),true)}}}>Ver ficha →</a>
      </article>)}</div>
    </>}
    <p className="equipo-nota mt-5">Los conteos superiores corresponden al directorio completo. Los filtros limitan los resultados de la lista. Las fechas usan la hora de Nicaragua.</p>
  </>
}

function FichaCliente({id,token,volver,ir}:{id:string;token:string;volver:string;ir:(s:string,f?:boolean)=>void}){
  const l=useLectura<Ficha>('/operacion/clientes/'+encodeURIComponent(id),token),c=l.datos
  const enfocado=useRef(false)
  useEffect(()=>{if(c&&!enfocado.current){enfocado.current=true;document.getElementById('cliente-encabezado')?.focus({preventScroll:true})}},[c])
  return <>
    <a className="equipo-cliente-enlace" href={volver} onClick={e=>{if(normal(e)){e.preventDefault();ir(volver,true)}}}>← Volver a clientes</a>
    <Sincronizacion {...l}/><Aviso error={l.error}/>{!c&&l.cargando&&<p role="status">Cargando ficha…</p>}
    {c&&<>
      <div className="equipo-fila-titulo"><h2 id="cliente-encabezado" tabIndex={-1} className="equipo-subtitulo">{c.nombre}</h2><Estado valor={c.archivado_muestra?'archivado':c.baja?'baja':'activo'}/></div>
      {c.archivado_muestra&&<p className="equipo-aviso">Muestra archivada el {fechaHora(c.archivado_muestra)}. Esta ficha conserva su historial; no participa en la operación real.</p>}
      <div className="equipo-ficha-columnas">
        <section className="equipo-panel"><h3>Contacto y registro</h3><dl className="equipo-ficha-datos">
          <div><dt>Correo</dt><dd>{c.correo??'Sin correo registrado'}</dd></div><div><dt>Verificación</dt><dd>{c.correo_verificado?'Verificado el '+fechaHora(c.correo_verificado):'Sin correo verificado'}</dd></div>
          <div><dt>Teléfono</dt><dd>{c.telefono}</dd></div><div><dt>Fecha de registro</dt><dd>{fechaHora(c.creado)}</dd></div><div><dt>Origen</dt><dd>{origenes[c.origen]}</dd></div>
          {c.baja&&<div><dt>Baja de la cuenta</dt><dd>{fechaHora(c.baja)}</dd></div>}<div><dt>Promociones por correo</dt><dd>{c.promociones_correo?'Aceptadas':'No aceptadas'}</dd></div>
          <div><dt>Bebida habitual</dt><dd>{c.bebida_siempre||'Sin indicar'}</dd></div><div><dt>Alergias declaradas</dt><dd>{c.alergias||'Sin indicar'}</dd></div><div><dt>Cumpleaños</dt><dd>{c.cumple_mes_dia?new Intl.DateTimeFormat('es-NI',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date('2000-'+c.cumple_mes_dia+'T12:00:00Z')):c.cumple?fecha(c.cumple.slice(0,10)+'T12:00:00Z'):'Sin indicar'}</dd></div>
        </dl></section>
        <section className="equipo-panel"><h3>Cuenta y membresía</h3><dl className="equipo-ficha-datos">
          <div><dt>Saldo disponible</dt><dd><strong>{cordobas(c.saldo.total)}</strong></dd></div><div><dt>Saldo pagado / bono</dt><dd>{cordobas(c.saldo.pagado)} / {cordobas(c.saldo.bono)}</dd></div>
          <div><dt>Puntos y nivel</dt><dd>{c.puntos?`${c.puntos.puntos} · ${c.puntos.nivel}`:'Sin puntos'}</dd></div><div><dt>Membresía</dt><dd>{c.membresia?`Mesa Fundadora #${c.membresia.numero} · ${c.membresia.estado.replaceAll('_',' ')}`:'Sin membresía'}</dd></div>
          {c.membresia&&<><div><dt>Período</dt><dd>{fecha(c.membresia.desde)} – {fecha(c.membresia.hasta)}</dd></div><div><dt>Renovación automática</dt><dd>{c.membresia.autorenueva&&c.membresia.consentida?'Autorizada':'No autorizada'}</dd></div></>}
          <div><dt>Pedidos registrados</dt><dd>{c.pedidos}</dd></div><div><dt>Último pedido</dt><dd>{c.ultimo_pedido?fechaHora(c.ultimo_pedido):'Todavía no tiene pedidos'}</dd></div>
        </dl><p className="equipo-nota">La consulta de esta ficha no cobra, renueva ni modifica la cuenta.</p></section>
      </div>
      <HistorialCliente token={token} id={id}/>
    </>}
  </>
}

function HistorialCliente({token,id}:{token:string;id:string}){
  const [tipo,setTipo]=useState('todos'),[paginas,setPaginas]=useState<string[]>([''])
  const cursor=paginas.at(-1)??'',l=useLectura<{filas:Actividad[];siguiente:string|null}>('/operacion/clientes/'+id+'/historial?'+new URLSearchParams({tipo,cursor}),token)
  return <section className="equipo-historial-cliente"><h2 className="equipo-subtitulo">Historial del cliente</h2><p className="equipo-nota">Actividad registrada en la aplicación, de la más reciente a la más antigua.</p>
    <div className="equipo-filtros"><label>Tipo de actividad<select value={tipo} onChange={e=>{setTipo(e.target.value);setPaginas([''])}}>{tipos.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label></div>
    <Sincronizacion {...l}/><Aviso error={l.error}/>{!l.datos&&l.cargando&&<p role="status">Consultando historial…</p>}
    {l.datos&&<><div className="equipo-paginacion"><span>Hasta 20 registros por página</span><nav aria-label="Páginas del historial"><Boton tono="claro" compacto disabled={l.cargando||paginas.length===1} onClick={()=>setPaginas(p=>p.slice(0,-1))}>Anterior</Boton><span>Página {paginas.length}</span><Boton tono="claro" compacto disabled={l.cargando||!l.datos.siguiente} onClick={()=>{const siguiente=l.datos?.siguiente;if(siguiente)setPaginas(p=>[...p,siguiente])}}>Siguiente</Boton></nav></div>
      {!l.datos.filas.length&&<p className="equipo-vacio">No hay actividad de este tipo.</p>}
      <ol className="equipo-registros">{l.datos.filas.map(a=><li key={a.id} className="equipo-registro"><div><p className="equipo-nota">{fechaHora(a.fecha)} · {tipos.find(([v])=>v===a.tipo)?.[1]}</p><h3>{a.titulo}</h3><DetalleActividad detalle={a.detalle}/></div></li>)}</ol></>}
  </section>
}

function DetalleActividad({detalle:d}:{detalle:Record<string,unknown>}){
  const etiquetas:Record<string,string>={estado:'Estado',tipo:'Movimiento',referencia:'Referencia',motivo:'Motivo',cuando:'Fecha de la actividad',termina:'Finaliza',personas:'Personas',deposito:'Depósito',cancelada:'Cancelación',generacion:'Generación',total:'Importe',monto:'Monto',entregada:'Entrega',butaca:'Butaca',asistencia:'Asistencia',cedida:'Entrada cedida',numero:'Sello',responsable:'Responsable',puntos:'Puntos',hasta:'Vigencia hasta',cuota:'Cuota',mensaje:'Mensaje',respuesta:'Respuesta',resuelta:'Resolución',abierta:'Tanda abierta',cerrada:'Tanda completada'}
  const fechas=['cuando','termina','cancelada','entregada','asistencia','hasta','resuelta','abierta','cerrada']
  return <dl className="equipo-actividad-datos">{Object.entries(d).filter(([k,v])=>v!==null&&v!==undefined&&k!=='lineas'&&k in etiquetas).map(([k,v])=><div key={k}><dt>{etiquetas[k]}</dt><dd>{['monto','total','deposito','cuota'].includes(k)?cordobas(Number(v)):fechas.includes(k)?fechaHora(String(v)):typeof v==='boolean'?v?'Sí':'No':String(v).replaceAll('_',' ')}</dd></div>)}{Array.isArray(d.lineas)&&d.lineas.length>0&&<div><dt>Detalle del pedido</dt><dd>{d.lineas.map((r:{nombre?:string;cuanto?:number},i:number)=><p key={i}>{r.cuanto} × {r.nombre}</p>)}</dd></div>}</dl>
}
