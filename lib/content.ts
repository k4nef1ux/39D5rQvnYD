// lib/content.ts
// Reads /content, parses frontmatter + markdown body, exposes typed Page objects.
// Adding a .md file to /content = a new page. No code changes required.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

// gray-matter's bundled YAML engine calls js-yaml v3's safeLoad; we pin js-yaml
// to v4 (patches CVE-2026-53550) which removed safeLoad, so hand gray-matter a
// v4-compatible engine that uses load/dump directly.
const yamlEngine = {
  parse: (s: string) => (yaml.load(s) ?? {}) as object,
  stringify: (o: object) => yaml.dump(o),
};
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { getImageSize } from "./images";
import { tagSlug } from "./slug";

export type PageType = "log" | "note" | "gear" | "gift" | "page";

export type Frontmatter = {
  title: string;
  // optional SEO <title> override. when set, used for the document <title> and
  // social title while the visible <h1> stays `title` - lets minimal headings
  // ("about", "terms") keep a longer, descriptive title tag for search.
  seoTitle?: string;
  slug: string;
  type: PageType;
  date?: string;
  // optional last-updated date. when set (and different from `date`), the post
  // shows "updated <date>" and JSON-LD/sitemap use it as dateModified/lastmod -
  // a freshness signal for readers and re-crawl priority on time-sensitive posts.
  updated?: string;
  description?: string;
  nav?: boolean;
  order?: number;
  // when set (to a parent nav href, e.g. "/about"), this page nests under that
  // item as a sub-nav child instead of appearing as a top-level nav entry.
  navParent?: string;
  template?: string;
  tags?: string[];
  featured?: boolean;
  // when true: the post is sponsored/affiliate-led; surfaces a visible
  // "sponsored" disclosure on the hero slide (plain disclosure, and matches
  // the rel="sponsored" link attribution).
  sponsored?: boolean;
  // short vetting badge shown on guide cards (e.g. "3 cut in vetting",
  // "flaws listed") - the trust element; keep it a claim the body backs up.
  badge?: string;
  // hero image shown atop the post + used as the link/social cover (a path
  // under /public, e.g. "/images/my-slug/cover.webp", or an image route)
  cover?: string;
  // --- gift/product fields (type: "gift") ---
  // which gift lane it belongs to: "for her" | "for him" | "for mom" | "for dad" | "under $50" |
  // "occasions" | "hobbies". Also carried as the first tag so /tags/for-him
  // acts as the category page.
  category?: string;
  // display price string, e.g. "$59" (kept as text so "$29-$39" etc. work)
  price?: string;
  // outbound affiliate/retailer link (ships BARE by default - add a referral
  // code only once the program confirms it's allowed, then allowlist it).
  buyUrl?: string;
  // retailer/network label shown on the shop button context, e.g. "amazon"
  merchant?: string;
  // optional star rating 0-5 (one decimal), surfaced on the product card
  rating?: number;
  // when true: hidden from all listings/feed/sitemap/search in production,
  // still visible in local `npm run dev` for preview
  draft?: boolean;
};

export type TocEntry = { depth: number; id: string; text: string };

