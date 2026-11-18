import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "subheading", title: "Subheading", type: "text", rows: 2 }),
    defineField({
      name: "effect",
      title: "Background effect slug",
      type: "string",
      description: "e.g. aurora — must match a slug in @shadermix/core",
    }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string" }),
    defineField({ name: "ctaHref", title: "CTA link", type: "string" }),
  ],
  preview: { select: { title: "heading" } },
});

export const featureGrid = defineType({
  name: "featureGridSection",
  title: "Feature grid",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "featureItem",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
          ],
        },
      ],
    }),
  ],
  preview: { select: { title: "heading" } },
});

export const componentShowcase = defineType({
  name: "componentShowcaseSection",
  title: "Component showcase",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "components",
      title: "Components",
      type: "array",
      of: [{ type: "reference", to: [{ type: "component" }] }],
    }),
  ],
  preview: { select: { title: "heading" } },
});

export const cta = defineType({
  name: "ctaSection",
  title: "CTA",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "body", title: "Body", type: "text", rows: 2 }),
    defineField({ name: "buttonLabel", title: "Button label", type: "string" }),
    defineField({ name: "buttonHref", title: "Button link", type: "string" }),
  ],
  preview: { select: { title: "heading" } },
});

export const faq = defineType({
  name: "faqSection",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 3 }),
          ],
        },
      ],
    }),
  ],
  preview: { select: { title: "heading" } },
});

export const pageSectionTypes = [hero, featureGrid, componentShowcase, cta, faq];
