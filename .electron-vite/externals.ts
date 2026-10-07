import { builtinModules } from 'module'

/**
 * 主进程 external：产物为 CJS，external 依赖保留 require、运行时从 node_modules 解析。
 * 原生模块（.node）无法被打包，必须保持 external。
 */
export const mainExternals = [...builtinModules, 'electron', 'semver']

/**
 * 渲染进程 external：渲染层通过 nodeIntegration 注入的 require 访问 electron
 * 与 node 内置模块，external 使 rolldown 不打包桩代码、改为运行时解析。
 *
 * 注意：渲染层代码访问 electron / node 模块必须使用 require 而非 import——
 * 产物是 ESM chunk，import 的裸标识符由 Chromium 模块加载器解析，
 * 无法命中 electron 与 node 模块。
 */
export const rendererExternals = [...builtinModules, 'electron', /^node:/]
