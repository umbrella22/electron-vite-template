/**
 * ESM 壳入口：仅负责引导字节码加载器，不包含任何业务逻辑。
 * 主进程业务代码位于 main.bin（V8 字节码），由 loader.cjs 解密并执行。
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

require('./loader.cjs')
