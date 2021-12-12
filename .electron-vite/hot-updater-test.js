/**
 * power by biuuu
 */
const chalk = require("chalk");
const { join, resolve, basename } = require('path')
const fs = require('fs');
const crypto = require('crypto')
const minimatch = require('minimatch')
const packageFile = require('../package.json')
const { build } = require("../config/index")
const { platform } = require("os")
const { createGzip, createGunzip } = require('zlib');
const { ensureDir, emptyDir, copy, outputJSON, remove, stat, readFile } = require("fs-extra");
const platformName = platform().includes('win32') ? 'win' : platform().includes('darwin') ? 'mac' : 'linux'
const buildPath = join('.', 'build', `${platformName === 'mac' ? 'mac' : platformName + '-unpacked'}`)
function hash256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
function gzip(source, targetPath) { //source文件目录
  return new Promise((resolve) => {
    let gzip = createGzip(); // 转化流 可读可写
    let writeStream = fs.createWriteStream(targetPath);
    writeStream.on("close", resolve)
    fs.createReadStream(source).pipe(gzip).pipe(writeStream); //读=>压缩=>写新的
  })
}
// //解压
// function ungzip(source, targetPath) {
//   return new Promise((resolve) => {
//     let ungz = createGunzip();
//     let writeStream = fs.createWriteStream(targetPath);
//     writeStream.on("close", resolve)
//     fs.createReadStream(source).pipe(ungz).pipe(writeStream); //读=>压缩=>写新的
//   })
// }

const zipHash = async (data, path, targetPath) => {
  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      await zipHash(data.children[i], path + "/" + data.name, targetPath)
    }
  } else {
    await gzip(path + "/" + data.name, join(targetPath, data.hash + ".gz"));
  }
}
function reduceGlobPatterns(globs, param) {
  if (typeof globs === 'function') {
    return globs(param);
  } else if (!globs || !Array.isArray(globs) || globs.length === 0) {
    return false;
  } else {
    // combine globs into one single RegEx
    const regex = new RegExp(
      globs
        .reduce((acc, exclude) => {
          return acc + '|' + minimatch.makeRe(exclude).source;
        }, '')
        .substr(1),
    );
    return regex.test(param);
  }
}
// folders: { exclude: ['.*', 'node_modules', 'test_coverage'] },
// files: { exclude: ['*.js', '*.json'] },
function hashElement(dir_or_file_path, options = {}) {
  let file_or_dir = fs.statSync(dir_or_file_path);
  let base_name = basename(dir_or_file_path);
  if (file_or_dir.isFile()) {
    if (reduceGlobPatterns(options?.files?.exclude, base_name)) {
      return null;
    }
    let result = {};
    result.name = base_name;
    result.hash = hash256(fs.readFileSync(dir_or_file_path));
    return result;
  } else if (file_or_dir.isDirectory()) {
    if (reduceGlobPatterns(options?.folders?.exclude, base_name)) {
      return null;
    }
    let result = {};
    result.name = base_name;
    result.children = fs.readdirSync(dir_or_file_path).map(item => {
      return hashElement(join(dir_or_file_path, item), options);
    }).filter(item => item !== null);
    result.hash = hash256(result.children.map(item => item.hash).join(''));
    return result;
  }
  return null;
}
const start = async () => {
  console.log(chalk.green.bold(`\n  Start packing`))
  try {
    console.log(chalk.green.bold(`\n  Get hash`))
    let hash = hashElement(buildPath)
    const outputPath = join('.', 'build');
    let targetPath = join(outputPath, build.hotPublishGzipDirectory + packageFile.version);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath);
    }
    console.log(chalk.green.bold(`\n  Gzip files`))
    await zipHash(hash, outputPath, targetPath);
    console.log(chalk.green.bold(`\n  Generate update config`))
    await outputJSON(join(outputPath, `${build.hotPublishConfigName}.json`),
      {
        version: packageFile.version,
        targetPath: build.hotPublishGzipDirectory + packageFile.version,
        hash: hash
      }
    );
    console.log(
      "\n" + chalk.bgGreen.white(" DONE ") + "  " + "The resource file is packaged!\n"
    );
  } catch (error) {
    console.log(
      "\n" +
      chalk.bgRed.white(" ERROR ") +
      "  " +
      chalk.red(error.message || error) +
      "\n"
    );
    process.exit(1)
  }
}
start()