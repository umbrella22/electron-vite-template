import { BrowserView, BrowserWindow, screen } from 'electron'
import { IpcChannel } from '../../ipc'
import { IIpcBrowserHandle } from '@ipcManager/index'
import { IsUseSysTitle } from '../config/const'
import { otherWindowConfig } from '../config/windows-config'
import { browserDemoURL } from '@main/config/static-path'
import { openDevTools } from './window-manager'

export class BrowserHandleClass implements IIpcBrowserHandle {
  // 状态管理 - 原全局变量转换为私有属性
  private dragTabOffsetX: number = 0
  private lastDragView: BrowserView | null = null
  private emptyWin: BrowserWindow | null = null
  private viewFromWin: BrowserWindow | null = null
  private useNewWindow: BrowserWindow | null = null
  private winList: BrowserWindow[] = []
  private viewList: BrowserView[] = []
  private startScreenY: number | null = null

  constructor() {
    // 初始化状态
    this.dragTabOffsetX = 0
    this.winList = []
    this.viewList = []
    this.startScreenY = null
  }

  OpenBrowserDemoWindow: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = async (event) => {
    this.openBrowserDemoWindow()
  }

  GetLastBrowserDemoTabData: (event: Electron.IpcMainInvokeEvent) =>
    | {
        positionX: number
        bvWebContentsId: number
        title: string
        url: string
      }
    | Promise<{
        positionX: number
        bvWebContentsId: number
        title: string
        url: string
      }> = async (event) => {
    // 拖出tab创建的窗口获取当前tab信息
    if (this.lastDragView) {
      let positionX = -1
      if (this.dragTabOffsetX) {
        const currentWin = BrowserWindow.fromBrowserView(this.lastDragView)
        const bound = currentWin.getBounds()
        const { x, y } = screen.getCursorScreenPoint()
        positionX = x - bound.x - this.dragTabOffsetX
      }
      return {
        positionX,
        bvWebContentsId: this.lastDragView.webContents.id,
        title: this.lastDragView.webContents.getTitle(),
        url: this.lastDragView.webContents.getURL(),
      }
    }
    this.openBrowserDemoWindow()
    return {
      positionX: -1,
      bvWebContentsId: -1,
      title: '',
      url: '',
    }
  }

  AddDefaultBrowserView: (
    event: Electron.IpcMainInvokeEvent,
  ) => { bvWebContentsId: number } | Promise<{ bvWebContentsId: number }> =
    async (event) => {
      // 添加tab的内容
      const currentWin = BrowserWindow.fromWebContents(event.sender)
      let bvWebContentsId = -1
      if (currentWin) {
        const bv = this.createDefaultBrowserView(currentWin)
        bvWebContentsId = bv.webContents.id
      }
      return { bvWebContentsId }
    }

  SelectBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    bvWebContentsId: number,
  ) => boolean | Promise<boolean> = async (event, bvWebContentsId) => {
    // 选择tab为当前tab
    const currentWin = BrowserWindow.fromWebContents(event.sender)
    if (currentWin) {
      const bvList = currentWin.getBrowserViews()
      for (let i = 0; i < bvList.length; i++) {
        const bv = bvList[i]
        if (bv.webContents.id === bvWebContentsId) {
          currentWin.setTopBrowserView(bv)
          return true
        }
      }
    }
    return false
  }

  DestroyBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    bvWebContentsId: number,
  ) => void | Promise<void> = async (event, bvWebContentsId) => {
    // 关闭tab
    const currentWin = BrowserWindow.fromWebContents(event.sender)
    if (currentWin) {
      const bvList = currentWin.getBrowserViews()
      for (let i = 0; i < bvList.length; i++) {
        const bv = bvList[i]
        if (bv.webContents.id === bvWebContentsId) {
          currentWin.removeBrowserView(bv)
          if (bvList.length === 1) {
            currentWin.close()
          }
          bv.webContents.close()
          break
        }
      }
    }
  }

  BrowserDemoTabJumpToUrl: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      bvWebContentsId: number
      url: string
    },
  ) => void | Promise<void> = async (event, { bvWebContentsId, url }) => {
    // 跳转
    const currentView = this.viewList.find(
      (v) => v.webContents.id === bvWebContentsId,
    )
    if (currentView) {
      currentView.webContents.loadURL(url)
    }
  }

  BrowserTabMousedown: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      offsetX: number
    },
  ) => void | Promise<void> = async (event, { offsetX }) => {
    this.dragTabOffsetX = offsetX
  }

  BrowserTabMousemove: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      screenX: number
      screenY: number
      startX: number
      startY: number
      bvWebContentsId: number
    },
  ) => void | Promise<void> = async (
    event,
    {
      screenX, // 鼠标在显示器的x坐标
      screenY, // 鼠标在显示器的y坐标
      startX, // 按下鼠标时在窗口的x坐标
      startY, // 按下鼠标时在窗口的y坐标
      bvWebContentsId,
    },
  ) => {
    if (!this.startScreenY) {
      this.startScreenY = screenY
    }
    if (!this.viewFromWin) {
      this.viewFromWin = BrowserWindow.fromWebContents(event.sender)
    }
    let movingWin: BrowserWindow | null = null
    const currentView = this.viewList.find(
      (v) => v.webContents.id === bvWebContentsId,
    )
    this.lastDragView = currentView || null
    if (this.viewFromWin && currentView) {
      if (this.viewFromWin.getBrowserViews().length <= 1) {
        movingWin = this.viewFromWin
      } else {
        if (this.useNewWindow) {
          movingWin = this.useNewWindow
          this.viewFromWin = this.useNewWindow
        } else if (
          this.startScreenY &&
          Math.abs(this.startScreenY - screenY) > 40
        ) {
          // 如果Y差值大于40，则移动到新窗口
          if (this.emptyWin) {
            this.useNewWindow = this.emptyWin
            this.useNewWindow.setHasShadow(true)
            this.emptyWin = null
          } else {
            this.useNewWindow = this.openBrowserDemoWindow()
          }
          this.removeBrowserView(this.viewFromWin, currentView)
          this.addBrowserView(this.useNewWindow, currentView)
          this.viewFromWin = this.useNewWindow
          movingWin = this.useNewWindow
          movingWin.show()
          this.startScreenY = screenY

          // 设置拖拽的 tab 位置
          const bound = movingWin.getBounds()
          movingWin.webContents.send(IpcChannel.BrowserViewTabPositionXUpdate, {
            dragTabOffsetX: this.dragTabOffsetX,
            positionX: screenX - bound.x,
            bvWebContentsId: currentView.webContents.id,
          })
        } else {
          // 内部移动 movingWin = null
          for (let i = 0; i < this.winList.length; i++) {
            const existsWin = this.winList[i]
            const bound = existsWin.getBounds()
            if (
              existsWin !== this.emptyWin &&
              bound.x < screenX &&
              bound.x + bound.width > screenX &&
              // 在tabbar的范围
              bound.y + 30 < screenY &&
              bound.y + 70 > screenY
            ) {
              existsWin.webContents.send(
                IpcChannel.BrowserViewTabPositionXUpdate,
                {
                  dragTabOffsetX: this.dragTabOffsetX,
                  positionX: screenX - bound.x,
                  bvWebContentsId: currentView.webContents.id,
                },
              )
              return
            }
          }
        }
      }
      if (movingWin) {
        movingWin.setPosition(screenX - startX, screenY - startY)
        // 判断是否需要添加进新窗口
        for (let i = 0; i < this.winList.length; i++) {
          const existsWin = this.winList[i]
          const bound = existsWin.getBounds()
          const tabbarCenterY = bound.y + 50 // titlebar 30 tabbar 40 / 2
          if (
            existsWin !== this.emptyWin &&
            existsWin !== movingWin &&
            bound.x < screenX &&
            bound.x + bound.width > screenX &&
            Math.abs(tabbarCenterY - screenY) < 20
          ) {
            this.removeBrowserView(movingWin, currentView)
            if (movingWin.getBrowserViews().length === 0) {
              this.emptyWin = movingWin
              this.emptyWin.setHasShadow(false)
              this.emptyWin.setAlwaysOnTop(false)
              this.emptyWin.setBounds(bound)
              if (this.emptyWin === this.useNewWindow) {
                this.useNewWindow = null
              }
            }
            this.addBrowserView(existsWin, currentView)
            this.viewFromWin = existsWin
            this.startScreenY = screenY
            return
          }
        }
      }
    }
  }

  BrowserTabMouseup: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = async (event) => {
    this.winList.map((win) => {
      if (win?.getBrowserViews().length === 0) {
        win?.close()
      } else {
        win?.setAlwaysOnTop(false)
        win?.webContents?.send(IpcChannel.BrowserTabMouseup)
      }
    })
    this.useNewWindow = null
    this.startScreenY = null
    this.emptyWin = null
    this.viewFromWin = null
  }

  // 私有辅助方法 - 原函数转换为类方法
  private openBrowserDemoWindow(): BrowserWindow {
    const win = new BrowserWindow({
      titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
      ...Object.assign(otherWindowConfig, {}),
    })
    // // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      openDevTools(win)
    }
    win.loadURL(browserDemoURL)
    win.on('ready-to-show', () => {
      win.show()
    })
    win.on('closed', () => {
      const findIndex = this.winList.findIndex((v) => win === v)
      if (findIndex !== -1) {
        this.winList.splice(findIndex, 1)
      }
    })
    this.winList.push(win)
    return win
  }

  private createDefaultBrowserView(
    win: BrowserWindow,
    defaultUrl = 'https://www.bing.com',
  ): BrowserView {
    const [winWidth, winHeight] = win.getSize()
    const bv = new BrowserView()
    win.addBrowserView(bv)
    // title-bar 30px  tabbar 40px  searchbar 40px
    bv.setBounds({ x: 0, y: 110, width: winWidth, height: winHeight - 110 })
    bv.setAutoResize({
      width: true,
      height: true,
    })
    bv.webContents.on('did-finish-load', () => {
      console.log(bv.webContents.getURL())
    })
    bv.webContents.loadURL(defaultUrl)
    bv.webContents.on('page-title-updated', (event, title) => {
      const parentBw = BrowserWindow.fromBrowserView(bv)
      if (parentBw) {
        this.freshTabData(parentBw, bv, 1)
      }
    })
    bv.webContents.on('destroyed', () => {
      const findIndex = this.viewList.findIndex((v) => v === bv)
      if (findIndex !== -1) {
        this.viewList.splice(findIndex, 1)
      }
    })
    bv.webContents.setWindowOpenHandler((details) => {
      const parentBw = BrowserWindow.fromBrowserView(bv)
      this.createDefaultBrowserView(parentBw, details.url)
      return { action: 'deny' }
    })
    this.freshTabData(win, bv, 1)
    this.viewList.push(bv)
    return bv
  }

  private addBrowserView(win: BrowserWindow, view: BrowserView): void {
    if (BrowserWindow.fromBrowserView(view) !== win) {
      win.addBrowserView(view)
      win.show()
      win.setAlwaysOnTop(true)
    }
    this.freshTabData(win, view, 1)
  }

  private removeBrowserView(win: BrowserWindow, view: BrowserView): void {
    if (BrowserWindow.fromBrowserView(view) === win) {
      win.removeBrowserView(view)
    }
    this.freshTabData(win, view, -1)
  }

  private freshTabData(
    win: BrowserWindow,
    bv: BrowserView,
    status: -1 | 1,
  ): void {
    console.log('freshTabData', bv.webContents.id, status)
    console.log('IpcChannel', IpcChannel.BrowserViewTabDataUpdate)
    win.webContents.send(IpcChannel.BrowserViewTabDataUpdate, {
      bvWebContentsId: bv.webContents.id,
      title: bv.webContents.getTitle(),
      url: bv.webContents.getURL(),
      status: status,
    })
  }
}
