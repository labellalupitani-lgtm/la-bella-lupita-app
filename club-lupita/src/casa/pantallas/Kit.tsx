/**
 * Página de kit — el catálogo vivo del sistema.
 *
 * Muestra los componentes del sistema en todos sus estados. Es la referencia
 * contra la que el agente A1 compara, y lo primero que se revisa cuando una
 * pantalla no se ve como debe. Se sustituye por el router real en la Fase 3.
 */
import { useState } from 'react'
import { Boton, ChipEscasez, ChipFiltro, Eyebrow, Icono, Progreso } from '../componentes/Base'
import { Aviso, Carnet, Fila, Hoja, Tarjeta } from '../componentes/Superficies'
import { Buscador, FichaProducto, Kpi, TarjetaDeSellos } from '../componentes/Datos'
import { CabeceraPantalla } from '../componentes/Navegacion'
import {
  AvisoFlotante,
  conSalida,
  ErrorDeCampo,
  EsqueletoFichas,
  EstadoVacio,
  VACIOS,
} from '../componentes/Estados'
import { AccesosRapidos, LoDeSiempre, PasaEnLaCasa, RetoDeLaSemana } from '../componentes/Inicio'
import { PaseSocio } from '../componentes/PaseSocio'

function Bloque({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-filete pt-6">
      <h2 className="font-titular text-seccion font-semibold text-tinta">{titulo}</h2>
      {nota && <p className="mt-1 t-caption">{nota}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function Kit({ navegar }: { navegar: (r: string) => void }) {
  const [filtro, setFiltro] = useState('barra')
  const [sellos, setSellos] = useState(7)
  const [hoja, setHoja] = useState(false)
  const [pidiendo, setPidiendo] = useState(false)
  const [flotante, setFlotante] = useState(false)
  const [ejemplo, setEjemplo] = useState('Detalle de producto')
  const [busqueda, setBusqueda] = useState('')
  const mostrarEjemplo = (titulo: string) => { setEjemplo(titulo); setHoja(true) }
  const productos = [
    { nombre:'Nica Toast', precio:'C$ 300', foto:'/menu/nica-toast-01-480.webp' },
    { nombre:'Bagel de Salmón', precio:'C$ 430', foto:'/menu/bagel-de-salmon-01-480.webp' },
    { nombre:'Sin fotografía todavía', precio:'C$ 110', foto:null },
    { nombre:'Con la foto rota', precio:'C$ 110', foto:'/menu/no-existe.webp' },
  ].filter(p=>p.nombre.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase()))

  return (
    <>
      <a className="salto" href="#contenido">
        Ir al contenido
      </a>

      <CabeceraPantalla titulo="Kit del sistema" alVolver={() => navegar('/')} />

      <main id="contenido" tabIndex={-1} className="casa-kit marco pb-32 pt-6">
        <header>
          <Eyebrow>La Bella Lupita · Sistema de diseño</Eyebrow>
          <h1 className="mt-2 font-titular text-pantalla font-bold leading-tight text-tinta">
            Componentes de la casa
          </h1>
          <p className="mt-2 t-cuerpo">
            Tipografía, superficies y estados de la aplicación
          </p>
          <p className="mt-2 t-caption">
            Datos de ejemplo para revisión visual
          </p>
        </header>

        <Bloque titulo="Botones" nota="Acción principal borgoña, variantes según superficie y objetivos táctiles de al menos 44 px">
          <div className="flex flex-wrap gap-3">
            <Boton onClick={()=>mostrarEjemplo('Recarga')}>Recargá</Boton>
            <Boton tono="claro" icono="qr_code_scanner" onClick={()=>mostrarEjemplo('Código QR')}>
              Pagá con QR
            </Boton>
            <Boton disabled>Sin cupos</Boton>
            <Boton cargando>Confirmando pedido</Boton>
          </div>
          <Carnet className="p-4">
            <p className="mb-3 t-eyebrow text-rosa">Sobre superficie oscura</p>
            <div className="flex flex-wrap gap-3">
              <Boton ancho onClick={()=>mostrarEjemplo('Recarga')}>Recargá</Boton>
              <Boton tono="contorno" icono="qr_code_scanner" ancho onClick={()=>mostrarEjemplo('Código QR')}>
                Pagá con QR
              </Boton>
            </div>
          </Carnet>
          <Boton tono="tenue" onClick={()=>navegar('/?acceso')}>Ya soy socio — iniciar sesión</Boton>
        </Bloque>

        <Bloque titulo="Chips" nota="El de escasez nunca aparece sin cifra: si no hay número, no hay chip">
          <div className="flex flex-wrap gap-2">
            {['barra', 'brunch', 'bistro', 'sobremesa'].map((m) => (
              <ChipFiltro key={m} activo={filtro === m} onClick={() => setFiltro(m)}>
                {m[0].toUpperCase() + m.slice(1)}
              </ChipFiltro>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <ChipEscasez>Quedan 34 de 150</ChipEscasez>
            <ChipEscasez icono="event_seat">8 de 12 cupos</ChipEscasez>
            <ChipEscasez icono="local_mall">Bolsa del mes lista</ChipEscasez>
          </div>
        </Bloque>

        <Bloque titulo="Pase del socio" nota="Frente y reverso con datos de ejemplo">
          <div className="max-w-md"><PaseSocio nombre="María López" identificador={'#' + String(37).padStart(3, '0')} fundador sellos={sellos}/></div>
        </Bloque>
        <Bloque titulo="Cuenta de casa" nota="Saldo y acciones sobre superficie café">
          <Carnet>
            <div className="mb-4 flex items-start justify-between">
              <span className="t-eyebrow text-rosa">Club Lupita · Mesa Fundadora</span>
              <Icono nombre="workspace_premium" tam={24} lleno className="text-rosa" />
            </div>
            <p className="font-texto text-pie text-papel/70">Tu monedero</p>
            <p className="t-cifra">C$ 1,240</p>
            <div className="mt-4">
              <ChipEscasez icono="local_mall" tono="banda">
                Bolsa del mes lista para retirar
              </ChipEscasez>
            </div>
          </Carnet>
        </Bloque>

        <Bloque
          titulo="La tanda"
          nota="Diez casillas, nueve se ganan, la décima la pone la casa SPEC.md §1"
        >
          <Tarjeta>
            <TarjetaDeSellos ganados={sellos} ultimoReciente />
          </Tarjeta>
          <div className="flex gap-3">
            <Boton tono="claro" onClick={() => setSellos((s) => Math.max(0, s - 1))}>
              Quitar
            </Boton>
            <Boton onClick={() => setSellos((s) => Math.min(9, s + 1))}>Sellar visita</Boton>
          </div>
        </Bloque>

        <Bloque titulo="Progreso de nivel">
          <Tarjeta>
            <div className="flex items-baseline justify-between">
              <span className="t-etiqueta text-tinta-media">Nivel actual</span>
              <span className="t-etiqueta text-tinta-media">Siguiente</span>
            </div>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-titular text-seccion font-bold text-achiote">Barista</span>
              <span className="font-titular text-seccion font-bold text-tinta">Reserva Lupita</span>
            </div>
            <Progreso de={1880} sobre={2500} etiqueta="1.880 de 2.500 puntos" />
            <p className="mt-3 text-center font-texto text-cuerpo text-tinta-media">
              <span className="font-semibold tabular-nums text-tinta">620 pts</span> más y subís
              de nivel
            </p>
          </Tarjeta>
        </Bloque>

        <Bloque titulo="Avisos">
          <Aviso tono="contorno">Socios del club: acceso 48 h antes que el público</Aviso>
          <Aviso tono="verde">Tu bolsa del mes está tostada y con tu nombre</Aviso>
          <Aviso tono="alerta" icono="warning">
            Alergia: nueces
          </Aviso>
        </Bloque>

        <Bloque titulo="Filas de lista">
          <Fila icono="local_cafe" titulo="Tu bebida de siempre" detalle="Capuchino, leche de almendra" onClick={() => mostrarEjemplo('Tu bebida de siempre')} />
          <Fila icono="warning" titulo="Alergias" detalle="Nueces" onClick={() => mostrarEjemplo('Alergias')} />
          <Fila
            icono="notifications"
            titulo="Notificaciones por WhatsApp"
            detalle="Activadas"
            derecha={<span className="t-etiqueta text-banda">Sí</span>}
          />
        </Bloque>

        <Bloque titulo="Buscador y ficha de producto">
          <Buscador etiqueta="Buscar en los productos de ejemplo" placeholder="Buscá un ejemplo" value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          <p role="status" className="t-caption">{productos.length} productos de ejemplo</p>
          <div className="casa-kit-productos">
            {productos.map(producto=><FichaProducto key={producto.nombre} {...producto} alAgregar={()=>mostrarEjemplo('Agregar '+producto.nombre)} alAbrir={()=>mostrarEjemplo(producto.nombre)}/>)}
          </div>
        </Bloque>

        <Bloque
          titulo="Piezas del Inicio"
          nota="El reto es estructura permanente: cuando no hay ninguno, el módulo se queda y lo dice"
        >
          <LoDeSiempre
            bebida="Capuchino con leche de almendra"
            precio="C$ 110"
            minutos={6}
            cargando={pidiendo}
            onPedir={() => {
              setPidiendo(true)
              setTimeout(() => {
                setPidiendo(false)
                setFlotante(true)
                setTimeout(() => setFlotante(false), 3200)
              }, 900)
            }}
          />
          <RetoDeLaSemana
            titulo="Reto de la semana: 3 visitas"
            premio="Waffle El Consentido al 50 %"
            vas={2}
            meta={3}
          />
          <RetoDeLaSemana />
          <PasaEnLaCasa
            cosas={[
              {
                id: 'cosecha',
                titulo: 'Reserva de Cosecha',
                bajada: 'Pagás hoy, la retirás recién tostada en temporada',
                escasez: 'Quedan 34 de 150',
                foto: '/menu/la-bella-lupita-01-480.webp',
                cta: 'Reservá la tuya',
                onClick: () => mostrarEjemplo('Reserva de Cosecha'),
              },
              {
                id: 'tostador',
                titulo: 'Mesa del Tostador',
                bajada: 'Tres lotes, una mesa larga, doce sillas Viernes 12 de septiembre',
                escasez: '8 de 12 cupos',
                iconoEscasez: 'event_seat',
                foto: '/menu/bowl-del-terruno-01-480.webp',
                cta: 'Ver y apartar',
                onClick: () => mostrarEjemplo('Mesa del Tostador'),
              },
            ]}
          />
          <AccesosRapidos
            accesos={[
              { icono: 'takeout_dining', texto: 'Pedí para llevar', onClick: () => navegar('/pedir') },
              { icono: 'event_seat', texto: 'Reservá mesa', onClick: () => navegar('/reservar') },
              { icono: 'storefront', texto: 'Tienda de la finca', onClick: () => navegar('/tienda') },
            ]}
          />
        </Bloque>

        <Bloque
          titulo="Estados"
          nota="Ninguna de las 23 pantallas del prototipo tenía uno Quince vacíos, siete errores de campo, esqueleto y confirmación"
        >
          <Tarjeta>
            <EstadoVacio {...conSalida(VACIOS.sinSellos, () => navegar('/pedir'))} />
          </Tarjeta>
          <Tarjeta>
            <EstadoVacio {...conSalida(VACIOS.sinResultados, () => navegar('/pedir'))} compacto />
          </Tarjeta>
          <Tarjeta>
            <EstadoVacio {...conSalida(VACIOS.sinCupos, () => mostrarEjemplo('Lista de espera'))} compacto />
          </Tarjeta>
          <div>
            <label htmlFor="tel-demo" className="t-etiqueta text-tinta-media">
              Tu número de WhatsApp
            </label>
            <input
              id="tel-demo"
              aria-describedby="tel-demo-error"
              aria-invalid="true"
              defaultValue="8744"
              className="mt-1.5 h-12 w-full rounded-troquel border border-achiote bg-papel px-4 font-texto text-cuerpo tabular-nums text-tinta"
            />
            <ErrorDeCampo id="tel-demo-error">
              Ese número no nos cuadra Son ocho dígitos, sin el 505
            </ErrorDeCampo>
          </div>
          <EsqueletoFichas cuantas={2} />
        </Bloque>

        <Bloque titulo="Indicadores del panel" nota="Si un dato no se puede calcular, lo dice No hay ceros de relleno">
          <div className="casa-kit-metricas">
            <Kpi etiqueta="Socios del club" valor="82" unidad="/100" nota="Lista de espera: 17" icono="group" />
            <Kpi
              etiqueta="Saldo prepago vivo"
              valor="C$ 186,400"
              nota="Flujo futuro asegurado"
              icono="account_balance_wallet"
            />
            <Kpi
              etiqueta="Comen en sus visitas"
              valor="31 %"
              delta={{ signo: 'sube', texto: '+1,1 pts' }}
              nota="De cada 100 visitas de socio, 31 llevan plato"
            />
            <Kpi etiqueta="Transacciones identificadas" valor={null} />
          </div>
        </Bloque>
      </main>

      <Hoja
        abierta={hoja}
        alCerrar={() => setHoja(false)}
        titulo={ejemplo}
        eyebrow={<Eyebrow>Ejemplo del sistema</Eyebrow>}
      >
        <p className="mt-2 t-cuerpo">
          Esta es una demostración del diálogo. Podés cerrarlo con el botón o con Escape y volver al control que lo abrió. No realiza compras ni cambia tu cuenta.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Boton ancho onClick={() => setHoja(false)}>
            Cerrar ejemplo
          </Boton>
        </div>
      </Hoja>

      <AvisoFlotante visible={flotante} accion={{ texto: 'Cerrar', onClick: () => setFlotante(false) }}>
        Ejemplo de confirmación. No se realizó un pedido ni se descontó saldo.
      </AvisoFlotante>

      
    </>
  )
}
