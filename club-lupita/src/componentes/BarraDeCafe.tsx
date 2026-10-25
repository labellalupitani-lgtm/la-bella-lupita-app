/**
 * La Barra — matriz, no lista.
 *
 * Antes esta pestaña eran veinticinco filas idénticas, veintiuna de ellas con
 * la misma frase debajo, y era lo primero que veía alguien que abriera la app
 * a las siete de la tarde. Una lista sirve para elementos heterogéneos; ocho
 * cafés que se distinguen por dos variables no lo son, y nueve limonadas que
 * se distinguen por una, menos todavía.
 *
 * Aquí la elección se ve entera de un vistazo: dos columnas —lo que va solo y
 * lo que lleva leche al vapor— y el anillo de taza, el primitivo gráfico de la
 * casa, indicando el volumen con su grosor y su diámetro. Cero bytes de imagen.
 */
import { useState } from 'react'
import { m } from 'motion/react'
import { CARTA, esAcompanar, esFriaDeCafe, esLimonada, type PlatoCarta } from '../data/menu'
import { cordobas } from '../lib/format'
import { RESORTE, CURVA, MS } from '../lib/movimiento'

/** Mililitros reales de cada taza: es lo que dibuja el anillo. */
const VOLUMEN: Record<string, number> = {
  espresso: 30,
  macchiato: 40,
  cortadito: 60,
  americano: 150,
  cappuccino: 180,
  latte: 240,
  mocha: 240,
  'te-caliente': 250,
}

// «Té Caliente» estaba bajo «Puro grano» con una descripción que dice «la
// opción sin café»: el rótulo del eje lo desmentía. Va aparte, con los suyos.
const SOLOS = ['espresso', 'americano']
const CON_LECHE = ['macchiato', 'cortadito', 'cappuccino', 'latte', 'mocha']
const SIN_CAFE = ['te-caliente']

/** Anillo de taza: el diámetro y el grosor cuentan el volumen sin decirlo. */
function Anillo({ ml }: { ml: number }) {
  // Lineal, el espresso (30 ml) y el macchiato (40) quedaban a un píxel y medio:
  // el anillo parecía un dato y era un adorno. La raíz cuadrada abre el rango
  // justo donde vive la diferencia, entre los tragos cortos.
  const t = Math.sqrt(Math.min(ml, 250) / 250)
  const d = 18 + t * 30 // 30 ml → 28,4 px · 40 ml → 30,0 · 240 ml → 47,4
  const grosor = 0.9 + t * 2.1
  return (
    <svg viewBox="0 0 56 56" width="52" height="52" className="taza" aria-hidden>
      <circle cx="28" cy="28" r={d / 2} fill="none" stroke="currentColor" strokeWidth={grosor} opacity="0.55" />
      <circle cx="28" cy="28" r={d / 2 - grosor - 1.5} fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
    </svg>
  )
}

function Celda({ p, onPedir, enCarrito }: { p: PlatoCarta; onPedir: () => void; enCarrito: number }) {
  return (
    <button
      className={enCarrito ? 'taza-celda es-pedida' : 'taza-celda'}
      onClick={onPedir}
      // El nombre accesible nombra la acción y el precio. Sin esto se leía la
      // tarjeta entera —perfil de taza incluido— sin un solo verbo.
      aria-label={`Pedir ${p.nombre}, ${cordobas(p.precio)}`}
    >
      <Anillo ml={VOLUMEN[p.id] ?? 120} />
      <span className="titulo-sm taza-celda__nombre">{p.nombre}</span>
      <span className="lab taza-celda__precio">{cordobas(p.precio)}</span>
      {p.perfil && <span className="lab-sm taza-celda__perfil">{p.perfil}</span>}
      <span className="caption taza-celda__desc">{p.descripcion}</span>
      {enCarrito > 0 && <span className="chip taza-celda__cuenta">×{enCarrito}</span>}
    </button>
  )
}

type Props = {
  enCarritoDe: (id: string) => number
  onPedir: (p: PlatoCarta) => void
}

