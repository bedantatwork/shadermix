import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "../lib/blog-content";

export function GET(context: APIContext) {
  return rss({
    title: "Shadermix",
    description: "Shaders and motion for Astro & Webflow.",
    // `context.site` comes from `site` in astro.config.mjs.
    site: context.site ?? "https://shadermix.com",
    items: getPosts().map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: new Date(post.publishedAt),
      link: `/blog/${post.slug}`,
    })),
  });
}
