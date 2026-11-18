import { effectRegistry } from "@shadermix/core/effects";
import { defineField, defineType } from "sanity";

const effectSlugs = [...effectRegistry.keys()];

export default defineType({
  name: "shadermixEmbed",
  title: "Shadermix embed",
  type: "object",
  fields: [
    defineField({
      name: "effect",
      title: "Effect",
      type: "string",
      options: { list: effectSlugs },
      validation: (r) =>
        r
          .required()
          .custom((value) =>
            !value || effectSlugs.includes(value) ? true : `Unknown effect slug: "${value}"`,
          ),
    }),
    defineField({
      name: "options",
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
    defineField({ name: "height", title: "Height (px)", type: "number", initialValue: 320 }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
  preview: {
    select: { title: "effect", subtitle: "caption" },
  },
});
