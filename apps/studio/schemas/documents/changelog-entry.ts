import { defineField, defineType } from "sanity";

export default defineType({
  name: "changelogEntry",
  title: "Changelog entry",
  type: "document",
  fields: [
    defineField({
      name: "version",
      title: "Version",
      type: "string",
      description: "e.g. 0.1.0",
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Date", type: "date", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }] }),
  ],
  orderings: [
    { title: "Date, newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { title: "version", subtitle: "title" },
  },
});
