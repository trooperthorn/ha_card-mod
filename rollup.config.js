import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    file: "dist/card-mod.js",
    format: "es",
    sourcemap: dev ? true : false,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript({ noEmit: false, declaration: false, sourceMap: !!dev }),
    !dev && terser({ format: { comments: false } }),
  ],
  watch: {
    exclude: "node_modules/**",
  },
};
