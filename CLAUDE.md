# Shadermix — Claude Code orientation

Read this first, every session. Then read `SHADERMIX_PLAN.md` in full (it's the master
spec — scope, architecture, milestones) and `PROGRESS.md` (what's actually been done so
far, decisions made, what's next). The plan is the design; `PROGRESS.md` is the truth
about current state — if they disagree, `PROGRESS.md` wins for "where are we", the plan
wins for "what are we building".

## Working mode
- Work **milestone by milestone** (see plan §10). Stop at the end of each milestone,
  summarize what was done, list what Bedant needs to check, and wait for go-ahead before
  starting the next one.
- Where the plan says **[DECISION NEEDED]** (see §13), ask before proceeding instead of
  guessing.
- Where the plan says **[DESIGN REF]**, wait for the referenced design asset instead of
  inventing a visual style. If a design ref is missing, build the simplest clean skeleton
  and flag it for review rather than guessing.

## Conventions (plan §12)
- TypeScript strict everywhere; no `any` in public APIs.
- GLSL lives in separate `.glsl` files, imported as raw strings. Every shader file gets a
  header comment: name, author, license, credits.
- Each effect is a self-contained folder: `index.ts`, `meta.ts` (schema + defaults +
  display name + category), `*.frag.glsl`, short `README.md`.
- Adding an effect = add the folder + register it in `effects/registry.ts`. Astro
  wrapper, Webflow bundle, site page, and playground should pick it up from the registry
  with minimal extra wiring.
- Commit in small steps using conventional commits (`feat(core): add aurora effect`). Add
  a Changeset for any package change.
- No dependencies in `@shadermix/core`, ever. Ask before adding a dependency anywhere
  else in the monorepo.
- Never commit secrets — use `.env.example`.
- Original shader code only — do not port ShaderToy (CC BY-NC-SA, incompatible with MIT)
  or React Bits source. Credit any MIT/Apache-derived code in `CREDITS.md` and the file
  header.

## End-of-session logging
At the end of each work session (and always at the end of a milestone), append an entry
to `PROGRESS.md`: date, what shipped, decisions made (including resolved
[DECISION NEEDED] items), open questions, and next steps. Keep entries short — this file
is for picking up context fast, not a changelog.
