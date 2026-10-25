-- ============================================================
-- 009 · Puntos y niveles
--
-- El prototipo muestra «Nivel Barista · 620 pts para Reserva Lupita».
-- La casa hoy no cuenta puntos: cuenta tandas. Son dos monedas distintas
-- y el prototipo asume la que no existe. Esto la construye.
--
-- Contrato en SPEC.md §6 y §12.2. Nada de esto se decide aquí.
--
-- Los puntos NO son saldo: no se gastan, no caducan y no se descuentan al
-- canjear. Miden trayectoria. El saldo es `asiento` y es otra cosa.
-- ============================================================

BEGIN;

-- ---------- El libro de puntos ----------
-- Append-only, como el libro mayor del monedero. El total de un socio es
-- siempre `SUM(puntos)`: no hay campo acumulado que se pueda desincronizar.
CREATE TABLE IF NOT EXISTS punto (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id    uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  puntos      integer NOT NULL CHECK (puntos <> 0),
  motivo      text NOT NULL CHECK (motivo IN ('consumo', 'tanda', 'referido', 'membresia', 'ajuste')),
  -- De dónde salieron, para poder auditar y para no contar dos veces.
  origen_id   text,
  concepto    text NOT NULL,
  creado      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS punto_socio_idx ON punto (socio_id, creado DESC);

-- Los asientos usan bigint; tandas y membresías usan UUID. Se conserva el
-- identificador completo y se distingue su clase con motivo.
ALTER TABLE punto ALTER COLUMN origen_id TYPE text USING origen_id::text;

-- Un consumo, una tanda o un referido sólo puntúan UNA vez. La restricción
-- vive en la base porque un reintento de red no puede regalar puntos.
CREATE UNIQUE INDEX IF NOT EXISTS punto_origen_unico
  ON punto (motivo, origen_id)
  WHERE origen_id IS NOT NULL;

-- ---------- La escalera ----------
-- En tabla y no en código: el dueño sube un umbral sin desplegar.
CREATE TABLE IF NOT EXISTS nivel (
  clave   text PRIMARY KEY,
  nombre  text NOT NULL,
  umbral  integer NOT NULL CHECK (umbral >= 0),
  orden   integer NOT NULL UNIQUE
);

INSERT INTO nivel (clave, nombre, umbral, orden) VALUES
  ('casa',     'Gente de la Casa',    0, 1),
  ('barista',  'Barista',          1000, 2),
  ('reserva',  'Reserva Lupita',   2500, 3)
ON CONFLICT (clave) DO UPDATE
  SET nombre = EXCLUDED.nombre, umbral = EXCLUDED.umbral, orden = EXCLUDED.orden;

-- ---------- La cuenta de puntos de cada socio ----------
-- Nivel actual, siguiente, cuánto falta y el porcentaje EXACTO de la barra.
-- El prototipo dibujaba el mismo dato al 70 % en dos pantallas y al 75 % en
-- otra, a ojo. Aquí sale una sola cifra y sale de aquí.
CREATE OR REPLACE VIEW puntaje AS
WITH total AS (
  SELECT s.id AS socio_id,
         COALESCE((SELECT SUM(p.puntos) FROM punto p WHERE p.socio_id = s.id), 0)::int AS puntos
  FROM socio s
), actual AS (
  SELECT t.socio_id, t.puntos,
         (SELECT n.clave FROM nivel n WHERE n.umbral <= t.puntos ORDER BY n.orden DESC LIMIT 1) AS nivel
  FROM total t
)
SELECT a.socio_id,
       a.puntos,
       a.nivel,
       (SELECT n.nombre FROM nivel n WHERE n.clave = a.nivel) AS nivel_nombre,
       sig.clave  AS siguiente,
       sig.nombre AS siguiente_nombre,
       GREATEST(0, COALESCE(sig.umbral, 0) - a.puntos)::int AS faltan,
       CASE
         WHEN sig.umbral IS NULL THEN 100
         ELSE LEAST(100, GREATEST(0, ROUND(a.puntos::numeric * 100 / sig.umbral)))::int
       END AS avance
FROM actual a
LEFT JOIN LATERAL (
  SELECT n.clave, n.nombre, n.umbral
  FROM nivel n
  WHERE n.umbral > a.puntos
  ORDER BY n.orden ASC
  LIMIT 1
) sig ON true;

-- ---------- Los puntos se ganan solos ----------
-- Si el otorgamiento vive en el worker, cada camino nuevo que mueva saldo o
-- cierre una tanda tiene que acordarse de puntuar, y tarde o temprano uno se
-- olvida. Vive en la base: se gana por existir el hecho, no por llamarlo.

-- 1 punto por cada C$ 10 de consumo. `asiento.monto` va en centavos y el
-- consumo es negativo, de ahí el signo.
CREATE OR REPLACE FUNCTION puntuar_consumo() RETURNS trigger AS $$
DECLARE ganados integer;
BEGIN
  IF NEW.tipo <> 'consumo' THEN RETURN NEW; END IF;
  ganados := FLOOR(ABS(NEW.monto) / 1000.0)::int;   -- C$ 10 = 1000 centavos
  IF ganados > 0 THEN
    INSERT INTO punto (socio_id, puntos, motivo, origen_id, concepto)
    VALUES (NEW.socio_id, ganados, 'consumo', NEW.id::text, NEW.concepto)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS punto_por_consumo ON asiento;
CREATE TRIGGER punto_por_consumo AFTER INSERT ON asiento
  FOR EACH ROW EXECUTE FUNCTION puntuar_consumo();

-- +100 al cerrar la tanda.
CREATE OR REPLACE FUNCTION puntuar_tanda() RETURNS trigger AS $$
BEGIN
  IF NEW.cerrada IS NOT NULL AND (OLD.cerrada IS NULL) THEN
    INSERT INTO punto (socio_id, puntos, motivo, origen_id, concepto)
    VALUES (NEW.socio_id, 100, 'tanda', NEW.id::text, 'Tanda cerrada')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS punto_por_tanda ON tanda;
CREATE TRIGGER punto_por_tanda AFTER UPDATE ON tanda
  FOR EACH ROW EXECUTE FUNCTION puntuar_tanda();

-- +500 al activar la membresía. Sólo la primera vez: una renovación no
-- vuelve a puntuar, porque `origen_id` es la fila de membresía.
CREATE OR REPLACE FUNCTION puntuar_membresia() RETURNS trigger AS $$
BEGIN
  IF NEW.estado = 'activa' THEN
    INSERT INTO punto (socio_id, puntos, motivo, origen_id, concepto)
    VALUES (NEW.socio_id, 500, 'membresia', NEW.id::text, 'Mesa Fundadora')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS punto_por_membresia ON membresia;
CREATE TRIGGER punto_por_membresia AFTER INSERT OR UPDATE OF estado ON membresia
  FOR EACH ROW EXECUTE FUNCTION puntuar_membresia();

-- ---------- Retroactivo ----------
-- La casa ya tiene historia: consumos, tandas cerradas y membresías vivas.
-- Si los puntos empiezan en cero, la socia #037 abre la app y ve que perdió
-- todo lo que llevaba. Se acredita hacia atrás, con el mismo criterio.
INSERT INTO punto (socio_id, puntos, motivo, origen_id, concepto)
SELECT a.socio_id, FLOOR(ABS(a.monto) / 1000.0)::int, 'consumo', a.id::text, a.concepto
FROM asiento a
WHERE a.tipo = 'consumo' AND FLOOR(ABS(a.monto) / 1000.0) > 0
ON CONFLICT DO NOTHING;

INSERT INTO punto (socio_id, puntos, motivo, origen_id, concepto)
SELECT t.socio_id, 100, 'tanda', t.id::text, 'Tanda cerrada'
FROM tanda t WHERE t.cerrada IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO punto (socio_id, puntos, motivo, origen_id, concepto)
SELECT m.socio_id, 500, 'membresia', m.id::text, 'Mesa Fundadora'
FROM membresia m WHERE m.estado IN ('activa', 'en_gracia')
ON CONFLICT DO NOTHING;

COMMIT;
