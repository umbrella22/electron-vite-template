import {
  IIpcRendererInvoke,
  IIpcRendererOn,
  IpcChannel,
} from '@ipcManager/index'
import { onUnmounted } from 'vue'
const { ipcRenderer } = require('electron')

type VoidParametersIpcRendererInvokeKey = {
  [K in keyof IIpcRendererInvoke]: Parameters<
    IIpcRendererInvoke[K]
  >[0] extends void
    ? K
    : never
}[keyof IIpcRendererInvoke]

type NotVoidParametersIpcRendererInvokeKey = Exclude<
  keyof IIpcRendererInvoke,
  VoidParametersIpcRendererInvokeKey
>

/**
 * IPC 调用（无参数版本）
 */
export function invoke<T extends VoidParametersIpcRendererInvokeKey>(
  channel: T,
): ReturnType<IIpcRendererInvoke[T]>

/**
 * IPC 调用（带参数版本）
 */
export function invoke<T extends NotVoidParametersIpcRendererInvokeKey>(
  channel: T,
  args: Parameters<IIpcRendererInvoke[T]>[0],
): ReturnType<IIpcRendererInvoke[T]>

/**
 * IPC 调用实现
 */
export function invoke<T extends keyof IIpcRendererInvoke>(
  channel: T,
  args?: Parameters<IIpcRendererInvoke[T]>[0],
) {
  return ipcRenderer.invoke(channel, args) as ReturnType<IIpcRendererInvoke[T]>
}

/**
 * ipcRenderer.on 在 Vue setup 中使用
 * 会在组件卸载时自动清理监听器
 *
 * @export
 * @template T
 * @param {T} channel - IPC 通道名
 * @param {IIpcRendererOn[T]} callback - 回调函数
 */
export function vueListen<T extends keyof IIpcRendererOn>(
  channel: T,
  callback: IIpcRendererOn[T],
) {
  ipcRenderer.on(channel, callback)
  onUnmounted(() => {
    ipcRenderer.removeListener(channel, callback)
  })
}

/**
 * ipcRenderer.on 通用版本
 * 返回清理函数，需要手动调用以移除监听器
 *
 * @export
 * @template T
 * @param {T} channel - IPC 通道名
 * @param {IIpcRendererOn[T]} callback - 回调函数
 * @return {() => void} 副作用清理函数
 */
export function listen<T extends keyof IIpcRendererOn>(
  channel: T,
  callback: IIpcRendererOn[T],
): () => void {
  ipcRenderer.on(channel, callback)
  return () => {
    ipcRenderer.removeListener(channel, callback)
  }
}

// 导出 IpcChannel 供外部使用
export { IpcChannel }
