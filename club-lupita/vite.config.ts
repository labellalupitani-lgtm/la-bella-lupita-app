import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/**
 * Sirve `index.html` para cualquier ruta del socio.
 *
 * La app nueva es de una sola pagina con rutas de verdad —`/pedir`, `/perfil`—
 * y sin esto el servidor de desarrollo devolveria 404 en todas menos en la
 * raiz. En produccion lo resuelve `not_found_handling` del worker.
 */
function spaCasa() {
  return {
    name: 'spa-casa',
    configureServer(servidor: { middlewares: { use: (f: unknown) => void } }) {
      servidor.middlewares.use((req: { url?: string }, _res: unknown, next: () => void) => {
        const u = req.url ?? '/'
        const esArchivo = u.includes('.') || u.startsWith('/@') || u.startsWith('/api') || u.startsWith('/node_modules')
        if (!esArchivo) req.url = '/index.html'
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), spaCasa()],
  build: {
    manifest: true,
    target: 'es2022',
    // `index.html` ES la app nueva, la de «Casa Lupita»: es la que sirve el
    // worker en la raiz y la que recibe el 404 de la SPA.
    //
    // La entrada heredada redirige a /personal; no se distribuye su cliente.
    rollupOptions: {
      input: {
        principal: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
    // `motion` va en su propio chunk PERO sin <link rel="modulepreload">: el
    // preload anulaba la carga diferida de LazyMotion y metía 48 kB gzip antes
    // del primer píxel. Aislado y sin precargar, entra cuando hace falta.
    //
    // React NO se separa. Sacarlo a su propio chunk rompía el orden de
    // inicialización entre módulos y lanzaba «Cannot access 'x' before
    // initialization» en las rutas perezosas.
    modulePreload: false,
    // Sin `manualChunks`: agrupar todo `node_modules/motion` en un solo chunk
    // hacia que importar `m` (que es estatico) arrastrase tambien `domMax`,
    // y LazyMotion dejaba de diferir nada. Dejando que Rollup parta solo, el
    // paquete de features se queda en su propio chunk dinamico.
  },
  server: {
    port: 5178,
    // Durante la reconstruccion, la app nueva habla con la API que YA esta en
    // produccion, con la cuenta de demostracion. Es la unica manera de que
    // «100 % funcional» signifique algo: los saldos, los sellos y los cupos
    // que se ven en pantalla son los de la casa, no un archivo de ejemplo.
    // `wrangler dev` en 8787 sigue siendo la alternativa local.
    proxy: {
      '/api': {
        target: process.env.API_TARGET ?? 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
