# HANDOVER.md - findshq.com

Start here for a fresh session. This is the "where things stand" doc; the full
reference is **CLAUDE.md**.

## what findshq is
A **gift-affiliate site styled as a private showroom** - hand-picked gifts
presented like pieces in a case, sorted **for him / for her / for them /
occasions / hobbies**. Tagline: **"gifts worth giving."** Each gift links out
to a retailer (amazon etc.) via an affiliate link (bare by default - see the
affiliate rules in CLAUDE.md).

## current state (v2 - the showroom)
- **v2 rebuild on branch `claude/findshq-domain-strategy-xi034x`**: re-cloned
  from the CURRENT q1rk engine (picks up the OG/twitter PNG card routes, nav
  dropdown, style-check, vz article visuals), the commerce layer ported from
  the v1 scaffold (recoverable at commit `bc5b6c0`), then fully re-themed.
  NOTE: `main` still holds the unrelated "5 minute offers" static site until
  this branch is merged.
- **Theme: modern futuristic ultra-wealthy minimalist.** Cold obsidian
  `--void #08080b`, porcelain `--ink`, champagne-metal accent `--phos #d8b47f`.
  The feed is ONE column of large vitrine cards (image full-bleed on a lit
  pedestal); every product carries **"the plaque"** (gold hairline, serif title
  left, champagne price right). Serif wordmark; `f.` favicon/touch icon
  (generated routes, no binary).
- **Gift pages have a buy bar** (`.post-vitrine`: cover on the pedestal +
  price / owner rating / shop link) and are full posts (meta, engage, rail,
  prev/next). `isPost` includes `gift` now - that was a v1 gap.
- **Seeded with 10 sample gifts** (placeholder amazon buyUrls) + about/legal
  pages, all with AI-generated showroom-style cover images under
  `/public/images/<slug>/cover.webp`. REPLACE the placeholder buyUrls with real
  product links before promoting any page.
- `lib/tag-meta.ts` covers all 31 content tags (seo-check enforces coverage).
- Analytics ids **blank** (never inherit q1rk's); newsletter FORM_URL **blank**
  (create findshq's own Reach form); IndexNow key not configured yet.

## content voice (see CLAUDE.md for the full policy)
Quiet confidence, plain english, lowercase, hyphens only, no emoji. Reviews
are **author-voiced curation with receipts**: what owners consistently report,
never fabricated first-person ownership. Never promise an outcome.

## next steps (in rough order)
1. Real products: swap the 10 placeholder buyUrls for real retailer links,
   re-verify prices/ratings against live listings, regenerate/replace covers
   with real product imagery where programs provide it.
2. Hostinger: point findshq.com at this repo (branch merge -> auto-deploy),
   set `UPSTASH_REDIS_REST_URL/TOKEN` env vars, create the Reach form, add an
   IndexNow key.
3. Own analytics properties (GA4/Clarity/Ahrefs) -> `config/site.ts`.
4. Amazon associates: apply once the site has content; until approved, links
   ship bare (seo-check blocks unapproved referral codes).
5. Content engine: gift guides (`note` type) targeting long-tail gift queries;
   Q4 is the season - pages need to be indexed by september.
6. Throttled Lighthouse pass on the deployed host (hold q1rk's ~99 mobile bar).
