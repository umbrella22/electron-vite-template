import path from 'path'
import { defineConfig } from 'rolldown'
import { getConfig } from './utils'
import { mainExternals } from './externals'
const config = getConfig()

export default (env = 'production', type = 'main') => {
  return defineConfig({
    input:
      type === 'main'
        ? path.join(import.meta.dirname, '..', 'src', 'main', 'index.ts')
        : path.join(import.meta.dirname, '..', 'src', 'preload', 'index.ts'),
    platform: 'node',
    transform: {
      target: 'es2017',
      define: {
        'process.env.userConfig': config ? JSON.stringify(config) : '{}',
      },
    },
    resolve: {
      alias: {
        '@main': path.join(import.meta.dirname, '..', 'src', 'main'),
        '@config': path.join(import.meta.dirname, '..', 'config'),
        '@ipcManager': path.join(import.meta.dirname, '..', 'src', 'ipc'),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.json', '.node'],
    },
    output: {
      file: path.join(
        import.meta.dirname,
        '..',
        'dist',
        'electron',
        'main',
        `${type === 'main' ? 'main.cjs' : 'preload.cjs'}`,
      ),
      format: 'cjs',
      sourcemap: false,
      minify: env === 'production',
    },
    external: mainExternals,
  })
}
