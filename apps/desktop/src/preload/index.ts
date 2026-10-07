/**
 * preload 脚本：渲染进程与主进程之间的唯一桥梁。
 *
 * 安全模型：所有窗口 contextIsolation + sandbox 开启、nodeIntegration 关闭，
 * 渲染进程拿不到 Node 与 electron 本体，只能使用这里白名单暴露的 ipcBridge。
 * 暴露面保持最小：通道经过域白名单校验，shell 只放行两个方法，
 * 不透传任何可被滥用的底层对象。
 *
 * 通道命名与白名单来自 ipc-contract 包 contract.ts 的域定义，两边需保持一致。
 */
import { contextBridge, ipcRenderer, shell } from 'electron'

/** invoke 通道的合法域（对应 IpcContracts 的四个域） */
const INVOKE_DOMAINS = new Set(['app', 'browser', 'print', 'updater'])
/** 事件通道的合法组（对应 IpcEventGroups 的四个组） */
const EVENT_GROUPS = new Set(['download', 'update', 'browser', 'window'])

function assertChannel(
  channel: unknown,
  domains: Set<string>,
): asserts channel is string {
  if (
    typeof channel !== 'string' ||
    !domains.has(channel.split(':')[0]) ||
    !/^[a-z]+:[a-zA-Z][a-zA-Z0-9]*$/.test(channel)
  ) {
    throw new Error(`非法 IPC 通道: ${String(channel)}`)
  }
}

const ipcBridge = {
  /** 渲染进程 -> 主进程的请求，载荷与返回值由渲染端 invoke 封装提供类型 */
  invoke(channel: string, ...args: unknown[]): Promise<unknown> {
    assertChannel(channel, INVOKE_DOMAINS)
    return ipcRenderer.invoke(channel, ...args)
  },

  /**
   * 监听主进程推送的事件，回调直接收到载荷（不含 IpcRendererEvent）。
   * 返回清理函数。
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void {
    assertChannel(channel, EVENT_GROUPS)
    const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => {
      callback(...args)
    }
    ipcRenderer.on(channel, listener)
    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },

  /** 放行最小化的 shell 能力 */
  shell: {
    openPath(path: string): Promise<string> {
      return shell.openPath(path)
    },
    openExternal(url: string): Promise<void> {
      return shell.openExternal(url)
    },
  },

  /** 只读的系统信息（沙箱 preload 的 process 多限 polyfill，取值在主进程侧同理受限） */
  systemInfo: Object.freeze({
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron ?? '',
    nodeVersion: process.versions.node ?? '',
    systemVersion: process.getSystemVersion?.() ?? '',
  }),

  /** 只读的构建/运行环境信息 */
  processInfo: Object.freeze({
    platform: process.platform,
    buildTarget: process.env.BUILD_TARGET ?? '',
  }),

  /** 模拟渲染进程崩溃（仅演示用） */
  simulateCrash(): void {
    process.crash()
  },
}

export type IpcBridge = typeof ipcBridge

contextBridge.exposeInMainWorld('ipcBridge', ipcBridge)
