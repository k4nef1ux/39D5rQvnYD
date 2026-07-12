// scripts/seo-check.mjs
// Pre-publish SEO + brand linter. Run `npm run seo-check`. Exits non-zero on any
// ERROR so it can gate a deploy in CI. This is the "so we don't wonder why a
// length is off or an alt is missing" net - it encodes the rules in SEO.md so a
// cloned copy of this template inherits them automatically.
//
// It checks, against the live rules:
//   - <title> length: (seoTitle || title) <= 53 chars  (rendered <= 60 after " - <name>")
//     and rendered >= 30 chars (search tools flag titles that are too short)
//   - meta description: 120-160 chars (frontmatter, config, and per-tag data)
//   - inline markdown images must have real alt text (no `![](...)`)
//   - brand: no em/en dashes, no emoji (anywhere in content)
//   - every tag used in content has a TAG_META entry (title + meta description) in lib/tag-meta.ts
//
// It deliberately does NOT touch the network and never depends on a build.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

// js-yaml is pinned to v4 (removed safeLoad), so hand gray-matter a v4 engine -
// same shim as lib/content.ts, otherwise gray-matter's bundled v3 call throws.
const yamlEngine = {
  parse: (s) => yaml.load(s) ?? {},
  stringify: (o) => yaml.dump(o),
};
const parseFm = (raw) => matter(raw, { engines: { yaml: yamlEngine } });

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const SITE_SRC = (() => {
  try { return fs.readFileSync(path.join(ROOT, "config", "site.ts"), "utf8"); }
  catch { return ""; }
})();
// layout renders <title> as `%s - <name>`. Derive the suffix from config so this
// linter works unchanged in a cloned repo with a different site name.
const SITE_NAME = (SITE_SRC.match(/name:\s*"([^"]+)"/) || [, "findshq"])[1];
const SITE_SUFFIX = ` - ${SITE_NAME}`;
const TITLE_MAX = 53; // so rendered <title> stays <= 60
const TITLE_MIN_RENDERED = 30; // shorter than this gets flagged "title too short"
const DESC_MIN = 120;
const DESC_MAX = 160;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`  ${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`  ${file}: ${msg}`);

const EM_EN_DASH = /[—–]/; // em dash or en dash (by code point, so this file stays glyph-free)
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
const EMPTY_ALT_IMG = /!\[\s*\]\(/; // markdown image with empty alt
// brand-banned words (claim-words that read as a tell). edit this list per clone.
// findshq's warm gift-guide voice has none for now (q1rk's "honest" ban was
// specific to that brand and would false-positive on normal gift copy).
const BANNED_WORDS = [];
const scanBanned = (file, text) => {
  for (const { re, label } of BANNED_WORDS) {
    if (re.test(text)) err(file, `banned word ${label} - say the specific thing instead (see SEO.md)`);
  }
};

// affiliate-link policy: links to these retailer/affiliate domains ship BARE
// (no referral/tracking code) unless the program is confirmed to allow a code
// in a content context, in which case the exact link goes on APPROVED_REFERRAL.
// catches a stray referral code (e.g. an unapproved Amazon associates tag)
// before it ships. keep AFFILIATE_DOMAINS in sync with the isAffiliate regex in
// lib/content.ts. (see CLAUDE.md)
const AFFILIATE_DOMAINS = ["amazon.com", "amzn.to", "amzn.com"];
const APPROVED_REFERRAL = []; // none yet - links ship BARE. add e.g. an Amazon
// associates tag ("amazon.com/...?tag=findshq-20") here once the program is
// confirmed and the tag is live, and keep it in sync with lib/content.ts.
const extractUrls = (text) => [
  ...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g),   // markdown links
  ...text.matchAll(/href="(https?:\/\/[^"]+)"/g),     // raw <a> tags
].map((m) => m[1]);

// tagSlug must match lib/slug.ts
const tagSlug = (t) => t.trim().toLowerCase().replace(/\s+/g, "-");

// --- content files -------------------------------------------------------
const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
const usedTags = new Set();

for (const file of files) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  const { data: fm, content } = parseFm(raw);

  // title length (seoTitle overrides title for the <title> tag)
  const effTitle = (fm.seoTitle || fm.title || "").toString();
  if (effTitle.length > TITLE_MAX) {
    err(file, `title too long: ${effTitle.length} chars (max ${TITLE_MAX}; rendered would be ${effTitle.length + SITE_SUFFIX.length})`);
  }
  if (effTitle.length + SITE_SUFFIX.length < TITLE_MIN_RENDERED) {
    err(file, `title too short: rendered "${effTitle}${SITE_SUFFIX}" is ${effTitle.length + SITE_SUFFIX.length} chars (< ${TITLE_MIN_RENDERED}). add a descriptive seoTitle.`);
  }

  // description length (every routable page should have one in 120-160)
  const desc = (fm.description || "").toString();
  if (!desc) {
    warn(file, "no meta description");
  } else if (desc.length < DESC_MIN || desc.length > DESC_MAX) {
    err(file, `description ${desc.length} chars (must be ${DESC_MIN}-${DESC_MAX})`);
  }

  // image alt text
  if (EMPTY_ALT_IMG.test(content)) {
    err(file, "inline image with empty alt text `![](...)` - alt must describe the image");
  }

  // brand rules
  if (EM_EN_DASH.test(raw)) err(file, "contains an em/en dash - use a hyphen");
  if (EMOJI.test(raw)) err(file, "contains an emoji - none allowed");
  scanBanned(file, raw);

  // external/affiliate link policy: affiliate-domain links must be bare unless approved
  for (const u of extractUrls(raw)) {
    const isAffiliate = AFFILIATE_DOMAINS.some((d) => u.includes(d));
    if (isAffiliate && u.includes("?") && !APPROVED_REFERRAL.some((a) => u.includes(a))) {
      err(file, `affiliate link "${u}" carries a referral/query code that isn't approved - ship it bare (no code) unless the program allows one on blogs, then add it to APPROVED_REFERRAL in scripts/seo-check.mjs (see CLAUDE.md)`);
    }
  }

  // collect tags for hub-coverage check - ONLY from posts (note|gear). tag
  // archive pages are generated from post tags only (see lib/content getAllTags),
  // so tags that appear solely on type:page files don't get a /tags/<x> route.
  const isPost = fm.type === "note" || fm.type === "gear" || fm.type === "log";
  if (isPost) for (const t of fm.tags || []) usedTags.add(tagSlug(t));
}

