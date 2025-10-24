import { BrowserWindow, WebContentsPrintOptions } from 'electron'
import { IsUseSysTitle } from '@main/config/const'
import { otherWindowConfig } from '@main/config/windows-config'
import { printURL } from '@main/config/static-path'
import { IIpcPrintHandle } from '@ipcManager/index'
import { openDevTools } from './window-manager'

export class PrintHandleClass implements IIpcPrintHandle {
  // 状态管理 - 窗口实例
  private win: BrowserWindow | null = null

  constructor() {
    // 初始化状态
    this.win = null
  }

  // 实现接口中的 never 类型属性（从 IIpcMainHandle 继承而来）
  IsUseSysTitle: never
  AppClose: never
  CheckUpdate: never
  ConfirmUpdate: never
  OpenMessagebox: never
  StartDownload: never
  OpenErrorbox: never
  StartServer: never
  StopServer: never
  HotUpdate: never
  WinReady: never
  OpenWin: never

  /**
   * 获取打印机列表
   */
  GetPrinters: (
    event: Electron.IpcMainInvokeEvent,
  ) => Electron.PrinterInfo[] | Promise<Electron.PrinterInfo[]> = async (
    event,
  ) => {
    return await event.sender.getPrintersAsync()
  }

  /**
   * 执行打印操作
   */
  PrintHandlePrint: (
    event: Electron.IpcMainInvokeEvent,
    options: WebContentsPrintOptions,
  ) =>
    | { success: boolean; failureReason: string }
    | Promise<{ success: boolean; failureReason: string }> = async (
    event,
    options,
  ) => {
    return new Promise((resolve) => {
      event.sender.print(options, (success: boolean, failureReason: string) => {
        resolve({ success, failureReason })
      })
    })
  }

  /**
   * 打开打印演示窗口
   */
  OpenPrintDemoWindow: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = async (_event) => {
    this.openPrintDemoWindow()
  }

  // 私有辅助方法 - 打开打印演示窗口
  private openPrintDemoWindow(): void {
    if (this.win) {
      this.win.show()
      return
    }
    this.win = new BrowserWindow({
      titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
      ...Object.assign(otherWindowConfig, {}),
    })
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      openDevTools(this.win)
    }
    this.win.loadURL(printURL)
    this.win.on('ready-to-show', () => {
      this.win?.show()
    })
    this.win.on('closed', () => {
      this.win = null
    })
  }
}
