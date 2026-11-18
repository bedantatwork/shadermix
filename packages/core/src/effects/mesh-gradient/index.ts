import { parseColor } from "../../runtime/color.js";
import { createShaderEffect } from "../../runtime/create-shader-effect.js";
import type { GLContext } from "../../runtime/gl.js";
import type { OptionsFromSchema } from "../../runtime/schema.js";
import { registerEffect, type EffectInstance } from "../registry.js";
import fragmentSource from "./mesh-gradient.frag.glsl";
import { schema, slug } from "./meta.js";

export { category, name, schema, slug } from "./meta.js";

const UNIFORM_NAMES = [
  "uColorA",
  "uColorB",
  "uColorC",
  "uColorD",
  "uSpeed",
  "uDistortion",
  "uGrain",
] as const;

function applyUniforms(
  gl: GLContext,
  uniforms: Record<string, WebGLUniformLocation | null>,
  options: OptionsFromSchema<typeof schema>,
): void {
  const [r0, g0, b0] = parseColor(options.colors[0] ?? "#000000");
  const [r1, g1, b1] = parseColor(options.colors[1] ?? "#000000");
  const [r2, g2, b2] = parseColor(options.colors[2] ?? "#000000");
  const [r3, g3, b3] = parseColor(options.colors[3] ?? "#000000");
  gl.uniform3f(uniforms.uColorA ?? null, r0, g0, b0);
  gl.uniform3f(uniforms.uColorB ?? null, r1, g1, b1);
  gl.uniform3f(uniforms.uColorC ?? null, r2, g2, b2);
  gl.uniform3f(uniforms.uColorD ?? null, r3, g3, b3);
  gl.uniform1f(uniforms.uSpeed ?? null, options.speed);
  gl.uniform1f(uniforms.uDistortion ?? null, options.distortion);
  gl.uniform1f(uniforms.uGrain ?? null, options.grain);
}

function cssFallback(options: OptionsFromSchema<typeof schema>): string {
  return `linear-gradient(135deg, ${options.colors.join(", ")})`;
}

export function createMeshGradient(
  target: HTMLCanvasElement | HTMLElement,
  options?: Record<string, unknown>,
): EffectInstance {
  return createShaderEffect(target, options, {
    schema,
    fragmentSource,
    uniformNames: UNIFORM_NAMES,
    applyUniforms,
    cssFallback,
  });
}

registerEffect(slug, createMeshGradient);
