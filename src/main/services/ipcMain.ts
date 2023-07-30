import { ipcMain, dialog, BrowserWindow, app, WebContents } from "electron";
import { IsUseSysTitle } from "../config/const";
import Server from "../server";
import { winURL, preloadURL, staticPaths } from "../config/StaticPath";
import { updater } from "./HotUpdater";
import { updater as updaterTest } from "./HotUpdaterTest";
import DownloadFile from "./downloadFile";
import Update from "./checkupdate";
import { otherWindowConfig } from "../config/windowsConfig";
import { usePrintHandle } from "./printHandle";
import { useBrowserHandle } from "./browserHandle";
import { UpdateStatus } from "electron_updater_node_core";

import { IpcMainHandle, IpcChannel, WebContentSend } from "../../ipc";
import { ProgressInfo } from "electron-updater";
import { showOnMyComputer, hideOnMyComputer, checkIsShowOnMyComputer } from "./regeditUtils"

const ALL_UPDATER = new Update();

const ipcMainHandle: IpcMainHandle = {
  [IpcChannel.IsUseSysTitle]: () => {
    return IsUseSysTitle;
  },

  [IpcChannel.WindowMini]: (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  },
  [IpcChannel.WindowMax]: (event) => {
    if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
      BrowserWindow.fromWebContents(event.sender)?.restore();
      return { status: false };
    } else {
      BrowserWindow.fromWebContents(event.sender)?.maximize();
      return { status: true };
    }
  },
  [IpcChannel.WindowClose]: (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  },

  [IpcChannel.CheckUpdate]: (event) => {
    ALL_UPDATER.checkUpdate(BrowserWindow.fromWebContents(event.sender));
  },
  [IpcChannel.ConfirmUpdate]: () => {
    ALL_UPDATER.quitAndInstall();
  },
  [IpcChannel.AppClose]: () => {
    app.quit();
  },
  [IpcChannel.GetStaticPath]: () => {
    return staticPaths;
  },
  [IpcChannel.OpenMessagebox]: async (event, arg) => {
    return dialog.showMessageBox(
      BrowserWindow.fromWebContents(event.sender),
      {
        type: arg.type || "info",
        title: arg.title || "",
        buttons: arg.buttons || [],
        message: arg.message || "",
        noLink: arg.noLink || true,
      }
    );
  },

  [IpcChannel.OpenErrorbox]: (_event, arg) => {
    dialog.showErrorBox(arg.title, arg.message)
  },
  [IpcChannel.StartServer]: async () => {
    try {
      const serveStatus = await Server.StatrServer();
      return serveStatus;
    } catch (error) {
      dialog.showErrorBox("错误", error);
      return ""
    }
  },
  [IpcChannel.StopServer]: async () => {
    try {
      const serveStatus = await Server.StopServer();
      return serveStatus;
    } catch (error) {
      dialog.showErrorBox("错误", error);
      return ""
    }
  },
  [IpcChannel.HotUpdate]: (event) => {
    updater(BrowserWindow.fromWebContents(event.sender))
  },
  [IpcChannel.HotUpdateTest]: async (event, arg) => {
    console.log("hot-update-test");
    try {
      let updateInfo = await updaterTest(
        BrowserWindow.fromWebContents(event.sender)
      );
      if (updateInfo === UpdateStatus.Success) {
        app.quit();
      } else if (updateInfo === UpdateStatus.HaveNothingUpdate) {
        console.log("不需要更新");
      } else if (updateInfo === UpdateStatus.Failed) {
        console.error("更新出错");
      }
    } catch (error) {
      // 更新出错
      console.error("更新出错");
    }
  },
  [IpcChannel.StartDownload]: (event, downloadUrl) => {
    new DownloadFile(
      BrowserWindow.fromWebContents(event.sender),
      downloadUrl
    ).start();
  },
  [IpcChannel.OpenWin]: (_event, arg) => {
    const ChildWin = new BrowserWindow({
      titleBarStyle: IsUseSysTitle ? "default" : "hidden",
      ...Object.assign(otherWindowConfig, {}),
    });
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === "development") {
      ChildWin.webContents.openDevTools({ mode: "undocked", activate: true });
    }
    ChildWin.loadURL(winURL + `#${arg.url}`);
    ChildWin.once("ready-to-show", () => {
      ChildWin.show();
      if (arg.IsPay) {
        // 检查支付时候自动关闭小窗口
        const testUrl = setInterval(() => {
          const Url = ChildWin.webContents.getURL();
          if (Url.includes(arg.PayUrl)) {
            ChildWin.close();
          }
        }, 1200);
        ChildWin.on("close", () => {
          clearInterval(testUrl);
        });
      }
    });
    // 渲染进程显示时触发
    ChildWin.once("show", () => {
      ChildWin.webContents.send("send-data-test", arg.sendData);
    });
  },
  [IpcChannel.CheckShowOnMyComputer]: async () => {
    return await checkIsShowOnMyComputer()
  },
  [IpcChannel.SetShowOnMyComputer]: async (event, bool) => {
    if (bool) {
      return await showOnMyComputer()
    } else {
      return await hideOnMyComputer()
    }
  },
  ...usePrintHandle(),
  ...useBrowserHandle(),
}

type VoidParametersWebContentSendKey = {
  [K in keyof WebContentSend]: Parameters<WebContentSend[K]>[0] extends void ? K : never
}[keyof WebContentSend]

type NotVoidParametersWebContentSendKey = Exclude<keyof WebContentSend, VoidParametersWebContentSendKey>


export function webContentSend<T extends VoidParametersWebContentSendKey>(win: WebContents, channel: T): void;
export function webContentSend<T extends NotVoidParametersWebContentSendKey>(win: WebContents, channel: T, args: Parameters<WebContentSend[T]>[0]): void;

export function webContentSend<T extends VoidParametersWebContentSendKey | NotVoidParametersWebContentSendKey>(win: WebContents, channel: T, args?: Parameters<WebContentSend[T]>[0]): void {
  win.send(channel, args);
}


export function installIpcMain() {
  Object.entries(ipcMainHandle).forEach(([ipcChannelName, ipcListener]) => {
    ipcMain.handle(ipcChannelName, ipcListener)
  })
}


