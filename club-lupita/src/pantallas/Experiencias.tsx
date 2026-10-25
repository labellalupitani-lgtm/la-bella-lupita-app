/**
 * Experiencias con ticket prepagado.
 *
 * Motor Tock: el prepago no reembolsable llevó los no-shows de Alinea de ~20%
 * a casi cero y sus utilidades subieron 38%. Aquí el prepago se explica de
 * frente —doce sillas, café ya tostado— y a cambio el pase es transferible.
 */
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence } from 'motion/react'
import { useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas } from '../lib/format'
import { RESORTE, CURVA, MS, acusarRecibo } from '../lib/movimiento'
import { experiencias as copy } from '../data/copy'
import { Aviso } from '../componentes/Aviso'
import { useHoja } from '../componentes/useHoja'
import { Foto } from '../componentes/Foto'
import { MesaLarga } from '../componentes/MesaLarga'

type Experiencia = {
  id: string
  nombre: string
  gancho: string
  desc: string
  incluye: string[]
  cupos: number
  precio: number
  cuando: string
  duracion: string
  aviso?: string
  foto: string
}

const EXPERIENCIAS: Experiencia[] = [
  {
    id: 'mesa-tostador',
    nombre: 'Mesa del Tostador',
    gancho: 'Tres lotes, una mesa larga, doce sillas.',
    desc: 'Nuestro tostador pone tres lotes de la misma finca uno al lado del otro y los cata con vos. Vas a probar lo que cambia la altura, el proceso y unos segundos de más en el tambor. Al final, elegís el que se te quedó.',
    incluye: [
      'Cata guiada de tres lotes de la cosecha',
      'Molienda y extracción explicadas en la barra',
      'Repostería de la casa a media mesa',
      'Bolsa de 250 g del lote que vos elijás',
    ],
    cupos: 12,
    precio: 75000,
    cuando: 'Viernes 12 de septiembre · 6:00 p.m.',
    duracion: '2 horas',
    foto: '/images/latte-logo-mesa-960.webp',
  },
  {
    id: 'cacao',
    nombre: 'Cata y maridaje con cacao nicaragüense',
    gancho: 'Dos cultivos que crecieron en la misma montaña.',
    desc: 'Café de Matagalpa y cacao nicaragüense en la misma mesa, servidos en pares. Verás por qué un lote lavado abre el chocolate al setenta por ciento y por qué otro lo cierra. Se cata, se conversa y se come.',
    incluye: [
      'Cuatro pares de café y cacao de origen',
      'Tabletas de tres productores nicaragüenses',
      'Postre de cierre hecho esa mañana',
      'Tableta para llevar a casa',
    ],
    cupos: 16,
    precio: 85000,
    cuando: 'Sábado 27 de septiembre · 4:00 p.m.',
    duracion: '2 horas',
    foto: '/images/salon-vip-cafe-ventana-960.webp',
  },
  {
    id: 'finca',
    nombre: 'Tour a la finca en Matagalpa',
    gancho: 'Subir a los 1,340 y ver de dónde viene todo.',
    desc: 'Salimos de Managua a las cinco de la mañana y subimos a la ladera. Vas a cortar café si estamos en cosecha, ver el beneficio húmedo, caminar los patios de secado y almorzar donde almuerza la familia. Se vuelve de noche, cansado y con otra idea del café.',
    incluye: [
      'Transporte ida y vuelta desde Plaza La Fe',
      'Recorrido del cafetal y del beneficio con la familia',
      'Almuerzo de montaña y café en el patio',
      'Bolsa de 340 g cosechada en esa ladera',
    ],
    cupos: 20,
    precio: 240000,
    cuando: 'Sábado 4 de octubre · 5:00 a.m.',
    duracion: 'Día completo',
    aviso: 'Se camina en pendiente y en tierra. Vení con zapato cerrado y capa de lluvia.',
    foto: '/images/lbl-v2-hero-poster-mobile.webp',
  },
]

