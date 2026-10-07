# 项目介绍

electron-vite-template 是一个以 **pnpm monorepo** 组织的 Electron 桌面应用模板。技术栈：Electron + Vue 3 + Vite(rolldown 内核) + TypeScript 7，构建工具链基于 vite-plus（`vp`）。

::: warning 前置要求
阅读本文档默认您拥有 Vue 与 Node 基础知识。运行本项目需要：

- **Node.js ≥ 24**（构建脚本使用 Node 原生 TypeScript 运行）
- **pnpm ≥ 10**（推荐直接使用 `corepack enable` 按 `packageManager` 字段对齐版本）
:::

## 它解决什么问题

Electron 模板市面不少，但大多数只提供"能跑"的起点。本模板把桌面应用工程里最容易烂尾的三件事做成了开箱即用的机制：

1. **IPC 的类型安全**——通道声明、主进程实现、渲染进程调用三端共享同一份合同，拼写错误和载荷不匹配都是编译错误（详见 [IPC 合同系统](/guide/ipc)）；
2. **安全模型**——全部窗口 `contextIsolation` + `sandbox`，渲染进程没有 Node 能力，与主进程的一切通信都经过 preload 白名单桥（详见 [安全模型](/guide/security)）；
3. **源码保护的可选项**——需要闭源交付时，一条命令把主进程编译成 V8 字节码，不需要时完全不感知（详见 [字节码保护](/guide/bytecode)）。

## 功能一览

- 基于 electron-updater 的整包更新检查与安装
- 增量热更新（主进程 + 渲染进程内容，无需重新分发安装包）
- 域分组类型化 IPC（31 个内置通道，含窗口管理、文件下载、系统对话框、electron-store 封装等）
- 文件下载（含进度/完成/失败事件推送）
- 自定义标题栏（Windows 可关闭系统头部）
- 系统对话框、electron-store 持久化、托盘、多窗口（含浏览器/打印演示页）
- vp run 缓存构建流水线、三平台 CI 工作流

## 分支说明

- `main`：唯一的开发与集成分支，变更直接提交或 PR 至此
