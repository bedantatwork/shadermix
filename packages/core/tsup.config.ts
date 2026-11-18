import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    auto: "src/auto.ts",
    effects: "src/effects/index.ts",
    aurora: "src/effects/aurora/index.ts",
    "mesh-gradient": "src/effects/mesh-gradient/index.ts",
    "grain-gradient": "src/effects/grain-gradient/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  minify: true,
  esbuildOptions(options) {
    options.loader = { ...options.loader, ".glsl": "text" };
  },
});
