// app/notes/page.tsx - field notes index. All type:note posts, newest first,
// in the main column beside the shared sidebar.
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
  title: "field notes on ai, income, and owning your work",
  description: "gift guides and roundups from findshq - the best finds gathered by who they are for and the occasion. hand-picked, no filler.",
  alternates: { canonical: "/notes" },
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
        <div className="page-tag">findshq &nbsp;//&nbsp; notes</div>
        <h1 className="page-title">field notes</h1>
        <p className="lede page-lede">
          patterns in tech, the web, and the machines - read before the room
          catches up.
        </p>
        {posts.length === 0 ? (
          <p className="card-desc">no signal yet.</p>
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