// --- config/site.ts description -----------------------------------------
if (!SITE_SRC) {
  warn("config/site.ts", "not found");
} else {
  scanBanned("config/site.ts", SITE_SRC);
  const m = SITE_SRC.match(/description:\s*\n?\s*"([^"]+)"/);
  if (m) {
    const d = m[1];
    if (d.length < DESC_MIN || d.length > DESC_MAX) {
      err("config/site.ts", `homepage description ${d.length} chars (must be ${DESC_MIN}-${DESC_MAX})`);
    }
  } else {
    warn("config/site.ts", "could not find site.description to length-check");
  }
}

// --- tag hub coverage + tag-meta data ------------------------------------
let tagMetaSrc = "";
try {
  tagMetaSrc = fs.readFileSync(path.join(ROOT, "lib", "tag-meta.ts"), "utf8");
} catch {
  warn("lib/tag-meta.ts", "not found - tag hubs will have no intro copy or titles");
}
if (tagMetaSrc) {
  scanBanned("lib/tag-meta.ts", tagMetaSrc);
  for (const slug of [...usedTags].sort()) {
    const key = `"${slug}":`;
    if (!tagMetaSrc.includes(key)) err("lib/tag-meta.ts", `TAG_META missing an entry for tag "${slug}" (title + description)`);
  }
  // validate the lengths inside TAG_META
  const re = /"([a-z0-9-]+)":\s*\{\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(tagMetaSrc))) {
    const [, slug, title, description] = m;
    if (title.length > TITLE_MAX) err("lib/tag-meta.ts", `tag "${slug}" title ${title.length} chars (max ${TITLE_MAX})`);
    if (description.length < DESC_MIN || description.length > DESC_MAX) err("lib/tag-meta.ts", `tag "${slug}" description ${description.length} chars (must be ${DESC_MIN}-${DESC_MAX})`);
  }
}

// --- report --------------------------------------------------------------
if (warnings.length) {
  console.log(`\nseo-check: ${warnings.length} warning(s)`);
  console.log(warnings.join("\n"));
}
if (errors.length) {
  console.log(`\nseo-check: ${errors.length} error(s)`);
  console.log(errors.join("\n"));
  console.log("\nfix the errors above (see SEO.md for the rules), then re-run `npm run seo-check`.\n");
  process.exit(1);
}
console.log(`\nseo-check: clean. ${files.length} content files pass title/description/alt/brand/tag-hub checks.\n`);
