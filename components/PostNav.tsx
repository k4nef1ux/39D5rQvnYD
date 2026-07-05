// components/PostNav.tsx - prev/next links across the chronological post list.
// "newer" (prev) on the left, "older" (next) on the right. Server component.
import Link from "next/link";

export type PostNavItem = { slug: string; title: string } | null;

export default function PostNav({
  prev,
  next,
}: {
  prev: PostNavItem;
  next: PostNavItem;
}) {
  if (!prev && !next) return null;
  return (
    <nav className="postnav" aria-label="post navigation">
      <div className="postnav-side postnav-prev">
        {prev && (
          <Link href={`/${prev.slug}`} className="postnav-link">
            <span className="postnav-dir">&larr; newer</span>
            <span className="postnav-title">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="postnav-side postnav-next">
        {next && (
          <Link href={`/${next.slug}`} className="postnav-link">
            <span className="postnav-dir">older &rarr;</span>
            <span className="postnav-title">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
