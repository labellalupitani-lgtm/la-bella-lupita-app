/**
 * Club Lupita — Worker.
 *
 * Sirve la SPA y la API. Dos drivers, a propósito:
 *  · `neon()` sobre HTTP para lecturas y escrituras de una sola sentencia:
 *    una ida y vuelta, sin conexión que mantener. Es lo correcto en el edge.
 *  · `Client` sobre WebSocket solo donde hace falta una transacción de verdad
 *    con bloqueo de fila (cobrar contra el monedero). El HTTP abre una
 *    transacción por sentencia y ahí no sirve.
 *
 * Dos reglas que no se negocian:
 *  1. El dinero son enteros de centavos y el saldo se deriva del libro mayor.
 *     Ningún endpoint escribe un campo «saldo».
 *  2. El teléfono del socio sale SIEMPRE de la sesión verificada, nunca del
 *     cuerpo de la petición. Lo contrario es dejar que el visitante diga a
 *     nombre de quién se le cobra.
 */
import { registrarReglasClub } from './reglas-club'
import { REGLAS_CLUB } from '../compartido/reglas-club'
import { ofertaExperiencia } from './oferta-experiencia'
import { registrarCajaClub } from './club-caja'
import { CARTA } from '../data/menu'
import { registrarTransporteCliente, registrarSesionCliente, tokenCliente, cargarCliente, legadoRevocado } from './cliente-sesion'
import { registrarInicio } from './inicio'
import { registrarCarta } from './carta'
import { registrarTienda } from './tienda'
import { registrarMetricasCarta } from './metricas-carta'
import { registrarFichasCarta } from './fichas-carta'
import { RECARGA } from '../compartido/reglas'
import { Hono } from 'hono'
import { cabecerasSeguras } from './cabeceras'
import { registrarCuentaCliente } from './cuenta-cliente'
import { registrarAccesoEquipo } from './acceso-equipo'
import { cargarSesion, origenEquipo, tokenEquipo, type SesionPersonal, type Permiso } from './equipo-sesion'
import { registrarOperacion, transaccion } from './operacion'
import { registrarAcceso, telefonoNormalizado } from './acceso'
import { registrarAccesoCorreo, correoHabilitado } from './acceso-correo'
import { registrarMostrador } from './mostrador'
import { registrarPanel } from './panel'
import { registrarClientes } from './clientes'
import { registrarAtencion } from './atencion'
import { registrarReservas, leerConfiguracionReservas } from './reservas'
import { trabajarBase } from './mantenimiento'
import type { PlanificadorMantenimiento } from './planificador'
import { esCuotaAgotada } from './cuota'
export { mantenerMembresias } from './mantenimiento'
import { plazasOcupadas } from './membresias'
import { CONTRATO_CLUB } from '../compartido/club'
import { registrarClub } from './club'
import { registrarReposicionesClub } from './club-reposiciones'
import { fechaCalendario } from './validacion'
import { bodyLimit } from 'hono/body-limit'
import { neon, Client, neonConfig } from '@neondatabase/serverless'
import { codigoDeSeis, firmar, huella, igualEnTiempoConstante, verificar, type Sesion } from './sesion'
// La carta vive del lado del servidor también: es la única manera de que el
// precio no lo ponga quien paga.

export type Env = {
  MANTENIMIENTO?: DurableObjectNamespace<PlanificadorMantenimiento>
  NEON_CUOTA_API_KEY?: string
  ASSETS: Fetcher
  DATABASE_URL: string
  DEMO_DATABASE_URL?: string
  DEMO_AISLADA?: string
  SESION_SECRETO: string
  PERSONAL_CREDENCIAL_SECRETO: string
  PERSONAL_MFA_SECRETO: string
  /** Contraseña del Mostrador. Sin ella, el panel del dueño no abre. */
  CASA_SECRETO: string
  ACCESO_PERSONAL?: string
  OTP_SERVICE?: Fetcher
  CANAL_OTP?: string
  ACCESO_CORREO?: string
  EMAIL?: SendEmail
  EMAIL_FROM?: string
  RESERVAS_CORREO?: string
  RESEND_API_KEY?: string
}

export type Vars = { perfilSolicitud: string; sesion: Sesion; permiso: Permiso; empleadoNombre: string; basePropietario: string; requiereCambio: boolean; empleadoUsuario: string; claveCambiada: string | null; personal:SesionPersonal; equipoDemo:boolean }

const app = new Hono<{ Bindings: Env; Variables: Vars }>()
app.use('*', cabecerasSeguras)
app.use('/api/*',async(c,next)=>{
  await next()
  c.res.headers.set('Cache-Control','no-store')
  c.res.headers.set('X-Content-Type-Options','nosniff')
  c.res.headers.set('Referrer-Policy','no-referrer')
  c.res.headers.set('X-Frame-Options','DENY')
  c.res.headers.set('Strict-Transport-Security','max-age=31536000')
  if (c.res.ok && c.env.MANTENIMIENTO && c.req.path !== '/api/health' && c.req.path !== '/api/health/datos') {
    const demo = c.get('equipoDemo') === true
    if (demo) {
      c.executionCtx.waitUntil(c.env.MANTENIMIENTO.getByName('demo').revisar(true)
        .catch(() => console.error(JSON.stringify({ evento: 'planificacion', estado: 'error', demo }))))
    }
  }
})
app.use('/api/*', bodyLimit({maxSize:16384,onError:c=>c.json({error:'La solicitud es demasiado larga.'},413)}))
// Los endpoints reciben objetos JSON. Validar antes de leer sus propiedades
// evita convertir una entrada inválida en un error interno.
app.use('/api/*', async (c, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
    // Conservar el cuerpo para los límites más estrictos de rutas como /perfil.
    const cuerpo: unknown = await c.req.raw.clone().json().catch(() => null)
    if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
      return c.json({ error: 'La solicitud debe contener un objeto JSON válido.' }, 422)
    }
  }
  await next()
})

const TOTAL_SOCIOS = CONTRATO_CLUB.plazas
/** Centavos de córdoba. Lo cobra `/api/membresia/apartar` y lo publica
 *  `/api/catalogo`: una sola cifra, para que la pantalla no pueda prometer
 *  una cuota distinta de la que se carga. */
const CUOTA_MENSUAL = CONTRATO_CLUB.cuota
const SESION_HORAS = 24 * 30

/** La única cuenta que se puede abrir sin recibir el código por WhatsApp.
 *  Existe para que el cliente pueda recorrer la app en una demostración. */
const CUENTA_DEMO = '50587442005'

const soloDigitos = (s: unknown) => String(s ?? '').replace(/\D/g, '')

/** Reescribe el host al endpoint agrupado de Neon (`-pooler`). */
const conPooler = (url: string) => url.replace(/@(ep-[^.]+?)(-pooler)?\./, '@$1-pooler.')

const enCasa = (mensaje: string, codigo = 400) =>
  new Response(JSON.stringify({ error: mensaje }), {
    status: codigo,
    headers: { 'content-type': 'application/json' },
  })

type Solicitud = { referencia: string; operacion: string; huella: string; coincide?: (guardada: string) => boolean }

function registrarError(e: unknown) {
  // El mensaje de PostgreSQL puede contener datos del cliente. Se registra
  // sólo el código y un identificador para correlacionar el fallo.
  const codigo = e && typeof e === 'object' && 'code' in e ? String(e.code) : 'interno'
  console.error(JSON.stringify({ evento: 'error_api', codigo, id: crypto.randomUUID() }))
}

/**
 * Una compra es UNA transacción con la fila del socio bloqueada.
 *
 * El error que esto corrige es sutil y caro: leer el saldo con una petición y
 * escribir el asiento con otra deja una ventana en la que dos compras
 * simultáneas ven el mismo saldo y las dos pasan la comprobación. Medido en
 * producción: cuatro peticiones en paralelo con C$905 dejaron el monedero en
 * −C$875 y se llevaron dos bolsas por el precio de ninguna.
 *
 * `trabajo` recibe el cliente ya dentro de la transacción, el id del socio y su
 * saldo real. Devuelve el cargo a aplicar, o una Response si decide no seguir
 * (sin cupo, sin saldo). Si devuelve Response, se hace ROLLBACK: el cupo que
 * hubiera tomado se devuelve solo.
 */
