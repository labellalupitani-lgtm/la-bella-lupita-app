import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence } from 'motion/react'
import { useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas } from '../lib/format'
import { RESORTE, CURVA, MS, acusarRecibo } from '../lib/movimiento'
import { CARTA, MOMENTOS, momentoDeLaHora, type Momento } from '../data/menu'
import { carta as copy, vacios } from '../data/copy'
import { Aviso } from '../componentes/Aviso'
import { useHoja } from '../componentes/useHoja'
import { Foto } from '../componentes/Foto'
import { BarraDeCafe } from '../componentes/BarraDeCafe'

export function Carta() {
  const { estado, despachar, comprar, totalCarrito, saldo } = useEstado()
  const { navigate } = useRouter()
  const [momento, setMomento] = useState<Momento>(() => momentoDeLaHora(new Date().getHours()))
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const hoja = useHoja<HTMLElement>(abierto, () => setAbierto(false))
  const [pagando, setPagando] = useState(false)

  const platos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const base = q
      ? CARTA.filter((p) => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q))
      : CARTA.filter((p) => p.momento === momento)
    return base
  }, [momento, busqueda])

  const info = MOMENTOS.find((x) => x.id === momento)!
  const unidades = estado.carrito.reduce((s, l) => s + l.cantidad, 0)
  const alcanza = saldo >= totalCarrito

  const agregar = (id: string, nombre: string) => {
    despachar({ tipo: 'agregarAlCarrito', platoId: id })
    acusarRecibo(10)
    setAviso(`${nombre} anotado.`)
  }

  return (
    <>
      <header className="marco encabezado">
        <button className="volver" onClick={() => navigate('/')}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a la casa
        </button>
        <p className="etiqueta encabezado__eyebrow">{copy.momentos}</p>
        <h1 className="display-md">{copy.title}</h1>
        <p className="cuerpo encabezado__bajada">{copy.subtitle}</p>
      </header>

      {/* Los cuatro momentos de la casa, no «categorías». */}
      <nav className="marco momentos" aria-label="Momentos de la casa">
        {MOMENTOS.map((mo) => (
          <button
            key={mo.id}
            className={momento === mo.id && !busqueda ? 'momento es-activo' : 'momento'}
            onClick={() => {
              setMomento(mo.id)
              setBusqueda('')
            }}
            aria-pressed={momento === mo.id && !busqueda}
          >
            <span className="etiqueta">{mo.titulo}</span>
            {momento === mo.id && !busqueda && (
              <m.span className="momento__filo" layoutId="filo-momento" transition={RESORTE.entra} aria-hidden />
            )}
          </button>
        ))}
      </nav>

      <div className="marco carta__cabecera">
        <m.p
          key={busqueda ? 'busqueda' : momento}
          className="cuerpo carta__desc"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MS.corta / 1000, ease: CURVA.extraccion }}
        >
          {busqueda ? `${platos.length} resultados en la carta.` : info.desc}
        </m.p>
        {!busqueda && (
          <p className="caption carta__tiempo">
            Listo en <span className="lab">{info.minutos}</span> min · {info.nota}
          </p>
        )}

        <label className="campo carta__buscar">
          <span className="solo-lectura">Buscar en la carta</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscá un plato o una bebida"
          />
        </label>
      </div>

      {/* La Barra no es una lista: son ocho cafés que se distinguen por dos
          variables y nueve limonadas que se distinguen por una. Se presentan
          como lo que son. */}
      {momento === 'barra' && !busqueda ? (
        <section className="marco carta__lista" aria-label="La barra">
          <BarraDeCafe
            enCarritoDe={(id) => estado.carrito.find((l) => l.platoId === id)?.cantidad ?? 0}
            onPedir={(p) => agregar(p.id, p.nombre)}
          />
        </section>
      ) : (
      <section className="marco carta__lista" aria-label="Platos y bebidas">
        {platos.length === 0 ? (
          <p className="vacio cuerpo-sm">{vacios.busqueda}</p>
        ) : (
          <ul>
            {platos.map((p, i) => {
              const enCarrito = estado.carrito.find((l) => l.platoId === p.id)?.cantidad ?? 0
              return (
                <m.li
                  key={p.id}
                  className="plato"
                  initial={busqueda ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: MS.corta / 1000,
                    ease: CURVA.extraccion,
                    delay: busqueda ? 0 : Math.min(i, 5) * 0.04,
                  }}
                >
                  {p.foto && (
                    <div className="foto foto-plato plato__foto">
                      {/* El hueco real son 92 px: no hacen falta 960. */}
                      <Foto src={p.foto} alt="" sizes="92px" width={92} height={92} />
                    </div>
                  )}
                  <div className="plato__cuerpo">
                    <div className="plato__linea">
                      <h3 className="titulo-sm">{p.nombre}</h3>
                      <span className="lab plato__precio">{cordobas(p.precio)}</span>
                    </div>
                    <p className="cuerpo-sm plato__desc">{p.descripcion}</p>
                    <div className="plato__acciones">
                      {p.popular && <span className="chip chip-neutro">de los más pedidos</span>}
                      <button className="boton boton-linea plato__pedir" onClick={() => agregar(p.id, p.nombre)}>
                        {enCarrito > 0 ? `Anotado ×${enCarrito}` : 'Pedir'}
                      </button>
                    </div>
                  </div>
                </m.li>
              )
            })}
          </ul>
        )}
      </section>
      )}

      {/* Carrito: hoja inferior, siempre reversible. */}
      <AnimatePresence>
        {unidades > 0 && !abierto && (
          <m.button
            className="carrito-pestana"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={RESORTE.entra}
            onClick={() => setAbierto(true)}
          >
            <span className="lab-sm">{unidades} en el pedido</span>
            <span className="lab">{cordobas(totalCarrito)}</span>
            <span className="etiqueta">Ver pedido</span>
          </m.button>
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {abierto && (
            <>
              <m.div
                className="telon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MS.corta / 1000 }}
              onClick={() => setAbierto(false)}
            />
            <m.aside
              ref={hoja}
              className="hoja"
              role="dialog"
              aria-modal="true"
              aria-label="Tu pedido"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%', transition: { duration: MS.media / 1000, ease: CURVA.caida } }}
              transition={RESORTE.despacha}
            >
              <span className="hoja__tirador" aria-hidden />
              <h2 className="titulo-lg">Tu pedido</h2>
              {estado.carrito.length === 0 ? (
                <p className="cuerpo-sm">{copy.carritoVacio.body}</p>
              ) : (
                <>
                  <ul className="pedido">
                    {estado.carrito.map((l) => {
                      const p = CARTA.find((x) => x.id === l.platoId)
                      if (!p) return null
                      return (
                        <li key={l.platoId} className="dato">
                          <span>{p.nombre}</span>
                          <span className="pedido__control">
                            <button
                              className="pedido__paso"
                              onClick={() => despachar({ tipo: 'ajustarCantidad', platoId: l.platoId, cantidad: l.cantidad - 1 })}
                              aria-label={`Quitar uno de ${p.nombre}`}
                            >
                              −
                            </button>
                            <span className="lab">{l.cantidad}</span>
                            <button
                              className="pedido__paso"
                              onClick={() => despachar({ tipo: 'ajustarCantidad', platoId: l.platoId, cantidad: l.cantidad + 1 })}
                              aria-label={`Agregar uno de ${p.nombre}`}
                            >
                              +
                            </button>
                            <span className="lab pedido__importe">{cordobas(p.precio * l.cantidad)}</span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="dato pedido__total">
                    <span className="titulo-sm">Total</span>
                    <span className="lab-lg dato__valor">{cordobas(totalCarrito)}</span>
                  </div>

                  <p className="caption">
                    {alcanza
                      ? `Se descuenta de tu Cuenta de Casa. Te quedarían ${cordobas(saldo - totalCarrito)}.`
                      : `Te faltan ${cordobas(totalCarrito - saldo)} en la Cuenta de Casa. Podés completar en el mostrador.`}
                  </p>

                  <button
                    className="boton boton-verde boton-lleno"
                    disabled={!alcanza || pagando}
                    onClick={async () => {
                      setPagando(true)
                      const detalle = estado.carrito
                        .map((l) => CARTA.find((x) => x.id === l.platoId)?.nombre)
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(', ')
                      const r = await comprar(
                        () => api.cobrar(totalCarrito, detalle || 'Pedido', `pedido:${Date.now()}`),
                        { tipo: 'pagarPedido' },
                      )
                      setPagando(false)
                      if (!r.ok) {
                        setAviso(r.error)
                        return
                      }
                      despachar({ tipo: 'vaciarCarrito' })
                      setAbierto(false)
                      acusarRecibo(18)
                      setAviso('Pedido anotado. Te lo dejamos listo en la barra a tu nombre.')
                    }}
                  >
                    {pagando ? 'Pasando la cuenta…' : 'Pagar con la Cuenta de Casa'}
                  </button>
                  <button className="boton boton-tenue boton-lleno" onClick={() => setAbierto(false)}>
                    Seguir viendo la carta
                  </button>
                </>
              )}
            </m.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
