import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';
const out='recorrido-2026-09-13';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua'});
 await page.goto('https://club-lupita.labellalupita.workers.dev/?demo');await page.getByRole('button',{name:'Explorar la demostración'}).click();await page.getByRole('button',{name:'Perfil',exact:true}).waitFor();
 const result={};
 for(const path of ['/','/pedir','/tienda','/club','/reservar','/perfil','/kit']){
  await page.goto('https://club-lupita.labellalupita.workers.dev'+path);await page.getByRole('heading').first().waitFor();
  result[path]=await page.evaluate(()=>({buttons:[...document.querySelectorAll('button')].map(b=>({label:b.getAttribute('aria-label')||b.textContent.trim(),disabled:b.disabled})),inputs:[...document.querySelectorAll('input')].map(e=>({placeholder:e.placeholder,type:e.type})),text:document.body.innerText}));
  console.log(path,JSON.stringify(result[path].buttons));
 }
 writeFileSync(out+'/inventario.json',JSON.stringify(result,null,2));
}finally{await browser.close();}
