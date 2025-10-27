import type { ProgressInfo } from 'electron-updater'

export interface IpcMainEventListener<Send = void, Receive = void> {
  ipcMainHandle: Send extends void
    ? (event: Electron.IpcMainInvokeEvent) => Receive | Promise<Receive>
    : (
        event: Electron.IpcMainInvokeEvent,
        args: Send,
      ) => Receive | Promise<Receive>
  ipcRendererInvoke: Send extends void
    ? () => Promise<Receive>
    : (args: Send) => Promise<Receive>
}

export interface IpcRendererEventListener<Send = void> {
  ipcRendererOn: Send extends void
    ? (event: Electron.IpcRendererEvent) => void
    : (event: Electron.IpcRendererEvent, args: Send) => void
  webContentSend: Send extends void
    ? (webContents: Electron.WebContents) => void
    : (webContents: Electron.WebContents, args: Send) => void
}

/**
 * IPC 通道名称枚举
 * 自动从类定义中提取所有方法名作为通道名
 */
export const IpcChannel = {
  // Main 通道
  IsUseSysTitle: 'is-use-sys-title',
  AppClose: 'app-close',
  CheckUpdate: 'check-update',
  ConfirmUpdate: 'confirm-update',
  OpenMessagebox: 'open-messagebox',
  StartDownload: 'start-download',
  OpenErrorbox: 'open-errorbox',
  StartServer: 'start-server',
  StopServer: 'stop-server',
  HotUpdate: 'hot-update',
  HotUpdateTest: 'hot-update-test',
  WinReady: 'win-ready',
  OpenWin: 'open-win',
  GetStaticPath: 'get-static-path',
  CheckShowOnMyComputer: 'check-show-on-my-computer',
  SetShowOnMyComputer: 'set-show-on-my-computer',

  // Renderer 通道
  DownloadProgress: 'download-progress',
  DownloadError: 'download-error',
  DownloadPaused: 'download-paused',
  DownloadDone: 'download-done',
  updateMsg: 'update-msg',
  UpdateMsg: 'update-msg',
  UpdateProcessStatus: 'update-process-status',
  SendDataTest: 'send-data-test',
  BrowserViewTabDataUpdate: 'browser-view-tab-data-update',
  BrowserViewTabPositionXUpdate: 'browser-view-tab-position-x-update',
  BrowserTabMouseup: 'browser-tab-mouseup',
  HotUpdateStatus: 'hot-update-status',

  // Browser 通道
  OpenBrowserDemoWindow: 'open-browser-demo-window',
  GetLastBrowserDemoTabData: 'get-last-browser-demo-tab-data',
  AddDefaultBrowserView: 'add-default-browser-view',
  SelectBrowserDemoTab: 'select-browser-demo-tab',
  DestroyBrowserDemoTab: 'destroy-browser-demo-tab',
  BrowserDemoTabJumpToUrl: 'browser-demo-tab-jump-to-url',
  BrowserTabMousedown: 'browser-tab-mousedown',
  BrowserTabMousemove: 'browser-tab-mousemove',

  // Print 通道
  GetPrinters: 'get-printers',
  PrintHandlePrint: 'print-handle-print',
  OpenPrintDemoWindow: 'open-print-demo-window',
} as const

export type IpcChannelType = typeof IpcChannel
export type IpcChannelKeys = keyof IpcChannelType

