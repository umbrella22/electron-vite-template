import { ipcMain } from 'electron'
import type { IpcContracts, IpcImpl } from '@ipcManager/index'
import { appIpcHandlers } from './ipc-main-handle'
import { browserIpcHandlers } from './browser-handle'
import { printIpcHandlers } from './print-handle'
import { updaterIpcHandlers } from './hot-updater'

/**
 * 把某个域的实现对象注册为 `域:方法` 形式的 IPC 通道。
 * 通道的穷尽性与签名正确性由 IpcImpl<IpcContracts[D]> 在编译期保证，
 * 域名与方法名拼错会直接对不上合同报错，这里只负责遍历注册。
 */
function registerContracts<D extends keyof IpcContracts & string>(
  domain: D,
  handlers: IpcImpl<IpcContracts[D]>,
): void {
  for (const [method, listener] of Object.entries(handlers)) {
    if (typeof listener !== 'function') continue
    ipcMain.handle(
      `${domain}:${method}`,
      listener as (
        event: Electron.IpcMainInvokeEvent,
        ...args: unknown[]
      ) => void,
    )
    console.log(`已挂载 IPC: ${domain}:${method}`)
  }
}

export const useMainDefaultIpc = () => {
  return {
    defaultIpc: () => {
      registerContracts('app', appIpcHandlers)
      registerContracts('browser', browserIpcHandlers)
      registerContracts('print', printIpcHandlers)
      registerContracts('updater', updaterIpcHandlers)
    },
  }
}
