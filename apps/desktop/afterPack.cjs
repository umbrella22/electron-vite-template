// pack 后对不同位数的系统迁移不同的文件（rootLib → 应用 Resources）
// 注意：electron-builder 26.17 校验钩子必须位于应用目录内，故此文件不能移到 tools/build
const { copySync, ensureDirSync } = require('fs-extra');
const { resolve } = require('path');
const { Arch } = require('electron-builder');
exports.default = async context => {
  const LIB_OUTPUT_DIR = context.appOutDir;
  const LIB_INPUT_DIR = resolve(__dirname, 'rootLib', context.electronPlatformName, Arch[context.arch]);
  const LIB_COMMON_INPUT_DIR = resolve(__dirname, 'rootLib', 'common');
  ensureDirSync(LIB_COMMON_INPUT_DIR);
  ensureDirSync(LIB_INPUT_DIR);
  copySync(LIB_INPUT_DIR, LIB_OUTPUT_DIR);
  copySync(LIB_COMMON_INPUT_DIR, LIB_OUTPUT_DIR);
};
