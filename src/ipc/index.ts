/**
 * IPC 类型系统
 *
 * 通道按域分组，线上通道名 = `域:方法`（如 `browser:selectTab`、`download:progress`），
 * 命名与分组来自合同（./contract.ts），两端共用同一份定义：
 * - 主进程实现侧：对象字面量标注为 `IpcImpl<域合同>`，参数与返回值全部由类型推导
 * - 渲染进程调用侧：`invoke` / `listen` / `vueListen`（@renderer/utils/ipcRenderer）
 * - 主进程推送侧：`webContentSend`（@main/services/web-content-send）
 *
 * @module ipc
 */

export * from './contract'

import type { IpcContracts, IpcEventGroups } from './contract'

/** 单个通道的处理器视图：补上 IpcMainInvokeEvent 首参，返回值允许包 Promise */
type IpcHandlerOf<F> = F extends (...args: infer A) => infer R
  ? (event: Electron.IpcMainInvokeEvent, ...args: A) => R | Promise<R>
  : never

/**
 * 主进程实现视图。
 * 对象字面量标注为此类型后即可获得参数/返回值的完整推导，
 * 缺失、多余或签名不符的通道都会成为编译错误。
 */
export type IpcImpl<T> = {
  [K in keyof T]: IpcHandlerOf<T[K]>
}

/** 单个事件通道的发送视图：`webContentSend.group.method(webContents, ...payload)` */
type IpcEventSenderOf<F> = F extends (...args: infer A) => unknown
  ? (webContents: Electron.WebContents, ...args: A) => void
  : never

/** 主进程 -> 渲染进程的发送视图（按事件组两级嵌套） */
export type IpcEventSender<T> = {
  [G in keyof T]: {
    [M in keyof T[G]]: IpcEventSenderOf<T[G][M]>
  }
}

/** 全部 invoke 通道名字面量联合：'app:openWin' | 'browser:selectTab' | ... */
export type IpcContractChannel = {
  [D in keyof IpcContracts & string]: `${D}:${keyof IpcContracts[D] & string}`
}[keyof IpcContracts & string]

/** 由通道名解析出方法签名（invoke 的载荷/返回值来源） */
export type ResolveContractMethod<C> = C extends `${infer D}:${infer M}`
  ? D extends keyof IpcContracts
    ? M extends keyof IpcContracts[D]
      ? IpcContracts[D][M]
      : never
    : never
  : never

/** 全部事件通道名字面量联合：'download:progress' | 'browser:dragEnd' | ... */
export type IpcEventChannel = {
  [G in keyof IpcEventGroups & string]: `${G}:${keyof IpcEventGroups[G] & string}`
}[keyof IpcEventGroups & string]

/** 由事件通道名解析出监听回调签名 */
export type ResolveEventMethod<C> = C extends `${infer G}:${infer M}`
  ? G extends keyof IpcEventGroups
    ? M extends keyof IpcEventGroups[G]
      ? IpcEventGroups[G][M]
      : never
    : never
  : never
