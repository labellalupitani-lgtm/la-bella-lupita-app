import assert from 'node:assert/strict';import {chromium} from 'playwright';import{writeFileSync}from'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'es-NI',reducedMotion:'reduce'});const out=[];
try{
 await page.goto('https://club-lupita.labellalupita.workers.dev/?demo');await page.getByRole('button',{name:'Explorar la demostración'}).click();await page.getByRole('button',{name:'Perfil',exact:true}).waitFor();
 for(const name of ['Inicio','Pedir','Tienda','Club','Perfil']){await page.getByRole('button',{name,exact:true}).click();await page.getByRole('main').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}out.push({name:'Pestañas de escritorio',status:'PASA'});
 await page.getByRole('button',{name:'Pedir',exact:true}).click();await page.getByRole('button',{name:'Agregar Espresso al pedido'}).click();await page.getByRole('button',{name:/Ver tu pedido/}).click();
 for(let i=1;i<21;i++)await page.getByRole('dialog').getByRole('button',{name:'Agregar otro Espresso',exact:true}).click();
 const response=page.waitForResponse(r=>r.url().endsWith('/api/cuenta/cobrar'));await page.getByRole('button',{name:'Pagar con la Cuenta de Casa',exact:true}).click();const r=await response;const body=await r.json();out.push({name:'21 unidades del mismo producto',status:r.status()===400?'LIMITACION':'REVISAR',http:r.status(),mensaje:body.error});
 await page.screenshot({path:'recorrido-2026-09-13/limite-cantidad.png',fullPage:true});
 await page.getByRole('button',{name:'Vaciar el pedido'}).click();
}finally{writeFileSync('recorrido-2026-09-13/bordes.json',JSON.stringify(out,null,2));await browser.close();}console.log(JSON.stringify(out));
