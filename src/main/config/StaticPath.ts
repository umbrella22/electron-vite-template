// 这里定义了静态文件路径的位置
import { join } from 'path'
import { HotUpdateFolder } from '@config/index'
import { app } from 'electron'
const isDev = process.env.NODE_ENV === 'development';
class StaticPath {
  constructor() {
    const basePath = isDev ? join(__dirname, '..', '..', '..') : join(app.getAppPath(), '..', '..');
    console.log("basePath", basePath);
    this.__updateFolder = join(basePath, `${HotUpdateFolder}`)
    if (isDev) {
      this.__static = join(basePath, 'static');
      this.__lib = join(basePath, `rootLib`, `${process.platform}`, `${process.arch}`);
    } else {
      this.__static = join(__dirname, '..', 'renderer');
      this.__lib = basePath;
    }
  }
  /**
   * 静态文件路径 渲染进程目录下
   *
   * @type {string}
   * @memberof StaticPath
   */
  __static: string;
  /**
   * dll文件夹及其他os平台相关的文件路径
   *
   * @type {string}
   * @memberof StaticPath
   */
  __lib: string;
  /**
   * 与os无关的资源
   *
   * @type {string}
   * @memberof StaticPath
   */
  __common: string;
  /**
   * 增量更新文件夹
   *
   * @type {string}
   * @memberof StaticPath
   */
  __updateFolder: string;
}
const staticPath = new StaticPath();

/**
 * 获取真正的地址
 *
 * @param {string} devPath 开发环境路径
 * @param {string} proPath 生产环境路径
 * @return {string} 返回真正的路径
 */
const urlPrefix = isDev ? `http://localhost:${process.env.PORT}` : 'file://';
function getUrl(devPath: string, proPath: string): string {
  return urlPrefix + (isDev ? devPath : proPath);
}
export const winURL = getUrl("", join(__dirname, '..', 'renderer', 'index.html'));
export const loadingURL = getUrl("/loader.html",`${staticPath.__static}/loader.html`);
export const printURL = getUrl("#/Print", `${staticPath.__static}/loader.html#/Print`);

export const lib = staticPath.__lib
export const common = staticPath.__common
export const updateFolder = staticPath.__updateFolder

// process.env 修改
for (const key in staticPath) {
  process.env[key] = staticPath[key];
}

