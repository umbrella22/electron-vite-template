import type {
  IpcContractChannel,
  IpcEventChannel,
  ResolveContractMethod,
  ResolveEventMethod,
} from '@ipcManager/index'
import { onUnmounted } from 'vue'

/**
 * IPC 调用（渲染进程 -> 主进程）。
 * 通道名 = `域:方法`，域名、方法名与载荷都由合同类型推导：
 * 无参通道禁止传参，有参通道强校验载荷形状。
 * 底层经 preload 暴露的 window.ipcBridge（contextIsolation 安全模型）。
 *
 * @example
 * invoke('print:getPrinters')
 * invoke('app:openWin', { url: '/form/index' })
 */
export function invoke<C extends IpcContractChannel>(
  channel: C,
  ...args: Parameters<ResolveContractMethod<C>>
): Promise<ReturnType<ResolveContractMethod<C>>> {
  // 跨越 contextBridge 后类型被抹平为 unknown，由合同解析类型在边界处恢复
  return window.ipcBridge.invoke(channel, ...args) as Promise<
    ReturnType<ResolveContractMethod<C>>
  >
}

/**
 * 监听主进程推送的事件（通道名 = `组:方法`），回调直接收到载荷（不含 IpcRendererEvent）。
 * 返回清理函数，需要手动调用以移除监听器。
 *
 * @example
 * const dispose = listen('download:progress', (percent) => {...})
 */
export function listen<C extends IpcEventChannel>(
  channel: C,
  callback: ResolveEventMethod<C>,
): () => void {
  return window.ipcBridge.on(channel, callback as (...args: unknown[]) => void)
}

/**
 * listen 的 Vue setup 版本，组件卸载时自动清理监听器。
 *
 * @example
 * vueListen('download:done', ({ filePath }) => {...})
 */
export function vueListen<C extends IpcEventChannel>(
  channel: C,
  callback: ResolveEventMethod<C>,
): void {
  const dispose = listen(channel, callback)
  onUnmounted(dispose)
}
