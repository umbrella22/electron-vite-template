import { app, BrowserView, BrowserWindow, screen } from "electron";
import { IpcChannel, IpcMainHandle } from "../../ipc";
import { IsUseSysTitle } from "../config/const";
import { otherWindowConfig } from "../config/windowsConfig";
import { browserDemoURL } from "@main/config/StaticPath";
import { openDevTools } from "./windowManager";

export function useBrowserHandle(): Pick<
  IpcMainHandle,
  | IpcChannel.OpenBrowserDemoWindow
  | IpcChannel.GetLastBrowserDemoTabData
  | IpcChannel.AddDefaultBrowserView
  | IpcChannel.SelectBrowserDemoTab
  | IpcChannel.DestroyBrowserDemoTab
  | IpcChannel.BrowserDemoTabJumpToUrl
  | IpcChannel.BrowserTabMousedown
  | IpcChannel.BrowserTabMousemove
  | IpcChannel.BrowserTabMouseup
> {
  return {
    [IpcChannel.OpenBrowserDemoWindow]: async (event) => {
      openBrowserDemoWindow();
    },
    [IpcChannel.GetLastBrowserDemoTabData]: async (event) => {
      // 拖出tab创建的窗口获取当前tab信息
      if (lastDragView) {
        let positionX = -1
        if (dragTabOffsetX) {
          const currentWin = BrowserWindow.fromBrowserView(lastDragView)
          const bound = currentWin.getBounds()
          const { x, y } = screen.getCursorScreenPoint()
          positionX = x - bound.x - dragTabOffsetX
        }
        return {
          positionX,
          bvWebContentsId: lastDragView.webContents.id,
          title: lastDragView.webContents.getTitle(),
          url: lastDragView.webContents.getURL(),
        };
      }
      openBrowserDemoWindow();
    },
    [IpcChannel.AddDefaultBrowserView]: async (event) => {
      // 添加tab的内容
      const currentWin = BrowserWindow.fromWebContents(event.sender);
      let bvWebContentsId = -1;
      if (currentWin) {
        const bv = createDefaultBrowserView(currentWin);
        bvWebContentsId = bv.webContents.id;
      }
      return { bvWebContentsId };
    },
    [IpcChannel.SelectBrowserDemoTab]: async (event, bvWebContentsId) => {
      // 选择tab为当前tab
      const currentWin = BrowserWindow.fromWebContents(event.sender);
      if (currentWin) {
        const bvList = currentWin.getBrowserViews();
        for (let i = 0; i < bvList.length; i++) {
          const bv = bvList[i];
          if (bv.webContents.id === bvWebContentsId) {
            currentWin.setTopBrowserView(bv);
            return true;
          }
        }
      }
      return false;
    },
    [IpcChannel.DestroyBrowserDemoTab]: async (event, bvWebContentsId) => {
      // 关闭tab
      const currentWin = BrowserWindow.fromWebContents(event.sender);
      if (currentWin) {
        const bvList = currentWin.getBrowserViews();
        for (let i = 0; i < bvList.length; i++) {
          const bv = bvList[i];
          if (bv.webContents.id === bvWebContentsId) {
            currentWin.removeBrowserView(bv);
            if (bvList.length === 1) {
              currentWin.close();
            }
            bv.webContents.close();
            break;
          }
        }
      }
    },
    [IpcChannel.BrowserDemoTabJumpToUrl]: async (
      event,
      { bvWebContentsId, url }
    ) => {
      // 跳转
      const currentView = viewList.find(
        (v) => v.webContents.id === bvWebContentsId
      );
      currentView.webContents.loadURL(url);
    },
    [IpcChannel.BrowserTabMousedown]: async (event, {
      offsetX
    }) => {
      dragTabOffsetX =offsetX
    },
    [IpcChannel.BrowserTabMousemove]: async (
      event,
      {
        screenX, // 鼠标在显示器的x坐标
        screenY, // 鼠标在显示器的y坐标
        startX, // 按下鼠标时在窗口的x坐标
        startY, // 按下鼠标时在窗口的y坐标
        bvWebContentsId,
      }
    ) => {
      if (!startScreenY) {
        startScreenY = screenY;
      }
      if (!viewFromWin) {
        viewFromWin = BrowserWindow.fromWebContents(event.sender);
      }
      let movingWin: BrowserWindow;
      const currentView = viewList.find(
        (v) => v.webContents.id === bvWebContentsId
      );
      lastDragView = currentView;
      if (viewFromWin.getBrowserViews().length <= 1) {
        movingWin = viewFromWin;
      } else {
        if (useNewWindow) {
          movingWin = useNewWindow;
          viewFromWin = useNewWindow;
        } else if (Math.abs(startScreenY - screenY) > 40) {
          // 如果Y差值大于40，则移动到新窗口
          if (emptyWin) {
            useNewWindow = emptyWin;
            useNewWindow.setHasShadow(true);
            emptyWin = null;
          } else {
            useNewWindow = openBrowserDemoWindow();
          }
          removeBrowserView(viewFromWin, currentView);
          addBrowserView(useNewWindow, currentView);
          viewFromWin = useNewWindow;
          movingWin = useNewWindow;
          movingWin.show();
          startScreenY = screenY;

          // 设置拖拽的 tab 位置
          const bound = movingWin.getBounds()
          movingWin.webContents.send(
            IpcChannel.BrowserViewTabPositionXUpdate,
            {
              dragTabOffsetX,
              positionX: screenX - bound.x,
              bvWebContentsId: currentView.webContents.id,
            }
          );

        } else {
          // 内部移动 movingWin = null
          for (let i = 0; i < winList.length; i++) {
            const existsWin = winList[i];
            const bound = existsWin.getBounds();
            if (
              existsWin !== emptyWin &&
              bound.x < screenX &&
              bound.x + bound.width > screenX &&
              // 在tabbar的范围
              bound.y + 30 < screenY &&
              bound.y + 70 > screenY
            ) {
              existsWin.webContents.send(
                IpcChannel.BrowserViewTabPositionXUpdate,
                {
                  dragTabOffsetX,
                  positionX: screenX - bound.x,
                  bvWebContentsId: currentView.webContents.id,
                }
              );
              return;
            }
          }
        }
      }
      if (movingWin) {
        movingWin.setPosition(screenX - startX, screenY - startY);
        // 判断是否需要添加进新窗口
        for (let i = 0; i < winList.length; i++) {
          const existsWin = winList[i];
          const bound = existsWin.getBounds();
          const tabbarCenterY = bound.y + 50; // titlebar 30 tabbar 40 / 2
          if (
            existsWin !== emptyWin &&
            existsWin !== movingWin &&
            bound.x < screenX &&
            bound.x + bound.width > screenX &&
            Math.abs(tabbarCenterY - screenY) < 20
          ) {
            removeBrowserView(movingWin, currentView);
            if (movingWin.getBrowserViews().length === 0) {
              emptyWin = movingWin;
              emptyWin.setHasShadow(false);
              emptyWin.setAlwaysOnTop(false);
              emptyWin.setBounds(bound);
              if (emptyWin === useNewWindow) {
                useNewWindow = null;
              }
            }
            addBrowserView(existsWin, currentView);
            viewFromWin = existsWin;
            startScreenY = screenY;
            return;
          }
        }
      }
    },
    [IpcChannel.BrowserTabMouseup]: async (event) => {
      winList.map((win) => {
        if (win?.getBrowserViews().length === 0) {
          win?.close();
        } else {
          win?.setAlwaysOnTop(false);
          win?.webContents?.send(IpcChannel.BrowserTabMouseup)
        }
      });
      useNewWindow = null;
      startScreenY = null;
      emptyWin = null;
      viewFromWin = null;
    },
  };
}

