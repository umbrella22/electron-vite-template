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
   * 热更新测试（仅用于测试）
   */
  HotUpdateTest: IpcMainEventListener = null
  /**
   * 检查是否在"我的电脑"中显示
   */
  CheckShowOnMyComputer: IpcMainEventListener<void, boolean> = null
  /**
   * 设置是否在"我的电脑"中显示
   */
  SetShowOnMyComputer: IpcMainEventListener<boolean> = null
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
  UpdateMsg: IpcRendererEventListener<{
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
    browserContentViewWebContentsId: number
    title: string
    url: string
    status: 1 | -1 // 1 添加/更新 -1 删除
  }> = null
  BrowserViewTabPositionXUpdate: IpcRendererEventListener<{
    dragTabOffsetX: number
    positionX: number
    browserContentViewWebContentsId: number
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
      browserContentViewWebContentsId: number
      title: string
      url: string
    }
  > = null

  /**
   * 添加默认的 BrowserView
   */
  AddDefaultBrowserView: IpcMainEventListener<
    void,
    { browserContentViewWebContentsId: number }
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
    browserContentViewWebContentsId: number
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
    browserContentViewWebContentsId: number
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
