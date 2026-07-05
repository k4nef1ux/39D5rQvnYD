// scripts/split-paragraphs.mjs - break long prose paragraphs in note/gear posts
// into <=2-sentence chunks so they read as scannable blocks, not walls. Splits
// only on sentence boundaries; leaves headings, lists, images, blockquotes,
// faq questions, and the "short version" line untouched. Idempotent-ish.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "content";
const fm = (t) => (t.match(/^type:\s*["']?([^"'\n]+)/m) || [])[1];
// sentence boundary: . ! ? followed by space, then a new sentence start.
// the lookahead (lowercase/digit/quote/paren) avoids "make.com", "$20.5", etc.
const SENT = /(?<=[.!?])\s+(?=[a-z0-9"'(\[])/;

const isProse = (l) => {
  const t = l.trim();
  if (!t) return false;
  if (/^[#>|!\-*]/.test(t)) return false;            // heading, quote, table, image, list
  if (/^\d+\.\s/.test(t)) return false;              // ordered list
  if (/^\*\*.+\*\*$/.test(t)) return false;          // faq question (whole-line bold)
  if (/^short version/i.test(t)) return false;       // tl;dr line
  return true;
};

let changed = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const path = `${DIR}/${file}`;
  const txt = readFileSync(path, "utf8");
  if (fm(txt) !== "note" && fm(txt) !== "gear") continue;

  const out = txt.split("\n").map((line) => {
    if (!isProse(line) || line.length < 200) return line;
    const s = line.split(SENT);
    if (s.length <= 2) return line;
    const chunks = [];
    for (let i = 0; i < s.length; i += 2) chunks.push(s.slice(i, i + 2).join(" "));
    return chunks.join("\n\n");
  });
  const result = out.join("\n");
  if (result !== txt) { writeFileSync(path, result); changed++; }
}
console.log(`split long paragraphs in ${changed} posts`);
