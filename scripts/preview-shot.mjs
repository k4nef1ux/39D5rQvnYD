// dev-only: boot `next start`, screenshot given paths at desktop + mobile, kill.
//
// One-time setup (playwright is intentionally NOT a package.json dep, so the
// production deploy stays lean):
//   npm run build
//   npm install --no-save playwright
//   npx playwright install chromium      # or set PLAYWRIGHT_BROWSERS_PATH
//
// Usage:  node scripts/preview-shot.mjs [path ...]      (default: / )
// Output: /tmp/shot/<name>.desktop.png  and  <name>.mobile.png  (mobile=full page)
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const paths = process.argv.slice(2);
const PATHS = paths.length ? paths : ["/"];
const OUT = "/tmp/shot";
mkdirSync(OUT, { recursive: true });

const srv = spawn("node_modules/.bin/next", ["start", "-p", "3010"], {
  cwd: process.cwd(),
  stdio: "ignore",
  env: process.env,
});

async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch("http://127.0.0.1:3010/"); if (r.ok) return true; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const slug = (p) => (p === "/" ? "home" : p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, ""));

try {
  const up = await waitUp();
  if (!up) { console.error("server did not come up"); srv.kill("SIGKILL"); process.exit(1); }
  const browser = await chromium.launch();
  for (const p of PATHS) {
    for (const [label, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
      await page.goto("http://127.0.0.1:3010" + p, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const file = `${OUT}/${slug(p)}.${label}.png`;
      await page.screenshot({ path: file, fullPage: label === "mobile" });
      console.log("wrote", file);
      await page.close();
    }
  }
  await browser.close();
} finally {
  srv.kill("SIGKILL");
}
process.exit(0);
