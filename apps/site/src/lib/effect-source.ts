import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Reads the real shader + factory source for "Source" tab display (plan §6.4's
// "own the code" model). Build-time only (Node fs) — never ships to the client.
export function readEffectSource(slug: string): { shader: string; factory: string } {
  const dir = resolve(process.cwd(), "../../packages/core/src/effects", slug);
  const shader = readFileSync(resolve(dir, `${slug}.frag.glsl`), "utf-8");
  const factory = readFileSync(resolve(dir, "index.ts"), "utf-8");
  return { shader, factory };
}
