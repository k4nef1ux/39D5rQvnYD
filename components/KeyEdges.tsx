"use client";

// components/KeyEdges.tsx - generic left/right page navigation by keyboard AND
// (optionally) touch swipe. ArrowLeft / swipe-right -> leftHref (previous);
// ArrowRight / swipe-left -> rightHref (next). Up/down and vertical scroll are
// left untouched. Skips when the user is typing, a modifier is held, an overlay
// (command palette / modal) is open, or the gesture/focus is inside a widget
// that owns its own left/right (the hero slider). Renders nothing.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SWIPE_DIST = 60; // min horizontal travel (px) to count as a swipe
const SWIPE_RATIO = 1.5; // horizontal must dominate vertical by this factor

export default function KeyEdges({
  leftHref,
  rightHref,
  swipe = false,
}: {
  leftHref?: string | null;
  rightHref?: string | null;
  // enable horizontal touch-swipe navigation (used on home/section + tag pages;
  // post pages already have PostSwipe, so they leave this off)
  swipe?: boolean;
}) {
  const router = useRouter();

  // shared guard: an open overlay or a self-managing widget owns the gesture
  const blocked = (el: Element | null) =>
    !!document.querySelector('.cmdk, [aria-modal="true"]') ||
    !!(el && el.closest && el.closest(".hero"));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      )
        return;
      if (blocked(t)) return;
      const href = e.key === "ArrowLeft" ? leftHref : rightHref;
      if (!href) return;
      e.preventDefault();
      router.push(href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leftHref, rightHref, router]);

  useEffect(() => {
    if (!swipe) return;
    let sx = 0,
      sy = 0,
      ok = false;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        ok = false;
        return;
      }
      const tgt = e.target as Element | null;
      // ignore gestures inside a field or a widget that owns left/right
      if (
        (tgt && tgt.closest && tgt.closest("input, textarea, select")) ||
        blocked(tgt)
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
      if (Math.abs(dx) < SWIPE_DIST || Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO)
        return;
      const href = dx > 0 ? leftHref : rightHref; // swipe right -> previous
      if (href) router.push(href);
    };
    // passive: we never preventDefault, so native vertical scroll is untouched
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [swipe, leftHref, rightHref, router]);

  return null;
}
