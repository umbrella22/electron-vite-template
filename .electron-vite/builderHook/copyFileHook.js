// pack后对不同位数的系统迁移不同的文件
const { copySync, ensureDirSync } = require('fs-extra');
const { resolve } = require('path');
const { Arch } = require('electron-builder');
// type ElectronPlatformName = "darwin" | "linux" | "win32" | "mas"
exports.copyFileHook = async context => {
  const LIB_OUTPUT_DIR = context.appOutDir;
  const LIB_INPUT_DIR = resolve(__dirname, "../../rootLib", context.electronPlatformName, Arch[context.arch]);
  const LIB_COMMON_INPUT_DIR = resolve(__dirname, "../../rootLib", "common");
  // 确保文件夹存在
  ensureDirSync(LIB_COMMON_INPUT_DIR);
  ensureDirSync(LIB_INPUT_DIR);
  // 移动文件文件
  copySync(LIB_INPUT_DIR, LIB_OUTPUT_DIR);
  copySync(LIB_COMMON_INPUT_DIR, LIB_OUTPUT_DIR);
};