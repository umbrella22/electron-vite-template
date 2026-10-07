import path from 'path'
import { defineConfig } from 'rolldown'
import { getConfig } from '../shared/env.ts'
import { mainExternals } from './externals.ts'
const config = getConfig()

// 应用包根目录（tools/build 的上两级）
const appRoot = path.join(import.meta.dirname, '..', '..', '..', 'apps', 'desktop')

export default (env = 'production', type = 'main') => {
  return defineConfig({
    input:
      type === 'main'
        ? path.join(appRoot, 'src', 'main', 'index.ts')
        : path.join(appRoot, 'src', 'preload', 'index.ts'),
    platform: 'node',
    transform: {
      target: 'es2017',
      define: {
        'process.env.userConfig': config ? JSON.stringify(config) : '{}',
      },
    },
    resolve: {
      alias: {
        '@main': path.join(appRoot, 'src', 'main'),
        '@config': path.join(appRoot, 'config'),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.json', '.node'],
    },
    output: {
      file: path.join(
        appRoot,
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