export async function enTransaccion<T>(
  c: { env: Env; executionCtx: { waitUntil(p: Promise<unknown>): void } },
  tel: string,
  trabajo: (
    cli: Client,
    socioId: string,
    saldo: number,
  ) => Promise<Response | { monto: number; concepto: string; ref: string; datos: T; tipo?: 'consumo' | 'deposito' }>,
  solicitud?: Solicitud,
): Promise<Response> {
  neonConfig.webSocketConstructor = globalThis.WebSocket as unknown as typeof WebSocket
  const cli = new Client(conPooler(c.env.DATABASE_URL))
  await cli.connect()
  try {
    await cli.query('BEGIN')
    // Toda compra bloquea la fila del socio con `FOR UPDATE`. Sin tope, una
    // sentencia colgada retiene ese bloqueo sin límite y el socio se queda sin
    // poder comprar nada: la petición siguiente espera detrás de un candado
    // que ya no lleva a ninguna parte. Ocho segundos sobran para cualquiera de
    // estas transacciones, y `LOCAL` hace que muera con la transacción en vez
    // de quedarse pegado a la conexión, que el pooler reparte a otros.
    await cli.query("SET LOCAL statement_timeout = '8s'")
    const { rows: socios } = await cli.query('SELECT id FROM operativo_socio WHERE telefono = $1 AND baja IS NULL FOR UPDATE', [tel])
    if (!socios.length) {
      await cli.query('ROLLBACK')
      return enCasa('No encontramos esa cuenta.', 404)
    }
    const socioId = socios[0].id as string
    if (solicitud) {
      const { rows: recibos } = await cli.query(
        'SELECT operacion, huella, respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2',
        [socioId, solicitud.referencia],
      )
      if (recibos.length) {
        await cli.query('ROLLBACK')
        if (recibos[0].operacion !== solicitud.operacion || !(solicitud.coincide ? solicitud.coincide(recibos[0].huella) : recibos[0].huella === solicitud.huella)) {
          return enCasa('Esa referencia pertenece a otra operación.', 409)
        }
        return Response.json({ ...recibos[0].respuesta, repetido: true })
      }
    }
    const { rows: s } = await cli.query('SELECT total FROM saldo_de($1)', [socioId])
    const saldo = Number(s[0]?.total ?? 0)

    const r = await trabajo(cli, socioId, saldo)
    if (r instanceof Response) {
      await cli.query('ROLLBACK')
      return r
    }

    // Idempotencia: el mismo cargo dos veces no cobra dos veces.
    // Un monto de cero es legítimo (mesa sin depósito) y no escribe asiento:
    // el libro mayor no admite movimientos de cero córdobas.
    const { rows: ya } = r.monto > 0
      ? await cli.query('SELECT id FROM operativo_asiento WHERE socio_id = $1 AND ref_externa = $2', [socioId, r.ref])
      : { rows: [] as unknown[] }
    if (ya.length) {
      // Ese recurso ya estaba pagado. Confirmar el trabajo sin cobrarlo lo
      // regalaba: se deshace, y el cupo vuelve al montón.
      await cli.query('ROLLBACK')
      return enCasa('Ese cobro ya estaba hecho. No te cobramos de nuevo.', 409)
    }
    if (r.monto > 0) {
      await cli.query(
        "INSERT INTO asiento (socio_id, monto, tipo, concepto, ref_externa) VALUES ($1, $2, $3, $4, $5)",
        [socioId, -r.monto, r.tipo ?? 'consumo', r.concepto, r.ref],
      )
      await cli.query(
        "INSERT INTO auditoria (quien, accion, socio_id, monto, detalle) VALUES ('api', 'compra', $1, $2, $3::jsonb)",
        [socioId, -r.monto, JSON.stringify({ ref: r.ref })],
      )
    }
    const { rows: fin } = await cli.query('SELECT * FROM saldo_de($1)', [socioId])
    const respuesta = { ...r.datos, cobrado: r.monto, saldo: fin[0] }
    if (solicitud) {
      await cli.query(
        'INSERT INTO solicitud_compra(socio_id, referencia, operacion, huella, respuesta) VALUES ($1,$2,$3,$4,$5::jsonb)',
        [socioId, solicitud.referencia, solicitud.operacion, solicitud.huella, JSON.stringify(respuesta)],
      )
    }
    await cli.query('COMMIT')
    return Response.json(respuesta)
  } catch (e) {
    await cli.query('ROLLBACK').catch(() => {})
    registrarError(e)
    const codigo=String((e as {code?:string})?.code??'')
    if(codigo==='57014'||codigo==='55P03')return Response.json({error:solicitud?'La operación está ocupada. Reintentá conservando la misma referencia de compra.':'La operación está ocupada. Revisá el estado antes de volver a intentar.'},{status:503,headers:{'Retry-After':'2'}})
    const msg = String((e as Error).message ?? '')
    if (msg.includes('reserva_sin_solape')) {
      return enCasa('El Salón VIP ya está tomado a esa hora. Probá otra, o te avisamos apenas se libere.', 409)
    }
    return enCasa('Algo se nos quemó del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.', 500)
  } finally {
    c.executionCtx.waitUntil(cli.end())
  }
}

const faltan = (cuanto: number) =>
  enCasa(
    `Te faltan C$ ${(cuanto / 100).toLocaleString('es-NI')} en la Cuenta de Casa. Dejá saldo o completá en el mostrador.`,
    409,
  )

/**
 * La llave de idempotencia de LA SOLICITUD, no la del recurso.
 *
 * Las compras armaban su `ref` con el recurso que acababan de tomar —la bolsa
 * 118, la butaca 9, la reserva recién insertada—. Eso impide pagar dos veces
 * **la misma bolsa**, que es imposible de todos modos porque el `SKIP LOCKED`
 * ya no la vuelve a repartir. Lo que NO impedía es que un segundo envío del
 * mismo toque se llevara la bolsa 119: dos peticiones, dos recursos, dos refs
 * distintas, dos cobros. La guardia miraba, y nunca veía nada repetido.
 *
 * Con la llave del cliente, el reintento trae la misma `ref`, la guardia la
 * reconoce y `enTransaccion` deshace la transacción entera: el cupo que había
 * tomado vuelve al montón y no se cobra nada.
 *
 * Se acota a 64 caracteres y se prefija: una llave del cliente no puede
 * disfrazarse de `bolsa:` ni de `mem:` para colisionar con la de otro recurso.
 */
async function llaveDeSolicitud(c: { req: { json: <T>() => Promise<T> } }): Promise<string | null> {
  const cuerpo = await c.req.json<{ ref?: unknown }>().catch(() => ({}) as { ref?: unknown })
  const ref = typeof cuerpo.ref === 'string' ? cuerpo.ref.trim() : ''
  return /^[A-Za-z0-9_-]{8,64}$/.test(ref) ? 'sol:' + ref : null
}

// ============================================================
// SESIÓN
// ============================================================

/** Puertas abiertas: lo que se puede ver sin haber entrado. */
// `/api/panel` no lleva sesión de socio porque tiene SU propia puerta:
// la contraseña de la casa. Meterlo aquí evita que el Mostrador quede detrás
// de una sesión que el dueño no tiene por qué abrir.
const ABIERTAS = [
  '/api/club/informacion',
  '/api/reservas/configuracion', '/api/reservas/disponibilidad',
  '/api/health',
  '/api/health/datos',
  '/api/auth/sesion/migrar',
  '/api/cupos',
  '/api/catalogo',
  '/api/carta',
  '/api/ocupacion',
  '/api/auth/codigo',
  '/api/auth/correo/codigo',
  '/api/auth/correo/verificar',
  '/api/auth/correo/registro',
  '/api/auth/entrar',
  '/api/auth/casa',
  '/api/panel',
  '/api/auth/personal',
  '/api/capacidades',
]

