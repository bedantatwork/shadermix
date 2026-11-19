import { defineField, defineType } from "sanity";

// A minimal code block for Portable Text bodies. Deliberately a plain object
// rather than @sanity/code-input, to avoid a dependency — the field names
// (language / code / filename) match code-input's shape, so switching to that
// plugin later would need no content migration. The site highlights it with
// Shiki at build time (PortableText.astro).
export default defineType({
  name: "code",
  title: "Code",
  type: "object",
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: { list: ["astro", "bash", "css", "html", "js", "ts", "json", "glsl"] },
      initialValue: "js",
      validation: (r) => r.required(),
    }),
    defineField({ name: "filename", title: "Filename (optional)", type: "string" }),
    defineField({
      name: "code",
      title: "Code",
      type: "text",
      rows: 10,
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "filename", subtitle: "language", code: "code" },
    prepare: ({ title, subtitle, code }: { title?: string; subtitle?: string; code?: string }) => ({
      title: title ?? code?.split("\n")[0] ?? "Code",
      subtitle: subtitle ?? "",
    }),
  },
});
