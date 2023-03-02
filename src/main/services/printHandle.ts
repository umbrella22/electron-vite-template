import { BrowserWindow, ipcMain, WebContentsPrintOptions } from "electron";
import { IsUseSysTitle } from "../config/const";
import { otherWindowConfig } from "../config/windowsConfig";
import { printURL } from "@main/config/StaticPath";

export function usePrintHandle() {
  ipcMain.handle("getPrinters", async (event) => {
    return await event.sender.getPrintersAsync();
  });

  ipcMain.handle(
    "printHandlePrint",
    async (event, options: WebContentsPrintOptions) => {
      return new Promise((resolve) => {
        event.sender.print(
          options,
          (success: boolean, failureReason: string) => {
            resolve({ success, failureReason });
          }
        );
      });
    }
  );

  ipcMain.handle("openPrintDemoWindow", () => {
    openPrintDemoWindow();
  });
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
  win.loadURL(printURL);
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    win = null;
  });
}
