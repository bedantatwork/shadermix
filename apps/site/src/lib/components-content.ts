// Content layer for `component` (plan §8.3) — fetched from Sanity once per
// build via module-level await, so the getters below stay synchronous and no
// page code changed in the swap from mock data.
//
// The CMS owns editorial metadata (title, description, category, ordering);
// the option schema comes from @shadermix/core's registry, which stays the
// single source of truth for options (plan §5.1).
import * as aurora from "@shadermix/core/aurora";
import { effectRegistry } from "@shadermix/core/effects";
import * as grainGradient from "@shadermix/core/grain-gradient";
import * as meshGradient from "@shadermix/core/mesh-gradient";
import { sanityFetch } from "./sanity";
import { assertSlugLinks } from "./validate-content";

// Loose structural type for an effect's option schema — avoids depending on
// @shadermix/core's internal Schema type, which isn't part of its public API.
export interface SchemaFieldLike {
  type: string;
  default: unknown;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  count?: number;
  options?: readonly string[];
}

export interface ComponentDoc {
  slug: string;
  title: string;
  categorySlug: string;
  categoryTitle: string;
  type: "background" | "text" | "animation";
  shortDescription: string;
  tags: string[];
  status: "new" | "beta" | "stable";
  featured: boolean;
  order: number;
  schema: Record<string, SchemaFieldLike>;
}

type ComponentRow = Omit<ComponentDoc, "schema">;

// Explicit namespace imports (not bare side-effect imports): core's package.json
// only marks auto.js as side-effectful, so a bare import could be tree-shaken.
const schemas = new Map<string, Record<string, SchemaFieldLike>>([
  [aurora.slug, aurora.schema],
  [meshGradient.slug, meshGradient.schema],
  [grainGradient.slug, grainGradient.schema],
]);

const rows = await sanityFetch<ComponentRow[]>(`
  *[_type == "component" && defined(slug.current)] | order(order asc) {
    "slug": slug.current,
    title,
    "categorySlug": coalesce(category->slug.current, ""),
    "categoryTitle": coalesce(category->title, ""),
    type,
    "shortDescription": coalesce(shortDescription, ""),
    "tags": coalesce(tags, []),
    "status": coalesce(status, "new"),
    "featured": coalesce(featured, false),
    "order": coalesce(order, 0)
  }
`);

// Runs at module load — i.e. at build time, as soon as any page imports this.
// Fails the build if a CMS doc points at an effect that doesn't exist.
assertSlugLinks(
  rows.map((row) => row.slug),
  [...effectRegistry.keys()],
);

const docs: ComponentDoc[] = rows.map((row) => ({
  ...row,
  schema: schemas.get(row.slug) ?? {},
}));

export function getComponents(): ComponentDoc[] {
  return [...docs].sort((a, b) => a.order - b.order);
}

export function getComponentBySlug(slug: string): ComponentDoc | undefined {
  return docs.find((doc) => doc.slug === slug);
}

export function getCategories(): { slug: string; title: string }[] {
  const seen = new Map<string, string>();
  for (const doc of docs) seen.set(doc.categorySlug, doc.categoryTitle);
  return [...seen.entries()].map(([slug, title]) => ({ slug, title }));
}
