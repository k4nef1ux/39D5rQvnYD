"use client";

// components/ScrollTop.tsx - "▲ top" control that fades in after you've scrolled
// down. Tiny passive scroll listener; visibility toggled via a class (opacity),
// so it never causes layout shift.
import { useEffect, useState } from "react";

export default function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`scrolltop${show ? " show" : ""}`}
      aria-label="scroll to top"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span className="scrolltop-arrow" aria-hidden="true">
        &#9650;
      </span>
      <span className="scrolltop-label">top</span>
    </button>
  );
}
