# CLAUDE.md - findshq.com

Project context for any Claude Code session (desktop or claude.ai/code). This
file lives at the repo root and is **never served to the site** (not a route,
not in `public/`), so visitors can't see it - only people with repo access.

## What this is
**findshq.com** - a **gift-affiliate site** styled as a private showroom:
hand-picked gifts presented like pieces in a case, sorted **for her / for him /
for mom / for dad / occasions / hobbies / under $50**. Each gift is a product
that links out to a retailer (amazon etc.); findshq earns via affiliate
programs. The tagline is
**"gifts worth giving."**

The look is **modern, futuristic, ultra-wealthy minimalist**: cold obsidian
ground, porcelain text, one champagne-metal accent used like actual metal trim,
and a feed that is ONE column of large product images (9gag-scale cards, luxury
dress). The recurring signature is **"the plaque"** - a gold-hairline-topped
bar with the serif title left and the champagne mono price right - on the hero
feature, every stream card, and the gift page's buy bar.

findshq was **cloned from a sibling blog site** (dark, terminal-flavored) and
fully re-themed. It reuses the parent's Next.js 15 App Router engine but is
a **different brand**. When you see leftover parent naming (e.g. the css
token `--phos`, the `note` content type rendered as "guide"), treat it as a
holdover from the clone, not intent. The index routes are findshq's own:
`/allfinds` (every gift) and `/guides` (every roundup); `/gear` and `/notes`
301 to them.

**Git holds only the running site + seeded content** - keep it clean. Brand
names of sibling sites stay OUT of this repo (owner rule, jul 2026): no
references to the parent blog or the agency by name, anywhere - site, code,
comments, or docs. seo-check enforces it. See **HANDOVER.md** for current
state.

## Stack & hosting
- **Next.js 15 App Router**, TypeScript, React 19.
- Hosted on **Vercel** (owner, jul 2026) - NOT static export
  (`output:'export'` caused NoFallbackError on the parent). API routes work.
  `npm run start` still serves the production build locally for verification.
- Git: this repo's `origin`, branch **`main`** (default).
  Working norm: build -> verify -> push straight to `main`. (The old "5 minute
  offers" static site that previously lived on main is gone; recoverable at
  commit `d19668c` if ever needed.)
- **Pushing to `main` auto-deploys** (Vercel's git integration builds on
  push). Working norm: build -> verify -> push. Node >= 18.18.
  `npm run build` / `npm run start` (port 3000).

## Non-negotiable brand rules (consistency matters a LOT)
- **lowercase** for `findshq`, nav, labels, most UI text.
- **No em dashes - hyphens only.** Everywhere (content + UI).
- **No emoji** anywhere in the product.
- Voice: quiet confidence, curated, plain english. Sentence/lowercase case,
  terse. Describe the gift, who it's for, what to know before buying. Never
  hype, never fake urgency, never promise an outcome.
- **Review-writing policy (owner + assistant agreement, jul 2026):** the
  narrator is a confident author with taste, but NEVER fabricates first-person
  ownership ("when i unboxed it..." for a product nobody touched). Authority
  comes from research receipts: what owners consistently report, the complaint
  patterns, the detail the product page omits. Fabricated-experience prose is
  the pattern Google's reviews system buries, and one wrong invented detail
  kills reader trust. Author-voiced curation with receipts, always.
