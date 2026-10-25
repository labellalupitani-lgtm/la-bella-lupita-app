import type { ContratoGuardado } from '../club'
import { cordobas } from '../datos'
export function CondicionesClub({contrato:c}:{contrato:ContratoGuardado}){
  return <div className="cuenta-condiciones space-y-3"><p className="cuenta-condiciones-version">Condiciones aceptadas: {c.version}. {cordobas(c.cuota)} cada {c.dias} días.</p><ul className="mi-club-lista"><li>{c.cafe}.</li><li>{c.bolsa}.</li><li>{c.descuentoReposteria}% en repostería.{!!c.operacion.reposteria_productos?.length&&` Productos confirmados: ${c.operacion.reposteria_productos.join(', ')}.`}</li><li>Prioridad de horario en el Salón VIP, sujeta a disponibilidad.</li><li>{c.anticipacionHoras} horas de anticipación para nuevas experiencias.</li></ul><p>{c.renovacion} {c.cancelacion}</p>{[c.operacion.cafe_detalle,c.operacion.sellos_regla,c.operacion.premio_detalle,c.operacion.vip_regla].filter(Boolean).map((t,i)=><p key={i}>{t}</p>)}</div>
}
