# CI 工作流

`.github/workflows/` 下共四个 GitHub Actions 工作流，全部基于 **pnpm + Node 24**（`pnpm/action-setup` 版本自动读取根 `package.json` 的 `packageManager` 字段；`--frozen-lockfile` 保证 CI 与本地依赖树一致）。

| 工作流 | 触发 | Runner | 做什么 |
| --- | --- | --- | --- |
| `Build.yml`（Build TEST） | push / PR → main | windows-latest | 完整构建 + 打包，作为合入前的冒烟验证 |
| `Test.yml` | push → main | windows / macOS / Ubuntu 三平台矩阵 | 三平台构建可用性验证 |
| `release.yml` | push tag `v*` | 三平台矩阵 | 完整构建 + 打安装包，把 `apps/desktop/build/` 下的 `.exe` / `.dmg` / `.AppImage` / `.deb` 附到 GitHub Release |
| `Build Update.yml`（已退役） | release 发布 | windows-latest | 原用于把热更资源部署到 gh-pages；gh-pages 已转作文档站，该工作流已删除 |

## 关键实现细节

- **依赖安装**：`pnpm install --frozen-lockfile`。electron 二进制下载依赖 `pnpm-workspace.yaml` 的 `allowBuilds` 白名单，该文件随仓库分发，CI 无需额外配置；
- **产物路径**：monorepo 化后所有构建产物在 `apps/desktop/dist` 与 `apps/desktop/build`，工作流中的路径引用都已对齐；
- **发布产物匹配**：`release.yml` 的 `files` 通配基于 `apps/desktop/build/`，改动输出目录时记得同步。

## 本地等价命令

CI 做的事都可以在本地复现：

```bash
pnpm install --frozen-lockfile   # 等价 CI 安装
pnpm run build                   # 等价 Build.yml / release.yml 的构建阶段
pnpm run build:dir               # 等价 Build Updater 的目录打包
pnpm run pack:resources          # 热更资源打包
```

## macOS 签名

本机配置过签名证书时 electron-builder 会自动签名；CI 环境无证书时默认跳过。如需在 CI 签名/公证，按 electron-builder 文档配置 `CSC_LINK`、`CSC_KEY_PASSWORD`、`APPLE_ID` 等 secrets。
