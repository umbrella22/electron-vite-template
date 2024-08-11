import type { ProgressInfo } from "electron-updater";

export interface IpcMainEventListener<Send = void, Receive = void> {
  ipcMainHandle: Send extends void
    ? (event: Electron.IpcMainInvokeEvent) => Receive | Promise<Receive>
    : (
        event: Electron.IpcMainInvokeEvent,
        args: Send
      ) => Receive | Promise<Receive>;
  ipcRendererInvoke: Send extends void
    ? () => Promise<Receive>
    : (args: Send) => Promise<Receive>;
}

export interface IpcRendererEventListener<Send = void> {
  ipcRendererOn: Send extends void
    ? (event: Electron.IpcRendererEvent) => void
    : (event: Electron.IpcRendererEvent, args: Send) => void;
  webContentSend: Send extends void
    ? (webContents: Electron.WebContents) => void
    : (webContents: Electron.WebContents, args: Send) => void;
}

export class IpcChannelMainClass {
  IsUseSysTitle: IpcMainEventListener<void, boolean>;
  /**
   * 退出应用
   */
  AppClose: IpcMainEventListener;
  CheckUpdate: IpcMainEventListener;
  ConfirmUpdate: IpcMainEventListener;
  OpenMessagebox: IpcMainEventListener<
    Electron.MessageBoxOptions,
    Electron.MessageBoxReturnValue
  >;
  StartDownload: IpcMainEventListener<string>;
  OpenErrorbox: IpcMainEventListener<{ title: string; message: string }>;
  StartServer: IpcMainEventListener<void, string>;
  StopServer: IpcMainEventListener<void, string>;
  HotUpdate: IpcMainEventListener;

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
  }>;
}
export class IpcChannelRendererClass {
  // ipcRenderer
  DownloadProgress: IpcRendererEventListener<number>;
  DownloadError: IpcRendererEventListener<Boolean>;
  DownloadPaused: IpcRendererEventListener<Boolean>;
  DownloadDone: IpcRendererEventListener<{
    /**
     * 下载的文件路径
     *
     * @type {string}
     */
    filePath: string;
  }>;
  UpdateMsg: IpcRendererEventListener<{
    state: number;
    msg: string | ProgressInfo;
  }>;
  UpdateProcessStatus: IpcRendererEventListener<{
    status:
      | "init"
      | "downloading"
      | "moving"
      | "finished"
      | "failed"
      | "download";
    message: string;
  }>;

  SendDataTest: IpcRendererEventListener<unknown>;
  BrowserViewTabDataUpdate: IpcRendererEventListener<{
    bvWebContentsId: number;
    title: string;
    url: string;
    status: 1 | -1; // 1 添加/更新 -1 删除
  }>;
  BrowserViewTabPositionXUpdate: IpcRendererEventListener<{
    dragTabOffsetX: number;
    positionX: number;
    bvWebContentsId: number;
  }>;
  BrowserTabMouseup: IpcRendererEventListener;
  HotUpdateStatus: IpcRendererEventListener<{
    status: string;
    message: string;
  }>;
}
