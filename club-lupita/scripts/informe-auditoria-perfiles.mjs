import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const dir = resolve(import.meta.dirname, '../entregables/auditoria-perfiles-2026-10-07')
const read = file => JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
const edge = read('evidencia/perfiles-ui-ciclo2/resultados.json')
const firefox = read('evidencia/perfiles-firefox/resultados.json')
const api = read('evidencia/perfiles-api-ciclo1.json')
const borders = read('evidencia/bordes-ui-ciclo2/resultados.json')
const summary = {
  fechaLocal: '2026-10-07', zona: 'America/Managua', estado: 'Auditoría completada; correcciones pendientes',
  perfiles: ['Propietario', 'Encargado', 'Caja', 'Cocina', 'Cliente'],
  build: 'APROBADO', suitesApiExistentes: 10, suitesUiExistentes: 3,
  matrizPermisos: { lecturas: 132, escriturasProhibidas: 60, estado: 'APROBADO' },
  navegadores: [edge, firefox].map(x => ({ motor: x.motor, version: x.version, controles: x.results.length, aprobados: x.results.filter(r => r.estado === 'APROBADO').length, fallos: x.results.filter(r => r.estado === 'FALLO').length, pantallas: x.screens.length })),
  hallazgos: { total: 9, media: 6, baja: 3, api: api.fallan, interfaz: borders.fallos, corregidos: 0 },
  limites: 'Escrituras y autenticación con datos sintéticos locales. Lecturas públicas en producción. No aceptación autenticada en Neon/Cloudflare ni correo real.',
}
if (summary.hallazgos.api !== 4 || summary.hallazgos.interfaz !== 5 || summary.navegadores.some(n => n.aprobados !== 97)) throw new Error('Las cifras del informe no coinciden con la evidencia')
writeFileSync(resolve(dir, 'evidencia/resumen.json'), JSON.stringify(summary, null, 2))
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const inline = s => escape(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`)
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
function markdown(source) {
  const lines = source.split(/\r?\n/), parts = []; let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) { index++; continue }
    if (line.startsWith('```')) {
      const block = []; index++
      while (index < lines.length && !lines[index].startsWith('```')) block.push(lines[index++])
      index++; parts.push('<pre><code>' + escape(block.join('\n')) + '</code></pre>'); continue
    }
    const heading = /^(#{1,6}) (.+)$/.exec(line)
    if (heading) { const n = heading[1].length; parts.push(`<h${n} id="${slug(heading[2])}">${inline(heading[2])}</h${n}>`); index++; continue }
    if (line.startsWith('|')) {
      const rows = []; while (index < lines.length && lines[index].startsWith('|')) rows.push(lines[index++].split('|').slice(1, -1).map(s => s.trim()))
      parts.push('<div class="table-wrap" tabindex="0" aria-label="Tabla con desplazamiento horizontal"><table><thead><tr>' + rows[0].map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' + rows.slice(2).map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'); continue
    }
    if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d/.test(line), items = []
      while (index < lines.length && /^(- |\d+\. )/.test(lines[index])) items.push(lines[index++].replace(/^(- |\d+\. )/, ''))
      const tag = ordered ? 'ol' : 'ul'; parts.push(`<${tag}>` + items.map(s => '<li>' + inline(s) + '</li>').join('') + `</${tag}>`); continue
    }
    const para = [line]; index++
    while (index < lines.length && lines[index].trim() && !/^(#|\||```|- |\d+\. )/.test(lines[index])) para.push(lines[index++])
    parts.push('<p>' + inline(para.join(' ')) + '</p>')
  }
  return parts.join('\n')
}
const report = markdown(readFileSync(resolve(dir, 'INFORME.md'), 'utf8'))
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Auditoría de perfiles · La Bella Lupita</title><style>
:root{color-scheme:light;--paper:#fbf7ef;--ink:#43261e;--line:#d6c3b1;--muted:#705d51;--accent:#843c2d}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,sans-serif}header{border-bottom:1px solid var(--line);padding:24px max(24px,calc((100vw - 1150px)/2));display:flex;gap:26px;align-items:center}header img{width:145px;height:auto}header p{margin:0;color:var(--muted);font-size:14px}nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin-top:8px}a{color:var(--accent);text-underline-offset:3px}a:hover{color:var(--ink)}main{max-width:1150px;margin:auto;padding:36px 24px 70px}h1,h2,h3{font-family:Georgia,serif;line-height:1.2;font-weight:500;scroll-margin-top:24px}h1{font-size:clamp(32px,5vw,52px);max-width:900px;margin:10px 0 18px}h2{font-size:30px;margin:56px 0 20px;border-top:1px solid var(--line);padding-top:24px}h3{font-size:24px;margin:38px 0 12px;color:#642d20}p{max-width:95ch}li{margin:12px 0}code{font-size:.88em;background:#eee6da;padding:2px 5px;border-radius:3px;overflow-wrap:anywhere}pre{background:#eee6da;padding:22px;overflow:auto;border:1px solid var(--line)}pre code{padding:0}table{width:100%;border-collapse:collapse;min-width:620px}th,td{border-bottom:1px solid var(--line);padding:15px;text-align:left;vertical-align:top;font-size:14px}th{background:#ede1d2;font-weight:650}tbody tr:nth-child(even){background:#f5eee3}.table-wrap{max-width:100%;overflow:auto}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:32px 0 40px}.metric{border:1px solid var(--line);padding:20px;background:#fffaf2}.metric strong{font:38px/1 Georgia,serif;display:block;margin-bottom:12px}.metric span{font-size:14px;color:var(--muted)}.state{padding:14px 18px;background:#eee3d4;border-left:4px solid var(--accent);font-weight:600}.proof{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.proof figure{margin:0}.proof img{width:100%;max-height:370px;object-fit:contain;object-position:top;border:1px solid var(--line);background:#eee3d4}.proof figcaption{font-size:14px;margin-top:10px}.foot{font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:20px}.top{font-size:13px;letter-spacing:.12em;text-transform:uppercase}@media(max-width:650px){header{display:block;padding:20px}header img{width:115px;margin-bottom:12px}main{padding:24px 18px}.metrics{grid-template-columns:repeat(2,1fr);gap:10px}.metric{padding:15px}.proof{grid-template-columns:1fr}.proof img{max-height:520px}h2{font-size:27px}th,td{padding:12px}}@media print{nav{display:none}body{font-size:11pt}main{max-width:none;padding:0}.metrics{break-inside:avoid}h2,h3{break-after:avoid}.table-wrap{overflow:visible}a{color:inherit}a:after{content:none}}
</style></head><body><header><img src="../../public/brand/v3/logo-original.png" alt="La Bella Lupita"><div><p class="top">Diagnóstico de la aplicación</p><p>7 de octubre de 2026 · America/Managua</p><nav aria-label="Contenido del informe"><a href="#dictamen-por-perfil">Perfiles</a><a href="#hallazgos-confirmados-y-orden-de-correccion">Hallazgos</a><a href="#pruebas-y-evidencia">Pruebas</a><a href="PLAN.md">Plan</a><a href="INFORME.md">Informe Markdown</a></nav></div></header><main><div class="state">Auditoría completada · Nueve defectos confirmados pendientes de corrección</div><div class="metrics"><div class="metric"><strong>5</strong><span>Perfiles evaluados</span></div><div class="metric"><strong>194</strong><span>Controles UI aprobados entre Edge y Firefox</span></div><div class="metric"><strong>192</strong><span>Comprobaciones de permisos API aprobadas</span></div><div class="metric"><strong>9</strong><span>Hallazgos reproducidos en dos ciclos</span></div></div>${report}<h2 id="capturas-seleccionadas">Capturas seleccionadas</h2><div class="proof"><figure><a href="evidencia/perfiles-ui-ciclo2/propietario-Equipo-y-permisos-1440.png"><img loading="lazy" src="evidencia/perfiles-ui-ciclo2/propietario-Equipo-y-permisos-1440.png" alt="Panel de equipo del propietario con datos sintéticos"></a><figcaption>Propietario · Equipo y permisos</figcaption></figure><figure><a href="evidencia/bordes-ui-ciclo2/UI-01-centavos.png"><img loading="lazy" src="evidencia/bordes-ui-ciclo2/UI-01-centavos.png" alt="Confirmación de recarga que muestra 200 en vez de 200.49"></a><figcaption>Hallazgo UI-01 · Centavos omitidos</figcaption></figure><figure><a href="evidencia/bordes-ui-ciclo2/UI-02-error-cobro.png"><img loading="lazy" src="evidencia/bordes-ui-ciclo2/UI-02-error-cobro.png" alt="Diálogo de pedido sin mostrar el error de pago recibido"></a><figcaption>Hallazgo UI-02 · Rechazo sin aviso en el diálogo</figcaption></figure></div><p class="foot">Entorno de pruebas: Node 24.12.0 · Edge ${escape(edge.version)} · Firefox ${escape(firefox.version)} · PostgreSQL PGlite. Las capturas usan datos sintéticos. Fuentes de la aplicación conservadas.</p></main></body></html>`
writeFileSync(resolve(dir, 'INFORME.html'), html)
console.log('Informe HTML y resumen JSON generados y conciliados con la evidencia.')
