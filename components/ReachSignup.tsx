"use client";

// components/ReachSignup.tsx - newsletter signup (Hostinger Reach).
// We embed the HOSTED form in a same-origin iframe instead of injecting Reach's
// embed.js into our page. Why: the embed.js (running on q1rk.com) fires an
// "impression" beacon to forms.reach.hostinger.com, which has no CORS header ->
// a console error on our site. Loading the hosted form in an iframe means that
// beacon runs same-origin INSIDE the iframe -> no cross-origin call from q1rk,
// no console error, and no 3rd-party JS/cookie in our top-level context.
// Still lazy (src set only when near the viewport) so it stays off the audit,
// and .signup-inner reserves height so it can't shift layout (CLS).
import { useEffect, useRef, useState } from "react";

const FORM_URL =
  "https://forms.reach.hostinger.com/form/ad0d3248-9fa3-4c4e-a039-a2fd459e3c51";

export default function ReachSignup() {
  const ref = useRef<HTMLElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="signup" aria-label="subscribe" ref={ref}>
      <div className="signup-inner">
        {load ? (
          <iframe
            src={FORM_URL}
            title="subscribe"
            loading="lazy"
            className="signup-frame"
            // force the embedded form to render light UA form controls - on iOS
            // dark mode the input was showing white-on-white typed text
            style={{ colorScheme: "light" }}
          />
        ) : null}
      </div>
    </section>
  );
}