- Palette: cold obsidian `--void` (`#08080b`) ground, porcelain `--ink`, and a
  **champagne-metal accent `--phos` (`#d8b47f`)** with `--phos-soft/-deep/-ink`
  companions. NOTE: the token is still named `--phos` (a holdover from the
  parent's phosphor green) - leave the name, change only values if retuning. Tokens live
  in `app/globals.css :root`.
- **The signature device: "the plaque."** Every product image is a vitrine
  (full-bleed image on a lit pedestal - a faint champagne floor-glow), and every
  vitrine carries a plaque: a `--edge-gold` hairline on top, serif title left,
  champagne mono price right. Metal is trim, never a wash: the accent appears
  only on hairlines, prices, labels, and small CTAs. Keep it.
- Atmosphere via subtle **static CSS only** (grain, vignette, glass surfaces,
  gradient hairlines, card hover wash). **No continuous canvas/JS animations** -
  they tank performance; everything is static or composited (opacity/transform/
  filter) and reduced-motion-gated.

## Theme tokens
Tokens live in `app/globals.css :root` (one file, all styling). Cold obsidian
`--void #08080b`, porcelain `--ink #ede9e1`, champagne `--phos #d8b47f` (+
`--phos-soft #ecd6ab`, `--phos-deep #86663c`, `--phos-ink #17110a` for text on
gold fills), plus glass/elevation/edge/glow/ease helpers and **`--edge-gold`**
(the champagne hairline gradient every plaque uses). Fonts: Fraunces (300/400/
500 + italics; the 300 weight is the display voice) + IBM Plex Mono (small,
uppercase, letterspaced = the engraved-plate voice), loaded in `app/layout.tsx`
with `display:"optional"` and metric-matched fallback faces (see Performance).

## Content model (gifts + notes + pages)
Content is markdown in `/content/*.md`, parsed in `lib/content.ts`
(gray-matter + remark/rehype: gfm, slug, autolink-headings; reading time; TOC).
Three `type`s:

- **`gift`** - a product with a review body. Frontmatter carries commerce fields:
  `price`, `buyUrl` (the outbound retailer link), `merchant` (e.g. amazon),
  `category` (the lane it leads with), `rating`. Body = why it makes a good gift,
  who it's for, what to know before buying, a short verdict.
- **`note`** - gift guides / roundups (editorial, no single product). Guides
  carry a `badge` frontmatter field ("7 vetted, 3 cut", "flaws listed") shown
  on the homepage guide cards - keep it a claim the body actually backs up,
  and always include the cuts with reasons: a list that never cuts anything
  reads as an ad.
- **`page`** - about + legal/trust pages.

Frontmatter fields: `title, slug, type (gift|note|page), category, date,
description, tags, featured, cover, draft`, plus gift commerce fields
`price, buyUrl, merchant, rating`, and `sponsored` (surfaces a visible
"sponsored" disclosure). `draft: true` hides a post in production.

**Categories are TAGS.** for her / for him / for mom / for dad / occasions /
hobbies / under $50 are implemented as tags -> `/tags/[tag]` pages; the nav
links to `/tags/for-her` etc. (see `config/site.ts nav`). There is no separate
"category" route. NOTE the under-$50 lane: the tag string is "under 50" so the
hub URL stays clean (`/tags/under-50`); only display labels carry the `$`.
**Category labels must be terms real people search (owner feedback, jul 2026):**
never invent an umbrella label ("for them") when a search-real lane exists
("gifts for friends", "work gifts"). Before adding a lane, check it maps to an
actual query; apply the same test to any new tag, nav label, or page title.
Next lanes to open once content exists to fill them: **for kids**, **for
couples**, **for friends**, **work gifts** (don't ship an empty hub - thin
pages hurt more than a missing lane).

**SEO length discipline:** the layout appends ` - findshq` to every title, so
keep frontmatter `title` short (rendered `<title>` <= 60 chars) and
`description` 120-160 chars. Every cover/inline image needs real `alt` text
(never `![](src)`). `npm run seo-check` enforces title/description length, image
alt, brand (no dashes/emoji), and the affiliate-link rule below, and exits
non-zero on violations. Run it before publishing.

## Affiliate links (default: ship BARE)
Every `gift` links out via `buyUrl` to a retailer. **Links ship bare - no
referral/associate code - by default.** Add a code ONLY once the program is
confirmed to allow it in a content/blog context, then allowlist it:
- Amazon associates tag (e.g. `tag=findshq-20`) goes on the link **and** into
  `APPROVED_REFERRAL` in `scripts/seo-check.mjs` once confirmed. Until then the
  allowlist is empty and links stay bare.
- `scripts/seo-check.mjs` tracks affiliate domains (`amazon.com`, `amzn.to`,
  `amzn.com`) and **fails the build if an affiliate link carries a query/referral
  code that isn't on the allowlist** - so a stray `?tag=` can't ship unapproved.
- `lib/content.ts` auto-adds `target="_blank"` + `rel="sponsored noopener"` to
  affiliate-domain links so attribution is correct even on a bare link. NOTE:
  the rel-injection regex in `content.ts` was inherited from the parent and currently
  matches the parent's affiliate domains - if outbound `buyUrl` retailers aren't
  getting `rel="sponsored"`, extend that regex to cover `amazon.com`/`amzn.*`
  (and keep the CSP + seo-check domain lists in sync).

## Performance is a hard requirement (keep Lighthouse mobile high)
The parent site held ~99 mobile / 100 desktop; hold the same bar. Rules:
- Third-party / non-critical work loads **deferred / after paint**.
- **GA4, Microsoft Clarity, Ahrefs** load via `next/script` `lazyOnload`, **and
  only after opt-in consent** (`components/Analytics.tsx`, gated on
  `lib/consent`). Ids live in `config/site.ts analytics` and are **BLANK** for
  findshq until it has its OWN GA4/Clarity/Ahrefs properties - **never inherit
  the parent site's ids**. Empty id disables each tag (costs the budget nothing). New
  third-party tag -> also extend the CSP in `next.config.mjs`.
- The newsletter (Hostinger Reach - an email product, independent of where
  the site is hosted) is a same-origin iframe, lazy-loaded on
  scroll so it stays out of the audit.
- Engagement counts load after paint via one batched request (see below).
- CSS is inlined (`experimental.inlineCss`); one file `app/globals.css`.
- **Do NOT** re-introduce: a global `app/loading.tsx` (caused CLS), font
  `display:"swap"` (use `"optional"`), or any always-on animation.
- **Fonts:** `display:"optional"` + metric-matched fallback faces (`size-adjust`
  + ascent/descent overrides in `globals.css`, listed first in each `fallback:`
  array in `layout.tsx` with `adjustFontFallback:false`). This adds no swap so
  CLS stays 0. Don't drop the fallback faces or flip `adjustFontFallback` on.
- Re-check after layout/script changes with throttled Lighthouse:
  `npx lighthouse@12 http://localhost:3000/ --form-factor=mobile
  --throttling-method=devtools --only-categories=performance`.

## Architecture
- **Content pipeline**: `/content/*.md` -> `lib/content.ts` (parse, sort, drafts
  hidden in production, reading time, TOC, affiliate rel injection).
- **Config**: `config/site.ts` - single source of truth for site meta, nav
  (the for-him/for-her/... tag links), feed/sidebar/hero counts, author, and the
  (blank) analytics ids.
- **Styling**: one file `app/globals.css` (tokens + all component CSS).
- **Routing**: `app/[slug]/page.tsx` renders every content page;
  `dynamicParams = true` on purpose (under `next start`, `false` throws
  NoFallbackError on unknown paths).
- **Pages**: `/` (niche hero + guides + feed + sidebar), `/allfinds` +
  `/guides` (type indexes, headed "#all finds" / "#guides"), `/tags` +
  `/tags/[tag]` (the category hubs), `/quiz`, `/about` (+ its dropdown:
  privacy-policy, cookie-policy, affiliate-disclosure, terms, contact).
  Nav order is fixed (owner, jul 2026): home, for her, for him, for mom,
  for dad, occasions, hobbies, under $50, all finds, guides, about.
  The ONLY email sitewide is hello@findshq.com. Post and index shells mirror the
  home layout so content left-edges align with the nav logo across pages.
- **SEO/distribution**: `sitemap.ts`, `robots.ts`, `feed.xml`, `opengraph-image`
  (default + per-post), `llms.txt`, JSON-LD, canonical. Gifts/posts get
  structured data + breadcrumbs. A host-canonical 301 redirect + IndexNow ping
  (`scripts/indexnow-changed.mjs` on `postbuild`) live in `next.config.mjs` /
  `scripts`. `config/site.ts` drives all the identity copy (title, OG headline,
  llms intro).
- **Security**: CSP + headers in `next.config.mjs`. HTML served
  `Cache-Control: public, max-age=0, must-revalidate` (no `s-maxage` - the
  CDN must not cache HTML referencing hashed chunks a later deploy deletes;
  Vercel's CDN respects these headers). `/_next/*` stays immutable.

## Engagement (upvotes + views + share)
- **Store**: Upstash Redis (REST, no SDK) via `lib/engage.ts`. Keys
  `views:<slug>`, `votes:<slug>` (plain ints, atomic INCR/DECR, no TTL).
  Degrades to zeros/no-ops if env vars are missing, so the site still runs.
- **API**: `app/api/engage/route.ts` (`force-dynamic`), same-origin so the token
  stays server-side. `GET ?slugs=a,b,c` (batched MGET) +
  `POST {slug, action:"view"|"vote"|"unvote"}`.
- **Client**: `components/engage-batch.ts` collects slugs mounted within ~60ms
  into ONE request, fired after paint. `Engage.tsx` (upvote + share + copy),
  `Views.tsx` (per-post views). Share = X + Threads + copy-link (no Instagram).
- **Env** (set in the Vercel project's Environment Variables, NOT git):
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Key components
- `components/GiftHero.tsx` - the homepage hero (server component, LCP block):
  the hero COMMITS TO ONE NICHE, spoken to specifically (currently "gifts that
  look expensive. under $50.") - the rankable version of the page; swap the
  niche in this component if the site lands on another. Proof line above the
  fold is VETTING-voiced ("we read the one-star reviews first"), never
  fabricated ownership - if products get genuinely bought/tested, the copy can
  and should upgrade to firsthand claims. Beside it: the "find of the week"
  vitrine (first featured GIFT - guides can be featured without stealing the
  hero). There is NO HeroSlider here.
- **Homepage anatomy** (`app/page.tsx`): niche hero -> lane chip row -> "the
  guides" row (latest notes with their `badge` frontmatter - the cut-count/
  flaws-listed trust element; hidden while no notes exist) -> "from the vetting
  file" snippet (one pick + its honest caveat, hand-rotated) -> the stream +
  rail -> charge. Puns live ONLY in newsletter voice + microcopy
  (`ReachSignup` header, quiz lede) - never plastered across the layout.
- `components/GiftQuiz.tsx` + `app/quiz/page.tsx` - the 30-second gift quiz:
  three chip questions, no backend, routes to the lane/tag hub that fits. The
  pinterest/share front door and (once the Reach form exists) the
  email-capture engine.
- `components/PostCard.tsx` - two shapes: the PRODUCT card (vitrine image +
  plaque: title/price head, italic desc, meta + shop foot) used in the
  one-column `.card-stream`, and the editorial card for notes. The card is
  fully clickable while the shop link stays independently interactive.
- `app/[slug]/page.tsx` renders a gift page's **buy bar** (`.post-vitrine`):
  cover image on the pedestal + plaque with price, owner rating, and the
  outbound shop link. `isPost` includes `gift` - gifts get meta/engage/rail/
  prev-next like notes do.
- `components/Sidebar.tsx` / `StickyRail.tsx` / `TagCloud.tsx` - rail modules
  (top/random/latest gifts + tag cloud), sized via `config/site.ts sidebar`.
- `components/InfiniteFeed.tsx` / `NextPostLoader.tsx` - progressive reveal +
  continuous reading (no extra API).
- `components/Search.tsx` + `CommandPalette.tsx` - palette owns Cmd/Ctrl-K, "/"
  and "f"; both match the same full-text haystack (title + description + tags +
  body), so tags/body words are findable, not just titles.
- Keyboard/"gamer" controls (`GameKeys.tsx`, `PostKeys.tsx`, `ShortcutsHelp.tsx`,
  `KeyEdges.tsx`, `PostSwipe.tsx`, `MobileNavSwipe.tsx`) - WASD mirror arrows,
  R = random, H = home, "?" cheat-sheet. Keep `ShortcutsHelp` GROUPS in sync
  with any binding change (it's what users see).
- `components/Analytics.tsx` + `ConsentBanner.tsx` / `ConsentLink.tsx` +
  `lib/consent.ts` - consent-gated analytics loading: GA4 + Clarity (ids in
  `config/site.ts`) + Vercel Analytics (no id - activates by being deployed
  on Vercel; served same-origin from `/_vercel/insights/*`, so it 404s
  harmlessly on local `next start`). ALL analytics ride the same gate so the
  banner's "nothing loads until you allow" promise stays true.
- `components/ReachSignup.tsx` - lazy same-origin newsletter iframe. FORM_URL
  is BLANK (renders nothing) until findshq has its own Hostinger Reach form -
  never reuse the parent site's form id (signups would land in the wrong list).

## Working agreements
- Confirm before anything irreversible. Norm: change -> build -> verify -> push
  (which deploys).
- Verify visually for UI changes - especially the plaque hairlines, champagne
  contrast on obsidian, brand lowercase, and no-dash/no-emoji rules.
- Run `npm run seo-check` + `npm run typecheck` before publishing/pushing.
- Commit messages: imperative, explain the *why*.
