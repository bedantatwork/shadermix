import { describe, expect, it } from "vitest";
import { defaultsFromSchema, normalizeOptions, parseAttributes, type Schema } from "./schema.js";

const testSchema = {
  speed: { type: "number", min: 0, max: 3, step: 0.05, default: 0.6, description: "" },
  amplitude: { type: "number", min: 0, max: 2, step: 0.05, default: 1, description: "" },
  colors: { type: "colors", count: 3, default: ["#111", "#222", "#333"], description: "" },
  mouseReactive: { type: "boolean", default: false, description: "" },
  blend: { type: "enum", options: ["soft", "hard"], default: "soft", description: "" },
} satisfies Schema;

describe("defaultsFromSchema", () => {
  it("returns a fresh object matching each field's default", () => {
    const defaults = defaultsFromSchema(testSchema);
    expect(defaults).toEqual({
      speed: 0.6,
      amplitude: 1,
      colors: ["#111", "#222", "#333"],
      mouseReactive: false,
      blend: "soft",
    });
  });

  it("does not share array references with the schema default", () => {
    const defaults = defaultsFromSchema(testSchema);
    defaults.colors.push("#444");
    expect(testSchema.colors.default).toHaveLength(3);
  });
});

describe("parseAttributes", () => {
  function el(attrs: Record<string, string>): Element {
    const element = document.createElement("div");
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    return element;
  }

  it("falls back to defaults when no attributes are present", () => {
    expect(parseAttributes(el({}), testSchema)).toEqual(defaultsFromSchema(testSchema));
  });

  it("parses numbers, colors, booleans, and enums from kebab-case attributes", () => {
    const result = parseAttributes(
      el({
        "sm-speed": "1.2",
        "sm-colors": "#5227FF, #7CFF67, #00D1FF",
        "sm-mouse-reactive": "true",
        "sm-blend": "hard",
      }),
      testSchema,
    );
    expect(result.speed).toBe(1.2);
    expect(result.colors).toEqual(["#5227FF", "#7CFF67", "#00D1FF"]);
    expect(result.mouseReactive).toBe(true);
    expect(result.blend).toBe("hard");
    expect(result.amplitude).toBe(1);
  });

  it("falls back to the field default for an invalid enum value", () => {
    const result = parseAttributes(el({ "sm-blend": "nonsense" }), testSchema);
    expect(result.blend).toBe("soft");
  });
});

describe("normalizeOptions", () => {
  it("merges partial options over schema defaults", () => {
    const result = normalizeOptions(testSchema, { speed: 2 });
    expect(result.speed).toBe(2);
    expect(result.amplitude).toBe(1);
  });

  it("returns defaults when options is undefined", () => {
    expect(normalizeOptions(testSchema, undefined)).toEqual(defaultsFromSchema(testSchema));
  });
});
