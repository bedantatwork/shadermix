// Content layer for `docPage` (plan §8.3), fetched from Sanity at build time.
// Same contract as components-content.ts: synchronous getters over data loaded
// once at module level, so pages didn't change in the swap from mock data.
import type { PortableTextNode } from "./portable-text";
import { normalizeBody, sanityFetch } from "./sanity";

export interface DocPage {
  slug: string;
  title: string;
  order: number;
  description: string;
  body: PortableTextNode[];
}

const rows = await sanityFetch<(Omit<DocPage, "body"> & { body: unknown[] | null })[]>(`
  *[_type == "docPage" && defined(slug.current)] | order(order asc) {
    "slug": slug.current,
    title,
    "order": coalesce(order, 0),
    "description": coalesce(description, ""),
    body
  }
`);

const docs: DocPage[] = rows.map((row) => ({ ...row, body: normalizeBody(row.body) }));

export function getDocPages(): DocPage[] {
  return [...docs].sort((a, b) => a.order - b.order);
}

export function getDocPageBySlug(slug: string): DocPage | undefined {
  return docs.find((doc) => doc.slug === slug);
}
