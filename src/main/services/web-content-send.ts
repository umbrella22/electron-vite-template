import { IWebContentSend } from "src/ipc";

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
