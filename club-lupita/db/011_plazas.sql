-- Fase posterior al despliegue del Worker nuevo. La versión antigua utiliza
-- ON CONFLICT(numero), por lo que se conserva su índice durante la transición.
BEGIN;
ALTER TABLE membresia DROP CONSTRAINT IF EXISTS membresia_numero_key;
COMMIT;
