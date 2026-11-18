# Contributing to Shadermix

Shadermix is an early-stage project — see `SHADERMIX_PLAN.md` for the full spec
and `PROGRESS.md` for current status before opening a PR.

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

## Conventions

- TypeScript strict everywhere; no `any` in public APIs.
- No dependencies in `@shadermix/core`, ever. Ask before adding a dependency
  anywhere else in the monorepo.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
  (e.g. `feat(core): add aurora effect`).
- Any change to a published package needs a changeset: `pnpm changeset`.
- Original shader code only — do not port ShaderToy (CC BY-NC-SA) or React Bits
  source. Credit any MIT/Apache-derived code in `CREDITS.md`.
