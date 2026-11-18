import { defineField, defineType } from "sanity";

export default defineType({
  name: "previewPreset",
  title: "Preview preset",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "values",
      title: "Option values (JSON)",
      description: "JSON object matching the effect's option schema, e.g. {\"speed\": 1.2}",
      type: "text",
      rows: 3,
      validation: (r) =>
        r.custom((value) => {
          if (!value) return true;
          try {
            JSON.parse(value);
            return true;
          } catch {
            return "Must be valid JSON";
          }
        }),
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
