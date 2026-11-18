// Portable Text types + helpers.
//
// Mock content is authored in this exact shape so that swapping the content
// layer for real @sanity/client GROQ results needs no changes to the renderer
// or to any page using it.

export interface PortableTextSpan {
  _type: "span";
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: "link";
  href: string;
}

export interface PortableTextBlock {
  _type: "block";
  style?: "normal" | "h2" | "h3" | "h4" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
}

export interface CodeBlock {
  _type: "code";
  language: string;
  code: string;
  filename?: string;
}

export interface ShadermixEmbedBlock {
  _type: "shadermixEmbed";
  effect: string;
  options?: Record<string, unknown>;
  height?: number;
  caption?: string;
}

export type PortableTextNode = PortableTextBlock | CodeBlock | ShadermixEmbedBlock;

/** A run of consecutive list-item blocks sharing the same `listItem` kind. */
export interface ListGroup {
  _type: "list";
  listItem: "bullet" | "number";
  items: PortableTextBlock[];
}

export type RenderNode = PortableTextNode | ListGroup;

/**
 * Portable Text encodes lists as a flat run of sibling blocks each carrying a
 * `listItem` — there is no wrapping list node. Group consecutive runs so the
 * renderer can emit real <ul>/<ol> elements.
 */
export function groupNodes(nodes: PortableTextNode[]): RenderNode[] {
  const out: RenderNode[] = [];

  for (const node of nodes) {
    const isListItem = node._type === "block" && node.listItem;
    if (!isListItem) {
      out.push(node);
      continue;
    }

    const block = node as PortableTextBlock;
    const previous = out[out.length - 1];
    if (previous?._type === "list" && previous.listItem === block.listItem) {
      previous.items.push(block);
    } else {
      out.push({ _type: "list", listItem: block.listItem!, items: [block] });
    }
  }

  return out;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Renders a block's spans to HTML, wrapping each span in its marks.
 * Text and href values are escaped — marks themselves are matched against a
 * known set, so no caller-supplied string reaches the output unescaped.
 */
export function renderSpans(block: PortableTextBlock): string {
  const markDefs = block.markDefs ?? [];

  return block.children
    .map((span) => {
      let html = escapeHtml(span.text);

      for (const mark of span.marks ?? []) {
        if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "code") html = `<code>${html}</code>`;
        else {
          const def = markDefs.find((d) => d._key === mark);
          if (def?._type === "link") {
            const external = /^https?:\/\//.test(def.href);
            const attrs = external ? ' target="_blank" rel="noreferrer"' : "";
            html = `<a href="${escapeHtml(def.href)}"${attrs}>${html}</a>`;
          }
        }
      }

      return html;
    })
    .join("");
}

/** Plain text of a block — used for heading anchor ids and excerpts. */
export function blockToPlainText(block: PortableTextBlock): string {
  return block.children.map((span) => span.text).join("");
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Convenience for building mock content without hand-writing span objects. */
export function block(
  text: string,
  style: PortableTextBlock["style"] = "normal",
): PortableTextBlock {
  return { _type: "block", style, children: [{ _type: "span", text }] };
}

export function bullet(text: string): PortableTextBlock {
  return { _type: "block", style: "normal", listItem: "bullet", children: [{ _type: "span", text }] };
}

export function code(language: string, source: string, filename?: string): CodeBlock {
  return filename
    ? { _type: "code", language, code: source, filename }
    : { _type: "code", language, code: source };
}
