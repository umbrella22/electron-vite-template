import { createHash } from 'crypto';
import { makeRe } from 'minimatch';
import * as fs from 'fs';
import { basename, join, dirname } from 'path';
import { createGunzip } from 'zlib';
import axios from 'axios';
import { app, BrowserWindow } from 'electron';
const request = axios.create({ adapter: require("axios/lib/adapters/http") });
import { hotPublishConfig } from '../config/hotPublish'
import { gt } from 'semver'
import { version } from '../../../package.json'
import { spawn } from 'child_process';

type HashedFolderAndFileType = HashedFile | HashedFolder
class HashedFile {
  name: string;
  hash: string;
}
type HashedFolderAndFileTypeObject = {
  [index: string]: HashedFolderAndFileType
}
class HashedFolder extends HashedFile {
  children?: HashedFolderAndFileType[];
  childrenObject?: HashedFolderAndFileTypeObject;
}
/**
 * 用Object缓存文件信息，减少循环次数
 *
 * @param {HashedFolder} data
 */
function handleHashedFolderChildrenToObject(data: HashedFolderAndFileType) {
  if (data && (data as HashedFolder).children) {
    (data as HashedFolder).childrenObject = (data as HashedFolder).children.reduce((prev, next) => {
      if ((next as HashedFolder).children) {
        handleHashedFolderChildrenToObject(next);
      }
      prev[next.name] = next
      return prev
    }, {} as HashedFolderAndFileTypeObject)
  }
}

class diffVersionHashResultItem {
  file_path: string;
  hash: string;
}
class diffVersionHashResult {
  constructor() {
    this.added = [];
    this.changed = [];
  }
  // 新增
  added: diffVersionHashResultItem[];
  // 修改
  changed: diffVersionHashResultItem[];
}
/**
 *
 *  diff两个版本之间的文件差异，查看新增和修改的文件
 * @param {HashedFolder} oldVersion // 储存本地的文件信息 由hashElement获取并handleHashedFolderChildrenToObject转化过的
 * @param {HashedFolder} newVersion // 线上的文件信息 
 * @param {*} [result=[]] 结果diff文件差异
 * @param {""} path 文件路径
 * @returns
 */
function diffVersionHash(oldVersion: HashedFolder, newVersion: HashedFolder, result = new diffVersionHashResult(), path = ".") {
  // 不管是文件夹还是文件 hash一样就返回
  if (newVersion.hash === oldVersion.hash) {
    return result
  } else if (newVersion.children) {
    newVersion.children.forEach(item => {
      // 如果老版本含有相同
      if (oldVersion.childrenObject && oldVersion.childrenObject[item.name]) {
        diffVersionHash(oldVersion.childrenObject[item.name], item, result, path + "/" + item.name)
      } else {
        pushdiffVersionHashResult(item, path + "/" + item.name, result.added)
      }
    })
  } else {
    result.changed.push({
      file_path: path,
      hash: newVersion.hash
    })
  }
  return result;
}
/**
 * 为新增的文件和文件夹循环添加到result.added数组中
 *
 * @param {HashedFolderAndFileType} item
 * @param {string} path
 * @param {diffVersionHashResultItem[]} resultAdd
 */
function pushdiffVersionHashResult(item: HashedFolderAndFileType, path: string, resultAdd: diffVersionHashResultItem[]) {
  // 作为文件夹
  if ((item as HashedFolder).children) {
    (item as HashedFolder).children.forEach(child => {
      pushdiffVersionHashResult(child, path + "/" + child.name, resultAdd)
    })
  } else {
    resultAdd.push({
      file_path: path,
      hash: item.hash
    })
  }
}
/**
 * 过滤文件夹 正则匹配
 *
 * @param {(string[] | undefined | ((str: string) => boolean))} globs
 * @param {string} param
 * @returns {boolean}
 */
function reduceGlobPatterns(globs: string[] | undefined | ((str: string) => boolean), param: string): boolean {
  if (typeof globs === 'function') {
    return globs(param);
  } else if (!globs || !Array.isArray(globs) || globs.length === 0) {
    return false;
  } else {
    // combine globs into one single RegEx
    const regex = new RegExp(
      globs
        .reduce((acc, exclude) => {
          return acc + '|' + makeRe(exclude).source;
        }, '')
        .substr(1),
    );
    return regex.test(param);
  }
}
/**
 * hashElements生成时过滤的文件夹和文件
 *
 * @interface hashElementOptions
 */
interface hashElementOptions {
  folders?: {
    exclude?: string[]
  },
  files?: {
    exclude?: string[]
  }
}
/**
 * 生成hash 256
 *
 * @param {(Buffer | string)} data
 * @returns
 */
function hash256(data: Buffer | string) {
  return createHash('sha256').update(data).digest('hex');
}
/**
 * 根据文件路径生成hash
 *
 * @param {string} dir_or_file_path
 * @param {hashElementOptions} options
 * @returns {HashedFolderAndFileType}
 */
