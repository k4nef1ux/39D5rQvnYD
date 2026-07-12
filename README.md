# findshq.com

**Gift-affiliate site styled as a private showroom** - hand-picked gifts, sorted
for him / for her / for them / occasions / hobbies. **"gifts worth giving."**

Built on Next.js 15 (App Router), TypeScript, React 19. Runs in **server mode**
on Vercel - not a static export.

For architecture and brand rules see **CLAUDE.md**; for current state and next
steps see **HANDOVER.md**.

## requirements
- Node >= 18.18
- npm

## setup
```bash
git clone <this repo's git url>
cd 39D5rQvnYD
npm install
```

## develop
```bash
npm run dev        # next dev, http://localhost:3000
```

## build + run production
```bash
npm run build      # next build (runs indexnow ping on postbuild)
npm run start      # next start, port 3000
```

## scripts
- `npm run dev` - local dev server.
- `npm run build` - production build. `postbuild` runs
  `scripts/indexnow-changed.mjs` (pings Bing/IndexNow with changed URLs).
- `npm run start` - serve the production build (port 3000).
- `npm run typecheck` - `tsc --noEmit`.
- `npm run seo-check` - enforces title/description lengths, image alt text,
  brand rules (no em dashes / no emoji), and the affiliate-link rule (fails on an
  unapproved referral/query code on an affiliate domain). Run before publishing.

## content
Markdown lives in `/content/*.md`. Types: `gift` (a product with
`price/buyUrl/merchant/category/rating` frontmatter + a review body), `note`
(gift guides / roundups), `page` (about + legal). `draft: true` hides a post in
production. Categories (for him/her/them/occasions/hobbies) are tags ->
`/tags/[tag]`. See CLAUDE.md for the full frontmatter and affiliate-link rules.

## environment variables
Engagement (upvotes/views) uses Upstash Redis. Set these in the Vercel project's env vars
Node app environment (NOT in git). If absent, engagement degrades to no-ops and
the site still builds and runs.

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Analytics ids (GA4 / Clarity / Ahrefs) live in `config/site.ts` and are blank
until findshq has its own properties - never inherit a sibling site's ids.

## deploy (Vercel)
Vercel builds and **redeploys on every push to `main`**.
Working norm: make the change, `npm run build`, verify, then push the dev branch
`claude/gifts-site-dark-theme-bdd546`. HTML is served no-cache while `/_next/*`
stays immutable, so hashed chunks never go stale across deploys.
