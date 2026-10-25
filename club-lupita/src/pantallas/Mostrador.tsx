/**
 * El Mostrador — la vista del negocio. Dos caras:
 *
 *  · Ficha de servicio: lo que ve el barista cuando el socio hace check-in.
 *    El 50% de los clientes valora ser recordado por encima de los puntos, y
 *    solo el 30% lo recibe. Esta pantalla cierra esa brecha.
 *  · Panel del dueño: las cifras con las que se mide si el sistema funciona.
 *    Transacciones identificadas, attach, float vivo y cupos.
 */
import { useEffect, useState } from 'react'
import { m } from 'motion/react'
import { bebidaDisponible, bolsaDisponible, useEstado } from '../lib/estado'
import { useRouter } from '../lib/router'
import { cordobas, fechaCorta, haceCuanto, numeroSocio } from '../lib/format'
import { CURVA, MS } from '../lib/movimiento'

/**
 * Los indicadores del negocio.
 *
 * Antes esto eran cuatro literales -34%, 31%, 4.2, 3.1%- presentados como el
 * panel del dueño y pegados a referencias reales de Panera y OXXO. En una app
 * cuya tesis escrita es «no es una cuenta regresiva inventada», esas cuatro
 * cadenas eran la última contradicción que le quedaba.
 *
 * Ahora hay dos clases de fila y se distinguen a la vista: las que la casa
 * puede calcular hoy con sus propios datos, y las que necesitan la caja
 * conectada. Estas últimas no muestran un número: muestran qué falta.
 */
type Indicadores = {
  visitasPorSocio: number | null
  sociosActivos: number
  bajasAnunciadas: number
  membresiasVivas: number
  gastoMes: number
  movimientosMes: number
}

const REFERENCIAS = [
  {
    id: 'identificadas',
    label: 'Transacciones identificadas',
    meta: 'meta año 1: 30-40%',
    nota: 'Panera 25% · Starbucks México 40% · OXXO 50.4%',
    falta: 'Se calcula cuando la caja mande también las ventas sin socio.',
  },
  {
    id: 'attach',
    label: 'Attach en visita de retiro',
    meta: 'meta: 30% o más',
    nota: 'Cada bolsa retirada arrastra consumo en mesa.',
    falta: 'Necesita el detalle de línea del punto de venta.',
  },
]


