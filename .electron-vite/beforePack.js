const { byteCodeBeforePack } = require("./builderHook/byteCodeHook")
exports.default = async context => {
  await byteCodeBeforePack(context)
};