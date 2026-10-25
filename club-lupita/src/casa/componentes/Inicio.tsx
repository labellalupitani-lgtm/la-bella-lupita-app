/**
 * Las tres piezas del Inicio canónico.
 *
 * `inicio_club_lupita_2` se eligió como canónica en SPEC.md §3 precisamente
 * por los accesos rápidos, y el kit no los tenía. Estas tres viven aparte
 * porque son las únicas del sistema atadas a una sola pantalla.
 */
import type { ReactNode } from 'react'
import { Boton, ChipEscasez, Icono, Progreso, type NombreIcono } from './Base'
import { Tarjeta } from './Superficies'
import { EstadoVacio, VACIOS } from './Estados'

/* ------------------------------------------------------------------
   RETO DE LA SEMANA — filete izquierdo de 4 px, como el prototipo.
   Es estructura permanente (SPEC.md §12.7): cuando no hay reto, el módulo
   se queda y lo dice. Una sección que desaparece deja un hueco que el
   socio lee como un fallo.
   ------------------------------------------------------------------ */
export function RetoDeLaSemana({
  titulo,
  premio,
  vas,
  meta,
  vacio,
}: {
  titulo?: string
  premio?: string
  vas?: number
  meta?: number
  /** Qué decir cuando no hay reto. No es lo mismo «no hay esta semana» que
   *  «esto todavía no existe»: la pantalla no puede citar a nadie el lunes
   *  para algo que nadie ha construido. */
  vacio?: { icono: NombreIcono; titulo: string; cuerpo: string }
}) {
  if (!titulo || vas === undefined || meta === undefined) {
    return (
      <Tarjeta className="border-l-4 border-l-banda">
        <EstadoVacio compacto {...(vacio ?? VACIOS.sinReto)} />
      </Tarjeta>
    )
  }
  const cumplido = vas >= meta
  return (
    <Tarjeta className="border-l-4 border-l-banda">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-texto text-cuerpo font-semibold text-tinta">
            <Icono nombre="local_fire_department" tam={16} lleno className="text-banda" />
            {titulo}
          </p>
          {premio && <p className="mt-0.5 t-caption">Premio: {premio}</p>}
        </div>
        <span className="shrink-0 font-texto text-menuda font-semibold uppercase tracking-wider tabular-nums text-tinta">
          {cumplido ? 'Cumplido' : `Vas ${vas} de ${meta}`}
        </span>
      </div>
      <Progreso
        de={vas}
        sobre={meta}
        etiqueta={`${vas} de ${meta} visitas del reto`}
        tono="accion"
        className="mt-3"
      />
    </Tarjeta>
  )
}

/* ------------------------------------------------------------------
   PASA EN LA CASA — el carril de lo que está por acabarse.
   Cada tarjeta lleva SIEMPRE su cifra de escasez: si no hay número que
   dar, la tarjeta no entra al carril.
   ------------------------------------------------------------------ */
export type CosaDeLaCasa = {
  id: string
  titulo: string
  bajada: string
  escasez: string
  iconoEscasez?: NombreIcono
  foto?: string | null
  cta: string
  onClick: () => void
}

export function PasaEnLaCasa({ cosas }: { cosas: CosaDeLaCasa[] }) {
  if (cosas.length === 0) return null
  return (
    <section className="casa-novedades" aria-labelledby="pasa-titulo">
      <h2 id="pasa-titulo" className="t-seccion mb-3">
        Pasa en la casa
      </h2>
      <ul className="space-y-3">
        {cosas.map((c) => (
          <li key={c.id}>
            <article className="overflow-hidden rounded-editorial border border-filete bg-papel p-4">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <ChipEscasez icono={c.iconoEscasez} tono="claro">{c.escasez}</ChipEscasez>
                  <h3 className="mt-3 font-titular text-guia font-bold">{c.titulo}</h3>
                  <p className="mt-2 t-caption">{c.bajada}</p>
                </div>
                {c.foto && <img src={c.foto} alt="" width={80} height={100} loading="lazy" className="h-24 w-20 shrink-0 rounded-editorial object-cover" />}
              </div>
              <button type="button" onClick={c.onClick} className="mt-2 flex min-h-[44px] items-center gap-2 font-texto text-pie font-semibold text-achiote">
                {c.cta}<Icono nombre="arrow_forward" tam={18} />
              </button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------
   ACCESOS RÁPIDOS — la fila de tres que el PRD exige y que sólo trae la
   variante canónica del Inicio. Es el motivo declarado de su elección.
   ------------------------------------------------------------------ */
export function AccesosRapidos({
  accesos,
}: {
  accesos: { icono: NombreIcono; texto: string; onClick: () => void }[]
}) {
  return (
    <nav className="casa-accesos" aria-label="Accesos rápidos">
      <ul className="grid grid-cols-3 gap-3">
        {accesos.map((a) => (
          <li key={a.texto}>
            <button
              type="button"
              onClick={a.onClick}
              className="flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-none border border-filete bg-papel p-3 text-center transition-colors duration-tactil hover:bg-avena active:scale-95"
            >
              <Icono nombre={a.icono} tam={24} className="text-banda" />
              <span className="font-texto text-menuda font-semibold uppercase leading-tight tracking-wider text-tinta">
                {a.texto}
              </span>
              <Icono nombre="chevron_right" tam={18} className="casa-acceso-flecha" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------
   LO DE SIEMPRE — el atajo del socio que ya sabe lo que quiere.
   No está en el prototipo, y entra porque el prototipo declara «Su pedido
   de siempre» en el check-in de caja: la casa ya conoce ese dato y no lo
   estaba usando del lado del socio.
   ------------------------------------------------------------------ */
export function LoDeSiempre({
  bebida,
  precio,
  minutos,
  onPedir,
  cargando = false,
}: {
  bebida: string
  precio: string
  minutos: number
  onPedir: () => void
  cargando?: boolean
}) {
  return (
    <Tarjeta className="casa-habitual flex items-start gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-troquel border border-filete bg-banda-velo text-banda">
        <Icono nombre="local_cafe" tam={24} lleno />
      </span>
      <div className="min-w-0 flex-1">
        <p className="t-eyebrow text-tinta-media">Lo de siempre</p>
        <p className="font-titular text-guia font-semibold leading-snug text-tinta">{bebida}</p>
        <p className="t-caption tabular-nums">
          {precio} · listo en {minutos} min
        </p>
      </div>
      <Boton onClick={onPedir} cargando={cargando} className="shrink-0 px-5">
        Pedir
      </Boton>
    </Tarjeta>
  )
}

export function ContenedorInicio({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>
}
