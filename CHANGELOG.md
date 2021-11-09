# 2021 年 11 月 09 日

- 修正热更新下载文件地址未补全的问题
# 2021 年 11 月 05 日

- 修复 `无边框逻辑出错` 问题
- 默认设置为 `无边框模式`

# 2021 年 11 月 04 日

- 去除 `vuex` 模块
- 使用 `pinia` 替代 `vuex`
- 修复 `创建子窗口数据传输丢失` 问题

# 2021 年 10 月 09 日

- 更新依赖
  - vue 3.2.12 -> 3.2.20
  - vite 2.5.8 -> 2.6.5
  - electron 13.1.9 -> 15.1.2 (有了中文控制台好耶！)

# 2021 年 08 月 16 日

- 将 builder 的配置剥离出来，不再和 package 混合在一起
- 更新 vue 版本到 3.2.3，vite 版本到 2.5.0

# 2021 年 08 月 15 日

- 设置渲染进程编译目标为 chrome91，**请注意，此次设置是为了解决顶层 await 无法正常编译的问题，但是也带来了直接放弃 chrome91 版本以下的，web 端请谨慎**
- 添加主进程在开发环境时对 static 文件夹的访问，`process.env.__static`

# 2021 年 08 月 11 日

- 新增 `i18n` 支持
- 新增 `i18n` 对 `element-plus` 的支持

# 2021 年 07 月 20 日

- 升级依赖
- `preload` 现在默认为 ts 版本，在修改了 `preload.ts之` 后，则会重新加载整个 electron，效果如同修改主进程代码。
- 加入 `preload` 和主进程混淆。
- 调整依赖位置，降低打包后 node_module 的大小

# 2021 年 06 月 22 日

- 渲染进程移除 `node` 相关内容，采用 `preload` 引入

> 说句实话，目前暂未有更好的解决方案使用 `preload`，考虑后续优化

**如需修改 `preload.js` ，请修改 `.electron-vite/preload.js`**

更多细节请参考：[Electron 文档-preload.js 参考示例](https://www.electronjs.org/docs/api/context-bridge#exposing-node-global-symbols)

# 2021 年 06 月 10 日

- 更新依赖

# 2021 年 06 月 08 日

- 渲染进程组件实现全 `setup` 化

## 如何使用 `setup`？

#### vscode 环境

- 禁用 `vetor` 或 `voter` 扩展
- 安装并启用扩展 `volor`

> 更多 `setup` 语法糖问题请访问 [New script setup](https://github.com/vuejs/rfcs/pull/227)

# 2021 年 02 月 26 日

- 项目创建。
