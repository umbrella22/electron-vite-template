'use strict';
const { byteCodeBeforePack } = require("./builderHook/byteCodeHook")
const { copyFileHook } = require("./builderHook/copyFileHook")
exports.default = async context => {
  await byteCodeBeforePack(context);
  await copyFileHook(context);
};