registrarTransporteCliente(app)
app.use('/api/*', async (c, next) => {
  c.set('basePropietario',c.env.DATABASE_URL)
  const equipoPublico=c.req.path.startsWith('/api/auth/equipo/')
  const cookie=tokenEquipo(c),clienteCookie=tokenCliente(c)
  const esEquipo=equipoPublico||!!cookie||c.req.path.startsWith('/api/personal/')
  if(esEquipo&&!origenEquipo(c))return c.json({error:'La solicitud de acceso debe realizarse desde la aplicación.'},403)
  const bearer=c.req.header('authorization')?.replace(/^Bearer\s+/i,'')
  const socio=await verificar(c.env.SESION_SECRETO,bearer)
  let demo=false
  if(equipoPublico){
    if(c.req.method==='GET')demo=c.req.query('entorno')==='capacitacion'
    else demo=(await c.req.json())?.demo===true
  }else if(cookie)demo=cookie.startsWith('d.')
  else if(['/api/auth/codigo','/api/auth/entrar'].includes(c.req.path))demo=telefonoNormalizado((await c.req.json()).telefono)===CUENTA_DEMO
  else if(clienteCookie&&c.req.path!=='/api/auth/sesion/migrar')demo=clienteCookie.startsWith('d.')
  else demo=socio?.rol==='socio'&&socio.tel===CUENTA_DEMO
  if(c.req.path.startsWith('/api/auth/correo/'))demo=false
  c.set('equipoDemo',demo)
  if(demo){
    if(!c.env.DEMO_DATABASE_URL)return c.json({error:'La capacitación está en mantenimiento.'},503)
    const real=new URL(c.env.DATABASE_URL),prueba=new URL(c.env.DEMO_DATABASE_URL)
    if(real.hostname.replace('-pooler','')===prueba.hostname.replace('-pooler','')&&real.pathname===prueba.pathname)return c.json({error:'La capacitación está en mantenimiento.'},503)
    c.env={...c.env,DATABASE_URL:c.env.DEMO_DATABASE_URL}
  }
  if(equipoPublico||ABIERTAS.includes(c.req.path))return next()
  if(cookie){
    const p=await cargarSesion(c,cookie)
    if(!p)return c.json({error:'Tu sesión terminó. Ingresá nuevamente.'},401)
    if(c.req.method!=='GET'&&c.req.header('x-equipo-csrf')!==p.csrf)return c.json({error:'Actualizá la página para continuar.'},403)
    c.set('personal',p);c.set('permiso',p.permiso);c.set('empleadoNombre',p.nombre);c.set('empleadoUsuario',p.usuario);c.set('requiereCambio',p.requiere_cambio);c.set('claveCambiada',p.clave_cambiada)
    c.set('sesion',{rol:'casa',tel:'',empleado:p.empleado_id,exp:Date.parse(p.vence),demo,versionClave:p.version_clave})
    const cuenta=c.req.path.startsWith('/api/personal/')
    const basicas=['/api/personal/yo','/api/personal/salir']
    const permitidas=p.fase==='mfa'?['/api/personal/mfa/verificar']:p.fase==='clave'?['/api/personal/clave']:p.fase==='configurar'?['/api/personal/mfa/preparar','/api/personal/mfa/confirmar']:[]
    if(p.fase!=='completa'&&!basicas.includes(c.req.path)&&!permitidas.includes(c.req.path))return c.json({error:'Completá la verificación de tu cuenta antes de continuar.',fase:p.fase},403)
    if(p.fase==='completa'&&(p.inactiva||p.bloqueada)&&![...basicas,'/api/personal/revalidar','/api/personal/bloquear'].includes(c.req.path))return c.json({error:'Tu acceso está bloqueado. Confirmá tu identidad.',bloqueada:true},423)
    if(p.fase==='completa'&&(p.permiso==='propietario'||p.permiso==='encargado')&&(!p.mfa_secreto||!p.fuerte))return c.json({error:'Verificá tu segundo factor para continuar.'},401)
    if(p.permiso==='cocina'&&!cuenta&&!['/api/operacion/pedidos','/api/operacion/listas/pedidos','/api/operacion/carta'].includes(c.req.path)&&!/^\/api\/operacion\/carta\/fichas(?:\/[a-z0-9-]+)?$/.test(c.req.path)&&!/^\/api\/operacion\/pedidos\/[a-f0-9-]+\/estado$/.test(c.req.path))return c.json({error:'Tu acceso es solo para preparación de pedidos.'},403)
    return next()
  }
  if(clienteCookie){
    const cliente=await cargarCliente(c,clienteCookie)
    if(!cliente)return c.json({error:'Tu sesión terminó. Ingresá nuevamente.'},401)
    if(c.req.method!=='GET'&&c.req.header('x-cliente-csrf')!==cliente.csrf)return c.json({error:'Actualizá la página para continuar.'},403)
    if(c.req.path.startsWith('/api/personal/'))return c.json({error:'Acceso exclusivo del equipo.'},403)
    c.set('sesion',cliente.sesion)
    return next()
  }
  // Ningún token administrativo firmado de la versión anterior abre el panel.
  if(!socio||socio.rol!=='socio'||(bearer&&await legadoRevocado(c,bearer,socio)))return c.json({error:'Tu sesión terminó. Ingresá nuevamente.'},401)
  c.set('sesion',socio)
  const sql=neon(c.env.DATABASE_URL),[activo]=await sql`SELECT id FROM operativo_socio WHERE telefono=${socio.tel} AND baja IS NULL`
  if(!activo)return c.json({error:'Tu cuenta ya no está activa. Contactá con la casa.'},401)
  if(c.req.path.startsWith('/api/personal/'))return c.json({error:'Acceso exclusivo del equipo.'},403)
  await next()
})
// La señal durable precede a la mutación: si el proceso termina después del
// COMMIT, el cron conserva una reconciliación pendiente aunque falte el cierre.
app.use('/api/*', async (c, next) => {
  if (!c.env.MANTENIMIENTO || ['GET', 'HEAD', 'OPTIONS'].includes(c.req.method) || /metrica|medicion|rendimiento|\/tiempo|\/evento/.test(c.req.path)) return next()
  const plan = c.env.MANTENIMIENTO.getByName(c.get('equipoDemo') ? 'demo' : 'real')
  let id: string
  try { id = await plan.iniciarCambio() }
  catch { return c.json({ error: 'No pudimos iniciar la operación. Intentá de nuevo en un momento.' }, 503) }
  try { await next() }
  finally { c.executionCtx.waitUntil(plan.cerrarCambio(id).catch(() => console.error(JSON.stringify({ evento: 'planificacion', estado: 'cierre_pendiente' })))) }
})
registrarSesionCliente(app)
registrarAccesoEquipo(app)
registrarOperacion(app)
registrarInicio(app)
registrarCarta(app, enTransaccion)
registrarTienda(app, enTransaccion)
registrarMetricasCarta(app)
registrarFichasCarta(app)
registrarReglasClub(app)
registrarClub(app)
registrarReposicionesClub(app)
registrarCajaClub(app)
registrarMostrador(app)
registrarPanel(app)
registrarClientes(app)
registrarReservas(app, enTransaccion)
registrarAtencion(app)
registrarAcceso(app)
registrarAccesoCorreo(app)
app.get('/api/capacidades',c=>c.json({accesoCorreo:correoHabilitado(c.env),accesoPersonal:c.env.ACCESO_PERSONAL==='true'&&!!c.env.OTP_SERVICE,canal:correoHabilitado(c.env)?'correo electrónico':c.env.CANAL_OTP??'código de acceso',operacion:true}))

/**
 * Paso 1: pedir el código.
 *
 * En producción este código sale por WhatsApp (98% de apertura) y NUNCA en la
 * respuesta. Aquí se devuelve solo para la cuenta de demostración, que no tiene
 * datos de nadie: es lo que permite enseñar la app sin abrir la puerta a
 * recorrer los ocho dígitos de todos los móviles del país.
 */
// El propietario se autentica contra la base real, incluso al entrar en demo.
// CASA_SECRETO sirve únicamente hasta su primer cambio de clave. La sesión
// dura un turno y no lleva teléfono: cada operación identifica a su cliente.
app.post('/api/auth/casa',c=>c.json({error:'Usá el acceso individual del equipo.'},410))
app.post('/api/auth/personal',c=>c.json({error:'Usá el acceso individual del equipo.'},410))

// ============================================================
// LECTURAS
// ============================================================

app.get('/api/health', (c) => c.json({ ok: true, casa: 'La Bella Lupita', hora: new Date().toISOString() }))
app.get('/api/health/datos', async c => {
  const estado = await c.env.MANTENIMIENTO?.getByName('real').estado()
  const vigente = !!estado && !!estado.ultimoExito && !estado.error && Date.now() - estado.ultimoExito < 26 * 3_600_000
  return c.json({ ok: vigente, datos: !estado?.ultimoIntento ? 'sin_comprobar' : vigente ? 'disponibles' : 'no_disponibles', comprobado: estado?.ultimoIntento ? new Date(estado.ultimoIntento).toISOString() : null }, vigente ? 200 : 503)
})
app.get('/api/personal/sistema/consumo', async c => {
  if (c.get('permiso') !== 'propietario') return c.json({ error: 'Acceso exclusivo del propietario.' }, 403)
  const cuota = await c.env.MANTENIMIENTO?.getByName('real').cuota()
  return c.json({ cuota: cuota ?? null, presupuestos: { real: 80, demo: 10, reserva: 10 } })
})

