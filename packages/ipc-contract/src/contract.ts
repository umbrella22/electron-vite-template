/**
 * IPC 通道合同（单一事实来源）
 *
 * 这里只声明类型，主进程和渲染进程共用。通道按域分组，线上通道名 = `域:方法`：
 * - IpcContracts：渲染进程 -> 主进程（invoke/handle），如 `browser:selectTab`
 * - IpcEventGroups：主进程 -> 渲染进程（send/on），如 `download:progress`
 *
 * 穷尽性和载荷类型由以下位置共同约束：
 * - 主进程实现：对象字面量标注为 `IpcImpl<T>`（见 ./index.ts）
 * - 渲染进程调用：`invoke` / `listen` / `vueListen`（@renderer/utils/ipcRenderer）
 * - 主进程推送：`webContentSend`（@main/services/web-content-send）
 *
 * 域与 handler 文件一一对应，新增通道时：
 * 1. 在对应域的合同接口里加方法签名
 * 2. 在对应 handler 对象字面量里加实现（漏加会编译报错）
 * 3. 渲染端 `invoke('域:方法')` 调用
 *
 * 注意：本文件不允许引入任何运行时代码，渲染进程会以 import type 的方式引用。
 */

import type { ProgressInfo } from 'electron-updater'

/** 应用基础功能 */
export interface AppContract {
  /** 是否使用系统标题栏 */
  isUseSysTitle(): boolean
  /** 获取静态资源路径 */
  getStaticPath(): string
  /** 退出应用 */
  quit(): void
  /** 检查整包更新（electron-updater） */
  checkUpdate(): void
  /** 退出并安装整包更新 */
  confirmUpdate(): void
  /** 打开消息对话框 */
  openMessagebox(
    args: Electron.MessageBoxOptions,
  ): Electron.MessageBoxReturnValue
  /** 打开错误对话框 */
  openErrorbox(args: { title: string; message: string }): void
  /** 开始下载文件 */
  startDownload(url: string): void
  /** 打开新窗口 */
  openWin(args: {
    /** 新的窗口地址 */
    url: string
    /** 是否是支付页 */
    isPay?: boolean
    /** 支付参数 */
    payUrl?: string
    /** 发送给新页面的数据 */
    sendData?: unknown
  }): void
  /** 窗口准备就绪 */
  winReady(): void
  /** @deprecated 演示用，已废弃 */
  startServer(): string
  /** @deprecated 演示用，已废弃 */
  stopServer(): string
  /** 检查是否在"我的电脑"中显示（仅 Windows） */
  checkShowOnMyComputer(): boolean
  /** 设置是否在"我的电脑"中显示（仅 Windows） */
  setShowOnMyComputer(show: boolean): boolean
  setStoreValue(args: { key: string; value: string }): void
  getStoreValue(args: { key: string }): unknown
  deleteStoreValue(args: { key: string }): void
}

/** 浏览器演示窗口 */
export interface BrowserContract {
  /** 打开浏览器演示窗口 */
  openDemoWindow(): void
  /** 获取最后一个拖拽的浏览器标签数据 */
  getLastDraggedTabData(): {
    positionX: number
    browserContentViewWebContentsId: number
    title: string
    url: string
  }
  /** 添加默认的 BrowserView */
  addDefaultView(): { browserContentViewWebContentsId: number }
  /** 选择浏览器标签 */
  selectTab(browserContentViewWebContentsId: number): boolean
  /** 销毁浏览器标签 */
  destroyTab(browserContentViewWebContentsId: number): void
  /** 浏览器标签跳转到指定 URL */
  jumpToUrl(args: {
    browserContentViewWebContentsId: number
    url: string
  }): void
  /** 标签鼠标按下事件 */
  mousedown(args: { offsetX: number }): void
  /** 标签鼠标移动事件（拖拽中） */
  mousemove(args: {
    /** 鼠标在显示器的x坐标 */
    screenX: number
    /** 鼠标在显示器的y坐标 */
    screenY: number
    /** 按下鼠标时在窗口的x坐标 */
    startX: number
    /** 按下鼠标时在窗口的y坐标 */
    startY: number
    browserContentViewWebContentsId: number
  }): void
  /** 标签鼠标抬起事件（拖拽结束） */
  mouseup(): void
}

/** 打印演示窗口 */
export interface PrintContract {
  /** 获取打印机列表 */
  getPrinters(): Electron.PrinterInfo[]
  /** 执行打印操作 */
  exec(options: Electron.WebContentsPrintOptions): {
    success: boolean
    failureReason: string
  }
  /** 打开打印演示窗口 */
  openDemoWindow(): void
}

/** 热更新（增量更新） */
export interface UpdaterContract {
  /** 执行热更新 */
  start(): void
  /** 热更新测试（仅用于测试） */
  test(): void
}

/** 渲染进程 -> 主进程，按域分组 */
export interface IpcContracts {
  app: AppContract
  browser: BrowserContract
  print: PrintContract
  updater: UpdaterContract
}

/** 文件下载事件推送 */
export interface DownloadEvents {
  progress(percent: number): void
  error(isError: boolean): void
  paused(isPaused: boolean): void
  done(payload: { filePath: string }): void
}

/** 更新事件推送（整包 electron-updater 与增量热更新共用） */
export interface UpdateEvents {
  /** electron-updater 的更新进度推送 */
  msg(payload: { state: number; msg: string | ProgressInfo }): void
  processStatus(payload: {
    status:
      | 'init'
      | 'downloading'
      | 'moving'
      | 'finished'
      | 'failed'
      | 'download'
    message: string
  }): void
  /** 增量热更新的状态推送 */
  hotStatus(payload: { status: string; message: string }): void
}

/** 浏览器演示窗口事件推送 */
export interface BrowserEvents {
  tabDataUpdate(payload: {
    browserContentViewWebContentsId: number
    title: string
    url: string
    /** 1 添加/更新 -1 删除 */
    status: 1 | -1
  }): void
  tabPositionXUpdate(payload: {
    dragTabOffsetX: number
    positionX: number
    browserContentViewWebContentsId: number
  }): void
  /** 标签拖拽结束，通知标签栏重置状态 */
  dragEnd(): void
}

/** 窗口事件推送 */
export interface WindowEvents {
  /** 主进程向新窗口发送的数据 */
  sendData(data: unknown): void
}

/** 主进程 -> 渲染进程的事件推送，按域分组 */
export interface IpcEventGroups {
  download: DownloadEvents
  update: UpdateEvents
  browser: BrowserEvents
  window: WindowEvents
}
