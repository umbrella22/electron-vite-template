const path = require("path");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { builtinModules } = require('module')
const commonjs = require("@rollup/plugin-commonjs");
const alias = require("@rollup/plugin-alias");
const json = require("@rollup/plugin-json");
const esbuild = require("rollup-plugin-esbuild").default;
const replace = require("@rollup/plugin-replace");
const obfuscator = require("rollup-plugin-obfuscator").default;

const config = (env = "production", type = "main") => {
  const configObject = {
    input:
      type === "main"
        ? path.join(__dirname, "..", "src", "main", "index.ts")
        : path.join(__dirname, "..", "src", "preload", "index.ts"),
    output: {
      file: path.join(
        __dirname,
        "..", "dist", "electron", "main", `${type === "main" ? type : "preload"}.js`
      ),
      format: "cjs",
      name: type === "main" ? "MainProcess" : "MainPreloadProcess",
      sourcemap: false,
    },
    plugins: [
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(env),
      }),
      // 提供路径和读取别名
      nodeResolve({ preferBuiltins: true, browser: false, extensions: ['.mjs', '.ts', '.js', '.json', '.node'] }),
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
    ],
    external: [
      ...builtinModules,
      'axios',
      'electron',
      'electron-devtools-installer',
      'express',
      'ffi-napi',
      'ref-napi',
      'ref-struct-napi',
      // 修正部分人会导致丢失依赖的问题，如果updater工作不正常请取消下面的注释，并自行安装semver
      'semver',
      'glob',
    ],
  };

  if (process.env.NODE_ENV == "production") {
    configObject.plugins.push(obfuscator({}));
  }

  return configObject;
};

module.exports = config;
