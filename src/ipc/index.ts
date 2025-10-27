import {
  IpcChannelMainClass,
  IpcChannelRendererClass,
  IpcChannelBrowserClass,
  IpcChannelPrintClass,
  IpcChannelHotUpdaterClass,
  IpcMainEventListener,
  IpcRendererEventListener,
} from './channel'

type IpcType =
  | IpcChannelMainClass
  | IpcChannelRendererClass
  | IpcChannelBrowserClass
  | IpcChannelPrintClass
  | IpcChannelHotUpdaterClass

type GetChannelType<
  T extends IpcType,
  K extends keyof IpcMainEventListener | keyof IpcRendererEventListener,
> = {
  [Key in keyof T]: K extends keyof T[Key] ? T[Key][K] : never
}

/**
 * 将驼峰命名的键转换为 kebab-case 的键
 * 例如: { GetPrinters: () => void } -> { 'get-printers': () => void }
 */
type CamelToKebabCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${CamelToKebabCase<U>}`
  : S

type RemoveLeadingDash<S extends string> = S extends `-${infer Rest}` ? Rest : S

type ToKebabCase<S extends string> = RemoveLeadingDash<CamelToKebabCase<S>>

/**
 * 将对象的键从驼峰命名转换为 kebab-case
 */
type ConvertKeysToKebabCase<T> = {
  [K in keyof T as K extends string ? ToKebabCase<K> : K]: T[K]
}

export interface IIpcMainHandle
  extends GetChannelType<IpcChannelMainClass, 'ipcMainHandle'> {}
export interface IIpcBrowserHandle
  extends GetChannelType<IpcChannelBrowserClass, 'ipcMainHandle'> {}
export interface IIpcPrintHandle
  extends GetChannelType<IpcChannelPrintClass, 'ipcMainHandle'> {}
export interface IIpcHotUpdaterHandle
  extends GetChannelType<IpcChannelHotUpdaterClass, 'ipcMainHandle'> {}

// 原始的驼峰命名接口（内部使用）
interface IIpcRendererInvokeCamel
  extends GetChannelType<IpcChannelMainClass, 'ipcRendererInvoke'>,
    GetChannelType<IpcChannelBrowserClass, 'ipcRendererInvoke'>,
    GetChannelType<IpcChannelPrintClass, 'ipcRendererInvoke'>,
    GetChannelType<IpcChannelHotUpdaterClass, 'ipcRendererInvoke'> {}

interface IIpcRendererOnCamel
  extends GetChannelType<IpcChannelRendererClass, 'ipcRendererOn'> {}

interface IWebContentSendCamel
  extends GetChannelType<IpcChannelRendererClass, 'webContentSend'> {}

// 导出的 kebab-case 接口（对外使用）
export interface IIpcRendererInvoke
  extends ConvertKeysToKebabCase<IIpcRendererInvokeCamel> {}

export interface IIpcRendererOn
  extends ConvertKeysToKebabCase<IIpcRendererOnCamel> {}

export interface IWebContentSend
  extends ConvertKeysToKebabCase<IWebContentSendCamel> {}

export * from './channel'