/**
 * Cupos — la única fuente de verdad de la escasez. Es público a propósito:
 * la escasez honesta se puede mirar sin entrar. Si esto falla, la interfaz
 * dice «últimas» sin cifra: jamás inventa un número, porque en Managua dos
 * clientes comparan pantallas.
 */
app.get('/api/cupos', async (c) => {
  const sql = neon(c.env.DATABASE_URL)
  const socios = await plazasOcupadas(c.env.DATABASE_URL)
  const [bolsas] = await sql`SELECT count(*)::int AS n FROM reserva_cosecha WHERE apartada IS NULL AND generacion=(SELECT max(generacion) FROM reserva_cosecha)`
  const experiencias = await sql`
    SELECT e.id, e.cupos, GREATEST(0,e.cupos - count(a.id)::int) AS libres
    FROM experiencia e LEFT JOIN operativo_asiento_experiencia a ON a.experiencia_id = e.id
    WHERE e.cuando > now()
    GROUP BY e.id, e.cupos`

  const porId: Record<string, { cupos: number; libres: number }> = {}
  for (const e of experiencias) porId[e.id as string] = { cupos: Number(e.cupos), libres: Number(e.libres) }

  return c.json({
    sociosFundadores: TOTAL_SOCIOS - (socios?.n ?? 0),
    bolsasReserva: bolsas?.n ?? 0,
    mesaTostador: porId['mesa-tostador']?.libres ?? 0,
    experiencias: porId,
  })
})

/**
 * El catálogo, con SUS precios: los de la base, que son los que se cobran.
 *
 * Sin esto, Tienda y Club tendrían que llevar el precio de la bolsa y el de
 * cada experiencia escritos a mano en el cliente. Un precio escrito a mano se
 * separa del que se cobra en cuanto alguien toca el `seed`, y la pantalla pasa
 * a prometer una cifra que la caja no respeta. Es el mismo defecto que dejar
 * que el cliente ponga el monto, con un rodeo más largo.
 *
 * Va en `ABIERTAS`: son los precios de la casa, no los de nadie.
 */
app.get('/api/catalogo', async (c) => {
  const sql = neon(c.env.DATABASE_URL)

  // Sólo lo que todavía puede ocurrir: una cata de septiembre en noviembre no
  // es catálogo, es historia, y con el botón de apartar puesto sería un fraude.
  const experiencias = await sql`
    SELECT e.id, e.nombre, e.cuando, e.precio, e.cupos, e.abre_socios, e.abre_publico, e.duracion_minutos, e.lugar, e.incluye, e.condiciones,
           GREATEST(0,e.cupos - count(a.id)::int) AS libres
    FROM experiencia e LEFT JOIN operativo_asiento_experiencia a ON a.experiencia_id = e.id
    WHERE e.cuando > now()
      AND e.cancelada IS NULL
    GROUP BY e.id, e.nombre, e.cuando, e.precio, e.cupos
    ORDER BY e.cuando`

  // El precio sale de la tabla entera y las que quedan de las libres: si se
  // apartan las 150, `min(precio)` sobre las libres sería `null` y la tienda
  // enseñaría una bolsa sin precio en vez de una bolsa agotada.
  const [bolsa] = await sql`
    SELECT min(precio)::int AS precio,
           count(*) FILTER (WHERE apartada IS NULL)::int AS quedan,
           count(*)::int AS total, max(generacion) AS generacion
    FROM reserva_cosecha WHERE generacion=(SELECT max(generacion) FROM reserva_cosecha)`

  const configuracionMesas = await leerConfiguracionReservas(c.env)
  return c.json({
    ahora: new Date().toISOString(),
    experiencias: await Promise.all(experiencias.map(async (e) => ({
      oferta: await ofertaExperiencia(e),
      id: e.id,
      nombre: e.nombre,
      cuando: e.cuando,
      precio: Number(e.precio),
      cupos: Number(e.cupos),
      libres: Number(e.libres),
      abre_socios: e.abre_socios, abre_publico: e.abre_publico, duracion_minutos: e.duracion_minutos,
      lugar: e.lugar, incluye: e.incluye, condiciones: e.condiciones,
    }))),
    bolsa: {
      precio: Number(bolsa?.precio ?? 0),
      quedan: Number(bolsa?.quedan ?? 0),
      total: Number(bolsa?.total ?? 0),
      generacion: bolsa?.generacion ?? null,
    },
    membresia: { ...CONTRATO_CLUB, cuota: CUOTA_MENSUAL, total: TOTAL_SOCIOS },
    zonas: ZONAS.map(z => ({...z, aforo: configuracionMesas.zonas.find(m => m.id === z.id)?.mesas.length ?? 0, deposito: z.id === 'vip' ? configuracionMesas.politica.importe : 0})),
  })
})

registrarCuentaCliente(app)

/** El socio lee SU cuenta. El teléfono sale de la sesión, no de la ruta. */
app.get('/api/yo', async (c) => {
  const tel = c.get('sesion').tel
  const sql = neon(c.env.DATABASE_URL)
  const [socio] = await sql`
    SELECT id, telefono, nombre, creado, bebida_siempre, alergias, cumple, codigo_club FROM operativo_socio WHERE telefono = ${tel} AND baja IS NULL`
  if (!socio) return enCasa('No encontramos esa cuenta.', 404)

  // Lecturas comerciales agrupadas en un único viaje HTTP y una instantánea consistente.
  const [sellos, [saldo], [membresia], movimientos, [tandas], [pendientes], [puntaje], [valeVivo]] = await sql.transaction([
    sql`
    SELECT s.n, s.motivo, s.barista, s.puesto
    FROM operativo_sello s JOIN operativo_tanda t ON t.id = s.tanda_id
    WHERE t.socio_id = ${socio.id} AND t.cerrada IS NULL ORDER BY s.n`,
    sql`SELECT * FROM saldo_de(${socio.id})`,
    sql`
    SELECT id, numero, estado, hasta, cuota, contrato_version, periodo_inicio,
           (autorenueva AND renovacion_consentida IS NOT NULL) AS autorenueva
    FROM operativo_membresia
    WHERE socio_id = ${socio.id} AND estado IN ('activa', 'en_gracia') AND hasta > now()`,
    sql`
    SELECT id, monto, tipo, concepto, creado FROM operativo_asiento
    WHERE socio_id = ${socio.id} ORDER BY creado DESC LIMIT 40`,
    sql`
    SELECT count(*)::int AS n FROM operativo_tanda WHERE socio_id = ${socio.id} AND canjeada IS NOT NULL`,
    sql`
    SELECT count(*)::int AS n FROM operativo_tanda
    WHERE socio_id=${socio.id} AND cerrada IS NOT NULL AND canjeada IS NULL`,
    sql`SELECT puntos,nivel_nombre,siguiente_nombre,faltan,avance FROM puntaje WHERE socio_id=${socio.id}`,
    sql`
    SELECT codigo, vence FROM operativo_vale
    WHERE socio_id = ${socio.id} AND usado IS NULL AND vence > now()
    ORDER BY emitido DESC LIMIT 1`
  ], { isolationLevel: 'RepeatableRead', readOnly: true })

  // Consulta, emisión y entrega comparten la ventana de la versión contratada.
  const topes = membresia
    ? await sql`
        SELECT clase,club_ventana(${membresia.id},clase)::text AS ventana
        FROM (VALUES('bebida_dia'),('bolsa_mes')) AS clases(clase)
        WHERE club_beneficio_usado(${membresia.id},clase)`
    : []
  const porClase: Record<string, string> = {}
  for (const t of topes) porClase[t.clase as string] = t.ventana as string

  return c.json({
    socio,
    ahora: new Date().toISOString(),
    vale: valeVivo ?? null,
    sellos,
    saldo,
    membresia: membresia ?? null,
    movimientos: movimientos.map(m=>({...m,id:String(m.id)})),
    tandasCerradas: tandas?.n ?? 0,
    premiosPendientes: pendientes?.n ?? 0,
    puntaje: puntaje ?? null,
    bebidaDelDia: porClase['bebida_dia'] ?? null,
    bolsaDelMes: porClase['bolsa_mes'] ?? null,
  })
})

