const path = require("path");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const esbuild = require("rollup-plugin-esbuild").default;
const alias = require("@rollup/plugin-alias");
const json = require("@rollup/plugin-json");
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
      nodeResolve({ jsnext: true, preferBuiltins: true, browser: true }), // 消除碰到 node.js 模块时⚠警告
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
      "crypto",
      "assert",
      "fs",
      "util",
      "os",
      "events",
      "child_process",
      "http",
      "https",
      "path",
      "electron",
      "express",
      "ffi-napi",
      "ref-napi",
      "ref-struct-napi",
      "semver",
      "glob",
    ],
  };

  if (process.env.NODE_ENV == "production") {
    configObject.plugins.push(obfuscator({}));
  }

  return configObject;
};

module.exports = config;
