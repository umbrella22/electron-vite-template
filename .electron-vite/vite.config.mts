import { join } from "path";
import { defineConfig } from "vite-plus";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { getConfig } from "./utils";
import { rendererExternals } from "./externals";

function resolve(dir: string) {
  return join(__dirname, "..", dir);
}
const config = getConfig();

const root = resolve("src/renderer");

export default defineConfig({
  mode: config && config.NODE_ENV,
  root,
  define: {
    __CONFIG__: config,
    __ISWEB__: Number(config && config.target),
  },
  resolve: {
    alias: {
      "@renderer": root,
      "@store": join(root, "/store/modules"),
      "@ipcManager": join(__dirname, "..", "src", "ipc"),
    },
  },

  base: "./",
  build: {
    outDir:
      config && config.target
        ? resolve("dist/web")
        : resolve("dist/electron/renderer"),
    emptyOutDir: true,
    target: "esnext",
    cssCodeSplit: false,
    rolldownOptions: {
      // 渲染层通过 nodeIntegration 的 require 访问 electron 与 node 内置模块，
      // external 使 rolldown 不打包桩代码、改为运行时解析；清单见 ./externals.ts
      external: rendererExternals,
    },
  },
  server: {},
  plugins: [vueJsx(), vuePlugin()],
  optimizeDeps: {},
});
