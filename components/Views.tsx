"use client";

// components/Views.tsx - per-post view count for the meta row. Reads the count
// via the batched reader and increments once per browser session (sessionStorage
// guard). Renders "·" until loaded so there's no layout shift.
import { useEffect, useState } from "react";
import { readStats, post } from "@/components/engage-batch";

export default function Views({ slug }: { slug: string }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let on = true;
    readStats(slug).then((s) => on && setN(s.views));
    const key = "viewed:" + slug;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      post(slug, "view").then((d) => {
        if (on && d && typeof d.views === "number") setN(d.views);
      });
    }
    return () => {
      on = false;
    };
  }, [slug]);

  return <span>{n == null ? "·" : n.toLocaleString()} views</span>;
}
