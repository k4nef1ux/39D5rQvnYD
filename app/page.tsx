// app/page.tsx - the landing page. Product-forward hero (find of the week) ->
// category strip -> the stream (infinite product grid) beside the sidebar ->
// closing line.

import type { Metadata } from "next";
import Link from "next/link";
import {
  getLatestPosts,
  getFeaturedPosts,
  getRandomPosts,
  getPostsByType,
  getAllTags,
} from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };
import { site } from "@/config/site";
import GiftHero from "@/components/GiftHero";
import InfiniteFeed from "@/components/InfiniteFeed";
import Sidebar from "@/components/Sidebar";
import MobileDiscover from "@/components/MobileDiscover";
import Reveal from "@/components/Reveal";
import { fmtDate } from "@/components/PostCard";
import type { PostCardData } from "@/components/PostCard";
import type { SidebarPost } from "@/components/Sidebar";

// the lanes, as a quiet pill row under the niche hero (the hero speaks to
// one audience; the chips keep every lane one tap away)
const CATEGORIES = [
  { label: "for her", href: "/tags/for-her" },
  { label: "for him", href: "/tags/for-him" },
  { label: "for mom", href: "/tags/for-mom" },
  { label: "for dad", href: "/tags/for-dad" },
  { label: "occasions", href: "/tags/occasions" },
  { label: "hobbies", href: "/tags/hobbies" },
  { label: "under $50", href: "/tags/under-50" },
];

const toCard = (p: {
  slug: string;
  title: string;
  type: string;
  date?: string;
  updated?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  leadImage?: string;
  category?: string;
  price?: string;
  buyUrl?: string;
  merchant?: string;
  rating?: number;
}): PostCardData => ({
  slug: p.slug,
  title: p.title,
  type: p.type,
  date: p.date,
  updated: p.updated,
  description: p.description,
  tags: p.tags,
  cover: p.leadImage || p.cover,
  category: p.category,
  price: p.price,
  buyUrl: p.buyUrl,
  merchant: p.merchant,
  rating: p.rating,
});

const toRail = (p: {
  slug: string;
  title: string;
  type: string;
  date?: string;
  updated?: string;
}): SidebarPost => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated });

export default async function HomePage() {
  const [allPosts, featured, latest, tags, guides] = await Promise.all([
    getLatestPosts(),
    getFeaturedPosts(site.sidebar.topCount),
    getLatestPosts(site.sidebar.latestCount),
    getAllTags(),
    getPostsByType("note"),
  ]);
  const random = await getRandomPosts(
    site.sidebar.randomCount,
    [...featured, ...latest].map((p) => p.slug)
  );

  // "find of the week" = the first featured GIFT - guides can be featured
  // too (for the rail), but the hero vitrine always shows a product.
  const hero = (featured.find((p) => p.type === "gift") ||
    allPosts.find((p) => p.type === "gift") ||
    allPosts[0]) as (typeof allPosts)[number] | undefined;

  return (
    <div className="home">
      <GiftHero
        find={
          hero
            ? {
                slug: hero.slug,
                title: hero.title,
                description: hero.description,
                price: hero.price,
                category: hero.category,
                cover: hero.leadImage || hero.cover,
              }
            : undefined
        }
      />

      {/* the lanes as pills */}
      <nav className="lane-chips" aria-label="gift lanes">
        {CATEGORIES.map((c) => (
          <a key={c.href} href={c.href} className="lane-chip">
            {c.label}
          </a>
        ))}
      </nav>

      {/* the guides: vetted roundups with the cut-count badge - the trust row.
          Renders only when notes exist, so it can't ship as an empty shelf. */}
      {guides.length > 0 && (
        <section className="guide-row" aria-label="gift guides">
          <div className="feed-head guide-head">
            <span>the guides</span>
          </div>
          <div className="guide-grid">
            {guides.slice(0, 3).map((g) => (
              <Link key={g.slug} href={`/${g.slug}`} className="guide-card">
                {g.badge ? <span className="guide-badge">{g.badge}</span> : null}
                <span className="guide-title">{g.title}</span>
                {g.description ? <span className="guide-desc">{g.description}</span> : null}
                <span className="guide-meta">
                  {fmtDate(g.updated || g.date)} · {g.readingMinutes} min read
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* from the vetting file: one pick, its honest caveat, receipts-voiced.
          Rotate the featured snippet by hand when the catalog turns over. */}
      <section className="vetting" aria-label="from the vetting file">
        <div className="vetting-box">
          <div className="vetting-label">from the vetting file</div>
          <Link href="/cloud-soft-weighted-blanket" className="vetting-title">
            cloud-soft weighted blanket - what the reviews actually say
          </Link>
          <p className="vetting-text">
            pick a weight near ten percent of their body weight - the 15lb fits
            most adults. the cover machine-washes; the insert doesn&apos;t. the
            unhappy owner reviews are the ones that ignored the weight rule.
          </p>
          <div className="vetting-marks">
            <span>one-star reviews read first</span>
            <span>flaws listed, always</span>
          </div>
        </div>
      </section>

      {/* the stream + sidebar */}
      <div className="layout" id="stream">
        <div className="layout-main">
          <div className="feed-head">
            <span>this week&apos;s finds</span>
          </div>

          <InfiniteFeed
            posts={allPosts.map(toCard)}
            initial={site.feed.initial}
            step={site.feed.step}
            layout="stream"
            interludeEvery={4}
            interludes={[
              <MobileDiscover
                key="d1"
                top={featured.map(toRail)}
                tags={tags}
                modules={["top", "tags"]}
              />,
              <MobileDiscover
                key="d2"
                latest={latest.map(toRail)}
                modules={["latest"]}
              />,
              <MobileDiscover
                key="d3"
                random={random.map(toRail)}
                tags={tags}
                modules={["random", "tags"]}
              />,
            ]}
          />
        </div>

        <Sidebar
          top={featured.map(toRail)}
          random={random.map(toRail)}
          latest={latest.map(toRail)}
          tags={tags}
        />
      </div>

      {/* closing line */}
      <Reveal>
        <div className="charge">
          <div className="big">
            we do the <strong>digging.</strong>
            <br />
            you do the <strong>giving.</strong>
          </div>
          <div className="sub">find &nbsp;·&nbsp; give &nbsp;·&nbsp; delight</div>
        </div>
      </Reveal>
    </div>
  );
}
