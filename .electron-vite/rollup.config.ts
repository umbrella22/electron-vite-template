import path from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { builtinModules } from "module";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import obfuscator from "rollup-plugin-obfuscator";
import { defineConfig } from "rollup";
import { getConfig } from "./utils";
const config = getConfig();

export default (env = "production", type = "main") => {
  return defineConfig({
    input:
      type === "main"
        ? path.join(__dirname, "..", "src", "main", "index.ts")
        : path.join(__dirname, "..", "src", "preload", "index.ts"),
    output: {
      file: path.join(
        __dirname,
        "..",
        "dist",
        "electron",
        "main",
        `${type === "main" ? type : "preload"}.js`
      ),
      format: "cjs",
      name: type === "main" ? "MainProcess" : "MainPreloadProcess",
      sourcemap: false,
    },
    plugins: [
      replace({
        preventAssignment: true,
        "process.env.userConfig": config ? JSON.stringify(config) : "{}",
      }),
      // 提供路径和读取别名
      nodeResolve({
        preferBuiltins: true,
        browser: false,
        extensions: [".mjs", ".ts", ".js", ".json", ".node"],
      }),
      commonjs({
        sourceMap: false,
      }),
      json(),
      esbuild({
        // All options are optional
        include: /\.[jt]s?$/, // default, inferred from `loaders` option
        exclude: /node_modules/, // default
        // watch: process.argv.includes('--watch'), // rollup 中有配置
        sourceMap: false, // default
        minify: env === "production",
        target: "es2017", // default, or 'es20XX', 'esnext'
        // Like @rollup/plugin-replace
        define: {
          __VERSION__: '"x.y.z"',
        },
        // Add extra loaders
        loaders: {
          // Add .json files support
          // require @rollup/plugin-commonjs
          ".json": "json",
          // Enable JSX in .js files too
          ".js": "jsx",
        },
      }),
      alias({
        entries: [
          { find: "@main", replacement: path.join(__dirname, "../src/main") },
          {
            find: "@config",
            replacement: path.join(__dirname, "..", "config"),
          },
        ],
      }),
      process.env.NODE_ENV == "production" && obfuscator({}),
    ],
    external: [
      ...builtinModules,
      "axios",
      "electron",
      "express",
      "ffi-napi",
      "ref-napi",
      "ref-struct-napi",
      "semver",
      "glob",
    ],
  });
};
