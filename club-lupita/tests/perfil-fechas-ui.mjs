import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
import {tlsLocal} from './tienda-tls.mjs'
import {vistaAislada} from './soporte-ui.mjs'

// Reproduce F13 y el límite exacto del día comercial, sin datos de producción.
const t=await vistaAislada({tls:tlsLocal()})
const browser=await chromium.launch({channel:'msedge',headless:true})
const resultados=[],errores=[]
const operaciones=[
  {concepto:'F13 fecha original',creado:'2026-10-09T02:00:00Z',dia:8},
  {concepto:'F13 antes de medianoche',creado:'2026-10-09T05:59:59Z',dia:8},
  {concepto:'F13 desde medianoche',creado:'2026-10-09T06:00:00Z',dia:9},
]
try{
  for(const m of operaciones)await t.db.query('INSERT INTO asiento(socio_id,monto,tipo,concepto,creado) VALUES($1,100,\'recarga\',$2,$3)',[t.id,m.concepto,m.creado])
  for(const zona of ['Europe/Madrid','America/Managua','Pacific/Honolulu']){
    const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},timezoneId:zona})
    try{
      const token=await t.firmar(t.env.SESION_SECRETO,{tel:t.tel,rol:'socio',exp:Date.now()+3600000})
      await ctx.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),token)
      const page=await ctx.newPage();page.on('pageerror',e=>errores.push(e.message))
      await page.goto(t.url+'/perfil')
      const resumen=page.getByRole('region',{name:'Tu cuenta de casa'})
      const textos=[]
      for(const m of operaciones){
        const fila=resumen.getByRole('listitem').filter({has:page.getByText(m.concepto,{exact:true})})
        await fila.waitFor()
        const fecha=await fila.locator('.t-caption').innerText()
        assert.match(fecha,new RegExp('^'+m.dia+'\\s+(?:de\\s+)?oct\\.?$'),zona+' resumen '+m.concepto)
        textos.push({...m,resumen:fecha})
      }
      await page.getByRole('button',{name:'Ver toda mi actividad',exact:true}).click()
      const historial=page.getByRole('dialog',{name:'Tu actividad'})
      await historial.getByRole('button',{name:'Dinero',exact:true}).click()
      for(const m of textos){
        const fila=historial.getByRole('listitem').filter({has:page.getByText(m.concepto,{exact:true})})
        await fila.waitFor()
        m.actividad=await fila.locator('.t-caption').innerText()
        assert.match(m.actividad,new RegExp('^'+m.dia+'\\s+(?:de\\s+)?oct\\.?\\s+(?:de\\s+)?2026'),zona+' actividad '+m.concepto)
      }
      resultados.push({zona,operaciones:textos,correcto:true})
      console.log('PASA F13: resumen e historial conservan el día de Managua en '+zona)
    }finally{await ctx.close()}
  }
  assert.deepEqual(errores,[])
  writeFileSync('entregables/mejoras-perfil-2026-10-09/evidencias/fechas.json',JSON.stringify({fecha:new Date().toISOString(),motor:'Edge',resultados,errores},null,2))
}finally{await browser.close();await t.close()}
