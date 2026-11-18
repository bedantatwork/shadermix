import { defineConfig } from "tsup";

export default defineConfig({
  entry: { shadermix: "src/index.ts" },
  format: ["iife"],
  outExtension: () => ({ js: ".min.js" }),
  noExternal: ["@shadermix/core"],
  minify: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
});
