const { readFileSync } = require('fs');
const v8 = require('v8');
const vm = require('vm');
const path = require("path")

// 这两个参数非常重要，保证字节码能够被运行。
v8.setFlagsFromString('--no-lazy');
v8.setFlagsFromString('--no-flush-bytecode');

function decode(buf) {
  // 这里可以做一些混淆逻辑，比如异或。
  return buf.map(b => b ^ 211);
}
const cacheDate = decode(readFileSync(path.resolve(__dirname, "./main.bin")))

let len = 0;
for (let i = 8; i < 12; i++) {
  len += cacheDate[i] * 256 ** (i - 8)
}
const temp = new vm.Script(" ").createCachedData();
for (let i = 12; i < 16; i++) {
  cacheDate[i] = temp[i]
}

const script = new vm.Script(" ".repeat(len),
  {
    cachedData: cacheDate, // 这个就是字节码
    lineOffset: 0,
    displayErrors: true
  }
)

script.runInThisContext({
  lineOffset: 0,
  columnOffset: 0,
  displayErrors: true
})(exports, require, module, __filename, __dirname)

