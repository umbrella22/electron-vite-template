import { BaseWindow, screen, WebContents, WebContentsView } from 'electron'
import type { BrowserContract, IpcImpl } from '@ipcManager/index'
import { webContentSend } from './web-content-send'
import { IsUseSysTitle } from '../config/const'
import { otherWindowConfig } from '../config/windows-config'
import { browserDemoURL, preloadPath } from '@main/config/static-path'

// 状态管理
let dragTabOffsetX: number = 0
let lastDragView: WebContentsView | null = null
let emptyWin: BaseWindow | null = null
let viewFromWin: BaseWindow | null = null
let useNewWindow: BaseWindow | null = null
let startScreenY: number | null = null

interface WinViewData {
  win: BaseWindow
  tabbarView: WebContentsView
  viewList: WebContentsView[]
}
const winViewBindList: WinViewData[] = []

export const browserIpcHandlers: IpcImpl<BrowserContract> = {
  openDemoWindow: async () => {
    openBrowserDemoWindow()
  },

  getLastDraggedTabData: async () => {
    // 拖出tab创建的窗口获取当前tab信息
    if (lastDragView) {
      let positionX = -1
      if (dragTabOffsetX) {
        const currentWin = getWinFromView(lastDragView)
        if (currentWin) {
          const bound = currentWin.getBounds()
          const { x, y } = screen.getCursorScreenPoint()
          positionX = x - bound.x - dragTabOffsetX
        }
      }
      return {
        positionX,
        browserContentViewWebContentsId: lastDragView.webContents.id,
        title: lastDragView.webContents.getTitle(),
        url: lastDragView.webContents.getURL(),
      }
    }
    openBrowserDemoWindow()
    return {
      positionX: -1,
      browserContentViewWebContentsId: -1,
      title: '',
      url: '',
    }
  },

  addDefaultView: async (event) => {
    // 添加tab的内容
    const currentWin = getWinFromTabbarWebContents(event.sender)
    let browserContentViewWebContentsId = -1
    if (currentWin) {
      const browserContentView = createDefaultBrowserView(currentWin)
      browserContentViewWebContentsId = browserContentView.webContents.id
    }
    return { browserContentViewWebContentsId }
  },

  selectTab: async (
    event,
    browserContentViewWebContentsId,
  ) => {
    // 选择tab为当前tab
    const currentWin = getWinFromTabbarWebContents(event.sender)
    let selected = false
    if (currentWin) {
      const viewList = getViewListFromWin(currentWin)
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
  },

  destroyTab: async (
    event,
    browserContentViewWebContentsId,
  ) => {
    // 关闭tab
    const currentWin = getWinFromTabbarWebContents(event.sender)
    if (currentWin) {
      const viewList = getViewListFromWin(currentWin)
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
  },

  jumpToUrl: async (
    _event,
    { browserContentViewWebContentsId, url },
  ) => {
    // event.sender 来自 tabView 是导航栏
    const currentView = getBrowserContentViewFromWebContentsId(
      browserContentViewWebContentsId,
    )
    if (currentView) {
      // 跳转
      currentView.webContents.loadURL(url)
    }
  },

  mousedown: async (_event, { offsetX }) => {
    dragTabOffsetX = offsetX
  },

  mousemove: async (
    event,
    {
      screenX, // 鼠标在显示器的x坐标
      screenY, // 鼠标在显示器的y坐标
      startX, // 按下鼠标时在窗口的x坐标
      startY, // 按下鼠标时在窗口的y坐标
      browserContentViewWebContentsId,
    },
  ) => {
    if (!startScreenY) {
      startScreenY = screenY
    }
    if (!viewFromWin) {
      viewFromWin = getWinFromTabbarWebContents(event.sender)
    }
    let movingWin: BaseWindow | null = null
    const currentView = getBrowserContentViewFromWebContentsId(
      browserContentViewWebContentsId,
    )

    lastDragView = currentView || null
    if (viewFromWin && currentView) {
      if (getViewListFromWin(viewFromWin).length <= 1) {
        movingWin = viewFromWin
      } else {
        if (useNewWindow) {
          movingWin = useNewWindow
          viewFromWin = useNewWindow
        } else if (
          startScreenY &&
          Math.abs(startScreenY - screenY) > 40
        ) {
          // 如果Y差值大于40，则移动到新窗口
          if (emptyWin) {
            useNewWindow = emptyWin
            useNewWindow.setHasShadow(true)
            emptyWin = null
          } else {
            useNewWindow = openBrowserDemoWindow()
          }
          removeBrowserView(viewFromWin, currentView)
          addBrowserView(useNewWindow, currentView)
          viewFromWin = useNewWindow
          movingWin = useNewWindow
          movingWin.show()
          startScreenY = screenY

          // 设置拖拽的 tab 位置
          const bound = movingWin.getBounds()
          const tabbarView = getTabbarViewFromWin(movingWin)
          if (tabbarView) {
            webContentSend.browser.tabPositionXUpdate(
              tabbarView.webContents,
              {
                dragTabOffsetX: dragTabOffsetX,
                positionX: screenX - bound.x,
                browserContentViewWebContentsId: currentView.webContents.id,
              },
            )
          }
        } else {
          // 内部移动 movingWin = null
          for (let i = 0; i < winViewBindList.length; i++) {
            const existsWin = winViewBindList[i].win
            const bound = existsWin.getBounds()
            if (
              existsWin !== emptyWin &&
              bound.x < screenX &&
              bound.x + bound.width > screenX &&
              // 在tabbar的范围
              bound.y + 30 < screenY &&
              bound.y + 70 > screenY
            ) {
              const tabbarView = getTabbarViewFromWin(existsWin)
              if (tabbarView) {
                webContentSend.browser.tabPositionXUpdate(
                  tabbarView.webContents,
                  {
                    dragTabOffsetX: dragTabOffsetX,
                    positionX: screenX - bound.x,
                    browserContentViewWebContentsId:
                      currentView.webContents.id,
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
        for (let i = 0; i < winViewBindList.length; i++) {
          const existsWin = winViewBindList[i].win
          const bound = existsWin.getBounds()
          const tabbarCenterY = bound.y + 50 // titlebar 30 tabbar 40 / 2
          if (
            existsWin !== emptyWin &&
            existsWin !== movingWin &&
            bound.x < screenX &&
            bound.x + bound.width > screenX &&
            Math.abs(tabbarCenterY - screenY) < 20
          ) {
            removeBrowserView(movingWin, currentView)
            if (getViewListFromWin(movingWin).length === 0) {
              emptyWin = movingWin
              emptyWin.setHasShadow(false)
              emptyWin.setAlwaysOnTop(false)
              emptyWin.setBounds(bound)
              if (emptyWin === useNewWindow) {
                useNewWindow = null
              }
            }
            addBrowserView(existsWin, currentView)
            viewFromWin = existsWin
            startScreenY = screenY
            return
          }
        }
      }
    }
  },

  mouseup: async () => {
    winViewBindList.map((item) => {
      const win = item.win
      if (getViewListFromWin(win).length === 0) {
        win?.close()
      } else {
        win?.setAlwaysOnTop(false)
        webContentSend.browser.dragEnd(item.tabbarView.webContents)
      }
    })
    useNewWindow = null
    startScreenY = null
    emptyWin = null
    viewFromWin = null
  },
}

// 私有辅助方法

function openBrowserDemoWindow(): BaseWindow {
  const win = new BaseWindow({
    titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
    ...Object.assign(otherWindowConfig, {}),
  })

  const view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: preloadPath,
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
    width: otherWindowConfig.width!,
    height: otherWindowConfig.height!,
  })
  win.contentView.addChildView(view)

  const winViewData: WinViewData = {
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
    // 窗口关闭时子视图的 webContents 可能已被销毁（返回 undefined）
    view.webContents?.closeDevTools()
    view.webContents?.close()
    const findIndex = winViewBindList.findIndex((v) => win === v.win)
    if (findIndex !== -1) {
      const item = winViewBindList.splice(findIndex, 1)[0]
      item.tabbarView.webContents?.close()
      item.viewList.forEach((v) => {
        v.webContents?.close()
      })
    }
  })
  winViewBindList.push(winViewData)
  return win
}

function createDefaultBrowserView(
  win: BaseWindow,
  defaultUrl = 'https://www.bing.com',
): WebContentsView {
  const view = new WebContentsView()
  addViewToWin(win, view)
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
  // Electron >= 44 中 webContents 销毁后 view.webContents 返回 undefined，
  // 销毁事件里无法再读取，必须提前捕获 id
  const viewContentsId = view.webContents.id
  view.webContents.on('page-title-updated', () => {
    freshTabData(null, view, 1)
  })
  view.webContents.on('destroyed', () => {
    removeBrowserView(null, view, viewContentsId)
  })
  view.webContents.setWindowOpenHandler((details) => {
    const parentBw = getWinFromView(view)
    createDefaultBrowserView(parentBw!, details.url)
    return { action: 'deny' }
  })
  freshTabData(win, view, 1)

  return view
}

function addBrowserView(win: BaseWindow, view: WebContentsView): void {
  if (getWinFromView(view) !== win) {
    addViewToWin(win, view)
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
  freshTabData(win, view, 1)
}

function removeBrowserView(
  win: BaseWindow | null,
  view: WebContentsView,
  viewContentsId = view.webContents?.id,
): void {
  removeViewFromWinByView(view)
  freshTabData(win, view, -1, viewContentsId)
}

function freshTabData(
  win: BaseWindow | null,
  view: WebContentsView,
  status: -1 | 1,
  viewContentsId = view.webContents?.id,
): void {
  if (viewContentsId === undefined) return
  console.log('freshTabData', viewContentsId, status)

  const contents = view.webContents
  const _win = win ?? getWinFromView(view)
  const tabbarView = _win ? getTabbarViewFromWin(_win) : null
  if (tabbarView) {
    webContentSend.browser.tabDataUpdate(tabbarView.webContents, {
      browserContentViewWebContentsId: viewContentsId,
      title: contents ? contents.getTitle() : '',
      url: contents ? contents.getURL() : '',
      status: status,
    })
  }
}

function getWinFromView(view: WebContentsView): BaseWindow | null {
  for (const item of winViewBindList) {
    if (item.viewList.includes(view)) {
      return item.win
    }
  }
  return null
}

function getWinFromTabbarWebContents(
  webContents: WebContents,
): BaseWindow | null {
  for (const item of winViewBindList) {
    if (item.tabbarView.webContents === webContents) {
      return item.win
    }
  }
  return null
}

function getViewListFromWin(win: BaseWindow): WebContentsView[] {
  let list: WebContentsView[] = []
  const item = winViewBindList.find((item) => item.win === win)
  if (item) {
    list = item.viewList
  }
  return list
}

function getTabbarViewFromWin(win: BaseWindow): WebContentsView | null {
  let tabbarView: WebContentsView | null = null
  const item = winViewBindList.find((item) => item.win === win)
  if (item) {
    tabbarView = item.tabbarView
  }
  return tabbarView
}

function addViewToWin(win: BaseWindow, view: WebContentsView): void {
  const item = winViewBindList.find((item) => item.win === win)
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

function getBrowserContentViewFromWebContents(
  webContents: WebContents,
): WebContentsView | null {
  for (const item of winViewBindList) {
    const browserContentView = item.viewList.find(
      (v) => v.webContents === webContents,
    )
    if (browserContentView) {
      return browserContentView
    }
  }
  return null
}

function getBrowserContentViewFromWebContentsId(
  webContentsId: number,
): WebContentsView | null {
  for (const item of winViewBindList) {
    const browserContentView = item.viewList.find(
      (v) => v.webContents.id === webContentsId,
    )
    if (browserContentView) {
      return browserContentView
    }
  }
  return null
}

function getBrowserTabbarViewFromWebContents(
  webContents: WebContents,
): WebContentsView | null {
  for (const item of winViewBindList) {
    if (item.tabbarView.webContents === webContents) {
      return item.tabbarView
    }
  }
  return null
}

function removeViewFromWin(win: BaseWindow, view: WebContentsView): void {
  const item = winViewBindList.find((item) => item.win === win)
  if (item) {
    const findIndex = item.viewList.findIndex((v) => v === view)
    if (findIndex !== -1) {
      item.viewList.splice(findIndex, 1)
    }
  }
}

function removeViewFromWinByView(view: WebContentsView) {
  for (const item of winViewBindList) {
    const findIndex = item.viewList.findIndex((v) => v === view)
    if (findIndex !== -1) {
      item.viewList.splice(findIndex, 1)
      removeViewFromWin(item.win, view)
      break
    }
  }
}
