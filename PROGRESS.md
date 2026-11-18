# Shadermix — Progress Log

> Append-only. Newest entry on top. One entry per session or milestone close.
> Format: date, what shipped, decisions made, open questions, next steps.

---

## 2026-11-18 — M1 runtime + first 3 effects

**Status:** M1 build complete, pending Bedant's visual check (I can't render WebGL
output myself — see "Needs visual confirmation" below).

**Shipped:**
- `packages/core/src/runtime/`: `gl.ts` (WebGL2→1 context, the exact attributes
  from plan §5.2), `program.ts` (shader compile/link + shared fullscreen-quad
  vertex shader `fullscreen.vert.glsl`), `scheduler.ts` (single shared rAF loop
  for every effect on a page), `color.ts` (hex/rgb()/hsl() → sRGB-to-linear
  vec3, per plan §5.2), `schema.ts` (the option-schema system from §5.1 —
  types, `defaultsFromSchema`, `parseAttributes` for `sm-*` attributes,
  `normalizeOptions` for the JS API).
- `create-shader-effect.ts`: the generic engine every effect wraps — canvas-or-
  container resolution, ResizeObserver + DPR cap at 2, IntersectionObserver
  pause, `visibilitychange` pause, `prefers-reduced-motion` → single static
  frame (overridable via `respectReducedMotion: false`), `webglcontextlost`/
  `restored` handling with CSS-gradient fallback, mouse uniform, >8-context
  dev warning, full `update/play/pause/destroy` lifecycle.
- Three effects, each with an original fragment shader (header-commented per
  plan §12), `meta.ts` schema, and a `createX()` factory that self-registers
  via `registerEffect()`: **aurora** (3-colour flowing bands), **mesh-gradient**
  (4-point inverse-distance colour mesh with domain-warp distortion + grain),
  **grain-gradient** (angled 3-colour gradient + film grain).
- Per-effect npm entry points (`@shadermix/core/aurora` etc.) plus
  `@shadermix/core/effects` (all three, used by the Webflow bundle) — new tsup
  entries, package.json `exports`, `.glsl` → raw-text loader for both tsup
  (esbuild loader) and Vitest (custom plugin).
- Vitest unit tests for `color.ts` (hex/rgb/hsl parsing, sRGB→linear) and
  `schema.ts` (defaults, attribute parsing, enum fallback, options merging) —
  14 tests, all passing. Needed `happy-dom` as a test-only dependency for DOM
  APIs (`document.createElement`) in the schema tests.
- `apps/playground-webflow/index.html` now has a section per effect with real
  `sm-*` attributes.

**Bugs found and fixed while building this (worth remembering):**
1. `process.env.NODE_ENV` in `program.ts`'s error-logging branch — doesn't
   exist in a browser with no bundler define; would have thrown at runtime on
   any shader compile failure. Removed the guard, just always `console.warn`.
2. Aurora's fragment shader has variable alpha (glow-based), but the GL
   context uses `premultipliedAlpha: true` (plan §5.2) — had to premultiply
   `color * alpha` before output or edges would composite wrong. The two
   opaque effects (mesh-gradient, grain-gradient) always output alpha 1, so
   they're unaffected, but this is worth checking on every future effect with
   non-opaque output.
3. **The big one:** `@shadermix/core`'s fine-grained `sideEffects` array
   (listing `./dist/aurora.js`, `./dist/effects.js`, etc.) looked right but
   was silently broken — tsup's code-splitting moves the actual
   `registerEffect()` calls into shared chunk files with non-deterministic
   hashed names (`chunk-XXXX.js`), which can never be listed in package.json
   ahead of time. Downstream, `@shadermix/webflow`'s `import
   "@shadermix/core/effects"` (a bare side-effect import) got tree-shaken
   down to nothing — the built CDN bundle shipped with zero shader code, only
   the empty registry. Caught by actually `cat`-ing the built bundle rather
   than trusting the size number. Fixed by setting `"sideEffects": true`
   (whole-package, no array) — correctness over marginal tree-shaking gains.
   Re-verified: the Webflow bundle now contains all three effects at 4.34 KB
   brotli (budget 25 KB); re-ran lint/typecheck/test/build/size clean after.
4. Per-effect size-limit budgets: plan says "each effect ≤2KB gzip", but
   `size-limit` measures each `@shadermix/core/<slug>` subpath import in
   total isolation, which necessarily bundles the full shared runtime
   (~2.9 KB) with whichever effect is measured — there's no way to express
   "runtime amortized across effects" in a single-entry budget. Measured
   real sizes are ~3.1–3.4 KB brotli per effect; bumped the per-effect budget
   to 4 KB to match reality with headroom, documented here rather than
   silently padding the number.

**Needs visual confirmation (I can't render WebGL myself):** a static file
server is running on port 4322 serving the repo root — open
`http://localhost:4322/apps/playground-webflow/index.html` to see all three
effects live. Please check they look reasonable, animate smoothly, and that
resizing the window / switching tabs doesn't break anything.

