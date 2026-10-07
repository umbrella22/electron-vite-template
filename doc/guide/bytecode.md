# 字节码保护

可选能力：把主进程 bundle 编译为 **V8 字节码**，交付物中不再包含可读的 JS 源码。默认构建**完全不启用**本能力，`tools/bytecode` 目录不参与任何构建流水线。

## 先读：诚实定位

- 这是防"解压安装目录、双击打开看源码"的**减速带，不是墙**；
- V8 cachedData 中**字符串常量全部保留**——IPC 通道名、URL、提示语都可以被 `strings` 直接提取，被隐藏的只有逻辑结构；
- XOR 混淆只防 `strings` 扫描，解密 key 就写在随包分发的 loader 里；
- 本模板源码公开，该能力只为基于模板做**闭源商业交付**的用户服务。

如果上述可以接受（或正合需求），它以极低的成本覆盖了最常见的窥探场景。

## 使用

```bash
# 1. 正常构建（产出 dist/electron/main/main.cjs）
pnpm run build

# 2. 字节码化：main.cjs 被替换为 loader 壳，并生成 main.bin
cd apps/desktop
pnpm run build:bytecode

# 3. 照常打包
npx electron-builder -c build.json --dir
```

完成后 `apps/desktop/dist/electron/main/` 中是 `main.bin`（字节码）+ `main.cjs`（约 1KB 的 loader 壳）。

## 实现原理

V8 的 cachedData 与编译它的 V8 版本及 flags 锁定，因此编译必须在**与打包运行时一致的 Electron** 内进行：

- `tools/bytecode/compile.mjs`：以普通 Node 运行时会用 `ELECTRON_RUN_AS_NODE=1` 把自己重新拉起在 Electron 内执行——devDependencies 锁定的 electron 版本就是 electron-builder 打包的版本，V8 天然一致；
- `tools/bytecode/loader.cjs`：随包分发的加载壳。要点：设置 `--no-lazy`（函数全量编译进缓存）与 `--no-flush-bytecode`（防 GC 冲刷）；缓存头 8-12 字节是源码长度（**小端**），据此构造等长占位源码；12-16 字节用当前 flags 生成的空脚本缓存头归一化；最后 `vm.Script.runInThisContext` 以 CJS 包装器执行字节码。

编译在构建期一条命令完成，无打包钩子、无额外工具链（Electron 本身就是编译器）。

## 约束

1. **主进程必须保持单文件 CJS bundle**——`vm.Script` 的 cachedData 按整个脚本产出，loader 以 CommonJS 包装器执行。当前 rolldown 配置天然满足，但不要给主进程开代码分割或转 ESM；
2. **V8 版本锁死**——`main.bin` 只能被同一 V8 加载。升级 Electron 后必须重新执行 `build:bytecode`；
3. **热更新**——热更包若含 `main.bin`，热更 CI 的 Electron 版本必须与用户已装的壳一致（架构上热更从不携带 Electron 本体，天然满足）；
4. **调试**——字节码模式下主进程报错栈指向 loader 壳。排查问题时先用未启用字节码的构建复现。
