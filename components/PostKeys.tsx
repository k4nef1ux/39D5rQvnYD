"use client";

// components/PostKeys.tsx - post-only keyboard actions for the article you're
// reading. Rendered just on post pages (alongside KeyEdges). Each action drives
// the EXISTING controls so state/UI stay in sync - it clicks the post's Engage
// buttons rather than re-implementing vote/share:
//   space      - 9gag-style: jump to the next (older) post
//   u / l      - upvote the current article (toggles, same as clicking)
//   z / x / c  - share row: z = threads, x = x, c = copy link
// Skips when typing, a modifier is held, or an overlay owns the keyboard.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostKeys({ nextHref }: { nextHref?: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const clickEngage = (selector: string) => {
      const el = document.querySelector<HTMLElement>(`.engage-post ${selector}`);
      el?.click();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      )
        return;
      if (document.querySelector('.cmdk, [aria-modal="true"]')) return;

      // space -> next (older) post
      if (e.key === " " || e.code === "Space") {
        if (!nextHref) return; // last post: leave native scroll alone
        e.preventDefault();
        router.push(nextHref);
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : "";
      if (key === "u" || key === "l") {
        e.preventDefault();
        clickEngage(".upvote");
      } else if (key === "z") {
        e.preventDefault();
        clickEngage('[aria-label="share on threads"]');
      } else if (key === "x") {
        e.preventDefault();
        clickEngage('[aria-label="share on x"]');
      } else if (key === "c") {
        e.preventDefault();
        clickEngage('[aria-label="copy link"]');
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, nextHref]);

  return null;
}
