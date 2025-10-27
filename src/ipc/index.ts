/**
 * IPC 类型系统和工具函数
 *
 * 此模块提供：
 * 1. IPC 通道类型定义和转换（CamelCase <-> kebab-case）
 * 2. 运行时工具函数（camelToKebab, extractChannelNames）
 * 3. IpcChannel 常量对象（自动从类中生成）
 *
 * @module ipc
 */

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
export type CamelToKebabCase<S extends string> =
  S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${CamelToKebabCase<U>}`
    : S

export type RemoveLeadingDash<S extends string> = S extends `-${infer Rest}`
  ? Rest
  : S

export type ToKebabCase<S extends string> = RemoveLeadingDash<
  CamelToKebabCase<S>
>

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

/**
 * IpcChannel 对象的类型
 * 将所有 IPC 类的键名映射为 kebab-case 字符串字面量
 */
export type IpcChannelMap = {
  [K in
    | keyof IpcChannelMainClass
    | keyof IpcChannelRendererClass
    | keyof IpcChannelBrowserClass
    | keyof IpcChannelPrintClass
    | keyof IpcChannelHotUpdaterClass as K extends string
    ? K
    : never]: K extends string ? ToKebabCase<K> : never
}

/**
 * 将驼峰命名转换为 kebab-case (运行时函数)
 * @param str 驼峰命名字符串
 * @returns kebab-case 字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 从类中提取所有属性名并转换为 kebab-case
 * @param ClassConstructor 类构造函数
 * @returns 属性名到 kebab-case 通道名的映射对象
 */
export function extractChannelNames<T>(
  ClassConstructor: new () => T,
): Record<keyof T, string> {
  const instance = new ClassConstructor()
  const channelMap = {} as Record<keyof T, string>

  for (const key in instance) {
    if (Object.prototype.hasOwnProperty.call(instance, key)) {
      channelMap[key] = camelToKebab(key as string)
    }
  }

  return channelMap
}

export * from './channel'

/**
 * IPC 通道名称常量对象
 * 自动从类定义中提取所有方法名并转换为 kebab-case
 *
 * @example
 * IpcChannel.GetPrinters // 'get-printers'
 * IpcChannel.HotUpdate // 'hot-update'
 */
export const IpcChannel = {
  ...extractChannelNames(IpcChannelMainClass),
  ...extractChannelNames(IpcChannelRendererClass),
  ...extractChannelNames(IpcChannelBrowserClass),
  ...extractChannelNames(IpcChannelPrintClass),
  ...extractChannelNames(IpcChannelHotUpdaterClass),
} as {
  [K in
    | keyof IpcChannelMainClass
    | keyof IpcChannelRendererClass
    | keyof IpcChannelBrowserClass
    | keyof IpcChannelPrintClass
    | keyof IpcChannelHotUpdaterClass as K extends string
    ? K
    : never]: K extends string ? ToKebabCase<K> : never
}

export type IpcChannelType = typeof IpcChannel
export type IpcChannelKeys = keyof IpcChannelType
