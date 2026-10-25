-- Club Lupita — esquema de datos.
--
-- Convenciones innegociables:
--   · El dinero se guarda en ENTEROS DE CENTAVOS de córdoba. C$ 280.00 => 28000.
--     Nunca float: 0.1 + 0.2 no es 0.3 y una caja no puede descuadrar por eso.
--   · El monedero es un LIBRO MAYOR append-only. El saldo se deriva sumando
--     asientos, jamás se guarda en un campo mutable que dos peticiones puedan pisar.
--   · Los cupos se defienden con restricciones de la base, no con lógica de la app.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- SOCIOS
-- ============================================================

CREATE TABLE IF NOT EXISTS socio (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- La identidad es el número de WhatsApp, normalizado a solo dígitos.
  telefono        text NOT NULL UNIQUE CHECK (telefono ~ '^[0-9]{8,15}$'),
  nombre          text NOT NULL CHECK (length(btrim(nombre)) >= 2),
  creado          timestamptz NOT NULL DEFAULT now(),
  -- CRM «sentirse conocido»: el 50% de los clientes valora ser recordado
  -- por encima de los puntos, y solo el 30% lo recibe.
  bebida_siempre  text,
  alergias        text,
  cumple          date,
  notas_staff     text,
  baja            timestamptz
);

CREATE INDEX IF NOT EXISTS socio_telefono_idx ON socio (telefono);

-- ============================================================
-- LA TANDA (sellos 9+1)
-- ============================================================

CREATE TABLE IF NOT EXISTS tanda (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id   uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  abierta    timestamptz NOT NULL DEFAULT now(),
  cerrada    timestamptz,
  canjeada   timestamptz,
  CHECK (cerrada IS NULL OR cerrada >= abierta),
  CHECK (canjeada IS NULL OR cerrada IS NOT NULL)
);

-- Un socio no puede tener dos tandas abiertas a la vez.
CREATE UNIQUE INDEX IF NOT EXISTS tanda_una_abierta
  ON tanda (socio_id) WHERE cerrada IS NULL;

CREATE TABLE IF NOT EXISTS sello (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanda_id    uuid NOT NULL REFERENCES tanda (id) ON DELETE CASCADE,
  n           smallint NOT NULL CHECK (n BETWEEN 1 AND 9),
  motivo      text NOT NULL,
  barista     text NOT NULL DEFAULT 'La casa',
  puesto      timestamptz NOT NULL DEFAULT now(),
  -- Idempotencia: una misma transacción de caja no puede sellar dos veces.
  -- El ticket del POS entra aquí; si se reintenta, la restricción lo frena.
  ref_externa text,
  UNIQUE (tanda_id, n)
);

CREATE UNIQUE INDEX IF NOT EXISTS sello_ref_externa_unica
  ON sello (ref_externa) WHERE ref_externa IS NOT NULL;

-- ============================================================
-- CUENTA DE CASA (monedero) — libro mayor append-only
-- ============================================================

DO $$ BEGIN
  CREATE TYPE asiento_tipo AS ENUM ('recarga', 'bono', 'consumo', 'deposito', 'regalo', 'ajuste');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS asiento (
  id          bigserial PRIMARY KEY,
  socio_id    uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  -- centavos: positivo entra, negativo sale. Nunca cero.
  monto       integer NOT NULL CHECK (monto <> 0),
  tipo        asiento_tipo NOT NULL,
  concepto    text NOT NULL,
  creado      timestamptz NOT NULL DEFAULT now(),
  ref_externa text,
  -- El bono de la casa siempre entra; nunca puede ser una salida.
  CHECK (tipo <> 'bono' OR monto > 0)
);

CREATE INDEX IF NOT EXISTS asiento_socio_idx ON asiento (socio_id, creado DESC);

CREATE UNIQUE INDEX IF NOT EXISTS asiento_ref_externa_unica
  ON asiento (socio_id, ref_externa) WHERE ref_externa IS NOT NULL;

-- El saldo es una función del libro, no un campo. Separa lo que puso el socio
-- de lo que puso la casa, que es lo que permite medir el breakage (IFRS 15).
CREATE OR REPLACE FUNCTION saldo_de(p_socio uuid)
RETURNS TABLE (pagado integer, bono integer, total integer)
LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(SUM(monto) FILTER (WHERE tipo <> 'bono'), 0)::integer,
    COALESCE(SUM(monto) FILTER (WHERE tipo = 'bono'), 0)::integer,
    COALESCE(SUM(monto), 0)::integer
  FROM asiento WHERE socio_id = p_socio;
$$;

