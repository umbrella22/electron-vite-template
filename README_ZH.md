# Electron-Vite-template

[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/umbrella22/electron-vite-template)
![GitHub Repo stars](https://img.shields.io/github/stars/umbrella22/electron-vite-template)
[![vue](https://img.shields.io/badge/vue-3.2.23-brightgreen.svg)](https://github.com/vuejs/vue-next)
[![vite](https://img.shields.io/badge/vite-2.6.14-brightgreen.svg)](https://github.com/vitejs/vite)
[![element-ui](https://img.shields.io/badge/element-plus-brightgreen.svg)](https://www.npmjs.org/package/element-plus)
[![electron](https://img.shields.io/badge/electron-15.3.1-brightgreen.svg)](https://github.com/electron/electron)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/umbrella22/electron-vite-template/blob/master/LICENSE)

[国内访问地址](https://gitee.com/Zh-Sky/electron-vite-template)

### 请确保您的 node 版本大于等于 16.

#### 如何安装

```bash
npm config edit
# 该命令会打开npm的配置文件，请在空白处添加，记得去除#号
# electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
# electron_custom_dir={{ version }}
# electron_mirror=https://cdn.npmmirror.com/binaries/electron/v
# registry=https://registry.npmmirror.com/
# 然后关闭该窗口，重启命令行.
# 使用yarn安装
yarn or yarn install

# 启动之后，会在9080端口监听
yarn dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
yarn build

```

---

# [更新日志](/CHANGELOG.md)
