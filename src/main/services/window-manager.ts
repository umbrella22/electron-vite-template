import config from '@config/index'
import { BrowserWindow } from 'electron'
import { winURL, loadingURL } from '../config/static-path'
import { useProcessException } from '@main/hooks/exception-hook'
import { IsUseSysTitle } from '@main/config/const'
import { mainWindowConfig } from '@main/config/windows-config'

class MainInit {
  public winURL: string = ''
  public shartURL: string = ''
  public loadWindow: BrowserWindow = null
  public mainWindow: BrowserWindow = null
  private childProcessGone = null
  private mainWindowGone = null

  constructor() {
    const { childProcessGone, mainWindowGone } = useProcessException()
    this.winURL = winURL
    this.shartURL = loadingURL
    this.childProcessGone = childProcessGone
    this.mainWindowGone = mainWindowGone
  }
  // 主窗口函数
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
      ...Object.assign(mainWindowConfig, {}),
    })

    // 加载主窗口
    this.mainWindow.loadURL(this.winURL)
    // dom-ready之后显示界面
    this.mainWindow.once('show', () => {
      if (config.UseStartupChart) this.loadWindow.destroy()
    })
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools({
        mode: 'undocked',
        activate: true,
      })
    }
    // 不知道什么原因，反正就是这个窗口里的页面触发了假死时执行
    this.mainWindowGone(this.mainWindow)
    /**
     * 新的gpu崩溃检测，详细参数详见：http://www.electronjs.org/docs/api/app
     * @returns {void}
     * @author zmr (umbrella22)
     * @date 2020-11-27
     */
    this.childProcessGone(this.mainWindow)
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }
  // 加载窗口函数
  loadingWindow(loadingURL: string) {
    this.loadWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        experimentalFeatures: true,
      },
    })

    this.loadWindow.loadURL(loadingURL)
    this.loadWindow.show()
    this.loadWindow.setAlwaysOnTop(true)
    // 延迟两秒可以根据情况后续调快，= =，就相当于个，sleep吧，就那种。 = =。。。
    setTimeout(() => {
      this.createMainWindow()
    }, 1500)
  }
  // 初始化窗口函数
  initWindow() {
    if (config.UseStartupChart) {
      return this.loadingWindow(this.shartURL)
    } else {
      return this.createMainWindow()
    }
  }
}

export function openDevTools(win: BrowserWindow) {
  let devtools = new BrowserWindow()
  devtools.setMenu(null)
  devtools.webContents.on('did-finish-load', () =>
    devtools.setTitle(win.webContents.getTitle()),
  )
  win.webContents.setDevToolsWebContents(devtools.webContents)
  win.webContents.openDevTools({
    mode: 'detach',
  })
  win.on('closed', () => {
    devtools?.close()
  })
  devtools.on('closed', () => {
    devtools = null
  })
}
export default MainInit
