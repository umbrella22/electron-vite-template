'use strict';
const { byteCodeAfterPack } = require("./builderHook/byteCodeHook")
const { copyFileHook } = require("./builderHook/copyFileHook")
exports.default = async context => {
  await byteCodeAfterPack(context);
  await copyFileHook(context);
};