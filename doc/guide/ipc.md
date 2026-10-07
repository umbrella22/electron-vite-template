# IPC 合同系统

本模板的进程间通信围绕一份**唯一合同**构建：`packages/ipc-contract/src/contract.ts`。通道的名称、参数、返回值只在这里声明一次，主进程实现、渲染进程调用、preload 校验全部由它派生。

## 通道命名：`域:方法`

所有 invoke 通道按域分组，线上通道名就是 `域:方法`：

| 域 | 通道示例 | 职责 |
| --- | --- | --- |
| `app:` | `app:openWin`、`app:quit`、`app:setStoreValue` | 应用基础功能 |
| `browser:` | `browser:selectTab`、`browser:mousemove` | 浏览器演示窗口 |
| `print:` | `print:getPrinters`、`print:exec` | 打印演示窗口 |
| `updater:` | `updater:start`、`updater:test` | 增量热更新 |

主进程向渲染进程的事件推送同样分组：`download:progress`、`update:msg`、`browser:dragEnd`、`window:sendData` 等。invoke 与 event 是两张独立的表（`IpcContracts` 与 `IpcEventGroups`），从命名空间上杜绝了同名通道双语义的混淆。

## 三端视角

**合同**（`packages/ipc-contract/src/contract.ts`）——普通函数签名的接口，函数名即通道方法名：

```ts
export interface BrowserContract {
  /** 选择浏览器标签 */
  selectTab(browserContentViewWebContentsId: number): boolean
  // ...
}
```

**主进程实现**（`apps/desktop/src/main/services/browser-handle.ts`）——对象字面量标注为 `IpcImpl<域合同>`，参数与返回值全部自动推导，**零手工注解**：

```ts
export const browserIpcHandlers: IpcImpl<BrowserContract> = {
  selectTab: async (event, browserContentViewWebContentsId) => {
    // event 与 id 均已推导
  },
}
```

对象字面量受编译期穷尽检查：漏实现、多写、签名不符都是编译错误。渲染层若误调不存在的通道同样报错。

**渲染进程调用**（`apps/desktop/src/renderer/utils/ipcRenderer.ts`）：

```ts
import { invoke, vueListen } from '@renderer/utils/ipcRenderer'

// 通道名自动补全、参数强校验、返回值带类型
const printers = await invoke('print:getPrinters')
await invoke('app:openWin', { url: '/form/index' })

// 监听主进程推送，组件卸载自动清理
vueListen('download:progress', (percent) => { /* percent: number */ })
```

底层通信经由 preload 暴露的 `window.ipcBridge`（见[安全模型](/guide/security)），渲染端封装负责把合同类型在桥接边界处还原。

## 如何新增一个通道

以新增 `app:readFile` 为例，共三步，注册环节无需任何改动：

1. 在 `contract.ts` 的 `AppContract` 接口里加方法签名；
2. 在 `apps/desktop/src/main/services/ipc-main-handle.ts` 的 `appIpcHandlers` 对象里加实现（漏加会编译报错）；
3. 渲染端 `invoke('app:readFile', ...)` 调用。

## 类型机制的几个关键点

- `IpcImpl<T>`：主进程实现视图，自动在每个处理器前补 `IpcMainInvokeEvent` 首参、允许返回 `Promise`；
- `ResolveContractMethod<C>`：由通道字面量（如 `'browser:selectTab'`）反解出方法签名的条件类型，`invoke` 的参数与返回值都源于它。注意不要改成关联泛型的两级索引访问（`T[D][M]`），那无法满足 `Parameters` 的函数约束；
- preload 的 `ipcBridge.invoke` 对通道做域白名单校验（`app|browser|print|updater`），格式不符直接抛错——合同之外不存在通道。