let dragTabOffsetX: number;
let lastDragView: BrowserView;
let emptyWin: BrowserWindow;
let viewFromWin: BrowserWindow;
let useNewWindow: BrowserWindow;
const winList: BrowserWindow[] = [];
const viewList: BrowserView[] = [];
let startScreenY: number;
function openBrowserDemoWindow() {
  let win = new BrowserWindow({
    titleBarStyle: IsUseSysTitle ? "default" : "hidden",
    ...Object.assign(otherWindowConfig, {}),
  });
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    openDevTools(win)
  }
  win.loadURL(browserDemoURL);
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    const findIndex = winList.findIndex((v) => win === v);
    if (findIndex !== -1) {
      winList.splice(findIndex, 1);
    }
  });
  winList.push(win);
  return win;
}

function createDefaultBrowserView(
  win: BrowserWindow,
  defaultUrl = "https://www.bing.com"
) {
  const [winWidth, winHeight] = win.getSize();
  const bv = new BrowserView();
  win.addBrowserView(bv);
  // title-bar 30px  tabbar 40px  searchbar 40px
  bv.setBounds({ x: 0, y: 110, width: winWidth, height: winHeight - 110 });
  bv.setAutoResize({
    width: true,
    height: true,
  });
  bv.webContents.on('did-finish-load', () => {
    console.log(bv.webContents.getURL())
  })
  bv.webContents.loadURL(defaultUrl);
  bv.webContents.on("page-title-updated", (event, title) => {
    const parentBw = BrowserWindow.fromBrowserView(bv);
    if (parentBw) {
      freshTabData(parentBw, bv, 1)
    }
  });
  bv.webContents.on("destroyed", () => {
    const findIndex = viewList.findIndex((v) => v === bv);
    if (findIndex !== -1) {
      viewList.splice(findIndex, 1);
    }
  });
  bv.webContents.setWindowOpenHandler((details) => {
    const parentBw = BrowserWindow.fromBrowserView(bv);
    createDefaultBrowserView(parentBw, details.url);
    return { action: "deny" };
  });
  freshTabData(win, bv, 1)
  viewList.push(bv);
  return bv;
}

function addBrowserView(win: BrowserWindow, view: BrowserView) {
  if (BrowserWindow.fromBrowserView(view) !== win) {
    win.addBrowserView(view);
    win.show();
    win.setAlwaysOnTop(true);
  }
  freshTabData(win, view, 1)
}

function removeBrowserView(win: BrowserWindow, view: BrowserView) {
  if (BrowserWindow.fromBrowserView(view) === win) {
    win.removeBrowserView(view);
  }
  freshTabData(win, view, -1)
}

function freshTabData(win: BrowserWindow, bv: BrowserView, status: -1 | 1) {
  win.webContents.send(IpcChannel.BrowserViewTabDataUpdate, {
    bvWebContentsId: bv.webContents.id,
    title: bv.webContents.getTitle(),
    url: bv.webContents.getURL(),
    status: status,
  });
}