-- ============================================================
-- MESA FUNDADORA (membresía de pago con cupo duro)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE membresia_estado AS ENUM ('activa', 'en_gracia', 'cancelada', 'vencida');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS membresia (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id     uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  -- El número de socio ES el cupo: 1 a 100, único. Si dos peticiones intentan
  -- el mismo número, la restricción única deja pasar una sola. Eso es lo que
  -- impide la sobreventa bajo concurrencia, no un IF en la aplicación.
  numero       smallint NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 100),
  estado       membresia_estado NOT NULL DEFAULT 'activa',
  cuota        integer NOT NULL CHECK (cuota > 0),
  desde        timestamptz NOT NULL DEFAULT now(),
  hasta        timestamptz NOT NULL,
  autorenueva  boolean NOT NULL DEFAULT true,
  CHECK (hasta > desde)
);

-- Un socio, una membresía viva.
CREATE UNIQUE INDEX IF NOT EXISTS membresia_una_viva
  ON membresia (socio_id) WHERE estado IN ('activa', 'en_gracia');

-- Topes de beneficio verificables por consulta, sin condición de carrera:
-- la unicidad es la que impide el doble uso, no una lectura previa.
CREATE TABLE IF NOT EXISTS beneficio_uso (
  id           bigserial PRIMARY KEY,
  membresia_id uuid NOT NULL REFERENCES membresia (id) ON DELETE CASCADE,
  clase        text NOT NULL CHECK (clase IN ('bebida_dia', 'bolsa_mes')),
  -- Ventana del tope: un día para la bebida, un mes para la bolsa.
  ventana      date NOT NULL,
  usado        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (membresia_id, clase, ventana)
);

-- ============================================================
-- CUPOS: bolsas numeradas y asientos de experiencia
-- ============================================================

CREATE TABLE IF NOT EXISTS reserva_cosecha (
  numero    smallint PRIMARY KEY CHECK (numero BETWEEN 1 AND 150),
  socio_id  uuid REFERENCES socio (id) ON DELETE SET NULL,
  precio    integer NOT NULL CHECK (precio > 0),
  apartada  timestamptz,
  pagada    timestamptz,
  -- Una bolsa apartada tiene dueño; una libre no.
  CHECK ((socio_id IS NULL) = (apartada IS NULL))
);

CREATE TABLE IF NOT EXISTS experiencia (
  id       text PRIMARY KEY,
  nombre   text NOT NULL,
  cuando   timestamptz NOT NULL,
  cupos    smallint NOT NULL CHECK (cupos > 0),
  precio   integer NOT NULL CHECK (precio > 0)
);

CREATE TABLE IF NOT EXISTS asiento_experiencia (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id text NOT NULL REFERENCES experiencia (id) ON DELETE CASCADE,
  -- Mismo truco que el número de socio: el asiento numerado es el cupo.
  butaca         smallint NOT NULL CHECK (butaca > 0),
  socio_id       uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  pagado         integer NOT NULL CHECK (pagado > 0),
  comprado       timestamptz NOT NULL DEFAULT now(),
  cedido_a       uuid REFERENCES socio (id) ON DELETE SET NULL,
  UNIQUE (experiencia_id, butaca)
);

-- ============================================================
-- RESERVAS DE MESA
-- ============================================================

CREATE TABLE IF NOT EXISTS reserva (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id  uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  zona      text NOT NULL CHECK (zona IN ('terraza', 'ventanal', 'barra', 'bistro', 'vip')),
  cuando    timestamptz NOT NULL,
  personas  smallint NOT NULL CHECK (personas BETWEEN 1 AND 12),
  deposito  integer NOT NULL DEFAULT 0 CHECK (deposito >= 0),
  creada    timestamptz NOT NULL DEFAULT now(),
  cancelada timestamptz,
  -- El Salón VIP no se aparta sin depósito. La regla vive en el esquema.
  CHECK (zona <> 'vip' OR deposito > 0)
);

CREATE INDEX IF NOT EXISTS reserva_cuando_idx ON reserva (cuando) WHERE cancelada IS NULL;

-- ============================================================
-- AUDITORÍA de todo lo que toca dinero
-- ============================================================

CREATE TABLE IF NOT EXISTS auditoria (
  id       bigserial PRIMARY KEY,
  cuando   timestamptz NOT NULL DEFAULT now(),
  quien    text NOT NULL,
  accion   text NOT NULL,
  socio_id uuid REFERENCES socio (id) ON DELETE SET NULL,
  monto    integer,
  detalle  jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS auditoria_cuando_idx ON auditoria (cuando DESC);

COMMIT;
