import type {
  AppContract,
  BrowserContract,
  BrowserEvents,
  DownloadEvents,
  IpcContractChannel,
  IpcEventChannel,
  PrintContract,
  ResolveContractMethod,
  ResolveEventMethod,
  UpdaterContract,
  UpdateEvents,
  WindowEvents,
} from 'ipc-contract'
import { onUnmounted } from 'vue'

/**
 * 渲染进程的 IPC 客户端层。
 *
 * 日常使用类型化域桥（方法名即文档，来自 ipc-contract 的合同接口）：
 * - `ipc.域.方法(args)` —— 渲染进程 -> 主进程，如 `ipc.browser.selectTab(id)`
 * - `ipcEvents.组.事件(cb)` —— 主进程 -> 渲染进程，如 `ipcEvents.download.progress(cb)`
 * - `vueOn(ipcEvents.组.事件, cb)` —— 上一行的 Vue setup 版本，组件卸载自动清理
 *
 * `invoke` / `listen` / `vueListen` 是底层通道形式（`'域:方法'` 字符串寻址），
 * 保留给动态拼接通道等特殊情况，业务代码请优先用域桥。
 */

// ---------------------------------------------------------------------------
// 类型化域桥（推荐入口）
// ---------------------------------------------------------------------------

/** 把合同方法（主进程 handler 视角，返回原始值）映射为渲染端的 Promise 版签名 */
type BridgeMethod<F> = F extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : never

/**
 * 域桥视图：逐方法同形映射。
 * 同形映射会保留合同接口成员的 JSDoc（含 @deprecated 与参数文档），
 * IDE 悬停 `ipc.域.方法` 时直接透出 contract.ts 里的说明。
 */
type Bridge<T> = { [K in keyof T]: BridgeMethod<T[K]> }

/** 事件组桥视图：把事件方法映射为「注册回调 -> 返回清理函数」 */
type EventBridge<T> = { [K in keyof T]: (callback: T[K]) => () => void }

function createBridge<T extends object>(domain: string): Bridge<T> {
  return new Proxy({} as Bridge<T>, {
    get(_target, method) {
      if (typeof method !== 'string') return undefined
      return (...args: unknown[]) =>
        window.ipcBridge.invoke(`${domain}:${method}`, ...args)
    },
  })
}

function createEventBridge<T extends object>(group: string): EventBridge<T> {
  return new Proxy({} as EventBridge<T>, {
    get(_target, method) {
      if (typeof method !== 'string') return undefined
      return (callback: (...args: unknown[]) => void) =>
        window.ipcBridge.on(`${group}:${method}`, callback)
    },
  })
}

/**
 * 渲染进程 -> 主进程的类型化域桥：`ipc.域.方法(参数)`。
 * 域与方法名来自合同接口，线上通道 `域:方法` 由运行时拼接，
 * 无参方法多传参会编译报错，有参方法强校验载荷形状。
 *
 * @example
 * await ipc.browser.jumpToUrl({ browserContentViewWebContentsId: 1, url: 'https://…' })
 * const printers = await ipc.print.getPrinters()
 */
export const ipc = {
  /** 应用基础功能 */
  app: createBridge<AppContract>('app'),
  /** 浏览器演示窗口 */
  browser: createBridge<BrowserContract>('browser'),
  /** 打印演示窗口 */
  print: createBridge<PrintContract>('print'),
  /** 热更新（增量更新） */
  updater: createBridge<UpdaterContract>('updater'),
}

/**
 * 主进程 -> 渲染进程的类型化事件桥：`ipcEvents.组.事件(回调)`。
 * 回调签名与事件载荷文档来自合同接口，返回清理函数用于手动移除监听。
 *
 * @example
 * const dispose = ipcEvents.download.progress((percent) => {...})
 */
export const ipcEvents = {
  /** 文件下载事件推送 */
  download: createEventBridge<DownloadEvents>('download'),
  /** 更新事件推送（整包 electron-updater 与增量热更新共用） */
  update: createEventBridge<UpdateEvents>('update'),
  /** 浏览器演示窗口事件推送 */
  browser: createEventBridge<BrowserEvents>('browser'),
  /** 窗口事件推送 */
  window: createEventBridge<WindowEvents>('window'),
}

/**
 * ipcEvents 的 Vue setup 版本，组件卸载时自动清理监听器。
 *
 * @example
 * vueOn(ipcEvents.download.progress, (percent) => {...})
 */
export function vueOn<F extends (...args: never[]) => unknown>(
  register: (callback: F) => () => void,
  callback: F,
): void {
  const dispose = register(callback)
  onUnmounted(dispose)
}

// ---------------------------------------------------------------------------
// 底层通道形式（保留：动态拼接通道等特殊场景使用）
// ---------------------------------------------------------------------------

/**
 * IPC 调用（渲染进程 -> 主进程），字符串通道寻址的底层形式。
 * 业务代码请优先使用类型化域桥 `ipc.域.方法(参数)`。
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
 * 返回清理函数，需要手动调用以移除监听器。业务代码请优先使用 `ipcEvents.组.事件(回调)`。
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
