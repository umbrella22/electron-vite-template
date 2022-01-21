import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import config from '@config/index'
import Server from '../server'
import { winURL } from '../config/StaticPath'
import { updater } from './HotUpdater'
import { updater as updaterTest } from './HotUpdaterTest'
import DownloadFile from './downloadFile'
import Update from './checkupdate';
import { otherWindowConfig } from "../config/windowsConfig"


export default {
  Mainfunc() {
    const allUpdater = new Update();
    ipcMain.handle('IsUseSysTitle', async () => {
      return config.IsUseSysTitle
    })
    ipcMain.handle('windows-mini', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize()
    })
    ipcMain.handle('window-max', async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.restore()
        return { status: false }
      } else {
        BrowserWindow.fromWebContents(event.sender)?.maximize()
        return { status: true }
      }
    })
    ipcMain.handle('window-close', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close()
    })
    ipcMain.handle('check-update', (event) => {
      allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('confirm-update', () => {
      allUpdater.quitAndInstall()
    })
    ipcMain.handle('app-close', (event, args) => {
      app.quit()
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      })
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      )
    })
    ipcMain.handle('start-server', async () => {
      try {
        const serveStatus = await Server.StatrServer()
        console.log(serveStatus)
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer()
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('hot-update', (event, arg) => {
      updater(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('hot-update-test', (event, arg) => {
      console.log('hot-update-test')
      updaterTest(BrowserWindow.fromWebContents(event.sender));
      app.quit();
    })
    ipcMain.handle('start-download', (event, msg) => {
      new DownloadFile(BrowserWindow.fromWebContents(event.sender), msg.downloadUrl).start()
    })
    ipcMain.handle('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
        ...Object.assign(otherWindowConfig, {})
      })
      // 开发模式下自动开启devtools
      if (process.env.NODE_ENV === 'development') {
        ChildWin.webContents.openDevTools({ mode: 'undocked', activate: true })
      }
      ChildWin.loadURL(winURL + `#${arg.url}`)
      ChildWin.once('ready-to-show', () => {
        ChildWin.show()
        if (arg.IsPay) {
          // 检查支付时候自动关闭小窗口
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close()
            }
          }, 1200)
          ChildWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })
      // 渲染进程显示时触发
      ChildWin.once("show", () => {
        ChildWin.webContents.send('send-data-test', arg.sendData)
      })
    })
  }
}
