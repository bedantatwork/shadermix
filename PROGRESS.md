# Shadermix — Progress Log

> Append-only. Newest entry on top. One entry per session or milestone close.
> Format: date, what shipped, decisions made, open questions, next steps.

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
