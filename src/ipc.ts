import type {
  IpcMainInvokeEvent,
  IpcRendererEvent,
  MessageBoxOptions,
  MessageBoxReturnValue,
  PrinterInfo,
  WebContentsPrintOptions,
} from "electron";
import { ProgressInfo } from "electron-updater";

type IpcMainEventListener<Send = void, Receive = void> = {
  ipcMainHandle: (
    event: IpcMainInvokeEvent,
    args: Send
  ) => Receive | Promise<Receive>;
  ipcRendererInvoke: (args: Send) => Promise<Receive>;
};

type IpcRendererEventListener<Send = void> = {
  ipcRendererOn: (event: IpcRendererEvent, args?: Send) => void;
  webContentSend: (args: Send) => void;
};

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

  /**
   * 添加新的默认页面
   */
  AddDefaultBrowserView = "add-default-browser-view",

  /**
   * 选择tab
   */
  SelectBrowserDemoTab = "select-browser-demo-tab",

  /**
   * 关闭tab
   */
  DestroyBrowserDemoTab = "destroy-browser-demo-tab",

  /**
   * tab 跳转
   */
  BrowserDemoTabJumpToUrl = "browser-demo-tab-jump-to-url",

  /**
   * 打开浏览器demo
   */
  OpenBrowserDemoWindow = "open-browser-demo",

  /**
   * Browser tab 鼠标按下
   */
  BrowserTabMousedown = "browser-tab-mousedown",

  /**
   * Browser tab 鼠标拖动
   */
  BrowserTabMousemove = "browser-tab-mousemove",

  /**
   * Browser tab 鼠标松开
   */
  BrowserTabMouseup = "browser-tab-mouseup",

  /**
   * 获取最后一次拖动的 tab 信息
   */
  GetLastBrowserDemoTabData = "get-last-browser-demo-tab-data",

  /**
   * 更新 tab 信息
   */
  BrowserViewTabDataUpdate = "browser-view-tab-data-updated",

  /**
   * 更新 tab 坐标
   */
  BrowserViewTabPositionXUpdate = "browser-view-tab-position-x-updated",

  /**
   * 设置在我的电脑显示
   */
  SetShowOnMyComputer = "set-show-on-my-computer",
  /**
   * 查询当前是否显示在我的电脑
   */
  CheckShowOnMyComputer = "check-show-on-my-computer",
}

