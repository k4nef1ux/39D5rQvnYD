# HANDOVER.md - findshq.com

Start here for a fresh session. This is the "where things stand" doc; the full
reference is **CLAUDE.md**.

## what findshq is
A dark, warm **gift-affiliate site** - cool finds and wholesome gifts, hand-picked
**for him / for her / for them / occasions / hobbies**. Tagline: **"gifts worth
giving."** Each gift links out to a retailer (amazon etc.) via an affiliate link.

## current state (v1)
- **v1 clone of q1rk.com, re-themed** from a dark matrix/terminal blog into a
  dark + **yellow** gift site. Same Next.js 15 App Router engine, different brand.
- Theme repointed: warm near-black `--void #0c0b08` ground, yellow accent
  `--phos #ffcf1a` (token name is a q1rk holdover; value now yellow). Product
  images sit on **bright yellow tiles** against the dark ground - the scroll-
  stopper device.
- **Seeded with sample gifts** only: `content/cloud-soft-weighted-blanket.md`
  and `content/pour-over-coffee-starter-set.md` (placeholder buyUrls, no real
  product photos yet).
- `config/site.ts` reflects the findshq brand (name, title, tagline, nav =
  for-him/for-her/for-them/occasions/hobbies tag links). Analytics ids are
  **blank**.
- Content model, engagement, SEO scripts, keyboard controls, hero/feed/sidebar
  all carried over and working.

## what's done
- Brand + theme swap (dark + yellow, lowercase, no dashes, no emoji).
- Gift content type (`price/buyUrl/merchant/category/rating` frontmatter) +
  two seeded sample gifts.
- Nav wired to the category tag hubs.
- Affiliate discipline in place: links ship **bare**; `scripts/seo-check.mjs`
  fails the build on an unapproved referral/query code on an affiliate domain.
- Analytics blank + consent-gated; performance guards inherited from q1rk.

## what's next
- **Real product photos on yellow tiles** - replace placeholder covers; keep the
  yellow-tile contrast and real `alt` text.
- **Real affiliate links + associate tags** - swap placeholder `buyUrl`s for real
  retailer links (ship bare first). Once Amazon associates is confirmed, add the
  tag (e.g. `tag=findshq-20`) to the links AND to `APPROVED_REFERRAL` in
  `scripts/seo-check.mjs` so the check passes.
- **Connect Hostinger + link the domain** - point findshq.com at the Hostinger
  Node app; set Upstash env vars in hPanel (see below).
- **Own analytics ids** - create findshq's own GA4 / Clarity / Ahrefs properties
  and put the ids in `config/site.ts analytics`. **Never inherit q1rk's ids.**
- More seeded gifts + gift guides (`note` type) to fill out the category hubs.

## stack summary
- Next.js 15 App Router, TypeScript, React 19. Server mode (`next start`) on
  Hostinger - not static export.
- Content = markdown in `/content/*.md`, parsed in `lib/content.ts`.
- Styling = one file `app/globals.css`. Config = `config/site.ts`.
- Engagement = Upstash Redis via `lib/engage.ts`; env vars
  `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set in Hostinger hPanel
  (NOT git); degrades to no-ops if absent.
- Node >= 18.18. Commands: `npm run dev` / `build` / `start` / `seo-check` /
  `typecheck`. Pushing the dev branch auto-deploys (~2 min).

## hard don't-regress rules
- **Brand:** lowercase UI, **hyphens never em dashes**, **no emoji**, warm voice.
- **Keep the yellow-on-dark** tile contrast - it's the visual signature.
- **Links ship bare** until a program confirms a code is allowed; then allowlist
  it in `scripts/seo-check.mjs`. Run `seo-check` before publishing.
- **Analytics ids stay findshq's own** - never paste q1rk's.
- **Performance:** keep Lighthouse mobile high. No always-on animations, no
  global `app/loading.tsx`, keep font `display:"optional"` + metric-matched
  fallbacks, defer all third-party/consent-gated scripts.
- **Env secrets stay in Hostinger hPanel**, never in git.
- Norm: change -> build -> verify (visual + `typecheck` + `seo-check`) -> push.
