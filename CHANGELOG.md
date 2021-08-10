# 2021 年 8 月 6 日

- master
    - 更新依赖，并添加 glob 依赖，解决部分人出现`glob is undefined`的错误，暂时将`semver`添加为外部依赖，清除部分循环引入的问题。
- strict
    - 合并preload和main的rollup配置文件，并且在开发环境时，不会开启代码混淆。

# 2021 年 7 月 20 日

- 更新依赖
- `__static`静态目录现在将不会补全`/`，例如开发环境时是：`http://localhost:9080`，生产环境则是`软件所在目录/resources/app/dist/electron/renderer`，需要注意的是，在生产环境中，不一定是`/`，路径分隔符是由当前操作系统决定，请自行拼接。
- 调整依赖结构，降低 node_module 包内包含的内容。
- 开启主进程代码混淆。

# 2021 年 7 月 15 日

- 修正在渲染进程中无法使用`__static`静态目录的问题，同时，在生产环境时，若要访问`__lib`文件夹，请使用`process.env.__lib`，可以通过`process.env`对象得到的静态目录还有`__static`，`__updateFolder`。
- 修正部分单词拼写错误。
- 更新依赖
- 主进程添加代码混淆但暂不启用

# 2021 年 6 月 10 日

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