// ============================================================
// ESCRITURAS
// ============================================================

/** Sellar. El ticket de caja es obligatorio: sin él no hay idempotencia y un
 *  reintento por timeout pondría dos sellos. */
app.post('/api/tanda/sellar', async (c) => {
  const sesion = c.get('sesion')
  // Un sello lo pone la caja, no el socio. Sin esta puerta, nueve peticiones
  // desde el teléfono cierran la tanda y la casa regala una bebida al día.
  if (sesion.rol !== 'casa') {
    return enCasa('Los sellos los pone la barra. Mostrá tu código en el mostrador.', 403)
  }
  const cuerpo = await c.req
    .json<{ telefono?: string; motivo?: string; ticket?: string; netoElegible?:number; confirmoElegible?:boolean }>()
    .catch(() => ({}) as { telefono?: string; motivo?: string; ticket?: string; netoElegible?:number; confirmoElegible?:boolean })
  // La caja sella a nombre del socio que tiene delante.
  const tel = soloDigitos(cuerpo.telefono) || sesion.tel
  const { motivo, ticket } = cuerpo
  if (typeof ticket !== 'string' || ticket.trim().length < 4 || ticket.length>120
    || (motivo !== undefined && typeof motivo !== 'string')
    || (cuerpo.telefono !== undefined && typeof cuerpo.telefono !== 'string')) {
    return enCasa('Falta el ticket de caja: sin él no podemos garantizar que el sello no se ponga dos veces.', 422)
  }

  return transaccion(c.env,async cli=>{
    const {rows:[socio]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[tel])
    if(!socio)return enCasa('No encontramos esa cuenta.',404)
    const canonico=ticket.normalize('NFKC').trim().toUpperCase()
    await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['ticket:'+canonico])
    const {rows:[anterior]}=await cli.query('SELECT t.socio_id FROM sello s JOIN tanda t ON t.id=s.tanda_id WHERE upper(btrim(s.ref_externa))=$1 LIMIT 1',[canonico])
    if(anterior&&anterior.socio_id!==socio.id)return enCasa('Ese ticket ya fue registrado en otra cuenta. Revisalo con la persona encargada.',409)
    const {rows:[reglas]}=await cli.query('SELECT reglas_version FROM club_config WHERE id=true FOR SHARE')
    const activa=reglas.reglas_version===REGLAS_CLUB.version
    if(!anterior&&activa&&(!Number.isSafeInteger(cuerpo.netoElegible)||Number(cuerpo.netoElegible)<REGLAS_CLUB.minimoSello||Number(cuerpo.netoElegible)>100000000||cuerpo.confirmoElegible!==true))return enCasa('El sello requiere al menos C$100 netos en alimentos y bebidas pagados. Revisá y confirmá el importe elegible del ticket, sin recargas, cuotas ni consumos gratuitos.',422)
    await cli.query('INSERT INTO tanda(socio_id,reglas_version) VALUES($1,$2) ON CONFLICT DO NOTHING',[socio.id,activa?REGLAS_CLUB.version:null])
    const {rows:[tanda]}=await cli.query('SELECT id FROM operativo_tanda WHERE socio_id=$1 AND cerrada IS NULL',[socio.id])
    if(!tanda)return enCasa('No hay tanda abierta.',409)
    const {rows:[puesto]}=await cli.query(`INSERT INTO sello(tanda_id,n,motivo,ref_externa,barista)
      SELECT $1,COALESCE(max(n),0)+1,$2,$3,$4 FROM operativo_sello WHERE tanda_id=$1
      HAVING COALESCE(max(n),0)<9 AND NOT EXISTS(SELECT 1 FROM sello WHERE upper(btrim(ref_externa))=$3) ON CONFLICT DO NOTHING RETURNING n`,[tanda.id,String(motivo??'Visita'),canonico,sesion.empleado??'propietario'])
    const {rows:[cuenta]}=await cli.query('SELECT count(*)::int AS n FROM operativo_sello WHERE tanda_id=$1',[tanda.id])
    if(cuenta.n>=9)await cli.query('UPDATE operativo_tanda SET cerrada=now() WHERE id=$1 AND cerrada IS NULL',[tanda.id])
    if(puesto&&activa)await cli.query('INSERT INTO club_ticket_validacion(ticket,socio_id,neto,reglas_version,quien) VALUES($1,$2,$3,$4,$5)',[canonico,socio.id,cuerpo.netoElegible,REGLAS_CLUB.version,sesion.empleado??'propietario'])
    return c.json({sellos:cuenta.n,nuevo:puesto?.n??null,cerrada:cuenta.n>=9})
  })
})

/**
 * Canjear la décima.
 *
 * Emite un código de presentación. El premio se consume al entregarlo en
 * barra; un código vencido puede renovarse sin perder la tanda.
 */
app.post('/api/tanda/canjear', async (c) => {
  const tel = c.get('sesion').tel
  neonConfig.webSocketConstructor = globalThis.WebSocket as unknown as typeof WebSocket
  const cli = new Client(conPooler(c.env.DATABASE_URL))
  await cli.connect()
  try {
    await cli.query('BEGIN')
    // El mismo tope que en `enTransaccion`, por el mismo motivo: esta también
    // bloquea la fila del socio.
    await cli.query("SET LOCAL statement_timeout = '8s'")
    const { rows: socios } = await cli.query('SELECT id FROM operativo_socio WHERE telefono = $1 AND baja IS NULL FOR UPDATE', [tel])
    if (!socios.length) {
      await cli.query('ROLLBACK')
      return enCasa('No encontramos esa cuenta.', 404)
    }
    const socioId = socios[0].id as string

    const { rows: t } = await cli.query(
      `SELECT t.id FROM operativo_tanda t
       WHERE t.socio_id = $1 AND t.cerrada IS NOT NULL AND t.canjeada IS NULL
       ORDER BY t.cerrada LIMIT 1 FOR UPDATE`,
      [socioId],
    )
    if (!t.length) {
      await cli.query('ROLLBACK')
      return enCasa('Todavía no hay tanda cerrada. Te faltan sellos para la décima.', 409)
    }

    const { rows: vivo } = await cli.query(
      'SELECT codigo, vence FROM operativo_vale WHERE tanda_id=$1 AND usado IS NULL AND vence > now()', [t[0].id],
    )
    if (vivo.length) {
      await cli.query('COMMIT')
      return c.json({ ahora: new Date().toISOString(), codigo: vivo[0].codigo, vence: Math.max(0, Math.ceil((new Date(vivo[0].vence).getTime() - Date.now()) / 1000)) })
    }

    // 8 caracteres sin vocales ni caracteres que se confunden al dictarlos.
    const alfabeto = '23456789BCDFGHJKLMNPQRSTVWXZ'
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    const codigo = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('')

    await cli.query(
      `INSERT INTO vale (codigo, tanda_id, socio_id, vence) VALUES ($1, $2, $3, now() + interval '90 seconds')
       ON CONFLICT (tanda_id) DO UPDATE SET codigo=EXCLUDED.codigo, emitido=now(), vence=EXCLUDED.vence
       WHERE vale.usado IS NULL`,
      [codigo, t[0].id, socioId],
    )
    await cli.query(
      "INSERT INTO auditoria (quien, accion, socio_id, detalle) VALUES ('api', 'canje', $1, $2::jsonb)",
      [socioId, JSON.stringify({ codigo })],
    )
    await cli.query('COMMIT')
    return c.json({ codigo, vence: 90, ahora: new Date().toISOString() })
  } catch (e) {
    await cli.query('ROLLBACK').catch(() => {})
    registrarError(e)
    return enCasa('Algo se nos quemó del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.', 500)
  } finally {
    c.executionCtx.waitUntil(cli.end())
  }
})

