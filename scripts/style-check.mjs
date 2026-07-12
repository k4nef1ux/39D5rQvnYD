// scripts/style-check.mjs - the countable half of EDITING.md.
// Usage:
//   node scripts/style-check.mjs content/foo.md [content/bar.md ...]
//   node scripts/style-check.mjs --all        (survey mode: report, exit 0)
// Per-file mode exits non-zero on violations - it's the gate for NEW or
// REWRITTEN posts. --all never fails the build: the back catalog predates
// the standard and gets held to it only when a post is touched.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const survey = args.includes("--all");
const files = survey
  ? readdirSync("content").filter((f) => f.endsWith(".md")).map((f) => path.join("content", f))
  : args;

if (files.length === 0) {
  console.error("usage: node scripts/style-check.mjs <content/file.md ...> | --all");
  process.exit(2);
}

// words that may repeat within a sentence without reading as a mistake
const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "so", "to", "of", "in", "on", "at",
  "for", "with", "from", "into", "onto", "over", "under", "than", "then",
  "that", "this", "these", "those", "it", "its", "is", "are", "was", "were",
  "be", "been", "being", "as", "by", "if", "not", "no", "nor", "do", "does",
  "did", "done", "can", "cant", "will", "wont", "would", "you", "your",
  "yours", "youre", "i", "im", "me", "my", "we", "our", "they", "them",
  "their", "he", "she", "his", "her", "one", "who", "what", "when", "where",
  "why", "how", "there", "here", "up", "out", "off", "all", "any", "some",
  "most", "more", "less", "few", "each", "every", "per", "via", "have",
  "has", "had", "get", "gets", "got", "go", "goes", "just", "still", "yet",
  "own", "same", "very", "too", "also", "now", "never", "always", "only",
]);

// strip everything that isn't prose: frontmatter, code fences, raw html
// blocks (.vz visuals), images, link urls (keep link text), headings kept.
function proseOf(md) {
  let t = md.replace(/^---[\s\S]*?---\s*/, "");
  t = t.replace(/```[\s\S]*?```/g, " ");
  t = t.replace(/^<[\s\S]*?>\s*$/gm, " "); // contiguous raw-html lines
  t = t.replace(/<[^>]+>/g, " ");
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  t = t.replace(/[*_`>#]+/g, " ");
  return t;
}

const paragraphsOf = (t) => t.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
// sentence split: ., !, ? followed by space+letter. good enough for prose.
const sentencesOf = (p) => p.split(/(?<=[.!?])\s+(?=[a-z0-9"'(])/i).map((s) => s.trim()).filter(Boolean);
const wordsOf = (s) => (s.toLowerCase().match(/[a-z][a-z']*/g) ?? []);

let failed = false;

for (const file of files) {
  const errs = [];
  const warns = [];
  const raw = readFileSync(file, "utf8");
  const prose = proseOf(raw);
  const paragraphs = paragraphsOf(prose);
  const sentences = paragraphs.flatMap(sentencesOf);

  // deliberate repetition is a decision someone signs, not an accident:
  // <!-- style-ok: word --> anywhere in the file whitelists that word.
  const vetted = new Set(
    [...raw.matchAll(/<!--\s*style-ok:\s*([a-z' ]+?)\s*-->/gi)].flatMap((m) =>
      m[1].toLowerCase().split(/[,\s]+/).filter(Boolean)
    )
  );

  // 1. content word repeated within one sentence. lists, quotes, and
  // built anaphora get a pass: sentences carrying a colon, a quotation,
  // or 2+ commas are structured on purpose - the accidental echo lives
  // in plain sentences ("momentum tonight matters more than perfection
  // tonight" has no structure to hide behind).
  for (const s of sentences) {
    if (/[:"]/.test(s) || (s.match(/,/g)?.length ?? 0) >= 2) continue;
    const seen = new Set();
    for (const w of wordsOf(s)) {
      if (w.length < 4 || STOP.has(w) || vetted.has(w)) continue;
      if (seen.has(w)) {
        errs.push(`word "${w}" twice in one sentence: "${s.slice(0, 90)}${s.length > 90 ? "..." : ""}" (intentional? add <!-- style-ok: ${w} -->)`);
        break;
      }
      seen.add(w);
    }
  }

  // 2. the "not x. y." reversal template, max 2 per post
  const reversals = sentences.filter((s) => /^not\s/i.test(s) || /,\s*not\s+(a|an|the|your?|just)\b/i.test(s)).length;
  if (reversals > 2) errs.push(`"not x / y" reversal used ${reversals}x (max 2) - the punch became a template`);

  // 3. hyphen-clause density: under 1 per 2 sentences
  const hyphenClauses = sentences.reduce((n, s) => n + (s.match(/\s-\s/g)?.length ?? 0), 0);
  if (sentences.length >= 8 && hyphenClauses > sentences.length / 2) {
    errs.push(`hyphen-clause in ${hyphenClauses}/${sentences.length} sentences - em-dash syntax with a different glyph. write plain sentences`);
  }

  // 4. consecutive sentences opening on the same word (paragraph scope)
  for (const p of paragraphs) {
    const ss = sentencesOf(p);
    for (let i = 1; i < ss.length; i++) {
      const a = wordsOf(ss[i - 1])[0];
      const b = wordsOf(ss[i])[0];
      if (a && a === b && !STOP.has(a)) {
        warns.push(`consecutive sentences both open with "${a}": "${ss[i].slice(0, 70)}..."`);
      }
    }
  }

  // 5. paragraph-ending punch fragments (<6 words), max 3 per post
  const punches = paragraphs.filter((p) => {
    const ss = sentencesOf(p);
    const last = ss[ss.length - 1] ?? "";
    return ss.length > 1 && wordsOf(last).length > 0 && wordsOf(last).length < 6;
  }).length;
  if (punches > 3) warns.push(`${punches} paragraphs end on a short punch (max 3) - ration the mic drops`);

  const name = path.basename(file);
  for (const e of errs) console.log(`  ERROR ${name}: ${e}`);
  for (const w of warns) console.log(`  warn  ${name}: ${w}`);
  if (errs.length === 0 && warns.length === 0 && !survey) console.log(`  ok    ${name}`);
  if (errs.length > 0 && !survey) failed = true;
}

if (failed) {
  console.log("\nstyle-check: violations found. the standard is EDITING.md - rewrite, don't rationalize.");
  process.exit(1);
}
console.log(`\nstyle-check: ${survey ? "survey done (report only)" : "clean"}.`);
