import { join } from "path";
import { defineConfig } from "vite-plus";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { getConfig } from "../shared/env.ts";

// 应用包根目录（tools/build 的上两级）
const appRoot = join(import.meta.dirname, "..", "..", "..", "apps", "desktop");
const config = getConfig();

const root = join(appRoot, "src/renderer");

export default defineConfig({
  mode: config && config.NODE_ENV,
  root,
  envDir: join(appRoot, "env"),
  define: {
    __CONFIG__: config,
    __ISWEB__: Number(config && config.target),
  },
  resolve: {
    alias: {
      "@renderer": root,
      "@store": join(root, "/store/modules"),
    },
  },

  base: "./",
  build: {
    outDir:
      config && config.target
        ? join(appRoot, "dist/web")
        : join(appRoot, "dist/electron/renderer"),
    emptyOutDir: true,
    target: "esnext",
    cssCodeSplit: false,
    // 渲染层运行在 contextIsolation + sandbox 中，不允许访问 electron/node 模块；
    // 刻意不配置 external，误引入会直接构建报错
  },
  server: {},
  plugins: [vueJsx(), vuePlugin()],
  optimizeDeps: {},
});
