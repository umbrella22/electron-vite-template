import { dialog, BrowserWindow, app } from 'electron'
import { winURL, staticPaths } from '../config/static-path'
import DownloadFile from '../services/download-file'
import Update from '../services/check-update'
import config from '@config/index'
import type { IpcImpl, AppContract } from '@ipcManager/index'
import { webContentSend } from './web-content-send'
import { IsUseSysTitle } from '@main/config/const'
import { otherWindowConfig } from '@main/config/windows-config'
import Store from 'electron-store'

const store = new Store()
const allUpdater = new Update()

export const appIpcHandlers: IpcImpl<AppContract> = {
  startDownload: (event, downloadUrl) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return
    new DownloadFile(window, downloadUrl).start()
  },
  startServer: async () => {
    dialog.showErrorBox('error', 'API is obsolete')
    return 'API is obsolete'
  },
  stopServer: async () => {
    dialog.showErrorBox('error', 'API is obsolete')
    return 'API is obsolete'
  },
  getStaticPath: () => staticPaths,
  openWin: (_event, arg) => {
    const childWin = new BrowserWindow({
      titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
      ...Object.assign(otherWindowConfig, {}),
    })
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      childWin.webContents.openDevTools({ mode: 'undocked', activate: true })
    }
    childWin.loadURL(winURL + `#${arg.url}`)
    childWin.once('ready-to-show', () => {
      // childWin.show()
      if (arg.isPay) {
        // 检查支付时候自动关闭小窗口
        const testUrl = setInterval(() => {
          const Url = childWin.webContents.getURL()
          if (arg.payUrl && Url.includes(arg.payUrl)) {
            childWin.close()
          }
        }, 1200)
        childWin.on('close', () => {
          clearInterval(testUrl)
        })
      }
    })
    // 渲染进程显示时触发
    childWin.once('show', () => {
      webContentSend.window.sendData(childWin.webContents, arg.sendData)
    })
  },
  isUseSysTitle: () => config.IsUseSysTitle,
  quit: () => {
    app.quit()
  },
  checkUpdate: (event) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    allUpdater.checkUpdate(windows)
  },
  confirmUpdate: () => {
    allUpdater.quitAndInstall()
  },
  openMessagebox: async (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      throw new Error('No window found for event sender')
    }
    return dialog.showMessageBox(window, {
      type: arg.type || 'info',
      title: arg.title || '',
      buttons: arg.buttons || [],
      message: arg.message || '',
      noLink: arg.noLink || true,
    })
  },
  openErrorbox: (_event, arg) => {
    dialog.showErrorBox(arg.title, arg.message)
  },
  winReady: (event) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    windows.show()
  },
  // TODO: 实现"我的电脑"显示检查功能
  checkShowOnMyComputer: async () => {
    console.log('checkShowOnMyComputer - Not implemented yet')
    return false
  },
  // TODO: 实现"我的电脑"显示设置功能
  setShowOnMyComputer: (_event, show) => {
    console.log('setShowOnMyComputer - Not implemented yet', show)
    return show
  },
  setStoreValue: (_event, args) => {
    store.set(args.key, args.value)
  },
  getStoreValue: (_event, args) => {
    return store.get(args.key)
  },
  deleteStoreValue: (_event, args) => {
    store.delete(args.key)
  },
}
