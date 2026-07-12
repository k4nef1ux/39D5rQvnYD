"use client";

// components/ReadingProgress.tsx - thin phosphor bar at the very top that fills
// as you scroll a post. Pure transform (scaleX) so it's GPU-composited: no
// layout, no reflow, no perf cost.
import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    calc();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="readprog"
      aria-hidden="true"
      style={{ transform: `scaleX(${p})` }}
    />
  );
}
