const { byteCodeBeforePack } = require("./builderHook/byteCodeHook.cjs")
exports.default = async context => {
  await byteCodeBeforePack(context)
};