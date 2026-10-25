import { chromium } from '../club-lupita/node_modules/playwright/index.mjs'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join, resolve } from 'node:path'
import assert from 'node:assert/strict'
const dir=import.meta.dirname,html=readFileSync(join(dir,'auditoria-mi-club.html'),'utf8')
const missing=[]
for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){if(!m[1].startsWith('http')&&!existsSync(resolve(dir,m[1])))missing.push(m[1])}
assert.deepEqual(missing,[])
const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[]
p.on('pageerror',e=>errors.push(e.message))
await p.goto(pathToFileURL(join(dir,'auditoria-mi-club.html')).href)
await p.getByRole('heading',{level:1}).waitFor();assert.equal(await p.locator('.finding').count(),28)
await p.locator('#priority').selectOption('P1');assert.equal(await p.locator('.finding:visible').count(),7)
await p.locator('#priority').selectOption('all');await p.locator('#search').fill('foco');assert((await p.locator('.finding:visible').count())>0)
await p.locator('#search').fill('');await p.getByRole('button',{name:'Abrir todos los detalles'}).click();assert.equal(await p.locator('details[open]').count(),28)
await p.getByRole('button',{name:'Cerrar los detalles'}).click()
await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:join(dir,'informe-portada.png')})
const geometry=[]
for(const width of [1440,390]){await p.setViewportSize({width,height:1000});geometry.push(await p.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth})));assert(geometry.at(-1).scrollWidth<=width+1)}
await p.setViewportSize({width:1440,height:1000})
const broken=await p.locator('img').evaluateAll(es=>es.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src));assert.deepEqual(broken,[]);assert.deepEqual(errors,[])
writeFileSync(join(dir,'verificacion-informe.json'),JSON.stringify({linksLocalesValidos:true,filters:true,findings:28,p1:7,details:28,geometry,broken,errors},null,2))
console.log('Informe verificado: 28 hallazgos, filtros, detalles, enlaces, imágenes y reflujo 390/1440.');await b.close()