export function BarraDeCafe({ enCarritoDe, onPedir }: Props) {
  const cafes = CARTA.filter((p) => p.categoria === 'bebidas-calientes')
  const limonadas = CARTA.filter(esLimonada)
  const friasDeCafe = CARTA.filter(esFriaDeCafe)
  const acompanar = CARTA.filter(esAcompanar)

  const [fruta, setFruta] = useState(limonadas[0]?.id ?? '')
  const elegida = limonadas.find((l) => l.id === fruta) ?? limonadas[0]

  const buscar = (id: string) => cafes.find((c) => c.id === id)

  return (
    <div className="barra-carta">
      {/* Los ocho cafés, de un vistazo. */}
      <section className="barra-bloque" aria-label="Café de la barra">
        <h2 className="titulo-lg">El mismo grano, ocho maneras.</h2>
        <p className="cuerpo-sm">
          Un solo lote de Matagalpa. Cambia la proporción de leche y cambia la taza.
        </p>

        <div className="matriz">
          <div className="matriz__columna">
            <p className="etiqueta matriz__eje">Puro grano</p>
            {SOLOS.map((id) => {
              const p = buscar(id)
              return p ? <Celda key={id} p={p} enCarrito={enCarritoDe(id)} onPedir={() => onPedir(p)} /> : null
            })}
            {/* Las columnas son dos y tres: esto cierra el hueco de la izquierda
                con lo que de verdad va ahí, en vez de dejar el aire suelto. */}
            <p className="etiqueta matriz__eje matriz__eje-bajo">Sin café</p>
            {SIN_CAFE.map((id) => {
              const p = buscar(id)
              return p ? <Celda key={id} p={p} enCarrito={enCarritoDe(id)} onPedir={() => onPedir(p)} /> : null
            })}
          </div>
          <div className="matriz__columna">
            <p className="etiqueta matriz__eje">Con leche al vapor</p>
            {CON_LECHE.map((id) => {
              const p = buscar(id)
              return p ? <Celda key={id} p={p} enCarrito={enCarritoDe(id)} onPedir={() => onPedir(p)} /> : null
            })}
          </div>
        </div>
      </section>

      {/* Las frías de café: son cinco y sí merecen su fila. */}
      <section className="barra-bloque" aria-label="Café frío">
        <h2 className="titulo-lg">El mismo café, con hielo.</h2>
        <ul className="lista-simple">
          {friasDeCafe.map((p) => (
            <li key={p.id} className="fila-simple">
              <div>
                <p className="titulo-sm">{p.nombre}</p>
                <p className="caption">{p.descripcion}</p>
              </div>
              <button className="boton boton-linea fila-simple__pedir" onClick={() => onPedir(p)}>
                <span className="lab">{cordobas(p.precio)}</span>
                <span className="solo-lectura">Pedir {p.nombre}</span>
                {enCarritoDe(p.id) > 0 && <span className="lab-sm"> ×{enCarritoDe(p.id)}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Nueve limonadas eran nueve filas con la misma frase. Ahora son una
          pieza con la fruta como decisión. */}
      {elegida && (
        <section className="barra-bloque" aria-label="Limonadas de la casa">
          <h2 className="titulo-lg">Limonadas de la casa.</h2>
          <p className="cuerpo-sm">
            Se exprimen al momento, vaso por vaso. Elegí la fruta; el limón es el mismo.
          </p>

          <div className="riel limonadas__frutas" role="group" aria-label="Elegí la fruta">
            {limonadas.map((l) => (
              <button
                key={l.id}
                className={l.id === fruta ? 'chip es-elegida' : 'chip chip-neutro'}
                aria-pressed={l.id === fruta}
                onClick={() => setFruta(l.id)}
              >
                {l.fruta ?? l.nombre}
              </button>
            ))}
          </div>

          <m.div
            key={elegida.id}
            className="limonadas__elegida"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MS.corta / 1000, ease: CURVA.extraccion }}
          >
            <div>
              <p className="titulo-md">{elegida.nombre}</p>
              <p className="cuerpo-sm">{elegida.descripcion}</p>
            </div>
            <m.button
              className="boton boton-verde"
              onClick={() => onPedir(elegida)}
              whileTap={{ scale: 0.98 }}
              transition={RESORTE.acusa}
            >
              Pedir · {cordobas(elegida.precio)}
              {enCarritoDe(elegida.id) > 0 && <span className="lab-sm"> ×{enCarritoDe(elegida.id)}</span>}
            </m.button>
          </m.div>
        </section>
      )}

      {/* De la nevera: acompañamientos, no protagonistas. */}
      <section className="barra-bloque" aria-label="De la nevera">
        <h2 className="titulo-md">De la nevera.</h2>
        <div className="tira">
          {acompanar.map((p) => (
            <button
              key={p.id}
              className="tira__pieza"
              onClick={() => onPedir(p)}
              aria-label={`Pedir ${p.nombre}, ${cordobas(p.precio)}`}
            >
              <span className="titulo-sm">{p.nombre}</span>
              <span className="lab">{cordobas(p.precio)}</span>
              <span className="caption">{p.descripcion}</span>
              {enCarritoDe(p.id) > 0 && <span className="lab-sm">×{enCarritoDe(p.id)}</span>}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
