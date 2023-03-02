
'use strict';
const path = require('path');
const { execSync } = require("child_process");
const { encryptionLevel } = require("../../package.json");
const { copySync, existsSync, removeSync, ensureDir } = require('fs-extra');
const isWindow = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const isMac = process.platform === 'darwin';
exports.byteCodeBeforePack = async (context) => {
  if (encryptionLevel === 0) return context
  if (encryptionLevel === 1 || encryptionLevel === 2) {
    const hook = context.packager.info._framework.prepareApplicationStageDirectory;
    context.packager.info._framework.prepareApplicationStageDirectory = (...args) => {
      const reslut = hook.apply(context.packager.info._framework, args);
      reslut.then(() => {
        const electron_compiler_path = path.resolve(__dirname, "../bytecode/electron-compiler.js");
        let resourcesPath;
        let targetResourcesPath;
        if (isMac) {
          resourcesPath = path.resolve(__dirname, "../bytecode/_temp/resources/default_app.asar")
          targetResourcesPath = path.resolve(context.appOutDir, "Electron.app/Contents/Resources/default_app.asar")
        } else {
          resourcesPath = path.resolve(__dirname, "../bytecode/_temp/resources")
          targetResourcesPath = path.resolve(context.appOutDir, "resources");
        }
        if (existsSync(targetResourcesPath)) {
          removeSync(targetResourcesPath)
        }
        copySync(resourcesPath, targetResourcesPath);
        const node_modules_path = path.resolve(__dirname, "../../node_modules/.bin")
        execSync("electron " + electron_compiler_path, {
          env: {
            ...process.env,
            ELECTRON_OVERRIDE_DIST_PATH: context.appOutDir,
            ...isWindow ? {
              path: process.env.path + ";" + node_modules_path,
            } : {
              PATH: process.env.PATH + ":" + node_modules_path
            }
          }
        })
        removeSync(targetResourcesPath)
      })
      return reslut;
    }
  }
}

exports.byteCodeAfterPack = async () => {
  if (encryptionLevel === 0) return
  // dist 还原
  if (encryptionLevel === 1 || encryptionLevel === 2) {
    const inputPath = path.resolve(__dirname, '../../dist/electron/main');
    const mainTempPath = path.resolve(__dirname, "../bytecode/_temp/main.js");
    const mainjsPath = path.resolve(__dirname, "../../dist/electron/main/main.js");
    removeSync(inputPath);
    ensureDir(inputPath);
    copySync(mainTempPath, mainjsPath)
  }
}