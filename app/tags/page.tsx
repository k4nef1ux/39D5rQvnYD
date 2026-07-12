// app/tags/page.tsx - overview of every tag, sized by frequency.
import type { Metadata } from "next";
import {
  getAllTags,
  getFeaturedPosts,
  getRandomPosts,
  getLatestPosts,
} from "@/lib/content";
import { site } from "@/config/site";
import Sidebar from "@/components/Sidebar";
import TagCloud from "@/components/TagCloud";

export const metadata: Metadata = {
  title: "browse the notes by topic and tag",
  description: "browse findshq gifts by category and interest - for him, for her, friends, work, occasions, hobbies, and more. every gift lane, sized by how many finds it holds.",
  alternates: { canonical: "/tags" },
};

export default async function TagsIndex() {
  const [tags, featured, latest] = await Promise.all([
    getAllTags(),
    getFeaturedPosts(site.sidebar.topCount),
    getLatestPosts(site.sidebar.latestCount),
  ]);
  const random = await getRandomPosts(
    site.sidebar.randomCount,
    [...featured, ...latest].map((p) => p.slug)
  );

  return (
    <div className="layout layout-index">
      <div className="layout-main">
        <div className="page-tag">findshq &nbsp;//&nbsp; tags</div>
        <h1 className="page-title">tags</h1>
        <p className="lede page-lede">
          {tags.length} {tags.length === 1 ? "tag" : "tags"} across the log entries.
        </p>
        {tags.length > 0 ? (
          <TagCloud tags={tags} />
        ) : (
          <p className="card-desc">no tags yet.</p>
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
