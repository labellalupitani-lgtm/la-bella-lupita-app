-- Política confirmada por el titular del negocio: devolución del anticipo
-- pendiente por cancelación o inasistencia. No cambia mesas ni mueve dinero
-- histórico. Las reservas conservan la política aceptada en su comprobante.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('reservas-inventario'));
WITH condiciones AS (
  SELECT 'Al cancelar, el anticipo pendiente se devuelve íntegramente a tu Cuenta de Casa.'::text AS cancelacion,
         'Si no asistís, el anticipo pendiente se devuelve íntegramente a tu Cuenta de Casa cuando el personal registre la inasistencia.'::text AS inasistencia
)
UPDATE reserva_config c
SET version=c.version+1,
    datos=c.datos || jsonb_build_object('version',c.version+1,'politica',
      c.datos->'politica' || jsonb_build_object(
        'version',COALESCE((c.datos->'politica'->>'version')::integer,1)+1,
        'cancelacion',p.cancelacion,'inasistencia',p.inasistencia)),
    actualizado=now()
FROM condiciones p
WHERE c.datos->'politica'->>'cancelacion' IS DISTINCT FROM p.cancelacion
   OR c.datos->'politica'->>'inasistencia' IS DISTINCT FROM p.inasistencia;
COMMIT;