export type Page = Frontmatter & {
  // rendered HTML body
  html: string;
  // raw markdown body (used to build the search index)
  raw: string;
  // estimated reading time in minutes (>= 1)
  readingMinutes: number;
  // table of contents from h2/h3 headings
  toc: TocEntry[];
  // first inline body illustration (text-free) - used as the lead visual in
  // feeds/hero/post-top, so the title-bearing `cover` is free for OG/sharing.
  leadImage: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

async function mdToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // raw HTML blocks in markdown pass through untouched - the article visual
    // components (.vz-*, see globals.css + EDITING.md) are hand-authored HTML
    // in our own /content files, so this is trusted input.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["heading-anchor"] },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  // lazy-load + async-decode in-post images, and inject intrinsic
  // width/height for local /public images so the browser reserves layout
  // space before the file arrives (CLS ~0 -> protects the >=99 Lighthouse rule)
  const withImgs = String(file).replace(
    /<img ([^>]*?)\/?>/g,
    (full, attrs: string) => {
      let extra = "";
      if (!/\bwidth=/.test(attrs)) {
        const m = attrs.match(/\bsrc="([^"]+)"/);
        const dim = m ? getImageSize(m[1]) : null;
        if (dim) extra = ` width="${dim.width}" height="${dim.height}"`;
      }
      return `<img loading="lazy" decoding="async"${extra} ${attrs.trim()}>`;
    }
  );
  // External links open in a new tab with a safe rel. Affiliate links (hostinger)
  // get rel="sponsored" per Google's link-attribution guidance; other external
  // references get rel="noopener". Internal links and heading anchors (href="#..")
  // never match the http(s) test, so they stay untouched.
  return withImgs.replace(
    /<a\s+([^>]*href="https?:\/\/[^"]*"[^>]*)>/g,
    (full, attrs: string) => {
      if (/\brel=/.test(attrs) || /\btarget=/.test(attrs)) return full;
      const isAffiliate = /href="https?:\/\/[^"]*(?:amazon\.[a-z.]+|amzn\.to|amzn\.com|hostinger\.com|make\.com)/i.test(attrs);
      const rel = isAffiliate ? "sponsored noopener" : "noopener";
      return `<a ${attrs} target="_blank" rel="${rel}">`;
    }
  );
}

/** ~200 wpm reading estimate, floored at 1 minute. */
function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Pull an h2/h3 table of contents out of the rendered HTML (ids from rehype-slug). */
function extractToc(html: string): TocEntry[] {
  const out: TocEntry[] = [];
  const re = /<h([23])\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    if (text) out.push({ depth: Number(m[1]), id: m[2], text });
  }
  return out;
}

function readContentFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

/** Every page, parsed + rendered. Newest first where dates exist. */
export async function getAllPages(): Promise<Page[]> {
  const files = readContentFiles();
  const pages = await Promise.all(
    files.map(async (file) => {
      const full = path.join(CONTENT_DIR, file);
      const rawFile = fs.readFileSync(full, "utf8");
      const { data, content } = matter(rawFile, { engines: { yaml: yamlEngine } });
      const fm = data as Partial<Frontmatter>;
      const slug = fm.slug || file.replace(/\.mdx?$/, "");
      // promote the "short version:" paragraph into a scannable tl;dr callout
      const html = (await mdToHtml(content)).replace(
        /<p>(short version:\s*)/i,
        '<p class="tldr"><span class="tldr-tag">tl;dr</span>'
      );
      const page: Page = {
        readingMinutes: readingMinutes(content),
        toc: extractToc(html),
        title: fm.title || slug,
        seoTitle: fm.seoTitle,
        slug,
        type: (fm.type as PageType) || "page",
        date: fm.date,
        updated: fm.updated,
        description: fm.description || "",
        nav: fm.nav ?? false,
        order: fm.order ?? 999,
        navParent: fm.navParent,
        template: fm.template || "",
        tags: normalizeTags(fm.tags),
        featured: fm.featured ?? false,
        sponsored: fm.sponsored ?? false,
        badge: fm.badge || "",
        cover: fm.cover || "",
        category: fm.category || "",
        price: fm.price || "",
        buyUrl: fm.buyUrl || "",
        merchant: fm.merchant || "",
        rating: typeof fm.rating === "number" ? fm.rating : undefined,
        draft: fm.draft ?? false,
        html,
        raw: content,
        leadImage:
          (content.match(/!\[[^\]]*\]\((\/images\/[^)]+\.(?:webp|png|jpe?g))\)/) || [])[1] || "",
      };
      return page;
    })
  );
  // Drafts are hidden everywhere in production (build/start) but visible in
  // local `next dev`, so you can preview work-in-progress before publishing.
  const showDrafts = process.env.NODE_ENV !== "production";
  return pages
    .filter((p) => showDrafts || !p.draft)
    .sort(byDateDesc);
}

