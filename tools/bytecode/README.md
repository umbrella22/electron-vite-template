# tools/bytecode

可选的主进程源码保护（V8 字节码）。**默认构建完全不启用本目录**，需要闭源交付时按下方两步接入。

## 原理

- 这是防"解压安装目录、双击打开看源码"的**减速带，不是墙**。
- V8 cachedData 中**字符串常量全部保留**：IPC 通道名、URL、提示语都可以被 `strings` 直接提取；被隐藏的是逻辑结构（控制流、函数边界、变量名）。
- XOR 混淆只防 `strings`，解密 key 就写在随包分发的 loader 里。
- LLM 时代，有经验的逆向者配合工具可以把字节码还原到接近源码；本模板源码本身公开，此能力只为基于模板做闭源商业交付的用户服务。

## 使用

```bash
# 1. 正常构建（产出 dist/electron/main/main.cjs）
npm run build

# 2. 字节码化（main.cjs 被替换为 loader 壳，并生成 main.bin）
cd apps/desktop
npm run build:bytecode

# 3. 照常打包
npx electron-builder -c build.json --dir
```

## 约束（务必了解）

1. **主进程必须保持单文件 CJS bundle**：`vm.Script` 的 cachedData 按整个脚本产出，且 loader 以 CommonJS 包装器执行字节码。当前 rolldown 配置（单 `main.cjs`）天然满足。
2. **V8 版本锁死**：`main.bin` 只能被编译它的同一 V8 版本加载。编译通过 `ELECTRON_RUN_AS_NODE=1` 在 devDependencies 锁定的 Electron 内进行，与 electron-builder 打包的版本一致，因此正常构建/打包流程无需关心。
3. **热更新纪律**：热更包若包含 `main.bin`，热更 CI 使用的 Electron 版本必须与用户已安装的壳一致（架构上热更从不携带 Electron 本体，该条件天然满足）。
4. **调试**：字节码模式下主进程报错栈指向 `main.cjs` 壳，排查问题时先用未启用字节码的构建复现。

## 文件

- `compile.mjs`：编译入口。普通 Node 运行时会以 `ELECTRON_RUN_AS_NODE=1` 重启自身在 Electron 内执行，保证 V8 版本一致。
- `loader.cjs`：随包分发的加载壳（bytenode 式：`--no-lazy`/`--no-flush-bytecode` + 缓存头 8-12 字节源码长度 + 12-16 字节 hash 归一化 + `vm.Script.runInThisContext`）。
