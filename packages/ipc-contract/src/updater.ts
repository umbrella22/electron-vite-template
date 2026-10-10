/**
 * updater 域：热更新/整包更新（invoke 与事件推送）
 *
 * 本文件只声明类型，渲染进程会以 import type 的方式引用，不允许引入任何运行时代码。
 * 对应主进程实现：@main/services/hot-updater（增量）与 ipc-main-handle（整包 electron-updater）
 */

import type { ProgressInfo } from 'electron-updater'

/** 热更新（增量更新） */
export interface UpdaterContract {
  /** 执行热更新 */
  start(): void
  /** 热更新测试（仅用于测试） */
  test(): void
}

/** msg 事件的载荷（整包 electron-updater 推送） */
export interface UpdateMsgPayload {
  state: number
  msg: string | ProgressInfo
}

/** processStatus 事件的状态枚举 */
export type UpdateProcessStatus =
  | 'init'
  | 'downloading'
  | 'moving'
  | 'finished'
  | 'failed'
  | 'download'

/** processStatus 事件的载荷 */
export interface UpdateProcessStatusPayload {
  status: UpdateProcessStatus
  message: string
}

/** hotStatus 事件的载荷（增量热更新推送） */
export interface HotStatusPayload {
  status: string
  message: string
}

/** 更新事件推送（整包 electron-updater 与增量热更新共用） */
export interface UpdateEvents {
  /** electron-updater 的更新进度推送 */
  msg(payload: UpdateMsgPayload): void
  processStatus(payload: UpdateProcessStatusPayload): void
  /** 增量热更新的状态推送 */
  hotStatus(payload: HotStatusPayload): void
}
