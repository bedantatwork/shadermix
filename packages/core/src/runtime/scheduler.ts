export type FrameCallback = (time: number) => void;

const callbacks = new Set<FrameCallback>();
let rafId: number | null = null;

function tick(time: number): void {
  for (const cb of callbacks) cb(time);
  rafId = callbacks.size > 0 ? requestAnimationFrame(tick) : null;
}

/** Registers a callback on the single shared rAF loop used by every effect on the page. */
export function scheduleFrame(cb: FrameCallback): void {
  callbacks.add(cb);
  if (rafId === null) {
    rafId = requestAnimationFrame(tick);
  }
}

export function unscheduleFrame(cb: FrameCallback): void {
  callbacks.delete(cb);
}
