// scripts/illustrate.mjs - generate on-brand inline illustrations for posts via
// the nano-banana-pro skill (Gemini 3 Pro Image), convert to web-sized webp, and
// insert the image refs into the markdown. Idempotent: skips images that already
// exist and refs already present. Resilient: one failure never halts the batch.
//
// usage: node scripts/illustrate.mjs scripts/illustrate-manifest-new.json [--force]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const manifestPath = process.argv[2];
const force = process.argv.includes("--force");
if (!manifestPath) { console.error("need a manifest path"); process.exit(1); }

const { style, posts } = JSON.parse(readFileSync(manifestPath, "utf8"));
const GEN = ".claude/skills/nano-banana-pro/generate_image.py";
const results = { ok: [], skip: [], fail: [] };

const buildPrompt = (scene) =>
  "Render this JSON image specification as a single high-fidelity image. " +
  "Output only the image, no text or captions anywhere in it. " +
  JSON.stringify({
    style,
    scene,
    composition: { aspect_ratio: "16:9", negative_space: "keep large empty dark areas clear" },
  });

function generate(slug, img) {
  const outDir = `public/images/${slug}`;
  const outWebp = `${outDir}/${img.id}.webp`;
  if (existsSync(outWebp) && !force) { results.skip.push(outWebp); return; }
  mkdirSync(outDir, { recursive: true });
  const tmp = `/tmp/gen-${slug}-${img.id}.png`;
  try {
    execFileSync("python3", [GEN, buildPrompt(img.scene), "-o", tmp, "--aspect-ratio", "16:9", "--size", "2K"],
      { stdio: ["ignore", "ignore", "pipe"], timeout: 180000 });
  } catch (e) {
    const msg = (e.stderr ? e.stderr.toString() : e.message).trim().split("\n").pop();
    results.fail.push(`${outWebp} :: ${msg}`);
    console.error(`FAIL  ${outWebp}  (${msg})`);
    return;
  }
  return sharp(tmp).resize(1280, null, { withoutEnlargement: true }).webp({ quality: 70 }).toFile(outWebp)
    .then((info) => { results.ok.push(`${outWebp} ${(info.size / 1024 | 0)}KB`); console.error(`ok    ${outWebp}  ${(info.size / 1024 | 0)}KB`); })
    .catch((err) => { results.fail.push(`${outWebp} :: webp ${err.message}`); console.error(`FAIL  ${outWebp} webp`); });
}

// insert image refs into the markdown body. Placement:
//  - img[0] after the "short version:" paragraph
//  - img[1] after the first body paragraph that follows the 2nd "## " heading
//  - img[2] after the first body paragraph that follows the 4th "## " heading
// (headings excluding "## faq"); idempotent and clamped to available anchors.
function insertRefs(slug, images) {
  const path = `content/${slug}.md`;
  let lines = readFileSync(path, "utf8").split("\n");
  const ref = (img) => `![${img.alt}](/images/${slug}/${img.id}.webp)`;
  const have = (img) => lines.some((l) => l.includes(`/images/${slug}/${img.id}.webp`));
  const headings = [];
  lines.forEach((l, i) => { if (l.startsWith("## ") && !/faq/i.test(l)) headings.push(i); });
  const allHeadings = [];
  lines.forEach((l, i) => { if (l.startsWith("## ")) allHeadings.push(i); });
  const svIdx = lines.findIndex((l) => l.toLowerCase().startsWith("short version"));

  // end of a heading's section = the next heading after it (or EOF). Inserting
  // there drops the image at the foot of that section, after any list/paras.
  const sectionEnd = (headingIdx) => {
    if (headingIdx == null || headingIdx < 0) return -1;
    const next = allHeadings.find((h) => h > headingIdx);
    return next == null ? lines.length : next;
  };
  // blank line after the short-version paragraph (early visual)
  const afterShortVersion = () => { if (svIdx < 0) return -1; let i = svIdx; while (i < lines.length && lines[i].trim()) i++; return i; };

  const targets = [
    { img: images[0], at: afterShortVersion() },
    { img: images[1], at: sectionEnd(headings[1] ?? headings[0]) },
    { img: images[2], at: sectionEnd(headings[3] ?? headings[headings.length - 1]) },
  ].filter((t) => t.img && t.at > 0 && !have(t.img));

  // insert from bottom up so earlier indices stay valid; keep anchors distinct
  targets.sort((a, b) => b.at - a.at);
  let lastAt = Infinity;
  for (const t of targets) {
    let at = t.at >= lastAt ? lastAt - 1 : t.at;
    lines.splice(at, 0, "", ref(t.img), "");
    lastAt = at;
  }
  writeFileSync(path, lines.join("\n"));
}

const run = async () => {
  for (const post of posts) {
    for (const img of post.images) await generate(post.slug, img);
    insertRefs(post.slug, post.images);
  }
  console.error("\n==== SUMMARY ====");
  console.error(`ok:   ${results.ok.length}`);
  console.error(`skip: ${results.skip.length}`);
  console.error(`fail: ${results.fail.length}`);
  if (results.fail.length) console.error("FAILURES:\n" + results.fail.join("\n"));
};
run();
