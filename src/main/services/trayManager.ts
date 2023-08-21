import { BrowserWindow, Menu, Tray, app, nativeImage } from "electron";
import { trayURL, trayIconPath } from "../config/StaticPath";

let tray: Tray

export function initTray() {
  tray = new Tray(nativeImage.createFromPath(trayIconPath));

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
  
  return tray
}

function createTrayWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 160,
    show: false,
    resizable: false,
    movable: false,
    frame: false,
    hiddenInMissionControl: true,
    skipTaskbar: true,
    visualEffectState: 'active',
    vibrancy: 'menu'
  })
  win.loadURL(trayURL)
  
  win.on('blur', () => {
    let opacity = 1
    const timer = setInterval(() => {
      opacity -= 0.1
      win.setOpacity(opacity)
      if (opacity <= 0) {
        win.hide()
        clearInterval(timer)
      }
    }, 10)
  })

  win.on('show', () => {
    let opacity = 0
    const timer = setInterval(() => {
      opacity += 0.2
      win.setOpacity(opacity)
      if (opacity >= 1) {
        clearInterval(timer)
        win.focus()
      }
    }, 10)
  })

  return win
}
