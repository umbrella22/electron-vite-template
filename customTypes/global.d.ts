import type { IpcBridge } from '../src/preload/index'

/**
 * 渲染进程与主进程的全部通信都经由 preload 暴露的 window.ipcBridge
 * （contextIsolation + sandbox，渲染进程无 Node 访问能力）。
 * 类型化的 invoke/listen 封装见 @renderer/utils/ipcRenderer。
 */

interface AnyObject {
  [key: string]: any
}

interface memoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

declare global {
  interface Window {
    performance: {
      memory: memoryInfo
    }
    /** preload 暴露的唯一桥梁，形状见 src/preload/index.ts */
    ipcBridge: IpcBridge
  }
}
