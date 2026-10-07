const { copyFileHook } = require("./copyFileHook.cjs")
exports.default = async context => {
  await copyFileHook(context);
};
