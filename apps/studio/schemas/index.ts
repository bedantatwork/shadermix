import author from "./documents/author.js";
import category from "./documents/category.js";
import changelogEntry from "./documents/changelog-entry.js";
import docPage from "./documents/doc-page.js";
import page from "./documents/page.js";
import post from "./documents/post.js";
import siteSettings from "./documents/site-settings.js";
import tag from "./documents/tag.js";
import component from "./documents/component.js";
import previewPreset from "./objects/preview-preset.js";
import seo from "./objects/seo.js";
import { pageSectionTypes } from "./objects/sections.js";
import shadermixEmbed from "./objects/shadermix-embed.js";

export const schemaTypes = [
  // documents
  component,
  category,
  page,
  post,
  author,
  tag,
  changelogEntry,
  docPage,
  siteSettings,
  // objects
  seo,
  previewPreset,
  shadermixEmbed,
  ...pageSectionTypes,
];
