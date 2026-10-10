/**
 * download 域：文件下载事件推送（主进程 -> 渲染进程）
 *
 * 本文件只声明类型，渲染进程会以 import type 的方式引用，不允许引入任何运行时代码。
 * 对应主进程实现：@main/services/download-file
 */

/** done 事件的载荷 */
export interface DownloadDonePayload {
  filePath: string
}

/** 文件下载事件推送 */
export interface DownloadEvents {
  progress(percent: number): void
  error(isError: boolean): void
  paused(isPaused: boolean): void
  done(payload: DownloadDonePayload): void
}
