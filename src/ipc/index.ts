import {
  IpcChannelMainClass,
  IpcChannelRendererClass,
  IpcChannelBrowserClass,
  IpcChannelPrintClass,
  IpcMainEventListener,
  IpcRendererEventListener,
} from './channel'

type IpcType =
  | IpcChannelMainClass
  | IpcChannelRendererClass
  | IpcChannelBrowserClass
  | IpcChannelPrintClass

type GetChannelType<
  T extends IpcType,
  K extends keyof IpcMainEventListener | keyof IpcRendererEventListener,
> = {
  [Key in keyof T]: K extends keyof T[Key] ? T[Key][K] : never
}

export interface IIpcMainHandle
  extends GetChannelType<IpcChannelMainClass, 'ipcMainHandle'> {}
export interface IIpcBrowserHandle
  extends GetChannelType<IpcChannelBrowserClass, 'ipcMainHandle'> {}
export interface IIpcPrintHandle
  extends GetChannelType<IpcChannelPrintClass, 'ipcMainHandle'> {}
export interface IIpcRendererInvoke
  extends GetChannelType<IpcChannelMainClass, 'ipcRendererInvoke'>,
    GetChannelType<IpcChannelBrowserClass, 'ipcRendererInvoke'>,
    GetChannelType<IpcChannelPrintClass, 'ipcRendererInvoke'> {}
export interface IIpcRendererOn
  extends GetChannelType<IpcChannelRendererClass, 'ipcRendererOn'> {}
export interface IWebContentSend
  extends GetChannelType<IpcChannelRendererClass, 'webContentSend'> {}

export * from './channel'
