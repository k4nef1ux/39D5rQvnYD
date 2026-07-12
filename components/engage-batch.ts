// components/engage-batch.ts - client helper. All Engage/Views components that
// mount on a page within a 60ms window collapse into ONE /api/engage request, so
// a feed of many cards costs a single network call (and it fires after paint, so
// zero impact on FCP/LCP/CLS).
"use client";

export type Stat = { views: number; votes: number };

let queue = new Map<string, ((s: Stat) => void)[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

export function readStats(slug: string): Promise<Stat> {
  return new Promise((resolve) => {
    const arr = queue.get(slug) || [];
    arr.push(resolve);
    queue.set(slug, arr);
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 60);
  });
}

async function flush() {
  const pending = queue;
  queue = new Map();
  timer = null;
  const slugs = [...pending.keys()];
  let data: Record<string, Stat> = {};
  try {
    const r = await fetch(
      `/api/engage?slugs=${slugs.map(encodeURIComponent).join(",")}`
    );
    if (r.ok) data = await r.json();
  } catch {
    /* offline / not wired yet -> zeros */
  }
  for (const s of slugs) {
    const stat = data[s] || { views: 0, votes: 0 };
    (pending.get(s) || []).forEach((cb) => cb(stat));
  }
}

export async function post(
  slug: string,
  action: "view" | "vote" | "unvote"
): Promise<{ views?: number; votes?: number } | null> {
  try {
    const r = await fetch("/api/engage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, action }),
    });
    if (r.ok) return await r.json();
  } catch {
    /* ignore */
  }
  return null;
}
