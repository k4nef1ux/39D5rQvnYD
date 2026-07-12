"use client";

// components/ReachSignup.tsx - newsletter signup (Hostinger Reach).
// We embed the HOSTED form in a same-origin iframe instead of injecting Reach's
// embed.js into our page. Why: the embed.js fires an "impression" beacon to
// forms.reach.hostinger.com, which has no CORS header -> a console error on
// our site. Loading the hosted form in an iframe means that beacon runs
// same-origin INSIDE the iframe -> no console error, and no 3rd-party
// JS/cookie in our top-level context.
// Still lazy (src set only when near the viewport) so it stays off the audit,
// and .signup-inner reserves height so it can't shift layout (CLS).
import { useEffect, useRef, useState } from "react";

// BLANK until findshq has its OWN Reach form (create it in Hostinger Reach,
// paste the hosted-form URL here). Never reuse q1rk's form id - signups would
// land in the wrong list. Empty string = the section doesn't render at all.
const FORM_URL = "";

export default function ReachSignup() {
  // static config: no form yet -> no section, no hooks run (FORM_URL is a
  // compile-time constant, so this branch never flips within a mount)
  if (!FORM_URL) return null;
  return <ReachSignupInner />;
}

function ReachSignupInner() {
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
      {/* the puns live here (newsletter voice + microcopy), never plastered
          across the layout - the site stays credible enough to take a
          recommendation from */}
      <div className="signup-head">
        <p className="signup-title">
          we&apos;ve got great presents. and even better presence.
        </p>
        <p className="signup-sub">one vetted pick + one terrible pun, weekly.</p>
      </div>
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
