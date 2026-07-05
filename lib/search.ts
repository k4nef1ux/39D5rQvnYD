// lib/search.ts
// Builds a static search index over content POSTS ONLY (log + note), at build
// time. No server, no third party - the index is shipped to the client and
// filtered there. Privacy + simplicity by design.

import { getAllPages, type PageType } from "@/lib/content";

export type SearchDoc = {
  title: string;
  slug: string;
  type: PageType;
  date?: string;
  description?: string;
  // lowercased haystack: title + description + body text
  text: string;
};

function stripMarkdown(md: string): string {
  return md
    .replace(/`{1,3}[^`]*`{1,3}/g, " ") // code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/[#>*_~\-]+/g, " ") // md punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export async function getSearchIndex(): Promise<SearchDoc[]> {
  const pages = await getAllPages();
  return pages
    .filter((p) => p.type === "log" || p.type === "note")
    .map((p) => {
      const body = stripMarkdown(p.raw);
      // fold the post's tags into the haystack so searching a tag word (e.g.
      // "freedom") surfaces the posts carrying it, even when the prose never
      // says it. Tags live in frontmatter, not the body, so without this they
      // were invisible to both the top-right search and the command palette.
      const tags = (p.tags ?? []).join(" ");
      return {
        title: p.title,
        slug: p.slug,
        type: p.type,
        date: p.date,
        description: p.description,
        text: `${p.title} ${p.description ?? ""} ${tags} ${body}`.toLowerCase(),
      };
    });
}
