# 安全模型

本模板默认采用 Electron 官方推荐的强隔离配置，**所有窗口**（主窗口、`OpenWin` 子窗口、内嵌 BrowserView）一致：

```ts
webPreferences: {
  contextIsolation: true,   // 渲染进程与 preload 运行在隔离上下文
  nodeIntegration: false,   // 渲染进程无 Node 能力
  sandbox: true,            // 渲染进程运行在 Chromium 沙箱中
  preload: preloadPath,
}
```

这意味着：渲染进程被注入脚本时，攻击者拿不到 `require`、拿不到 Node API、也拿不到 `ipcRenderer` 本体——它能做的只有调用 preload 白名单暴露出来的方法。这是把 XSS 的爆炸半径从"整台机器"压缩到"几个显式声明的函数"。

## preload 白名单桥

`apps/desktop/src/preload/index.ts` 通过 `contextBridge.exposeInMainWorld('ipcBridge', ...)` 暴露唯一的全局对象：

| 成员 | 说明 |
| --- | --- |
| `invoke(channel, ...args)` | 渲染 → 主进程请求。通道需匹配 `域:方法` 格式且域在白名单内，否则抛错 |
| `on(channel, callback)` | 监听主进程事件，回调直接收到载荷（不含 `IpcRendererEvent`），返回清理函数 |
| `shell.openPath / openExternal` | 最小化的 shell 能力放行 |
| `systemInfo / processInfo` | 只读的系统与构建环境信息（冻结对象） |
| `simulateCrash()` | 模拟渲染进程崩溃（仅演示用） |

渲染层代码**不应直接触碰 `window.ipcBridge`**，而是使用类型化封装（`@renderer/utils/ipcRenderer` 的 `invoke` / `listen` / `vueListen`）——它把合同类型在桥接边界还原，通道名的合法性与载荷形状由编译期保证，运行时再由 preload 做第二道校验。

## 渲染进程的边界

- 渲染层代码**不允许** `require` / `import` 任何 Node 或 electron 模块。vite 构建配置刻意没有为渲染层设置 externals，误引入会**直接构建报错**——这是刻意的安全哨兵；
- 需要 Node 能力的操作一律走 IPC：加合同接口 → 主进程实现 → 渲染端调用；
- `process.env.NODE_ENV` 例外：由 vite 在编译期静态替换，运行时不涉及 Node。

## 已知的刻意保留项

- `webSecurity: false` 与 `OutOfBlinkCors` 开关仍在：模板的演示页面需要跨域请求示例 API。集成进真实业务时建议关闭并改由主进程代理网络请求；
- 未配置 CSP：控制台会有 Electron 的安全警告。生产交付时建议按官方指南补充 Content-Security-Policy。

## 对比：为什么不用 nodeIntegration

旧版模板（以及很多老教程）使用 `nodeIntegration: true` + 渲染进程直接 `require('electron')`。该模式下渲染进程注入 = 完全沦陷，而类型化的通道体系只是"让规规矩矩的调用更舒服"，对不规矩的调用没有任何约束。本模板的安全基线对齐 Electron 官方清单与主流商业应用（如 QQ NT）的做法：**隔离是默认，能力靠白名单**。
