# Shadermix — Project Plan & Build Spec

> **Audience:** this file is the master brief for Claude Code (and for me, Bedant).
> Claude Code should read it fully before writing any code, then work **milestone by milestone**, stopping at the end of each milestone for review.
> Where this document says **[DECISION NEEDED]**, ask before proceeding. Where it says **[DESIGN REF]**, wait for or use the design reference I provide.

---

## 1. The idea in one paragraph

**Shadermix** is an open-source library of animated **shader backgrounds, visual effects and text animations** for **Astro** and **Webflow** websites — in the spirit of [React Bits](https://reactbits.dev), but **framework-free at its core**. Every effect is written once in plain TypeScript + WebGL with **zero runtime dependencies**, then shipped three ways:

1. **Astro** — native `.astro` components (`<Aurora />`), no React/Vue runtime, Astro-island friendly, View Transitions safe.
2. **Webflow** — one `<script>` tag from a CDN + custom attributes on any div (`sm-effect="aurora"`). No code editing beyond that.
3. **Vanilla JS** — `createAurora(canvas, options)` for any other site.

**shadermix.com** is the showcase + docs site: live previews, a props playground, copy-paste snippets for Astro / Webflow / vanilla, and install instructions. It is built with **Astro**, content managed in **Sanity**, hosted on **Cloudflare**.

**Business model (later):** open-source free core (MIT) first → build audience → later a paid "Pro" tier with page blocks (heroes, CTAs, pricing sections) and full landing-page templates for Astro and Webflow.

---

## 2. Positioning (why this exists)

- React Bits / Magic UI / shadcn blocks are **React-only**. Astro devs can use them via React islands, but that ships the React runtime for a background effect — against Astro's "zero JS by default" philosophy.
- There's no serious, **design-led** Astro-native effects library. Existing Astro animation libs are small and basic (buttons, fades) — no shaders, no blocks, no templates.
- **Webflow** users currently rely on scattered one-off "cloneables" for WebGL effects, with inconsistent quality and no docs.
- **Shadermix's wedge:** *one effect library that works natively in both Astro and Webflow* — the two most popular ways agencies ship marketing sites outside React. Webflow Cloud itself runs on Astro, so the two audiences overlap.

**Tagline ideas:** "Shaders and motion for Astro & Webflow." / "Beautiful backgrounds. Zero framework."

### Principles (non-negotiable for every component)
1. **Zero runtime deps** in core (no three.js, no ogl, no GSAP). A tiny in-house WebGL runtime only.
2. **Performance first:** pause when offscreen, pause when tab hidden, cap device pixel ratio, single fullscreen-quad draw per effect.
3. **Accessible:** respect `prefers-reduced-motion` (render a static frame), canvases are `aria-hidden="true"`, never block content.
4. **Graceful fallback:** if WebGL is unavailable or the context is lost, show a CSS gradient fallback built from the same colors.
5. **Configurable via simple props/attributes** — colors, speed, scale, intensity, etc.
6. **Original code.** Do **not** copy shaders from ShaderToy (default license is CC BY-NC-SA — non-commercial, incompatible with MIT). Do not copy React Bits source. If anything is adapted from an MIT/Apache source, credit it in `CREDITS.md` and in the file header.

---

## 3. Scope for v0.1 (launch by next weekend)

Target: **10 effects** that look great, not 50 that look okay.

### 3.1 Backgrounds (WebGL shaders) — 8
| Slug | Name | Description | Key options |
|---|---|---|---|
| `aurora` | Aurora | Soft flowing northern-lights bands | `colors[3]`, `speed`, `amplitude`, `blend` |
| `mesh-gradient` | Mesh Gradient | Slowly morphing multi-point colour mesh (Stripe-like) | `colors[4]`, `speed`, `distortion`, `grain` |
| `grain-gradient` | Grain Gradient | Animated gradient with film grain | `colors[3]`, `speed`, `grainAmount`, `angle` |
| `silk` | Silk | Rippling fabric/silk sheen | `color`, `speed`, `scale`, `noise`, `rotation` |
| `plasma` | Plasma | Classic plasma, modern palette | `colors[3]`, `speed`, `scale`, `mouseReactive` |
| `dot-grid` | Dot Grid | Dot matrix with wave/mouse-reactive glow | `dotColor`, `glowColor`, `gap`, `dotSize`, `mouseRadius` |
| `noise-waves` | Noise Waves | Layered topographic/line waves | `lineColor`, `bgColor`, `lines`, `speed`, `thickness` |
| `liquid-chrome` | Liquid Chrome | Metallic liquid surface | `baseColor`, `speed`, `amplitude`, `mouseReactive` |

### 3.2 Text effects (DOM/CSS + small JS, no WebGL) — 2
| Slug | Name | Description | Key options |
|---|---|---|---|
| `split-reveal` | Split Reveal | Words/letters rise + fade in on scroll into view | `split` (`chars`/`words`), `stagger`, `duration`, `once` |
| `gradient-text` | Gradient Text | Animated moving gradient across text | `colors[]`, `speed`, `direction` |

> Text effects are included so the library isn't "only backgrounds" at launch, and they're quick to build.

### 3.3 Explicitly NOT in v0.1 (roadmap — see §11)
CLI installer, shadcn-registry installs, page blocks, templates, Webflow "copy to Designer" button, Pro tier, user accounts, search with filters beyond category.

---

## 4. Repository structure (monorepo)

Tooling: **pnpm workspaces**, **TypeScript (strict)**, **tsup** (library builds), **Changesets** (versioning + changelog), **Vitest** (unit tests for option parsing/runtime utils), **ESLint + Prettier**, **GitHub Actions** (CI + npm publish + site deploy).

```
shadermix/
├─ apps/
│  ├─ site/                    # shadermix.com — Astro + Sanity, deployed to Cloudflare
│  ├─ studio/                  # Sanity Studio (deployed to shadermix.sanity.studio)
│  └─ playground-webflow/      # plain HTML page that mimics a Webflow export, for testing the CDN bundle
├─ packages/
│  ├─ core/                    # @shadermix/core — vanilla TS runtime + all effects
│  │  ├─ src/
│  │  │  ├─ runtime/           # WebGL mini-runtime, lifecycle, observers, option parsing
│  │  │  ├─ effects/
│  │  │  │  ├─ aurora/
│  │  │  │  │  ├─ aurora.frag.glsl
│  │  │  │  │  ├─ index.ts     # createAurora(), defaults, option schema
│  │  │  │  │  └─ meta.ts      # name, category, option schema for docs/playground
│  │  │  │  └─ ...
│  │  │  ├─ text/              # split-reveal, gradient-text
│  │  │  ├─ auto.ts            # attribute-based auto-init (used by Webflow + Astro)
│  │  │  └─ index.ts
│  │  └─ tsup.config.ts
│  ├─ astro/                   # @shadermix/astro — .astro wrapper components
│  │  └─ src/components/Aurora.astro ...
│  └─ webflow/                 # @shadermix/webflow — IIFE CDN bundle (re-exports core/auto)
├─ .changeset/
├─ .github/workflows/
├─ CREDITS.md
├─ LICENSE                     # MIT
├─ CONTRIBUTING.md
└─ README.md
```

**npm scope:** `@shadermix` (I need to create the npm org first — see §10 M0).

---

## 5. Core library design (`@shadermix/core`)

### 5.1 Public API
```ts
import { createAurora } from '@shadermix/core/aurora';   // per-effect entry for tree-shaking

const effect = createAurora(canvasOrContainer, {
  colors: ['#5227FF', '#7CFF67', '#00D1FF'],
  speed: 0.6,
  amplitude: 1.0,
});

effect.update({ speed: 1.2 });   // live option updates (used by site playground)
effect.pause(); effect.play();
effect.destroy();                // removes listeners, frees GL resources, removes canvas if we created it
```
- Accept either a `<canvas>` or a container element (we create a canvas absolutely positioned to fill it).
- Every effect exports `defaults` and a `schema` (option name, type, min/max/step, default, description). **The schema drives**: attribute parsing, Astro prop types, and the site playground controls. Single source of truth.

```ts
// meta.ts example
export const schema = {
  colors:    { type: 'colors', count: 3, default: ['#5227FF','#7CFF67','#00D1FF'], description: 'Band colours' },
  speed:     { type: 'number', min: 0, max: 3, step: 0.05, default: 0.6, description: 'Animation speed' },
  amplitude: { type: 'number', min: 0, max: 2, step: 0.05, default: 1, description: 'Wave height' },
} as const;
```

### 5.2 Runtime responsibilities (`runtime/`)
- Create WebGL (prefer WebGL2, fall back to WebGL1) with `{ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' }`.
- Compile shader program, fullscreen triangle, standard uniforms: `uTime`, `uResolution`, `uMouse`, plus effect uniforms.
- `ResizeObserver` → resize canvas; DPR capped at `Math.min(devicePixelRatio, 2)` (option `dpr`).
- `IntersectionObserver` → only animate when visible.
- `document.visibilitychange` → pause when tab hidden.
- `prefers-reduced-motion: reduce` → render one static frame, no loop (overridable with `respectReducedMotion: false`).
- `webglcontextlost` / `restored` handling; fallback to CSS gradient if no WebGL.
- Shared rAF scheduler — one `requestAnimationFrame` loop for all effects on a page.
- Global guard: warn (dev) if more than ~8 live contexts on a page.
- Colour parsing: hex, rgb(), hsl() → linear vec3.

### 5.3 Attribute auto-init (`auto.ts`) — shared by Webflow and Astro
Convention (Finsweet-style, short for Webflow users):
```html
<div sm-effect="aurora"
     sm-colors="#5227FF, #7CFF67, #00D1FF"
     sm-speed="0.6"
     sm-amplitude="1"></div>
```
- On `DOMContentLoaded`, find all `[sm-effect]`, parse `sm-*` attributes against that effect's schema (comma lists → arrays, numbers, `true/false`), init.
- Text effects: `sm-text="split-reveal" sm-split="words" sm-stagger="0.04"`.
- Expose `window.Shadermix = { init(root?), destroy(root?), effects }` for manual control (e.g. after Webflow CMS pagination / Finsweet load-more).
- Mark initialised elements with `sm-ready` to avoid double init.
- Background effects: if the host element is not positioned, set `position: relative`; the canvas goes `position:absolute; inset:0; z-index:0; pointer-events:none`, and **direct children get no changes** — docs tell users to put content above with `position:relative; z-index:1` (or use the provided `sm-content` helper class).

### 5.4 Bundles produced
| Output | Format | Use |
|---|---|---|
| `@shadermix/core` | ESM, per-effect entry points, `.d.ts` | Astro, vanilla, bundlers |
| `@shadermix/webflow/dist/shadermix.min.js` | IIFE, all effects, auto-init | Webflow via jsDelivr CDN |
| `@shadermix/core/dist/standalone/<slug>.js` | Single-file ESM per effect, runtime inlined | "Copy source" on the site (React-Bits-style ownership) |

**Size budget:** runtime ≤ 4 KB gzip; each effect ≤ 2 KB gzip; full Webflow bundle ≤ 25 KB gzip. CI fails if exceeded (use `size-limit`).

---

## 6. Astro package (`@shadermix/astro`)

### 6.1 Install
```bash
npm i @shadermix/astro
```

### 6.2 Usage
```astro
---
import { Aurora, SplitReveal } from '@shadermix/astro';
---
<section class="hero">
  <Aurora colors={['#5227FF', '#7CFF67', '#00D1FF']} speed={0.6} />
  <div class="sm-content">
    <SplitReveal as="h1" split="words">Ship beautiful sites</SplitReveal>
  </div>
</section>
```

### 6.3 Implementation rules
- Each component renders a `<div sm-effect="…" sm-…>` (same attribute contract as Webflow), with a `<noscript>`/CSS fallback gradient inline.
- A single processed `<script>` (Astro dedupes/bundles it) imports **only the effects used** and calls init.
- **View Transitions:** init on `astro:page-load`, destroy on `astro:before-swap`. Must work with and without `<ClientRouter />`.
- Props are typed from each effect's `schema` (generate `Props` types at build or hand-write from schema — prefer generated).
- Support `class`, `style`, and `id` passthrough.
- Works in Astro 5 and 6. No integration (`astro add`) required for v0.1.

### 6.4 Copy-paste option (no npm)
On each component page the site offers **"Copy source"**: one `.astro` file + the standalone effect JS. User drops them into `src/components/shadermix/`. This mirrors React Bits' "own the code" model. A CLI (`npx shadermix add aurora`) comes post-launch.

---

## 7. Webflow package (`@shadermix/webflow`)

### 7.1 Install (once per site)
Site Settings → Custom Code → **Footer code**:
```html
<script src="https://cdn.jsdelivr.net/npm/@shadermix/webflow@0/dist/shadermix.min.js" defer></script>
```
(Pin the major version `@0` → users get fixes automatically; docs also show exact-version pinning.)

### 7.2 Use an effect
1. Select a Section/Div Block → set a min height.
2. Element Settings → Custom Attributes → add `sm-effect` = `aurora`.
3. Optional attributes: `sm-colors` = `#5227FF, #7CFF67, #00D1FF`, `sm-speed` = `0.6`.
4. Put content inside a child div with class `sm-content` (or position relative + z-index 1).
5. Publish or open Preview — custom code doesn't run on the Designer canvas, which is normal for Webflow.

### 7.3 Webflow-specific requirements
- Must not conflict with Webflow IX2 / GSAP interactions (we don't touch transforms on host elements).
- Re-init safe: `Shadermix.init()` callable after CMS load-more / tabs / sliders.
- Each component page on shadermix.com has a **"Webflow" tab** with: the script tag, the attribute table (copyable rows), and a screenshot/GIF of the attribute panel.
- Test against a real Webflow site (I'll provide a staging site) + `apps/playground-webflow`.

---

## 8. shadermix.com — the website

### 8.1 Stack
| Concern | Choice |
|---|---|
| Framework | **Astro** (latest stable, v6), static output (SSG) |
| CMS | **Sanity** (content: component docs, categories, pages, changelog, site settings) |
| Hosting | **Cloudflare Workers (static assets)** — or Cloudflare Pages if setup is simpler; pick one and note it [DECISION NEEDED — default Workers] |
| Styling | Plain CSS with design tokens (CSS custom properties) or Tailwind v4 — **follow the design reference** [DESIGN REF] |
| Code highlighting | Shiki (built into Astro) |
| Search (v0.1) | Client-side filter on the components index (no external service) |
| Analytics | Cloudflare Web Analytics (free, no cookie banner needed) |
| OG images | Generated at build (satori / `astro-og-canvas`) per component |

### 8.2 Content split — what lives where
- **Code lives in the repo** (effects, schemas, standalone builds). The site imports it directly from the workspace packages — the live previews use the real library.
- **Sanity holds the words and editorial content**: descriptions, usage notes, tips, category, tags, ordering, "new" badges, featured flags, SEO fields, landing page sections, changelog posts.
- Components are **linked by `slug`**: Sanity doc `slug = aurora` ↔ `packages/core/src/effects/aurora`. The build **fails** if a Sanity component has no matching effect (or vice versa, warn).
- Props tables and playground controls are generated from the effect's `schema` — not typed into Sanity (single source of truth).

### 8.3 Sanity schemas
```
component
  title (string), slug (slug), category (ref → category), type ('background' | 'text' | 'animation')
  shortDescription (string, ≤140 chars), body (portable text: usage notes, tips)
  tags (string[]), status ('new' | 'beta' | 'stable'), featured (bool), order (number)
  previewPresets (array of { name, values (JSON string) })   // e.g. "Midnight", "Sunset"
  posterImage (image)            // static fallback for gallery + OG
  seo { title, description }

category      title, slug, description, order
page          title, slug, sections[] (hero, featureGrid, componentShowcase, cta, faq) — for home & landing pages
changelogEntry  version, date, title, body (portable text)
docPage       title, slug, order, body (portable text with code blocks) — installation guides etc.
siteSettings  navigation, footer links, social links (GitHub, X, LinkedIn), announcement bar

# Blog
post          title, slug, excerpt, coverImage, author (ref), tags (ref[]), publishedAt, updatedAt,
              body (portable text incl. code blocks, images, callouts, AND a custom `shadermixEmbed` block),
              relatedComponents (ref → component[]), seo { title, description, ogImage }
author        name, slug, avatar, bio, links (X, LinkedIn, GitHub)
tag           title, slug, description

# Custom portable-text block used in posts & docs
shadermixEmbed  effect (string slug, validated against the effects registry), options (JSON string),
                height (number), caption — renders a LIVE effect inside the article

# Templates & Pro (post-launch, schema can be added now but unused in v0.1)
template      title, slug, platform ('astro' | 'webflow'), tier ('free' | 'pro'), screenshots (image[]),
              demoUrl, features (string[]), version, changelog (portable text),
              delivery { r2Key (Astro zip) | webflowCloneUrl | marketplaceUrl }, price, componentsUsed (ref[])
```
- Studio deployed with `sanity deploy` to `shadermix.sanity.studio` (separate app, `apps/studio`).
- Site fetches via `@sanity/client` (GROQ) at build time. Use a read token only if dataset is private (default: public dataset, no token on the client).

### 8.4 Pages
| Route | Content |
|---|---|
| `/` | Hero with a live Shadermix background, value props (Astro + Webflow + zero deps), featured components grid, install snippets (tabs), GitHub CTA, FAQ |
| `/components` | Gallery grid by category with live previews + filter by category/search |
| `/components/[slug]` | Large live preview, **playground panel** (controls generated from schema; presets from Sanity), tabs: **Astro / Webflow / Vanilla / Source**, props table, usage notes, related components |
| `/docs` | Introduction |
| `/docs/installation/astro` | Install & usage in Astro (npm + copy-paste), View Transitions notes |
| `/docs/installation/webflow` | Script tag, attributes, layering content, CMS re-init |
| `/docs/installation/vanilla` | ESM / CDN usage |
| `/docs/performance` | How effects pause, DPR, how many to use per page |
| `/changelog` | From Sanity |
| `/blog` | Post list (newest first), tag filter |
| `/blog/[slug]` | Article with live `shadermixEmbed` blocks, author card, related components, related posts |
| `/blog/tag/[slug]` | Posts by tag |
| `/rss.xml` | RSS feed via `@astrojs/rss` |
| `/llms.txt`, `/sitemap.xml`, `/robots.txt` | AEO/SEO |

### 8.5 Playground behaviour (component page)
- Controls generated from `schema`: number → slider + input; colour → colour picker; colors → N pickers; boolean → toggle; enum → select.
- Changes call `effect.update()` live.
- The snippets in the Astro/Webflow/Vanilla tabs **update live** to reflect current values (e.g. Webflow tab shows exact attributes to paste).
- "Reset" and "Copy" buttons; presets from Sanity.
- Playground is the **only** client-heavy island on the site — keep it small (vanilla TS or Preact; no React).

### 8.6 Gallery performance (important)
Browsers cap live WebGL contexts (~16). The gallery must:
- Show the `posterImage` (or a CSS-gradient fallback) by default.
- Start the live effect only when a card is **in view AND hovered/focused** (desktop) or in view (mobile, max 4 at once).
- Destroy effects that leave the viewport.

### 8.7 SEO / AEO
- Unique title/description per page; JSON-LD (`SoftwareSourceCode` per component, `SoftwareApplication` for the library, `FAQPage` on home).
- `llms.txt` listing every component with one-line descriptions + install snippets (helps AI assistants recommend & use Shadermix).
- Semantic HTML, fast LCP (hero effect must not delay text paint), Lighthouse ≥ 95 on Performance/SEO/Accessibility for `/` and one component page.

### 8.8 Deploy pipeline
- GitHub repo → **GitHub Actions**:
  - `ci.yml`: lint, typecheck, test, build all packages, size-limit, build site.
  - `release.yml`: Changesets → version PR → on merge publish `@shadermix/*` to npm.
  - `deploy-site.yml`: on push to `main` **and** on `repository_dispatch` (type `sanity-content-update`) → build site → `wrangler deploy`.
- **Sanity webhook** (on publish of any document) → GitHub `repository_dispatch` endpoint → rebuild. (Requires a fine-grained GitHub token stored in the Sanity webhook headers.)
- Preview deployments for PRs (Cloudflare preview URLs) — nice to have.
- Secrets: `NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SANITY_PROJECT_ID`, `SANITY_DATASET`.
- Domain `shadermix.com` on Cloudflare DNS, apex + `www` redirect.

### 8.9 Content & release management — where everything lives

**Rule: code lives in Git, words live in Sanity, downloadable template files live in Cloudflare R2.** Never store component/shader code in Sanity (no version history per release, no review, no tests, no builds).

| Thing | Source of truth | How it's updated | How users receive updates |
|---|---|---|---|
| Effects / shaders / Astro components | `shadermix/shadermix` GitHub repo (public, MIT) | PR → CI → merge → Changeset version PR → npm publish | npm: `npm update`. Webflow: automatic via jsDelivr `@0` major pin. Copy-paste: re-copy from site (later `npx shadermix update`) |
| Component docs text, presets, tags, badges | Sanity `component` | Edit + publish in Studio | Webhook → site rebuild (minutes) |
| Props tables & playground controls | Effect `schema` in code | Same as code | Generated at site build |
| Blog, docs pages, changelog posts, landing sections | Sanity | Edit + publish in Studio | Webhook → site rebuild |
| Astro templates (Pro, later) | Private repo `shadermix/shadermix-pro`, one folder per template, tagged releases | PR → release tag | CI builds `<template>-<version>.zip` → uploads to **Cloudflare R2** → buyer gets a short-lived signed download URL after licence check (Cloudflare Worker). Optional later: GitHub repo access for buyers |
| Webflow templates | Webflow projects | Edited in Webflow | Free: Made-in-Webflow cloneable link. Paid: Webflow Template Marketplace or post-purchase clone link |
| Pro blocks (later) | Private repo | Same as templates | Licence-key–protected registry endpoint (Worker) for `npx shadermix add --pro <block>` |
| Template listings (title, screenshots, demo, price, version, changelog) | Sanity `template` | Studio | Site rebuild; points to R2 key / clone URL |

Release hygiene:
- Semantic versioning; every package change needs a changeset; `CHANGELOG.md` per package is generated. Notable releases also get a Sanity `changelogEntry` (human-friendly).
- Breaking changes only in major versions (Webflow users pinned to `@0` must never break).
- Template zips are **never hand-made** — always produced by CI from a tagged release so every download is reproducible.

### 8.10 Design

**References (in repo under `/design-refs/`):**
- `components-page.png` — screenshot of reactbits.dev components index → layout reference for `/components` and docs pages. **Structure reference only — do not copy branding, colours, copy or icons.**
- **Home page** → Figma file "Pulse AI – SaaS Website" (link provided by Bedant). Read it via the **Figma MCP server** (`get_design_context`, `get_variable_defs`, `get_screenshot` on each section frame). If Figma MCP isn't available, Bedant will export each section as PNG into `/design-refs/home/` plus a list of fonts/colours.

**`/components` + docs layout (from the screenshot):**
- **Top bar** (sticky, hairline bottom border): logo + wordmark, `/` divider, nav pills (Docs active state = bordered pill; "Tools" with small "New" badge; Pro; Sponsors later). Right side: search field with `/` keyboard-shortcut hint (opens command palette), settings icon button, theme toggle, GitHub button showing live star count, primary CTA button (accent colour).
- **Three columns:** left sidebar (~300px, rounded panel, scrolls independently) · main content · right rail (~380px).
- **Left sidebar:** "Viewing all components" state chip; row of category icon tabs (All, Text, Components, Animations, Backgrounds…) with active tab filled; "Filter N components…" input; grouped nav (Get Started: Introduction, Installation, Changelog, Favorites; then one group per category). Items can carry small grey pill badges ("New", "Updated").
- **Main:** large H1 "Components", right-aligned search + category dropdown + sort dropdown (Newest). **3-column card grid** (2 on tablet, 1 on mobile). Card = rounded (~16px) bordered container with inset preview (rounded ~12px, ~16:10), "NEW" badge top-left on preview, title (medium weight) and category in small uppercase letter-spaced grey below.
- **Right rail:** promo card (image + heading + short copy + stats line + full-width CTA) — for us: "Shadermix Pro — coming soon / join waitlist" or "Star on GitHub". Below: a sponsors/"Built with Shadermix" card (can be empty placeholder at launch).
- **Look:** light theme default with dark mode, lots of whitespace, hairline borders (~#E5E5E5), neutral greys, one accent colour for CTAs/active states, clean grotesk sans (e.g. Inter / Geist). Pick our own accent — not React Bits purple.
- Previews use the gallery performance rules in §8.6.

Until refs are in the repo:
- Build with design tokens in one file (`apps/site/src/styles/tokens.css`): colors, type scale, spacing, radii, shadows.
- Dark-first theme (effects look best on dark), light mode optional later.
- Layout skeleton only; don't invent a heavy visual style. Swap to the reference as soon as it arrives.

---

## 9. Quality checklist (Definition of Done for v0.1)

- [ ] 10 effects working in **Chrome, Safari (macOS + iOS), Firefox, Edge**, desktop + mobile
- [ ] Reduced-motion renders static frame; no-WebGL shows CSS fallback
- [ ] Effects pause offscreen & in background tabs (verify via Performance panel)
- [ ] Astro: works with and without View Transitions; no React in output bundle
- [ ] Webflow: verified on a real published Webflow site via CDN; IX2 interactions unaffected
- [ ] Bundle size limits pass
- [ ] Site: every component has a page, playground, 4 snippet tabs, props table
- [ ] Sanity publish → site rebuilds automatically
- [ ] Lighthouse ≥ 95 (Perf/SEO/A11y) on `/` and `/components/aurora`
- [ ] README with GIF, quick start for Astro + Webflow, contributing guide, MIT license, CREDITS.md
- [ ] `@shadermix/core`, `@shadermix/astro`, `@shadermix/webflow` published at `0.1.0`

---

## 10. Milestones — launch by Sunday 29 Nov 2026

> Assumption: today is Tue 17 Nov; "next weekend" = **Sat 28 – Sun 29 Nov**. I work on this mainly evenings + weekends, with Claude Code doing most of the build.
> If we want to compress to Sun 22 Nov, cut to 6 effects and skip §8.6 posters/§8.7 OG images.
> **Claude Code: stop at the end of each milestone, summarise what was done, list what I need to check, and wait for go-ahead.**

### M0 — Accounts & scaffold (Tue 17 – Wed 18 Nov)
**Me (manual):** buy/confirm `shadermix.com`, create npm org `@shadermix`, GitHub repo `shadermix/shadermix`, Sanity project, Cloudflare account + add domain.
**Claude Code:**
- pnpm monorepo per §4, TS strict, tsup, ESLint/Prettier, Changesets, Vitest, size-limit.
- Empty packages building; `apps/site` Astro hello-world; `apps/studio` Sanity init; CI workflow green.
**Done when:** `pnpm build` and `pnpm test` pass in CI; site runs locally.

### M1 — Core runtime + first 3 effects (Thu 19 – Fri 20 Nov)
- Runtime (§5.2): context, program, uniforms, resize, observers, reduced motion, fallback, shared rAF, colour parsing.
- Option schema system + attribute parser (+ unit tests).
- Effects: `aurora`, `mesh-gradient`, `grain-gradient`.
- A local dev page (`apps/playground-webflow/index.html`) showing all three via attributes.
**Done when:** three effects look good, pause offscreen, `update()` works, tests pass.

### M2 — All effects + Astro + Webflow packages, alpha publish (Sat 21 – Sun 22 Nov)
- Remaining effects: `silk`, `plasma`, `dot-grid`, `noise-waves`, `liquid-chrome`, `split-reveal`, `gradient-text`.
- `@shadermix/astro` components (§6) incl. View Transitions handling.
- `@shadermix/webflow` IIFE bundle (§7) + standalone per-effect builds.
- Publish `0.1.0-alpha.x` to npm; verify jsDelivr URL works.
- **Me:** test on a real Webflow staging site and a fresh `npm create astro` project.
**Done when:** same effect works in Astro, Webflow, and vanilla from npm/CDN.

### M3 — Site foundation + Sanity (Mon 23 – Wed 25 Nov)
- Sanity schemas (§8.3), Studio deployed.
- Site routes (§8.4) with layout, nav, footer, tokens; apply **design reference** if received.
- Component page: live preview + generated playground + live-updating snippet tabs + props table.
- Gallery with performance rules (§8.6).
- Slug-linking build check between Sanity and code.
- Blog: `post`/`author`/`tag` schemas, `/blog`, `/blog/[slug]`, tag pages, RSS, `shadermixEmbed` block rendering a live effect.
**Done when:** all 10 component pages render from Sanity + code locally.

### M4 — Content, docs, deploy (Thu 26 – Fri 27 Nov)
- **Me:** write component descriptions/presets in Sanity (Claude can draft them for me to paste).
- Docs pages (installation Astro/Webflow/Vanilla, performance).
- **Me:** publish 1–2 launch blog posts (e.g. "Introducing Shadermix", "Add a shader background to Webflow in 2 minutes") — Claude can draft.
- Blog SEO: `BlogPosting` JSON-LD, OG images per post, posts included in sitemap and `llms.txt`.
- SEO/AEO (§8.7): meta, JSON-LD, sitemap, `llms.txt`, OG images.
- Cloudflare deploy + domain; Sanity webhook → GitHub dispatch → rebuild (§8.8).
**Done when:** shadermix.com is live; editing in Sanity updates the live site within a few minutes.

### M5 — QA, polish, v0.1.0 launch (Sat 28 – Sun 29 Nov)
- Run the §9 checklist; fix bugs; Lighthouse pass.
- README with hero GIF, badges, quick starts.
- Publish `0.1.0` (stable tags) for all packages.
- **Me:** launch posts — X, LinkedIn, Astro Discord (#showcase), Webflow forum/community, Reddit r/astrojs & r/webflow. Record a 30–60s demo video.
**Done when:** v0.1.0 is on npm, site is live, launch posts are out.

---

## 11. Roadmap after launch (improvise later)

| Version | Additions |
|---|---|
| 0.2 | `npx shadermix add <effect>` CLI (copies `.astro` + effect source into the project); shadcn-compatible registry JSON (`shadermix.com/r/<slug>.json`) |
| 0.3 | More effects weekly (target 25+): particles, ribbons, metaballs, light rays, glass/refraction, ASCII, dithering; more text effects (scramble, blur-in, counter) |
| 0.4 | **"Copy to Webflow"** button — puts a ready section (div + attributes + content wrapper) on the clipboard in Webflow's paste format |
| 0.5 | Interaction effects: magnetic buttons, cursor trails, tilt cards, marquee, scroll-linked effects (still zero-dep) |
| 1.0 | **Shadermix Pro** (paid, one-time licence): page blocks (hero, features, pricing, CTA, FAQ, footer) for Astro and as Webflow cloneables; full landing-page templates; commercial licence; priority support |
| Later | AI agent kit: an agent "skill" + `llms.txt` so Claude Code/Cursor can install & configure Shadermix correctly; Webflow Marketplace app; showcase page of sites using Shadermix |

---

## 12. Conventions for Claude Code

- TypeScript strict everywhere; no `any` in public APIs.
- GLSL in separate `.glsl` files, imported as strings (tsup/Vite raw loader). Header comment in every shader: name, author, license, credits.
- Each effect folder is self-contained: `index.ts`, `meta.ts` (schema + defaults + display name + category), `*.frag.glsl`, `README.md` (short).
- Adding an effect = adding a folder + registering it in one `effects/registry.ts` — the Astro component, Webflow bundle, site page and playground should pick it up with minimal extra work (Astro wrapper can be generated by a script from the registry).
- Commit in small steps with conventional commits (`feat(core): add aurora effect`). Add a changeset for any package change.
- Don't add dependencies to `@shadermix/core`. Ask before adding any dependency anywhere else.
- Never commit secrets; use `.env.example`.
- When unsure about a visual detail, build the simplest clean version and flag it for my review rather than guessing a style.

---

## 13. Open questions [DECISION NEEDED]

1. Cloudflare **Workers (static assets)** vs **Pages** for the site? (Default: Workers.)
2. Site styling: plain CSS tokens vs Tailwind v4? (Decide after design reference.)
3. Playground island: vanilla TS vs Preact? (Default: vanilla TS.)
4. Is the npm scope `@shadermix` available? Fallback: `shadermix-core`, `shadermix-astro`, `shadermix-webflow` unscoped.
5. GitHub org `shadermix` or personal account repo? (Default: org, for credibility.)
6. Exact launch date: Sun 22 Nov (cut scope) or Sun 29 Nov (full v0.1 scope as planned)?
