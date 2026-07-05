"use client";

// components/InfiniteFeed.tsx - progressive "load more on scroll" over a
// server-passed array (no API; keeps the static export intact). Renders an
// initial batch server-side so content exists without JS, then reveals more
// as a sentinel scrolls into view. Terminates cleanly at the end.

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import PostCard, { type PostCardData } from "@/components/PostCard";

export default function InfiniteFeed({
  posts,
  initial,
  step,
  interludes,
  interludeEvery = 5,
  layout = "list",
}: {
  posts: PostCardData[];
  initial: number;
  step: number;
  // mobile-only discovery blocks (hidden on desktop) cycled in after every
  // `interludeEvery` cards, so discovery recurs throughout the feed
  interludes?: ReactNode[];
  interludeEvery?: number;
  // "stream" = the product grid (big yellow tiles); "list" = editorial rows
  layout?: "list" | "stream";
}) {
  const [count, setCount] = useState(Math.min(initial, posts.length));
  const sentinel = useRef<HTMLDivElement | null>(null);
  const done = count >= posts.length;

  useEffect(() => {
    if (done) return;
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCount((c) => Math.min(c + step, posts.length));
        }
      },
      { rootMargin: "240px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [done, step, posts.length]);

  return (
    <div className="feed">
      <div className={layout === "stream" ? "card-stream" : "card-list"}>
        {posts.slice(0, count).map((post, i) => {
          // after every `interludeEvery` cards, drop in the next discovery block
          const n = i + 1;
          const showInterlude =
            interludes && interludes.length > 0 && n % interludeEvery === 0;
          const k = n / interludeEvery - 1;
          return (
            <Fragment key={post.slug}>
              <PostCard post={post} />
              {showInterlude && interludes![k % interludes!.length]}
            </Fragment>
          );
        })}
      </div>

      {!done ? (
        <div ref={sentinel} className="feed-sentinel" aria-hidden="true">
          <span className="feed-loading">loading more</span>
        </div>
      ) : (
        <div className="feed-end">
          <span>- that&apos;s all the finds for now -</span>
        </div>
      )}
    </div>
  );
}
