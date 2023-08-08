import { BrowserWindow, WebContentsPrintOptions } from "electron";
import { IsUseSysTitle } from "../config/const";
import { otherWindowConfig } from "../config/windowsConfig";
import { printURL } from "@main/config/StaticPath";
import { IpcChannel, IpcMainHandle } from "../../ipc";
import { openDevTools } from "./windowManager";

export function usePrintHandle(): Pick<IpcMainHandle, IpcChannel.GetPrinters | IpcChannel.PrintHandlePrint | IpcChannel.OpenPrintDemoWindow> {
  return {
    [IpcChannel.GetPrinters]: async (event) => {
      return await event.sender.getPrintersAsync();
    },
    [IpcChannel.PrintHandlePrint]: async (event, options: WebContentsPrintOptions) => {
      return new Promise((resolve) => {
        event.sender.print(
          options,
          (success: boolean, failureReason: string) => {
            resolve({ success, failureReason });
          }
        );
      });
    },
    [IpcChannel.OpenPrintDemoWindow]: () => {
      openPrintDemoWindow();
    }
  }
}

let win: BrowserWindow;
export function openPrintDemoWindow() {
  if (win) {
    win.show();
    return;
  }
  win = new BrowserWindow({
    titleBarStyle: IsUseSysTitle ? "default" : "hidden",
    ...Object.assign(otherWindowConfig, {}),
  });
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    openDevTools(win)
  }
  win.loadURL(printURL);
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    win = null;
  });
}
