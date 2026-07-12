# SEO.md - the on-page SEO + audit playbook (parent-site template)

This site is a **template meant to be cloned** for sibling projects. This doc is
the single source of truth for the SEO conventions baked into the code, so a
clone never has to rediscover "why is this title flagged" or "why is an alt
missing". Pair it with `CLAUDE.md` (app context) and `HANDOVER.md` (current
state). Not served to the site.

Run **`npm run seo-check`** before publishing. It enforces most of the rules
below and exits non-zero on violations (`scripts/seo-check.mjs`).

---

## 1. The hard rules (enforced by `npm run seo-check`)

**Titles.** The layout renders `<title>` as `%s - <site name>` (the name is
appended automatically). So:
- frontmatter `title` (or `seoTitle`) must be **<= 53 chars** (rendered `<title>`
  stays <= 60).
- rendered `<title>` must be **>= 30 chars**. Bare titles like `about`, `tags`,
  `#ai` get flagged "too short" by audit tools. Fix with a descriptive
  `seoTitle` (see rule below) - do NOT pad the visible `<h1>`.

**Meta descriptions.** **120-160 chars**, everywhere there's a routable page:
- post/page frontmatter `description`
- `config/site.ts` `description` (the homepage + default)
- every tag's `description` in `lib/tag-meta.ts`
Too short (Ahrefs flags < ~110) and too long both hurt. The checker enforces
120-160.

**Image alt text.**
- Cover/lead images render with `alt={post.title}` automatically in the
  components (`PostCard`, `HeroSlider`) - you don't manage those.
- **Inline markdown images are author-controlled.** Always write
  `![real description](/path.webp)`. NEVER `![](/path.webp)` - an empty alt is
  the one way alt goes missing, and the checker fails on it.

**Brand (also SEO-adjacent, and the user cares a lot).**
- no em dashes or en dashes - hyphens only. the linter rejects both glyphs.
- no emoji anywhere.
- lowercase prose, terse/declarative voice, curiosity over claims.
- **the one-hour bar (editorial, not linted):** a post publishes only if a
  tired reader can execute it tonight in one hour from the post alone - fire
  open (4 sentences max), numbered steps with exact tool + action, a closing
  "your hour" checklist, no walls of text. word count is irrelevant, depth
  and value are critical: one worked example threaded through the post,
  exact how-to (where to click, what to type, what it pays) for every
  instruction, before/after examples over rules.
- **voice inside the bar (editorial):** the narrator is a coach in the room
  (tony robbins energy, never named): paint the reader's future first, then
  command the steps - decision/identity language, two-futures close; full
  conviction about the action, never a promised income outcome; no announcing
  ("let me tell you", "here is the truth") - say the thing, don't introduce it;
  never "buy X" - name the need, give 2-3 popular options with tradeoffs,
  lean one.
- banned words: "honest"/"honestly" - a claim-word that reads as a tell. say the
  specific thing instead (used first, tested, no spin, the misses left in). the
  linter rejects it.

## 2. Thin-content / taxonomy rules

Archive/index pages (tag pages, `/notes`, `/gear`, `/tags`) are the usual "low
word count" culprits. The fix is metadata, NOT visible filler. Do NOT pad these
pages with intro paragraphs to chase a word count - a wall of on-page copy in
front of a list hurts UX and reads as filler. Hiding text for SEO is also out
(Google treats hidden text as spam). Give them a strong `<title>` and meta
description instead, and let the bare list stand. The "low word count" flag on
these is acceptable to ignore (see section 4) - Ahrefs already passes them.

- **Tag pages** (`/tags/<slug>`) pull their `<title>` and meta description from
  `lib/tag-meta.ts`. Every tag used on a post (type note|gear) MUST have a
  `TAG_META[slug]` entry: `{ title, description }` - a keyword-bearing title
  (<= 53 chars) and a 120-160 char meta description. These feed
  `generateMetadata` only; they are NOT rendered as visible body copy.
  `npm run seo-check` fails if a post introduces a tag with no entry.
- **Section indexes** (`/notes`, `/gear`, `/tags`) carry a descriptive metadata
  `title` + a short lede, then the feed. Keep it tight - no padded intro blocks.
- **Legal/utility pages** (`about`, `contact`, `terms`, ...) use the optional
  **`seoTitle`** frontmatter field: a descriptive `<title>` for search while the
  visible `<h1>` stays minimal/on-brand. Plumbed in `lib/content.ts`
  (`Frontmatter.seoTitle`) and `app/[slug]/page.tsx` (`generateMetadata`).

