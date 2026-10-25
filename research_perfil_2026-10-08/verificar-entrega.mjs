import {readFileSync,writeFileSync,existsSync,statSync} from 'node:fs'
import {resolve,join,isAbsolute} from 'node:path'
import {createHash} from 'node:crypto'
const root=import.meta.dirname,report=join(root,'INFORME.md')
let md=readFileSync(report,'utf8')
md=md.replace(/\]\(([^)]+)\)/g,(all,target)=>{
 if(/^(https?:|<|#)/.test(target))return all
 const path=resolve(root,target).replaceAll('\\','/')
 return '](<'+path+'>)'
})
writeFileSync(report,md)
const missing=[]
for(const [,raw]of md.matchAll(/\]\(<([^>]+)>\)/g)){
 const path=raw.replace(/:\d+$/,'');if(!existsSync(path))missing.push(raw)
}
const ui=JSON.parse(readFileSync(join(root,'evidencia/ui/resultados.json')))
const a11y=['accesibilidad','accesibilidad-firefox','accesibilidad-webkit'].map(dir=>JSON.parse(readFileSync(join(root,'evidencia',dir,'resultados.json'))))
const transport=JSON.parse(readFileSync(join(root,'evidencia/transporte/resultados.json')))
const version=JSON.parse(readFileSync(join(root,'evidencia/version-verificada.json')))
const sourceRoot=resolve(root,'../club-lupita')
const changed=version.sources.filter(s=>createHash('sha256').update(readFileSync(join(sourceRoot,s.path))).digest('hex')!==s.sha256).map(s=>s.path)
const artifacts=[report,join(root,'audit-ui.mjs'),join(root,'reproduce_backend.mjs'),join(root,'reproduce_backend.json'),...ui.screens.map(s=>join(root,'evidencia/ui',s.id+'.png'))].map(path=>({path:path.replaceAll('\\','/'),bytes:statSync(path).size,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}))
const result={fecha:new Date().toISOString(),linksLocalesRotos:missing,fuentesProductoModificadas:changed,
 uiEscenarios:ui.results.length,erroresDelHarness:ui.results.filter(r=>r.estado==='ERROR_PRUEBA'),excepcionesUI:ui.errors,
 accesibilidad:a11y.map(a=>({motor:a.motor,version:a.version,checks:a.results.length,fallos:a.results.filter(r=>r.estado!=='APROBADO').length})),
 capturasEvaluadasAxe:ui.screens.length+a11y.reduce((s,a)=>s+a.capturas.length,0),
 violacionesAxe:ui.screens.reduce((s,c)=>s+c.violations.length,0)+a11y.reduce((s,a)=>s+a.capturas.reduce((n,c)=>n+c.violaciones.length,0),0),
 transporte:{total:transport.results.length,aprobados:transport.results.filter(r=>r.estado==='APROBADO').length},artifacts}
writeFileSync(join(root,'evidencia/verificacion-entrega.json'),JSON.stringify(result,null,2))
console.log(JSON.stringify({...result,artifacts:artifacts.length},null,2))
if(missing.length||changed.length)process.exitCode=1
