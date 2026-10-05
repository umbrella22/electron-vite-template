const v8 = require('v8');
const vm = require('vm');
const m = require("module")

// 这两个参数非常重要，保证字节码能够被运行。
v8.setFlagsFromString('--no-lazy');
v8.setFlagsFromString('--no-flush-bytecode');

function encode(buf) {
  // 这里可以做一些混淆逻辑，比如异或。
  return buf.map(b => b ^ 211);
}

exports.compile = function compile(code) {
  const script = new vm.Script(m.wrap(code), {
    produceCachedData: true
  });
  const raw = script.createCachedData();
  return encode(raw);
};