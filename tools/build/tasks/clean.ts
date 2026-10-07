/**
 * 清理构建产物
 */
// del@8 的传递依赖 unicorn-magic 为 ESM-only，tsx 的 CJS 模式下静态导入无法解析
const { deleteAsync } = await import('del')
import { doneLog } from '../shared/log.ts'

await deleteAsync([
  'apps/desktop/dist/electron/main/*',
  'apps/desktop/dist/electron/renderer/*',
  'apps/desktop/dist/web/*',
  'apps/desktop/build/*',
  '!apps/desktop/build/icons',
  '!apps/desktop/build/lib',
  '!apps/desktop/build/lib/electron-build.*',
  '!apps/desktop/build/icons/icon.*',
])
doneLog(`清理完成`)
