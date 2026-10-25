// Evidencia comparativa de la composición. Ambas URLs usan datos sintéticos locales.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const versiones = [ ['antes', process.env.BASELINE_URL || 'http://127.0.0.1:5192'], ['despues', process.env.PREVIEW_URL || 'http://127.0.0.1:5188'] ]
for (const [,url] of versiones) assert.equal(new URL(url).hostname, '127.0.0.1')
const dir = 'entregables/revision-inicio-2026-10-21/evidencia'
mkdirSync(dir, {recursive:true})
const browser = await chromium.launch({channel:'msedge',headless:true})
const medidas = []
try {
  for (const [version,url] of versiones) {
    const context = await browser.newContext({reducedMotion:'reduce'})
    const page = await context.newPage()
    for (const [width,height] of [[390,844],[320,568],[1440,1000]]) {
      await page.setViewportSize({width,height})
      await page.goto(url+'/__preview/entrar')
      await page.getByRole('heading',{name:'Tu cuenta de casa',exact:true}).waitFor()
      await page.waitForFunction(()=>!document.querySelector('.inicio-alertas')?.textContent.trim())
      await page.evaluate(async()=>{
        await document.fonts.ready
        for (const img of document.images) img.loading='eager'
        await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))
        window.scrollTo(0,0)
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
      })
      const medida = await page.evaluate(()=>{
        const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}}
        return {foto:rect('.inicio-invitacion img'),cuenta:rect('.casa-cuenta'),sellos:rect('.casa-fidelidad'),pagina:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth}
      })
      medidas.push({version,width,height,...medida})
      await page.screenshot({path:`${dir}/${version}-${width}-viewport.png`})
      if (width!==320) await page.screenshot({path:`${dir}/${version}-${width}-completa.png`,fullPage:true})
      assert.equal(medida.overflow,false,`${version} ${width}: desbordamiento`)
    }
    await context.close()
  }
  const antes = medidas.find(x=>x.version==='antes'&&x.width===390)
  const despues = medidas.find(x=>x.version==='despues'&&x.width===390)
  const adelanto = 1-despues.foto.y/antes.foto.y
  assert.ok(adelanto>=.3,`Foto debe llegar ≥30% antes: ${(adelanto*100).toFixed(1)}%`)
  writeFileSync(`${dir}/composicion.json`,JSON.stringify({ok:true,adelantoPorcentaje:Math.round(adelanto*1000)/10,medidas},null,2))
  console.log(JSON.stringify({ok:true,antesFotoY:antes.foto.y,despuesFotoY:despues.foto.y,adelantoPorcentaje:Math.round(adelanto*1000)/10}))
} finally {await browser.close()}
