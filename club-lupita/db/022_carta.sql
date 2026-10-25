BEGIN;
CREATE TABLE IF NOT EXISTS carta_configuracion (
  id boolean PRIMARY KEY DEFAULT true CHECK(id),
  valor jsonb NOT NULL CHECK(jsonb_typeof(valor)='object'),
  revision integer NOT NULL DEFAULT 1,
  actualizado timestamptz NOT NULL DEFAULT now(),
  responsable text NOT NULL
);
INSERT INTO carta_configuracion(id,valor,responsable) VALUES(true,
'{"horario":[{"abre":"08:00","cierra":"21:00"},{"abre":"07:00","cierra":"21:00"},{"abre":"07:00","cierra":"21:00"},{"abre":"07:00","cierra":"21:00"},{"abre":"07:00","cierra":"21:00"},{"abre":"07:00","cierra":"21:00"},{"abre":"07:00","cierra":"21:00"}],"pausaHasta":null,"motivoPausa":"","agotados":[],"categoriasPausadas":[],"empaque":4000,"capacidad":null,"minutos":null}',
'Confirmación del propietario 2026-10-09') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS carta_intento (
  socio_id uuid NOT NULL REFERENCES socio(id),
  referencia text NOT NULL CHECK(length(referencia) BETWEEN 8 AND 64),
  cotizacion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  intencion text NOT NULL,
  cotizacion jsonb NOT NULL,
  vence timestamptz NOT NULL,
  cerrado boolean NOT NULL DEFAULT false,
  creado timestamptz NOT NULL DEFAULT now(),
  actualizado timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(socio_id,referencia)
);
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS restriccion_confirmada text;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS empaque integer NOT NULL DEFAULT 0 CHECK(empaque>=0);
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS estimacion_minutos integer;
-- Las vistas operativas usan una lista de columnas fijada al crearse. Ampliar sin reemplazar las existentes.
CREATE OR REPLACE VIEW operativo_pedido AS SELECT p.* FROM pedido p WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=p.socio_id);
CREATE TABLE IF NOT EXISTS carta_metrica (
  dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Managua')::date,
  evento text NOT NULL,
  dispositivo text NOT NULL,
  cantidad bigint NOT NULL DEFAULT 1,
  duracion_ms bigint NOT NULL DEFAULT 0,
  PRIMARY KEY(dia,evento,dispositivo)
);
CREATE TABLE IF NOT EXISTS carta_rendimiento (
  dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Managua')::date,
  metrica text NOT NULL CHECK(metrica IN ('LCP','INP','CLS')),
  dispositivo text NOT NULL CHECK(dispositivo IN ('movil','tableta','escritorio')),
  cubeta integer NOT NULL CHECK(cubeta>=0),
  cantidad bigint NOT NULL DEFAULT 1,
  PRIMARY KEY(dia,metrica,dispositivo,cubeta)
);
CREATE TABLE IF NOT EXISTS carta_ficha (
  producto text PRIMARY KEY,
  porcion text NOT NULL CHECK(length(porcion)<=120),
  componentes text NOT NULL CHECK(length(componentes)<=600),
  fuente text NOT NULL CHECK(length(fuente) BETWEEN 1 AND 200),
  foto_verificada boolean NOT NULL DEFAULT false,
  revision integer NOT NULL DEFAULT 1,
  responsable text NOT NULL,
  revisado timestamptz NOT NULL DEFAULT now()
);
COMMIT;
