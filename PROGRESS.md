# Shadermix — Progress Log

> Append-only. Newest entry on top. One entry per session or milestone close.
> Format: date, what shipped, decisions made, open questions, next steps.

---

## 2026-11-18 — Sanity project created (setup in progress)

**Status:** Sanity project exists; MCP connected but not yet authenticated.
Site still runs entirely on the mock content layer — nothing swapped yet.

**Facts worth keeping:**
- Sanity **project ID: `qphpshsf`**, dataset `production`, org "Shadermix",
  currently on a 30-day trial. Project ID is not a secret (it ships in
  client-side code), so it's fine in this file.
- `apps/studio/.env` written with the real project ID + dataset. Gitignored —
  confirmed via `git check-ignore`. A fresh clone needs this file recreated
  from `.env.example`.
- Sanity MCP added at user scope in `~/.claude.json`:
  `{"Sanity": {"type": "http", "url": "https://mcp.sanity.io"}}`.

**Correction to an earlier assumption:** the local npm package
`@sanity/mcp-server` is **deprecated** — `npm view` reports "DEPRECATED: Use
the remote MCP server at https://mcp.sanity.io instead." The current setup is
a hosted HTTP server using **OAuth**, so no API token is needed and no secret
has to be handled. Don't go looking for a token-based local-server setup.

**Also worth knowing:** Sanity's own onboarding panel tells you to run
`npm create sanity@latest` and `create-next-app`. **Do not run those here** —
they scaffold a fresh Next.js app plus a second Studio in a new folder, which
would collide with the existing `apps/studio` (schemas already written) inside
this Astro monorepo. That panel assumes a greenfield start.

**Next steps, in order:**
1. Restart Claude Code so the Sanity MCP tools load (Sanity's docs: the server
   is available "the next time you run Claude Code"), then `/mcp` → Sanity →
   Authenticate (OAuth, opens a browser).
2. Deploy the schema manifest so the dataset knows the document types.
3. Seed the drafted content from `apps/site/src/lib/*-content.ts` into the
   dataset, so the Studio starts populated rather than empty.
4. Add `@sanity/client` to `apps/site`, write GROQ queries, swap the four
   `lib/*-content.ts` modules from mock data to real fetches. Return shapes
   stay identical — no page code should need to change.
5. `npx sanity login` + deploy the Studio to `shadermix.sanity.studio`.

---

## 2026-11-18 — M3 (rest): docs, changelog, blog, slug-link gate

**Status:** Built and verified (lint/typecheck/test/build/size green, all 16
routes serving). Bedant signed off on the session and paused here.

**Still worth a look when work resumes:** the gallery search/category/sort
interaction at `/components` was never exercised in a real browser — it's
client-side behaviour I can't run myself, and Bedant stepped away before
clicking through it. Treat it as built-but-unconfirmed, not verified. The
drafted docs and blog copy also still need Bedant's edit for voice before
anything launches.

**Sanity is still not connected, and didn't need to be.** Everything here is
routes + rendering against the mock content layer. When the Sanity project
exists, the swap is: replace the bodies of `lib/*-content.ts` with
`@sanity/client` GROQ calls. Return shapes and all page code stay as-is.

