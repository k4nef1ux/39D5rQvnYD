// lib/consent.ts - tiny client-side consent store. No server, no Upstash:
// the choice lives in localStorage on the visitor's own device (the privacy-
// respecting default + zero perf cost). Analytics only loads once consent is
// "granted"; withdrawing flips it back to "denied" and stops further tracking.

export type Consent = "granted" | "denied";

const KEY = "findshq-consent";
// bump if the policy materially changes - forces a re-ask on next visit.
export const CONSENT_VERSION = "1";
const STORED = `${KEY}:v${CONSENT_VERSION}`;

export const CONSENT_CHANGE = "findshq:consentchange"; // fired when the value changes
export const CONSENT_OPEN = "findshq:consentopen"; // asks the banner to re-open

export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORED);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    window.localStorage.setItem(STORED, value);
  } catch {
    /* storage blocked - treat as session-only, still dispatch below */
  }
  // record the choice server-side (audit trail) - fire-and-forget, same-origin,
  // never blocks the UI and silently no-ops if the API/DB isn't available.
  try {
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        choice: value,
        version: CONSENT_VERSION,
        path: window.location.pathname,
      }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE, { detail: value }));
}

// open the consent panel so a visitor can give or withdraw consent at any time
// (wired to the footer "consent" link + the cookie/privacy pages).
export function openConsent(): void {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN));
}
