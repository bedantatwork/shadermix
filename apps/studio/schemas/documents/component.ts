import { effectRegistry } from "@shadermix/core/effects";
import { defineField, defineType } from "sanity";

const effectSlugs = [...effectRegistry.keys()];

export default defineType({
  name: "component",
  title: "Component",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Must match an effect slug in @shadermix/core — the site build fails otherwise.",
      options: { source: "title" },
      validation: (r) =>
        r
          .required()
          .custom((value) =>
            !value?.current || effectSlugs.includes(value.current)
              ? true
              : `No effect registered with slug "${value.current}". Known slugs: ${effectSlugs.join(", ")}`,
          ),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: ["background", "text", "animation"] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "string",
      validation: (r) => r.max(140),
    }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["new", "beta", "stable"] },
      initialValue: "new",
    }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
    defineField({
      name: "previewPresets",
      title: "Preview presets",
      type: "array",
      of: [{ type: "previewPreset" }],
    }),
    defineField({ name: "posterImage", title: "Poster image", type: "image" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current", media: "posterImage" },
  },
});
