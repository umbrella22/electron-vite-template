/**
 * Electron 侧构建：main + preload（rolldown，并行）
 * 由 apps/desktop 的 build:electron 脚本调用（vp run 流水线的一环）
 */
import { rolldown, type OutputOptions } from 'rolldown'
import rolldownOptions from '../configs/rolldown.config.ts'
import { doneLog, errorLog } from '../shared/log.ts'

process.env.NODE_ENV = 'production'

const build = async (type: 'main' | 'preload') => {
  const options = rolldownOptions('production', type)
  try {
    const bundle = await rolldown(options)
    await bundle.write(options.output as OutputOptions)
    doneLog(`${type} 构建完成`)
  } catch (error) {
    errorLog(`${type} 构建失败`)
    throw error
  }
}

await Promise.all([build('main'), build('preload')])
