# 2021年6月22日

- 渲染进程移除 `node` 相关内容，采用 `preload` 引入

> 说句实话，目前暂未有更好的解决方案使用 `preload`，考虑后续优化

**如需修改 `preload.js` ，请修改 `.electron-vite/preload.js`**

更多细节请参考：[Electron文档-preload.js参考示例](https://www.electronjs.org/docs/api/context-bridge#exposing-node-global-symbols)

# 2021年6月10日

- 更新依赖

# 2021年06月08日

- 渲染进程组件实现全 `setup` 化

## 如何使用 `setup`？

#### vscode 环境

- 禁用 `vetor` 或 `voter` 扩展
- 安装并启用扩展 `volor`

> 更多 `setup` 语法糖问题请访问 [New script setup](https://github.com/vuejs/rfcs/pull/227)

# 2021年02月26日

- 项目创建。