/** La barra quema el vale. Un código, una bebida. */
app.post('/api/vale/quemar', async (c) => {
  if (c.get('sesion').rol !== 'casa') return enCasa('Los vales los quema la barra.', 403)
  const { codigo, bebida } = await c.req.json<{ codigo?: string; bebida?:string }>()
  const sql = neon(c.env.DATABASE_URL)
  const cod = String(codigo ?? '').toUpperCase()
  const [titular] = await sql`SELECT s.telefono FROM operativo_vale v JOIN operativo_socio s ON s.id=v.socio_id WHERE v.codigo=${cod}`
  if (!titular) return enCasa('Ese vale no sirve: o ya se usó, o se enfrió.', 409)
  return enTransaccion(c, String(titular.telefono), async (cli) => {
    const {rows:[premio]}=await cli.query('SELECT t.id,t.reglas_version FROM operativo_vale v JOIN operativo_tanda t ON t.id=v.tanda_id WHERE v.codigo=$1',[cod])
    if(premio?.reglas_version===REGLAS_CLUB.version&&!REGLAS_CLUB.bebidas.some(id=>id===bebida))return enCasa('Elegí una bebida de la lista aprobada antes de confirmar la entrega.',422)
    const { rows: vales } = await cli.query(
      'UPDATE operativo_vale SET usado=now() WHERE codigo=$1 AND usado IS NULL AND vence>now() RETURNING codigo,tanda_id', [cod],
    )
    if (!vales.length) return enCasa('Ese vale no sirve: o ya se usó, o se enfrió.', 409)
    await cli.query('UPDATE operativo_tanda SET canjeada=now() WHERE id=$1', [vales[0].tanda_id])
    if(premio?.reglas_version===REGLAS_CLUB.version)await cli.query('INSERT INTO club_premio_entrega(tanda_id,bebida,reglas_version,quien) VALUES($1,$2,$3,$4)',[premio.id,bebida,REGLAS_CLUB.version,c.get('sesion').empleado??'propietario'])
    await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'entrega_vale',$2::jsonb)",[c.get('sesion').empleado??'propietario',JSON.stringify({tanda:vales[0].tanda_id})])
    return { monto: 0, concepto: '', ref: '', datos: { quemado: true, codigo: cod } }
  })
})

const TRAMOS = [
  { monto: 200000, bono: 24000 },
  { monto: 100000, bono: 10000 },
  { monto: 50000, bono: 4000 },
]

/**
 * Recargar.
 *
 * ATENCIÓN, DEUDA DECLARADA: esto acredita saldo sin cobrar. En producción el
 * asiento se escribe desde el webhook de la pasarela (Tilopay / Pagadito /
 * Recurrente) o lo firma la caja con su propio rol; nunca desde el teléfono
 * del socio. Mientras eso no exista, el tope por operación y el tope diario
 * mantienen acotado el daño de una demostración pública.
 */
app.post('/api/cuenta/recargar', async (c) => {
  const sesion = c.get('sesion')
  // La recarga acredita saldo Y su bono sin comprobar ningún pago: es la boca
  // por donde entra el dinero a la casa, y la abre quien cobra, no quien paga.
  //
  // Sin esta puerta, cualquier socio con sesión se acuñaba saldo hasta el tope
  // —C$ 3.000 por llamada, C$ 6.000 en veinticuatro horas— y desde la
  // iteración 11 ese saldo compra bolsa numerada, butaca de experiencia y
  // plaza de la Mesa Fundadora. El tope acotaba el daño; no lo impedía.
  //
  // Las otras dos bocas de caja ya estaban cerradas así. Ésta se quedó abierta.
  if (sesion.rol !== 'casa') {
    return enCasa('La recarga se hace en el mostrador, con efectivo o con tarjeta.', 403)
  }
  const { monto, ref, telefono } = await c.req.json<{
    monto?: number
    ref?: string
    telefono?: string
  }>()
  // La caja recarga a nombre del socio que tiene delante, igual que al sellar.
  const tel = typeof telefono === 'string' ? soloDigitos(telefono) : ''
  if (!tel) return enCasa('Decinos a qué cuenta va la recarga.', 422)
  if (typeof monto !== 'number' || !Number.isInteger(monto)) return enCasa('El monto debe ser un número entero de centavos.', 422)
  const cent = monto
  if (cent < RECARGA.minimo || cent > RECARGA.maximo) {
    return enCasa('El monto tiene que estar entre C$ 200 y C$ 3,000.')
  }

  const bono = TRAMOS.find((t) => cent >= t.monto)?.bono ?? 0
  if (typeof ref !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(ref)) {
    return enCasa('Falta una referencia de caja válida para identificar la recarga.', 422)
  }
  const marca = 'recarga:' + ref
  return enTransaccion(c, tel, async (cli, socioId) => {
    const { rows: hoy } = await cli.query(
      `SELECT COALESCE(SUM(monto),0)::int AS n FROM operativo_asiento
       WHERE socio_id=$1 AND tipo IN ('recarga','bono') AND creado>now()-interval '24 hours'`, [socioId],
    )
    if (Number(hoy[0].n) + cent + bono > 600000) return enCasa('Llegaste al tope de recargas de hoy. Mañana seguimos.', 429)
    await cli.query(
      "INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES ($1,$2,'recarga','Recarga',$3)",
      [socioId, cent, marca],
    )
    if (bono > 0) await cli.query(
      "INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES ($1,$2,'bono','La casa puso',$3)",
      [socioId, bono, marca + ':bono'],
    )
    await cli.query("INSERT INTO auditoria(quien,accion,socio_id,monto,detalle) VALUES ($4,'recarga',$1,$2,$3::jsonb)",
      [socioId, cent, JSON.stringify({ bono, ref: marca }),sesion.empleado??'propietario'])
    return { monto: 0, concepto: '', ref: '', datos: { monto: cent, bono } }
  }, { referencia: marca, operacion: 'recarga', huella: JSON.stringify({ cent, bono }) })
})

/**
 * Cobrar contra el monedero — aquí sí hace falta bloquear la fila.
 * Sin el FOR UPDATE, dos peticiones simultáneas leen el mismo saldo y las dos
 * pasan la comprobación: el socio gasta dos veces lo que tiene.
 */
/**
 * Cobrar contra la Cuenta de Casa.
 *
 * **El socio NO dicta el precio.** Antes, el importe salía del cuerpo de la
 * petición con una única validación —entero y positivo— mientras el teléfono
 * salía del token: cualquiera podía pagar su pedido por un córdoba y el
 * asiento quedaba escrito en producción con el concepto correcto y el monto
 * que eligiera. Eso es contabilidad falseada.
 *
 * Ahora un socio manda LÍNEAS —`[{ id, cuanto }]`— y el servidor las valora
 * con su propia copia de la carta. El campo `monto` sólo lo admite el rol
 * `casa`, que es la caja: ahí el importe sí lo pone el mostrador, porque el
 * mostrador es la casa.
 */
app.post('/api/cuenta/cobrar', async (c) => {
  const sesion = c.get('sesion')
  const cuerpo = await c.req.json<{
    telefono?: string
    monto?: number
    lineas?: { id?: string; cuanto?: number }[]
    concepto?: string
    ref?: string
  }>()
  if ((cuerpo.telefono !== undefined && typeof cuerpo.telefono !== 'string')
    || (cuerpo.concepto !== undefined && typeof cuerpo.concepto !== 'string')
    || (cuerpo.lineas !== undefined && !Array.isArray(cuerpo.lineas))) {
    return enCasa('Revisá los datos del pedido.', 422)
  }
  const tel = sesion.rol === 'casa' ? soloDigitos(cuerpo.telefono) : sesion.tel
  if (!tel) return enCasa('Decinos a qué cuenta va el cobro.', 422)

  if (sesion.rol !== 'casa' || cuerpo.lineas !== undefined) return enCasa('El pedido requiere una cotización de Carta.', 422)
  const cent = cuerpo.monto
  const conceptoFinal = String(cuerpo.concepto ?? 'Consumo')
  if (typeof cent !== 'number') return enCasa('El monto no es válido.', 422)

  if (!Number.isInteger(cent) || cent <= 0) return enCasa('El monto no es válido.')
  if (typeof cuerpo.ref !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(cuerpo.ref)) {
    return enCasa('Falta la referencia del pedido. Actualizá la app y probá otra vez.', 422)
  }
  const marca = cuerpo.ref

  const huellaPedido = JSON.stringify({ cent, concepto: conceptoFinal, lineas: cuerpo.lineas ?? null })
  return enTransaccion(c, tel, async (cli, socioId, disponible) => {
    if (disponible < cent) return faltan(cent - disponible)
    return { monto: cent, concepto: conceptoFinal, ref: 'pedido:' + marca, datos: { concepto: conceptoFinal, pedido:null } }
  }, { referencia: 'pedido:' + marca, operacion: 'pedido', huella: huellaPedido })
})

