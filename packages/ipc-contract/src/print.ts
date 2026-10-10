/**
 * print 域：打印演示窗口（invoke：渲染进程 -> 主进程）
 *
 * 本文件只声明类型，渲染进程会以 import type 的方式引用，不允许引入任何运行时代码。
 * 对应主进程实现：@main/services/print-handle
 */

/** 打印演示窗口 */
export interface PrintContract {
  /** 获取打印机列表 */
  getPrinters(): Electron.PrinterInfo[]
  /** 执行打印操作 */
  exec(options: Electron.WebContentsPrintOptions): PrintExecResult
  /** 打开打印演示窗口 */
  openDemoWindow(): void
}

/** exec 的返回值 */
export interface PrintExecResult {
  success: boolean
  failureReason: string
}
