// components/TagCloud.tsx - frequency-sized tag cloud. Pure links, on-brand:
// dim by default, phosphor on hover. Size scales with usage count.
import Link from "next/link";
import type { TagCount } from "@/lib/content";

export default function TagCloud({ tags }: { tags: TagCount[] }) {
  if (tags.length === 0) return null;
  const max = Math.max(...tags.map((t) => t.count));
  const min = Math.min(...tags.map((t) => t.count));
  const span = Math.max(1, max - min);

  // map count -> 0.95rem .. 1.4rem
  const sizeFor = (count: number) => {
    const f = (count - min) / span; // 0..1
    return (0.95 + f * 0.45).toFixed(3) + "rem";
  };

  return (
    <div className="tagcloud">
      {tags.map((t) => (
        <Link
          key={t.slug}
          href={`/tags/${t.slug}`}
          className="tagcloud-item"
          style={{ fontSize: sizeFor(t.count) }}
          title={`${t.count} ${t.count === 1 ? "post" : "posts"}`}
        >
          {t.tag}
          <span className="tagcloud-count">{t.count}</span>
        </Link>
      ))}
    </div>
  );
}
