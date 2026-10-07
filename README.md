# electron-vite-template

![GitHub Repo stars](https://img.shields.io/github/stars/umbrella22/electron-vite-template)
![electron](https://img.shields.io/badge/electron-44.5.1-brightgreen.svg)
![vue](https://img.shields.io/badge/vue-3.5-brightgreen.svg)
![node](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)
![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/umbrella22/electron-vite-template/blob/main/LICENSE)
[![Build TEST](https://github.com/umbrella22/electron-vite-template/actions/workflows/Build.yml/badge.svg)](https://github.com/umbrella22/electron-vite-template/actions/workflows/Build.yml)

A pnpm monorepo Electron + Vue 3 desktop application template — domain-grouped typed IPC, contextBridge security model, and optional V8 bytecode protection, all out of the box.

## Documentation

📘 **[https://umbrella22.github.io/electron-vite-template/](https://umbrella22.github.io/electron-vite-template/)** (Chinese only)

The docs cover everything: getting started, the IPC contract system, the security model, build & packaging, hot update, bytecode protection, and CI workflows.

## Requirements

- **Node.js ≥ 24** — build scripts run on Node's native TypeScript support
- **pnpm** — the only package manager used (`corepack enable` aligns the version via the `packageManager` field)

## Build Setup

```bash
# Clone this repository
$ git clone https://github.com/umbrella22/electron-vite-template.git
# Go into the repository
$ cd electron-vite-template
# Install dependencies
$ pnpm install

# Start development (hot reload at localhost:9080)
$ pnpm dev

# Build and package for the current platform
$ pnpm run build

# Build without generating an installer (fast packaging check)
$ pnpm run build:dir
```

## Feature list

- [x] Typed domain-grouped IPC (`app:openWin`, `browser:selectTab`, ...) with compile-time safety
- [x] contextIsolation + sandbox security model with a whitelisted preload bridge
- [x] Auto update (electron-updater)
- [x] Incremental hot update (renderer + main process content)
- [x] Optional main-process bytecode protection (opt-in, zero toolchain)
- [x] vp run cached build pipeline & 3-platform CI workflows
- [x] i18n

## Built-in

- [vue-router](https://router.vuejs.org/)
- [pinia](https://pinia.vuejs.org/)
- [element-plus](https://element-plus.org/)
- [electron-store](https://github.com/sindresorhus/electron-store)
- electron-updater
- TypeScript 7

# Note

- [gitee](https://gitee.com/Zh-Sky/electron-vite-template) is only for domestic users to pull code; it is synced from GitHub — please visit GitHub for PRs
- **Welcome to Issues and PR**
