// Conserva el código publicado y su evidencia sin credenciales ni dependencias.
import assert from 'node:assert/strict'
import {cpSync,readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {createHash} from 'node:crypto'
const root=resolve(import.meta.dirname,'..'),release=join(root,'.test-output/release-perfiles'),out=join(root,'entregables/correcciones-perfiles-2026-10-07')
const dest=join(out,'version-publicada');mkdirSync(dest,{recursive:true})
const excluded=new Set(['020_acceso_equipo.sql','soporte-perfiles-equipo.mjs','perfiles-equipo-integracion.mjs','perfiles-api-corregidos.mjs'])
for(const name of ['src','public','dist','db','tests','scripts'])cpSync(join(release,name),join(dest,name),{recursive:true,filter:p=>!excluded.has(p.split(/[\\/]/).at(-1))})
for(const name of ['package.json','package-lock.json','wrangler.jsonc','worker-configuration.d.ts','vite.config.ts','postcss.config.js','tailwind.config.js','tsconfig.json','index.html','legado.html'])cpSync(join(release,name),join(dest,name))
cpSync(join(release,'entregables/correcciones-perfiles-2026-10-07/evidencia'),join(out,'evidencia/release'),{recursive:true})
cpSync(join(release,'entregables/correcciones-perfiles-2026-10-07/logs'),join(out,'logs/release'),{recursive:true})
cpSync(join(release,'entregables/correcciones-perfiles-2026-10-07/FRONTEND-RELEASE.md'),join(out,'FRONTEND-RELEASE.md'))
const manifest=JSON.parse(readFileSync(join(out,'evidencia/release-final-manifest.json'),'utf8'))
for(const f of manifest.archivos)assert.equal(createHash('sha256').update(readFileSync(join(dest,f.path))).digest('hex'),f.sha256,'Copia no idéntica: '+f.path)
cpSync(join(out,'evidencia/release-final-manifest.json'),join(dest,'MANIFIESTO.json'))
writeFileSync(join(dest,'LEEME.md'),`# Versión publicada de la auditoría de perfiles\n\nVersión Cloudflare: 144530db-b68b-4f0a-b3a3-b45ce04ca034, publicada al 100 %.\n\nEsta carpeta conserva exactamente las fuentes y los activos de MANIFIESTO.json. No contiene secretos ni node_modules. La carpeta principal de club-lupita contiene además un trabajo de autenticación distinto, pausado por el usuario; no equivale a lo publicado. No reemplazar ese trabajo con esta copia.\n\n## Reproducción local\n\nUsar Node 24.12.0 y npm 11.6.2 (registrar npm --version en el equipo receptor), ejecutar npm ci y npm run build. El postinstall aplica la mitigación validada de braces; no omitirlo. npm test ejecuta diez suites locales de negocio. Las suites de navegador necesitan Playwright y Edge/Firefox/WebKit disponibles. tests/correcciones-cliente.mjs, tests/correcciones-servidor.mjs, tests/perfiles-api-audit.mjs y tests/contencion-pagos.mjs cubren las correcciones. Las suites perfiles-ui-audit, perfiles-ui-bordes, correcciones-cliente-ui y accesibilidad-cliente-perfiles admiten TEST_OUTPUT_DIR; usar una carpeta nueva para conservar los informes históricos.\n\n## Publicación y datos\n\nNo se ejecutaron migraciones SQL en esta entrega. No ejecutar scripts históricos de despliegue o db/019 como parte de la reproducción. db/020 y las pruebas de la nueva autenticación fueron excluidas. Los secretos se administran en Cloudflare, fuera de esta carpeta. El despliegue auditado se hizo con wrangler deploy --keep-vars y verificación de versión remota previa.\n\nLa evidencia y el informe de cierre están en la carpeta superior.\n`)
console.log('Copia estable verificada contra '+manifest.archivos.length+' archivos del manifiesto, sin secretos ni dependencias.')
