'use strict'

import { app, session } from 'electron'
import InitWindow from './services/windowManager'
import DisableButton from './config/DisableButton'
import { initTray } from './services/trayManager'

function onAppReady() {
  new InitWindow().initWindow()
  initTray()
  DisableButton.Disablef12()
  if (process.env.NODE_ENV === 'development') {
    const { VUEJS3_DEVTOOLS } = require("electron-devtools-vendor");
    session.defaultSession.loadExtension(VUEJS3_DEVTOOLS, {
      allowFileAccess: true,
    });
    console.log('已安装: vue-devtools')
  }
}

app.whenReady().then(onAppReady)

// 由于9.x版本问题，需要加入该配置关闭跨域问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit()
})
app.on('browser-window-created', () => {
  console.log('window-created')
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-vue-template')
    console.log('由于框架特殊性开发环境下无法使用')
  }
} else {
  app.setAsDefaultProtocolClient('electron-vue-template')
}
