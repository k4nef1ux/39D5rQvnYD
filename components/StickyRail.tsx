"use client";

// Wraps the sidebar in a natively-sticky <aside>. The browser does all the
// scrolling (no scroll listener, no jank); JS only measures and sets the right
// `top`. When the rail fits the viewport it sticks to the top (top:92px) and
// stays beside the content. When it's TALLER than the viewport, `top` goes
// negative so it sticks with its BOTTOM resting at the viewport bottom - i.e.
// it scrolls with you, then pins so the lower modules stay visible, instead of
// freezing the top. Recomputed on rail/viewport resize only.
import { useRef, useEffect, type ReactNode } from "react";

const HEADER = 92; // sticky offset below the fixed header
const GAP = 24; // breathing room at top/bottom

export default function StickyRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const vh = window.innerHeight;
      const railH = el.scrollHeight;
      const top =
        railH + HEADER + GAP <= vh ? HEADER : Math.min(HEADER, vh - railH - GAP);
      el.style.setProperty("--rail-top", `${Math.round(top)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <aside ref={ref} className="rail" aria-label="secondary">
      {children}
    </aside>
  );
}