**Next steps:** once confirmed, M2 — remaining 7 effects (`silk`, `plasma`,
`dot-grid`, `noise-waves`, `liquid-chrome`, `split-reveal`, `gradient-text`),
`@shadermix/astro` components with View Transitions handling, finish out
`@shadermix/webflow`, alpha-publish `0.1.0-alpha.x` to npm (blocked on the
`@shadermix` npm org existing — still an open M0 "Me" task).

---

## 2026-11-18 — M0 scaffold

**Status:** M0 done. Monorepo builds, tests, lints, and the site runs locally.

**Shipped:**
- pnpm workspace (`apps/*`, `packages/*`) with TS strict, tsup, ESLint 9 (flat
  config) + Prettier, Vitest, Changesets, size-limit — per plan §4.
- `packages/core` (`@shadermix/core`): effect registry (`effects/registry.ts`),
  attribute auto-init (`auto.ts`) with `window.Shadermix.init/destroy`, one
  Vitest unit test. No runtime/effects yet — that's M1.
- `packages/astro` (`@shadermix/astro`) and `packages/webflow`
  (`@shadermix/webflow`) scaffolded and building; webflow package re-exports
  `@shadermix/core/auto` as an IIFE (`dist/shadermix.min.js`).
- `apps/site`: Astro 6 static hello-world + dark-first design tokens stub
  (plan §8.10). Verified with `pnpm dev` — serves 200 with the right title.
- `apps/studio`: Sanity Studio shell (`sanity.config.ts`, empty schema array)
  reading `SANITY_STUDIO_PROJECT_ID`/`DATASET` from env, placeholder fallback
  since no real Sanity project exists yet. Builds successfully offline.
- `apps/playground-webflow`: static HTML mimicking a Webflow export, loads the
  built CDN bundle via relative path.
- `.github/workflows/ci.yml`: install → lint → typecheck → test → build → size.
- LICENSE (MIT), CONTRIBUTING.md, CREDITS.md, README.md, `.gitignore`.
- pnpm installed locally via a user-owned npm prefix (no sudo); added to
  `~/.zshrc` PATH.

**Decisions made:**
- pnpm 12.21.0, Node >=20, TypeScript strict (`noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` on).
- `@shadermix/core`'s `package.json` marks only `dist/auto.js` as having side
  effects (not the whole package) — a blanket `sideEffects: false` let esbuild
  tree-shake away `auto.ts`'s DOM listener entirely when bundled into the
  Webflow IIFE, which silently shipped an empty bundle. Worth remembering when
  adding more side-effecting entry points later.
- tsup's default iife output suffix is `.global.js`; overrode `outExtension`
  in `packages/webflow/tsup.config.ts` to get the exact `shadermix.min.js`
  filename the plan's CDN docs (§7.1) depend on.
- Package-level `vitest run --passWithNoTests`, since astro/webflow packages
  have no tests yet (effects land in M1) and a bare `vitest run` exits 1 on
  zero test files.

**Open questions (plan §13):** still unresolved — Cloudflare Workers vs Pages,
Tailwind vs plain CSS, playground island choice, `@shadermix` npm scope
availability, GitHub org vs personal, exact launch date. None blocked M0;
revisit before M2 (npm scope — needed to publish) and M3/M4 (styling, hosting).

**Next steps:** M1 — build the real WebGL runtime (`packages/core/src/runtime/`)
and the first three effects (`aurora`, `mesh-gradient`, `grain-gradient`) per
plan §5.2–§5.3 and §10 M1. Bedant: still need to do the M0 manual steps
(domain, npm org, GitHub repo, Sanity project, Cloudflare account) whenever
ready — nothing in M1 is blocked on them.

---

## 2026-11-18 — Kickoff

**Status:** Pre-M0. Nothing built yet.

**Shipped:**
- `SHADERMIX_PLAN.md` written (master spec, milestones, scope for v0.1).
- Repo initialized locally (`git init`); `CLAUDE.md` + this log added.

**Decisions made:** none yet.

**Open questions (plan §13, unresolved):**
1. Cloudflare Workers vs Pages for the site (plan defaults to Workers).
2. Site styling: plain CSS tokens vs Tailwind v4 — deferred until design reference arrives.
3. Playground island: vanilla TS vs Preact (plan defaults to vanilla TS).
4. Is the npm scope `@shadermix` available? Fallback: unscoped `shadermix-core` etc.
5. GitHub org `shadermix` or personal account repo (plan defaults to org).
6. Launch date: Sun 22 Nov (6-effect cut) vs Sun 29 Nov (full v0.1 scope).

**Next steps:** M0 — Bedant to buy/confirm domain, create npm org, GitHub repo, Sanity
project, Cloudflare account. Claude Code to scaffold the pnpm monorepo per plan §4 once
those decisions land (or with defaults, if Bedant says to proceed without waiting).
