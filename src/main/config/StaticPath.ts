// 这里定义了静态文件路径的位置
import { join } from 'path'
import config from '@config/index'
import { app } from 'electron'

const filePath = {
  winURL: {
    development: `http://localhost:${process.env.PORT}`,
    production: `file://${join(app.getAppPath(), "dist", "electron", 'renderer', 'index.html')}`
  },
  loadingURL: {
    development: `http://localhost:${process.env.PORT}/loader.html`,
    production: `file://${join(app.getAppPath(), "dist", "electron", 'renderer', 'loader.html')}`
  },
  getPreloadFile(fileName: string) {
    if (process.env.NODE_ENV !== 'development') {
      return join(app.getAppPath(), "dist", "electron", "main", `${fileName}.js`)
    }
    return join(app.getAppPath(), `${fileName}.js`)

  }
}

if (process.env.NODE_ENV !== 'development') process.env.__static = join(app.getAppPath(), "dist", "electron", 'renderer').replace(/\\/g, '\\\\');


process.env.__lib = getAppRootPath(config.DllFolder)
process.env.__updateFolder = getAppRootPath(config.HotUpdateFolder)

function getAppRootPath(path: string) {
  return process.env.NODE_ENV !== 'development' ? join(__dirname, '..', '..', '..', '..', path).replace(/\\/g, '\\\\') : join(__dirname, '..', '..', '..', path).replace(/\\/g, '\\\\')
}

export const winURL = filePath.winURL[process.env.NODE_ENV]
export const loadingURL = filePath.loadingURL[process.env.NODE_ENV]
export const lib = process.env.__lib
export const updateFolder = process.env.__updateFolder
export const getPreloadFile = filePath.getPreloadFile