function hashElement(dir_or_file_path: string, options: hashElementOptions = {}): HashedFolderAndFileType {
  let file_or_dir = fs.statSync(dir_or_file_path);
  let base_name = basename(dir_or_file_path);
  if (file_or_dir.isFile()) {
    if (reduceGlobPatterns(options?.files?.exclude, base_name)) {
      return null;
    }
    let result = new HashedFile();
    result.name = base_name;
    result.hash = hash256(fs.readFileSync(dir_or_file_path));
    return result;
  } else if (file_or_dir.isDirectory()) {
    if (reduceGlobPatterns(options?.folders?.exclude, base_name)) {
      return null;
    }
    let result = new HashedFolder();
    result.name = base_name;
    result.children = fs.readdirSync(dir_or_file_path).map(item => {
      return hashElement(join(dir_or_file_path, item), options);
    }).filter(item => item !== null);
    result.hash = hash256(result.children.map(item => item.hash).join(''));
    return result;
  }
  return null;
}
// const packageJsonPath = require('./build/update-config.json');

const updateInfo = {
  status: 'init',
  message: ''
}

/**
 * 获取文件夹的hash及对比
 *
 * @param {string} path // win-unpacked文件夹路径
 */
export async function updater(windows?: BrowserWindow) {
  const dirDirectory = dirname(app.getPath('exe'))
  const tempDirectory = join(dirDirectory, hotPublishConfig.tempDirectory);
  // const tempDirectory = join(process.cwd(), 'build', 'win-unpacked', hotPublishConfig.tempDirectory);
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
  }
  try {
    const res = await request({ url: `${hotPublishConfig.url}/${hotPublishConfig.configName}.json?time=${new Date().getTime()}`, })
    if (gt(res.data.version, version)) {
      // await emptyDir(updatePath)
      // const filePath = join(updatePath, res.data.name)
      updateInfo.status = 'downloading'
      // 通过option 配置文件排除文件 文件夹 或指定后缀
      // folders: { exclude: ['.*', 'node_modules', 'test_coverage'] },
      // files: { exclude: ['*.js', '*.json'] },
      const options = {
        files: {},
      };
      let hash = hashElement(dirDirectory, options);
      handleHashedFolderChildrenToObject(hash)
      let diff_result = diffVersionHash(hash, res.data.hash as HashedFolder);
      // 写入更新配置文件
      fs.writeFileSync(join(tempDirectory, hotPublishConfig.configName + '.json'), JSON.stringify(diff_result, null, 2))
      // 下载
      console.log(diff_result)
      if (windows) windows.webContents.send('hot-update-status', updateInfo);
      await Promise.all(diff_result.changed.map(item => {
        return downAndungzip(item.hash, join(tempDirectory, item.hash), res.data.version)
      }))
      await Promise.all(diff_result.added.map(item => {
        return downAndungzip(item.hash, join(tempDirectory, item.hash), res.data.version)
      }))
      console.log('complete');
      // 下载完成 交给rust端处理
      updateInfo.status = 'finished'
      if (windows) windows.webContents.send('hot-update-status', updateInfo);
      spawn("updater", {
        detached: true,
        env: {
          exe_path: app.getPath("exe"),
          update_temp_path: tempDirectory,
          update_config_file_name: hotPublishConfig.configName + ".json"
        },
        stdio: 'ignore'
      })
    }
  } catch (error) {
    console.log(error);
    updateInfo.status = 'failed'
    updateInfo.message = error
    if (windows) windows.webContents.send('hot-update-status', updateInfo)
  }
}

/**
 * 不考虑异常情况 读写异常
 *
 * @param {string} source
 * @param {string} targetPath
 * @returns
 */
function downAndungzip(source: string, targetPath: string, version: string): Promise<boolean> {
  const sourceUrl = `${hotPublishConfig.url}/${hotPublishConfig.gzipDirectory + version}/${source}.gz?time=${new Date().getTime()}`;
  return new Promise((resolve, reject) => {
    // 防止多次下载
    if (fs.existsSync(targetPath) && (hash256(fs.readFileSync(targetPath)) === source)) {
      resolve(true);
    } else {
      const hash = createHash('sha256');
      let ungz = createGunzip();
      let writeStream = fs.createWriteStream(targetPath);
      request({
        method: 'get',
        url: sourceUrl,
        responseType: 'stream',
      }).then(response => {
        response.data.pipe(ungz);
      }, err => {
        reject(false);
        return;
      })
      ungz.on("error", () => {
        ungz.close();
        writeStream.close();
        hash.destroy();
        reject(false);
        return;
      })
      ungz.on('data', (chunk) => {
        hash.write(chunk);
        writeStream.write(chunk);
      })
      ungz.on("end", () => {
        if (hash.digest('hex') !== source) {
          hash.destroy();
          reject(false);
        } else {
          resolve(true);
        }
      });
    }
  })
}