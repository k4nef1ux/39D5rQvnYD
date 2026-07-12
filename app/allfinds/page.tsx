// app/allfinds/page.tsx - the "all finds" index: every gift product, newest
// first, in the vitrine stream beside the shared sidebar.
import type { Metadata } from "next";
import {
  getPostsByType,
  getFeaturedPosts,
  getRandomPosts,
  getLatestPosts,
  getAllTags,
} from "@/lib/content";
import { site } from "@/config/site";
import InfiniteFeed from "@/components/InfiniteFeed";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "all the finds",
  description: "every find in one place, newest first - hand-picked gifts for her, for him, for mom, for dad, and every occasion, each vetted against real owner reviews.",
  alternates: { canonical: "/allfinds" },
};

export default async function GearIndex() {
  const [posts, featured, latest, tags] = await Promise.all([
    getPostsByType("gift"),
    getFeaturedPosts(site.sidebar.topCount),
    getLatestPosts(site.sidebar.latestCount),
    getAllTags(),
  ]);
  const random = await getRandomPosts(
    site.sidebar.randomCount,
    [...featured, ...latest].map((p) => p.slug)
  );

  return (
    <div className="layout layout-index">
      <div className="layout-main">
        <div className="page-tag">findshq &nbsp;//&nbsp; finds</div>
        <h1 className="page-title">#all finds</h1>
        <p className="lede page-lede">
          every find, newest first. each one picked slowly and vetted before
          it earned a place here.
        </p>
        {posts.length === 0 ? (
          <p className="card-desc">no finds yet.</p>
        ) : (
          <InfiniteFeed
            posts={posts.map((p) => ({
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
            }))}
            initial={site.feed.initial}
            step={site.feed.step}
            layout="stream"
          />
        )}
      </div>

      <Sidebar
        top={featured.map((p) => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated }))}
        random={random.map((p) => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated }))}
        latest={latest.map((p) => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated }))}
        tags={tags}
      />
    </div>
  );
}
