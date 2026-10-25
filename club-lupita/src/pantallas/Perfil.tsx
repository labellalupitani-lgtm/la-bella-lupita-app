import { useState } from 'react'
import { useEstado } from '../lib/estado'
import { useRouter } from '../lib/router'
import { cordobas, enlaceWhatsApp, fechaCorta, numeroSocio } from '../lib/format'
import { casa, exito, home, NIVELES, t } from '../data/copy'
import { Aviso } from '../componentes/Aviso'
import { CaminoDeAltura } from '../componentes/CaminoDeAltura'

export function Perfil() {
  const { estado, despachar, conServidor, salir, saldo, nivel, siguienteNivel, sellosParaSiguienteNivel } = useEstado()
  const { navigate } = useRouter()
  const [aviso, setAviso] = useState<string | null>(null)
  const [nombre, setNombre] = useState(estado.socio.nombre)
  const [bebida, setBebida] = useState(estado.socio.bebidaDeSiempre)
  const [alergias, setAlergias] = useState(estado.socio.alergias)

  const s = estado.socio
  const idxNivel = NIVELES.findIndex((n) => n.id === nivel.id)

  // El tema vive como clase en <html> y se guarda: antes se escribia en el
  // dataset y no se persistia, asi que cada recarga volvia a oscuro.
  const [tema, setTema] = useState(() =>
    document.documentElement.classList.contains('tema-tinta') ? 'tinta' : 'papel',
  )
  const cambiarTema = () => {
    const nuevo = tema === 'papel' ? 'tinta' : 'papel'
    const raiz = document.documentElement
    // Sin esto, los ~60 tokens hacen un fundido lechoso de 300 ms al conmutar.
    raiz.classList.add('tema-cambiando')
    raiz.classList.remove('tema-papel', 'tema-tinta')
    raiz.classList.add('tema-' + nuevo)
    try {
      localStorage.setItem('club-lupita:tema', nuevo)
    } catch (_) {
      /* modo privado: el tema dura lo que dure la sesion */
    }
    const soltar = () => raiz.classList.remove('tema-cambiando')
    requestAnimationFrame(() => requestAnimationFrame(soltar))
    setTimeout(soltar, 120) // red por si rAF esta pausado en pestaña de fondo
    setTema(nuevo)
    setAviso(
      nuevo === 'papel'
        ? 'Luz de mesa: papel, como la carta.'
        : 'Luz de la casa, para la sobremesa.',
    )
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
        <p className="etiqueta encabezado__eyebrow">
          Socio desde {fechaCorta(new Date(s.desde))}
          {s.numeroSocio ? ` · ${numeroSocio(s.numeroSocio)}` : ''}
        </p>
        <h1 className="display-md">{s.nombre}</h1>
      </header>

      {/* Camino de altura: los tres niveles como una ladera, no como insignias. */}
      <section className="marco seccion" aria-label="Tu nivel">
        <div className="seccion__titulo">
          <h2 className="titulo-md">{home.progreso.title}</h2>
          <span className="caption">{home.progreso.subtitle}</span>
        </div>
        <CaminoDeAltura nivel={idxNivel} faltan={sellosParaSiguienteNivel} tandas={s.tandasCerradas} />
        <p className="cuerpo-sm camino__empuje">
          {siguienteNivel && sellosParaSiguienteNivel > 0
            ? t(siguienteNivel.id === 'mesa_de_siempre' ? home.push.a2 : home.push.a3, { n: sellosParaSiguienteNivel })
            : home.push.tope}
        </p>
      </section>

      {/* Sentirse conocido: los datos que el staff ve al hacer check-in. */}
      <section className="marco seccion" aria-label="Cómo te conocemos">
        <div className="seccion__titulo">
          <h2 className="titulo-md">Cómo te conocemos</h2>
        </div>
        <p className="cuerpo-sm">
          Esto lo ve el barista cuando llegás. No es un formulario: es lo que hace que no tengás que repetir tu pedido.
        </p>

        <label className="campo perfil__campo">
          <span className="etiqueta campo__etiqueta">Cómo te decimos</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="campo perfil__campo">
          <span className="etiqueta campo__etiqueta">Tu bebida de siempre</span>
          <input value={bebida} onChange={(e) => setBebida(e.target.value)} placeholder="Cappuccino con leche de almendra" />
        </label>
        <label className="campo perfil__campo">
          <span className="etiqueta campo__etiqueta">Algo que no podés comer</span>
          <input value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Nueces" />
        </label>

        <button
          className="boton boton-verde"
          onClick={() => {
            despachar({ tipo: 'actualizarPerfil', campos: { nombre, bebidaDeSiempre: bebida, alergias } })
            setAviso(exito.perfil)
          }}
        >
          Guardar
        </button>
      </section>

      {/* Referidos: el canal de adquisición que cuesta cero. */}
      <section className="marco seccion" aria-label="Invitar">
        <div className="tarjeta-lg referidos">
          <h2 className="titulo-lg">Traé a alguien a la mesa</h2>
          <p className="cuerpo-sm">
            Si viene de tu parte y abre su tanda, le ponemos su primera bebida y a vos te dejamos un sello. Sin códigos
            raros: le mandás el mensaje y listo.
          </p>
          <a
            className="boton boton-verde"
            href={enlaceWhatsApp(
              casa.whatsapp,
              `Hola, soy ${s.nombre}. Quiero invitar a alguien a Club Lupita de La Bella Lupita.`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            Invitar por WhatsApp
          </a>
        </div>
      </section>

      <section className="marco seccion" aria-label="Ajustes">
        <div className="seccion__titulo">
          <h2 className="titulo-md">La casa, a tu medida</h2>
        </div>
        <ul className="ajustes">
          <li className="dato">
            <span>
              Luz de la pantalla
              <br />
              <span className="caption">
                {tema === 'papel' ? 'Papel: la carta, servida con luz de mesa.' : 'Casa: madera oscura y lámpara cálida.'}
              </span>
            </span>
            <button className="boton boton-linea boton-tenue" onClick={cambiarTema}>
              {tema === 'papel' ? 'Poner luz de casa' : 'Poner luz de mesa'}
            </button>
          </li>
          <li className="dato">
            <span>
              Saldo en la Cuenta de Casa
              <br />
              <span className="caption">Se usa en barra, cocina, repostería y tienda.</span>
            </span>
            <span className="dato__valor lab">{cordobas(saldo)}</span>
          </li>
          <li className="dato">
            <span>
              Conexión con la casa
              <br />
              <span className="caption">
                {conServidor
                  ? 'Tu cuenta se guarda en la casa: sellos, saldo y cupos vienen del servidor.'
                  : 'Sin señal con la casa. Podés seguir viendo la app, pero lo que hagás se guarda solo en este teléfono hasta que vuelva la conexión.'}
              </span>
            </span>
            <span className={conServidor ? 'chip chip-servido' : 'chip chip-aviso'}>
              {conServidor ? 'en línea' : 'sin señal'}
            </span>
          </li>
          <li className="dato">
            <span>
              Mostrador
              <br />
              <span className="caption">La vista del staff y del dueño.</span>
            </span>
            <button className="boton boton-linea boton-tenue" onClick={() => navigate('/mostrador')}>
              Abrir
            </button>
          </li>
          <li className="dato">
            <span>
              Cerrar la sesión
              <br />
              <span className="caption">
                Se olvida este teléfono. Tu cuenta y tus sellos siguen en la casa: volvés a entrar con tu WhatsApp.
              </span>
            </span>
            <button
              className="boton boton-linea boton-tenue"
              onClick={() => {
                salir()
                navigate('/umbral')
              }}
            >
              Salir
            </button>
          </li>
        </ul>
      </section>

      <footer className="marco casa__pie">
        <hr className="regla-oro" />
        <p className="caption">{casa.direccion}</p>
        <p className="caption">
          {casa.telefono} · {casa.correo}
        </p>
        <p className="caption">{casa.horario}</p>
      </footer>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
