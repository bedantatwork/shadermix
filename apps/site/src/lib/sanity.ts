// Minimal build-time Sanity reader. The dataset is public, so a GROQ query is a
// single unauthenticated GET against the HTTP Query API — no @sanity/client
// dependency needed. Runs only during `astro build` / `astro dev` (every caller
// is a module-level `await` in lib/*-content.ts), never in the browser.
//
// The project ID and dataset are not secrets (they ship in any client that
// reads the dataset), so they default to the real values and can be
// overridden via env for a staging dataset.
import type { PortableTextNode } from "./portable-text";

const projectId = import.meta.env.SANITY_PROJECT_ID ?? "qphpshsf";
const dataset = import.meta.env.SANITY_DATASET ?? "production";
const apiVersion = "2025-02-19";

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);
  // Only published documents — drafts must never leak onto the site.
  url.searchParams.set("perspective", "published");
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(`$${name}`, JSON.stringify(value));
  }

  const response = await fetch(url);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Sanity query failed (${response.status} ${response.statusText}) for dataset "${dataset}" in project "${projectId}": ${detail.slice(0, 300)}`,
    );
  }

  const json = (await response.json()) as { result: T };
  return json.result;
}

/**
 * Normalises a Portable Text body as stored in Sanity into the renderer's
 * shape. The only difference is `shadermixEmbed.options`: the Studio stores it
 * as a JSON string (so editors can type it), the renderer wants an object.
 */
export function normalizeBody(body: unknown[] | null | undefined): PortableTextNode[] {
  return (body ?? []).map((node) => {
    const n = node as PortableTextNode & { options?: unknown };
    if (n._type === "shadermixEmbed" && typeof n.options === "string") {
      try {
        return { ...n, options: JSON.parse(n.options) as Record<string, unknown> };
      } catch {
        throw new Error(`Invalid JSON in shadermixEmbed options: ${n.options}`);
      }
    }
    return n;
  });
}
