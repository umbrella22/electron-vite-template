const { join } = require("path")
const vuePlugin = require("@vitejs/plugin-vue")
const { defineConfig } = require("vite")
const userConfig = require("../config")
const IsWeb = process.env.BUILD_TARGET === 'web'

function resolve(dir) {
    return join(__dirname, '..', dir)
}

const root = resolve('src/renderer')

const config = defineConfig({
    mode: process.env.NODE_ENV,
    root,
    define: {
        'process.env': process.env.NODE_ENV === 'production' ? userConfig.build.env : userConfig.dev.env,
        'process.env.IS_WEB': IsWeb,
        'process.env.PORT': userConfig.dev.port
    },
    resolve: {
        alias: {
            '@renderer': root,
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

module.exports = config