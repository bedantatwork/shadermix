import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  // Singleton in practice: the Studio desk structure (sanity.config.ts) should
  // hide "create new" once one document exists. Not wired up yet — M3 TODO.
  fields: [
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "href", title: "Href", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "footerLinks",
      title: "Footer links",
      type: "array",
      of: [
        {
          type: "object",
          name: "footerLink",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "href", title: "Href", type: "string" }),
          ],
        },
      ],
    }),
    defineField({ name: "githubUrl", title: "GitHub URL", type: "url" }),
    defineField({ name: "xUrl", title: "X URL", type: "url" }),
    defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "announcementBar", title: "Announcement bar text", type: "string" }),
  ],
});
