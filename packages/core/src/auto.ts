import { effectRegistry } from "./effects/registry.js";
import type { EffectInstance } from "./effects/registry.js";
import { parseAttributes } from "./runtime/schema.js";

const instances = new WeakMap<Element, EffectInstance>();

export function init(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[sm-effect]").forEach((el) => {
    if (el.hasAttribute("sm-ready")) return;
    const slug = el.getAttribute("sm-effect");
    const registration = slug ? effectRegistry.get(slug) : undefined;
    if (!registration) return;
    const options = parseAttributes(el, registration.schema);
    instances.set(el, registration.factory(el, options));
    el.setAttribute("sm-ready", "");
  });
}

export function destroy(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[sm-effect][sm-ready]").forEach((el) => {
    instances.get(el)?.destroy();
    instances.delete(el);
    el.removeAttribute("sm-ready");
  });
}

declare global {
  interface Window {
    Shadermix?: { init: typeof init; destroy: typeof destroy };
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => init());
}

if (typeof window !== "undefined") {
  window.Shadermix = { init, destroy };
}
