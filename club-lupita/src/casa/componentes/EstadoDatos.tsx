import { useDatos } from '../datos'
import { Boton } from './Base'

const fechaLectura = (iso: string) => new Intl.DateTimeFormat('es-NI', {
  dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Managua',
}).format(new Date(iso))

/** mostrarCarga=false se usa cuando el progreso ya está visible y anunciado en la acción de actualizar. */
export function EstadoCuenta({ detalle = false, mostrarCarga = true }: { detalle?: boolean; mostrarCarga?: boolean }) {
  const { yo, error, cargando, actualizado, refrescarCuenta } = useDatos()
  if (!yo || (!detalle && !error && !(cargando && mostrarCarga))) return null
  return <div className="my-3 space-y-2" aria-label="Estado de tu cuenta">
    {error && <p role="alert" className="t-caption text-achiote">No pudimos actualizar tu cuenta. {error} El saldo y los datos que ves corresponden a la última consulta disponible.</p>}
    {cargando && mostrarCarga && <p role="status" className="t-caption">Actualizando tu cuenta…</p>}
    {actualizado && (detalle || error) && <p className="t-caption">Última consulta de tu cuenta: <time dateTime={actualizado}>{fechaLectura(actualizado)}</time></p>}
    {error && <Boton tono="claro" cargando={cargando} onClick={() => void refrescarCuenta()}>Reintentar actualización de cuenta</Boton>}
  </div>
}

export function EstadoCatalogo() {
  const { catalogo, catalogoError, catalogoCargando, catalogoActualizado, refrescarCatalogo } = useDatos()
  if (!catalogoError && !catalogoCargando) return null
  return <div className="my-3 space-y-2" aria-label="Estado del catálogo">
    {catalogoCargando && <p role="status" className="t-caption">Actualizando el catálogo…</p>}
    {catalogoError && <>
      <p role="alert" className="t-caption text-achiote">No pudimos actualizar el catálogo. {catalogoError}{catalogo ? ' Conservamos la última información disponible.' : ''}</p>
      {catalogoActualizado && <p className="t-caption">Última consulta del catálogo: <time dateTime={catalogoActualizado}>{fechaLectura(catalogoActualizado)}</time></p>}
      <Boton tono="claro" cargando={catalogoCargando} onClick={() => void refrescarCatalogo()}>Actualizar catálogo</Boton>
    </>}
  </div>
}

export function EstadoCupos() {
  const { cuposError, cuposCargando, cuposActualizado, refrescarCupos } = useDatos()
  if (!cuposError) return null
  return <div className="my-3 space-y-2" aria-label="Estado de los cupos">
    <p role="alert" className="t-caption text-achiote">No pudimos actualizar los cupos. {cuposError}</p>
    {cuposActualizado && <p className="t-caption">Última consulta de cupos: <time dateTime={cuposActualizado}>{fechaLectura(cuposActualizado)}</time></p>}
    <Boton tono="claro" cargando={cuposCargando} onClick={() => void refrescarCupos()}>Actualizar cupos</Boton>
  </div>
}
