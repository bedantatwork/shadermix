import type { EffectInstance } from "../effects/registry.js";
import { createGLContext, type GLContext } from "./gl.js";
import { createShaderProgram, drawFullscreenQuad } from "./program.js";
import { scheduleFrame, unscheduleFrame } from "./scheduler.js";
import { normalizeOptions, type OptionsFromSchema, type Schema } from "./schema.js";

export interface ShaderEffectConfig<S extends Schema> {
  schema: S;
  fragmentSource: string;
  /** Effect-specific uniform names, beyond the standard uTime/uResolution/uMouse. */
  uniformNames?: readonly string[];
  /** Sets effect-specific uniforms each frame from the current options. */
  applyUniforms(
    gl: GLContext,
    uniforms: Record<string, WebGLUniformLocation | null>,
    options: OptionsFromSchema<S>,
  ): void;
  /** CSS gradient used when WebGL is unavailable or the context is permanently lost. */
  cssFallback(options: OptionsFromSchema<S>): string;
}

const MAX_RECOMMENDED_CONTEXTS = 8;
let liveContextCount = 0;
let warnedTooManyContexts = false;

function resolveCanvas(target: HTMLCanvasElement | HTMLElement): {
  canvas: HTMLCanvasElement;
  owned: boolean;
} {
  if (target instanceof HTMLCanvasElement) {
    return { canvas: target, owned: false };
  }

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.zIndex = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  if (getComputedStyle(target).position === "static") {
    target.style.position = "relative";
  }
  target.insertBefore(canvas, target.firstChild);
  return { canvas, owned: true };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export function createShaderEffect<S extends Schema>(
  target: HTMLCanvasElement | HTMLElement,
  rawOptions: Record<string, unknown> | undefined,
  config: ShaderEffectConfig<S>,
): EffectInstance {
  const { canvas, owned } = resolveCanvas(target);
  canvas.setAttribute("aria-hidden", "true");

  let options = normalizeOptions(config.schema, rawOptions);
  let respectReducedMotion = rawOptions?.respectReducedMotion !== false;
  let playing = true;
  let visible = true;
  let tabVisible = document.visibilityState !== "hidden";
  let destroyed = false;
  let mouse: [number, number] = [0.5, 0.5];
  let startTime: number | null = null;

  const glOrNull = createGLContext(canvas);
  if (!glOrNull) {
    canvas.style.background = config.cssFallback(options);
    return {
      update(patch) {
        options = normalizeOptions(config.schema, { ...options, ...patch });
        canvas.style.background = config.cssFallback(options);
      },
      play() {},
      pause() {},
      destroy() {
        if (owned) canvas.remove();
      },
    };
  }
  // Re-bound with a non-nullable type: closures below capture `gl`, and TS
  // doesn't propagate the null-check narrowing from `glOrNull` into them.
  const gl: GLContext = glOrNull;

  liveContextCount++;
  if (liveContextCount > MAX_RECOMMENDED_CONTEXTS && !warnedTooManyContexts) {
    warnedTooManyContexts = true;
    console.warn(
      `[shadermix] ${liveContextCount} live WebGL contexts on this page — browsers cap this ` +
        `around 16. Pause or destroy effects that are off-screen.`,
    );
  }

  const uniformNames = ["uTime", "uResolution", "uMouse", ...(config.uniformNames ?? [])];
  let shaderProgram = createShaderProgram(gl, config.fragmentSource, uniformNames);

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }
  resize();

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true;
      syncSchedule();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(canvas);

  function onVisibilityChange(): void {
    tabVisible = document.visibilityState !== "hidden";
    syncSchedule();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  function onPointerMove(event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    mouse = [
      (event.clientX - rect.left) / Math.max(rect.width, 1),
      1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
    ];
  }
  canvas.addEventListener("pointermove", onPointerMove);

  function onContextLost(event: Event): void {
    event.preventDefault();
    unscheduleFrame(frame);
    canvas.style.background = config.cssFallback(options);
  }
  function onContextRestored(): void {
    shaderProgram = createShaderProgram(gl, config.fragmentSource, uniformNames);
    canvas.style.background = "";
    syncSchedule();
  }
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  function draw(time: number): void {
    if (!shaderProgram) return;
    if (startTime === null) startTime = time;
    const elapsed = (time - startTime) / 1000;

    gl.useProgram(shaderProgram.program);
    shaderProgram.bindQuad();
    gl.uniform1f(shaderProgram.uniforms.uTime ?? null, elapsed);
    gl.uniform2f(shaderProgram.uniforms.uResolution ?? null, canvas.width, canvas.height);
    gl.uniform2f(shaderProgram.uniforms.uMouse ?? null, mouse[0], mouse[1]);
    config.applyUniforms(gl, shaderProgram.uniforms, options);
    drawFullscreenQuad(gl);
  }

  function frame(time: number): void {
    draw(time);
  }

  function shouldAnimate(): boolean {
    return (
      playing &&
      visible &&
      tabVisible &&
      !destroyed &&
      (!respectReducedMotion || !prefersReducedMotion())
    );
  }

  function syncSchedule(): void {
    if (destroyed) return;
    if (shouldAnimate()) {
      scheduleFrame(frame);
    } else {
      unscheduleFrame(frame);
    }
  }

  // Paint one frame immediately so there's never a blank flash, then start the loop if applicable.
  requestAnimationFrame((t) => draw(t));
  syncSchedule();

  return {
    update(patch) {
      if (patch && Object.hasOwn(patch, "respectReducedMotion")) {
        respectReducedMotion = patch.respectReducedMotion !== false;
      }
      options = normalizeOptions(config.schema, { ...options, ...patch });
      syncSchedule();
    },
    play() {
      playing = true;
      syncSchedule();
    },
    pause() {
      playing = false;
      syncSchedule();
    },
    destroy() {
      destroyed = true;
      unscheduleFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      liveContextCount--;
      if (owned) canvas.remove();
    },
  };
}
