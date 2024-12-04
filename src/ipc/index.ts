/**
 * 这个文件是用来导出所有的类型定义的
 * 其实总的来说都不需要理解，毕竟都是类型定义，能用就行
 */

import {
  IpcChannelMainClass,
  IpcChannelRendererClass,
  IpcMainEventListener,
  IpcRendererEventListener,
} from "./channel";

/**
 * 获取事件名及参数
 * 这里其实不需要理解，只需要知道这个类型是用来获取事件名及参数的
 */
type GetChannelType<
  T extends IpcChannelMainClass | IpcChannelRendererClass,
  K extends keyof IpcMainEventListener | keyof IpcRendererEventListener
> = {
  [Key in keyof T]: K extends keyof T[Key] ? T[Key][K] : never;
};

/**
 * 主进程监听事件
 */
export interface IIpcMainHandle
  extends GetChannelType<IpcChannelMainClass, "ipcMainHandle"> {}

/**
 * 渲染进程给主进程发送消息
 */
export interface IIpcRendererInvoke
  extends GetChannelType<IpcChannelMainClass, "ipcRendererInvoke"> {}

/**
 * 渲染进程监听事件
 */
export interface IIpcRendererOn
  extends GetChannelType<IpcChannelRendererClass, "ipcRendererOn"> {}

/**
 * 给渲染进程发消息
 */
export interface IWebContentSend
  extends GetChannelType<IpcChannelRendererClass, "webContentSend"> {}

export * from "./channel";
