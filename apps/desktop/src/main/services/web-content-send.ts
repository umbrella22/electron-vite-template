import type { IpcEventGroups, IpcEventSender } from 'ipc-contract'

/**
 * 主进程向渲染进程推送事件的类型化入口。
 * 两级访问对应事件组与事件名（即线上通道名 `组:方法`），载荷类型自动推导：
 *
 *   webContentSend.download.progress(win.webContents, 66)
 *   webContentSend.browser.dragEnd(win.webContents)
 */
export const webContentSend: IpcEventSender<IpcEventGroups> = new Proxy(
  {} as IpcEventSender<IpcEventGroups>,
  {
    get(_target, group: string) {
      return new Proxy(
        {},
        {
          get(_target2, method: string) {
            return (webContents: Electron.WebContents, ...args: unknown[]) => {
              webContents.send(`${group}:${method}`, ...args)
            }
          },
        },
      )
    },
  },
)
