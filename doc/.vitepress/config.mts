import { defineConfig } from 'vitepress'

// GitHub Pages 项目页会部署在 <user>.github.io/<repo>/ 下，base 必须与仓库名一致
export default defineConfig({
  lang: 'zh-CN',
  title: 'electron-vite-template',
  description:
    '基于 Electron + Vue3 + Vite(rolldown) + TypeScript 的 pnpm monorepo 桌面应用模板：域分组类型化 IPC、contextBridge 安全模型、可选字节码保护',
  base: '/electron-vite-template/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: 'electron-vite-template',
    logo: '/logo.png',
    lastUpdatedText: '最后更新时间',
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-present umbrella22',
    },
    nav: [
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      {
        text: '相关文档',
        items: [
          { text: 'Electron', link: 'https://www.electronjs.org/zh/docs/latest/' },
          { text: 'Vue 3', link: 'https://cn.vuejs.org/' },
          { text: 'Vite', link: 'https://cn.vitejs.dev/' },
          { text: 'Rolldown', link: 'https://rolldown.rs/' },
          { text: 'Vite+（vp）', link: 'https://viteplus.dev/' },
          { text: 'pnpm', link: 'https://pnpm.io/zh/' },
          { text: 'electron-builder', link: 'https://www.electron.build/' },
          { text: 'Pinia', link: 'https://pinia.vuejs.org/zh/' },
        ],
      },
      {
        text: 'v1.0.0',
        items: [],
      },
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '项目介绍', link: '/guide/' },
          { text: '快速上手', link: '/guide/getting-started' },
          { text: '目录结构', link: '/guide/structure' },
        ],
      },
      {
        text: '核心机制',
        items: [
          { text: 'IPC 合同系统', link: '/guide/ipc' },
          { text: '安全模型', link: '/guide/security' },
        ],
      },
      {
        text: '工程化',
        items: [
          { text: '构建与打包', link: '/guide/build' },
          { text: '热更新', link: '/guide/hot-update' },
          { text: '字节码保护', link: '/guide/bytecode' },
          { text: 'CI 工作流', link: '/guide/ci' },
        ],
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/umbrella22/electron-vite-template',
      },
    ],
  },
})
