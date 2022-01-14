// 这里定义了静态文件路径的位置
import { join } from 'path'
import { DllFolder, HotUpdateFolder } from '@config/index'

const filePath = {
  winURL: {
    development: `http://localhost:${process.env.PORT}`,
    production: `file://${join(__dirname, '..', 'renderer', 'index.html')}`
  },
  loadingURL: {
    development: `http://localhost:${process.env.PORT}/loader.html`,
    production: `file://${join(__dirname, '..', 'renderer', 'loader.html')}`
  },
}

if (process.env.NODE_ENV !== 'development') process.env.__static = join(__dirname, '..', 'renderer').replace(/\\/g, '\\\\');

process.env.__lib = getAppRootPath(DllFolder)
process.env.__updateFolder = getAppRootPath(HotUpdateFolder)

export const winURL = filePath.winURL[process.env.NODE_ENV]
export const loadingURL = filePath.loadingURL[process.env.NODE_ENV]
export const lib = process.env.__lib
export const updateFolder = process.env.__updateFolder

function getAppRootPath(path: string) {
  return process.env.NODE_ENV !== 'development' ? join(__dirname, '..', '..', '..', '..', path).replace(/\\/g, '\\\\') : join(__dirname, '..', '..', '..', path).replace(/\\/g, '\\\\')
}

