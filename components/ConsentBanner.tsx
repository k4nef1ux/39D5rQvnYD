"use client";

// components/ConsentBanner.tsx - opt-in consent UI. Shows once on first visit
// (no choice stored yet) and can be re-opened any time via the footer "consent"
// link / cookie policy (openConsent) so a visitor can give OR withdraw consent.
// Fixed-position overlay => no layout shift (CLS safe); renders nothing until
// it actually needs to show.
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getConsent,
  setConsent,
  CONSENT_OPEN,
  type Consent,
} from "@/lib/consent";

export default function ConsentBanner() {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState<Consent | null>(null);

  useEffect(() => {
    const choice = getConsent();
    setCurrent(choice);
    if (choice === null) setShow(true); // first visit -> ask
    const onOpen = () => {
      setCurrent(getConsent());
      setShow(true);
    };
    window.addEventListener(CONSENT_OPEN, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN, onOpen);
  }, []);

  if (!show) return null;

  const choose = (value: Consent) => {
    setConsent(value);
    setCurrent(value);
    setShow(false);
  };

  return (
    <div className="consent" role="dialog" aria-modal="false" aria-label="cookie consent">
      <div className="consent-box">
        <p className="consent-copy">
          this site uses a privacy-friendly analytics cookie to count visits -
          nothing more. it only loads if you allow it. see the{" "}
          <Link href="/cookie-policy" onClick={() => setShow(false)}>cookie policy</Link>{" "}
          and{" "}
          <Link href="/privacy-policy" onClick={() => setShow(false)}>privacy policy</Link>.
          {current && (
            <span className="consent-status">
              {" "}current choice: {current === "granted" ? "allowed" : "declined"}.
            </span>
          )}
        </p>
        <div className="consent-actions">
          <button type="button" className="consent-btn ghost" onClick={() => choose("denied")}>
            {current === "granted" ? "withdraw" : "decline"}
          </button>
          <button type="button" className="consent-btn solid" onClick={() => choose("granted")}>
            allow
          </button>
        </div>
      </div>
    </div>
  );
}
