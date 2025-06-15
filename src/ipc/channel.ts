/**
 * 这个文件是定义IPC通道的事件监听
 * 总的来说，IpcMainEventListener 和 IpcRendererEventListener 无需理解，这俩只是类型
 * IpcChannelMainClass 和 IpcChannelRendererClass 是主进程和渲染进程的IPC通道事件监听
 */

import type { ProgressInfo } from 'electron-updater'

/**
 * 主进程的IPC通道事件监听
 */
export interface IpcMainEventListener<Send = void, Receive = void> {
  /**
   * 主进程监听事件
   */
  ipcMainHandle: Send extends void
    ? (event: Electron.IpcMainInvokeEvent) => Receive | Promise<Receive>
    : (
        event: Electron.IpcMainInvokeEvent,
        args: Send,
      ) => Receive | Promise<Receive>
  /**
   * 渲染进程给主进程发送消息
   */
  ipcRendererInvoke: Send extends void
    ? () => Promise<Receive>
    : (args: Send) => Promise<Receive>
}

/**
 * 渲染进程的IPC通道事件监听
 */
export interface IpcRendererEventListener<Send = void> {
  /**
   * 渲染进程监听事件
   */
  ipcRendererOn: Send extends void
    ? (event: Electron.IpcRendererEvent) => void
    : (event: Electron.IpcRendererEvent, args: Send) => void
  /**
   * 主进程给渲染进程发送消息
   */
  webContentSend: Send extends void
    ? (webContents: Electron.WebContents) => void
    : (webContents: Electron.WebContents, args: Send) => void
}

/**
 * 主进程的IPC通道事件
 * 给主进程发消息的事件以及主进程监听的事件都写在这里，但是这里也只是规定了都有什么，并没有具体实现
 * 具体实现在 src/main/services/ipc-main-handle.ts
 */
export class IpcChannelMainClass {
  IsUseSysTitle: IpcMainEventListener<void, boolean> = null
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
  HotUpdate: IpcMainEventListener = null

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

/**
 * 渲染进程的IPC通道事件
 * 给渲染进程发消息的事件以及渲染进程监听的时间都写在这里，但是这里也只是规定了都有什么，并没有具体实现
 * 具体实现在 src/main/services/web-content-send.ts，但是是虚拟化的，可以就把这个当个interface来看
 * 主进程给渲染进程发消息的话，直接就 webContentSend.事件名 就行了
 * 如 webContentSend.SendDataTest(childWin.webContents, arg.sendData);
 */
export class IpcChannelRendererClass {
  // ipcRenderer
  DownloadProgress: IpcRendererEventListener<number> = null
  DownloadError: IpcRendererEventListener<Boolean> = null
  DownloadPaused: IpcRendererEventListener<Boolean> = null
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
  BrowserTabMouseup: IpcRendererEventListener
  HotUpdateStatus: IpcRendererEventListener<{
    status: string
    message: string
  }> = null
}
