/**
 * app 域：应用基础功能（invoke：渲染进程 -> 主进程）
 *
 * 本文件只声明类型，渲染进程会以 import type 的方式引用，不允许引入任何运行时代码。
 * 对应主进程实现：@main/services/ipc-main-handle 的 appIpcHandlers
 */

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
  openErrorbox(args: OpenErrorboxArgs): void
  /** 开始下载文件 */
  startDownload(url: string): void
  /** 打开新窗口 */
  openWin(args: OpenWinArgs): void
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
  setStoreValue(args: SetStoreValueArgs): void
  getStoreValue(args: StoreKeyArgs): unknown
  deleteStoreValue(args: StoreKeyArgs): void
}

/** openErrorbox 的载荷 */
export interface OpenErrorboxArgs {
  title: string
  message: string
}

/** openWin 的载荷 */
export interface OpenWinArgs {
  /** 新的窗口地址 */
  url: string
  /** 是否是支付页 */
  isPay?: boolean
  /** 支付参数 */
  payUrl?: string
  /** 发送给新页面的数据 */
  sendData?: unknown
}

/** setStoreValue 的载荷 */
export interface SetStoreValueArgs {
  key: string
  value: string
}

/** getStoreValue / deleteStoreValue 的载荷 */
export interface StoreKeyArgs {
  key: string
}
