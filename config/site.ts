// config/site.ts
// SINGLE SOURCE OF TRUTH for site metadata + navigation.
// Add a nav item here (or set `nav: true` in a content markdown file) and the
// menu updates everywhere. Nothing else needs editing.

export type NavItem = {
  label: string;
  href: string;
  order: number;
  // optional sub-nav (e.g. the legal/trust pages nested under "about")
  children?: NavItem[];
};

export type SiteConfig = {
  name: string;
  domain: string;
  url: string;
  title: string;
  description: string;
  tagline: string;
  footerEcho: string;
  // how many posts the homepage "latest" section shows
  latestCount: number;
  // sidebar module sizes + how many article slides ride in the hero slider
  sidebar: { topCount: number; randomCount: number; latestCount: number; tagCount: number };
  heroSlides: number;
  // initial batch + per-step reveal for the infinite feed
  feed: { initial: number; step: number };
  // author + locale (used in metadata, RSS, JSON-LD)
  author: string;
  locale: string;
  // analytics - GA4 measurement id + Microsoft Clarity project id + Ahrefs Web
  // Analytics data-key (empty disables each). Blank until findshq has its OWN
  // properties - never inherit q1rk's ids.
  analytics: { gaId: string; clarityId: string; ahrefsKey: string };
  // --- identity copy: edit here to reshape what the site is about ---
  // headline shown on the default social/OG share card
  ogHeadline: { lead: string; accent: string };
  // one-line intro at the top of /llms.txt
  llmsIntro: string;
  // static nav defined once; merged with content pages flagged nav:true
  nav: NavItem[];
  // outward links - kept sparse by design (privacy default). Empty for now.
  links: { label: string; href: string }[];
};

export const site: SiteConfig = {
  name: "findshq",
  domain: "findshq.com",
  url: "https://findshq.com",
  title: "findshq - gifts worth giving",
  description:
    "hand-picked gifts that look and feel expensive - vetted against real owner reviews and sorted for him, for her, for them, and every occasion.",
  tagline: "gifts worth giving.",
  footerEcho: "found. vetted. worth giving.",
  latestCount: 6,
  sidebar: { topCount: 4, randomCount: 4, latestCount: 4, tagCount: 12 },
  heroSlides: 3,
  feed: { initial: 8, step: 8 },
  author: "findshq",
  locale: "en_US",
  // blank - findshq gets its own analytics properties later. do NOT paste q1rk's.
  analytics: { gaId: "", clarityId: "", ahrefsKey: "" },
  ogHeadline: { lead: "gifts worth", accent: "giving." },
  llmsIntro:
    "Hand-picked gifts, vetted against real owner reviews. A gift for him, for her, for them, and every occasion.",
  nav: [
    { label: "for him", href: "/tags/for-him", order: 2 },
    { label: "for her", href: "/tags/for-her", order: 3 },
    { label: "for them", href: "/tags/for-them", order: 4 },
    { label: "occasions", href: "/tags/occasions", order: 5 },
    { label: "hobbies", href: "/tags/hobbies", order: 6 },
    // `about` is a content page flagged nav:true - it merges in automatically.
  ],
  links: [],
};
