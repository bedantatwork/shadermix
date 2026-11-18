export type GLContext = WebGL2RenderingContext | WebGLRenderingContext;

const CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  antialias: false,
  alpha: true,
  premultipliedAlpha: true,
  powerPreference: "low-power",
};

/** Prefers WebGL2, falls back to WebGL1. Returns null if neither is available. */
export function createGLContext(canvas: HTMLCanvasElement): GLContext | null {
  const gl2 = canvas.getContext("webgl2", CONTEXT_ATTRIBUTES) as WebGL2RenderingContext | null;
  if (gl2) return gl2;
  return canvas.getContext("webgl", CONTEXT_ATTRIBUTES) as WebGLRenderingContext | null;
}
