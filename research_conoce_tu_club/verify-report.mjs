import {chromium} from '../club-lupita/node_modules/playwright/index.mjs'
import {readFileSync,existsSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=import.meta.dirname,html=readFileSync(join(root,'Auditoria-Conoce-tu-club.html'),'utf8'),links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(x=>!/^https?:|^#/.test(x));
const missing=links.filter(x=>!existsSync(resolve(root,decodeURIComponent(x))));
const browser=await chromium.launch({channel:'msedge',headless:true}),result={missing,screens:[]};
try{for(const width of [1440,390]){const page=await browser.newPage({viewport:{width,height:960}});await page.goto(pathToFileURL(join(root,'Auditoria-Conoce-tu-club.html')).href);await page.screenshot({path:join(root,'evidencia/informe-'+width+'.png')});result.screens.push(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,h2:document.querySelectorAll('main h2').length})));await page.close()}}finally{await browser.close()};writeFileSync(join(root,'evidencia/informe-verificacion.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
