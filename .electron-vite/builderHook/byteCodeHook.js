
'use strict';
const path = require('path');
const { execSync } = require("child_process");
const { encryptionLevel } = require("../../package.json");
const { copySync, existsSync, removeSync, ensureDir } = require('fs-extra');

exports.byteCodeBeforePack = async (context) => {
  if (encryptionLevel === 1 || encryptionLevel === 2) {
    const hook = context.packager.info._framework.prepareApplicationStageDirectory;
    context.packager.info._framework.prepareApplicationStageDirectory = (...args) => {
      const reslut = hook.apply(context.packager.info._framework, args);
      reslut.then(() => {
        const electron_compiler_path = path.resolve(__dirname, "./bytecode/electron-compiler.js");
        const resourcesPath = path.resolve(__dirname, "./bytecode/_temp/resources");
        const targetResourcesPath = path.resolve(context.appOutDir, "resources");
        if (existsSync(targetResourcesPath)) {
          removeSync(targetResourcesPath)
        }
        copySync(resourcesPath, targetResourcesPath);
        execSync("electron " + electron_compiler_path, {
          env: {
            ...process.env,
            ELECTRON_OVERRIDE_DIST_PATH: context.appOutDir
          }
        })
        removeSync(targetResourcesPath)
      })
      return reslut;
    }
  }
}

exports.byteCodeAfterPack = async () => {
  // dist 还原
  if (encryptionLevel === 1 || encryptionLevel === 2) {
    const inputPath = path.resolve(__dirname, '../../dist/electron/main');
    const mainTempPath = path.resolve(__dirname, "./_temp/main.js");
    const mainjsPath = path.resolve(__dirname, "../../dist/electron/main/main.js");
    removeSync(inputPath);
    ensureDir(inputPath);
    copySync(mainTempPath, mainjsPath)
  }
}