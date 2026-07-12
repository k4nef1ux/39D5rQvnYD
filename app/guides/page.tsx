// app/guides/page.tsx - the guides index. All type:note posts (vetted
// roundups), newest first, in the main column beside the shared sidebar.
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
  title: "the gift guides - vetted, cuts included",
  description: "the findshq gift guides: vetted roundups sorted by who it is for and the occasion. every list shows what got cut and why - no filler, no ads in disguise.",
  alternates: { canonical: "/guides" },
};

export default async function NotesIndex() {
  const [posts, featured, latest, tags] = await Promise.all([
    getPostsByType("note"),
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
        <div className="page-tag">findshq &nbsp;//&nbsp; guides</div>
        <h1 className="page-title">#guides</h1>
        <p className="lede page-lede">
          vetted roundups, sorted by who it is for. every list shows its cuts
          and the reasons - a list that never cuts anything is an ad.
        </p>
        {posts.length === 0 ? (
          <p className="card-desc">no guides yet - the first ones are in vetting.</p>
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
            }))}
            initial={site.feed.initial}
            step={site.feed.step}
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
