import author from "./documents/author";
import category from "./documents/category";
import changelogEntry from "./documents/changelog-entry";
import docPage from "./documents/doc-page";
import page from "./documents/page";
import post from "./documents/post";
import siteSettings from "./documents/site-settings";
import tag from "./documents/tag";
import component from "./documents/component";
import codeBlock from "./objects/code-block";
import previewPreset from "./objects/preview-preset";
import seo from "./objects/seo";
import { pageSectionTypes } from "./objects/sections";
import shadermixEmbed from "./objects/shadermix-embed";

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
  codeBlock,
  ...pageSectionTypes,
];
