-- El vale de la décima.
--
-- Hasta ahora el canje vivía entero en el navegador y el código era
-- determinista: `LUP-037-03`. Una captura de pantalla servía dos veces, y el
-- botón «la guardo para después» ni siquiera consumía la tanda. Un vale que se
-- puede fotografiar y reusar no es un premio: es una fuga.
BEGIN;

CREATE TABLE IF NOT EXISTS vale (
  codigo    text PRIMARY KEY CHECK (codigo ~ '^[A-Z0-9]{8}$'),
  tanda_id  uuid NOT NULL UNIQUE REFERENCES tanda (id) ON DELETE CASCADE,
  socio_id  uuid NOT NULL REFERENCES socio (id) ON DELETE CASCADE,
  emitido   timestamptz NOT NULL DEFAULT now(),
  vence     timestamptz NOT NULL,
  usado     timestamptz,
  CHECK (vence > emitido)
);

CREATE INDEX IF NOT EXISTS vale_vivo_idx ON vale (socio_id, emitido DESC) WHERE usado IS NULL;

COMMIT;
