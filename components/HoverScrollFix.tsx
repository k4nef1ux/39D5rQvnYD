"use client";

// components/HoverScrollFix.tsx - desktop/mouse only. Browsers do NOT recompute
// :hover during a wheel scroll until the mouse physically moves, so the card
// highlight stays stuck on the card that just scrolled away and the card now
// under the cursor stays dark until you nudge the mouse. Toggling pointer-events
// off during the scroll and back on when it settles forces the browser to
// re-hit-test at the cursor's current position - so :hover snaps to the correct
// card on its own. Pure browser behavior, no CSS hover changes, touch untouched.
import { useEffect } from "react";

export default function HoverScrollFix() {
  useEffect(() => {
    if (
      !window.matchMedia ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    let t: number | undefined;
    const onScroll = () => {
      const b = document.body;
      if (b.style.pointerEvents !== "none") b.style.pointerEvents = "none";
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 55);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
      document.body.style.pointerEvents = "";
    };
  }, []);
  return null;
}
