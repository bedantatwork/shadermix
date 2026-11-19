import { defineField, defineType } from "sanity";
import { pageSectionTypes } from "../objects/sections";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: pageSectionTypes.map((section) => ({ type: section.name })),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
