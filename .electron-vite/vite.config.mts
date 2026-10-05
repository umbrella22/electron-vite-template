import { join } from 'path'
import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteIkarosTools from './plugin/vite-ikaros-tools'
import { getConfig } from './utils'

function resolve(dir: string) {
  return join(__dirname, '..', dir)
}
const config = getConfig()

const root = resolve('src/renderer')

export default defineConfig({
  mode: config && config.NODE_ENV,
  root,
  define: {
    __CONFIG__: config,
    __ISWEB__: Number(config && config.target),
  },
  resolve: {
    alias: {
      '@renderer': root,
      '@store': join(root, '/store/modules'),
      '@ipcManager': join(__dirname, '..', 'src', 'ipc'),
    },
  },

  base: './',
  build: {
    outDir:
      config && config.target
        ? resolve('dist/web')
        : resolve('dist/electron/renderer'),
    emptyOutDir: true,
    target: 'esnext',
    cssCodeSplit: false,
  },
  server: {},
  plugins: [vueJsx(), vuePlugin(), viteIkarosTools()],
  optimizeDeps: {},
})
