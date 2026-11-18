import type { Schema } from "../runtime/schema.js";

export interface EffectInstance {
  update(options: Record<string, unknown>): void;
  play(): void;
  pause(): void;
  destroy(): void;
}

export type EffectFactory = (
  target: HTMLCanvasElement | HTMLElement,
  options?: Record<string, unknown>,
) => EffectInstance;

export interface EffectRegistration {
  factory: EffectFactory;
  schema: Schema;
}

export const effectRegistry = new Map<string, EffectRegistration>();

/** `schema` lets attribute-based auto-init (auto.ts) parse `sm-*` attributes with the right types. */
export function registerEffect(slug: string, factory: EffectFactory, schema: Schema): void {
  effectRegistry.set(slug, { factory, schema });
}
