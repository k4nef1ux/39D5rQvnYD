# CLAUDE.md - findshq.com

Project context for any Claude Code session (desktop or claude.ai/code). This
file lives at the repo root and is **never served to the site** (not a route,
not in `public/`), so visitors can't see it - only people with repo access.

## What this is
**findshq.com** - a dark, warm **gift-affiliate site**: cool finds and wholesome
gifts, hand-picked **for him / for her / for them / occasions / hobbies**. Each
gift is a product that links out to a retailer (amazon etc.); findshq earns via
affiliate programs. The tagline is **"gifts worth giving."**

findshq was **cloned from a sibling site, q1rk.com** (a dark matrix/terminal
blog) and re-themed. It reuses q1rk's Next.js 15 App Router engine but is a
**different brand** - warm and inviting, not terminal/CRT. When you see leftover
q1rk naming (e.g. the css token `--phos`, the package `name: "q1rk"`, `/gear`
`/notes` route folders), treat it as a holdover from the clone, not intent.

Portfolio context: siblings are q1rk.com (blog), q1rkify.com (Shopify),
umxwu.com (agency). **Git holds only the running site + seeded content** - keep
it clean. See **HANDOVER.md** for current state.

## Stack & hosting
- **Next.js 15 App Router**, TypeScript, React 19.
- **Server mode** (`next start`) on **Hostinger** - NOT static export
  (`output:'export'` caused NoFallbackError on the parent). API routes work.
- Git: `git@github.com:k4nef1ux/39D5rQvnYD.git`, dev branch
  **`claude/gifts-site-dark-theme-bdd546`**.
- **Pushing auto-deploys** (Hostinger redeploys on push, ~2 min). Working norm:
  build -> verify -> push. Node >= 18.18. `npm run build` / `npm run start`
  (port 3000).

## Non-negotiable brand rules (consistency matters a LOT)
- **lowercase** for `findshq`, nav, labels, most UI text.
- **No em dashes - hyphens only.** Everywhere (content + UI).
- **No emoji** anywhere in the product.
- Warm, friendly, inviting voice. Sentence/lowercase case, terse, plain english.
- Copy is helpful and human - describe the gift, who it's for, what to know
  before buying. Curiosity and warmth over hype; don't over-promise.
- Palette: warm near-black `--void` (`#0c0b08`) ground, scroll-stopping
  **yellow accent `--phos` (`#ffcf1a`)**. NOTE: the token is still named `--phos`
  (a holdover from q1rk's phosphor green) but is now repointed to yellow - leave
  the name, change only the value if retuning. Tokens live in
  `app/globals.css :root`.
- **The scroll-stopper device:** product images sit on **bright yellow tiles**
  (like youtube thumbnails) against the dark ground - that yellow-on-dark
  contrast is the visual signature. Keep it.
- Atmosphere via subtle **static CSS only** (grain, vignette, glass surfaces,
  gradient hairlines, card hover wash). **No continuous canvas/JS animations** -
  they tank performance; everything is static or composited (opacity/transform/
  filter) and reduced-motion-gated.

## Theme tokens
Tokens live in `app/globals.css :root` (one file, all styling). Warm near-black
`--void #0c0b08`, yellow `--phos #ffcf1a`, plus glass/elevation/edge/glow/ease
helper tokens carried over from the clone. Fonts: a serif display + a mono/body
pairing loaded in `app/layout.tsx` with `display:"optional"` and metric-matched
fallback faces (see Performance).

## Content model (gifts + notes + pages)
Content is markdown in `/content/*.md`, parsed in `lib/content.ts`
(gray-matter + remark/rehype: gfm, slug, autolink-headings; reading time; TOC).
Three `type`s:

- **`gift`** - a product with a review body. Frontmatter carries commerce fields:
  `price`, `buyUrl` (the outbound retailer link), `merchant` (e.g. amazon),
  `category` (for him/her/them/etc), `rating`. Body = why it makes a good gift,
  who it's for, what to know before buying, a short verdict.
- **`note`** - gift guides / roundups (editorial, no single product).
- **`page`** - about + legal/trust pages.

Frontmatter fields: `title, slug, type (gift|note|page), category, date,
description, tags, featured, cover, draft`, plus gift commerce fields
`price, buyUrl, merchant, rating`, and `sponsored` (surfaces a visible
"sponsored" disclosure). `draft: true` hides a post in production.

**Categories are TAGS.** for him / for her / for them / occasions / hobbies are
implemented as tags -> `/tags/[tag]` pages; the nav links to `/tags/for-him`
etc. (see `config/site.ts nav`). There is no separate "category" route.

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
  the rel-injection regex in `content.ts` was inherited from q1rk and currently
  matches the parent's affiliate domains - if outbound `buyUrl` retailers aren't
  getting `rel="sponsored"`, extend that regex to cover `amazon.com`/`amzn.*`
  (and keep the CSP + seo-check domain lists in sync).

## Performance is a hard requirement (keep Lighthouse mobile high)
q1rk held ~99 mobile / 100 desktop; hold the same bar. Rules:
- Third-party / non-critical work loads **deferred / after paint**.
- **GA4, Microsoft Clarity, Ahrefs** load via `next/script` `lazyOnload`, **and
  only after opt-in consent** (`components/Analytics.tsx`, gated on
  `lib/consent`). Ids live in `config/site.ts analytics` and are **BLANK** for
  findshq until it has its OWN GA4/Clarity/Ahrefs properties - **never inherit
  q1rk's ids**. Empty id disables each tag (costs the budget nothing). New
  third-party tag -> also extend the CSP in `next.config.mjs`.
- The newsletter (Hostinger Reach) is a same-origin iframe, lazy-loaded on
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
- **Pages**: `/` (hero slider + feed + sidebar), type indexes, `/tags` +
  `/tags/[tag]` (the category hubs), `/about`. Post and index shells mirror the
  home layout so content left-edges align with the nav logo across pages.
- **SEO/distribution**: `sitemap.ts`, `robots.ts`, `feed.xml`, `opengraph-image`
  (default + per-post), `llms.txt`, JSON-LD, canonical. Gifts/posts get
  structured data + breadcrumbs. A host-canonical 301 redirect + IndexNow ping
  (`scripts/indexnow-changed.mjs` on `postbuild`) live in `next.config.mjs` /
  `scripts`. `config/site.ts` drives all the identity copy (title, OG headline,
  llms intro).
- **Security**: CSP + headers in `next.config.mjs`. HTML served
  `Cache-Control: public, max-age=0, must-revalidate` (no `s-maxage` - the
  Hostinger CDN must not cache HTML referencing hashed chunks a later deploy
  deletes). `/_next/*` stays immutable.

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
- **Env** (set in Hostinger hPanel, NOT git): `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`.

## Key components
- `components/HeroSlider.tsx` - grid-stacked slides (band = tallest slide),
  drag + keyboard + dots/arrows, each slide fully click-through. Latest gifts as
  slides. A `sponsored` gift surfaces a plain "sponsored" disclosure.
- `components/PostCard.tsx` - card with an overlay-link so the whole card is
  clickable while inner Engage controls stay interactive. Product image rides on
  the yellow tile.
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
  `lib/consent.ts` - consent-gated analytics loading.
- `components/ReachSignup.tsx` - lazy same-origin newsletter iframe.

## Working agreements
- Confirm before anything irreversible. Norm: change -> build -> verify -> push
  (which deploys).
- Verify visually for UI changes - especially the yellow-tile contrast, brand
  lowercase, and no-dash/no-emoji rules.
- Run `npm run seo-check` + `npm run typecheck` before publishing/pushing.
- Commit messages: imperative, explain the *why*.
