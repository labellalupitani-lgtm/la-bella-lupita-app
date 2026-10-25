import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const base='https://club-lupita.labellalupita.workers.dev';
const checks=[];
async function req(path,body,token){const r=await fetch(base+'/api'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return{status:r.status,data:await r.json()};}
assert.equal((await req('/health')).data.ok,true);checks.push('Salud pública');
assert.equal((await req('/yo')).status,401);checks.push('API privada rechaza acceso anónimo con JSON');
const code=await req('/auth/codigo',{telefono:'50587442005'});assert.equal(code.status,200);
const login=await req('/auth/entrar',{telefono:'50587442005',codigo:code.data.codigoDemo});assert.equal(login.status,200);
const yo=await req('/yo',undefined,login.data.token);assert.equal(yo.status,200);assert.equal(typeof yo.data.premiosPendientes,'number');assert.equal(typeof yo.data.puntaje.puntos,'number');checks.push('Acceso demo y puntos disponibles');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI'});
 await context.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),login.data.token);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByRole('button',{name:'Perfil',exact:true}).waitFor();
 await page.getByRole('button',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor();assert.deepEqual(errors,[]);checks.push('Interfaz pública carga y navega sin errores JavaScript');
}finally{await browser.close();}
writeFileSync('verificacion-2026-09-13/publicacion.json',JSON.stringify({url:base,fecha:new Date().toISOString(),checks},null,2));
console.log(checks.map(x=>'OK '+x).join('\n'));
