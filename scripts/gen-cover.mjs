// scripts/gen-cover.mjs - generate brand cover cards (1200x630 webp) matching the site style.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1200, H = 630, PAD = 80;
const VOID = "#080807", INK = "#ece6da", PHOS = "#9cba90", MUTE = "#8c877c";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// greedy word-wrap by estimated glyph width
function wrap(text, fontSize, maxW) {
  const w = fontSize * 0.52; // avg Fraunces glyph width factor
  const max = Math.floor(maxW / w);
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const t = line ? line + " " + word : word;
    if (t.length > max && line) { lines.push(line); line = word; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function svg({ kind, headline, tag }) {
  const fontSize = headline.length > 30 ? 76 : 88;
  const lh = fontSize * 1.12;
  const lines = wrap(headline, fontSize, W - PAD * 2 - 40);
  const startY = 250;
  const tspans = lines
    .map((l, i) => `<tspan x="${PAD}" y="${startY + i * lh}">${esc(l)}</tspan>`)
    .join("");
  const ruleY = startY + (lines.length - 1) * lh + 56;

  // faint grid
  let grid = "";
  for (let x = PAD; x < W; x += 90) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${PHOS}" stroke-opacity="0.05"/>`;
  for (let y = 80; y < H; y += 90) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${PHOS}" stroke-opacity="0.05"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${VOID}"/>
  ${grid}
  <text x="${PAD}" y="92" font-family="IBM Plex Mono" font-size="26" letter-spacing="4" fill="${PHOS}">q1rk // ${esc(kind)}</text>
  <text font-family="Fraunces" font-weight="600" font-size="${fontSize}" fill="${INK}">${tspans}</text>
  <rect x="${PAD}" y="${ruleY}" width="132" height="6" rx="3" fill="${PHOS}"/>
  <text x="${PAD}" y="568" font-family="IBM Plex Mono" font-size="28" fill="${MUTE}">${esc(tag)}</text>
</svg>`;
}

const covers = [
  { slug: "ai-income-methods-ranked",            kind: "notes", tag: "make money online", headline: "ai income methods ranked: real earnings, real odds" },
  { slug: "grow-audience-without-social-media",   kind: "notes", tag: "marketing",         headline: "how to grow an audience without social media" },
  { slug: "digital-marketing-for-solopreneurs",  kind: "notes", tag: "marketing",         headline: "digital marketing for solopreneurs" },
  { slug: "content-marketing-2026",              kind: "notes", tag: "marketing",         headline: "content marketing in 2026" },
  { slug: "how-to-build-a-website-that-makes-money", kind: "notes", tag: "website",       headline: "build a website that makes money" },
  { slug: "best-website-builder-for-bloggers",   kind: "notes", tag: "website",           headline: "the best website builder for bloggers" },
  { slug: "self-hosted-blog-vs-medium",          kind: "notes", tag: "independence",      headline: "self-hosted blog vs medium" },
  { slug: "is-blogging-worth-it-2026",           kind: "notes", tag: "blogging",          headline: "is blogging still worth it in 2026?" },
  { slug: "legit-ways-to-make-money-online",     kind: "notes", tag: "make money online", headline: "legit ways to make money online" },
  { slug: "automate-content-creation",           kind: "notes", tag: "automation",        headline: "how to automate content creation" },
  { slug: "ai-agents-for-solopreneurs",          kind: "notes", tag: "agents",            headline: "ai agents for solopreneurs" },
  { slug: "what-a-faceless-youtube-channel-costs", kind: "notes", tag: "youtube",         headline: "what a faceless youtube channel costs" },
  { slug: "digital-independence-2026",           kind: "notes", tag: "independence",      headline: "digital independence in 2026" },
];

for (const c of covers) {
  const dir = `public/images/${c.slug}`;
  mkdirSync(dir, { recursive: true });
  await sharp(Buffer.from(svg(c))).webp({ quality: 82 }).toFile(`${dir}/cover.webp`);
  console.log("wrote", `${dir}/cover.webp`);
}