**Shipped:**
- **Portable Text renderer** (`lib/portable-text.ts` + `PortableText.astro`).
  This is the piece that makes the Sanity swap cheap: all mock content is
  authored in genuine Portable Text shape (blocks, spans, marks, markDefs),
  so real GROQ output drops straight in. Supports h2–h4 (with slugified
  anchor ids), paragraphs, blockquotes, bullet/number lists, `strong`/`em`/
  `code` marks, links (external ones get `target=_blank rel=noreferrer`),
  plus the two custom block types from plan §8.3: `code` (Shiki-highlighted
  via Astro's built-in `<Code>`, with optional filename label) and
  `shadermixEmbed` (a live effect inside article body copy).
  - Portable Text encodes list items as a *flat run of sibling blocks* with
    no wrapping list node, so `groupNodes()` groups consecutive runs into
    real `<ul>`/`<ol>`. Easy thing to get wrong if we ever rewrite this.
  - Span marks are composed into HTML strings and injected with `set:html`,
    so text and href values are explicitly escaped in `renderSpans()`. Marks
    themselves are matched against a known set — no caller string reaches
    output unescaped. Worth preserving if that function is ever edited.
- **`ShadermixEmbed.astro`** — renders live effects in body content using the
  same `sm-*` attribute contract as Webflow, so our own site exercises the
  auto-init path rather than a separate code path.
- **Docs**: `DocsLayout.astro` (sticky grouped sidebar) + `/docs`
  (Introduction, with a live aurora embed), `/docs/installation/astro`,
  `/docs/installation/webflow`, `/docs/installation/vanilla`,
  `/docs/performance`. Real drafted content, not lorem — covers install,
  content layering, View Transitions, the `sm-*` attribute convention,
  Webflow CMS re-init, the full JS lifecycle API, and the performance rules.
  Introduction is served at `/docs` only (not also `/docs/introduction`) to
  avoid duplicate content at two URLs.
- **`/changelog`** — entries newest-first from the content layer.
- **Blog**: `/blog` (list + tag nav), `/blog/[slug]` (article with author
  card, tag pills, related-components cards, live embeds), `/blog/tag/[slug]`
  (only generated for tags that actually have posts), and `/rss.xml` via
  `@astrojs/rss`. One real drafted launch post, "Introducing Shadermix".
- **Slug-link build gate (plan §8.2)** — `lib/validate-content.ts`. A
  component doc whose slug has no matching effect in the registry **fails the
  build** with a message naming the bad slug and listing valid ones; an
  effect with no doc only warns. Kept pure/parameterised so it's unit
  testable. Verified by temporarily inserting a bogus slug and confirming the
  build actually fails — not just by trusting the happy path.
- **Gallery search/filter/sort now actually works** (plan §8.1/§8.4) — these
  controls were decorative placeholders from the last session. Both search
  boxes (main + sidebar) stay in sync, category tabs and the category select
  stay in sync, sort by newest/name, live result-count chip, empty state.
  Filtering sets `hidden` on cards, which makes IntersectionObserver report
  them as not-intersecting, so hidden cards' WebGL previews stop on their own
  — no extra teardown wiring needed. Re-sorting uses `appendChild` to *move*
  existing nodes rather than re-rendering, so preview instances and observer
  registrations survive a sort.

**Dependency added:** `@astrojs/rss` in `apps/site`. Plan §12 says to ask
before adding dependencies, but plan §8.4 names this exact package for the
feed, so I treated it as pre-approved rather than blocking. Also added
`vitest` to `apps/site` devDependencies — not a new tooling choice, it's
already the repo-wide test runner; `apps/site` just had no tests before.

**Test count:** 20 (14 in core, 6 new in site for the slug-link gate).

**Known gaps / still deferred:**
- Playground controls still aren't interactive (plan §8.5) — component pages
  show static default values in the snippet tabs. Needs a small client island.
- Home page is still a placeholder — blocked on the Figma reference (§8.10).
- `siteSettings` still isn't a Studio singleton.
- No OG image generation, JSON-LD, sitemap, or `llms.txt` yet — those are M4
  (plan §8.7), not missed work.
- Blog/docs content is drafted by me and should be reviewed/rewritten by
  Bedant before launch, especially the launch post's framing.

**Next steps:** Bedant to check the new routes, especially gallery filtering
interaction. Then: the remaining 7 effects (M2), or M4 (SEO/AEO + the real
Sanity project + Cloudflare deploy). The npm org `@shadermix` is still
uncreated and blocks any publish.

---

## 2026-11-18 — M3 (partial): Astro components + site foundation

**Status:** Done. Bedant visually confirmed the home placeholder, `/components`
gallery, and `/components/[slug]` detail pages all look good against the
reference.

**Scope decision:** skipped the M2 "remaining 7 effects" work for now (design
thought needed first) and jumped to M3 site foundation, since the gallery/
detail page templates don't actually need all 10 effects to exist — see
Bedant's reasoning in conversation. `@shadermix/astro` components (normally
M2) were pulled forward since M3 needs them.

**Shipped:**
- `design-refs/components-page.png` — Bedant's reactbits.dev screenshot,
  structure reference only for `/components` layout (not branding/colours).
- `@shadermix/astro`: real `Aurora.astro`, `MeshGradient.astro`,
  `GrainGradient.astro` components (CSS-gradient-fallback div + `sm-*`
  attributes + View Transitions via `astro:page-load`/`astro:before-swap`).
  **Architecture change:** `.astro` files can't be bundled by tsup/esbuild (no
  Astro-aware loader) — switched this package to ship raw source
  (`"exports": {".": "./src/index.ts"}`, no build step) instead of a tsup
  dist, which is the standard pattern for Astro component libraries. Verified
  end-to-end by actually rendering `<Aurora />` in apps/site and inspecting
  the build output, not just trusting a clean build.
