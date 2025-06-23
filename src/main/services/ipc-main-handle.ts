import { dialog, BrowserWindow, app } from 'electron'
import { getPreloadFile, winURL } from '../config/static-path'
import { updater } from '../services/hot-updater'
import config from '@config/index'
import { webContentSend } from './web-content-send'

export const ipcMainHandlers = [
  {
    channel: 'OpenWin',
    handler: (event, arg) => {
      const childWin = new BrowserWindow({
        titleBarOverlay: {
          color: '#fff',
        },
        titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
        height: 595,
        useContentSize: true,
        width: 1140,
        autoHideMenuBar: true,
        minWidth: 842,
        frame: config.IsUseSysTitle,
        show: false,
        webPreferences: {
          sandbox: false,
          webSecurity: false,
          devTools: process.env.NODE_ENV === 'development',
          scrollBounce: process.platform === 'darwin',
          preload: getPreloadFile('preload'),
        },
      })
      if (process.env.NODE_ENV === 'development') {
        childWin.webContents.openDevTools({ mode: 'undocked', activate: true })
      }
      childWin.loadURL(winURL + `#${arg.url}`)
      childWin.once('ready-to-show', () => {
        childWin.show()
        if (arg.IsPay) {
          const testUrl = setInterval(() => {
            const Url = childWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              childWin.close()
            }
          }, 1200)
          childWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })
      childWin.once('show', () => {
        webContentSend.SendDataTest(childWin.webContents, arg.sendData)
      })
    },
  },
  {
    channel: 'IsUseSysTitle',
    handler: async () => config.IsUseSysTitle,
  },
  {
    channel: 'AppClose',
    handler: () => {
      app.quit()
    },
  },
  {
    channel: 'OpenMessagebox',
    handler: async (event, arg) => {
      const res = await dialog.showMessageBox(
        BrowserWindow.fromWebContents(event.sender),
        {
          type: arg.type || 'info',
          title: arg.title || '',
          buttons: arg.buttons || [],
          message: arg.message || '',
          noLink: arg.noLink || true,
        },
      )
      return res
    },
  },
  {
    channel: 'OpenErrorbox',
    handler: (event, arg) => {
      dialog.showErrorBox(arg.title, arg.message)
    },
  },
]
