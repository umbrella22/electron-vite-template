import { BrowserWindow, Menu, Tray, app, shell } from "electron";
import { trayURL, trayIconPath, trayTransparentIconPath } from "../config/StaticPath";

let tray: Tray

export function initTray() {
  tray = new Tray(trayIconPath);

  tray.setToolTip(app.name)

  if (process.platform === 'darwin') {
    const trayWin = createTrayWindow()
    tray.on('click', (e, bounds, position) => {
      trayWin.setPosition(bounds.x, bounds.y)
      trayWin.show()
    })
  } else {
    tray.setContextMenu(Menu.buildFromTemplate([
      { role: 'about' },
      { role: 'quit' }
    ]))
  }

  tray.on('double-click', async () => {
    let times = 3
    while(times > 0) {
      shell.beep()
      tray.setImage(trayTransparentIconPath)
      await sleep(500)
      tray.setImage(trayIconPath)
      await sleep(500)
      times--
    }
  })
  
  return tray
}

function createTrayWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 160,
    show: false,
    opacity: 0,
    resizable: false,
    movable: false,
    frame: false,
    hiddenInMissionControl: true,
    skipTaskbar: true,
    visualEffectState: 'active',
    vibrancy: 'menu'
  })
  win.loadURL(trayURL)
  
  win.on('blur', async () => {
    let opacity = 1
    while(opacity > 0) {
      await sleep(10)
      opacity -= 0.1
      win.setOpacity(opacity)
    }
    win.hide()
  })

  win.on('show', async() => {
    let opacity = 0
    while(opacity < 1) {
      await sleep(10)
      opacity += 0.2
      win.setOpacity(opacity)
    }
    win.focus()
  })
  return win
}

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}