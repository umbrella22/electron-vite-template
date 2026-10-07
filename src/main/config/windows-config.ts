import { IsUseSysTitle } from './const'
import { preloadPath } from './static-path'
import { BrowserWindowConstructorOptions } from 'electron'

/**
 * 安全基线：contextIsolation + sandbox 开启、nodeIntegration 关闭，
 * 渲染进程只能通过 preload 暴露的 window.ipcBridge 与主进程通信。
 */
export const mainWindowConfig: BrowserWindowConstructorOptions = {
  height: 800,
  useContentSize: true,
  width: 1700,
  minWidth: 1366,
  show: false,
  frame: IsUseSysTitle,
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
}

export const otherWindowConfig: BrowserWindowConstructorOptions = {
  height: 595,
  useContentSize: true,
  width: 1140,
  autoHideMenuBar: true,
  minWidth: 842,
  frame: IsUseSysTitle,
  show: false,
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
}
