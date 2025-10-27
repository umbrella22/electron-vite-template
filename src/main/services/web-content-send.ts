import { IWebContentSend, IpcChannel } from '@ipcManager/index'

// 方法名到 IpcChannel 的映射
const methodToChannelMap: Record<string, string> = {
  DownloadProgress: IpcChannel.DownloadProgress,
  DownloadError: IpcChannel.DownloadError,
  DownloadPaused: IpcChannel.DownloadPaused,
  DownloadDone: IpcChannel.DownloadDone,
  updateMsg: IpcChannel.updateMsg,
  UpdateProcessStatus: IpcChannel.UpdateProcessStatus,
  SendDataTest: IpcChannel.SendDataTest,
  BrowserViewTabDataUpdate: IpcChannel.BrowserViewTabDataUpdate,
  BrowserViewTabPositionXUpdate: IpcChannel.BrowserViewTabPositionXUpdate,
  BrowserTabMouseup: IpcChannel.BrowserTabMouseup,
  HotUpdateStatus: IpcChannel.HotUpdateStatus,
}

export const webContentSend: IWebContentSend = new Proxy(
  {},
  {
    get(target, prop: string) {
      return (webContents: Electron.WebContents, args?: unknown) => {
        const channelName = methodToChannelMap[prop] || prop
        if (args !== undefined) {
          webContents.send(channelName, args)
        } else {
          webContents.send(channelName)
        }
      }
    },
  },
) as IWebContentSend