type IpcMainEvent = {
  [IpcChannel.AppClose]: IpcMainEventListener;
  [IpcChannel.CheckUpdate]: IpcMainEventListener;
  [IpcChannel.ConfirmUpdate]: IpcMainEventListener;
  [IpcChannel.GetStaticPath]: IpcMainEventListener<void, string>;
  [IpcChannel.HotUpdate]: IpcMainEventListener;
  [IpcChannel.HotUpdateTest]: IpcMainEventListener;
  [IpcChannel.IsUseSysTitle]: IpcMainEventListener<void, boolean>;
  [IpcChannel.OpenErrorbox]: IpcMainEventListener<
    { title: string; message: string },
    void
  >;
  [IpcChannel.OpenMessagebox]: IpcMainEventListener<
    MessageBoxOptions,
    MessageBoxReturnValue
  >;
  [IpcChannel.OpenWin]: IpcMainEventListener<
    {
      /**
       * 新的窗口地址
       *
       * @type {string}
       */
      url: string;

      /**
       * 是否是支付页
       *
       * @type {boolean}
       */
      IsPay?: boolean;

      /**
       * 支付参数
       *
       * @type {string}
       */
      PayUrl?: string;

      /**
       * 发送的新页面数据
       *
       * @type {unknown}
       */
      sendData?: unknown;
    },
    void
  >;
  [IpcChannel.StartDownload]: IpcMainEventListener<string, void>;
  [IpcChannel.StartServer]: IpcMainEventListener<void, string>;
  [IpcChannel.StopServer]: IpcMainEventListener<void, string>;
  [IpcChannel.WindowClose]: IpcMainEventListener;
  [IpcChannel.WindowMax]: IpcMainEventListener<void, { status: boolean }>;
  [IpcChannel.WindowMini]: IpcMainEventListener;
  [IpcChannel.GetPrinters]: IpcMainEventListener<void, PrinterInfo[]>;
  [IpcChannel.PrintHandlePrint]: IpcMainEventListener<
    WebContentsPrintOptions,
    { success: boolean; failureReason: string }
  >;
  [IpcChannel.OpenPrintDemoWindow]: IpcMainEventListener;
  [IpcChannel.OpenBrowserDemoWindow]: IpcMainEventListener;
  [IpcChannel.BrowserTabMousedown]: IpcMainEventListener<
    {
      offsetX: number;
    },
    void
  >;
  [IpcChannel.BrowserTabMousemove]: IpcMainEventListener<
    {
      screenX: number;
      screenY: number;
      startX: number;
      startY: number;
      bvWebContentsId: number;
    },
    void
  >;
  [IpcChannel.BrowserTabMouseup]: IpcMainEventListener;
  [IpcChannel.AddDefaultBrowserView]: IpcMainEventListener<
    void,
    { bvWebContentsId: number }
  >;
  [IpcChannel.SelectBrowserDemoTab]: IpcMainEventListener<number, boolean>;
  [IpcChannel.DestroyBrowserDemoTab]: IpcMainEventListener<number, void>;
  [IpcChannel.BrowserDemoTabJumpToUrl]: IpcMainEventListener<
    {
      url: string;
      bvWebContentsId: number;
    },
    void
  >;
  [IpcChannel.GetLastBrowserDemoTabData]: IpcMainEventListener<
    void,
    {
      positionX: number;
      bvWebContentsId: number;
      title: string;
      url: string;
    }
  >;
  [IpcChannel.CheckShowOnMyComputer]: IpcMainEventListener<void, boolean>;
  [IpcChannel.SetShowOnMyComputer]: IpcMainEventListener<boolean, boolean>;
};
type IpcRenderderEvent = {
  [IpcChannel.DownloadProgress]: IpcRendererEventListener<number>;
  [IpcChannel.DownloadError]: IpcRendererEventListener<boolean>;
  [IpcChannel.DownloadPaused]: IpcRendererEventListener<boolean>;
  [IpcChannel.DownloadDone]: IpcRendererEventListener<{
    /**
     * 下载的文件路径
     *
     * @type {string}
     */
    filePath: string;
  }>;
  [IpcChannel.UpdateMsg]: IpcRendererEventListener<{
    state: number;
    msg: string | ProgressInfo;
  }>;
  [IpcChannel.HotUpdateStatus]: IpcRendererEventListener<{
    status:
      | "init"
      | "downloading"
      | "moving"
      | "finished"
      | "failed"
      | "download";
    message: string;
  }>;

  [IpcChannel.SendDataTest]: IpcRendererEventListener<unknown>;
  [IpcChannel.BrowserViewTabDataUpdate]: IpcRendererEventListener<{
    bvWebContentsId: number;
    title: string;
    url: string;
    status: 1 | -1; // 1 添加/更新 -1 删除
  }>;
  [IpcChannel.BrowserViewTabPositionXUpdate]: IpcRendererEventListener<{
    dragTabOffsetX: number;
    positionX: number;
    bvWebContentsId: number;
  }>;
  [IpcChannel.BrowserTabMouseup]: IpcRendererEventListener;
};

export type IpcMainHandle = {
  [Key in keyof IpcMainEvent]: IpcMainEvent[Key]["ipcMainHandle"];
};

export type IpcRendererInvoke = {
  [Key in keyof IpcMainEvent]: IpcMainEvent[Key]["ipcRendererInvoke"];
};

export type IpcRendererOn = {
  [Key in keyof IpcRenderderEvent]: IpcRenderderEvent[Key]["ipcRendererOn"];
};

export type WebContentSend = {
  [Key in keyof IpcRenderderEvent]: IpcRenderderEvent[Key]["webContentSend"];
};
