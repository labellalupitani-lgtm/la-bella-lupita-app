import { useMemo, useState } from 'react'
import { m } from 'motion/react'
import { bolsaDisponible, useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas, elegirEstable, numeroSocio } from '../lib/format'
import { alAparecer, entraDesdeAbajo, MS, CURVA } from '../lib/movimiento'
import { apertura, franjaDeLaHora, home, saludos, t, tanda as copyTanda, casa } from '../data/copy'
import { buscarPlato, CARTA, MOMENTOS } from '../data/menu'
import { Comanda } from '../componentes/Comanda'
import { MiniTanda } from '../componentes/MiniTanda'
import { Aviso } from '../componentes/Aviso'

export function Casa() {
  const { estado, despachar, comprar, saldo, nivel, siguienteNivel, sellosParaSiguienteNivel } = useEstado()
  const { navigate } = useRouter()
  const [aviso, setAviso] = useState<string | null>(null)

  const ahora = useMemo(() => new Date(), [])
  const franja = franjaDeLaHora(ahora.getHours())
  // El saludo se elige una vez por montaje: no debe bailar mientras el socio mira.
  const saludo = useMemo(
    () => t(elegirEstable(saludos[franja], ahora.getTime() / 60000), {
      nombre: estado.socio.nombre,
      apertura: apertura(ahora),
    }),
    [franja, ahora, estado.socio.nombre],
  )

  // «Lo de siempre» sale de lo que el socio declaro en su perfil; si no dijo
  // nada, de lo que mas repitio en la tanda; y solo entonces, del espresso.
  const usual = useMemo(() => {
    const dicho = estado.socio.bebidaDeSiempre.trim().toLowerCase()
    if (dicho) {
      const porNombre = CARTA.find((p) => dicho.includes(p.nombre.toLowerCase()))
      if (porNombre) return porNombre
    }
    const cuenta = new Map<string, number>()
    for (const s of estado.socio.sellos) {
      const p = CARTA.find((x) => x.nombre === s.motivo)
      if (p) cuenta.set(p.id, (cuenta.get(p.id) ?? 0) + 1)
    }
    const masPedido = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]
    return (masPedido && buscarPlato(masPedido[0])) || buscarPlato('cappuccino') || CARTA[0]
  }, [estado.socio.bebidaDeSiempre, estado.socio.sellos])

  const acompanamiento = buscarPlato('dulce-tentacion') ?? buscarPlato('nica-toast') ?? null
  // El tiempo de preparación es del PLATO, no de la hora: un cappuccino sale
  // en seis minutos aunque uno lo pida a la hora del bistró.
  const minutos = MOMENTOS.find((x) => x.id === usual.momento)?.minutos ?? 6

  const sellos = estado.socio.sellos.length
  const faltaUno = sellos === 8
  const cerrada = sellos >= 9

  const pedir = (conAcomp: boolean) => {
    despachar({ tipo: 'agregarAlCarrito', platoId: usual.id })
    if (conAcomp && acompanamiento) despachar({ tipo: 'agregarAlCarrito', platoId: acompanamiento.id })
    setAviso(`${usual.nombre} anotado. Revisá el pedido antes de mandarlo a la barra.`)
  }

  return (
    <>
      {/* EL PRIMER PLIEGUE ES UNA SOLA IDEA.
          Antes esta pantalla repartía el primer pliegue entre un saludo, dos
          tarjetas de cifra, una de membresía y un riel: seis cosas compitiendo
          por ocho segundos de atención, y lo único con autoría propia —la
          comanda— comprimido entre medio. Ahora la comanda ES el pliegue. */}
      <section className="casa__pliegue" aria-label="Lo de siempre">
        <div className="marco casa__hola">
          <m.p className="etiqueta" {...entraDesdeAbajo}>
            {casa.nombre} · Club
          </m.p>
          <m.h1
            className="display-lg casa__saludo"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MS.larga / 1000, ease: CURVA.extraccion, delay: 0.04 }}
          >
            {saludo}
          </m.h1>
        </div>

        <div className="marco casa__comanda">
          <Comanda usual={usual} acompanamiento={acompanamiento} minutos={minutos} onPedir={pedir} />
        </div>

        {/* Las cifras dejan de ser tarjetas y pasan a ser una línea de datos.
            Una línea informa igual y no compite con la idea de arriba. */}
        <div className="marco casa__linea">
          <button className="casa__dato" onClick={() => navigate('/cuenta')}>
            <span className="etiqueta">Cuenta</span>
            <span className="lab casa__dato-valor">{cordobas(saldo)}</span>
          </button>
          <span className="casa__separador" aria-hidden />
          <button className="casa__dato" onClick={() => navigate('/tanda')}>
            <span className="etiqueta">Tanda</span>
            <span className="lab casa__dato-valor">{sellos} de 9</span>
          </button>
          <span className="casa__separador" aria-hidden />
          <button className="casa__dato" onClick={() => navigate('/perfil')}>
            <span className="etiqueta">Nivel</span>
            <span className="lab casa__dato-valor">{nivel.nombre}</span>
          </button>
        </div>
      </section>

      {/* La tanda entera, ya bajo el pliegue: quien baja es porque le interesa. */}
      <section className="marco seccion" aria-label="Tu tanda">
        <div className="seccion__titulo">
          <h2 className="titulo-md">{copyTanda.nombre}</h2>
          <button className="enlace-fino" onClick={() => navigate('/tanda')}>
            Ver la tarjeta
          </button>
        </div>
        <MiniTanda sellos={sellos} onAbrir={() => navigate('/tanda')} />
        {faltaUno && (
          <m.p className="cuerpo-sm casa__falta" {...alAparecer}>
            {copyTanda.faltaUno.body}
          </m.p>
        )}
        {cerrada && (
          <m.button className="boton boton-verde boton-lleno casa__canjear" {...alAparecer} onClick={() => navigate('/tanda')}>
            {copyTanda.completa.cta}
          </m.button>
        )}
        {siguienteNivel && sellosParaSiguienteNivel > 0 && (
          <p className="cuerpo-sm casa__push">
            {t(siguienteNivel.id === 'mesa_de_siempre' ? home.push.a2 : home.push.a3, {
              n: sellosParaSiguienteNivel,
            })}
          </p>
        )}
      </section>

      {/* Membresía: el ancla física de la cuota. */}
      <section className="marco seccion" aria-label="Tu membresía">
        {estado.socio.esMiembro ? (
          <div className="tarjeta-lg casa__socio">
            <div className="casa__socio-cabeza">
              <span className="etiqueta">Mesa Fundadora</span>
              <span className="lab casa__socio-num">
                {numeroSocio(estado.socio.numeroSocio ?? 0)} <span aria-hidden>/ 100</span>
              </span>
            </div>
            <h3 className="titulo-lg">
              {!bolsaDisponible(estado.socio) ? (
                <>Tu bolsa de este mes ya está en tu cocina.</>
              ) : (
                <>
                  Tu bolsa de 250 g está tostada y <span className="acento">con tu nombre</span>.
                </>
              )}
            </h3>
            <p className="cuerpo-sm">
              {!bolsaDisponible(estado.socio)
                ? 'La próxima se aparta el primero del mes que viene, con el lote nuevo.'
                : 'Pasá a retirarla cuando podás, de 7 a 9. No caduca mientras seás socio.'}
            </p>
            {bolsaDisponible(estado.socio) && (
              <button
                className="boton boton-verde"
                onClick={async () => {
                  const r = await comprar(() => api.usarBeneficio('bolsa_mes'), { tipo: 'retirarBolsa' })
                  setAviso(
                    r.ok ? 'Bolsa marcada para retiro. Te esperamos en la barra con tu nombre escrito.' : r.error,
                  )
                }}
              >
                Marcar para retiro
              </button>
            )}
          </div>
        ) : (
          <button className="tarjeta-lg casa__invita" onClick={() => navigate('/mesa-fundadora')}>
            <span className="etiqueta">Mesa Fundadora</span>
            <span className="titulo-lg">Cien socios, no más.</span>
            <span className="cuerpo-sm">
              Una bolsa del lote cada mes, una bebida por visita y las experiencias antes que nadie.
            </span>
            <span className="chip">quedan {estado.cupos.sociosFundadores} de 100</span>
          </button>
        )}
      </section>

      {/* Lo que baja de la montaña. */}
      <section className="seccion" aria-label="De la finca y de la casa">
        <div className="marco seccion__titulo">
          <h2 className="titulo-md">Esta semana en la casa</h2>
        </div>
        <div className="riel">
          <button className="riel__carta" onClick={() => navigate('/finca')}>
            <span className="etiqueta">Reserva de Cosecha</span>
            <span className="titulo-sm">Ciento cincuenta bolsas, cada una con su número.</span>
            <span className="chip">quedan {estado.cupos.bolsasReserva} de 150</span>
          </button>
          <button className="riel__carta" onClick={() => navigate('/experiencias')}>
            <span className="etiqueta">Mesa del Tostador</span>
            <span className="titulo-sm">Tres lotes, una mesa larga, doce sillas.</span>
            <span className="chip chip-aviso">quedan {estado.cupos.mesaTostador} cupos</span>
          </button>
          <button className="riel__carta" onClick={() => navigate('/finca/lote')}>
            <span className="etiqueta">Lote 04 · El Aguacatal</span>
            <span className="titulo-sm">86.5 puntos, a 1,340 metros, bajo sombra de aguacate.</span>
            <span className="chip chip-neutro">Ver la ficha completa</span>
          </button>
          <button className="riel__carta" onClick={() => navigate('/reservar')}>
            <span className="etiqueta">Salón VIP</span>
            <span className="titulo-sm">Café de altura para conversaciones que importan.</span>
            <span className="chip chip-neutro">Apartar con C$ 500</span>
          </button>
        </div>
      </section>

      <footer className="marco casa__pie">
        <hr className="regla" />
        <p className="etiqueta">{casa.perfil}</p>
        <p className="caption">{casa.direccion}</p>
        <p className="caption">{casa.horario}</p>
      </footer>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