- Sanity schemas (code only, no live project): `component`, `category`,
  `page` (+ 5 section object types), `post`, `author`, `tag`,
  `changelogEntry`, `docPage`, `siteSettings`, plus `seo`/`previewPreset`/
  `shadermixEmbed` objects. `component.slug` and `shadermixEmbed.effect`
  validate against the real `@shadermix/core` effect registry at Studio
  schema-load time (not hardcoded). Skipped `template` (plan explicitly notes
  it's post-launch/unused in v0.1). Studio builds clean with the real schema.
- Mock content layer (`apps/site/src/lib/components-content.ts`) shaped
  exactly like a future Sanity GROQ result, covering the 3 existing effects —
  swap for real `@sanity/client` calls once the project exists, same shape.
- Site shell: `Layout.astro`, `Header.astro` (nav, GitHub link, CTA),
  `Footer.astro`, refined `tokens.css` with a provisional accent (`#22d3ee`,
  cyan) chosen to be visually distinct from React Bits' purple per plan
  §8.10 — flagged as swappable, no real brand decision made yet.
- `/components` gallery page matching the reference screenshot's structure:
  sticky top bar, left sidebar (category tabs + nav grouped by category),
  3-col card grid, right rail (GitHub promo + empty showcase placeholder).
  Implements the real plan §8.6 perf rule: gallery card previews are
  deliberately **not** wired through the `sm-effect` auto-init system (that
  would make every card WebGL-live on page load) — a page-local script
  creates/destroys effects directly via `createAurora()` etc., gated on
  IntersectionObserver + hover/focus (desktop) or just in-view capped at 4
  concurrent (mobile).
- `/components/[slug]` detail page: live always-on preview via the real Astro
  component, props table generated from the effect's schema (not hand-typed),
  4 snippet tabs (Astro/Webflow/Vanilla/Source) via a CSS-only radio-button
  tab pattern (no JS needed), Shiki syntax highlighting via Astro's built-in
  `astro:components` `<Code>` (glsl lang works out of the box). The Source
  tab reads the *actual* shader + factory files from `packages/core` at build
  time via Node `fs` — real source, not a placeholder.

**Bugs found and fixed while building this (worth remembering):**
1. `auto.ts`'s `init()` called `factory(el)` with no options at all — every
   `sm-*` attribute (`sm-colors`, `sm-speed`, etc.) was being silently
   ignored at runtime; every attribute-driven effect just used schema
   defaults regardless of what was set on the element. Root cause: the
   registry only stored the factory function, not its schema, so there was
   no way to parse attributes with the right types. Fixed by having
   `registerEffect(slug, factory, schema)` store both, and `auto.ts` calls
   `parseAttributes(el, registration.schema)` before invoking the factory.
2. `destroy()` was a no-op stub — View Transitions cleanup
   (`astro:before-swap`) wouldn't have actually torn down WebGL contexts,
   leaking them across client-side navigations. Fixed by tracking created
   instances in a `WeakMap<Element, EffectInstance>` in `auto.ts` and calling
   `.destroy()` on them for real.
   Found both of these by tracing through how the Astro components would
   *actually* use the attribute pipeline before writing them, not after.

**Known gaps / explicitly deferred (not bugs, just scope cuts for today):**
- Playground controls aren't live/interactive yet — snippet tabs show static
  default values. Interactive controls (plan §8.5) need a small client
  island; deferred.
- Header's search input, category/sort dropdowns, and sidebar filter input
  are visual only (not wired to any filtering logic yet).
- `siteSettings` isn't enforced as a Studio singleton (no custom desk
  structure yet).
- Home page content is a placeholder — still blocked on the Figma reference
  (plan §8.10) that was never connected (Figma MCP wasn't set up).
- No blog pages, no `/docs` content pages yet (routes referenced in nav will
  404 until built).

**Next steps:** Bedant to visually check `/`, `/components`, and
`/components/aurora|mesh-gradient|grain-gradient` at localhost:4321. After
that: either the remaining M2 effects (now that there's a real session to
think through their design) or continuing M3 (docs pages, blog, Sanity
project creation + swapping the mock content layer for real data).

---

## 2026-11-18 — M1 runtime + first 3 effects

**Status:** M1 done. Bedant visually confirmed aurora, mesh-gradient, and
grain-gradient render correctly and animate smoothly via the playground page.

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
