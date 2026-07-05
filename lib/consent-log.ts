// lib/consent-log.ts - append-only audit trail of cookie-consent choices, so
// the records can be produced if ever asked (mirrors how the email list keeps
// consent records). Uses the same Upstash Redis REST setup as lib/engage.ts.
//
// Scalable by design: a single Redis STREAM (`consent:log`), appended via XADD
// with `MAXLEN ~ N` so Redis auto-trims old entries and the structure can never
// grow unbounded (O(1) appends, time-ordered, one key total - not one key per
// visitor). Stores NO direct identifiers (no IP, no email) - just the choice,
// timestamp, policy version, page, and coarse country - so the log itself stays
// low-risk. Degrades to a no-op if the env vars are missing.

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// keep the most recent ~50k consent events; older ones are auto-trimmed.
const MAXLEN = 50000;

export type ConsentEntry = {
  id: string; // random, non-identifying
  choice: "granted" | "denied";
  version: string; // policy version consented to
  path: string; // page the choice was made on
  country: string; // coarse geo, or "unknown"
};

export async function logConsent(entry: ConsentEntry): Promise<boolean> {
  if (!URL || !TOKEN) return false;
  const cmd = [
    "XADD",
    "consent:log",
    "MAXLEN",
    "~",
    String(MAXLEN),
    "*",
    "id", entry.id,
    "choice", entry.choice,
    "version", entry.version,
    "path", entry.path,
    "country", entry.country,
  ];
  try {
    const r = await fetch(URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmd),
      cache: "no-store",
    });
    return r.ok;
  } catch {
    return false;
  }
}
