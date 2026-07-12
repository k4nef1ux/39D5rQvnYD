// lib/engage.ts - server-side engagement counters via Upstash Redis (REST).
// No SDK: just HTTPS calls with the REST URL + token, so it runs anywhere
// (Hostinger Node, etc.) with two env vars set:
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// If they're absent the whole thing degrades gracefully to zeros / no-ops, so
// the site keeps working before the database is wired up.

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export type Stat = { views: number; votes: number };

function enabled() {
  return !!(URL && TOKEN);
}

// slugs are file-derived; keep keys safe regardless.
export function safeSlug(s: unknown): string | null {
  return typeof s === "string" && /^[a-z0-9-]{1,80}$/i.test(s) ? s : null;
}

async function redis(path: string): Promise<unknown> {
  const r = await fetch(`${URL}/${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).result;
}

export async function getStats(slugs: string[]): Promise<Record<string, Stat>> {
  const out: Record<string, Stat> = {};
  for (const s of slugs) out[s] = { views: 0, votes: 0 };
  if (!enabled() || slugs.length === 0) return out;

  // one MGET for all views + votes
  const keys = [
    ...slugs.map((s) => `views:${s}`),
    ...slugs.map((s) => `votes:${s}`),
  ];
  const res = (await redis(
    `mget/${keys.map(encodeURIComponent).join("/")}`
  )) as (string | null)[];
  slugs.forEach((s, i) => {
    out[s] = {
      views: Number(res?.[i] ?? 0) || 0,
      votes: Number(res?.[slugs.length + i] ?? 0) || 0,
    };
  });
  return out;
}

export async function incrView(slug: string): Promise<number> {
  if (!enabled()) return 0;
  return Number(await redis(`incr/${encodeURIComponent(`views:${slug}`)}`)) || 0;
}

export async function castVote(slug: string, dir: 1 | -1): Promise<number> {
  if (!enabled()) return 0;
  const op = dir > 0 ? "incr" : "decr";
  const n = Number(await redis(`${op}/${encodeURIComponent(`votes:${slug}`)}`)) || 0;
  return Math.max(0, n);
}
