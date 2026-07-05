// scripts/replace-image-placement.mjs - normalize inline image placement across
// note/gear posts. Strips existing inline images, then re-inserts them (same
// ids, original order) at: after intro, mid-article, before the faq. Collapses
// blank-line runs so images never stack. Idempotent.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "content";
const isImg = (l) => /^!\[.*\]\(\/images\//.test(l.trim());
const fmType = (t) => (t.match(/^type:\s*["']?([^"'\n]+)/m) || [])[1];

let changed = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const path = `${DIR}/${file}`;
  const txt = readFileSync(path, "utf8");
  const type = fmType(txt);
  if (type !== "note" && type !== "gear") continue;

  const lines = txt.split("\n");
  const imgs = lines.filter(isImg);
  if (imgs.length === 0) continue;
  let body = lines.filter((l) => !isImg(l));

  // frontmatter end (2nd ---)
  let fmEnd = 0, seen = 0;
  for (let i = 0; i < body.length; i++) { if (body[i] === "---") { if (++seen === 2) { fmEnd = i; break; } } }

  const endOfParaFrom = (start) => { let i = start; while (i < body.length && !body[i].trim()) i++; while (i < body.length && body[i].trim()) i++; return i; };
  const sv = body.findIndex((l) => l.toLowerCase().startsWith("short version"));
  const anchor1 = sv >= 0 ? endOfParaFrom(sv) : endOfParaFrom(fmEnd + 1);

  const faqIdx = body.findIndex((l) => /^##\s+.*faq/i.test(l));
  const anchor3 = faqIdx >= 0 ? faqIdx : body.length;

  const headings = [];
  body.forEach((l, i) => { if (l.startsWith("## ") && !/faq/i.test(l) && i > anchor1 + 1 && i < anchor3 - 1) headings.push(i); });
  let anchor2 = headings.length ? headings[Math.floor(headings.length / 2)] : Math.floor((anchor1 + anchor3) / 2);
  if (anchor2 <= anchor1 + 1) anchor2 = Math.min(anchor1 + 3, anchor3 - 1);

  const targets = [];
  if (imgs[0] != null) targets.push([anchor1, imgs[0]]);
  if (imgs[1] != null) targets.push([anchor2, imgs[1]]);
  if (imgs[2] != null) targets.push([anchor3, imgs[2]]);
  // extra images (rare) -> spread before faq
  for (let k = 3; k < imgs.length; k++) targets.push([anchor3, imgs[k]]);

  targets.sort((a, b) => b[0] - a[0]);
  for (const [at, img] of targets) body.splice(at, 0, "", img, "");

  // collapse runs of 2+ blank lines to a single blank
  const out = [];
  for (const l of body) { if (l.trim() === "" && out.length && out[out.length - 1].trim() === "") continue; out.push(l); }
  const result = out.join("\n");
  if (result !== txt) { writeFileSync(path, result); changed++; console.log("placed", file); }
}
console.log(`\nre-placed images in ${changed} posts`);
