import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    auto: "src/auto.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  minify: true,
});
