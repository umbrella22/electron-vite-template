import { contextBridge, ipcRenderer, shell } from 'electron'
import { platform, release, arch } from 'os'
import { IpcChannelMainClass, IpcChannelRendererClass } from '@ipcManager/index'

function getIpcRenderer() {
  const IpcRenderer: Record<string, any> = {}
  Object.keys(new IpcChannelMainClass()).forEach((channel) => {
    IpcRenderer[channel] = {
      invoke: async (args: any) => ipcRenderer.invoke(channel, args),
    }
  })
  Object.keys(new IpcChannelRendererClass()).forEach((channel) => {
    IpcRenderer[channel] = {
      on: (listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener)
        ipcRenderer.on(channel, listener)
      },
      once: (listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener)
        ipcRenderer.once(channel, listener)
      },
      removeAllListeners: () => ipcRenderer.removeAllListeners(channel),
    }
  })
  return IpcRenderer
}

contextBridge.exposeInMainWorld('ipcRendererChannel', getIpcRenderer())

contextBridge.exposeInMainWorld('systemInfo', {
  platform: platform(),
  release: release(),
  arch: arch(),
})

contextBridge.exposeInMainWorld('shell', shell)

contextBridge.exposeInMainWorld('crash', {
  start: () => {
    process.crash()
  },
})
