-- Aditiva: no modifica saldos, membresías, premios ni datos de clientes.
CREATE TABLE IF NOT EXISTS sesion_cliente (
  huella text PRIMARY KEY,
  socio_id uuid NOT NULL REFERENCES socio(id),
  csrf text NOT NULL,
  creada timestamptz NOT NULL DEFAULT now(),
  vence timestamptz NOT NULL,
  revocada timestamptz
);
CREATE INDEX IF NOT EXISTS sesion_cliente_vence ON sesion_cliente(vence);
CREATE TABLE IF NOT EXISTS sesion_cliente_migrada (
  huella text PRIMARY KEY,
  vence timestamptz NOT NULL
);
-- Únicamente contadores diarios. Sin identificador de usuario ni texto libre.
CREATE TABLE IF NOT EXISTS inicio_metrica (
  dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Managua')::date,
  evento text NOT NULL CHECK(evento IN ('vista','pase','actualizacion_ok','actualizacion_error','premio_intento','premio_ok','premio_error','oferta_cosecha','oferta_experiencia','destino_cosecha','destino_experiencia','compra_cosecha','compra_experiencia')),
  cuenta text NOT NULL CHECK(cuenta IN ('cliente','fundador')),
  dispositivo text NOT NULL CHECK(dispositivo IN ('movil','tableta','escritorio')),
  cantidad bigint NOT NULL DEFAULT 0,
  duracion_ms bigint NOT NULL DEFAULT 0,
  PRIMARY KEY(dia,evento,cuenta,dispositivo)
);
