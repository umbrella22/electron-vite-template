// pack后对不同位数的系统迁移不同的文件
'use strict';
const { copySync } = require('fs-extra');
const { join } = require('path');
const { Arch } = require('electron-builder');
// type ElectronPlatformName = "darwin" | "linux" | "win32" | "mas"
exports.default = async context => {
  const LIB_OUTPUT_DIR = context.appOutDir;
  const LIB_INPUT_DIR = join("rootLib", context.electronPlatformName, Arch[context.arch]);
  const LIB_COMMON_INPUT_DIR = join("rootLib", "common");
  // 移动文件文件
  copySync(LIB_INPUT_DIR, LIB_OUTPUT_DIR);
  copySync(LIB_COMMON_INPUT_DIR, LIB_OUTPUT_DIR);
};