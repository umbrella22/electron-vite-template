'use strict'
/**
 * 字节码 loader 壳（打包时替换 dist/electron/main/main.cjs 出现在产物中）。
 * 与 tools/bytecode/compile.mjs 配对使用，XOR_KEY 必须一致。
 * 约束：字节码方案要求主进程产物为单文件 CJS bundle（见 tools/bytecode/README.md）。
 */
const { readFileSync } = require('fs')
const v8 = require('v8')
const vm = require('vm')
const path = require('path')

// 与 compile.mjs 保持一致
const XOR_KEY = 211

// 这两个参数非常重要，保证字节码能够被运行（必须与编译侧一致）
v8.setFlagsFromString('--no-lazy')
v8.setFlagsFromString('--no-flush-bytecode')

const bytecode = readFileSync(path.resolve(__dirname, './main.bin')).map(
  (b) => b ^ XOR_KEY,
)

// 缓存头 8-12 字节是源码长度（小端，V8 的 SourceHash 即长度），据此构造等长占位源码
const len = bytecode.readUInt32LE(8)
// 12-16 字节用当前 flags 生成的空脚本缓存头归一化，规避 V8 flags/hash 差异
const header = new vm.Script(' ').createCachedData()
header.copy(bytecode, 12, 12, 16)

const script = new vm.Script(' '.repeat(len), {
  cachedData: bytecode,
  lineOffset: 0,
  displayErrors: true,
})

script.runInThisContext({
  lineOffset: 0,
  columnOffset: 0,
  displayErrors: true,
})(exports, require, module, __filename, __dirname)
