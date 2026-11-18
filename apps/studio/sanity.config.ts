import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "shadermix",
  title: "Shadermix",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "placeholder-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [visionTool()],
  schema: {
    types: schemaTypes,
  },
});
