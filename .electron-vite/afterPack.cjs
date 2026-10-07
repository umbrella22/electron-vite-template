'use strict';
const { byteCodeAfterPack } = require("./builderHook/byteCodeHook.cjs")
const { copyFileHook } = require("./builderHook/copyFileHook.cjs")
exports.default = async context => {
  await byteCodeAfterPack(context);
  await copyFileHook(context);
};