function byDateDesc(a: Page, b: Page): number {
  // Order by the *effective* date: a real rewrite (`updated`) resurfaces the
  // post to the top of every feed (homepage, latest rail, indexes, prev/next).
  // Only bump `updated` for genuine rewrites, never typo fixes.
  const da = a.updated || a.date ? Date.parse((a.updated || a.date)!) : 0;
  const db = b.updated || b.date ? Date.parse((b.updated || b.date)!) : 0;
  return db - da;
}

/** A single page by slug, or null. */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pages = await getAllPages();
  return pages.find((p) => p.slug === slug) ?? null;
}

/** Slugs for generateStaticParams - excludes the reserved index routes. */
export async function getAllSlugs(): Promise<string[]> {
  const reserved = new Set(["logs", "notes", "gear", "tags"]);
  const pages = await getAllPages();
  return pages.map((p) => p.slug).filter((s) => !reserved.has(s));
}

/** All posts of a given type (log | note), newest first. */
export async function getPostsByType(type: PageType): Promise<Page[]> {
  const pages = await getAllPages();
  return pages.filter((p) => p.type === type);
}

/** Newest posts across log + note combined (for the homepage "latest"). */
export async function getLatestPosts(limit?: number): Promise<Page[]> {
  const pages = await getAllPages();
  const posts = pages.filter(
    (p) => p.type === "log" || p.type === "note" || p.type === "gear" || p.type === "gift"
  );
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}

// ---------------------------------------------------------------------------
// TAGS + FEATURED + ADJACENCY
// ---------------------------------------------------------------------------

const isPost = (p: Page) =>
  p.type === "log" || p.type === "note" || p.type === "gear" || p.type === "gift";

/** Coerce a frontmatter tags value into a clean string[] (lowercased, trimmed). */
function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);
}

/** tagSlug lives in ./slug (pure, importable by client components). */
export { tagSlug };

export type TagCount = { tag: string; slug: string; count: number };

/** Every tag used by posts (log|note), with frequency. Sorted by count desc, then a-z. */
export async function getAllTags(): Promise<TagCount[]> {
  const posts = (await getAllPages()).filter(isPost);
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts (log|note) carrying the given tag, newest first. Accepts tag or tag-slug. */
export async function getPostsByTag(tagOrSlug: string): Promise<Page[]> {
  const want = tagSlug(tagOrSlug);
  const posts = (await getAllPages()).filter(isPost);
  return posts.filter((p) => (p.tags ?? []).some((t) => tagSlug(t) === want));
}

/** Featured posts (featured:true), newest first; falls back to latest when none. */
export async function getFeaturedPosts(limit: number): Promise<Page[]> {
  const posts = (await getAllPages()).filter(isPost);
  const featured = posts.filter((p) => p.featured);
  return (featured.length > 0 ? featured : posts).slice(0, limit);
}

/** Up to `limit` random posts (note|gear), excluding given slugs. Reshuffles per build. */
export async function getRandomPosts(
  limit: number,
  exclude: string[] = []
): Promise<Page[]> {
  const ex = new Set(exclude);
  const pool = (await getAllPages()).filter(isPost).filter((p) => !ex.has(p.slug));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

/** Prev/next neighbours of a post across the combined chronological post list. */
export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: Page | null; next: Page | null }> {
  const posts = (await getAllPages()).filter(isPost); // already newest-first
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  // "next" = older (further down the chronology), "prev" = newer.
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i < posts.length - 1 ? posts[i + 1] : null,
  };
}

/** Up to `limit` posts sharing a tag with the given slug (newest first), excluding itself. */
export async function getRelatedPosts(slug: string, limit: number): Promise<Page[]> {
  const posts = (await getAllPages()).filter(isPost);
  const self = posts.find((p) => p.slug === slug);
  if (!self || !(self.tags ?? []).length) return [];
  const want = new Set((self.tags ?? []).map(tagSlug));
  return posts
    .filter((p) => p.slug !== slug && (p.tags ?? []).some((t) => want.has(tagSlug(t))))
    .slice(0, limit);
}
