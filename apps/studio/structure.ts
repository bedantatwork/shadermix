// Studio sidebar layout. Groups document types the way an editor thinks about
// the site rather than alphabetically, and pins siteSettings as a singleton
// (one fixed document, no "create new" / list view).
import type { StructureResolver } from "sanity/structure";

export const SINGLETON_TYPES = new Set(["siteSettings"]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("component").title("Components"),
      S.documentTypeListItem("category").title("Categories"),
      S.divider(),
      S.documentTypeListItem("post").title("Blog posts"),
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("tag").title("Tags"),
      S.divider(),
      S.documentTypeListItem("docPage").title("Docs"),
      S.documentTypeListItem("changelogEntry").title("Changelog"),
      S.documentTypeListItem("page").title("Pages"),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
