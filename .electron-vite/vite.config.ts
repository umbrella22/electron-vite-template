import { join } from "path";
import { defineConfig } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { getConfig } from "./utils";

const IsWeb = process.env.BUILD_TARGET === "web";

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
    __ISWEB__: Number(IsWeb),
  },
  resolve: {
    alias: {
      "@renderer": root,
      "@store": join(root, "/store/modules"),
    },
  },
  base: "./",
  build: {
    outDir: IsWeb ? resolve("dist/web") : resolve("dist/electron/renderer"),
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: false,
  },
  server: {},
  plugins: [vueJsx(), vuePlugin()],
  optimizeDeps: {},
});