export function Experiencias() {
  const { estado, comprar, saldo } = useEstado()
  const { navigate } = useRouter()
  const [abierta, setAbierta] = useState<Experiencia | null>(null)
  const [entendido, setEntendido] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const hoja = useHoja<HTMLElement>(!!abierta, () => setAbierta(null))

  // La escasez sale del servidor o no se dice. `e.cupos - 4` era una resta
  // constante disfrazada de inventario: exactamente lo que esta app prohibe.
  const cuposDe = (e: Experiencia): number | null =>
    e.id === 'mesa-tostador' ? estado.cupos.mesaTostador : (estado.cuposExperiencia?.[e.id] ?? null)

  const [apartando, setApartando] = useState(false)
  // Qué butaca dio el servidor, para encender ESA silla y no «la última
  // tomada». El dato ya venía en la respuesta y se estaba descartando.
  const [apartada, setApartada] = useState<{ id: string; butaca: number } | null>(null)

  // El aviso se lanza DESPUÉS de saber qué pasó. Antes se anunciaba «silla
  // apartada» aunque el reducer hubiera devuelto el estado intacto por falta
  // de cupo: una mentira de interfaz en la pantalla que cobra más caro.
  const apartar = async (e: Experiencia) => {
    if (apartando) return
    setApartando(true)
    try {
      if (saldo < e.precio) {
        setAviso(`Te faltan ${cordobas(e.precio - saldo)} en la Cuenta de Casa.`)
        return
      }
      const r = await comprar(() => api.apartarExperiencia(e.id), {
        tipo: 'apartarExperiencia',
        experienciaId: e.id,
        nombre: e.nombre,
        precio: e.precio,
      })
      if (!r.ok) {
        setAviso(r.error)
        return
      }
      acusarRecibo(18)
      const butaca = (r.datos as { butaca?: number } | undefined)?.butaca
      if (butaca) setApartada({ id: e.id, butaca })
      setAbierta(null)
      setEntendido(false)
      setAviso(`Silla apartada para ${e.nombre}. Se cobraron ${cordobas(e.precio)} de tu Cuenta de Casa.`)
    } finally {
      setApartando(false)
    }
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
        <p className="etiqueta encabezado__eyebrow">Prepago · cupos contados</p>
        <h1 className="display-md">{copy.title}</h1>
        <p className="cuerpo encabezado__bajada">{copy.subtitle}</p>
      </header>

      {estado.socio.esMiembro && (
        <p className="marco experiencias__socio">
          <span className="chip">Socios: acceso 48 horas antes</span>
        </p>
      )}

      <section className="marco experiencias__lista" aria-label="Experiencias disponibles">
        {EXPERIENCIAS.map((e, i) => {
          const libres = cuposDe(e)
          return (
            <m.article
              key={e.id}
              className="tarjeta-lg experiencia"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: MS.media / 1000, ease: CURVA.extraccion, delay: Math.min(i, 3) * 0.04 }}
            >
              <div className="foto experiencia__foto">
                <Foto src={e.foto} alt="" sizes="(min-width: 560px) 40vw, 100vw" width={640} height={400} />
              </div>
              <div className="experiencia__cuerpo">
                <MesaLarga cupos={e.cupos} libres={libres} mia={apartada?.id === e.id ? apartada.butaca : null} />
                {libres === null && <span className="chip chip-neutro">sin señal para confirmar cupos</span>}
                <h2 className="titulo-lg">{e.nombre}</h2>
                <p className="cuerpo-sm acento">{e.gancho}</p>
                <p className="caption">
                  {e.cuando} · {e.duracion}
                </p>
                <p className="lab-lg experiencia__precio">{cordobas(e.precio)}</p>
                <button
                  className="boton boton-linea boton-lleno"
                  disabled={libres === null || libres <= 0}
                  onClick={() => setAbierta(e)}
                >
                  {libres === null ? 'Sin señal para confirmar cupos' : libres <= 0 ? 'Sin cupos' : 'Ver y apartar'}
                </button>
              </div>
            </m.article>
          )
        })}
      </section>

      {createPortal(
        <AnimatePresence>
          {abierta && (
            <>
              <m.div
                className="telon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAbierta(null)}
            />
            <m.aside
              ref={hoja}
              className="hoja"
              role="dialog"
              aria-modal="true"
              aria-label={abierta.nombre}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%', transition: { duration: MS.media / 1000, ease: CURVA.caida } }}
              transition={RESORTE.despacha}
            >
              <span className="hoja__tirador" aria-hidden />
              <p className="etiqueta">{abierta.cuando}</p>
              <h2 className="titulo-lg">{abierta.nombre}</h2>
              <p className="cuerpo">{abierta.desc}</p>

              <h3 className="etiqueta">Qué incluye</h3>
              <ul className="lista-puntos">
                {abierta.incluye.map((x) => (
                  <li key={x} className="cuerpo-sm">
                    {x}
                  </li>
                ))}
              </ul>

              {abierta.aviso && <p className="caption acento">{abierta.aviso}</p>}

              <div className="prepago">
                <h3 className="titulo-sm">{copy.prepago.title}</h3>
                <p className="cuerpo-sm">{copy.prepago.body}</p>
                <p className="cuerpo-sm">{copy.prepago.opcion}</p>
                <label className="prepago__check">
                  <input type="checkbox" checked={entendido} onChange={(e) => setEntendido(e.target.checked)} />
                  <span className="cuerpo-sm">{copy.prepago.check}</span>
                </label>
              </div>

              <div className="dato">
                <span className="titulo-sm">Total</span>
                <span className="lab-lg dato__valor">{cordobas(abierta.precio)}</span>
              </div>
              <p className="caption">
                {saldo >= abierta.precio
                  ? `Se paga con tu Cuenta de Casa. Te quedarían ${cordobas(saldo - abierta.precio)}.`
                  : `Te faltan ${cordobas(abierta.precio - saldo)} en la Cuenta de Casa.`}
              </p>

              <button
                className="boton boton-verde boton-lleno"
                disabled={!entendido || apartando || saldo < abierta.precio || (cuposDe(abierta) ?? 0) <= 0}
                onClick={() => apartar(abierta)}
              >
                {apartando ? 'Pasando la cuenta…' : copy.prepago.cta}
              </button>
              <button className="boton boton-tenue boton-lleno" onClick={() => setAbierta(null)}>
                Mejor lo pienso
              </button>
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
