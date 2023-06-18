
import type { IpcMainInvokeEvent, IpcRendererEvent, MessageBoxOptions, MessageBoxReturnValue, PrinterInfo, WebContentsPrintOptions } from "electron"
import { ProgressInfo } from "electron-updater";


type IpcMainEventListener<Send = void, Receive = void> = {
  ipcMainHandle: (event: IpcMainInvokeEvent, args: Send) => Receive | Promise<Receive>;
  ipcRendererInvoke: (args: Send) => Promise<Receive>;
}

type IpcRendererEventListener<Send = void> = {
  ipcRendererOn: (event: IpcRendererEvent, args?: Send) => void;
  webContentSend: (args: Send) => void;
}

export const enum IpcChannel {

  /**
   * 是否使用无边框
   */
  IsUseSysTitle = "IsUseSysTitle",

  /**
   * 窗口最小化
   */
  WindowMini = "windows-mini",

  /**
   * 窗口最大化
   */
  WindowMax = "window-max",

  /**
   * 窗口关闭
   */
  WindowClose = "window-close",

  /**
   * 检查更新
   */
  CheckUpdate = "check-update",

  /**
   * 确认更新
   */
  ConfirmUpdate = "confirm-update",

  /**
   * app退出
   */
  AppClose = "app-close",

  /**
   * 获取静态资源路径
   */
  GetStaticPath = "get-static-path",

  /**
   * 打开系统弹窗信息
   */
  OpenMessagebox = "open-messagebox",

  /**
   * 打开系统错误弹窗信息
   */
  OpenErrorbox = "open-errorbox",

  /**
   * 开启http服务
   */
  StartServer = "start-server",

  /**
   * 停止http服务
   */
  StopServer = "stop-server",

  /**
   * 增量更新
   */
  HotUpdate = "hot-update",

  /**
   * 增量更新2
   */
  HotUpdateTest = "hot-update-test",

  /**
   * 下载东西
   */
  StartDownload = "start-download",

  /**
   * 打开新的弹窗
   */
  OpenWin = "open-win",


  /**
   * 获取打印机信息
   */
  GetPrinters = "getPrinters",

  /**
   * 打印
   */
  PrintHandlePrint = "printHandlePrint",

  /**
   * 打开测试打印页面
   */
  OpenPrintDemoWindow = "openPrintDemoWindow",



  /**
   * 下载进度回调
   */
  DownloadProgress = "download-progress",

  /**
   * 下载错误回调
   */
  DownloadError = "download-error",

  /**
   * 下载暂停回调
   */
  DownloadPaused = "download-paused",

  /**
   * 下载完成回调
   */
  DownloadDone = "download-done",

  UpdateMsg = "UpdateMsg",

  /**
   * 热更新状态回调
   */
  HotUpdateStatus = "hot-update-status",

  /**
   * 数据测试回调
   */
  SendDataTest = "send-data-test",

}





type IpcMainEvent = {
  [IpcChannel.AppClose]: IpcMainEventListener
  [IpcChannel.CheckUpdate]: IpcMainEventListener
  [IpcChannel.ConfirmUpdate]: IpcMainEventListener
  [IpcChannel.GetStaticPath]: IpcMainEventListener<void, string>
  [IpcChannel.HotUpdate]: IpcMainEventListener
  [IpcChannel.HotUpdateTest]: IpcMainEventListener
  [IpcChannel.IsUseSysTitle]: IpcMainEventListener<void, boolean>
  [IpcChannel.OpenErrorbox]: IpcMainEventListener<{ title: string, message: string }, void>
  [IpcChannel.OpenMessagebox]: IpcMainEventListener<MessageBoxOptions, MessageBoxReturnValue>
  [IpcChannel.OpenWin]: IpcMainEventListener<{

    /**
     * 新的窗口地址
     *
     * @type {string}
     */
    url: string,

    /**
     * 是否是支付页
     *
     * @type {boolean}
     */
    IsPay?: boolean,

    /**
     * 支付参数
     *
     * @type {string}
     */
    PayUrl?: string,

    /**
     * 发送的新页面数据
     * 
     * @type {unknown}
     */
    sendData?: unknown
  }, void>
  [IpcChannel.StartDownload]: IpcMainEventListener<string, void>
  [IpcChannel.StartServer]: IpcMainEventListener<void, string>
  [IpcChannel.StopServer]: IpcMainEventListener<void, string>
  [IpcChannel.WindowClose]: IpcMainEventListener
  [IpcChannel.WindowMax]: IpcMainEventListener<void, { status: boolean }>
  [IpcChannel.WindowMini]: IpcMainEventListener
  [IpcChannel.GetPrinters]: IpcMainEventListener<void, PrinterInfo[]>
  [IpcChannel.PrintHandlePrint]: IpcMainEventListener<WebContentsPrintOptions, { success: boolean, failureReason: string }>
  [IpcChannel.OpenPrintDemoWindow]: IpcMainEventListener
}
type IpcRenderderEvent = {
  [IpcChannel.DownloadProgress]: IpcRendererEventListener<number>
  [IpcChannel.DownloadError]: IpcRendererEventListener<boolean>
  [IpcChannel.DownloadPaused]: IpcRendererEventListener<boolean>
  [IpcChannel.DownloadDone]: IpcRendererEventListener<{

    /**
     * 下载的文件路径
     *
     * @type {string}
     */
    filePath: string
  }
  >
  [IpcChannel.UpdateMsg]: IpcRendererEventListener<{
    state: number;
    msg: string | ProgressInfo;
  }>
  [IpcChannel.HotUpdateStatus]: IpcRendererEventListener<{
    status: "init" | "downloading" | "moving" | "finished" | "failed" | "download",
    message: string
  }>

  [IpcChannel.SendDataTest]: IpcRendererEventListener<unknown>

}




export type IpcMainHandle = {
  [Key in keyof IpcMainEvent]: IpcMainEvent[Key]["ipcMainHandle"]
}

export type IpcRendererInvoke = {
  [Key in keyof IpcMainEvent]: IpcMainEvent[Key]["ipcRendererInvoke"]
}

export type IpcRendererOn = {
  [Key in keyof IpcRenderderEvent]: IpcRenderderEvent[Key]["ipcRendererOn"]
}

export type WebContentSend = {
  [Key in keyof IpcRenderderEvent]: IpcRenderderEvent[Key]["webContentSend"]
}