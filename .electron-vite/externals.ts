import { builtinModules } from 'module'

/**
 * 主进程与 preload 产物均为 CJS，external 依赖保留 require、运行时从 node_modules 解析。
 * 原生模块（.node）无法被打包，必须保持 external。
 *
 * 渲染进程已切换到 contextIsolation + sandbox 安全模型，没有 Node 访问能力，
 * 不再需要 external 桩；若渲染层代码误引入 electron/node 模块会直接构建报错，
 * 这是刻意的安全哨兵。
 */
export const mainExternals = [...builtinModules, 'electron', 'semver']
