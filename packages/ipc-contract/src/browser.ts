/**
 * browser 域：浏览器演示窗口（invoke 与事件推送）
 *
 * 本文件只声明类型，渲染进程会以 import type 的方式引用，不允许引入任何运行时代码。
 * 对应主进程实现：@main/services/browser-handle
 */

/** 浏览器演示窗口 */
export interface BrowserContract {
  /** 打开浏览器演示窗口 */
  openDemoWindow(): void
  /** 获取最后一个拖拽的浏览器标签数据 */
  getLastDraggedTabData(): LastDraggedTabData
  /** 添加默认的 BrowserView */
  addDefaultView(): AddDefaultViewResult
  /** 选择浏览器标签 */
  selectTab(browserContentViewWebContentsId: number): boolean
  /** 销毁浏览器标签 */
  destroyTab(browserContentViewWebContentsId: number): void
  /** 浏览器标签跳转到指定 URL */
  jumpToUrl(args: JumpToUrlArgs): void
  /** 标签鼠标按下事件 */
  mousedown(args: MouseDownArgs): void
  /** 标签鼠标移动事件（拖拽中） */
  mousemove(args: MouseMoveArgs): void
  /** 标签鼠标抬起事件（拖拽结束） */
  mouseup(): void
}

/** getLastDraggedTabData 的返回值：最后一个拖拽的浏览器标签数据 */
export interface LastDraggedTabData {
  positionX: number
  browserContentViewWebContentsId: number
  title: string
  url: string
}

/** addDefaultView 的返回值 */
export interface AddDefaultViewResult {
  browserContentViewWebContentsId: number
}

/** jumpToUrl 的载荷 */
export interface JumpToUrlArgs {
  browserContentViewWebContentsId: number
  url: string
}

/** mousedown 的载荷 */
export interface MouseDownArgs {
  offsetX: number
}

/** mousemove 的载荷 */
export interface MouseMoveArgs {
  /** 鼠标在显示器的x坐标 */
  screenX: number
  /** 鼠标在显示器的y坐标 */
  screenY: number
  /** 按下鼠标时在窗口的x坐标 */
  startX: number
  /** 按下鼠标时在窗口的y坐标 */
  startY: number
  browserContentViewWebContentsId: number
}

/** tabDataUpdate 事件的载荷 */
export interface TabDataUpdatePayload {
  browserContentViewWebContentsId: number
  title: string
  url: string
  /** 1 添加/更新 -1 删除 */
  status: 1 | -1
}

/** tabPositionXUpdate 事件的载荷 */
export interface TabPositionXUpdatePayload {
  dragTabOffsetX: number
  positionX: number
  browserContentViewWebContentsId: number
}

/** 浏览器演示窗口事件推送 */
export interface BrowserEvents {
  tabDataUpdate(payload: TabDataUpdatePayload): void
  tabPositionXUpdate(payload: TabPositionXUpdatePayload): void
  /** 标签拖拽结束，通知标签栏重置状态 */
  dragEnd(): void
}
