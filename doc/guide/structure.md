# 目录结构

仓库以 pnpm monorepo 组织，三个顶层目录各自承担明确角色：**应用**、**可复用包**、**构建工具**。

```bash
├── apps/
│  └── desktop/                 # 应用本体（可交付单元）
│     ├── src/
│     │  ├── main/              # 主进程
│     │  │  ├── config/         #    静态路径 / 窗口配置 / 常量
│     │  │  ├── hooks/          #    菜单、F12 禁用、进程异常钩子
│     │  │  └── services/       #    窗口管理 / IPC 处理器 / 下载 / 更新 / 热更新
│     │  ├── preload/           # preload 脚本（contextBridge 白名单桥）
│     │  └── renderer/          # 渲染进程（Vue 3 单页应用）
│     │     ├── views/          #    页面（landing / Print / Browser 演示）
│     │     ├── components/     #    组件（自定义标题栏等）
│     │     ├── store/ router/  #    Pinia / vue-router
│     │     └── utils/          #    类型化 invoke/listen 封装等
│     ├── config/               # 构建期与应用运行期配置
│     ├── env/                  # dotenv 环境文件（.env / .prod.env / .sit.env）
│     ├── customTypes/          # 全局类型声明（Window 等）
│     ├── build.json            # electron-builder 配置
│     ├── afterPack.mjs         # 打包后钩子（rootLib 拷贝）
│     ├── rootLib/              # 按平台分发的二进制资源（如 win 更新器）
│     └── updateConfig.json     # 增量热更新配置
├── packages/
│  └── ipc-contract/            # IPC 通道合同（纯类型包，三端共享，无构建产物）
├── tools/
│  ├── build/                   # 构建工具链（非依赖包，由根脚本经 node 执行）
│  │  ├── configs/              #    rolldown / vite / externals 配置
│  │  ├── tasks/                #    build-electron / build-renderer / clean / hot-update
│  │  ├── shared/               #    env 读取、控制台格式化
│  │  └── dev-runner.ts         #    开发编排（server + watch + electron 拉起）
│  └── bytecode/                # 可选的主进程字节码保护（默认不参与构建）
├── doc/                        # 本文档站（VitePress）
├── pnpm-workspace.yaml         # workspace 声明 + 依赖构建白名单
└── package.json                # 根：脚本编排（vp run）+ 共享 devDependencies
```

## 划分原则

- **`apps/*` 是可部署单元**：有入口、会被打包成 `.app`/`.exe`；`packages/*` 是被依赖的库：无入口、随用随引。目录名即角色说明。
- **`tools/*` 是仓库私有的构建工具**，不是 npm 包——它们由根 `package.json` 的脚本以 `node` 直接执行，依赖（rolldown、vite-plus 等）声明在根 `devDependencies`。
- **pnpm 严格解析**：每个包只能 import 自己声明过的依赖。这是刻意的安全哨兵——渲染层误引 Node/electron 模块会直接构建报错，而不是在运行时悄悄失效。

## 产物去向

| 命令 | 产物路径 |
| --- | --- |
| `pnpm run build` / `build:dir` | `apps/desktop/dist/electron/`（主进程+preload+渲染层） |
| 完整安装包 / 免安装目录 | `apps/desktop/build/`（electron-builder 输出，已 gitignore） |
| `pnpm run build:web` | `apps/desktop/dist/web/` |
| `pnpm run pack:resources` | `apps/desktop/build/update/`（热更新 zip + 配置 json） |
