import { IpcRendererInvoke, IpcRendererOn } from "../../ipc"
import { onUnmounted } from "vue"
const { ipcRenderer } = require("electron");

type VoidParametersIpcRendererInvokeKey = {
  [K in keyof IpcRendererInvoke]: Parameters<IpcRendererInvoke[K]>[0] extends void ? K : never
}[keyof IpcRendererInvoke]
type NotVoidParametersIpcRendererInvokeKey = Exclude<keyof IpcRendererInvoke, VoidParametersIpcRendererInvokeKey>


export function invoke<T extends VoidParametersIpcRendererInvokeKey>(channel: T): ReturnType<IpcRendererInvoke[T]>;
export function invoke<T extends NotVoidParametersIpcRendererInvokeKey>(channel: T, args: Parameters<IpcRendererInvoke[T]>[0]): ReturnType<IpcRendererInvoke[T]>;

export function invoke<T extends keyof IpcRendererInvoke>(channel: T, args?: Parameters<IpcRendererInvoke[T]>[0]) {
  return ipcRenderer.invoke(channel, args) as ReturnType<IpcRendererInvoke[T]>
}



/**
 * ipcRenderon Vue setup中使用
 *
 * @export
 * @template T
 * @param {T} channel
 * @param {IpcRendererOn[T]} callback
 */
export function vueListen<T extends keyof IpcRendererOn>(channel: T, callback: IpcRendererOn[T]) {
  ipcRenderer.on(channel, callback)
  onUnmounted(() => {
    ipcRenderer.removeListener(channel, callback);
  })
}

/**
 * ipcRenderon
 * 
 * @export
 * @template T
 * @param {T} channel
 * @param {IpcRendererOn[T]} callback
 * @return {() => void} 副作用清理函数
 */
export function listen<T extends keyof IpcRendererOn>(channel: T, callback: IpcRendererOn[T]): () => void {
  ipcRenderer.on(channel, callback)
  return () => {
    ipcRenderer.removeListener(channel, callback);
  }
}
