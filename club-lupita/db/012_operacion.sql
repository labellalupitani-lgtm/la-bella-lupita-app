BEGIN;
CREATE TABLE IF NOT EXISTS empleado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL CHECK(length(nombre) BETWEEN 2 AND 80),
  usuario text NOT NULL UNIQUE CHECK(usuario ~ '^[a-z0-9._-]{3,40}$'),
  clave_huella text NOT NULL,
  permiso text NOT NULL CHECK(permiso IN ('encargado','caja','cocina')),
  activo boolean NOT NULL DEFAULT true,
  creado timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS acceso_limite (
  clave text PRIMARY KEY,
  intentos integer NOT NULL DEFAULT 1,
  vence timestamptz NOT NULL
);
CREATE OR REPLACE FUNCTION limitar_acceso(p_clave text, p_max integer, p_segundos integer)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE n integer;
BEGIN
  INSERT INTO acceso_limite(clave,vence) VALUES(p_clave,now()+make_interval(secs=>p_segundos))
  ON CONFLICT(clave) DO UPDATE SET
    intentos=CASE WHEN acceso_limite.vence<=now() THEN 1 ELSE acceso_limite.intentos+1 END,
    vence=CASE WHEN acceso_limite.vence<=now() THEN now()+make_interval(secs=>p_segundos) ELSE acceso_limite.vence END
  RETURNING intentos INTO n;
  RETURN n<=p_max;
END $$;
CREATE TABLE IF NOT EXISTS pedido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  socio_id uuid NOT NULL REFERENCES socio(id),
  referencia text NOT NULL,
  lineas jsonb NOT NULL CHECK(jsonb_typeof(lineas)='array'),
  total integer NOT NULL CHECK(total>0),
  estado text NOT NULL DEFAULT 'recibido' CHECK(estado IN ('recibido','aceptado','preparando','listo','entregado','cancelado')),
  creado timestamptz NOT NULL DEFAULT now(),
  actualizado timestamptz NOT NULL DEFAULT now(),
  motivo text,
  UNIQUE(socio_id,referencia)
);
CREATE INDEX IF NOT EXISTS pedido_bandeja ON pedido(estado,creado);
CREATE INDEX IF NOT EXISTS pedido_cliente ON pedido(socio_id,creado DESC);
CREATE TABLE IF NOT EXISTS pedido_evento (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id uuid NOT NULL REFERENCES pedido(id),
  estado text NOT NULL,
  quien text NOT NULL,
  motivo text,
  creado timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS beneficio_solicitud (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id uuid NOT NULL REFERENCES socio(id),
  membresia_id uuid NOT NULL REFERENCES membresia(id),
  clase text NOT NULL CHECK(clase IN ('bebida_dia','bolsa_mes')),
  ventana date NOT NULL,
  codigo text NOT NULL UNIQUE,
  creado timestamptz NOT NULL DEFAULT now(),
  vence timestamptz NOT NULL DEFAULT now()+interval '10 minutes',
  entregado timestamptz,
  entregado_por text,
  UNIQUE(membresia_id,clase,ventana)
);
ALTER TABLE reserva_cosecha ADD COLUMN IF NOT EXISTS entregada timestamptz;
ALTER TABLE reserva_cosecha ADD COLUMN IF NOT EXISTS entregada_por text;
CREATE TABLE IF NOT EXISTS compra_bolsa (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 socio_id uuid NOT NULL REFERENCES socio(id),
 numero smallint NOT NULL,
 generacion smallint NOT NULL,
 total integer NOT NULL CHECK(total>0),
 creada timestamptz NOT NULL DEFAULT now(),
 entregada timestamptz,
 entregada_por text,
 UNIQUE(generacion,numero)
);
INSERT INTO compra_bolsa(socio_id,numero,generacion,total,creada,entregada,entregada_por)
SELECT socio_id,numero,generacion,precio,apartada,entregada,entregada_por FROM reserva_cosecha WHERE socio_id IS NOT NULL
ON CONFLICT DO NOTHING;
ALTER TABLE asiento_experiencia ADD COLUMN IF NOT EXISTS asistencia timestamptz;
ALTER TABLE asiento_experiencia ADD COLUMN IF NOT EXISTS asistencia_por text;
CREATE TABLE IF NOT EXISTS aviso_cliente (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  socio_id uuid NOT NULL REFERENCES socio(id),
  referencia text NOT NULL,
  texto text NOT NULL,
  creado timestamptz NOT NULL DEFAULT now(),
  leido timestamptz,
  UNIQUE(socio_id,referencia)
);
CREATE TABLE IF NOT EXISTS solicitud_atencion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id uuid NOT NULL REFERENCES socio(id),
  referencia uuid NOT NULL,
  mensaje text NOT NULL CHECK(length(mensaje) BETWEEN 5 AND 1000),
  estado text NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','resuelta')),
  creada timestamptz NOT NULL DEFAULT now(),
  respuesta text,
  resuelta timestamptz,
  resuelta_por text,
  UNIQUE(socio_id,referencia)
);
ALTER TABLE asiento ADD COLUMN IF NOT EXISTS devolucion_de bigint REFERENCES asiento(id);
CREATE UNIQUE INDEX IF NOT EXISTS asiento_devolucion_unica ON asiento(devolucion_de) WHERE devolucion_de IS NOT NULL;
CREATE OR REPLACE FUNCTION saldo_de(p_socio uuid)
RETURNS TABLE(pagado integer,bono integer,total integer) LANGUAGE sql STABLE AS $$
  WITH m AS (SELECT
    COALESCE(SUM(monto) FILTER(WHERE monto>0 AND tipo='bono'),0)::bigint AS entro_bono,
    COALESCE(SUM(monto) FILTER(WHERE monto>0 AND tipo<>'bono' AND devolucion_de IS NULL),0)::bigint AS entro_pagado,
    (COALESCE(-SUM(monto) FILTER(WHERE monto<0),0)-COALESCE(SUM(monto) FILTER(WHERE devolucion_de IS NOT NULL),0))::bigint AS salio
    FROM asiento WHERE socio_id=p_socio)
  SELECT (entro_pagado-(salio-LEAST(salio,entro_bono)))::integer,(entro_bono-LEAST(salio,entro_bono))::integer,(entro_pagado+entro_bono-salio)::integer FROM m;
$$;
CREATE OR REPLACE FUNCTION emitir_codigo(p_telefono text,p_huella text,p_minutos int DEFAULT 10)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE nuevo bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('acceso:'||p_telefono));
  UPDATE codigo_acceso SET usado=now() WHERE telefono=p_telefono AND usado IS NULL;
  INSERT INTO codigo_acceso(telefono,huella,vence) VALUES(p_telefono,p_huella,now()+make_interval(mins=>p_minutos)) RETURNING id INTO nuevo;
  RETURN nuevo;
END $$;
COMMIT;
