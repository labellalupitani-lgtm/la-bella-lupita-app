import {readFileSync,writeFileSync} from 'node:fs'
const dir='entregables/auditoria-cuota-2026-10-22/'
const inv=JSON.parse(readFileSync(dir+'inventario.json'))
const raw=JSON.parse(readFileSync(dir+'operaciones.json')).operations
const ops=[...new Map(raw.map(o=>[o.id,o])).values()].sort((a,b)=>a.created_at.localeCompare(b.created_at))
const cf=JSON.parse(readFileSync(dir+'cloudflare-horas.json')).data.viewer.accounts[0].workersInvocationsAdaptive
const time=s=>Date.parse(s),period=time(inv.proyecto.consumption_period_start)
const hourly=new Map();for(const r of cf){const k=r.dimensions.datetimeHour,prev=hourly.get(k)??{requests:0,errors:0,subrequests:0};for(const f of Object.keys(prev))prev[f]+=r.sum[f];hourly.set(k,prev)}
const known=new Map(inv.endpoints.map(e=>[e.id,e.entorno]))
const starts=new Map(),intervals=[],unpaired=[]
for(const o of ops){
 if(!o.endpoint_id||o.status!=='finished')continue
 if(o.action==='start_compute'){if(starts.has(o.endpoint_id))unpaired.push(starts.get(o.endpoint_id));starts.set(o.endpoint_id,o)}
 if(o.action==='suspend_compute'){
  const start=starts.get(o.endpoint_id);if(!start)continue
  starts.delete(o.endpoint_id);if(time(o.created_at)<period)continue
  const s=Math.max(period,time(start.updated_at)),end=time(o.created_at),date=new Date(s),h=date.toISOString().slice(0,13)+':00:00Z',stats=hourly.get(h)
  intervals.push({endpoint:o.endpoint_id,branch:o.branch_id,entorno:known.get(o.endpoint_id)??'temporal',desde:new Date(s).toISOString(),hasta:o.created_at,segundos:(end-s)/1000,minuto:date.getUTCMinutes(),cronCoincide:date.getUTCMinutes()===17&&s>=time('2026-10-08T03:26:00Z'),requestsHora:stats?.requests,subrequestsHora:stats?.subrequests})
 }
}
const sum=(a,f)=>a.reduce((s,x)=>s+(x[f]??0),0),round=n=>Math.round(n*100)/100
const distribution=a=>{const sorted=a.map(x=>x.segundos).sort((a,b)=>a-b);return {n:a.length,horas:round(sum(a,'segundos')/3600),minutosP50:round(sorted[Math.floor(sorted.length*.5)]/60),minutosP90:round(sorted[Math.floor(sorted.length*.9)]/60),minutosMax:round(sorted.at(-1)/60)}}
const groups={};for(const env of new Set(intervals.map(x=>x.entorno))){const a=intervals.filter(x=>x.entorno===env);groups[env]={total:distribution(a),inicioMinuto17:distribution(a.filter(x=>x.cronCoincide)),horaConUnaInvocacion:distribution(a.filter(x=>x.cronCoincide&&x.requestsHora===1)),otros:distribution(a.filter(x=>!x.cronCoincide)),minutosInicio:a.reduce((acc,x)=>(acc[x.minuto]=(acc[x.minuto]??0)+1,acc),{})}}
const daily={};for(const x of intervals){let t=time(x.desde);const end=time(x.hasta);while(t<end){const day=new Date(t).toISOString().slice(0,10),next=Math.min(end,time(day+'T00:00:00Z')+86400000);const row=daily[day]??={};row[x.entorno]=(row[x.entorno]??0)+(next-t)/3600000;t=next}}
for(const [h,row] of hourly){const day=h.slice(0,10),d=daily[day]??={};d.requests=(d.requests??0)+row.requests;d.errors=(d.errors??0)+row.errors;d.subrequests=(d.subrequests??0)+row.subrequests}
const changes=ops.filter(o=>['apply_config','epc_sync','create_branch','delete_timeline','check_availability'].includes(o.action))
const localDays={};for(const x of intervals){let t=time(x.desde),end=time(x.hasta);while(t<end){const dia=new Date(t-21600000).toISOString().slice(0,10),next=Math.min(end,time(dia+'T06:00:00Z')+86400000),row=localDays[dia]??={real:0,demo:0,temporal:0,horasInicioCron:0};row[x.entorno]+=(next-t)/3600000;if(x.cronCoincide)row.horasInicioCron+=(next-t)/3600000;t=next}}
const cfMinutes=JSON.parse(readFileSync(dir+'cloudflare-minutos.json')).data.viewer.accounts[0].workersInvocationsAdaptive
for(const x of cfMinutes){const dia=new Date(time(x.dimensions.datetimeMinute)-21600000).toISOString().slice(0,10),row=localDays[dia]??={real:0,demo:0,temporal:0,horasInicioCron:0};row.requests=(row.requests??0)+x.sum.requests;row.subrequests=(row.subrequests??0)+x.sum.subrequests;if(x.dimensions.datetimeMinute.slice(14,16)==='17'&&x.sum.requestDuration===0)row.cronDetectado=(row.cronDetectado??0)+x.sum.requests}
const result={fecha:new Date().toISOString(),periodo:inv.proyecto.consumption_period_start,horasCuProyecto:inv.proyecto.compute_time_seconds/3600,horasActivasProyecto:inv.proyecto.active_time_seconds/3600,cuPromedio:inv.proyecto.compute_time_seconds/inv.proyecto.active_time_seconds,porRama:inv.ramas.filter(r=>r.compute_time_seconds).map(r=>({rama:r.name,horas:r.compute_time_seconds/3600,porcentaje:100*r.compute_time_seconds/inv.proyecto.compute_time_seconds})),horasOtrasRamas:(inv.proyecto.compute_time_seconds-sum(inv.ramas,'compute_time_seconds'))/3600,reconstruccion:groups,totalIntervalos:intervals.length,totalHorasReconstruidas:sum(intervals,'segundos')/3600,cloudflare:{horas:hourly.size,primera:[...hourly.keys()].sort()[0],ultima:[...hourly.keys()].sort().at(-1),requests:sum(cf.map(x=>x.sum),'requests'),subrequests:sum(cf.map(x=>x.sum),'subrequests'),horasUnaInvocacion:[...hourly.values()].filter(x=>x.requests===1).length},dias:Object.entries(daily).sort().map(([dia,v])=>({dia,...Object.fromEntries(Object.entries(v).map(([k,x])=>[k,round(x)]))})),cambios:changes,intervalos:intervals,noEmparejados:[...unpaired,...starts.values()]}
result.diasManagua=Object.entries(localDays).sort().map(([dia,v])=>({dia,...v}))
writeFileSync(dir+'analisis.json',JSON.stringify(result,null,2))
console.log(JSON.stringify({horasProyecto:result.horasCuProyecto,porRama:result.porRama,otras:result.horasOtrasRamas,totalIntervalos:intervals.length,intervalosCron:intervals.filter(x=>x.cronCoincide).length,horasVentanasCron:sum(intervals.filter(x=>x.cronCoincide),'segundos')/3600,horasReconstituidas:result.totalHorasReconstruidas,horasSoloUnaInvocacion:sum(intervals.filter(x=>x.cronCoincide&&x.requestsHora===1),'segundos')/3600},null,2))
