// 这里定义了静态文件路径的位置
import { join } from 'path'
import { HotUpdateFolder } from './const'
import { app } from 'electron'
import { URL } from 'url'
const isDev = process.env.NODE_ENV === 'development'
class StaticPath {
  constructor() {
    const basePath = isDev
      ? join(__dirname, '..', '..', '..')
      : join(app.getAppPath(), '..', '..')
    this.__updateFolder = join(basePath, `${HotUpdateFolder}`)
    if (isDev) {
      this.__static = join(basePath, 'src', 'renderer', 'public')
      this.__lib = join(
        basePath,
        `rootLib`,
        `${process.platform}`,
        `${process.arch}`,
      )
      this.__common = join(basePath, 'rootLib', 'common')
    } else {
      this.__static = join(__dirname, '..', 'renderer')
      this.__lib = basePath
      this.__common = basePath
    }
  }
  /**
   * 静态文件路径 渲染进程目录下
   *
   * @type {string}
   * @memberof StaticPath
   */
  __static: string
  /**
   * dll文件夹及其他os平台相关的文件路径
   *
   * @type {string}
   * @memberof StaticPath
   */
  __lib: string
  /**
   * 与os无关的资源
   *
   * @type {string}
   * @memberof StaticPath
   */
  __common: string
  /**
   * 增量更新文件夹
   *
   * @type {string}
   * @memberof StaticPath
   */
  __updateFolder: string
}
const staticPath = new StaticPath()
/**
 * 获取真正的地址
 *
 * @param {string} devPath 开发环境路径
 * @param {string} proPath 生产环境路径
 * @param {string} [hash=""] hash值
 * @param {string} [search=""] search值
 * @return {*}  {string} 地址
 */
function getUrl(
  devPath: string,
  proPath: string,
  hash: string = '',
  search: string = '',
): string {
  const url = isDev
    ? new URL(`http://localhost:${process.env.PORT}`)
    : new URL('file://')
  url.pathname = isDev ? devPath : proPath
  url.hash = hash
  url.search = search
  return url.href
}
export const winURL = getUrl(
  '',
  join(__dirname, '..', 'renderer', 'index.html'),
)
export const loadingURL = getUrl(
  '/loader.html',
  `${staticPath.__static}/loader.html`,
)
export const preloadURL = getUrl(
  '/preload.html',
  `${staticPath.__static}/preload.html`,
)
export const printURL = getUrl(
  '',
  join(__dirname, '..', 'renderer', 'index.html'),
  '#/Print',
)
export const browserDemoURL = getUrl(
  '',
  join(__dirname, '..', 'renderer', 'index.html'),
  '#/Browser',
)
export const preloadPath = isDev
  ? join(app.getAppPath(), '..', 'preload.js')
  : join(app.getAppPath(), 'dist', 'electron', 'preload.js')
export const trayURL = getUrl('/tray.html', `${staticPath.__static}/tray.html`)
export const trayIconPath = isDev
  ? join(staticPath.__static, 'trayIcon', 'trayIcon.png')
  : join(
      app.getAppPath(),
      'dist',
      'electron',
      'renderer',
      'trayIcon',
      'trayIcon.png',
    )
export const trayTransparentIconPath = isDev
  ? join(staticPath.__static, 'trayIcon', 'transparent.png')
  : join(
      app.getAppPath(),
      'dist',
      'electron',
      'renderer',
      'trayIcon',
      'transparent.png',
    )
export const lib = staticPath.__lib
export const common = staticPath.__common
export const updateFolder = staticPath.__updateFolder
export const staticPaths = getUrl('', staticPath.__static)

// process.env 修改
for (const key in staticPath) {
  process.env[key] = staticPath[key]
}
