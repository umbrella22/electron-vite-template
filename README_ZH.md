# electron-vite-template

![GitHub Repo stars](https://img.shields.io/github/stars/umbrella22/electron-vite-template)
![electron](https://img.shields.io/badge/electron-44.5.1-brightgreen.svg)
![vue](https://img.shields.io/badge/vue-3.5-brightgreen.svg)
![node](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)
![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/umbrella22/electron-vite-template/blob/main/LICENSE)
[![Build TEST](https://github.com/umbrella22/electron-vite-template/actions/workflows/Build.yml/badge.svg)](https://github.com/umbrella22/electron-vite-template/actions/workflows/Build.yml)

基于 pnpm monorepo 的 Electron + Vue 3 桌面应用模板——域分组类型化 IPC、contextBridge 安全模型、可选 V8 字节码保护，开箱即用。

[国内访问地址（gitee 镜像）](https://gitee.com/Zh-Sky/electron-vite-template)

## 📘 在线文档

**[https://umbrella22.github.io/electron-vite-template/](https://umbrella22.github.io/electron-vite-template/)**

文档覆盖：快速上手、目录结构、IPC 合同系统、安全模型、构建与打包、热更新、字节码保护、CI 工作流。

## 环境要求

- **Node.js ≥ 24**：构建脚本使用 Node 原生 TypeScript 运行
- **pnpm**：本仓库唯一包管理器，推荐 `corepack enable` 按 `packageManager` 字段自动对齐版本

### 镜像配置（可选）

```bash
# 打开用户级 npm 配置文件，添加以下内容后重启命令行
# registry=https://registry.npmmirror.com
# electron_mirror=https://cdn.npmmirror.com/binaries/electron/
# electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

## 使用

```bash
# 克隆仓库
$ git clone https://github.com/umbrella22/electron-vite-template.git
$ cd electron-vite-template
# 安装依赖
$ pnpm install

# 启动开发（本地 9080 端口热更新）
$ pnpm dev

# 构建并打出当前平台安装包
$ pnpm run build

# 仅产出免安装目录（快速验证打包）
$ pnpm run build:dir
```

## 功能列表

- [x] 域分组类型化 IPC（`app:openWin`、`browser:selectTab`……编译期保证通道与载荷）
- [x] contextIsolation + sandbox 安全模型，preload 白名单桥
- [x] electron-updater 整包更新
- [x] 增量热更新（渲染层 + 主进程内容）
- [x] 可选主进程字节码保护（按需启用，零额外工具链）
- [x] vp run 缓存构建流水线、三平台 CI
- [x] i18n

## 内置

- [vue-router](https://router.vuejs.org/zh/)
- [pinia](https://pinia.vuejs.org/zh/)
- [element-plus](https://element-plus.org/zh-CN/)
- [electron-store](https://github.com/sindresorhus/electron-store)
- electron-updater
- TypeScript 7

# 说明

- [gitee](https://gitee.com/Zh-Sky/electron-vite-template) 仅供国内用户拉取代码，由 GitHub 同步，PR 请提交至 GitHub
- **欢迎 Issue 与 PR**
