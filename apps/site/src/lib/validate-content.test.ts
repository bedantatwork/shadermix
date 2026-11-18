import { describe, expect, it, vi } from "vitest";
import { assertSlugLinks, checkSlugLinks } from "./validate-content";

describe("checkSlugLinks", () => {
  it("reports nothing when docs and effects match exactly", () => {
    expect(checkSlugLinks(["aurora", "silk"], ["silk", "aurora"])).toEqual({
      missingEffects: [],
      undocumentedEffects: [],
    });
  });

  it("reports docs that have no matching effect", () => {
    const report = checkSlugLinks(["aurora", "ghost"], ["aurora"]);
    expect(report.missingEffects).toEqual(["ghost"]);
  });

  it("reports effects that have no doc", () => {
    const report = checkSlugLinks(["aurora"], ["aurora", "plasma"]);
    expect(report.undocumentedEffects).toEqual(["plasma"]);
  });
});

describe("assertSlugLinks", () => {
  it("throws when a doc references a non-existent effect", () => {
    expect(() => assertSlugLinks(["ghost"], ["aurora"])).toThrow(/ghost/);
  });

  it("warns but does not throw for an undocumented effect", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => assertSlugLinks(["aurora"], ["aurora", "plasma"])).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("plasma"));
    warn.mockRestore();
  });

  it("passes silently when everything matches", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => assertSlugLinks(["aurora"], ["aurora"])).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
