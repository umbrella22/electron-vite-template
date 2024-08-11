import {
  IpcChannelMainClass,
  IpcChannelRendererClass,
  IpcMainEventListener,
  IpcRendererEventListener,
} from "./channel";

type GetChannelType<
  T extends IpcChannelMainClass | IpcChannelRendererClass,
  K extends keyof IpcMainEventListener | keyof IpcRendererEventListener
> = {
  [Key in keyof T]: K extends keyof T[Key] ? T[Key][K] : never;
};

export interface IIpcMainHandle
  extends GetChannelType<IpcChannelMainClass, "ipcMainHandle"> {}
export interface IIpcRendererInvoke
  extends GetChannelType<IpcChannelMainClass, "ipcRendererInvoke"> {}
export interface IIpcRendererOn
  extends GetChannelType<IpcChannelRendererClass, "ipcRendererOn"> {}
export interface IWebContentSend
  extends GetChannelType<IpcChannelRendererClass, "webContentSend"> {}

export * from "./channel";
