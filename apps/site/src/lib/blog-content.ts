// Mock content layer for `post` / `author` / `tag` (plan §8.3).
// Swap for @sanity/client GROQ calls; keep these return shapes.
import { block, bullet, code, type PortableTextNode } from "./portable-text";

export interface Author {
  slug: string;
  name: string;
  bio: string;
  githubUrl?: string;
}

export interface Tag {
  slug: string;
  title: string;
  description: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  authorSlug: string;
  tagSlugs: string[];
  relatedComponentSlugs: string[];
  body: PortableTextNode[];
}

const authors: Author[] = [
  {
    slug: "bedant",
    name: "Bedant Saikia",
    bio: "Building Shadermix — shaders and motion for Astro and Webflow.",
    githubUrl: "https://github.com/bedantatwork",
  },
];

const tags: Tag[] = [
  { slug: "announcements", title: "Announcements", description: "Releases and project news." },
  { slug: "webflow", title: "Webflow", description: "Using Shadermix in Webflow projects." },
  { slug: "astro", title: "Astro", description: "Using Shadermix in Astro projects." },
];

const posts: Post[] = [
  {
    slug: "introducing-shadermix",
    title: "Introducing Shadermix",
    excerpt:
      "An open-source library of shader backgrounds for Astro and Webflow — framework-free, zero dependencies.",
    publishedAt: "2026-11-18",
    authorSlug: "bedant",
    tagSlugs: ["announcements", "astro", "webflow"],
    relatedComponentSlugs: ["aurora", "mesh-gradient"],
    body: [
      block(
        "Most of the good component libraries are React-only. If you build marketing sites in Astro or Webflow, adding a shader background usually means shipping a React runtime for something that is, in the end, one fullscreen quad and a fragment shader.",
      ),
      block("Shadermix is the alternative: effects written once in plain TypeScript and WebGL, shipped to Astro, Webflow, and plain JavaScript."),
      block("What it looks like", "h2"),
      {
        _type: "shadermixEmbed",
        effect: "mesh-gradient",
        options: { speed: 0.35 },
        height: 300,
        caption: "mesh-gradient — a live effect embedded in this post.",
      },
      block("In Astro", "h2"),
      code(
        "astro",
        `---
import { Aurora } from '@shadermix/astro';
---
<Aurora colors={['#5227FF', '#7CFF67', '#00D1FF']} speed={0.6} />`,
      ),
      block("In Webflow", "h2"),
      block(
        "Add one script tag in Footer code, then set a custom attribute on any Div Block. No code editing beyond that.",
      ),
      code("html", '<div sm-effect="aurora" sm-speed="0.6"></div>'),
      block("What makes it different", "h2"),
      bullet("Zero runtime dependencies — no three.js, no ogl, no GSAP."),
      bullet("Pauses offscreen and in hidden tabs; caps device pixel ratio."),
      bullet("Respects prefers-reduced-motion and falls back to a CSS gradient without WebGL."),
      bullet("MIT licensed, with original shaders — nothing lifted from ShaderToy."),
      block("Where it is going", "h2"),
      block(
        "The first release targets ten effects that look great rather than fifty that look fine. After that: a CLI for copy-paste installs, more effects weekly, and page blocks and templates for both Astro and Webflow.",
      ),
    ],
  },
];

export function getPosts(): Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((author) => author.slug === slug);
}

export function getTags(): Tag[] {
  return tags;
}

export function getTagBySlug(slug: string): Tag | undefined {
  return tags.find((tag) => tag.slug === slug);
}

/** Only tags that actually have posts — avoids generating empty tag pages. */
export function getUsedTags(): Tag[] {
  const used = new Set(posts.flatMap((post) => post.tagSlugs));
  return tags.filter((tag) => used.has(tag.slug));
}

export function getPostsByTag(tagSlug: string): Post[] {
  return getPosts().filter((post) => post.tagSlugs.includes(tagSlug));
}