/** Marcar un beneficio de la membresía. El tope lo impone la base: si ya se
 *  usó en esta ventana, la restricción única lo rechaza y nadie se lleva dos. */
app.post('/api/beneficio/:clase', c => c.json({error:'Mostrá el código del beneficio en la barra. La entrega la confirma el personal.'},403))

/** Mesa Fundadora — el número de socio ES el cupo, y la cuota se cobra. */
app.post('/api/membresia/apartar', async (c) => {
  const CUOTA = CUOTA_MENSUAL
  const contrato=await c.req.json().catch(()=>null)
  const solicitud = await llaveDeSolicitud(c)
  if (!solicitud) return enCasa('Falta una referencia válida de la contratación.', 422)
  return enTransaccion(c, c.get('sesion').tel, async (cli, socioId, saldo) => {
    if(contrato?.version!==CONTRATO_CLUB.version||contrato?.acepto!==true)return enCasa('Revisá y aceptá las condiciones actuales de Mesa Fundadora.',422)
    const {rows:[condiciones]}=await cli.query('SELECT version,cafe_detalle,sellos_regla,premio_detalle,vip_regla,reposteria,reglas_version FROM club_config WHERE id=true FOR SHARE')
    if(contrato.configVersion!==condiciones.version)return enCasa('Las condiciones operativas cambiaron. Actualizá la información y revisalas antes de contratar.',409)
    await cli.query("SELECT set_config('club.actor',$1,true)", ['cliente:' + socioId])
    // Liberar contratos terminados nunca cobra a otro cliente. Los que tienen
    // renovación consentida y fondos conservan su plaza hasta el cron.
    await cli.query(`UPDATE membresia m SET estado='vencida',motivo_fin=CASE WHEN NOT autorenueva OR renovacion_consentida IS NULL THEN 'renovacion_desactivada' ELSE 'saldo_insuficiente' END
      WHERE m.socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta<=now()`,[socioId])
    const { rows: ya } = await cli.query(
      "SELECT numero FROM operativo_membresia WHERE socio_id = $1 AND estado IN ('activa','en_gracia') AND hasta>now()",
      [socioId],
    )
    if (ya.length) {
      return new Response(JSON.stringify({ numero: ya[0].numero, yaEra: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }
    if (saldo < CUOTA) return faltan(CUOTA - saldo)

    await cli.query("SELECT pg_advisory_xact_lock(hashtext('plazas-membresia'))")
    await cli.query(`UPDATE membresia m SET estado='vencida',motivo_fin=CASE WHEN NOT autorenueva OR renovacion_consentida IS NULL THEN 'renovacion_desactivada' ELSE 'saldo_insuficiente' END
      WHERE m.id IN (SELECT x.id FROM membresia x WHERE x.socio_id<>$1 AND x.archivado_muestra IS NULL AND x.estado IN ('activa','en_gracia') AND x.hasta<=now()
        AND (NOT x.autorenueva OR x.renovacion_consentida IS NULL OR (SELECT total FROM saldo_de(x.socio_id))<x.cuota) FOR UPDATE SKIP LOCKED)`,[socioId])

    // El numero de socio ES el cupo: la restriccion unica impide el 101.
    const { rows: nueva } = await cli.query(
      `INSERT INTO membresia (socio_id, numero, cuota, hasta, renovacion_consentida,contrato_detalle,contrato_version)
       SELECT $1, n, $2, now() + interval '30 days', now(),$4::jsonb,$5
       FROM generate_series(1, $3) AS n
       WHERE NOT EXISTS (SELECT 1 FROM operativo_membresia m WHERE m.numero = n AND m.estado IN ('activa','en_gracia'))
       ORDER BY n LIMIT 1
       ON CONFLICT DO NOTHING
       RETURNING id, numero`,
      [socioId, CUOTA, TOTAL_SOCIOS,JSON.stringify({...CONTRATO_CLUB,operacion:{...condiciones,reposteria_productos:CARTA.filter(p=>condiciones.reposteria.includes(p.id)).map(p=>p.nombre)}}),CONTRATO_CLUB.version],
    )
    if (!nueva.length) {
      return enCasa('Los cien están tomados. Dejá tu número y te escribimos apenas se desocupe un lugar.', 409)
    }
    const { rows: restan } = await cli.query(
      "SELECT $1::int - count(*)::int AS n FROM operativo_membresia WHERE estado IN ('activa','en_gracia')",
      [TOTAL_SOCIOS],
    )
    return {
      monto: CUOTA,
      concepto: 'Mesa Fundadora · período de 30 días',
      ref: 'mem:' + nueva[0].id,
      datos: { numero: nueva[0].numero, quedan: Number(restan[0].n) },
    }
  }, {referencia: solicitud, operacion: 'membresia', huella: CONTRATO_CLUB.version})
})

/** Cerrar la membresía. Existe porque el copy lo promete en dos toques. */
app.post('/api/membresia/cancelar', async (c) => {
  const tel = c.get('sesion').tel
  return enTransaccion(c, tel, async (cli,socioId) => {
    await cli.query("SELECT set_config('club.actor',$1,true)", ['cliente:' + socioId])
    const { rows: m } = await cli.query(
      `UPDATE operativo_membresia SET autorenueva=false WHERE socio_id=$1 AND estado IN ('activa','en_gracia') RETURNING numero,hasta`, [socioId],
    )
    if (!m.length) return enCasa('No tenés una membresía activa.', 409)
    return { monto:0, concepto:'', ref:'', datos:{ cancelada:true, numero:m[0].numero, hasta:m[0].hasta } }
  })
})

app.post('/api/membresia/renovacion', async (c) => {
  return enTransaccion(c, c.get('sesion').tel, async (cli,socioId) => {
    await cli.query("SELECT set_config('club.actor',$1,true)", ['cliente:' + socioId])
    const { rows: m } = await cli.query(
      `UPDATE operativo_membresia SET autorenueva=true,renovacion_consentida=CASE WHEN autorenueva AND renovacion_consentida IS NOT NULL THEN renovacion_consentida ELSE now() END
       WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now() RETURNING numero,hasta`, [socioId],
    )
    if (!m.length) return enCasa('Tu membresía ya venció. Tomá una plaza para empezar otro mes.', 409)
    return { monto:0, concepto:'', ref:'', datos:{ activada:true, hasta:m[0].hasta } }
  })
})

/** Experiencias — la butaca numerada es el cupo, y el ticket se paga. */
app.post('/api/experiencia/:id/apartar', async (c) => {
  const id = c.req.param('id')
  const cuerpo = await c.req.json<{oferta?:unknown}>()
  const oferta = typeof cuerpo.oferta === 'string' && /^[a-f0-9]{64}$/.test(cuerpo.oferta) ? cuerpo.oferta : ''
  const solicitud = await llaveDeSolicitud(c)
  if (!solicitud) return enCasa('Falta una referencia válida de la compra.', 422)
  return enTransaccion(c, c.get('sesion').tel, async (cli, socioId, saldo) => {
    // `/api/catalogo` sólo publica las que no han ocurrido, pero el endpoint
    // no lo comprobaba: con el id a mano se podía pagar la cata del mes pasado.
    // La fecha la juzga la base, no el reloj de quien pide.
    const { rows: exp } = await cli.query(
      `SELECT id, nombre, cupos, precio, cuando, abre_socios, abre_publico, duracion_minutos, lugar, incluye, condiciones, cuando > now() AS futura, cancelada,
        abre_socios<=now() AS socios_abierta,abre_publico<=now() AS publica_abierta
        FROM experiencia WHERE id = $1 FOR UPDATE`,
      [id],
    )
    if (!exp.length) return enCasa('Esa experiencia no está en el calendario.', 404)
    if (exp[0].cancelada) return enCasa('La casa canceló esta experiencia.', 409)
    if (!exp[0].publica_abierta) {
      const {rows: miembro}=await cli.query("SELECT id FROM operativo_membresia WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now()",[socioId])
      if (!exp[0].socios_abierta || !miembro.length) return enCasa('La venta todavía no está abierta para tu cuenta. Consultá las fechas en Mi Club.', 409)
    }
    if (!exp[0].futura) return enCasa('Esa ya pasó. Mirá lo que viene, que hay más.', 409)
    if (!oferta || oferta !== await ofertaExperiencia(exp[0])) return enCasa('La oferta cambió o falta su confirmación. Cerrá esta ventana, actualizá Mi Club y revisá de nuevo el precio, la fecha y las condiciones. No te cobramos.', 409)
    const precio = Number(exp[0].precio)
    if (saldo < precio) return faltan(precio - saldo)

    const { rows: butaca } = await cli.query(
      `INSERT INTO asiento_experiencia (experiencia_id, butaca, socio_id, pagado, cobro_ref)
       SELECT $1, n, $2, $3, $5
       FROM generate_series(1, $4) AS n
       WHERE NOT EXISTS (
         SELECT 1 FROM operativo_asiento_experiencia a WHERE a.experiencia_id = $1 AND a.butaca = n)
       ORDER BY n LIMIT 1
       ON CONFLICT DO NOTHING
       RETURNING id, butaca`,
      [exp[0].id, socioId, precio, exp[0].cupos, solicitud],
    )
    if (!butaca.length) {
      return enCasa('Esta experiencia ya no tiene lugares disponibles. No te cobramos nada.', 409)
    }
    const { rows: libres } = await cli.query(
      'SELECT $1::int - count(*)::int AS n FROM operativo_asiento_experiencia WHERE experiencia_id = $2',
      [exp[0].cupos, exp[0].id],
    )
    return {
      monto: precio,
      concepto: 'Experiencia · ' + exp[0].id,
      ref: solicitud ?? 'exp:' + butaca[0].id,
      datos: { butaca: butaca[0].butaca, quedan: Number(libres[0].n) },
    }
  }, { referencia: solicitud, operacion: 'experiencia', huella: id + ':' + oferta, coincide: guardada => guardada === id || guardada === id + ':' + oferta })
})

/**
 * Reservar mesa. El Salón VIP exige depósito y no admite solapes.
 *
 * La ventana se valida de verdad: futura, dentro del horario de la casa, a no
 * más de noventa días y de una a seis horas. Sin esto se aceptaba una reserva
 * para 1999 y una de 26.280 horas bloqueaba el salón tres años por C$500.
 */
/**
 * Las zonas de la casa, en un solo sitio.
 *
 * Antes esto vivía en tres literales separados —la lista de válidas, el aforo
 * de `/api/ocupacion` y el ternario del depósito—. Tres sitios para el mismo
 * hecho es tres oportunidades de que dejen de coincidir: añadir una zona y
 * olvidar su aforo la dejaba con el de por defecto, y sin nadie que avisara.
 *
 * `deposito` va en centavos. El nombre y el ícono salen de aquí también, para
 * que la pantalla de reservar no tenga que escribirlos a mano.
 */
const ZONAS = [
  // Los íconos esquivan los que el §4 ya tiene ocupados: `local_cafe` es la
  // pestaña Pedir y `workspace_premium` el sello de socia, así que la barra
  // lleva `countertops` y el VIP `diamond`. `deck` está retirado.
  { id: 'terraza', nombre: 'La terraza', icono: 'balcony' },
  { id: 'ventanal', nombre: 'El ventanal', icono: 'window' },
  { id: 'barra', nombre: 'La barra', icono: 'countertops' },
  { id: 'bistro', nombre: 'El bistró', icono: 'restaurant' },
  { id: 'vip', nombre: 'El Salón VIP', icono: 'diamond' },
] as const

/** Panel del dueño: detrás de su propia contraseña, no de la sesión del socio. */
app.get('/api/panel',c=>c.json({error:'Ingresá al panel del equipo con tu cuenta individual.'},410))

/**
 * Ocupación real por zona y hora del día pedido.
 *
 * El plano pintaba cinco arrays literales: una ocupación inventada en una app
 * que prohíbe las cifras decorativas. Esto cuenta reservas de verdad.
 */
app.get('/api/ocupacion', async (c) => {
  const dia = c.req.query('dia') ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Managua', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  if (!fechaCalendario(dia)) return enCasa('Esa fecha no nos cuadra.', 422)
  const sql = neon(c.env.DATABASE_URL)
  // Una mesa ocupa TODAS sus horas, no sólo aquella en la que empieza.
  //
  // Esto contaba únicamente la hora de `cuando`. Una reserva del Salón VIP de
  // 16:00 a 19:00 marcaba las 16:00 y dejaba las 17:00 y las 18:00 pintadas
  // como libres: la pantalla las ofrecía, el socio las elegía, y el servidor
  // le contestaba 409 por `reserva_sin_solape` —el único sitio donde el solape
  // sí se miraba—. La «ocupación real» de la iteración 12 era real sólo en la
  // primera hora de cada reserva.
  //
  // `generate_series` reparte la reserva sobre cada hora que de verdad ocupa,
  // desde la de inicio hasta la anterior al final: una mesa que termina a las
  // 19:00 deja las 19:00 libres para la siguiente.
  const configuracionMesas = await leerConfiguracionReservas(c.env)
  const aforo: Record<string, number> = Object.fromEntries(configuracionMesas.zonas.map(z => [z.id, z.mesas.length]))
  const filas = await sql`
    WITH vigentes AS MATERIALIZED (
      SELECT * FROM operativo_reserva r WHERE r.cancelada IS NULL
        AND r.estado IN ('confirmada','llego','sentada')
        AND r.cuando < (CAST(${dia} AS date) + 1) AT TIME ZONE 'America/Managua'
        AND r.termina > CAST(${dia} AS date) AT TIME ZONE 'America/Managua'
    ), tramos AS (
      SELECT r.zona, h, CASE WHEN cardinality(r.mesas)=0 THEN GREATEST(1,(CAST(${JSON.stringify(aforo)} AS jsonb)->>r.zona)::integer) ELSE cardinality(r.mesas) END AS mesas,
             GREATEST(r.cuando AT TIME ZONE 'America/Managua', h) AS inicio,
             LEAST(r.termina AT TIME ZONE 'America/Managua', h + interval '1 hour') AS fin
      FROM vigentes r,
           generate_series(
             date_trunc('hour', r.cuando AT TIME ZONE 'America/Managua'),
             (r.termina AT TIME ZONE 'America/Managua') - interval '1 microsecond',
             interval '1 hour'
           ) AS h
      WHERE (h)::date = ${dia}::date
    ), eventos AS (
      SELECT zona, h, inicio AS instante, mesas AS cambio FROM tramos
      UNION ALL
      SELECT zona, h, fin, -mesas FROM tramos
    ), simultaneas AS (
      SELECT zona, h, SUM(SUM(cambio)) OVER (PARTITION BY zona, h ORDER BY instante) AS n
      FROM eventos GROUP BY zona, h, instante
    )
    SELECT zona, EXTRACT(hour FROM h)::int AS hora, MAX(n)::int AS n
    FROM simultaneas GROUP BY zona, h`
  const mapa: Record<string, Record<number, number>> = {}
  for (const f of filas) {
    const z = f.zona as string
    mapa[z] ??= {}
    mapa[z][Number(f.hora)] = aforo[z] > 0 ? Math.min(1, Number(f.n) / aforo[z]) : 1
  }
  return c.json({ dia, aforo, ocupacion: mapa })
})

app.all('/api/*', () => enCasa('Esa puerta no da a ningún lado.', 404))

// La SPA se sirve al final: todo lo que no es /api es la casa.
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

/** El cron revisa fechas en Cloudflare; no despierta demostración ni una base sin tareas. */
export async function mantenerEntornos(env: Env): Promise<void> {
  if (env.MANTENIMIENTO) {
    const plan = env.MANTENIMIENTO.getByName('real')
    await plan.revisarCuota()
    await plan.revisar()
  }
  else await trabajarBase(env, true, Date.now()) // Entorno local sin bindings.
}

app.onError((error, c) => {
  registrarError(error)
  if (esCuotaAgotada(error)) {
    if (c.env.MANTENIMIENTO) c.executionCtx.waitUntil(c.env.MANTENIMIENTO.getByName(c.get('equipoDemo') ? 'demo' : 'real').noDisponible().catch(() => {}))
    return c.json({ error: 'La cuenta está temporalmente fuera de servicio. Estamos restableciendo el acceso. Intentá más tarde.', codigo: 'servicio_temporalmente_no_disponible' }, 503, { 'Retry-After': '3600' })
  }
  return enCasa('No pudimos completar la operación. Probá otra vez en un momento.', 500)
})

export { app }
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    await mantenerEntornos(env)
  },
} satisfies ExportedHandler<Env>
