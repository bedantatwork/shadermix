import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vitest/config";

function glsl(): Plugin {
  return {
    name: "glsl-raw",
    transform(_code, id) {
      if (!id.endsWith(".glsl")) return null;
      const source = readFileSync(id, "utf-8");
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

export default defineConfig({
  plugins: [glsl()],
  test: {
    environment: "happy-dom",
  },
});
