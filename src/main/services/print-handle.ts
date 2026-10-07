import { BrowserWindow } from 'electron'
import { IsUseSysTitle } from '@main/config/const'
import { otherWindowConfig } from '@main/config/windows-config'
import { printURL } from '@main/config/static-path'
import type { IpcImpl, PrintContract } from '@ipcManager/index'
import { openDevTools } from './window-manager'

// 状态管理 - 窗口实例
let printDemoWin: BrowserWindow | null = null

export const printIpcHandlers: IpcImpl<PrintContract> = {
  /**
   * 获取打印机列表
   */
  getPrinters: async (event) => {
    return event.sender.getPrintersAsync()
  },

  /**
   * 执行打印操作
   */
  exec: async (event, options) => {
    return new Promise((resolve) => {
      event.sender.print(options, (success: boolean, failureReason: string) => {
        resolve({ success, failureReason })
      })
    })
  },

  /**
   * 打开打印演示窗口
   */
  openDemoWindow: async () => {
    openPrintDemoWindow()
  },
}

// 私有辅助方法 - 打开打印演示窗口
function openPrintDemoWindow(): void {
  if (printDemoWin) {
    printDemoWin.show()
    return
  }
  printDemoWin = new BrowserWindow({
    titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
    ...Object.assign(otherWindowConfig, {}),
  })
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === 'development') {
    openDevTools(printDemoWin)
  }
  printDemoWin.loadURL(printURL)
  printDemoWin.on('ready-to-show', () => {
    printDemoWin?.show()
  })
  printDemoWin.on('closed', () => {
    printDemoWin = null
  })
}
