import { describe, expect, it } from "vitest";
import type { Schema } from "../runtime/schema.js";
import { effectRegistry, registerEffect } from "./registry.js";

const testSchema = {
  speed: { type: "number", min: 0, max: 3, step: 0.05, default: 0.6, description: "" },
} satisfies Schema;

describe("effectRegistry", () => {
  it("registers and retrieves a {factory, schema} pair by slug", () => {
    const factory = () => ({
      update: () => {},
      play: () => {},
      pause: () => {},
      destroy: () => {},
    });

    registerEffect("test-effect", factory, testSchema);

    const registration = effectRegistry.get("test-effect");
    expect(registration?.factory).toBe(factory);
    expect(registration?.schema).toBe(testSchema);
  });
});
