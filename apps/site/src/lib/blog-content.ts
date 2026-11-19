// Content layer for `post` / `author` / `tag` (plan §8.3), fetched from Sanity
// at build time. Synchronous getters over data loaded once at module level, so
// pages didn't change in the swap from mock data.
import type { PortableTextNode } from "./portable-text";
import { normalizeBody, sanityFetch } from "./sanity";

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

interface BlogData {
  authors: (Omit<Author, "githubUrl"> & { githubUrl: string | null })[];
  tags: Tag[];
  posts: (Omit<Post, "body"> & { body: unknown[] | null })[];
}

const data = await sanityFetch<BlogData>(`{
  "authors": *[_type == "author" && defined(slug.current)] {
    "slug": slug.current, name, "bio": coalesce(bio, ""), githubUrl
  },
  "tags": *[_type == "tag" && defined(slug.current)] | order(title asc) {
    "slug": slug.current, title, "description": coalesce(description, "")
  },
  "posts": *[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) {
    "slug": slug.current,
    title,
    "excerpt": coalesce(excerpt, ""),
    publishedAt,
    "authorSlug": coalesce(author->slug.current, ""),
    "tagSlugs": coalesce(tags[]->slug.current, []),
    "relatedComponentSlugs": coalesce(relatedComponents[]->slug.current, []),
    body
  }
}`);

const authors: Author[] = data.authors.map(({ githubUrl, ...rest }) =>
  githubUrl ? { ...rest, githubUrl } : rest,
);

const tags: Tag[] = data.tags;

const posts: Post[] = data.posts.map((post) => ({
  ...post,
  // Sanity stores a full datetime; pages and RSS expect a sortable date string.
  publishedAt: post.publishedAt.slice(0, 10),
  // A dereference to a deleted doc yields null — drop those rather than render empty links.
  tagSlugs: post.tagSlugs.filter(Boolean),
  relatedComponentSlugs: post.relatedComponentSlugs.filter(Boolean),
  body: normalizeBody(post.body),
}));

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
