# Shadermix — Progress Log

> Append-only. Newest entry on top. One entry per session or milestone close.
> Format: date, what shipped, decisions made, open questions, next steps.

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
