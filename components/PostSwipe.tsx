"use client";

// components/PostSwipe.tsx - renders the post <article> and lets a horizontal
// touch/pen swipe move to the adjacent post, matching the prev/next arrows:
// swipe right -> newer (prev), swipe left -> older (next). Mouse is ignored
// (desktop uses the links/arrows). `touch-action: pan-y` keeps vertical
// scrolling native; we only act on a clearly-horizontal gesture past a
// threshold, so scrolling up/down is never hijacked.
import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

const DIST = 60; // min horizontal travel (px) to count as a swipe
const RATIO = 1.5; // horizontal must dominate vertical by this factor

export default function PostSwipe({
  className,
  prevSlug,
  nextSlug,
  children,
}: {
  className: string;
  prevSlug: string | null;
  nextSlug: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return; // touch/pen only
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < DIST || Math.abs(dx) < Math.abs(dy) * RATIO) return;
    if (dx < 0 && nextSlug) router.push(`/${nextSlug}`);
    else if (dx > 0 && prevSlug) router.push(`/${prevSlug}`);
  };

  return (
    <article
      className={className}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      {children}
    </article>
  );
}
