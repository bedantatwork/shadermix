// Mock content layer — shaped exactly like a future `component` GROQ query
// result (plan §8.3: component + resolved category reference). Swap
// getComponents()/getComponentBySlug()/getCategories() for real @sanity/client
// calls once the Sanity project exists; keep the same return shape so pages
// using this module don't need to change.
import * as aurora from "@shadermix/core/aurora";
import * as grainGradient from "@shadermix/core/grain-gradient";
import * as meshGradient from "@shadermix/core/mesh-gradient";

// Loose structural type for an effect's option schema — avoids depending on
// @shadermix/core's internal Schema type, which isn't part of its public API.
// The schema is exported as a plain value from each effect module (plan
// §5.1's single-source-of-truth); this just describes its shape for display.
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

const docs: ComponentDoc[] = [
  {
    slug: aurora.slug,
    title: aurora.name,
    categorySlug: "backgrounds",
    categoryTitle: "Backgrounds",
    type: "background",
    shortDescription: "Soft flowing northern-lights bands.",
    tags: ["gradient", "animated", "webgl"],
    status: "new",
    featured: true,
    order: 1,
    schema: aurora.schema,
  },
  {
    slug: meshGradient.slug,
    title: meshGradient.name,
    categorySlug: "backgrounds",
    categoryTitle: "Backgrounds",
    type: "background",
    shortDescription: "Slowly morphing multi-point colour mesh.",
    tags: ["gradient", "animated", "webgl"],
    status: "new",
    featured: true,
    order: 2,
    schema: meshGradient.schema,
  },
  {
    slug: grainGradient.slug,
    title: grainGradient.name,
    categorySlug: "backgrounds",
    categoryTitle: "Backgrounds",
    type: "background",
    shortDescription: "Animated angled gradient with film grain.",
    tags: ["gradient", "grain", "webgl"],
    status: "new",
    featured: false,
    order: 3,
    schema: grainGradient.schema,
  },
];

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
