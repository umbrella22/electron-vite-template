// todo 是否将ipc-main.ts文件中的代码拆分到多个文件中？通过abstract继承？或者注册回调函数？
import { ipcMain } from 'electron'

type IpcHandler = {
  channel: string
  handler: (...args: any[]) => any
}

export function registerIpcHandlers(handlers: IpcHandler[] | IpcHandler) {
  if (Array.isArray(handlers)) {
    handlers.forEach(registerIpcHandlers)
    return
  }
  ipcMain.handle(handlers.channel, handlers.handler)
}
