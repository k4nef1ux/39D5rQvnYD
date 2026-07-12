// app/page.tsx - the landing page. Product-forward hero (find of the week) ->
// category strip -> the stream (infinite product grid) beside the sidebar ->
// closing line.

import type { Metadata } from "next";
import {
  getLatestPosts,
  getFeaturedPosts,
  getRandomPosts,
  getAllTags,
} from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };
import { site } from "@/config/site";
import GiftHero from "@/components/GiftHero";
import InfiniteFeed from "@/components/InfiniteFeed";
import Sidebar from "@/components/Sidebar";
import MobileDiscover from "@/components/MobileDiscover";
import Reveal from "@/components/Reveal";
import type { PostCardData } from "@/components/PostCard";
import type { SidebarPost } from "@/components/Sidebar";

const CATEGORIES = [
  { label: "for him", href: "/tags/for-him", note: "gear, grooming, gadgets" },
  { label: "for her", href: "/tags/for-her", note: "jewelry, self-care, cozy" },
  { label: "for friends", href: "/tags/for-friends", note: "cozy, personal, chosen" },
  { label: "work gifts", href: "/tags/work-gifts", note: "coworkers, secret santa" },
  { label: "occasions", href: "/tags/occasions", note: "birthdays, holidays" },
  { label: "hobbies", href: "/tags/hobbies", note: "makers, readers, players" },
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
  const [allPosts, featured, latest, tags] = await Promise.all([
    getLatestPosts(),
    getFeaturedPosts(site.sidebar.topCount),
    getLatestPosts(site.sidebar.latestCount),
    getAllTags(),
  ]);
  const random = await getRandomPosts(
    site.sidebar.randomCount,
    [...featured, ...latest].map((p) => p.slug)
  );

  // "find of the week" = the first featured gift (fall back to newest).
  const hero = (featured[0] || allPosts[0]) as (typeof allPosts)[number] | undefined;

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

      {/* category strip */}
      <nav className="cat-strip" aria-label="gift categories">
        {CATEGORIES.map((c) => (
          <a key={c.href} href={c.href} className="cat-tile">
            <span className="cat-name">{c.label}</span>
            <span className="cat-note">{c.note}</span>
          </a>
        ))}
      </nav>

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