export function Mostrador() {
  const { estado, saldo, saldoPagado, saldoBono, nivel } = useEstado()
  const { navigate } = useRouter()
  const [cara, setCara] = useState<'barra' | 'dueno'>('barra')
  const [ind, setInd] = useState<Indicadores | null>(null)

  // El Mostrador tiene su propia puerta: la contraseña de la casa vive en el
  // navegador de quien lo abre, no en la sesión del socio.
  useEffect(() => {
    if (cara !== 'dueno') return
    let vivo = true
    const clave = localStorage.getItem('club-lupita:casa') ?? ''
    fetch('/api/panel', { headers: { 'x-casa': clave } })
      .then((r) => (r.ok ? (r.json() as Promise<{ indicadores?: Indicadores }>) : null))
      .then((d) => {
        if (vivo && d?.indicadores) setInd(d.indicadores)
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [cara])

  const s = estado.socio
  const gastoMes = s.cuenta
    .filter((mv) => mv.tipo === 'consumo' && Date.now() - new Date(mv.fecha).getTime() < 30 * 86_400_000)
    .reduce((acc, mv) => acc + Math.abs(mv.monto), 0)

  const floatVivo = 186000 + saldo // saldo de la casa + el de esta socia
  const sociosTomados = 100 - estado.cupos.sociosFundadores

  return (
    <div className="mostrador">
      <header className="marco-amplio encabezado">
        <button className="volver" onClick={() => navigate('/perfil')}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver al perfil
        </button>
        <p className="etiqueta encabezado__eyebrow">La casa por dentro</p>
        <h1 className="display-md">Mostrador</h1>

        <div className="mostrador__caras" aria-label="Vistas del mostrador">
          {(['barra', 'dueno'] as const).map((c) => (
            <button
              key={c}
              aria-pressed={cara === c}
              className={cara === c ? 'momento es-activo' : 'momento'}
              onClick={() => setCara(c)}
            >
              <span className="etiqueta">{c === 'barra' ? 'Ficha de servicio' : 'Panel del dueño'}</span>
              {cara === c && <m.span className="momento__filo" layoutId="filo-mostrador" aria-hidden />}
            </button>
          ))}
        </div>
      </header>

      {cara === 'barra' ? (
        <section className="marco-amplio" aria-label="Ficha de servicio">
          <m.article
            className="ficha"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MS.media / 1000, ease: CURVA.extraccion }}
          >
            <div className="ficha__cabeza">
              <div>
                <p className="etiqueta">Check-in en la barra</p>
                <h2 className="display-md">{s.nombre}</h2>
                <p className="caption">
                  {s.esMiembro ? `Mesa Fundadora ${numeroSocio(s.numeroSocio ?? 0)}` : nivel.nombre} · socia desde{' '}
                  {fechaCorta(new Date(s.desde))}
                </p>
              </div>
              <span className="sello" style={{ ['--s' as string]: '64px' }}>
                {s.sellos.length}
              </span>
            </div>

            <div className="ficha__rejilla">
              <div className="ficha__celda es-destacada">
                <p className="etiqueta">Lo de siempre</p>
                <p className="titulo-md">{s.bebidaDeSiempre}</p>
              </div>
              <div className="ficha__celda es-alerta">
                <p className="etiqueta">No puede comer</p>
                <p className="titulo-md">{s.alergias || 'Nada registrado'}</p>
              </div>
              <div className="ficha__celda">
                <p className="etiqueta">Tanda</p>
                <p className="lab-lg">{s.sellos.length} / 9</p>
                <p className="caption">
                  {s.sellos.length >= 9
                    ? 'Tanda cerrada: su décima va por cuenta de la casa.'
                    : s.sellos.length === 8
                      ? 'Le falta uno. Decíselo.'
                      : `${s.tandasCerradas} tandas cerradas antes.`}
                </p>
              </div>
              <div className="ficha__celda">
                <p className="etiqueta">Bebida del día</p>
                <p className="titulo-md">{bebidaDisponible(s) ? 'Sin usar — no cobrar' : 'Ya la usó hoy'}</p>
              </div>
              <div className="ficha__celda">
                <p className="etiqueta">Bolsa del mes</p>
                <p className="titulo-md">{bolsaDisponible(s) ? 'Lista para entregar' : 'Retirada este mes'}</p>
              </div>
              <div className="ficha__celda">
                <p className="etiqueta">Cuenta de Casa</p>
                <p className="lab-lg">{cordobas(saldo)}</p>
                <p className="caption">gastó {cordobas(gastoMes)} este mes</p>
              </div>
            </div>

            <div className="ficha__ultimas">
              <p className="etiqueta">Últimas visitas</p>
              <ul>
                {[...s.sellos]
                  .reverse()
                  .slice(0, 4)
                  .map((x) => (
                    <li key={x.n} className="dato">
                      <span>{x.motivo}</span>
                      <span className="dato__valor caption">
                        {haceCuanto(new Date(x.fecha))} · atendió {x.barista}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <p className="caption ficha__nota">
              Lo que aparece acá lo escribió ella en su perfil. Si te dice algo nuevo, anotalo: la próxima vez alguien
              más va a saberlo.
            </p>
          </m.article>
        </section>
      ) : (
        <section className="marco-amplio" aria-label="Panel del dueño">
          <div className="panel">
            <article className="tarjeta-lg panel__grande">
              <p className="etiqueta">Saldo prepago vivo</p>
              <p className="lab-xl">{cordobas(floatVivo)}</p>
              <p className="caption">
                {cordobas(saldoPagado + 160000)} de socios · {cordobas(saldoBono + 26000)} que puso la casa
              </p>
              <p className="cuerpo-sm">
                Es caja cobrada por adelantado. La parte que puso la casa se paga en costo de producto, no en efectivo.
              </p>
            </article>

            <article className="tarjeta-lg panel__grande">
              <p className="etiqueta">Mesa Fundadora</p>
              <p className="lab-xl">
                {sociosTomados}
                <span className="panel__de"> / 100</span>
              </p>
              <div className="cupo__barra" aria-hidden>
                <span style={{ width: `${sociosTomados}%` }} />
              </div>
              <p className="caption">
                {cordobas(sociosTomados * 95000)} de ingreso fijo al mes · lista de espera: 17
              </p>
            </article>

            <article className="tarjeta panel__celda">
              <p className="etiqueta">Visitas por socio, 30 días</p>
              <p className="lab-lg">{ind?.visitasPorSocio != null ? ind.visitasPorSocio.toFixed(1) : '—'}</p>
              <p className="caption">
                sobre {ind?.sociosActivos ?? 0} {(ind?.sociosActivos ?? 0) === 1 ? 'socio activo' : 'socios activos'}
              </p>
              <p className="caption panel__nota">Palace Coffee pasó de 1–2 a 3–4 por semana con su membresía.</p>
            </article>

            <article className="tarjeta panel__celda">
              <p className="etiqueta">Membresías que no renuevan</p>
              <p className="lab-lg">{ind ? ind.bajasAnunciadas + ' de ' + ind.membresiasVivas : '—'}</p>
              <p className="caption">canceladas, vigentes hasta su fecha</p>
              <p className="caption panel__nota">Referencia indie: 4–6% de baja mensual.</p>
            </article>

            <article className="tarjeta panel__celda">
              <p className="etiqueta">Consumo con monedero, 30 días</p>
              <p className="lab-lg">{ind ? cordobas(ind.gastoMes) : '—'}</p>
              <p className="caption">
                en {ind?.movimientosMes ?? 0} {(ind?.movimientosMes ?? 0) === 1 ? 'movimiento' : 'movimientos'}
              </p>
              <p className="caption panel__nota">Es caja ya cobrada: el gasto solo la convierte en producto.</p>
            </article>

            {/* Lo que todavía no se puede medir se dice, no se rellena. */}
            {REFERENCIAS.map((k) => (
              <article key={k.id} className="tarjeta panel__celda es-pendiente">
                <p className="etiqueta">{k.label}</p>
                <p className="titulo-sm panel__pendiente">Falta conectar la caja</p>
                <p className="caption">{k.falta}</p>
                <p className="caption panel__nota">{k.meta + ' · ' + k.nota}</p>
              </article>
            ))}

            <article className="tarjeta panel__celda">
              <p className="etiqueta">Reserva de Cosecha</p>
              <p className="lab-lg">
                {150 - estado.cupos.bolsasReserva}
                <span className="panel__de"> / 150</span>
              </p>
              <p className="caption">{cordobas((150 - estado.cupos.bolsasReserva) * 89000)} cobrados por adelantado</p>
            </article>

            <article className="tarjeta panel__celda">
              <p className="etiqueta">Mesa del Tostador · 12 sep</p>
              <p className="lab-lg">
                {12 - estado.cupos.mesaTostador}
                <span className="panel__de"> / 12</span>
              </p>
              <p className="caption">{cordobas((12 - estado.cupos.mesaTostador) * 75000)} prepagados, no reembolsables</p>
            </article>
          </div>

          <p className="caption panel__pie">
            Las cifras de referencia provienen de la investigación de las fases 1 a 3. Los valores de la casa se
            calculan sobre la actividad real de esta cuenta más una base de demostración.
          </p>
        </section>
      )}
    </div>
  )
}
