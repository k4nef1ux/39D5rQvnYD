"use client";

// components/KeyboardNav.tsx - top-level section cycle for the keyboard. On the
// home + section pages, Left/Right step through the nav in order and wrap
// (home -> notes -> gear -> about -> home, and back the other way). On any
// other route it renders nothing, so Left/Right fall through to that page's own
// handler (posts -> newer/older, tag archives -> adjacent tag).
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/site";
import KeyEdges from "@/components/KeyEdges";

export default function KeyboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const cycle = items.map((i) => i.href);
  const idx = cycle.indexOf(pathname);
  if (idx === -1) return null;
  const n = cycle.length;
  if (n < 2) return null;
  // keyboard only here (full nav cycle incl. about). Mobile swipe between
  // sections has its own model and lives in MobileNavSwipe.
  return (
    <KeyEdges
      leftHref={cycle[(idx - 1 + n) % n]}
      rightHref={cycle[(idx + 1) % n]}
    />
  );
}
