"use client";

// components/NextPostLoader.tsx - continuous reading. When the end of the
// current article scrolls into view, the next article appends beneath it, then
// the next, and so on (server passes the ordered `upcoming` array - no API, so
// the static export stays intact). Without JS, nothing appends and the static
// PostNav prev/next links remain the fallback.

import Link from "next/link";
import { displayType } from "@/lib/kind";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { fmtDate } from "@/components/PostCard";
import Engage from "@/components/Engage";
import { tagSlug } from "@/lib/slug";

export type UpcomingPost = {
  slug: string;
  title: string;
  type: string;
  date?: string;
  description?: string;
  tags?: string[];
  html: string;
};

export default function NextPostLoader({
  upcoming,
  interludes,
  interludeEvery = 2,
}: {
  upcoming: UpcomingPost[];
  // mobile-only discovery blocks cycled in after every N appended posts
  interludes?: ReactNode[];
  interludeEvery?: number;
}) {
  const [revealed, setRevealed] = useState(0);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const done = revealed >= upcoming.length;

  useEffect(() => {
    if (done) return;
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed((r) => Math.min(r + 1, upcoming.length));
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [done, revealed, upcoming.length]);

  if (upcoming.length === 0) return null;

  return (
    <div className="nextstream">
      {upcoming.slice(0, revealed).map((p, i) => {
        const n = i + 1;
        const showInterlude =
          interludes && interludes.length > 0 && n % interludeEvery === 0;
        const k = n / interludeEvery - 1;
        return (
        <Fragment key={p.slug}>
        <article className="nextstream-post" aria-label={`next: ${p.title}`}>
          <div className="nextstream-divider">
            <span>continue reading</span>
          </div>
          <div className="page-tag">findshq &nbsp;//&nbsp; {p.type}</div>
          <h2 className="page-title nextstream-title">
            <Link href={`/${p.slug}`}>{p.title}</Link>
          </h2>
          <div className="post-meta">
            <span>{displayType(p.type)}</span>
            {p.date && <span className="dot">·</span>}
            {p.date && <span>{fmtDate(p.date)}</span>}
          </div>
          {p.tags && p.tags.length > 0 && (
            <div className="post-tags">
              {p.tags.map((t) => (
                <Link key={t} href={`/tags/${tagSlug(t)}`} className="chip chip-link">
                  {t}
                </Link>
              ))}
            </div>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
          <Engage slug={p.slug} title={p.title} variant="post" />
        </article>
        {showInterlude && interludes![k % interludes!.length]}
        </Fragment>
        );
      })}

      {!done && (
        <div ref={sentinel} className="nextstream-sentinel" aria-hidden="true">
          <span className="feed-loading">loading next</span>
        </div>
      )}
    </div>
  );
}
