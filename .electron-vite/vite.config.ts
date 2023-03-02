import { join } from "path";
import { defineConfig } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { getConfig } from "./utils";

function resolve(dir: string) {
  return join(__dirname, "..", dir);
}
const config = getConfig();

const root = resolve("src/renderer");

export default defineConfig({
  mode: process.env.NODE_ENV,
  root,
  define: {
    __CONFIG__: config,
  },
  resolve: {
    alias: {
      "@renderer": root,
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
    minify: "esbuild",
    cssCodeSplit: false,
  },
  server: {},
  plugins: [vueJsx(), vuePlugin()],
  optimizeDeps: {},
});
