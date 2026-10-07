# 构建与打包

## 构建流水线

所有构建经 `vp run`（vite-plus 任务流水线）编排，以 `apps/desktop` 的 `build` 脚本为入口：

```bash
pnpm run build          # 构建 + 打出完整安装包（当前平台）
pnpm run build:dir      # 构建 + 仅产出免安装目录（验证打包首选，速度快）
```

内部拆解为三个任务，由 vp 负责顺序与缓存：

1. `clean` —— 清理旧产物（`apps/desktop/dist`、`apps/desktop/build` 中非图标内容）；
2. `build:electron` —— rolldown 并行编译 main 与 preload（单文件 CJS bundle，输出到 `apps/desktop/dist/electron/main/`）；
3. `build:renderer` —— vite-plus 构建渲染层。

**缓存**：源码未变化的任务在下次构建时直接命中缓存跳过（缓存按文件哈希失效，改哪个文件只重跑受影响的任务；删除 `dist` 后命中缓存也能完整还原产物）。脚手架默认已开启 `--cache`。

## electron-builder 配置

打包配置在 `apps/desktop/build.json`（不再内联于 package.json）：

- `files: ["dist/electron/**/*"]`——只打包构建产物，不携带 node_modules；
- `directories.output: "build"`——安装包输出到 `apps/desktop/build/`；
- `afterPack` 钩子（`afterPack.mjs`）负责把 `rootLib/<平台>/<架构>` 的二进制资源拷入应用。注意 **electron-builder 26.17 校验钩子必须位于应用目录内**，因此该文件不能移动到 `tools/build`；
- Windows 图标在 `apps/desktop/build/icons/`。

各平台产物：Windows 生成 nsis 安装器，macOS 生成 dmg（本机装有签名证书时会自动签名），Linux 生成 AppImage/deb。

## Web 版本

```bash
pnpm run build:web
```

仅构建渲染层为纯 Web 应用（`apps/desktop/dist/web`）。注意 Web 环境下不可调用任何 electron API；可用 `window.ipcBridge` 是否存在来区分运行环境。

## 环境文件

`apps/desktop/env/` 下按 `.环境名.env` 约定存放 dotenv 文件，`-m` 参数选择环境（未传时用 `.env`）。env 中定义的变量会注入构建配置（`getConfig`），渲染层通过编译期宏 `__CONFIG__` 访问。

## 主进程产物形态

主进程始终输出为**单文件 CJS bundle**（`main.cjs`，electron/semver 为 external，其余依赖全部内联）。这是刻意的：单文件加载最快，也是[字节码保护](/guide/bytecode)的先决条件。启用字节码后该文件会被替换为 loader 壳 + `main.bin`，构建链路的其余部分完全不变。

## 常见问题

- **打包出的应用启动即崩溃**：检查 `apps/desktop/package.json` 的 `main` 字段是否指向 `./dist/electron/main/main.cjs`，以及 `dist` 是否由当前代码构建（改完代码记得重新构建再打包）；
- **依赖装完但构建找不到模块**：确认依赖声明在使用它的包里。pnpm 严格解析下"别人装了我也能用"（幽灵依赖）不再成立；
- **签名失败（macOS）**：CI 或无证书环境可在环境变量中设置 `CSC_IDENTITY_AUTO_DISCOVERY=false` 跳过签名。
