import { BrowserWindow, Menu, Tray, app, nativeImage } from "electron";
import { iconPath } from "../config/StaticPath";

let tray: Tray

export function initTray() {
  tray = new Tray(nativeImage.createFromPath(iconPath));

  tray.setToolTip(app.name)

  tray.on('click', () => {
    BrowserWindow.getAllWindows().map(win => win.show())
  })
  
  tray.setContextMenu(Menu.buildFromTemplate([
    { role: 'about' },
    { role: 'quit' }
  ]))
  
  return tray
}
