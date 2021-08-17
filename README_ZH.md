# Electron-Vite-template

[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/umbrella22/electron-vite-template)
![GitHub Repo stars](https://img.shields.io/github/stars/umbrella22/electron-vite-template)
[![vue](https://img.shields.io/badge/vue-3.2.3-brightgreen.svg)](https://github.com/vuejs/vue-next)
[![vite](https://img.shields.io/badge/vite-2.5.0-brightgreen.svg)](https://github.com/vitejs/vite)
[![element-ui](https://img.shields.io/badge/element-plus-brightgreen.svg)](https://www.npmjs.org/package/element-plus)
[![electron](https://img.shields.io/badge/electron-13.1.9-brightgreen.svg)](https://github.com/electron/electron)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/umbrella22/electron-vite-template/blob/master/LICENSE)

[国内访问地址](https://gitee.com/Zh-Sky/electron-vite-template)

### 请确保您的 node 版本大于等于 14.

#### 如何安装

```bash
# 安装依赖，这里有个问题，可能ELECTRON或者postcss会由于玄学原因安装失败，此时我推荐使用cnpm安装依赖然后！删除那个node_modules包，重新npm i，这样做的原因是
# ELECTRON只要下载了一次您自己没有清除缓存的话，就可以直接使用上次的安装包，这样通过cnpm安装完成之后，一定！要删除一次依赖包！一定哦！
# 再使用npm安装就会使用缓存了，免去那个魔法的过程～～
# 或者可以使用更加优秀的yarn。
# 当然，yarn也需要配置淘宝镜像，需要将配置到系统的环境变量里
npm install or yarn install

# 启动之后，会在9080端口监听
# 需要重新运行一次此命令
npm run dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
npm run build

# 启动单元测试模块,但是需要注意的是,我没有更新依赖,所以很可能会导致失败
npm test
# 如若实在不行无法安装electron依赖，请使用
npm config edit
# 该命令会打开npm的配置文件，请在空白处添加
# registry=https://registry.npm.taobao.org/
# electron_mirror=https://cdn.npm.taobao.org/dist/electron/
# ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
# 然后关闭该窗口，重启命令行，删除node_modules文件夹，并重新安装依赖即可

```

---

# [更新日志](/CHANGELOG.md)
