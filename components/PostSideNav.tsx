// components/PostSideNav.tsx - fixed mid-screen prev/next markers for desktop
// reading. A thin chevron + vertical mono label (no buttons), matching the
// swipe + PostNav direction: left = newer (prev), right = older (next).
// Hidden on small screens (mobile uses swipe).
import Link from "next/link";
import type { PostNavItem } from "@/components/PostNav";

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg className="side-nav-chev" viewBox="0 0 24 24" aria-hidden="true">
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function PostSideNav({
  prev,
  next,
}: {
  prev: PostNavItem;
  next: PostNavItem;
}) {
  if (!prev && !next) return null;
  return (
    <>
      {prev && (
        <Link
          href={`/${prev.slug}`}
          className="side-nav side-nav-prev"
          aria-label={`newer post: ${prev.title}`}
          title={`newer: ${prev.title}`}
        >
          <Chevron dir="left" />
          <span className="side-nav-label">newer</span>
        </Link>
      )}
      {next && (
        <Link
          href={`/${next.slug}`}
          className="side-nav side-nav-next"
          aria-label={`older post: ${next.title}`}
          title={`older: ${next.title}`}
        >
          <Chevron dir="right" />
          <span className="side-nav-label">older</span>
        </Link>
      )}
    </>
  );
}
