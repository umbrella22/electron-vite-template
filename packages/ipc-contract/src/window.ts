/**
 * window 域：窗口事件推送（主进程 -> 渲染进程）
 *
 * 本文件只声明类型，渲染进程会以 import type 的方式引用，不允许引入任何运行时代码。
 * 对应主进程实现：@main/services/web-content-send 的 window 组
 */

/** 窗口事件推送 */
export interface WindowEvents {
  /** 主进程向新窗口发送的数据 */
  sendData(data: unknown): void
}
