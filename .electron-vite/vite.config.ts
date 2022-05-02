import { join } from 'path'
import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import userConfig from '../config'

const IsWeb = process.env.BUILD_TARGET === 'web'

function resolve(dir: string) {
    return join(__dirname, '..', dir)
}
userConfig.build.env.is_web = IsWeb
userConfig.dev.env.is_web = IsWeb

const root = resolve('src/renderer')

export default defineConfig({
    mode: process.env.NODE_ENV,
    root,
    define: {
        'process.env': process.env.NODE_ENV === 'production' ? userConfig.build.env : userConfig.dev.env,
    },
    resolve: {
        alias: {
            '@renderer': root,
            '@store': join(root, '/store/modules'),
        }
    },
    base: './',
    build: {
        outDir: IsWeb ? resolve('dist/web') : resolve('dist/electron/renderer'),
        emptyOutDir: true,
        target: 'esnext',
        minify: 'esbuild'
    },
    server: {
    },
    plugins: [
        vueJsx(),
        vuePlugin({
            script: {
                refSugar: true
            }
        })
    ],
    optimizeDeps: {
    },
    publicDir: resolve('static')
})