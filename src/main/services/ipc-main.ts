// todo 是否将ipc-main.ts文件中的代码拆分到多个文件中？通过abstract继承？或者注册回调函数？
import { ipcMain } from 'electron'
import { IpcMainHandleClass } from './ipc-main-handle'
import { BrowserHandleClass } from './browser-handle'
import { PrintHandleClass } from './print-handle'

export const useMainDefaultIpc = () => {
  return {
    defaultIpc: () => {
      const ipcMainHandle = new IpcMainHandleClass()
      const browserHandle = new BrowserHandleClass()
      const printHandle = new PrintHandleClass()

      // 注册主处理类
      Object.entries(ipcMainHandle).forEach(
        ([ipcChannelName, ipcListener]: [string, () => void]) => {
          console.log('已挂载ipcChannelName:', ipcChannelName)
          if (typeof ipcListener === 'function') {
            ipcMain.handle(ipcChannelName, ipcListener)
          }
        },
      )

      // 注册浏览器处理类
      Object.entries(browserHandle).forEach(
        ([ipcChannelName, ipcListener]: [string, () => void]) => {
          console.log('已挂载浏览器ipcChannelName:', ipcChannelName)
          if (typeof ipcListener === 'function') {
            ipcMain.handle(ipcChannelName, ipcListener)
          }
        },
      )
      // 注册打印处理类
      Object.entries(printHandle).forEach(
        ([ipcChannelName, ipcListener]: [string, () => void]) => {
          console.log('已挂载打印ipcChannelName:', ipcChannelName)
          if (typeof ipcListener === 'function') {
            ipcMain.handle(ipcChannelName, ipcListener)
          }
        },
      )
    },
  }
}
