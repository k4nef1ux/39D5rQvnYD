// scripts/indexnow.mjs
// Notify IndexNow (Bing, Yandex, et al.) that URLs changed, so they crawl now
// instead of waiting for a scheduled pass. Run AFTER a deploy so the URLs are live.
//
//   node scripts/indexnow.mjs                       # submit every url in the live sitemap
//   node scripts/indexnow.mjs /foo /bar             # submit just these paths (or full urls)
//
// Ownership is proved by /public/<KEY>.txt being reachable at HOST/<KEY>.txt.
//
// findshq has no key yet. The key is read from INDEXNOW_KEY (or auto-detected
// from a public/<hexkey>.txt file); with neither, this script safely no-ops and
// exits 0 instead of submitting to the wrong site.

import fs from "node:fs";
import path from "node:path";

function findKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim();
  try {
    const pub = path.join(process.cwd(), "public");
    const f = fs.readdirSync(pub).find((n) => /^[a-f0-9]{8,}\.txt$/i.test(n));
    if (f) return path.basename(f, ".txt");
  } catch {}
  return "";
}

const KEY = findKey();
const HOST = "findshq.com";
const ORIGIN = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

if (!KEY) {
  console.log("[indexnow] no key configured, skipping");
  process.exit(0);
}

async function urlsFromSitemap() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { "user-agent": "findshq-indexnow" } });
  if (!res.ok) throw new Error(`sitemap fetch ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function toUrl(arg) {
  if (/^https?:\/\//.test(arg)) return arg;
  return `${ORIGIN}/${arg.replace(/^\//, "")}`;
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map(toUrl) : await urlsFromSitemap();

if (!urlList.length) {
  console.error("no urls to submit");
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `${ORIGIN}/${KEY}.txt`,
  urlList,
};

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// IndexNow returns 200 (accepted) or 202 (accepted, key validation pending).
console.log(`submitted ${urlList.length} url(s) -> ${res.status} ${res.statusText}`);
urlList.forEach((u) => console.log("  " + u));
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
