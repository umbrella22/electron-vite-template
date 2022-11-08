// 这个文件可以直接用 electron 命令运行。

const fs = require('fs');
const path = require('path');
const { BrowserWindow, app } = require('electron');
const { execSync } = require("child_process");
const { compile } = require('./bytecode');
const { encryptionLevel } = require("../../package.json");
const isWindow = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);

function isMusl() {
  // For Node 10
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      return readFileSync('/usr/bin/ldd', 'utf8').includes('musl');
    } catch (e) {
      return true;
    }
  } else {
    const { glibcVersionRuntime } = process.report.getReport().header;
    return !glibcVersionRuntime;
  }
}
function getRustTarget() {
  const { platform, arch } = process;
  switch (platform) {
    case 'android':
      switch (arch) {
        case 'arm64':
          return "aarch64-linux-android";
        case 'arm':
          return "armv7-linux-androideabi";
        default:
          throw new Error(`Unsupported architecture on Android ${arch}`);
      }
    case 'win32':
      switch (arch) {
        case 'x64':
          return "x86_64-pc-windows-msvc";
        case 'ia32':
          return "i686-pc-windows-msvc";
        case 'arm64':
          return "aarch64-pc-windows-msvc";
        default:
          throw new Error(`Unsupported architecture on Windows: ${arch}`);
      }
      break
    case 'darwin':
      switch (arch) {
        case 'x64':
          return "x86_64-apple-darwin";
        case 'arm64':
          return "aarch64-apple-darwin";
          break
        default:
          throw new Error(`Unsupported architecture on macOS: ${arch}`);
      }
    case 'freebsd':
      if (arch !== 'x64') {
        throw new Error(`Unsupported architecture on FreeBSD: ${arch}`);
      }
      return "x86_64-unknown-freebsd";
    case 'linux':
      switch (arch) {
        case 'x64':
          if (isMusl()) {
            return "x86_64-unknown-linux-musl";
          } else {
            return "x86_64-unknown-linux-gnu";
          }
        case 'arm64':
          if (isMusl()) {
            return "aarch64-unknown-linux-musl";
          } else {
            return "aarch64-unknown-linux-gnu";
          }
        case 'arm':
          return "armv7-unknown-linux-gnueabihf";
        default:
          throw new Error(`Unsupported architecture on Linux: ${arch}`);
      }
      break
    default:
      throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
  }
}

function checkOrDownNapiCli(dir) {
  const binPath = path.resolve(dir, "./node_modules/.bin/napi");
  if (!fs.existsSync(binPath)) {
    execSync("npm run install-napi", {
      cwd: dir
    });
  }
}


async function main() {
  if (encryptionLevel === 1 || encryptionLevel === 2) {
    // 输入目录，用于存放待编译的 js bundle
    const inputPath = path.resolve(__dirname, '../../dist/electron/main');
    const mainTempPath = path.resolve(__dirname, "./_temp/main.js");
    const mainBinPath = path.resolve(__dirname, '../../dist/electron/main/main.bin');
    // 输出目录，用于存放编译产物，也就是字节码，文件名对应关系：main.js -> main.bin
    // 清理并重新创建输出目录

    // 读取原始 js 并生成字节码
    const mainJs = path.resolve(inputPath, 'main.js');

    const code = fs.readFileSync(mainJs);

    // 移除缓存
    if (fs.existsSync(mainTempPath)) {
      fs.rmSync(mainTempPath);
    }
    if (!fs.existsSync(path.dirname(mainTempPath))) {
      fs.mkdirSync()
    }

    // 移除原有的main.js
    fs.renameSync(mainJs, mainTempPath);


    fs.writeFileSync(mainBinPath, compile(code));
    const node_modules_path = path.resolve(__dirname, "../../node_modules/.bin")

    if (encryptionLevel === 2) {
      try {
        const c_env = {
          ...process.env,
          ...isWindow ? {
            path: process.env.path + ";" + node_modules_path,
          } : {
            PATH: process.env.PATH + ":" + node_modules_path
          }
        };
        const c_cwd = path.resolve(__dirname, "./encryption");
        // 检查编译
        execSync("cargo check", {
          cwd: c_cwd,
          env: c_env
        });

        // check or napi cli 
        checkOrDownNapiCli(c_cwd);
        // 编译.node
        execSync("npm run build -- --target " + getRustTarget(), {
          cwd: c_cwd,
          env: c_env
        });
        // 删除main.bin
        if (fs.existsSync(mainBinPath)) {
          fs.rmSync(mainBinPath);
        }
        // 移动.node文件

        const mainNodePath = path.resolve(__dirname, '../../dist/electron/main/index.node')
        const rustMainNodePath = path.resolve(__dirname, "./encryption/index.node");

        if (fs.existsSync(mainNodePath)) {
          fs.rmSync(mainNodePath);
        }

        fs.copyFileSync(rustMainNodePath, mainNodePath);

        const vmNodePath = path.resolve(__dirname, "../bytecode/vm_node.js");

        fs.copyFileSync(vmNodePath, mainJs);


      } catch (error) {
        console.error(error);
      }
    } else {
      const vmPath = path.resolve(__dirname, "../bytecode/vm.js");

      fs.copyFileSync(vmPath, mainJs);
    }
  }

  app.quit();

  // 启动一个浏览器窗口用于渲染进程字节码的编译
  // await launchRenderer();
}

async function launchRenderer() {
  await app.whenReady();

  // const win = new BrowserWindow({
  //   webPreferences: {
  //     // 我们通过 preload 在 renderer 执行 js，这样就不需要一个 html 文件了。
  //     preload: path.resolve(__dirname, './electron-renderer.js'),
  //     enableRemoteModule: true,
  //     nodeIntegration: true,
  //   }
  // });
  // win.loadURL('about:blank');
  // win.show();
}

main();