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

export const effectRegistry = new Map<string, EffectFactory>();

export function registerEffect(slug: string, factory: EffectFactory): void {
  effectRegistry.set(slug, factory);
}
