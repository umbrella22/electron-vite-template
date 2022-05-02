import config from '@config/index'
import { BrowserWindowConstructorOptions } from 'electron';
import { preloadPath } from './StaticPath';

export const mainWindowConfig: BrowserWindowConstructorOptions = {
    height: 800,
    useContentSize: true,
    width: 1700,
    minWidth: 1366,
    show: false,
    frame: config.IsUseSysTitle,
    webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        webSecurity: false,
        // 如果是开发模式可以使用devTools
        devTools: process.env.NODE_ENV === 'development',
        // 在macos中启用橡皮动画
        scrollBounce: process.platform === 'darwin',
    }
};

export const otherWindowConfig: BrowserWindowConstructorOptions = {
    height: 595,
    useContentSize: true,
    width: 1140,
    autoHideMenuBar: true,
    minWidth: 842,
    frame: config.IsUseSysTitle,
    show: false,
    webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        webSecurity: false,
        // 如果是开发模式可以使用devTools
        devTools: process.env.NODE_ENV === 'development',
        // 在macos中启用橡皮动画
        scrollBounce: process.platform === 'darwin',
    }
}
