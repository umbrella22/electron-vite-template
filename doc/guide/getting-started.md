# 快速上手

## 环境准备

- **Node.js ≥ 24**：构建脚本使用 Node 原生 TypeScript 运行（不再依赖 tsx），低版本无法执行
- **pnpm**：本仓库唯一包管理器。已安装 Node 的话推荐 `corepack enable`，会按 `packageManager` 字段自动对齐版本

## 获取与安装

```bash
git clone https://github.com/umbrella22/electron-vite-template.git
cd electron-vite-template
pnpm install
```

::: tip 首次安装
`pnpm-workspace.yaml` 中的 `allowBuilds` 已放行 electron / esbuild 等需要安装脚本的依赖，electron 运行时二进制会在 `pnpm install` 阶段自动下载。如遇网络问题，可在用户级 `.npmrc` 配置 `ELECTRON_MIRROR` 镜像。
:::

## 开发

```bash
pnpm dev
```

该命令会依次完成：启动渲染层 vite dev server → rolldown watch 模式编译 main 与 preload → 拉起 Electron。修改渲染层代码即时热更新；修改主进程代码会自动重启应用；修改 preload 会触发重新编译。

## 常用命令速查

所有命令在仓库根目录执行：

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发环境 |
| `pnpm run build` | 构建 + 打出当前平台的完整安装包 |
| `pnpm run build:dir` | 构建 + 仅产出免安装目录（不生成安装器，验证打包首选） |
| `pnpm run build:win64` / `build:mac` | 构建并打出指定平台安装包 |
| `pnpm run build:web` | 仅构建渲染层为纯 Web 版本（产物在 `apps/desktop/dist/web`） |
| `pnpm run build:clean` | 清理全部构建产物 |
| `pnpm run pack:resources` | 打包热更新资源（见[热更新](/guide/hot-update)） |
| `pnpm --filter docs dev` | 本地预览本文档站 |

## 环境变量

`apps/desktop/env/` 下按环境存放 dotenv 文件，约定 `.环境名.env`：

```bash
pnpm dev            # 未携带环境时使用 env/.env
pnpm dev -m sit     # 开发脚本支持 -m 时使用 env/.sit.env
```

构建侧的配置读取自 `apps/desktop/config/index.ts`：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `build.hotPublishUrl` | `''` | 热更新资源托管的完整 URL（见[热更新](/guide/hot-update)） |
| `build.hotPublishConfigName` | `'update-config'` | 热更新配置文件名 |
| `dev.removeElectronJunk` | `true` | 过滤 Electron 原生日志噪音 |
| `dev.chineseLog` | `false` | 控制台部分输出中文化 |
| `dev.port` | `9080` | 开发服务器端口（被占用时自动顺延） |
| `IsUseSysTitle` | `false` | 是否使用系统标题栏（影响自定义标题栏） |
| `HotUpdateFolder` | `'update'` | 增量更新解包目录名 |

## 下一步

- 了解 monorepo 的目录划分：[目录结构](/guide/structure)
- 看看这个模板最重要的机制：[IPC 合同系统](/guide/ipc)
