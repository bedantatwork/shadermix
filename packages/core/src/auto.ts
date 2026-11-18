import { effectRegistry } from "./effects/registry.js";

export function init(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[sm-effect]").forEach((el) => {
    if (el.hasAttribute("sm-ready")) return;
    const slug = el.getAttribute("sm-effect");
    const factory = slug ? effectRegistry.get(slug) : undefined;
    if (!factory) return;
    factory(el);
    el.setAttribute("sm-ready", "");
  });
}

export function destroy(_root: ParentNode = document): void {}

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
