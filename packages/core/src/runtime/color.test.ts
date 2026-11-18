import { describe, expect, it } from "vitest";
import { parseColor } from "./color.js";

describe("parseColor", () => {
  it("parses 6-digit hex", () => {
    const [r, g, b] = parseColor("#ffffff");
    expect(r).toBeCloseTo(1, 5);
    expect(g).toBeCloseTo(1, 5);
    expect(b).toBeCloseTo(1, 5);
  });

  it("parses 3-digit hex", () => {
    const white = parseColor("#fff");
    const expanded = parseColor("#ffffff");
    expect(white).toEqual(expanded);
  });

  it("parses black to [0,0,0]", () => {
    expect(parseColor("#000000")).toEqual([0, 0, 0]);
  });

  it("parses rgb()", () => {
    expect(parseColor("rgb(255, 255, 255)")).toEqual(parseColor("#ffffff"));
  });

  it("parses hsl()", () => {
    const [r, g, b] = parseColor("hsl(0, 100%, 50%)");
    expect(r).toBeCloseTo(1, 4);
    expect(g).toBeCloseTo(0, 4);
    expect(b).toBeCloseTo(0, 4);
  });

  it("applies sRGB to linear conversion (mid-grey is not 0.5)", () => {
    const [r] = parseColor("#808080");
    expect(r).toBeGreaterThan(0.2);
    expect(r).toBeLessThan(0.3);
  });
});
