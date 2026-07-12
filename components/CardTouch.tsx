"use client";

// components/CardTouch.tsx - touch affordance for the feed cards. The card
// effect (wash + phosphor edge + title glow) is driven by :hover, which is
// unreliable on touch. This drives it explicitly so it FOLLOWS the finger: on
// touch down and on every move, the card under the finger lights up (touch
// events lock their target to the touchstart element, so we hit-test the live
// finger position with elementFromPoint instead). Sticky after lift - mirrors a
// mobile hover - so the last-touched card stays lit until the next touch.
import { useEffect } from "react";

export default function CardTouch() {
  useEffect(() => {
    let current: Element | null = null;
    const lightAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const card = el && el.closest ? el.closest(".card") : null;
      if (card === current) return;
      if (current) current.classList.remove("is-touch");
      current = card;
      if (card) card.classList.add("is-touch");
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0] || e.changedTouches[0];
      if (t) lightAt(t.clientX, t.clientY);
    };
    document.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouch);
      document.removeEventListener("touchmove", onTouch);
    };
  }, []);
  return null;
}
