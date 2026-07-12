// components/MobileDiscover.tsx - condensed discovery block for MOBILE only
// (hidden on desktop, which keeps the sticky right rail). Surfaces a chosen set
// of modules (top / latest / random posts, and a tag cloud) inline - on the home
// feed it's sprinkled between posts, on a post page it sits within the
// continuous-reading stream - so phone users keep meeting discovery instead of
// scrolling past an infinite feed.
import Link from "next/link";
import { site } from "@/config/site";
import TagCloud from "@/components/TagCloud";
import { fmtDate } from "@/components/PostCard";
import type { SidebarPost } from "@/components/Sidebar";
import type { TagCount } from "@/lib/content";

type Mod = "top" | "latest" | "random" | "tags";

const HEADINGS: Record<Exclude<Mod, "tags">, string> = {
  top: "top finds",
  latest: "latest",
  random: "worth a look",
};

export default function MobileDiscover({
  top = [],
  latest = [],
  random = [],
  tags = [],
  modules = ["top", "tags"],
}: {
  top?: SidebarPost[];
  latest?: SidebarPost[];
  random?: SidebarPost[];
  tags?: TagCount[];
  modules?: Mod[];
}) {
  const data: Record<Mod, SidebarPost[] | TagCount[]> = { top, latest, random, tags };
  const active = modules.filter((m) => (data[m] as unknown[]).length > 0);
  if (active.length === 0) return null;

  return (
    <aside className="mobile-discover" aria-label="discover">
      {active.map((m) =>
        m === "tags" ? (
          <section className="rail-mod" key="tags">
            <h2 className="rail-head">tags</h2>
            <TagCloud tags={tags.slice(0, site.sidebar.tagCount)} />
            <Link href="/tags" className="rail-more">
              all tags &rarr;
            </Link>
          </section>
        ) : (
          <section className="rail-mod" key={m}>
            <h2 className="rail-head">{HEADINGS[m]}</h2>
            <ul className="rail-list">
              {(data[m] as SidebarPost[]).slice(0, 4).map((p) => (
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
          </section>
        )
      )}
    </aside>
  );
}
