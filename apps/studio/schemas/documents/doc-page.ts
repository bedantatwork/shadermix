import { defineField, defineType } from "sanity";

export default defineType({
  name: "docPage",
  title: "Doc page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "e.g. installation/astro",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Shown under the page title and used as the meta description.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }, { type: "code" }, { type: "shadermixEmbed" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
