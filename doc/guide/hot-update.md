# 热更新

热更新可以在**不重新分发安装包**的前提下更新应用内容，主进程与渲染进程都支持（前提：不新增/移除 `.node` 原生依赖——那需要整包更新）。

模板内置两套并存的更新方案：

| 方案 | 通道 | 适用场景 |
| --- | --- | --- |
| 整包更新（electron-updater） | `invoke('app:checkUpdate')` → `update:msg` 事件 | 大版本升级、涉及 Electron 本体 |
| 增量热更新 | `invoke('updater:start')` → `update:hotStatus` 事件 | 渲染层与主进程 JS 内容的快速迭代 |

## 增量热更新的工作原理

1. **打包资源**：`pnpm run pack:resources` 会把当前构建产物（`apps/desktop/dist/electron`）连同重写的 package.json 打成 zip，并生成版本配置 json，输出到 `apps/desktop/build/update/`；
2. **发布资源**：把 `update/<配置名>.json` 与同名 `.zip` 上传到一个**可公开访问**的地址；
3. **应用检查**：应用启动后按 `hotPublishUrl + hotPublishConfigName + '.json'` 拉取配置，比较版本号（大于当前版本则更新），下载 zip → 校验 sha256 → 解包替换 → 提示重启。

## 配置

在 `apps/desktop/config/index.ts` 的 `build` 对象中：

| 参数 | 说明 |
| --- | --- |
| `hotPublishUrl` | 资源托管的完整 URL（如 `https://www.example.com`），留空表示不启用 |
| `hotPublishConfigName` | 配置文件名，拼在 URL 后，如 `update-config` |

最终检查地址为 `hotPublishUrl + '/' + hotPublishConfigName + '.json'`，发布前可以先在浏览器访问确认可用。

## 渲染端调用

```ts
import { invoke, vueListen } from '@renderer/utils/ipcRenderer'

// 触发热更新
invoke('updater:start')

// 监听状态
vueListen('update:hotStatus', (msg) => {
  switch (msg.status) {
    case 'downloading': /* 正在下载 */ break
    case 'moving':      /* 正在移动文件 */ break
    case 'finished':    /* 完成，提示用户重启 */ break
    case 'failed':      /* msg.message 为原因 */ break
  }
})
```

## 版本与字节码纪律

- **版本号比较**：远程配置的 `version` 必须大于应用当前版本（`apps/desktop/package.json` 的 `version`）才会触发更新。调试时可以把本地版本改小制造差异；
- **字节码模式**：若启用了[字节码保护](/guide/bytecode)，`pack:resources` 打出的热更包内含 `main.bin`——热更 CI 使用的 Electron 版本必须与用户已安装的壳一致。架构上热更从不携带 Electron 本体，该条件天然满足；
- **托管地址**：`hotPublishUrl` 指向哪里完全由你决定（对象存储、自建服务器、GitHub Pages 均可）。仓库自带的 CI 不再自动部署热更资源，`Build Updater` 工作流已随 gh-pages 转作文档站而退役。

## 整包更新

`invoke('app:checkUpdate')` 走 electron-updater，检查 `apps/desktop/build.json` 中 `publish` 配置指向的源；`invoke('app:confirmUpdate')` 退出并安装。整包更新适合 Electron 版本变更、原生依赖变更等无法热更的场景。
