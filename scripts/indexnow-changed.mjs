// scripts/indexnow-changed.mjs
// Runs automatically as `postbuild` on every Hostinger deploy. Figures out which
// content files changed in the latest commit and pings IndexNow (Bing, Yandex,
// et al.) for just those URLs - so a publish gets crawled without anyone pinging
// by hand. Deploys that touch no content ping nothing.
//
// Deliberately never throws: a flaky network or missing git history must NOT
// fail the production build. Worst case it logs and exits 0.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// IndexNow key: findshq has no key yet. It's read from the INDEXNOW_KEY env var,
// falling back to the basename of a public/<hexkey>.txt ownership file if one
// exists. With neither, the script safely no-ops (see main) so `postbuild` on a
// keyless deploy never fails. To enable: generate a key, drop public/<key>.txt,
// and set INDEXNOW_KEY (or just add the file - it's auto-detected).
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

function changedContentFiles() {
  // Added (A) + Modified (M) + Renamed-target (R) .md files in the last commit.
  // Skip deletions - a removed post should 404, not get re-submitted.
  try {
    const out = execSync("git diff --name-status --diff-filter=AMR HEAD~1 HEAD -- content", {
      encoding: "utf8",
    });
    return out
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("\t").pop()) // last column = current path
      .filter((f) => f.endsWith(".md"));
  } catch {
    return []; // shallow clone / first commit / no git - just skip
  }
}

// slug = explicit frontmatter slug, else the filename. Matches lib/content.ts.
function slugFor(file) {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const m = raw.match(/^\s*slug:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (m) return m[1].trim();
  } catch {}
  return path.basename(file).replace(/\.mdx?$/, "");
}

async function main() {
  if (!KEY) {
    console.log("[indexnow] no key configured, skipping");
    return;
  }
  const files = changedContentFiles();
  if (!files.length) {
    console.log("[indexnow] no content changed - nothing to submit");
    return;
  }
  const urlList = [...new Set(files.map((f) => `${ORIGIN}/${slugFor(f)}`))];

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${ORIGIN}/${KEY}.txt`,
      urlList,
    }),
  });
  console.log(`[indexnow] submitted ${urlList.length} url(s) -> ${res.status} ${res.statusText}`);
  urlList.forEach((u) => console.log("  " + u));
}

main().catch((e) => console.log("[indexnow] skipped:", e.message));
