/**
 * 渲染层构建（vite-plus）
 * 由 apps/desktop 的 build:renderer 脚本调用；--target web 时输出 dist/web
 */
import { join } from 'path'
import { doneLog, errorLog } from './log'
import { getArgv } from './utils'

process.env.NODE_ENV = 'production'
const { target = 'client' } = getArgv()

try {
  const { build } = await import('vite-plus')
  await build({ configFile: join(import.meta.dirname, 'vite.config.mts') })
  doneLog(target === 'web' ? 'web 构建完成' : 'renderer 构建完成')
} catch (error) {
  errorLog('renderer 构建失败')
  throw error
}
