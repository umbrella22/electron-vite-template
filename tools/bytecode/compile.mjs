/**
 * 字节码编译入口（可选模式，默认构建不启用）。
 *
 * 用法（在 apps/desktop 下）：
 *   npm run build:bytecode
 *
 * 原理：V8 的 cachedData 与编译它的 V8 版本/flags 锁定，因此编译必须使用
 * 与打包运行时一致的 Electron。本脚本以普通 Node 运行时会把自己用
 * ELECTRON_RUN_AS_NODE=1 重新拉起在 Electron 内执行，保证 V8 一致
 * （devDependencies 里锁定的 electron 版本即 electron-builder 打包的版本）。
 *
 * 产物（写入 apps/desktop/dist/electron/main/）：
 *   - main.bin  ：XOR 混淆后的 V8 字节码
 *   - main.cjs  ：被替换为 loader 壳（tools/bytecode/loader.cjs 的拷贝）
 *
 * 诚实定位：这是防"随手解包看源码"的减速带，不是墙——cachedData 中字符串常量
 * 全部保留（通道名/URL 可被 strings 提取），XOR 的 key 就写在 loader 里。
 */
import { spawnSync } from 'child_process'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { join } from 'path'
import vm from 'vm'
import v8 from 'v8'
import Module from 'module'

const require = createRequire(import.meta.url)

if (!process.versions.electron) {
  // 普通 Node 环境：以 ELECTRON_RUN_AS_NODE 重启自身，对齐打包运行时的 V8
  const electronPath = require('electron')
  const selfPath = fileURLToPath(import.meta.url)
  const result = spawnSync(electronPath, [selfPath], {
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  })
  process.exit(result.status ?? 1)
}

// —— 以下运行在 Electron 的 Node 模式，V8 与打包后的运行时完全一致 ——

// 与 loader.cjs 保持一致
const XOR_KEY = 211

const mainDir = join(process.cwd(), 'dist', 'electron', 'main')
const mainJsPath = join(mainDir, 'main.cjs')

if (!existsSync(mainJsPath)) {
  console.error('未找到 dist/electron/main/main.cjs，请先执行构建（npm run build）')
  process.exit(1)
}

// 这两个 flags 与 loader.cjs 一致：--no-lazy 让函数全量编译进缓存，--no-flush-bytecode 防编译期间被 GC 冲掉
v8.setFlagsFromString('--no-lazy')
v8.setFlagsFromString('--no-flush-bytecode')

const source = readFileSync(mainJsPath, 'utf8')
// 必须以 CJS 包装器包裹后再编译：loader 的 runInThisContext 会拿到包装函数
// 并传入 (exports, require, module, __filename, __dirname) 执行
const script = new vm.Script(Module.wrap(source))
const bytecode = Buffer.from(script.createCachedData())

// XOR 混淆：防 strings 提取，不防人
for (let i = 0; i < bytecode.length; i++) {
  bytecode[i] ^= XOR_KEY
}

writeFileSync(join(mainDir, 'main.bin'), bytecode)
copyFileSync(join(fileURLToPath(new URL('.', import.meta.url)), 'loader.cjs'), mainJsPath)

console.log(`字节码编译完成：main.bin（${Math.round(bytecode.length / 1024)} KB）+ loader 壳已写入 ${mainDir}`)
