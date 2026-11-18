import { describe, expect, it } from "vitest";
import { effectRegistry, registerEffect } from "./registry.js";

describe("effectRegistry", () => {
  it("registers and retrieves an effect factory by slug", () => {
    const factory = () => ({
      update: () => {},
      play: () => {},
      pause: () => {},
      destroy: () => {},
    });

    registerEffect("test-effect", factory);

    expect(effectRegistry.get("test-effect")).toBe(factory);
  });
});
