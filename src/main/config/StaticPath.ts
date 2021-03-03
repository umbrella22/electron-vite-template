// 这里定义了静态文件路径的位置
import { join } from 'path'
import { DllFolder } from '@config/index'

var __static: string
var __lib: string
if (process.env.NODE_ENV !== 'development') {
  __static = join(__dirname, '..','renderer').replace(/\\/g, '\\\\')
  __lib = join(__dirname, '..', '..', '..', '..', `${DllFolder}`).replace(/\\/g, '\\\\')
}
export const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : `file://${join(__dirname, '..', 'renderer','index.html')}`
export const loadingURL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/loader.html` : `file://${__static}/loader.html`
export const lib = __lib