## 3. What the code already gets right (don't regress)

Verified in the live HTML - these are correct, keep them:
- self-referencing `<link rel="canonical">` on every page; `metadataBase` set.
- `<meta name="robots" content="index, follow">`, no `X-Robots-Tag: noindex`.
- valid JSON-LD: `BlogPosting` + `BreadcrumbList` on posts, `WebSite` + `Person`
  site-wide (`app/[slug]/page.tsx`, `app/layout.tsx`).
- `sitemap.xml` with `lastModified`, `robots.txt` allow-all + sitemap + host.
- `301` redirects: `www -> apex` and any renamed slugs (`next.config.mjs`).
- IndexNow ping on changed URLs at `postbuild` (`scripts/indexnow-changed.mjs`).
- fully server-rendered content (no JS needed to read the page or the feed).

## 4. AUDIT NOISE - flags to IGNORE, not "fix"

Third-party crawlers (Ahrefs, Ubersuggest, SE Ranking, ...) raise flags that are
**correct/intentional here**. Acting on these would HARM the site. Hit "ignore
issue" in the tool; do NOT change the code:

| Flag | Why it's noise |
|---|---|
| **3XX redirect** (`http -> https`, `www -> apex`) | Required canonicalization. Removing it splits ranking signals across duplicate hosts. The tool only sees it because it crawled the old variants. |
| **HTTP to HTTPS redirect** | Same - this is correct and mandatory. |
| **Redirected page has no incoming internal links** (homepage) | Crawl-entry quirk. Harmless. |
| **Poorly formatted URL for SEO** on `/about`, `/contact`, `/tags` | The tool wants a keyword in the URL. These are standard utility URLs; renaming them breaks links for zero gain. |
| **Pages to submit to IndexNow** | The `postbuild` script already pings IndexNow on every changed URL. Auto-handled on deploy. |
| **Low word count** on tag/section pages (aggressive tools, e.g. Ubersuggest) | Once `lib/tag-meta.ts` copy is in place, this is an archive page hitting an over-aggressive threshold. Ahrefs (stricter tool) passes them. Acceptable to ignore. |

## 5. on-page is the floor - rankings are won off-page

On-page is necessary but it is not what ranks, and this template already clears
it. If pages are **indexed but rank for nothing**, the work is off-page and out
of the repo. Treat these as the next job, in order of leverage:
- **build backlinks.** a new domain ranks for little until other sites link to
  it. this is #1. earn links from the sibling sites, relevant guest posts, and
  anything that produces a real citation.
- **target winnable keywords.** head terms (`web hosting`, `make money online`)
  are held by high-authority sites. go after the specific long-tail phrases they
  ignore, win those, and climb from there.
- **distribute.** push each post where people already are (social, communities,
  the sibling network) to drive the early traffic and links that compound into
  rankings.

ship great on-page (this doc), then go earn the links and put the work in front
of people. that is the next move, not a footnote.

## 6. Per-clone checklist (spinning this up on a new repo)

When you replicate this template for a new site, do all of these, then run
`npm run seo-check && npm run build`:

1. **`config/site.ts`** - set `name`, `domain`, `url`, `title`, `description`
   (120-160 chars!), `author`, `analytics` ids, `ogHeadline`. (The seo-check
   suffix and sitemap/robots/canonical all derive from `url`/`name` here.)
2. **`scripts/indexnow-changed.mjs`** - update `KEY` and `HOST`, and replace the
   IndexNow key file in `public/<key>.txt` (filename + contents = the key).
3. **`next.config.mjs`** - update the `www -> apex` redirect host value, the CSP
   if you add third-party tags, and remove the old slug-rename 301s (they're
   parent-specific).
4. **`lib/tag-meta.ts`** - rewrite `TAG_META` + `TAG_BLURB2` for the tags this
   site actually uses. `seo-check` fails until every post tag has hub copy.
5. **content** - each post: `title` <= 53, `description` 120-160, real alt text
   on every inline image, no dashes/emoji.
6. **Search Console / Bing Webmaster** - verify the property, submit
   `https://<domain>/sitemap.xml`, and request indexing on a few key URLs.
7. Run **`npm run seo-check`** (must be clean) and **`npm run build`** (must pass)
   before the first deploy.