export class IpcChannelMainClass {
  IsUseSysTitle: IpcMainEventListener<void, boolean> = null
  GetStaticPath: IpcMainEventListener<void, string> = null
  /**
   * 退出应用
   */
  AppClose: IpcMainEventListener = null
  CheckUpdate: IpcMainEventListener = null
  ConfirmUpdate: IpcMainEventListener = null
  OpenMessagebox: IpcMainEventListener<
    Electron.MessageBoxOptions,
    Electron.MessageBoxReturnValue
  > = null
  StartDownload: IpcMainEventListener<string> = null
  OpenErrorbox: IpcMainEventListener<{ title: string; message: string }> = null
  StartServer: IpcMainEventListener<void, string> = null
  StopServer: IpcMainEventListener<void, string> = null
  /**
   * 窗口准备就绪
   */
  WinReady: IpcMainEventListener = null
  /**
   *
   * 打开窗口
   */
  OpenWin: IpcMainEventListener<{
    /**
     * 新的窗口地址
     *
     * @type {string}
     */
    url: string

    /**
     * 是否是支付页
     *
     * @type {boolean}
     */
    IsPay?: boolean

    /**
     * 支付参数
     *
     * @type {string}
     */
    PayUrl?: string

    /**
     * 发送的新页面数据
     *
     * @type {unknown}
     */
    sendData?: unknown
  }> = null
}
export class IpcChannelRendererClass {
  // ipcRenderer
  DownloadProgress: IpcRendererEventListener<number> = null
  DownloadError: IpcRendererEventListener<boolean> = null
  DownloadPaused: IpcRendererEventListener<boolean> = null
  DownloadDone: IpcRendererEventListener<{
    /**
     * 下载的文件路径
     *
     * @type {string}
     */
    filePath: string
  }> = null
  updateMsg: IpcRendererEventListener<{
    state: number
    msg: string | ProgressInfo
  }> = null
  UpdateProcessStatus: IpcRendererEventListener<{
    status:
      | 'init'
      | 'downloading'
      | 'moving'
      | 'finished'
      | 'failed'
      | 'download'
    message: string
  }> = null

  SendDataTest: IpcRendererEventListener<unknown> = null
  BrowserViewTabDataUpdate: IpcRendererEventListener<{
    bvWebContentsId: number
    title: string
    url: string
    status: 1 | -1 // 1 添加/更新 -1 删除
  }> = null
  BrowserViewTabPositionXUpdate: IpcRendererEventListener<{
    dragTabOffsetX: number
    positionX: number
    bvWebContentsId: number
  }> = null
  BrowserTabMouseup: IpcRendererEventListener = null
  HotUpdateStatus: IpcRendererEventListener<{
    status: string
    message: string
  }> = null
}

export class IpcChannelBrowserClass {
  /**
   * 打开浏览器演示窗口
   */
  OpenBrowserDemoWindow: IpcMainEventListener = null

  /**
   * 获取最后一个拖拽的浏览器标签数据
   */
  GetLastBrowserDemoTabData: IpcMainEventListener<
    void,
    {
      positionX: number
      bvWebContentsId: number
      title: string
      url: string
    }
  > = null

  /**
   * 添加默认的 BrowserView
   */
  AddDefaultBrowserView: IpcMainEventListener<
    void,
    { bvWebContentsId: number }
  > = null

  /**
   * 选择浏览器标签
   */
  SelectBrowserDemoTab: IpcMainEventListener<number, boolean> = null

  /**
   * 销毁浏览器标签
   */
  DestroyBrowserDemoTab: IpcMainEventListener<number> = null

  /**
   * 浏览器标签跳转到指定 URL
   */
  BrowserDemoTabJumpToUrl: IpcMainEventListener<{
    bvWebContentsId: number
    url: string
  }> = null

  /**
   * 浏览器标签鼠标按下事件
   */
  BrowserTabMousedown: IpcMainEventListener<{
    offsetX: number
  }> = null

  /**
   * 浏览器标签鼠标移动事件
   */
  BrowserTabMousemove: IpcMainEventListener<{
    screenX: number
    screenY: number
    startX: number
    startY: number
    bvWebContentsId: number
  }> = null

  /**
   * 浏览器标签鼠标抬起事件
   */
  BrowserTabMouseup: IpcMainEventListener = null
}

export class IpcChannelPrintClass {
  /**
   * 获取打印机列表
   */
  GetPrinters: IpcMainEventListener<void, Electron.PrinterInfo[]> = null

  /**
   * 执行打印操作
   */
  PrintHandlePrint: IpcMainEventListener<
    Electron.WebContentsPrintOptions,
    { success: boolean; failureReason: string }
  > = null

  /**
   * 打开打印演示窗口
   */
  OpenPrintDemoWindow: IpcMainEventListener = null
}

export class IpcChannelHotUpdaterClass {
  /**
   * 执行热更新
   */
  HotUpdate: IpcMainEventListener = null
}
