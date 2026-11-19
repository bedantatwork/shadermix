---
"@shadermix/core": patch
---

Add a `default` condition to every `exports` entry so non-ESM-aware resolvers (e.g. the Sanity CLI's schema loader) can resolve `@shadermix/core` subpaths.
