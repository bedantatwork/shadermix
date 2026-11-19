import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { SINGLETON_TYPES, structure } from "./structure";

export default defineConfig({
  name: "shadermix",
  title: "Shadermix",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "placeholder-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  // structureTool first so the content editor is the Studio's landing tool;
  // Vision (GROQ playground) is a developer tool and stays second.
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Hide singletons from the global "Create new" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    // No duplicate/delete/unpublish on singletons.
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(
            ({ action }) =>
              action === "publish" || action === "discardChanges" || action === "restore",
          )
        : actions,
  },
});
