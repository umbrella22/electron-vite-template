import { BaseWindow, screen, WebContents, WebContentsView } from 'electron'
import { IpcChannel } from '../../ipc'
import { IIpcBrowserHandle } from '@ipcManager/index'
import { IsUseSysTitle } from '../config/const'
import { otherWindowConfig } from '../config/windows-config'
import { browserDemoURL } from '@main/config/static-path'

export class BrowserHandleClass implements IIpcBrowserHandle {
  // 状态管理 - 原全局变量转换为私有属性
  private dragTabOffsetX: number = 0
  private lastDragView: WebContentsView | null = null
  private emptyWin: BaseWindow | null = null
  private viewFromWin: BaseWindow | null = null
  private useNewWindow: BaseWindow | null = null
  private startScreenY: number | null = null
  private winViewBindList: {
    win: BaseWindow
    tabbarView: WebContentsView
    viewList: WebContentsView[]
  }[] = []

  constructor() {
    // 初始化状态
    this.dragTabOffsetX = 0
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
        browserContentViewWebContentsId: number
        title: string
        url: string
      }
    | Promise<{
        positionX: number
        browserContentViewWebContentsId: number
        title: string
        url: string
      }> = async (event) => {
    // 拖出tab创建的窗口获取当前tab信息
    if (this.lastDragView) {
      let positionX = -1
      if (this.dragTabOffsetX) {
        const currentWin = this.getWinFromView(this.lastDragView)
        if (currentWin) {
          const bound = currentWin.getBounds()
          const { x, y } = screen.getCursorScreenPoint()
          positionX = x - bound.x - this.dragTabOffsetX
        }
      }
      return {
        positionX,
        browserContentViewWebContentsId: this.lastDragView.webContents.id,
        title: this.lastDragView.webContents.getTitle(),
        url: this.lastDragView.webContents.getURL(),
      }
    }
    this.openBrowserDemoWindow()
    return {
      positionX: -1,
      browserContentViewWebContentsId: -1,
      title: '',
      url: '',
    }
  }

  AddDefaultBrowserView: (
    event: Electron.IpcMainInvokeEvent,
  ) =>
    | { browserContentViewWebContentsId: number }
    | Promise<{ browserContentViewWebContentsId: number }> = async (event) => {
    // 添加tab的内容
    const currentWin = this.getWinFromTabbarWebContents(event.sender)
    let browserContentViewWebContentsId = -1
    if (currentWin) {
      const browserContentView = this.createDefaultBrowserView(currentWin)
      browserContentViewWebContentsId = browserContentView.webContents.id
    }
    return { browserContentViewWebContentsId }
  }

  SelectBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    browserContentViewWebContentsId: number,
  ) => boolean | Promise<boolean> = async (
    event,
    browserContentViewWebContentsId,
  ) => {
    // 选择tab为当前tab
    const currentWin = this.getWinFromTabbarWebContents(event.sender)
    let selected = false
    if (currentWin) {
      const viewList = this.getViewListFromWin(currentWin)
      for (let i = 0; i < viewList.length; i++) {
        const browserContentView = viewList[i]
        browserContentView.setVisible(
          browserContentView.webContents.id === browserContentViewWebContentsId,
        )
        if (
          browserContentView.webContents.id === browserContentViewWebContentsId
        ) {
          browserContentView.setVisible(true)
          selected = true
        }
      }
    }
    return selected
  }

  DestroyBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    browserContentViewWebContentsId: number,
  ) => void | Promise<void> = async (
    event,
    browserContentViewWebContentsId,
  ) => {
    // 关闭tab
    const currentWin = this.getWinFromTabbarWebContents(event.sender)
    if (currentWin) {
      const viewList = this.getViewListFromWin(currentWin)
      for (let i = 0; i < viewList.length; i++) {
        const browserContentView = viewList[i]
        if (
          browserContentView.webContents.id === browserContentViewWebContentsId
        ) {
          currentWin.contentView.removeChildView(browserContentView)
          if (viewList.length === 1) {
            currentWin.close()
          }
          browserContentView.webContents.close()
          break
        }
      }
    }
  }

  BrowserDemoTabJumpToUrl: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      browserContentViewWebContentsId: number
      url: string
    },
  ) => void | Promise<void> = async (
    event,
    { browserContentViewWebContentsId, url },
  ) => {
    // 跳转
    const currentView = this.getBrowserContentViewFromWebContents(event.sender)
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
      browserContentViewWebContentsId: number
    },
  ) => void | Promise<void> = async (
    event,
    {
      screenX, // 鼠标在显示器的x坐标
      screenY, // 鼠标在显示器的y坐标
      startX, // 按下鼠标时在窗口的x坐标
      startY, // 按下鼠标时在窗口的y坐标
      browserContentViewWebContentsId,
    },
  ) => {
    if (!this.startScreenY) {
      this.startScreenY = screenY
    }
    if (!this.viewFromWin) {
      this.viewFromWin = this.getWinFromTabbarWebContents(event.sender)
    }
    let movingWin: BaseWindow | null = null
    const currentView = this.getBrowserContentViewFromWebContentsId(
      browserContentViewWebContentsId,
    )

    this.lastDragView = currentView || null
    if (this.viewFromWin && currentView) {
      if (this.getViewListFromWin(this.viewFromWin).length <= 1) {
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
          const tabbarView = this.getTabbarViewFromWin(movingWin)
          if (tabbarView) {
            tabbarView.webContents.send(
              IpcChannel.BrowserViewTabPositionXUpdate,
              {
                dragTabOffsetX: this.dragTabOffsetX,
                positionX: screenX - bound.x,
                browserContentViewWebContentsId: currentView.webContents.id,
              },
            )
          }
        } else {
          // 内部移动 movingWin = null
          for (let i = 0; i < this.winViewBindList.length; i++) {
            const existsWin = this.winViewBindList[i].win
            const bound = existsWin.getBounds()
            if (
              existsWin !== this.emptyWin &&
              bound.x < screenX &&
              bound.x + bound.width > screenX &&
              // 在tabbar的范围
              bound.y + 30 < screenY &&
              bound.y + 70 > screenY
            ) {
              const tabbarView = this.getTabbarViewFromWin(existsWin)
              if (tabbarView) {
                tabbarView.webContents.send(
                  IpcChannel.BrowserViewTabPositionXUpdate,
                  {
                    dragTabOffsetX: this.dragTabOffsetX,
                    positionX: screenX - bound.x,
                    browserContentViewWebContentsId: currentView.webContents.id,
                  },
                )
              }
              return
            }
          }
        }
      }
      if (movingWin) {
        movingWin.setPosition(screenX - startX, screenY - startY)
        // 判断是否需要添加进新窗口
        for (let i = 0; i < this.winViewBindList.length; i++) {
          const existsWin = this.winViewBindList[i].win
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
            if (this.getViewListFromWin(movingWin).length === 0) {
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
    this.winViewBindList.map((item) => {
      const win = item.win
      if (this.getViewListFromWin(win).length === 0) {
        win?.close()
      } else {
        win?.setAlwaysOnTop(false)
        this.getTabbarViewFromWin(win)?.webContents.send(
          IpcChannel.BrowserTabMouseup,
        )
      }
    })
    this.useNewWindow = null
    this.startScreenY = null
    this.emptyWin = null
    this.viewFromWin = null
  }

  // 私有辅助方法 - 原函数转换为类方法
  private openBrowserDemoWindow(): BaseWindow {
    const win = new BaseWindow({
      titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
      ...Object.assign(otherWindowConfig, {}),
    })

    const view = new WebContentsView({
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        webSecurity: false,
        // 如果是开发模式可以使用devTools
        devTools: process.env.NODE_ENV === 'development',
        // 在macos中启用橡皮动画
        scrollBounce: process.platform === 'darwin',
      },
    })
    view.setBounds({
      x: 0,
      y: 0,
      width: otherWindowConfig.width,
      height: otherWindowConfig.height,
    })
    win.contentView.addChildView(view)

    const winViewData = {
      win,
      tabbarView: view,
      viewList: [],
    }

    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      view.webContents.openDevTools()
    }
    view.webContents.loadURL(browserDemoURL)
    view.webContents.on('dom-ready', () => {
      win.show()
    })
    win.on('resize', () => {
      const bounds = win.getBounds()
      winViewData.tabbarView.setBounds({
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height,
      })
      for (const view of winViewData.viewList) {
        view.setBounds({
          x: 0,
          y: 110,
          width: bounds.width,
          height: bounds.height - 110,
        })
      }
    })
    win.on('closed', () => {
      view.webContents.closeDevTools()
      view.webContents.close()
      const findIndex = this.winViewBindList.findIndex((v) => win === v.win)
      if (findIndex !== -1) {
        const item = this.winViewBindList.splice(findIndex, 1)[0]
        item.tabbarView.webContents.close()
        item.viewList.forEach((v) => {
          v.webContents.close()
        })
      }
    })
    this.winViewBindList.push(winViewData)
    return win
  }

  private createDefaultBrowserView(
    win: BaseWindow,
    defaultUrl = 'https://www.bing.com',
  ): WebContentsView {
    const view = new WebContentsView()
    this.addViewToWin(win, view)
    // title-bar 30px  tabbar 40px  searchbar 40px
    const bounds = win.getBounds()
    view.setBounds({
      x: 0,
      y: 110,
      width: bounds.width,
      height: bounds.height - 110,
    })
    view.webContents.on('did-finish-load', () => {
      console.log(view.webContents.getURL())
    })
    view.webContents.loadURL(defaultUrl)
    view.webContents.on('page-title-updated', (event, title) => {
      this.freshTabData(null, view, 1)
    })
    view.webContents.on('destroyed', () => {
      this.removeBrowserView(null, view)
    })
    view.webContents.setWindowOpenHandler((details) => {
      const parentBw = this.getWinFromView(view)
      this.createDefaultBrowserView(parentBw, details.url)
      return { action: 'deny' }
    })
    this.freshTabData(win, view, 1)

    return view
  }

  private addBrowserView(win: BaseWindow, view: WebContentsView): void {
    if (this.getWinFromView(view) !== win) {
      this.addViewToWin(win, view)
      const bounds = win.getBounds()
      view.setBounds({
        x: 0,
        y: 110,
        width: bounds.width,
        height: bounds.height - 110,
      })
      win.show()
      win.setAlwaysOnTop(true)
    }
    this.freshTabData(win, view, 1)
  }

  private removeBrowserView(
    win: BaseWindow | null,
    view: WebContentsView,
  ): void {
    this.removeViewFromWinByView(view)
    this.freshTabData(win, view, -1)
  }

  private freshTabData(
    win: BaseWindow | null,
    view: WebContentsView,
    status: -1 | 1,
  ): void {
    console.log('freshTabData', view.webContents.id, status)
    console.log('IpcChannel', IpcChannel.BrowserViewTabDataUpdate)

    const _win = win ?? this.getWinFromView(view)
    if (_win) {
      this.getTabbarViewFromWin(_win)?.webContents.send(
        IpcChannel.BrowserViewTabDataUpdate,
        {
          browserContentViewWebContentsId: view.webContents.id,
          title: view.webContents.getTitle(),
          url: view.webContents.getURL(),
          status: status,
        },
      )
    }
  }

  private getWinFromView(view: WebContentsView): BaseWindow | null {
    for (const item of this.winViewBindList) {
      if (item.viewList.includes(view)) {
        return item.win
      }
    }
    return null
  }

  private getWinFromTabbarWebContents(
    webContents: WebContents,
  ): BaseWindow | null {
    for (const item of this.winViewBindList) {
      if (item.tabbarView.webContents === webContents) {
        return item.win
      }
    }
    return null
  }

  private getViewListFromWin(win: BaseWindow): WebContentsView[] {
    let list = []
    const item = this.winViewBindList.find((item) => item.win === win)
    if (item) {
      list = item.viewList
    }
    return list
  }

  private getTabbarViewFromWin(win: BaseWindow): WebContentsView {
    let tabbarView = null
    const item = this.winViewBindList.find((item) => item.win === win)
    if (item) {
      tabbarView = item.tabbarView
    }
    return tabbarView
  }

  private addViewToWin(win: BaseWindow, view: WebContentsView): void {
    const item = this.winViewBindList.find((item) => item.win === win)
    if (item) {
      win.contentView.addChildView(view)
      item.viewList.push(view)
      for (const itemView of item.viewList) {
        if (itemView !== view) {
          itemView.setVisible(false)
        }
      }
    }
  }

  private getBrowserContentViewFromWebContents(
    webContents: WebContents,
  ): WebContentsView | null {
    for (const item of this.winViewBindList) {
      const browserContentView = item.viewList.find(
        (v) => v.webContents === webContents,
      )
      if (browserContentView) {
        return browserContentView
      }
    }
    return null
  }

  private getBrowserContentViewFromWebContentsId(
    webContentsId: number,
  ): WebContentsView | null {
    for (const item of this.winViewBindList) {
      const browserContentView = item.viewList.find(
        (v) => v.webContents.id === webContentsId,
      )
      if (browserContentView) {
        return browserContentView
      }
    }
    return null
  }

  private getBrowserTabbarViewFromWebContents(
    webContents: WebContents,
  ): WebContentsView | null {
    for (const item of this.winViewBindList) {
      if (item.tabbarView.webContents === webContents) {
        return item.tabbarView
      }
    }
    return null
  }

  private removeViewFromWin(win: BaseWindow, view: WebContentsView): void {
    const item = this.winViewBindList.find((item) => item.win === win)
    if (item) {
      const findIndex = item.viewList.findIndex((v) => v === view)
      if (findIndex !== -1) {
        item.viewList.splice(findIndex, 1)
      }
    }
  }

  private removeViewFromWinByView(view: WebContentsView) {
    for (const item of this.winViewBindList) {
      const findIndex = item.viewList.findIndex((v) => v === view)
      if (findIndex !== -1) {
        item.viewList.splice(findIndex, 1)
        this.removeViewFromWin(item.win, view)
        break
      }
    }
  }
}
