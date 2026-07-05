"use client";

// components/ConsentLink.tsx - footer trigger to re-open the consent panel so a
// visitor can change or withdraw consent at any time (a compliance requirement:
// consent must be as easy to withdraw as to give).
import { openConsent } from "@/lib/consent";

export default function ConsentLink() {
  return (
    <button type="button" className="footer-consent" onClick={() => openConsent()}>
      consent
    </button>
  );
}
