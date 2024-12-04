import { IWebContentSend } from "src/ipc";

/**
 * 主进程给渲染进程发消息
 * 这是一个虚拟化的对象，实际上并没有实现任何方法，也不需要任何实现
 * 主进程给渲染进程发消息的话，直接就 webContentSend.事件名 就行了
 */
export const webContentSend: IWebContentSend = new Proxy(
  {},
  {
    get(target, channel: keyof IWebContentSend) {
      return (webContents: Electron.WebContents, args: unknown) => {
        webContents.send(channel, args);
      };
    },
  }
) as IWebContentSend;
