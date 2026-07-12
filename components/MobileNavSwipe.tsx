"use client";

// components/MobileNavSwipe.tsx - mobile-only horizontal swipe between the top
// sections, to an explicit model:
//   forward  (swipe left)  : home -> notes -> gear -> home (wraps, about excluded)
//   backward (swipe right) : step toward home; AT home, open the menu instead of
//                            wrapping (it does not slide further).
// Only acts on the section pages themselves; posts (PostSwipe), tag archives
// (KeyEdges), the hero slider, modals and form fields are all left alone.
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { NavItem } from "@/config/site";

const DIST = 60;
const RATIO = 1.5;

export default function MobileNavSwipe({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // the cycle is the top sections WITHOUT sub-pages (home/notes/gear); about
    // has children (legal pages) and is intentionally left out of swipe nav.
    const cycle = items.filter((i) => !i.children).map((i) => i.href);
    const idx = cycle.indexOf(pathname);
    if (idx === -1) return; // not a section page -> leave swipe to other handlers

    let sx = 0,
      sy = 0,
      ok = false;
    const onStart = (e: TouchEvent) => {
      const t = e.target as Element | null;
      if (
        e.touches.length !== 1 ||
        (t && t.closest && t.closest('.hero, .cmdk, [aria-modal="true"], input, textarea, select'))
      ) {
        ok = false;
        return;
      }
      ok = true;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (!ok) return;
      ok = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) < DIST || Math.abs(dx) < Math.abs(dy) * RATIO) return;
      // if the left drawer is open, any swipe just closes it (no navigation)
      if (document.documentElement.classList.contains("drawer-open")) {
        window.dispatchEvent(new CustomEvent("findshq:close-menu"));
        return;
      }
      if (dx < 0) {
        // forward: next section, wrapping
        router.push(cycle[(idx + 1) % cycle.length]);
      } else {
        // back: previous section; at home, open the menu instead of wrapping
        if (idx === 0) window.dispatchEvent(new CustomEvent("findshq:open-menu"));
        else router.push(cycle[idx - 1]);
      }
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [items, pathname, router]);

  return null;
}
