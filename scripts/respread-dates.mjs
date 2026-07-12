// scripts/respread-dates.mjs - evenly spread note/gear publish dates across Apr 1 - Jun 21 2026.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "content";
const fm = (txt, key) => (txt.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)`, "m")) || [])[1];

// clusters, interleaved round-robin so similar posts don't bunch on consecutive days
const clusters = [
  ["ai-tools-2026", "ai-productivity-tools", "top-ai-tools-for-freelancers", "best-ai-tools-for-side-hustles"],
  ["what-are-autonomous-ai-agents", "ai-coding-agents-2026", "ai-agent-tools-for-solo-builders", "ai-agents-for-solopreneurs"],
  ["make-money-with-ai", "make-money-online-2026", "online-income-streams", "legit-ways-to-make-money-online", "best-ai-side-hustles-2026", "make-money-with-claude-ai", "claude-vs-chatgpt-for-making-money"],
  ["how-to-make-money-with-a-blog", "how-long-to-make-money-blogging", "is-blogging-worth-it-2026", "can-ai-content-rank-on-google-2026"],
  ["what-is-web-hosting", "best-web-hosting-2026", "best-web-hosting-for-beginners", "cheap-web-hosting", "free-web-hosting", "best-wordpress-hosting", "best-web-hosting-for-small-business"],
  ["how-to-build-a-website-that-makes-money", "best-website-builder-for-bloggers"],
  ["grow-audience-without-social-media", "digital-marketing-for-solopreneurs", "content-marketing-2026"],
  ["ai-automation-tools", "automate-content-creation"],
  ["ai-content-business", "ai-dropshipping-guide", "freelancing-with-ai", "youtube-automation-with-ai", "what-a-faceless-youtube-channel-costs", "how-to-go-viral-2026"],
  ["what-you-lose-publishing-on-platforms", "self-hosted-blog-vs-medium", "digital-independence-2026"],
  ["honest-hostinger-review", "honest-claude-code-review"],
  ["why-feed-full-of-cute-pets", "ai-agent-empty-repo-to-production"],
];
const PIN_LAST = "own-the-asset";

// all note/gear slugs actually present
const files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
const meta = {};
for (const f of files) {
  const slug = f.replace(/\.md$/, "");
  const txt = readFileSync(`${DIR}/${f}`, "utf8");
  meta[slug] = { type: fm(txt, "type"), txt };
}
const isPost = (s) => meta[s] && (meta[s].type === "note" || meta[s].type === "gear");

// round-robin interleave
const ordered = [];
let added = true;
for (let i = 0; added; i++) {
  added = false;
  for (const c of clusters) {
    if (c[i] && isPost(c[i]) && c[i] !== PIN_LAST) { ordered.push(c[i]); added = true; }
  }
}
// append any post not in clusters
for (const s of Object.keys(meta)) {
  if (isPost(s) && s !== PIN_LAST && !ordered.includes(s)) ordered.push(s);
}
if (isPost(PIN_LAST)) ordered.push(PIN_LAST);

// assign dates: Apr 1 (day 0) .. Jun 21 (day 81)
const start = new Date(Date.UTC(2026, 3, 1));
const SPAN = 81;
const N = ordered.length;
const iso = (d) => d.toISOString().slice(0, 10);
ordered.forEach((slug, i) => {
  const day = Math.round((i * SPAN) / (N - 1));
  const d = new Date(start.getTime() + day * 86400000);
  const date = iso(d);
  const p = `${DIR}/${slug}.md`;
  let txt = readFileSync(p, "utf8");
  txt = txt.replace(/^date:\s*["']?[^"'\n]+["']?/m, `date: "${date}"`);
  writeFileSync(p, txt);
  console.log(date, slug);
});
console.log(`\nspread ${N} posts across ${iso(start)} .. 2026-06-21`);
