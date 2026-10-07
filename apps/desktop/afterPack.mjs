// pack 后对不同位数的系统迁移不同的文件（rootLib → 应用 Resources）
// electron-builder 26.17 校验钩子必须位于应用目录内，故此文件不能移到 tools/build
// 注意：electron-builder 以动态导入执行钩子，CJS 依赖（fs-extra/electron-builder）必须用默认导入
import fsExtra from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'url'
import builder from 'electron-builder'

const { copySync, ensureDirSync } = fsExtra
const { Arch } = builder
const here = path.dirname(fileURLToPath(import.meta.url))
const { resolve } = path

export default async context => {
  const LIB_OUTPUT_DIR = context.appOutDir
  const LIB_INPUT_DIR = resolve(here, 'rootLib', context.electronPlatformName, Arch[context.arch])
  const LIB_COMMON_INPUT_DIR = resolve(here, 'rootLib', 'common')
  ensureDirSync(LIB_COMMON_INPUT_DIR)
  ensureDirSync(LIB_INPUT_DIR)
  copySync(LIB_INPUT_DIR, LIB_OUTPUT_DIR)
  copySync(LIB_COMMON_INPUT_DIR, LIB_OUTPUT_DIR)
}
