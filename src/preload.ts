import { IElectronAPI } from "customTypes/preload";
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld('electronAPI', {
  preloadTest: () => ipcRenderer.invoke('preload-test'),
  staticUrl: process.env.__static,
} as IElectronAPI)