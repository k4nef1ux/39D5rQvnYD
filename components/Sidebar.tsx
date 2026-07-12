// components/Sidebar.tsx - sticky right rail (server component). Three
// restrained modules: top (featured) posts, latest posts, tag cloud, plus a
// small identity/echo card. No imagery, single accent - same dossier idiom.
import Link from "next/link";
import { site } from "@/config/site";
import TagCloud from "@/components/TagCloud";
import StickyRail from "@/components/StickyRail";
import { fmtDate } from "@/components/PostCard";
import type { TagCount } from "@/lib/content";

export type SidebarPost = {
  slug: string;
  title: string;
  type: string;
  date?: string;
  updated?: string;
};

function PostList({ posts }: { posts: SidebarPost[] }) {
  return (
    <ul className="rail-list">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={`/${p.slug}`} className="rail-item">
            <span className="rail-item-meta">
              <span className="rail-item-type">{p.type}</span>
              {p.updated && p.updated !== p.date ? (
                <span className="rail-item-date">updated {fmtDate(p.updated)}</span>
              ) : p.date ? (
                <span className="rail-item-date">{fmtDate(p.date)}</span>
              ) : null}
            </span>
            <span className="rail-item-title">{p.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar({
  top,
  random,
  latest,
  tags,
}: {
  top: SidebarPost[];
  random: SidebarPost[];
  latest: SidebarPost[];
  tags: TagCount[];
}) {
  return (
    <StickyRail>
      {top.length > 0 && (
        <section className="rail-mod">
          <h2 className="rail-head">top finds</h2>
          <PostList posts={top} />
        </section>
      )}

      {random.length > 0 && (
        <section className="rail-mod">
          <h2 className="rail-head">worth a look</h2>
          <PostList posts={random} />
        </section>
      )}

      {latest.length > 0 && (
        <section className="rail-mod">
          <h2 className="rail-head">latest</h2>
          <PostList posts={latest} />
        </section>
      )}

      {tags.length > 0 && (
        <section className="rail-mod">
          <h2 className="rail-head">tags</h2>
          <TagCloud tags={tags.slice(0, site.sidebar.tagCount)} />
          {tags.length > site.sidebar.tagCount && (
            <Link href="/tags" className="rail-more">
              all tags &rarr;
            </Link>
          )}
        </section>
      )}

      <section className="rail-mod rail-echo">
        <div className="rail-mark">
          finds<span className="one">hq</span>
        </div>
        <p className="rail-echo-line">{site.footerEcho}</p>
      </section>
    </StickyRail>
  );
}
